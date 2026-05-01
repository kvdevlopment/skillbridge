'use client';
import { useAuth } from '@clerk/nextjs';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Suspense } from 'react';

function JoinInner() {
  const { getToken, isLoaded } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'joining' | 'success' | 'error'>('joining');

  useEffect(() => {
    if (!isLoaded || !token) return;
    (async () => {
      try {
        const authToken = await getToken();
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/join`,
          { token },
          { headers: { Authorization: `Bearer ${authToken}` } }
        );
        setStatus('success');
        setTimeout(() => router.push('/dashboard'), 2000);
      } catch {
        setStatus('error');
      }
    })();
  }, [isLoaded]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-2xl border p-10 text-center max-w-sm w-full">
        {status === 'joining' && (
          <>
            <div className="text-4xl mb-4">⏳</div>
            <p className="text-gray-600">Batch mein join ho rahe ho...</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="text-4xl mb-4">✅</div>
            <p className="text-green-600 font-medium">Join ho gaye! Dashboard pe ja rahe hain...</p>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="text-4xl mb-4">❌</div>
            <p className="text-red-500">Invalid invite link!</p>
            <button onClick={() => router.push('/dashboard')} className="mt-4 text-sm text-blue-600 underline">
              Dashboard pe jao
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function JoinPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p className="text-gray-400">Loading...</p></div>}>
      <JoinInner />
    </Suspense>
  );
}