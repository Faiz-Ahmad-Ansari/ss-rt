"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "../auction.module.css";
import { auctionPlayers } from "../../../data/auctionPlayers";
import {
    doc,
    onSnapshot,
    runTransaction,
    serverTimestamp,
    setDoc,
} from "firebase/firestore";
import { db, hasFirebaseConfig } from "../../../utils/firebaseClient";

const ADMIN_PASSWORD = "faiz12345";
const MAX_HISTORY = 25;

function secureRandomInt(max) {
    if (typeof window === "undefined" || !window.crypto?.getRandomValues) {
        return Math.floor(Math.random() * max);
    }
    const array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    return array[0] % max;
}

function secureShuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i -= 1) {
        const j = secureRandomInt(i + 1);
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function pickRandom(pool) {
    if (!pool || pool.length === 0) return null;
    const index = secureRandomInt(pool.length);
    return { player: pool[index], index };
}

function pickNextState(state) {
    if (!state.playersToCome?.length) {
        return { ...state, current: null };
    }
    const pick = pickRandom(state.playersToCome);
    if (!pick) return { ...state, current: null };
    const newPool = [...state.playersToCome];
    newPool.splice(pick.index, 1);
    return {
        ...state,
        playersToCome: newPool,
        current: pick.player,
    };
}

function normalizeState(data) {
    return {
        playersToCome: Array.isArray(data?.playersToCome) ? data.playersToCome : [],
        sold: Array.isArray(data?.sold) ? data.sold : [],
        unsold: Array.isArray(data?.unsold) ? data.unsold : [],
        current: data?.current ?? null,
        isAuctionStarted: Boolean(data?.isAuctionStarted),
        isUnsoldPhase: Boolean(data?.isUnsoldPhase),
        history: Array.isArray(data?.history) ? data.history : [],
        lastAction: data?.lastAction ?? "",
    };
}

function getInitialState() {
    return {
        playersToCome: secureShuffle(auctionPlayers),
        sold: [],
        unsold: [],
        current: null,
        isAuctionStarted: false,
        isUnsoldPhase: false,
        history: [],
        lastAction: "initialized",
    };
}

export default function AuctionAdminPage() {
    const [playersToCome, setPlayersToCome] = useState([]);
    const [sold, setSold] = useState([]);
    const [unsold, setUnsold] = useState([]);
    const [current, setCurrent] = useState(null);
    const [isAuctionStarted, setIsAuctionStarted] = useState(false);
    const [isUnsoldPhase, setIsUnsoldPhase] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isWriting, setIsWriting] = useState(false);
    const [error, setError] = useState("");
    const [passwordInput, setPasswordInput] = useState("");
    const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
    const [bidPoints, setBidPoints] = useState("");
    const [editingSoldId, setEditingSoldId] = useState("");
    const [editPointsValue, setEditPointsValue] = useState("");

    const auctionDocRef = useMemo(() => {
        if (!db) return null;
        return doc(db, "auctions", "default");
    }, []);

    useEffect(() => {
        if (!hasFirebaseConfig || !auctionDocRef) {
            setError("Firebase is not configured. Add NEXT_PUBLIC_FIREBASE_* env values.");
            setIsLoading(false);
            return;
        }

        const unsubscribe = onSnapshot(
            auctionDocRef,
            async (snapshot) => {
                try {
                    if (!snapshot.exists()) {
                        await setDoc(auctionDocRef, {
                            ...getInitialState(),
                            updatedAt: serverTimestamp(),
                        });
                        return;
                    }
                    const data = normalizeState(snapshot.data());
                    setPlayersToCome(data.playersToCome);
                    setSold(data.sold);
                    setUnsold(data.unsold);
                    setCurrent(data.current);
                    setIsAuctionStarted(data.isAuctionStarted);
                    setIsUnsoldPhase(data.isUnsoldPhase);
                    setError("");
                    setIsLoading(false);
                } catch (snapshotError) {
                    setError(snapshotError?.message || "Failed to sync auction data.");
                    setIsLoading(false);
                }
            },
            (listenerError) => {
                setError(listenerError?.message || "Realtime listener failed.");
                setIsLoading(false);
            },
        );
        return () => unsubscribe();
    }, [auctionDocRef]);

    const writeAuctionState = async (updater, actionLabel) => {
        if (!auctionDocRef) return;
        setIsWriting(true);
        try {
            await runTransaction(db, async (transaction) => {
                const snapshot = await transaction.get(auctionDocRef);
                if (!snapshot.exists()) return;

                const currentState = normalizeState(snapshot.data());
                const previousSnapshot = {
                    playersToCome: currentState.playersToCome,
                    sold: currentState.sold,
                    unsold: currentState.unsold,
                    current: currentState.current,
                    isAuctionStarted: currentState.isAuctionStarted,
                    isUnsoldPhase: currentState.isUnsoldPhase,
                };
                const nextState = updater(currentState);
                if (!nextState) return;

                const merged = {
                    ...nextState,
                    history: [previousSnapshot, ...currentState.history].slice(0, MAX_HISTORY),
                    lastAction: actionLabel,
                    updatedAt: serverTimestamp(),
                };
                transaction.update(auctionDocRef, merged);
            });
            setError("");
        } catch (writeError) {
            setError(writeError?.message || "Failed to update auction.");
        } finally {
            setIsWriting(false);
        }
    };

    const unlockAdmin = () => {
        if (passwordInput === ADMIN_PASSWORD) {
            setIsAdminUnlocked(true);
            setError("");
            return;
        }
        setError("Invalid admin password.");
    };

    const startAuction = async () => {
        await writeAuctionState((state) => {
            if (state.playersToCome.length === 0 && state.unsold.length === 0) return null;
            return pickNextState({
                ...state,
                isAuctionStarted: true,
                isUnsoldPhase: false,
                current: null,
            });
        }, "start_auction");
    };

    const markSold = async () => {
        const numericPoints = Number(bidPoints);
        if (!current) return;
        if (!Number.isFinite(numericPoints) || numericPoints <= 0) {
            setError("Enter valid sold points before marking as sold.");
            return;
        }
        await writeAuctionState((state) => {
            if (!state.current) return null;
            const soldPlayer = { ...state.current, soldPoints: numericPoints };
            return pickNextState({
                ...state,
                sold: [...state.sold, soldPlayer],
                current: null,
            });
        }, "mark_sold");
        setBidPoints("");
    };

    const markUnsold = async () => {
        await writeAuctionState((state) => {
            if (!state.current) return null;
            return pickNextState({
                ...state,
                unsold: [...state.unsold, state.current],
                current: null,
            });
        }, "mark_unsold");
        setBidPoints("");
    };

    const startUnsoldPlayers = async () => {
        await writeAuctionState((state) => {
            if (state.unsold.length === 0) return null;
            const reloaded = secureShuffle(state.unsold);
            return pickNextState({
                ...state,
                playersToCome: reloaded,
                unsold: [],
                isUnsoldPhase: true,
                current: null,
            });
        }, "start_unsold_round");
    };

    const undoLastAction = async () => {
        await writeAuctionState((state) => {
            if (state.history.length === 0) return null;
            const [previous, ...restHistory] = state.history;
            return {
                ...normalizeState(previous),
                history: restHistory,
            };
        }, "undo");
    };

    const resetAuction = async () => {
        await writeAuctionState(() => getInitialState(), "reset_auction");
        setBidPoints("");
        setEditingSoldId("");
        setEditPointsValue("");
    };

    const editSoldPoints = async () => {
        const numericPoints = Number(editPointsValue);
        if (!editingSoldId) {
            setError("Choose a sold player first.");
            return;
        }
        if (!Number.isFinite(numericPoints) || numericPoints <= 0) {
            setError("Enter valid points to update.");
            return;
        }
        await writeAuctionState((state) => {
            const updatedSold = state.sold.map((player) => (
                player.id === editingSoldId
                    ? { ...player, soldPoints: numericPoints }
                    : player
            ));
            return { ...state, sold: updatedSold };
        }, "edit_sold_points");
        setEditPointsValue("");
    };

    if (isLoading) {
        return (
            <div className={styles.container}>
                <h1 className={styles.title}>Auction Admin</h1>
                <p className={styles.notice}>Connecting to realtime backend...</p>
            </div>
        );
    }

    if (!isAdminUnlocked) {
        return (
            <div className={styles.container}>
                <h1 className={styles.title}>Auction Admin</h1>
                <p className={styles.notice}>Enter admin password to continue.</p>
                {error ? <p className={styles.notice}>{error}</p> : null}
                <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 14 }}>
                    <input
                        type="password"
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        placeholder="Admin password"
                        style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid #ccc" }}
                    />
                    <button className={styles.startBtn} onClick={unlockAdmin}>
                        Unlock
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>
                Auction Admin — {isUnsoldPhase ? "Unsold Round" : "Main Round"}
            </h1>
            {error ? <p className={styles.notice}>{error}</p> : null}

            <div className={styles.actions} style={{ marginBottom: 14, flexWrap: "wrap" }}>
                <button className={styles.startBtn} onClick={startAuction} disabled={isWriting}>
                    Start Auction
                </button>
                <button className={styles.startBtn} onClick={startUnsoldPlayers} disabled={isWriting || unsold.length === 0}>
                    Start Unsold Round
                </button>
                <button className={styles.unsoldBtn} onClick={undoLastAction} disabled={isWriting}>
                    Undo
                </button>
                <button className={styles.unsoldBtn} onClick={resetAuction} disabled={isWriting}>
                    Reset Auction
                </button>
            </div>

            {isAuctionStarted && current && (
                <div className={styles.players} style={{ marginBottom: 18 }}>
                    <div className={styles.playerCardWrapper}>
                        <div className={styles.playerCard}>
                            <div className={styles.playerHeader}>
                                {current.img ? (
                                    <img src={current.img} alt={current.name} className={styles.avatarImage} />
                                ) : (
                                    <div className={styles.avatarPlaceholder} aria-hidden />
                                )}
                                <div>
                                    <h2 className={styles.playerName}>{current.name}</h2>
                                    <p className={styles.playerRole}>{current.role}</p>
                                </div>
                            </div>
                            <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                                <input
                                    type="number"
                                    value={bidPoints}
                                    min="1"
                                    onChange={(e) => setBidPoints(e.target.value)}
                                    placeholder="Sold points"
                                    style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid #ccc", width: 160 }}
                                />
                                <button className={styles.soldBtn} onClick={markSold} disabled={isWriting}>
                                    Sold
                                </button>
                                <button className={styles.unsoldBtn} onClick={markUnsold} disabled={isWriting}>
                                    Unsold
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div style={{ marginTop: 22 }}>
                <div style={{ marginBottom: 18 }}>
                    <h4 className={styles.subhead}>Sold ({sold.length})</h4>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
                        <select
                            value={editingSoldId}
                            onChange={(e) => setEditingSoldId(e.target.value)}
                            style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid #ccc" }}
                        >
                            <option value="">Select sold player</option>
                            {sold.map((player) => (
                                <option key={player.id} value={player.id}>
                                    {player.name}
                                </option>
                            ))}
                        </select>
                        <input
                            type="number"
                            min="1"
                            value={editPointsValue}
                            onChange={(e) => setEditPointsValue(e.target.value)}
                            placeholder="New points"
                            style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid #ccc", width: 130 }}
                        />
                        <button className={styles.startBtn} onClick={editSoldPoints} disabled={isWriting}>
                            Edit Points
                        </button>
                    </div>
                    <div className={styles.soldWrap}>
                        {sold.length === 0 ? (
                            <div className={styles.peekEmpty}>No sold players yet</div>
                        ) : (
                            sold.map((p) => (
                                <div key={p.id} className={styles.soldCard}>
                                    {p.name} ({typeof p.soldPoints === "number" ? p.soldPoints : 0})
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div style={{ marginBottom: 18 }}>
                    <h4 className={styles.subhead}>Unsold ({unsold.length})</h4>
                    <div className={styles.peekWrap}>
                        {unsold.length === 0 ? (
                            <div className={styles.peekEmpty}>No unsold players yet</div>
                        ) : (
                            unsold.map((p) => (
                                <div key={p.id} className={styles.peekCard}>
                                    <div style={{ fontWeight: 700 }}>{p.name}</div>
                                    <div style={{ opacity: 0.85, fontSize: 13 }}>{p.role}</div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div style={{ marginBottom: 18 }}>
                    <h4 className={styles.subhead}>Players To Come ({playersToCome.length})</h4>
                    <div className={styles.soldWrap}>
                        {playersToCome.length === 0 ? (
                            <div className={styles.peekEmpty}>Empty</div>
                        ) : (
                            playersToCome.map((p) => (
                                <div key={p.id} className={styles.soldCard}>
                                    {p.name}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
