import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDatabase, dataStore, resetAndSeed } from './dataStore.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/volunteerhub';

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use('/avatars', express.static(path.join(__dirname, 'public/avatars')));
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString().substring(11, 19)}] ${req.method} ${req.originalUrl}`);
  next();
});

// Initialize DB / Persistence Store
await initDatabase(MONGO_URI);

/* -------------------------------------------------------------
   API ROUTES
------------------------------------------------------------- */

// Health & System Info
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    databaseMode: dataStore.isUsingMongo() ? 'MongoDB Connected' : 'Persistent Local Storage'
  });
});

// Authentication: Login for SVECW students & coordinators
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password, role } = req.body;
    if (!username || !username.trim()) {
      return res.status(400).json({ error: 'Username or Roll number is required.' });
    }
    if (!password || !password.trim()) {
      return res.status(400).json({ error: 'Password is required.' });
    }

    const cleanInput = username.trim();
    const volunteers = await dataStore.getVolunteers();
    
    // Find matching volunteer by rollNumber, email, or name
    let matched = volunteers.find(v => 
      v.rollNumber.toUpperCase() === cleanInput.toUpperCase() ||
      v.email.toLowerCase() === cleanInput.toLowerCase() ||
      v.name.toLowerCase() === cleanInput.toLowerCase()
    );

    if (!matched) {
      // Auto-register student if new roll number is entered
      matched = await dataStore.createOrUpdateVolunteer({
        rollNumber: cleanInput.toUpperCase(),
        name: cleanInput.includes('@') ? cleanInput.split('@')[0] : cleanInput,
        email: cleanInput.includes('@') ? cleanInput.toLowerCase() : `${cleanInput.toLowerCase()}@svecw.edu.in`,
        department: 'Computer Science & Engineering',
        year: '3rd Year B.Tech',
        role: role || 'student',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
        skills: ['Community Engagement', 'NSS Volunteer'],
        bio: 'Student at Shri Vishnu Engineering College for Women (SVECW).',
        totalHours: 12,
        karmaPoints: 160
      });
    }

    res.json({
      success: true,
      message: 'Login successful',
      user: matched,
      token: 'svecw_session_' + Date.now()
    });
  } catch (err) {
    res.status(500).json({ error: 'Login error: ' + err.message });
  }
});

// Authentication: Logout
app.post('/api/auth/logout', (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

// Authentication: Register new SVECW Student / Volunteer in DB
app.post('/api/auth/register', async (req, res) => {
  try {
    const { 
      name, 
      rollNumber, 
      email, 
      password, 
      department, 
      year, 
      phone, 
      role, 
      skills, 
      bio, 
      avatar 
    } = req.body;

    // Required Field Validations
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Full Name is required.' });
    }
    if (!rollNumber || !rollNumber.trim()) {
      return res.status(400).json({ error: 'College Roll Number is required.' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ error: 'College Email is required.' });
    }
    if (!password || !password.trim()) {
      return res.status(400).json({ error: 'Password is required.' });
    }

    const cleanRoll = rollNumber.trim().toUpperCase();
    const cleanEmail = email.trim().toLowerCase();

    // Check if user already exists in DB
    const existingRoll = await dataStore.getVolunteerByRoll(cleanRoll);
    if (existingRoll) {
      return res.status(400).json({ 
        error: `A student with Roll Number "${cleanRoll}" is already registered in the database. Please sign in instead.` 
      });
    }

    const allVolunteers = await dataStore.getVolunteers();
    const existingEmail = allVolunteers.find(v => v.email && v.email.toLowerCase() === cleanEmail);
    if (existingEmail) {
      return res.status(400).json({ 
        error: `Email "${cleanEmail}" is already registered with another account.` 
      });
    }

    // Default avatars for female student engineers at SVECW
    const defaultAvatars = [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80'
    ];
    const assignedAvatar = avatar || defaultAvatars[Math.floor(Math.random() * defaultAvatars.length)];

    // Create new volunteer record and persist into DB (MongoDB / store.json)
    const newVolunteer = await dataStore.createOrUpdateVolunteer({
      name: name.trim(),
      rollNumber: cleanRoll,
      email: cleanEmail,
      password: password.trim(),
      department: department || 'Computer Science & Engineering',
      year: year || '3rd Year B.Tech',
      phone: phone ? phone.trim() : '',
      role: role || 'student',
      skills: Array.isArray(skills) 
        ? skills 
        : (skills ? skills.split(',').map(s => s.trim()).filter(Boolean) : ['Community Service', 'Student Volunteer']),
      bio: bio ? bio.trim() : `Proud student volunteer at Shri Vishnu Engineering College for Women (SVECW), ${department || 'Bhimavaram'}.`,
      avatar: assignedAvatar,
      totalHours: 0,
      karmaPoints: 100,
      badges: [
        { id: 'b1', name: 'First Step', description: 'Registered on SVECW VolunteerHub Network', icon: '🌱', awardedAt: new Date().toISOString() }
      ]
    });

    console.log(`[DB SUCCESS] New student registered in DB: ${newVolunteer.name} (${newVolunteer.rollNumber})`);

    res.status(201).json({
      success: true,
      message: 'Student registered successfully in SVECW database!',
      user: newVolunteer,
      token: 'svecw_session_' + Date.now()
    });
  } catch (err) {
    console.error('Registration API error:', err);
    res.status(500).json({ error: 'Registration failed: ' + err.message });
  }
});

// Reset & Seed endpoint
app.post('/api/seed', async (req, res) => {
  try {
    const result = await resetAndSeed();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Seed failed: ' + err.message });
  }
});

// Aggregate Platform Statistics
app.get('/api/stats', async (req, res) => {
  try {
    const stats = await dataStore.getStats();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Events: List with filters & search
app.get('/api/events', async (req, res) => {
  try {
    const { category, search, status, sort } = req.query;
    const events = await dataStore.getEvents({ category, search, status, sort });
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Events: Single Event details with attendees
app.get('/api/events/:id', async (req, res) => {
  try {
    const event = await dataStore.getEventById(req.params.id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    const registrations = await dataStore.getRegistrations({ eventId: req.params.id });
    res.json({ ...event, registrations });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Events: Create new Event
app.post('/api/events', async (req, res) => {
  try {
    const { title, description, category, organizer, date, time, location, hoursCredit, requiredVolunteers, skillsRequired, bannerImage } = req.body;
    if (!title || !description || !date || !time) {
      return res.status(400).json({ error: 'Title, description, date, and time are required.' });
    }

    const newEvent = await dataStore.createEvent({
      title,
      description,
      category: category || 'Community & Social Welfare',
      organizer: organizer || {
        name: 'Campus Volunteer Coordinator',
        club: 'Volunteer Council',
        email: 'volunteers@college.edu'
      },
      date,
      time,
      location: location || { venue: 'Campus Main Grounds', landmark: '' },
      hoursCredit: Number(hoursCredit) || 4,
      requiredVolunteers: Number(requiredVolunteers) || 25,
      skillsRequired: skillsRequired || [],
      bannerImage: bannerImage || 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1000&auto=format&fit=crop&q=80',
      status: 'Upcoming'
    });

    res.status(201).json(newEvent);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Events: Update Event
app.put('/api/events/:id', async (req, res) => {
  try {
    const updated = await dataStore.updateEvent(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Events: Delete Event
app.delete('/api/events/:id', async (req, res) => {
  try {
    const success = await dataStore.deleteEvent(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json({ message: 'Event and associated registrations deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Events: Register for Event
app.post('/api/events/:id/register', async (req, res) => {
  try {
    const { studentRoll, studentName, studentEmail, studentDept, phone, notes } = req.body;
    if (!studentRoll || !studentName || !studentEmail) {
      return res.status(400).json({ error: 'Student Roll Number, Name, and College Email are required' });
    }

    const registration = await dataStore.registerForEvent({
      eventId: req.params.id,
      studentRoll,
      studentName,
      studentEmail,
      studentDept,
      phone,
      notes
    });

    res.status(201).json(registration);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Events: Cancel Registration
app.post('/api/events/:id/cancel', async (req, res) => {
  try {
    const { registrationId, studentRoll } = req.body;
    if (!registrationId) {
      return res.status(400).json({ error: 'Registration ID is required' });
    }
    const cancelled = await dataStore.cancelRegistration(registrationId, studentRoll);
    res.json({ message: 'Registration cancelled', registration: cancelled });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Events: Mark Attendance & Credit Hours
app.put('/api/events/:id/attendance', async (req, res) => {
  try {
    const { registrationId, hoursAwarded, feedback } = req.body;
    if (!registrationId) {
      return res.status(400).json({ error: 'Registration ID is required' });
    }
    const updated = await dataStore.markAttendance({
      registrationId,
      eventId: req.params.id,
      hoursAwarded,
      feedback
    });
    res.json({ message: 'Attendance marked and service hours awarded', registration: updated });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Volunteers: List & Leaderboard
app.get('/api/volunteers', async (req, res) => {
  try {
    const { search, sort } = req.query;
    const volunteers = await dataStore.getVolunteers({ search, sort });
    res.json(volunteers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Volunteers: Get Student Profile by Roll Number
app.get('/api/volunteers/:rollNumber', async (req, res) => {
  try {
    const volunteer = await dataStore.getVolunteerByRoll(req.params.rollNumber);
    if (!volunteer) {
      return res.status(404).json({ error: 'Volunteer student profile not found' });
    }
    // Fetch student registrations and attended certificates
    const registrations = await dataStore.getRegistrations({ studentRoll: req.params.rollNumber });
    res.json({ ...volunteer, registrations });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Volunteers: Update profile or create
app.put('/api/volunteers/:rollNumber', async (req, res) => {
  try {
    const updated = await dataStore.createOrUpdateVolunteer({
      rollNumber: req.params.rollNumber,
      ...req.body
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Registrations: Query by student roll or event
app.get('/api/registrations', async (req, res) => {
  try {
    const { studentRoll, eventId, studentEmail } = req.query;
    const list = await dataStore.getRegistrations({ studentRoll, eventId, studentEmail });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Announcements
app.get('/api/announcements', async (req, res) => {
  try {
    const items = await dataStore.getAnnouncements();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/announcements', async (req, res) => {
  try {
    const { title, content, priority, clubOrWing, author, linkEventId } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }
    const item = await dataStore.createAnnouncement({
      title,
      content,
      priority: priority || 'General',
      clubOrWing: clubOrWing || 'Volunteer Council',
      author: author || 'Coordinator',
      linkEventId: linkEventId || ''
    });
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Serve frontend in production if built
const clientDist = path.join(__dirname, '../client/dist');
app.use(express.static(clientDist));
app.get('*', (req, res, next) => {
  if (req.originalUrl.startsWith('/api')) return next();
  const indexHtml = path.join(clientDist, 'index.html');
  res.sendFile(indexHtml, (err) => {
    if (err) {
      res.status(200).send(`
        <!DOCTYPE html>
        <html>
        <head><title>VolunteerHub API</title></head>
        <body style="font-family: sans-serif; padding: 2rem; background: #0f172a; color: #f8fafc;">
          <h2>VolunteerHub Backend API is Running</h2>
          <p>Endpoints available under <code>/api</code>:</p>
          <ul>
            <li><a style="color: #38bdf8" href="/api/events">/api/events</a></li>
            <li><a style="color: #38bdf8" href="/api/volunteers">/api/volunteers</a></li>
            <li><a style="color: #38bdf8" href="/api/announcements">/api/announcements</a></li>
            <li><a style="color: #38bdf8" href="/api/stats">/api/stats</a></li>
            <li><a style="color: #38bdf8" href="/api/health">/api/health</a></li>
          </ul>
        </body>
        </html>
      `);
    }
  });
});

app.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(` VolunteerHub API Server running on port ${PORT}`);
  console.log(` Local URL: http://localhost:${PORT}`);
  console.log(` Mode: ${dataStore.isUsingMongo() ? 'MongoDB' : 'Resilient High-Speed JSON Store'}`);
  console.log(`===================================================`);
});
