// utils/resetPin.js
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";

const RESET_JWT_SECRET = process.env.RESET_JWT_SECRET || "your-reset-secret-key";

/* ---------- TOKEN ---------- */

// Generate reset token (15 min)
export const generateResetPinToken = (payload) => {
  return jwt.sign(payload, RESET_JWT_SECRET, { expiresIn: "15m" });
};

// Verify reset token
export const verifyResetPinToken = (token) => {
  return jwt.verify(token, RESET_JWT_SECRET);
};

/* ---------- MAIL ---------- */

// ✅ create transporter at runtime (IMPORTANT FIX)
const createTransporter = () => {
  if (!process.env.MAIL_USER || !process.env.MAIL_PASS) {
    throw new Error("Mail credentials missing in environment variables");
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });
};

// Send reset PIN email
export const sendResetPinEmail = async ({ to, resetPin, userName }) => {
  console.log("MAIL_USER:", process.env.MAIL_USER);
  console.log("MAIL_PASS:", process.env.MAIL_PASS ? "OK" : "MISSING");

  const transporter = createTransporter(); // ✅ created here

  const mailOptions = {
    from: process.env.MAIL_USER,
    to,
    subject: "Your Reset PIN - Valid for 15 Minutes",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Reset Your PIN</h2>
        <p>Hello ${userName},</p>
        <p>Your 6-digit reset PIN is:</p>
        <div style="background: #f4f4f4; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
          ${resetPin}
        </div>
        <p><strong>This PIN expires in 15 minutes.</strong></p>
        <p>Enter this PIN along with your new PIN to reset your account.</p>
        <hr style="margin: 30px 0;">
        <p>If you didn't request this, please ignore this email.</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Reset PIN email sent:", info.response);
  } catch (error) {
    console.error("❌ Mail send error:", error);
    throw new Error("Failed to send reset PIN email");
  }
};