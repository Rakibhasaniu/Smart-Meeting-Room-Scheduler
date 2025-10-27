import config from '../config';
import { USER_ROLE } from '../modules/User/user.constant';
import { User } from '../modules/User/user.model';

const superUser = {
  id: '0001',
  email: 'abedinforhan@gmail.com',
  password: config.super_admin_password,
  name: 'Super Admin',
  needsPasswordChange: false,
  role: USER_ROLE.ADMIN,
  status: 'active',
  isDeleted: false,
};

const seedSuperAdmin = async () => {
  //when database is connected, we will check is there any user who is admin
  const isSuperAdminExits = await User.findOne({ role: USER_ROLE.ADMIN });

  if (!isSuperAdminExits) {
    await User.create(superUser);
  }
};

export default seedSuperAdmin;
