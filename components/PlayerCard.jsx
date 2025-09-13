import styles from "./PlayerCard.module.css";

export default function PlayerCard({ player, rank, tab }) {
  return (
    <div className={styles.card}>
      <div className={styles.rank}>#{rank}</div>
      <img src={player.profile_photo} alt={player.name} className={styles.avatar} />
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
              <span >
                {player.total_dismissal}
              </span>
            </p>
            <p>
              <strong>Matches : </strong> <span style={{ paddingLeft: "5px", fontSize: "14px" }}>{player.total_match}</span>
            </p>
          </>
        )}

        {tab === "mvp" && (
          <>
            <p>
              <strong>Avg Points : </strong> <span>{Number(player.total).toFixed(1)}</span>
            </p>
            {/* <p>
              <strong>Total : </strong>{" "}
              <span style={{ paddingLeft: "5px", fontSize: "14px" }}>
                {player.total}
              </span>
            </p> */}
          </>
        )}
      </div>
    </div>
  );
}
