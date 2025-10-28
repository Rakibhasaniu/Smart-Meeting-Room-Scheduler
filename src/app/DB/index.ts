import config from '../config';
import { USER_ROLE } from '../modules/User/user.constant';
import { User } from '../modules/User/user.model';

const superUser = {
  email: 'rakib@gmail.com',
  password: config.super_admin_password,
  name: 'Rakib Hasan',
  needsPasswordChange: false,
  role: USER_ROLE.ADMIN,
  status: 'active',
  isDeleted: false,
};

const seedSuperAdmin = async () => {
  try {
    //when database is connected, we will check is there any user who is admin
    const isSuperAdminExits = await User.findOne({ role: USER_ROLE.ADMIN });

    if (!isSuperAdminExits) {
      await User.create(superUser);
      console.log('✅ Admin user created:', superUser.email);
    } else {
      console.log('ℹ️  Admin user already exists:', isSuperAdminExits.email);
    }
  } catch (error) {
    console.log('❌ Error seeding admin:', error);
  }
};

export default seedSuperAdmin;
