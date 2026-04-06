import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useWeb3 } from '@/contexts/Web3Context';
import { apiClient } from '@/lib/api-client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  icon: string;
  color: string;
  read: boolean;
  link?: string;
  relatedId?: string;
  relatedType?: string;
  createdAt: any;
}

const TYPE_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'trademark_verified', label: 'Verified' },
  { value: 'trademark_rejected', label: 'Rejected' },
  { value: 'purchase_complete', label: 'Purchases' },
  { value: 'listing_sold', label: 'Sales' },
  { value: 'license_purchased', label: 'Licenses' },
  { value: 'rating_received', label: 'Ratings' },
  { value: 'system', label: 'System' },
];

const COLOR_MAP: Record<string, string> = {
  indigo: 'from-indigo-500/20 to-indigo-500/5 border-indigo-500/30',
  emerald: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/30',
  red: 'from-red-500/20 to-red-500/5 border-red-500/30',
  cyan: 'from-cyan-500/20 to-cyan-500/5 border-cyan-500/30',
  amber: 'from-amber-500/20 to-amber-500/5 border-amber-500/30',
  blue: 'from-blue-500/20 to-blue-500/5 border-blue-500/30',
  yellow: 'from-yellow-500/20 to-yellow-500/5 border-yellow-500/30',
  orange: 'from-orange-500/20 to-orange-500/5 border-orange-500/30',
  slate: 'from-slate-500/20 to-slate-500/5 border-slate-500/30',
};

function formatTimeAgo(timestamp: any): string {
  if (!timestamp) return '';
  const date = timestamp?.toDate
    ? timestamp.toDate()
    : new Date(timestamp._seconds ? timestamp._seconds * 1000 : timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function NotificationsPage() {
  const router = useRouter();
  const { account, isConnected } = useWeb3();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [readFilter, setReadFilter] = useState<'all' | 'unread' | 'read'>('all');

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

  useEffect(() => {
    if (isConnected && account) {
      fetchNotifications();
    }
  }, [isConnected, account, fetchNotifications]);

  const handleMarkAsRead = async (id: string) => {
    await apiClient.markNotificationAsRead(id);
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllAsRead = async () => {
    if (!account) return;
    await apiClient.markAllNotificationsAsRead(account);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      handleMarkAsRead(notification.id);
    }
    if (notification.link) {
      router.push(notification.link);
    }
  };

  // Apply filters
  const filteredNotifications = notifications.filter(n => {
    if (filter !== 'all' && n.type !== filter) return false;
    if (readFilter === 'unread' && n.read) return false;
    if (readFilter === 'read' && !n.read) return false;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  if (!isConnected) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-32 pb-20">
          <div className="container-custom">
            <div className="glass-card text-center py-20">
              <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Connect Your Wallet</h2>
              <p className="text-slate-400">Please connect your wallet to view notifications.</p>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-32 pb-20">
        <div className="container-custom max-w-4xl">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-black text-white tracking-tight">
                Notifications
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                {unreadCount > 0
                  ? `You have ${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`
                  : 'You\'re all caught up!'}
              </p>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="btn-glass !px-5 !py-2.5 !text-xs !rounded-xl"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Mark All as Read
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="glass-card !p-4 mb-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              {/* Type Filter */}
              <div className="flex-1 flex flex-wrap gap-2">
                {TYPE_FILTERS.map(tf => (
                  <button
                    key={tf.value}
                    onClick={() => setFilter(tf.value)}
                    className={`px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-all duration-200 ${
                      filter === tf.value
                        ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                        : 'text-slate-500 hover:text-slate-300 hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    {tf.label}
                  </button>
                ))}
              </div>

              {/* Read/Unread Filter */}
              <div className="flex items-center gap-1 bg-white/[0.03] rounded-xl p-1 border border-white/5">
                {(['all', 'unread', 'read'] as const).map(rf => (
                  <button
                    key={rf}
                    onClick={() => setReadFilter(rf)}
                    className={`px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-all ${
                      readFilter === rf
                        ? 'bg-white/10 text-white'
                        : 'text-slate-500 hover:text-white'
                    }`}
                  >
                    {rf}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Notification List */}
          {loading ? (
            <div className="glass-card flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                <p className="text-sm text-slate-400">Loading notifications...</p>
              </div>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="glass-card text-center py-20">
              <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <p className="text-lg font-bold text-white mb-1">No notifications</p>
              <p className="text-sm text-slate-400">
                {filter !== 'all' || readFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'You\'ll be notified about important events here'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredNotifications.map((notification, index) => (
                <button
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`w-full text-left glass-card !p-5 !rounded-2xl flex gap-4 group transition-all duration-300 hover:!border-white/15 ${
                    !notification.read ? '!bg-indigo-500/[0.04] !border-indigo-500/10' : ''
                  }`}
                  style={{
                    animationDelay: `${index * 50}ms`,
                    animation: 'slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                    opacity: 0,
                  }}
                >
                  {/* Icon */}
                  <div className={`flex-shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br ${COLOR_MAP[notification.color] || COLOR_MAP.slate} border flex items-center justify-center text-lg`}>
                    {notification.icon || '🔔'}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className={`text-sm font-bold ${!notification.read ? 'text-white' : 'text-slate-300'}`}>
                          {notification.title}
                        </p>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                          {notification.message}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-[10px] font-medium text-slate-600 whitespace-nowrap">
                          {formatTimeAgo(notification.createdAt)}
                        </span>
                        {!notification.read && (
                          <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-pulse" />
                        )}
                      </div>
                    </div>

                    {/* Action hint */}
                    {notification.link && (
                      <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">
                          View Details
                        </span>
                        <svg className="w-3 h-3 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
