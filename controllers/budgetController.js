const mongoose = require('mongoose');
const Budget = require('../models/Budget');
const Expense = require('../models/Expense');
const { CATEGORIES } = require('../models/Expense');

// GET /budgets
exports.index = async (req, res) => {
  try {
    const now = new Date();
    const month = parseInt(req.query.month ?? now.getMonth());
    const year  = parseInt(req.query.year  ?? now.getFullYear());
    const uid   = new mongoose.Types.ObjectId(req.session.userId);

    const budgets = await Budget.find({ userId: req.session.userId, month, year });

    // Aggregate actual spending for that month
    const start = new Date(year, month, 1);
    const end   = new Date(year, month + 1, 0, 23, 59, 59);

    const spent = await Expense.aggregate([
      { $match: { userId: uid, date: { $gte: start, $lte: end } } },
      { $group: { _id: '$category', total: { $sum: '$amount' } } }
    ]);

    const spentMap = {};
    spent.forEach(s => { spentMap[s._id] = s.total; });

    const budgetData = CATEGORIES.map(cat => {
      const b = budgets.find(b => b.category === cat);
      const s = spentMap[cat] || 0;
      return {
        category: cat,
        limit: b ? b.limit : null,
        spent: s,
        budgetId: b ? b._id : null,
        percentage: b ? Math.min(Math.round((s / b.limit) * 100), 100) : null,
        over: b ? s > b.limit : false
      };
    });

    res.render('budgets/index', {
      title: 'Budget Manager',
      budgetData,
      categories: CATEGORIES,
      month, year,
      months: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
    });
  } catch (err) {
    req.flash('error', 'Failed to load budgets.');
    res.redirect('/dashboard');
  }
};

// POST /budgets
exports.upsert = async (req, res) => {
  try {
    const { category, limit, month, year } = req.body;
    await Budget.findOneAndUpdate(
      { userId: req.session.userId, category, month: +month, year: +year },
      { limit: +limit },
      { upsert: true, runValidators: true }
    );
    req.flash('success', `Budget set for ${category}.`);
    res.redirect(`/budgets?month=${month}&year=${year}`);
  } catch (err) {
    req.flash('error', 'Failed to save budget.');
    res.redirect('/budgets');
  }
};

// DELETE /budgets/:id
exports.delete = async (req, res) => {
  const { month, year } = req.query;
  try {
    await Budget.findOneAndDelete({ _id: req.params.id, userId: req.session.userId });
    req.flash('success', 'Budget removed.');
    res.redirect(`/budgets?month=${month}&year=${year}`);
  } catch {
    req.flash('error', 'Failed to delete budget.');
    res.redirect('/budgets');
  }
};
