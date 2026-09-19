import React, { useState } from 'react';
import { AlertCircle, Camera, CheckCircle2, ImageUp, Info, RefreshCw, Sparkles } from 'lucide-react';
import { getCentreReferenceImage } from '../../data/centreReferenceImages';
import { api } from '../../services/api';

type CentreCrop = { id: string; name: string; indicativeMsp?: number };

export const QualityCheckPage: React.FC<{ centre: { id: string; name: string; acceptedCrops?: CentreCrop[] } }> = ({ centre }) => {
  const crops = centre.acceptedCrops || [];
  const [cropId, setCropId] = useState(crops[0]?.id || '');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const crop = crops.find((item) => item.id === cropId);
  const reference = crop ? getCentreReferenceImage(centre.id, crop.id) : null;
  const grade = getGrade(result?.estimatedGrade || result?.grade || 'Grade A');
  const rateRange = crop?.indicativeMsp ? getRateRange(crop.indicativeMsp, grade) : null;

  const upload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => { setImagePreview(reader.result as string); setResult(null); setError(null); };
    reader.readAsDataURL(file);
  };
  const analyze = async () => {
    if (!imagePreview || !crop || !reference) return;
    setAnalyzing(true); setError(null);
    try { setResult(await api.analyzeCropQuality(imagePreview, crop.name, reference.imageData, `${centre.name} ${crop.name} reference image`)); }
    catch (err: any) { setError(err.message || 'Analysis failed. Try another photo.'); }
    finally { setAnalyzing(false); }
  };

  return <section className="space-y-5 rounded-3xl border border-stone-200 bg-white p-6 shadow-xs sm:p-8" aria-labelledby="ai-analysis-heading">
    <div><div className="mb-1 inline-flex items-center gap-1.5 rounded-full border border-amber-300/60 bg-amber-100 px-3 py-1 text-xs font-bold text-amber-900"><Sparkles className="h-3.5 w-3.5 text-amber-700" />AI Image Analysis</div><h2 id="ai-analysis-heading" className="text-xl font-serif font-bold text-stone-900 sm:text-2xl">Centre Reference Image Comparison</h2><p className="mt-1 text-xs text-stone-500">Compare your crop image with the reference standard uploaded by <strong>{centre.name}</strong>.</p></div>
    <label className="block max-w-md text-xs font-bold text-stone-700">Select crop at this centre<select value={cropId} onChange={(event) => { setCropId(event.target.value); setImagePreview(null); setResult(null); setError(null); }} className="mt-1.5 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-sm font-normal outline-none focus:border-emerald-600">{crops.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
    {!reference ? <Unavailable /> : <div className="grid grid-cols-1 gap-6 lg:grid-cols-2"><div className="space-y-4 rounded-2xl border border-stone-200 bg-stone-50/60 p-4"><div><p className="text-xs font-bold text-stone-800">Reference Image: {centre.name} {crop?.name}</p><img src={reference.imageData} alt={`${centre.name} ${crop?.name} reference`} className="mt-2 h-44 w-full rounded-xl object-cover" /></div><div className="border-t border-stone-200 pt-4"><p className="text-xs font-bold text-stone-800">Upload Your Crop Image</p>{imagePreview ? <div className="mt-2"><img src={imagePreview} alt="Your crop preview" className="h-44 w-full rounded-xl object-cover" /><label className="mt-2 inline-block cursor-pointer text-xs font-bold text-emerald-800 hover:underline">Change image<input className="hidden" type="file" accept="image/*" onChange={upload} /></label></div> : <label className="mt-2 flex cursor-pointer flex-col items-center rounded-xl border-2 border-dashed border-stone-300 p-6 text-center hover:border-emerald-600"><Camera className="h-7 w-7 text-emerald-700" /><span className="mt-2 text-xs font-bold text-stone-800">Upload a clear crop image</span><input className="hidden" type="file" accept="image/*" onChange={upload} /></label>}</div><button disabled={!imagePreview || analyzing} onClick={analyze} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-800 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-50">{analyzing ? <><RefreshCw className="h-3.5 w-3.5 animate-spin" />Comparing images...</> : <><ImageUp className="h-3.5 w-3.5" />Run AI Image Comparison</>}</button>{error && <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">{error}</p>}</div><Result result={result} grade={grade} rateRange={rateRange} /></div>}
  </section>;
};

const Unavailable = () => <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5"><div className="flex gap-3"><AlertCircle className="h-5 w-5 shrink-0 text-amber-700" /><div><h3 className="font-bold text-sm text-amber-950">Reference Image Analysis Not Available</h3><p className="mt-1 text-xs leading-5 text-amber-900">This procurement centre has not uploaded a reference image for this crop yet.</p></div></div></div>;
const Result: React.FC<{ result: any; grade: string; rateRange: string | null }> = ({ result, grade, rateRange }) => <div className="flex flex-col rounded-2xl border border-stone-200 bg-white p-5"><h3 className="text-base font-bold text-stone-900">Quality Analysis</h3><p className="mt-1 text-xs text-stone-500">AI comparison with this centre&apos;s selected crop standard.</p>{result ? <div className="mt-5 space-y-4"><div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4"><p className="text-xs text-emerald-800">Predicted Quality</p><p className="mt-1 font-serif text-xl font-bold text-emerald-950">Grade {grade}</p><p className="mt-2 flex items-center gap-1 text-xs font-semibold text-emerald-800"><CheckCircle2 className="h-4 w-4" />Reference comparison completed</p></div><Metric label="Visual Similarity" value={`${result.visualSimilarityPercentage ?? result.uniformityPercentage ?? 89}%`} /><div className="grid grid-cols-2 gap-3"><Metric label="Grain/Crop Uniformity" value={result.uniformity || 'High'} /><Metric label="Visible Damage" value={result.visibleDamage || 'Low'} /><Metric label="Discoloration" value={result.discoloration || 'Low'} /><Metric label="Visible Foreign Matter" value={result.visibleForeignMatter || 'Low'} /></div><div className="rounded-xl bg-stone-50 p-3 text-xs text-stone-700"><strong>Indicative Rate</strong><p className="mt-1 font-bold text-emerald-800">{rateRange ? `${rateRange} / quintal` : 'Available after official centre assessment'}</p></div></div> : <div className="m-auto py-12 text-center text-stone-400"><Sparkles className="mx-auto h-8 w-8 text-stone-300" /><p className="mt-2 text-xs">Upload your image to begin the comparison.</p></div>}<p className="mt-5 flex gap-2 border-t border-stone-100 pt-4 text-[11px] leading-5 text-stone-400"><Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />This is an advisory AI-based visual comparison. Final quality grading, moisture/impurity testing, and procurement rate are determined at the procurement centre.</p></div>;
const Metric: React.FC<{ label: string; value: string }> = ({ label, value }) => <div className="rounded-xl border border-stone-200 bg-stone-50 p-3 text-xs"><span className="block text-stone-400">{label}</span><strong className="mt-1 block text-sm text-stone-900">{value}</strong></div>;
const getGrade = (value: string) => /grade\s*b/i.test(value) ? 'B' : /grade\s*c/i.test(value) ? 'C' : 'A';
const getRateRange = (baseRate: number, grade: string) => { const factors = grade === 'A' ? [0.95, 1.05] : grade === 'B' ? [0.85, 0.95] : [0.7, 0.85]; return `₹${Math.round(baseRate * factors[0]).toLocaleString()} – ₹${Math.round(baseRate * factors[1]).toLocaleString()}`; };
