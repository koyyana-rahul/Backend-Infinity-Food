const mongoose = require("mongoose");
const validator = require("validator");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
      minlength: [2, "Category name must be at least 2 characters long"],
      maxlength: [100, "Category name must not exceed 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [300, "Description must not exceed 300 characters"],
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
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Restaurant ID is required"],
      ref: "Restaurant",
    },
  },
  {
    timestamps: true,
  }
);

// 🔁 Normalize name and enforce uniqueness per restaurant
categorySchema.pre("save", async function (next) {
  this.name = this.name.replace(/\s+/g, "").toLowerCase(); // Remove all spaces and lowercase

  const existing = await mongoose.models.Category.findOne({
    name: this.name,
    restaurantId: this.restaurantId,
  });

  if (existing && existing._id.toString() !== this._id.toString()) {
    return next(
      new Error(
        "Category name must be unique within the same restaurant (ignoring spaces)."
      )
    );
  }

  next();
});

module.exports = mongoose.model("Category", categorySchema);
