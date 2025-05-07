export interface User {
  id: string;
  name: string; // Example user detail
}

export interface Driver {
  id: string;
  name: string;
  vehicleModel: string;
  licensePlate: string;
  eta?: string; // Estimated time of arrival
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
}

export interface BookingDetails {
  pickup: string;
  dropoff: string;
}

export interface ScheduledBookingDetails extends BookingDetails {
  dateTime: Date;
}

export type Role = 'user' | 'driver' | 'admin';
