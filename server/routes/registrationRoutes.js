import express from 'express';
import Registration from '../models/Registration.js';
import Event from '../models/Event.js';

const router = express.Router();

// GET /api/registrations - List registrations with optional filters
router.get('/', async (req, res, next) => {
  try {
    const { email, eventId, status, attendanceStatus } = req.query;
    let query = {};

    if (email && email.trim() !== '') {
      // Case-insensitive exact match
      query.email = email.trim().toLowerCase();
    }

    if (eventId && eventId.trim() !== '') {
      query.eventId = eventId.trim();
    }

    if (status && status.trim() !== '' && status !== 'All') {
      query.status = status.trim();
    }

    if (attendanceStatus && attendanceStatus.trim() !== '' && attendanceStatus !== 'All') {
      query.attendanceStatus = attendanceStatus.trim();
    }

    const registrations = await Registration.find(query)
      .populate('eventId', 'title date venue category capacity image')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: registrations.length,
      data: registrations
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/registrations - Register student for an event
router.post('/', async (req, res, next) => {
  try {
    const { name, email, eventId } = req.body;

    // 1. Validate required fields
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Student name is required.'
      });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Student email is required.'
      });
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    const cleanEmail = email.trim().toLowerCase();
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address (e.g. student@college.edu).'
      });
    }

    if (!eventId) {
      return res.status(400).json({
        success: false,
        message: 'Please specify the event to register for.'
      });
    }

    // 2. Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'The selected event was not found.'
      });
    }

    // 3. Prevent duplicate registration
    const existingRegistration = await Registration.findOne({
      email: cleanEmail,
      eventId: event._id
    });

    if (existingRegistration) {
      return res.status(400).json({
        success: false,
        message: `You are already registered for "${event.title}" with email ${cleanEmail}. Current status: ${existingRegistration.status}.`
      });
    }

    // 4. Prevent registration when event is full
    const currentCount = await Registration.countDocuments({ eventId: event._id });
    if (currentCount >= event.capacity) {
      return res.status(400).json({
        success: false,
        message: `Registration closed. This event has reached its maximum capacity of ${event.capacity} volunteers.`
      });
    }

    // 5. Create new registration
    const registration = await Registration.create({
      name: name.trim(),
      email: cleanEmail,
      eventId: event._id,
      status: 'Pending',
      attendanceStatus: 'Not Marked'
    });

    const populated = await Registration.findById(registration._id).populate(
      'eventId',
      'title date venue category capacity image'
    );

    res.status(201).json({
      success: true,
      message: `Registration submitted successfully for "${event.title}"! Status is currently Pending review.`,
      data: populated
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/registrations/:id - Update status or attendanceStatus
router.patch('/:id', async (req, res, next) => {
  try {
    const { status, attendanceStatus } = req.body;

    const registration = await Registration.findById(req.params.id);
    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration record not found.'
      });
    }

    const validStatuses = ['Pending', 'Approved', 'Rejected'];
    const validAttendanceStatuses = ['Not Marked', 'Attended', 'Absent'];

    if (status) {
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Invalid registration status. Allowed: ${validStatuses.join(', ')}`
        });
      }
      registration.status = status;
    }

    if (attendanceStatus) {
      if (!validAttendanceStatuses.includes(attendanceStatus)) {
        return res.status(400).json({
          success: false,
          message: `Invalid attendance status. Allowed: ${validAttendanceStatuses.join(', ')}`
        });
      }
      registration.attendanceStatus = attendanceStatus;
    }

    await registration.save();

    const updated = await Registration.findById(registration._id).populate(
      'eventId',
      'title date venue category capacity image'
    );

    res.status(200).json({
      success: true,
      message: 'Registration updated successfully',
      data: updated
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/registrations/:id - Cancel or delete registration
router.delete('/:id', async (req, res, next) => {
  try {
    const registration = await Registration.findById(req.params.id);
    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration record not found.'
      });
    }

    await registration.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Registration cancelled successfully.'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
