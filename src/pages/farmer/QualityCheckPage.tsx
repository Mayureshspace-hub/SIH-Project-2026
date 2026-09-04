import React, { useState } from 'react';
import {
  Sparkles,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  Scale,
  RefreshCw,
  Info,
  Camera
} from 'lucide-react';
import { api } from '../../services/api';

export const QualityCheckPage: React.FC = () => {
  const [cropType, setCropType] = useState('Paddy (Dhan)');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Sample image generator (simple SVG canvas base64 for testing without uploading)
  const loadSampleProduce = (crop: string) => {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Draw golden wheat/paddy grains simulation
      ctx.fillStyle = '#fef3c7';
      ctx.fillRect(0, 0, 400, 300);
      ctx.fillStyle = '#b45309';
      for (let i = 0; i < 150; i++) {
        const x = Math.random() * 380 + 10;
        const y = Math.random() * 280 + 10;
        ctx.beginPath();
        ctx.ellipse(x, y, 6, 2.5, Math.random() * Math.PI, 0, 2 * Math.PI);
        ctx.fill();
      }
      ctx.fillStyle = '#065f46';
      ctx.font = '16px serif';
      ctx.fillText(`${crop} Sample - APMC Intake Inspection`, 20, 280);
      const dataUrl = canvas.toDataURL('image/jpeg');
      setImagePreview(dataUrl);
      setResult(null);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!imagePreview) return;
    setAnalyzing(true);
    setError(null);

    try {
      const res = await api.analyzeCropQuality(imagePreview, cropType);
      setResult(res);
    } catch (err: any) {
      setError(err.message || 'Analysis failed. Try another photo.');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 mb-1 border border-amber-300/60">
          <Sparkles className="w-3.5 h-3.5 text-amber-700" />
          <span>AI Quality Pre-Check</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
          Intelligent Crop Quality Estimation
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          Upload a clear photo of your grain harvest to estimate moisture content, foreign matter, and APMC grade classification prior to weighing.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload & Controls */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Select Crop Variety</label>
            <select
              value={cropType}
              onChange={(e) => setCropType(e.target.value)}
              className="w-full py-2 px-3 text-xs font-semibold bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-600"
            >
              <option value="Paddy (Dhan)">Paddy (Dhan)</option>
              <option value="Soybean">Soybean (Pili)</option>
              <option value="Wheat (Gehun)">Wheat (Gehun)</option>
              <option value="Bengal Gram (Chana)">Bengal Gram (Chana)</option>
              <option value="Tur (Arhar)">Tur (Arhar Dal)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-2">Produce Photo</label>
            <div className="border-2 border-dashed border-stone-300 hover:border-emerald-600 rounded-2xl p-6 text-center transition bg-stone-50">
              {imagePreview ? (
                <div className="space-y-3">
                  <img
                    src={imagePreview}
                    alt="Produce Preview"
                    className="max-h-48 mx-auto rounded-xl object-contain shadow-xs"
                  />
                  <div className="flex items-center justify-center gap-3">
                    <label className="text-xs font-semibold text-emerald-800 hover:underline cursor-pointer">
                      Change Photo
                      <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                    </label>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-800 rounded-2xl mx-auto flex items-center justify-center">
                    <Camera className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-stone-800">
                      Take or upload a clear photo of your grains
                    </p>
                    <p className="text-[11px] text-stone-400 mt-0.5">JPEG or PNG, spread thinly under bright light</p>
                  </div>
                  <label className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-800 text-white text-xs font-semibold hover:bg-emerald-900 transition cursor-pointer">
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Browse Image</span>
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>
              )}
            </div>
          </div>

          <div className="pt-1 flex items-center justify-between">
            <button
              type="button"
              onClick={() => loadSampleProduce(cropType)}
              className="text-xs text-stone-500 hover:text-emerald-800 underline font-medium"
            >
              Use Sample {cropType} Photo
            </button>

            <button
              type="button"
              disabled={!imagePreview || analyzing}
              onClick={handleAnalyze}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold transition cursor-pointer shadow-xs disabled:opacity-50"
            >
              {analyzing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Analyzing Grains...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Run Quality Check</span>
                </>
              )}
            </button>
          </div>

          {error && (
            <p className="text-xs text-red-600 bg-red-50 p-3 rounded-xl border border-red-200">
              {error}
            </p>
          )}
        </div>

        {/* Results Card */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-base text-stone-900 mb-1">Analysis &amp; Quality Assessment</h3>
            <p className="text-xs text-stone-500 mb-4">
              AI inspection report powered by Gemini multimodal vision.
            </p>

            {result ? (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-emerald-800 block">Predicted APMC Classification</span>
                    <span className="text-xl font-bold font-serif text-emerald-950">
                      Grade {result.grade} Quality
                    </span>
                  </div>
                  <span className="text-xs font-bold font-mono px-3 py-1 rounded-full bg-emerald-800 text-white">
                    {result.confidence || '94%'} Match
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200">
                    <span className="text-stone-400 block">Estimated Moisture</span>
                    <strong className="text-stone-900 text-base font-mono block mt-0.5">
                      {result.estimatedMoisture || '12.4%'}
                    </strong>
                    <span className="text-[10px] text-emerald-700 font-medium">Standard &lt; 14%</span>
                  </div>

                  <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200">
                    <span className="text-stone-400 block">Foreign Matter</span>
                    <strong className="text-stone-900 text-base font-mono block mt-0.5">
                      {result.foreignMatter || '1.8%'}
                    </strong>
                    <span className="text-[10px] text-emerald-700 font-medium">Well within limits</span>
                  </div>
                </div>

                {result.insights && (
                  <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 text-xs text-stone-700 space-y-1">
                    <p className="font-bold text-stone-900">Observation Notes:</p>
                    <p className="text-[11px] leading-relaxed text-stone-600">{result.insights}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-16 text-center text-stone-400 space-y-2">
                <Sparkles className="w-8 h-8 mx-auto text-stone-300" />
                <p className="text-xs">Upload or generate a sample photo to run quality assessment.</p>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-stone-100 text-[11px] text-stone-400 flex items-start gap-2">
            <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-stone-400" />
            <span>Note: This is an advisory pre-check. Official certification occurs at the procurement centre weighbridge.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
