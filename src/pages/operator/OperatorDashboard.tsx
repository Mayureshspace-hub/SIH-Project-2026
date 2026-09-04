import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  Users,
  CheckCircle2,
  Clock,
  Radio,
  Scale,
  ArrowRight,
  RefreshCw,
  Bell,
  Check,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { api } from '../../services/api';

export const OperatorDashboard: React.FC = () => {
  const { user, operator } = useAuth();
  const { lastQueueUpdate, joinCentreQueueRoom } = useSocket();

  const [queueData, setQueueData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [callingNext, setCallingNext] = useState(false);

  const centreId = operator?.centreId || 'centre-parseoni';

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

  const handleCallNext = async () => {
    setCallingNext(true);
    try {
      const res = await api.callNextFarmer(centreId);
      setQueueData(res);
    } catch (err: any) {
      alert(err.message || 'No more waiting farmers in queue');
    } finally {
      setCallingNext(false);
    }
  };

  const handleUpdateStatus = async (bookingId: string, status: string) => {
    try {
      const res = await api.updateBookingStatus(bookingId, status);
      fetchQueue();
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    }
  };

  const stats = queueData?.stats || {
    totalBookings: 18,
    checkedIn: 14,
    completed: 11,
    waiting: 3,
  };

  return (
    <div className="space-y-6">
      {/* Operator Welcome Header */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
            Procurement Centre Console
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 mt-0.5">
            {queueData?.centre?.name || 'Parseoni Procurement Centre'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Operator: <strong className="text-slate-800">{user?.name}</strong> • Station: Weighbridge Platform #1
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchQueue}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sync</span>
          </button>

          {/* Primary Operator Action: Call Next Farmer */}
          <button
            disabled={callingNext}
            onClick={handleCallNext}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-50"
          >
            <Radio className="w-4 h-4 text-amber-300 animate-pulse" />
            <span>{callingNext ? 'Calling...' : 'Call Next Token'}</span>
          </button>
        </div>
      </div>

      {/* Operational Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block">Total Bookings Today</span>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
            {stats.totalBookings}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Assigned slot entries</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block">Checked-In at Yard</span>
          <div className="text-2xl font-bold font-mono text-emerald-800 mt-1">
            {stats.checkedIn}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Vehicles physically in staging</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block">Currently Waiting</span>
          <div className="text-2xl font-bold font-mono text-amber-700 mt-1">
            {stats.waiting}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Tokens pending scale entry</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block">Weighed &amp; Cleared</span>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
            {stats.completed}
          </div>
          <span className="text-[11px] text-emerald-700 font-semibold mt-1 block">Slips recorded</span>
        </div>
      </div>

      {/* Real-Time Live Queue List (Card Layout, NOT a Spreadsheet Table!) */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">Today&apos;s Active Operational Queue</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage gate intake, call tokens to the weighbridge, and log completed weighments.
            </p>
          </div>

          <Link
            to="/operator/queue"
            className="text-xs font-semibold text-emerald-700 hover:underline"
          >
            Full Live Console &rarr;
          </Link>
        </div>

        <div className="space-y-3">
          {(!queueData?.queue || queueData.queue.length === 0) ? (
            <p className="text-xs text-slate-400 py-6 text-center">No queue items recorded for today.</p>
          ) : (
            queueData.queue.map((item: any, idx: number) => {
              const isCalled = item.status === 'CALLED';
              const isProcessing = item.status === 'PROCESSING';
              const isCompleted = item.status === 'COMPLETED';

              return (
                <div
                  key={item.id || idx}
                  className={`p-4 rounded-2xl border transition flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    isCalled
                      ? 'border-amber-400 bg-amber-50/60 shadow-xs'
                      : isProcessing
                      ? 'border-blue-400 bg-blue-50/60'
                      : isCompleted
                      ? 'border-slate-200 bg-slate-50/60 opacity-60'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center font-mono font-bold text-xs text-slate-700 shrink-0">
                      #{idx + 1}
                    </span>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-base font-bold text-slate-900">
                          {item.tokenNumber}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
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
                        <span className="text-xs text-slate-500 font-semibold">
                          {item.farmerName}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 mt-1">
                        Crop: <strong>{item.cropName || 'Paddy'}</strong> • Quantity: <strong>{item.quantity} quintals</strong> • Slot: {item.slotTime || '11:00 AM'}
                      </p>
                    </div>
                  </div>

                  {/* Operator Actions for this Token */}
                  <div className="flex items-center gap-2 self-end md:self-auto">
                    {item.status === 'WAITING' || item.status === 'CHECKED_IN' ? (
                      <button
                        onClick={() => handleUpdateStatus(item.bookingId, 'CALLED')}
                        className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-bold transition cursor-pointer"
                      >
                        Call to Scale
                      </button>
                    ) : null}

                    {item.status === 'CALLED' ? (
                      <button
                        onClick={() => handleUpdateStatus(item.bookingId, 'PROCESSING')}
                        className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition cursor-pointer"
                      >
                        Start Weighing
                      </button>
                    ) : null}

                    {item.status === 'PROCESSING' ? (
                      <Link
                        to={`/operator/procurement?bookingId=${item.bookingId}&farmerName=${encodeURIComponent(item.farmerName)}&quantity=${item.quantity}&cropName=${encodeURIComponent(item.cropName)}&tokenNumber=${item.tokenNumber}`}
                        className="px-4 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition shadow-xs"
                      >
                        Complete &amp; Issue Slip
                      </Link>
                    ) : null}

                    {isCompleted && (
                      <span className="text-xs font-semibold text-emerald-800 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Slip Logged
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
