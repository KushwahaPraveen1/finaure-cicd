const User = require('../models/userModel');
const responseMessages = require('../constants/test');
exports.register = async (req, res) => {
  const { uid, phoneNumber } = req.user;

  try {
    // Check if user exists
    let user = await User.findOne({ phoneNumber });

    if (!user) {
      // If new user, save user to the database
      user = new User({ user_id: uid, phoneNumber, isLoggined: true });
      await user.save();
    }

    // Check if profile is set
    if (!user.name || !user.email) {
      return res.status(responseMessages.PROFILE_NOT_SET.code).json({
        message: responseMessages.PROFILE_NOT_SET.message,
      });
    }

    // Check if PIN is set
    if (!user.pin) {
      return res.status(responseMessages.PIN_NOT_SET.code).json({
        message: responseMessages.PIN_NOT_SET.message,
      });
    }

    // If everything is set, respond with success
    return res.status(responseMessages.REGISTRATION_COMPLETE.code).json({
      message: responseMessages.REGISTRATION_COMPLETE.message,
    });
  } catch (error) {
    console.error('Error in registration:', error);
    return res.status(responseMessages.INTERNAL_SERVER_ERROR.code).json({
      message: responseMessages.INTERNAL_SERVER_ERROR.message,
    });
  }
};

// Log in a user using the token and PIN
// exports.login = async (req, res) => {
//     const { phoneNumber } = req.user;
//     const { pin } = req.body;
  
//     try {
//       const user = await User.findOne({ phoneNumber });
//       if (!user) {
//         return res.status(responseMessages.USER_NOT_REGISTERED.code).json({
//           message: responseMessages.USER_NOT_REGISTERED.message,
//         });
//       }
//   if(!user.pin)
//   {
//         return res.status(responseMessages.PIN_NOT_SET.code).json({
//             message: responseMessages.PIN_NOT_SET.message,
//             });
//   }// Check if the user has reached the maximum number of attempts
//       if (user.loginAttempts>=3) {
//         user.pin = null;
//         user.isLoggined=false; // Clear the pin from the database
//           await user.save();
//         return res.status(responseMessages.LOGIN_OTP_REQUIRED.code).json({
//           message: responseMessages.LOGIN_OTP_REQUIRED.message,
//         });
//       }
  
//       if (!(await user.validatePin(pin))) {
//         // Increment login attempts
//         user.loginAttempts += 1;
  
//         // Clear the PIN if this was the 4th attempt
//         if (user.loginAttempts >= 4) {
//           user.pin = null; // Clear the pin from the database
//           await user.save();
//         } else {
//           await user.save(); // Save updated login attempts count
//         }
  
//         return res.status(responseMessages.INCORRECT_PIN.code).json({
//           message: responseMessages.INCORRECT_PIN.message,
//         });
//       }
  
//       // Successful login: Reset login attempts
//       user.loginAttempts = 0;
//       await user.save();
  
//       return res.status(responseMessages.LOGIN_SUCCESS.code).json({
//         message: responseMessages.LOGIN_SUCCESS.message,
//       });
//     } catch (error) {
//       console.error('Error during login:', error);
//       return res.status(responseMessages.INTERNAL_SERVER_ERROR.code).json({
//         message: responseMessages.INTERNAL_SERVER_ERROR.message,
//       });
//     }
//   };

exports.login = async (req, res) => {
    const { phoneNumber, pin } = req.body;
  
    try {
      const user = await User.findOne({ phoneNumber });
  
      if (!user) {
        return res.status(responseMessages.USER_NOT_REGISTERED.code).json({
          message: responseMessages.USER_NOT_REGISTERED.message,
        });
      }
  
      // Check if the user hasn't completed their profile or set a PIN
      if (!user.name || !user.pin) {
        return res.status(400).json({
          message: "Please set your profile or PIN",
        });
      }
  
      // Check if the provided PIN is correct
      if (!(await user.validatePin(pin))) {
        user.loginAttempts += 1;
        await user.save();
  
        // After 3 incorrect attempts, reset PIN and send OTP
        if (user.loginAttempts >= 3) {
          user.pin = undefined;
          user.loginAttempts = 0;
          await user.save();
  
          // Assume there's an OTP service that sends OTP for resetting the PIN
          // await otpService.sendOtp(phoneNumber);
  
          return res.status(responseMessages.OTP_SENT_PIN_RESET.code).json({
            message: responseMessages.OTP_SENT_PIN_RESET.message,
          });
        }
  
        return res.status(responseMessages.INCORRECT_PIN.code).json({
          message: responseMessages.INCORRECT_PIN.message,
        });
      }
  
      // Reset login attempts on successful login
      user.loginAttempts = 0;
      await user.save(); // Save reset login attempts
  
      // On successful login
      return res.json({
        message: responseMessages.LOGIN_SUCCESS.message,
      });
  
    } catch (error) {
      console.error('Error during login:', error);
      return res.status(responseMessages.INTERNAL_SERVER_ERROR.code).json({
        message: responseMessages.INTERNAL_SERVER_ERROR.message,
      });
    }
  };
  

// Set user profile (name and email)
exports.setProfile = async (req, res) => {
  const { phoneNumber } = req.user;

  try {
    const user = await User.findOne({ phoneNumber });
    console.log(user.isLoggined)
if(!user.isLoggined)
{
    return res.status(401).json({
        message: "Not Loggined in. Please verify using otp",
      });
}
    if (!user) {
      return res.status(responseMessages.USER_NOT_FOUND.code).json({
        message: responseMessages.USER_NOT_FOUND.message,
      });
    }
    if(user.name)
    {
        return res.status(responseMessages.PROFILE_SET_AGAIN.code).json({
            message: responseMessages.PROFILE_SET_AGAIN.message,
        });
    }

    // Update profile information
    user.name = req.body.name;
    user.email = req.body.email;
    await user.save();



        return res.status(responseMessages.PROFILE_SET_SUCCESS.code).json({
      message: responseMessages.PROFILE_SET_SUCCESS.message,
    });
  } catch (error) {
    console.error('Error setting profile:', error);
    return res.status(responseMessages.INTERNAL_SERVER_ERROR.code).json({
      message: responseMessages.INTERNAL_SERVER_ERROR.message,
    });
  }
};

// Set user's PIN
exports.setPin = async (req, res) => {
  const { phoneNumber } = req.user;

  try {
    const user = await User.findOne({ phoneNumber });
    console.log(user.isLoggined)
    if(!user.isLoggined)
    {
        return res.status(401).json({
            message: "Not Loggined in. Please verify using otp",
          });
    }

    if (!user) {
      return res.status(responseMessages.USER_NOT_FOUND.code).json({
        message: responseMessages.USER_NOT_FOUND.message,
      });
    }
if(user.pin)   
{
    return res.status(responseMessages.PIN_SET_AGAIN.code).json({
        message: responseMessages.PIN_SET_AGAIN.message,
    });
} 
    // Encrypt and set the PIN
    await user.encryptPin(req.body.pin);
    await user.save();

    return res.status(responseMessages.PIN_SET_SUCCESS.code).json({
      message: responseMessages.PIN_SET_SUCCESS.message,
    });
  } catch (error) {
    console.error('Error setting PIN:', error);
    return res.status(responseMessages.INTERNAL_SERVER_ERROR.code).json({
      message: responseMessages.INTERNAL_SERVER_ERROR.message,
    });
  }
};

// Check user existence
exports.check = async (req, res) => {
  const { phoneNumber } = req.body;

  try {
    const user = await User.findOne({ phoneNumber });
    if (!user) {
      return res.status(200).json({
        message: responseMessages.USER_NOT_REGISTERED.message,
      });
    }
    return res.status(200).json({
      message: responseMessages.USER_REGISTERED.message,
    });
  } catch (error) {
    console.error('Error checking user:', error);
    return res.status(responseMessages.INTERNAL_SERVER_ERROR.code).json({
      message: responseMessages.INTERNAL_SERVER_ERROR.message,
    });
  }
};
