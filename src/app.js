const express = require("express");
const connectDB = require("./config/database");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const adminRouter = require("./routes/admin");
const restaurantRouter = require("./routes/restaurant");
const chefWaiterRouter = require("./routes/chefWaiter");

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use("/", adminRouter);
app.use("/", restaurantRouter);
app.use("/", chefWaiterRouter);

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
