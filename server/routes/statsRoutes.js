import express from 'express';
import Event from '../models/Event.js';
import Registration from '../models/Registration.js';

const router = express.Router();

// GET /api/stats - Dashboard and Home impact stats
router.get('/', async (req, res, next) => {
  try {
    const [
      totalEvents,
      totalRegistrations,
      approvedVolunteers,
      volunteersAttended,
      pendingRegistrations,
      absentVolunteers
    ] = await Promise.all([
      Event.countDocuments(),
      Registration.countDocuments(),
      Registration.countDocuments({ status: 'Approved' }),
      Registration.countDocuments({ attendanceStatus: 'Attended' }),
      Registration.countDocuments({ status: 'Pending' }),
      Registration.countDocuments({ attendanceStatus: 'Absent' })
    ]);

    // Categories aggregate
    const categories = await Event.distinct('category');

    res.status(200).json({
      success: true,
      data: {
        totalEvents,
        totalRegistrations,
        approvedVolunteers,
        volunteersAttended,
        pendingRegistrations,
        absentVolunteers,
        activeCategories: categories.length
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
