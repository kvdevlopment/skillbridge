'use client';
import { useAuth } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function MonitoringOfficerDashboard({ user }: { user: any }) {
  const { getToken } = useAuth();
  const [summary, setSummary] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const token = await getToken();
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/programme/summary`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSummary(res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const totals = Object.values(summary).reduce(
    (acc: any, d: any) => ({
      present: acc.present + (d.present || 0),
      absent: acc.absent + (d.absent || 0),
      late: acc.late + (d.late || 0),
    }),
    { present: 0, absent: 0, late: 0 }
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold">Monitoring Officer</h1>
              <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full border">
                👁 Read Only
              </span>
            </div>
            <p className="text-gray-400 text-sm mt-1">Namaste, {user.name}!</p>
          </div>
        </div>

        {/* Top stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-white rounded-2xl border p-5 text-center">
            <p className="text-3xl font-bold text-green-600">{totals.present}</p>
            <p className="text-xs text-gray-400 mt-2">Total Present</p>
          </div>
          <div className="bg-white rounded-2xl border p-5 text-center">
            <p className="text-3xl font-bold text-red-500">{totals.absent}</p>
            <p className="text-xs text-gray-400 mt-2">Total Absent</p>
          </div>
          <div className="bg-white rounded-2xl border p-5 text-center">
            <p className="text-3xl font-bold text-yellow-500">{totals.late}</p>
            <p className="text-xs text-gray-400 mt-2">Total Late</p>
          </div>
        </div>

        {/* Read only notice */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 mb-4">
          <p className="text-xs text-blue-600">
            ℹ️ Yeh account sirf data dekh sakta hai. Koi bhi create, edit ya delete nahi kar sakta.
          </p>
        </div>

        {/* Institution breakdown */}
        <div className="bg-white rounded-2xl border p-5">
          <h2 className="font-medium mb-4">Programme-wide Attendance</h2>
          {loading && <p className="text-gray-400 text-sm">Load ho raha hai...</p>}
          {!loading && Object.keys(summary).length === 0 && (
            <p className="text-gray-300 text-sm text-center py-6">Abhi koi data nahi hai.</p>
          )}
          {Object.entries(summary).map(([instId, data]: any) => {
            const t = (data.present || 0) + (data.absent || 0) + (data.late || 0);
            const r = t > 0 ? Math.round((data.present / t) * 100) : 0;
            return (
              <div key={instId} className="flex justify-between items-center border-b py-3 last:border-0">
                <div>
                  <p className="text-xs font-mono text-gray-500">{instId.slice(0, 20)}...</p>
                  <p className="text-xs text-gray-300 mt-0.5">Total records: {t}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex gap-3 text-sm">
                    <span className="text-green-600 font-medium">{data.present || 0}</span>
                    <span className="text-red-500 font-medium">{data.absent || 0}</span>
                    <span className="text-yellow-500 font-medium">{data.late || 0}</span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium min-w-[40px] text-center ${
                    r >= 75 ? 'bg-green-100 text-green-700' :
                    r >= 50 ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-600'
                  }`}>{r}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}