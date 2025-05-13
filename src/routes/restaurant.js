const express = require("express");

const restaurantRouter = express.Router();

restaurantRouter.post("/create-restaurant", async (req, res) => {
  try {
    validateCreateRestaurant(req);
    const { name, image, address, contact } = req.body;
  } catch (err) {}
});

module.exports = restaurantRouter;
