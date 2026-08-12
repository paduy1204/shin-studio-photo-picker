'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { getStoredUsers, getCurrentUser, UserAccount } from '@/lib/auth';
import { supabase } from '@/lib/supabaseClient';
import styles from './page.module.css';

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    role: 'sales' as 'admin' | 'sales',
  });

  useEffect(() => {
    // 🛡️ AUTH GUARD: Phải đăng nhập mới được vào trang Quản lý tài khoản
    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.push('/login');
      return;
    }
    loadUsers();
  }, [router]);

  const loadUsers = async () => {
    const data = await getStoredUsers();
    setUsers(data);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.username || !formData.password) {
      alert('Vui lòng nhập đầy đủ thông tin!');
      return;
    }

    const newUser: UserAccount = {
      id: Date.now().toString(),
      name: formData.name,
      username: formData.username,
      password: formData.password,
      role: formData.role,
      created_at: new Date().toISOString(),
    };

    const updated = [...users, newUser];
    setUsers(updated);
    localStorage.setItem('shinstudio_accounts', JSON.stringify(updated));

    // Upsert to Supabase
    await supabase.from('users').upsert({
      id: newUser.id,
      name: newUser.name,
      username: newUser.username,
      password: newUser.password,
      role: newUser.role,
    });

    alert(`Đã tạo thành công tài khoản cho ${newUser.name}!`);
    setIsModalOpen(false);
    setFormData({ name: '', username: '', password: '', role: 'sales' });
  };

  const handleDeleteUser = async (id: string, name: string) => {
    if (confirm(`Bạn có chắc muốn xóa tài khoản của "${name}" không?`)) {
      const updated = users.filter(u => u.id !== id);
      setUsers(updated);
      localStorage.setItem('shinstudio_accounts', JSON.stringify(updated));
      await supabase.from('users').delete().eq('id', id);
    }
  };

  return (
    <div className={styles.container}>
      <nav className={styles.navbar}>
        <div className={styles.navLeft}>
          <Link href="/">
            <Image src="/logo.png" alt="Logo" width={40} height={40} />
          </Link>
          <span className={styles.navTitle}>QUẢN LÝ TÀI KHOẢN NỘI BỘ</span>
        </div>
        <Link href="/admin" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 600 }}>
          ← Về Album Khách
        </Link>
      </nav>

      <main className={styles.mainContent}>
        <div className={styles.headerRow}>
          <div>
            <h1 className={styles.title}>Danh Sách Tài Khoản Nội Bộ</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.3rem' }}>
              Cấp tài khoản Quản trị hoặc Sales cho nhân viên Studio để truy cập hệ thống.
            </p>
          </div>
          <button className={styles.btnPrimary} onClick={() => setIsModalOpen(true)}>
            + Thêm Tài Khoản Mới
          </button>
        </div>

        <table className={styles.usersTable}>
          <thead>
            <tr>
              <th>Họ & Tên Nhân Viên</th>
              <th>Tên Đăng Nhập</th>
              <th>Mật Khẩu</th>
              <th>Vai Trò</th>
              <th>Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td style={{ fontWeight: 700 }}>{u.name}</td>
                <td><code>{u.username}</code></td>
                <td><code>{u.password}</code></td>
                <td>
                  <span className={`${styles.roleBadge} ${u.role === 'admin' ? styles.roleAdmin : styles.roleSales}`}>
                    {u.role === 'admin' ? 'Quản Trị Viên' : 'Tư Vấn / Sales'}
                  </span>
                </td>
                <td>
                  {u.username !== 'admin' && (
                    <button className={styles.btnDelete} onClick={() => handleDeleteUser(u.id, u.name)}>
                      Xóa
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>

      {/* Modal Thêm User */}
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div className={styles.modalContainer} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1.2rem' }}>Thêm Tài Khoản Nhân Viên</h2>
            <form onSubmit={handleCreateUser}>
              <div className={styles.formGroup}>
                <label>Họ và Tên Nhân Viên</label>
                <input 
                  type="text" 
                  placeholder="Nhập tên nhân viên (ví dụ: Nguyễn Văn A)" 
                  value={formData.name} 
                  onChange={e => setFormData({ ...formData, name: e.target.value })} 
                  required 
                />
              </div>

              <div className={styles.formGroup}>
                <label>Tên Đăng Nhập (Username)</label>
                <input 
                  type="text" 
                  placeholder="Ví dụ: sales01" 
                  value={formData.username} 
                  onChange={e => setFormData({ ...formData, username: e.target.value })} 
                  required 
                />
              </div>

              <div className={styles.formGroup}>
                <label>Mật Khẩu</label>
                <input 
                  type="text" 
                  placeholder="Nhập mật khẩu" 
                  value={formData.password} 
                  onChange={e => setFormData({ ...formData, password: e.target.value })} 
                  required 
                />
              </div>

              <div className={styles.formGroup}>
                <label>Vai Trò (Phân Quyền)</label>
                <select 
                  value={formData.role} 
                  onChange={e => setFormData({ ...formData, role: e.target.value as any })}
                >
                  <option value="sales">Sales / Tư Vấn (Xem & Tạo Album)</option>
                  <option value="admin">Quản Trị Viên (Full Quyền System)</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '8px 16px', borderRadius: '8px', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'white' }}>Hủy</button>
                <button type="submit" className={styles.btnPrimary}>Tạo Tài Khoản</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
