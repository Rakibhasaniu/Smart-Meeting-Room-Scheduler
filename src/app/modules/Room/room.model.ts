import { Schema, model } from 'mongoose';
import { RoomModel, TRoom } from './room.interface';

const roomSchema = new Schema<TRoom, RoomModel>(
  {
    name: {
      type: String,
      required: [true, 'Room name is required'],
      trim: true,
    },
    roomNumber: {
      type: String,
      required: [true, 'Room number is required'],
      unique: true,
      trim: true,
    },
    capacity: {
      type: Number,
      required: [true, 'Capacity is required'],
      min: [1, 'Capacity must be at least 1'],
    },
    pricePerHour: {
      type: Number,
      required: [true, 'Price per hour is required'],
      min: [0, 'Price cannot be negative'],
    },
    amenities: {
      type: [String],
      default: [],
    },
    equipment: {
      type: [String],
      required: [true, 'Equipment list is required'],
      default: [],
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    imageUrl: {
      type: String,
      trim: true,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

roomSchema.statics.isRoomExists = async function (roomNumber: string) {
  return await Room.findOne({ roomNumber, isDeleted: false });
};

roomSchema.pre('find', function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

roomSchema.pre('findOne', function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

export const Room = model<TRoom, RoomModel>('Room', roomSchema);
