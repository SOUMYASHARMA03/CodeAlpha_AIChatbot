const Record = require('../models/Record');
const AuditLog = require('../models/AuditLog');
const { getDbStatus } = require('../config/db');

/**
 * GET /api/stats
 * Aggregate key metrics for the CloudGuard dashboard
 */
async function getStats(req, res, next) {
  try {
    const dbStatus = getDbStatus();

    // Query stats in parallel for optimal responsiveness
    const [
      totalRecords,
      uniqueRecords,
      falsePositives,
      duplicateAttempts,
      exactDuplicatesBlocked,
      similarDuplicatesBlocked,
      invalidAttempts,
      totalEvaluations
    ] = await Promise.all([
      Record.countDocuments({}),
      Record.countDocuments({ validationStatus: 'UNIQUE' }),
      Record.countDocuments({ validationStatus: 'FALSE_POSITIVE' }),
      AuditLog.countDocuments({
        classification: { $in: ['REDUNDANT_EXACT', 'REDUNDANT_SIMILAR'] }
      }),
      AuditLog.countDocuments({ classification: 'REDUNDANT_EXACT' }),
      AuditLog.countDocuments({ classification: 'REDUNDANT_SIMILAR' }),
      AuditLog.countDocuments({ classification: 'INVALID' }),
      AuditLog.countDocuments({})
    ]);

    // Redundancy Prevention Rate %
    const totalPotentialDuplicates = duplicateAttempts;
    const preventionRate = totalEvaluations > 0
      ? Math.round((duplicateAttempts / totalEvaluations) * 100)
      : 0;

    res.json({
      success: true,
      stats: {
        totalRecords,
        uniqueRecords,
        falsePositives,
        duplicateAttempts,
        exactDuplicatesBlocked,
        similarDuplicatesBlocked,
        invalidAttempts,
        totalEvaluations,
        preventionRate
      },
      dbStatus
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getStats
};
