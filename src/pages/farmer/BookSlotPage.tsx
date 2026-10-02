import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  Sprout,
  Building2,
  Calendar,
  Clock,
  Scale,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Ticket,
  Sparkles,
  Info
} from 'lucide-react';
import { api } from '../../services/api';
import { Crop, ProcurementCentre, Slot } from '../../types';

export const BookSlotPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Wizard Steps: 1: Crop, 2: Centre, 3: Date & Slot, 4: Quantity & Review, 5: Confirmed
  const [step, setStep] = useState<number>(1);

  // Data collections
  const [crops, setCrops] = useState<Crop[]>([]);
  const [centres, setCentres] = useState<ProcurementCentre[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);

  // Track if centre was pre-selected via Find Centre flow
  const centrePreSelected = Boolean(searchParams.get('centreId'));

  // Selected state
  const [selectedCropId, setSelectedCropId] = useState<string>(searchParams.get('cropId') || '');
  const [selectedCentreId, setSelectedCentreId] = useState<string>(searchParams.get('centreId') || '');
  
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [selectedSlotId, setSelectedSlotId] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('18');

  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmedData, setConfirmedData] = useState<any>(null);

  // Fetch initial crops & centres
  useEffect(() => {
    Promise.all([api.getCrops(), api.getCentres()]).then(([cropsData, centresData]) => {
      setCrops(cropsData);
      setCentres(centresData);

      if (searchParams.get('centreId')) {
        setSelectedCentreId(searchParams.get('centreId')!);
        // Stay on step 1 (Crop Selection) so the user must select a crop first
      }
      if (searchParams.get('cropId')) {
        setSelectedCropId(searchParams.get('cropId')!);
      }
    });
  }, []);

  // Fetch slots whenever centre or date changes
  useEffect(() => {
    if (selectedCentreId && selectedDate) {
      setLoadingSlots(true);
      api.getSlots({ centreId: selectedCentreId, date: selectedDate })
        .then((res) => {
          setSlots(res);
        })
        .finally(() => setLoadingSlots(false));
    }
  }, [selectedCentreId, selectedDate]);

  // Filter centres by selected crop (if selected)
  const availableCentres = selectedCropId
    ? centres.filter((c) => c.acceptedCrops?.some((cr) => cr.id === selectedCropId))
    : centres;

  const selectedCrop = crops.find((c) => c.id === selectedCropId);
  const selectedCentre = centres.find((c) => c.id === selectedCentreId);
  const selectedSlot = slots.find((s) => s.id === selectedSlotId);

  const handleConfirmBooking = async () => {
    setError(null);
    const qty = Number(quantity);
    if (!qty || qty <= 0) {
      setError('Please provide a valid produce quantity in quintals');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.createBooking({
        centreId: selectedCentreId,
        slotId: selectedSlotId,
        cropId: selectedCropId,
        quantity: qty,
      });

      setConfirmedData(res);
      setStep(5); // Show Confirmation Step
    } catch (err: any) {
      setError(err.message || 'Failed to confirm booking. Slot may have been filled.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header & Step Tracker */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-stone-200 shadow-xs">
        <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
          Step-By-Step Reservation
        </span>
        <h1 className="text-2xl font-serif font-bold text-stone-900 mt-0.5">
          Book Procurement Slot
        </h1>

        {/* Progress Bar */}
        {step < 5 && (
          <div className="mt-4 flex items-center justify-between gap-2 border-t border-stone-100 pt-4 text-xs font-medium text-stone-500">
            <span className={step >= 1 ? 'text-emerald-800 font-bold' : ''}>1. Select Crop</span>
            <span>&rarr;</span>
            <span className={step >= 2 ? 'text-emerald-800 font-bold' : ''}>2. Choose Centre</span>
            <span>&rarr;</span>
            <span className={step >= 3 ? 'text-emerald-800 font-bold' : ''}>3. Date &amp; Slot</span>
            <span>&rarr;</span>
            <span className={step >= 4 ? 'text-emerald-800 font-bold' : ''}>4. Quantity &amp; Confirm</span>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* STEP 1: Select Crop */}
      {step === 1 && (
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
          <h2 className="font-bold text-base text-stone-900 flex items-center gap-2">
            <Sprout className="w-5 h-5 text-emerald-700" />
            <span>Select Your Harvest Crop</span>
          </h2>
          <p className="text-xs text-stone-500">
            {centrePreSelected && selectedCentre
              ? <>Showing crops accepted at <strong>{selectedCentre.name}</strong>. Choose what you are bringing.</>
              : 'Centres only accept authorized crops for procurement. Choose what you are bringing to the centre.'}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {(centrePreSelected && selectedCentre
              ? crops.filter((c) => selectedCentre.acceptedCrops?.some((ac: any) => ac.id === c.id))
              : crops
            ).map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedCropId(c.id)}
                className={`p-4 rounded-2xl border-2 text-left transition cursor-pointer flex flex-col justify-between ${
                  selectedCropId === c.id
                    ? 'border-emerald-700 bg-emerald-50 text-emerald-950 font-bold shadow-xs'
                    : 'border-stone-200 hover:border-stone-300 text-stone-800 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold">🌾 {c.name}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 font-mono">
                    {c.category}
                  </span>
                </div>
                <p className="text-[11px] text-stone-500 line-clamp-2">{c.description}</p>
              </button>
            ))}
          </div>

          <div className="pt-4 flex justify-end">
            <button
              disabled={!selectedCropId}
              onClick={() => setStep(centrePreSelected ? 3 : 2)}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold disabled:opacity-50 cursor-pointer shadow-xs"
            >
              <span>{centrePreSelected ? 'Next: Select Slot' : 'Next: Choose Centre'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Select Centre */}
      {step === 2 && (
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-base text-stone-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-700" />
              <span>Select Procurement Centre</span>
            </h2>
            <button
              onClick={() => setStep(1)}
              className="text-xs text-stone-500 hover:text-stone-800 flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Change Crop ({selectedCrop?.name})</span>
            </button>
          </div>

          <p className="text-xs text-stone-500">
            Showing authorized centres accepting <strong>{selectedCrop?.name || 'your crop'}</strong>.
          </p>

          <div className="space-y-3 pt-2">
            {availableCentres.map((centre) => (
              <button
                key={centre.id}
                type="button"
                onClick={() => setSelectedCentreId(centre.id)}
                className={`w-full p-4 rounded-2xl border-2 text-left transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  selectedCentreId === centre.id
                    ? 'border-emerald-700 bg-emerald-50 text-emerald-950 font-bold shadow-xs'
                    : 'border-stone-200 hover:border-stone-300 text-stone-800 bg-white'
                }`}
              >
                <div>
                  <h4 className="font-bold text-sm">{centre.name}</h4>
                  <p className="text-xs text-stone-500 mt-0.5">{centre.location}, {centre.district}</p>
                </div>
                <div className="text-left sm:text-right text-xs">
                  <span className="font-mono text-emerald-800 block">
                    Queue: {centre.todayQueueCount || 0} waiting
                  </span>
                  <span className="text-[11px] text-stone-400">
                    Hours: {centre.workingStart} – {centre.workingEnd}
                  </span>
                </div>
              </button>
            ))}
          </div>

          <div className="pt-4 flex items-center justify-between">
            <button
              onClick={() => setStep(1)}
              className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl"
            >
              Back
            </button>
            <button
              disabled={!selectedCentreId}
              onClick={() => setStep(3)}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold disabled:opacity-50 cursor-pointer shadow-xs"
            >
              <span>Next: Select Slot</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Select Date & Available Slot (Cards, Section 12) */}
      {step === 3 && (
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-base text-stone-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-700" />
              <span>Select Date &amp; Available Slot</span>
            </h2>
            <button
              onClick={() => setStep(centrePreSelected ? 1 : 2)}
              className="text-xs text-stone-500 hover:text-stone-800 flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{centrePreSelected ? 'Change Crop' : selectedCentre?.name}</span>
            </button>
          </div>

          {/* Date Picker */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Procurement Date</label>
            <input
              type="date"
              value={selectedDate}
              min={todayStr}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full sm:w-60 py-2 px-3 text-xs font-semibold bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-600"
            />
          </div>

          {/* Slot Cards List (Section 12) */}
          <div className="pt-2">
            <label className="block text-xs font-semibold text-stone-700 mb-2">Available 1-Hour Windows</label>
            {loadingSlots ? (
              <div className="space-y-2">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="h-16 bg-stone-100 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : slots.length === 0 ? (
              <p className="text-xs text-stone-500 py-4">No slots configured for this date.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {slots.map((slot) => {
                  const spacesLeft = Math.max(0, slot.capacity - slot.booked);
                  const isFull = spacesLeft === 0 || slot.status === 'FULL';
                  const isLimited = spacesLeft <= 3 && !isFull;
                  const isSelected = selectedSlotId === slot.id;

                  return (
                    <button
                      key={slot.id}
                      type="button"
                      disabled={isFull}
                      onClick={() => setSelectedSlotId(slot.id)}
                      className={`p-4 rounded-2xl border-2 text-left transition flex flex-col justify-between ${
                        isFull
                          ? 'border-stone-200 bg-stone-100 text-stone-400 opacity-60 cursor-not-allowed'
                          : isSelected
                          ? 'border-emerald-700 bg-emerald-50 text-emerald-950 font-bold shadow-xs cursor-pointer'
                          : 'border-stone-200 hover:border-stone-300 text-stone-800 bg-white cursor-pointer'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-sm font-bold">
                          {slot.startTime} – {slot.endTime}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                            isFull
                              ? 'bg-stone-300 text-stone-700'
                              : isLimited
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {isFull ? 'FULL' : isLimited ? 'LIMITED' : 'AVAILABLE'}
                        </span>
                      </div>

                      <div className="text-[11px] text-stone-500 mt-1 flex items-center justify-between">
                        <span>{slot.booked} / {slot.capacity} booked</span>
                        <strong className="text-stone-700">{spacesLeft} spaces available</strong>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="pt-4 flex items-center justify-between">
            <button
              onClick={() => setStep(centrePreSelected ? 1 : 2)}
              className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl"
            >
              Back
            </button>
            <button
              disabled={!selectedSlotId}
              onClick={() => setStep(4)}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold disabled:opacity-50 cursor-pointer shadow-xs"
            >
              <span>Next: Quantity &amp; Review</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Enter Produce Quantity & Review (Section 11) */}
      {step === 4 && (
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-base text-stone-900 flex items-center gap-2">
              <Scale className="w-5 h-5 text-emerald-700" />
              <span>Enter Produce Quantity &amp; Review</span>
            </h2>
            <button
              onClick={() => setStep(3)}
              className="text-xs text-stone-500 hover:text-stone-800 flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Change Slot</span>
            </button>
          </div>

          {/* Quantity Input with Explanation (Section 11 & 15) */}
          <div className="bg-amber-50/70 border border-amber-200/80 p-4 rounded-2xl space-y-2">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-900 leading-relaxed">
                <strong>Why quantity matters:</strong> Produce quantity directly dictates weighbridge unloading and moisture analysis duration. Stating an accurate figure ensures the system calculates realistic queue wait estimates for you and subsequent farmers.
              </p>
            </div>

            <div className="pt-2">
              <label className="block text-xs font-bold text-stone-800 mb-1">
                Approximate Quantity (in Quintals)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="500"
                  step="0.5"
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-40 px-3 py-2 text-sm font-mono font-bold bg-white border border-stone-300 rounded-xl focus:outline-none focus:border-emerald-600"
                />
                <span className="text-xs font-semibold text-stone-600">Quintals (100 kg/qtl)</span>
              </div>
            </div>
          </div>

          {/* Review Summary Card */}
          <div className="bg-stone-50 p-5 rounded-2xl border border-stone-200 space-y-3">
            <h3 className="text-xs font-bold text-stone-700 uppercase tracking-wide">
              Booking Confirmation Review
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-stone-400 block">Selected Centre</span>
                <strong className="text-stone-900 font-semibold">{selectedCentre?.name}</strong>
              </div>
              <div>
                <span className="text-stone-400 block">Accepted Crop</span>
                <strong className="text-stone-900 font-semibold">{selectedCrop?.name}</strong>
              </div>
              <div>
                <span className="text-stone-400 block">Date &amp; Time Slot</span>
                <strong className="text-stone-900 font-semibold">
                  {selectedDate} ({selectedSlot?.startTime} – {selectedSlot?.endTime})
                </strong>
              </div>
              <div>
                <span className="text-stone-400 block">Produce Volume</span>
                <strong className="text-stone-900 font-semibold">{quantity} Quintals</strong>
              </div>
            </div>

            <div className="pt-2 border-t border-stone-200 text-[11px] text-stone-500">
              * Payment amounts are finalized strictly after physical inspection and official grading at the procurement centre. No speculative amounts are computed before physical weighment.
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between">
            <button
              onClick={() => setStep(3)}
              className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl"
            >
              Back
            </button>
            <button
              disabled={submitting}
              onClick={handleConfirmBooking}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold cursor-pointer shadow-xs disabled:opacity-50"
            >
              <span>{submitting ? 'Confirming Reservation...' : 'Confirm & Reserve Slot'}</span>
              <CheckCircle2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: Booking Confirmation (Section 13) */}
      {step === 5 && confirmedData && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-md text-center space-y-6">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-800 rounded-2xl mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-700" />
          </div>

          <div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 uppercase tracking-wide">
              Booking Confirmed
            </span>
            <h2 className="text-2xl font-serif font-bold text-stone-900 mt-2">
              Your Slot is Confirmed
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              Token generated and integrated directly into the centre&apos;s live operational queue.
            </p>
          </div>

          {/* Token Display Box (Section 13) */}
          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5 max-w-md mx-auto text-left space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <span className="text-xs text-stone-500">Your Assigned Token:</span>
              <span className="font-mono text-2xl font-extrabold text-emerald-800 tracking-wider">
                {confirmedData.token}
              </span>
            </div>

            <div className="space-y-1.5 text-xs text-stone-700">
              <div className="flex justify-between">
                <span className="text-stone-500">Centre:</span>
                <strong className="text-right">{selectedCentre?.name}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Crop:</span>
                <strong>{selectedCrop?.name} ({quantity} qtl)</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Date &amp; Slot:</span>
                <strong>{selectedDate} ({selectedSlot?.startTime} – {selectedSlot?.endTime})</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Queue Position:</span>
                <strong className="font-mono font-bold text-emerald-800">
                  {confirmedData.liveQueue?.queuePosition || 'Scheduled'}
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Farmers Ahead:</span>
                <strong>{confirmedData.liveQueue?.farmersAhead || 0}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Estimated Waiting:</span>
                <strong className="text-amber-700 font-mono">
                  {confirmedData.liveQueue?.estimatedWaitMinutes != null
                    ? `~${confirmedData.liveQueue.estimatedWaitMinutes} minutes`
                    : 'Not available'}
                </strong>
              </div>
            </div>
          </div>

          {/* Track Live Queue CTA (Section 13) */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/farmer/queue"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold transition shadow-xs"
            >
              <Ticket className="w-4 h-4 text-amber-300" />
              <span>Track Live Queue Now</span>
            </Link>

            <Link
              to="/farmer/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition"
            >
              <span>Back to Dashboard</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
