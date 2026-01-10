const express = require("express");
const router = express.Router();
const db = require("../config/db");

// Get all menu items
router.get("/", (req, res) => {
  db.query("SELECT * FROM menu_items", (err, results) => {
    if (err) return res.status(500).json({ message: "Database error" });
    res.json(results);
  });
});

module.exports = router;
