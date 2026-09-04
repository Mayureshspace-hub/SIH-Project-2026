import React from 'react';
import { UserCheck, MapPin, Phone, Mail, ShieldCheck, Landmark, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const FarmerProfilePage: React.FC = () => {
  const { user, farmer } = useAuth();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
          Farmer Registry
        </span>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 mt-0.5">
          Farmer Profile &amp; KYC
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          Verified agricultural identity records synchronized with Maharashtra State APMC database.
        </p>
      </div>

      {/* Main Profile Card */}
      <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-100">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-800 text-white font-serif font-bold text-2xl flex items-center justify-center shadow-xs">
              {user?.name?.charAt(0) || 'R'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-stone-900">{user?.name || 'Rajesh Patil'}</h2>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  KYC VERIFIED
                </span>
              </div>
              <p className="text-xs font-mono text-stone-500 mt-0.5">
                Farmer Identification: <strong className="text-stone-800">{farmer?.farmerId || 'MH-NAG-2026-0814'}</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200">
            <span className="text-stone-400 block">Registered Mobile Number</span>
            <strong className="text-stone-900 font-mono text-sm mt-0.5 block">
              {farmer?.mobile || '+91 98223 45678'}
            </strong>
          </div>

          <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200">
            <span className="text-stone-400 block">Email Address</span>
            <strong className="text-stone-900 text-sm mt-0.5 block">
              {user?.email || 'farmer@demo.com'}
            </strong>
          </div>

          <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200">
            <span className="text-stone-400 block">Village &amp; Tehsil</span>
            <strong className="text-stone-900 text-sm mt-0.5 block">
              {farmer?.village || 'Sawangi, Parseoni'}
            </strong>
          </div>

          <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200">
            <span className="text-stone-400 block">District &amp; State</span>
            <strong className="text-stone-900 text-sm mt-0.5 block">
              {farmer?.district || 'Nagpur'}, Maharashtra
            </strong>
          </div>

          <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200">
            <span className="text-stone-400 block">Verified Land Holding</span>
            <strong className="text-stone-900 text-sm mt-0.5 block">
              {farmer?.landArea || '6.5'} Acres (7/12 Extract Recorded)
            </strong>
          </div>

          <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200">
            <span className="text-stone-400 block">Direct Bank Transfer (DBT) Status</span>
            <strong className="text-emerald-800 font-semibold text-sm mt-0.5 block flex items-center gap-1">
              <Landmark className="w-3.5 h-3.5" />
              Aadhaar-Linked (SBI Bank •••• 4921)
            </strong>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-xs text-stone-500">
          To update your registered landholding or change your Aadhaar-linked bank account, contact your local Tehsil Agriculture Officer or the Parseoni APMC Desk.
        </div>
      </div>
    </div>
  );
};
