"use client";

import React, { useState } from "react";
import styles from "./PlayerCard.module.css";
import Modal from "./Modal"; // import the modal
import { 
    computeOverallBatting, 
    computeOverallBowling, 
    computeOverallFielding, 
    computeOverallMvp 
  } from "../utils/computeOverall";

export default function PlayerCard({ player, rank, tab, datasets, selectedTournament }) {
  const [open, setOpen] = useState(false);

  // prepare stats object for modal
//   console.log(datasets,"Player datasets")

  function getPlayerStats(datasets, playerName, selectedTournament) {
    const result = {
      batting: { runs: 0, strikeRate: "-", fours: 0, sixes: 0, highestRun: 0, innings: 0 },
      bowling: { wickets: 0, economy: "-", dotBalls: 0, overs: 0, highestWkts: 0 },
      fielding: { catches: 0, runOuts: 0, totalDismissals: 0, stumping: 0 },
      mvp: { avgPoints: "-" },
    };
  
    if (selectedTournament === "overall") {
      // ---- Batting ----
      const battingOverall = computeOverallBatting(datasets.batting || []);
      const battingPlayer = battingOverall.find(p => p.name === playerName);
      if (battingPlayer) {
        result.batting = {
          runs: battingPlayer.total_runs,
          strikeRate: battingPlayer.strike_rate,
          fours: battingPlayer["4s"],
          sixes: battingPlayer["6s"],
          highestRun: battingPlayer.highest_run,
          innings: battingPlayer.innings
        };
      }
  
      // ---- Bowling ----
      const bowlingOverall = computeOverallBowling(datasets.bowling || []);
      const bowlingPlayer = bowlingOverall.find(p => p.name === playerName);
      if (bowlingPlayer) {
        result.bowling = {
          wickets: bowlingPlayer.total_wickets,
          economy: bowlingPlayer.economy,
          dotBalls: bowlingPlayer.dot_balls,
          overs: bowlingPlayer.overs,
          highestWkts: bowlingPlayer.highest_wicket,
        };
      }
  
      // ---- Fielding ----
      const fieldingOverall = computeOverallFielding(datasets.fielding || []);
      const fieldingPlayer = fieldingOverall.find(p => p.name === playerName);
      if (fieldingPlayer) {
        result.fielding = {
          catches: fieldingPlayer.total_catches,
          runOuts: fieldingPlayer.total_run_outs,
          totalDismissals: fieldingPlayer.total_dismissal,
          stumping: fieldingPlayer.total_stumpings,
        };
      }
  
      // ---- MVP ----
      const mvpOverall = computeOverallMvp(datasets.mvp || []);
      const mvpPlayer = mvpOverall.find(p => p.name === playerName);
      if (mvpPlayer) {
        result.mvp = {
          avgPoints: mvpPlayer.total.toFixed(1),
        };
      }
    } else {
      // ===== EXISTING LOGIC (single tournament) =====
      for (const [category, matches] of Object.entries(datasets)) {
        const players = matches.flat().filter(p => p.name === playerName);
  
        if (players.length > 0) {
          const player = players[0];
  
          switch (category) {
            case "batting":
              result.batting = {
                runs: player.total_runs,
                strikeRate: player.strike_rate || "-",
                fours: player["4s"] ?? player.fours,
                sixes: player["6s"] ?? player.sixes,
                highestRun: player.highest_run ?? player.highest_score,
                innings: player.innings ?? player.innings
              };
              break;
  
            case "bowling":
              result.bowling = {
                wickets: player.total_wickets,
                economy: player.economy || "-",
                dotBalls: player.dot_balls,
                overs: player.overs,
                highestWkts: player.highest_wicket,
              };
              break;
  
            case "fielding":
              result.fielding = {
                catches: player.total_catches,
                runOuts: player.run_outs || 0,
                totalDismissals: player.total_dismissal,
                stumping: player.stumpings,
              };
              break;
  
            case "mvp":
              result.mvp = {
                avgPoints: Number(player.total).toFixed(1),
              };
              break;
          }
        }
      }
    }
  
    return result;
  }
  

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
        stats={getPlayerStats(datasets, player.name, selectedTournament)}
        defaultTab={tab} // pass which tab to open
      />
    </>
  );
}
