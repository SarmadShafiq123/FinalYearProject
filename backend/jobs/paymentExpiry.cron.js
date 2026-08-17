import cron from "node-cron";
import File from "../models/File.model.js";
import Folder from "../models/Folder.model.js";
import User from "../models/User.model.js";
import { deleteFile as cloudinaryDelete } from "../services/cloudinary.service.js";
import {
  sendPaymentWarningEmail,
  sendPaymentDueEmail,
  sendStorageLockedEmail,
  sendGraceEmail,
  sendFinalWarningEmail,
  sendFilesDeletedEmail,
} from "../services/email.service.js";

const daysUntil = (date) =>
  Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24));

const daysSince = (date) =>
  Math.floor((new Date() - new Date(date)) / (1000 * 60 * 60 * 24));

const startPaymentExpiryCron = () => {
  cron.schedule("0 6 * * *", async () => {
    try {
      const activeUsers = await User.find({
        planStatus: "active",
        planExpiresAt: { $exists: true, $ne: null },
      });

      for (const user of activeUsers) {
        try {
          const daysLeft = daysUntil(user.planExpiresAt);

          if (daysLeft === 5) {
            await sendPaymentWarningEmail(user, 5).catch(() => {});
          } else if (daysLeft === 2) {
            await sendPaymentWarningEmail(user, 2).catch(() => {});
          } else if (daysLeft === 0) {
            await sendPaymentDueEmail(user).catch(() => {});
          }
        } catch {
          continue;
        }
      }
    } catch {
      // silent
    }

    try {
      const expiredActive = await User.find({
        planStatus: "active",
        planExpiresAt: { $lt: new Date() },
      });

      for (const user of expiredActive) {
        try {
          user.planStatus = "locked";
          user.gracePeriodStart = new Date();
          await user.save();

          await File.updateMany(
            { owner: user._id, isDeleted: false },
            { isDeleted: true, deletedAt: new Date(), deletedByExpiry: true },
          );

          await sendStorageLockedEmail(user).catch(() => {});
        } catch {
          continue;
        }
      }
    } catch {
      // silent
    }

    try {
      const lockedUsers = await User.find({
        planStatus: "locked",
        gracePeriodStart: { $exists: true, $ne: null },
      });

      for (const user of lockedUsers) {
        try {
          const daysSinceLock = daysSince(user.gracePeriodStart);

          if (daysSinceLock === 7) {
            await sendGraceEmail(user, 38).catch(() => {});
          } else if (daysSinceLock === 14) {
            await sendGraceEmail(user, 31).catch(() => {});
          } else if (daysSinceLock === 21) {
            await sendGraceEmail(user, 24).catch(() => {});
          } else if (daysSinceLock === 28) {
            await sendGraceEmail(user, 17).catch(() => {});
          } else if (daysSinceLock === 35) {
            await sendGraceEmail(user, 10).catch(() => {});
          }

          if (daysSinceLock >= 38 && daysSinceLock <= 44) {
            const daysLeft = 45 - daysSinceLock;
            await sendFinalWarningEmail(user, daysLeft).catch(() => {});
          }
        } catch {
          continue;
        }
      }
    } catch {
      // silent
    }

    try {
      const fortyFiveDaysAgo = new Date(Date.now() - 45 * 24 * 60 * 60 * 1000);

      const deleteUsers = await User.find({
        planStatus: "locked",
        gracePeriodStart: { $lte: fortyFiveDaysAgo },
      });

      for (const user of deleteUsers) {
        try {
          const allFiles = await File.find({ owner: user._id });

          for (const file of allFiles) {
            try {
              await cloudinaryDelete(file.cloudinaryPublicId);
            } catch {
              // continue even if cloudinary delete fails
            }
          }

          await File.deleteMany({ owner: user._id });
          await Folder.deleteMany({ owner: user._id });

          user.storageUsed = 0;
          user.storageLimit = 1073741824;
          user.plan = "free";
          user.planStatus = "free";
          user.planExpiresAt = null;
          user.gracePeriodStart = null;
          user.lastPaymentDate = null;
          await user.save();

          await sendFilesDeletedEmail(user).catch(() => {});
        } catch {
          continue;
        }
      }
    } catch {
      // silent
    }
  });
};

export default startPaymentExpiryCron;
