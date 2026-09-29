const express = require('express');
const router = express.Router();
const recordController = require('../controllers/recordController');
const { validateRecordInput } = require('../middleware/requestValidator');

// GET /api/records - Retrieve list of records with filters/search
router.get('/', recordController.getRecords);

// POST /api/records - Validate, deduplicate, and insert unique/false-positive records
router.post('/', validateRecordInput, recordController.createRecord);

// GET /api/records/:id - Retrieve single record details
router.get('/:id', recordController.getRecordById);

// DELETE /api/records/:id - Delete a record
router.delete('/:id', recordController.deleteRecord);

module.exports = router;
