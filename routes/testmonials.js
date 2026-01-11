const express = require("express")
const db = require('../config/db')
const router = express.Router()

// GET all public testmonials
router.get('/', (req, res) => {
    const sql = `
        SELECT u.name,
        f.rating,
        f.feedback
        FROM feedback f
        JOIN users u ON f.user_id = u.id
        WHERE f.rating >= 3
        ORDER BY f.created_at DESC
        LIMIT 4
    `;

    db.query(sql, (error, results) => {
        if(error) {
            console.error("Testimonials error:", error);
            return res.status(500).json({message: "Server error"});
        }

        res.json(results);
    });
});

module.exports = router;