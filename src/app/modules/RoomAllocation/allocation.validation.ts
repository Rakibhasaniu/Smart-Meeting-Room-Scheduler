import { z } from 'zod';

const findOptimalMeetingValidationSchema = z.object({
  body: z.object({
    attendees: z
      .array(z.string())
      .min(1, 'At least one attendee is required')
      .max(100, 'Maximum 100 attendees allowed'),
    duration: z
      .number({ required_error: 'Duration is required' })
      .min(15, 'Minimum meeting duration is 15 minutes')
      .max(480, 'Maximum meeting duration is 8 hours'),
    requiredEquipment: z.array(z.string()).default([]),
    preferredStartTime: z
      .string({ required_error: 'Preferred start time is required' })
      .refine(
        (val) => {
          const date = new Date(val);
          return !isNaN(date.getTime());
        },
        { message: 'Invalid date format' },
      ),
    flexibility: z
      .number()
      .min(0, 'Flexibility cannot be negative')
      .max(240, 'Maximum flexibility is 4 hours')
      .default(60),
    priority: z
      .enum(['low', 'normal', 'high', 'urgent'])
      .default('normal'),
    preferredLocation: z.string().optional(),
  }),
});

export const AllocationValidation = {
  findOptimalMeetingValidationSchema,
};
