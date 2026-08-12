'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { loginUser } from '@/lib/auth';
import styles from './page.module.css';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await loginUser(username, password);
      if (user) {
        router.push('/admin');
      } else {
        setError('Tài khoản hoặc mật khẩu không chính xác!');
      }
    } catch (err) {
      setError('Đã xảy ra lỗi khi đăng nhập.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginCard}>
        <div className={styles.logoArea}>
          <Image src="/logo.png" alt="Logo" width={70} height={70} className={styles.logoImage} />
          <h1 className={styles.title}>SHIN STUDIO</h1>
          <p className={styles.subtitle}>Đăng nhập dành cho Nội bộ Studio</p>
        </div>

        {error && <div className={styles.errorMsg}>{error}</div>}

        <form onSubmit={handleLogin} className={styles.form}>
          <div className={styles.formGroup}>
            <label>Tài khoản</label>
            <input 
              type="text" 
              placeholder="Nhập tên tài khoản" 
              value={username}
              onChange={e => setUsername(e.target.value)}
              required 
            />
          </div>

          <div className={styles.formGroup}>
            <label>Mật khẩu</label>
            <input 
              type="password" 
              placeholder="Nhập mật khẩu" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              required 
            />
          </div>

          <button type="submit" className={styles.btnSubmit} disabled={loading}>
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        <div className={styles.defaultInfo}>
          Tài khoản mặc định: <strong>admin</strong> / Mật khẩu: <strong>shin123</strong>
        </div>
      </div>
    </div>
  );
}
