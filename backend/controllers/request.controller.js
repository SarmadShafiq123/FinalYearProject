import Request from "../models/Request.model.js";
import User from "../models/User.model.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";
import {
  sendRequestConfirmationEmail,
  sendPaymentConfirmationEmail,
} from "../services/email.service.js";
import {
  createPaymentIntent,
  confirmPaymentIntent,
  createOrUpdateCustomer,
} from "../services/stripe.service.js";

const planPrices = {
  free: 0,
  starter: 5,
  pro: 10,
  business: 25,
};

export const submitRequest = async (req, res) => {
  try {
    const { name, email, organization, plan, message, storageBytes } = req.body;

    if (!name || !email || !plan || !storageBytes) {
      return errorResponse(
        res,
        "Name, email, plan, and storage are required",
        400,
      );
    }

    const validPlans = ["free", "starter", "pro", "business"];
    if (!validPlans.includes(plan)) {
      return errorResponse(res, "Invalid plan selected", 400);
    }

    const existingRequest = await Request.findOne({
      email,
      status: "pending",
    });

    if (existingRequest) {
      return errorResponse(
        res,
        "A pending request already exists for this email",
        400,
      );
    }

    const newRequest = await Request.create({
      name,
      email,
      organization: organization || null,
      plan,
      storageBytes,
      message: message || null,
      amount: planPrices[plan],
    });

    await sendRequestConfirmationEmail(email, name, plan).catch(() => {});

    return successResponse(
      res,
      { request: newRequest },
      "Request submitted successfully. We'll contact you within 24 hours.",
      201,
    );
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

export const createPayment = async (req, res) => {
  try {
    // req.user is guaranteed by protect middleware
    const authenticatedUser = req.user;

    const { plan, organization, message } = req.body;
    // Always use the authenticated user's name and email — never trust form input for identity
    const name = authenticatedUser.name;
    const email = authenticatedUser.email;
    const storageBytes = req.body.storageBytes;

    if (!plan || !storageBytes) {
      return errorResponse(res, "Plan and storage are required", 400);
    }

    const validPlans = ["free", "starter", "pro", "business"];
    if (!validPlans.includes(plan)) {
      return errorResponse(res, "Invalid plan selected", 400);
    }

    // Verified email check
    if (!authenticatedUser.isEmailVerified && !authenticatedUser.googleId) {
      return errorResponse(res, "Please verify your email before activating a plan.", 403);
    }

    // ── Already-paid guard ──────────────────────────────────────────────────
    // Block paid-plan re-purchase if the user already has an active paid plan.
    // Allow the request only for: free-plan users, locked/expired users (renewing),
    // or users on the free planStatus who want to upgrade.
    const currentStatus = authenticatedUser.planStatus;
    const isPaidPlan = plan !== "free";

    if (isPaidPlan && currentStatus === "active") {
      // Check how long until the current plan expires
      const expiresAt = authenticatedUser.planExpiresAt;
      const daysLeft = expiresAt
        ? Math.ceil((new Date(expiresAt) - new Date()) / (1000 * 60 * 60 * 24))
        : null;

      const expiryMsg =
        daysLeft !== null && daysLeft > 0
          ? ` Your current plan is active and expires in ${daysLeft} day${daysLeft !== 1 ? "s" : ""}.`
          : " Your current plan is still active.";

      return errorResponse(
        res,
        `You already have an active paid plan.${expiryMsg} No payment is needed until it expires.`,
        409,
      );
    }
    // ───────────────────────────────────────────────────────────────────────

    const amount = planPrices[plan];

    if (amount === 0) {
      // Free plan — update user directly using their authenticated ID
      authenticatedUser.plan = plan;
      authenticatedUser.planStatus = "free";
      authenticatedUser.storageLimit = storageBytes;
      authenticatedUser.storageUsed = Math.min(authenticatedUser.storageUsed || 0, storageBytes);
      authenticatedUser.lastPaymentDate = new Date();
      authenticatedUser.planExpiresAt = null;
      authenticatedUser.gracePeriodStart = null;
      authenticatedUser.isActive = true;
      await authenticatedUser.save();

      const newRequest = await Request.create({
        userId: authenticatedUser._id,
        name,
        email,
        organization: organization || null,
        plan,
        storageBytes,
        message: message || null,
        amount: 0,
        paymentStatus: "completed",
      });

      await sendRequestConfirmationEmail(email, name, plan).catch(() => {});

      return successResponse(
        res,
        { request: newRequest },
        "Free plan activated successfully",
        201,
      );
    }

    const customer = await createOrUpdateCustomer(email, name);
    const paymentIntent = await createPaymentIntent(amount, plan, email, name);

    const newRequest = await Request.create({
      userId: authenticatedUser._id,
      name,
      email,
      organization: organization || null,
      plan,
      storageBytes,
      message: message || null,
      amount,
      stripePaymentIntentId: paymentIntent.id,
      stripeCustomerId: customer.id,
      paymentStatus: "pending",
    });

    return successResponse(
      res,
      {
        request: newRequest,
        clientSecret: paymentIntent.client_secret,
        amount: paymentIntent.amount,
      },
      "Payment intent created successfully",
      201,
    );
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

export const confirmPayment = async (req, res) => {
  try {
    const { paymentIntentId, requestId } = req.body;

    if (!paymentIntentId || !requestId) {
      return errorResponse(
        res,
        "Payment intent ID and request ID are required",
        400,
      );
    }

    const paymentIntent = await confirmPaymentIntent(paymentIntentId);

    if (paymentIntent.status === "succeeded") {
      const request = await Request.findByIdAndUpdate(
        requestId,
        {
          paymentStatus: "completed",
          status: "pending",
        },
        { new: true },
      );

      if (!request) {
        return errorResponse(res, "Request not found.", 404);
      }

      // Use the authenticated user from the JWT — not a lookup by email from the request doc
      const user = req.user;
      user.plan = request.plan;
      user.storageLimit = request.storageBytes;
      user.planStatus = "active";
      user.planExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      user.lastPaymentDate = new Date();
      user.gracePeriodStart = null;
      user.isActive = true;
      await user.save();

      await sendPaymentConfirmationEmail(
        user.email,
        user.name,
        request.plan,
        request.amount,
      ).catch(() => {});

      return successResponse(
        res,
        { request },
        "Payment successful! Your plan has been activated.",
        200,
      );
    } else if (paymentIntent.status === "processing") {
      const request = await Request.findByIdAndUpdate(
        requestId,
        { paymentStatus: "pending" },
        { new: true },
      );

      return successResponse(
        res,
        { request },
        "Payment is being processed",
        200,
      );
    } else {
      await Request.findByIdAndUpdate(
        requestId,
        { paymentStatus: "failed" },
      );

      return errorResponse(res, "Payment failed", 400);
    }
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};
