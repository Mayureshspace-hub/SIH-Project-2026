import React, { useState, useEffect } from 'react';
import { CalendarCheck, Filter, Search } from 'lucide-react';
import { api } from '../../services/api';

export const AdminBookingsPage: React.FC = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAllBookings()
      .then((res) => setBookings(res))
      .finally(() => setLoading(false));
  }, []);

  const filtered = bookings.filter((b) => {
    if (filter === 'ALL') return true;
    return b.status === filter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-3xl border border-stone-200 shadow-xs">
        <div>
          <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block">
            Central Slot Registry
          </span>
          <h1 className="text-2xl font-serif font-bold text-stone-900 mt-0.5">
            System-Wide Bookings
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Aggregated farmer slot reservations across all regional APMC centres.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {['ALL', 'WAITING', 'CALLED', 'PROCESSING', 'COMPLETED'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                filter === f
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-28 bg-white rounded-2xl border border-stone-200 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-3xl border border-stone-200">
            <p className="text-sm font-semibold text-stone-700">No bookings match filter criteria</p>
          </div>
        ) : (
          filtered.map((b) => (
            <div
              key={b.id}
              className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-stone-900 px-2 py-0.5 rounded bg-stone-100">
                    {b.tokenNumber}
                  </span>
                  <span className="text-xs font-bold text-stone-900">{b.farmerName}</span>
                  <span className="text-xs text-stone-500 font-mono">({b.centreName})</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    b.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
                  }`}>
                    {b.status}
                  </span>
                </div>

                <p className="text-xs text-stone-600">
                  Produce: <strong>{b.quantity} quintals</strong> of <strong>{b.cropName}</strong> • Slot: {b.slotDate} ({b.slotTime})
                </p>
              </div>

              <div className="text-left md:text-right">
                <span className="text-[11px] text-stone-400 block">Est. Wait Formula</span>
                <span className="text-xs font-mono font-semibold text-stone-700">
                  {b.estimatedWaitMinutes ? `${b.estimatedWaitMinutes} mins` : 'Completed'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
