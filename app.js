const express = require("express");
const session = require("express-session");
const path = require("path");
const bcrypt = require("bcryptjs");
const passport = require("passport"); // added for Google OAuth
require("dotenv").config(); // optional, for storing credentials
const authRoutes = require("./routes/auth");
const isLoggedIn = require("./middleware/auth");
const menuRoutes = require("./routes/menu");
const orderRoutes = require("./routes/orders");
const adminRoutes = require("./routes/admin");
const redirectIfLoggedIn = require("./middleware/redirectIfLoggedIn");
const app = express();

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session (must come BEFORE routes)
app.use(
  session({
    secret: "supersecret",
    resave: false,
    saveUninitialized: true,
    cookie: {
      // default settings, will be overridden per login if "remember me" is checked
      httpOnly: true,
      secure: false, // set true if using HTTPS
      sameSite: "lax",
    },
  })
);

// Passport initialization for Google OAuth
app.use(passport.initialize());
app.use(passport.session());

// Load Passport Google Strategy
require("./config/passport"); // see previous step for this file

// Static files
app.use(express.static("public"));
app.use("/images", express.static("images"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);

// Google OAuth routes
app.get(
  "/auth/google",
  (req, res, next) => {
    // Optional: force remember-me for OAuth
    req.session.rememberMe = true;
    next();
  },
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    // Save user to your custom session
    req.session.user = {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    };

    // ✅ REMEMBER ME LOGIC APPLIED HERE
    if (req.session.rememberMe) {
      req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
    } else {
      req.session.cookie.expires = false;
    }

    delete req.session.rememberMe;

    res.redirect(req.user.role === "admin" ? "/admin" : "/menu");
  }
);


// HTML pages
app.get("/", (req, res) => {
  if (req.session && req.session.user) {
    return res.redirect(
      req.session.user.role === "admin" ? "/admin" : "/menu"
    );
  }

  res.sendFile(path.join(__dirname, "views/index.html"));
});
app.get("/login", redirectIfLoggedIn, (req, res) => res.sendFile(path.join(__dirname, "views/login.html")));
app.get("/register", redirectIfLoggedIn, (req, res) => res.sendFile(path.join(__dirname, "views/register.html")));

// Admin Orders Page (frontend)
app.get("/admin/orders", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "admin-orders.html"));
});

app.get("/menu", isLoggedIn, (req, res) => {
  res.sendFile(path.join(__dirname, "views/menu.html"));
});

app.get("/orders", isLoggedIn, (req, res) => {
  res.sendFile(path.join(__dirname, "views/orders.html"));
});

app.get("/forgot-password", (req, res) => {
  res.sendFile(path.join(__dirname, "views/forgot-password.html"));
});

app.get("/reset-password/:token", (req, res) => {
  res.sendFile(path.join(__dirname, "views/reset-password.html"));
});

app.get("/admin", (req, res) => {
  if (!req.session.user || req.session.user.role !== "admin") {
    return res.status(403).send("Forbidden: Admins only");
  }
  res.sendFile(path.join(__dirname, "views/admin.html"));
});

// Server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
