import "dotenv/config";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import User from "../models/User.model.js";

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  await User.deleteOne({ email: process.env.ADMIN_EMAIL });

  const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 12);

  await User.create({
    name: "Master Admin",
    email: process.env.ADMIN_EMAIL,
    password: hashedPassword,
    role: "masterAdmin",
    isEmailVerified: true,
    isActive: true,
    storageLimit: 0,
    storageUsed: 0,
  });

  process.exit(0);
};

seed().catch(() => {
  process.exit(1);
});
