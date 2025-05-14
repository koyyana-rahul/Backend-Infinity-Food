const mongoose = require("mongoose");
const validator = require("validator");

const itemSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Item name is required"],
      trim: true,
      minlength: [2, "Item name must be at least 2 characters long"],
      maxlength: [100, "Item name must not exceed 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [300, "Description must not exceed 300 characters"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price must be a positive number"],
    },
    image: {
      type: String,
      trim: true,
      validate: {
        validator: function (v) {
          return !v || validator.isURL(v);
        },
        message:
          "Please enter a valid image URL (http(s) and ends with .jpg, .png, etc)",
      },
    },
    vegType: {
      type: String,
      required: [true, "Veg/Non-veg type is required"],
      enum: ["veg", "non-veg"],
      lowercase: true,
      trim: true,
    },
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Restaurant ID is required"],
      ref: "Restaurant",
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Category ID is required"],
      ref: "Category",
    },
  },
  {
    timestamps: true,
  }
);

// 🔁 Normalize name before saving and ensure it is unique within the same restaurant and category
itemSchema.pre("save", async function (next) {
  this.name = this.name.replace(/\s+/g, "").toLowerCase(); // Remove all spaces and lowercase

  // 🔍 Check uniqueness per restaurant and category (ignoring spaces and case)
  const existingItem = await mongoose.models.Item.findOne({
    name: this.name,
    restaurantId: this.restaurantId,
    categoryId: this.categoryId,
  });

  if (existingItem && existingItem._id.toString() !== this._id.toString()) {
    return next(
      new Error(
        "Item name must be unique within the same restaurant and category (ignoring spaces and case)."
      )
    );
  }

  next();
});

module.exports = mongoose.model("Item", itemSchema);
