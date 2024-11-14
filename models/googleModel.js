const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true },
  name: String,
  email: { type: String, required: true, unique: true },
  picture: String,
  pin: { type: String },
  loginAttempts: { type: Number, default: 0 },
});

const googleUser = mongoose.model("googleUser", userSchema);
module.exports = googleUser;
