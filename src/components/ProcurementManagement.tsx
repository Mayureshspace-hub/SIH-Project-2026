import React, { useState, useEffect } from 'react';
import {
  Scale,
  FileCheck,
  Plus,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Building,
  RefreshCw,
  X,
} from 'lucide-react';
import { procurementService, CentreProcurementRecord, CentreTokenEntry } from '../services/procurementService';

export const ProcurementManagement: React.FC = () => {
  const [records, setRecords] = useState<CentreProcurementRecord[]>([]);
  const [tokens, setTokens] = useState<CentreTokenEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSlipModal, setShowSlipModal] = useState(false);

  // Procurement slip input state
  const [selectedTokenNumber, setSelectedTokenNumber] = useState('');
  const [deliveredQuantity, setDeliveredQuantity] = useState('20');
  const [acceptedQuantity, setAcceptedQuantity] = useState('19.5');
  const [ratePerQuintal, setRatePerQuintal] = useState('2320'); // Standard MSP
  const [moisturePercentage, setMoisturePercentage] = useState('12.5');
  const [grade, setGrade] = useState('A');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [recData, tokData] = await Promise.all([
        procurementService.getProcurementRecords(),
        procurementService.getTokens(),
      ]);
      setRecords(recData);
      setTokens(tokData);
      const activeTok = tokData.find((t) => t.status === 'PROCESSING' || t.status === 'WAITING');
      if (activeTok) {
        setSelectedTokenNumber(activeTok.tokenNumber);
        setDeliveredQuantity(String(activeTok.quantity));
        setAcceptedQuantity(String(activeTok.quantity));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const selectedToken = tokens.find((t) => t.tokenNumber === selectedTokenNumber);
  const calculatedValuation = Math.round((Number(acceptedQuantity) || 0) * (Number(ratePerQuintal) || 0));

  const handleCreateRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedToken) {
      alert('Please select an active token from the queue');
      return;
    }

    await procurementService.createProcurementRecord({
      bookingId: selectedToken.bookingId,
      tokenNumber: selectedToken.tokenNumber,
      farmerName: selectedToken.farmerName,
      farmerId: selectedToken.farmerId,
      cropName: selectedToken.cropName,
      deliveredQuantity: Number(deliveredQuantity),
      acceptedQuantity: Number(acceptedQuantity),
      ratePerQuintal: Number(ratePerQuintal),
      moisturePercentage: Number(moisturePercentage),
      grade,
    });

    setShowSlipModal(false);
    fetchData();
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-stone-200/90 shadow-xs">
        <div>
          <span className="text-xs font-bold text-[#0f5e59] uppercase tracking-wider block">
            Weighment &amp; Intake Slips
          </span>
          <h1 className="text-2xl font-serif font-bold text-stone-900 mt-0.5">
            Procurement Management
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Log physical weighbridge gross/tare quantities, moisture grade, and sanctioned MSP value.
          </p>
        </div>

        <button
          onClick={() => setShowSlipModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0f5e59] hover:bg-[#0b4b47] text-white text-xs font-semibold shadow-sm transition cursor-pointer self-start sm:self-auto"
        >
          <Scale className="w-4 h-4" />
          <span>Issue Procurement Slip</span>
        </button>
      </div>

      {/* Procurement Slips Table */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-stone-900 font-serif">Logged Procurement Records</h2>
          <button onClick={fetchData} className="text-xs text-[#0f5e59] font-semibold flex items-center gap-1 cursor-pointer">
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Records</span>
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
                  <th className="py-3 px-4">Slip Date</th>
                  <th className="py-3 px-4">Token &amp; Farmer</th>
                  <th className="py-3 px-4">Crop Produce</th>
                  <th className="py-3 px-4">Weighed Qty</th>
                  <th className="py-3 px-4">Grade &amp; Moisture</th>
                  <th className="py-3 px-4">MSP Valuation</th>
                  <th className="py-3 px-4 text-right">Sanction Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {records.map((rec) => (
                  <tr key={rec.id} className="hover:bg-[#faf8f5]/60 transition">
                    <td className="py-4 px-4 font-mono text-stone-600">{rec.date}</td>
                    <td className="py-4 px-4">
                      <span className="font-mono font-bold text-[#0f5e59] block">{rec.tokenNumber}</span>
                      <strong className="text-stone-900 text-sm">{rec.farmerName}</strong>
                      <span className="text-[11px] text-stone-400 block font-mono">{rec.farmerId}</span>
                    </td>
                    <td className="py-4 px-4 font-semibold text-stone-800">{rec.cropName}</td>
                    <td className="py-4 px-4">
                      <span className="font-bold text-stone-900">{rec.acceptedQuantity} Qtl</span>
                      <span className="text-[11px] text-stone-400 block">(Delivered: {rec.deliveredQuantity} Qtl)</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-semibold text-stone-800">Grade {rec.grade}</span>
                      <span className="text-[11px] text-stone-500 block">Moisture: {rec.moisturePercentage}%</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-bold font-mono text-emerald-800 text-sm">
                        ₹{rec.totalValuation.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[11px] text-stone-400 block">@ ₹{rec.ratePerQuintal}/Qtl</span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{rec.status}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Procurement Slip Modal */}
      {showSlipModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-stone-200 relative">
            <button
              onClick={() => setShowSlipModal(false)}
              className="absolute top-5 right-5 text-stone-400 hover:text-stone-700"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2.5 mb-1">
              <Scale className="w-5 h-5 text-[#0f5e59]" />
              <h3 className="text-xl font-bold text-stone-900 font-serif">Enter Procurement Quantities</h3>
            </div>
            <p className="text-xs text-stone-500 mb-5">
              Record authenticated electronic scale weighment and moisture grading.
            </p>

            <form onSubmit={handleCreateRecord} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Select Active Token</label>
                <select
                  value={selectedTokenNumber}
                  onChange={(e) => {
                    setSelectedTokenNumber(e.target.value);
                    const t = tokens.find((tok) => tok.tokenNumber === e.target.value);
                    if (t) {
                      setDeliveredQuantity(String(t.quantity));
                      setAcceptedQuantity(String(t.quantity));
                    }
                  }}
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl bg-[#faf8f5] font-semibold"
                >
                  {tokens.map((t) => (
                    <option key={t.id} value={t.tokenNumber}>
                      {t.tokenNumber} &ndash; {t.farmerName} ({t.quantity} Qtl {t.cropName})
                    </option>
                  ))}
                </select>
              </div>

              {selectedToken && (
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-stone-800 text-[11px] space-y-1">
                  <p>Farmer: <strong>{selectedToken.farmerName}</strong> &bull; ID: <strong>{selectedToken.farmerId}</strong></p>
                  <p>Crop: <strong>{selectedToken.cropName}</strong> &bull; Slot: <strong>{selectedToken.slotTime}</strong></p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Delivered Gross (Quintals)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={deliveredQuantity}
                    onChange={(e) => setDeliveredQuantity(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl bg-[#faf8f5]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Accepted Net (Quintals)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={acceptedQuantity}
                    onChange={(e) => setAcceptedQuantity(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl bg-[#faf8f5]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">MSP Rate (₹/Qtl)</label>
                  <input
                    type="number"
                    required
                    value={ratePerQuintal}
                    onChange={(e) => setRatePerQuintal(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl bg-[#faf8f5]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Moisture (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={moisturePercentage}
                    onChange={(e) => setMoisturePercentage(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl bg-[#faf8f5]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Assessed Grade</label>
                  <select
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl bg-[#faf8f5]"
                  >
                    <option value="A">Grade A</option>
                    <option value="B">Grade B</option>
                    <option value="FAQ">FAQ Standard</option>
                  </select>
                </div>
              </div>

              {/* Total Valuation preview */}
              <div className="bg-[#faf8f5] p-3.5 rounded-xl border border-stone-200 flex items-center justify-between">
                <span className="text-stone-600 font-semibold">Total Official Valuation:</span>
                <span className="text-base font-bold font-mono text-emerald-800">
                  ₹{calculatedValuation.toLocaleString('en-IN')}
                </span>
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-3 bg-[#0f5e59] hover:bg-[#0b4b47] text-white rounded-xl font-semibold shadow-sm transition cursor-pointer"
              >
                Sign &amp; Issue Procurement Record
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
