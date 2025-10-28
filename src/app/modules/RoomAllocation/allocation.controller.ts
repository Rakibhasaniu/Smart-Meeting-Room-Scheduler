import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { AllocationServices } from './allocation.service';

const findOptimalMeeting = catchAsync(async (req, res) => {
  const userId = req.user.userId;
  const { attendees, duration, requiredEquipment, preferredStartTime, flexibility, priority, preferredLocation } = req.body;

  const result = await AllocationServices.findOptimalMeeting({
    organizer: userId,
    attendees,
    duration,
    requiredEquipment: requiredEquipment || [],
    preferredStartTime: new Date(preferredStartTime),
    flexibility: flexibility || 60,
    priority: priority || 'normal',
    preferredLocation,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.recommendedRoom
      ? 'Optimal room found successfully'
      : 'No available rooms found for your requirements',
    data: result,
  });
});

export const AllocationControllers = {
  findOptimalMeeting,
};
