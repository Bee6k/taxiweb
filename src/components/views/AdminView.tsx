"use client";

import { useRideContext } from '@/contexts/RideContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { RideStatus } from '@/types';

const statusColors: Record<RideStatus, string> = {
  idle: 'bg-gray-500',
  pending_approval: 'bg-yellow-500',
  searching: 'bg-blue-500',
  driver_assigned: 'bg-indigo-500',
  en_route_pickup: 'bg-purple-500',
  arrived_pickup: 'bg-pink-500',
  in_progress: 'bg-teal-500',
  completed: 'bg-green-500',
  cancelled: 'bg-red-500',
  scheduled: 'bg-cyan-500',
};

export function AdminView() {
  const { rides } = useRideContext();

  return (
    <Card className="shadow-lg w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Admin Dashboard - All Rides</CardTitle>
        <CardDescription>Monitor all ride activities in the system.</CardDescription>
      </CardHeader>
      <CardContent>
        {rides.length === 0 ? (
          <p className="text-muted-foreground">No rides have been booked yet.</p>
        ) : (
          <ScrollArea className="h-[600px] w-full">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Driver</TableHead>
                  <TableHead>Pickup</TableHead>
                  <TableHead>Dropoff</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Booked At</TableHead>
                  <TableHead>Scheduled For</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rides.sort((a, b) => new Date(b.bookedAt).getTime() - new Date(a.bookedAt).getTime()).map((ride) => (
                  <TableRow key={ride.id}>
                    <TableCell>{ride.user.name} ({ride.user.id})</TableCell>
                    <TableCell>
                      {ride.driver ? `${ride.driver.name} (${ride.driver.id})` : 'N/A'}
                    </TableCell>
                    <TableCell>{ride.pickupLocation}</TableCell>
                    <TableCell>{ride.dropoffLocation}</TableCell>
                    <TableCell>
                      <Badge className={`${statusColors[ride.status]} text-white`}>
                        {ride.status.replace(/_/g, ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(ride.bookedAt).toLocaleString()}</TableCell>
                    <TableCell>
                      {ride.scheduledTime ? new Date(ride.scheduledTime).toLocaleString() : 'ASAP'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
