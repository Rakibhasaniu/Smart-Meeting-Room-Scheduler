/* eslint-disable no-unused-vars */
import { Model, Types } from 'mongoose';

export interface TSlot {
  room: Types.ObjectId;
  date: Date;
  startTime: string; 
  endTime: string; 
  isBooked: boolean;
  isDeleted: boolean;
}

export interface SlotModel extends Model<TSlot> {
  isSlotExists(
    roomId: Types.ObjectId,
    date: Date,
    startTime: string,
    endTime: string,
  ): Promise<TSlot | null>;
}
