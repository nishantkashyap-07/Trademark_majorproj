import { useState, useEffect, useRef, useCallback } from 'react';
import { useWeb3 } from '@/contexts/Web3Context';
import { apiClient } from '@/lib/api-client';
import NotificationPanel from './NotificationPanel';

export default function NotificationBell() {
  const { account, isConnected } = useWeb3();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);

  // Fetch unread count (lightweight, polled every 30s)
  const fetchUnreadCount = useCallback(async () => {
    if (!account) return;
    try {
      const result: any = await apiClient.getUnreadCount(account);
      if (result.success !== false) {
        setUnreadCount(result.count || 0);
      }
    } catch (err) {
      // Silent fail for polling
    }
  }, [account]);

  // Fetch full notifications list (only when panel opens)
  const fetchNotifications = useCallback(async () => {
    if (!account) return;
    setLoading(true);
    try {
      const result: any = await apiClient.getNotifications(account);
      if (result.success && result.data) {
        setNotifications(result.data);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [account]);

  // Poll unread count every 30 seconds
  useEffect(() => {
    if (!isConnected || !account) {
      setUnreadCount(0);
      setNotifications([]);
      return;
    }

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [isConnected, account, fetchUnreadCount]);

  // Fetch notifications when panel opens
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, fetchNotifications]);

  // Close panel on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  const handleMarkAsRead = async (id: string) => {
    await apiClient.markNotificationAsRead(id);
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const handleMarkAllAsRead = async () => {
    if (!account) return;
    await apiClient.markAllNotificationsAsRead(account);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  if (!isConnected) return null;

  return (
    <div ref={bellRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-300 ${
          isOpen
            ? 'bg-indigo-500/20 border border-indigo-500/30 text-indigo-400'
            : 'bg-white/5 border border-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
        }`}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
        id="notification-bell-btn"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>

        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-black text-white bg-gradient-to-br from-red-500 to-pink-600 rounded-full border-2 border-[#0a0e17] animate-notification-badge">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <NotificationPanel
          notifications={notifications}
          onMarkAsRead={handleMarkAsRead}
          onMarkAllAsRead={handleMarkAllAsRead}
          onClose={() => setIsOpen(false)}
          loading={loading}
        />
      )}
    </div>
  );
}
