import React from 'react';
import { Sprout, CheckCircle2, Shield, HeartHandshake } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="bg-stone-50 py-12 md:py-20 text-stone-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <span className="text-xs font-bold text-emerald-700 tracking-wider uppercase mb-2 block">
            About The Mission
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-emerald-950">
            Dignity, Transparency &amp; Speed for Farmers
          </h1>
          <p className="mt-4 text-stone-600 max-w-2xl mx-auto text-base leading-relaxed">
            KisanSetu was developed as a Smart India Hackathon solution addressing agricultural procurement center bottlenecks across India.
          </p>
        </div>

        <div className="bg-white border border-stone-200 rounded-2xl p-8 space-y-6 text-stone-700 leading-relaxed text-sm">
          <h2 className="text-xl font-serif font-bold text-emerald-950">The Problem We Are Solving</h2>
          <p>
            During peak Kharif and Rabi harvest windows, thousands of farmers bring loaded tractors and bullock carts to government procurement centres and APMC market yards. Because there has traditionally been no digital scheduling, farmers arrive simultaneously at 4:00 AM, resulting in queues spanning kilometers along state highways.
          </p>
          <p>
            Farmers often spend 2 to 4 days sleeping on the roadside guarding their produce against unseasonal rain, pilferage, and weight loss due to natural drying. Furthermore, lack of transparency regarding when money is actually released has bred mistrust.
          </p>

          <div className="pt-4 border-t border-stone-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 bg-emerald-50/60 p-4 rounded-xl border border-emerald-100">
              <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-stone-900 text-sm font-semibold">Zero-Congestion Slots</strong>
                <span className="text-xs text-stone-600">Strict capacity allocation per hour ensures steady throughput.</span>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-emerald-50/60 p-4 rounded-xl border border-emerald-100">
              <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-stone-900 text-sm font-semibold">Dynamic Quantity Estimation</strong>
                <span className="text-xs text-stone-600">Calculates wait time factoring the actual metric tonnage of vehicles ahead.</span>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-emerald-50/60 p-4 rounded-xl border border-emerald-100">
              <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-stone-900 text-sm font-semibold">No Speculative Amounts</strong>
                <span className="text-xs text-stone-600">Payment status is only updated after physical inspection and official sanction.</span>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-emerald-50/60 p-4 rounded-xl border border-emerald-100">
              <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-stone-900 text-sm font-semibold">Real-Time WebSockets</strong>
                <span className="text-xs text-stone-600">Farmer mobile screens react instantly when the weighbridge calls the next token.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
