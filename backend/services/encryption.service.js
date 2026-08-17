import crypto from "crypto";

const ALGORITHM = "aes-256-cbc";
const IV_LENGTH = 16;

const getKey = (userId) => {
  const secret = process.env.ENCRYPTION_SECRET;
  return crypto.scryptSync(secret + userId, "salt", 32);
};

const encrypt = (buffer, userId) => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const key = getKey(userId);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
  return Buffer.concat([iv, encrypted]);
};

const decrypt = (buffer, userId) => {
  const iv = buffer.subarray(0, IV_LENGTH);
  const encryptedData = buffer.subarray(IV_LENGTH);
  const key = getKey(userId);
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  return Buffer.concat([decipher.update(encryptedData), decipher.final()]);
};

const generateFileHash = (buffer) => {
  return crypto.createHash("sha256").update(buffer).digest("hex");
};

export { encrypt, decrypt, generateFileHash };
