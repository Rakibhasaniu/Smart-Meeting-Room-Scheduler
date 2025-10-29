/**
 * Integration Tests for Authentication Endpoints
 */

import request from 'supertest';
import app from '../app';
import { createTestUser, createAdminUser } from './helpers';

describe('Auth Integration Tests', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'newuser@test.com',
          password: 'password123',
          name: 'New Test User',
          department: 'Engineering',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.user.email).toBe('newuser@test.com');
      expect(response.body.data.user.role).toBe('USER');
    });

    it('should fail to register with duplicate email', async () => {
      await createTestUser({
        email: 'duplicate@test.com',
        password: 'password123',
        name: 'First User',
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'duplicate@test.com',
          password: 'password123',
          name: 'Second User',
        });

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
    });

    it('should fail validation with invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'invalid-email',
          password: 'password123',
          name: 'Test User',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should fail validation with short password', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'user@test.com',
          password: '123',
          name: 'Test User',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should fail validation with missing required fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'user@test.com',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully with correct credentials', async () => {
      const { user, password } = await createTestUser({
        email: 'logintest@test.com',
        password: 'password123',
        name: 'Login Test User',
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'logintest@test.com',
          password: 'password123',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.headers['set-cookie']).toBeDefined(); // Refresh token cookie
    });

    it('should fail login with incorrect password', async () => {
      await createTestUser({
        email: 'wrongpass@test.com',
        password: 'correctpassword',
        name: 'Test User',
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'wrongpass@test.com',
          password: 'wrongpassword',
        });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Password');
    });

    it('should fail login with non-existent email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@test.com',
          password: 'password123',
        });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should fail validation with missing fields', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'user@test.com',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/change-password', () => {
    it('should change password successfully', async () => {
      const { user, password } = await createTestUser({
        email: 'changepass@test.com',
        password: 'oldpassword123',
        name: 'Change Password User',
      });

      // Login to get token
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'changepass@test.com',
          password: 'oldpassword123',
        });

      const token = loginResponse.body.data.accessToken;

      // Change password
      const response = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          oldPassword: 'oldpassword123',
          newPassword: 'newpassword123',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify can login with new password
      const newLoginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'changepass@test.com',
          password: 'newpassword123',
        });

      expect(newLoginResponse.status).toBe(200);
    });

    it('should fail to change password with incorrect old password', async () => {
      const { user } = await createTestUser({
        email: 'wrongold@test.com',
        password: 'password123',
        name: 'Test User',
      });

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'wrongold@test.com',
          password: 'password123',
        });

      const token = loginResponse.body.data.accessToken;

      const response = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          oldPassword: 'wrongoldpassword',
          newPassword: 'newpassword123',
        });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    it('should fail without authentication token', async () => {
      const response = await request(app)
        .post('/api/auth/change-password')
        .send({
          oldPassword: 'old123',
          newPassword: 'new123',
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/forget-password', () => {
    it('should send reset link for existing user', async () => {
      const { user } = await createTestUser({
        email: 'forgetpass@test.com',
        password: 'password123',
        name: 'Forget Password User',
      });

      const response = await request(app)
        .post('/api/auth/forget-password')
        .send({
          email: 'forgetpass@test.com',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Reset link');
    });

    it('should fail for non-existent email', async () => {
      const response = await request(app)
        .post('/api/auth/forget-password')
        .send({
          email: 'nonexistent@test.com',
        });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });
});
