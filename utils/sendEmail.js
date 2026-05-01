import nodemailer from "nodemailer";

export const sendOtpEmail = async ({ email, otp, subject }) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"Worklance" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: subject || "Your OTP Code",
    html: `<h2>Your OTP is: ${otp}</h2><p>Expires in 5 minutes</p>`,
  });
};