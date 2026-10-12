import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import Event from './models/Event.js';
import Volunteer from './models/Volunteer.js';
import Registration from './models/Registration.js';
import Announcement from './models/Announcement.js';
import { initialEvents, initialVolunteers, initialRegistrations, initialAnnouncements } from './initialData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, 'data');
const JSON_FILE = path.join(DATA_DIR, 'store.json');

let isMongoConnected = false;

// In-memory cache synced with JSON file
let memoryStore = {
  events: JSON.parse(JSON.stringify(initialEvents)),
  volunteers: JSON.parse(JSON.stringify(initialVolunteers)),
  registrations: JSON.parse(JSON.stringify(initialRegistrations)),
  announcements: JSON.parse(JSON.stringify(initialAnnouncements))
};

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function loadLocalStore() {
  try {
    ensureDataDir();
    if (fs.existsSync(JSON_FILE)) {
      const raw = fs.readFileSync(JSON_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed.events && parsed.events.length > 0) {
        memoryStore = parsed;
        return;
      }
    }
    // Write initial data if file doesn't exist
    saveLocalStore();
  } catch (err) {
    console.warn('Notice: Could not read local store.json, using in-memory fallback:', err.message);
  }
}

function saveLocalStore() {
  try {
    ensureDataDir();
    fs.writeFileSync(JSON_FILE, JSON.stringify(memoryStore, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Notice: Could not write local store.json:', err.message);
  }
}

export async function initDatabase(mongoUri) {
  loadLocalStore();

  if (mongoUri) {
    try {
      console.log(`Attempting connection to MongoDB at: ${mongoUri}...`);
      mongoose.set('strictQuery', false);
      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 2500,
        connectTimeoutMS: 3000
      });
      isMongoConnected = true;
      console.log('Successfully connected to MongoDB Atlas / Local MongoDB instance.');

      // Check if collections are empty, seed if so
      const count = await Event.countDocuments();
      if (count === 0) {
        console.log('MongoDB is empty. Seeding initial data into MongoDB...');
        await seedMongo();
      }
    } catch (err) {
      isMongoConnected = false;
      console.log(`Notice: MongoDB connection not available (${err.message}).`);
      console.log('VolunteerHub is operating smoothly using resilient high-performance persistent store.');
    }
  } else {
    console.log('No MONGO_URI specified. Operating with persistent local store.');
  }
}

async function seedMongo() {
  await Event.deleteMany({});
  await Volunteer.deleteMany({});
  await Registration.deleteMany({});
  await Announcement.deleteMany({});

  await Event.insertMany(initialEvents);
  await Volunteer.insertMany(initialVolunteers);
  await Registration.insertMany(initialRegistrations);
  await Announcement.insertMany(initialAnnouncements);
  console.log('MongoDB successfully seeded with rich initial college volunteer data.');
}

export async function resetAndSeed() {
  memoryStore = {
    events: JSON.parse(JSON.stringify(initialEvents)),
    volunteers: JSON.parse(JSON.stringify(initialVolunteers)),
    registrations: JSON.parse(JSON.stringify(initialRegistrations)),
    announcements: JSON.parse(JSON.stringify(initialAnnouncements))
  };
  saveLocalStore();

  if (isMongoConnected) {
    await seedMongo();
  }
  return { message: 'Data store successfully re-seeded with initial datasets.' };
}

export const dataStore = {
  isUsingMongo() {
    return isMongoConnected;
  },

  async getEvents({ category, search, status, sort } = {}) {
    if (isMongoConnected) {
      const query = {};
      if (category && category !== 'All') {
        query.category = category;
      }
      if (status && status !== 'All') {
        query.status = status;
      }
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { 'organizer.club': { $regex: search, $options: 'i' } },
          { skillsRequired: { $in: [new RegExp(search, 'i')] } }
        ];
      }
      let cursor = Event.find(query);
      if (sort === 'hours') cursor = cursor.sort({ hoursCredit: -1 });
      else if (sort === 'urgent') cursor = cursor.sort({ isUrgent: -1, date: 1 });
      else cursor = cursor.sort({ date: 1 });
      return await cursor.lean();
    }

    // Local Memory Store filtering
    let list = [...memoryStore.events];
    if (category && category !== 'All') {
      list = list.filter(e => e.category === category);
    }
    if (status && status !== 'All') {
      list = list.filter(e => e.status.toLowerCase() === status.toLowerCase());
    }
    if (search) {
      const s = search.toLowerCase();
      list = list.filter(e =>
        e.title.toLowerCase().includes(s) ||
        e.description.toLowerCase().includes(s) ||
        (e.organizer && e.organizer.club.toLowerCase().includes(s)) ||
        (e.skillsRequired && e.skillsRequired.some(sk => sk.toLowerCase().includes(s)))
      );
    }
    if (sort === 'hours') {
      list.sort((a, b) => b.hoursCredit - a.hoursCredit);
    } else if (sort === 'urgent') {
      list.sort((a, b) => (b.isUrgent ? 1 : 0) - (a.isUrgent ? 1 : 0) || a.date.localeCompare(b.date));
    } else {
      list.sort((a, b) => a.date.localeCompare(b.date));
    }
    return list;
  },

  async getEventById(id) {
    if (isMongoConnected) {
      return await Event.findById(id).lean();
    }
    return memoryStore.events.find(e => String(e._id) === String(id)) || null;
  },

  async createEvent(eventData) {
    if (isMongoConnected) {
      const created = await Event.create(eventData);
      return created.toObject();
    }
    const newEvent = {
      _id: 'evt_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      registeredCount: 0,
      status: 'Upcoming',
      isUrgent: false,
      isFeatured: false,
      ...eventData,
      createdAt: new Date().toISOString()
    };
    memoryStore.events.unshift(newEvent);
    saveLocalStore();
    return newEvent;
  },

  async updateEvent(id, updateData) {
    if (isMongoConnected) {
      return await Event.findByIdAndUpdate(id, updateData, { new: true }).lean();
    }
    const idx = memoryStore.events.findIndex(e => String(e._id) === String(id));
    if (idx === -1) return null;
    memoryStore.events[idx] = { ...memoryStore.events[idx], ...updateData, updatedAt: new Date().toISOString() };
    saveLocalStore();
    return memoryStore.events[idx];
  },

  async deleteEvent(id) {
    if (isMongoConnected) {
      await Event.findByIdAndDelete(id);
      await Registration.deleteMany({ eventId: id });
      return true;
    }
    const idx = memoryStore.events.findIndex(e => String(e._id) === String(id));
    if (idx === -1) return false;
    memoryStore.events.splice(idx, 1);
    memoryStore.registrations = memoryStore.registrations.filter(r => String(r.eventId) !== String(id));
    saveLocalStore();
    return true;
  },

  async registerForEvent({ eventId, studentRoll, studentName, studentEmail, studentDept, phone, notes }) {
    // Check if event exists
    const event = await this.getEventById(eventId);
    if (!event) throw new Error('Event not found');

    // Check if already registered
    const existing = await this.getRegistrations({ eventId, studentRoll });
    if (existing && existing.length > 0) {
      const activeReg = existing.find(r => r.status !== 'Cancelled');
      if (activeReg) {
        throw new Error(`Student ${studentRoll} is already registered for this event.`);
      }
    }

    if (event.registeredCount >= event.requiredVolunteers) {
      throw new Error('This volunteer event has reached maximum volunteer capacity.');
    }

    // Unique certificate tracking code generated upon registration
    const certCode = `VH-2026-CERT-${Math.floor(1000 + Math.random() * 9000)}`;

    let newReg;
    if (isMongoConnected) {
      newReg = await Registration.create({
        eventId,
        eventTitle: event.title,
        eventDate: event.date,
        studentName,
        studentEmail,
        studentRoll: studentRoll.toUpperCase(),
        studentDept: studentDept || 'General',
        phone: phone || '',
        status: 'Registered',
        certificateCode: certCode,
        dietaryOrEmergencyNotes: notes || ''
      });
      await Event.findByIdAndUpdate(eventId, { $inc: { registeredCount: 1 } });
      newReg = newReg.toObject();
    } else {
      newReg = {
        _id: 'reg_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
        eventId: String(eventId),
        eventTitle: event.title,
        eventDate: event.date,
        studentName,
        studentEmail,
        studentRoll: studentRoll.toUpperCase(),
        studentDept: studentDept || 'General',
        phone: phone || '',
        status: 'Registered',
        certificateCode: certCode,
        dietaryOrEmergencyNotes: notes || '',
        createdAt: new Date().toISOString()
      };
      memoryStore.registrations.push(newReg);
      // Increment event registered count
      const evtIdx = memoryStore.events.findIndex(e => String(e._id) === String(eventId));
      if (evtIdx !== -1) {
        memoryStore.events[evtIdx].registeredCount = (memoryStore.events[evtIdx].registeredCount || 0) + 1;
      }
      saveLocalStore();
    }

    // Ensure student exists in volunteer list
    let volunteer = await this.getVolunteerByRoll(studentRoll);
    if (!volunteer) {
      volunteer = await this.createOrUpdateVolunteer({
        rollNumber: studentRoll.toUpperCase(),
        name: studentName,
        email: studentEmail,
        department: studentDept || 'Engineering',
        phone: phone || ''
      });
    }

    return newReg;
  },

  async cancelRegistration(registrationId, studentRoll) {
    if (isMongoConnected) {
      const reg = await Registration.findById(registrationId);
      if (!reg) throw new Error('Registration not found');
      if (studentRoll && reg.studentRoll !== studentRoll.toUpperCase()) {
        throw new Error('Unauthorized cancellation request');
      }
      if (reg.status === 'Cancelled') return reg.toObject();

      reg.status = 'Cancelled';
      await reg.save();
      await Event.findByIdAndUpdate(reg.eventId, { $inc: { registeredCount: -1 } });
      return reg.toObject();
    }

    const reg = memoryStore.registrations.find(r => String(r._id) === String(registrationId));
    if (!reg) throw new Error('Registration not found');
    if (studentRoll && reg.studentRoll !== studentRoll.toUpperCase()) {
      throw new Error('Unauthorized cancellation request');
    }
    if (reg.status === 'Cancelled') return reg;

    reg.status = 'Cancelled';
    const evt = memoryStore.events.find(e => String(e._id) === String(reg.eventId));
    if (evt && evt.registeredCount > 0) {
      evt.registeredCount -= 1;
    }
    saveLocalStore();
    return reg;
  },

  async markAttendance({ registrationId, hoursAwarded, feedback }) {
    let reg;
    let event;

    if (isMongoConnected) {
      reg = await Registration.findById(registrationId);
      if (!reg) throw new Error('Registration record not found');
      event = await Event.findById(reg.eventId);

      const hours = hoursAwarded !== undefined ? Number(hoursAwarded) : (event ? event.hoursCredit : 4);
      reg.status = 'Attended';
      reg.attendedAt = new Date();
      reg.hoursAwarded = hours;
      if (feedback) reg.feedback = feedback;
      await reg.save();

      // Award hours and karma to volunteer
      const karmaToAdd = hours * 15;
      await Volunteer.findOneAndUpdate(
        { rollNumber: reg.studentRoll },
        {
          $inc: { totalHours: hours, karmaPoints: karmaToAdd }
        }
      );
      return reg.toObject();
    }

    reg = memoryStore.registrations.find(r => String(r._id) === String(registrationId));
    if (!reg) throw new Error('Registration record not found');
    event = memoryStore.events.find(e => String(e._id) === String(reg.eventId));

    const hours = hoursAwarded !== undefined ? Number(hoursAwarded) : (event ? event.hoursCredit : 4);
    reg.status = 'Attended';
    reg.attendedAt = new Date().toISOString();
    reg.hoursAwarded = hours;
    if (feedback) reg.feedback = feedback;

    // Award hours to volunteer in memory
    const vol = memoryStore.volunteers.find(v => v.rollNumber === reg.studentRoll);
    if (vol) {
      vol.totalHours = (vol.totalHours || 0) + hours;
      vol.karmaPoints = (vol.karmaPoints || 0) + (hours * 15);
    }
    saveLocalStore();
    return reg;
  },

  async getRegistrations({ eventId, studentRoll, studentEmail } = {}) {
    if (isMongoConnected) {
      const query = {};
      if (eventId) query.eventId = eventId;
      if (studentRoll) query.studentRoll = studentRoll.toUpperCase();
      if (studentEmail) query.studentEmail = studentEmail.toLowerCase();
      return await Registration.find(query).sort({ createdAt: -1 }).lean();
    }

    let list = [...memoryStore.registrations];
    if (eventId) list = list.filter(r => String(r.eventId) === String(eventId));
    if (studentRoll) list = list.filter(r => r.studentRoll === studentRoll.toUpperCase());
    if (studentEmail) list = list.filter(r => r.studentEmail === studentEmail.toLowerCase());
    return list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  },

  async getVolunteers({ search, sort = 'hours' } = {}) {
    if (isMongoConnected) {
      let query = {};
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { rollNumber: { $regex: search, $options: 'i' } },
          { department: { $regex: search, $options: 'i' } }
        ];
      }
      let cursor = Volunteer.find(query);
      if (sort === 'hours') cursor = cursor.sort({ totalHours: -1, karmaPoints: -1 });
      else if (sort === 'karma') cursor = cursor.sort({ karmaPoints: -1 });
      else cursor = cursor.sort({ name: 1 });
      return await cursor.lean();
    }

    let list = [...memoryStore.volunteers];
    if (search) {
      const s = search.toLowerCase();
      list = list.filter(v =>
        v.name.toLowerCase().includes(s) ||
        v.rollNumber.toLowerCase().includes(s) ||
        v.department.toLowerCase().includes(s)
      );
    }
    if (sort === 'hours') {
      list.sort((a, b) => b.totalHours - a.totalHours || b.karmaPoints - a.karmaPoints);
    } else if (sort === 'karma') {
      list.sort((a, b) => b.karmaPoints - a.karmaPoints);
    } else {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }
    return list;
  },

  async getVolunteerByRoll(rollNumber) {
    if (!rollNumber) return null;
    const cleanRoll = rollNumber.toUpperCase();
    if (isMongoConnected) {
      return await Volunteer.findOne({ rollNumber: cleanRoll }).lean();
    }
    return memoryStore.volunteers.find(v => v.rollNumber === cleanRoll) || null;
  },

  async createOrUpdateVolunteer(data) {
    const roll = data.rollNumber.toUpperCase();
    if (isMongoConnected) {
      return await Volunteer.findOneAndUpdate(
        { rollNumber: roll },
        { $set: data },
        { new: true, upsert: true }
      ).lean();
    }
    const idx = memoryStore.volunteers.findIndex(v => v.rollNumber === roll);
    if (idx !== -1) {
      memoryStore.volunteers[idx] = { ...memoryStore.volunteers[idx], ...data };
      saveLocalStore();
      return memoryStore.volunteers[idx];
    }
    const newVol = {
      _id: 'vol_' + Date.now().toString(36),
      rollNumber: roll,
      totalHours: 0,
      karmaPoints: 50,
      badges: [{ id: 'b1', name: 'First Step', description: 'Joined VolunteerHub campus network', icon: '🌱', awardedAt: new Date().toISOString() }],
      role: 'student',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
      ...data,
      createdAt: new Date().toISOString()
    };
    memoryStore.volunteers.push(newVol);
    saveLocalStore();
    return newVol;
  },

  async getAnnouncements() {
    if (isMongoConnected) {
      return await Announcement.find({}).sort({ pinned: -1, createdAt: -1 }).lean();
    }
    return [...memoryStore.announcements].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
  },

  async createAnnouncement(data) {
    if (isMongoConnected) {
      const created = await Announcement.create(data);
      return created.toObject();
    }
    const item = {
      _id: 'ann_' + Date.now().toString(36),
      pinned: false,
      priority: 'General',
      ...data,
      createdAt: new Date().toISOString()
    };
    memoryStore.announcements.unshift(item);
    saveLocalStore();
    return item;
  },

  async getStats() {
    const events = isMongoConnected ? await Event.find().lean() : memoryStore.events;
    const volunteers = isMongoConnected ? await Volunteer.find().lean() : memoryStore.volunteers;
    const registrations = isMongoConnected ? await Registration.find().lean() : memoryStore.registrations;

    const totalHoursServed = volunteers.reduce((acc, v) => acc + (v.totalHours || 0), 0);
    const totalRegistrations = registrations.length;
    const upcomingEventsCount = events.filter(e => e.status === 'Upcoming').length;
    const totalClubs = new Set(events.map(e => e.organizer && e.organizer.club)).size;

    return {
      totalEvents: events.length,
      upcomingEventsCount,
      totalVolunteers: volunteers.length,
      totalHoursServed,
      totalRegistrations,
      activeClubsCount: totalClubs,
      treesPlanted: 1250,
      bloodDonorsRegistered: 340,
      studentsMentored: 520
    };
  }
};
