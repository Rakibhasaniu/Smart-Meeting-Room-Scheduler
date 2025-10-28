import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { SlotServices } from './slot.service';

const createSlot = catchAsync(async (req, res) => {
  const result = await SlotServices.createSlot(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Slot created successfully',
    data: result,
  });
});

const getAllSlots = catchAsync(async (req, res) => {
  const result = await SlotServices.getAllSlots(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Slots retrieved successfully',
    data: result,
  });
});

const getAvailableSlots = catchAsync(async (req, res) => {
  const result = await SlotServices.getAvailableSlots(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Available slots retrieved successfully',
    data: result,
  });
});

const getSingleSlot = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await SlotServices.getSingleSlot(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Slot retrieved successfully',
    data: result,
  });
});

const updateSlot = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await SlotServices.updateSlot(id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Slot updated successfully',
    data: result,
  });
});

const deleteSlot = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await SlotServices.deleteSlot(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Slot deleted successfully',
    data: result,
  });
});

export const SlotControllers = {
  createSlot,
  getAllSlots,
  getAvailableSlots,
  getSingleSlot,
  updateSlot,
  deleteSlot,
};
