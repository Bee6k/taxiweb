export interface User {
  id: string;
  name: string; // Example user detail
}

export interface Rating {
  rideId: string; // To ensure a ride is rated only once by a user for a specific driver
  userId: string; // User who gave the rating
  rating: number; // 1-5
  // comment?: string; // Optional for future
}

export type DriverTierName = 'Diamond' | 'Platinum' | 'Gold' | 'Silver' | 'Bronze' | 'Unranked';

export interface Driver {
  id: string;
  name: string;
  vehicleModel: string;
  licensePlate: string;
  eta?: string; // Estimated time of arrival
  ratings: Rating[]; 
  averageRating: number;
  tier: DriverTierName;
}

export type RideStatus = 
  | 'idle' // Before any booking
  | 'pending_approval' // Waiting for driver to accept
  | 'searching' // System is searching (can be skipped if driver accepts directly)
  | 'driver_assigned' 
  | 'en_route_pickup' // Driver on the way to pick up user
  | 'arrived_pickup' // Driver has arrived at pickup location
  | 'in_progress' // Ride started
  | 'completed' 
  | 'cancelled'
  | 'scheduled'; // Ride is scheduled for future

export interface Ride {
  id: string; // Unique ID for the ride
  pickupLocation: string;
  dropoffLocation: string;
  scheduledTime?: Date;
  status: RideStatus;
  user: User; // Associated user
  driver?: Driver; // Associated driver (optional until assigned)
  bookedAt: Date; // Timestamp of when the ride was booked
  ratingGiven?: number; // Stores the rating (1-5) given by the user for this ride
}

export interface BookingDetails {
  pickup: string;
  dropoff: string;
}

export interface ScheduledBookingDetails extends BookingDetails {
  dateTime: Date;
}

export type Role = 'user' | 'driver' | 'admin';
