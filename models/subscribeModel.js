const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true }
  },
  { timestamps: true }
);

const Subscribed = mongoose.model("Subscriber", userSchema);
module.exports = Subscribed;
