import { Schema, model, Types } from 'mongoose';
import { SlotModel, TSlot } from './slot.interface';

const slotSchema = new Schema<TSlot, SlotModel>(
  {
    room: {
      type: Schema.Types.ObjectId,
      required: [true, 'Room is required'],
      ref: 'Room',
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
    },
    startTime: {
      type: String,
      required: [true, 'Start time is required'],
    },
    endTime: {
      type: String,
      required: [true, 'End time is required'],
    },
    isBooked: {
      type: Boolean,
      default: false,
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

slotSchema.pre('find', function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

slotSchema.pre('findOne', function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

slotSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } });
  next();
});

slotSchema.statics.isSlotExists = async function (
  roomId: Types.ObjectId,
  date: Date,
  startTime: string,
  endTime: string,
) {
  const slotDate = new Date(date);
  slotDate.setHours(0, 0, 0, 0);

  const nextDay = new Date(slotDate);
  nextDay.setDate(nextDay.getDate() + 1);

  return await Slot.findOne({
    room: roomId,
    date: { $gte: slotDate, $lt: nextDay },
    startTime,
    endTime,
    isDeleted: false,
  });
};

export const Slot = model<TSlot, SlotModel>('Slot', slotSchema);
