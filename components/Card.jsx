// components/Card.js
import Link from "next/link";
import styles from "./Card.module.css";

export default function Card({ title, body, href, icon }) {
  return (
    <Link href={href} className={styles.linkWrapper}>
      <div className={styles.card}>
        <div className={styles.icon}>{icon}</div>
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.body}>{body}</p>
        <div className={styles.arrow}>→</div>
      </div>
    </Link>
  );
}