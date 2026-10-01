const mongoose = require('mongoose');
const Expense = require('../models/Expense');
const { CATEGORIES } = require('../models/Expense');
const { validationResult } = require('express-validator');

// GET /expenses
exports.index = async (req, res) => {
  try {
    const { category, from, to, page = 1 } = req.query;
    const limit = 10;
    const skip = (page - 1) * limit;

    const filter = { userId: req.session.userId };
    if (category) filter.category = category;
    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = new Date(from);
      if (to)   filter.date.$lte = new Date(to + 'T23:59:59');
    }

    const [expenses, total] = await Promise.all([
      Expense.find(filter).sort({ date: -1 }).skip(skip).limit(limit),
      Expense.countDocuments(filter)
    ]);

    const totalAmount = await Expense.aggregate([
      { $match: { ...filter, userId: new mongoose.Types.ObjectId(req.session.userId) } },
      { $group: { _id: null, sum: { $sum: '$amount' } } }
    ]);

    res.render('expenses/index', {
      title: 'My Expenses',
      expenses,
      categories: CATEGORIES,
      query: req.query,
      currentPage: +page,
      totalPages: Math.ceil(total / limit),
      totalCount: total,
      totalAmount: totalAmount[0]?.sum || 0
    });
  } catch (err) {
    req.flash('error', 'Failed to load expenses.');
    res.redirect('/dashboard');
  }
};

// GET /expenses/new
exports.newForm = (req, res) => {
  res.render('expenses/form', {
    title: 'Add Expense',
    expense: null,
    categories: CATEGORIES
  });
};

// POST /expenses
exports.create = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash('error', errors.array().map(e => e.msg).join(', '));
    return res.redirect('/expenses/new');
  }
  try {
    const { amount, category, date, description, paymentMethod } = req.body;
    await Expense.create({ amount, category, date, description, paymentMethod, userId: req.session.userId });
    req.flash('success', 'Expense added successfully!');
    res.redirect('/expenses');
  } catch (err) {
    req.flash('error', 'Failed to add expense.');
    res.redirect('/expenses/new');
  }
};

// GET /expenses/:id/edit
exports.editForm = async (req, res) => {
  try {
    const expense = await Expense.findOne({ _id: req.params.id, userId: req.session.userId });
    if (!expense) { req.flash('error', 'Expense not found.'); return res.redirect('/expenses'); }
    res.render('expenses/form', { title: 'Edit Expense', expense, categories: CATEGORIES });
  } catch {
    res.redirect('/expenses');
  }
};

// PUT /expenses/:id
exports.update = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash('error', errors.array().map(e => e.msg).join(', '));
    return res.redirect(`/expenses/${req.params.id}/edit`);
  }
  try {
    const { amount, category, date, description, paymentMethod } = req.body;
    await Expense.findOneAndUpdate(
      { _id: req.params.id, userId: req.session.userId },
      { amount, category, date, description, paymentMethod },
      { runValidators: true }
    );
    req.flash('success', 'Expense updated!');
    res.redirect('/expenses');
  } catch (err) {
    req.flash('error', 'Failed to update expense.');
    res.redirect('/expenses');
  }
};

// DELETE /expenses/:id
exports.delete = async (req, res) => {
  try {
    await Expense.findOneAndDelete({ _id: req.params.id, userId: req.session.userId });
    req.flash('success', 'Expense deleted.');
    res.redirect('/expenses');
  } catch {
    req.flash('error', 'Failed to delete expense.');
    res.redirect('/expenses');
  }
};
