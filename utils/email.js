import axios from "axios";
console.log("🚀 sendOTPEmail CALLED");

export const sendOTPEmail = async (email, otp) => {
  try {
    // 🔒 Validate env variables
    const apiKey = process.env.BREVO_API_KEY;
    const rawFrom = process.env.EMAIL_FROM;

    if (!apiKey) {
      throw new Error("BREVO_API_KEY is missing in environment variables");
    }

    if (!rawFrom) {
      throw new Error("EMAIL_FROM is missing in environment variables");
    }

    // 🧠 Extract email from "Name <email>" OR use plain email
    const senderEmail =
      rawFrom.match(/<(.*)>/)?.[1] || rawFrom;

    // 🔒 Basic validation
    if (!senderEmail.includes("@")) {
      throw new Error("Invalid EMAIL_FROM format");
    }

    console.log("Sending to Brevo:", email);

    // 🚀 Send email via Brevo API
    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: "Worklance",
          email: senderEmail,
        },
        to: [{ email }],
        subject: "Your OTP Code",
        htmlContent: `
          <div style="font-family:sans-serif;line-height:1.5;">
            <h2>Your OTP Code</h2>
            <p>Your verification code is:</p>
            <h1 style="letter-spacing:4px;">${otp}</h1>
            <p>This code expires in 5 minutes.</p>
            <p>If you didn’t request this, you can ignore this email.</p>
          </div>
        `,
      },
      {
        headers: {
          "api-key": apiKey,
          "Content-Type": "application/json",
        },
        timeout: 10000, // ⏱️ prevent hanging requests
      }
    );

    console.log("✅ Email sent:", response.data);
  } catch (error) {
    console.error("❌ FULL BREVO ERROR:", error);
  }
};