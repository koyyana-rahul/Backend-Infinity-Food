const mongoose = require("mongoose");

const orderSchema = mongoose.Schema({
  tableNumber: {
    type: Number,
  },
});

module.exports = mongoose.model("Order", orderSchema);
