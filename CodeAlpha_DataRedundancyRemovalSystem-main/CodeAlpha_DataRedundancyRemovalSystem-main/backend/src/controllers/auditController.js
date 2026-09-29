const AuditLog = require('../models/AuditLog');

/**
 * GET /api/audit
 * Retrieve validation audit logs with filtering and pagination
 */
async function getAuditLogs(req, res, next) {
  try {
    const {
      classification,
      action,
      limit = 50,
      page = 1
    } = req.query;

    const filter = {};

    if (classification && classification !== 'ALL') {
      filter.classification = classification.toUpperCase();
    }

    if (action && action !== 'ALL') {
      filter.action = action.toUpperCase();
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [logs, total] = await Promise.all([
      AuditLog.find(filter)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      AuditLog.countDocuments(filter)
    ]);

    res.json({
      success: true,
      logs,
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
 * DELETE /api/audit
 * Clear audit logs (useful for fresh demo starts)
 */
async function clearAuditLogs(req, res, next) {
  try {
    const result = await AuditLog.deleteMany({});
    res.json({
      success: true,
      message: 'Audit history cleared successfully',
      deletedCount: result.deletedCount
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAuditLogs,
  clearAuditLogs
};
