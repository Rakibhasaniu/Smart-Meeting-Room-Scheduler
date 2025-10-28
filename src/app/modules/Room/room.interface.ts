/* eslint-disable no-unused-vars */
import { Model } from 'mongoose';

export interface TRoom {
  name: string;
  roomNumber: string;
  floor: number;
  capacity: number;
  pricePerHour: number;
  amenities: string[];
  description?: string;
  imageUrl?: string;
  isAvailable: boolean;
  isDeleted: boolean;
}

export interface RoomModel extends Model<TRoom> {
  isRoomExists(roomNumber: string): Promise<TRoom | null>;
}
