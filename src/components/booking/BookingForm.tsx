"use client";

import type * as React from 'react';
import { useState } from 'react';
import { CalendarIcon, MapPin, Clock } from 'lucide-react';
import { format } from 'date-fns';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import type { BookingDetails, ScheduledBookingDetails } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface BookingFormProps {
  onBookNow: (details: BookingDetails) => void;
  onScheduleRide: (details: ScheduledBookingDetails) => void;
  isBooking: boolean;
}

export function BookingForm({ onBookNow, onScheduleRide, isBooking }: BookingFormProps) {
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [rideDate, setRideDate] = useState<Date | undefined>(undefined);
  const [rideTime, setRideTime] = useState(''); // Store time as HH:mm string
  const { toast } = useToast();

  const handleBookNow = () => {
    if (!pickup || !dropoff) {
      toast({ title: "Missing Information", description: "Please enter pickup and drop-off locations.", variant: "destructive" });
      return;
    }
    onBookNow({ pickup, dropoff });
  };

  const handleScheduleRide = () => {
    if (!pickup || !dropoff || !rideDate || !rideTime) {
      toast({ title: "Missing Information", description: "Please enter all fields for scheduling a ride.", variant: "destructive" });
      return;
    }
    
    const [hours, minutes] = rideTime.split(':').map(Number);
    const scheduledDateTime = new Date(rideDate);
    scheduledDateTime.setHours(hours, minutes, 0, 0);

    if (scheduledDateTime <= new Date()) {
      toast({ title: "Invalid Time", description: "Scheduled time must be in the future.", variant: "destructive" });
      return;
    }

    onScheduleRide({ pickup, dropoff, dateTime: scheduledDateTime });
  };

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl">Book Your Ride</CardTitle>
        <CardDescription>Enter your pickup and drop-off details.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="pickup" className="flex items-center">
            <MapPin className="mr-2 h-4 w-4 text-primary" /> Pickup Location
          </Label>
          <Input
            id="pickup"
            placeholder="Enter pickup address"
            value={pickup}
            onChange={(e) => setPickup(e.target.value)}
            disabled={isBooking}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="dropoff" className="flex items-center">
            <MapPin className="mr-2 h-4 w-4 text-primary" /> Drop-off Location
          </Label>
          <Input
            id="dropoff"
            placeholder="Enter drop-off address"
            value={dropoff}
            onChange={(e) => setDropoff(e.target.value)}
            disabled={isBooking}
          />
        </div>

        <div className="space-y-2 pt-4 border-t border-border">
          <h3 className="text-lg font-medium text-foreground">Schedule for Later (Optional)</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ride-date" className="flex items-center">
                <CalendarIcon className="mr-2 h-4 w-4 text-primary" /> Date
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="ride-date"
                    variant={'outline'}
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !rideDate && 'text-muted-foreground'
                    )}
                    disabled={isBooking}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {rideDate ? format(rideDate, 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={rideDate}
                    onSelect={setRideDate}
                    initialFocus
                    disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))} // Disable past dates
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ride-time" className="flex items-center">
                <Clock className="mr-2 h-4 w-4 text-primary" /> Time
              </Label>
              <Input
                id="ride-time"
                type="time"
                value={rideTime}
                onChange={(e) => setRideTime(e.target.value)}
                disabled={isBooking || !rideDate}
                className="w-full"
              />
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row justify-between gap-4">
        <Button onClick={handleBookNow} className="w-full sm:w-auto bg-primary hover:bg-primary/90" disabled={isBooking || !pickup || !dropoff}>
          Book Now
        </Button>
        <Button onClick={handleScheduleRide} variant="outline" className="w-full sm:w-auto" disabled={isBooking || !pickup || !dropoff || !rideDate || !rideTime}>
          Schedule Ride
        </Button>
      </CardFooter>
    </Card>
  );
}
