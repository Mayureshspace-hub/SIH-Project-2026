import React, { useState, useEffect } from 'react';
import { Users, Search, MapPin, Phone, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api';
import { useSocket } from '../../context/SocketContext';

export const OperatorFarmersPage: React.FC = () => {
  const { lastFirestoreUpdate } = useSocket();
  const [farmers, setFarmers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (lastFirestoreUpdate && !['farmers', 'bookings'].includes(lastFirestoreUpdate.collection)) return;
    api.getFarmers()
      .then((res) => setFarmers(res))
      .finally(() => setLoading(false));
  }, [lastFirestoreUpdate?.timestamp]);

  const filtered = farmers.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    f.village.toLowerCase().includes(search.toLowerCase()) ||
    f.farmerId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
            Tehsil Roster
          </span>
          <h1 className="text-2xl font-serif font-bold text-slate-900 mt-0.5">
            Registered Farmers
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Farmers within Parseoni Tehsil registered for government procurement.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search farmer name, ID, or village..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600"
          />
        </div>
      </div>

      {/* Farmers Cards (Card format, NOT spreadsheet) */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-24 bg-white rounded-2xl border border-slate-200 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-3xl border border-slate-200">
          <p className="text-sm font-semibold text-slate-700">No matching farmers found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((farmer) => (
            <div
              key={farmer.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base text-slate-900">{farmer.name}</h3>
                  <span className="font-mono text-xs text-slate-500 px-2 py-0.5 rounded bg-slate-100">
                    {farmer.farmerId}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    KYC OK
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                    {farmer.village}, {farmer.district}
                  </span>
                  <span>📱 {farmer.mobile}</span>
                  <span>🌱 {farmer.landArea} Acres</span>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-[11px] text-slate-400 block">Bank Account</span>
                <span className="text-xs font-mono font-semibold text-slate-800">
                  SBI •••• 4921 (Aadhaar Verified)
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
