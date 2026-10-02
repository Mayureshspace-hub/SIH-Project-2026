import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Clock,
  Ticket,
  Users,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Radio,
  RefreshCw,
  Truck,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Info
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { api } from '../../services/api';

export const LiveQueuePage: React.FC = () => {
  const { user } = useAuth();
  const { lastFarmerUpdate, joinCentreQueueRoom } = useSocket();

  const [liveQueue, setLiveQueue] = useState<any>(null);
  const [centreQueueList, setCentreQueueList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  const fetchQueueData = () => {
    setLoading(true);
    api.getFarmerLiveQueue()
      .then((res) => {
        if (res && res.tokenNumber) {
          setLiveQueue(res);
          if (res.centre?.id) {
            joinCentreQueueRoom(res.centre.id);
            // Fetch full centre queue for visual progress breakdown
            api.getCenterTodayQueue(res.centre.id).then((qData) => {
              setCentreQueueList(qData.queue || []);
            }).catch(() => {});
          }
        } else {
          setLiveQueue(null);
        }
        setLastRefreshed(new Date());
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchQueueData();
  }, []);

  // Socket reaction: update live data instantly without reload
  useEffect(() => {
    if (lastFarmerUpdate) {
      setLiveQueue(lastFarmerUpdate);
      if (lastFarmerUpdate.centre?.id) {
        api.getCenterTodayQueue(lastFarmerUpdate.centre.id).then((qData) => {
          setCentreQueueList(qData.queue || []);
        }).catch(() => {});
      }
      setLastRefreshed(new Date());
    }
  }, [lastFarmerUpdate]);

  const handleCheckIn = async () => {
    if (!liveQueue?.bookingId) return;
    setCheckingIn(true);
    try {
      const updated = await api.checkInFarmer(liveQueue.bookingId);
      setLiveQueue((prev: any) => ({
        ...prev,
        status: updated.booking.status,
      }));
      fetchQueueData();
    } catch (err: any) {
      alert(err.message || 'Check-in failed');
    } finally {
      setCheckingIn(false);
    }
  };

  if (loading && !liveQueue) {
    return <div className="bg-white p-8 rounded-3xl border border-stone-200 animate-pulse h-96" />;
  }

  if (!liveQueue || !liveQueue.tokenNumber) {
    return (
      <div className="bg-white border border-stone-200 rounded-3xl p-8 text-center max-w-xl mx-auto my-8">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-800 mx-auto flex items-center justify-center mb-3">
          <Clock className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-stone-900">No Active Queue Token</h2>
        <p className="text-xs text-stone-500 mt-1 mb-5">
          You currently don&apos;t have an active booking queued today. Book a slot at a nearby procurement centre to join the live queue.
        </p>
        <Link
          to="/farmer/book-slot"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-800 text-white text-xs font-semibold shadow-xs"
        >
          <span>Book a Procurement Slot</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  const isCheckedIn = liveQueue.status !== 'BOOKED';
  const isCalled = liveQueue.status === 'CALLED';
  const isProcessing = liveQueue.status === 'PROCESSING';
  const isCompleted = liveQueue.status === 'COMPLETED';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Live Header & Real-Time Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 sm:p-6 rounded-3xl border border-stone-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
              <Radio className="w-3 h-3 text-emerald-600 animate-pulse" />
              LIVE WEIGHBRIDGE QUEUE
            </span>
            <span className="text-[11px] text-stone-400 font-mono">
              Auto-sync active ({lastRefreshed.toLocaleTimeString()})
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 mt-1">
            {liveQueue.centre?.name}
          </h1>
          <p className="text-xs text-stone-500 mt-0.5 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-emerald-700" />
            <span>{liveQueue.centre?.location} • Crop: <strong>{liveQueue.crop?.name}</strong></span>
          </p>
        </div>

        <button
          onClick={fetchQueueData}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-medium self-start sm:self-auto transition cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Called Alert Banner (when called by operator) */}
      {isCalled && (
        <div className="bg-amber-400 text-stone-950 p-5 rounded-3xl border-2 border-amber-500 shadow-lg flex items-center gap-4 animate-pulse">
          <Radio className="w-8 h-8 text-stone-950 shrink-0" />
          <div>
            <h3 className="text-lg font-black tracking-wide uppercase">
              YOUR TOKEN IS CALLED! PROCEED TO WEIGHBRIDGE
            </h3>
            <p className="text-xs font-medium">
              Please drive your vehicle onto Platform #1 for weighment and moisture quality verification.
            </p>
          </div>
        </div>
      )}

      {/* Key Metrics Board (Section 14) */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-stone-900 text-white p-4 rounded-2xl border border-stone-800 col-span-2 md:col-span-1 flex flex-col justify-between">
          <span className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold">YOUR TOKEN</span>
          <div className="font-mono text-2xl sm:text-3xl font-black text-amber-300 my-1">
            {liveQueue.tokenNumber}
          </div>
          <span className="text-[10px] text-stone-400">Position #{liveQueue.queuePosition}</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 flex flex-col justify-between">
          <span className="text-[10px] uppercase tracking-wider text-stone-500 font-semibold">CURRENTLY AT SCALE</span>
          <div className="font-mono text-xl sm:text-2xl font-black text-emerald-800 my-1">
            {liveQueue.currentlyProcessingToken || 'None'}
          </div>
          <span className="text-[10px] text-stone-400">Station Active</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 flex flex-col justify-between">
          <span className="text-[10px] uppercase tracking-wider text-stone-500 font-semibold">FARMERS AHEAD</span>
          <div className="font-mono text-xl sm:text-2xl font-black text-stone-900 my-1">
            {liveQueue.farmersAhead}
          </div>
          <span className="text-[10px] text-stone-400">Vehicles in line</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 flex flex-col justify-between">
          <span className="text-[10px] uppercase tracking-wider text-stone-500 font-semibold">ESTIMATED WAIT</span>
          <div className="font-mono text-xl sm:text-2xl font-black text-amber-700 my-1">
            ~{liveQueue.estimatedWaitMinutes}m
          </div>
          <span className="text-[10px] text-stone-400">Dynamic metric</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 flex flex-col justify-between">
          <span className="text-[10px] uppercase tracking-wider text-stone-500 font-semibold">YOUR STATUS</span>
          <div className="my-1">
            <span className={`px-2 py-0.5 rounded-full text-xs font-black tracking-wide ${
              isCalled
                ? 'bg-amber-400 text-stone-950 animate-bounce'
                : isProcessing
                ? 'bg-blue-600 text-white'
                : isCompleted
                ? 'bg-emerald-600 text-white'
                : 'bg-stone-100 text-stone-800'
            }`}>
              {liveQueue.status}
            </span>
          </div>
          <span className="text-[10px] text-stone-400">{liveQueue.booking?.quantity} qtl produce</span>
        </div>
      </div>

      {/* Arrival Check-In Action (Section 17) */}
      {!isCheckedIn && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <Truck className="w-5 h-5 text-emerald-800 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-emerald-950">Have You Arrived at the Centre Yard?</h3>
              <p className="text-xs text-emerald-800 mt-0.5">
                Click Check-In so the weighbridge operator knows your tractor is physically in the staging compound.
              </p>
            </div>
          </div>

          <button
            disabled={checkingIn}
            onClick={handleCheckIn}
            className="px-6 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold transition shadow-xs shrink-0 cursor-pointer disabled:opacity-50"
          >
            {checkingIn ? 'Checking In...' : 'I Have Arrived (Check-In)'}
          </button>
        </div>
      )}

      {/* Visual Queue & Progress Component (Section 14 & 15) */}
      <div className="bg-white p-5 sm:p-7 rounded-3xl border border-stone-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div>
            <h3 className="font-bold text-base text-stone-900">Live Visual Queue Stream</h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Sequence of vehicles ordered by arrival and slot. Real-time updates push automatically.
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-stone-400">
            <Info className="w-3.5 h-3.5" />
            <span>Quantity-aware time factoring</span>
          </div>
        </div>

        {/* Dynamic Queue Sequence */}
        <div className="space-y-2.5">
          {centreQueueList.length === 0 ? (
            <div className="py-6 text-center text-xs text-stone-400">
              Fetching current centre sequence...
            </div>
          ) : (
            centreQueueList.map((item, index) => {
              const isMe = item.tokenNumber === liveQueue.tokenNumber;
              const isItemCompleted = item.status === 'COMPLETED' || item.status === 'WEIGHED';
              const isItemProcessing = item.status === 'PROCESSING';
              const isItemCalled = item.status === 'CALLED';

              return (
                <div
                  key={item.id || index}
                  className={`p-3 sm:p-4 rounded-2xl border transition flex items-center justify-between gap-3 ${
                    isMe
                      ? 'border-2 border-emerald-700 bg-emerald-50/80 shadow-xs'
                      : isItemProcessing
                      ? 'border-blue-300 bg-blue-50/60'
                      : isItemCalled
                      ? 'border-amber-400 bg-amber-50/60'
                      : isItemCompleted
                      ? 'border-stone-200 bg-stone-50/60 opacity-70'
                      : 'border-stone-200 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Status Icon */}
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0">
                      {isItemCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      ) : isItemProcessing ? (
                        <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />
                      ) : isItemCalled ? (
                        <Radio className="w-4 h-4 text-amber-600 animate-pulse" />
                      ) : (
                        <span className="font-mono text-stone-400 text-xs">#{index + 1}</span>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`font-mono text-sm font-bold ${
                          isMe ? 'text-emerald-950 text-base' : 'text-stone-800'
                        }`}>
                          {item.tokenNumber}
                        </span>

                        {isMe && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-800 text-white uppercase tracking-wider">
                            YOU
                          </span>
                        )}

                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          isItemCalled
                            ? 'bg-amber-400 text-stone-950 animate-pulse'
                            : isItemProcessing
                            ? 'bg-blue-500 text-white'
                            : isItemCompleted
                            ? 'bg-stone-200 text-stone-700'
                            : 'bg-stone-100 text-stone-600'
                        }`}>
                          {item.status}
                        </span>
                      </div>

                      <p className="text-[11px] text-stone-500 mt-0.5">
                        Farmer: {isMe ? user?.name : item.farmerName} • Load:{' '}
                        <strong className="text-stone-700">{item.quantity} quintals</strong>
                        {item.cropName ? ` • ${item.cropName}` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[11px] font-mono text-stone-500 block">
                      {isItemCompleted
                        ? 'Weighed & Cleared'
                        : isItemProcessing
                        ? 'At Weighbridge'
                        : isItemCalled
                        ? 'Arriving at Gate'
                        : `~${item.estimatedWaitMinutes ?? 0}m wait`}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Quantity impact explanation (Section 15) */}
        <div className="mt-4 p-3.5 rounded-2xl bg-stone-50 border border-stone-200 text-[11px] text-stone-500 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-emerald-800 shrink-0 mt-0.5" />
          <p>
            <strong>Dynamic Queue Engine:</strong> Each vehicle takes a variable duration based on quantity (e.g. 35 quintals requires longer unloading and automated moisture sampling than 8 quintals). When a vehicle finishes early, the estimated wait decreases instantly for everyone behind.
          </p>
        </div>
      </div>
    </div>
  );
};
