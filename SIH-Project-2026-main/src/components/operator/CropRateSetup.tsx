import React, { useEffect, useState } from 'react';
import { Save, Sprout } from 'lucide-react';
import { api } from '../../services/api';

interface CropRateSetupProps {
  centreId: string;
  crops: any[];
}

export const CropRateSetup: React.FC<CropRateSetupProps> = ({ centreId, crops }) => {
  const [rates, setRates] = useState<Record<string, string>>(() => {
    return crops.reduce((acc, crop) => ({ ...acc, [crop.id]: crop.rate == null ? '' : String(crop.rate) }), {});
  });
  const [savedRates, setSavedRates] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getCentreCrops(centreId).then((records) => {
      const values = Object.fromEntries(records.filter((crop: any) => crop.rate != null).map((crop: any) => [crop.id, String(crop.rate)]));
      setRates((current) => ({ ...current, ...values }));
      setSavedRates(values);
    }).catch((err: any) => setError(err.message || 'Could not load saved crop rates'));
  }, [centreId]);

  const handleRateChange = (cropId: string, value: string) => {
    setRates((prev) => ({ ...prev, [cropId]: value }));
  };

  const handleSave = async (cropId: string) => {
    setError(null);
    try {
      const rate = Number(rates[cropId]);
      await api.updateCentreCropRate(centreId, cropId, rate);
      setSavedRates((previous) => ({ ...previous, [cropId]: String(rate) }));
    } catch (err: any) {
      setError(err.message || 'Could not save the crop rate');
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
      <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-6">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
          <Sprout className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">Crop Rate & Reference Setup</h2>
          <p className="text-xs text-slate-500">Set the highest/reference procurement rate for each accepted crop.</p>
        </div>
      </div>

      <div className="space-y-4">
        {crops.map((crop) => (
          <div key={crop.id} className="flex items-center justify-between gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="font-semibold text-slate-800 text-sm">🌾 {crop.name}</span>
            <div className="flex items-center gap-2">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-medium">₹</span>
                <input
                  type="number"
                  value={rates[crop.id]}
                  onChange={(e) => handleRateChange(crop.id, e.target.value)}
                  className="pl-7 pr-3 py-2 w-28 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  placeholder="0.00"
                />
              </div>
              <button
                onClick={() => handleSave(crop.id)}
                className="p-2 bg-emerald-700 text-white rounded-xl hover:bg-emerald-800 transition-colors"
                title="Save Rate"
              >
                <Save className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
      {Object.keys(savedRates).length > 0 && (
        <p className="text-[10px] text-emerald-700 mt-4 text-center font-medium">
          Centre crop rates are saved.
        </p>
      )}
      {error && <p className="text-xs text-red-700 mt-3">{error}</p>}
    </div>
  );
};
