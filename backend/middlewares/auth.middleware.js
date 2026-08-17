import jwt from "jsonwebtoken";
import User from "../models/User.model.js";
import { errorResponse } from "../utils/apiResponse.js";

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return errorResponse(res, "Unauthorized. No token provided.", 401);
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return errorResponse(res, "Unauthorized. User not found.", 401);
    }

    req.user = user;
    next();
  } catch {
    return errorResponse(res, "Unauthorized. Invalid token.", 401);
  }
};

export { protect };
