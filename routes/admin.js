const express = require("express");
const router = express.Router();
const db = require("../config/db");
const isAdmin = require("../middleware/admin");

// 🔹 GET all products
router.get("/products", isAdmin, (req, res) => {
  db.query("SELECT * FROM menu_items", (err, results) => {
    if (err) return res.status(500).json({ message: "Database error" });
    res.json(results);
  });
});

// 🔹 ADD new product
router.post("/products", isAdmin, (req, res) => {
  const {
    name,
    description,
    price,
    image_url,
    status = "available"
  } = req.body;

  const allowedStatus = ["available", "unavailable"];
  if (!allowedStatus.includes(status)) {
    return res.status(400).json({ message: "Invalid status value" });
  }

  db.query(
    `INSERT INTO menu_items (name, description, price, image_url, status)
     VALUES (?, ?, ?, ?, ?)`,
    [name, description, price, image_url, status],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Database error" });
      }

      res.json({
        message: "Product added successfully",
        id: result.insertId,
        status
      });
    }
  );
});

//Update project status
router.put("/products/:id/status", isAdmin, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const allowedStatus = ["available", "unavailable"];
  if (!allowedStatus.includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  db.query(
    "UPDATE menu_items SET status = ? WHERE id = ?",
    [status, id],
    (err, result) => {
      if (err) return res.status(500).json({ message: "Database error" });
      if (result.affectedRows === 0)
        return res.status(404).json({ message: "Product not found" });

      res.json({ message: `Product marked as ${status}` });
    }
  );
});

// 🔹 DELETE product
router.delete("/products/:id", isAdmin, (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM menu_items WHERE id = ?", [id], (err) => {
    if (err) return res.status(500).json({ message: "Database error" });
    res.json({ message: "Product deleted successfully" });
  });
});

// 🔹 UPDATE product
router.put("/products/:id", isAdmin, (req, res) => {
  const { id } = req.params;
  const { name, description, price, image_url } = req.body;

  db.query(
    "UPDATE menu_items SET name = ?, description = ?, price = ?, image_url = ? WHERE id = ?",
    [name, description, price, image_url, id],
    (err) => {
      if (err) return res.status(500).json({ message: "Database error" });
      res.json({ message: "Product updated successfully" });
    }
  );
});

// 📦 Get all orders with items
router.get("/orders", isAdmin, (req, res) => {
  const query = `
    SELECT 
      o.id AS order_id,
      o.total_price,
      o.status,
      o.created_at,
      u.name AS customer_name,
      u.email AS customer_email,
      JSON_ARRAYAGG(
        JSON_OBJECT(
          'item', m.name,
          'quantity', oi.quantity,
          'price', oi.price
        )
      ) AS items
    FROM orders o
    JOIN users u ON o.user_id = u.id
    JOIN order_items oi ON o.id = oi.order_id
    JOIN menu_items m ON oi.menu_item_id = m.id
    GROUP BY o.id, o.total_price, o.status, o.created_at, u.name, u.email
    ORDER BY o.id DESC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Order query failed:", err);
      return res.status(500).json({ message: "Database error" });
    }
    res.json(results);
  });
});


// 📦 UPDATE order status
router.put("/orders/:id", isAdmin, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const allowedStatuses = [
    "pending",
    "in-progress",
    "completed",
    "cancelled"
  ];

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ message: "Invalid status value" });
  }

  db.query(
    "UPDATE orders SET status=? WHERE id=?",
    [status, id],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Database error" });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Order not found" });
      }

      res.json({ message: "Order updated successfully" });
    }
  );
});


module.exports = router;
