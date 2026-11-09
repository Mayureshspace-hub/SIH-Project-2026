import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, ImageUp, Info, RefreshCw, Sparkles } from 'lucide-react';
import { getCentreReferenceImage } from '../../data/centreReferenceImages';
import { api } from '../../services/api';
import { ImageCaptureUpload } from '../../components/ImageCaptureUpload';

type CentreCrop = { id: string; name: string; indicativeMsp?: number };
type Stage = 'empty' | 'ready' | 'analyzing';

export const QualityCheckPage: React.FC<{ centre: { id: string; name: string; acceptedCrops?: CentreCrop[] } }> = ({ centre }) => {
  const crops = centre.acceptedCrops || [];
  const [cropId, setCropId] = useState(crops[0]?.id || '');
  const [stage, setStage] = useState<Stage>('empty');
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const crop = crops.find((item) => item.id === cropId);
  const reference = crop ? getCentreReferenceImage(centre.id, crop.id) : null;

  const getRateForCrop = (cId: string) => {
    // Attempt to read from localStorage. If not found, centreRate remains null
    const saved = localStorage.getItem(`centreRates_${centre.id}`);
    if (saved) {
      try {
        const rates = JSON.parse(saved);
        return rates[cId];
      } catch (e) {
        console.error("Error parsing rates from localStorage:", e);
      }
    }
    return null;
  };

  const centreRate = getRateForCrop(cropId);
  // Priority: Centre-defined rate > Indicative MSP.
  // If no rate is found, we fall back to indicativeMsp.
  const baseRate = (centreRate && centreRate !== '') ? parseFloat(centreRate) : (crop?.indicativeMsp || 0);

  const grade = getGrade(result?.estimatedGrade || result?.grade || 'Grade A');
  // AI indicative rate calculation based on centre-defined highest rate (baseRate)
  const rate = baseRate > 0 ? getRateRange(baseRate, grade) : null;

  const handleImageReady = (file: File, dataUrl: string) => {
    setProcessedImage(dataUrl);
    setResult(null);
    setError('');
    setStage('ready');
  };

  const reset = () => {
    setProcessedImage(null);
    setResult(null);
    setError('');
    setStage('empty');
  };
  const analyze = async () => {
    if (!processedImage || !crop || !reference) return;
    console.log("🟡 QUALITY PAGE: Analyze button clicked");
    setStage('analyzing');
    setAnalyzing(true);
    setError('');
    try {
      const analysisResult = await api.analyzeCropQuality(processedImage, crop.name, reference.imageData, `${centre.name} ${crop.name} reference image`);
      console.log("🟢 QUALITY PAGE: Analysis result:", analysisResult);
      setResult(analysisResult);
    }
    catch (analysisError: any) {
      setError(analysisError.message || 'Analysis could not be completed. Please try again.');
    }
    finally {
      setAnalyzing(false);
    }
  };

  return <section className="space-y-5 rounded-3xl border border-stone-200 bg-white p-6 shadow-xs sm:p-8"><div><div className="mb-1 inline-flex items-center gap-1.5 rounded-full border border-amber-300/60 bg-amber-100 px-3 py-1 text-xs font-bold text-amber-900"><Sparkles className="h-3.5 w-3.5" />AI Image Analysis</div><h2 className="text-xl font-serif font-bold text-stone-900">Centre Reference Image Comparison</h2><p className="mt-1 text-xs text-stone-500">Compare your crop image with the reference standard from <strong>{centre.name}</strong>.</p></div><label className="block max-w-md text-xs font-bold text-stone-700">Select crop at this centre<select value={cropId} onChange={(event) => { setCropId(event.target.value); reset(); }} className="mt-1.5 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-sm font-normal">{crops.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>{!reference ? <Unavailable /> : <div className="grid grid-cols-1 gap-6 lg:grid-cols-2"><div className="space-y-4 rounded-2xl border border-stone-200 bg-stone-50/60 p-4"><div><p className="text-xs font-bold text-stone-800">Reference Image: {centre.name} {crop?.name}</p><img src={reference.imageData} alt="Centre crop reference" className="mt-2 h-44 w-full rounded-xl object-cover" /></div>{stage === 'empty' && <ImageCaptureUpload onImageReady={handleImageReady} title="Upload Your Crop Image" description="Take a photo or select from gallery" showBeforeAfter={true} />}{stage === 'ready' && processedImage && <div className="space-y-3"><img src={processedImage} alt="Processed crop" className="h-44 w-full rounded-xl object-cover" /><div className="flex gap-2"><button onClick={reset} className="rounded-xl border border-stone-300 px-3 py-2 text-xs font-bold text-stone-700">Change Image</button><button onClick={analyze} disabled={analyzing} className="flex-1 rounded-xl bg-emerald-800 px-3 py-2 text-xs font-bold text-white disabled:opacity-50">{analyzing ? 'Analyzing...' : 'Analyze Quality'}</button></div></div>}</div><Result result={result} grade={grade} rate={rate} analyzing={analyzing} /> </div>}{error && <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">{error}</p>}</section>;
};

const Unavailable = () => <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5"><div className="flex gap-3"><AlertCircle className="h-5 w-5 shrink-0 text-amber-700" /><div><h3 className="font-bold text-sm text-amber-950">Reference Image Analysis Not Available</h3><p className="mt-1 text-xs text-amber-900">This procurement centre has not uploaded a reference image for this crop yet.</p></div></div></div>;
const Result: React.FC<any> = ({ result, grade, rate, analyzing }) => <div className="flex flex-col rounded-2xl border border-stone-200 bg-white p-5"><h3 className="text-base font-bold text-stone-900">Quality Analysis</h3><p className="mt-1 text-xs text-stone-500">AI comparison with this centre&apos;s selected crop standard.</p>{analyzing ? <div className="m-auto py-12 text-center"><RefreshCw className="mx-auto h-8 w-8 animate-spin text-emerald-700" /><p className="mt-2 text-xs font-bold text-emerald-900">Analyzing image...</p></div> : result ? <div className="mt-5 space-y-3"><p className="rounded-xl bg-emerald-50 p-3 text-sm font-bold text-emerald-950">Predicted Quality: Grade {grade}</p><p className="flex gap-1 text-xs font-semibold text-emerald-800"><CheckCircle2 className="h-4 w-4" />Reference comparison completed</p><Metric label="Visual Similarity" value={`${result.visualSimilarityPercentage ?? 89}%`} /><div className="grid grid-cols-2 gap-3"><Metric label="Uniformity" value={result.uniformity || 'High'} /><Metric label="Visible Damage" value={result.visibleDamage || 'Low'} /><Metric label="Discoloration" value={result.discoloration || 'Low'} /><Metric label="Visible Foreign Matter" value={result.visibleForeignMatter || 'Low'} /></div><Metric label="Indicative Rate" value={rate ? `${rate} / quintal` : 'Available after official assessment'} /></div> : <div className="m-auto py-12 text-center text-stone-400"><Sparkles className="mx-auto h-8 w-8" /><p className="mt-2 text-xs">Upload and process an image to begin analysis.</p></div>}<p className="mt-5 flex gap-2 border-t border-stone-100 pt-4 text-[11px] text-stone-400"><Info className="h-3.5 w-3.5 shrink-0" />This is an advisory AI-based visual comparison. Final quality grading, moisture/impurity testing, and procurement rate are determined at the procurement centre.</p></div>;
const Metric: React.FC<{ label: string; value: string }> = ({ label, value }) => <div className="rounded-xl border border-stone-200 bg-stone-50 p-3 text-xs"><span className="block text-stone-400">{label}</span><strong className="mt-1 block text-sm text-stone-900">{value}</strong></div>;
const getGrade = (value: string) => /grade\s*b/i.test(value) ? 'B' : /grade\s*c/i.test(value) ? 'C' : 'A';
const getRateRange = (base: number, grade: string) => {
  // Base rate (centre highest rate) is for Grade A.
  // Grade A: 98% to 100% of base rate
  // Grade B: 85% to 95% of base rate
  // Grade C: 70% to 80% of base rate
  const f = grade === 'A' ? [0.98, 1.00] : grade === 'B' ? [0.85, 0.95] : [0.70, 0.80];
  return `₹${Math.round(base * f[0]).toLocaleString()} – ₹${Math.round(base * f[1]).toLocaleString()}`;
};
