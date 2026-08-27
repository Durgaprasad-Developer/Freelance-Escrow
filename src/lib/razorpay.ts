// ─────────────────────────────────────────────────────────────────────────────
// razorpay.ts — Razorpay Route SDK wrapper
//
// Covers the full escrow lifecycle:
//   1. createOrder()      → client pays → "escrow lock"
//   2. verifySignature()  → validate webhook/callback authenticity
//   3. createTransfer()   → Route: move funds to Linked Account with hold
//   4. releaseHold()      → Modify Settlement Hold → release to developer
//   5. reverseTransfer()  → Reversal API → refund path
// ─────────────────────────────────────────────────────────────────────────────
import Razorpay from 'razorpay';
import crypto   from 'crypto';

// ── SDK instance (lazy-initialized so missing keys don't crash at import) ─────
let _sdk: Razorpay | null = null;

function getSdk(): Razorpay {
  if (_sdk) return _sdk;
  const keyId     = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    throw new Error('RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be set in .env');
  }
  _sdk = new Razorpay({ key_id: keyId, key_secret: keySecret });
  return _sdk;
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface RazorpayOrder {
  id:         string;   // order_XXXXX
  amount:     number;   // in paise
  currency:   string;
  receipt:    string;
  status:     string;
}

export interface RazorpayTransfer {
  id:          string;   // trf_XXXXX
  source:      string;   // payment_XXXXX
  recipient:   string;   // Linked Account ID
  amount:      number;
  currency:    string;
  on_hold:     boolean;
  on_hold_until: number | null;
}

export interface RazorpayReversal {
  id:          string;   // rvrsl_XXXXX
  transfer_id: string;
  amount:      number;
}

// ── 1. Create a Razorpay Order (client pays → escrow lock) ────────────────────
export async function createOrder(
  amountInr: number,   // rupees, will be converted to paise
  projectId: string,
): Promise<RazorpayOrder> {
  const sdk = getSdk();
  const order = await sdk.orders.create({
    amount:   Math.round(amountInr * 100),   // paise
    currency: 'INR',
    receipt:  `escrow_${projectId.slice(0, 20)}`,
    notes:    { projectId },
  });
  return order as unknown as RazorpayOrder;
}

// ── 2. Verify Razorpay payment signature (prevents spoofed callbacks) ─────────
export function verifySignature(
  orderId:   string,
  paymentId: string,
  signature: string,
): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET!;
  const expected = crypto
    .createHmac('sha256', secret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');
  return expected === signature;
}

// ── 3. Create a held Route Transfer to the Linked Account ─────────────────────
// on_hold: true → funds are transferred but settlement is indefinitely paused.
// The AI verdict later calls releaseHold() or reverseTransfer().
export async function createTransfer(
  paymentId:       string,
  linkedAccountId: string,
  amountInr:       number,
  projectId:       string,
): Promise<RazorpayTransfer> {
  const sdk = getSdk();
  const transfer = await (sdk.payments as any).transfer(paymentId, {
    transfers: [
      {
        account:  linkedAccountId,
        amount:   Math.round(amountInr * 100),
        currency: 'INR',
        on_hold:  true,           // held until AI verdict
        notes:    { projectId },
      },
    ],
  });
  // SDK returns an array under .items; pick the first
  const t = transfer?.items?.[0] ?? transfer;
  return t as RazorpayTransfer;
}

// ── 4. Release the settlement hold → developer receives funds ─────────────────
export async function releaseHold(transferId: string): Promise<RazorpayTransfer> {
  const sdk = getSdk();
  const updated = await (sdk.transfers as any).edit(transferId, {
    on_hold: false,
  });
  return updated as RazorpayTransfer;
}

// ── 5. Reverse a transfer → funds go back to the platform (refund path) ───────
export async function reverseTransfer(
  transferId: string,
  amountInr:  number,
): Promise<RazorpayReversal> {
  const sdk = getSdk();
  const reversal = await (sdk.transfers as any).reverse(transferId, {
    amount: Math.round(amountInr * 100),
  });
  return reversal as RazorpayReversal;
}

// ── 6. Verify webhook signature (server-to-server events) ────────────────────
export function verifyWebhookSignature(
  rawBody:   string,
  signature: string,
  secret:    string,
): boolean {
  const expected = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex');
  return expected === signature;
}

export const razorpay = {
  createOrder,
  verifySignature,
  createTransfer,
  releaseHold,
  reverseTransfer,
  verifyWebhookSignature,
};
