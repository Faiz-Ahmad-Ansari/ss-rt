import Card from "../components/Card";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        {/* <h1 className={styles.title}>SS-RT Records</h1> */}
        {/* <p className={styles.subtitle}>Cricket Performance Tracking & Analytics</p> */}
      </div>
      
      <div className={styles.cards}>
        <Card
          title="Leaderboards"
          body="Track your top scorers and ranking statistics"
          href="/leaderboards/overall"
          icon="📊"
          // icon="🏆"
        />
        <Card
          title="Auction"
          body="Live public auction viewer"
          href="/auction"
          icon="👥"
        />
        <Card
          title="Auction Admin"
          body="Manage sold/unsold, undo, reset, and points"
          href="/auction/admin"
          icon="🛠️"
        />
        <Card
          title="Finals Data"
          body="Track players' finals appearances, wins, and runner-up records"
          href="/finalsCount"
          icon="🏆"
        />
        {/* <Card
          title="Matches"
          body="Review match history and performance highlights"
          href="/matches"
          icon="🏏"
        />
        <Card
          title="Teams"
          body="Explore team compositions and dynamics"
          href="/teams"
          icon="👥"
        /> */}
      </div>
      
      <div className={styles.footer}>
        {/* <p className={styles.footerText}>Real-time cricket analytics platform</p> */}
      </div>
    </div>
  );
}