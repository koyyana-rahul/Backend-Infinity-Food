const express = require("express");
const ChefWaiter = require("../models/chefWaiter");

const chefWaiterRouter = express.Router();

chefWaiterRouter.post("/chef-waiter/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // ✅ Include password explicitly
    const chefWaiter = await ChefWaiter.findOne({ email }).select("+password");

    if (!chefWaiter) {
      return res.status(404).json({ message: "User not found" });
    }

    const isPasswordValid = await chefWaiter.validatePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const chefWaiterToken = await chefWaiter.getJWT();

    res
      .cookie("chefWaiter_token", chefWaiterToken, {
        httpOnly: true,
        expires: new Date(Date.now() + 8 * 3600000),
      })
      .status(200)
      .json({
        message: "Chef/Waiter login successful",
        chefWaiterToken,
        chefWaiter: {
          id: chefWaiter._id,
          name: chefWaiter.name,
          email: chefWaiter.email,
          role: chefWaiter.role,
          restaurnatId: chefWaiter.restaurantId,
          adminId: chefWaiter.adminId,
        },
      });
  } catch (err) {
    console.error("Login error:", err);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: err.message });
  }
});

chefWaiterRouter.post("/chef-waiter/logout", async (req, res) => {
  try {
    res.cookie("chefWaiter_token", null, {
      httpOnly: true, // Prevent JS access
      expires: new Date(Date.now()), // Expire the cookie immediately
    });

    res.status(200).json({
      message: "Chef/Waiter logged out successfully",
    });
  } catch (err) {
    res.status(400).json({ message: "Logout failed", error: err.message });
  }
});

module.exports = chefWaiterRouter;
