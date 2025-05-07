"use client";

import { AppLayout } from '@/components/layout/AppLayout';
import { UserView } from '@/components/views/UserView';
import { DriverView } from '@/components/views/DriverView';
import { AdminView } from '@/components/views/AdminView';
import { DriverLeaderboard } from '@/components/leaderboard/DriverLeaderboard';
import { useRole } from '@/contexts/RoleContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserCircle, ShieldCheck, BarChart3 } from 'lucide-react'; // Icons for tabs

export default function HomePage() {
  const { role } = useRole();

  const renderRoleView = () => {
    switch (role) {
      case 'user':
        return <UserView />;
      case 'driver':
        return <DriverView />;
      case 'admin':
        return <AdminView />;
      default:
        return <UserView />; // Default to user view
    }
  };

  return (
    <AppLayout>
      <div className="container mx-auto py-8 px-4">
        <Tabs defaultValue="rideServices" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:w-auto md:inline-flex mb-6">
            <TabsTrigger value="rideServices" className="flex items-center gap-2">
              {role === 'user' && <UserCircle className="h-5 w-5" />}
              {role === 'driver' && <UserCircle className="h-5 w-5" />}
              {role === 'admin' && <ShieldCheck className="h-5 w-5" />}
              Ride Services
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Leaderboard
            </TabsTrigger>
          </TabsList>
          <TabsContent value="rideServices">
            {renderRoleView()}
          </TabsContent>
          <TabsContent value="leaderboard">
            <DriverLeaderboard />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
