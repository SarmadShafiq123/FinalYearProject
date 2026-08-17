import dns from "dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);
dns.setDefaultResultOrder("ipv4first");

import "dotenv/config";
import bcrypt from "bcryptjs";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import mongoSanitize from "express-mongo-sanitize";
import connectDB from "./config/db.js";
import { configureCloudinary } from "./config/cloudinary.js";
import User from "./models/User.model.js";
import authRoutes from "./routes/auth.routes.js";
import fileRoutes from "./routes/file.routes.js";
import folderRoutes from "./routes/folder.routes.js";
import trashRoutes from "./routes/trash.routes.js";
import requestRoutes from "./routes/request.routes.js";
import contactRoutes from "./routes/contact.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import alertRoutes from "./routes/alert.routes.js";
import { errorHandler } from "./middlewares/errorHandler.middleware.js";
import startSelfDestructCron from "./jobs/selfDestruct.cron.js";
import startPaymentExpiryCron from "./jobs/paymentExpiry.cron.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  helmet({
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
  }),
);

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
  "http://127.0.0.1:5175",
  process.env.CLIENT_URL,
  process.env.ADMIN_CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  }),
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(mongoSanitize());

app.use("/api/auth", authRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/folders", folderRoutes);
app.use("/api/trash", trashRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/alerts", alertRoutes);

app.use(errorHandler);

const ensureDefaultAdmin = async () => {
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD?.trim();

  if (!adminEmail || !adminPassword) {
    return;
  }

  const existingUser = await User.findOne({ email: adminEmail });

  if (!existingUser) {
    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    await User.create({
      name: "Master Admin",
      email: adminEmail,
      password: hashedPassword,
      role: "masterAdmin",
      isEmailVerified: true,
      isActive: true,
      storageLimit: 0,
      storageUsed: 0,
    });

    return;
  }

  existingUser.role = "masterAdmin";
  existingUser.isEmailVerified = true;
  existingUser.isActive = true;
  existingUser.password = await bcrypt.hash(adminPassword, 12);

  await existingUser.save();
};

const start = async () => {
  await connectDB();
  await ensureDefaultAdmin();
  configureCloudinary();
  startSelfDestructCron();
  startPaymentExpiryCron();
  app.listen(PORT);
};

if (process.env.NODE_ENV !== "test") {
  start();
}

export default app;
