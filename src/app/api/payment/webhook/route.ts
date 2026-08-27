// ─────────────────────────────────────────────────────────────────────────────
// /api/payment/webhook — Razorpay webhook receiver
//
// Handles server-to-server events from Razorpay:
//   payment.captured  → confirm escrow is funded
//   transfer.processed → log settlement state
//
// Register this URL in Razorpay Dashboard → Webhooks:
//   https://your-domain.com/api/payment/webhook
// ─────────────────────────────────────────────────────────────────────────────
import { NextResponse }        from 'next/server';
import { verifyWebhookSignature } from '@/lib/razorpay';
import { db }                  from '@/lib/db';
import { logger }              from '@/lib/logger';

const webhookLog = logger.child({ module: 'razorpay-webhook' });

export async function POST(req: Request) {
  try {
    const rawBody  = await req.text();
    const signature = req.headers.get('x-razorpay-signature') ?? '';
    const secret   = process.env.RAZORPAY_WEBHOOK_SECRET ?? '';

    // Verify webhook authenticity
    if (secret && secret !== 'REPLACE_ME') {
      const isValid = verifyWebhookSignature(rawBody, signature, secret);
      if (!isValid) {
        webhookLog.warn({ signature }, 'Invalid Razorpay webhook signature');
        return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
      }
    }

    const event = JSON.parse(rawBody);
    const eventType = event.event as string;

    // ── payment.captured ─────────────────────────────────────────────────────
    if (eventType === 'payment.captured') {
      const payment   = event.payload?.payment?.entity;
      const projectId = payment?.notes?.projectId;
      if (projectId) {
        await db.updateProject(projectId, { escrow_status: 'Funded' });
        webhookLog.info({ eventType, projectId, amountInr: payment.amount / 100 }, 'Escrow payment captured');
      }
    }

    // ── transfer.processed ───────────────────────────────────────────────────
    if (eventType === 'transfer.processed') {
      const transfer  = event.payload?.transfer?.entity;
      const projectId = transfer?.notes?.projectId;
      if (projectId) {
        webhookLog.info({ eventType, projectId, transferId: transfer.id, onHold: transfer.on_hold }, 'Route transfer processed');
      }
    }

    // ── payment.failed ───────────────────────────────────────────────────────
    if (eventType === 'payment.failed') {
      const payment   = event.payload?.payment?.entity;
      const projectId = payment?.notes?.projectId;
      if (projectId) {
        await db.updateProject(projectId, { escrow_status: 'Created' }); // revert to unfunded
        webhookLog.warn({ eventType, projectId }, 'Razorpay payment failed');
      }
    }

    return NextResponse.json({ received: true });
  } catch (e: any) {
    webhookLog.error({ err: e, message: e.message }, 'Error processing webhook event');
    // Always return 200 to Razorpay — log internally, don't retry
    return NextResponse.json({ received: true, error: e.message });
  }
}
