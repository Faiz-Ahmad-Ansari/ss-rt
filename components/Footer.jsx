import styles from './Footer.module.css';


export default function Footer(){
return (
<footer className={styles.footer}>
    <div className={styles.footerDiv}><span>Designed & Developed by</span> Faiz Ahmad Ansari</div>
{/* <p>© {new Date().getFullYear()} ssrt. All rights reserved.</p>
<div className={styles.links}>
<a href="#">Twitter</a>
<a href="#">GitHub</a>
<a href="#">Contact</a>
</div> */}
</footer>
)
}