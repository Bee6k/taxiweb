"use client";

import { useRideContext } from '@/contexts/RideContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { User, MapPin, CheckCircle, Info, Car, Star, Award } from 'lucide-react';
import Image from 'next/image';
import type { Ride, Driver } from '@/types';
import { UNRANKED_TIER, DRIVER_TIERS_CONFIG } from '@/config/constants';

// Mock Current Driver ID - this would come from auth in a real app
const MOCK_CURRENT_DRIVER_ID = 'driver007';

export function DriverView() {
  const { rides, acceptRide, completeRide, driversData } = useRideContext();

  const currentDriverProfile = driversData.find(d => d.id === MOCK_CURRENT_DRIVER_ID);

  const pendingRides = rides.filter(ride => ride.status === 'pending_approval');
  const activeRideForThisDriver = rides.find(ride => 
    ride.driver?.id === MOCK_CURRENT_DRIVER_ID && 
    (ride.status === 'driver_assigned' || ride.status === 'en_route_pickup' || ride.status === 'arrived_pickup' || ride.status === 'in_progress')
  );

  const handleAcceptRide = (rideId: string) => {
    if (currentDriverProfile) {
      acceptRide(rideId, currentDriverProfile.id);
    } else {
      // Handle case where driver profile is not found, though unlikely with mock data setup
      console.error("Current driver profile not found");
    }
  };
  
  const handleCompleteRide = (rideId: string) => {
    completeRide(rideId);
  };

  const getTierDisplayInfo = (driver: Driver | undefined) => {
    if (!driver) return { name: UNRANKED_TIER.name, icon: UNRANKED_TIER.icon, colorClass: UNRANKED_TIER.colorClass };
    const tierInfo = driver.tier === UNRANKED_TIER.name 
      ? UNRANKED_TIER 
      : DRIVER_TIERS_CONFIG[driver.tier as keyof typeof DRIVER_TIERS_CONFIG] || UNRANKED_TIER;
    return { name: tierInfo.name, icon: tierInfo.icon, colorClass: tierInfo.colorClass };
  };
  
  const driverTierInfo = getTierDisplayInfo(currentDriverProfile);

  return (
    <div className="space-y-8">
      {currentDriverProfile && (
        <Card className="shadow-md bg-gradient-to-r from-primary/10 to-card">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl text-primary">Welcome, {currentDriverProfile.name}!</CardTitle>
                <CardDescription>{currentDriverProfile.vehicleModel} ({currentDriverProfile.licensePlate})</CardDescription>
              </div>
               <div className={`text-right p-2 rounded-md ${driverTierInfo.colorClass} bg-opacity-20`}>
                <div className="flex items-center text-lg font-semibold">
                  {driverTierInfo.icon && <span className="mr-2 text-2xl">{driverTierInfo.icon}</span>}
                  {driverTierInfo.name} Tier
                </div>
                 {currentDriverProfile.averageRating > 0 && (
                  <div className="flex items-center justify-end text-sm">
                    Avg. Rating: {currentDriverProfile.averageRating.toFixed(2)}
                    <Star className="w-4 h-4 ml-1 text-yellow-400 fill-yellow-400" />
                  </div>
                 )}
                 <p className="text-xs">{currentDriverProfile.ratings.length} ratings</p>
              </div>
            </div>
          </CardHeader>
        </Card>
      )}

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">Driver Dashboard</CardTitle>
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
                  <p className="text-sm text-primary font-semibold">You are on the way to pickup. ETA: {activeRideForThisDriver.driver?.eta}</p>
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
                         {ride.scheduledTime && <p className="text-sm text-muted-foreground">Scheduled for: {new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(ride.scheduledTime))}</p>}
                    </div>
                  </div>
                  <p className="flex items-center"><MapPin className="w-4 h-4 mr-2 text-green-500" /> From: <strong>{ride.pickupLocation}</strong></p>
                  <p className="flex items-center"><MapPin className="w-4 h-4 mr-2 text-red-500" /> To: <strong>{ride.dropoffLocation}</strong></p>
                  <Button 
                    onClick={() => handleAcceptRide(ride.id)} 
                    className="w-full bg-primary hover:bg-primary/90"
                    disabled={!!activeRideForThisDriver} 
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
