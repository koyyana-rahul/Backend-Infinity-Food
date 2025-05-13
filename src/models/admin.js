const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Admin Schema
const adminSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [100, "Name must be at most 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: function (value) {
          return validator.isEmail(value);
        },
        message: "Invalid email format",
      },
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      validate: {
        validator: function (value) {
          return (
            !value ||
            validator.isStrongPassword(value, {
              minLength: 6,
              minLowercase: 1,
              minUppercase: 1,
              minNumbers: 1,
              minSymbols: 0,
            })
          );
        },
        message:
          "Password must include at least 1 uppercase letter, 1 lowercase letter, and 1 number",
      },
    },
    role: {
      type: String,
      enum: {
        values: ["admin"],
        message: "Role must be  admin",
      },
      required: [true, "Role is required"],
    },
  },
  { timestamps: true }
);

// Method to validate password
adminSchema.methods.validatePassword = async function (passwordInputByUser) {
  const isPasswordValid = await bcrypt.compare(
    passwordInputByUser,
    this.password
  );
  return isPasswordValid;
};

// Method to generate JWT token
adminSchema.methods.getJWT = function () {
  const token = jwt.sign(
    { _id: this._id, role: this.role }, // Including role in the token
    "#Rahul8620", // Environment variable for security
    { expiresIn: "1d" } // Adding expiration time for security
  );
  return token;
};

module.exports = mongoose.model("Admin", adminSchema);
