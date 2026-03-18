import dotenv from "dotenv";
dotenv.config();

import axios from "axios";

export const sendOtpEmail = async (toEmail, otp, fullname) => {
  try {
    if (!process.env.BREVO_API_KEY) {
      throw new Error("BREVO_API_KEY missing ❌");
    }

    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: "TrueChat",
          email: "sachinkumarthakur500@gmail.com",
        },

        to: [
          {
            email: toEmail,
            name: fullname,
          },
        ],

        subject: "🔐 Verify Your Email - TrueChat OTP",

        htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width:500px; margin:auto; background:#0f172a; padding:30px; border-radius:12px; color:white;">
          
          <h1 style="text-align:center;">
            True<span style="color:#2dd4bf;">Chat</span>
          </h1>

          <p style="text-align:center; color:#94a3b8;">
            Secure Real-Time Messaging
          </p>

          <hr style="border:none; border-top:1px solid #1e293b; margin:20px 0;" />

          <h2>Hi ${fullname} 👋</h2>

          <p style="color:#94a3b8;">
            Use the OTP below to verify your account:
          </p>

          <div style="background:#1e293b; padding:20px; text-align:center; border-radius:10px; margin:20px 0;">
            <p style="font-size:12px; color:#94a3b8;">Your OTP</p>

            <h1 style="letter-spacing:8px; color:#2dd4bf;">
              ${otp}
            </h1>

            <p style="color:#f87171; font-size:12px;">
              ⏱️ Expires in 10 minutes
            </p>
          </div>

          <p style="font-size:13px; color:#64748b;">
            ⚠️ Do not share this OTP with anyone.
          </p>

          <hr style="border:none; border-top:1px solid #1e293b; margin:20px 0;" />

          <p style="text-align:center; font-size:12px; color:#475569;">
            © 2026 TrueChat · All rights reserved
          </p>
        </div>
        `,
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
        },
        timeout: 10000, // extra safety
      }
    );

    console.log("✅ OTP Email Sent:", response.data.messageId);

    return true;

  } catch (error) {
    console.error("❌ Brevo Email Error:");

    if (error.response) {
      console.error(error.response.data);
    } else {
      console.error(error.message);
    }

    throw new Error("Failed to send OTP email");
  }
};