import httpStatus from 'http-status';
import { Types } from 'mongoose';
import AppError from '../../errors/AppError';
import { Room } from '../Room/room.model';
import { TBooking } from './booking.interface';
import { Booking } from './booking.model';

const createBooking = async (userId: string, payload: Partial<TBooking>) => {
  const room = await Room.findById(payload.room);

  if (!room || room.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'Room not found!');
  }

  if (!room.isAvailable) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Room is not available!');
  }

  if (payload.attendees && payload.attendees > room.capacity) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Room capacity is ${room.capacity}. Cannot accommodate ${payload.attendees} attendees!`,
    );
  }

  const hasConflict = await Booking.isBookingConflict(
    payload.room as Types.ObjectId,
    payload.date as Date,
    payload.timeSlot!,
  );

  if (hasConflict) {
    throw new AppError(
      httpStatus.CONFLICT,
      'Room is already booked for this time slot!',
    );
  }

  const [startHour, startMinute] = payload.timeSlot!.startTime.split(':').map(Number);
  const [endHour, endMinute] = payload.timeSlot!.endTime.split(':').map(Number);
  const durationInHours = (endHour * 60 + endMinute - (startHour * 60 + startMinute)) / 60;
  const totalCost = room.pricePerHour * durationInHours;

  const booking = await Booking.create({
    ...payload,
    user: new Types.ObjectId(userId),
    totalCost,
    status: 'pending', 
  });

  const result = await Booking.findById(booking._id)
    .populate('room')
    .populate('user', '-password');

  return result;
};

const getAllBookings = async (query: Record<string, unknown>) => {
  const { status, date, room } = query;

  const filter: Record<string, unknown> = { isDeleted: false };

  if (status) {
    filter.status = status;
  }

  if (date) {
    const bookingDate = new Date(date as string);
    bookingDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(bookingDate);
    nextDay.setDate(nextDay.getDate() + 1);

    filter.date = {
      $gte: bookingDate,
      $lt: nextDay,
    };
  }

  if (room) {
    filter.room = room;
  }

  const result = await Booking.find(filter)
    .populate('room')
    .populate('user', '-password')
    .populate('approvedBy', '-password')
    .sort({ date: -1, 'timeSlot.startTime': 1 });

  return result;
};

const getMyBookings = async (userId: string) => {
  const result = await Booking.find({
    user: new Types.ObjectId(userId),
    isDeleted: false,
  })
    .populate('room')
    .populate('approvedBy', '-password')
    .sort({ date: -1, 'timeSlot.startTime': 1 });

  return result;
};

const getBookingById = async (id: string) => {
  const result = await Booking.findById(id)
    .populate('room')
    .populate('user', '-password')
    .populate('approvedBy', '-password');

  if (!result || result.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'Booking not found!');
  }

  return result;
};

const updateBooking = async (
  id: string,
  userId: string,
  payload: Partial<TBooking>,
) => {
  const booking = await Booking.findById(id);

  if (!booking || booking.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'Booking not found!');
  }

  if (booking.user.toString() !== userId) {
    throw new AppError(httpStatus.FORBIDDEN, 'You can only update your own bookings!');
  }

  if (booking.status !== 'pending') {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Cannot update ${booking.status} booking!`,
    );
  }

  if (payload.date || payload.timeSlot) {
    const checkDate = payload.date || booking.date;
    const checkTimeSlot = payload.timeSlot || booking.timeSlot;

    const hasConflict = await Booking.isBookingConflict(
      booking.room,
      checkDate,
      checkTimeSlot,
      booking._id,
    );

    if (hasConflict) {
      throw new AppError(
        httpStatus.CONFLICT,
        'Room is already booked for this time slot!',
      );
    }

    if (payload.timeSlot) {
      const room = await Room.findById(booking.room);
      const [startHour, startMinute] = payload.timeSlot.startTime.split(':').map(Number);
      const [endHour, endMinute] = payload.timeSlot.endTime.split(':').map(Number);
      const durationInHours = (endHour * 60 + endMinute - (startHour * 60 + startMinute)) / 60;
      payload.totalCost = room!.pricePerHour * durationInHours;
    }
  }

  const result = await Booking.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  })
    .populate('room')
    .populate('user', '-password');

  return result;
};

const approveOrRejectBooking = async (
  id: string,
  approverUserId: string,
  status: 'approved' | 'rejected',
  rejectionReason?: string,
) => {
  const booking = await Booking.findById(id);

  if (!booking || booking.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'Booking not found!');
  }

  if (booking.status !== 'pending') {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Cannot ${status} ${booking.status} booking!`,
    );
  }

  const updateData: any = {
    status,
    approvedBy: new Types.ObjectId(approverUserId),
  };

  if (status === 'rejected' && rejectionReason) {
    updateData.rejectionReason = rejectionReason;
  }

  const result = await Booking.findByIdAndUpdate(id, updateData, {
    new: true,
  })
    .populate('room')
    .populate('user', '-password')
    .populate('approvedBy', '-password');

  return result;
};

const cancelBooking = async (id: string, userId: string) => {
  const booking = await Booking.findById(id);

  if (!booking || booking.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'Booking not found!');
  }

  if (booking.user.toString() !== userId) {
    throw new AppError(httpStatus.FORBIDDEN, 'You can only cancel your own bookings!');
  }

  if (booking.status === 'completed' || booking.status === 'cancelled') {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Cannot cancel ${booking.status} booking!`,
    );
  }

  const result = await Booking.findByIdAndUpdate(
    id,
    { status: 'cancelled' },
    { new: true },
  )
    .populate('room')
    .populate('user', '-password');

  return result;
};

const deleteBooking = async (id: string) => {
  const booking = await Booking.findById(id);

  if (!booking || booking.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'Booking not found!');
  }

  const result = await Booking.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true },
  );

  return result;
};

export const BookingServices = {
  createBooking,
  getAllBookings,
  getMyBookings,
  getBookingById,
  updateBooking,
  approveOrRejectBooking,
  cancelBooking,
  deleteBooking,
};
