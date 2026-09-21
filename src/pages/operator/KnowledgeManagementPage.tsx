import React, { useEffect, useState } from 'react';
import { Edit3, Leaf, Plus, Trash2, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { deletePractice, getPracticesForCentre, savePractice } from '../../data/farmerKnowledge';
import { FarmerKnowledgePractice } from '../../types';

const blankPractice = (centreId: string): FarmerKnowledgePractice => ({ id: '', centreId, farmerName: '', crop: '', fertilizers: [], pesticides: [], farmingPractices: [], season: '', observedImprovement: '' });
const toText = (values: string[]) => values.join(', ');
const fromText = (value: string) => value.split(',').map((item) => item.trim()).filter(Boolean);

export const KnowledgeManagementPage: React.FC = () => {
  const { operator, user } = useAuth();
  const centreId = operator?.centreId || '';
  const [items, setItems] = useState<FarmerKnowledgePractice[]>([]);
  const [editing, setEditing] = useState<FarmerKnowledgePractice | null>(null);

  const refresh = () => setItems(getPracticesForCentre(centreId));
  useEffect(refresh, [centreId]);
  const close = () => setEditing(null);
  const remove = (id: string) => { if (window.confirm('Remove this shared farmer practice?')) { deletePractice(id); refresh(); } };

  if (user?.role !== 'OPERATOR' || !operator) {
    return <div className="max-w-2xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xs"><h1 className="font-serif text-xl font-bold text-slate-900">Centre access required</h1><p className="mt-2 text-sm text-slate-500">Farmer Knowledge Hub entries can only be managed by the authorized procurement centre user.</p></div>;
  }

  return <div className="max-w-5xl space-y-6">
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
      <div><span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Centre-managed information</span><h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 mt-0.5">Farmer Knowledge Hub</h1><p className="text-xs text-slate-500 mt-1">Add and maintain practices that farmers can read on your centre&apos;s details page.</p></div>
      <button onClick={() => setEditing(blankPractice(centreId))} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-800 cursor-pointer"><Plus className="w-4 h-4" /> Add farmer practice</button>
    </div>
    <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs">
      <p className="mb-4 rounded-xl border border-amber-100 bg-amber-50 px-3 py-2 text-xs text-amber-900">Only records for your assigned procurement centre are shown and managed here.</p>
      {items.length === 0 ? <p className="py-8 text-center text-sm text-slate-500">No farmer practices have been added yet.</p> : <div className="space-y-3">{items.map((item) => <div key={item.id} className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="font-bold text-sm text-slate-900">{item.farmerName} <span className="font-normal text-slate-500">· {item.crop}</span></h2><p className="mt-1 text-xs text-slate-500">{item.season} · {item.observedImprovement}</p></div><div className="flex gap-2"><button onClick={() => setEditing(item)} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"><Edit3 className="w-3.5 h-3.5" /> Edit</button><button onClick={() => remove(item.id)} className="inline-flex items-center gap-1 rounded-lg border border-red-100 bg-white px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-50 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /> Delete</button></div></div>)}</div>}
    </div>
    {editing && <PracticeForm practice={editing} onCancel={close} onSave={(practice) => { savePractice(practice); refresh(); close(); }} />}
  </div>;
};

const PracticeForm: React.FC<{ practice: FarmerKnowledgePractice; onCancel: () => void; onSave: (practice: FarmerKnowledgePractice) => void }> = ({ practice, onCancel, onSave }) => {
  const [form, setForm] = useState(practice);
  const update = (field: keyof FarmerKnowledgePractice, value: string | string[]) => setForm((current) => ({ ...current, [field]: value }));
  const submit = (event: React.FormEvent) => { event.preventDefault(); onSave({ ...form, id: form.id || `knowledge-${Date.now()}` }); };
  const fields: Array<{ label: string; field: 'fertilizers' | 'pesticides' | 'farmingPractices' }> = [{ label: 'Fertilizers used', field: 'fertilizers' }, { label: 'Insecticides / pesticides used', field: 'pesticides' }, { label: 'Farming practices', field: 'farmingPractices' }];
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"><form onSubmit={submit} className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-5 sm:p-6 shadow-xl"><div className="flex items-start justify-between border-b border-slate-100 pb-4"><div><h2 className="text-xl font-serif font-bold text-slate-900">{form.id ? 'Edit farmer practice' : 'Add farmer practice'}</h2><p className="text-xs text-slate-500 mt-1">This entry is visible only on your centre&apos;s farmer-facing details page.</p></div><button type="button" onClick={onCancel} className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg"><X className="w-5 h-5" /></button></div><div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5"><Input label="Farmer name" value={form.farmerName} onChange={(value) => update('farmerName', value)} /><Input label="Crop" value={form.crop} onChange={(value) => update('crop', value)} /><Input label="Season" value={form.season} onChange={(value) => update('season', value)} />{fields.map(({ label, field }) => <Input key={field} label={`${label} (comma-separated)`} value={toText(form[field])} onChange={(value) => update(field, fromText(value))} />)}<label className="sm:col-span-2 text-xs font-bold text-slate-700">Observed improvement / result<textarea required value={form.observedImprovement} onChange={(event) => update('observedImprovement', event.target.value)} className="mt-1.5 min-h-24 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-normal outline-none focus:border-emerald-600" /></label></div><div className="mt-5 flex justify-end gap-2"><button type="button" onClick={onCancel} className="rounded-xl px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100">Cancel</button><button className="rounded-xl bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-800">Save practice</button></div></form></div>;
};

const Input: React.FC<{ label: string; value: string; onChange: (value: string) => void }> = ({ label, value, onChange }) => <label className="text-xs font-bold text-slate-700">{label}<input required value={value} onChange={(event) => onChange(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-normal outline-none focus:border-emerald-600" /></label>;
