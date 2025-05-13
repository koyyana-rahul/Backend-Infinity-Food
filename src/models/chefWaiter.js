const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const chefWaiterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required."],
    minlength: [2, "Name must be at least 2 characters."],
    maxlength: [100, "Name must be less than 100 characters."],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Email is required."],
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: validator.isEmail,
      message: "Invalid email format.",
    },
  },
  password: {
    type: String,
    required: [true, "Password is required."],
    minlength: [6, "Password must be at least 6 characters long."],
    select: false, // optional: do not return password in queries
  },
  role: {
    type: String,
    enum: {
      values: ["chef", "waiter"],
      message: "Role must be either 'chef' or 'waiter'.",
    },
    required: [true, "Role is required."],
  },
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Restaurant",
    required: [true, "Restaurant ID is required."],
  },
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
    required: [true, "Admin Id is required"],
  },
});

chefWaiterSchema.methods.getJWT = async function () {
  const token = await jwt.sign({ _id: this._id }, "#Rahul8620", {
    expiresIn: "1d",
  });
  return token;
};

chefWaiterSchema.methods.validatePassword = async function (
  passwordInputByUser
) {
  const isPasswordValid = await bcrypt.compare(
    passwordInputByUser,
    this.password
  );
  return isPasswordValid;
};

module.exports = mongoose.model("ChefWaiter", chefWaiterSchema);
