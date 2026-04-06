import { useRouter } from 'next/router';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  icon: string;
  color: string;
  read: boolean;
  link?: string;
  createdAt: any;
}

interface NotificationPanelProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClose: () => void;
  loading: boolean;
}

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

  const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp._seconds ? timestamp._seconds * 1000 : timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export default function NotificationPanel({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onClose,
  loading,
}: NotificationPanelProps) {
  const router = useRouter();
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }
    if (notification.link) {
      router.push(notification.link);
      onClose();
    }
  };

  return (
    <div className="absolute right-0 top-full mt-2 w-[380px] max-h-[500px] bg-[#0a0e17]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden animate-notification-panel z-[200]">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-white tracking-wide">Notifications</h3>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 text-[10px] font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-full">
              {unreadCount} new
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMarkAllAsRead();
            }}
            className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            Mark all read
          </button>
        )}
      </div>

      {/* Notification List */}
      <div className="overflow-y-auto max-h-[380px] custom-scrollbar">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-6">
            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <p className="text-sm font-medium text-slate-400">No notifications yet</p>
            <p className="text-xs text-slate-600 mt-1">We&apos;ll notify you about important events</p>
          </div>
        ) : (
          notifications.slice(0, 10).map((notification, index) => (
            <button
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              className={`w-full text-left px-5 py-3.5 flex gap-3 transition-all duration-200 hover:bg-white/[0.04] border-b border-white/[0.03] group ${
                !notification.read ? 'bg-indigo-500/[0.03]' : ''
              }`}
              style={{ animationDelay: `${index * 30}ms` }}
            >
              {/* Icon */}
              <div className={`flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br ${COLOR_MAP[notification.color] || COLOR_MAP.slate} border flex items-center justify-center text-base mt-0.5`}>
                {notification.icon || '🔔'}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-xs font-bold truncate ${!notification.read ? 'text-white' : 'text-slate-300'}`}>
                    {notification.title}
                  </p>
                  {!notification.read && (
                    <div className="w-2 h-2 bg-indigo-500 rounded-full flex-shrink-0 mt-1 animate-pulse" />
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
                  {notification.message}
                </p>
                <p className="text-[10px] text-slate-600 mt-1 font-medium">
                  {formatTimeAgo(notification.createdAt)}
                </p>
              </div>
            </button>
          ))
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="border-t border-white/5 px-5 py-3">
          <button
            onClick={() => {
              router.push('/notifications');
              onClose();
            }}
            className="w-full text-center text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors py-1"
          >
            View All Notifications →
          </button>
        </div>
      )}
    </div>
  );
}
