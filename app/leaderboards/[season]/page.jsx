"use client";

import { leaderboardsIndex } from "../../../data/leaderboards";
import {
  computeOverallBatting,
  computeOverallBowling,
  computeOverallFielding,
  computeOverallMvp,
} from "../../../utils/computeOverall";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PlayerCard from "../../../components/PlayerCard";
import styles from "./season.module.css";

export default function SeasonPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // ✅ initialize from URL first, fallback to first leaderboard
  const seasonFromUrl = searchParams.get("season");
  const [selectedTournament, setSelectedTournament] = useState(
    seasonFromUrl || leaderboardsIndex[0]?.id || ""
  );

  const [tab, setTab] = useState("batting");

  // ✅ keep state in sync when URL changes (e.g. back/forward nav)
  useEffect(() => {
    if (seasonFromUrl && seasonFromUrl !== selectedTournament) {
      setSelectedTournament(seasonFromUrl);
    }
  }, [seasonFromUrl]);

  // ✅ update URL when user changes dropdown
  const handleTournamentChange = (e) => {
    const newTournament = e.target.value;
    setSelectedTournament(newTournament);

    const params = new URLSearchParams(searchParams);
    params.set("season", newTournament);
    router.push(`?${params.toString()}`);
  };

  // find leaderboard
  const lb = leaderboardsIndex.find((s) => s.id === selectedTournament);
  if (!lb) return <p>Leaderboard not found.</p>;

  // compute data
  let data = [];
  if (selectedTournament === "overall") {
    if (tab === "batting") {
      data = computeOverallBatting(lb.datasets.batting);
    } else if (tab === "bowling") {
      data = computeOverallBowling(lb.datasets.bowling);
    } else if (tab === "fielding") {
      data = computeOverallFielding(lb.datasets.fielding);
    } else if (tab === "mvp") {
      data = computeOverallMvp(lb.datasets.mvp);
    }
  } else {
    data = Array.isArray(lb.datasets[tab])
      ? lb.datasets[tab].flat()
      : lb.datasets[tab];
  }

  return (
    <div className={styles.container}>
      {/* Tournament Filter */}
      <div className={styles.filter}>
        <label htmlFor="tournament">Select Tournament:</label>
        <select
          id="tournament"
          value={selectedTournament}
          onChange={handleTournamentChange}
        >
          {leaderboardsIndex.map((s) => (
            <option key={s.id} value={s.id}>
              {s.title}
            </option>
          ))}
        </select>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        {["batting", "bowling", "fielding", "mvp"].map((t) => (
          <button
            key={t}
            className={`${styles.tab} ${tab === t ? styles.active : ""}`}
            onClick={() => setTab(t)}
          >
            <span>{t.toUpperCase()}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className={styles.players}>
        {data.length > 0 ? (
          data.map((p, i) => (
            <PlayerCard
              key={p.id || `${tab}-${i}`}
              datasets={lb.datasets}
              selectedTournament={selectedTournament}
              player={p}
              rank={i + 1}
              tab={tab}
            />
          ))
        ) : (
          <p>No data available for {tab}.</p>
        )}
      </div>
    </div>
  );
}
