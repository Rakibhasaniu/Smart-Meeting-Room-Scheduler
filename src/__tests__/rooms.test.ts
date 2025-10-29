/**
 * Integration Tests for Room CRUD Endpoints
 */

import request from 'supertest';
import app from '../app';
import { createAdminUser, createTestUser, getAuthHeader, createTestRoom } from './helpers';

describe('Room Integration Tests', () => {
  let adminToken: string;
  let userToken: string;

  beforeEach(async () => {
    // Create users before each test to ensure they exist after DB cleanup
    const { user: adminUser } = await createAdminUser();
    adminToken = getAuthHeader(adminUser._id.toString(), adminUser.email, adminUser.role);

    const { user: normalUser } = await createTestUser({
      email: 'user@test.com',
      password: 'password123',
      name: 'Normal User',
    });
    userToken = getAuthHeader(normalUser._id.toString(), normalUser.email, normalUser.role);
  });

  describe('POST /api/rooms', () => {
    it('should create a room successfully as admin', async () => {
      const response = await request(app)
        .post('/api/rooms')
        .set('Authorization', adminToken)
        .send({
          name: 'Executive Board Room',
          roomNumber: 'EBR-001',
          capacity: 20,
          pricePerHour: 150,
          equipment: ['projector', 'whiteboard', 'video-conf'],
          location: 'Building A - Floor 3',
          amenities: ['WiFi', 'Coffee Machine', 'Air Conditioning'],
          description: 'Premium board room',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Executive Board Room');
      expect(response.body.data.capacity).toBe(20);
      expect(response.body.data.equipment).toContain('video-conf');
    });

    it('should fail to create room without admin role', async () => {
      const response = await request(app)
        .post('/api/rooms')
        .set('Authorization', userToken)
        .send({
          name: 'Test Room',
          roomNumber: 'TR-001',
          capacity: 10,
          pricePerHour: 50,
          location: 'Building A - Floor 1',
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should fail with duplicate room number', async () => {
      await createTestRoom({ roomNumber: 'DUPLICATE-001' });

      const response = await request(app)
        .post('/api/rooms')
        .set('Authorization', adminToken)
        .send({
          name: 'Another Room',
          roomNumber: 'DUPLICATE-001',
          capacity: 10,
          pricePerHour: 50,
          location: 'Building B - Floor 1',
        });

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
    });

    it('should fail validation with missing required fields', async () => {
      const response = await request(app)
        .post('/api/rooms')
        .set('Authorization', adminToken)
        .send({
          name: 'Incomplete Room',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should fail validation with invalid capacity', async () => {
      const response = await request(app)
        .post('/api/rooms')
        .set('Authorization', adminToken)
        .send({
          name: 'Invalid Room',
          roomNumber: 'IR-001',
          capacity: -5,
          pricePerHour: 50,
          location: 'Building A - Floor 1',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/rooms', () => {
    beforeEach(async () => {
      await createTestRoom({
        name: 'Small Meeting Room',
        roomNumber: 'SMR-001',
        capacity: 5,
        pricePerHour: 30,
        location: 'Building A - Floor 1',
        equipment: ['whiteboard'],
      });

      await createTestRoom({
        name: 'Large Conference Room',
        roomNumber: 'LCR-001',
        capacity: 20,
        pricePerHour: 100,
        location: 'Building B - Floor 2',
        equipment: ['projector', 'video-conf', 'whiteboard'],
      });
    });

    it('should get all rooms', async () => {
      const response = await request(app).get('/api/rooms');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeGreaterThanOrEqual(2);
    });

    it('should filter rooms by capacity', async () => {
      const response = await request(app).get('/api/rooms?capacity=10');

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data.every((room: any) => room.capacity >= 10)).toBe(true);
    });

    it('should filter rooms by location', async () => {
      const response = await request(app).get('/api/rooms?location=Building A');

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data.every((room: any) => room.location.includes('Building A'))).toBe(true);
    });

    it('should filter rooms by price', async () => {
      const response = await request(app).get('/api/rooms?pricePerHour=50');

      expect(response.status).toBe(200);
      expect(response.body.data.every((room: any) => room.pricePerHour <= 50)).toBe(true);
    });

    it('should search rooms by name', async () => {
      const response = await request(app).get('/api/rooms?search=Small');

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data.some((room: any) => room.name.includes('Small'))).toBe(true);
    });
  });

  describe('GET /api/rooms/:id', () => {
    it('should get a single room by ID', async () => {
      const room = await createTestRoom({
        name: 'Test Single Room',
        roomNumber: 'TSR-001',
      });

      const response = await request(app).get(`/api/rooms/${room._id}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Test Single Room');
    });

    it('should return 404 for non-existent room', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app).get(`/api/rooms/${fakeId}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 for invalid room ID format', async () => {
      const response = await request(app).get('/api/rooms/invalid-id');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PATCH /api/rooms/:id', () => {
    it('should update room successfully as admin', async () => {
      const room = await createTestRoom({
        name: 'Old Name',
        roomNumber: 'ON-001',
        capacity: 10,
      });

      const response = await request(app)
        .patch(`/api/rooms/${room._id}`)
        .set('Authorization', adminToken)
        .send({
          name: 'Updated Name',
          capacity: 15,
          pricePerHour: 75,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Updated Name');
      expect(response.body.data.capacity).toBe(15);
    });

    it('should fail to update room without admin role', async () => {
      const room = await createTestRoom();

      const response = await request(app)
        .patch(`/api/rooms/${room._id}`)
        .set('Authorization', userToken)
        .send({
          name: 'Unauthorized Update',
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should return 404 when updating non-existent room', async () => {
      const fakeId = '507f1f77bcf86cd799439011';

      const response = await request(app)
        .patch(`/api/rooms/${fakeId}`)
        .set('Authorization', adminToken)
        .send({
          name: 'Non-existent Room',
        });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/rooms/:id', () => {
    it('should soft delete room successfully as admin', async () => {
      const room = await createTestRoom({
        name: 'To Be Deleted',
        roomNumber: 'TBD-001',
      });

      const response = await request(app)
        .delete(`/api/rooms/${room._id}`)
        .set('Authorization', adminToken);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify room is soft deleted
      const getResponse = await request(app).get(`/api/rooms/${room._id}`);
      expect(getResponse.status).toBe(404);
    });

    it('should fail to delete room without admin role', async () => {
      const room = await createTestRoom();

      const response = await request(app)
        .delete(`/api/rooms/${room._id}`)
        .set('Authorization', userToken);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
});
