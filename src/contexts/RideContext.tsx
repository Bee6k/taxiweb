
"use client";

import type { ReactNode, Dispatch, SetStateAction } from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Ride, RideStatus, Driver, User, BookingDetails, ScheduledBookingDetails, Rating, DriverTierName } from '@/types';
import { useToast } from "@/hooks/use-toast";
import { getDriverTier, UNRANKED_TIER } from '@/config/constants'; // Import getDriverTier and UNRANKED_TIER

// Initial Mock Drivers Data - now managed within the context
const initialMockDrivers: Omit<Driver, 'ratings' | 'averageRating' | 'tier'>[] = [
  { id: 'driver1', name: 'John Doe', vehicleModel: 'Toyota Prius', licensePlate: 'XYZ 123' },
  { id: 'driver2', name: 'Jane Smith', vehicleModel: 'Honda Civic', licensePlate: 'ABC 789' },
  { id: 'driver007', name: 'James Bond', vehicleModel: 'Aston Martin DB5', licensePlate: 'BMT 216A' },
  { id: 'driver4', name: 'Sarah Connor', vehicleModel: 'Jeep Wrangler', licensePlate: 'TERM 84' },
  { id: 'driver5', name: 'Kyle Reese', vehicleModel: 'Ford Pinto', licensePlate: 'SAVE SC' },
];


interface RideContextType {
  rides: Ride[];
  setRides: Dispatch<SetStateAction<Ride[]>>;
  driversData: Driver[]; // All driver profiles
  currentRide: Ride | undefined; 
  currentDriverRides: Ride[]; 
  bookRide: (details: BookingDetails, user: User) => void;
  scheduleRide: (details: ScheduledBookingDetails, user: User) => void;
  acceptRide: (rideId: string, driverId: string) => void; 
  completeRide: (rideId: string) => void;
  cancelRide: (rideId: string) => void;
  submitRating: (rideId: string, driverId: string, userId: string, ratingValue: number) => void;
  isBookingProcessActive: boolean;
  pickupLocation: string | undefined;
  dropoffLocation: string | undefined;
  scheduledTime: Date | undefined;
}

const RideContext = createContext<RideContextType | undefined>(undefined);

export function RideProvider({ children }: { children: ReactNode }) {
  const [rides, setRides] = useState<Ride[]>([]);
  const [driversData, setDriversData] = useState<Driver[]>([]);
  const [isBookingProcessActive, setIsBookingProcessActive] = useState(false);
  const [pickupLocation, setPickupLocation] = useState<string | undefined>(undefined);
  const [dropoffLocation, setDropoffLocation] = useState<string | undefined>(undefined);
  const [scheduledTime, setScheduledTime] = useState<Date | undefined>(undefined);
  
  const { toast } = useToast();

  // Initialize driversData
  useEffect(() => {
    const storedDriversData = localStorage.getItem('rapidryde-driversData');
    if (storedDriversData) {
      setDriversData(JSON.parse(storedDriversData));
    } else {
      const initializedDrivers = initialMockDrivers.map(d => ({
        ...d,
        ratings: [],
        averageRating: 0,
        tier: UNRANKED_TIER.name as DriverTierName,
      }));
      setDriversData(initializedDrivers);
    }
  }, []);

  // Persist driversData to localStorage
  useEffect(() => {
    if (driversData.length > 0) { 
        localStorage.setItem('rapidryde-driversData', JSON.stringify(driversData));
    }
  }, [driversData]);


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
     if (rides.length > 0 || localStorage.getItem('rapidryde-rides')) { 
        localStorage.setItem('rapidryde-rides', JSON.stringify(rides));
     }
  }, [rides]);

  // Ride lifecycle simulation
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
    toast({ title: "Ride Scheduled", description: `Your ride for ${details.dateTime.toLocaleString()} is confirmed.` });
  };

  const acceptRide = useCallback((rideId: string, driverId: string) => {
    const driver = driversData.find(d => d.id === driverId);
    if (!driver) {
      toast({ title: "Error", description: "Driver not found.", variant: "destructive" });
      return;
    }

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
      toast({ title: "Ride Accepted!", description: `${driver.name} will pick you up.` });
    }
  }, [driversData, toast]); 
  
  const completeRide = useCallback((rideId: string) => {
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
       toast({ title: "Ride Completed!", description: "The driver has marked the ride as completed." });
    }
  }, [toast]);

  const cancelRide = useCallback((rideId: string) => {
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
      toast({ title: "Ride Cancelled", description: "The ride has been cancelled." });
    }
  }, [toast]);

  const submitRating = useCallback((rideId: string, driverId: string, userId: string, ratingValue: number) => {
    setDriversData(prevDrivers => 
      prevDrivers.map(driver => {
        if (driver.id === driverId) {
          const existingRatingIndex = driver.ratings.findIndex(r => r.rideId === rideId && r.userId === userId);
          
          let updatedRatings: Rating[];
          if (existingRatingIndex !== -1) {
            updatedRatings = driver.ratings.map((r, index) => 
              index === existingRatingIndex ? { ...r, rating: ratingValue } : r
            );
          } else {
            updatedRatings = [...driver.ratings, { rideId, userId, rating: ratingValue }];
          }

          const totalRating = updatedRatings.reduce((acc, curr) => acc + curr.rating, 0);
          const averageRating = updatedRatings.length > 0 ? parseFloat((totalRating / updatedRatings.length).toFixed(2)) : 0;
          const tier = getDriverTier(averageRating).name;
          
          return { ...driver, ratings: updatedRatings, averageRating, tier };
        }
        return driver;
      })
    );

    setRides(prevRides => 
      prevRides.map(ride => 
        ride.id === rideId ? { ...ride, ratingGiven: ratingValue } : ride
      )
    );
    toast({ title: "Rating Submitted", description: `You rated the driver ${ratingValue} stars.` });
  }, [toast]);
  
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
      driversData,
      currentRide,
      currentDriverRides,
      bookRide, 
      scheduleRide, 
      acceptRide,
      completeRide,
      cancelRide,
      submitRating,
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

    