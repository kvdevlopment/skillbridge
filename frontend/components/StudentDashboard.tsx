'use client';
import { useAuth } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function StudentDashboard({ user }: { user: any }) {
  const { getToken } = useAuth();
  const [sessions, setSessions] = useState<any[]>([]);
  const [marked, setMarked] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const token = await getToken();
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/sessions/my`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSessions(res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const mark = async (sessionId: string, status: string) => {
    try {
      const token = await getToken();
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/attendance/mark`,
        { sessionId, status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMarked((prev) => ({ ...prev, [sessionId]: status }));
    } catch {
      alert('Error! Phir try karo.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">Student Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">Namaste, {user.name}!</p>
        </div>

        <div className="bg-white rounded-2xl border p-5">
          <h2 className="font-medium mb-4">Meri Sessions</h2>

          {loading && (
            <p className="text-gray-400 text-sm">Load ho raha hai...</p>
          )}

          {!loading && sessions.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-400 text-sm">Abhi koi session nahi hai.</p>
              <p className="text-gray-300 text-xs mt-1">Trainer se invite link maango aur batch join karo.</p>
            </div>
          )}

          {sessions.map((s) => (
            <div key={s.id} className="border rounded-xl p-4 mb-3 last:mb-0">
              <p className="font-medium text-sm">{s.title}</p>
              <p className="text-xs text-gray-400 mt-1 mb-3">
                📅 {new Date(s.date).toLocaleDateString()} &nbsp;|&nbsp;
                🕐 {s.startTime} - {s.endTime}
              </p>

              {marked[s.id] ? (
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                  marked[s.id] === 'PRESENT' ? 'bg-green-100 text-green-700' :
                  marked[s.id] === 'LATE' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-600'
                }`}>
                  ✓ {marked[s.id]} mark ho gaya
                </span>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => mark(s.id, 'PRESENT')}
                    className="px-3 py-1 rounded-lg text-xs border border-green-200 text-green-700 hover:bg-green-50 transition"
                  >
                    Present
                  </button>
                  <button
                    onClick={() => mark(s.id, 'LATE')}
                    className="px-3 py-1 rounded-lg text-xs border border-yellow-200 text-yellow-700 hover:bg-yellow-50 transition"
                  >
                    Late
                  </button>
                  <button
                    onClick={() => mark(s.id, 'ABSENT')}
                    className="px-3 py-1 rounded-lg text-xs border border-red-200 text-red-600 hover:bg-red-50 transition"
                  >
                    Absent
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}