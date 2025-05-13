const express = require("express");
const { validateAdminSignup } = require("../utils/validation");
const Admin = require("../models/admin");
const adminRouter = express.Router();

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// --- Admin Signup ---
adminRouter.post("/admin/signup", async (req, res) => {
  try {
    validateAdminSignup(req);

    const { name, email, role, password } = req.body;

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(409).json({ error: "Email already exists" });
    }

    // Hash the password before saving
    const passwordHash = await bcrypt.hash(password, 10);

    // Create a new admin
    const newAdmin = new Admin({
      name,
      email,
      role,
      password: passwordHash,
    });

    const savedAdmin = await newAdmin.save();

    // Generate JWT token
    const token = await savedAdmin.getJWT();

    // Set cookie with token and ensure it's secure
    res
      .cookie("token", token, {
        expires: new Date(Date.now() + 8 * 3600000), // Cookie expiration time (same as JWT)
      })
      .status(200)
      .json({
        message: "Signup successful",
        token,
        admin: {
          id: savedAdmin._id,
          name: savedAdmin.name,
          email: savedAdmin.email,
          role: savedAdmin.role,
        },
      });
  } catch (err) {
    console.error(err); // Log the error for debugging
    res.status(400).json({ error: err.message || "Something went wrong" });
  }
});

// --- Admin Login ---
adminRouter.post("/admin/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find admin by email
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(400).json({ error: "Admin not found" });
    }

    // Validate password
    const isPasswordValid = await admin.validatePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate JWT token
    const token = await admin.getJWT();

    // Set cookie with token
    res
      .cookie("token", token, {
        expires: new Date(Date.now() + 8 * 3600000), // Cookie expiration time (same as JWT)
      })
      .status(200)
      .json({
        message: "Login successful",
        token,
        admin: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
        },
      });
  } catch (err) {
    console.error(err); // Log the error for debugging
    res.status(500).json({ error: err.message || "Login failed" });
  }
});

adminRouter.post("/logout", async (req, res) => {
  try {
    res.cookie("token", null, { expires: new Date(Date.now()) });
    res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message || "Logout failed",
    });
  }
});

module.exports = adminRouter;
