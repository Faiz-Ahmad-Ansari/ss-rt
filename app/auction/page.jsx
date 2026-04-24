"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./auction.module.css";
import {
    doc,
    onSnapshot,
} from "firebase/firestore";
import { db, hasFirebaseConfig } from "../../utils/firebaseClient";

export default function AuctionPage() {
    const [playersToCome, setPlayersToCome] = useState([]);
    const [sold, setSold] = useState([]);
    const [unsold, setUnsold] = useState([]);
    const [current, setCurrent] = useState(null);
    const [isAuctionStarted, setIsAuctionStarted] = useState(false);
    const [isUnsoldPhase, setIsUnsoldPhase] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isWriting, setIsWriting] = useState(false);
    const [error, setError] = useState("");

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
            (snapshot) => {
                try {
                    if (!snapshot.exists()) return;

                    const data = snapshot.data();
                    setPlayersToCome(Array.isArray(data.playersToCome) ? data.playersToCome : []);
                    setSold(Array.isArray(data.sold) ? data.sold : []);
                    setUnsold(Array.isArray(data.unsold) ? data.unsold : []);
                    setCurrent(data.current ?? null);
                    setIsAuctionStarted(Boolean(data.isAuctionStarted));
                    setIsUnsoldPhase(Boolean(data.isUnsoldPhase));
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

    if (isLoading) {
        return (
            <div className={styles.container}>
                <h1 className={styles.title}>Auction</h1>
                <p className={styles.notice}>Connecting to realtime backend...</p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>
                Auction Live — {isUnsoldPhase ? "Unsold Round" : "Main Round"}
            </h1>
            {error ? <p className={styles.notice}>{error}</p> : null}
            <p className={styles.notice}>
                Public viewer mode. Admin controls are available at <strong>/auction/admin</strong>.
            </p>

            {isAuctionStarted && current && (
                <div className={styles.players} style={{ marginBottom: 18 }}>
                    <div className={styles.playerCardWrapper}>
                        <div className={styles.playerCard}>
                            <div className={styles.playerHeader}>
                                {current.img ? (
                                    <img
                                        src={current.img}
                                        alt={current.name}
                                        className={styles.avatarImage}
                                    />
                                ) : (
                                    <div className={styles.avatarPlaceholder} aria-hidden />
                                )}

                                <div>
                                    <h2 className={styles.playerName}>{current.name}</h2>
                                    <p className={styles.playerRole}>{current.role}</p>
                                </div>
                            </div>

                            <div className={styles.infoRow} style={{ marginTop: 10 }}>
                                <div>Players to come: <strong>{playersToCome.length}</strong></div>
                                <div>Unsold: <strong>{unsold.length}</strong></div>
                                <div>Sold: <strong>{sold.length}</strong></div>
                            </div>
                            {typeof current.soldPoints === "number" ? (
                                <p style={{ marginTop: 8, fontWeight: 700 }}>
                                    Sold for: {current.soldPoints}
                                </p>
                            ) : null}
                        </div>
                    </div>
                </div>
            )}

            {isAuctionStarted && !current && playersToCome.length === 0 && (
                <div style={{ textAlign: "center", marginTop: 20 }}>
                    <p className={styles.notice}>All players in the current phase have been shown.</p>
                    <p className={styles.notice}>Waiting for admin action...</p>
                </div>
            )}

            <div style={{ marginTop: 22 }}>
                <div style={{ marginBottom: 18 }}>
                    <h4 className={styles.subhead}>Sold ({sold.length})</h4>
                    <div className={styles.soldWrap}>
                        {sold.length === 0 ? (
                            <div className={styles.peekEmpty}>No sold players yet</div>
                        ) : (
                            sold.map((p) => (
                                <div key={p.id} className={styles.soldCard}>
                                    {p.name}
                                    {typeof p.soldPoints === "number" ? ` (${p.soldPoints})` : ""}
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
