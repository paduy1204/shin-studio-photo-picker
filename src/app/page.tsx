import Link from 'next/link';
import Image from 'next/image';
import styles from './page.module.css';

export default function Home() {
  return (
    <main className={styles.container}>
      <div className={styles.logoContainer}>
        {/* Placeholder cho logo, người dùng cần bỏ file logo.png vào thư mục public */}
        <Image src="/logo.png" alt="Shin Studio Logo" width={200} height={200} className={styles.logoImage} />
        <h1 className={styles.logoText}>SHIN STUDIO</h1>
        <h2 className={styles.slogan}>Ảnh viện Gia đình và bé</h2>
      </div>

      <p className={styles.subtitle}>
        Lưu giữ những khoảnh khắc yêu thương
      </p>
      
      <div className={styles.buttonGroup}>
        <Link href="/admin">
          <button className={styles.btnPrimary}>Quản trị Album</button>
        </Link>
        <Link href="/concepts">
          <button className={styles.btnSecondary}>Album Concept Mẫu</button>
        </Link>
      </div>

      <footer className={styles.footer}>
        <div className={styles.contactItem}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
          <span>033 885 8385</span>
        </div>
        <div className={styles.contactItem}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
          <a href="https://www.facebook.com/shinstudio.q7/" target="_blank" rel="noopener noreferrer">Facebook Shin Studio</a>
        </div>
        <div className={styles.contactItem}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
          <span>52B Lâm Văn Bền, P. Tân Kiểng, Quận 7, TP. HCM</span>
        </div>
      </footer>
    </main>
  );
}
