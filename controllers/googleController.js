// const GoogleUserModel = require("../models/googleModel"); // Renamed for clarity

// async function protectedRoute(req, res) {
//   const { uid, name, email, picture } = req.googleUser;

//   let user = await GoogleUserModel.findOne({ uid });

//   if (!user) {
//     user = new GoogleUserModel({ uid, name, email, picture });
//     await user.save();
//   }

//   if (!user.pin) {
//     return res.status(200).json({ message: "Set Pin", user });
//   }

//   res.cookie('token', req.headers.authorization, { maxAge: 3600000, httpOnly: true });
//   res.status(200).json({ message: "Verify the pin", user });
// }

// async function setPin(req, res) {
//   const { pin } = req.body;
//   const { uid } = req.googleUser;
//   let user = await GoogleUserModel.findOne({ uid });

//   if (!user) {
//     return res.status(404).json({ message: "User not found" });
//   }

//   if (user.pin) {
//     return res.status(400).json({ message: "PIN is already set" });
//   }

//   user.pin = pin; // Consider hashing the PIN before saving
//   await user.save();

//   res.status(200).json({ message: "PIN set successfully" });
// }

// async function verifyPin(req, res) {
//   const { pin } = req.body;
//   const { uid } = req.googleUser;

//   let user = await GoogleUserModel.findOne({ uid });

//   if (!user) {
//     return res.status(404).json({ message: "User not found" });
//   }

//   if (!user.pin) {
//     return res.status(400).json({ message: "Pin not set" });
//   }

//   if (user.pin !== pin) { // Consider comparing hashed PINs
//     return res.status(400).json({ message: "Invalid PIN" });
//   }

//   res.status(200).json({ message: "PIN verified successfully" });
// }

// async function logout(req, res) {
//   res.clearCookie('token');
//   res.status(200).json({ message: "Logged out successfully" });
// }

// module.exports = {
//   protectedRoute,
//   setPin,
//   verifyPin,
//   logout,
// };

const GoogleUserModel = require("../models/googleModel"); // Renamed for clarity
const responseMessages = require("../constants/googleResponseMessages"); // Import constants

async function protectedRoute(req, res) {
  const { uid, name, email, picture } = req.googleUser;

  let user = await GoogleUserModel.findOne({ uid });

  if (!user) {
    user = new GoogleUserModel({ uid, name, email, picture });
    await user.save();
  }

  if (!user.pin) {
    return res.status(responseMessages.SET_PIN.code).json({
      message: responseMessages.SET_PIN.message,
      user,
    });
  }

  res.cookie("token", req.headers.authorization, {
    maxAge: 3600000,
    httpOnly: true,
  });
  res.status(responseMessages.VERIFY_PIN.code).json({
    message: responseMessages.VERIFY_PIN.message,
    user,
  });
}

async function setPin(req, res) {
  const { pin } = req.body;
  const { uid } = req.googleUser;
  let user = await GoogleUserModel.findOne({ uid });

  if (!user) {
    return res.status(responseMessages.USER_NOT_FOUND.code).json({
      message: responseMessages.USER_NOT_FOUND.message,
    });
  }

  if (user.pin) {
    return res.status(responseMessages.PIN_ALREADY_SET.code).json({
      message: responseMessages.PIN_ALREADY_SET.message,
    });
  }

  user.pin = pin; // Consider hashing the PIN before saving
  await user.save();

  res.status(responseMessages.PIN_SET_SUCCESS.code).json({
    message: responseMessages.PIN_SET_SUCCESS.message,
  });
}

async function verifyPin(req, res) {
  const { pin } = req.body;
  const { uid } = req.googleUser;

  let user = await GoogleUserModel.findOne({ uid });

  if (!user) {
    return res.status(responseMessages.USER_NOT_FOUND.code).json({
      message: responseMessages.USER_NOT_FOUND.message,
    });
  }

  if (!user.pin) {
    return res.status(responseMessages.PIN_NOT_SET.code).json({
      message: responseMessages.PIN_NOT_SET.message,
    });
  }

  // if (user.pin !== pin) {
  //   return res.status(responseMessages.INVALID_PIN.code).json({
  //     message: responseMessages.INVALID_PIN.message,
  //   });
  // }

  if (user.pin!==pin) {
    user.loginAttempts += 1;
    await user.save();

    // After 3 incorrect PINs, reset PIN and send OTP
    if (user.loginAttempts >= 3) {
      user.pin = undefined;
      user.loginAttempts = 0;
      await user.save();

      return res.status(responseMessages.OTP_SENT_PIN_RESET.code).json({
        message: "3 incorrect PINs. OTP sent to verify your phone number. Please set a new PIN after verification.",
      });
    }

    return res.status(responseMessages.INCORRECT_PIN.code).json({
      message: responseMessages.INCORRECT_PIN.message,
    });
  }

  res.status(responseMessages.PIN_VERIFIED_SUCCESS.code).json({
    message: responseMessages.PIN_VERIFIED_SUCCESS.message,
  });
}

async function logout(req, res) {
  res.clearCookie("token");
  res.status(responseMessages.LOGGED_OUT_SUCCESS.code).json({
    message: responseMessages.LOGGED_OUT_SUCCESS.message,
  });
}

module.exports = {
  protectedRoute,
  setPin,
  verifyPin,
  logout,
};
