'use client';
import { useAuth } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import StudentDashboard from '@/components/StudentDashboard';
import TrainerDashboard from '@/components/TrainerDashboard';
import InstitutionDashboard from '@/components/InstitutionDashboard';
import ProgrammeManagerDashboard from '@/components/ProgrammeManagerDashboard';
import MonitoringOfficerDashboard from '@/components/MonitoringOfficerDashboard';

export default function Dashboard() {
  const { getToken, isLoaded } = useAuth();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded) return;
    (async () => {
      try {
        const token = await getToken();
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/users/me`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setUser(res.data);
      } catch {
        router.push('/onboarding');
      } finally {
        setLoading(false);
      }
    })();
  }, [isLoaded]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-400 text-sm">Loading...</p>
    </div>
  );

  if (!user) return null;

  const dashboards: Record<string, React.ReactNode> = {
    STUDENT: <StudentDashboard user={user} />,
    TRAINER: <TrainerDashboard user={user} />,
    INSTITUTION: <InstitutionDashboard user={user} />,
    PROGRAMME_MANAGER: <ProgrammeManagerDashboard user={user} />,
    MONITORING_OFFICER: <MonitoringOfficerDashboard user={user} />,
  };

  return <>{dashboards[user.role] ?? <p className="p-6">Unknown role</p>}</>;
}