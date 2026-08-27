// ─────────────────────────────────────────────────────────────────────────────
// blockchain.ts — Mock blockchain layer (replaces real Monad/viem integration)
//
// All methods return realistic-looking fake data so the app works fully
// without a live Monad Devnet connection or MetaMask wallet.
// ─────────────────────────────────────────────────────────────────────────────
import type { BlockchainTx } from '@/lib/types';

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Generate a deterministic-looking but random 66-char tx hash */
function fakeTxHash(): `0x${string}` {
  const hex = Array.from({ length: 64 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
  return `0x${hex}` as `0x${string}`;
}

/** Generate a fake 42-char wallet address */
function fakeAddress(seed?: string): `0x${string}` {
  if (seed) {
    // Deterministic based on seed string
    let h = 0;
    for (let i = 0; i < seed.length; i++) h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
    const hex = Math.abs(h).toString(16).padStart(8, '0').repeat(5).slice(0, 40);
    return `0x${hex}` as `0x${string}`;
  }
  const hex = Array.from({ length: 40 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
  return `0x${hex}` as `0x${string}`;
}

const MOCK_CONTRACT_ADDRESS = '0xEscr0w000000000000000000000000000000000000' as `0x${string}`;
const MOCK_ARBITER_ADDRESS  = '0xArbiter00000000000000000000000000000000000' as `0x${string}`;

// ── Pre-seeded mock transaction log (displayed in the blockchain explorer) ────
const SEED_TRANSACTIONS: BlockchainTx[] = [
  {
    hash:        '0xa1b2c3d4e5f601234567890abcdef0123456789abcdef0123456789abcdef0123',
    blockNumber: 8821503,
    from:        '0xclient0000000000000000000000000000000001',
    to:          MOCK_CONTRACT_ADDRESS,
    value:       '100',
    method:      'deposit()',
    status:      'success',
    timestamp:   new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    gasUsed:     21842,
  },
  {
    hash:        '0xb2c3d4e5f6012345678901abcdef0123456789abcdef0123456789abcdef01234',
    blockNumber: 8823110,
    from:        MOCK_ARBITER_ADDRESS,
    to:          '0xfreelancer00000000000000000000000000000001',
    value:       '80',
    method:      'release()',
    status:      'success',
    timestamp:   new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    gasUsed:     34512,
  },
  {
    hash:        '0xc3d4e5f60123456789012abcdef0123456789abcdef0123456789abcdef012345',
    blockNumber: 8824890,
    from:        '0xclient0000000000000000000000000000000002',
    to:          MOCK_CONTRACT_ADDRESS,
    value:       '250',
    method:      'deposit()',
    status:      'success',
    timestamp:   new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    gasUsed:     21900,
  },
  {
    hash:        '0xd4e5f601234567890123abcdef0123456789abcdef0123456789abcdef0123456',
    blockNumber: 8826340,
    from:        MOCK_ARBITER_ADDRESS,
    to:          '0xfreelancer00000000000000000000000000000002',
    value:       '175',
    method:      'release()',
    status:      'success',
    timestamp:   new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    gasUsed:     35100,
  },
  {
    hash:        '0xe5f6012345678901234abcdef0123456789abcdef0123456789abcdef01234567',
    blockNumber: 8827901,
    from:        '0xclient0000000000000000000000000000000003',
    to:          MOCK_CONTRACT_ADDRESS,
    value:       '500',
    method:      'deposit()',
    status:      'success',
    timestamp:   new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    gasUsed:     21755,
  },
];

// ── Mock blockchain object ─────────────────────────────────────────────────────

export const blockchain = {
  /**
   * Returns a list of fake escrow transactions.
   * New release/refund txs appended at runtime are mixed in from the module cache.
   */
  async getTransactions(): Promise<BlockchainTx[]> {
    return [..._runtimeTxLog, ...SEED_TRANSACTIONS];
  },

  /**
   * Returns fake wallet balances in MON.
   */
  async getBalances() {
    return {
      client:     1_000,
      freelancer: 250,
      contract:   750,
    };
  },

  /**
   * Simulate releasing escrow funds to a freelancer.
   * Returns a fake transaction receipt immediately — no network call.
   */
  async release(projectId: string, amount: number): Promise<BlockchainTx> {
    await _simulateDelay();
    const tx: BlockchainTx = {
      hash:        fakeTxHash(),
      blockNumber: _nextBlock(),
      from:        MOCK_ARBITER_ADDRESS,
      to:          fakeAddress(`freelancer-${projectId}`),
      value:       amount.toString(),
      method:      'release()',
      status:      'success',
      timestamp:   new Date().toISOString(),
      gasUsed:     Math.floor(30_000 + Math.random() * 10_000),
    };
    _runtimeTxLog.unshift(tx);
    return tx;
  },

  /**
   * Simulate refunding escrow funds back to the client.
   * Returns a fake transaction receipt immediately — no network call.
   */
  async refund(projectId: string, amount: number): Promise<BlockchainTx> {
    await _simulateDelay();
    const tx: BlockchainTx = {
      hash:        fakeTxHash(),
      blockNumber: _nextBlock(),
      from:        MOCK_ARBITER_ADDRESS,
      to:          fakeAddress(`client-${projectId}`),
      value:       amount.toString(),
      method:      'refund()',
      status:      'success',
      timestamp:   new Date().toISOString(),
      gasUsed:     Math.floor(28_000 + Math.random() * 8_000),
    };
    _runtimeTxLog.unshift(tx);
    return tx;
  },
};

// ── Module-level runtime transaction accumulator ───────────────────────────────
// Stores txs created during this server process lifetime (release/refund calls).
const _runtimeTxLog: BlockchainTx[] = [];

let _blockCounter = 8_828_000;
function _nextBlock() { return ++_blockCounter; }

/** Tiny artificial delay to make the UI feel like a real network call */
function _simulateDelay(ms = 400) {
  return new Promise<void>(res => setTimeout(res, ms));
}
