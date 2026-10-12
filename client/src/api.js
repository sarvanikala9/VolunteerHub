const API_BASE = '/api';

export const api = {
  async login(username, password, role = 'student') {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, role })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Login failed. Please check credentials.');
    }
    return await res.json();
  },

  async register(studentData) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(studentData)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Registration failed. Please check form details.');
    }
    return await res.json();
  },

  async logout() {
    try {
      await fetch(`${API_BASE}/auth/logout`, { method: 'POST' });
    } catch (e) {
      // ignore
    }
    return { success: true };
  },

  async getHealth() {
    const res = await fetch(`${API_BASE}/health`);
    return await res.json();
  },

  async getStats() {
    const res = await fetch(`${API_BASE}/stats`);
    return await res.json();
  },

  async getEvents({ category, search, status, sort } = {}) {
    const params = new URLSearchParams();
    if (category && category !== 'All') params.append('category', category);
    if (search) params.append('search', search);
    if (status && status !== 'All') params.append('status', status);
    if (sort) params.append('sort', sort);

    const res = await fetch(`${API_BASE}/events?${params.toString()}`);
    return await res.json();
  },

  async getEventById(id) {
    const res = await fetch(`${API_BASE}/events/${id}`);
    return await res.json();
  },

  async createEvent(eventData) {
    const res = await fetch(`${API_BASE}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create event');
    }
    return await res.json();
  },

  async registerForEvent(eventId, payload) {
    const res = await fetch(`${API_BASE}/events/${eventId}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to register');
    }
    return await res.json();
  },

  async cancelRegistration(eventId, registrationId, studentRoll) {
    const res = await fetch(`${API_BASE}/events/${eventId}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ registrationId, studentRoll })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to cancel registration');
    }
    return await res.json();
  },

  async markAttendance(eventId, registrationId, hoursAwarded, feedback) {
    const res = await fetch(`${API_BASE}/events/${eventId}/attendance`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ registrationId, hoursAwarded, feedback })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to mark attendance');
    }
    return await res.json();
  },

  async getVolunteers({ search, sort } = {}) {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (sort) params.append('sort', sort);
    const res = await fetch(`${API_BASE}/volunteers?${params.toString()}`);
    return await res.json();
  },

  async getVolunteerProfile(rollNumber) {
    const res = await fetch(`${API_BASE}/volunteers/${rollNumber}`);
    if (!res.ok) return null;
    return await res.json();
  },

  async getRegistrations({ studentRoll, eventId } = {}) {
    const params = new URLSearchParams();
    if (studentRoll) params.append('studentRoll', studentRoll);
    if (eventId) params.append('eventId', eventId);
    const res = await fetch(`${API_BASE}/registrations?${params.toString()}`);
    return await res.json();
  },

  async getAnnouncements() {
    const res = await fetch(`${API_BASE}/announcements`);
    return await res.json();
  },

  async createAnnouncement(payload) {
    const res = await fetch(`${API_BASE}/announcements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await res.json();
  },

  async resetSeed() {
    const res = await fetch(`${API_BASE}/seed`, { method: 'POST' });
    return await res.json();
  }
};
