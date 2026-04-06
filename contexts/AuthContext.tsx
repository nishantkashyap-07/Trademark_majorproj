import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/router';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'creator' | 'buyer' | 'admin';
  createdAt: Date;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
  register: (email: string, password: string, name: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in (check session/token)
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // Check localStorage for session
      const sessionData = localStorage.getItem('user_session');
      if (sessionData) {
        const userData = JSON.parse(sessionData);
        setUser(userData);
      }
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      // TODO: Call your authentication API
      // For now, mock authentication
      const mockUser: User = {
        id: '1',
        email,
        name: email.split('@')[0],
        role: 'creator',
        createdAt: new Date(),
      };

      setUser(mockUser);
      localStorage.setItem('user_session', JSON.stringify(mockUser));
      
      // Dispatch login event
      if (typeof window !== 'undefined') {
        const event = new CustomEvent('user-logged-in', { detail: mockUser });
        window.dispatchEvent(event);
      }
    } catch (error: any) {
      throw new Error(error.message || 'Login failed');
    }
  };

  const loginWithGoogle = async () => {
    try {
      // TODO: Implement Google OAuth
      // For now, mock Google login
      const mockUser: User = {
        id: '2',
        email: 'user@gmail.com',
        name: 'Google User',
        role: 'creator',
        createdAt: new Date(),
      };

      setUser(mockUser);
      localStorage.setItem('user_session', JSON.stringify(mockUser));
      
      if (typeof window !== 'undefined') {
        const event = new CustomEvent('user-logged-in', { detail: mockUser });
        window.dispatchEvent(event);
      }
    } catch (error: any) {
      throw new Error(error.message || 'Google login failed');
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      // TODO: Call your registration API
      const mockUser: User = {
        id: Date.now().toString(),
        email,
        name,
        role: 'creator',
        createdAt: new Date(),
      };

      setUser(mockUser);
      localStorage.setItem('user_session', JSON.stringify(mockUser));
      
      if (typeof window !== 'undefined') {
        const event = new CustomEvent('user-logged-in', { detail: mockUser });
        window.dispatchEvent(event);
      }
    } catch (error: any) {
      throw new Error(error.message || 'Registration failed');
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user_session');
    
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('user-logged-out');
      window.dispatchEvent(event);
    }
    
    router.push('/login');
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    loginWithGoogle,
    logout,
    register,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
