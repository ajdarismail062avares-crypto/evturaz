import express, { Router } from 'express';
import Stripe from 'stripe';
import { prisma } from '../lib/prisma';
import { authenticate } from '../middleware/auth';

export const paymentsRouter = Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' });

paymentsRouter.post('/create-intent', authenticate, async (req: any, res, next) => {
  try {
    const { amount, currency = 'usd', propertyId, type } = req.body;

    let customer = await prisma.user.findUnique({ where: { id: req.user.id }, select: { stripeCustomerId: true, email: true } });
    let customerId = customer?.stripeCustomerId;

    if (!customerId) {
      const sc = await stripe.customers.create({ email: customer!.email });
      customerId = sc.id;
      await prisma.user.update({ where: { id: req.user.id }, data: { stripeCustomerId: customerId } });
    }

    const intent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency,
      customer: customerId,
      metadata: { userId: req.user.id, propertyId, type },
    });

    res.json({ clientSecret: intent.client_secret });
  } catch (err) { next(err); }
});

paymentsRouter.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature']!;
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return res.status(400).send('Webhook Error');
  }

  if (event.type === 'payment_intent.succeeded') {
    const pi = event.data.object as Stripe.PaymentIntent;
    await prisma.payment.create({
      data: {
        userId: pi.metadata.userId,
        propertyId: pi.metadata.propertyId || null,
        stripePaymentId: pi.id,
        amount: pi.amount / 100,
        currency: pi.currency.toUpperCase(),
        status: 'SUCCEEDED',
        type: pi.metadata.type,
      },
    });
  }

  res.json({ received: true });
});

