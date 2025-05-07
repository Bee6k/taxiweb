"use client";

import type { Driver, RideStatus } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Car, User, MapPin, CheckCircle, Info, Clock } from 'lucide-react';
import Image from 'next/image';

interface RideStatusDisplayProps {
  status: RideStatus;
  driver?: Driver;
  pickupLocation?: string;
  dropoffLocation?: string;
  scheduledTime?: Date;
}

const statusMessages: Record<RideStatus, { title: string; description: string; icon: React.ElementType }> = {
  idle: { title: "Welcome to RapidRyde!", description: "Book a ride or schedule one for later.", icon: Info },
  searching: { title: "Searching for Drivers", description: "We're looking for a driver for you...", icon: Loader2 },
  driver_assigned: { title: "Driver Found!", description: "Your driver is on the way.", icon: Car },
  en_route_pickup: { title: "Driver En Route", description: "Your driver is heading to your pickup location.", icon: Car },
  arrived_pickup: { title: "Driver Arrived", description: "Your driver has arrived at the pickup location.", icon: Car },
  in_progress: { title: "Ride in Progress", description: "Enjoy your trip!", icon: Car },
  completed: { title: "Ride Completed", description: "Thank you for choosing RapidRyde!", icon: CheckCircle },
  cancelled: { title: "Ride Cancelled", description: "Your ride has been cancelled.", icon: Info },
  scheduled: { title: "Ride Scheduled", description: "Your ride is scheduled. We'll notify you before pickup.", icon: Clock },
};

export function RideStatusDisplay({ status, driver, pickupLocation, dropoffLocation, scheduledTime }: RideStatusDisplayProps) {
  const currentStatus = statusMessages[status] || statusMessages.idle;
  const IconComponent = currentStatus.icon;

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl">Ride Status</CardTitle>
        <CardDescription>Track your current ride details here.</CardDescription>
      </CardHeader>
      <CardContent>
        <Alert variant={status === 'searching' || status === 'driver_assigned' || status === 'en_route_pickup' || status === 'in_progress' || status === 'scheduled' ? 'default' : (status === 'completed' ? 'default' : 'destructive')}>
          <IconComponent className={`h-5 w-5 ${status === 'searching' ? 'animate-spin' : ''}`} />
          <AlertTitle>{currentStatus.title}</AlertTitle>
          <AlertDescription>
            {currentStatus.description}
            {status === 'scheduled' && scheduledTime && (
              <> Scheduled for: {new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(scheduledTime)}</>
            )}
          </AlertDescription>
        </Alert>

        {(status === 'driver_assigned' || status === 'en_route_pickup' || status === 'arrived_pickup' || status === 'in_progress') && driver && (
          <div className="mt-6 p-4 border rounded-lg bg-card">
            <h3 className="text-lg font-semibold mb-3 text-primary">Driver Information</h3>
            <div className="flex items-center space-x-4">
              <Image 
                src={`https://picsum.photos/seed/${driver.id}/80/80`} 
                alt="Driver photo" 
                width={80} 
                height={80} 
                className="rounded-full"
                data-ai-hint="driver portrait"
              />
              <div>
                <p className="flex items-center text-md font-medium"><User className="w-4 h-4 mr-2 text-muted-foreground" /> {driver.name}</p>
                <p className="flex items-center text-sm text-muted-foreground"><Car className="w-4 h-4 mr-2" /> {driver.vehicleModel} ({driver.licensePlate})</p>
                {driver.eta && <p className="flex items-center text-sm text-muted-foreground"><Clock className="w-4 h-4 mr-2" /> ETA: {driver.eta}</p>}
              </div>
            </div>
          </div>
        )}

        {(status === 'in_progress' || status === 'completed') && dropoffLocation && (
           <div className="mt-4 p-3 border rounded-md bg-secondary/30">
             <p className="flex items-center text-sm">
               <MapPin className="w-4 h-4 mr-2 text-primary" /> 
               Destination: <strong>{dropoffLocation}</strong>
             </p>
           </div>
        )}
         {status === 'scheduled' && pickupLocation && dropoffLocation && (
           <div className="mt-4 p-3 border rounded-md bg-secondary/30 space-y-1">
             <p className="flex items-center text-sm">
               <MapPin className="w-4 h-4 mr-2 text-green-600" /> 
               From: <strong>{pickupLocation}</strong>
             </p>
             <p className="flex items-center text-sm">
               <MapPin className="w-4 h-4 mr-2 text-red-600" /> 
               To: <strong>{dropoffLocation}</strong>
             </p>
           </div>
        )}

      </CardContent>
    </Card>
  );
}
