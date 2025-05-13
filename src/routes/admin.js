const express = require("express");
const { validateAdminSignup } = require("../utils/validation");
const Admin = require("../models/admin");
const ChefWaiter = require("../models/chefWaiter");
const adminRouter = express.Router();
const Category = require("../models/catetgory");
const Item = require("../models/item");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { authAdmin } = require("../middlewares/auth");
const Restaurant = require("../models/restaurant");

// --- Admin Signup ---
adminRouter.post("/admin/signup", async (req, res) => {
  try {
    validateAdminSignup(req);

    const { name, email, password } = req.body;

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
      role: "admin",
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

adminRouter.post("/admin/logout", async (req, res) => {
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

adminRouter.post(
  "/admin/create-chef-waiter",
  authAdmin, // Middleware for authentication
  async (req, res) => {
    try {
      // Destructure the data sent in the request body
      const { name, email, password, role, restaurantId } = req.body;

      // Validate input
      if (!name || !email || !password || !role || !restaurantId) {
        return res.status(400).json({ message: "All fields are required." });
      }

      // Check if the chef/waiter already exists
      const existingChefWaiter = await ChefWaiter.findOne({ email });
      if (existingChefWaiter) {
        return res
          .status(400)
          .json({ message: `${role} already exists with this email.` });
      }

      // Hash password securely
      const passwordHash = await bcrypt.hash(password, 10);

      // Create new ChefWaiter instance
      const newChefWaiter = new ChefWaiter({
        name,
        email,
        password: passwordHash,
        role,
        restaurantId,
        adminId: req.admin._id, // Use the authenticated admin's ID
      });

      // Save new chef/waiter to the database
      const savedChefWaiter = await newChefWaiter.save();

      // Generate JWT token for the chef/waiter
      const chefWaiterToken = await savedChefWaiter.getJWT();

      // Respond with success message and the chef/waiter's data
      res
        .cookie("chefWaiter_token", chefWaiterToken, {
          httpOnly: true, // Security measure to prevent client-side JS from accessing the cookie
          expires: new Date(Date.now() + 8 * 3600000), // Cookie expiration (8 hours)
        })
        .status(201)
        .json({
          message: `${savedChefWaiter.role} created successfully.`,
          chefWaiterToken,
          chefWaiter: {
            id: savedChefWaiter._id,
            name: savedChefWaiter.name,
            email: savedChefWaiter.email,
            role: savedChefWaiter.role,
            restaurantId: savedChefWaiter.restaurantId,
            adminId: savedChefWaiter.adminId,
          },
        });
    } catch (err) {
      console.error("Error creating chef/waiter:", err); // Log error for debugging
      res.status(500).json({ error: err.message || "Something went wrong" });
    }
  }
);

adminRouter.post("/admin/add-categories", authAdmin, async (req, res) => {
  try {
    const admin = req.admin;
    const { name, description, image, restaurantId } = req.body;

    const category = new Category({
      name,
      description,
      image,
      restaurantId,
    });

    const savedCategory = await category.save();
    res.status(200).json({
      message: "category added successfully",
      category: {
        id: savedCategory._id,
        name: savedCategory.name,
        description: savedCategory.description,
        image: savedCategory.image,
        restaurantId: savedCategory.restaurantId,
        adminId: admin.id,
      },
    });
  } catch (err) {
    res.status(400).json({
      message: "something went wrong " + err.message,
    });
  }
});

adminRouter.post("/admin/add-items", authAdmin, async (req, res) => {
  try {
    const admin = req.admin;
    const { name, description, price, image, restaurantId, categoryId } =
      req.body;

    // API-Level Validation
    if (!name || name.trim() === "") {
      return res.status(400).json({ message: "Item name is required" });
    }
    if (name.length < 2 || name.length > 100) {
      return res
        .status(400)
        .json({ message: "Item name must be between 2 and 100 characters" });
    }
    if (!price || price <= 0) {
      return res
        .status(400)
        .json({ message: "Price must be a positive number" });
    }
    if (!restaurantId) {
      return res.status(400).json({ message: "Restaurant ID is required" });
    }
    if (!categoryId) {
      return res.status(400).json({ message: "Category ID is required" });
    }
    if (image && !validator.isURL(image)) {
      return res
        .status(400)
        .json({ message: "Please enter a valid image URL" });
    }

    // Validate that the restaurant exists
    const restaurantExists = await Restaurant.findById(restaurantId);
    if (!restaurantExists) {
      return res.status(400).json({ message: "Restaurant not found" });
    }

    // Validate that the category exists
    const categoryExists = await Category.findById(categoryId);
    if (!categoryExists) {
      return res.status(400).json({ message: "Category not found" });
    }

    // Create the item
    const item = new Item({
      name,
      description,
      price,
      image,
      restaurantId,
      categoryId,
    });

    const savedItem = await item.save();

    res.status(200).json({
      message: "Item added successfully",
      item: {
        name: savedItem.name,
        description: savedItem.description,
        price: savedItem.price,
        image: savedItem.image,
        restaurantId: savedItem.restaurantId,
        categoryId: savedItem.categoryId,
        adminId: admin.id,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Something went wrong: " + err.message,
    });
  }
});

module.exports = adminRouter;
