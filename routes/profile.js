const express = require("express");
const db = require("../config/db");
const bcrypt = require("bcryptjs");
const router = express.Router();

/**
 * GET profile (load user data)
 */
router.get("/", (req, res) => {
  const userId = req.session.user.id;

  // First, get user info
  db.query(
    `
    SELECT 
      id, name, email, phone, dob, address,
      language, currency,
      email_notifications, sms_notifications, promo_notifications,
      created_at
    FROM users
    WHERE id = ?
    `,
    [userId],
    (err, results) => {
      if (err) return res.status(500).json({ message: "Database error" });

      const user = results[0];

      if (!user) return res.status(404).json({ message: "User not found" });

      // Second, get total orders and total spent
      db.query(
        `
        SELECT 
          COUNT(*) AS totalOrders,
          COALESCE(SUM(total_price), 0) AS totalSpent
        FROM orders
        WHERE user_id = ?
        `,
        [userId],
        (err2, statsResults) => {
          if (err2) return res.status(500).json({ message: "Database error" });

          const stats = statsResults[0];
          // Merge stats into user object
          const response = { ...user, totalOrders: stats.totalOrders, totalSpent: stats.totalSpent };
          res.json(response);
        }
      );
    }
  );
});

/**
 * UPDATE profile info
 */
router.put("/", (req, res) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ message: "User not logged in" });
  }

  const userId = req.session.user.id;
  const { fullName, email, phone, dob, address } = req.body;
  const dobValue = dob || null;

  db.query(
    `
    UPDATE users
    SET name = ?, email = ?, phone = ?, dob = ?, address = ?
    WHERE id = ?
    `,
    [fullName, email, phone, dobValue, address, userId],
    (err) => {
      if (err) {
        console.error("MySQL error:", err);
        return res.status(500).json({ message: "Update failed" });
      }

      req.session.user.name = fullName;
      req.session.user.email = email;

      res.json({ message: "Profile updated" });
    }
  );
});


/**
 * UPDATE password
 */
router.delete("/delete", (req, res) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ message: "User not logged in" });
  }

  const userId = req.session.user.id;

  // 1. Check user role
  db.query(
    "SELECT role FROM users WHERE id = ?",
    [userId],
    (err, results) => {
      if (err) {
        console.error("MySQL error:", err);
        return res.status(500).json({ message: "Server error" });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }

      // 2. Restrict admin deletion
      if (results[0].role === "admin") {
        return res.status(403).json({
          message: "Admin account cannot be deleted",
        });
      }

      // 3. Delete customer account
      db.query(
        "DELETE FROM users WHERE id = ?",
        [userId],
        (err) => {
          if (err) {
            console.error("MySQL error:", err);
            return res.status(500).json({ message: "Failed to delete account" });
          }

          // 4. Destroy session
          req.session.destroy((err) => {
            if (err) {
              console.error("Session destroy error:", err);
              return res.status(500).json({
                message: "Account deleted but failed to log out",
              });
            }

            res.json({ message: "Account deleted successfully" });
          });
        }
      );
    }
  );
});

/**
 * UPDATE preferences
 */
router.put("/preferences", (req, res) => {
  const userId = req.session.user.id;
  const {
    emailNotifications,
    smsNotifications,
    promoNotifications,
    language,
    currency,
  } = req.body;

  db.query(
    `
    UPDATE users SET
      email_notifications = ?,
      sms_notifications = ?,
      promo_notifications = ?,
      language = ?,
      currency = ?
    WHERE id = ?
    `,
    [
      emailNotifications,
      smsNotifications,
      promoNotifications,
      language,
      currency,
      userId,
    ],
    () => res.json({ message: "Preferences saved" })
  );
});

/**
 * DELETE account
 */
router.delete("/delete", (req, res) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ message: "User not logged in" });
  }

  const userId = req.session.user.id;

  db.query("DELETE FROM users WHERE id = ?", [userId], (err, results) => {
    if (err) {
      console.error("MySQL error:", err);
      return res.status(500).json({ message: "Failed to delete account" });
    }

    // Destroy session after deleting account
    req.session.destroy((err) => {
      if (err) {
        console.error("Session destroy error:", err);
        return res.status(500).json({ message: "Account deleted but failed to log out" });
      }

      res.json({ message: "Account deleted successfully" });
    });
  });
});


module.exports = router;
