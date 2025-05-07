"use client";

import { BookingForm } from '@/components/booking/BookingForm';
import { RideStatusDisplay } from '@/components/booking/RideStatusDisplay';
import type { BookingDetails, ScheduledBookingDetails } from '@/types';
import { useRideContext } from '@/contexts/RideContext';

export function UserView() {
  const { 
    currentRide, 
    bookRide, 
    scheduleRide,
    isBookingProcessActive,
    pickupLocation, // This might be redundant if currentRide always has it
    dropoffLocation, // This might be redundant
    scheduledTime // This might be redundant
  } = useRideContext();

  const handleBookNow = (details: BookingDetails) => {
    // Assuming a mock user for now. In a real app, this would come from auth.
    const mockUser = { id: 'user123', name: 'Current User' }; 
    bookRide(details, mockUser);
  };

  const handleScheduleRide = (details: ScheduledBookingDetails) => {
    const mockUser = { id: 'user123', name: 'Current User' };
    scheduleRide(details, mockUser);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
      <BookingForm 
        onBookNow={handleBookNow} 
        onScheduleRide={handleScheduleRide} 
        isBooking={isBookingProcessActive && currentRide?.status !== 'scheduled'}
      />
      <RideStatusDisplay 
        status={currentRide?.status || 'idle'} 
        driver={currentRide?.driver}
        pickupLocation={currentRide?.pickupLocation || pickupLocation}
        dropoffLocation={currentRide?.dropoffLocation || dropoffLocation}
        scheduledTime={currentRide?.scheduledTime || scheduledTime}
        user={currentRide?.user}
        bookedAt={currentRide?.bookedAt}
      />
    </div>
  );
}
