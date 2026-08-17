import bcrypt from "bcryptjs";
import crypto from "crypto";
import User from "../models/User.model.js";
import File from "../models/File.model.js";
import Folder from "../models/Folder.model.js";
import Request from "../models/Request.model.js";
import Contact from "../models/Contact.model.js";
import { deleteFile } from "../services/cloudinary.service.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";
import transporter from "../config/nodemailer.js";

const formatBytes = (bytes) => {
  if (bytes >= 1073741824) return (bytes / 1073741824).toFixed(1) + " GB";
  if (bytes >= 1048576) return (bytes / 1048576).toFixed(1) + " MB";
  if (bytes >= 1024) return (bytes / 1024).toFixed(1) + " KB";
  return bytes + " B";
};

const planLabel = (plan) => {
  const labels = {
    free: "Free",
    starter: "Starter",
    pro: "Pro",
    business: "Business",
  };
  return labels[plan] || plan;
};

const getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      pendingRequests,
      approvedRequests,
      totalFiles,
      storageAgg,
      contactMessages,
    ] = await Promise.all([
      User.countDocuments({ role: "user" }),
      Request.countDocuments({ status: "pending" }),
      Request.countDocuments({ status: "approved" }),
      File.countDocuments({ isDeleted: false }),
      User.aggregate([
        { $group: { _id: null, total: { $sum: "$storageUsed" } } },
      ]),
      Contact.countDocuments(),
    ]);

    const totalStorage = storageAgg[0]?.total || 0;

    return successResponse(res, {
      totalUsers,
      pendingRequests,
      approvedRequests,
      totalFiles,
      totalStorage,
      contactMessages,
    });
  } catch {
    return errorResponse(res, "Failed to fetch stats.", 500);
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: "user" })
      .select(
        "_id name email storageUsed storageLimit createdAt isEmailVerified",
      )
      .sort({ createdAt: -1 });

    return successResponse(res, { users });
  } catch {
    return errorResponse(res, "Failed to fetch users.", 500);
  }
};

const updateUserStorage = async (req, res) => {
  try {
    const { storageLimit } = req.body;

    if (storageLimit === undefined || storageLimit < 0) {
      return errorResponse(res, "Invalid storage limit.", 400);
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { storageLimit },
      { new: true },
    ).select("name email storageUsed storageLimit createdAt isEmailVerified");

    if (!user) {
      return errorResponse(res, "User not found.", 404);
    }

    return successResponse(res, { user }, "Storage updated.");
  } catch {
    return errorResponse(res, "Failed to update storage.", 500);
  }
};

const deleteUser = async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return errorResponse(res, "You cannot delete your own account.", 400);
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return errorResponse(res, "User not found.", 404);
    }

    const files = await File.find({ owner: user._id });

    await Promise.all(
      files.map((file) => deleteFile(file.cloudinaryPublicId).catch(() => {})),
    );

    await File.deleteMany({ owner: user._id });
    await Folder.deleteMany({ owner: user._id });
    await User.findByIdAndDelete(user._id);

    return successResponse(res, null, "User deleted.");
  } catch {
    return errorResponse(res, "Failed to delete user.", 500);
  }
};

const getAllRequests = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status && req.query.status !== "all") {
      filter.status = req.query.status;
    }

    const requests = await Request.find(filter).sort({ createdAt: -1 });

    return successResponse(res, { requests });
  } catch {
    return errorResponse(res, "Failed to fetch requests.", 500);
  }
};

const approveRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) {
      return errorResponse(res, "Request not found.", 404);
    }

    if (request.status !== "pending") {
      return errorResponse(res, "Request already processed.", 400);
    }

    const existingUser = await User.findOne({ email: request.email });
    let user;

    if (existingUser) {
      if (existingUser.role !== "user") {
        return errorResponse(
          res,
          "Cannot approve request for this account.",
          400,
        );
      }

      user = existingUser;
      user.storageLimit = request.storageBytes;
      user.plan = request.plan;
      user.planStatus = "active";
      user.planExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      user.lastPaymentDate = new Date();
      user.gracePeriodStart = null;
      user.isActive = true;
      await user.save();

      await File.updateMany(
        { owner: user._id, isDeleted: true, deletedByExpiry: true },
        { isDeleted: false, deletedAt: null, deletedByExpiry: false },
      );

      request.userId = user._id;
    } else {
      const setupToken = crypto.randomBytes(32).toString("hex");
      const setupTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

      user = await User.create({
        name: request.name,
        email: request.email,
        password: null,
        role: "user",
        isEmailVerified: true,
        isActive: false,
        storageLimit: request.storageBytes,
        storageUsed: 0,
        plan: request.plan,
        setupToken,
        setupTokenExpiry,
        planExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        planStatus: "active",
        lastPaymentDate: new Date(),
      });

      request.userId = user._id;
    }

    request.status = "approved";
    await request.save();

    const storageLabel = formatBytes(request.storageBytes);
    const planName = planLabel(request.plan);
    const isExistingUser = Boolean(existingUser);

    const emailBody = isExistingUser
      ? `
        <tr>
          <td style="color:#ffffff;font-size:16px;line-height:24px;padding-bottom:16px;">
            Hi ${request.name},
          </td>
        </tr>
        <tr>
          <td style="color:#a1a1aa;font-size:14px;line-height:22px;padding-bottom:24px;">
            Your CloudStore subscription has been renewed. Your storage has been updated and your locked files have been restored to your account.
          </td>
        </tr>
        <tr>
          <td style="padding-bottom:24px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#27272a;border-radius:8px;padding:20px;">
              <tr><td style="color:#a1a1aa;font-size:13px;padding-bottom:8px;">Plan</td><td style="color:#ffffff;font-size:13px;text-align:right;">${planName}</td></tr>
              <tr><td style="color:#a1a1aa;font-size:13px;">Storage</td><td style="color:#ffffff;font-size:13px;text-align:right;">${storageLabel}</td></tr>
            </table>
          </td>
        </tr>
        <tr>
          <td align="center" style="padding-bottom:24px;">
            <a href="${process.env.CLIENT_URL}/dashboard" style="background-color:#2563eb;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:6px;font-size:14px;font-weight:600;display:inline-block;">Go to Dashboard</a>
          </td>
        </tr>
        <tr>
          <td style="color:#71717a;font-size:12px;line-height:18px;padding-top:20px;border-top:1px solid #27272a;">
            If you did not request this, please contact support immediately.
          </td>
        </tr>
      `
      : `
        <tr>
          <td style="color:#ffffff;font-size:16px;line-height:24px;padding-bottom:16px;">
            Hi ${request.name},
          </td>
        </tr>
        <tr>
          <td style="color:#a1a1aa;font-size:14px;line-height:22px;padding-bottom:24px;">
            Your CloudStore account has been approved!
          </td>
        </tr>
        <tr>
          <td style="padding-bottom:24px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#27272a;border-radius:8px;padding:20px;">
              <tr><td style="color:#a1a1aa;font-size:13px;padding-bottom:8px;">Plan</td><td style="color:#ffffff;font-size:13px;text-align:right;">${planName}</td></tr>
              <tr><td style="color:#a1a1aa;font-size:13px;">Storage</td><td style="color:#ffffff;font-size:13px;text-align:right;">${storageLabel}</td></tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="color:#a1a1aa;font-size:14px;line-height:22px;padding-bottom:24px;">
            Click the button below to set your password. This link expires in 24 hours.
          </td>
        </tr>
        <tr>
          <td align="center" style="padding-bottom:24px;">
            <a href="${process.env.CLIENT_URL}/set-password?token=${setupToken}" style="background-color:#2563eb;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:6px;font-size:14px;font-weight:600;display:inline-block;">Set Up My Account</a>
          </td>
        </tr>
        <tr>
          <td style="color:#71717a;font-size:12px;line-height:18px;padding-top:20px;border-top:1px solid #27272a;">
            If you did not request this, please ignore this email.
          </td>
        </tr>
      `;

    await transporter.sendMail({
      from: `"CloudStore" <${process.env.EMAIL_USER}>`,
      to: request.email,
      subject: isExistingUser
        ? "CloudStore — Your plan has been renewed"
        : "Set up your CloudStore account",
      html: `
        <!DOCTYPE html>
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
                    ${emailBody}
                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
    });

    const responseMessage = isExistingUser
      ? "Request approved and locked files restored."
      : "Account created and setup email sent.";

    return successResponse(res, null, responseMessage);
  } catch {
    return errorResponse(res, "Failed to approve request.", 500);
  }
};

const rejectRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) {
      return errorResponse(res, "Request not found.", 404);
    }

    if (request.status !== "pending") {
      return errorResponse(res, "Request already processed.", 400);
    }

    request.status = "rejected";
    await request.save();

    await transporter.sendMail({
      from: `"CloudStore" <${process.env.EMAIL_USER}>`,
      to: request.email,
      subject: "CloudStore Request Update",
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
                        Hi ${request.name},
                      </td>
                    </tr>
                    <tr>
                      <td style="color:#a1a1aa;font-size:14px;line-height:22px;padding-bottom:24px;">
                        We're sorry, your CloudStore access request has been rejected.
                        Feel free to contact us for more information.
                      </td>
                    </tr>
                    <tr>
                      <td style="color:#71717a;font-size:12px;line-height:18px;padding-top:20px;border-top:1px solid #27272a;">
                        If you believe this is a mistake, please reach out to our support team.
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

    return successResponse(res, null, "Request rejected.");
  } catch {
    return errorResponse(res, "Failed to reject request.", 500);
  }
};

const updateRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["pending", "approved", "rejected"].includes(status)) {
      return errorResponse(res, "Invalid status.", 400);
    }

    const request = await Request.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true },
    );

    if (!request) {
      return errorResponse(res, "Request not found.", 404);
    }

    return successResponse(res, { request }, "Status updated.");
  } catch {
    return errorResponse(res, "Failed to update status.", 500);
  }
};

const getAllContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    return successResponse(res, { contacts });
  } catch {
    return errorResponse(res, "Failed to fetch contacts.", 500);
  }
};

const deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);
    if (!contact) {
      return errorResponse(res, "Contact not found.", 404);
    }
    return successResponse(res, null, "Contact deleted.");
  } catch {
    return errorResponse(res, "Failed to delete contact.", 500);
  }
};

export {
  getDashboardStats,
  getAllUsers,
  updateUserStorage,
  deleteUser,
  getAllRequests,
  approveRequest,
  rejectRequest,
  updateRequestStatus,
  getAllContacts,
  deleteContact,
};
