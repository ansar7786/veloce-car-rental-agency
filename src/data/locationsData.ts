import type { CityHub } from '../types';

export const CITY_HUBS: CityHub[] = [
  {
    id: 'mumbai',
    name: 'MUMBAI',
    coordinates: '18.9220° N, 72.8347° E',
    airports: ['Chhatrapati Shivaji Maharaj T2 VIP GAT', 'Juhu Aviation Club'],
    lounges: 'The Oberoi Sky Pavilion & Nariman Point Marina Hub',
    leadTime: '45 MIN TO HANDOVER',
    image: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1800&q=80',
    fleetCount: 18
  },
  {
    id: 'delhi',
    name: 'DELHI NCR',
    coordinates: '28.6139° N, 77.2090° E',
    airports: ['Indira Gandhi International Terminal 3 VIP Suite'],
    lounges: 'Aerocity Private Terminal & The Leela Palace Chanakyapuri',
    leadTime: '60 MIN TO HANDOVER',
    image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1800&q=80',
    fleetCount: 22
  },
  {
    id: 'bangalore',
    name: 'BANGALORE',
    coordinates: '12.9716° N, 77.5946° E',
    airports: ['Kempegowda T2 VIP Lounge & HAL Executive Ramp'],
    lounges: 'UB City Sky Deck & VÉLOCÉ Tech Pavilion Whitefield',
    leadTime: '50 MIN TO HANDOVER',
    image: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=1800&q=80',
    fleetCount: 16
  },
  {
    id: 'hyderabad',
    name: 'HYDERABAD',
    coordinates: '17.3850° N, 78.4867° E',
    airports: ['Rajiv Gandhi International VIP General Aviation Terminal'],
    lounges: 'Taj Falaknuma Palace & Jubilee Hills Executive Hub',
    leadTime: '40 MIN TO HANDOVER',
    image: 'https://images.unsplash.com/photo-1605007493699-ce65834f8a00?auto=format&fit=crop&w=1800&q=80',
    fleetCount: 14
  },
  {
    id: 'goa',
    name: 'GOA',
    coordinates: '15.2993° N, 74.1240° E',
    airports: ['Mopa Manohar International & Dabolim Executive Airfield'],
    lounges: 'W Goa Vagator Cliffside Concierge & North Bay Marina',
    leadTime: '30 MIN TO HANDOVER',
    image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1800&q=80',
    fleetCount: 12
  }
];
