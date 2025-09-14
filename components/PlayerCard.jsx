"use client";

import React, { useState } from "react";
import styles from "./PlayerCard.module.css";
import Modal from "./Modal"; // import the modal

export default function PlayerCard({ player, rank, tab }) {
  const [open, setOpen] = useState(false);

  // prepare stats object for modal
  const stats = {
    batting: {
      runs: player.total_runs,
      strikeRate: player.strike_rate || "-",
    },
    bowling: {
      wickets: player.total_wickets,
      economy: player.economy || "-",
    },
    fielding: {
      catches: player.total_dismissal,
      runOuts: player.run_outs || 0,
    },
    mvp: {
      avgPoints: Number(player.total).toFixed(1),
    },
  };

  return (
    <>
      {/* Card */}
      <div className={styles.card} onClick={() => setOpen(true)}>
        <div className={styles.rank}>#{rank}</div>
        <img
          src={player.profile_photo}
          alt={player.name}
          className={styles.avatar}
        />
        <div className={styles.info}>
          <h3>{player.name}</h3>

          {tab === "batting" && (
            <>
              <p>
                <strong>Runs : </strong> <span>{player.total_runs}</span>
              </p>
              <p>
                <strong>Innings : </strong>{" "}
                <span style={{ paddingLeft: "5px", fontSize: "14px" }}>
                  {player.innings}
                </span>
              </p>
            </>
          )}

          {tab === "bowling" && (
            <>
              <p>
                <strong>Wickets : </strong> <span>{player.total_wickets}</span>
              </p>
              <p>
                <strong>Overs : </strong>{" "}
                <span style={{ paddingLeft: "5px", fontSize: "14px" }}>
                  {player.overs}
                </span>
              </p>
            </>
          )}

          {tab === "fielding" && (
            <>
              <p>
                <strong>Dismissals : </strong>{" "}
                <span>{player.total_dismissal}</span>
              </p>
              <p>
                <strong>Matches : </strong>{" "}
                <span style={{ paddingLeft: "5px", fontSize: "14px" }}>
                  {player.total_match}
                </span>
              </p>
            </>
          )}

          {tab === "mvp" && (
            <>
              <p>
                <strong>Avg Points : </strong>{" "}
                <span>{Number(player.total).toFixed(1)}</span>
              </p>
            </>
          )}
        </div>
      </div>

      {/* Modal */}
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        playerName={player.name}
        profilePhoto={player.profile_photo}
        stats={stats}
        defaultTab={tab} // pass which tab to open
      />
    </>
  );
}
