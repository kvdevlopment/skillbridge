'use client';
import { useAuth } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function TrainerDashboard({ user }: { user: any }) {
  const { getToken } = useAuth();
  const [batches, setBatches] = useState<any[]>([]);
  const [form, setForm] = useState({
    batchId: '', title: '', date: '', startTime: '', endTime: '',
  });
  const [inviteBatchId, setInviteBatchId] = useState('');
  const [inviteLink, setInviteLink] = useState('');
  const [sessionMsg, setSessionMsg] = useState('');
  const [copied, setCopied] = useState(false);

  const createSession = async () => {
    if (!form.batchId || !form.title || !form.date) {
      return setSessionMsg('Saare fields bharo!');
    }
    try {
      const token = await getToken();
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/sessions`,
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSessionMsg('✅ Session ban gaya!');
      setForm({ batchId: '', title: '', date: '', startTime: '', endTime: '' });
    } catch {
      setSessionMsg('❌ Error hua!');
    }
  };

  const generateInvite = async () => {
    if (!inviteBatchId) return alert('Batch ID daalo!');
    try {
      const token = await getToken();
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/batches/${inviteBatchId}/invite`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setInviteLink(res.data.link);
    } catch {
      alert('Error! Batch ID sahi hai?');
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">Trainer Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">Namaste, {user.name}!</p>
          <p className="text-xs text-gray-300 mt-1">Tumhara ID: <span className="font-mono">{user.id}</span></p>
        </div>

        {/* Session banao */}
        <div className="bg-white rounded-2xl border p-5 mb-4">
          <h2 className="font-medium mb-4">Nayi Session Banao</h2>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Batch ID</label>
              <input
                className="w-full border rounded-lg p-2 text-sm focus:outline-none focus:border-blue-400"
                placeholder="Batch ka ID daalo"
                value={form.batchId}
                onChange={e => setForm({ ...form, batchId: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Session Title</label>
              <input
                className="w-full border rounded-lg p-2 text-sm focus:outline-none focus:border-blue-400"
                placeholder="Jaise: React Basics Class 1"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Date</label>
              <input
                type="date"
                className="w-full border rounded-lg p-2 text-sm focus:outline-none focus:border-blue-400"
                value={form.date}
                onChange={e => setForm({ ...form, date: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Start Time</label>
                <input
                  type="time"
                  className="w-full border rounded-lg p-2 text-sm focus:outline-none focus:border-blue-400"
                  value={form.startTime}
                  onChange={e => setForm({ ...form, startTime: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">End Time</label>
                <input
                  type="time"
                  className="w-full border rounded-lg p-2 text-sm focus:outline-none focus:border-blue-400"
                  value={form.endTime}
                  onChange={e => setForm({ ...form, endTime: e.target.value })}
                />
              </div>
            </div>
            <button
              onClick={createSession}
              className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm hover:bg-blue-700 transition font-medium"
            >
              Session Banao
            </button>
            {sessionMsg && (
              <p className={`text-sm ${sessionMsg.includes('✅') ? 'text-green-600' : 'text-red-500'}`}>
                {sessionMsg}
              </p>
            )}
          </div>
        </div>

        {/* Invite link */}
        <div className="bg-white rounded-2xl border p-5">
          <h2 className="font-medium mb-4">Student Invite Link Banao</h2>
          <div className="flex gap-2 mb-3">
            <input
              className="flex-1 border rounded-lg p-2 text-sm focus:outline-none focus:border-purple-400"
              placeholder="Batch ID daalo"
              value={inviteBatchId}
              onChange={e => setInviteBatchId(e.target.value)}
            />
            <button
              onClick={generateInvite}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700 transition"
            >
              Generate
            </button>
          </div>
          {inviteLink && (
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-400 mb-2">Yeh link students ko bhejo 👇</p>
              <p className="text-xs font-mono text-blue-600 break-all mb-3">{inviteLink}</p>
              <button
                onClick={copyLink}
                className="text-xs bg-white border rounded-lg px-3 py-1 hover:bg-gray-50 transition"
              >
                {copied ? '✅ Copied!' : '📋 Copy karo'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}