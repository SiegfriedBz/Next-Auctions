import { buffer } from "micro";
import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { updateAuctionPaidAt } from "@/actions/auctions/update-auction-paid-at";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY ?? "";
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET ?? "";

export const config = {
  api: {
    bodyParser: false, // Stripe requires raw body to verify signature
  },
};

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: "2025-11-17.clover",
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // Only allow POST requests
  if (req.method !== "POST") return res.status(405).end("Method Not Allowed");

  // Step 1: Read raw request body
  const buf = await buffer(req);

  // Step 2: Get Stripe signature from headers
  const sig = req.headers["stripe-signature"] as string;
  if (!sig) return res.status(400).send("Missing Stripe signature");

  let event: Stripe.Event;

  // Step 3: Verify that the event came from Stripe
  try {
    event = stripe.webhooks.constructEvent(buf, sig, STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error(`Webhook Error: ${(err as Error).message}`);
    return res.status(400).send(`Webhook Error: ${(err as Error).message}`);
  }

  // Step 4: Handle checkout session completion
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    // Retrieve auctionId from session metadata
    const auctionId = session.metadata?.auctionId;

    if (!auctionId) {
      console.warn("Webhook received without auctionId in metadata");
      return res.status(400).send("Missing auctionId");
    }

    // Step 5: Update auction's paidAt timestamp in DB
    try {
      const updated = await updateAuctionPaidAt({
        id: auctionId,
        paidAt: new Date(),
      });
      if (!updated.success) throw new Error("Failed to update auction");
    } catch (err) {
      console.error(`Update Error: ${(err as Error).message}`);
      return res.status(500).send(`Update Error: ${(err as Error).message}`);
    }
  }

  // Step 6: Return 200 for all events to prevent Stripe from retrying
  return res.status(200).send("OK");
}

/** Tested locally with
  - stripe trigger checkout.session.completed
  - stripe listen --forward-to localhost:3000/api/stripe/webhook
*/
