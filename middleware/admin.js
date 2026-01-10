// middleware/admin.js
function isAdmin(req, res, next) {
  if (req.session && req.session.user && req.session.user.role === "admin") {
    next();
  } else {
    res.status(403).send("Forbidden: Admins only");
  }
}

module.exports = isAdmin;
