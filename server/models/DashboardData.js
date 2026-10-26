const mongoose = require('mongoose');

const dashboardDataSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    enum: ['إجمالي الدواجن', 'الإنتاج اليومي', 'المواد الغذائية', 'الوقود المتاح']
  },
  value: {
    type: String,
    required: true
  },
  change: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    required: true
  },
  color: {
    type: String,
    required: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('DashboardData', dashboardDataSchema);