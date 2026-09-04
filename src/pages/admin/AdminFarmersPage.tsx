import React, { useState, useEffect } from 'react';
import { Users, Search, MapPin, CheckCircle2, Shield } from 'lucide-react';
import { api } from '../../services/api';

export const AdminFarmersPage: React.FC = () => {
  const [farmers, setFarmers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getFarmers()
      .then((res) => setFarmers(res))
      .finally(() => setLoading(false));
  }, []);

  const filtered = farmers.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    f.farmerId.toLowerCase().includes(search.toLowerCase()) ||
    f.district.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-3xl border border-stone-200 shadow-xs">
        <div>
          <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block">
            State Registry
          </span>
          <h1 className="text-2xl font-serif font-bold text-stone-900 mt-0.5">
            Farmers Master Roster
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Registered agricultural producers across Maharashtra APMC jurisdiction.
          </p>
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by farmer name, ID, or district..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-amber-600"
          />
        </div>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-28 bg-white rounded-2xl border border-stone-200 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-3xl border border-stone-200">
            <p className="text-sm font-semibold text-stone-700">No farmers found matching query</p>
          </div>
        ) : (
          filtered.map((f) => (
            <div
              key={f.id}
              className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base text-stone-900">{f.name}</h3>
                  <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-stone-100 text-stone-700">
                    {f.farmerId}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    VERIFIED 7/12
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-stone-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                    {f.village}, {f.district}
                  </span>
                  <span>📱 {f.mobile}</span>
                  <span>🌱 {f.landArea} Acres</span>
                </div>
              </div>

              <div className="text-left md:text-right">
                <span className="text-[11px] text-stone-400 block">DBT Beneficiary Link</span>
                <span className="text-xs font-mono font-semibold text-stone-800">
                  SBI •••• 4921 (Aadhaar Seeded)
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
