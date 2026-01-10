module.exports = function redirectIfLoggedIn(req, res, next) {
  if (req.session && req.session.user) {
    // User already logged in
    if (req.session.user.role === "admin") {
      return res.redirect("/admin");
    }
    return res.redirect("/menu");
  }
  next();
};
