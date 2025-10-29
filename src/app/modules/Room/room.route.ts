import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { USER_ROLE } from '../User/user.constant';
import { RoomControllers } from './room.controller';
import { RoomValidation } from './room.validation';

const router = express.Router();

/**
 * @swagger
 * /api/rooms:
 *   post:
 *     tags:
 *       - Rooms
 *     summary: Create a new room (Admin only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - roomNumber
 *               - location
 *               - capacity
 *               - pricePerHour
 *             properties:
 *               name:
 *                 type: string
 *                 example: Conference Room A
 *               roomNumber:
 *                 type: string
 *                 example: CR-101
 *               location:
 *                 type: string
 *                 example: Building A - Floor 1
 *               capacity:
 *                 type: number
 *                 example: 10
 *               pricePerHour:
 *                 type: number
 *                 example: 50
 *               equipment:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["projector", "whiteboard", "video-conf"]
 *               amenities:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["WiFi", "Coffee Machine", "Air Conditioning"]
 *               description:
 *                 type: string
 *                 example: Large conference room with modern amenities
 *               imageUrl:
 *                 type: string
 *                 example: https://example.com/room.jpg
 *     responses:
 *       201:
 *         description: Room created successfully
 *       409:
 *         description: Room number already exists
 */
router.post(
  '/',
  auth(USER_ROLE.ADMIN),
  validateRequest(RoomValidation.createRoomValidationSchema),
  RoomControllers.createRoom,
);

/**
 * @swagger
 * /api/rooms:
 *   get:
 *     tags:
 *       - Rooms
 *     summary: Get all rooms with optional filters
 *     parameters:
 *       - in: query
 *         name: capacity
 *         schema:
 *           type: number
 *         description: Minimum capacity required
 *       - in: query
 *         name: pricePerHour
 *         schema:
 *           type: number
 *         description: Maximum price per hour
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Filter by location (e.g., "Building A" or "Floor 1")
 *       - in: query
 *         name: isAvailable
 *         schema:
 *           type: boolean
 *         description: Filter by availability
 *       - in: query
 *         name: amenities
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         description: Required amenities
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by room name or number
 *     responses:
 *       200:
 *         description: Rooms retrieved successfully
 */
router.get('/', RoomControllers.getAllRooms);

/**
 * @swagger
 * /api/rooms/{id}:
 *   get:
 *     tags:
 *       - Rooms
 *     summary: Get room by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Room ID
 *     responses:
 *       200:
 *         description: Room retrieved successfully
 *       404:
 *         description: Room not found
 */
router.get('/:id', RoomControllers.getRoomById);

/**
 * @swagger
 * /api/rooms/{id}:
 *   patch:
 *     tags:
 *       - Rooms
 *     summary: Update room (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Room ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               capacity:
 *                 type: number
 *               pricePerHour:
 *                 type: number
 *               amenities:
 *                 type: array
 *                 items:
 *                   type: string
 *               isAvailable:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Room updated successfully
 *       404:
 *         description: Room not found
 */
router.patch(
  '/:id',
  auth(USER_ROLE.ADMIN),
  validateRequest(RoomValidation.updateRoomValidationSchema),
  RoomControllers.updateRoom,
);

/**
 * @swagger
 * /api/rooms/{id}/toggle-availability:
 *   patch:
 *     tags:
 *       - Rooms
 *     summary: Toggle room availability (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Room ID
 *     responses:
 *       200:
 *         description: Room availability toggled successfully
 */
router.patch(
  '/:id/toggle-availability',
  auth(USER_ROLE.ADMIN),
  RoomControllers.toggleRoomAvailability,
);

/**
 * @swagger
 * /api/rooms/{id}:
 *   delete:
 *     tags:
 *       - Rooms
 *     summary: Delete room (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Room ID
 *     responses:
 *       200:
 *         description: Room deleted successfully
 *       404:
 *         description: Room not found
 */
router.delete('/:id', auth(USER_ROLE.ADMIN), RoomControllers.deleteRoom);

export const RoomRoutes = router;
