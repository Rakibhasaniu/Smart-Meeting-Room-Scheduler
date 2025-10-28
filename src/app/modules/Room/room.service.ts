import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { TRoom } from './room.interface';
import { Room } from './room.model';

const createRoom = async (payload: TRoom) => {
  const existingRoom = await Room.isRoomExists(payload.roomNumber);

  if (existingRoom) {
    throw new AppError(httpStatus.CONFLICT, 'Room number already exists!');
  }

  const result = await Room.create(payload);
  return result;
};

const getAllRooms = async (query: Record<string, unknown>) => {
  const {
    capacity,
    pricePerHour,
    amenities,
    floor,
    isAvailable,
    search
  } = query;

  const filter: Record<string, unknown> = { isDeleted: false };

  if (capacity) {
    filter.capacity = { $gte: Number(capacity) };
  }

  if (pricePerHour) {
    filter.pricePerHour = { $lte: Number(pricePerHour) };
  }

  if (floor) {
    filter.floor = Number(floor);
  }

  if (isAvailable !== undefined) {
    filter.isAvailable = isAvailable === 'true';
  }

  if (amenities) {
    const amenitiesArray = Array.isArray(amenities)
      ? amenities
      : [amenities];
    filter.amenities = { $all: amenitiesArray };
  }

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { roomNumber: { $regex: search, $options: 'i' } },
    ];
  }

  const result = await Room.find(filter).sort({ floor: 1, roomNumber: 1 });
  return result;
};

const getRoomById = async (id: string) => {
  const result = await Room.findById(id);

  if (!result || result.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'Room not found!');
  }

  return result;
};

const updateRoom = async (id: string, payload: Partial<TRoom>) => {
  const room = await Room.findById(id);

  if (!room || room.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'Room not found!');
  }

  if (payload.roomNumber && payload.roomNumber !== room.roomNumber) {
    const existingRoom = await Room.isRoomExists(payload.roomNumber);
    if (existingRoom) {
      throw new AppError(httpStatus.CONFLICT, 'Room number already exists!');
    }
  }

  const result = await Room.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  return result;
};

const deleteRoom = async (id: string) => {
  const room = await Room.findById(id);

  if (!room || room.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'Room not found!');
  }

  const result = await Room.findByIdAndUpdate(
    id,
    { isDeleted: true, isAvailable: false },
    { new: true },
  );

  return result;
};

const toggleRoomAvailability = async (id: string) => {
  const room = await Room.findById(id);

  if (!room || room.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'Room not found!');
  }

  const result = await Room.findByIdAndUpdate(
    id,
    { isAvailable: !room.isAvailable },
    { new: true },
  );

  return result;
};

export const RoomServices = {
  createRoom,
  getAllRooms,
  getRoomById,
  updateRoom,
  deleteRoom,
  toggleRoomAvailability,
};
