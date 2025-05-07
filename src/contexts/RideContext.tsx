"use client";

import type { ReactNode, Dispatch, SetStateAction } from 'react';
import { createContext, useContext, useState, useEffect } from 'react';
import type { Ride, RideStatus, Driver, User, BookingDetails, ScheduledBookingDetails } from '@/types';
import { useToast } from "@/hooks/use-toast";

// Mock Data for initial drivers list - this would typically come from a backend
const mockDrivers: Driver[] = [
  { id: 'driver1', name: 'John Doe', vehicleModel: 'Toyota Prius', licensePlate: 'XYZ 123' },
  { id: 'driver2', name: 'Jane Smith', vehicleModel: 'Honda Civic', licensePlate: 'ABC 789' },
  { id: 'driver007', name: 'James Bond', vehicleModel: 'Aston Martin DB5', licensePlate: 'BMT 216A' },
];


interface RideContextType {
  rides: Ride[];
  setRides: Dispatch<SetStateAction<Ride[]>>;
  currentRide: Ride | undefined; // Current ride for the logged-in user (if user role)
  currentDriverRides: Ride[]; // Current active rides for the logged-in driver (if driver role)
  bookRide: (details: BookingDetails, user: User) => void;
  scheduleRide: (details: ScheduledBookingDetails, user: User) => void;
  acceptRide: (rideId: string, driver: Driver) => void;
  completeRide: (rideId: string) => void;
  cancelRide: (rideId: string) => void;
  isBookingProcessActive: boolean;
  pickupLocation: string | undefined;
  dropoffLocation: string | undefined;
  scheduledTime: Date | undefined;
}

const RideContext = createContext<RideContextType | undefined>(undefined);

export function RideProvider({ children }: { children: ReactNode }) {
  const [rides, setRides] = useState<Ride[]>([]);
  const [isBookingProcessActive, setIsBookingProcessActive] = useState(false);
  const [pickupLocation, setPickupLocation] = useState<string | undefined>(undefined);
  const [dropoffLocation, setDropoffLocation] = useState<string | undefined>(undefined);
  const [scheduledTime, setScheduledTime] = useState<Date | undefined>(undefined);
  
  const { toast } = useToast();

  // Load rides from localStorage on mount
  useEffect(() => {
    const storedRides = localStorage.getItem('rapidryde-rides');
    if (storedRides) {
      setRides(JSON.parse(storedRides).map((ride: Ride) => ({
        ...ride,
        bookedAt: new Date(ride.bookedAt),
        scheduledTime: ride.scheduledTime ? new Date(ride.scheduledTime) : undefined,
      })));
    }
  }, []);

  // Persist rides to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('rapidryde-rides', JSON.stringify(rides));
  }, [rides]);

  // This simulates the lifecycle of a ride after a driver accepts it.
  useEffect(() => {
    const activeRide = rides.find(r => r.user?.id === 'user123' && (r.status === 'driver_assigned' || r.status === 'en_route_pickup' || r.status === 'arrived_pickup' || r.status === 'in_progress'));
    let timeoutId: NodeJS.Timeout | undefined = undefined;
  
    if (activeRide) {
      setIsBookingProcessActive(true); 
      const updateRideStatus = (rideId: string, newStatus: RideStatus, newEta?: string) => {
        setRides(prevRides =>
          prevRides.map(r =>
            r.id === rideId ? { ...r, status: newStatus, driver: r.driver ? {...r.driver, eta: newEta ?? r.driver.eta} : undefined } : r
          )
        );
      };
  
      if (activeRide.status === 'driver_assigned') {
        timeoutId = setTimeout(() => {
          if (rides.find(r => r.id === activeRide.id)?.status === 'driver_assigned') { 
            toast({ title: "Driver En Route", description: `${activeRide.driver?.name} is coming to pick you up.` });
            updateRideStatus(activeRide.id, 'en_route_pickup', 'Arriving soon');
          }
        }, 4000);
      } else if (activeRide.status === 'en_route_pickup') {
        timeoutId = setTimeout(() => {
           if (rides.find(r => r.id === activeRide.id)?.status === 'en_route_pickup') { 
            toast({ title: "Driver Arrived", description: `${activeRide.driver?.name} has arrived.` });
            updateRideStatus(activeRide.id, 'arrived_pickup', undefined); 
          }
        }, 4000);
      } else if (activeRide.status === 'arrived_pickup') {
        timeoutId = setTimeout(() => {
           if (rides.find(r => r.id === activeRide.id)?.status === 'arrived_pickup') { 
            toast({ title: "Ride Started", description: "Your trip is now in progress." });
            updateRideStatus(activeRide.id, 'in_progress');
          }
        }, 3000);
      }
    } else {
        const isStillPotentiallyActive = rides.some(r => r.user?.id === 'user123' && (r.status === 'pending_approval' || r.status === 'scheduled'));
        if (!isStillPotentiallyActive) {
            setIsBookingProcessActive(false);
        }
    }
  
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [rides, toast]);


  const bookRide = (details: BookingDetails, user: User) => {
    setIsBookingProcessActive(true);
    setPickupLocation(details.pickup);
    setDropoffLocation(details.dropoff);
    setScheduledTime(undefined);

    const newRide: Ride = {
      id: `ride-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      pickupLocation: details.pickup,
      dropoffLocation: details.dropoff,
      status: 'pending_approval', 
      user,
      bookedAt: new Date(),
    };
    setRides(prevRides => [...prevRides, newRide]);
    
    setTimeout(() => {
      toast({ title: "Booking Requested", description: "Waiting for a driver to accept your ride." });
    }, 0);
  };

  const scheduleRide = (details: ScheduledBookingDetails, user: User) => {
    setIsBookingProcessActive(false); 
    setPickupLocation(details.pickup);
    setDropoffLocation(details.dropoff);
    setScheduledTime(details.dateTime);
    
    const newRide: Ride = {
      id: `ride-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      pickupLocation: details.pickup,
      dropoffLocation: details.dropoff,
      scheduledTime: details.dateTime,
      status: 'scheduled',
      user,
      bookedAt: new Date(),
    };
    setRides(prevRides => [...prevRides, newRide]);

    setTimeout(() => {
      toast({ title: "Ride Scheduled", description: `Your ride for ${details.dateTime.toLocaleString()} is confirmed. It will become active for drivers closer to the pickup time.` });
    }, 0);
  };

  const acceptRide = (rideId: string, driver: Driver) => {
    let rideAcceptedSuccessfully = false;
    setRides(prevRides =>
      prevRides.map(ride => {
        if (ride.id === rideId && ride.status === 'pending_approval') {
          const eta = `${Math.floor(Math.random() * 10) + 2} mins`;
          rideAcceptedSuccessfully = true;
          return { ...ride, status: 'driver_assigned', driver: {...driver, eta} };
        }
        return ride;
      })
    );

    if (rideAcceptedSuccessfully) {
      setTimeout(() => {
        toast({ title: "Ride Accepted!", description: `${driver.name} will pick you up.` });
      }, 0);
    }
  };
  
  const completeRide = (rideId: string) => {
    let rideCompletedSuccessfully = false;
    setRides(prevRides =>
      prevRides.map(ride => {
        if (ride.id === rideId && ride.status === 'in_progress') {
          rideCompletedSuccessfully = true;
          return { ...ride, status: 'completed' };
        }
        return ride;
      })
    );

    if (rideCompletedSuccessfully) {
      setTimeout(() => {
        toast({ title: "Ride Completed!", description: "The driver has marked the ride as completed." });
      }, 0);
    }
  };

  const cancelRide = (rideId: string) => {
    let rideCancelledSuccessfully = false;
    setRides(prevRides =>
      prevRides.map(ride => {
        if (ride.id === rideId && ride.status !== 'completed' && ride.status !== 'cancelled') {
          rideCancelledSuccessfully = true;
          return { ...ride, status: 'cancelled' };
        }
        return ride;
      })
    );

    if (rideCancelledSuccessfully) {
      setTimeout(() => {
        toast({ title: "Ride Cancelled", description: "The ride has been cancelled." });
      }, 0);
    }
  };
  
  const currentRide = rides.find(ride => 
    ride.user?.id === 'user123' && 
    (ride.status !== 'completed' && ride.status !== 'cancelled' && ride.status !== 'idle')
  ) || undefined;

  const currentDriverRides = rides.filter(ride => 
    ride.driver?.id === 'driver007' && 
    (ride.status !== 'completed' && ride.status !== 'cancelled' && ride.status !== 'idle')
  );


  return (
    <RideContext.Provider value={{ 
      rides, 
      setRides, 
      currentRide,
      currentDriverRides,
      bookRide, 
      scheduleRide, 
      acceptRide,
      completeRide,
      cancelRide,
      isBookingProcessActive,
      pickupLocation,
      dropoffLocation,
      scheduledTime 
    }}>
      {children}
    </RideContext.Provider>
  );
}

export function useRideContext() {
  const context = useContext(RideContext);
  if (context === undefined) {
    throw new Error('useRideContext must be used within a RideProvider');
  }
  return context;
}