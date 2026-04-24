import Link from 'next/link';
import styles from './Header.module.css';

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <Link href="/">⚡ Super Strikers App</Link>
      </div>
      <nav>
        <ul className={styles.navList}>
          <li>
            <Link href="/leaderboards">Leaderboards</Link>
          </li>
          <li>
            <Link href="/auction">Auction</Link>
          </li>
          <li>
            <Link href="/finalsCount">Finals</Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}