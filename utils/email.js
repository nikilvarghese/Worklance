const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.mailtrap.io",
  port: Number(process.env.EMAIL_PORT || 587),
  secure: process.env.EMAIL_SECURE === "true",
  auth: process.env.EMAIL_USER
    ? {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      }
    : undefined,
});

const sendOtpEmail = async ({ email, otp, subject, label }) => {
  const text = `Use the following code to complete your ${label}: ${otp}. It expires in 5 minutes.`;
  const html = `
    <div style="font-family: sans-serif; line-height: 1.5; color: #111;">
      <h2>${subject}</h2>
      <p>Your verification code is:</p>
      <p style="font-size: 1.5rem; font-weight: 700; letter-spacing: 0.15rem;">${otp}</p>
      <p>This code expires in 5 minutes.</p>
      <p>If you did not request this, please ignore this email.</p>
    </div>
  `;

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log(`OTP for ${email}: ${otp}`);
    return;
  }

  await transporter.sendMail({
    from: `"Worklance" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
    to: email,
    subject,
    text,
    html,
  });
};

module.exports = {
  sendOtpEmail,
};
