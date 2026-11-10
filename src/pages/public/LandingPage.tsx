import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'motion/react';
import { useTranslation } from 'react-i18next';

/* ─── Scroll fade-in animation wrapper ───────────────────────── */
const FadeIn: React.FC<{
  children: React.ReactNode;
  delay?: number;
  className?: string;
}> = ({ children, delay = 0, className = '' }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 22 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 22 }}
      transition={{ duration: 0.65, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/* ─── Floating animation variants ───────────────────────────── */
const floatAnimation = {
  y: [0, -7, 0],
  transition: {
    duration: 4,
    repeat: Infinity,
    ease: [0.42, 0, 0.58, 1] as any, // easeInOut
  },
};

const floatDelayedAnimation = {
  y: [0, -7, 0],
  transition: {
    duration: 4,
    delay: 2,
    repeat: Infinity,
    ease: [0.42, 0, 0.58, 1] as any, // easeInOut
  },
};

export const LandingPage: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="bg-[#F8FAF8] text-[#131D1D]">
      {/* ═══════════════════════ LIVE PROCUREMENT TICKER MARQUEE ═══════════════════════ */}
      <div className="bg-gradient-to-r from-[#175C4D] via-[#2F6A3E] to-[#4F8A5B] text-white py-2 overflow-hidden border-b border-[#4F8A5B]/30 text-xs font-semibold select-none">
        <div className="flex whitespace-nowrap animate-[marquee_26s_linear_infinite]">
          <div className="flex items-center space-x-8 px-4 shrink-0">
            <span className="inline-flex items-center gap-1.5 text-amber-300 font-bold">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]"></span>
              LIVE PROCUREMENT UPDATE:
            </span>
            <span className="text-emerald-100">
              Smart Procurement | Nearby Centres | Easy Slot Booking | Digital Token | Live Queue Updates | Payment Tracking
            </span>
          </div>
          <div aria-hidden="true" className="flex items-center space-x-8 px-4 shrink-0">
            <span className="inline-flex items-center gap-1.5 text-amber-300 font-bold">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]"></span>
              LIVE PROCUREMENT UPDATE:
            </span>
            <span className="text-emerald-100">
              Smart Procurement | Nearby Centres | Easy Slot Booking | Digital Token | Live Queue Updates | Payment Tracking
            </span>
          </div>
        </div>
      </div>

      {/* ═══════════════════════ HERO SECTION ═══════════════════════ */}
      <section
        className="relative pt-8 pb-16 lg:py-20 max-w-7xl mx-auto px-5 lg:px-12 overflow-hidden"
        id="home"
      >
        {/* Background gradient */}
        <div className="absolute inset-0 -z-20 overflow-hidden pointer-events-none bg-gradient-to-b from-[#f0fcfb] via-[#ebf6f5] to-[#F8FAF8] rounded-3xl"></div>

        {/* Decorative ambient circles */}
        <div className="absolute top-10 left-1/4 w-96 h-96 bg-emerald-200/20 rounded-full blur-3xl pointer-events-none -z-10 animate-[pulseSubtle_3s_cubic-bezier(0.4,0,0.6,1)_infinite]"></div>
        <div className="absolute bottom-5 right-10 w-80 h-80 bg-amber-200/20 rounded-full blur-3xl pointer-events-none -z-10 animate-[float_4s_ease-in-out_2s_infinite]"></div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Hero Text Column */}
          <div className="lg:col-span-6 space-y-6">
            <FadeIn>
              {/* Top Live Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#DDEBDD]/80 border border-[#4F8A5B]/30 text-[#175C4D] shadow-sm transition-transform hover:scale-105">
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite] absolute inline-flex h-full w-full rounded-full bg-[#4F8A5B] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#4F8A5B]"></span>
                </span>
                <span className="text-xs font-bold tracking-wide uppercase text-[#175C4D]">
                  {t('homeStitch.officialPlatform')}
                </span>
              </div>
            </FadeIn>

            <FadeIn delay={0.1}>
              {/* Hero Headline */}
              <h1 className="font-display font-black text-4xl sm:text-5xl lg:text-[54px] leading-[1.12] text-gray-900 tracking-tight">
                {t('homeStitch.empoweringFarmers')}
                <br />
                <span className="text-[#175C4D]">{t('homeStitch.smartProcurement')}</span>{' '}
                <span className="text-[#E8A317]">{t('homeStitch.lessWaiting')}</span>
              </h1>
            </FadeIn>

            <FadeIn delay={0.2}>
              {/* Subheading */}
              <p className="text-base sm:text-lg text-gray-700 max-w-xl leading-relaxed">
                {t('homeStitch.heroDescription')}
              </p>
            </FadeIn>

            <FadeIn delay={0.3}>
              {/* Primary Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
                <Link
                  to="/centres"
                  className="relative group overflow-hidden inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-gradient-to-r from-[#175C4D] to-[#0F5B5B] hover:from-[#0F5B5B] hover:to-[#093F40] text-white font-display font-bold text-base shadow-lg shadow-emerald-900/10 hover:shadow-xl active:scale-[0.98] transition-all duration-200"
                >
                  <span className="absolute inset-0 w-1/2 h-full bg-white/10 skew-x-12 -translate-x-full group-hover:translate-x-[280%] transition-transform duration-700 ease-out"></span>
                  <span className="relative z-10 flex items-center gap-2">{t('homeStitch.findNearestCentre')}</span>
                  <svg className="relative z-10 w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
                <Link
                  to="/login"
                  className="group inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-[#175C4D]/40 hover:border-[#175C4D] bg-white hover:bg-gray-50 text-[#175C4D] font-display font-bold text-base transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98]"
                >
                  <svg className="w-5 h-5 text-[#E8A317] transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth={2} />
                    <line x1="16" y1="2" x2="16" y2="6" strokeWidth={2} />
                    <line x1="8" y1="2" x2="8" y2="6" strokeWidth={2} />
                    <line x1="3" y1="10" x2="21" y2="10" strokeWidth={2} />
                  </svg>
                  <span>{t('navigation.bookSlot')}</span>
                </Link>
              </div>
            </FadeIn>

            <FadeIn delay={0.4}>
              {/* Product Capability Badges */}
              <div className="pt-6 border-t border-gray-200">
                <p className="text-xs font-bold uppercase tracking-wider text-[#175C4D] mb-3 flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-[#E8A317]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                  </svg>
                  {t('homeStitch.coreCapabilities')}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { icon: 'verified_user', title: t('homeStitch.mspRates'), desc: t('homeStitch.governmentStandard'), color: 'text-[#175C4D]', bg: 'bg-[#DDEBDD]' },
                    { icon: 'event_available', title: t('homeStitch.onlineSlotBooking'), desc: t('homeStitch.zeroHighwayWaits'), color: 'text-[#4F8A5B]', bg: 'bg-[#DDEBDD]' },
                    { icon: 'payments', title: t('homeStitch.directDbt'), desc: t('homeStitch.aadhaarLinkedPay'), color: 'text-[#E8A317]', bg: 'bg-amber-50' },
                    { icon: 'sync_alt', title: t('homeStitch.liveQueueUpdates'), desc: t('homeStitch.realtimeGateToken'), color: 'text-[#175C4D]', bg: 'bg-[#DDEBDD]' },
                  ].map((badge, idx) => (
                    <div
                      key={idx}
                      className="group bg-white p-3 rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-[#175C4D] transition-all duration-200 hover:-translate-y-0.5 flex flex-col items-center sm:items-start text-center sm:text-left"
                    >
                      <div className={`w-8 h-8 rounded-lg ${badge.bg} ${badge.color} flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform font-bold text-lg`}>
                        {badge.icon === 'verified_user' && '✓'}
                        {badge.icon === 'event_available' && '📅'}
                        {badge.icon === 'payments' && '💳'}
                        {badge.icon === 'sync_alt' && '🔄'}
                      </div>
                      <span className="text-xs font-bold text-gray-900 leading-tight">{badge.title}</span>
                      <span className="text-[11px] text-gray-600 mt-0.5">{badge.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>
          </div>

          {/* Hero Visual Collage */}
          <div className="lg:col-span-6 relative">
            <FadeIn delay={0.3}>
              <div className="relative mx-auto max-w-[540px]">
                {/* Background Golden Field Image */}
                <div
                  className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white aspect-[16/10] bg-emerald-950 bg-cover bg-center group"
                  style={{ backgroundImage: "url('/assets/verified-centre-landscape.png')" }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4 text-white flex items-end justify-between">
                    <div>
                      <span className="inline-block px-2.5 py-0.5 rounded bg-emerald-700/90 backdrop-blur-sm text-[11px] font-bold tracking-wider uppercase mb-1 shadow-sm">
                        Kharif &amp; Rabi 2026
                      </span>
                      <p className="text-xs sm:text-sm font-medium text-emerald-50 drop-shadow">
                        Golden Fields, Guaranteed MSP Procurement
                      </p>
                    </div>
                    <span className="text-amber-300 text-2xl animate-[pulseSubtle_3s_cubic-bezier(0.4,0,0.6,1)_infinite]">🌿</span>
                  </div>
                </div>

                {/* Layered Second Image */}
                <motion.div
                  animate={floatAnimation}
                  className="absolute -bottom-10 -right-2 sm:-right-4 w-52 sm:w-72 rounded-2xl overflow-hidden shadow-2xl border-4 border-white bg-white transition-all duration-300 hover:scale-105 hover:shadow-emerald-950/20"
                >
                  <div className="aspect-[4/3] relative">
                    <img
                      alt="Indian farmers collaborating at agricultural procurement yard with digital tablet and grain sacks"
                      className="w-full h-full object-cover object-center"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuCXhtp7vYIPawsjpakdjZ5QtJDt1Rg_FhN9cBd-0bfy4AHnj5A9xBlC_5KT-rKxjZdQ78SZmRrxYP_bgH7TUr9SL2Mt0CrHWJuepA66I2eAGO6RrYD-_azXqHGJje3Aky9Aga39667Rdwons6LkX8OmWOg_vkSRPPasglmv-Ilhh3ighWlnAgm1U56B8QjhVhG9HRp5lH4c4qBGaLu-rCin-N4SxIgR_aNiutqWhL0pMScD_i59xHc1mA"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/80 via-transparent to-transparent"></div>
                    <div className="absolute bottom-2.5 left-3 right-3 text-white">
                      <span className="text-[11px] font-bold block leading-tight flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]"></span>
                        Farmer-First Centre
                      </span>
                      <span className="text-[10px] text-emerald-200">Fair Weight &amp; Instant Verification</span>
                    </div>
                  </div>
                </motion.div>

                {/* Floating Trust Badge */}
                <motion.div
                  animate={floatDelayedAnimation}
                  className="absolute -top-4 -left-3 sm:-left-6 bg-white/95 backdrop-blur-md py-2.5 px-4 rounded-2xl shadow-xl border border-emerald-900/15 flex items-center gap-3 hover:scale-105 transition-transform duration-200"
                >
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#175C4D] to-[#4F8A5B] text-white flex items-center justify-center shadow-md animate-[pulseSubtle_3s_cubic-bezier(0.4,0,0.6,1)_infinite]">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-900 leading-tight">Verified Centre Network</div>
                    <div className="text-[11px] font-semibold text-[#175C4D]">100% Direct DBT Bank Credit</div>
                  </div>
                </motion.div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ═══════════════════ 4-PILLAR SERVICE CARDS ═══════════════════ */}
      <section className="py-12 lg:py-16 max-w-7xl mx-auto px-5 lg:px-12" id="services">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <FadeIn>
            <span className="text-xs font-bold font-display uppercase tracking-widest text-[#175C4D] bg-[#DDEBDD] px-3.5 py-1 rounded-full border border-[#4F8A5B]/30 inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#4F8A5B] animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]"></span>
              {t('homeStitch.coreServices')}
            </span>
            <h2 className="text-3xl sm:text-4xl font-black font-display text-gray-900 tracking-tight mt-3">
              {t('homeStitch.featuresHeading')}
            </h2>
            <p className="text-gray-600 text-sm sm:text-base mt-2">
              {t('homeStitch.featuresDescription')}
            </p>
          </FadeIn>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: '📍',
              title: t('homeStitch.centreLocator'),
              desc: t('homeStitch.centreLocatorDescription'),
              link: '/centres',
              linkText: t('homeStitch.checkLocalCentres'),
              gradient: 'from-[#175C4D] to-[#4F8A5B]',
              hoverColor: 'hover:text-[#175C4D]',
              textColor: 'text-[#175C4D]',
            },
            {
              icon: '📅',
              title: t('homeStitch.slotTokenBooking'),
              desc: t('homeStitch.slotTokenDescription'),
              link: '/login',
              linkText: t('homeStitch.reserveSlot'),
              gradient: 'from-[#2F6A3E] to-[#4F8A5B]',
              hoverColor: 'hover:text-[#4F8A5B]',
              textColor: 'text-[#4F8A5B]',
            },
            {
              icon: '🚜',
              title: t('homeStitch.gateQueueTracker'),
              desc: t('homeStitch.gateQueueDescription'),
              link: '/login',
              linkText: t('homeStitch.trackGateToken'),
              gradient: 'from-[#E8A317] to-[#F59E0B]',
              hoverColor: 'hover:text-amber-700',
              textColor: 'text-amber-700',
            },
            {
              icon: '🏦',
              title: t('homeStitch.instantDbt'),
              desc: t('homeStitch.instantDbtDescription'),
              link: '/login',
              linkText: t('payment.paymentStatus'),
              gradient: 'from-[#175C4D] to-[#2F6A3E]',
              hoverColor: 'hover:text-[#175C4D]',
              textColor: 'text-[#175C4D]',
            },
          ].map((card, idx) => (
            <FadeIn key={idx} delay={idx * 0.1}>
              <div className="group bg-white rounded-2xl p-6 border border-[#4F8A5B]/20 hover:border-[#175C4D] hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 relative overflow-hidden flex flex-col justify-between h-full">
                <div className="absolute -top-12 -right-12 w-28 h-28 bg-[#DDEBDD]/50 rounded-full group-hover:scale-150 transition-transform duration-500 -z-0"></div>
                <div className="relative z-10">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${card.gradient} text-white flex items-center justify-center mb-5 shadow-md shadow-emerald-900/20 group-hover:rotate-6 group-hover:scale-110 transition-transform duration-300 text-3xl`}>
                    {card.icon}
                  </div>
                  <h3 className={`text-lg font-bold font-display text-gray-900 mb-2 leading-snug ${card.hoverColor} transition-colors`}>
                    {card.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed mb-4">{card.desc}</p>
                </div>
                <div className={`relative z-10 flex items-center text-xs font-bold ${card.textColor} gap-1 group-hover:gap-2.5 transition-all pt-2 border-t border-gray-100`}>
                  <span>{card.linkText}</span>
                  <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ═══════════════ SEAMLESS FARMER JOURNEY ═══════════════ */}
      <section className="py-14 lg:py-20 bg-white border-y border-[#4F8A5B]/20 relative overflow-hidden" id="journey">
        <div className="max-w-7xl mx-auto px-5 lg:px-12">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <FadeIn>
              <span className="text-xs font-bold font-display uppercase tracking-widest text-[#175C4D] bg-[#DDEBDD] px-3.5 py-1 rounded-full border border-[#4F8A5B]/30">
                {t('homeStitch.transparentProcess')}
              </span>
              <h2 className="text-3xl sm:text-4xl font-black font-display text-gray-900 tracking-tight mt-3">
                {t('homeStitch.journeyHeading')}
              </h2>
            </FadeIn>
          </div>

          <div className="relative overflow-x-auto pb-6">
            {/* Connecting animated gradient line */}
            <div className="hidden lg:block absolute top-7 left-12 right-12 h-1.5 rounded-full shadow-[0_0_12px_rgba(15,91,91,0.35)] -z-0 bg-gradient-to-r from-[#175C4D] via-[#2F6A3E] to-[#E8A317] animate-[gradientX_6s_ease_infinite]" style={{ backgroundSize: '200% 200%' }}></div>

            <div className="grid grid-cols-7 gap-3 min-w-[980px] relative z-10">
              {[
                { num: '01', step: 'Step 1', title: 'Find Centre', active: true },
                { num: '02', step: 'Step 2', title: 'Crop & Quantity', active: true },
                { num: '03', step: 'Step 3', title: 'Pick Date/Slot', active: true },
                { num: '04', step: 'Step 4', title: 'Instant SMS Token', active: false },
                { num: '05', step: 'Step 5', title: 'Track Queue', active: false },
                { num: '06', step: 'Step 6', title: 'Procurement', active: true },
                { num: '07', step: 'Final Step', title: 'Payment Status', active: false, final: true },
              ].map((item, idx) => (
                <FadeIn key={idx} delay={idx * 0.05}>
                  <div className="flex flex-col items-center text-center group cursor-pointer transition-transform duration-300 hover:-translate-y-1.5">
                    <div
                      className={`w-14 h-14 rounded-2xl bg-white border-2 ${
                        item.final
                          ? 'bg-gradient-to-br from-[#E8A317] to-[#F59E0B] text-white border-transparent'
                          : item.active
                          ? 'border-[#175C4D] text-[#175C4D]'
                          : 'border-[#4F8A5B] text-[#4F8A5B]'
                      } flex items-center justify-center font-display font-black text-lg shadow-md group-hover:bg-[#175C4D] group-hover:text-white group-hover:scale-110 group-hover:shadow-lg transition-all duration-300 mb-3 relative`}
                    >
                      {item.num}
                      {item.num === '01' && (
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#4F8A5B] rounded-full animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]"></span>
                      )}
                      {item.final && (
                        <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-amber-300 rounded-full animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]"></span>
                      )}
                    </div>
                    <span
                      className={`text-[11px] font-bold uppercase tracking-wider ${
                        item.final ? 'text-amber-700' : item.active ? 'text-gray-500' : 'text-[#4F8A5B]'
                      } group-hover:text-[#175C4D] transition-colors`}
                    >
                      {item.step}
                    </span>
                    <h4 className="text-sm font-bold text-gray-900 mt-1">{item.title}</h4>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ PANORAMIC FIELD SHOWCASE ═══════════════ */}
      <section className="max-w-7xl mx-auto px-5 lg:px-12 py-12 lg:py-16" id="about">
        <FadeIn>
          <div className="relative rounded-3xl overflow-hidden shadow-xl border border-emerald-900/10 min-h-[500px] flex items-center group">
            {/* Full-width backdrop */}
            <img
              alt="Authentic agricultural procurement collection centre in rural India with tractors and grain sacks"
              className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-1000 ease-out"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCT6XmsZokybiZCiHDLDTIkCUpxhAUq4TOjO7QFMUlcvAjMDX-U-zfNtpWbiFcwtqQDrZOtMKyyBViuYu3b8_zTtWa2B0N2tRP1Sw_c_z8yi9ko80fUgD5Oe_O7L7Tdqpx-6qOQVYK-XLdgLDVyGOI_U5Ne3KFF8VKYppVYzR1iYDL7nZOTRNcHK-pjfjsZ2FMbJ0jw_rMs_i16kNtkrd0kVt1M5nurVvelnXZ1bE8_LdPxpRLYS0dcqA"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-black/30"></div>

            {/* Glassmorphic callout */}
            <div className="relative z-10 m-6 sm:m-12 max-w-xl bg-white/95 backdrop-blur-md p-8 sm:p-10 rounded-2xl border border-white/60 shadow-2xl transition-all duration-300 hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-[#2F6A3E] text-xs font-bold uppercase tracking-wider mb-3">
                <span className="text-base">🌾</span>
                <span>Ground-Level Integrity</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black font-display text-gray-900 tracking-tight mb-3">
                Built for Farmers, Run by Transparency
              </h3>
              <p className="text-sm sm:text-base text-gray-600 mb-6 leading-relaxed">
                Kisan Marg bridges the ground friction between harvested fields and state collection centres, ensuring every quintal is weighed honestly and without exploitation.
              </p>
              <div className="space-y-3.5 pt-4 border-t border-gray-200">
                {[
                  { title: 'Transparent weighbridge logs', desc: 'Every tare and gross weight recorded digitally on cloud ledger.' },
                  { title: 'SMS tokens for basic keypad phones', desc: 'No smartphone or internet required on transit day; instant SMS updates.' },
                  { title: 'No overnight waits on highways', desc: 'Verified arrival slots keep tractors rolling directly into procurement sheds.' },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 group/item">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 text-[#2F6A3E] flex items-center justify-center shrink-0 mt-0.5 group-hover/item:bg-emerald-600 group-hover/item:text-white transition-colors duration-200 font-bold">
                      ✓
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">{item.title}</h4>
                      <p className="text-xs text-gray-500">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* ═══════════════════ FINAL HERO CTA SECTION ═══════════════════ */}
      <section className="max-w-7xl mx-auto px-5 lg:px-12 py-12 lg:py-16" id="locator">
        <FadeIn>
          <div
            className="relative rounded-3xl overflow-hidden p-8 sm:p-14 lg:p-16 shadow-2xl text-center"
            style={{ background: 'linear-gradient(135deg, rgb(23, 92, 77) 0%, rgb(15, 62, 52) 100%)' }}
          >
            <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-emerald-400/20 blur-3xl pointer-events-none animate-[pulseSubtle_3s_cubic-bezier(0.4,0,0.6,1)_infinite]"></div>
            <div className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-amber-400/20 blur-3xl pointer-events-none animate-[float_4s_ease-in-out_infinite]"></div>

            <div className="relative z-10 max-w-2xl mx-auto space-y-6">
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/10 text-emerald-200 text-xs font-bold uppercase tracking-wider border border-white/20 backdrop-blur-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]"></span>
                Direct &amp; Transparent Access
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-display text-white tracking-tight leading-tight">
                Experience Effortless Centre Procurement Today
              </h2>
              <p className="text-base sm:text-lg text-emerald-100 leading-relaxed font-normal">
                Save valuable hours, eliminate middlemen interference, and receive direct MSP credit in your bank account with complete transparency.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-3">
                <Link
                  to="/login"
                  className="relative group overflow-hidden w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-[#E8A317] to-[#F59E0B] hover:from-[#d69512] hover:to-[#e08e04] text-gray-950 font-display font-extrabold text-base shadow-lg hover:shadow-2xl transition-all duration-200 active:scale-95 hover:-translate-y-0.5"
                >
                  <span className="absolute inset-0 w-1/2 h-full bg-white/30 skew-x-12 -translate-x-full group-hover:translate-x-[300%] transition-transform duration-700 ease-out"></span>
                  <span className="relative z-10">{t('homeStitch.signInToPlatform')}</span>
                  <span className="relative z-10 text-xl">🔐</span>
                </Link>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 pt-4 text-xs font-semibold text-emerald-200">
                <span className="flex items-center gap-1.5">
                  <span className="text-sm">🔒</span>
                  Bank Grade Security
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="text-sm">📱</span>
                  Mobile Friendly
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="text-sm">✓</span>
                  100% Free for Farmers
                </span>
              </div>
            </div>
          </div>
        </FadeIn>
      </section>
    </div>
  );
};
