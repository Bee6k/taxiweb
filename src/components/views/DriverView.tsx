"use client";

import { useRideContext } from '@/contexts/RideContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { User, MapPin, CheckCircle, Info, Car } from 'lucide-react';
import Image from 'next/image';
import type { Ride } from '@/types';


// Mock Driver Data - in a real app, this would come from auth/driver profile
const mockCurrentDriver = { 
  id: 'driver007', 
  name: 'James Bond', 
  vehicleModel: 'Aston Martin DB5', 
  licensePlate: 'BMT 216A' 
};


export function DriverView() {
  const { rides, acceptRide, completeRide, currentDriverRides } = useRideContext();

  const pendingRides = rides.filter(ride => ride.status === 'pending_approval');
  const activeRideForThisDriver = currentDriverRides.find(ride => 
    ride.driver?.id === mockCurrentDriver.id && 
    (ride.status === 'driver_assigned' || ride.status === 'en_route_pickup' || ride.status === 'arrived_pickup' || ride.status === 'in_progress')
  );

  const handleAcceptRide = (rideId: string) => {
    acceptRide(rideId, mockCurrentDriver);
  };
  
  const handleCompleteRide = (rideId: string) => {
    completeRide(rideId);
  };

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Driver Dashboard</CardTitle>
          <CardDescription>View and manage ride requests.</CardDescription>
        </CardHeader>
        <CardContent>
          {activeRideForThisDriver && (
             <Card className="mb-6 bg-primary/10 border-primary">
              <CardHeader>
                <CardTitle className="text-xl text-primary">Current Active Ride</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                 <div className="flex items-center space-x-3">
                    <Image
                        src={`https://picsum.photos/seed/${activeRideForThisDriver.user.id}/60/60`}
                        alt="User photo"
                        width={60}
                        height={60}
                        className="rounded-full"
                        data-ai-hint="person face"
                    />
                    <div>
                        <p className="flex items-center font-medium"><User className="w-4 h-4 mr-2 text-muted-foreground" /> {activeRideForThisDriver.user.name}</p>
                        <p className="text-sm text-muted-foreground">Status: <span className="font-semibold">{activeRideForThisDriver.status.replace(/_/g, ' ')}</span></p>
                    </div>
                </div>
                <p className="flex items-center"><MapPin className="w-4 h-4 mr-2 text-green-600" /> From: <strong>{activeRideForThisDriver.pickupLocation}</strong></p>
                <p className="flex items-center"><MapPin className="w-4 h-4 mr-2 text-red-600" /> To: <strong>{activeRideForThisDriver.dropoffLocation}</strong></p>
                {activeRideForThisDriver.status === 'in_progress' && (
                  <Button onClick={() => handleCompleteRide(activeRideForThisDriver.id)} className="w-full mt-2">
                    <CheckCircle className="mr-2 h-4 w-4" /> Mark as Completed
                  </Button>
                )}
                 {activeRideForThisDriver.status === 'driver_assigned' && (
                  <p className="text-sm text-primary font-semibold">Please proceed to pickup.</p>
                )}
                {activeRideForThisDriver.status === 'en_route_pickup' && (
                  <p className="text-sm text-primary font-semibold">You are on the way to pickup.</p>
                )}
                 {activeRideForThisDriver.status === 'arrived_pickup' && (
                  <p className="text-sm text-primary font-semibold">You have arrived at pickup. Waiting for user.</p>
                )}
              </CardContent>
            </Card>
          )}

          <h3 className="text-xl font-semibold mb-4">Pending Ride Requests</h3>
          {pendingRides.length === 0 && !activeRideForThisDriver && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>No Pending Requests</AlertTitle>
              <AlertDescription>There are currently no new ride requests.</AlertDescription>
            </Alert>
          )}
          <div className="space-y-4">
            {pendingRides.map((ride: Ride) => (
              <Card key={ride.id} className="bg-card">
                <CardContent className="pt-6 space-y-3">
                   <div className="flex items-center space-x-3">
                    <Image 
                        src={`https://picsum.photos/seed/${ride.user.id}/60/60`} 
                        alt="User photo" 
                        width={60} 
                        height={60} 
                        className="rounded-full"
                        data-ai-hint="person riding"
                    />
                    <div>
                        <p className="flex items-center font-medium"><User className="w-4 h-4 mr-2 text-muted-foreground" /> {ride.user.name}</p>
                        <p className="text-sm text-muted-foreground">Booked: {new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(ride.bookedAt))}</p>
                    </div>
                  </div>
                  <p className="flex items-center"><MapPin className="w-4 h-4 mr-2 text-green-500" /> From: <strong>{ride.pickupLocation}</strong></p>
                  <p className="flex items-center"><MapPin className="w-4 h-4 mr-2 text-red-500" /> To: <strong>{ride.dropoffLocation}</strong></p>
                  <Button 
                    onClick={() => handleAcceptRide(ride.id)} 
                    className="w-full bg-primary hover:bg-primary/90"
                    disabled={!!activeRideForThisDriver} // Disable if driver already has an active ride
                  >
                    <Car className="mr-2 h-4 w-4" /> Accept Ride
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
