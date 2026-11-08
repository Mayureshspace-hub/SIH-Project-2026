import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  ShieldAlert,
  Building,
  Check,
  Filter,
  Eye,
  User,
  Info,
} from 'lucide-react';
import { procurementService, CentrePaymentRecord } from '../services/procurementService';

export const PaymentTracking: React.FC = () => {
  const [payments, setPayments] = useState<CentrePaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'PROCESSING' | 'PAID'>('ALL');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const data = await procurementService.getPaymentRecords();
      setPayments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleStatusChange = async (paymentId: string, farmerName: string, newStatus: 'PENDING' | 'PROCESSING' | 'PAID') => {
    setUpdatingId(paymentId);
    try {
      await procurementService.updatePaymentStatus(paymentId, newStatus);
      await fetchPayments();
      setSuccessBanner(`Payment status updated to "${newStatus}" for ${farmerName}. Updated status is now reflected in the farmer's portal.`);
      setTimeout(() => setSuccessBanner(null), 5000);
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  // Filtered payments
  const filteredPayments = payments.filter((p) => {
    const matchesSearch =
      p.farmerName.toLowerCase().includes(search.toLowerCase()) ||
      p.farmerId.toLowerCase().includes(search.toLowerCase()) ||
      p.tokenNumber.toLowerCase().includes(search.toLowerCase()) ||
      (p.transactionRef && p.transactionRef.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Aggregated metrics
  const totalPaid = payments
    .filter((p) => p.status === 'PAID')
    .reduce((sum, p) => sum + p.amount, 0);
  const totalProcessing = payments
    .filter((p) => p.status === 'PROCESSING')
    .reduce((sum, p) => sum + p.amount, 0);
  const totalPending = payments
    .filter((p) => p.status === 'PENDING')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0f5e59] via-[#12706a] to-[#185c52] rounded-3xl p-6 sm:p-8 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-200 text-xs font-semibold mb-3 border border-white/10">
            <CreditCard className="w-3.5 h-3.5 text-[#f7c531]" />
            <span>DBT & PFMS Disbursement Status Tracking</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight">
            Payment Status Tracking
          </h1>
          <p className="text-emerald-100 text-xs sm:text-sm mt-1 max-w-xl">
            Monitor and update Direct Benefit Transfer clearing stages for farmers who delivered crops at Parseoni Centre.
          </p>
        </div>

        <button
          onClick={fetchPayments}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-sm transition-all border border-white/10 self-stretch sm:self-auto justify-center"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Records
        </button>
      </div>

      {/* Strict Compliance Notice - No Payment Processing */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 text-amber-900 shadow-sm">
        <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm">
          <p className="font-semibold text-amber-950">
            System Notice: Status Tracking Only (No Fund Movement or Receipt Generation)
          </p>
          <p className="text-amber-800 mt-0.5 leading-relaxed">
            This module is strictly designed for tracking government PFMS and treasury disbursement milestones (Pending, Processing, or Paid). This system does not process monetary payments or generate banking receipts. Changes immediately update the status visible to the respective farmer.
          </p>
        </div>
      </div>

      {/* Notification banner on status change */}
      {successBanner && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl p-4 flex items-center justify-between gap-3 text-sm animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span className="font-medium">{successBanner}</span>
          </div>
          <button
            onClick={() => setSuccessBanner(null)}
            className="text-xs text-emerald-700 hover:text-emerald-950 font-semibold px-2 py-1 rounded-lg hover:bg-emerald-100"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Paid / Cleared */}
        <div className="bg-white rounded-2xl p-5 border border-emerald-100 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
              Disbursed (Paid)
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-serif text-gray-900 mt-2">
            ₹{totalPaid.toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-emerald-700 font-medium mt-1">
            {payments.filter((p) => p.status === 'PAID').length} farmer accounts credited
          </div>
        </div>

        {/* Processing in Bank */}
        <div className="bg-white rounded-2xl p-5 border border-blue-100 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-800">
              In Processing (Treasury)
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-serif text-gray-900 mt-2">
            ₹{totalProcessing.toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-blue-700 font-medium mt-1">
            {payments.filter((p) => p.status === 'PROCESSING').length} batches with PFMS verification
          </div>
        </div>

        {/* Pending Clearance */}
        <div className="bg-white rounded-2xl p-5 border border-amber-100 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-800">
              Pending Authorization
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-serif text-gray-900 mt-2">
            ₹{totalPending.toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-amber-700 font-medium mt-1">
            {payments.filter((p) => p.status === 'PENDING').length} newly approved deliveries
          </div>
        </div>
      </div>

      {/* Controls & Filters */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by farmer name, ID, token, or UTR/PFMS..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f5e59] focus:border-transparent transition-all"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs font-semibold text-gray-500 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Status:
          </span>
          {(['ALL', 'PENDING', 'PROCESSING', 'PAID'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                statusFilter === status
                  ? 'bg-[#0f5e59] text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status === 'ALL' ? 'All Records' : status}
            </button>
          ))}
        </div>
      </div>

      {/* Payment Records Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              Procurement Payment Records ({filteredPayments.length})
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Click any status button to advance the payment status and sync with the farmer view.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-500">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#0f5e59] mb-2" />
            <p className="text-sm">Loading payment tracking records...</p>
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-700">No payment records found</p>
            <p className="text-xs text-gray-500 mt-1">Try adjusting your search or status filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600 text-xs font-semibold uppercase tracking-wider border-b border-gray-100">
                <tr>
                  <th className="px-5 py-3.5">Farmer & Token</th>
                  <th className="px-5 py-3.5">Crop Details</th>
                  <th className="px-5 py-3.5">Valuation (Amount)</th>
                  <th className="px-5 py-3.5">Bank & Reference</th>
                  <th className="px-5 py-3.5">Current Status</th>
                  <th className="px-5 py-3.5 text-right">Update Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredPayments.map((record) => {
                  const isUpdating = updatingId === record.id;

                  return (
                    <tr key={record.id} className="hover:bg-gray-50/70 transition-colors">
                      {/* Farmer & Token */}
                      <td className="px-5 py-4">
                        <div className="font-semibold text-gray-900 flex items-center gap-2">
                          <span>{record.farmerName}</span>
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono font-semibold">
                            {record.tokenNumber}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 font-mono mt-0.5">
                          ID: {record.farmerId}
                        </div>
                      </td>

                      {/* Crop */}
                      <td className="px-5 py-4">
                        <div className="text-sm font-medium text-gray-800">{record.cropName}</div>
                        <div className="text-xs text-gray-500 mt-0.5">Proc ID: {record.procurementId}</div>
                      </td>

                      {/* Valuation */}
                      <td className="px-5 py-4">
                        <div className="text-base font-bold font-serif text-gray-900">
                          ₹{record.amount.toLocaleString('en-IN')}
                        </div>
                        <div className="text-[11px] text-gray-500">Government MSP Rate</div>
                      </td>

                      {/* Bank & Reference */}
                      <td className="px-5 py-4">
                        <div className="text-xs font-medium text-gray-800 flex items-center gap-1.5">
                          <Building className="w-3.5 h-3.5 text-gray-400" />
                          <span>{record.bankName}</span>
                          <span className="text-gray-400 font-mono">({record.accountEnding})</span>
                        </div>
                        <div className="text-[11px] text-gray-500 font-mono mt-0.5">
                          {record.transactionRef ? (
                            <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                              Ref: {record.transactionRef}
                            </span>
                          ) : (
                            <span className="text-gray-400 italic">PFMS Ref Pending</span>
                          )}
                        </div>
                        <div className="text-[10px] text-gray-400 mt-0.5">
                          Last updated: {record.updatedAt}
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="px-5 py-4">
                        {record.status === 'PAID' && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Paid (Cleared)
                          </span>
                        )}
                        {record.status === 'PROCESSING' && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                            <Clock className="w-3.5 h-3.5 text-blue-600 animate-spin" />
                            Processing
                          </span>
                        )}
                        {record.status === 'PENDING' && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                            Pending
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right">
                        <div className="inline-flex items-center gap-1 bg-gray-100 p-1 rounded-xl border border-gray-200">
                          <button
                            onClick={() => handleStatusChange(record.id, record.farmerName, 'PENDING')}
                            disabled={isUpdating || record.status === 'PENDING'}
                            title="Set status to Pending"
                            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                              record.status === 'PENDING'
                                ? 'bg-amber-500 text-white shadow-sm'
                                : 'text-gray-600 hover:text-amber-800 hover:bg-amber-50'
                            }`}
                          >
                            Pending
                          </button>
                          <button
                            onClick={() => handleStatusChange(record.id, record.farmerName, 'PROCESSING')}
                            disabled={isUpdating || record.status === 'PROCESSING'}
                            title="Set status to Processing"
                            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                              record.status === 'PROCESSING'
                                ? 'bg-blue-600 text-white shadow-sm'
                                : 'text-gray-600 hover:text-blue-800 hover:bg-blue-50'
                            }`}
                          >
                            Processing
                          </button>
                          <button
                            onClick={() => handleStatusChange(record.id, record.farmerName, 'PAID')}
                            disabled={isUpdating || record.status === 'PAID'}
                            title="Set status to Paid"
                            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                              record.status === 'PAID'
                                ? 'bg-emerald-600 text-white shadow-sm'
                                : 'text-gray-600 hover:text-emerald-800 hover:bg-emerald-50'
                            }`}
                          >
                            Paid
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer info */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-2">
          <div className="flex items-center gap-1.5">
            <Info className="w-4 h-4 text-gray-400" />
            <span>Changes reflect immediately to farmer dashboards and notification channels.</span>
          </div>
          <div className="font-semibold text-gray-700">
            Total Tracked Volume: ₹{(totalPaid + totalProcessing + totalPending).toLocaleString('en-IN')}
          </div>
        </div>
      </div>
    </div>
  );
};
