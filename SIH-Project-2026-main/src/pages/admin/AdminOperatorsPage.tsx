import React, { useState, useEffect } from 'react';
import { UserCheck, Plus, Building2, Phone, Mail, X } from 'lucide-react';
import { api } from '../../services/api';

export const AdminOperatorsPage: React.FC = () => {
  const [operators, setOperators] = useState<any[]>([]);
  const [centres, setCentres] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // Form state for creating operator account
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [badgeNo, setBadgeNo] = useState('');
  const [centreId, setCentreId] = useState('');
  const [password, setPassword] = useState('Operator@123');
  const [submitting, setSubmitting] = useState(false);

  const fetchOperators = () => {
    setLoading(true);
    Promise.all([api.getOperators(), api.getCentres()])
      .then(([opsData, centresData]) => {
        setOperators(opsData);
        setCentres(centresData);
        if (centresData.length > 0) {
          setCentreId(centresData[0].id);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOperators();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.createOperator({
        name,
        email,
        mobile,
        badgeNo,
        centreId,
        password,
      });
      setModalOpen(false);
      fetchOperators();
    } catch (err: any) {
      alert(err.message || 'Failed to register operator');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-3xl border border-stone-200 shadow-xs">
        <div>
          <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block">
            Station Personnel
          </span>
          <h1 className="text-2xl font-serif font-bold text-stone-900 mt-0.5">
            Procurement Centre Operators
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Authorized personnel credentials for APMC weighbridge terminals and intake verification.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold transition cursor-pointer self-start sm:self-auto shadow-xs"
        >
          <Plus className="w-4 h-4 text-amber-400" />
          <span>Provision Operator Account</span>
        </button>
      </div>

      {/* Operators List (Card format) */}
      <div className="space-y-3">
        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((n) => (
              <div key={n} className="h-28 bg-white rounded-2xl border border-stone-200 animate-pulse" />
            ))}
          </div>
        ) : (
          operators.map((op) => (
            <div
              key={op.id}
              className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base text-stone-900">{op.name}</h3>
                  <span className="font-mono text-xs text-stone-500 px-2 py-0.5 rounded bg-stone-100">
                    Badge: {op.badgeNo}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    AUTHORIZED
                  </span>
                </div>

                <p className="text-xs text-stone-500 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-amber-700" />
                  <span>Assigned Centre: <strong>{op.centreName || 'Parseoni Procurement Centre'}</strong></span>
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-stone-500">
                  <span>✉️ {op.email}</span>
                  <span>📱 {op.mobile}</span>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-[11px] text-stone-400 block">Security Level</span>
                <span className="text-xs font-semibold text-stone-800">Terminal Operational Admin</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal: Provision Operator */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-bold text-lg text-stone-900">Provision Operator Account</h3>
              <button onClick={() => setModalOpen(false)} className="p-1.5 rounded-lg text-stone-400 hover:bg-stone-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Operator Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sunil Mahajan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="operator@demo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Mobile</label>
                  <input
                    type="tel"
                    required
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Badge ID</label>
                  <input
                    type="text"
                    required
                    placeholder="REG-PRS-002"
                    value={badgeNo}
                    onChange={(e) => setBadgeNo(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Assigned Centre</label>
                <select
                  value={centreId}
                  onChange={(e) => setCentreId(e.target.value)}
                  className="w-full py-2 px-3 text-xs bg-stone-50 border border-stone-200 rounded-xl"
                >
                  {centres.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Temporary Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Provision Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
