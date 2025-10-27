/* eslint-disable @typescript-eslint/no-explicit-any */
import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { USER_ROLE } from './user.constant';
import { UserControllers } from './user.controller';
import { UserValidation } from './user.validation';

const router = express.Router();

// router.post(
//   '/create-student',
//   auth(USER_ROLE.ADMIN),
//   upload.single('file'),
//   (req: Request, res: Response, next: NextFunction) => {
//     req.body = JSON.parse(req.body.data);
//     next();
//   },
//   validateRequest(createStudentValidationSchema),
//   UserControllers.createStudent,
// );

// router.post(
//   '/create-faculty',
//   auth(USER_ROLE.ADMIN),
//   upload.single('file'),
//   (req: Request, res: Response, next: NextFunction) => {
//     req.body = JSON.parse(req.body.data);
//     next();
//   },
//   validateRequest(createFacultyValidationSchema),
//   UserControllers.createFaculty,
// );

// router.post(
//   '/create-admin',
//   auth(USER_ROLE.ADMIN),
//   upload.single('file'),
//   (req: Request, res: Response, next: NextFunction) => {
//     req.body = JSON.parse(req.body.data);
//     next();
//   },
//   validateRequest(createAdminValidationSchema),
//   UserControllers.createAdmin,
// );

router.post(
  '/change-status/:id',
  auth(USER_ROLE.ADMIN),
  validateRequest(UserValidation.changeStatusValidationSchema),
  UserControllers.changeStatus,
);

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

export const UserRoutes = router;
