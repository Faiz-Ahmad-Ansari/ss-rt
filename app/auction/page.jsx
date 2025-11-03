"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./auction.module.css";
import { auctionPlayers } from "../../data/auctionPlayers";

/* Secure random int */
function secureRandomInt(max) {
  if (typeof window === "undefined" || !window.crypto?.getRandomValues) {
    return Math.floor(Math.random() * max);
  }
  const array = new Uint32Array(1);
  window.crypto.getRandomValues(array);
  return array[0] % max;
}


/* Secure shuffle */
function secureShuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = secureRandomInt(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function AuctionPage() {
//   const initialPlayers = useMemo(() => secureShuffle(auctionPlayers), []);
//   const [playersToCome, setPlayersToCome] = useState(initialPlayers);
const [playersToCome, setPlayersToCome] = useState([]);
  const [sold, setSold] = useState([]);
  const [unsold, setUnsold] = useState([]);
  const [current, setCurrent] = useState(null);
  const [isAuctionStarted, setIsAuctionStarted] = useState(false);
  const [isUnsoldPhase, setIsUnsoldPhase] = useState(false);

  useEffect(() => {
  const shuffled = secureShuffle(auctionPlayers);
  setPlayersToCome(shuffled);
}, []);

  const pickRandom = (pool) => {
    if (!pool || pool.length === 0) return null;
    const index = secureRandomInt(pool.length);
    return { player: pool[index], index };
  };

  const startAuction = () => {
    if (playersToCome.length === 0 && unsold.length === 0) return;
    setIsAuctionStarted(true);
    setIsUnsoldPhase(false);
    pickNext();
  };

  const pickNext = () => {
    if (!playersToCome || playersToCome.length === 0) {
      setCurrent(null);
      return;
    }
    const pick = pickRandom(playersToCome);
    if (!pick) {
      setCurrent(null);
      return;
    }
    const newPool = [...playersToCome];
    newPool.splice(pick.index, 1);
    setPlayersToCome(newPool);
    setCurrent(pick.player);
  };

  const handleSold = () => {
    if (!current) return;
    setSold((s) => [...s, current]);
    setCurrent(null);
    // next
    if (playersToCome.length > 0) {
      pickNext();
    }
  };

  const handleUnsold = () => {
    if (!current) return;
    setUnsold((u) => [...u, current]);
    setCurrent(null);
    // next
    if (playersToCome.length > 0) {
      pickNext();
    }
  };

  const startUnsoldPlayers = () => {
    if (unsold.length === 0) return;
    const reloaded = secureShuffle(unsold);
    setPlayersToCome(reloaded);
    setUnsold([]);
    setIsUnsoldPhase(true);
    // pick first from reloaded
    const pick = pickRandom(reloaded);
    if (!pick) {
      setCurrent(null);
      return;
    }
    const newPool = [...reloaded];
    newPool.splice(pick.index, 1);
    setPlayersToCome(newPool);
    setCurrent(pick.player);
  };

  // auto pick if auction started but nothing is current and pool exists
  useEffect(() => {
    if (!isAuctionStarted) return;
    if (!current && playersToCome.length > 0) {
      pickNext();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuctionStarted, current, playersToCome]);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>
        Auction — {isUnsoldPhase ? "Unsold Round" : "Main Round"}
      </h1>

      {/* Start the auction */}
      {!isAuctionStarted && (
        <div style={{ display: "flex", justifyContent: "center", margin: "12px 0" }}>
          <button className={styles.startBtn} onClick={startAuction}>
            Start the Auction
          </button>
        </div>
      )}

      {/* Current player card */}
      {isAuctionStarted && current && (
        <div className={styles.players} style={{ marginBottom: 18 }}>
          <div className={styles.playerCardWrapper}>
            <div className={styles.playerCard}>
              <div className={styles.playerHeader}>
                <div className={styles.avatarPlaceholder} aria-hidden />
                <div>
                  <h2 className={styles.playerName}>{current.name}</h2>
                  <p className={styles.playerRole}>{current.role}</p>
                </div>
              </div>

              <div className={styles.actions} style={{ marginTop: 10 }}>
                <button className={styles.unsoldBtn} onClick={handleUnsold}>
                  Unsold
                </button>
                <button className={styles.soldBtn} onClick={handleSold}>
                  Sold
                </button>
              </div>

              <div className={styles.infoRow} style={{ marginTop: 10 }}>
                <div>Players to come: <strong>{playersToCome.length}</strong></div>
                <div>Unsold: <strong>{unsold.length}</strong></div>
                <div>Sold: <strong>{sold.length}</strong></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* When current phase exhausted */}
      {isAuctionStarted && !current && playersToCome.length === 0 && (
        <div style={{ textAlign: "center", marginTop: 20 }}>
          <p className={styles.notice}>All players in the current phase have been shown.</p>
          {unsold.length > 0 ? (
            <button className={styles.startBtn} onClick={startUnsoldPlayers}>
              Start Unsold Players
            </button>
          ) : (
            <p className={styles.notice}>✅ Auction Complete — no unsold players left.</p>
          )}
        </div>
      )}

      {/* Lists: Sold, Unsold, Players To Come */}
      <div style={{ marginTop: 22 }}>
        {/* Sold */}
        <div style={{ marginBottom: 18 }}>
          <h4 className={styles.subhead}>Sold ({sold.length})</h4>
          <div className={styles.soldWrap}>
            {sold.length === 0 ? (
              <div className={styles.peekEmpty}>No sold players yet</div>
            ) : (
              sold.map((p) => (
                <div key={p.id} className={styles.soldCard}>
                  {p.name}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Unsold */}
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

        {/* Players To Come */}
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
