import React, { useState, useEffect } from 'react';
import { CalendarCheck, Clock, Plus, CheckCircle2, AlertCircle, RefreshCw, X, Calendar } from 'lucide-react';
import { procurementService, CentreSlot, CentreTokenEntry } from '../services/procurementService';

export const SlotManagement: React.FC = () => {
  const [slots, setSlots] = useState<CentreSlot[]>([]);
  const [tokens, setTokens] = useState<CentreTokenEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // New slot form state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDate, setNewDate] = useState('2026-11-10');
  const [newStart, setNewStart] = useState('09:00');
  const [newEnd, setNewEnd] = useState('11:00');
  const [newCapacity, setNewCapacity] = useState(15);

  // Reschedule state
  const [reschedulingToken, setReschedulingToken] = useState<CentreTokenEntry | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState('2026-11-09');
  const [rescheduleTime, setRescheduleTime] = useState('11:00 - 13:00');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [slotData, tokenData] = await Promise.all([
        procurementService.getSlots(),
        procurementService.getTokens(),
      ]);
      setSlots(slotData);
      setTokens(tokenData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await procurementService.addSlot({
        centreId: 'ctr_parseoni',
        date: newDate,
        startTime: newStart,
        endTime: newEnd,
        capacity: Number(newCapacity) || 15,
        status: 'AVAILABLE',
      });
      setShowAddModal(false);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to add slot');
    }
  };

  const handleToggleSlotStatus = async (slotId: string, currentStatus: CentreSlot['status']) => {
    const nextStatus = currentStatus === 'AVAILABLE' ? 'CLOSED' : 'AVAILABLE';
    await procurementService.updateSlotStatus(slotId, nextStatus);
    fetchData();
  };

  const handleRescheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reschedulingToken) return;

    await procurementService.rescheduleBooking(reschedulingToken.bookingId, rescheduleDate, rescheduleTime);
    setReschedulingToken(null);
    fetchData();
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-stone-200/90 shadow-xs">
        <div>
          <span className="text-xs font-bold text-[#0f5e59] uppercase tracking-wider block">
            Capacity &amp; Entry Windows
          </span>
          <h1 className="text-2xl font-serif font-bold text-stone-900 mt-0.5">
            Slot Management
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Configure hourly procurement entry windows and manage farmer booking schedules.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0f5e59] hover:bg-[#0b4b47] text-white text-xs font-semibold shadow-sm transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Intake Slot</span>
        </button>
      </div>

      {/* Slots List */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-xs">
        <h2 className="text-base font-bold text-stone-900 font-serif mb-4 flex items-center gap-2">
          <CalendarCheck className="w-5 h-5 text-[#0f5e59]" />
          <span>Configured Intake Slots</span>
        </h2>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-[#faf8f5] rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {slots.map((slot) => {
              const percentage = Math.round((slot.booked / slot.capacity) * 100);
              return (
                <div
                  key={slot.id}
                  className="bg-[#faf8f5] rounded-2xl p-4 border border-stone-200 hover:border-[#0f5e59]/50 transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold font-mono text-stone-900">{slot.date}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          slot.status === 'AVAILABLE'
                            ? 'bg-emerald-100 text-emerald-800'
                            : slot.status === 'FULL'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-stone-200 text-stone-700'
                        }`}
                      >
                        {slot.status}
                      </span>
                    </div>

                    <div className="text-sm font-semibold text-stone-800 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-stone-400" />
                      <span>{slot.startTime} &ndash; {slot.endTime}</span>
                    </div>

                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-stone-600 mb-1">
                        <span>Intake Capacity</span>
                        <strong>{slot.booked} / {slot.capacity} Farmers ({percentage}%)</strong>
                      </div>
                      <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${percentage >= 100 ? 'bg-red-500' : 'bg-[#0f5e59]'}`}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-stone-200/80 flex items-center justify-between">
                    <button
                      onClick={() => handleToggleSlotStatus(slot.id, slot.status)}
                      className="text-xs text-stone-600 hover:text-stone-900 font-semibold underline cursor-pointer"
                    >
                      {slot.status === 'CLOSED' ? 'Re-open Slot' : 'Close Slot'}
                    </button>
                    <span className="text-[11px] text-stone-400">Max {slot.capacity} tractors/hr</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Reschedule Active Bookings Section */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-xs">
        <h2 className="text-base font-bold text-stone-900 font-serif mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-amber-700" />
          <span>Active Bookings &amp; Reschedule Options</span>
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-700">
            <thead className="bg-[#faf8f5] text-stone-600 font-bold uppercase tracking-wider text-[11px] border-b border-stone-200">
              <tr>
                <th className="py-3 px-4">Token</th>
                <th className="py-3 px-4">Farmer Name</th>
                <th className="py-3 px-4">Produce Qty</th>
                <th className="py-3 px-4">Current Slot</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {tokens.map((token) => (
                <tr key={token.id} className="hover:bg-[#faf8f5]/60 transition">
                  <td className="py-3.5 px-4 font-mono font-bold text-[#0f5e59]">{token.tokenNumber}</td>
                  <td className="py-3.5 px-4 font-semibold text-stone-900">{token.farmerName}</td>
                  <td className="py-3.5 px-4">{token.quantity} Quintals ({token.cropName})</td>
                  <td className="py-3.5 px-4">{token.slotDate} &bull; {token.slotTime}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-stone-100 text-stone-800">
                      {token.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => {
                        setReschedulingToken(token);
                        setRescheduleDate(token.slotDate);
                        setRescheduleTime(token.slotTime);
                      }}
                      className="px-2.5 py-1 rounded bg-[#faf8f5] hover:bg-amber-50 text-amber-800 border border-stone-200 hover:border-amber-300 font-semibold text-[11px] transition cursor-pointer"
                    >
                      Reschedule
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Slot Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-5 right-5 text-stone-400 hover:text-stone-700"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold text-stone-900 font-serif mb-1">Add Procurement Slot</h3>
            <p className="text-xs text-stone-500 mb-5">Open an entry window for farmers to book transport slots.</p>

            <form onSubmit={handleAddSlot} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Procurement Date</label>
                <input
                  type="date"
                  required
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl bg-[#faf8f5] focus:outline-none focus:border-[#0f8a6a]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    required
                    value={newStart}
                    onChange={(e) => setNewStart(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl bg-[#faf8f5] focus:outline-none focus:border-[#0f8a6a]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">End Time</label>
                  <input
                    type="time"
                    required
                    value={newEnd}
                    onChange={(e) => setNewEnd(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl bg-[#faf8f5] focus:outline-none focus:border-[#0f8a6a]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Vehicle / Farmer Capacity Cap</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  required
                  value={newCapacity}
                  onChange={(e) => setNewCapacity(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl bg-[#faf8f5] focus:outline-none focus:border-[#0f8a6a]"
                />
                <span className="text-[10px] text-stone-400">Strictly caps highway tractor line-up</span>
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-3 bg-[#0f5e59] hover:bg-[#0b4b47] text-white rounded-xl font-semibold shadow-sm transition cursor-pointer"
              >
                Publish Slot
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {reschedulingToken && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 relative">
            <button
              onClick={() => setReschedulingToken(null)}
              className="absolute top-5 right-5 text-stone-400 hover:text-stone-700"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold text-stone-900 font-serif mb-1">Reschedule Farmer Booking</h3>
            <p className="text-xs text-stone-500 mb-4">
              Updating appointment for <strong>{reschedulingToken.farmerName}</strong> (Token: {reschedulingToken.tokenNumber})
            </p>

            <form onSubmit={handleRescheduleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">New Date</label>
                <input
                  type="date"
                  required
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl bg-[#faf8f5]"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Select Time Window</label>
                <select
                  value={rescheduleTime}
                  onChange={(e) => setRescheduleTime(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl bg-[#faf8f5]"
                >
                  <option value="09:00 - 11:00">09:00 - 11:00 AM</option>
                  <option value="11:00 - 13:00">11:00 AM - 01:00 PM</option>
                  <option value="13:30 - 15:30">01:30 - 03:30 PM</option>
                  <option value="15:30 - 17:30">03:30 - 05:30 PM</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-3 bg-[#0f5e59] hover:bg-[#0b4b47] text-white rounded-xl font-semibold shadow-sm transition cursor-pointer"
              >
                Confirm Reschedule
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
