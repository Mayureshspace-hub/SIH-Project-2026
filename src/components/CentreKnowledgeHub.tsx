import React, { useState } from 'react';
import { Award, ChevronDown, Leaf, Sprout } from 'lucide-react';
import { getPracticesForCentre } from '../data/farmerKnowledge';

export const CentreKnowledgeHub: React.FC<{ centreId: string }> = ({ centreId }) => {
  const [openId, setOpenId] = useState<string | null>(null);
  const practices = getPracticesForCentre(centreId);

  return (
    <section className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-xs" aria-labelledby="knowledge-hub-heading">
      <div className="flex items-start gap-3 border-b border-stone-100 pb-5">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0"><Award className="w-5 h-5" /></div>
        <div>
          <h2 id="knowledge-hub-heading" className="text-lg font-serif font-bold text-stone-900">Farmer Knowledge Hub</h2>
          <p className="text-xs text-stone-500 mt-0.5">High-performing farmer practices shared by growers who procure at this centre.</p>
        </div>
      </div>
      {practices.length === 0 ? (
        <p className="py-8 text-center text-sm text-stone-500">No farmer practices have been shared for this procurement centre yet.</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-5">
          {practices.map((practice) => {
            const expanded = openId === practice.id;
            return <article key={practice.id} className="rounded-2xl border border-stone-200 bg-stone-50/70 p-4">
              <div className="flex items-start justify-between gap-3">
                <div><h3 className="font-bold text-sm text-stone-900">{practice.farmerName}</h3><p className="text-[11px] text-stone-500 mt-0.5">{practice.crop} · {practice.season}</p></div>
                <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold text-emerald-800">{practice.crop}</span>
              </div>
              <p className="mt-3 rounded-xl bg-emerald-50 border border-emerald-100 p-3 text-xs leading-5 text-emerald-900"><strong>Observed result:</strong> {practice.observedImprovement}</p>
              <button onClick={() => setOpenId(expanded ? null : practice.id)} className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-emerald-800 hover:text-emerald-950 cursor-pointer">
                {expanded ? 'Hide details' : 'View practice details'} <ChevronDown className={`w-3.5 h-3.5 transition ${expanded ? 'rotate-180' : ''}`} />
              </button>
              {expanded && <div className="mt-3 space-y-3 border-t border-stone-200 pt-3 text-xs text-stone-700">
                <PracticeRow icon={<Leaf className="w-3.5 h-3.5 text-emerald-700" />} label="Fertilizers used" values={practice.fertilizers} />
                <PracticeRow icon={<Sprout className="w-3.5 h-3.5 text-amber-700" />} label="Insecticides / pesticides used" values={practice.pesticides} />
                <PracticeRow icon={<Award className="w-3.5 h-3.5 text-emerald-700" />} label="Farming practices" values={practice.farmingPractices} />
              </div>}
            </article>;
          })}
        </div>
      )}
    </section>
  );
};

const PracticeRow: React.FC<{ icon: React.ReactNode; label: string; values: string[] }> = ({ icon, label, values }) => <div><p className="flex items-center gap-1.5 font-bold text-stone-700">{icon}{label}</p><p className="leading-5 text-stone-600 mt-1">{values.join(' · ')}</p></div>;
