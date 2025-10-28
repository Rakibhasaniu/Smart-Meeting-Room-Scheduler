import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { USER_ROLE } from '../User/user.constant';
import { SlotControllers } from './slot.controller';
import { SlotValidation } from './slot.validation';

const router = express.Router();

/**
 * @swagger
 * /api/slots:
 *   post:
 *     summary: Create a new time slot
 *     description: Only admins can create time slots for rooms
 *     tags: [Slots]
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
 *               - startTime
 *               - endTime
 *             properties:
 *               room:
 *                 type: string
 *                 description: Room ID
 *               date:
 *                 type: string
 *                 format: date
 *                 example: "2025-11-01"
 *               startTime:
 *                 type: string
 *                 pattern: '^([01]\d|2[0-3]):([0-5]\d)$'
 *                 example: "09:00"
 *               endTime:
 *                 type: string
 *                 pattern: '^([01]\d|2[0-3]):([0-5]\d)$'
 *                 example: "11:00"
 *     responses:
 *       201:
 *         description: Slot created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       409:
 *         description: Slot already exists
 */
router.post(
  '/',
  auth(USER_ROLE.ADMIN),
  validateRequest(SlotValidation.createSlotValidationSchema),
  SlotControllers.createSlot,
);

/**
 * @swagger
 * /api/slots:
 *   get:
 *     summary: Get all time slots
 *     description: Retrieve all slots with optional filters
 *     tags: [Slots]
 *     parameters:
 *       - in: query
 *         name: room
 *         schema:
 *           type: string
 *         description: Filter by room ID
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by date
 *       - in: query
 *         name: isBooked
 *         schema:
 *           type: boolean
 *         description: Filter by booking status
 *     responses:
 *       200:
 *         description: Slots retrieved successfully
 */
router.get('/', SlotControllers.getAllSlots);

/**
 * @swagger
 * /api/slots/available:
 *   get:
 *     summary: Get available time slots for a room on a specific date
 *     description: Retrieve all unbooked slots for a room on a given date
 *     tags: [Slots]
 *     parameters:
 *       - in: query
 *         name: room
 *         required: true
 *         schema:
 *           type: string
 *         description: Room ID
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Date to check availability
 *     responses:
 *       200:
 *         description: Available slots retrieved successfully
 *       400:
 *         description: Room ID and date are required
 *       404:
 *         description: Room not found
 */
router.get('/available', SlotControllers.getAvailableSlots);

/**
 * @swagger
 * /api/slots/{id}:
 *   get:
 *     summary: Get a single slot by ID
 *     description: Retrieve detailed information about a specific slot
 *     tags: [Slots]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Slot ID
 *     responses:
 *       200:
 *         description: Slot retrieved successfully
 *       404:
 *         description: Slot not found
 */
router.get('/:id', SlotControllers.getSingleSlot);

/**
 * @swagger
 * /api/slots/{id}:
 *   patch:
 *     summary: Update a slot
 *     description: Only admins can update slots. Cannot update if slot is booked.
 *     tags: [Slots]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Slot ID
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
 *               startTime:
 *                 type: string
 *                 pattern: '^([01]\d|2[0-3]):([0-5]\d)$'
 *               endTime:
 *                 type: string
 *                 pattern: '^([01]\d|2[0-3]):([0-5]\d)$'
 *               isBooked:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Slot updated successfully
 *       400:
 *         description: Cannot update booked slot
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Slot not found
 */
router.patch(
  '/:id',
  auth(USER_ROLE.ADMIN),
  validateRequest(SlotValidation.updateSlotValidationSchema),
  SlotControllers.updateSlot,
);

/**
 * @swagger
 * /api/slots/{id}:
 *   delete:
 *     summary: Delete a slot
 *     description: Only admins can delete slots. Cannot delete if slot is booked.
 *     tags: [Slots]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Slot ID
 *     responses:
 *       200:
 *         description: Slot deleted successfully
 *       400:
 *         description: Cannot delete booked slot
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Slot not found
 */
router.delete('/:id', auth(USER_ROLE.ADMIN), SlotControllers.deleteSlot);

export const SlotRoutes = router;
