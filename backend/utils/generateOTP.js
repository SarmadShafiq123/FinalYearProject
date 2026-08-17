import crypto from "crypto";

const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString().padStart(6, '0');
};

export default generateOTP;
