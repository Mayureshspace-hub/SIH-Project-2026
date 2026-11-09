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
  Shield,
  Gauge
} from 'lucide-react';
import { api } from '../../services/api';
import { ProcurementCentre } from '../../types';

export const PublicCentreDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [centre, setCentre] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      api.getCentre(id)
        .then((res) => setCentre(res))
        .finally(() => setIsLoading(false));
    }
  }, [id]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="bg-white p-8 rounded-2xl border border-stone-200 animate-pulse h-64" />
      </div>
    );
  }

  if (!centre) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-stone-900">Procurement Centre Not Found</h2>
        <Link to="/centres" className="mt-4 inline-block text-emerald-700 text-sm font-semibold underline">
          &larr; Back to all centres
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-stone-50 py-10 md:py-16 text-stone-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <Link
          to="/centres"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-emerald-800 transition mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Centres Directory</span>
        </Link>

        {/* Main Details Card */}
        <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-100">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                  {centre.active ? 'Operational Today' : 'Closed'}
                </span>
                <span className="text-xs text-stone-500 font-mono">Pincode: {centre.pincode}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
                {centre.name}
              </h1>
              <div className="flex items-center gap-1.5 text-xs text-stone-500 mt-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span>{centre.location}, {centre.district}, {centre.state}</span>
              </div>
            </div>

            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-800 text-white text-sm font-semibold hover:bg-emerald-900 transition shadow-sm shrink-0"
            >
              <CalendarCheck className="w-4 h-4" />
              <span>Book a Slot</span>
            </Link>
          </div>

          {/* Operational Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-b border-stone-100">
            <div className="bg-stone-50 p-4 rounded-xl border border-stone-200">
              <span className="block text-xs text-stone-500 font-medium">Working Hours</span>
              <strong className="text-sm font-bold text-stone-900 font-mono mt-1 block">
                {centre.workingStart} – {centre.workingEnd}
              </strong>
            </div>

            <div className="bg-stone-50 p-4 rounded-xl border border-stone-200">
              <span className="block text-xs text-stone-500 font-medium">Daily Capacity</span>
              <strong className="text-sm font-bold text-stone-900 font-mono mt-1 block">
                {centre.dailyCapacity} farmers/day
              </strong>
            </div>

            <div className="bg-stone-50 p-4 rounded-xl border border-stone-200">
              <span className="block text-xs text-stone-500 font-medium">Current Live Queue</span>
              <strong className="text-sm font-bold text-emerald-800 font-mono mt-1 block">
                {centre.currentQueueCount || 0} waiting
              </strong>
            </div>

            <div className="bg-stone-50 p-4 rounded-xl border border-stone-200">
              <span className="block text-xs text-stone-500 font-medium">Processing Factor</span>
              <strong className="text-sm font-bold text-stone-900 font-mono mt-1 block">
                ~{centre.averageProcessingMinutes}m + {centre.quantityProcessingFactor}m/qtl
              </strong>
            </div>
          </div>

          {/* Accepted Crops Section */}
          <div className="pt-6">
            <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wide mb-3">
              Currently Accepted Crops
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {centre.acceptedCrops?.map((crop: any) => (
                <div
                  key={crop.id}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-emerald-100 bg-emerald-50/50"
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
    </div>
  );
};
