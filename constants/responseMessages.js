// constants/responseMessages.js

module.exports = {
    PHONE_NUMBER_REQUIRED: { code: 400, message: 'Phone number is required' },
    OTP_SENT_SUCCESS: { code: 200, message: 'OTP sent successfully. Please verify your phone number.' },
    USER_EXISTS: { code: 400, message: 'User already exists. Please login to continue.' },
    INVALID_OTP: { code: 400, message: 'Invalid OTP' },
    OTP_VERIFIED: { code: 200, message: 'OTP verified and user authenticated' },
    SET_PROFILE: { code: 200, message: 'Please set your profile' },
    SET_PIN: { code: 200, message: 'Please set your PIN' },
    LOGIN_SUCCESS: { code: 200, message: 'Login successful' },
    USER_NOT_REGISTERED: { code: 404, message: 'User not registered' },
    OTP_SENT: { code: 400, message: 'OTP Sent..' },
    INCORRECT_PIN: { code: 404, message: 'Incorrect PIN' },
    OTP_SENT_PIN_RESET: { code: 403, message: '3 incorrect PINs. OTP sent to verify your phone number. Please set a new PIN after verification.' },
    OTP_RESENT: { code: 200, message: 'OTP resent successfully' },
    INTERNAL_SERVER_ERROR: { code: 500, message: 'An unexpected error occurred. Please try again later.' },
    USER_REGISTERED: { code: 200, message: 'User registered' }
  };
  