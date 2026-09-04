import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ListOrdered,
  Radio,
  RefreshCw,
  CheckCircle2,
  Clock,
  Scale,
  Users,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { api } from '../../services/api';

export const TodayQueuePage: React.FC = () => {
  const { operator } = useAuth();
  const { lastQueueUpdate, joinCentreQueueRoom } = useSocket();
  const centreId = operator?.centreId || 'centre-parseoni';

  const [queueData, setQueueData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchQueue = () => {
    setLoading(true);
    api.getCenterTodayQueue(centreId)
      .then((res) => {
        setQueueData(res);
        joinCentreQueueRoom(centreId);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchQueue();
  }, [centreId]);

  useEffect(() => {
    if (lastQueueUpdate) {
      setQueueData(lastQueueUpdate);
    }
  }, [lastQueueUpdate]);

  const handleUpdateStatus = async (bookingId: string, status: string) => {
    setActionLoading(bookingId);
    try {
      const res = await api.updateBookingStatus(bookingId, status);
      setQueueData(res);
    } catch (err: any) {
      alert(err.message || 'Status update failed');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
            Weighbridge Station #1 Console
          </span>
          <h1 className="text-2xl font-serif font-bold text-slate-900 mt-0.5">
            Today&apos;s Live Queue Stream
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time control desk. Any action here immediately broadcasts to farmer mobile dashboards over WebSockets.
          </p>
        </div>

        <button
          onClick={fetchQueue}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh List</span>
        </button>
      </div>

      {/* Queue items (Card format) */}
      <div className="space-y-3">
        {loading && !queueData ? (
          <div className="space-y-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-24 bg-white rounded-2xl border border-slate-200 animate-pulse" />
            ))}
          </div>
        ) : (!queueData?.queue || queueData.queue.length === 0) ? (
          <div className="bg-white p-12 text-center rounded-3xl border border-slate-200">
            <ListOrdered className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No Farmers Currently in Queue</p>
          </div>
        ) : (
          queueData.queue.map((item: any, idx: number) => {
            const isCalled = item.status === 'CALLED';
            const isProcessing = item.status === 'PROCESSING';
            const isCompleted = item.status === 'COMPLETED';

            return (
              <div
                key={item.id || idx}
                className={`p-4 sm:p-5 rounded-2xl border transition flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isCalled
                    ? 'border-amber-400 bg-amber-50/70 shadow-xs'
                    : isProcessing
                    ? 'border-blue-400 bg-blue-50/70'
                    : isCompleted
                    ? 'border-slate-200 bg-slate-50/70 opacity-60'
                    : 'border-slate-200 bg-white'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center font-mono font-bold text-sm text-slate-800 shrink-0">
                    #{idx + 1}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-lg font-bold text-slate-900">
                        {item.tokenNumber}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide ${
                        isCalled
                          ? 'bg-amber-400 text-slate-950 animate-pulse'
                          : isProcessing
                          ? 'bg-blue-600 text-white'
                          : isCompleted
                          ? 'bg-emerald-700 text-white'
                          : 'bg-slate-200 text-slate-700'
                      }`}>
                        {item.status}
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-slate-800 mt-1">
                      {item.farmerName}
                    </h4>

                    <p className="text-xs text-slate-500 mt-0.5">
                      Produce: <strong>{item.quantity} quintals</strong> of <strong>{item.cropName}</strong> • Slot: {item.slotTime}
                    </p>
                  </div>
                </div>

                {/* Operator Actions */}
                <div className="flex flex-wrap items-center gap-2 self-end md:self-auto">
                  {item.status === 'BOOKED' && (
                    <button
                      disabled={actionLoading === item.bookingId}
                      onClick={() => handleUpdateStatus(item.bookingId, 'CHECKED_IN')}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-800 text-white text-xs font-semibold hover:bg-slate-900 transition cursor-pointer"
                    >
                      Mark Arrived
                    </button>
                  )}

                  {(item.status === 'WAITING' || item.status === 'CHECKED_IN') && (
                    <button
                      disabled={actionLoading === item.bookingId}
                      onClick={() => handleUpdateStatus(item.bookingId, 'CALLED')}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-bold transition cursor-pointer shadow-xs"
                    >
                      <Radio className="w-3.5 h-3.5" />
                      <span>Call to Weighbridge</span>
                    </button>
                  )}

                  {item.status === 'CALLED' && (
                    <button
                      disabled={actionLoading === item.bookingId}
                      onClick={() => handleUpdateStatus(item.bookingId, 'PROCESSING')}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition cursor-pointer shadow-xs"
                    >
                      Drive on Scale
                    </button>
                  )}

                  {item.status === 'PROCESSING' && (
                    <Link
                      to={`/operator/procurement?bookingId=${item.bookingId}&farmerName=${encodeURIComponent(item.farmerName)}&quantity=${item.quantity}&cropName=${encodeURIComponent(item.cropName)}&tokenNumber=${item.tokenNumber}`}
                      className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition shadow-xs"
                    >
                      Issue Weighment Slip
                    </Link>
                  )}

                  {isCompleted && (
                    <span className="text-xs font-semibold text-emerald-800 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Completed
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
