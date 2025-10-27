/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { User } from './user.model';


const getMe = async (userId: string, role: string) => {
  // For now, return the user directly
  // Later, we can populate related data based on role
  const result = await User.findOne({ id: userId });

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found!');
  }

  return result;
};

const changeStatus = async (id: string, payload: { status: string }) => {
  const result = await User.findByIdAndUpdate(id, payload, {
    new: true,
  });
  return result;
};

export const UserServices = {
  getMe,
  changeStatus,
};
