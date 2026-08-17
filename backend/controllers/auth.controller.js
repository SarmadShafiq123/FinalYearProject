import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";
import { OAuth2Client } from "google-auth-library";
import User from "../models/User.model.js";
import generateToken from "../utils/generateToken.js";
import generateOTP from "../utils/generateOTP.js";
import { sendOTPEmail } from "../services/email.service.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";
import transporter from "../config/nodemailer.js";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, errors.array()[0].msg, 400);
    }

    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return errorResponse(res, "Email already registered.", 409);
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      plan: "free",
      planStatus: "inactive",
      storageLimit: 1073741824,
      storageUsed: 0,
    });

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    let emailSent = true;
    try {
      await sendOTPEmail(email, name, otp);
    } catch (emailErr) {
      emailSent = false;
      console.error("[REGISTER] sendOTPEmail failed:", emailErr.message, emailErr.code || "");
    }

    const token = generateToken(user._id);

    return successResponse(
      res,
      {
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          storageUsed: user.storageUsed,
          storageLimit: user.storageLimit,
          isEmailVerified: user.isEmailVerified,
          googleId: user.googleId,
        },
        emailSent,
      },
      emailSent
        ? "Account created. Please verify your email."
        : "Account created but we could not send the verification email. Please use Resend OTP.",
      201,
    );
  } catch (err) {
    console.error("[REGISTER] Unexpected error:", err.message);
    return errorResponse(res, "Registration failed.", 500);
  }
};

const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, errors.array()[0].msg, 400);
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !user.password) {
      return errorResponse(res, "Invalid credentials.", 401);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return errorResponse(res, "Invalid credentials.", 401);
    }

    if (!user.isActive) {
      return errorResponse(
        res,
        "Account setup incomplete. Please check your email for the setup link.",
        403,
      );
    }

    if (!user.isEmailVerified && !user.googleId) {
      const otp = generateOTP();
      const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

      user.otp = otp;
      user.otpExpiry = otpExpiry;
      await user.save();

      await sendOTPEmail(user.email, user.name, otp).catch((emailErr) => {
        console.error("[LOGIN] sendOTPEmail failed:", emailErr.message, emailErr.code || "");
      });

      const token = generateToken(user._id);
      res.setHeader("Authorization", `Bearer ${token}`);

      return errorResponse(
        res,
        "Email not verified. New OTP sent to your email.",
        403,
      );
    }

    const token = generateToken(user._id);

    return successResponse(res, {
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        storageUsed: user.storageUsed,
        storageLimit: user.storageLimit,
        isEmailVerified: user.isEmailVerified,
        googleId: user.googleId,
        isActive: user.isActive,
        plan: user.plan,
        planStatus: user.planStatus,
        planExpiresAt: user.planExpiresAt,
        lastPaymentDate: user.lastPaymentDate,
      },
    });
  } catch (err) {
    return errorResponse(res, "Login failed.", 500);
  }
};

const googleLogin = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return errorResponse(res, "ID token is required.", 400);
    }

    let ticket;
    try {
      ticket = await client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
    } catch {
      return errorResponse(res, "Invalid Google token.", 400);
    }

    const payload = ticket.getPayload();
    const { name, email, sub } = payload;

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name,
        email,
        googleId: sub,
        password: null,
        role: "user",
        isEmailVerified: true,
        isActive: true,
        plan: "free",
        planStatus: "inactive",
        storageLimit: 1073741824,
        storageUsed: 0,
      });
    } else {
      if (!user.googleId) {
        user.googleId = sub;
      }
      user.isEmailVerified = true;
      user.isActive = true;
      await user.save();
    }

    const token = generateToken(user._id);

    return successResponse(res, {
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        storageUsed: user.storageUsed,
        storageLimit: user.storageLimit,
        isEmailVerified: user.isEmailVerified,
        googleId: user.googleId,
        isActive: user.isActive,
        plan: user.plan,
        planStatus: user.planStatus,
        planExpiresAt: user.planExpiresAt,
        lastPaymentDate: user.lastPaymentDate,
      },
    });
  } catch (err) {
    return errorResponse(res, "Authentication failed.", 500);
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      "-password -otp -otpExpiry",
    );
    return successResponse(res, { user });
  } catch (err) {
    return errorResponse(res, "Failed to fetch user.", 500);
  }
};

const verifyOTP = async (req, res) => {
  try {
    const { otp } = req.body;

    if (!otp || otp.length !== 6) {
      return errorResponse(res, "Invalid OTP format.", 400);
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return errorResponse(res, "User not found.", 404);
    }

    if (user.isEmailVerified) {
      return errorResponse(res, "Email already verified.", 400);
    }

    if (!user.otp || !user.otpExpiry) {
      return errorResponse(res, "No OTP found. Please request a new one.", 400);
    }

    if (user.otpExpiry < Date.now()) {
      user.otp = null;
      user.otpExpiry = null;
      await user.save();
      return errorResponse(
        res,
        "OTP has expired. Please request a new one.",
        400,
      );
    }

    const otpMatch = crypto.timingSafeEqual(
      Buffer.from(user.otp),
      Buffer.from(otp),
    );

    if (!otpMatch) {
      return errorResponse(res, "Invalid OTP.", 400);
    }

    user.isEmailVerified = true;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    return successResponse(res, null, "Email verified successfully.");
  } catch (err) {
    return errorResponse(res, "Verification failed.", 500);
  }
};

const resendOTP = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return errorResponse(res, "User not found.", 404);
    }

    if (user.isEmailVerified) {
      return errorResponse(res, "Email already verified.", 400);
    }

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    try {
      await sendOTPEmail(user.email, user.name, otp);
    } catch (emailErr) {
      console.error("[RESEND OTP] sendOTPEmail failed:", emailErr.message, emailErr.code || "");
      return errorResponse(res, "Failed to send OTP. Please try again later.", 500);
    }

    return successResponse(res, null, "OTP sent to your email.");
  } catch (err) {
    return errorResponse(res, "Failed to send OTP.", 500);
  }
};

const adminForgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email, role: "masterAdmin" });
    if (!user) {
      return errorResponse(res, "Admin account not found.", 404);
    }

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    await transporter.sendMail({
      from: `"CloudStore" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Admin Password Reset OTP",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin:0;padding:0;background-color:#09090b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#09090b;padding:40px 20px;">
              <tr>
                <td align="center">
                  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background-color:#18181b;border-radius:8px;padding:40px;">
                    <tr>
                      <td align="center" style="padding-bottom:30px;">
                        <h1 style="color:#ffffff;font-size:24px;font-weight:700;margin:0;">CloudStore Admin</h1>
                      </td>
                    </tr>
                    <tr>
                      <td style="color:#a1a1aa;font-size:14px;line-height:20px;padding-bottom:30px;">
                        Your password reset code is:
                      </td>
                    </tr>
                    <tr>
                      <td align="center" style="padding-bottom:30px;">
                        <div style="background-color:#27272a;border-radius:8px;padding:20px;display:inline-block;">
                          <span style="color:#ffffff;font-size:32px;font-weight:700;letter-spacing:8px;">${otp}</span>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td style="color:#a1a1aa;font-size:14px;line-height:20px;padding-bottom:20px;">
                        This code expires in 10 minutes.
                      </td>
                    </tr>
                    <tr>
                      <td style="color:#71717a;font-size:12px;line-height:18px;padding-top:20px;border-top:1px solid #27272a;">
                        If you did not request this, please ignore this email.
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
    });

    return successResponse(res, null, "OTP sent to your email.");
  } catch {
    return errorResponse(res, "Failed to send OTP.", 500);
  }
};

const adminVerifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email, role: "masterAdmin" });
    if (!user) {
      return errorResponse(res, "Admin account not found.", 404);
    }

    if (!user.otp || !user.otpExpiry) {
      return errorResponse(res, "No OTP found. Please request a new one.", 400);
    }

    if (user.otpExpiry < Date.now()) {
      user.otp = null;
      user.otpExpiry = null;
      await user.save();
      return errorResponse(
        res,
        "OTP has expired. Please request a new one.",
        400,
      );
    }

    const otpMatch = crypto.timingSafeEqual(
      Buffer.from(user.otp),
      Buffer.from(otp),
    );
    if (!otpMatch) {
      return errorResponse(res, "Invalid OTP.", 400);
    }

    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    const resetToken = jwt.sign(
      { id: user._id, purpose: "adminReset" },
      process.env.JWT_SECRET,
      { expiresIn: "15m" },
    );

    return successResponse(res, { resetToken }, "OTP verified.");
  } catch {
    return errorResponse(res, "Verification failed.", 500);
  }
};

const adminResetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;

    if (!resetToken || !newPassword) {
      return errorResponse(
        res,
        "Reset token and new password are required.",
        400,
      );
    }

    let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    } catch {
      return errorResponse(res, "Invalid or expired reset token.", 400);
    }

    if (decoded.purpose !== "adminReset") {
      return errorResponse(res, "Invalid reset token.", 400);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await User.findByIdAndUpdate(decoded.id, { password: hashedPassword });

    return successResponse(res, null, "Password reset successfully.");
  } catch {
    return errorResponse(res, "Failed to reset password.", 500);
  }
};

const setupPassword = async (req, res) => {
  try {
    const { token, password, confirmPassword } = req.body;

    if (!token || !password || !confirmPassword) {
      return errorResponse(
        res,
        "Token, password, and confirmPassword are required.",
        400,
      );
    }

    if (password.length < 8) {
      return errorResponse(res, "Password must be at least 8 characters.", 400);
    }

    if (password !== confirmPassword) {
      return errorResponse(res, "Passwords do not match.", 400);
    }

    const user = await User.findOne({
      setupToken: token,
      setupTokenExpiry: { $gt: new Date() },
      isActive: false,
    });

    if (!user) {
      return errorResponse(res, "Invalid or expired setup link.", 400);
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    user.password = hashedPassword;
    user.isActive = true;
    user.setupToken = null;
    user.setupTokenExpiry = null;
    await user.save();

    return successResponse(
      res,
      null,
      "Password set successfully. You can now log in.",
    );
  } catch {
    return errorResponse(res, "Failed to set password.", 500);
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return errorResponse(res, "Email is required.", 400);
    }

    const user = await User.findOne({ email });

    if (user) {
      const resetToken = crypto.randomBytes(32).toString("hex");
      const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);

      user.resetToken = resetToken;
      user.resetTokenExpiry = resetTokenExpiry;
      await user.save();

      await transporter
        .sendMail({
          from: `"CloudStore" <${process.env.EMAIL_USER}>`,
          to: user.email,
          subject: "Reset your CloudStore password",
          html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin:0;padding:0;background-color:#09090b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#09090b;padding:40px 20px;">
                <tr>
                  <td align="center">
                    <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background-color:#18181b;border-radius:8px;padding:40px;">
                      <tr>
                        <td align="center" style="padding-bottom:30px;">
                          <h1 style="color:#ffffff;font-size:24px;font-weight:700;margin:0;">CloudStore</h1>
                        </td>
                      </tr>
                      <tr>
                        <td style="color:#ffffff;font-size:16px;line-height:24px;padding-bottom:16px;">
                          Hi ${user.name},
                        </td>
                      </tr>
                      <tr>
                        <td style="color:#a1a1aa;font-size:14px;line-height:22px;padding-bottom:24px;">
                          We received a request to reset your password.
                        </td>
                      </tr>
                      <tr>
                        <td align="center" style="padding-bottom:24px;">
                          <a href="${process.env.CLIENT_URL}/reset-password?token=${resetToken}" style="background-color:#2563eb;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:6px;font-size:14px;font-weight:600;display:inline-block;">Reset Password</a>
                        </td>
                      </tr>
                      <tr>
                        <td style="color:#a1a1aa;font-size:14px;line-height:20px;padding-bottom:20px;">
                          This link expires in 1 hour.
                        </td>
                      </tr>
                      <tr>
                        <td style="color:#71717a;font-size:12px;line-height:18px;padding-top:20px;border-top:1px solid #27272a;">
                          If you didn't request this, ignore this email. Your password won't change.
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </body>
          </html>
        `,
        })
        .catch(() => {});
    }

    return successResponse(
      res,
      null,
      "If this email is registered, a reset link has been sent.",
    );
  } catch {
    return errorResponse(res, "Failed to process request.", 500);
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, password, confirmPassword } = req.body;

    if (!token || !password || !confirmPassword) {
      return errorResponse(
        res,
        "Token, password, and confirmPassword are required.",
        400,
      );
    }

    if (password.length < 8) {
      return errorResponse(res, "Password must be at least 8 characters.", 400);
    }

    if (password !== confirmPassword) {
      return errorResponse(res, "Passwords do not match.", 400);
    }

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: new Date() },
    });

    if (!user) {
      return errorResponse(res, "Invalid or expired reset link.", 400);
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    user.password = hashedPassword;
    user.resetToken = null;
    user.resetTokenExpiry = null;
    await user.save();

    return successResponse(
      res,
      null,
      "Password reset successfully. You can now log in.",
    );
  } catch {
    return errorResponse(res, "Failed to reset password.", 500);
  }
};

export {
  register,
  login,
  googleLogin,
  getMe,
  verifyOTP,
  resendOTP,
  adminForgotPassword,
  adminVerifyOTP,
  adminResetPassword,
  setupPassword,
  forgotPassword,
  resetPassword,
};
