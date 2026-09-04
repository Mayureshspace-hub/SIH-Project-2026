import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Radio, RefreshCw, Building2, Clock, CheckCircle2 } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import { api } from '../../services/api';

export const AdminQueuePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { lastQueueUpdate, joinCentreQueueRoom } = useSocket();

  const [centres, setCentres] = useState<any[]>([]);
  const [selectedCentreId, setSelectedCentreId] = useState(
    searchParams.get('centreId') || 'centre-parseoni'
  );
  const [queueData, setQueueData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getCentres().then((res) => setCentres(res));
  }, []);

  const fetchCentreQueue = (cId: string) => {
    setLoading(true);
    api.getCenterTodayQueue(cId)
      .then((res) => {
        setQueueData(res);
        joinCentreQueueRoom(cId);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (selectedCentreId) {
      fetchCentreQueue(selectedCentreId);
      setSearchParams({ centreId: selectedCentreId });
    }
  }, [selectedCentreId]);

  useEffect(() => {
    if (lastQueueUpdate && lastQueueUpdate.centreId === selectedCentreId) {
      setQueueData(lastQueueUpdate);
    }
  }, [lastQueueUpdate, selectedCentreId]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-3xl border border-stone-200 shadow-xs">
        <div>
          <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block">
            Central Dispatch Oversight
          </span>
          <h1 className="text-2xl font-serif font-bold text-stone-900 mt-0.5">
            Regional Live Queue Monitor
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Real-time live queue telemetrics across district weighbridges.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedCentreId}
            onChange={(e) => setSelectedCentreId(e.target.value)}
            className="py-2 px-3 text-xs font-semibold bg-stone-50 border border-stone-200 rounded-xl"
          >
            {centres.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <button
            onClick={() => fetchCentreQueue(selectedCentreId)}
            className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Queue items for selected centre */}
      <div className="space-y-3">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-20 bg-white rounded-2xl border border-stone-200 animate-pulse" />
            ))}
          </div>
        ) : (!queueData?.queue || queueData.queue.length === 0) ? (
          <div className="bg-white p-12 text-center rounded-3xl border border-stone-200">
            <p className="text-sm font-semibold text-stone-700">No active queue for this centre today</p>
          </div>
        ) : (
          queueData.queue.map((item: any, idx: number) => (
            <div
              key={item.id || idx}
              className="bg-white border border-stone-200 rounded-2xl p-4 sm:p-5 shadow-xs flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono font-bold text-xs bg-stone-100 text-stone-700 px-2.5 py-1.5 rounded-xl">
                  #{idx + 1}
                </span>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base font-bold text-stone-900">{item.tokenNumber}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      item.status === 'CALLED' ? 'bg-amber-400 text-stone-950 animate-pulse' :
                      item.status === 'PROCESSING' ? 'bg-blue-600 text-white' :
                      item.status === 'COMPLETED' ? 'bg-emerald-700 text-white' :
                      'bg-stone-200 text-stone-700'
                    }`}>
                      {item.status}
                    </span>
                    <strong className="text-xs text-stone-800">{item.farmerName}</strong>
                  </div>

                  <p className="text-xs text-stone-500 mt-0.5">
                    {item.quantity} qtl • {item.cropName} • Slot: {item.slotTime}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[11px] text-stone-400 block">Est. Gate Wait</span>
                <span className="font-mono text-xs font-bold text-stone-700">
                  {item.estimatedWaitMinutes ? `${item.estimatedWaitMinutes}m` : '0m'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
