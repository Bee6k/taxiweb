"use client";

import type { Driver, RideStatus, User } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Car, User as UserIcon, MapPin, CheckCircle, Info, Clock, Hourglass } from 'lucide-react';
import Image from 'next/image';

interface RideStatusDisplayProps {
  status: RideStatus;
  driver?: Driver;
  pickupLocation?: string;
  dropoffLocation?: string;
  scheduledTime?: Date;
  user?: User; // Added user
  bookedAt?: Date; // Added bookedAt
}

const statusMessages: Record<RideStatus, { title: string; description: string; icon: React.ElementType }> = {
  idle: { title: "Welcome to RapidRyde!", description: "Book a ride or schedule one for later.", icon: Info },
  pending_approval: { title: "Pending Approval", description: "Waiting for a driver to accept your ride request.", icon: Hourglass },
  searching: { title: "Searching for Drivers", description: "We're looking for a driver for you...", icon: Loader2 }, // Kept for potential future use
  driver_assigned: { title: "Driver Assigned!", description: "Your driver is preparing for pickup.", icon: Car },
  en_route_pickup: { title: "Driver En Route", description: "Your driver is heading to your pickup location.", icon: Car },
  arrived_pickup: { title: "Driver Arrived", description: "Your driver has arrived at the pickup location.", icon: Car },
  in_progress: { title: "Ride in Progress", description: "Enjoy your trip!", icon: Car },
  completed: { title: "Ride Completed", description: "Thank you for choosing RapidRyde!", icon: CheckCircle },
  cancelled: { title: "Ride Cancelled", description: "Your ride has been cancelled.", icon: Info },
  scheduled: { title: "Ride Scheduled", description: "Your ride is scheduled. We'll notify you before pickup.", icon: Clock },
};

export function RideStatusDisplay({ status, driver, pickupLocation, dropoffLocation, scheduledTime, user, bookedAt }: RideStatusDisplayProps) {
  const currentStatusInfo = statusMessages[status] || statusMessages.idle;
  const IconComponent = currentStatusInfo.icon;

  const isRideActiveOrPending = status !== 'idle' && status !== 'completed' && status !== 'cancelled';

  let alertVariant: "default" | "destructive" = "default";
  let alertCustomClasses = "";

  if (status === 'cancelled') {
    alertVariant = "destructive";
  } else if (status === 'pending_approval') {
    // Using default variant but adding custom border/text color for pending
    alertCustomClasses = "border-yellow-500/50 text-yellow-700 dark:text-yellow-400 dark:border-yellow-600/50 [&>svg]:text-yellow-600 dark:[&>svg]:text-yellow-500";
  } else if (status === 'completed'){
     alertCustomClasses = "border-green-500/50 text-green-700 dark:text-green-400 dark:border-green-600/50 [&>svg]:text-green-600 dark:[&>svg]:text-green-500";
  }


  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl">Ride Status</CardTitle>
        <CardDescription>Track your current ride details here.</CardDescription>
      </CardHeader>
      <CardContent>
        <Alert variant={alertVariant} className={alertCustomClasses}>
          <IconComponent className={`h-5 w-5 ${status === 'searching' || status === 'pending_approval' ? 'animate-spin' : ''}`} />
          <AlertTitle>{currentStatusInfo.title}</AlertTitle>
          <AlertDescription>
            {currentStatusInfo.description}
            {status === 'scheduled' && scheduledTime && (
              <> Scheduled for: {new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(scheduledTime)}</>
            )}
          </AlertDescription>
        </Alert>

        {isRideActiveOrPending && user && bookedAt && (
           <div className="mt-4 p-3 border rounded-md bg-card/50 space-y-1">
            <p className="text-sm font-medium text-foreground/80">Booking Details:</p>
             <p className="flex items-center text-sm">
               <UserIcon className="w-4 h-4 mr-2 text-muted-foreground" /> 
               Passenger: <strong className="ml-1">{user.name}</strong>
             </p>
              <p className="flex items-center text-sm">
               <Clock className="w-4 h-4 mr-2 text-muted-foreground" /> 
               Booked At: <strong className="ml-1">{new Date(bookedAt).toLocaleString()}</strong>
             </p>
           </div>
        )}

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
                <p className="flex items-center text-md font-medium"><UserIcon className="w-4 h-4 mr-2 text-muted-foreground" /> {driver.name}</p>
                <p className="flex items-center text-sm text-muted-foreground"><Car className="w-4 h-4 mr-2" /> {driver.vehicleModel} ({driver.licensePlate})</p>
                {driver.eta && <p className="flex items-center text-sm text-muted-foreground"><Clock className="w-4 h-4 mr-2" /> ETA: {driver.eta}</p>}
              </div>
            </div>
          </div>
        )}

        {(isRideActiveOrPending || status === 'completed') && pickupLocation && dropoffLocation && (
           <div className="mt-4 p-3 border rounded-md bg-secondary/20 space-y-1">
             <p className="flex items-center text-sm">
               <MapPin className="w-4 h-4 mr-2 text-green-600" /> 
               From: <strong className="ml-1">{pickupLocation}</strong>
             </p>
             <p className="flex items-center text-sm">
               <MapPin className="w-4 h-4 mr-2 text-red-600" /> 
               To: <strong className="ml-1">{dropoffLocation}</strong>
             </p>
           </div>
        )}
      </CardContent>
    </Card>
  );
}
