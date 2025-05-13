const validator = require("validator");
const Restaurant = require("../models/restaurant");
const validateCreateRestaurant = async (req) => {
  const { name, image, address, contact } = req.body;

  if (
    !name ||
    typeof name !== "string" ||
    name.trim().length < 2 ||
    name.trim().length > 100
  ) {
    throw new Error("Name must be a string between 2 and 100 characters.");
  }

  if (
    image &&
    !validator.isURL(image, {
      protocols: ["http", "https"],
      require_protocol: true,
    })
  ) {
    throw new Error("Invalid image URL. Must be a valid HTTP/HTTPS URL.");
  }

  if (
    !address ||
    typeof address !== "string" ||
    address.trim().length < 5 ||
    address.trim().length > 200
  ) {
    throw new Error("Address must be a string between 5 and 200 characters.");
  }

  if (
    !contact ||
    !validator.isMobilePhone(contact, "any", { strictMode: false })
  ) {
    throw new Error("Invalid contact number.");
  }

  const existingRestaurant = await Restaurant.findOne({ contact });
  if (existingRestaurant) {
    throw new Error(
      "A restaurant with the same contact number already exists."
    );
  }
};

const validateAdminSignup = (req) => {
  const { name, email, password, role } = req.body;

  if (!name || typeof name !== "string" || name.trim().length < 2) {
    throw new Error("Name must be at least 2 characters long");
  }

  if (!email || !validator.isEmail(email)) {
    throw new Error("A valid email is required");
  }

  if (!password || typeof password !== "string") {
    throw new Error("Password is required");
  }

  if (
    !validator.isStrongPassword(password, {
      minLength: 6,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 0,
    })
  ) {
    throw new Error(
      "Password must contain at least 1 uppercase letter, 1 lowercase letter, and 1 number"
    );
  }
};

module.exports = { validateAdminSignup, validateCreateRestaurant };
