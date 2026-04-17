import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/router';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  walletAddress?: string;
  organization?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  sendOtp: (email: string) => Promise<any>;
  registerInit: (data: { fullName: string; email: string; organization: string; role: string }) => Promise<any>;
  verifyAuth: (email: string, otp: string) => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const sessionData = localStorage.getItem('user_session');
      const token = localStorage.getItem('auth_token');

      if (sessionData && token) {
        setUser(JSON.parse(sessionData));
      }
    } catch (error) {
      console.error('Session restoration failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendOtp = async (email: string) => {
    const res = await fetch('/api/auth/otp/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to send verification code');
    return data;
  };

  const registerInit = async (regData: { fullName: string; email: string; organization: string; role: string }) => {
    const res = await fetch('/api/auth/register-init', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(regData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Organization initialization failed');
    return data;
  };

  const verifyAuth = async (email: string, otp: string) => {
    const res = await fetch('/api/auth/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Verification failed');

    // Secure the session
    const userData = data.user;
    setUser(userData);
    localStorage.setItem('user_session', JSON.stringify(userData));
    localStorage.setItem('auth_token', data.token);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('user-logged-in', { detail: userData }));
    }
  };

  const updateProfile = async (updateData: any) => {
    const token = localStorage.getItem('auth_token');
    if (!token) return;

    try {
      const res = await fetch('/api/auth/profile/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setUser(data.user);
        localStorage.setItem('user_session', JSON.stringify(data.user));
      }
    } catch (error) {
      console.error('Profile update failed:', error);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user_session');
    localStorage.removeItem('auth_token');

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('user-logged-out'));
    }
    router.push('/login');
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    sendOtp,
    registerInit,
    verifyAuth,
    updateProfile,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
