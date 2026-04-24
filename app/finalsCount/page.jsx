"use client"
import { winners as finalsWinners, runner as finalsRunners } from '@/data/finals';
import { notQualified } from '@/data/finals'; // Add this to your exports
import styles from './finalsCount.module.css';

export default function FinalsCount() {
  const totalSeasons = Object.keys(finalsWinners).length;

  const playerMap = {};

  const ensurePlayer = (player) => {
    const id = player.player_id;
    if (!playerMap[id]) {
      playerMap[id] = {
        player_name: player.player_name,
        profile_photo: player.profile_photo,
        winner: 0,
        runner: 0,
        notQualified: 0,
        seasonsPlayed: new Set(),
      };
    }
  };

  const processPlayers = (seasonData, role) => {
    Object.keys(seasonData).forEach((tournament) => {
      const players = seasonData[tournament];
      if (!players) return;

      const seenInThisTournament = new Set();

      players.forEach((player) => {
        const id = player.player_id;
        ensurePlayer(player);

        if (!seenInThisTournament.has(id)) {
          seenInThisTournament.add(id);
          playerMap[id].seasonsPlayed.add(tournament);

          if (role === 'winner') {
            playerMap[id].winner += 1;
          } else if (role === 'runner') {
            playerMap[id].runner += 1;
          } else if (role === 'notQualified') {
            playerMap[id].notQualified += 1;
          }
        }
      });
    });
  };

  processPlayers(finalsWinners, 'winner');
  processPlayers(finalsRunners, 'runner');
  processPlayers(notQualified, 'notQualified');

  const sortedPlayers = Object.entries(playerMap).map(([id, stats]) => ({
    id,
    ...stats,
    totalSeasonsPlayed: stats.seasonsPlayed.size,
    finalsPlayed: stats.winner + stats.runner,
  })).sort((a, b) => {
    if (b.winner !== a.winner) return b.winner - a.winner;
    if (b.finalsPlayed !== a.finalsPlayed) return b.finalsPlayed - a.finalsPlayed;
    return a.player_name.localeCompare(b.player_name);
  });

  const tableJSON = sortedPlayers.reduce((acc, player, index) => {
    acc[player.id] = {
      sr: index + 1,
      player_name: player.player_name,
      profile_photo: player.profile_photo,
      totalSeasonsPlayed: player.totalSeasonsPlayed,
      finalsPlayed: player.finalsPlayed,
      winner: player.winner,
      runner: player.runner,
      notQualified: player.notQualified,
    };
    return acc;
  }, {});

  console.log(tableJSON);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Finals Data</h1>
      <p className={styles.subtitle}>Based on {totalSeasons} seasons</p>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.srCol}>Sr.</th>
              <th>Player Name</th>
              <th className={styles.numCol}>Total Seasons</th>
              <th className={styles.numCol}>Finals Played</th>
              <th className={styles.numCol}>Winner</th>
              <th className={styles.numCol}>Runner</th>
              <th className={styles.numCol}>Not Qualified</th>
            </tr>
          </thead>
          <tbody>
            {sortedPlayers.map((player, index) => (
              <tr key={player.id} className={index % 2 === 0 ? styles.rowEven : styles.rowOdd}>
                <td className={styles.srCol}>{index + 1}</td>
                <td className={styles.playerCell}>
                  <img
                    src={player.profile_photo}
                    alt={player.player_name}
                    className={styles.avatar}
                    onError={(e) => { e.target.src = 'https://media.cricheroes.in/default/user_profile.png'; }}
                  />
                  <span>{player.player_name}</span>
                </td>
                <td className={styles.numCol}>{player.totalSeasonsPlayed}</td>
                <td className={styles.numCol}>{player.finalsPlayed}</td>
                <td className={`${styles.numCol} ${player.winner > 0 ? styles.winner : ''}`}>
                  {player.winner > 0 ? `🏆 ${player.winner}` : player.winner}
                </td>
                <td className={`${styles.numCol} ${player.runner > 0 ? styles.runner : ''}`}>
                  {player.runner}
                </td>
                <td className={styles.numCol}>{player.notQualified}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}