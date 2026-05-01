'use client';
import { useAuth } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function ProgrammeManagerDashboard({ user }: { user: any }) {
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

  const total = totals.present + totals.absent + totals.late;
  const rate = total > 0 ? Math.round((totals.present / total) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">Programme Manager</h1>
          <p className="text-gray-400 text-sm mt-1">Namaste, {user.name}!</p>
        </div>

        {/* Overall stats */}
        <div className="grid grid-cols-4 gap-3 mb-4">
          <div className="bg-white rounded-2xl border p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{rate}%</p>
            <p className="text-xs text-gray-400 mt-1">Attendance Rate</p>
          </div>
          <div className="bg-white rounded-2xl border p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{totals.present}</p>
            <p className="text-xs text-gray-400 mt-1">Present</p>
          </div>
          <div className="bg-white rounded-2xl border p-4 text-center">
            <p className="text-2xl font-bold text-red-500">{totals.absent}</p>
            <p className="text-xs text-gray-400 mt-1">Absent</p>
          </div>
          <div className="bg-white rounded-2xl border p-4 text-center">
            <p className="text-2xl font-bold text-yellow-500">{totals.late}</p>
            <p className="text-xs text-gray-400 mt-1">Late</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border p-5">
          <h2 className="font-medium mb-4">Institution-wise Summary</h2>
          {loading && <p className="text-gray-400 text-sm">Load ho raha hai...</p>}
          {!loading && Object.keys(summary).length === 0 && (
            <p className="text-gray-300 text-sm text-center py-6">Abhi koi data nahi hai.</p>
          )}
          {Object.entries(summary).map(([instId, data]: any) => {
            const t = (data.present || 0) + (data.absent || 0) + (data.late || 0);
            const r = t > 0 ? Math.round((data.present / t) * 100) : 0;
            return (
              <div key={instId} className="border rounded-xl p-4 mb-3 last:mb-0">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-xs font-mono text-gray-400">{instId.slice(0, 16)}...</p>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    r >= 75 ? 'bg-green-100 text-green-700' :
                    r >= 50 ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-600'
                  }`}>{r}%</span>
                </div>
                <div className="flex gap-6">
                  <div><p className="text-lg font-bold text-green-600">{data.present || 0}</p><p className="text-xs text-gray-400">Present</p></div>
                  <div><p className="text-lg font-bold text-red-500">{data.absent || 0}</p><p className="text-xs text-gray-400">Absent</p></div>
                  <div><p className="text-lg font-bold text-yellow-500">{data.late || 0}</p><p className="text-xs text-gray-400">Late</p></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}