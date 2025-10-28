import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { BookingServices } from './booking.service';

const createBooking = catchAsync(async (req, res) => {
  const userId = req.user.userId;
  const result = await BookingServices.createBooking(userId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Booking created successfully',
    data: result,
  });
});

const getAllBookings = catchAsync(async (req, res) => {
  const result = await BookingServices.getAllBookings(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Bookings retrieved successfully',
    data: result,
  });
});

const getMyBookings = catchAsync(async (req, res) => {
  const userId = req.user.userId;
  const result = await BookingServices.getMyBookings(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'My bookings retrieved successfully',
    data: result,
  });
});

const getBookingById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await BookingServices.getBookingById(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Booking retrieved successfully',
    data: result,
  });
});

const updateBooking = catchAsync(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;
  const result = await BookingServices.updateBooking(id, userId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Booking updated successfully',
    data: result,
  });
});

const approveOrRejectBooking = catchAsync(async (req, res) => {
  const { id } = req.params;
  const approverUserId = req.user.userId;
  const { status, rejectionReason } = req.body;

  const result = await BookingServices.approveOrRejectBooking(
    id,
    approverUserId,
    status,
    rejectionReason,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `Booking ${status} successfully`,
    data: result,
  });
});

const cancelBooking = catchAsync(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;
  const result = await BookingServices.cancelBooking(id, userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Booking cancelled successfully',
    data: result,
  });
});

const deleteBooking = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await BookingServices.deleteBooking(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Booking deleted successfully',
    data: result,
  });
});

export const BookingControllers = {
  createBooking,
  getAllBookings,
  getMyBookings,
  getBookingById,
  updateBooking,
  approveOrRejectBooking,
  cancelBooking,
  deleteBooking,
};
