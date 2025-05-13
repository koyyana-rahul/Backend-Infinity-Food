const mongoose = require("mongoose");
const validator = require("validator");

const restaurantSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Restaurant name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [100, "Name must be at most 100 characters"],
    },
    image: {
      type: String,
      trim: true,
      validate: {
        validator: function (value) {
          return (
            !value ||
            validator.isURL(value, {
              protocols: ["http", "https"],
              require_protocol: true,
            })
          );
        },
        message: "Invalid image URL. Must be a valid HTTP/HTTPS URL.",
      },
    },
    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
      minlength: [5, "Address must be at least 5 characters"],
      maxlength: [200, "Address must be at most 200 characters"],
    },
    contact: {
      type: String,
      required: [true, "Contact number is required"],
      trim: true,
      unique: true, // <- Enforces unique contact numbers
      validate: {
        validator: function (value) {
          return validator.isMobilePhone(value, "any", { strictMode: false });
        },
        message: "Invalid contact number.",
      },
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: [true, "Owner reference is required"],
    },
    qrcodeId: {
      type: String,
      unique: true, // Optional: ensures qrcodeId is also unique
    },
  },
  { timestamps: true }
);

// Pre-save hook to generate qrcodeId if not already set
restaurantSchema.pre("save", function (next) {
  if (!this.qrcodeId && this.ownerId) {
    const suffix = new mongoose.Types.ObjectId().toString().slice(-6);
    this.qrcodeId = `QR-${this.ownerId.toString().slice(-6)}-${suffix}`;
  }
  next();
});

module.exports = mongoose.model("Restaurant", restaurantSchema);
