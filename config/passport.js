const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const db = require("./db"); // your MySQL connection

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => {
  db.query("SELECT * FROM users WHERE id = ?", [id], (err, results) => {
    if (err) return done(err);
    done(null, results[0]);
  });
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "https://0a2e8153d859d4.lhr.life/auth/google/callback",

    },
    (accessToken, refreshToken, profile, done) => {
      const email = profile.emails[0].value;
      const name = profile.displayName;

      // Check if user exists
      db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
        if (err) return done(err);

        if (results.length > 0) {
          // User exists
          return done(null, results[0]);
        } else {
          // Create new user
          db.query(
            "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
            [name, email, "GOOGLE_AUTH", "customer"],
            (err, result) => {
              if (err) return done(err);
              db.query("SELECT * FROM users WHERE id = ?", [result.insertId], (err, newUser) => {
                return done(err, newUser[0]);
              });
            }
          );
        }
      });
    }
  )
);

module.exports = passport;
