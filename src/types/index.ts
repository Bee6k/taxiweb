export interface Driver {
  id: string;
  name: string;
  vehicleModel: string;
  licensePlate: string;
  eta?: string; // Estimated time of arrival
}

export type RideStatus = 
  | 'idle' // Before any booking
  | 'searching' 
  | 'driver_assigned' 
  | 'en_route_pickup' // Driver on the way to pick up user
  | 'arrived_pickup' // Driver has arrived at pickup location
  | 'in_progress' // Ride started
  | 'completed' 
  | 'cancelled'
  | 'scheduled'; // Ride is scheduled for future

export interface Ride {
  id: string;
  pickupLocation: string;
  dropoffLocation: string;
  scheduledTime?: Date;
  status: RideStatus;
  userId: string;
  driverId?: string;
}

export interface BookingDetails {
  pickup: string;
  dropoff: string;
}

export interface ScheduledBookingDetails extends BookingDetails {
  dateTime: Date;
}
