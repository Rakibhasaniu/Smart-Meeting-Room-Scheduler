import { Router } from 'express';
import { AuthRoutes } from '../modules/Auth/auth.route';
import { RoomRoutes } from '../modules/Room/room.route';
import { UserRoutes } from '../modules/User/user.route';
import { BookingRoutes } from '../modules/Booking/booking.route';
import { SlotRoutes } from '../modules/Slot/slot.route';

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
  {
    path: '/slots',
    route: SlotRoutes,
  },
  {
    path: '/bookings',
    route: BookingRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
