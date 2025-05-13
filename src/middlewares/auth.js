const jwt = require("jsonwebtoken");
const Admin = require("../models/admin");

const authAdmin = async (req, res, next) => {
  try {
    const { token } = req.cookies; // ✅ use 'cookies' (not 'cookie')

    if (!token) {
      throw new Error("Authentication token is missing.");
    }

    // ✅ Correct usage: verify the token with your secret key
    const decodedMessage = jwt.verify(token, "#Rahul8620"); // Make sure JWT_SECRET is defined in .env

    const { _id } = decodedMessage;

    // ✅ Find the admin by ID
    const admin = await Admin.findById(_id);

    if (!admin) {
      throw new Error("Admin not found.");
    }

    // ✅ Attach admin info to request object
    req.admin = admin;

    next();
  } catch (error) {
    return res.status(401).json({ error: error.message });
  }
};

module.exports = { authAdmin };
