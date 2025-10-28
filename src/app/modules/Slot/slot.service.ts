/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { Room } from '../Room/room.model';
import { TSlot } from './slot.interface';
import { Slot } from './slot.model';
import { Types } from 'mongoose';

const createSlot = async (payload: Partial<TSlot>) => {
  // Check if room exists
  const room = await Room.findById(payload.room);
  if (!room) {
    throw new AppError(httpStatus.NOT_FOUND, 'Room not found!');
  }

  // Check if slot already exists
  const isSlotExist = await Slot.isSlotExists(
    payload.room as Types.ObjectId,
    payload.date as Date,
    payload.startTime as string,
    payload.endTime as string,
  );

  if (isSlotExist) {
    throw new AppError(
      httpStatus.CONFLICT,
      'Slot already exists for this room and time!',
    );
  }

  const slot = await Slot.create(payload);
  const result = await Slot.findById(slot._id).populate('room');
  return result;
};

const getAllSlots = async (query: Record<string, unknown>) => {
  const { room, date, isBooked } = query;

  const filter: Record<string, unknown> = { isDeleted: false };

  if (room) {
    filter.room = room;
  }

  if (date) {
    const slotDate = new Date(date as string);
    slotDate.setHours(0, 0, 0, 0);

    const nextDay = new Date(slotDate);
    nextDay.setDate(nextDay.getDate() + 1);

    filter.date = { $gte: slotDate, $lt: nextDay };
  }

  if (isBooked !== undefined) {
    filter.isBooked = isBooked === 'true';
  }

  const result = await Slot.find(filter).populate('room').sort({ date: 1, startTime: 1 });
  return result;
};

const getAvailableSlots = async (query: Record<string, unknown>) => {
  const { room, date } = query;

  if (!room || !date) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Room ID and date are required!',
    );
  }

  // Check if room exists
  const roomExists = await Room.findById(room);
  if (!roomExists) {
    throw new AppError(httpStatus.NOT_FOUND, 'Room not found!');
  }

  const slotDate = new Date(date as string);
  slotDate.setHours(0, 0, 0, 0);

  const nextDay = new Date(slotDate);
  nextDay.setDate(nextDay.getDate() + 1);

  const result = await Slot.find({
    room,
    date: { $gte: slotDate, $lt: nextDay },
    isBooked: false,
    isDeleted: false,
  })
    .populate('room')
    .sort({ startTime: 1 });

  return result;
};

const getSingleSlot = async (id: string) => {
  const result = await Slot.findById(id).populate('room');

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Slot not found!');
  }

  return result;
};

const updateSlot = async (id: string, payload: Partial<TSlot>) => {
  const slot = await Slot.findById(id);

  if (!slot) {
    throw new AppError(httpStatus.NOT_FOUND, 'Slot not found!');
  }

  // If slot is booked, don't allow updates
  if (slot.isBooked) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Cannot update a booked slot! Cancel the booking first.',
    );
  }

  const result = await Slot.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  }).populate('room');

  return result;
};

const deleteSlot = async (id: string) => {
  const slot = await Slot.findById(id);

  if (!slot) {
    throw new AppError(httpStatus.NOT_FOUND, 'Slot not found!');
  }

  // Check if slot is booked
  if (slot.isBooked) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Cannot delete a booked slot! Cancel the booking first.',
    );
  }

  const result = await Slot.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true },
  );

  return result;
};

// Mark slot as booked (called internally by booking service)
const markSlotAsBooked = async (
  roomId: Types.ObjectId,
  date: Date,
  startTime: string,
  endTime: string,
) => {
  const slot = await Slot.isSlotExists(roomId, date, startTime, endTime);

  if (!slot) {
    throw new AppError(httpStatus.NOT_FOUND, 'Slot not found!');
  }

  if (slot.isBooked) {
    throw new AppError(httpStatus.CONFLICT, 'Slot is already booked!');
  }

  const result = await Slot.findByIdAndUpdate(
    (slot as any)._id,
    { isBooked: true },
    { new: true },
  );

  return result;
};

// Mark slot as available (called internally when booking is cancelled)
const markSlotAsAvailable = async (
  roomId: Types.ObjectId,
  date: Date,
  startTime: string,
  endTime: string,
) => {
  const slot = await Slot.isSlotExists(roomId, date, startTime, endTime);

  if (slot) {
    await Slot.findByIdAndUpdate(
      (slot as any)._id,
      { isBooked: false },
      { new: true },
    );
  }
};

export const SlotServices = {
  createSlot,
  getAllSlots,
  getAvailableSlots,
  getSingleSlot,
  updateSlot,
  deleteSlot,
  markSlotAsBooked,
  markSlotAsAvailable,
};
