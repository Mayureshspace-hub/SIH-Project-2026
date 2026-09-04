import React, { useState, useEffect } from 'react';
import { CalendarCheck, Search, Filter, CheckCircle2, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

export const OperatorBookingsPage: React.FC = () => {
  const { operator } = useAuth();
  const centreId = operator?.centreId || 'centre-parseoni';

  const [bookings, setBookings] = useState<any[]>([]);
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAllBookings({ centreId })
      .then((res) => setBookings(res))
      .finally(() => setLoading(false));
  }, [centreId]);

  const filtered = bookings.filter((b) => {
    if (filter === 'ALL') return true;
    return b.status === filter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
            Weighbridge Roster
          </span>
          <h1 className="text-2xl font-serif font-bold text-slate-900 mt-0.5">
            Bookings &amp; Intake Slots
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            All scheduled farmer reservations for Parseoni Procurement Centre.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {['ALL', 'WAITING', 'CALLED', 'PROCESSING', 'COMPLETED'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                filter === f
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-28 bg-white rounded-2xl border border-slate-200 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-3xl border border-slate-200">
          <p className="text-sm font-semibold text-slate-700">No bookings matching filter</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((b) => (
            <div
              key={b.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-900 px-2 py-0.5 rounded bg-slate-100">
                    {b.tokenNumber}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    b.status === 'COMPLETED'
                      ? 'bg-emerald-100 text-emerald-800'
                      : b.status === 'CALLED'
                      ? 'bg-amber-100 text-amber-900'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {b.status}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">
                    {b.slotDate} ({b.slotTime})
                  </span>
                </div>

                <h3 className="font-bold text-base text-slate-900">{b.farmerName}</h3>
                <p className="text-xs text-slate-600">
                  Crop: <strong>{b.cropName}</strong> • Quantity: <strong>{b.quantity} quintals</strong>
                </p>
              </div>

              <div className="text-left md:text-right">
                <span className="text-xs text-slate-400 block">Queue Token Position</span>
                <span className="font-mono font-bold text-slate-800 text-sm">
                  Token #{b.tokenNumber}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
