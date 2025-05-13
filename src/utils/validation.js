const validator = require("validator");

const validateCreateRestaurant = (req) => {
     const {name, image, address, admin} = req.body;
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

  const validRoles = ["admin", "chef", "waiter"];
  if (!role || !validRoles.includes(role)) {
    throw new Error("Role must be one of: admin, chef, or waiter");
  }
};

module.exports = { validateAdminSignup, validateCreateRestaurant };
