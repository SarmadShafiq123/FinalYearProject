import { errorResponse } from "../utils/apiResponse.js";

const requireAdmin = (req, res, next) => {
  if (req.user.role !== "masterAdmin") {
    return errorResponse(res, "Access denied.", 403);
  }
  next();
};

export { requireAdmin };
