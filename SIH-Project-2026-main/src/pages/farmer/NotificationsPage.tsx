import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle2, Clock, Ticket, Check, ShieldAlert } from 'lucide-react';
import { api } from '../../services/api';
import { useSocket } from '../../context/SocketContext';

export const NotificationsPage: React.FC = () => {
  const { lastFirestoreUpdate } = useSocket();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifs = () => {
    setLoading(true);
    api.getNotifications()
      .then((res) => setNotifications(res.notifications || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!lastFirestoreUpdate || lastFirestoreUpdate.collection === 'notifications') fetchNotifs();
  }, [lastFirestoreUpdate?.timestamp]);

  const handleMarkAllRead = async () => {
    await api.markAllNotificationsRead();
    fetchNotifs();
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
            Updates &amp; Alerts
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 mt-0.5">
            Notifications
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Real-time notifications on queue progression, gate calls, weighbridge slips, and DBT releases.
          </p>
        </div>

        <button
          onClick={handleMarkAllRead}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-stone-700 bg-white border border-stone-200 hover:bg-stone-50 transition cursor-pointer shadow-2xs"
        >
          <Check className="w-3.5 h-3.5 text-emerald-700" />
          <span>Mark All Read</span>
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-20 bg-white rounded-2xl border border-stone-200 animate-pulse" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-3xl border border-stone-200">
          <Bell className="w-10 h-10 text-stone-400 mx-auto mb-2" />
          <p className="text-sm font-semibold text-stone-700">No Notifications</p>
          <p className="text-xs text-stone-400 mt-0.5">You will receive alerts when your token is called or updated.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`p-4 sm:p-5 rounded-2xl border transition flex items-start gap-4 ${
                !n.read
                  ? 'bg-white border-emerald-300 shadow-xs'
                  : 'bg-stone-50/80 border-stone-200 opacity-80'
              }`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                n.type === 'QUEUE_CALLED'
                  ? 'bg-amber-100 text-amber-800'
                  : n.type === 'PAYMENT_CREDITED'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-blue-50 text-blue-800'
              }`}>
                {n.type === 'QUEUE_CALLED' ? (
                  <Bell className="w-4 h-4 animate-bounce" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-bold text-sm text-stone-900">{n.title}</h4>
                  <span className="font-mono text-[10px] text-stone-400 shrink-0">
                    {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs text-stone-600 mt-1 leading-relaxed">{n.message}</p>
              </div>

              {!n.read && (
                <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0 self-center" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
