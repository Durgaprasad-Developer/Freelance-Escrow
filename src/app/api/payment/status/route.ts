// ─────────────────────────────────────────────────────────────────────────────
// /api/payment/status — checks which Razorpay features are configured and live
// Useful during development to verify keys and Route activation
// ─────────────────────────────────────────────────────────────────────────────
import { NextResponse } from 'next/server';

export async function GET() {
  const keyId     = process.env.RAZORPAY_KEY_ID     ?? '';
  const keySecret = process.env.RAZORPAY_KEY_SECRET  ?? '';
  const linkedAcc = process.env.RAZORPAY_LINKED_ACCOUNT_ID ?? '';

  const keysConfigured  = keyId.startsWith('rzp_') && keySecret.length > 10;
  const routeConfigured = linkedAcc.startsWith('acc_');

  // Test if keys actually work by creating a ₹1 order
  let keysLive = false;
  let testOrderId = '';
  if (keysConfigured) {
    try {
      const res = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`,
        },
        body: JSON.stringify({ amount: 100, currency: 'INR', receipt: 'status_check' }),
      });
      const data = await res.json();
      if (data.id?.startsWith('order_')) {
        keysLive   = true;
        testOrderId = data.id;
      }
    } catch { /* keys unreachable */ }
  }

  // Test if Route is enabled by trying to list linked accounts
  let routeLive = false;
  if (keysConfigured) {
    try {
      const res = await fetch('https://api.razorpay.com/v2/accounts?count=1', {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`,
        },
      });
      const data = await res.json();
      // Route is live if we get an items array (even empty), not an error message
      if (Array.isArray(data.items)) {
        routeLive = true;
      }
    } catch { /* ignore */ }
  }

  const mode = keyId.startsWith('rzp_test_') ? 'test' : keyId.startsWith('rzp_live_') ? 'live' : 'unknown';

  return NextResponse.json({
    mode,
    keys: {
      configured: keysConfigured,
      live:       keysLive,
      testOrderId: keysLive ? testOrderId : null,
    },
    route: {
      configured:  routeConfigured,
      live:        routeLive,
      linkedAccountId: routeConfigured ? `${linkedAcc.slice(0, 6)}...` : null,
    },
    readyForPayments:  keysLive,
    readyForTransfers: keysLive && routeLive && routeConfigured,
    nextStep: !keysLive
      ? 'Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env'
      : !routeLive
      ? 'Enable Razorpay Route: dashboard.razorpay.com → Settings → Route → Request Access'
      : !routeConfigured
      ? 'Set RAZORPAY_LINKED_ACCOUNT_ID in .env after creating a linked account'
      : 'All systems operational — ready for live escrow transactions',
  });
}
