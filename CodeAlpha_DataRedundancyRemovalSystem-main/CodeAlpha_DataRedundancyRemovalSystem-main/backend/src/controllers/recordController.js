const Record = require('../models/Record');
const AuditLog = require('../models/AuditLog');
const deduplicationService = require('../services/deduplicationService');

/**
 * Record Controller
 * Handles receiving new records, executing deduplication checks,
 * saving verified records to MongoDB, and retrieving stored records.
 */

/**
 * POST /api/records
 * Process new record through deduplication engine
 */
async function createRecord(req, res, next) {
  try {
    const rawData = req.body;

    // Execute deduplication and similarity analysis
    const evaluation = await deduplicationService.evaluateRecord(rawData);

    // Save audit log entry for this attempt
    let auditEntry = null;
    try {
      auditEntry = await AuditLog.create({
        submittedData: rawData,
        classification: evaluation.classification,
        similarityScore: evaluation.similarityScore,
        action: evaluation.action,
        reason: evaluation.reason,
        matchedRecordId: evaluation.matchedRecord ? evaluation.matchedRecord._id : null,
        matchedRecordSummary: evaluation.matchedRecord ? {
          name: evaluation.matchedRecord.name,
          email: evaluation.matchedRecord.email,
          phone: evaluation.matchedRecord.phone,
          organization: evaluation.matchedRecord.organization
        } : null,
        fieldBreakdown: evaluation.fieldBreakdown,
        matchedFields: evaluation.matchedFields,
        differentFields: evaluation.differentFields,
        dataHash: evaluation.dataHash
      });
    } catch (auditErr) {
      console.warn('[Audit Log Warning]:', auditErr.message);
    }

    // Branch on Decision
    if (evaluation.isAllowed) {
      // Record is approved (UNIQUE or FALSE_POSITIVE)
      const newRecord = await Record.create({
        name: evaluation.normalizedRecord.name,
        email: evaluation.normalizedRecord.email,
        phone: evaluation.normalizedRecord.phone,
        city: evaluation.normalizedRecord.city,
        organization: evaluation.normalizedRecord.organization,
        category: evaluation.normalizedRecord.category,
        description: evaluation.normalizedRecord.description,
        dataHash: evaluation.dataHash,
        contactHash: evaluation.contactHash,
        normalizedName: evaluation.canonicalRecord.name,
        normalizedEmail: evaluation.canonicalRecord.email,
        normalizedPhone: evaluation.canonicalRecord.phone,
        validationStatus: evaluation.classification, // 'UNIQUE' or 'FALSE_POSITIVE'
        similarityScore: evaluation.similarityScore,
        verificationNotes: evaluation.reason
      });

      const message = evaluation.classification === 'FALSE_POSITIVE'
        ? 'Potential similarity detected on profile attributes, but independent validation confirmed this is an authentic unique entity. Record appended to cloud database.'
        : 'Unique and verified record appended successfully to cloud database.';

      return res.status(201).json({
        success: true,
        classification: evaluation.classification,
        action: 'INSERTED',
        message,
        record: newRecord,
        similarityScore: evaluation.similarityScore,
        matchedRecord: evaluation.matchedRecord,
        fieldBreakdown: evaluation.fieldBreakdown,
        matchedFields: evaluation.matchedFields,
        differentFields: evaluation.differentFields,
        auditId: auditEntry ? auditEntry._id : null
      });
    } else {
      // Record is redundant (REDUNDANT_EXACT or REDUNDANT_SIMILAR) -> REJECT
      const message = evaluation.classification === 'REDUNDANT_EXACT'
        ? 'Duplicate record detected. Exact identity match found in cloud database. Insertion rejected.'
        : `Redundant data detected (${evaluation.similarityScore}% similarity match). Insertion rejected to prevent database pollution.`;

      return res.status(409).json({
        success: false,
        classification: evaluation.classification,
        action: 'REJECTED',
        message,
        similarityScore: evaluation.similarityScore,
        matchedRecord: evaluation.matchedRecord,
        fieldBreakdown: evaluation.fieldBreakdown,
        matchedFields: evaluation.matchedFields,
        differentFields: evaluation.differentFields,
        reason: evaluation.reason,
        auditId: auditEntry ? auditEntry._id : null
      });
    }
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/records
 * Retrieve verified records with search, filter, and pagination
 */
async function getRecords(req, res, next) {
  try {
    const {
      search = '',
      category = '',
      status = '',
      page = 1,
      limit = 50,
      sortBy = 'createdAt',
      order = 'desc'
    } = req.query;

    const filter = {};

    if (search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { name: regex },
        { email: regex },
        { phone: regex },
        { city: regex },
        { organization: regex }
      ];
    }

    if (category && category !== 'ALL') {
      filter.category = new RegExp(`^${category}$`, 'i');
    }

    if (status && status !== 'ALL') {
      filter.validationStatus = status.toUpperCase();
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;
    const sortOrder = order === 'asc' ? 1 : -1;

    const [records, total] = await Promise.all([
      Record.find(filter)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Record.countDocuments(filter)
    ]);

    res.json({
      success: true,
      records,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum) || 1
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/records/:id
 * Retrieve a specific record by ID
 */
async function getRecordById(req, res, next) {
  try {
    const record = await Record.findById(req.params.id);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Record not found'
      });
    }
    res.json({
      success: true,
      record
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/records/:id
 * Remove a record (useful for demo resets)
 */
async function deleteRecord(req, res, next) {
  try {
    const deleted = await Record.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Record not found'
      });
    }
    res.json({
      success: true,
      message: 'Record deleted from cloud database successfully',
      id: req.params.id
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createRecord,
  getRecords,
  getRecordById,
  deleteRecord
};
