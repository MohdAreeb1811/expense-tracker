const mongoose = require('mongoose');
const Expense = require('../models/Expense');
const Budget = require('../models/Budget');
const User = require('../models/User');

exports.index = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.session.userId);
    const user = await User.findById(userId).select('name');
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();
    const start = new Date(year, month, 1);
    const end   = new Date(year, month + 1, 0, 23, 59, 59);

    // ── This month totals ──────────────────────────────────────────────────────
    const [monthlyTotal, categoryBreakdown, last6Months, recentExpenses, budgets] =
      await Promise.all([

        // Total this month
        Expense.aggregate([
          { $match: { userId, date: { $gte: start, $lte: end } } },
          { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
        ]),

        // This month by category
        Expense.aggregate([
          { $match: { userId, date: { $gte: start, $lte: end } } },
          { $group: { _id: '$category', total: { $sum: '$amount' } } },
          { $sort: { total: -1 } }
        ]),

        // Last 6 months trend
        Expense.aggregate([
          {
            $match: {
              userId,
              date: { $gte: new Date(year, month - 5, 1) }
            }
          },
          {
            $group: {
              _id: { year: { $year: '$date' }, month: { $month: '$date' } },
              total: { $sum: '$amount' }
            }
          },
          { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]),

        // 5 most recent expenses
        Expense.find({ userId }).sort({ date: -1 }).limit(5),

        // This month budgets
        Budget.find({ userId, month, year })
      ]);

    // ── Budget vs Spent ────────────────────────────────────────────────────────
    const spentMap = {};
    categoryBreakdown.forEach(c => { spentMap[c._id] = c.total; });

    const budgetAlerts = budgets
      .map(b => ({
        category: b.category,
        limit: b.limit,
        spent: spentMap[b.category] || 0,
        over: (spentMap[b.category] || 0) > b.limit
      }))
      .filter(b => b.spent > 0);

    // ── Chart data ─────────────────────────────────────────────────────────────
    const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

    const trendLabels = last6Months.map(m => MONTH_NAMES[m._id.month - 1]);
    const trendData   = last6Months.map(m => m.total);

    const catLabels = categoryBreakdown.map(c => c._id);
    const catData   = categoryBreakdown.map(c => c.total);

    const totalSpent = monthlyTotal[0]?.total || 0;
    const totalBudget = budgets.reduce((s, b) => s + b.limit, 0);

    res.render('dashboard/index', {
      title: 'Dashboard',
      user,
      totalSpent,
      totalBudget,
      expenseCount: monthlyTotal[0]?.count || 0,
      remaining: Math.max(totalBudget - totalSpent, 0),
      topCategory: categoryBreakdown[0]?._id || 'None',
      recentExpenses,
      budgetAlerts,
      chartData: {
        trend: { labels: trendLabels, data: trendData },
        categories: { labels: catLabels, data: catData }
      },
      month: MONTH_NAMES[month],
      year
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to load dashboard.');
    res.redirect('/expenses');
  }
};
