'use client';

import { useAuth, useRequireAuth } from '@/lib/auth-context';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { BuyerDashboard } from '@/components/dashboard/buyer-dashboard';
import { SellerDashboard } from '@/components/dashboard/seller-dashboard';

export default function DashboardPage() {
  const auth = useRequireAuth();

  if (auth.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!auth.user) {
    return null; // useRequireAuth will redirect to login
  }

  return (
    <DashboardLayout>
      {auth.user.role === 'SELLER' ? (
        <SellerDashboard user={auth.user} />
      ) : (
        <BuyerDashboard user={auth.user} />
      )}
    </DashboardLayout>
  );
}