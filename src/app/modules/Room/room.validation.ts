import { z } from 'zod';

const createRoomValidationSchema = z.object({
  body: z.object({
    name: z.string({
      required_error: 'Room name is required',
    }).min(1, 'Room name cannot be empty'),
    roomNumber: z.string({
      required_error: 'Room number is required',
    }).min(1, 'Room number cannot be empty'),
    capacity: z.number({
      required_error: 'Capacity is required',
    }).int('Capacity must be an integer').min(1, 'Capacity must be at least 1'),
    pricePerHour: z.number({
      required_error: 'Price per hour is required',
    }).min(0, 'Price cannot be negative'),
    equipment: z.array(z.string()).default([]),
    location: z.string({
      required_error: 'Location is required',
    }).min(1, 'Location cannot be empty'),
    amenities: z.array(z.string()).optional().default([]),
    description: z.string().optional(),
    imageUrl: z.string().url('Must be a valid URL').optional(),
  }),
});

const updateRoomValidationSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Room name cannot be empty').optional(),
    roomNumber: z.string().min(1, 'Room number cannot be empty').optional(),
    capacity: z.number().int('Capacity must be an integer').min(1, 'Capacity must be at least 1').optional(),
    pricePerHour: z.number().min(0, 'Price cannot be negative').optional(),
    equipment: z.array(z.string()).optional(),
    location: z.string().min(1, 'Location cannot be empty').optional(),
    amenities: z.array(z.string()).optional(),
    description: z.string().optional(),
    imageUrl: z.string().url('Must be a valid URL').optional(),
    isAvailable: z.boolean().optional(),
  }),
});

export const RoomValidation = {
  createRoomValidationSchema,
  updateRoomValidationSchema,
};
