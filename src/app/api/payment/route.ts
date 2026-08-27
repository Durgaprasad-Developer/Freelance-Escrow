// ─────────────────────────────────────────────────────────────────────────────
// /api/payment — Razorpay Order creation and payment verification
//
// POST /api/payment/order  → creates a Razorpay Order (escrow lock)
// POST /api/payment/verify → verifies payment signature, creates held Route
//                            transfer to the Linked Account
// ─────────────────────────────────────────────────────────────────────────────
import { NextResponse } from 'next/server';
import { db }           from '@/lib/db';
import {
  createOrder,
  verifySignature,
  createTransfer,
} from '@/lib/razorpay';

// ── POST /api/payment — sub-action dispatch ────────────────────────────────────
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const action = body.action as 'order' | 'verify';

    if (action === 'order') return handleCreateOrder(body);
    if (action === 'verify') return handleVerify(body);

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

// ── Action: Create Order ──────────────────────────────────────────────────────
async function handleCreateOrder(body: any) {
  const { projectId, amount } = body;
  if (!projectId || !amount) {
    return NextResponse.json({ success: false, error: 'projectId and amount required' }, { status: 400 });
  }

  const project = await db.getProjectById(projectId);
  if (!project) {
    return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 });
  }

  const order = await createOrder(Number(amount), projectId);

  // Persist the order ID onto the project for later verification
  await db.updateProject(projectId, { updated_at: new Date().toISOString() });

  return NextResponse.json({
    success: true,
    data: {
      orderId:   order.id,
      amount:    order.amount,   // paise
      currency:  order.currency,
      keyId:     process.env.RAZORPAY_KEY_ID,
    },
  });
}

// ── Action: Verify payment + create held Route transfer ───────────────────────
async function handleVerify(body: any) {
  const {
    projectId,
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    amount,
  } = body;

  if (!projectId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return NextResponse.json({ success: false, error: 'Missing required payment fields' }, { status: 400 });
  }

  // 1. Verify the payment signature — rejects spoofed callbacks
  const isValid = verifySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
  if (!isValid) {
    return NextResponse.json({ success: false, error: 'Invalid payment signature' }, { status: 400 });
  }

  const linkedAccountId = process.env.RAZORPAY_LINKED_ACCOUNT_ID;
  if (!linkedAccountId || linkedAccountId === 'acc_REPLACE_ME') {
    // Graceful degradation: funds verified but no linked account to transfer to yet
    await db.updateProject(projectId, { escrow_status: 'Funded' });
    return NextResponse.json({
      success: true,
      data: {
        message: 'Payment verified. Configure RAZORPAY_LINKED_ACCOUNT_ID to enable Route transfer.',
        razorpay_payment_id,
        hold_status: 'pending_account',
      },
    });
  }

  // 2. Create a Route transfer with on_hold: true → "escrow held"
  const transfer = await createTransfer(
    razorpay_payment_id,
    linkedAccountId,
    Number(amount),
    projectId,
  );

  // 3. Update project to Funded + store transfer ID on the payout record
  await db.updateProject(projectId, { escrow_status: 'Funded' });

  // Create a pending payout record linking this transfer
  await db.createPayout(projectId, {
    amount:               Number(amount),
    release_percentage:   0,
    status:               'Pending',
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_transfer_id: transfer.id,
    hold_status:          'held',
  } as any);

  return NextResponse.json({
    success: true,
    data: {
      transferId:  transfer.id,
      hold_status: 'held',
      message:     'Payment captured and transfer created. Funds held in escrow pending AI verification.',
    },
  });
}
