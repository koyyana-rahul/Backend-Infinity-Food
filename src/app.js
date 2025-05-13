const express = require("express");
const connectDB = require("./config/database");
const cookieParser = require("cookie-parser");

const adminRouter = require("./routes/admin");
const restaurantRouter = require("./routes/restaurant");

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use("/", adminRouter);
app.use("/", restaurantRouter);

connectDB()
  .then(() => {
    console.log("database connected");
    app.listen(7777, () => {
      console.log("server listening on port 7777......");
    });
  })
  .catch(() => {
    console.log("database not connected");
  });
