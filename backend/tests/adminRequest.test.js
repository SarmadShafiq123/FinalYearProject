import request from "supertest";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../server.js";
import User from "../models/User.model.js";
import RequestModel from "../models/Request.model.js";
import File from "../models/File.model.js";

let mongoServer;
let adminToken;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongoServer.getUri();
  process.env.JWT_SECRET = "testsecret";

  await mongoose.connect(process.env.MONGO_URI);

  const admin = await User.create({
    name: "Test Admin",
    email: "admin@test.com",
    password: "hashedpassword",
    role: "masterAdmin",
    isEmailVerified: true,
    isActive: true,
  });

  adminToken = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("Admin request approval", () => {
  it("should approve a request and restore expiry deleted files for existing users", async () => {
    const existingUser = await User.create({
      name: "Existing User",
      email: "user@test.com",
      password: "hashedpassword",
      role: "user",
      isEmailVerified: true,
      isActive: false,
      storageLimit: 1024,
      plan: "starter",
      planStatus: "locked",
      planExpiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    });

    const file = await File.create({
      owner: existingUser._id,
      originalName: "test.txt",
      encryptedName: "encrypted-test.txt",
      cloudinaryPublicId: "abc123",
      cloudinaryUrl: "https://example.com/test.txt",
      mimeType: "text/plain",
      size: 100,
      isDeleted: true,
      deletedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      deletedByExpiry: true,
    });

    const requestEntry = await RequestModel.create({
      name: "Existing User",
      email: "user@test.com",
      plan: "pro",
      storageBytes: 2147483648,
    });

    const response = await request(app)
      .patch(`/api/admin/requests/${requestEntry._id}/approve`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send();

    expect(response.status).toBe(200);

    const updatedUser = await User.findOne({ email: "user@test.com" });
    expect(updatedUser.planStatus).toBe("active");
    expect(updatedUser.plan).toBe("pro");

    const restoredFile = await File.findById(file._id);
    expect(restoredFile.isDeleted).toBe(false);
    expect(restoredFile.deletedByExpiry).toBe(false);
  });
});
