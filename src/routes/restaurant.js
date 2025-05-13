const express = require("express");
const { authAdmin } = require("../middlewares/auth");
const Restaurant = require("../models/restaurant");
const { validateCreateRestaurant } = require("../utils/validation");

const restaurantRouter = express.Router();

restaurantRouter.post("/create-restaurant", authAdmin, async (req, res) => {
  try {
    // Validate request body
    await validateCreateRestaurant(req);

    const { name, image, address, contact } = req.body;

    // Use the authenticated admin's ID
    const ownerId = req.admin._id;
    const qrcodeId = ownerId;

    const restaurant = new Restaurant({
      name,
      image,
      address,
      contact,
      ownerId,
      qrcodeId, // IMPORTANT: Use the correct field name (matches schema)
    });

    const newRestaurant = await restaurant.save();

    res.status(201).json({
      message: "Restaurant created successfully",
      restaurant: {
        id: newRestaurant._id,
        name: newRestaurant.name,
        image: newRestaurant.image,
        address: newRestaurant.address,
        contact: newRestaurant.contact,
        ownerId: newRestaurant.ownerId,
        qrcodeId: newRestaurant.qrcodeId,
      },
    });
  } catch (err) {
    console.error("Error creating restaurant:", err.message);
    res.status(400).json({ error: err.message || "Something went wrong" });
  }
});

module.exports = restaurantRouter;
