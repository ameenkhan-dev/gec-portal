/**
 * Events Controller - In-memory data store
 */

let events = [
  {
    event_id: 1,
    title: 'Web Development Workshop',
    description: 'Learn modern web development with React and Node.js',
    club_id: 1,
    club_name: 'Tech Club',
    start_date: new Date('2026-05-15'),
    end_date: new Date('2026-05-15'),
    location: 'Computer Lab A',
    poster_url: 'https://via.placeholder.com/300x200?text=Web+Dev',
    capacity: 50,
    registered_count: 0,
    status: 'upcoming',
    created_at: new Date()
  },
  {
    event_id: 2,
    title: 'Data Science Bootcamp',
    description: 'Introduction to machine learning and data analysis',
    club_id: 1,
    club_name: 'Tech Club',
    start_date: new Date('2026-05-20'),
    end_date: new Date('2026-05-22'),
    location: 'Hall B',
    poster_url: 'https://via.placeholder.com/300x200?text=Data+Science',
    capacity: 30,
    registered_count: 0,
    status: 'upcoming',
    created_at: new Date()
  },
  {
    event_id: 3,
    title: 'Annual Tech Fest',
    description: 'Showcase your projects and compete with peers',
    club_id: 1,
    club_name: 'Tech Club',
    start_date: new Date('2026-06-01'),
    end_date: new Date('2026-06-02'),
    location: 'Main Auditorium',
    poster_url: 'https://via.placeholder.com/300x200?text=Tech+Fest',
    capacity: 200,
    registered_count: 0,
    status: 'upcoming',
    created_at: new Date()
  }
];

let registrations = [];
let nextEventId = 4;
let nextRegistrationId = 1;

const getAllEvents = async (req, res) => {
  try {
    res.json({
      data: events,
      total: events.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getEventById = async (req, res) => {
  try {
    const event = events.find(e => e.event_id === parseInt(req.params.id));
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createEvent = async (req, res) => {
  try {
    const { title, description, club_id, start_date, end_date, location, capacity } = req.body;

    if (!title || !description || !club_id) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const newEvent = {
      event_id: nextEventId++,
      title,
      description,
      club_id,
      club_name: 'Tech Club',
      start_date: new Date(start_date),
      end_date: new Date(end_date),
      location: location || 'To be announced',
      poster_url: 'https://via.placeholder.com/300x200?text=' + encodeURIComponent(title),
      capacity: capacity || 50,
      registered_count: 0,
      status: 'upcoming',
      created_at: new Date()
    };

    events.push(newEvent);
    res.status(201).json(newEvent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateEvent = async (req, res) => {
  try {
    const event = events.find(e => e.event_id === parseInt(req.params.id));
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    Object.assign(event, req.body);
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteEvent = async (req, res) => {
  try {
    const index = events.findIndex(e => e.event_id === parseInt(req.params.id));
    if (index === -1) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const deleted = events.splice(index, 1);
    res.json({ message: 'Event deleted', event: deleted[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const registerForEvent = async (req, res) => {
  try {
    const { event_id } = req.body;
    const user_id = req.user.user_id;

    const event = events.find(e => e.event_id === event_id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (event.registered_count >= event.capacity) {
      return res.status(400).json({ error: 'Event is full' });
    }

    // Check if already registered
    const existing = registrations.find(r => r.event_id === event_id && r.user_id === user_id);
    if (existing) {
      return res.status(400).json({ error: 'Already registered for this event' });
    }

    const registration = {
      registration_id: nextRegistrationId++,
      event_id,
      user_id,
      registered_at: new Date()
    };

    registrations.push(registration);
    event.registered_count++;

    res.status(201).json(registration);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getMyRegistrations = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const userRegistrations = registrations.filter(r => r.user_id === user_id);
    
    const registeredEvents = userRegistrations.map(reg => {
      const event = events.find(e => e.event_id === reg.event_id);
      return { ...event, registration_id: reg.registration_id, registered_at: reg.registered_at };
    });

    res.json({
      data: registeredEvents,
      total: registeredEvents.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const unregisterEvent = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const registration_id = parseInt(req.params.id);

    const regIndex = registrations.findIndex(r => r.registration_id === registration_id && r.user_id === user_id);
    if (regIndex === -1) {
      return res.status(404).json({ error: 'Registration not found' });
    }

    const registration = registrations[regIndex];
    const event = events.find(e => e.event_id === registration.event_id);
    
    registrations.splice(regIndex, 1);
    if (event) event.registered_count--;

    res.json({ message: 'Unregistered successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  registerForEvent,
  getMyRegistrations,
  unregisterEvent
};
