const isAuthenticated = (req, res, next) => {
  if (req.session.userId) return next();
  req.flash('error', 'Please log in to continue.');
  res.redirect('/auth/login');
};

const isGuest = (req, res, next) => {
  if (!req.session.userId) return next();
  res.redirect('/dashboard');
};

module.exports = { isAuthenticated, isGuest };
