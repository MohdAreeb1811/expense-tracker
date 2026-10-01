const mongoose = require('mongoose');
const { CATEGORIES } = require('./Expense');

const budgetSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  category: {
    type: String,
    required: true,
    enum: CATEGORIES
  },
  limit: {
    type: Number,
    required: [true, 'Budget limit is required'],
    min: [1, 'Limit must be at least 1']
  },
  month: {
    type: Number,  // 0–11
    required: true
  },
  year: {
    type: Number,
    required: true
  }
}, { timestamps: true });

// One budget entry per user/category/month/year
budgetSchema.index({ userId: 1, category: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Budget', budgetSchema);
