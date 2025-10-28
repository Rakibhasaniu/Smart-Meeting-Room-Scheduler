/* eslint-disable @typescript-eslint/no-explicit-any */
import { Types } from 'mongoose';

export type TMeetingPriority = 'low' | 'normal' | 'high' | 'urgent' | 'ceo';

export interface TMeetingRequest {
  organizer: Types.ObjectId;
  attendees: string[]; 
  duration: number; 
  requiredEquipment: string[]; 
  preferredStartTime: Date;
  flexibility: number; 
  priority: TMeetingPriority;
  preferredLocation?: string; 
}

export interface TRoomRecommendation {
  room: Types.ObjectId;
  roomDetails: {
    name: string;
    roomNumber: string;
    capacity: number;
    equipment: string[];
    pricePerHour: number;
    location: string;
  };
  suggestedTime: Date;
  endTime: Date;
  score: number; 
  reasons: string[]; 
  costOptimization: number; 
}

export interface TOptimalMeetingResult {
  recommendedRoom: TRoomRecommendation | null;
  alternativeOptions: TRoomRecommendation[];
  conflicts: {
    hasConflict: boolean;
    conflictingBookings?: any[];
  };
  suggestions: string[]; 
}

export interface TAllocationScore {
  capacityScore: number; 
  equipmentScore: number;
  costScore: number; 
  locationScore: number; 
  timeScore: number;
  totalScore: number; 
}
