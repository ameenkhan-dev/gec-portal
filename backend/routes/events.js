const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { verifyToken, authorize } = require('../auth.middleware');

// Public routes
router.get('/', eventController.getAllEvents);

// Protected routes
router.post('/', verifyToken, authorize('club_admin'), eventController.createEvent);
router.get('/my-events', verifyToken, eventController.getMyEvents);
router.get('/:id', eventController.getEventById);

module.exports = router;
