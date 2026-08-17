import nodemailer from "nodemailer";

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.error("[NODEMAILER] WARNING: EMAIL_USER or EMAIL_PASS is not set. Email sending will fail.");
} else {
  console.log(`[NODEMAILER] Email transport configured for: ${process.env.EMAIL_USER}`);
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export default transporter;
