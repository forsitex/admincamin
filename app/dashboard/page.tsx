'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { getUserDashboard } from '@/lib/user-roles';

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    const checkUserType = async () => {
      const user = auth.currentUser;
      if (!user) {
        router.push('/login');
        return;
      }

      // Obține dashboard-ul corect bazat pe rol
      const dashboard = await getUserDashboard();
      
      if (dashboard) {
        router.push(dashboard);
      } else {
        // Fallback la dashboard-new dacă nu se poate determina rolul
        router.push('/dashboard-new');
      }
    };

    checkUserType();
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirecționare...</p>
      </div>
    </div>
  );
}
