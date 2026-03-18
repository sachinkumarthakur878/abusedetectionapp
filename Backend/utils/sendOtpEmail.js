import dotenv from "dotenv";
dotenv.config();

import axios from "axios";

export const sendOtpEmail = async (toEmail, otp, fullname) => {
  try {
    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: "TrueChat",
          email: "sachinkumarthakur500@gmail.com", // verified sender
        },
        to: [
          {
            email: toEmail,
            name: fullname,
          },
        ],
        subject: "Your TrueChat OTP Verification Code",
        htmlContent: `
          <div style="font-family: Arial; padding:20px;">
            <h2>Hi ${fullname} 👋</h2>
            <p>Your OTP is:</p>
            <h1 style="letter-spacing:5px;">${otp}</h1>
            <p>This OTP expires in 10 minutes</p>
          </div>
        `,
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Email sent ✅", response.data);

  } catch (error) {
    console.log("Brevo API Error ❌:", error.response?.data || error.message);
    throw error;
  }
};