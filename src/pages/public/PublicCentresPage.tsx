import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  MapPin,
  Clock,
  Sprout,
  Users,
  ChevronRight,
  Filter,
  CheckCircle2,
  CalendarCheck
} from 'lucide-react';
import { api } from '../../services/api';
import { ProcurementCentre, Crop } from '../../types';

export const PublicCentresPage: React.FC = () => {
  const [centres, setCentres] = useState<ProcurementCentre[]>([]);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [selectedCropId, setSelectedCropId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getCentres(), api.getCrops()])
      .then(([centresData, cropsData]) => {
        setCentres(centresData);
        setCrops(cropsData);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const filteredCentres = centres.filter((centre) => {
    const matchesSearch =
      centre.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      centre.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      centre.district.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (selectedCropId === 'all') return true;

    return centre.acceptedCrops?.some((c) => c.id === selectedCropId);
  });

  return (
    <div className="bg-stone-50 py-10 md:py-16 text-stone-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block mb-1">
            Directory &amp; Intake Status
          </span>
          <h1 className="text-3xl font-serif font-bold text-emerald-950">
            Procurement Centres
          </h1>
          <p className="mt-1 text-sm text-stone-600">
            Find nearby state APMC hubs, check today&apos;s queue length, and verify which crops are currently accepted.
          </p>
        </div>

        {/* Filters & Search - Method A & Method B */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search by centre name, tehsil, or district..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-600"
            />
          </div>

          {/* Method B: Crop Selection Filter */}
          <div className="w-full md:w-auto flex items-center gap-2">
            <Filter className="w-4 h-4 text-emerald-800 shrink-0" />
            <span className="text-xs font-semibold text-stone-700 shrink-0">Accepted Crop:</span>
            <select
              value={selectedCropId}
              onChange={(e) => setSelectedCropId(e.target.value)}
              className="flex-1 md:w-56 py-2 px-3 text-xs font-medium bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-600 text-stone-800"
            >
              <option value="all">🌾 All Crops Accepted</option>
              {crops.map((cr) => (
                <option key={cr.id} value={cr.id}>
                  {cr.name} ({cr.category})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Centres Vertical Cards List (No Spreadsheet Tables!) */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white p-6 rounded-2xl border border-stone-200 animate-pulse h-36" />
            ))}
          </div>
        ) : filteredCentres.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-stone-200">
            <p className="text-base font-semibold text-stone-700">No matching procurement centres found</p>
            <p className="text-xs text-stone-500 mt-1">Try choosing another crop or clearing the search query.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCropId('all');
              }}
              className="mt-4 px-4 py-2 rounded-lg bg-emerald-800 text-white text-xs font-semibold"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredCentres.map((centre) => (
              <div
                key={centre.id}
                className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-6 hover:border-emerald-600 hover:shadow-xs transition flex flex-col md:flex-row md:items-center justify-between gap-5"
              >
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-lg text-stone-900">{centre.name}</h3>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                      {centre.active ? 'Open Today' : 'Closed'}
                    </span>
                    <span className="text-xs text-stone-500 font-mono">
                      {centre.workingStart} – {centre.workingEnd}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-stone-500">
                    <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                    <span>{centre.location}, {centre.district}, {centre.state}</span>
                  </div>

                  {/* Accepted Crops Badges */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-xs text-stone-400 font-medium mr-1">Crops:</span>
                    {centre.acceptedCrops && centre.acceptedCrops.length > 0 ? (
                      centre.acceptedCrops.map((c) => (
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
                      ))
                    ) : (
                      <span className="text-xs text-stone-400">Paddy, Soybean</span>
                    )}
                  </div>
                </div>

                <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-4 pt-3 md:pt-0 border-t md:border-t-0 border-stone-100">
                  <div className="text-left md:text-right">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-stone-600">
                      <Users className="w-3.5 h-3.5 text-amber-600" />
                      <span>Today&apos;s Active Queue:</span>
                      <strong className="text-stone-900 font-mono text-sm">{centre.todayQueueCount || 0}</strong>
                    </div>
                    <p className="text-[11px] text-stone-400 mt-0.5">
                      Capacity: {centre.dailyCapacity} farmers/day
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      to={`/centres/${centre.id}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 transition"
                    >
                      <span>View Details</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>

                    <Link
                      to="/login"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 transition shadow-2xs"
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
    </div>
  );
};
