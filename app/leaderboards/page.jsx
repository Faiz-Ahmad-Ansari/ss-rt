import Link from "next/link";
import { leaderboardsIndex } from "../../data/leaderboards";
import styles from "./leaderboards.module.css";

export default function LeaderboardsPage() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Leaderboards</h1>
        <p className={styles.subtitle}>Explore cricket performance rankings across seasons</p>
      </div>
      <div className={styles.cards}>
        {leaderboardsIndex.map((lb) => (
          <Link key={lb.id} href={`/leaderboards/${lb.id}`} className={styles.link}>
            <div className={styles.card}>
              {/* <div className={styles.cardIcon}>🏆</div> */}
              <h2 className={styles.cardTitle}>{lb.title}</h2>
              <div className={styles.cardArrow}>→</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}