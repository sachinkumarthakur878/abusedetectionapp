import dotenv from "dotenv";
dotenv.config();
import nodemailer from "nodemailer";
console.log("MAIL USER:", process.env.EMAIL_USER);
console.log("MAIL PASS:", process.env.EMAIL_PASS);

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendOtpEmail = async (toEmail, otp, fullname) => {
  const mailOptions = {
    from: `"TrueChat" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "Your TrueChat OTP Verification Code",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #0f172a; border-radius: 12px; padding: 32px; color: #fff;">
        <h1 style="text-align: center; font-size: 28px; margin-bottom: 4px;">
          True<span style="color: #2dd4bf;">Chat</span>
        </h1>
        <p style="text-align: center; color: #94a3b8; margin-top: 0; font-size: 14px;">Secure Real-Time Messaging</p>
        <hr style="border: none; border-top: 1px solid #1e293b; margin: 24px 0;" />
        <h2 style="font-size: 20px; color: #f1f5f9; margin-bottom: 8px;">Hi ${fullname} 👋</h2>
        <p style="color: #94a3b8; font-size: 15px; line-height: 1.6;">
          Welcome to TrueChat! Please verify your email address by entering the OTP below.
        </p>
        <div style="background: #1e293b; border-radius: 10px; padding: 24px; text-align: center; margin: 24px 0;">
          <p style="color: #94a3b8; font-size: 13px; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 1px;">Your OTP Code</p>
          <div style="font-size: 42px; font-weight: 900; letter-spacing: 10px; color: #2dd4bf; font-family: monospace;">
            ${otp}
          </div>
          <p style="color: #64748b; font-size: 12px; margin: 14px 0 0 0;">⏱️ This code expires in <strong style="color: #f87171;">10 minutes</strong></p>
        </div>
        <p style="color: #64748b; font-size: 13px; line-height: 1.6;">
          If you did not create an account on TrueChat, please ignore this email.
          Do not share this OTP with anyone.
        </p>
        <hr style="border: none; border-top: 1px solid #1e293b; margin: 24px 0;" />
        <p style="text-align: center; color: #475569; font-size: 12px; margin: 0;">
          © 2025 TrueChat · Secure Messaging Platform
        </p>
      </div>
    `,
  };
  await transporter.sendMail(mailOptions);
};