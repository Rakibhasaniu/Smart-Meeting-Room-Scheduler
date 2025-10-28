import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { USER_ROLE } from '../User/user.constant';
import { BookingControllers } from './booking.controller';
import { BookingValidation } from './booking.validation';

const router = express.Router();

/**
 * @swagger
 * /api/bookings:
 *   post:
 *     tags:
 *       - Bookings
 *     summary: Create a new booking (Authenticated users)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - room
 *               - date
 *               - timeSlot
 *               - purpose
 *               - attendees
 *             properties:
 *               room:
 *                 type: string
 *                 example: 507f1f77bcf86cd799439011
 *               date:
 *                 type: string
 *                 format: date
 *                 example: 2025-11-01
 *               timeSlot:
 *                 type: object
 *                 properties:
 *                   startTime:
 *                     type: string
 *                     example: "09:00"
 *                   endTime:
 *                     type: string
 *                     example: "11:00"
 *               purpose:
 *                 type: string
 *                 example: Team sprint planning meeting
 *               attendees:
 *                 type: number
 *                 example: 8
 *     responses:
 *       201:
 *         description: Booking created successfully
 *       409:
 *         description: Room already booked for this time slot
 *       400:
 *         description: Room unavailable or capacity exceeded
 */
router.post(
  '/',
  auth(USER_ROLE.USER, USER_ROLE.MANAGER, USER_ROLE.CEO, USER_ROLE.ADMIN),
  validateRequest(BookingValidation.createBookingValidationSchema),
  BookingControllers.createBooking,
);

/**
 * @swagger
 * /api/bookings:
 *   get:
 *     tags:
 *       - Bookings
 *     summary: Get all bookings (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected, cancelled, completed]
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: room
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Bookings retrieved successfully
 */
router.get(
  '/',
  auth(USER_ROLE.ADMIN),
  BookingControllers.getAllBookings,
);

/**
 * @swagger
 * /api/bookings/my-bookings:
 *   get:
 *     tags:
 *       - Bookings
 *     summary: Get my bookings (Authenticated users)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: My bookings retrieved successfully
 */
router.get(
  '/my-bookings',
  auth(USER_ROLE.USER, USER_ROLE.MANAGER, USER_ROLE.CEO, USER_ROLE.ADMIN),
  BookingControllers.getMyBookings,
);

/**
 * @swagger
 * /api/bookings/{id}:
 *   get:
 *     tags:
 *       - Bookings
 *     summary: Get booking by ID (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Booking retrieved successfully
 *       404:
 *         description: Booking not found
 */
router.get(
  '/:id',
  auth(USER_ROLE.ADMIN),
  BookingControllers.getBookingById,
);

/**
 * @swagger
 * /api/bookings/{id}:
 *   patch:
 *     tags:
 *       - Bookings
 *     summary: Update booking (Own booking only, pending status only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *               timeSlot:
 *                 type: object
 *                 properties:
 *                   startTime:
 *                     type: string
 *                   endTime:
 *                     type: string
 *               purpose:
 *                 type: string
 *               attendees:
 *                 type: number
 *     responses:
 *       200:
 *         description: Booking updated successfully
 *       403:
 *         description: Can only update own bookings
 *       400:
 *         description: Can only update pending bookings
 */
router.patch(
  '/:id',
  auth(USER_ROLE.USER, USER_ROLE.MANAGER, USER_ROLE.CEO, USER_ROLE.ADMIN),
  validateRequest(BookingValidation.updateBookingValidationSchema),
  BookingControllers.updateBooking,
);

/**
 * @swagger
 * /api/bookings/{id}/approve-reject:
 *   patch:
 *     tags:
 *       - Bookings
 *     summary: Approve or reject booking (Manager, CEO, Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [approved, rejected]
 *               rejectionReason:
 *                 type: string
 *                 description: Required if status is rejected
 *     responses:
 *       200:
 *         description: Booking approved/rejected successfully
 *       400:
 *         description: Can only approve/reject pending bookings
 */
router.patch(
  '/:id/approve-reject',
  auth(USER_ROLE.MANAGER, USER_ROLE.CEO, USER_ROLE.ADMIN),
  validateRequest(BookingValidation.approveRejectBookingValidationSchema),
  BookingControllers.approveOrRejectBooking,
);

/**
 * @swagger
 * /api/bookings/{id}/cancel:
 *   patch:
 *     tags:
 *       - Bookings
 *     summary: Cancel booking (Own booking only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Booking cancelled successfully
 *       403:
 *         description: Can only cancel own bookings
 *       400:
 *         description: Cannot cancel completed or already cancelled bookings
 */
router.patch(
  '/:id/cancel',
  auth(USER_ROLE.USER, USER_ROLE.MANAGER, USER_ROLE.CEO, USER_ROLE.ADMIN),
  BookingControllers.cancelBooking,
);

/**
 * @swagger
 * /api/bookings/{id}:
 *   delete:
 *     tags:
 *       - Bookings
 *     summary: Delete booking (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Booking deleted successfully
 *       404:
 *         description: Booking not found
 */
router.delete(
  '/:id',
  auth(USER_ROLE.ADMIN),
  BookingControllers.deleteBooking,
);

export const BookingRoutes = router;
