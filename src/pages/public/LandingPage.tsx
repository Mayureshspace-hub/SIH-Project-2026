import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Search,
  CalendarCheck,
  Ticket,
  Clock,
  ShieldCheck,
  CreditCard,
  CheckCircle2,
  MapPin,
  Sparkles
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const workflowSteps = [
    { title: 'Find Centre', desc: 'Locate nearby APMC procurement hubs or search by accepted crop.', icon: Search },
    { title: 'Select Crop', desc: 'Verify MSP support and crop availability at the chosen depot.', icon: Sparkles },
    { title: 'Book Slot', desc: 'Reserve a verified 1-hour weighbridge entry window without physical queues.', icon: CalendarCheck },
    { title: 'Get Token', desc: 'Receive a digital token code that reserves your turn in the operational queue.', icon: Ticket },
    { title: 'Track Queue', desc: 'Real-time live queue counter dynamically calculated based on produce quantities ahead.', icon: Clock },
    { title: 'Procurement', desc: 'Authorized weight scale logging, moisture grading, and official procurement slip.', icon: ShieldCheck },
    { title: 'Payment Status', desc: 'Track verified DBT fund transfer once officially sanctioned by the centre.', icon: CreditCard },
  ];

  const highlights = [
    { title: 'Find Procurement Centres', desc: 'Search by radius, district, or crops accepted.' },
    { title: 'Book Procurement Slots', desc: 'Guaranteed 1-hour entry windows to eliminate 12+ hour line-ups.' },
    { title: 'Digital Token', desc: 'Cryptographically ordered token for transparent FIFO processing.' },
    { title: 'Live Queue Tracking', desc: 'Dynamic wait estimation factoring produce quintals of farmers ahead.' },
    { title: 'Procurement Status', desc: 'Real-time notification as weighbridge inspects and logs your crop.' },
    { title: 'Payment Status', desc: 'Verified DBT status tracking directly from the procurement registry.' },
  ];

  return (
    <div className="bg-stone-50 text-stone-900">
      {/* Hero Section */}
      <section className="relative pt-16 pb-20 md:pt-28 md:pb-32 overflow-hidden border-b border-stone-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold mb-6 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            Smart India Hackathon 2026 Initiative
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-extrabold tracking-tight text-emerald-950 leading-[1.15]">
            Smart Procurement.<br />
            <span className="text-emerald-700">Less Waiting.</span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-stone-600 max-w-2xl mx-auto leading-relaxed">
            Find the right procurement centre, book your slot and track your live queue in real time.
            Eliminate endless tractor lines and weighbridge congestion.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-emerald-800 text-white font-medium hover:bg-emerald-900 transition shadow-md hover:shadow-lg text-base"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/centres"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-white text-stone-700 font-medium hover:bg-stone-100 border border-stone-300 transition text-base"
            >
              <Search className="w-4 h-4 text-emerald-700" />
              <span>Explore Centres</span>
            </Link>
          </div>

          <div className="mt-12 pt-8 border-t border-stone-200/80 grid grid-cols-2 sm:grid-cols-3 gap-6 text-stone-500 text-xs sm:text-sm">
            <div>
              <span className="block font-bold text-stone-900 text-lg sm:text-xl font-mono">0 Min</span>
              Unnecessary roadside idling
            </div>
            <div>
              <span className="block font-bold text-stone-900 text-lg sm:text-xl font-mono">100%</span>
              Transparent FIFO queueing
            </div>
            <div className="col-span-2 sm:col-span-1">
              <span className="block font-bold text-stone-900 text-lg sm:text-xl font-mono">Verified</span>
              Official DBT Payment Tracking
            </div>
          </div>
        </div>
      </section>

      {/* Visual Workflow Section */}
      <section className="py-16 md:py-24 bg-white border-b border-stone-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-xs uppercase tracking-widest text-emerald-700 font-bold mb-2">
              End-to-End Transparency
            </h2>
            <h3 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
              The KisanSetu Journey
            </h3>
            <p className="mt-3 text-stone-600 text-sm">
              From discovering crop intake availability to receiving your official DBT payment confirmation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-7 gap-3 relative">
            {workflowSteps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.title}
                  className="bg-stone-50 border border-stone-200 rounded-xl p-4 flex flex-col items-center text-center relative group hover:border-emerald-500 hover:shadow-xs transition"
                >
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm mb-3">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-mono font-semibold text-emerald-800 mb-1">Step {idx + 1}</span>
                  <h4 className="font-semibold text-stone-900 text-sm mb-1">{step.title}</h4>
                  <p className="text-stone-500 text-[11px] leading-tight">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="py-16 md:py-24 bg-stone-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-xs uppercase tracking-widest text-emerald-700 font-bold mb-2">
              Key Capabilities
            </h2>
            <h3 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
              Engineered for Real Agricultural Realities
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {highlights.map((h) => (
              <div
                key={h.title}
                className="bg-white border border-stone-200 rounded-xl p-6 hover:shadow-sm transition"
              >
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-stone-900 text-base mb-1">{h.title}</h4>
                    <p className="text-stone-600 text-sm leading-relaxed">{h.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-14 bg-emerald-900 text-white rounded-2xl p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
            <div>
              <h4 className="text-xl sm:text-2xl font-serif font-bold mb-2">
                Ready to experience frictionless procurement?
              </h4>
              <p className="text-emerald-200 text-sm max-w-xl">
                Select your role, browse today&apos;s active APMC slots in Parseoni, Ramtek, or Kalamna, and join the digital queue.
              </p>
            </div>
            <Link
              to="/login"
              className="px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-sm transition shrink-0"
            >
              Sign In to Platform
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
