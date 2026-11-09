import React, { useEffect, useState } from 'react';
import { RefreshCw, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getCentreReferenceImage, saveCentreReferenceImage } from '../../data/centreReferenceImages';
import { api } from '../../services/api';
import { ImageCaptureUpload } from '../../components/ImageCaptureUpload';

export const ReferenceImageManagementPage: React.FC = () => {
  const { user, operator } = useAuth();
  const centreId = operator?.centreId || '';
  const [centre, setCentre] = useState<any>(null);
  const [cropId, setCropId] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const [savedImage, setSavedImage] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => { if (centreId) api.getCentre(centreId).then(setCentre); }, [centreId]);
  useEffect(() => {
    if (!cropId || !centreId) { setSavedImage(null); return; }
    setPreview(null);
    setSavedImage(getCentreReferenceImage(centreId, cropId)?.imageData || null);
    setMessage('');
    setError('');
  }, [centreId, cropId]);

  if (user?.role !== 'OPERATOR' || !operator) return <AccessDenied />;
  if (!centre) return <div className="h-64 animate-pulse rounded-3xl bg-white" />;

  const crops = centre.acceptedCrops || [];
  const selectedCrop = crops.find((crop: any) => crop.id === cropId);
  const handleImageReady = (file: File, dataUrl: string) => {
    setPreview(dataUrl);
    setMessage('');
    setError('');
  };
  const save = () => {
    if (!preview || !selectedCrop) return;
    saveCentreReferenceImage({ centreId, cropId: selectedCrop.id, cropName: selectedCrop.name, imageData: preview, updatedAt: new Date().toISOString() });
    setSavedImage(preview); setPreview(null); setError(''); setMessage(`${selectedCrop.name} reference image saved for ${centre.name}.`);
  };

  return <div className="max-w-4xl space-y-6">
    <div><span className="text-xs font-bold uppercase tracking-wider text-emerald-800">Centre-managed image standard</span><h1 className="mt-0.5 text-2xl font-serif font-bold text-slate-900 sm:text-3xl">AI Image Analysis / Reference Image Management</h1><p className="mt-1 text-xs text-slate-500">Upload one best-quality reference image for each crop accepted at your centre.</p></div>
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs sm:p-6">
      <p className="mb-5 flex gap-2 rounded-xl border border-amber-100 bg-amber-50 p-3 text-xs text-amber-900"><ShieldCheck className="h-4 w-4 shrink-0" />Farmers can view and compare against these images, but cannot change them.</p>
      <label className="block max-w-md text-xs font-bold text-slate-700">Select available crop<select value={cropId} onChange={(event) => setCropId(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-normal outline-none focus:border-emerald-600"><option value="">Select a crop</option>{crops.map((crop: any) => <option key={crop.id} value={crop.id}>{crop.name}</option>)}</select></label>
      {selectedCrop && <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2"><div className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><p className="text-xs font-bold text-slate-800">Current reference image</p>{savedImage ? <img src={savedImage} alt={`${selectedCrop.name} current reference`} className="mt-3 h-52 w-full rounded-xl object-cover" /> : <p className="mt-3 rounded-xl border border-dashed border-slate-300 p-8 text-center text-xs text-slate-500">No reference image uploaded for {selectedCrop.name}.</p>}</div><div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4"><p className="text-xs font-bold text-emerald-900">{savedImage ? 'Replace reference image' : 'Upload best-quality reference image'}</p><p className="mt-1 text-[11px] text-emerald-800">Use a clear, evenly lit image of the best accepted crop quality.</p>{preview ? <><img src={preview} alt="New reference preview" className="mt-3 h-40 w-full rounded-xl object-cover" /><button onClick={save} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-700 bg-white px-4 py-2.5 text-xs font-bold text-emerald-800 hover:bg-emerald-700 hover:text-white"><RefreshCw className="h-4 w-4" />Save reference image</button></> : <ImageCaptureUpload onImageReady={handleImageReady} title="Upload Reference Image" description="Take a clear photo or select from gallery" showBeforeAfter={false} />}</div></div>}
      {message && <p className="mt-4 rounded-xl bg-emerald-50 p-3 text-xs font-semibold text-emerald-800">{message}</p>}
      {error && <p className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">{error}</p>}
    </div>
  </div>;
};

const AccessDenied = () => <div className="max-w-2xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xs"><h1 className="font-serif text-xl font-bold text-slate-900">Centre access required</h1><p className="mt-2 text-sm text-slate-500">Only an authorized procurement centre user can manage reference images.</p></div>;
