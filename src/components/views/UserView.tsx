
"use client";

import { useState } from 'react';
import { BookingForm } from '@/components/booking/BookingForm';
import { RideStatusDisplay } from '@/components/booking/RideStatusDisplay';
import type { BookingDetails, ScheduledBookingDetails } from '@/types';
import { useRideContext } from '@/contexts/RideContext';
import { StarRating } from '@/components/rating/StarRating';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle } from 'lucide-react';

export function UserView() {
  const { 
    currentRide, 
    bookRide, 
    scheduleRide,
    submitRating,
    isBookingProcessActive,
    pickupLocation, 
    dropoffLocation, 
    scheduledTime 
  } = useRideContext();

  const [currentRating, setCurrentRating] = useState(0);

  const handleBookNow = (details: BookingDetails) => {
    const mockUser = { id: 'user123', name: 'Current User' }; 
    bookRide(details, mockUser);
  };

  const handleScheduleRide = (details: ScheduledBookingDetails) => {
    const mockUser = { id: 'user123', name: 'Current User' };
    scheduleRide(details, mockUser);
  };

  const handleSubmitRating = () => {
    if (currentRide && currentRide.driver && currentRide.status === 'completed' && !currentRide.ratingGiven && currentRating > 0) {
      submitRating(currentRide.id, currentRide.driver.id, currentRide.user.id, currentRating);
      setCurrentRating(0); // Reset after submission
    }
  };

  const canRateRide = currentRide && currentRide.status === 'completed' && currentRide.driver && !currentRide.ratingGiven;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <BookingForm 
          onBookNow={handleBookNow} 
          onScheduleRide={handleScheduleRide} 
          isBooking={isBookingProcessActive && currentRide?.status !== 'scheduled' && currentRide?.status !== 'completed' && currentRide?.status !== 'idle'}
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

      {canRateRide && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Rate Your Ride with {currentRide.driver?.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>How was your ride from {currentRide.pickupLocation} to {currentRide.dropoffLocation}?</p>
            <StarRating value={currentRating} onChange={setCurrentRating} size={32} />
            <Button onClick={handleSubmitRating} disabled={currentRating === 0}>
              Submit Rating
            </Button>
          </CardContent>
        </Card>
      )}

      {currentRide && currentRide.status === 'completed' && currentRide.ratingGiven && (
         <Alert variant="default" className="border-green-500/50 text-green-700 dark:text-green-400 dark:border-green-600/50 [&>svg]:text-green-600 dark:[&>svg]:text-green-500">
          <CheckCircle className="h-5 w-5" />
          <AlertTitle>Rating Submitted</AlertTitle>
          <AlertDescription>
            You rated this ride {currentRide.ratingGiven} star{currentRide.ratingGiven > 1 ? 's' : ''}. Thank you for your feedback!
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

    