module.exports = {
    PROFILE_NOT_SET: { code: 400, message: 'Profile is not set' },
    PIN_NOT_SET: { code: 400, message: 'PIN is not set' },
    REGISTRATION_COMPLETE: { code: 200, message: 'Registration complete' },
    USER_NOT_REGISTERED: { code: 404, message: 'User is not registered' },
    LOGIN_SUCCESS: { code: 200, message: 'Login successful' },
    INCORRECT_PIN: { code: 400, message: 'Incorrect PIN' },
    PROFILE_SET_SUCCESS: { code: 200, message: 'Profile set successfully' },
    PROFILE_SET_AGAIN: { code: 400, message: 'Profile already set' },
    PIN_SET_SUCCESS: { code: 200, message: 'PIN set successfully' },
    PIN_SET_AGAIN: { code: 400, message: 'PIN already set' },
    USER_NOT_FOUND: { code: 404, message: 'User not found' },
    USER_REGISTERED: { code: 200, message: 'User already registered' },
    INTERNAL_SERVER_ERROR: { code: 500, message: 'Internal server error' },
    LOGIN_OTP_REQUIRED: { code: 400, message: '3 Incorrect attempts, login OTP required' },
    OTP_SENT_PIN_RESET: { code: 403, message: '3 incorrect PINs. OTP sent to verify your phone number. Please set a new PIN after verification.' },
  };
  