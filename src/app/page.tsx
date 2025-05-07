"use client";

import { AppLayout } from '@/components/layout/AppLayout';
import { UserView } from '@/components/views/UserView';
import { DriverView } from '@/components/views/DriverView';
import { AdminView } from '@/components/views/AdminView';
import { useRole } from '@/contexts/RoleContext';


export default function HomePage() {
  const { role } = useRole();

  return (
    <AppLayout>
      <div className="container mx-auto py-8 px-4">
        {role === 'user' && <UserView />}
        {role === 'driver' && <DriverView />}
        {role === 'admin' && <AdminView />}
      </div>
    </AppLayout>
  );
}
