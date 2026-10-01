const User = require('../models/User');
const { validationResult } = require('express-validator');

// GET /auth/register
exports.getRegister = (req, res) => {
  res.render('auth/register', { title: 'Create Account' });
};

// POST /auth/register
exports.postRegister = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash('error', errors.array().map(e => e.msg).join(', '));
    return res.redirect('/auth/register');
  }

  try {
    const { name, email, password } = req.body;
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) {
      req.flash('error', 'An account with this email already exists.');
      return res.redirect('/auth/register');
    }
    const user = await User.create({ name, email, passwordHash: password });
    req.session.userId = user._id;
    req.flash('success', `Welcome, ${user.name}! Your account is ready.`);
    res.redirect('/dashboard');
  } catch (err) {
    req.flash('error', 'Registration failed. Please try again.');
    res.redirect('/auth/register');
  }
};

// GET /auth/login
exports.getLogin = (req, res) => {
  res.render('auth/login', { title: 'Sign In', query: req.query });
};

// POST /auth/login
exports.postLogin = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash('error', errors.array().map(e => e.msg).join(', '));
    return res.redirect('/auth/login');
  }

  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !(await user.comparePassword(password))) {
      req.flash('error', 'Invalid email or password.');
      return res.redirect('/auth/login');
    }
    req.session.userId = user._id;
    req.flash('success', `Welcome back, ${user.name}!`);
    res.redirect('/dashboard');
  } catch (err) {
    req.flash('error', 'Login failed. Please try again.');
    res.redirect('/auth/login');
  }
};

// POST /auth/logout
exports.logout = (req, res) => {
  req.session.destroy(() => res.redirect('/auth/login?loggedOut=1'));
};
