/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { User } from './user.model';

const getAllUsers = async () => {
  const result = await User.find({ isDeleted: false }).select('-password');
  return result;
};

const getUserById = async (id: string) => {
  const result = await User.findById(id).select('-password');

  if (!result || result.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found!');
  }

  return result;
};

const getMe = async (email: string) => {
  const result = await User.findOne({ email });

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found!');
  }

  return result;
};

const updateUserRole = async (id: string, role: string) => {
  const validRoles = ['USER', 'MANAGER', 'CEO', 'ADMIN'];

  if (!validRoles.includes(role)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid role!');
  }

  const user = await User.findById(id);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found!');
  }

  const result = await User.findByIdAndUpdate(
    id,
    { role },
    { new: true }
  ).select('-password');

  return result;
};

const changeStatus = async (id: string, payload: { status: string }) => {
  const validStatuses = ['active', 'inactive'];

  if (!validStatuses.includes(payload.status)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid status!');
  }

  const user = await User.findById(id);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found!');
  }

  const result = await User.findByIdAndUpdate(
    id,
    { status: payload.status },
    { new: true }
  ).select('-password');

  return result;
};

const deleteUser = async (id: string) => {
  const user = await User.findById(id);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found!');
  }

  if (user.role === 'ADMIN') {
    throw new AppError(httpStatus.FORBIDDEN, 'Cannot delete admin user!');
  }

  const result = await User.findByIdAndUpdate(
    id,
    { isDeleted: true, status: 'inactive' },
    { new: true }
  ).select('-password');

  return result;
};

export const UserServices = {
  getAllUsers,
  getUserById,
  getMe,
  updateUserRole,
  changeStatus,
  deleteUser,
};
