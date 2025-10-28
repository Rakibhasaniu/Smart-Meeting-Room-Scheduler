import { z } from 'zod';

const timeFormat = /^([01]\d|2[0-3]):([0-5]\d)$/;

const createSlotValidationSchema = z.object({
  body: z.object({
    room: z.string({ required_error: 'Room ID is required' }),
    date: z.string({ required_error: 'Date is required' }).refine(
      (val) => {
        const date = new Date(val);
        return !isNaN(date.getTime());
      },
      { message: 'Invalid date format' },
    ),
    startTime: z
      .string({ required_error: 'Start time is required' })
      .regex(timeFormat, 'Start time must be in HH:mm format'),
    endTime: z
      .string({ required_error: 'End time is required' })
      .regex(timeFormat, 'End time must be in HH:mm format'),
  }).refine(
    (data) => {
      const [startHour, startMinute] = data.startTime.split(':').map(Number);
      const [endHour, endMinute] = data.endTime.split(':').map(Number);

      const startMinutes = startHour * 60 + startMinute;
      const endMinutes = endHour * 60 + endMinute;

      return endMinutes > startMinutes;
    },
    {
      message: 'End time must be after start time',
    },
  ),
});

const updateSlotValidationSchema = z.object({
  body: z.object({
    date: z
      .string()
      .refine(
        (val) => {
          const date = new Date(val);
          return !isNaN(date.getTime());
        },
        { message: 'Invalid date format' },
      )
      .optional(),
    startTime: z.string().regex(timeFormat, 'Start time must be in HH:mm format').optional(),
    endTime: z.string().regex(timeFormat, 'End time must be in HH:mm format').optional(),
    isBooked: z.boolean().optional(),
  }),
});

export const SlotValidation = {
  createSlotValidationSchema,
  updateSlotValidationSchema,
};
