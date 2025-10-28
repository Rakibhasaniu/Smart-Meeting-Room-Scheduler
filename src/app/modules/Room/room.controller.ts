import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { RoomServices } from './room.service';

const createRoom = catchAsync(async (req, res) => {
  const result = await RoomServices.createRoom(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Room created successfully',
    data: result,
  });
});

const getAllRooms = catchAsync(async (req, res) => {
  const result = await RoomServices.getAllRooms(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Rooms retrieved successfully',
    data: result,
  });
});

const getRoomById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await RoomServices.getRoomById(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Room retrieved successfully',
    data: result,
  });
});

const updateRoom = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await RoomServices.updateRoom(id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Room updated successfully',
    data: result,
  });
});

const deleteRoom = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await RoomServices.deleteRoom(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Room deleted successfully',
    data: result,
  });
});

const toggleRoomAvailability = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await RoomServices.toggleRoomAvailability(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Room availability toggled successfully',
    data: result,
  });
});

export const RoomControllers = {
  createRoom,
  getAllRooms,
  getRoomById,
  updateRoom,
  deleteRoom,
  toggleRoomAvailability,
};
