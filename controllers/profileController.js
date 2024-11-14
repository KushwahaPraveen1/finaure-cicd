// const User = require('../models/userModel');
// const jwtService = require('../services/jwtService');

// exports.setProfile = async (req, res) => {
//   const token = req.headers.authorization?.split(' ')[1]; // Extract token from Authorization header
//   const decoded = jwtService.verifyToken(token);

//   if (!decoded) return res.status(401).json({ message: 'Invalid token' });

//   // Find the user by ID
//   const user = await User.findById(decoded.userId);
//   if (!user) return res.status(404).json({ message: 'User not found' });

//   // Check if the profile is already set
//   if (user.name || user.email) {
//     return res.status(400).json({ message: 'Profile is already set' });
//   }

//   // Update the user's profile
//   user.name = req.body.name;
//   user.email = req.body.email;
//   await user.save();

//   res.json({ message: 'Profile set successfully' });
// };


// exports.setPin = async (req, res) => {
//  const token = req.headers.authorization?.split(' ')[1]; // Extract token from Authorization header
//   const decoded = jwtService.verifyToken(token);

//   if (!decoded) return res.status(401).json({ message: 'Invalid token' });

//   const user = await User.findById(decoded.userId);
//   if (!user) return res.status(404).json({ message: 'User not found' });

//   await user.encryptPin(req.body.pin);
//   await user.save();

//   res.json({ message: 'PIN set successfully' });
// };


const User = require('../models/userModel');
const jwtService = require('../services/jwtService');
const responseMessages = require('../constants/profileResponseMessages'); // Import constants

exports.setProfile = async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]; // Extract token from Authorization header
  const decoded = jwtService.verifyToken(token);

  if (!decoded) {
    return res.status(responseMessages.INVALID_TOKEN.code).json({
      message: responseMessages.INVALID_TOKEN.message,
    });
  }

  // Find the user by ID
  const user = await User.findById(decoded.userId);
  if (!user) {
    return res.status(responseMessages.USER_NOT_FOUND.code).json({
      message: responseMessages.USER_NOT_FOUND.message,
    });
  }

  // Check if the profile is already set
  if (user.name || user.email) {
    return res.status(responseMessages.PROFILE_ALREADY_SET.code).json({
      message: responseMessages.PROFILE_ALREADY_SET.message,
    });
  }

  // Update the user's profile
  user.name = req.body.name;
  user.email = req.body.email;
  await user.save();

  return res.status(responseMessages.PROFILE_SET_SUCCESS.code).json({
    message: responseMessages.PROFILE_SET_SUCCESS.message,
  });
};

exports.setPin = async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]; // Extract token from Authorization header
  const decoded = jwtService.verifyToken(token);

  if (!decoded) {
    return res.status(responseMessages.INVALID_TOKEN.code).json({
      message: responseMessages.INVALID_TOKEN.message,
    });
  }

  const user = await User.findById(decoded.userId);
  if (!user) {
    return res.status(responseMessages.USER_NOT_FOUND.code).json({
      message: responseMessages.USER_NOT_FOUND.message,
    });
  }

  await user.encryptPin(req.body.pin);
  await user.save();

  return res.status(responseMessages.PIN_SET_SUCCESS.code).json({
    message: responseMessages.PIN_SET_SUCCESS.message,
  });
};
