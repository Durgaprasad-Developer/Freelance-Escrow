// ─────────────────────────────────────────────────────────────────────────────
// Payment Agent — computes weighted payout and triggers Razorpay Route action
// ─────────────────────────────────────────────────────────────────────────────
import type { PaymentOutput, MilestoneScore } from '@/lib/types';
import { askLLM }                             from './llm';
import { releaseHold, reverseTransfer }       from '../razorpay';
import { db }                                 from '../db';
import { logger }                             from '../logger';

const paymentAgentLog = logger.child({ module: 'payment-agent' });

export async function runPaymentAgent(
  milestones:      { title: string; weight: number }[],
  milestoneScores: MilestoneScore[],
  escrowAmount:    number,
  confidence:      number,
  projectId?:      string,    // needed to look up razorpay_transfer_id
): Promise<PaymentOutput> {

  // ── 1. Weighted completion calculation ────────────────────────────────────
  let weighted = 0;
  let totalW   = 0;

  for (const m of milestones) {
    const score = milestoneScores.find(s => s.title === m.title);
    weighted += (score?.completion ?? 0) * m.weight;
    totalW   += m.weight;
  }

  const completionPct      = totalW > 0 ? Math.round(weighted / totalW) : 0;
  const recommendedRelease = Math.round((escrowAmount * completionPct) / 100 * 100) / 100;

  // ── 2. LLM justification ──────────────────────────────────────────────────
  const systemPrompt = `You are a financial arbitrator for a software escrow platform.
Write a highly professional payment release justification based on milestone completions.
Return ONLY a JSON object:
{ "reasoning": "A professional paragraph justifying the release of X INR (Y% completion) out of Z total escrow." }`;

  const userPrompt = `Escrow: ₹${escrowAmount}
Completion: ${completionPct}%
Recommended Release: ₹${recommendedRelease}
Milestone Progress:
${milestoneScores.map(s => `- ${s.title}: ${s.completion}% (${s.status})`).join('\n')}`;

  let reasoning = '';
  try {
    const raw = await askLLM(userPrompt, systemPrompt, true);
    if (raw) {
      const parsed = JSON.parse(raw);
      reasoning = parsed.reasoning || '';
    }
  } catch { /* fallback */ }

  if (!reasoning) {
    if (completionPct >= 90) {
      reasoning = `Project is ${completionPct}% complete — all major milestones satisfied. Recommend releasing the full balance of ₹${recommendedRelease}.`;
    } else if (completionPct > 0) {
      reasoning = `Project is ${completionPct}% complete. Recommend a partial release of ₹${recommendedRelease} (${completionPct}% of ₹${escrowAmount}). Remaining ₹${(escrowAmount - recommendedRelease).toFixed(2)} stays locked.`;
    } else {
      reasoning = `No verifiable progress detected. Recommend keeping the full ₹${escrowAmount} locked in escrow.`;
    }
  }

  // ── 3. Razorpay Route action based on AI verdict ──────────────────────────
  if (projectId) {
    try {
      const payouts = await db.getPayouts(projectId);
      // Find the most recent pending payout with a Razorpay transfer ID
      const pendingPayout = payouts
        .filter(p => p.status === 'Pending' && (p as any).razorpay_transfer_id)
        .sort((a, b) => b.created_at.localeCompare(a.created_at))[0];

      if (pendingPayout) {
        const transferId = (pendingPayout as any).razorpay_transfer_id as string;

        if (completionPct >= 80) {
          // ✅ Release: AI says work is substantially complete
          await releaseHold(transferId);
          await db.updatePayout(pendingPayout.id, {
            status:             'Released',
            amount:             recommendedRelease,
            release_percentage: completionPct,
            hold_status:        'released',
          } as any);
          await db.updateProject(projectId, { escrow_status: 'Released' });
          reasoning += ` [Razorpay Route: settlement hold released on transfer ${transferId}]`;

        } else if (completionPct < 20) {
          // ❌ Reverse: Very little work done — refund client
          await reverseTransfer(transferId, escrowAmount);
          await db.updatePayout(pendingPayout.id, {
            status:       'Refunded',
            hold_status:  'reversed',
          } as any);
          await db.updateProject(projectId, { escrow_status: 'Refunded' });
          reasoning += ` [Razorpay Route: transfer reversed, funds returned to client]`;

        } else {
          // ⏳ Partial: Hold maintained — awaiting client decision
          reasoning += ` [Razorpay Route: transfer remains on hold (${completionPct}% — partial completion). Client must approve or reject via dashboard.]`;
        }
      }
    } catch (e: any) {
      // Non-fatal: Razorpay may not be configured yet, or keys are placeholders
      paymentAgentLog.warn({ err: e, message: e.message, projectId }, 'Razorpay Route action skipped');
      reasoning += ' [Razorpay Route: action skipped — configure keys to enable live settlement]';
    }
  }

  return {
    status:               'success',
    completionPercentage: completionPct,
    escrowAmount,
    recommendedRelease,
    confidence:           Math.round(confidence),
    reasoning,
  };
}
