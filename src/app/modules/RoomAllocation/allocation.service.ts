/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { Room } from '../Room/room.model';
import { Booking } from '../Booking/booking.model';
import { User } from '../User/user.model';
import {
  TMeetingRequest,
  TOptimalMeetingResult,
  TRoomRecommendation,
  TAllocationScore,
} from './allocation.interface';
import { Types } from 'mongoose';

const BUFFER_TIME = 15; 
const WEIGHTS = {
  capacity: 0.30, // 30% - room size 
  equipment: 0.25, // 25% - equipment 
  cost: 0.20, // 20% - cost optimization
  location: 0.15, // 15% - location preference
  time: 0.10, // 10% - time preference
};

//based on this score we can determine best room for us

const PRIORITY_SCORES = {
  ceo: 100,
  urgent: 80,
  high: 60,
  normal: 40,
  low: 20,
};

//calculate the score so that determined room easily
const calculateRoomScore = (
  room: any,
  request: TMeetingRequest,
  suggestedTime: Date,
  maxPrice: number,
): TAllocationScore => {
  const attendeeCount = request.attendees.length;

  // 1. Capacity Score (prefer right-sized rooms, penalize oversized)
  let capacityScore = 0;
  if (attendeeCount > room.capacity) {
    capacityScore = 0; // Room too small - invalid
  } else {
    const utilizationRatio = attendeeCount / room.capacity;
    if (utilizationRatio >= 0.7) {
      capacityScore = 100; // 70-100% utilization is perfect
    } else if (utilizationRatio >= 0.5) {
      capacityScore = 80; // 50-70% is good
    } else if (utilizationRatio >= 0.3) {
      capacityScore = 60; // 30-50% is acceptable
    } else {
      capacityScore = 40; // Under 30% is wasteful but still valid
    }
  }

  // 2. Equipment Score (percentage of required equipment available)
  let equipmentScore = 100;
  if (request.requiredEquipment.length > 0) {
    const matchedEquipment = request.requiredEquipment.filter((eq) =>
      room.equipment.includes(eq),
    );
    equipmentScore = (matchedEquipment.length / request.requiredEquipment.length) * 100;
  }

  // 3. Cost Score (cheaper is better)
  const costScore = maxPrice > 0 ? ((maxPrice - room.pricePerHour) / maxPrice) * 100 : 50;

  // 4. Location Score (match preferred location)
  let locationScore = 50; // default neutral score
  if (request.preferredLocation) {
    if (room.location.toLowerCase().includes(request.preferredLocation.toLowerCase())) {
      locationScore = 100;
    }
  }

  // 5. Time Score (how close to preferred time)
  const timeDiff = Math.abs(suggestedTime.getTime() - request.preferredStartTime.getTime());
  const timeDiffMinutes = timeDiff / (1000 * 60);
  let timeScore = 100;
  if (timeDiffMinutes > 0) {
    timeScore = Math.max(0, 100 - (timeDiffMinutes / request.flexibility) * 100);
  }

  // Calculate weighted total score
  const totalScore =
    capacityScore * WEIGHTS.capacity +
    equipmentScore * WEIGHTS.equipment +
    costScore * WEIGHTS.cost +
    locationScore * WEIGHTS.location +
    timeScore * WEIGHTS.time;

  return {
    capacityScore,
    equipmentScore,
    costScore,
    locationScore,
    timeScore,
    totalScore,
  };
};


const isTimeSlotAvailable = async (
  roomId: Types.ObjectId,
  startTime: Date,
  endTime: Date,
  bufferMinutes: number = BUFFER_TIME,
): Promise<boolean> => {
  const startWithBuffer = new Date(startTime.getTime() - bufferMinutes * 60 * 1000);
  const endWithBuffer = new Date(endTime.getTime() + bufferMinutes * 60 * 1000);

  const slotDate = new Date(startTime);
  slotDate.setHours(0, 0, 0, 0);
  const nextDay = new Date(slotDate);
  nextDay.setDate(nextDay.getDate() + 1);

  const conflictingBookings = await Booking.find({
    room: roomId,
    date: { $gte: slotDate, $lt: nextDay },
    status: { $in: ['pending', 'approved'] },
    isDeleted: false,
  });

  for (const booking of conflictingBookings) {
    const bookingStart = new Date(booking.date);
    const [startHour, startMinute] = booking.timeSlot.startTime.split(':').map(Number);
    bookingStart.setHours(startHour, startMinute, 0, 0);

    const bookingEnd = new Date(booking.date);
    const [endHour, endMinute] = booking.timeSlot.endTime.split(':').map(Number);
    bookingEnd.setHours(endHour, endMinute, 0, 0);

  
    const hasOverlap = startWithBuffer < bookingEnd && bookingStart < endWithBuffer;

    if (hasOverlap) {
      return false;
    }
  }

  return true;
};


const generateTimeAlternatives = (
  preferredTime: Date,
  flexibilityMinutes: number,
  intervalMinutes: number = 30,
): Date[] => {
  const alternatives: Date[] = [preferredTime];

  // Generate earlier times
  for (let offset = intervalMinutes; offset <= flexibilityMinutes; offset += intervalMinutes) {
    const earlierTime = new Date(preferredTime.getTime() - offset * 60 * 1000);
    alternatives.push(earlierTime);
  }

  // Generate later times
  for (let offset = intervalMinutes; offset <= flexibilityMinutes; offset += intervalMinutes) {
    const laterTime = new Date(preferredTime.getTime() + offset * 60 * 1000);
    alternatives.push(laterTime);
  }

  return alternatives;
};


const findOptimalMeeting = async (
  request: TMeetingRequest,
): Promise<TOptimalMeetingResult> => {
  // Validate organizer exists
  const organizer = await User.findById(request.organizer);
  if (!organizer) {
    throw new AppError(httpStatus.NOT_FOUND, 'Organizer not found!');
  }

  // If organizer is CEO, upgrade priority automatically
  if (organizer.role === 'CEO' && request.priority !== 'ceo') {
    request.priority = 'ceo';
  }

  // Get all available rooms
  const allRooms = await Room.find({
    isAvailable: true,
    isDeleted: false,
    capacity: { $gte: request.attendees.length }, 
  });

  if (allRooms.length === 0) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'No rooms available that can accommodate your meeting!',
    );
  }

  // Filter rooms by required equipment
  const suitableRooms = allRooms.filter((room) => {
    if (request.requiredEquipment.length === 0) return true;
    return request.requiredEquipment.every((eq) => room.equipment.includes(eq));
  });

  if (suitableRooms.length === 0) {
    return {
      recommendedRoom: null,
      alternativeOptions: [],
      conflicts: { hasConflict: true },
      suggestions: [
        'No rooms have all required equipment',
        `Required equipment: ${request.requiredEquipment.join(', ')}`,
        'Consider reducing equipment requirements or booking multiple rooms',
      ],
    };
  }

  // Calculate max price for cost optimization
  const maxPrice = Math.max(...suitableRooms.map((r) => r.pricePerHour));

  // Generate time alternatives
  const timeAlternatives = generateTimeAlternatives(
    request.preferredStartTime,
    request.flexibility,
  );

  const recommendations: TRoomRecommendation[] = [];

  // Try each room with each time slot
  for (const room of suitableRooms) {
    for (const startTime of timeAlternatives) {
      const endTime = new Date(startTime.getTime() + request.duration * 60 * 1000);

      // Check availability with buffer
      const isAvailable = await isTimeSlotAvailable(room._id, startTime, endTime);

      if (isAvailable) {
        const score = calculateRoomScore(room, request, startTime, maxPrice);

        // Only include valid matches (has all required equipment)
        if (score.equipmentScore === 100 || request.requiredEquipment.length === 0) {
          const costOptimization = (maxPrice - room.pricePerHour) * (request.duration / 60);

          const reasons: string[] = [];
          if (score.capacityScore >= 80) reasons.push('Optimal room size for your group');
          if (score.equipmentScore === 100) reasons.push('Has all required equipment');
          if (score.costScore >= 70) reasons.push('Cost-effective choice');
          if (score.locationScore >= 80) reasons.push('Matches preferred location');
          if (score.timeScore === 100) reasons.push('Available at your preferred time');

          recommendations.push({
            room: room._id,
            roomDetails: {
              name: room.name,
              roomNumber: room.roomNumber,
              capacity: room.capacity,
              equipment: room.equipment,
              pricePerHour: room.pricePerHour,
              location: room.location,
            },
            suggestedTime: startTime,
            endTime,
            score: score.totalScore,
            reasons,
            costOptimization,
          });
        }
      }
    }
  }

  // Sort by score (highest first)
  recommendations.sort((a, b) => b.score - a.score);

  // Separate recommended (best) from alternatives
  const recommendedRoom = recommendations.length > 0 ? recommendations[0] : null;
  const alternativeOptions = recommendations.slice(1, 6); // Top 5 alternatives

  const suggestions: string[] = [];
  if (!recommendedRoom) {
    suggestions.push('All suitable rooms are booked during your requested time window');
    suggestions.push(`Try extending flexibility beyond ${request.flexibility} minutes`);
    suggestions.push('Consider splitting into smaller meetings');
  } else {
    if (recommendedRoom.costOptimization > 0) {
      suggestions.push(`You'll save $${recommendedRoom.costOptimization.toFixed(2)} with this room`);
    }
    if (alternativeOptions.length > 0) {
      suggestions.push(`${alternativeOptions.length} alternative options available`);
    }
  }

  return {
    recommendedRoom,
    alternativeOptions,
    conflicts: {
      hasConflict: !recommendedRoom,
    },
    suggestions,
  };
};


const canOverrideBooking = async (
  existingBookingId: Types.ObjectId,
  newPriority: string,
): Promise<boolean> => {
  const existingBooking = await Booking.findById(existingBookingId).populate('user');

  if (!existingBooking) return false;

  const existingUser = existingBooking.user as any;
  let existingPriority = 'normal';

  // Determine existing booking priority
  if (existingUser.role === 'CEO') {
    existingPriority = 'ceo';
  }

  const newScore = PRIORITY_SCORES[newPriority as keyof typeof PRIORITY_SCORES] || 40;
  const existingScore = PRIORITY_SCORES[existingPriority as keyof typeof PRIORITY_SCORES] || 40;

  return newScore > existingScore;
};

export const AllocationServices = {
  findOptimalMeeting,
  isTimeSlotAvailable,
  canOverrideBooking,
  calculateRoomScore,
};
