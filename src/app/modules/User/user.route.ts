/* eslint-disable @typescript-eslint/no-explicit-any */
import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { USER_ROLE } from './user.constant';
import { UserControllers } from './user.controller';
import { UserValidation } from './user.validation';

const router = express.Router();

// Get all users (Admin only)
router.get(
  '/',
  auth(USER_ROLE.ADMIN),
  UserControllers.getAllUsers,
);

// Get current user profile (All authenticated users)
router.get(
  '/me',
  auth(
    USER_ROLE.USER,
    USER_ROLE.MANAGER,
    USER_ROLE.CEO,
    USER_ROLE.ADMIN,
  ),
  UserControllers.getMe,
);

router.get(
  '/:id',
  auth(USER_ROLE.ADMIN),
  UserControllers.getUserById,
);

router.patch(
  '/update-role/:id',
  auth(USER_ROLE.ADMIN),
  validateRequest(UserValidation.updateRoleValidationSchema),
  UserControllers.updateUserRole,
);

router.patch(
  '/change-status/:id',
  auth(USER_ROLE.ADMIN),
  validateRequest(UserValidation.changeStatusValidationSchema),
  UserControllers.changeStatus,
);

router.delete(
  '/:id',
  auth(USER_ROLE.ADMIN),
  UserControllers.deleteUser,
);

export const UserRoutes = router;
