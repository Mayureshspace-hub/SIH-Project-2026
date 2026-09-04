import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  MapPin,
  Clock,
  Sprout,
  Users,
  CalendarCheck,
  CheckCircle2,
  ArrowLeft,
  Gauge
} from 'lucide-react';
import { api } from '../../services/api';

export const CentreDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [centre, setCentre] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      api.getCentre(id)
        .then((res) => setCentre(res))
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) {
    return <div className="bg-white p-8 rounded-2xl border border-stone-200 animate-pulse h-64" />;
  }

  if (!centre) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-stone-200 text-center">
        <p className="text-sm font-semibold text-stone-700">Procurement centre not found.</p>
        <Link to="/farmer/centres" className="mt-2 inline-block text-xs text-emerald-800 font-bold underline">
          &larr; Back to directory
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        to="/farmer/centres"
        className="inline-flex items-center gap-1 text-xs font-semibold text-stone-500 hover:text-emerald-800 transition"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Procurement Centres</span>
      </Link>

      <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                {centre.active ? 'Open Today' : 'Closed'}
              </span>
              <span className="text-xs text-stone-500 font-mono">Pincode: {centre.pincode}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
              {centre.name}
            </h1>
            <p className="text-xs text-stone-500 mt-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-700" />
              <span>{centre.location}, {centre.district}, {centre.state}</span>
            </p>
          </div>

          <Link
            to={`/farmer/book-slot?centreId=${centre.id}`}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold transition shadow-xs shrink-0"
          >
            <CalendarCheck className="w-4 h-4" />
            <span>Book a Slot</span>
          </Link>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-b border-stone-100">
          <div className="bg-stone-50 p-4 rounded-xl border border-stone-200">
            <span className="block text-[11px] text-stone-500 font-medium">Working Hours</span>
            <strong className="text-sm font-bold text-stone-900 font-mono mt-0.5 block">
              {centre.workingStart} – {centre.workingEnd}
            </strong>
          </div>

          <div className="bg-stone-50 p-4 rounded-xl border border-stone-200">
            <span className="block text-[11px] text-stone-500 font-medium">Current Live Queue</span>
            <strong className="text-sm font-bold text-emerald-800 font-mono mt-0.5 block">
              {centre.currentQueueCount || 0} farmers
            </strong>
          </div>

          <div className="bg-stone-50 p-4 rounded-xl border border-stone-200">
            <span className="block text-[11px] text-stone-500 font-medium">Daily Capacity</span>
            <strong className="text-sm font-bold text-stone-900 font-mono mt-0.5 block">
              {centre.dailyCapacity} max/day
            </strong>
          </div>

          <div className="bg-stone-50 p-4 rounded-xl border border-stone-200">
            <span className="block text-[11px] text-stone-500 font-medium">Processing Rate</span>
            <strong className="text-sm font-bold text-stone-900 font-mono mt-0.5 block">
              ~{centre.averageProcessingMinutes}m base
            </strong>
          </div>
        </div>

        {/* Accepted Crops */}
        <div className="pt-6">
          <h3 className="text-xs font-bold text-stone-700 uppercase tracking-wide mb-3">
            Accepted Crops at this Centre
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {centre.acceptedCrops?.map((crop: any) => (
              <div
                key={crop.id}
                className="flex items-center justify-between p-3.5 rounded-xl border border-emerald-100 bg-emerald-50/40"
              >
                <div className="flex items-center gap-2.5">
                  <Sprout className="w-4 h-4 text-emerald-700" />
                  <div>
                    <p className="text-sm font-bold text-stone-900">{crop.name}</p>
                    <p className="text-[11px] text-stone-500">{crop.category}</p>
                  </div>
                </div>
                {crop.indicativeMsp && (
                  <div className="text-right">
                    <span className="text-[10px] text-stone-400 block">Indicative MSP</span>
                    <span className="text-xs font-mono font-bold text-emerald-800">
                      ₹{crop.indicativeMsp}/qtl
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
