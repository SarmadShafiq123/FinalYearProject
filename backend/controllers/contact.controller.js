import Contact from "../models/Contact.model.js"
import { successResponse, errorResponse } from "../utils/apiResponse.js"

export const submitContact = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body

    if (!name || !email || !subject || !message) {
      return errorResponse(res, "All fields are required.", 400)
    }

    const newContact = await Contact.create({ name, email, subject, message })

    return successResponse(
      res,
      { contact: newContact },
      "Message received. We'll get back to you within 24 hours.",
      201
    )
  } catch (error) {
    return errorResponse(res, "Failed to submit message.", 500)
  }
}
