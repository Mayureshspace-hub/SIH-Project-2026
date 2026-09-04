import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarCheck,
  MapPin,
  Clock,
  Ticket,
  Ban,
  ArrowRight,
  Filter,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { api } from '../../services/api';

export const MyBookingsPage: React.FC = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [filter, setFilter] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const fetchBookings = () => {
    setLoading(true);
    api.getMyBookings()
      .then((res) => setBookings(res))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancel = async (bookingId: string) => {
    if (!window.confirm('Are you sure you want to cancel this slot booking? The slot will be released for other farmers.')) {
      return;
    }
    setCancellingId(bookingId);
    try {
      await api.cancelBooking(bookingId);
      fetchBookings();
    } catch (err: any) {
      alert(err.message || 'Failed to cancel booking');
    } finally {
      setCancellingId(null);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (filter === 'ALL') return true;
    if (filter === 'ACTIVE') return ['BOOKED', 'CHECKED_IN', 'CALLED', 'PROCESSING'].includes(b.status);
    if (filter === 'COMPLETED') return ['WEIGHED', 'COMPLETED'].includes(b.status);
    if (filter === 'CANCELLED') return b.status === 'CANCELLED';
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
            Reservation History
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 mt-0.5">
            My Slot Bookings
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Track all scheduled, active, and completed weighbridge appointments.
          </p>
        </div>

        <Link
          to="/farmer/book-slot"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold shadow-xs self-start sm:self-auto"
        >
          <CalendarCheck className="w-4 h-4" />
          <span>Book New Slot</span>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-stone-200/70 rounded-2xl w-fit">
        {['ALL', 'ACTIVE', 'COMPLETED', 'CANCELLED'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              filter === f
                ? 'bg-white text-emerald-950 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            {f === 'ALL' ? 'All Bookings' : f.charAt(0) + f.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Bookings Vertical Cards (No Spreadsheet Tables!) */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white p-6 rounded-2xl border border-stone-200 animate-pulse h-32" />
          ))}
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-stone-200">
          <p className="text-sm font-semibold text-stone-700">No bookings in this category</p>
          <p className="text-xs text-stone-400 mt-1">Book your next harvest delivery slot anytime.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((b) => {
            const canCancel = ['BOOKED', 'CHECKED_IN'].includes(b.status);
            const isActive = ['BOOKED', 'CHECKED_IN', 'CALLED', 'PROCESSING'].includes(b.status);

            return (
              <div
                key={b.id}
                className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-6 hover:border-stone-300 transition flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-xs"
              >
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-extrabold px-2.5 py-1 rounded-lg bg-stone-100 text-stone-800 border border-stone-200">
                      Token: {b.tokenNumber}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      b.status === 'COMPLETED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : b.status === 'CANCELLED'
                        ? 'bg-stone-100 text-stone-500'
                        : b.status === 'CALLED'
                        ? 'bg-amber-100 text-amber-900 animate-pulse'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {b.status}
                    </span>
                    <span className="text-xs text-stone-500 font-mono">
                      Booked for: {b.slotDate} ({b.slotTime})
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-stone-900">{b.centreName}</h3>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-stone-600">
                    <span>🌾 Crop: <strong>{b.cropName}</strong></span>
                    <span>⚖️ Reported Quantity: <strong>{b.quantity} quintals</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-3 md:pt-0 border-t md:border-t-0 border-stone-100 self-end md:self-auto">
                  {isActive && (
                    <Link
                      to="/farmer/queue"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 transition shadow-2xs"
                    >
                      <Ticket className="w-3.5 h-3.5 text-amber-300" />
                      <span>Track Live Queue</span>
                    </Link>
                  )}

                  {canCancel && (
                    <button
                      disabled={cancellingId === b.id}
                      onClick={() => handleCancel(b.id)}
                      className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 transition cursor-pointer"
                    >
                      <Ban className="w-3.5 h-3.5" />
                      <span>{cancellingId === b.id ? 'Cancelling...' : 'Cancel'}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
