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
  // This should ideally be driven by real-time updates from a backend.
  useEffect(() => {
    const activeRide = rides.find(r => r.user?.id === 'user123' && (r.status === 'driver_assigned' || r.status === 'en_route_pickup' || r.status === 'arrived_pickup' || r.status === 'in_progress'));
    let timeoutId: NodeJS.Timeout | undefined = undefined;
  
    if (activeRide) {
      setIsBookingProcessActive(true); // Keep form disabled for user during active ride phases
      const updateRideStatus = (rideId: string, newStatus: RideStatus, newEta?: string) => {
        setRides(prevRides =>
          prevRides.map(r =>
            r.id === rideId ? { ...r, status: newStatus, driver: r.driver ? {...r.driver, eta: newEta ?? r.driver.eta} : undefined } : r
          )
        );
      };
  
      if (activeRide.status === 'driver_assigned') {
        // Simulate driver en route
        timeoutId = setTimeout(() => {
          // Toast for the state we are transitioning TO
          if (rides.find(r => r.id === activeRide.id)?.status === 'driver_assigned') { // Check if still relevant
            toast({ title: "Driver En Route", description: `${activeRide.driver?.name} is coming to pick you up.` });
            updateRideStatus(activeRide.id, 'en_route_pickup', 'Arriving soon');
          }
        }, 4000);
      } else if (activeRide.status === 'en_route_pickup') {
        // Simulate driver arrived
        timeoutId = setTimeout(() => {
           if (rides.find(r => r.id === activeRide.id)?.status === 'en_route_pickup') { // Check if still relevant
            toast({ title: "Driver Arrived", description: `${activeRide.driver?.name} has arrived.` });
            updateRideStatus(activeRide.id, 'arrived_pickup', undefined); // Clear ETA
          }
        }, 4000);
      } else if (activeRide.status === 'arrived_pickup') {
        // Simulate ride in progress
        timeoutId = setTimeout(() => {
           if (rides.find(r => r.id === activeRide.id)?.status === 'arrived_pickup') { // Check if still relevant
            toast({ title: "Ride Started", description: "Your trip is now in progress." });
            updateRideStatus(activeRide.id, 'in_progress');
          }
        }, 3000);
      } else if (activeRide.status === 'in_progress') {
        // Ride completion is now explicitly handled by driver's completeRide action.
        // No automatic completion timeout here.
      }
    } else {
        // If no ride is in an active phase that should disable the form, ensure it's enabled.
        // Exception: if a ride is 'pending_approval' or 'scheduled', the form might still be considered active for the user.
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
    setIsBookingProcessActive(true); // Disable form for user while pending
    setPickupLocation(details.pickup);
    setDropoffLocation(details.dropoff);
    setScheduledTime(undefined);

    const newRide: Ride = {
      id: `ride-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      pickupLocation: details.pickup,
      dropoffLocation: details.dropoff,
      status: 'pending_approval', // New status
      user,
      bookedAt: new Date(),
    };
    setRides(prevRides => [...prevRides, newRide]);
    toast({ title: "Booking Requested", description: "Waiting for a driver to accept your ride." });
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
    toast({ title: "Ride Scheduled", description: `Your ride for ${details.dateTime.toLocaleString()} is confirmed. It will become active for drivers closer to the pickup time.` });
  };

  const acceptRide = (rideId: string, driver: Driver) => {
    setRides(prevRides =>
      prevRides.map(ride => {
        if (ride.id === rideId && ride.status === 'pending_approval') {
          toast({ title: "Ride Accepted!", description: `${driver.name} will pick you up.` });
          const eta = `${Math.floor(Math.random() * 10) + 2} mins`;
          return { ...ride, status: 'driver_assigned', driver: {...driver, eta} };
        }
        return ride;
      })
    );
  };
  
  const completeRide = (rideId: string) => {
    setRides(prevRides =>
      prevRides.map(ride => {
        if (ride.id === rideId && ride.status === 'in_progress') {
           toast({ title: "Ride Completed!", description: "The driver has marked the ride as completed." });
          return { ...ride, status: 'completed' };
        }
        return ride;
      })
    );
     // Re-enable booking form for user if their ride is completed
    const completedRide = rides.find(r => r.id === rideId);
    if (completedRide && completedRide.user?.id === 'user123' && completedRide.status === 'completed') {
        setIsBookingProcessActive(false);
    }
  };

  const cancelRide = (rideId: string) => {
    setRides(prevRides =>
      prevRides.map(ride => {
        if (ride.id === rideId && ride.status !== 'completed' && ride.status !== 'cancelled') {
          toast({ title: "Ride Cancelled", description: "The ride has been cancelled." });
          return { ...ride, status: 'cancelled' };
        }
        return ride;
      })
    );
    // Check if the cancelled ride was the one making the form active for the user.
    const rideBeingCancelled = rides.find(r => r.id === rideId);
    if (rideBeingCancelled && rideBeingCancelled.user?.id === 'user123' ) { // MOCK USER ID
         setIsBookingProcessActive(false);
    }
  };
  
  // Determine currentRide for a user (assuming one active ride per user for simplicity)
  // This should be more robust in a real app, perhaps linking to a user ID from auth.
  const currentRide = rides.find(ride => 
    ride.user?.id === 'user123' && // MOCK USER ID
    (ride.status !== 'completed' && ride.status !== 'cancelled' && ride.status !== 'idle')
  ) || undefined;


  // Determine current active rides for a driver
  const currentDriverRides = rides.filter(ride => 
    ride.driver?.id === 'driver007' && // MOCK DRIVER ID for James Bond
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

