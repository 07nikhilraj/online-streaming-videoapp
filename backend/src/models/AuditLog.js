const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  action: { type: String, required: true }, // e.g., "ROLE_UPDATE", "VIDEO_DELETE"
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  targetId: String,
  details: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AuditLog', auditLogSchema);