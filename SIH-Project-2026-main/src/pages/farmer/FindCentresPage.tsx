import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  MapPin,
  Clock,
  Sprout,
  Users,
  ChevronRight,
  CalendarCheck,
  Compass
} from 'lucide-react';
import { api } from '../../services/api';
import { ProcurementCentre, Crop } from '../../types';

export const FindCentresPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialCrop = searchParams.get('cropId') || 'all';

  const [centres, setCentres] = useState<ProcurementCentre[]>([]);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [selectedCropId, setSelectedCropId] = useState<string>(initialCrop);
  const [searchQuery, setSearchQuery] = useState('');
  const [method, setMethod] = useState<'nearby' | 'crop'>('nearby');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getCentres(), api.getCrops()])
      .then(([centresData, cropsData]) => {
        setCentres(centresData);
        setCrops(cropsData);
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredCentres = centres.filter((centre) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      centre.name.toLowerCase().includes(query) ||
      centre.location.toLowerCase().includes(query) ||
      centre.district.toLowerCase().includes(query);

    if (!matchesSearch) return false;

    if (selectedCropId === 'all') return true;

    return centre.acceptedCrops?.some((c) => c.id === selectedCropId);
  });

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
          Centre Discovery
        </span>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 mt-0.5">
          Find Procurement Centre
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          Discover authorized state APMC centres by proximity or filter directly by your harvest produce.
        </p>
      </div>

      {/* Discovery Mode Switcher: Method A vs Method B (Section 9) */}
      <div className="flex items-center gap-2 p-1.5 bg-stone-200/70 rounded-2xl w-fit">
        <button
          onClick={() => {
            setMethod('nearby');
            setSelectedCropId('all');
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
            method === 'nearby'
              ? 'bg-white text-emerald-950 shadow-xs'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <Compass className="w-3.5 h-3.5 text-emerald-700" />
          <span>Method A — Nearby Centres</span>
        </button>

        <button
          onClick={() => setMethod('crop')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
            method === 'crop'
              ? 'bg-white text-emerald-950 shadow-xs'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <Sprout className="w-3.5 h-3.5 text-emerald-700" />
          <span>Method B — Search By Crop</span>
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by centre name, location, or district..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-600"
          />
        </div>

        {/* Method B Crop Selector */}
        <div className="w-full sm:w-auto flex items-center gap-2">
          <Filter className="w-4 h-4 text-emerald-800 shrink-0" />
          <span className="text-xs font-semibold text-stone-700 shrink-0">Filter by Crop:</span>
          <select
            value={selectedCropId}
            onChange={(e) => setSelectedCropId(e.target.value)}
            className="w-full sm:w-56 py-2 px-3 text-xs font-medium bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-600"
          >
            <option value="all">🌾 All Crops Accepted</option>
            {crops.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.category})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Vertical Cards List (Section 9 & 32) */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white p-6 rounded-2xl border border-stone-200 animate-pulse h-36" />
          ))}
        </div>
      ) : filteredCentres.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-stone-200">
          <p className="text-sm font-semibold text-stone-700">No procurement centres matching criteria</p>
          <p className="text-xs text-stone-400 mt-1">Try selecting another crop or clearing search.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCentres.map((centre) => (
            <div
              key={centre.id}
              className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-6 hover:border-emerald-600 transition flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-xs"
            >
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-bold text-base sm:text-lg text-stone-900">{centre.name}</h3>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                    {centre.active ? 'Open Today' : 'Closed'}
                  </span>
                  <span className="text-xs text-stone-500 font-mono">
                    {centre.workingStart} – {centre.workingEnd}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-stone-500">
                  <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <span>{centre.location}, {centre.district}</span>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-xs text-stone-400 font-medium">Accepted Crops:</span>
                  {centre.acceptedCrops?.map((c) => (
                    <span
                      key={c.id}
                      className={`text-xs px-2.5 py-0.5 rounded-md font-medium ${
                        selectedCropId === c.id
                          ? 'bg-emerald-800 text-white'
                          : 'bg-stone-100 text-stone-700 border border-stone-200'
                      }`}
                    >
                      🌾 {c.name}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-4 pt-3 md:pt-0 border-t md:border-t-0 border-stone-100">
                <div className="text-left md:text-right">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-stone-600">
                    <Users className="w-3.5 h-3.5 text-amber-600" />
                    <span>Today&apos;s Queue:</span>
                    <strong className="text-stone-900 font-mono text-sm">{centre.todayQueueCount || 0} farmers</strong>
                  </div>
                  <p className="text-[11px] text-stone-400 mt-0.5">
                    Available Slots: <strong>{centre.availableSlotsCount || 5} windows</strong>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    to={`/farmer/centres/${centre.id}`}
                    className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 transition"
                  >
                    <span>Details</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>

                  <Link
                    to={`/farmer/book-slot?centreId=${centre.id}${selectedCropId !== 'all' ? `&cropId=${selectedCropId}` : ''}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 transition shadow-xs"
                  >
                    <CalendarCheck className="w-3.5 h-3.5" />
                    <span>Book Slot</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
