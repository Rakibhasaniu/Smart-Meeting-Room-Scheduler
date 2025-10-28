import { z } from 'zod';

const timeFormat = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

const timeSlotSchema = z.object({
  startTime: z.string().regex(timeFormat, 'Start time must be in HH:mm format'),
  endTime: z.string().regex(timeFormat, 'End time must be in HH:mm format'),
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
);

const createBookingValidationSchema = z.object({
  body: z.object({
    room: z.string({
      required_error: 'Room ID is required',
    }).regex(/^[0-9a-fA-F]{24}$/, 'Invalid room ID format'),
    date: z.string({
      required_error: 'Date is required',
    }).refine(
      (date) => {
        const bookingDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return bookingDate >= today;
      },
      {
        message: 'Booking date cannot be in the past',
      },
    ),
    timeSlot: timeSlotSchema,
    purpose: z.string({
      required_error: 'Purpose is required',
    }).min(5, 'Purpose must be at least 5 characters'),
    attendees: z.number({
      required_error: 'Number of attendees is required',
    }).int('Attendees must be an integer').min(1, 'At least 1 attendee is required'),
  }),
});

const updateBookingValidationSchema = z.object({
  body: z.object({
    date: z.string().refine(
      (date) => {
        const bookingDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return bookingDate >= today;
      },
      {
        message: 'Booking date cannot be in the past',
      },
    ).optional(),
    timeSlot: timeSlotSchema.optional(),
    purpose: z.string().min(5, 'Purpose must be at least 5 characters').optional(),
    attendees: z.number().int('Attendees must be an integer').min(1, 'At least 1 attendee is required').optional(),
  }),
});

const approveRejectBookingValidationSchema = z.object({
  body: z.object({
    status: z.enum(['approved', 'rejected'], {
      required_error: 'Status is required',
    }),
    rejectionReason: z.string().optional(),
  }).refine(
    (data) => {
      if (data.status === 'rejected' && !data.rejectionReason) {
        return false;
      }
      return true;
    },
    {
      message: 'Rejection reason is required when rejecting a booking',
      path: ['rejectionReason'],
    },
  ),
});

export const BookingValidation = {
  createBookingValidationSchema,
  updateBookingValidationSchema,
  approveRejectBookingValidationSchema,
};
