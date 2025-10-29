/* eslint-disable @typescript-eslint/no-explicit-any */
import cron from 'node-cron';
import { Booking } from '../modules/Booking/booking.model';


const AUTO_RELEASE_MINUTES = 10;

export const checkAndReleaseUnusedBookings = async () => {
  try {
    const now = new Date();

    const today = new Date(now);
    today.setHours(0, 0, 0, 0);


    const approvedBookings = await Booking.find({
      status: 'approved',
      isDeleted: false,
      date: { $lte: now }, 
    });

    let releasedCount = 0;

    for (const booking of approvedBookings) {
      const [startHour, startMinute] = booking.timeSlot.startTime.split(':').map(Number);


      const bookingStartTime = new Date(booking.date);
      bookingStartTime.setUTCHours(startHour, startMinute, 0, 0);

      const timeDiffMs = now.getTime() - bookingStartTime.getTime();
      const timeDiffMinutes = timeDiffMs / (1000 * 60);


      if (timeDiffMinutes > AUTO_RELEASE_MINUTES) {
        // Auto-release the booking
        booking.status = 'cancelled';
        await booking.save();

        releasedCount++;

        console.log(`[AUTO-RELEASE] Booking ${booking._id} released - Start time: ${booking.timeSlot.startTime}, User ID: ${booking.user}`);
      }
    }

    if (releasedCount > 0) {
      console.log(`[AUTO-RELEASE] ${releasedCount} booking(s) automatically released at ${now.toISOString()}`);
    }

    return releasedCount;
  } catch (error) {
    console.error('[AUTO-RELEASE ERROR]', error);
    return 0;
  }
};

export const startAutoReleaseCronJob = () => {
  cron.schedule('*/2 * * * *', async () => {
    console.log('[CRON] Running auto-release check...');
    await checkAndReleaseUnusedBookings();
  });

  console.log('[CRON] Auto-release job scheduled (runs every 2 minutes)');

  console.log('[CRON] Running initial auto-release check...');
  checkAndReleaseUnusedBookings();
};
