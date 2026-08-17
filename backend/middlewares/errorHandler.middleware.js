import { errorResponse } from "../utils/apiResponse.js"

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500

  if (err.name === "ValidationError") {
    return errorResponse(
      res,
      Object.values(err.errors)
        .map((e) => e.message)
        .join(", "),
      400
    )
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0]
    return errorResponse(res, `${field} already exists.`, 409)
  }

  if (err.name === "CastError") {
    return errorResponse(res, "Invalid resource ID.", 400)
  }

  const message =
    process.env.NODE_ENV === "production" ? "Internal server error" : err.message || "Internal server error"

  return errorResponse(res, message, statusCode)
}

export { errorHandler }
