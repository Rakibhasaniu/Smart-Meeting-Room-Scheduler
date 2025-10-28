import { z } from 'zod';

const createRoomValidationSchema = z.object({
  body: z.object({
    name: z.string({
      required_error: 'Room name is required',
    }).min(1, 'Room name cannot be empty'),
    roomNumber: z.string({
      required_error: 'Room number is required',
    }).min(1, 'Room number cannot be empty'),
    floor: z.number({
      required_error: 'Floor number is required',
    }).int('Floor must be an integer').min(0, 'Floor cannot be negative'),
    capacity: z.number({
      required_error: 'Capacity is required',
    }).int('Capacity must be an integer').min(1, 'Capacity must be at least 1'),
    pricePerHour: z.number({
      required_error: 'Price per hour is required',
    }).min(0, 'Price cannot be negative'),
    amenities: z.array(z.string()).optional().default([]),
    description: z.string().optional(),
    imageUrl: z.string().url('Must be a valid URL').optional(),
  }),
});

const updateRoomValidationSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Room name cannot be empty').optional(),
    roomNumber: z.string().min(1, 'Room number cannot be empty').optional(),
    floor: z.number().int('Floor must be an integer').min(0, 'Floor cannot be negative').optional(),
    capacity: z.number().int('Capacity must be an integer').min(1, 'Capacity must be at least 1').optional(),
    pricePerHour: z.number().min(0, 'Price cannot be negative').optional(),
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
