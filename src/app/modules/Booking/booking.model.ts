import { Schema, model, Types } from 'mongoose';
import { BookingModel, TBooking, TTimeSlot } from './booking.interface';

const timeSlotSchema = new Schema<TTimeSlot>(
  {
    startTime: {
      type: String,
      required: [true, 'Start time is required'],
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Time must be in HH:mm format'],
    },
    endTime: {
      type: String,
      required: [true, 'End time is required'],
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Time must be in HH:mm format'],
    },
  },
  { _id: false },
);

const bookingSchema = new Schema<TBooking, BookingModel>(
  {
    room: {
      type: Schema.Types.ObjectId,
      ref: 'Room',
      required: [true, 'Room is required'],
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
    },
    timeSlot: {
      type: timeSlotSchema,
      required: [true, 'Time slot is required'],
    },
    purpose: {
      type: String,
      required: [true, 'Purpose is required'],
      trim: true,
    },
    attendees: {
      type: Number,
      required: [true, 'Number of attendees is required'],
      min: [1, 'At least 1 attendee is required'],
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'cancelled', 'completed'],
      default: 'pending',
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    rejectionReason: {
      type: String,
      trim: true,
    },
    totalCost: {
      type: Number,
      required: [true, 'Total cost is required'],
      min: [0, 'Total cost cannot be negative'],
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

bookingSchema.statics.isBookingConflict = async function (
  roomId: Types.ObjectId,
  date: Date,
  timeSlot: TTimeSlot,
  excludeBookingId?: Types.ObjectId,
) {
  const startTime = timeSlot.startTime;
  const endTime = timeSlot.endTime;

  const bookingDate = new Date(date);
  bookingDate.setHours(0, 0, 0, 0);

  const nextDay = new Date(bookingDate);
  nextDay.setDate(nextDay.getDate() + 1);

  const query: any = {
    room: roomId,
    date: {
      $gte: bookingDate,
      $lt: nextDay,
    },
    status: { $in: ['pending', 'approved'] }, // Only check active bookings
    isDeleted: false,
    $or: [
      // New booking starts during existing booking
      {
        'timeSlot.startTime': { $lte: startTime },
        'timeSlot.endTime': { $gt: startTime },
      },
      // New booking ends during existing booking
      {
        'timeSlot.startTime': { $lt: endTime },
        'timeSlot.endTime': { $gte: endTime },
      },
      // New booking completely overlaps existing booking
      {
        'timeSlot.startTime': { $gte: startTime },
        'timeSlot.endTime': { $lte: endTime },
      },
    ],
  };

  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }

  const conflictingBooking = await Booking.findOne(query);
  return !!conflictingBooking;
};

bookingSchema.pre('find', function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

bookingSchema.pre('findOne', function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

export const Booking = model<TBooking, BookingModel>('Booking', bookingSchema);
