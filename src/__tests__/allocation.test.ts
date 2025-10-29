/**
 * Integration Tests for Intelligent Room Allocation
 */

import request from 'supertest';
import app from '../app';
import { createTestUser, getAuthHeader, createTestRoom } from './helpers';

describe('Intelligent Room Allocation Integration Tests', () => {
  let userToken: string;
  let userId: string;

  beforeEach(async () => {
    // Create user before each test to ensure they exist after DB cleanup
    const { user } = await createTestUser({
      email: 'alloctest@test.com',
      password: 'password123',
      name: 'Allocation Test User',
    });
    userId = user._id.toString();
    userToken = getAuthHeader(userId, user.email, user.role);

    // Create test rooms with different capacities and equipment
    await createTestRoom({
      name: 'Small Huddle Room',
      roomNumber: 'SHR-101',
      capacity: 4,
      pricePerHour: 30,
      equipment: ['whiteboard'],
      location: 'Building A - Floor 1',
    });

    await createTestRoom({
      name: 'Medium Meeting Room',
      roomNumber: 'MMR-201',
      capacity: 10,
      pricePerHour: 60,
      equipment: ['projector', 'whiteboard'],
      location: 'Building A - Floor 2',
    });

    await createTestRoom({
      name: 'Large Conference Room',
      roomNumber: 'LCR-301',
      capacity: 20,
      pricePerHour: 100,
      equipment: ['projector', 'whiteboard', 'video-conf', 'tv'],
      location: 'Building B - Floor 3',
    });
  });

  describe('POST /api/room-allocation/find-optimal', () => {
    it('should find optimal room for small team', async () => {
      const response = await request(app)
        .post('/api/room-allocation/find-optimal')
        .set('Authorization', userToken)
        .send({
          attendees: ['user1@test.com', 'user2@test.com', 'user3@test.com'],
          duration: 60,
          requiredEquipment: ['whiteboard'],
          preferredStartTime: '2025-11-05T10:00:00.000Z',
          flexibility: 30,
          priority: 'normal',
          preferredLocation: 'Building A',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.recommendedRoom).toBeDefined();
      expect(response.body.data.recommendedRoom.roomDetails.name).toBe('Small Huddle Room');
      expect(response.body.data.recommendedRoom.score).toBeGreaterThan(0);
    });

    it('should find optimal room for medium team with projector', async () => {
      const response = await request(app)
        .post('/api/room-allocation/find-optimal')
        .set('Authorization', userToken)
        .send({
          attendees: Array(8).fill('user@test.com'),
          duration: 120,
          requiredEquipment: ['projector', 'whiteboard'],
          preferredStartTime: '2025-11-05T14:00:00.000Z',
          flexibility: 60,
          priority: 'high',
          preferredLocation: 'Building A',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.recommendedRoom.roomDetails.name).toBe('Medium Meeting Room');
      expect(response.body.data.recommendedRoom.roomDetails.equipment).toContain('projector');
    });

    it('should recommend large room for 15 attendees', async () => {
      const response = await request(app)
        .post('/api/room-allocation/find-optimal')
        .set('Authorization', userToken)
        .send({
          attendees: Array(15).fill('user@test.com'),
          duration: 90,
          requiredEquipment: ['projector', 'video-conf'],
          preferredStartTime: '2025-11-05T09:00:00.000Z',
          flexibility: 30,
          priority: 'urgent',
        });

      expect(response.status).toBe(200);
      expect(response.body.data.recommendedRoom.roomDetails.name).toBe('Large Conference Room');
      expect(response.body.data.recommendedRoom.roomDetails.capacity).toBe(20);
    });

    it('should provide alternative time options', async () => {
      const response = await request(app)
        .post('/api/room-allocation/find-optimal')
        .set('Authorization', userToken)
        .send({
          attendees: ['user1@test.com', 'user2@test.com'],
          duration: 60,
          requiredEquipment: ['whiteboard'],
          preferredStartTime: '2025-11-05T10:00:00.000Z',
          flexibility: 60,
          priority: 'normal',
        });

      expect(response.status).toBe(200);
      expect(response.body.data.alternativeOptions).toBeDefined();
      expect(response.body.data.alternativeOptions.length).toBeGreaterThan(0);
    });

    it('should show cost optimization when available', async () => {
      const response = await request(app)
        .post('/api/room-allocation/find-optimal')
        .set('Authorization', userToken)
        .send({
          attendees: Array(8).fill('user@test.com'),
          duration: 60,
          requiredEquipment: ['projector'],
          preferredStartTime: '2025-11-05T11:00:00.000Z',
          flexibility: 30,
          priority: 'normal',
        });

      expect(response.status).toBe(200);
      expect(response.body.data.recommendedRoom.costOptimization).toBeDefined();
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .post('/api/room-allocation/find-optimal')
        .send({
          attendees: ['user@test.com'],
          duration: 60,
          preferredStartTime: '2025-11-05T10:00:00.000Z',
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should fail validation with missing required fields', async () => {
      const response = await request(app)
        .post('/api/room-allocation/find-optimal')
        .set('Authorization', userToken)
        .send({
          attendees: ['user@test.com'],
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should fail validation with too many attendees', async () => {
      const response = await request(app)
        .post('/api/room-allocation/find-optimal')
        .set('Authorization', userToken)
        .send({
          attendees: Array(101).fill('user@test.com'),
          duration: 60,
          preferredStartTime: '2025-11-05T10:00:00.000Z',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should fail validation with invalid duration', async () => {
      const response = await request(app)
        .post('/api/room-allocation/find-optimal')
        .set('Authorization', userToken)
        .send({
          attendees: ['user@test.com'],
          duration: 10, // Less than minimum 15 minutes
          preferredStartTime: '2025-11-05T10:00:00.000Z',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 404 when no suitable room available', async () => {
      const response = await request(app)
        .post('/api/room-allocation/find-optimal')
        .set('Authorization', userToken)
        .send({
          attendees: Array(50).fill('user@test.com'), // More than any room capacity
          duration: 60,
          requiredEquipment: [],
          preferredStartTime: '2025-11-05T10:00:00.000Z',
          flexibility: 30,
        });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('No rooms available');
    });
  });

  describe('Intelligent Scoring Algorithm', () => {
    it('should prioritize cost-effective rooms for small teams', async () => {
      const response = await request(app)
        .post('/api/room-allocation/find-optimal')
        .set('Authorization', userToken)
        .send({
          attendees: ['user1@test.com', 'user2@test.com'],
          duration: 60,
          requiredEquipment: [],
          preferredStartTime: '2025-11-05T10:00:00.000Z',
          flexibility: 30,
          priority: 'normal',
        });

      expect(response.status).toBe(200);
      // Should recommend Small Huddle Room ($30) over Medium ($60) or Large ($100)
      expect(response.body.data.recommendedRoom.roomDetails.name).toBe('Small Huddle Room');
      expect(response.body.data.recommendedRoom.costOptimization).toBeGreaterThan(0);
    });

    it('should match equipment requirements correctly', async () => {
      const response = await request(app)
        .post('/api/room-allocation/find-optimal')
        .set('Authorization', userToken)
        .send({
          attendees: Array(5).fill('user@test.com'),
          duration: 60,
          requiredEquipment: ['projector', 'video-conf'],
          preferredStartTime: '2025-11-05T10:00:00.000Z',
          flexibility: 30,
        });

      expect(response.status).toBe(200);
      // Only Large Conference Room has video-conf
      expect(response.body.data.recommendedRoom.roomDetails.equipment).toContain('video-conf');
      expect(response.body.data.recommendedRoom.roomDetails.equipment).toContain('projector');
    });

    it('should consider location preferences in scoring', async () => {
      const response = await request(app)
        .post('/api/room-allocation/find-optimal')
        .set('Authorization', userToken)
        .send({
          attendees: Array(5).fill('user@test.com'),
          duration: 60,
          requiredEquipment: ['whiteboard'],
          preferredStartTime: '2025-11-05T10:00:00.000Z',
          flexibility: 30,
          preferredLocation: 'Building A',
        });

      expect(response.status).toBe(200);
      expect(response.body.data.recommendedRoom.roomDetails.location).toContain('Building A');
      expect(response.body.data.recommendedRoom.reasons).toContain('Matches preferred location');
    });
  });
});
