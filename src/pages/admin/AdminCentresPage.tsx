import React, { useState, useEffect } from 'react';
import { Building2, Plus, MapPin, Clock, Sprout, CheckCircle2, X } from 'lucide-react';
import { api } from '../../services/api';

export const AdminCentresPage: React.FC = () => {
  const [centres, setCentres] = useState<any[]>([]);
  const [crops, setCrops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // New Centre form state
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [district, setDistrict] = useState('Nagpur');
  const [pincode, setPincode] = useState('441105');
  const [dailyCapacity, setDailyCapacity] = useState('50');
  const [workingStart, setWorkingStart] = useState('08:00 AM');
  const [workingEnd, setWorkingEnd] = useState('06:00 PM');
  const [selectedCropIds, setSelectedCropIds] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const fetchCentres = () => {
    setLoading(true);
    Promise.all([api.getCentres(), api.getCrops()])
      .then(([centresData, cropsData]) => {
        setCentres(centresData);
        setCrops(cropsData);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCentres();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.createCentre({
        name,
        location,
        district,
        state: 'Maharashtra',
        pincode,
        dailyCapacity: Number(dailyCapacity),
        workingStart,
        workingEnd,
        cropIds: selectedCropIds,
      });
      setModalOpen(false);
      fetchCentres();
    } catch (err: any) {
      alert(err.message || 'Failed to create centre');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleCrop = (id: string) => {
    if (selectedCropIds.includes(id)) {
      setSelectedCropIds(selectedCropIds.filter((c) => c !== id));
    } else {
      setSelectedCropIds([...selectedCropIds, id]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-3xl border border-stone-200 shadow-xs">
        <div>
          <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block">
            Infrastructure Registry
          </span>
          <h1 className="text-2xl font-serif font-bold text-stone-900 mt-0.5">
            Procurement Centres
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Authorize state APMC procurement yards, assign intake commodities, and set weighbridge capacities.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold transition cursor-pointer self-start sm:self-auto shadow-xs"
        >
          <Plus className="w-4 h-4 text-amber-400" />
          <span>Register New Centre</span>
        </button>
      </div>

      {/* Centres List (Cards, NOT spreadsheet) */}
      <div className="space-y-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((n) => (
              <div key={n} className="h-32 bg-white rounded-2xl border border-stone-200 animate-pulse" />
            ))}
          </div>
        ) : (
          centres.map((c) => (
            <div
              key={c.id}
              className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-lg text-stone-900">{c.name}</h3>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                    {c.active ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                </div>

                <p className="text-xs text-stone-500 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{c.location}, {c.district}, {c.state} • Pincode: {c.pincode}</span>
                </p>

                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-xs text-stone-400 font-medium">Accepted Crops:</span>
                  {c.acceptedCrops?.map((cr: any) => (
                    <span
                      key={cr.id}
                      className="px-2 py-0.5 rounded bg-stone-100 text-stone-700 text-xs font-medium"
                    >
                      🌾 {cr.name}
                    </span>
                  ))}
                </div>
              </div>

              <div className="text-left md:text-right space-y-1">
                <div className="text-xs font-mono text-stone-600">
                  Hours: <strong>{c.workingStart} – {c.workingEnd}</strong>
                </div>
                <div className="text-xs text-stone-500">
                  Capacity: <strong>{c.dailyCapacity} vehicles/day</strong>
                </div>
                <div className="text-xs text-emerald-800 font-semibold">
                  Today&apos;s Active Queue: {c.todayQueueCount || 0}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal: Create New Centre */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-bold text-lg text-stone-900">Register Procurement Centre</h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg text-stone-400 hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Centre Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Umred APMC Procurement Centre"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Location / Tehsil</label>
                  <input
                    type="text"
                    required
                    placeholder="Umred Yard"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">District</label>
                  <input
                    type="text"
                    required
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Daily Cap</label>
                  <input
                    type="number"
                    required
                    value={dailyCapacity}
                    onChange={(e) => setDailyCapacity(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Start Time</label>
                  <input
                    type="text"
                    required
                    value={workingStart}
                    onChange={(e) => setWorkingStart(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">End Time</label>
                  <input
                    type="text"
                    required
                    value={workingEnd}
                    onChange={(e) => setWorkingEnd(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Accepted Crops</label>
                <div className="flex flex-wrap gap-2 pt-1">
                  {crops.map((cr) => (
                    <button
                      key={cr.id}
                      type="button"
                      onClick={() => toggleCrop(cr.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                        selectedCropIds.includes(cr.id)
                          ? 'bg-emerald-800 text-white'
                          : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                      }`}
                    >
                      🌾 {cr.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Register Centre'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
