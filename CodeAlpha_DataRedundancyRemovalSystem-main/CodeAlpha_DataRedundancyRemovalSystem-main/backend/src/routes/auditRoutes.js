const express = require('express');
const router = express.Router();
const auditController = require('../controllers/auditController');

// GET /api/audit - Retrieve validation activity logs
router.get('/', auditController.getAuditLogs);

// DELETE /api/audit - Clear audit history
router.delete('/', auditController.clearAuditLogs);

module.exports = router;
