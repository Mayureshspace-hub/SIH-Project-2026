import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Banknote,
  CalendarCheck,
  CheckCircle2,
  ClipboardList,
  Clock3,
  MapPin,
  Scale,
  Search,
  ShieldCheck,
  Ticket,
  Users,
  UserRound,
  Warehouse,
} from 'lucide-react';

const farmerSteps = [
  {
    title: 'Register or log in',
    icon: UserRound,
    description:
      'Create an account or sign in, then provide your name, mobile number, village or location, and the farmer details requested by the system.',
  },
  {
    title: 'Choose a procurement center',
    icon: MapPin,
    description:
      'Explore available centers and review their location, operating status, and the procurement information shown for each center.',
  },
  {
    title: 'Check dates and slots',
    icon: CalendarCheck,
    description:
      'Review the dates and time slots currently offered for your selected center. Slot availability is shown when provided by the system.',
  },
  {
    title: 'Book and get your token',
    icon: Ticket,
    description:
      'Select a suitable slot and submit your booking. Your booking confirmation and token information are available after it is created.',
  },
  {
    title: 'Track your queue',
    icon: Clock3,
    description:
      'Check your booking and token position along with the queue status available for your center.',
  },
  {
    title: 'Visit the center',
    icon: Warehouse,
    description:
      'Arrive at the selected procurement center according to your assigned slot and token to help make the visit more organized.',
  },
  {
    title: 'Follow procurement and payment',
    icon: Banknote,
    description:
      'After your crop is processed, check the procurement record and follow the payment status shown in your account.',
  },
];

const centerSteps = [
  {
    title: 'Log in to the center dashboard',
    icon: ShieldCheck,
    description:
      'Center staff sign in to access the operational tools available to their account.',
  },
  {
    title: 'Manage daily slots',
    icon: CalendarCheck,
    description:
      'Review available procurement slots and the farmer bookings associated with them.',
  },
  {
    title: 'View the farmer queue',
    icon: Users,
    description:
      'See booked farmers and their token or queue status to understand who is expected at the center.',
  },
  {
    title: 'Process procurement',
    icon: Scale,
    description:
      'Process farmers in line with their assigned slot and queue, and record procurement using the system workflow.',
  },
  {
    title: 'Update procurement and payment',
    icon: CheckCircle2,
    description:
      'Record the relevant procurement outcome and update payment status after processing.',
  },
  {
    title: 'Monitor daily operations',
    icon: ClipboardList,
    description:
      'Review the operational view of farmer bookings, pending requests, completed procurement, and queue status.',
  },
];

type ProcessStepsProps = {
  steps: typeof farmerSteps;
  accent: 'emerald' | 'amber';
};

const ProcessSteps: React.FC<ProcessStepsProps> = ({ steps, accent }) => {
  const colors = accent === 'emerald'
    ? { icon: 'bg-emerald-50 text-emerald-800 border-emerald-100', number: 'text-emerald-800', line: 'bg-emerald-200' }
    : { icon: 'bg-amber-50 text-amber-800 border-amber-100', number: 'text-amber-800', line: 'bg-amber-200' };

  return (
    <ol className="relative space-y-4 sm:space-y-5">
      {steps.map((step, index) => {
        const Icon = step.icon;
        return (
          <li key={step.title} className="relative flex gap-4 sm:gap-5">
            {index < steps.length - 1 && (
              <span aria-hidden="true" className={`absolute left-6 top-14 bottom-[-1.25rem] w-px ${colors.line}`} />
            )}
            <div className={`relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border ${colors.icon}`}>
              <Icon className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1 rounded-2xl border border-stone-200 bg-white p-4 sm:p-5">
              <div className="mb-1 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <span className={`font-mono text-xs font-bold ${colors.number}`}>STEP {String(index + 1).padStart(2, '0')}</span>
                <h3 className="text-base font-bold text-stone-900">{step.title}</h3>
              </div>
              <p className="text-sm leading-relaxed text-stone-600">{step.description}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
};

export const HowItWorksPage: React.FC = () => (
  <main className="bg-stone-50 py-12 text-stone-900 md:py-20">
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      <header className="mx-auto mb-12 max-w-2xl text-center sm:mb-14">
        <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-emerald-700">System Guide</span>
        <h1 className="font-serif text-3xl font-bold text-emerald-950 sm:text-4xl">How KisanSetu Works</h1>
        <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-stone-600">
          A clear view of the procurement journey, from booking a center visit to tracking the outcome.
        </p>
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-2 lg:gap-8">
        <section aria-labelledby="farmers-heading" className="rounded-3xl border border-emerald-100 bg-emerald-50/60 p-4 sm:p-6 lg:p-7">
          <div className="mb-6 flex items-center gap-3 sm:mb-7">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-800 text-white">
              <UserRound className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">The farmer journey</p>
              <h2 id="farmers-heading" className="text-xl font-bold text-emerald-950 sm:text-2xl">For Farmers</h2>
            </div>
          </div>
          <ProcessSteps steps={farmerSteps} accent="emerald" />
        </section>

        <section aria-labelledby="centers-heading" className="rounded-3xl border border-amber-100 bg-amber-50/60 p-4 sm:p-6 lg:p-7">
          <div className="mb-6 flex items-center gap-3 sm:mb-7">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-700 text-white">
              <Warehouse className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-amber-800">The center workflow</p>
              <h2 id="centers-heading" className="text-xl font-bold text-stone-900 sm:text-2xl">For Procurement Centers</h2>
            </div>
          </div>
          <ProcessSteps steps={centerSteps} accent="amber" />
        </section>
      </div>

      <div className="mt-10 text-center sm:mt-12">
        <Link
          to="/login"
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-800 px-6 py-3 font-medium text-white transition hover:bg-emerald-900"
        >
          <Search className="h-4 w-4" aria-hidden="true" />
          <span>Get started with KisanSetu</span>
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </div>
  </main>
);
