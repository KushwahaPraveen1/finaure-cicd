const twilio = require('twilio');
const client = new twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Dummy OTP storage
const otps = {};

exports.sendOtp = async (phoneNumber) => {
  const otp = Math.floor(1000 + Math.random() * 9000).toString(); // Generate random OTP
  otps[phoneNumber] = otp; // Store OTP for verification

  await client.messages.create({
    body: `Your OTP code is ${otp}`,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: phoneNumber
  });
};

exports.verifyOtp = async (phoneNumber, otp) => {
  return otps[phoneNumber] === otp; // Check against stored OTP
};
