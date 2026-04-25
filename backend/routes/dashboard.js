const express = require('express');
const router = express.Router();

const dashboardController = require('../controllers/dashboardController');
const { verifyToken, authorize } = require('../auth.middleware');

router.get('/student', verifyToken, authorize('student'), dashboardController.getStudentDashboard);
router.get('/club', verifyToken, authorize('club_admin'), dashboardController.getClubDashboard);
router.get('/admin', verifyToken, authorize('super_admin'), dashboardController.getAdminDashboard);

module.exports = router;
