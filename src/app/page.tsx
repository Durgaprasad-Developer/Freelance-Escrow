'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Plus, RefreshCw, ShieldCheck, DollarSign, TrendingUp, AlertCircle, GitBranch, CheckCircle2, Clock, Zap } from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import type { Project, BlockchainTx } from '@/lib/types';

function fmt$(n: number) { return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }); }
function progColor(pct: number) { return pct >= 80 ? '#22c55e' : pct >= 50 ? '#7B68EE' : '#f59e0b'; }

function ScoreRing({ score, size = 54 }: { score: number; size?: number }) {
  const sw = 4, r = (size - sw * 2) / 2, circ = 2 * Math.PI * r;
  const color = score === 0 ? '#33334a' : score >= 80 ? '#22c55e' : score >= 50 ? '#7B68EE' : '#f59e0b';
  const circleRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    const el = circleRef.current;
    if (!el) return;
    const dash = (score / 100) * circ;
    setTimeout(() => { el.style.strokeDasharray = `${dash} ${circ}`; }, 80);
  }, [score, circ]);

  return (
    <div className="ring-wrap" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={sw} />
        <circle ref={circleRef} cx={size/2} cy={size/2} r={r} fill="none"
          stroke={color} strokeWidth={sw} strokeLinecap="round"
          strokeDasharray={`0 ${circ}`}
          style={{ transition: 'stroke-dasharray 1.2s cubic-bezier(0.16,1,0.3,1)' }}
        />
      </svg>
      <div className="ring-label">
        <span style={{ fontSize: Math.round(size * 0.22), fontWeight: 800, color, lineHeight: 1 }}>
          {score === 0 ? '—' : score}
        </span>
        {score > 0 && <span style={{ fontSize: Math.round(size * 0.15), color: 'var(--i4)' }}>%</span>}
      </div>
    </div>
  );
}

const statusConfig: Record<string, { label: string; cls: string }> = {
  Created:  { label: 'Created',  cls: 'badge badge-teal'   },
  Funded:   { label: 'Active',   cls: 'badge badge-purple' },
  Released: { label: 'Released', cls: 'badge badge-green'  },
  Refunded: { label: 'Refunded', cls: 'badge badge-red'    },
};

const activityIcons: Record<string, string> = {
  verified: '🤖', payment: '💸', commit: '📦', dispute: '⚖️', started: '🚀',
};
const activityColors: Record<string, string> = {
  verified: '#7B68EE', payment: '#22c55e', commit: '#18c8a8', dispute: '#f59e0b', started: '#9090aa',
};

export default function Dashboard() {
  const [projects,     setProjects]     = useState<Project[]>([]);
  const [transactions, setTransactions] = useState<BlockchainTx[]>([]);
  const [balances,     setBalances]     = useState({ client: 0, freelancer: 0, contract: 0 });
  const [loading,      setLoading]      = useState(true);

  async function loadData() {
    setLoading(true);
    try {
      const [pRes, txRes] = await Promise.all([fetch('/api/projects'), fetch('/api/blockchain')]);
      const pData = await pRes.json();
      const txData = await txRes.json();
      if (pData.success) setProjects(pData.data);
      if (txData.success) { setTransactions(txData.data.transactions); setBalances(txData.data.balances); }
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }

  useEffect(() => { loadData(); }, []);

  const totalEscrowed = projects.reduce((s, p) => s + p.escrow_amount, 0);
  const active = projects.filter(p => p.escrow_status === 'Funded').length;

  const stats = [
    { label: 'Total Escrowed',    val: fmt$(totalEscrowed),        sub: `${projects.length} contracts`,        cls: 'stat-purple' },
    { label: 'Active Contracts',  val: String(active),             sub: `${projects.length - active} settled`, cls: 'stat-teal'   },
    { label: 'Paid to Devs',      val: fmt$(balances.freelancer),  sub: 'Released & confirmed',                cls: 'stat-green'  },
    { label: 'Client Wallet',     val: fmt$(balances.client),      sub: 'Available balance',                   cls: 'stat-amber'  },
  ];

  // Quick activity feed from transactions
  const feed = transactions.slice(0, 6).map(tx => ({
    icon:    activityIcons[tx.method?.toLowerCase() ?? ''] ?? '📋',
    color:   activityColors[tx.method?.toLowerCase() ?? ''] ?? '#9090aa',
    msg:     `${tx.method} · ${fmt$(tx.value)} released`,
    project: `Block #${tx.blockNumber}`,
    time:    new Date(tx.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
  }));

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)', fontFamily: 'Inter, sans-serif' }}>
      <Sidebar />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Topbar */}
        <div className="topbar">
          <div>
            <div className="font-mono" style={{ fontSize: 9, color: 'var(--i4)', letterSpacing: '0.1em', marginBottom: 2 }}>
              DASHBOARD · OVERVIEW
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--i1)', letterSpacing: '-0.02em' }}>
              Escrow Manager
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.18)',
              borderRadius: 100, padding: '4px 12px',
            }}>
              <span className="dot dot-green" style={{ width: 5, height: 5 }} />
              <span className="font-mono" style={{ fontSize: 9, color: 'var(--em)', letterSpacing: '0.08em' }}>SYSTEM LIVE</span>
            </div>
            <button onClick={loadData} className="btn-ghost" style={{ padding: '7px 12px' }}>
              <RefreshCw style={{ width: 14, height: 14 }} />
            </button>
            <Link href="/new" className="btn-primary">
              <Plus style={{ width: 14, height: 14 }} /> New Contract
            </Link>
          </div>
        </div>

        {/* Main content */}
        <div style={{ flex: 1, padding: 28, overflowY: 'auto' }}>

          {/* Welcome row */}
          <div style={{ marginBottom: 24 }}>
            <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--i1)', marginBottom: 4 }}>
              Welcome back 👋
            </h1>
            <p style={{ fontSize: 13, color: 'var(--i3)' }}>
              {loading ? 'Loading contracts…' : `${projects.length} escrow contract${projects.length !== 1 ? 's' : ''} · AI verification active`}
            </p>
          </div>

          {/* Stats grid */}
          {!loading && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 28 }}>
              {stats.map(s => (
                <div key={s.label} className={`stat-card ${s.cls}`}>
                  <div className="stat-label">{s.label}</div>
                  <div className="stat-val">{s.val}</div>
                  <div className="stat-sub">{s.sub}</div>
                </div>
              ))}
            </div>
          )}

          {/* Two column layout */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20 }}>

            {/* Left: Projects */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--i1)' }}>Active Contracts</h2>
                <div className="sect-label" style={{ margin: 0 }}>
                  {loading ? '—' : `${projects.length} total`}
                </div>
              </div>

              {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[1,2,3].map(i => (
                    <div key={i} className="shimmer" style={{ height: 100, borderRadius: 16 }} />
                  ))}
                </div>
              ) : projects.length === 0 ? (
                <div className="card" style={{ padding: 60, textAlign: 'center' }}>
                  <div style={{ fontSize: 36, marginBottom: 12 }}>🔒</div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: 'var(--i1)' }}>
                    No escrow contracts yet
                  </h3>
                  <p style={{ fontSize: 13, color: 'var(--i3)', marginBottom: 24, lineHeight: 1.6 }}>
                    Create your first contract and let AI verify milestone completion automatically.
                  </p>
                  <Link href="/new" className="btn-primary">
                    <Plus style={{ width: 14, height: 14 }} /> Create First Contract
                  </Link>
                </div>
              ) : (
                projects.map(p => {
                  const cfg = statusConfig[p.escrow_status] ?? statusConfig.Created;
                  const releasedPct = p.escrow_amount > 0 ? Math.round((balances.freelancer / p.escrow_amount) * 100) : 0;
                  const completion = 50; // placeholder, real from milestones

                  return (
                    <Link key={p.id} href={`/project/${p.id}`} className="proj-card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6, flexWrap: 'wrap' as const }}>
                            <span className="font-mono" style={{ fontSize: 9, color: 'var(--i4)', letterSpacing: '0.07em' }}>
                              ESCROW CONTRACT
                            </span>
                            <span className={cfg.cls}>
                              <span className="badge-dot" /> {cfg.label}
                            </span>
                          </div>
                          <h3 style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 5, color: 'var(--i1)' }}>
                            {p.title}
                          </h3>
                          <p style={{ fontSize: 12, color: 'var(--i3)', marginBottom: 10, lineHeight: 1.4 }}>
                            {p.description?.slice(0, 90)}{p.description?.length > 90 ? '…' : ''}
                          </p>
                          {p.github_url && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--vl)' }}>
                              <GitBranch style={{ width: 10, height: 10 }} />
                              <span className="font-mono">{p.github_url.replace('https://github.com/', '')}</span>
                            </div>
                          )}
                        </div>
                        <ScoreRing score={0} size={52} />
                      </div>

                      {/* Progress bar */}
                      <div style={{ marginBottom: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--i4)', marginBottom: 5 }}>
                          <span>Milestone progress</span>
                          <span className="font-mono">—</span>
                        </div>
                        <div className="prog-track">
                          <div className="prog-fill" style={{ width: '0%', background: 'var(--v)' }} />
                        </div>
                      </div>

                      {/* Footer row */}
                      <div style={{ display: 'flex', gap: 16, fontSize: 12, flexWrap: 'wrap' as const }}>
                        <span style={{ color: 'var(--i3)' }}>
                          Budget <strong style={{ color: 'var(--i1)' }}>{fmt$(p.escrow_amount)}</strong>
                        </span>
                        <span style={{ color: 'var(--i3)' }}>
                          Released <strong style={{ color: 'var(--em)' }}>{fmt$(0)}</strong>
                          <span style={{ color: 'var(--i4)' }}> (0%)</span>
                        </span>
                        <span className="font-mono" style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--i4)' }}>
                          {new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>

            {/* Right: activity + breakdown */}
            <div>
              {/* Live Activity */}
              <div style={{ marginBottom: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: 14, fontWeight: 700 }}>Live Activity</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span className="dot dot-green" style={{ width: 5, height: 5 }} />
                  <span className="font-mono" style={{ fontSize: 9, color: 'var(--em)' }}>LIVE</span>
                </div>
              </div>

              <div className="card" style={{ marginBottom: 16, overflow: 'hidden' }}>
                {feed.length === 0 ? (
                  <div style={{ padding: 24, textAlign: 'center', color: 'var(--i4)', fontSize: 12 }}>
                    No transactions yet
                  </div>
                ) : (
                  feed.map((a, i) => (
                    <div key={i} className="act-item">
                      <div className="act-icon" style={{ background: `${a.color}18`, border: `1px solid ${a.color}28` }}>
                        {a.icon}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, color: 'var(--i2)', marginBottom: 3, lineHeight: 1.4 }}>{a.msg}</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: 10, color: 'var(--i4)' }}>{a.project}</span>
                          <span className="font-mono" style={{ fontSize: 9, color: 'var(--i4)' }}>{a.time}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Escrow Breakdown */}
              <div className="card" style={{ padding: 18, marginBottom: 16 }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 14 }}>Escrow Breakdown</h3>
                {[
                  { l: 'Paid to Developers', v: balances.freelancer,  t: Math.max(totalEscrowed, 1), c: 'var(--em)'   },
                  { l: 'Locked in Escrow',   v: balances.contract,    t: Math.max(totalEscrowed, 1), c: 'var(--v)'    },
                  { l: 'Client Balance',     v: balances.client,      t: Math.max(totalEscrowed, 1), c: 'var(--teal)' },
                ].map(({ l, v, t, c }) => (
                  <div key={l} style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
                      <span style={{ color: 'var(--i3)' }}>{l}</span>
                      <span className="font-mono" style={{ color: c }}>{fmt$(v)}</span>
                    </div>
                    <div className="prog-track">
                      <div className="prog-fill" style={{ width: `${Math.round((v / t) * 100)}%`, background: c }} />
                    </div>
                  </div>
                ))}
                <div style={{ borderTop: '1px solid var(--b)', paddingTop: 12, display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <span style={{ color: 'var(--i3)' }}>Total Platform Volume</span>
                  <span style={{ fontWeight: 700 }}>{fmt$(totalEscrowed)}</span>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="card" style={{ padding: 16 }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>Quick Actions</h3>
                {[
                  { icon: '🤖', label: 'Run AI Verification',    bg: 'var(--vx)', border: 'var(--vb)', color: 'var(--vl)', href: '/visualizer' },
                  { icon: '💸', label: 'Create New Contract',    bg: 'var(--eg)', border: 'rgba(34,197,94,0.2)', color: 'var(--em)', href: '/new' },
                ].map(q => (
                  <Link key={q.label} href={q.href} style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px',
                    background: q.bg, border: `1px solid ${q.border}`, borderRadius: 9,
                    cursor: 'pointer', marginBottom: 7, textDecoration: 'none',
                    transition: 'all 0.15s',
                  }}>
                    <span style={{ fontSize: 16 }}>{q.icon}</span>
                    <span style={{ fontSize: 13, fontWeight: 500, color: q.color }}>{q.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
