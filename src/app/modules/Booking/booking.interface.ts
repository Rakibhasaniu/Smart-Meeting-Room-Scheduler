/* eslint-disable no-unused-vars */
import { Model, Types } from 'mongoose';

export type TBookingStatus =
  | 'pending'      
  | 'approved'     
  | 'rejected'     
  | 'cancelled'    
  | 'completed';   

export interface TTimeSlot {
  startTime: string; 
  endTime: string;   
}

export interface TBooking {
  room: Types.ObjectId;        
  date: Date;                  
  timeSlot: TTimeSlot;        
  purpose: string;             
  attendees: number;           
  status: TBookingStatus;      
  approvedBy?: Types.ObjectId; 
  rejectionReason?: string;    
  totalCost: number;           
  isDeleted: boolean;    
}      

export interface BookingModel extends Model<TBooking> {
  isBookingConflict(
    roomId: Types.ObjectId,
    date: Date,
    timeSlot: TTimeSlot,
    excludeBookingId?: Types.ObjectId,
  ): Promise<boolean>;
}
