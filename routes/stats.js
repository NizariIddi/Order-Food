const express = require("express");
const router = express.Router();
const db = require('../config/db')

router.get("/", (req, res) => {
  db.query("SELECT COUNT(*) AS count FROM menu_items", (err, dishes) => {
    if (err) return res.status(500).json({ message: "DB error" });

    db.query("SELECT COUNT(*) AS count FROM users", (err, customers) => {
      if (err) return res.status(500).json({ message: "DB error" });

      db.query("SELECT AVG(rating) AS avgRating FROM feedback", (err, rating) => {
        if (err) return res.status(500).json({ message: "DB error" });

        res.json({
          dishes: dishes[0].count,
          customers: customers[0].count,
          rating: parseFloat(rating[0].avgRating).toFixed(1)
        });
      });
    });
  });
});


module.exports = router;