const express = require('express');
const router = express.Router();
const eventsController = require('../controllers/eventsController');
const { verifyToken } = require('../auth.middleware');

// Public routes
router.get('/', eventsController.getAllEvents);
router.get('/my/registrations', verifyToken, eventsController.getMyRegistrations);

// Event details (must be after /my/registrations to avoid conflicts)
router.get('/:id', eventsController.getEventById);

// Event management
router.post('/', verifyToken, eventsController.createEvent);
router.put('/:id', verifyToken, eventsController.updateEvent);
router.delete('/:id', verifyToken, eventsController.deleteEvent);

// Registration management
router.post('/register', verifyToken, eventsController.registerForEvent);
router.delete('/register/:id', verifyToken, eventsController.unregisterEvent);

module.exports = router;

