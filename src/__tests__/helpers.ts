/**
 * Test Helper Functions
 */

import { User } from '../app/modules/User/user.model';
import { Room } from '../app/modules/Room/room.model';
import config from '../app/config';

/**
 * Create a test user and return user data with password
 */
export const createTestUser = async (userData: {
  email: string;
  password: string;
  name: string;
  role?: string;
  department?: string;
}) => {
  // Don't manually hash - let the User model's pre-save hook handle it
  const user = await User.create({
    email: userData.email,
    password: userData.password, // Pass plain password
    name: userData.name,
    role: userData.role || 'USER',
    department: userData.department || 'Engineering',
    status: 'active',
    isDeleted: false,
    needsPasswordChange: false,
  });

  return {
    user,
    password: userData.password, // Return plain password for login tests
  };
};

/**
 * Create a test admin user
 */
export const createAdminUser = async () => {
  return createTestUser({
    email: 'admin@test.com',
    password: 'admin123',
    name: 'Admin User',
    role: 'ADMIN',
    department: 'Administration',
  });
};

/**
 * Create a test CEO user
 */
export const createCEOUser = async () => {
  return createTestUser({
    email: 'ceo@test.com',
    password: 'ceo123',
    name: 'CEO User',
    role: 'CEO',
    department: 'Executive',
  });
};

/**
 * Create a test room
 */
export const createTestRoom = async (roomData?: Partial<any>) => {
  const defaultRoom = {
    name: 'Test Conference Room',
    roomNumber: 'TCR-001',
    capacity: 10,
    pricePerHour: 50,
    equipment: ['projector', 'whiteboard'],
    location: 'Building A - Floor 1',
    amenities: ['WiFi', 'Coffee Machine'],
    description: 'Test room for integration tests',
    isAvailable: true,
    isDeleted: false,
  };

  return await Room.create({ ...defaultRoom, ...roomData });
};

/**
 * Generate JWT token for testing
 */
export const generateToken = (payload: any): string => {
  const jwt = require('jsonwebtoken');
  return jwt.sign(payload, config.jwt_access_secret, {
    expiresIn: config.jwt_access_expires_in,
  });
};

/**
 * Create auth header with JWT token
 */
export const getAuthHeader = (userId: string, email: string, role: string) => {
  const token = generateToken({ userId, email, role });
  return `Bearer ${token}`;
};
