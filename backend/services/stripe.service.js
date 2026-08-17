import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createPaymentIntent = async (amount, planId, email, name) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: "usd",
      description: `CloudStore ${planId} plan`,
      receipt_email: email,
      metadata: {
        plan: planId,
        customerName: name,
        customerEmail: email,
      },
    });

    return paymentIntent;
  } catch (error) {
    throw new Error(`Failed to create payment intent: ${error.message}`);
  }
};

export const confirmPaymentIntent = async (paymentIntentId) => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return paymentIntent;
  } catch (error) {
    throw new Error(`Failed to retrieve payment intent: ${error.message}`);
  }
};

export const createOrUpdateCustomer = async (email, name) => {
  try {
    const customers = await stripe.customers.list({
      email: email,
      limit: 1,
    });

    if (customers.data.length > 0) {
      return customers.data[0];
    }

    const customer = await stripe.customers.create({
      email: email,
      name: name,
    });

    return customer;
  } catch (error) {
    throw new Error(`Failed to create customer: ${error.message}`);
  }
};

export const refundPayment = async (paymentIntentId) => {
  try {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
    });
    return refund;
  } catch (error) {
    throw new Error(`Failed to refund payment: ${error.message}`);
  }
};
