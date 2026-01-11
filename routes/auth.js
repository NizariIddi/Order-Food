const express = require("express");
const bcrypt = require("bcryptjs");
const db = require("../config/db"); // MySQL connection
const crypto = require("crypto");
const transporter = require("../config/nodemailer"); // Nodemailer transporter
const router = express.Router();

// REGISTER
router.post("/register", async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    db.query(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
      [name, email, hashedPassword, role || "customer"],
      (err, result) => {
        if (err) return res.status(500).json({ message: "Database error" });

        res.json({ message: "User registered successfully" });
      }
    );
  } catch (error) {
    res.status(500).json({ message: "Error registering user" });
  }
});

// LOGIN
router.post("/login", (req, res) => {
  const { email, password, remember } = req.body;

  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
    if (err) return res.status(500).json({ message: "Database error" });
    if (results.length === 0) return res.status(400).json({ message: "Invalid email or password" });

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });

    // Save user session
    req.session.user = { id: user.id, name: user.name, email: user.email, role: user.role };

    if (remember) {
      console.log("Setting long-lived cookie");
      req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
    } else {
      req.session.cookie.expires = false; // session cookie
    }

    // Redirect based on role
    if (user.role === "admin") {
      res.json({ message: "Login successful", redirect: "/admin" });
    } else {
      res.json({ message: "Login successful", redirect: "/menu" });
    }
  });
});


// LOGOUT
router.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ message: "Logged out successfully" });
  });
});

// TEMPORARY: Get all users (for debugging)
router.get("/all-users", (req, res) => {
  db.query("SELECT id, name, email, role FROM users", (err, results) => {
    if (err) return res.status(500).json({ message: "Database error" });
    res.json(results);
  });
});


router.post("/forgot-password", (req, res) => {
  const { email } = req.body;

  db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
    if(err) return res.status(500).json({ message: "Server error" });

    if(results.length === 0) {
      return res.status(400).json({message: "If email exists, a reset link will be sent."})
    }

    const token = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const expires = new Date(Date.now() + 60 * 60 * 1000); //1hr

    db.query(
      "UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE email = ?", [hashedToken, expires, email], 
      () => {
        const resetLink = `https://0a2e8153d859d4.lhr.life/reset-password/${token}`;

        transporter.sendMail({
  from: `"Food Ordering Support" <${process.env.EMAIL_USER}>`,
  to: email,
  subject: "Reset Your Password – Food Ordering",
  html: `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 60px 20px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto;">
        <tr>
          <td>
            <!-- Main Container -->
            <div style="background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
              
              <!-- Header with Gradient -->
              <div style="background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); padding: 40px 32px; text-align: center;">
                <div style="background: rgba(255,255,255,0.2); width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(10px);">
                  <span style="font-size: 48px;">🍔</span>
                </div>
                <h1 style="margin: 0; font-size: 32px; color: #ffffff; font-weight: 700; letter-spacing: -0.5px;">
                  Food Ordering
                </h1>
                <p style="margin: 12px 0 0; color: rgba(255,255,255,0.9); font-size: 16px; font-weight: 500;">
                  Password Reset Request
                </p>
              </div>

              <!-- Content -->
              <div style="padding: 48px 32px;">
                <p style="margin: 0 0 24px; color: #1f2937; font-size: 18px; line-height: 1.6;">
                  Hello there! 👋
                </p>

                <p style="margin: 0 0 24px; color: #4b5563; font-size: 16px; line-height: 1.7;">
                  We received a request to reset your password for your <strong style="color: #16a34a;">Food Ordering</strong> account. Don't worry – we've got you covered!
                </p>

                <p style="margin: 0 0 32px; color: #4b5563; font-size: 16px; line-height: 1.7;">
                  Click the button below to create a new password and get back to enjoying delicious meals:
                </p>

                <!-- CTA Button with Hover Effect -->
                <div style="text-align: center; margin: 40px 0;">
                  <a href="${resetLink}" 
                     style="background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); 
                            color: #ffffff; 
                            padding: 18px 48px; 
                            text-decoration: none; 
                            border-radius: 50px; 
                            font-weight: 700; 
                            font-size: 16px; 
                            display: inline-block; 
                            box-shadow: 0 10px 30px rgba(22, 163, 74, 0.4);
                            letter-spacing: 0.5px;
                            transition: all 0.3s ease;">
                    🔐 Reset My Password
                  </a>
                </div>

                <!-- Info Box -->
                <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); 
                            border-left: 4px solid #f59e0b; 
                            padding: 20px 24px; 
                            border-radius: 8px; 
                            margin: 32px 0;">
                  <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6;">
                    ⏰ <strong>Important:</strong> This reset link expires in <strong>1 hour</strong> for your security.
                  </p>
                </div>

                <p style="margin: 32px 0 0; color: #6b7280; font-size: 15px; line-height: 1.7;">
                  If you didn't request this password reset, you can safely ignore this email. Your account remains secure and no changes will be made.
                </p>

                <!-- Divider -->
                <div style="height: 1px; background: linear-gradient(90deg, transparent, #e5e7eb, transparent); margin: 40px 0;"></div>

                <p style="margin: 0; color: #1f2937; font-size: 16px;">
                  Cheers,<br />
                  <strong style="color: #16a34a; font-size: 17px;">The Food Ordering Team</strong>
                </p>
              </div>

              <!-- Footer -->
              <div style="background: #f9fafb; padding: 32px; text-align: center; border-top: 1px solid #e5e7eb;">
                <p style="margin: 0 0 16px; color: #9ca3af; font-size: 13px;">
                  © ${new Date().getFullYear()} Food Ordering. All rights reserved.
                </p>
                <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                  Made with ❤️ for food lovers everywhere
                </p>
              </div>

            </div>

            <!-- Alternative Link -->
            <p style="text-align: center; margin-top: 24px; color: #ffffff; font-size: 13px;">
              Having trouble with the button? Copy and paste this link into your browser:<br />
              <a href="${resetLink}" style="color: #fde68a; word-break: break-all;">${resetLink}</a>
            </p>

          </td>
        </tr>
      </table>
    </div>
  </body>
  </html>
  `,
});
        res.json({ message: "If email exists, a reset link sent." });
      }
    )
  })
})

router.post('/reset-password/:token', (req, res) => {
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

    db.query("SELECT * FROM users WHERE reset_token = ? AND reset_token_expires > NOW()",[hashedToken], async (err, results) => {
      if(err || results.length === 0) {
        return res.status(400).json({message: "Invalid or expired token"});
      }

      const hashedPassword = await bcrypt.hash(req.body.password, 10);

      db.query(
        "UPDATE users SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?",
        [hashedPassword, results[0].id],
        () => res.json({ message: "Password updated successfully" })
      );

    })
})
module.exports = router;
