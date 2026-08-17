import cron from "node-cron";
import File from "../models/File.model.js";
import User from "../models/User.model.js";
import { deleteFile as cloudinaryDelete } from "../services/cloudinary.service.js";
import transporter from "../config/nodemailer.js";

const startSelfDestructCron = () => {
  // Daily cleanup of deleted files (after 30 days)
  cron.schedule("0 0 * * *", async () => {
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const fortyFiveDaysAgo = new Date(Date.now() - 45 * 24 * 60 * 60 * 1000);

      const expiredFiles = await File.find({
        isDeleted: true,
        deletedByExpiry: { $in: [false, null] },
        deletedAt: { $lte: thirtyDaysAgo },
      });

      for (const file of expiredFiles) {
        try {
          await cloudinaryDelete(file.cloudinaryPublicId);

          const user = await User.findById(file.owner);
          if (user) {
            user.storageUsed = Math.max(user.storageUsed - file.size, 0);
            await user.save();
          }

          await File.findByIdAndDelete(file._id);
        } catch (fileErr) {
          continue;
        }
      }

      const expiryBackupFiles = await File.find({
        isDeleted: true,
        deletedByExpiry: true,
        deletedAt: { $lte: fortyFiveDaysAgo },
      });

      for (const file of expiryBackupFiles) {
        try {
          await cloudinaryDelete(file.cloudinaryPublicId);

          const user = await User.findById(file.owner);
          if (user) {
            user.storageUsed = Math.max(user.storageUsed - file.size, 0);
            await user.save();
          }

          await File.findByIdAndDelete(file._id);
        } catch (fileErr) {
          continue;
        }
      }
    } catch (cronErr) {
      return;
    }
  });

  // Daily check for full storage users (storage full for 30+ days)
  cron.schedule("0 2 * * *", async () => {
    try {
      // Find users with full storage
      const fullStorageUsers = await User.find({
        $expr: { $gte: ["$storageUsed", "$storageLimit"] },
      });

      for (const user of fullStorageUsers) {
        try {
          // Check when storage became full
          const userFiles = await File.find({
            owner: user._id,
            isDeleted: false,
          });

          if (userFiles.length === 0) continue;

          const oldestFile = userFiles.sort(
            (a, b) => a.createdAt - b.createdAt,
          )[0];
          const storageFullSince = new Date(oldestFile.createdAt);
          const daysFullStorage = Math.floor(
            (Date.now() - storageFullSince) / (24 * 60 * 60 * 1000),
          );

          // If storage has been full for more than 30 days, delete all files
          if (daysFullStorage >= 30) {
            // Send warning email
            await transporter
              .sendMail({
                from: `"CloudStore" <${process.env.EMAIL_USER}>`,
                to: user.email,
                subject: "⚠️ URGENT: Your CloudStore Data is Being Deleted",
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
                                <div style="width:60px;height:60px;background-color:#dc2626;border-radius:50%;display:flex;align-items:center;justify-content:center;">
                                  <span style="color:#ffffff;font-size:32px;">⚠️</span>
                                </div>
                              </td>
                            </tr>
                            <tr>
                              <td align="center" style="padding-bottom:24px;">
                                <h1 style="color:#dc2626;font-size:22px;font-weight:700;margin:0;">URGENT: Data Deletion Notice</h1>
                              </td>
                            </tr>
                            <tr>
                              <td style="color:#ffffff;font-size:16px;line-height:24px;padding-bottom:16px;">
                                Hi ${user.name},
                              </td>
                            </tr>
                            <tr>
                              <td style="color:#a1a1aa;font-size:14px;line-height:22px;padding-bottom:24px;">
                                Your CloudStore storage has been completely full for over 30 days. Per our terms of service, 
                                <strong style="color:#fca5a5;">all your files are being deleted immediately</strong>.
                              </td>
                            </tr>
                            <tr>
                              <td style="background-color:#7f1d1d;border-left:4px solid #dc2626;border-radius:4px;padding:16px;margin-bottom:24px;">
                                <p style="color:#fca5a5;font-size:13px;margin:0;font-weight:600;">
                                  This is an automatic process. Your data cannot be recovered after deletion.
                                </p>
                              </td>
                            </tr>
                            <tr>
                              <td style="color:#a1a1aa;font-size:14px;line-height:22px;padding-bottom:24px;">
                                <strong style="color:#ffffff;">What to do:</strong>
                                <ul style="margin:8px 0;padding-left:20px;">
                                  <li>Upgrade your plan to prevent future deletions</li>
                                  <li>Contact support immediately if this is an error</li>
                                  <li>Download your backup data if you saved it</li>
                                </ul>
                              </td>
                            </tr>
                            <tr>
                              <td align="center" style="padding-bottom:24px;">
                                <a href="${process.env.CLIENT_URL}/pricing" style="background-color:#2563eb;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:6px;font-size:14px;font-weight:600;display:inline-block;">Upgrade Plan Now</a>
                              </td>
                            </tr>
                            <tr>
                              <td style="color:#71717a;font-size:12px;line-height:18px;padding-top:20px;border-top:1px solid #27272a;">
                                If you have any questions, please contact our support team immediately.
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

            // Delete all files
            const filesToDelete = await File.find({
              owner: user._id,
              isDeleted: false,
            });

            for (const file of filesToDelete) {
              try {
                await cloudinaryDelete(file.cloudinaryPublicId);
                await File.findByIdAndDelete(file._id);
              } catch {
                continue;
              }
            }

            // Reset user storage
            user.storageUsed = 0;
            await user.save();
          }
        } catch (userErr) {
          continue;
        }
      }
    } catch (cronErr) {
      return;
    }
  });
};

export default startSelfDestructCron;
