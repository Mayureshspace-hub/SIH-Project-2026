import React, { useState } from 'react';
import { Settings, Sliders, CheckCircle2, ShieldAlert, Save } from 'lucide-react';

export const AdminSettingsPage: React.FC = () => {
  const [baseTime, setBaseTime] = useState('10');
  const [quantityFactor, setQuantityFactor] = useState('0.25');
  const [smsGateway, setSmsGateway] = useState(true);
  const [whatsappGateway, setWhatsappGateway] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block">
          Platform Configuration
        </span>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 mt-0.5">
          System &amp; Queue Parameters
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          Adjust the state-wide queue wait estimation coefficients and messaging notifications.
        </p>
      </div>

      <form onSubmit={handleSave} className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        {saved && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Algorithm coefficients and gateway configurations updated successfully!</span>
          </div>
        )}

        <div>
          <h3 className="font-bold text-base text-stone-900 mb-1">
            Quantity-Based Queue Formula Parameters
          </h3>
          <p className="text-xs text-stone-500 mb-4">
            Estimated Wait = Base Processing Time (T_base) + &sum; (Farmers Ahead Quantity &times; Factor)
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Default Base Scale Calibration Time (Minutes)
              </label>
              <input
                type="number"
                value={baseTime}
                onChange={(e) => setBaseTime(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-mono text-sm font-bold"
              />
              <span className="text-[11px] text-stone-400 mt-1 block">
                Standard: 10 minutes per vehicle positioning
              </span>
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Quantity Factor (Minutes per Quintal)
              </label>
              <input
                type="number"
                step="0.05"
                value={quantityFactor}
                onChange={(e) => setQuantityFactor(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-mono text-sm font-bold"
              />
              <span className="text-[11px] text-stone-400 mt-1 block">
                Standard: 0.25 min / quintal for unloading &amp; moisture probe
              </span>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-stone-100">
          <h3 className="font-bold text-base text-stone-900 mb-1">Farmer Dispatch Gateways</h3>
          <p className="text-xs text-stone-500 mb-4">
            Automated notifications triggered when an operator presses &quot;Call Next Token&quot;.
          </p>

          <div className="space-y-3 text-xs">
            <label className="flex items-center gap-3 p-3.5 rounded-2xl bg-stone-50 border border-stone-200 cursor-pointer">
              <input
                type="checkbox"
                checked={smsGateway}
                onChange={(e) => setSmsGateway(e.target.checked)}
                className="w-4 h-4 text-emerald-700 rounded"
              />
              <div>
                <strong className="block text-stone-900">NIC Government SMS Gateway</strong>
                <span className="text-stone-500 text-[11px]">Direct SMS to registered mobile numbers</span>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3.5 rounded-2xl bg-stone-50 border border-stone-200 cursor-pointer">
              <input
                type="checkbox"
                checked={whatsappGateway}
                onChange={(e) => setWhatsappGateway(e.target.checked)}
                className="w-4 h-4 text-emerald-700 rounded"
              />
              <div>
                <strong className="block text-stone-900">Kisan Marg WhatsApp Business Desk</strong>
                <span className="text-stone-500 text-[11px]">Instant digital pass and live queue link</span>
              </div>
            </label>
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 transition shadow-xs cursor-pointer"
          >
            <Save className="w-4 h-4 text-amber-400" />
            <span>Save Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
};
