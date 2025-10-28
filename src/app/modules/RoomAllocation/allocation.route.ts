import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { USER_ROLE } from '../User/user.constant';
import { AllocationControllers } from './allocation.controller';
import { AllocationValidation } from './allocation.validation';

const router = express.Router();

/**
 * @swagger
 * /api/room-allocation/find-optimal:
 *   post:
 *     summary: Find optimal meeting room using intelligent algorithm
 *     description: |
 *       Uses AI-powered algorithm to find the best room based on:
 *       - Number of attendees (right-sizing)
 *       - Required equipment availability
 *       - Cost optimization
 *       - Location preferences
 *       - Time flexibility
 *       - Priority levels (CEO gets highest priority)
 *
 *       Includes 15-minute buffer between meetings and provides alternative options.
 *     tags: [Room Allocation]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - attendees
 *               - duration
 *               - preferredStartTime
 *             properties:
 *               attendees:
 *                 type: array
 *                 items:
 *                   type: string
 *                 minItems: 1
 *                 maxItems: 100
 *                 example: ["john@example.com", "jane@example.com", "bob@example.com"]
 *                 description: List of attendee emails or names
 *               duration:
 *                 type: number
 *                 minimum: 15
 *                 maximum: 480
 *                 example: 60
 *                 description: Meeting duration in minutes
 *               requiredEquipment:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["projector", "whiteboard", "video-conf"]
 *                 description: Required equipment for the meeting
 *               preferredStartTime:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-10-29T09:00:00.000Z"
 *                 description: Preferred meeting start time
 *               flexibility:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 240
 *                 default: 60
 *                 example: 60
 *                 description: Minutes willing to shift start time (for finding alternatives)
 *               priority:
 *                 type: string
 *                 enum: [low, normal, high, urgent]
 *                 default: normal
 *                 example: "high"
 *                 description: Meeting priority (CEO role automatically gets highest)
 *               preferredLocation:
 *                 type: string
 *                 example: "Building A"
 *                 description: Preferred building or floor location
 *     responses:
 *       200:
 *         description: Room recommendations generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 recommendedRoom:
 *                   type: object
 *                   description: Best room match with highest score
 *                 alternativeOptions:
 *                   type: array
 *                   description: Up to 5 alternative room options
 *                 conflicts:
 *                   type: object
 *                   properties:
 *                     hasConflict:
 *                       type: boolean
 *                 suggestions:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: Helpful suggestions for the user
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: No suitable rooms available
 */
router.post(
  '/find-optimal',
  auth(USER_ROLE.USER, USER_ROLE.MANAGER, USER_ROLE.CEO, USER_ROLE.ADMIN),
  validateRequest(AllocationValidation.findOptimalMeetingValidationSchema),
  AllocationControllers.findOptimalMeeting,
);

export const AllocationRoutes = router;
