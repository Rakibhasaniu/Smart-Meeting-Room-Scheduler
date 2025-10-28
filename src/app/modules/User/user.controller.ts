import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { UserServices } from './user.service';



// const createAdmin = catchAsync(async (req, res) => {
//   const { password, admin: adminData } = req.body;

//   const result = await UserServices.createAdminIntoDB(
//     req.file,
//     password,
//     adminData,
//   );

//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: 'Admin is created successfully',
//     data: result,
//   });
// });

const getAllUsers = catchAsync(async (req, res) => {
  const result = await UserServices.getAllUsers();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Users are retrieved successfully',
    data: result,
  });
});

const getUserById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await UserServices.getUserById(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User is retrieved successfully',
    data: result,
  });
});

const getMe = catchAsync(async (req, res) => {
  const { email } = req.user;
  const result = await UserServices.getMe(email);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User is retrieved successfully',
    data: result,
  });
});

const updateUserRole = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  const result = await UserServices.updateUserRole(id, role);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User role is updated successfully',
    data: result,
  });
});

const changeStatus = catchAsync(async (req, res) => {
  const id = req.params.id;

  const result = await UserServices.changeStatus(id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Status is updated successfully',
    data: result,
  });
});

const deleteUser = catchAsync(async (req, res) => {
  const { id } = req.params;

  const result = await UserServices.deleteUser(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User is deleted successfully',
    data: result,
  });
});

export const UserControllers = {
  // createAdmin,
  getAllUsers,
  getUserById,
  getMe,
  updateUserRole,
  changeStatus,
  deleteUser,
};
