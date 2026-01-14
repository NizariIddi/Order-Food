const express = require("express");
const router = express.Router();
const db = require("../config/db");

// Middleware to check logged-in user
function isLoggedIn(req, res, next) {
  if (req.session && req.session.user) next();
  else res.status(401).json({ message: "Unauthorized" });
}

/* ================= CREATE ORDER ================= */
router.post("/", isLoggedIn, (req, res) => {
  const userId = req.session.user.id;
  const { items } = req.body; // [{menu_item_id, quantity, price}, ...]

  if (!items || items.length === 0)
    return res.status(400).json({ message: "No items provided" });

  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  db.query(
    "INSERT INTO orders (user_id, total_price) VALUES (?, ?)",
    [userId, totalPrice],
    (err, result) => {
      if (err) return res.status(500).json({ message: "Database error" });

      const orderId = result.insertId;

      const orderItems = items.map(item => [orderId, item.menu_item_id, item.quantity, item.price]);

      db.query(
        "INSERT INTO order_items (order_id, menu_item_id, quantity, price) VALUES ?",
        [orderItems],
        (err2) => {
          if (err2) return res.status(500).json({ message: "Database error" });

          res.json({ message: "Order placed successfully", orderId });
        }
      );
    }
  );
});

/* ================= GET USER ORDERS ================= */
router.get("/", isLoggedIn, (req, res) => {
  const userId = req.session.user.id;

  const query = `
    SELECT 
      o.id,
      o.total_price,
      o.status,
      o.created_at,
      JSON_ARRAYAGG(
        JSON_OBJECT(
          'name', m.name,
          'quantity', oi.quantity,
          'price', oi.price
        )
      ) AS items
    FROM orders o
    LEFT JOIN order_items oi ON o.id = oi.order_id
    LEFT JOIN menu_items m ON oi.menu_item_id = m.id
    WHERE o.user_id = ?
    GROUP BY o.id, o.total_price, o.status, o.created_at
    ORDER BY o.created_at DESC
  `;

  db.query(query, [userId], (err, results) => {
    if (err) return res.status(500).json({ message: "Database error" });

    results.forEach(order => {
      if (typeof order.items === "string") {
        order.items = JSON.parse(order.items);
      } else if (!Array.isArray(order.items)) {
        order.items = [];
      }
    });

    res.json(results);
  });
});

/* ================= CANCEL / DELETE ORDER ================= */
router.delete("/:id", isLoggedIn, (req, res) => {
  const userId = req.session.user.id;
  const orderId = parseInt(req.params.id);

  db.query(
    "SELECT status FROM orders WHERE id = ? AND user_id = ?",
    [orderId, userId],
    (err, results) => {
      if (err) return res.status(500).json({ message: "Database error" });
      if (!results.length) return res.status(404).json({ message: "Order not found" });

      const status = results[0].status;

      // ❌ In-progress → no action allowed
      if (status === "in-progress") {
        return res.status(400).json({
          message: "Order is being prepared and cannot be modified"
        });
      }

      // ✅ Pending → cancel order
      if (status === "pending") {
        db.query(
          "UPDATE orders SET status = 'cancelled' WHERE id = ?",
          [orderId],
          (err) => {
            if (err) return res.status(500).json({ message: "Database error" });
            return res.json({ message: "Order cancelled successfully" });
          }
        );
        return;
      }

      // ✅ Completed→ delete order
      if (status === "completed") {
        db.query(
          "DELETE FROM orders WHERE id = ?",
          [orderId],
          (err) => {
            if (err) return res.status(500).json({ message: "Database error" });
            return res.json({ message: "Order permanently deleted" });
          }
        );
        return;
      }

      // Cancelled → delete order
      if (status === "cancelled") {
        db.query(
          "DELETE FROM orders WHERE id = ?",
          [orderId],
          (err) => {
            if (err) return res.status(500).json({ message: "Database error" });
            return res.json({ message: "Order permanently deleted" });
          }
        );
        return;
      }

      // Fallback safety
      res.status(400).json({ message: "Invalid order state" });
    }
  );
});
module.exports = router;
