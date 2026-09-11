export interface Vehicle {
  id: string;
  orderNumber: string; // '01 / 06'
  brand: string;
  model: string;
  variant: string;
  category: 'PERFORMANCE' | 'SUPERCAR' | 'LUXURY SUV' | 'EXECUTIVE EV';
  pricePerDay: number;
  power: string;
  acceleration: string;
  topSpeed: string;
  engine: string;
  transmission: string;
  seats: number;
  drivetrain: string;
  curbWeight: string;
  fuelType: string;
  image: string;
  gallery: string[];
  soundProfile: string;
  description: string;
  featuredQuote: string;
}

export interface CityHub {
  id: string;
  name: string;
  coordinates: string;
  airports: string[];
  lounges: string;
  leadTime: string;
  image: string;
  fleetCount: number;
}

export interface JournalArticle {
  id: string;
  tag: string;
  title: string;
  readTime: string;
  date: string;
  image: string;
  summary: string;
}

export interface ReservationState {
  step: 1 | 2 | 3 | 4 | 5; // 5 is confirmation
  vehicle: Vehicle | null;
  pickupDate: string;
  returnDate: string;
  city: string;
  pickupType: 'airport' | 'hotel' | 'residence' | 'lounge';
  pickupAddress: string;
  insurancePackage: 'standard' | 'concierge' | 'track-ready';
  unlimitedMiles: boolean;
  chauffeurHandover: boolean;
  fullName: string;
  email: string;
  phone: string;
  driverLicense: string;
  specialRequests: string;
  bookingRef?: string;
}
