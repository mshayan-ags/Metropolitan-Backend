const nodemailer = require("nodemailer");


function generateOTP(length) {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * digits.length)];
  }
  return otp;
}


const transporter = nodemailer.createTransport({
  host: "smtp.forwardemail.net",
  port: 465,
  secure: true,
  auth: {
    user: "REPLACE-WITH-YOUR-ALIAS@YOURDOSendOtp.COM",
    pass: "REPLACE-WITH-YOUR-GENERATED-PASSWORD",
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

    console.log("Message sent: %s", info.messageId);
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
  SendOtp,
  generateOTP
};
