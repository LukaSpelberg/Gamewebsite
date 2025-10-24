// Authentication middleware
const requireAuth = (req, res, next) => {
  if (req.session && req.session.userId) {
    return next();
  } else {
    req.flash('error', 'Please log in to access this page');
    return res.redirect('/admin/login');
  }
};

// Redirect if already logged in
const redirectIfLoggedIn = (req, res, next) => {
  if (req.session && req.session.userId) {
    return res.redirect('/admin');
  }
  return next();
};

// Make user available to all templates
const makeUserAvailable = (req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.isLoggedIn = !!(req.session && req.session.userId);
  next();
};

module.exports = {
  requireAuth,
  redirectIfLoggedIn,
  makeUserAvailable
};

