const mongoose = require('mongoose');

const vulnerabilitySchema = new mongoose.Schema({
  source: { type: String, required: true },
  type: { type: String, required: true },
  severity: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  package: { type: String, default: '' },
  fixAvailable: { type: Boolean, default: false },
  cvss: { type: Number, default: 0 },
  aiAnalysis: {
    priorityScore: { type: Number, default: 0 },
    suggestedFix: { type: String, default: '' },
    estimatedEffort: { type: String, default: '' },
    riskLevel: { type: String, default: '' }
  }
}, { _id: false });

const scanSchema = new mongoose.Schema({
  scanId: { type: String, required: true, unique: true },
  timestamp: { type: Date, default: Date.now },
  branch: { type: String, default: 'main' },
  commitSha: { type: String, required: true },
  author: { type: String, default: 'unknown' },
  status: { type: String, default: 'completed' },
  metrics: {
    critical: { type: Number, default: 0 },
    high: { type: Number, default: 0 },
    medium: { type: Number, default: 0 },
    low: { type: Number, default: 0 },
    total: { type: Number, default: 0 }
  },
  vulnerabilities: [vulnerabilitySchema]
});

scanSchema.methods.calculateMetrics = function() {
  const metrics = { critical: 0, high: 0, medium: 0, low: 0, total: 0 };
  this.vulnerabilities.forEach(vuln => {
    const severity = vuln.severity.toLowerCase();
    if (metrics.hasOwnProperty(severity)) {
      metrics[severity]++;
    }
  });
  metrics.total = this.vulnerabilities.length;
  this.metrics = metrics;
  return metrics;
};

module.exports = mongoose.model('Scan', scanSchema);
