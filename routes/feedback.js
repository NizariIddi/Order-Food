const express = require("express");
const router = express.Router();
const db = require("../config/db"); // your MySQL connection

router.post("/", async (req, res) => {
  try {
    const { rating, feedback } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Invalid rating value" });
    }

    // If you have authentication middleware
    const userId = req.session.user ? req.session.user.id : null;
    console.log(userId)

    const sql = `
      INSERT INTO feedback (user_id, rating, feedback)
      VALUES (?, ?, ?)
    `;

    await db.execute(sql, [userId, rating, feedback]);

    res.status(201).json({ message: "Feedback submitted successfully" });

  } catch (err) {
    console.error("Feedback error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
