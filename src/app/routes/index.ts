import { Router } from 'express';
import { AuthRoutes } from '../modules/Auth/auth.route';
import { RoomRoutes } from '../modules/Room/room.route';
import { UserRoutes } from '../modules/User/user.route';

const router = Router();

const moduleRoutes = [
  {
    path: '/users',
    route: UserRoutes,
  },
  {
    path: '/auth',
    route: AuthRoutes,
  },
  {
    path: '/rooms',
    route: RoomRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
