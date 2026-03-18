// import dotenv from "dotenv";
// dotenv.config();
// import nodemailer from "nodemailer";
// console.log("MAIL USER:", process.env.EMAIL_USER);
// console.log("MAIL PASS:", process.env.EMAIL_PASS);

// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
// });

// export const sendOtpEmail = async (toEmail, otp, fullname) => {
//   const mailOptions = {
//     from: `"TrueChat" <${process.env.EMAIL_USER}>`,
//     to: toEmail,
//     subject: "Your TrueChat OTP Verification Code",
//     html: `
//       <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #0f172a; border-radius: 12px; padding: 32px; color: #fff;">
//         <h1 style="text-align: center; font-size: 28px; margin-bottom: 4px;">
//           True<span style="color: #2dd4bf;">Chat</span>
//         </h1>
//         <p style="text-align: center; color: #94a3b8; margin-top: 0; font-size: 14px;">Secure Real-Time Messaging</p>
//         <hr style="border: none; border-top: 1px solid #1e293b; margin: 24px 0;" />
//         <h2 style="font-size: 20px; color: #f1f5f9; margin-bottom: 8px;">Hi ${fullname} 👋</h2>
//         <p style="color: #94a3b8; font-size: 15px; line-height: 1.6;">
//           Welcome to TrueChat! Please verify your email address by entering the OTP below.
//         </p>
//         <div style="background: #1e293b; border-radius: 10px; padding: 24px; text-align: center; margin: 24px 0;">
//           <p style="color: #94a3b8; font-size: 13px; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 1px;">Your OTP Code</p>
//           <div style="font-size: 42px; font-weight: 900; letter-spacing: 10px; color: #2dd4bf; font-family: monospace;">
//             ${otp}
//           </div>
//           <p style="color: #64748b; font-size: 12px; margin: 14px 0 0 0;">⏱️ This code expires in <strong style="color: #f87171;">10 minutes</strong></p>
//         </div>
//         <p style="color: #64748b; font-size: 13px; line-height: 1.6;">
//           If you did not create an account on TrueChat, please ignore this email.
//           Do not share this OTP with anyone.
//         </p>
//         <hr style="border: none; border-top: 1px solid #1e293b; margin: 24px 0;" />
//         <p style="text-align: center; color: #475569; font-size: 12px; margin: 0;">
//           © 2025 TrueChat · Secure Messaging Platform
//         </p>
//       </div>
//     `,
//   };
//   await transporter.sendMail(mailOptions);
// };


import dotenv from "dotenv";
dotenv.config();

import nodemailer from "nodemailer";

// Debug (optional - baad me hata dena)
console.log("MAIL USER:", process.env.EMAIL_USER);
console.log("MAIL PASS:", process.env.EMAIL_PASS);

// ✅ FIXED transporter (Render compatible)
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // TLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  connectionTimeout: 10000,
});

// Optional: SMTP verify (debug)
transporter.verify()
  .then(() => console.log("SMTP server is ready ✅"))
  .catch((err) => console.log("SMTP ERROR ❌", err));

// ✅ MAIN FUNCTION
export const sendOtpEmail = async (toEmail, otp, fullname) => {
  try {
    const mailOptions = {
      from: `"TrueChat" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: "Your TrueChat OTP Verification Code",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #0f172a; border-radius: 12px; padding: 32px; color: #fff;">
          <h1 style="text-align: center; font-size: 28px; margin-bottom: 4px;">
            True<span style="color: #2dd4bf;">Chat</span>
          </h1>

          <p style="text-align: center; color: #94a3b8; margin-top: 0; font-size: 14px;">
            Secure Real-Time Messaging
          </p>

          <hr style="border: none; border-top: 1px solid #1e293b; margin: 24px 0;" />

          <h2 style="font-size: 20px; color: #f1f5f9;">Hi ${fullname} 👋</h2>

          <p style="color: #94a3b8;">
            Welcome to TrueChat! Please verify your email using this OTP:
          </p>

          <div style="background: #1e293b; border-radius: 10px; padding: 24px; text-align: center; margin: 24px 0;">
            <p style="color: #94a3b8; font-size: 13px;">Your OTP Code</p>

            <div style="font-size: 42px; font-weight: bold; letter-spacing: 10px; color: #2dd4bf;">
              ${otp}
            </div>

            <p style="color: #f87171; font-size: 12px;">
              ⏱️ Expires in 10 minutes
            </p>
          </div>

          <p style="color: #64748b; font-size: 13px;">
            Do not share this OTP with anyone.
          </p>

          <hr style="border-top: 1px solid #1e293b;" />

          <p style="text-align: center; color: #475569; font-size: 12px;">
            © 2025 TrueChat
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("OTP email sent ✅");

  } catch (error) {
    console.log("Error sending OTP ❌:", error);
    throw error;
  }
};