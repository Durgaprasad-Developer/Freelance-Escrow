// ─────────────────────────────────────────────────────────────────────────────
// /api/payout — AI verdict → Razorpay Route hold release or reversal
//
// POST with { payoutId, action: 'approve' | 'refund' }
//   approve → Modify Settlement Hold (on_hold: false) → funds released to dev
//   refund  → Transfer Reversal → funds returned to platform
// ─────────────────────────────────────────────────────────────────────────────
import { NextResponse }              from 'next/server';
import { db }                        from '@/lib/db';
import { releaseHold, reverseTransfer } from '@/lib/razorpay';

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { payoutId, action } = await req.json(); // action: 'approve' | 'refund'
    if (!payoutId || !action) {
      return NextResponse.json({ success: false, error: 'payoutId and action required' }, { status: 400 });
    }

    const payout = await db.getPayoutById(payoutId);
    if (!payout) {
      return NextResponse.json({ success: false, error: 'Payout not found' }, { status: 404 });
    }

    const transferId = (payout as any).razorpay_transfer_id as string | undefined;
    const status     = action === 'approve' ? 'Released' : 'Refunded';
    let   txId       = payout.tx_hash ?? '';

    if (transferId && transferId !== '') {
      // ── Real Razorpay Route path ───────────────────────────────────────────
      if (action === 'approve') {
        const result = await releaseHold(transferId);
        txId = result.id;
        await db.updatePayout(payoutId, {
          status:       'Released',
          tx_hash:      txId,
          hold_status:  'released',
        } as any);
      } else {
        const result = await reverseTransfer(transferId, payout.amount);
        txId = result.id;
        await db.updatePayout(payoutId, {
          status:       'Refunded',
          tx_hash:      txId,
          hold_status:  'reversed',
        } as any);
      }
    } else {
      // ── Graceful fallback: no transfer ID yet (keys not configured) ────────
      // Still updates DB state so the UI shows the correct status
      await db.updatePayout(payoutId, { status: status as any });
      txId = `mock_${action}_${Date.now().toString(36)}`;
    }

    // Update project escrow status
    await db.updateProject(payout.project_id, {
      escrow_status: status as any,
    });

    return NextResponse.json({
      success: true,
      data: { txId, status, transferId: transferId ?? null },
    });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
