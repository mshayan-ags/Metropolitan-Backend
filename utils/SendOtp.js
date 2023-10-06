const nodemailer = require("nodemailer");

function generateOTP(length) {
  const digits = "0123456789";
  let otp = "";
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * digits.length)];
  }
  return otp;
}

const transporter = nodemailer.createTransport({
  host: "shared87.accountservergroup.com",
  port: 465,
  secure: true,
  auth: {
    user: "otp@365fm.pk",
    pass: "IL;WxW-dig6L",
  },
});

async function SendOtp(email, otp) {
  try {
    const info = await transporter.sendMail({
      from: '"Metropolitan App" <foo@example.com>', // sender address
      to: email, // list of receivers
      subject: "OTP Verification", // Subject line
      text: "OTP Verification for Metropolitan App", // plain text body
      html: `<b>OTP Verification</b> <br /> your otp is : - <b>${otp}</b>`, // html body
    });

    console.log("Message sent: %s", info?.accepted);
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
  SendOtp,
  generateOTP,
};
