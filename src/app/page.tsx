import Link from 'next/link';
import styles from './page.module.css';

export default function Home() {
  return (
    <main className={styles.container}>
      <h1 className={styles.logo}>SHIN STUDIO</h1>
      <p className={styles.subtitle}>
        Lưu giữ những khoảnh khắc đẹp nhất của bạn. Chọn những bức ảnh bạn yêu thích nhất 
        để chúng tôi hoàn thiện và mang đến cho bạn tác phẩm nghệ thuật hoàn hảo.
      </p>
      
      <div className={styles.buttonGroup}>
        <Link href="/admin">
          <button className={styles.btnPrimary}>Quản trị Album</button>
        </Link>
        <Link href="/demo">
          <button className={styles.btnSecondary}>Xem Album Mẫu</button>
        </Link>
      </div>
    </main>
  );
}
