'use client';
import { useAuth } from '@clerk/nextjs';
import { useState } from 'react';
import axios from 'axios';

export default function InstitutionDashboard({ user }: { user: any }) {
  const { getToken } = useAuth();
  const [batchName, setBatchName] = useState('');
  const [batchMsg, setBatchMsg] = useState('');
  const [createdBatchId, setCreatedBatchId] = useState('');
  const [summaryBatchId, setSummaryBatchId] = useState('');
  const [summary, setSummary] = useState<any[]>([]);
  const [summaryMsg, setSummaryMsg] = useState('');

  const createBatch = async () => {
    if (!batchName) return setBatchMsg('Batch ka naam daalo!');
    try {
      const token = await getToken();
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/batches`,
        { name: batchName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBatchMsg(`✅ Batch bana! ID: ${res.data.id}`);
      setCreatedBatchId(res.data.id);
      setBatchName('');
    } catch {
      setBatchMsg('❌ Error hua!');
    }
  };

  const fetchSummary = async () => {
    if (!summaryBatchId) return setSummaryMsg('Batch ID daalo!');
    try {
      const token = await getToken();
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/batches/${summaryBatchId}/summary`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSummary(res.data);
      setSummaryMsg('');
    } catch {
      setSummaryMsg('❌ Batch nahi mila!');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">Institution Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">Namaste, {user.name}!</p>
          <p className="text-xs text-gray-300 mt-1">Institution ID: <span className="font-mono">{user.id}</span></p>
        </div>

        {/* Batch banao */}
        <div className="bg-white rounded-2xl border p-5 mb-4">
          <h2 className="font-medium mb-4">Nayi Batch Banao</h2>
          <div className="flex gap-2">
            <input
              className="flex-1 border rounded-lg p-2 text-sm focus:outline-none focus:border-blue-400"
              placeholder="Batch ka naam likhо"
              value={batchName}
              onChange={e => setBatchName(e.target.value)}
            />
            <button
              onClick={createBatch}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition"
            >
              Banao
            </button>
          </div>
          {batchMsg && (
            <div className={`mt-3 p-3 rounded-lg text-sm ${batchMsg.includes('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
              {batchMsg}
              {createdBatchId && (
                <p className="text-xs mt-1 font-mono">Yeh ID save karo: {createdBatchId}</p>
              )}
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="bg-white rounded-2xl border p-5">
          <h2 className="font-medium mb-4">Batch Attendance Summary</h2>
          <div className="flex gap-2 mb-4">
            <input
              className="flex-1 border rounded-lg p-2 text-sm focus:outline-none focus:border-blue-400"
              placeholder="Batch ID daalo"
              value={summaryBatchId}
              onChange={e => setSummaryBatchId(e.target.value)}
            />
            <button
              onClick={fetchSummary}
              className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-700 transition"
            >
              Dekho
            </button>
          </div>
          {summaryMsg && <p className="text-sm text-red-500 mb-3">{summaryMsg}</p>}
          {summary.length === 0 && !summaryMsg && (
            <p className="text-gray-300 text-sm text-center py-4">Batch ID daalo aur summary dekho</p>
          )}
          {summary.map((s, i) => (
            <div key={i} className="border rounded-xl p-4 mb-2 last:mb-0">
              <p className="font-medium text-sm mb-2">{s.title}</p>
              <p className="text-xs text-gray-400 mb-3">📅 {new Date(s.date).toLocaleDateString()}</p>
              <div className="flex gap-4">
                <div className="text-center">
                  <p className="text-xl font-bold text-green-600">{s.present}</p>
                  <p className="text-xs text-gray-400">Present</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-red-500">{s.absent}</p>
                  <p className="text-xs text-gray-400">Absent</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-yellow-500">{s.late}</p>
                  <p className="text-xs text-gray-400">Late</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}