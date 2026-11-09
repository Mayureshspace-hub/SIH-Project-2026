import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Clock,
  MapPin,
  CalendarCheck,
  Ticket,
  ArrowRight,
  Search,
  Scale,
  CreditCard,
  Sprout,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { api } from '../../services/api';

export const FarmerDashboard: React.FC = () => {
  const { user, farmer } = useAuth();
  const { lastFarmerUpdate, lastFirestoreUpdate } = useSocket();
  const [liveQueue, setLiveQueue] = useState<any>(null);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = () => {
    Promise.all([api.getFarmerLiveQueue(), api.getMyBookings()])
      .then(([queueRes, bookingsRes]) => {
        if (queueRes && queueRes.tokenNumber) {
          setLiveQueue(queueRes);
        } else {
          setLiveQueue(null);
        }
        setRecentBookings(bookingsRes.slice(0, 3));
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (lastFirestoreUpdate && !['bookings', 'queue', 'slots'].includes(lastFirestoreUpdate.collection)) return;
    fetchDashboardData();
  }, [lastFarmerUpdate, lastFirestoreUpdate?.timestamp]);

  return (
    <div className="space-y-6">
      {/* Welcome Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 sm:p-6 rounded-2xl border border-stone-200">
        <div>
          <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
            Farmer Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 mt-0.5">
            Welcome, {user?.name || 'Rajesh Patil'}
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Registered Village: <strong className="text-stone-700">{farmer?.village || 'Sawangi, Parseoni'}</strong> • ID: <span className="font-mono">{farmer?.farmerId || 'MH-NAG-2026-0814'}</span>
          </p>
        </div>

        <Link
          to="/farmer/book-slot"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold transition shadow-xs self-start sm:self-auto"
        >
          <CalendarCheck className="w-4 h-4" />
          <span>Book New Slot</span>
        </Link>
      </div>

      {/* Active Live Booking Card (Section 8) */}
      {loading ? (
        <div className="bg-white p-8 rounded-2xl border border-stone-200 animate-pulse h-48" />
      ) : liveQueue ? (
        <div className="bg-gradient-to-br from-emerald-900 to-stone-900 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
          <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-emerald-700/20 rounded-full blur-2xl" />

          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-emerald-800/80">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-400 text-stone-950">
                ACTIVE TODAY
              </span>
              <span className="text-xs text-emerald-200">Live Weighbridge Queue</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-emerald-300">Status:</span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                liveQueue.status === 'CALLED'
                  ? 'bg-amber-400 text-stone-950 animate-bounce'
                  : liveQueue.status === 'PROCESSING'
                  ? 'bg-blue-400 text-stone-950'
                  : 'bg-emerald-700 text-emerald-100'
              }`}>
                {liveQueue.status}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 py-6">
            <div>
              <span className="text-xs text-emerald-300/80 block">Procurement Centre</span>
              <h3 className="text-lg font-bold text-white mt-1 leading-snug">
                {liveQueue.centre?.name || 'Parseoni Procurement Centre'}
              </h3>
              <p className="text-xs text-emerald-200/70 mt-1 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-amber-300" />
                <span>{liveQueue.centre?.location || 'Parseoni Tehsil'}</span>
              </p>
            </div>

            <div>
              <span className="text-xs text-emerald-300/80 block">Crop &amp; Quantity</span>
              <h3 className="text-lg font-bold text-amber-300 mt-1">
                {liveQueue.crop?.name || 'Paddy'}
              </h3>
              <p className="text-xs text-emerald-100 mt-1">
                Reported: <strong>{liveQueue.booking?.quantity} quintals</strong>
              </p>
            </div>

            <div>
              <span className="text-xs text-emerald-300/80 block">Assigned Token</span>
              <div className="mt-1 inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-800/80 border border-emerald-600 font-mono text-xl font-extrabold text-white">
                <Ticket className="w-5 h-5 text-amber-400" />
                <span>{liveQueue.tokenNumber}</span>
              </div>
              <p className="text-[11px] text-emerald-300/70 mt-1">
                Slot: {liveQueue.slot ? `${liveQueue.slot.startTime} – ${liveQueue.slot.endTime}` : '11:00 AM – 12:00 PM'}
              </p>
            </div>

            <div className="bg-emerald-950/70 p-4 rounded-2xl border border-emerald-700/60 flex flex-col justify-between">
              <div>
                <span className="text-[11px] text-emerald-300 block">Queue Wait Estimate</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-2xl font-bold font-mono text-white">~{liveQueue.estimatedWaitMinutes}</span>
                  <span className="text-xs text-emerald-300">minutes</span>
                </div>
                <p className="text-[11px] text-emerald-300/80 mt-1">
                  <strong>{liveQueue.farmersAhead}</strong> farmers ahead in line
                </p>
              </div>

              <Link
                to="/farmer/queue"
                className="mt-3 inline-flex items-center justify-center gap-1.5 w-full py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-bold transition shadow-xs"
              >
                <span>Open Live Queue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="pt-3 border-t border-emerald-800/60 text-[11px] text-emerald-300/70 flex items-center justify-between flex-wrap gap-2">
            <span>* Waiting time dynamically adjusts based on produce tonnage of farmers ahead.</span>
            <Link to="/farmer/queue" className="text-amber-300 underline font-medium">
              View real-time visual progress &rarr;
            </Link>
          </div>
        </div>
      ) : (
        /* Empty state: No active booking */
        <div className="bg-white border border-stone-200 rounded-3xl p-8 text-center">
          <div className="w-12 h-12 rounded-2xl bg-stone-100 text-stone-400 mx-auto flex items-center justify-center mb-3">
            <CalendarCheck className="w-6 h-6 text-emerald-700" />
          </div>
          <h3 className="text-lg font-bold text-stone-900">No Active Booking Today</h3>
          <p className="text-xs text-stone-500 max-w-md mx-auto mt-1 mb-5">
            You do not currently have a procurement slot booked. Find an authorized centre accepting your crop to reserve a token.
          </p>
          <Link
            to="/farmer/centres"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold transition shadow-xs"
          >
            <Search className="w-4 h-4" />
            <span>Find Procurement Centre</span>
          </Link>
        </div>
      )}

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          to="/farmer/centres"
          className="bg-white p-5 rounded-2xl border border-stone-200 hover:border-emerald-600 transition group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center mb-3 group-hover:bg-emerald-100">
            <Search className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-stone-900 text-sm">Find Centres</h4>
          <p className="text-xs text-stone-500 mt-1">Search nearby APMC hubs or filter by accepted crop.</p>
        </Link>

        <Link
          to="/farmer/book-slot"
          className="bg-white p-5 rounded-2xl border border-stone-200 hover:border-emerald-600 transition group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center mb-3 group-hover:bg-emerald-100">
            <CalendarCheck className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-stone-900 text-sm">Book a Slot</h4>
          <p className="text-xs text-stone-500 mt-1">Reserve a 1-hour weighbridge slot and get your digital token.</p>
        </Link>

        <Link
          to="/farmer/procurement"
          className="bg-white p-5 rounded-2xl border border-stone-200 hover:border-emerald-600 transition group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center mb-3 group-hover:bg-emerald-100">
            <Scale className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-stone-900 text-sm">Procurement Records</h4>
          <p className="text-xs text-stone-500 mt-1">View official slips, accepted quantities, and quality grade.</p>
        </Link>

        <Link
          to="/farmer/payments"
          className="bg-white p-5 rounded-2xl border border-stone-200 hover:border-emerald-600 transition group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center mb-3 group-hover:bg-emerald-100">
            <CreditCard className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-stone-900 text-sm">Payment Status</h4>
          <p className="text-xs text-stone-500 mt-1">Track DBT payment once officially finalized by the centre.</p>
        </Link>
      </div>

      {/* Recent Bookings List (Card Based, Not a Table) */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-base text-stone-900">Recent Bookings</h3>
          <Link to="/farmer/bookings" className="text-xs font-semibold text-emerald-800 hover:underline">
            View All &rarr;
          </Link>
        </div>

        {recentBookings.length === 0 ? (
          <p className="text-xs text-stone-400 py-4">No recent bookings recorded.</p>
        ) : (
          <div className="space-y-3">
            {recentBookings.map((b) => (
              <div
                key={b.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-stone-200 hover:border-stone-300 gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-stone-900">{b.tokenNumber}</span>
                    <span className="text-stone-300">•</span>
                    <span className="font-semibold text-stone-900 text-sm">{b.centreName}</span>
                  </div>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Crop: <strong>{b.cropName}</strong> • {b.quantity} quintals • Slot: {b.slotDate} ({b.slotTime})
                  </p>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    b.status === 'COMPLETED'
                      ? 'bg-emerald-100 text-emerald-800'
                      : b.status === 'CANCELLED'
                      ? 'bg-stone-100 text-stone-500'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {b.status}
                  </span>
                  <Link
                    to="/farmer/bookings"
                    className="text-xs font-semibold text-emerald-800 hover:text-emerald-900"
                  >
                    Details &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
