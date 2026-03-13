const twilio = require('twilio');

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const sendOTP = async (phoneNumber) => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  await client.messages.create({
    body: `Your KS1 verification code: ${otp}`,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: phoneNumber
  });
  return otp; // In production, store hashed OTP with expiry
};

module.exports = { sendOTP };
