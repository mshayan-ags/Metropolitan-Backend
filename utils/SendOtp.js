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

async function SendWelcomeEmail(email, password) {
  try {
    const info = await transporter.sendMail({
      from: '"Metropolitan App" <foo@example.com>', // sender address
      to: email, // list of receivers
      subject: "Welcome To Metropolis Building Management", // Subject line
      html: `<!DOCTYPE html>
      <html>
      
      <head>
          <meta charset="UTF-8">
          <title>Welcome to Metropolitan Building Mangement App</title>
      </head>
      
      <body>
          <h2>Welcome to Metropolitan Building Mangement App!</h2>
          <p>We're thrilled to have you on board.</p>
      
          <p><strong>Here are your login details:</strong></p>
          <ul>
              <li><strong>Username/Email:</strong> ${email}</li>
              <li><strong>Temporary Password:</strong> ${password}</li>
          </ul>
      
          <p>Please log in at <a href="[Application Website]">Metropolis App</a> and change your password for security.</p>
      
          <p>If you have any questions, our support team is here to help at <a href="mailto:metropolis@metropolitan.com">metropolis@metropolitan.com</a>.</p>
      
          <p>Thanks for choosing us. Enjoy your Metropolitan Building Mangement App experience!</p>
      
          <p>Best regards,<br>
          Metropolitan Building Mangement</p>
      </body>
      
      </html>
      `, // html body
    });

    console.log("Message sent: %s", info?.accepted);
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
  SendOtp,
  generateOTP,
  SendWelcomeEmail,
};
