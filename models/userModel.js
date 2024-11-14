const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  phoneNumber: { type: String, required: true, unique: true },
  otpVerified: { type: Boolean, default: false },
  name: String,
  email: String,
  pin: String, // encrypted pin
  loginAttempts: { type: Number, default: 0 },
  jwtToken: String,
}, { timestamps: true });

userSchema.methods.encryptPin = async function (pin) {
  const salt = await bcrypt.genSalt(10);
  this.pin = await bcrypt.hash(pin, salt);
};

userSchema.methods.validatePin = async function (inputPin) {
  return await bcrypt.compare(inputPin, this.pin);
};

module.exports = mongoose.model('User', userSchema);