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
  Sparkles,
  UserCircle,
  Building,
  Image as ImageIcon,
  BookOpen,
  Users,
  Settings,
  FileText,
  DollarSign
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const LandingPage: React.FC = () => {
  const { t } = useTranslation();

  const farmerWorkflow = [
    { step: '01', title: 'Register & Login', desc: 'Farmer creates an account and logs into the Kisan Marg platform.', icon: UserCircle },
    { step: '02', title: 'Find Procurement Centre', desc: 'Farmer searches for a nearby procurement centre based on their crop.', icon: Search },
    { step: '03', title: 'Select Centre', desc: 'Farmer selects the procurement centre and views its available information.', icon: Building },
    { step: '04', title: 'Farmer Knowledge Hub', desc: 'View farming information from high-performing farmers associated with that centre.', icon: BookOpen },
    { step: '05', title: 'Crop Image & Quality Check', desc: 'Upload crop image for quality analysis and comparison with centre reference images.', icon: ImageIcon },
    { step: '06', title: 'Book a Slot', desc: 'Select date/time slot, enter crop details, and receive a digital token.', icon: CalendarCheck },
    { step: '07', title: 'Track Live Queue', desc: 'Check token number, farmers ahead, queue status, and estimated waiting time.', icon: Clock },
    { step: '08', title: 'Visit & Complete Procurement', desc: 'Follow centre process: check-in, KYC, lot creation, weighing and quality assessment.', icon: ShieldCheck },
    { step: '09', title: 'Track Payment Status', desc: 'Track payment through: Payment Not Finalized → On the Way → Completed.', icon: DollarSign },
  ];

  const centreWorkflow = [
    { step: '01', title: 'Register Centre', desc: 'Centre/operator registers their procurement centre with complete details.', icon: Building },
    { step: '02', title: 'Manage Centre', desc: 'Manage centre information, capacity, slots and daily procurement operations.', icon: Settings },
    { step: '03', title: 'Upload Crop Reference Images', desc: 'Upload high-quality reference images for each supported crop for quality analysis.', icon: ImageIcon },
    { step: '04', title: 'Manage Farmer Knowledge Hub', desc: 'Add and manage farming information from high-performing farmers associated with the centre.', icon: BookOpen },
    { step: '05', title: 'Manage Farmer Capacity & Queue', desc: 'Monitor farmers, slot capacity, tokens and manage the live queue flow.', icon: Users },
    { step: '06', title: 'Track Procurement Tasks', desc: 'Manage farmer processing: check-in, KYC, lot creation, weighing and quality assessment.', icon: FileText },
    { step: '07', title: 'Manage Payment Status', desc: 'Track and update farmer payment status so farmers can view current payment stage.', icon: DollarSign },
  ];

  const highlights = [
    { title: t('centreDetail.title'), desc: t('findCentres.searchByLocation') },
    { title: t('bookSlot.title'), desc: t('bookSlot.bookingDetails') },
    { title: t('queue.yourToken'), desc: t('queue.liveUpdates') },
    { title: t('queue.title'), desc: t('queue.estimatedWaitTime') },
    { title: t('procurement.title'), desc: t('procurement.procurementSlip') },
    { title: t('payment.paymentStatus'), desc: t('payment.dbtStatus') },
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

      {/* How to Use Section - Two Workflows */}
      <section className="py-16 md:py-24 bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs uppercase tracking-widest text-emerald-700 font-bold mb-2">
              How to Use Kisan Marg
            </h2>
            <h3 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
              Clear Steps for Every Role
            </h3>
            <p className="mt-3 text-stone-600 text-sm">
              Follow simple workflows designed for farmers and procurement centre operators.
            </p>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8">

            {/* FARMER WORKFLOW */}
            <div>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <UserCircle className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-serif font-bold text-stone-900">Farmer Workflow</h4>
              </div>

              <div className="space-y-4">
                {farmerWorkflow.map((step, idx) => {
                  const Icon = step.icon;
                  return (
                    <div key={step.step} className="flex gap-4">
                      <div className="flex flex-col items-center shrink-0">
                        <div className="w-12 h-12 rounded-full bg-emerald-50 border-2 border-emerald-700 text-emerald-700 flex items-center justify-center font-bold text-sm">
                          {step.step}
                        </div>
                        {idx < farmerWorkflow.length - 1 && (
                          <div className="w-0.5 h-12 bg-emerald-200 mt-2" />
                        )}
                      </div>
                      <div className="pb-4 pt-2">
                        <div className="flex items-start gap-2 mb-1">
                          <Icon className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                          <h5 className="font-semibold text-stone-900 text-sm">{step.title}</h5>
                        </div>
                        <p className="text-stone-600 text-sm leading-relaxed ml-7">{step.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* PROCUREMENT CENTRE WORKFLOW */}
            <div>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center">
                  <Building className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-serif font-bold text-stone-900">Centre Operator Workflow</h4>
              </div>

              <div className="space-y-4">
                {centreWorkflow.map((step, idx) => {
                  const Icon = step.icon;
                  return (
                    <div key={step.step} className="flex gap-4">
                      <div className="flex flex-col items-center shrink-0">
                        <div className="w-12 h-12 rounded-full bg-blue-50 border-2 border-blue-700 text-blue-700 flex items-center justify-center font-bold text-sm">
                          {step.step}
                        </div>
                        {idx < centreWorkflow.length - 1 && (
                          <div className="w-0.5 h-12 bg-blue-200 mt-2" />
                        )}
                      </div>
                      <div className="pb-4 pt-2">
                        <div className="flex items-start gap-2 mb-1">
                          <Icon className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                          <h5 className="font-semibold text-stone-900 text-sm">{step.title}</h5>
                        </div>
                        <p className="text-stone-600 text-sm leading-relaxed ml-7">{step.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
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
