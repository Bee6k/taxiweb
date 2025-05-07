"use client";

import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { BookingForm } from '@/components/booking/BookingForm';
import { RideStatusDisplay } from '@/components/booking/RideStatusDisplay';
import type { RideStatus, Driver, BookingDetails, ScheduledBookingDetails } from '@/types';
import { useToast } from "@/hooks/use-toast";

// Mock Data
const mockDrivers: Driver[] = [
  { id: 'driver1', name: 'John Doe', vehicleModel: 'Toyota Prius', licensePlate: 'XYZ 123' },
  { id: 'driver2', name: 'Jane Smith', vehicleModel: 'Honda Civic', licensePlate: 'ABC 789' },
];

export default function HomePage() {
  const [currentRideStatus, setCurrentRideStatus] = useState<RideStatus>('idle');
  const [currentDriver, setCurrentDriver] = useState<Driver | undefined>(undefined);
  const [pickupLocation, setPickupLocation] = useState<string | undefined>(undefined);
  const [dropoffLocation, setDropoffLocation] = useState<string | undefined>(undefined);
  const [scheduledTime, setScheduledTime] = useState<Date | undefined>(undefined);
  const [isBookingProcessActive, setIsBookingProcessActive] = useState(false); // To disable form during booking simulation

  const { toast } = useToast();

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (currentRideStatus === 'searching') {
      setIsBookingProcessActive(true);
      timeoutId = setTimeout(() => {
        const randomDriver = mockDrivers[Math.floor(Math.random() * mockDrivers.length)];
        setCurrentDriver({ ...randomDriver, eta: `${Math.floor(Math.random() * 10) + 2} mins` });
        setCurrentRideStatus('driver_assigned');
        toast({ title: "Driver Found!", description: `${randomDriver.name} is on the way.` });
      }, 3000);
    } else if (currentRideStatus === 'driver_assigned' && currentDriver) {
      timeoutId = setTimeout(() => {
        setCurrentRideStatus('en_route_pickup');
        setCurrentDriver(prev => prev ? ({ ...prev, eta: 'Arriving soon' }) : undefined);
      }, 4000);
    } else if (currentRideStatus === 'en_route_pickup') {
        timeoutId = setTimeout(() => {
        setCurrentRideStatus('arrived_pickup');
         setCurrentDriver(prev => prev ? ({ ...prev, eta: undefined }) : undefined); // Clear ETA
      }, 4000);
    }
     else if (currentRideStatus === 'arrived_pickup') {
      timeoutId = setTimeout(() => {
        setCurrentRideStatus('in_progress');
      }, 3000);
    } else if (currentRideStatus === 'in_progress') {
      timeoutId = setTimeout(() => {
        setCurrentRideStatus('completed');
        setIsBookingProcessActive(false); // Re-enable form
        toast({ title: "Ride Completed!", description: "Hope you enjoyed your trip with RapidRyde." });
      }, 8000);
    } else if (currentRideStatus === 'scheduled') {
        setIsBookingProcessActive(false); // Re-enable form for new bookings, but keep status
    }


    return () => clearTimeout(timeoutId);
  }, [currentRideStatus, currentDriver, toast]);

  const handleBookNow = (details: BookingDetails) => {
    console.log('Booking now:', details);
    setPickupLocation(details.pickup);
    setDropoffLocation(details.dropoff);
    setScheduledTime(undefined);
    setCurrentRideStatus('searching');
    toast({ title: "Booking Requested", description: "Searching for nearby drivers..." });
  };

  const handleScheduleRide = (details: ScheduledBookingDetails) => {
    console.log('Scheduling ride:', details);
    setPickupLocation(details.pickup);
    setDropoffLocation(details.dropoff);
    setScheduledTime(details.dateTime);
    setCurrentRideStatus('scheduled');
    setCurrentDriver(undefined); // Clear any previous driver info
    toast({ title: "Ride Scheduled", description: `Your ride for ${details.dateTime.toLocaleString()} is confirmed.` });
  };

  return (
    <AppLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <BookingForm 
            onBookNow={handleBookNow} 
            onScheduleRide={handleScheduleRide} 
            isBooking={isBookingProcessActive && currentRideStatus !== 'scheduled'}
          />
          <RideStatusDisplay 
            status={currentRideStatus} 
            driver={currentDriver}
            pickupLocation={pickupLocation}
            dropoffLocation={dropoffLocation}
            scheduledTime={scheduledTime}
          />
        </div>
      </div>
    </AppLayout>
  );
}
