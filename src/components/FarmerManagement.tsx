import React, { useState, useEffect } from 'react';
import { Users, Search, Phone, MapPin, Calendar, Clock, Eye, X, CheckCircle2 } from 'lucide-react';
import { procurementService, CentreFarmer } from '../services/procurementService';

export const FarmerManagement: React.FC = () => {
  const [farmers, setFarmers] = useState<CentreFarmer[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedFarmer, setSelectedFarmer] = useState<CentreFarmer | null>(null);

  const fetchFarmers = async () => {
    setLoading(true);
    try {
      const data = await procurementService.getFarmers();
      setFarmers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFarmers();
  }, []);

  const filtered = farmers.filter(
    (f) =>
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.farmerId.toLowerCase().includes(search.toLowerCase()) ||
      f.village.toLowerCase().includes(search.toLowerCase()) ||
      f.cropName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-stone-200/90 shadow-xs">
        <div>
          <span className="text-xs font-bold text-[#0f5e59] uppercase tracking-wider block">
            Centre Registry
          </span>
          <h1 className="text-2xl font-serif font-bold text-stone-900 mt-0.5">
            Farmer Management
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Registered farmers associated with this procurement centre and their booking history.
          </p>
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by name, ID, village or crop..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-[#faf8f5] border border-stone-200 rounded-xl focus:outline-none focus:border-[#0f8a6a]"
          />
        </div>
      </div>

      {/* Farmers Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-44 bg-white rounded-2xl border border-stone-200 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-3xl border border-stone-200">
          <p className="text-sm font-semibold text-stone-700">No matching farmers found</p>
          <p className="text-xs text-stone-500 mt-1">Try searching with a different name, village or crop.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((farmer) => (
            <div
              key={farmer.id}
              className="bg-white rounded-2xl p-5 border border-stone-200/80 hover:border-[#0f5e59]/60 hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <h3 className="text-base font-bold text-stone-900">{farmer.name}</h3>
                    <span className="text-[11px] font-mono text-[#0f5e59] font-bold block mt-0.5">
                      {farmer.farmerId}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-[#0f5e59]">
                    {farmer.cropName.split(' ')[0]}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-stone-600 mb-4">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    <span>{farmer.mobile}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    <span>{farmer.village}, {farmer.district}</span>
                  </div>
                  <div className="text-[11px] text-stone-500 pt-1">
                    Land: <strong>{farmer.landArea} Acres</strong> &bull; Crop: <strong>{farmer.cropName}</strong>
                  </div>
                </div>
              </div>

              {farmer.latestBooking ? (
                <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                  <div className="text-[11px]">
                    <span className="text-stone-500">Active Token: </span>
                    <strong className="text-stone-900 font-mono font-bold">{farmer.latestBooking.tokenNumber}</strong>
                  </div>
                  <button
                    onClick={() => setSelectedFarmer(farmer)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#faf8f5] hover:bg-emerald-50 text-stone-700 hover:text-[#0f5e59] text-xs font-semibold border border-stone-200 transition cursor-pointer"
                  >
                    <Eye className="w-3 h-3" />
                    <span>View Booking</span>
                  </button>
                </div>
              ) : (
                <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-400">
                  <span>No active booking today</span>
                  <button
                    onClick={() => setSelectedFarmer(farmer)}
                    className="text-stone-500 hover:text-stone-800 text-[11px] font-semibold"
                  >
                    Details &rarr;
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Farmer Booking Detail Modal */}
      {selectedFarmer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-stone-200 relative">
            <button
              onClick={() => setSelectedFarmer(null)}
              className="absolute top-5 right-5 p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-[#0f5e59] flex items-center justify-center font-bold text-lg">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-stone-900">{selectedFarmer.name}</h3>
                <p className="text-xs text-stone-500 font-mono">{selectedFarmer.farmerId}</p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-stone-700 bg-[#faf8f5] p-4 rounded-2xl border border-stone-200 mb-5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-stone-500 block text-[11px]">Mobile Number</span>
                  <strong className="text-stone-900">{selectedFarmer.mobile}</strong>
                </div>
                <div>
                  <span className="text-stone-500 block text-[11px]">Registered Date</span>
                  <strong className="text-stone-900">{selectedFarmer.registeredDate}</strong>
                </div>
                <div>
                  <span className="text-stone-500 block text-[11px]">Village &amp; Tehsil</span>
                  <strong className="text-stone-900">{selectedFarmer.village}</strong>
                </div>
                <div>
                  <span className="text-stone-500 block text-[11px]">District</span>
                  <strong className="text-stone-900">{selectedFarmer.district}</strong>
                </div>
                <div>
                  <span className="text-stone-500 block text-[11px]">Cultivable Land</span>
                  <strong className="text-stone-900">{selectedFarmer.landArea} Acres</strong>
                </div>
                <div>
                  <span className="text-stone-500 block text-[11px]">Reported Crop</span>
                  <strong className="text-stone-900">{selectedFarmer.cropName}</strong>
                </div>
              </div>
            </div>

            {selectedFarmer.latestBooking ? (
              <div className="border border-emerald-200 bg-emerald-50/70 p-4 rounded-2xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[#0f5e59] uppercase tracking-wide">
                    Individual Booking Details
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#0f5e59] text-white">
                    {selectedFarmer.latestBooking.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-stone-800">
                  <p>Token: <strong className="font-mono">{selectedFarmer.latestBooking.tokenNumber}</strong></p>
                  <p>Estimated Produce: <strong>{selectedFarmer.latestBooking.quantity} Quintals</strong></p>
                  <p>Slot Date: <strong>{selectedFarmer.latestBooking.slotDate}</strong></p>
                  <p>Time Window: <strong>{selectedFarmer.latestBooking.slotTime}</strong></p>
                </div>
              </div>
            ) : (
              <div className="p-4 text-center text-xs text-stone-500 bg-stone-50 rounded-2xl">
                No active booking record for today.
              </div>
            )}

            <button
              onClick={() => setSelectedFarmer(null)}
              className="w-full mt-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold transition cursor-pointer"
            >
              Close Record
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
