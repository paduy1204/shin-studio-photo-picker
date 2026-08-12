import { supabase } from './supabaseClient';

export interface UserAccount {
  id: string;
  username: string;
  password: string;
  name: string;
  role: 'admin' | 'sales';
  created_at?: string;
}

const DEFAULT_ADMIN: UserAccount = {
  id: 'admin-default',
  username: 'admin',
  password: 'shin123',
  name: 'Quản Trị Viên (Shin Studio)',
  role: 'admin',
};

export const getStoredUsers = async (): Promise<UserAccount[]> => {
  try {
    const { data, error } = await supabase.from('users').select('*');
    if (!error && data && data.length > 0) {
      return data;
    }
  } catch (err) {
    console.error('Supabase users query error:', err);
  }

  // Fallback storage
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('shinstudio_accounts');
    if (saved) {
      return JSON.parse(saved);
    }
  }
  return [DEFAULT_ADMIN];
};

export const getCurrentUser = (): UserAccount | null => {
  if (typeof window === 'undefined') return null;
  const session = localStorage.getItem('shinstudio_session');
  if (!session) return null;
  try {
    return JSON.parse(session);
  } catch {
    return null;
  }
};

export const loginUser = async (username: string, password: string): Promise<UserAccount | null> => {
  const users = await getStoredUsers();
  const found = users.find(u => u.username.toLowerCase() === username.trim().toLowerCase() && u.password === password);
  if (found) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('shinstudio_session', JSON.stringify(found));
    }
    return found;
  }
  return null;
};

export const logoutUser = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('shinstudio_session');
  }
};
