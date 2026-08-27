// ─────────────────────────────────────────────────────────────────────────────
// wallet.ts — Mock wallet layer (replaces real MetaMask / viem integration)
//
// No MetaMask, no window.ethereum, no on-chain calls.
// Returns realistic fake data so the full app works without a browser wallet.
// ─────────────────────────────────────────────────────────────────────────────

/** Simulate connecting a wallet — returns a fake address instantly */
export async function connectWallet() {
  await _delay(300);
  const address = '0xMockClient0000000000000000000000000000000' as `0x${string}`;
  return { address };
}

/**
 * Simulate depositing funds into the escrow contract.
 * Returns a fake transaction hash — no MetaMask popup, no network call.
 */
export async function depositToEscrow(
  projectId: string,
  amountEth: number,
): Promise<{ hash: `0x${string}`; receipt: { status: 'success' } }> {
  await _delay(600);
  const hash = `0x${Array.from({ length: 64 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join('')}` as `0x${string}`;

  console.info(`[mock wallet] depositToEscrow — project: ${projectId}, amount: ${amountEth} MON, hash: ${hash}`);

  return { hash, receipt: { status: 'success' } };
}

function _delay(ms: number) {
  return new Promise<void>(res => setTimeout(res, ms));
}
