import express from 'express';
import Event from '../models/Event.js';
import Registration from '../models/Registration.js';

const router = express.Router();

// Helper to compute registration counts for events
const attachSeatCounts = async (events) => {
  const eventIds = events.map(e => e._id);
  const counts = await Registration.aggregate([
    { $match: { eventId: { $in: eventIds } } },
    { $group: { _id: '$eventId', count: { $sum: 1 } } }
  ]);

  const countMap = {};
  counts.forEach(c => {
    countMap[c._id.toString()] = c.count;
  });

  return events.map(event => {
    const eventObj = event.toObject ? event.toObject() : { ...event };
    const regCount = countMap[event._id.toString()] || 0;
    eventObj.registeredCount = regCount;
    eventObj.availableSeats = Math.max(0, eventObj.capacity - regCount);
    eventObj.isFull = eventObj.availableSeats <= 0;
    return eventObj;
  });
};

// GET /api/events - List all events with filters & sorting
router.get('/', async (req, res, next) => {
  try {
    const { search, category, sortBy } = req.query;
    let query = {};

    if (search && search.trim() !== '') {
      query.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
        { venue: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    if (category && category.trim() !== '' && category !== 'All') {
      query.category = category.trim();
    }

    let sortOptions = { date: 1 }; // default: upcoming date first
    if (sortBy === 'date_desc') sortOptions = { date: -1 };
    else if (sortBy === 'date_asc') sortOptions = { date: 1 };
    else if (sortBy === 'title_asc') sortOptions = { title: 1 };
    else if (sortBy === 'capacity_desc') sortOptions = { capacity: -1 };

    const events = await Event.find(query).sort(sortOptions);
    const enrichedEvents = await attachSeatCounts(events);

    res.status(200).json({
      success: true,
      count: enrichedEvents.length,
      data: enrichedEvents
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/events/:id - Get single event
router.get('/:id', async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    const [enriched] = await attachSeatCounts([event]);

    res.status(200).json({
      success: true,
      data: enriched
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/events - Create new event
router.post('/', async (req, res, next) => {
  try {
    const { title, description, category, date, venue, image, capacity } = req.body;

    if (!title || !description || !category || !date || !venue || !capacity) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: title, description, category, date, venue, capacity.'
      });
    }

    const event = await Event.create({
      title,
      description,
      category,
      date,
      venue,
      image: image || 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=800&q=80',
      capacity: Number(capacity)
    });

    const [enriched] = await attachSeatCounts([event]);

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: enriched
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/events/:id - Update existing event
router.put('/:id', async (req, res, next) => {
  try {
    const { title, description, category, date, venue, image, capacity } = req.body;

    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    if (title !== undefined) event.title = title;
    if (description !== undefined) event.description = description;
    if (category !== undefined) event.category = category;
    if (date !== undefined) event.date = date;
    if (venue !== undefined) event.venue = venue;
    if (image !== undefined) event.image = image;
    if (capacity !== undefined) event.capacity = Number(capacity);

    await event.save();

    const [enriched] = await attachSeatCounts([event]);

    res.status(200).json({
      success: true,
      message: 'Event updated successfully',
      data: enriched
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/events/:id - Delete event and its registrations
router.delete('/:id', async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Delete associated registrations
    await Registration.deleteMany({ eventId: event._id });
    await event.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Event and related registrations removed successfully'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
