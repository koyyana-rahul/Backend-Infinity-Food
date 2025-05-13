const mongoose = require("mongoose");

const connectDB = async () => {
  await mongoose.connect(
    "mongodb+srv://koyyanarahul4002:kxQ9057pCAYlJ3yu@cluster0.1olsnws.mongodb.net/DBFOOD"
  );
};

module.exports = connectDB;