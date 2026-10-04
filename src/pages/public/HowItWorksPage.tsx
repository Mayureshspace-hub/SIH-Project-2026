import React from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  CalendarCheck,
  Ticket,
  Clock,
  Scale,
  CreditCard,
  ArrowRight,
  ShieldCheck,
  Info
} from 'lucide-react';

export const HowItWorksPage: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'Find Centre & Verify Crop Acceptance',
      icon: Search,
      description:
        'Centres do not accept all crops uniformly. Search by your specific produce (e.g. Paddy, Soybean, Bengal Gram) to view only authorized procurement hubs ready to receive your stock.',
    },
    {
      num: '02',
      title: 'Book a Designated Entry Slot',
      icon: CalendarCheck,
      description:
        'Choose a convenient 1-hour entry window. Strict capacity caps ensure no more than 10 farmers arrive simultaneously, completely preventing road congestion.',
    },
    {
      num: '03',
      title: 'Receive Unique Digital Token',
      icon: Ticket,
      description:
        'The platform generates an authenticated digital token (e.g. PAR-027) stamped with your slot, centre code, and reported produce quantity.',
    },
    {
      num: '04',
      title: 'Quantity-Aware Dynamic Live Queue',
      icon: Clock,
      description:
        'Unlike primitive queues that assume a flat 10 minutes per person, Kisan Marg estimates processing duration based on the quintals each farmer ahead has brought. Track changes live without refreshing.',
    },
    {
      num: '05',
      title: 'Physical Weighment & Official Procurement',
      icon: Scale,
      description:
        'Upon arriving and check-in, the weighbridge operator calls your token. Gross weighment, tare weighment, and moisture grading are performed and an official procurement slip is recorded.',
    },
    {
      num: '06',
      title: 'Verified Direct Bank Transfer (DBT)',
      icon: CreditCard,
      description:
        'We never fabricate or show speculative amounts. Once the authorized centre sanctions the payment file, track the live status from "Payment On the Way" to "Payment Completed".',
    },
  ];

  return (
    <div className="bg-stone-50 py-12 md:py-20 text-stone-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <span className="text-xs font-bold text-emerald-700 tracking-wider uppercase mb-2 block">
            System Guide
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-emerald-950">
            How Kisan Marg Works
          </h1>
          <p className="mt-4 text-stone-600 max-w-xl mx-auto text-base leading-relaxed">
            Eliminating 10+ hours of physical waiting in tractor lines through algorithmic slot scheduling and real-time weighbridge queue orchestration.
          </p>
        </div>

        <div className="space-y-6">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row gap-6 items-start hover:shadow-xs transition"
              >
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center shrink-0 font-mono font-bold text-lg">
                  {step.num}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="w-5 h-5 text-emerald-700" />
                    <h3 className="text-lg font-bold text-stone-900">{step.title}</h3>
                  </div>
                  <p className="text-stone-600 text-sm leading-relaxed">{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12 bg-amber-50 border border-amber-200 rounded-2xl p-6 flex items-start gap-4">
          <Info className="w-6 h-6 text-amber-800 shrink-0 mt-0.5" />
          <div className="text-sm text-amber-900">
            <p className="font-bold mb-1">Quantity-Based Queue Formula</p>
            <p className="text-xs text-amber-800 leading-relaxed font-mono">
              Estimated Wait = Base Processing Time (10m) + ∑ (Farmers Ahead Quantity × Centre Processing Factor)
            </p>
            <p className="text-xs text-amber-700 mt-1">
              This formula accounts for varying truck sizes, ensuring farmers arrive exactly when the centre is ready for them.
            </p>
          </div>
        </div>

        <div className="mt-10 text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-800 text-white font-medium hover:bg-emerald-900 transition"
          >
            <span>Proceed to Login / Register</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};
