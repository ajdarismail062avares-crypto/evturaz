export type UserRole = 'BUYER' | 'SELLER' | 'RENTER' | 'AGENT' | 'ADMIN';
export type PropertyType = 'HOUSE' | 'APARTMENT' | 'CONDO' | 'COMMERCIAL' | 'LAND' | 'TOWNHOUSE' | 'VILLA';
export type ListingType = 'FOR_SALE' | 'FOR_RENT' | 'FOR_LEASE' | 'AUCTION';
export type PropertyStatus = 'ACTIVE' | 'PENDING' | 'SOLD' | 'RENTED' | 'OFF_MARKET';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  phone?: string;
  role: UserRole;
  bio?: string;
  isVerified: boolean;
  licenseNumber?: string;
  createdAt: string;
}

export interface Property {
  id: string;
  title: string;
  description: string;
  propertyType: PropertyType;
  listingType: ListingType;
  status: PropertyStatus;
  price: number;
  pricePerMonth?: number;
  bedrooms?: number;
  bathrooms?: number;
  squareFeet: number;
  lotSize?: number;
  yearBuilt?: number;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  latitude: number;
  longitude: number;
  neighborhood?: string;
  images: string[];
  videos: string[];
  floorPlanUrl?: string;
  model3dUrl?: string;
  has3DTour: boolean;
  tourRoomData?: TourRoomData;
  garage: boolean;
  garageSpaces?: number;
  pool: boolean;
  basement: boolean;
  furnished: boolean;
  petFriendly: boolean;
  airConditioning: boolean;
  heating: boolean;
  washerDryer: boolean;
  hoaFee?: number;
  viewCount: number;
  favoriteCount: number;
  isFeatured: boolean;
  mlsNumber?: string;
  estimatedValue?: number;
  priceHistory?: PriceHistory[];
  owner: Partial<User>;
  agent?: Partial<User>;
  amenities?: PropertyAmenity[];
  createdAt: string;
  updatedAt: string;
}

export interface TourRoomData {
  rooms: TourRoom[];
  scale: number;
  origin: { x: number; y: number; z: number };
}

export interface TourRoom {
  id: string;
  name: string;
  bounds: { min: { x: number; z: number }; max: { x: number; z: number } };
  height: number;
  floorTexture?: string;
  wallTexture?: string;
  ceilingTexture?: string;
  furniture?: FurnitureItem[];
  spawnPoint?: { x: number; y: number; z: number };
}

export interface FurnitureItem {
  id: string;
  type: string;
  position: { x: number; y: number; z: number };
  rotation: number;
  scale: { x: number; y: number; z: number };
  color?: string;
  modelUrl?: string;
}

export interface PropertyAmenity {
  id: string;
  name: string;
  category: string;
}

export interface PriceHistory {
  date: string;
  price: number;
  event: string;
}

export interface TourSession {
  id: string;
  propertyId: string;
  hostId: string;
  status: 'SCHEDULED' | 'LIVE' | 'COMPLETED' | 'CANCELLED';
  scheduledAt?: string;
  startedAt?: string;
  endedAt?: string;
  roomCode: string;
  isMultiplayer: boolean;
  property?: Partial<Property>;
  host?: Partial<User>;
}

export interface TourParticipant {
  userId: string;
  socketId: string;
  name: string;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number };
  isMuted: boolean;
  avatarColor?: string;
}

export interface SearchFilters {
  q?: string;
  city?: string;
  state?: string;
  type?: PropertyType;
  listingType?: ListingType;
  minPrice?: number;
  maxPrice?: number;
  minBeds?: number;
  minBaths?: number;
  minSqft?: number;
  lat?: number;
  lng?: number;
  radius?: number;
  sort?: string;
  page?: number;
}

export interface MortgageCalculation {
  homePrice: number;
  downPayment: number;
  loanTerm: number;
  interestRate: number;
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  principalAndInterest: number;
  propertyTax: number;
  insurance: number;
}
