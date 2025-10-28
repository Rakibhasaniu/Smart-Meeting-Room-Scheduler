/* eslint-disable no-unused-vars */
import { Model } from 'mongoose';
import { USER_ROLE } from './user.constant';

export interface TUser {
  email: string;
  password: string;
  name: string;
  role: 'USER' | 'MANAGER' | 'CEO' | 'ADMIN';
  department?: string;
  status: 'active' | 'inactive';
  isDeleted: boolean;
  needsPasswordChange: boolean;
  passwordChangedAt?: Date;
  lastLogin?: Date;
}

export interface UserModel extends Model<TUser> {
  isUserExistsByEmail(email: string): Promise<TUser>;
  isPasswordMatched(
    plainTextPassword: string,
    hashedPassword: string,
  ): Promise<boolean>;
  isJWTIssuedBeforePasswordChanged(
    passwordChangedTimestamp: Date,
    jwtIssuedTimestamp: number,
  ): boolean;
}

export type TUserRole = keyof typeof USER_ROLE;
