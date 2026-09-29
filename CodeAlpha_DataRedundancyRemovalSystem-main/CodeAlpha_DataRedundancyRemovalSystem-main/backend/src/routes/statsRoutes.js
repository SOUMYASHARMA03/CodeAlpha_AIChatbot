const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');

// GET /api/stats - Dashboard analytics and cloud database status
router.get('/', statsController.getStats);

module.exports = router;
