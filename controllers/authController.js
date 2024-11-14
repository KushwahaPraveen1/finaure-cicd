const User = require('../models/userModel');
const otpService = require('../services/otpService');
const jwtService = require('../services/jwtService');
const responseMessages = require('../constants/responseMessages');
const Subscribed=require('../models/subscribeModel');

exports.subscribed = async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({
      message: "Email is required",
    });
  }
  
  try {
    let user = await Subscribed.findOne({ email });

    if(user)
    {
      return res.status(400).json({
        message: "Email already subscribed",
      });
    }
    
    if (!user) {
      user = new Subscribed({ email });
      await user.save();
    }
    
    return res.status(200).json({
      message: "Subscription successful.",
    });
  } catch (error) {
    return res.status(500).json({
      message: "An error occurred while subscribing",
      error: error.message,
    });
  }
};

exports.registerPhone = async (req, res) => {
  const { phoneNumber } = req.body;

  if (!phoneNumber) {
    return res.status(responseMessages.PHONE_NUMBER_REQUIRED.code).json({
      message: responseMessages.PHONE_NUMBER_REQUIRED.message,
    });
  }

  try {
    let user = await User.findOne({ phoneNumber });

    if (!user) {
      // User is new, register them and send OTP
      user = new User({ phoneNumber });
      await user.save();
      await otpService.sendOtp(phoneNumber);
      return res.status(responseMessages.OTP_SENT_SUCCESS.code).json({
        message: responseMessages.OTP_SENT_SUCCESS.message,
      });
    } else {
      // User exists but hasn't set up their profile or PIN
      if (!user.name || !user.pin) {
        await otpService.sendOtp(phoneNumber);
        return res.status(responseMessages.OTP_SENT_SUCCESS.code).json({
          message: responseMessages.OTP_SENT_SUCCESS.message,
        });
      }

      // If both profile and PIN are set, no need to send OTP.
      return res.status(responseMessages.USER_EXISTS.code).json({
        message: responseMessages.USER_EXISTS.message,
      });    }
  } catch (error) {
    console.error('Error in sending OTP:', error);
    return res.status(responseMessages.INTERNAL_SERVER_ERROR.code).json({
      message: responseMessages.INTERNAL_SERVER_ERROR.message,
    });
  }
};

exports.verifyOtp = async (req, res) => {
  const { phoneNumber, otp } = req.body;

  try {
    const verified = await otpService.verifyOtp(phoneNumber, otp);

    if (!verified) {
      return res.status(responseMessages.INVALID_OTP.code).json({
        message: responseMessages.INVALID_OTP.message,
      });
    }

    const user = await User.findOneAndUpdate({ phoneNumber }, { otpVerified: true });
    const token = jwtService.generateToken(user._id);

    // Clear session and set new cookie
    res.clearCookie('session');
    res.cookie('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 1000,
    });

    // Check if profile or PIN is missing
    if (!user.name) {
      return res.status(responseMessages.SET_PROFILE.code).json({
        message: responseMessages.SET_PROFILE.message,
        token,
      });
    }

    if (!user.pin) {
      return res.status(responseMessages.SET_PIN.code).json({
        message: responseMessages.SET_PIN.message,
        token,
      });
    }

    // Return success if everything is set
    return res.status(responseMessages.OTP_VERIFIED.code).json({
      message: responseMessages.OTP_VERIFIED.message,
      token,
    });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return res.status(responseMessages.INTERNAL_SERVER_ERROR.code).json({
      message: responseMessages.INTERNAL_SERVER_ERROR.message,
    });
  }
};

exports.login = async (req, res) => {
  const { phoneNumber, pin } = req.body;

  try {
    const user = await User.findOne({ phoneNumber });

    if (!user) {
      return res.status(responseMessages.USER_NOT_REGISTERED.code).json({
        message: responseMessages.USER_NOT_REGISTERED.message,
      });
    }

    if (!user.name || !user.pin) {
      return res.status(200).json({
        message: responseMessages.OTP_SENT.message,
      });
    }

    // Check if the provided PIN is correct
    if (!(await user.validatePin(pin))) {
      user.loginAttempts += 1;
      await user.save();

      // After 3 incorrect PINs, reset PIN and send OTP
      if (user.loginAttempts >= 3) {
        user.pin = undefined;
        user.loginAttempts = 0;
        await user.save();

        await otpService.sendOtp(phoneNumber);

        return res.status(responseMessages.OTP_SENT_PIN_RESET.code).json({
          message: "3 incorrect PINs. OTP sent to verify your phone number. Please set a new PIN after verification.",
        });
      }

      return res.status(responseMessages.INCORRECT_PIN.code).json({
        message: responseMessages.INCORRECT_PIN.message,
      });
    }

    // Reset login attempts on successful login
    user.loginAttempts = 0;

    // Generate JWT token
    const token = jwtService.generateToken(user._id);

    // Set the session cookie
    res.cookie('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 1000,
    });

    user.jwtToken = token;
    await user.save();

    return res.json({
      message: responseMessages.LOGIN_SUCCESS.message,
      token,
    });
  } catch (error) {
    console.error('Error during login:', error);
    return res.status(responseMessages.INTERNAL_SERVER_ERROR.code).json({
      message: responseMessages.INTERNAL_SERVER_ERROR.message,
    });
  }
};

exports.resendOtp = async (req, res) => {
  const { phoneNumber } = req.body;

  try {
    await otpService.sendOtp(phoneNumber);
    return res.status(responseMessages.OTP_RESENT.code).json({
      message: responseMessages.OTP_RESENT.message,
    });
  } catch (error) {
    console.error('Error resending OTP:', error);
    return res.status(responseMessages.INTERNAL_SERVER_ERROR.code).json({
      message: responseMessages.INTERNAL_SERVER_ERROR.message,
    });
  }
};

exports.check = async (req, res) => {
  const { phoneNumber } = req.body;

  try {
    const user = await User.findOne({ phoneNumber });

    if (!user) {
      return res.status(responseMessages.USER_NOT_REGISTERED.code).json({
        message: responseMessages.USER_NOT_REGISTERED.message,
      });
    }

    if (!user.name) {
      return res.status(200).json({
        message: "Please register again to continue.",
      });
    }if (!user.pin) {
      return res.status(200).json({
        message: "Please register again to continue.",
      });
    }

    return res.status(responseMessages.USER_REGISTERED.code).json({
      message: responseMessages.USER_REGISTERED.message,
    });
  } catch (error) {
    console.error('Error checking user:', error);
    return res.status(responseMessages.INTERNAL_SERVER_ERROR.code).json({
      message: responseMessages.INTERNAL_SERVER_ERROR.message,
    });
  }
};

