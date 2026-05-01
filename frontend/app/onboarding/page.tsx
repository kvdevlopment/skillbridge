'use client';
import { useUser, useAuth } from '@clerk/nextjs';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const ROLES = [
  { value: 'STUDENT', label: 'Student' },
  { value: 'TRAINER', label: 'Trainer' },
  { value: 'INSTITUTION', label: 'Institution' },
  { value: 'PROGRAMME_MANAGER', label: 'Programme Manager' },
  { value: 'MONITORING_OFFICER', label: 'Monitoring Officer' },
];

export default function Onboarding() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const router = useRouter();
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!role) return setError('Pehle role chunno!');
    setLoading(true);
    setError('');
    try {
      const token = await getToken();
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/users/sync`,
        { name: user?.fullName || user?.firstName || 'User', role },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      router.push('/dashboard');
    } catch (e) {
      setError('Error aaya! Backend chal raha hai?');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border p-8">
        <h1 className="text-2xl font-semibold mb-1">Apna role chunno</h1>
        <p className="text-gray-400 text-sm mb-6">Yeh baad mein nahi badal sakta</p>
        <div className="space-y-2">
          {ROLES.map((r) => (
            <button
              key={r.value}
              onClick={() => setRole(r.value)}
              className={`w-full p-4 rounded-xl border-2 text-left transition-all text-sm ${
                role === r.value
                  ? 'border-blue-600 bg-blue-50 text-blue-800 font-medium'
                  : 'border-gray-200 hover:border-gray-300 text-gray-700'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
        {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
        <button
          onClick={handleSubmit}
          disabled={!role || loading}
          className="mt-5 w-full py-3 bg-blue-600 text-white rounded-xl font-medium disabled:opacity-40 hover:bg-blue-700 transition text-sm"
        >
          {loading ? 'Wait karo...' : 'Aage badho →'}
        </button>
      </div>
    </div>
  );
}