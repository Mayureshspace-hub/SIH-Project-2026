import React, { useState, useEffect } from 'react';
import {
  ListOrdered,
  Radio,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  Truck,
  ArrowRight,
  RefreshCw,
  X,
  Phone,
} from 'lucide-react';
import { procurementService, CentreTokenEntry } from '../services/procurementService';

export const TokenManagement: React.FC = () => {
  const [tokens, setTokens] = useState<CentreTokenEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGenerateModal, setShowGenerateModal] = useState(false);

  // Form state
  const [farmerName, setFarmerName] = useState('');
  const [farmerId, setFarmerId] = useState('');
  const [mobile, setMobile] = useState('');
  const [cropName, setCropName] = useState('Paddy (Dhan Grade-A)');
  const [quantity, setQuantity] = useState(15);
  const [slotDate, setSlotDate] = useState('2026-11-08');
  const [slotTime, setSlotTime] = useState('09:00 - 11:00');

  const fetchTokens = async () => {
    setLoading(true);
    try {
      const data = await procurementService.getTokens();
      setTokens(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTokens();
  }, []);

  const handleUpdateStatus = async (tokenId: string, status: CentreTokenEntry['status']) => {
    await procurementService.updateTokenStatus(tokenId, status);
    fetchTokens();
  };

  const handleGenerateToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!farmerName) return;

    await procurementService.generateToken({
      farmerName,
      farmerId: farmerId || `MH-NAG-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      mobile: mobile || '+91 98000 00000',
      cropName,
      quantity: Number(quantity) || 10,
      slotDate,
      slotTime,
    });

    setShowGenerateModal(false);
    setFarmerName('');
    setFarmerId('');
    setMobile('');
    fetchTokens();
  };

  const waitingCount = tokens.filter((t) => t.status === 'WAITING').length;
  const processingCount = tokens.filter((t) => t.status === 'PROCESSING').length;
  const completedCount = tokens.filter((t) => t.status === 'COMPLETED').length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-stone-200/90 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-xs font-bold text-[#0f5e59] uppercase tracking-wider">
              Weighbridge Live Queue
            </span>
          </div>
          <h1 className="text-2xl font-serif font-bold text-stone-900">
            Token &amp; Queue Management
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Real-time gate token orchestration, arrival check-in, and weighbridge calling.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowGenerateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0f5e59] hover:bg-[#0b4b47] text-white text-xs font-semibold shadow-sm transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Generate / Assign Token</span>
          </button>
        </div>
      </div>

      {/* Queue Status Chips */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wide">Waiting in Yard</span>
            <p className="text-2xl font-mono font-bold text-amber-950 mt-1">{waitingCount} Tractors</p>
          </div>
          <Clock className="w-8 h-8 text-amber-600 opacity-80" />
        </div>

        <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-[#0f5e59] uppercase tracking-wide">On Weighbridge</span>
            <p className="text-2xl font-mono font-bold text-emerald-950 mt-1">{processingCount} Active</p>
          </div>
          <Radio className="w-8 h-8 text-[#0f5e59] animate-pulse opacity-80" />
        </div>

        <div className="bg-stone-100 border border-stone-200 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-stone-600 uppercase tracking-wide">Completed Today</span>
            <p className="text-2xl font-mono font-bold text-stone-900 mt-1">{completedCount} Finished</p>
          </div>
          <CheckCircle2 className="w-8 h-8 text-stone-500 opacity-80" />
        </div>
      </div>

      {/* Tokens List Table */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-stone-900 font-serif">Today&apos;s Active Token Queue</h2>
          <button onClick={fetchTokens} className="text-xs text-[#0f5e59] font-semibold flex items-center gap-1 cursor-pointer">
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Queue</span>
          </button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-[#faf8f5] rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-700">
              <thead className="bg-[#faf8f5] text-stone-600 font-bold uppercase tracking-wider text-[11px] border-b border-stone-200">
                <tr>
                  <th className="py-3 px-4">Token #</th>
                  <th className="py-3 px-4">Farmer Details</th>
                  <th className="py-3 px-4">Produce &amp; Quantity</th>
                  <th className="py-3 px-4">Slot Window</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Update Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {tokens.map((token) => (
                  <tr
                    key={token.id}
                    className={`transition ${
                      token.status === 'PROCESSING'
                        ? 'bg-emerald-50/50'
                        : token.status === 'WAITING'
                        ? 'bg-amber-50/30'
                        : 'hover:bg-[#faf8f5]/60'
                    }`}
                  >
                    <td className="py-4 px-4">
                      <span className="font-mono font-bold text-sm text-[#0f5e59] block">
                        {token.tokenNumber}
                      </span>
                      {token.checkedInAt && (
                        <span className="text-[10px] text-stone-400">Arrived: {token.checkedInAt}</span>
                      )}
                    </td>

                    <td className="py-4 px-4">
                      <strong className="text-stone-900 text-sm block">{token.farmerName}</strong>
                      <span className="text-[11px] text-stone-500 font-mono">{token.farmerId} &bull; {token.mobile}</span>
                    </td>

                    <td className="py-4 px-4">
                      <span className="font-semibold text-stone-800">{token.quantity} Quintals</span>
                      <span className="text-[11px] text-stone-500 block">{token.cropName}</span>
                    </td>

                    <td className="py-4 px-4 text-stone-600">
                      <span>{token.slotDate}</span>
                      <span className="text-[11px] text-stone-400 block">{token.slotTime}</span>
                    </td>

                    <td className="py-4 px-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          token.status === 'PROCESSING'
                            ? 'bg-emerald-600 text-white animate-pulse'
                            : token.status === 'WAITING'
                            ? 'bg-amber-100 text-amber-900'
                            : token.status === 'CALLED'
                            ? 'bg-orange-100 text-orange-900'
                            : token.status === 'COMPLETED'
                            ? 'bg-stone-100 text-stone-700'
                            : 'bg-stone-100 text-stone-600'
                        }`}
                      >
                        {token.status}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5 flex-wrap">
                        {token.status === 'BOOKED' && (
                          <button
                            onClick={() => handleUpdateStatus(token.id, 'WAITING')}
                            className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[11px] font-semibold transition cursor-pointer"
                          >
                            Mark Arrived
                          </button>
                        )}

                        {token.status === 'WAITING' && (
                          <button
                            onClick={() => handleUpdateStatus(token.id, 'PROCESSING')}
                            className="px-2.5 py-1 bg-[#0f5e59] hover:bg-[#0b4b47] text-white rounded-lg text-[11px] font-semibold transition cursor-pointer"
                          >
                            Call to Weighbridge
                          </button>
                        )}

                        {token.status === 'PROCESSING' && (
                          <button
                            onClick={() => handleUpdateStatus(token.id, 'COMPLETED')}
                            className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-[11px] font-semibold transition cursor-pointer"
                          >
                            Mark Completed
                          </button>
                        )}

                        {token.status === 'COMPLETED' && (
                          <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1 justify-end">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Done
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Generate Token Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 relative">
            <button
              onClick={() => setShowGenerateModal(false)}
              className="absolute top-5 right-5 text-stone-400 hover:text-stone-700"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold text-stone-900 font-serif mb-1">Generate Gate Token</h3>
            <p className="text-xs text-stone-500 mb-5">Assign an immediate operational token to an arriving farmer.</p>

            <form onSubmit={handleGenerateToken} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Farmer Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Balasaheb Thorat"
                  value={farmerName}
                  onChange={(e) => setFarmerName(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl bg-[#faf8f5] focus:outline-none focus:border-[#0f8a6a]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Mobile Number</label>
                  <input
                    type="tel"
                    placeholder="+91 98000 00000"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl bg-[#faf8f5]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Quantity (Quintals)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl bg-[#faf8f5]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Crop Variety</label>
                <select
                  value={cropName}
                  onChange={(e) => setCropName(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl bg-[#faf8f5]"
                >
                  <option value="Paddy (Dhan Grade-A)">Paddy (Dhan Grade-A)</option>
                  <option value="Soybean (JS-335)">Soybean (JS-335)</option>
                  <option value="Cotton (Medium Staple)">Cotton (Medium Staple)</option>
                  <option value="Bengal Gram (Chana)">Bengal Gram (Chana)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-3 bg-[#0f5e59] hover:bg-[#0b4b47] text-white rounded-xl font-semibold shadow-sm transition cursor-pointer"
              >
                Issue Digital Token
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
