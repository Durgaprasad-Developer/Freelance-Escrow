'use client';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import {
  ArrowRight,
  ShieldCheck,
  Banknote,
  CheckCircle,
  XCircle,
  Lock,
  Zap,
  Flag,
  Search,
  ClipboardCheck,
  Github,
  Bot,
  ChevronRight,
  User,
} from 'lucide-react';

// ── Scroll fade-in ────────────────────────────────────────────────────────────
function FadeSection({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
          observer.disconnect();
        }
      },
      { threshold: 0.06 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return (
    <div ref={ref} style={{ opacity: 0, transform: 'translateY(18px)', transition: 'opacity 0.7s ease, transform 0.7s ease', ...style }}>
      {children}
    </div>
  );
}

// ── Animated score ring ───────────────────────────────────────────────────────
function ScoreRing({ score, label, color }: { score: number; label: string; color: string }) {
  const size = 72, sw = 4, r = (size - sw * 2) / 2, circ = 2 * Math.PI * r;
  const ref = useRef<SVGCircleElement>(null);
  useEffect(() => {
    const t = setTimeout(() => { if (ref.current) ref.current.style.strokeDasharray = `${(score / 100) * circ} ${circ}`; }, 600);
    return () => clearTimeout(t);
  }, [score, circ]);
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ position: 'relative', width: size, height: size, margin: '0 auto 7px' }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#EFE5DB" strokeWidth={sw} />
          <circle ref={ref} cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={sw}
            strokeLinecap="round" strokeDasharray={`0 ${circ}`}
            style={{ transition: 'stroke-dasharray 1.5s cubic-bezier(0.16,1,0.3,1)' }} />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: 16, fontWeight: 700, color }}>{score}%</span>
        </div>
      </div>
      <div style={{ fontSize: 11, color: '#9C8A7A', fontWeight: 500, fontFamily: 'Inter, sans-serif' }}>{label}</div>
    </div>
  );
}

// ── Data ─────────────────────────────────────────────────────────────────────
const AGENTS = [
  { icon: Github,         label: 'GitHub Agent',    role: 'Repo Intelligence',  desc: 'Scans all files, commits, and PR diffs from the linked repository.',              bg: '#F7F4F1', color: '#2F2F2F' },
  { icon: Search,         label: 'Evidence Agent',  role: 'Proof Extractor',    desc: 'Semantically maps every code artifact to a project milestone.',                   bg: '#EFE5DB', color: '#8B6F5A' },
  { icon: Flag,           label: 'Milestone Agent', role: 'Completion Scorer',  desc: 'Grades each milestone 0–100% from the extracted evidence.',                       bg: '#EFE5DB', color: '#5F7A61' },
  { icon: ShieldCheck,    label: 'Verify Agent',    role: 'Quality Auditor',    desc: 'Cross-checks code quality against the original contract requirements.',             bg: '#F7F4F1', color: '#8B6F5A' },
  { icon: ClipboardCheck, label: 'Report Agent',    role: 'Audit Compiler',     desc: 'Generates a structured markdown report for both client and developer.',            bg: '#F7F4F1', color: '#B85C5C' },
  { icon: Banknote,       label: 'Payment Agent',   role: 'Payout Arbitrator',  desc: 'Computes the weighted escrow release and stages smart contract execution.',       bg: '#EFE5DB', color: '#C59A5A' },
];

const PROBLEMS  = ['Manual subjective reviews', 'Disputes lasting weeks', 'Delayed, withheld payments', 'Human bias & favoritism', 'No objective evidence trail'];
const SOLUTIONS = ['AI-verified GitHub analysis', 'Automated resolution in minutes', 'Instant smart contract payout', 'Objective, immutable code evidence', '6-agent verifiable audit trail'];

const STEPS = [
  { n: '01', title: 'Client Creates Contract', sub: 'Defines project requirements and locks MON into an on-chain escrow smart contract.', icon: Lock,    color: '#8B6F5A', bg: '#EFE5DB' },
  { n: '02', title: 'Developer Builds',        sub: 'Writes code, opens a GitHub Pull Request, and submits the repository to krow.',     icon: Github,  color: '#2F2F2F', bg: '#F7F4F1' },
  { n: '03', title: '6-Agent Orchestra',       sub: 'Repository analysis, requirement matching, milestone scoring, audit report.',       icon: Bot,     color: '#8B6F5A', bg: '#EFE5DB' },
  { n: '04', title: 'Funds Released',          sub: 'AI verdict triggers the escrow smart contract. Developer is paid automatically.',   icon: Banknote,color: '#5F7A61', bg: '#EFE5DB' },
];

const MONAD_STATS = [
  { val: '10,000', unit: ' TPS',  desc: 'Transactions per second' },
  { val: '1s',     unit: '',      desc: 'Block finality time'      },
  { val: '< $0.01',unit: '',      desc: 'Per transaction cost'     },
  { val: '100%',   unit: '',      desc: 'EVM compatible'           },
];

const TRUST_BAR = ['Monad', 'GitHub', 'OpenAI', 'Next.js', 'Viem', 'Tailwind CSS'];

export default function LandingPage() {
  const [navScrolled, setNavScrolled] = useState(false);
  useEffect(() => {
    const h = () => setNavScrolled(window.scrollY > 10);
    window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);

  // ── inline hover helpers ──────────────────────────────────────────────────
  const navLink = (label: string) => (
    <a key={label} href={`#${label.toLowerCase().replace(/ /g, '-')}`}
      style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, color: '#666666', textDecoration: 'none', transition: 'color 0.15s' }}
      onMouseEnter={e => (e.currentTarget.style.color = '#2F2F2F')}
      onMouseLeave={e => (e.currentTarget.style.color = '#666666')}>
      {label}
    </a>
  );

  return (
    <div style={{ background: '#F7F4F1', color: '#2F2F2F', fontFamily: 'Inter, system-ui, sans-serif', WebkitFontSmoothing: 'antialiased' }}>

      {/* ── NAV ──────────────────────────────────────────────────────────── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        padding: '0 40px', height: 62,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: navScrolled ? 'rgba(247,244,241,0.95)' : 'transparent',
        backdropFilter: navScrolled ? 'blur(16px)' : 'none',
        borderBottom: navScrolled ? '1px solid #DCCABB' : '1px solid transparent',
        transition: 'all 0.25s ease',
      }}>
        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: '#2F2F2F', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
              <path d="M4 2.5V15.5M4 9L13.5 2.5M4 9L13.5 15.5" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span style={{ fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 700, fontSize: 19, letterSpacing: '-0.03em', color: '#2F2F2F' }}>krow</span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 30 }}>
          {['How It Works', 'Features', 'Verification'].map(navLink)}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <a href="https://github.com" target="_blank" rel="noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 15px', borderRadius: 8, border: '1px solid #DCCABB', background: 'transparent', color: '#666666', textDecoration: 'none', fontSize: 13.5, fontWeight: 500, fontFamily: 'Inter, sans-serif', transition: 'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#D3B9A2'; e.currentTarget.style.color = '#2F2F2F'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#DCCABB'; e.currentTarget.style.color = '#666666'; }}>
            <Github className="w-4 h-4" /> GitHub
          </a>
          <Link href="/dashboard"
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 20px', borderRadius: 8, background: '#2F2F2F', color: '#fff', textDecoration: 'none', fontSize: 13.5, fontWeight: 600, fontFamily: 'Inter, sans-serif', transition: 'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '0.85'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)'; }}>
            Launch App
          </Link>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section style={{ paddingTop: 130, paddingBottom: 90, paddingLeft: 40, paddingRight: 40, background: '#F7F4F1' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 72, alignItems: 'center' }}>

          {/* Left */}
          <div>
            {/* Eyebrow */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '5px 14px', borderRadius: 100, background: '#EFE5DB', border: '1px solid #DCCABB', marginBottom: 30 }}>
              <Zap className="w-3.5 h-3.5" style={{ color: '#8B6F5A' }} />
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12.5, fontWeight: 600, color: '#8B6F5A' }}>Built on Monad · 6-Agent AI Orchestra</span>
            </div>

            <h1 style={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: 54, fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.04em', color: '#2F2F2F', marginBottom: 24 }}>
              Freelance Payments.<br />
              <em style={{ color: '#8B6F5A', fontStyle: 'italic' }}>Verified by AI.</em><br />
              Released Automatically.
            </h1>

            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 17, color: '#666666', lineHeight: 1.75, marginBottom: 38, maxWidth: 480 }}>
              Stop disputes, delays, and subjective reviews. krow uses a 6-Agent AI Orchestra to verify GitHub pull requests and automatically release escrowed funds on Monad.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 42 }}>
              <Link href="/dashboard"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 30px', borderRadius: 10, background: '#2F2F2F', color: '#fff', textDecoration: 'none', fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 700, letterSpacing: '-0.01em', transition: 'all 0.18s' }}
                onMouseEnter={e => { e.currentTarget.style.opacity = '0.85'; e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(47,47,47,0.2)'; }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
                Launch App <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/visualizer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 24px', borderRadius: 10, background: 'transparent', color: '#666666', textDecoration: 'none', fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 500, border: '1px solid #DCCABB', transition: 'all 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#D3B9A2'; e.currentTarget.style.color = '#2F2F2F'; e.currentTarget.style.background = '#EFE5DB'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#DCCABB'; e.currentTarget.style.color = '#666666'; e.currentTarget.style.background = 'transparent'; }}>
                View Demo
              </Link>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 18, fontSize: 13, color: '#9C8A7A', fontFamily: 'Inter, sans-serif' }}>
              {[
                { icon: <ShieldCheck className="w-3.5 h-3.5" style={{ color: '#5F7A61' }} />, text: 'Smart contract escrow' },
                { icon: <Bot className="w-3.5 h-3.5" style={{ color: '#8B6F5A' }} />, text: 'AI-verified milestones'   },
                { icon: <Zap className="w-3.5 h-3.5" style={{ color: '#C59A5A' }} />, text: 'Instant settlement'       },
              ].map((f, i) => (
                <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>{f.icon} {f.text}</span>
              ))}
            </div>
          </div>

          {/* Right — Workflow card */}
          <div style={{ position: 'relative' }}>
            <div style={{ background: '#FFFFFF', border: '1px solid #DCCABB', borderRadius: 20, padding: 28, boxShadow: '0 8px 40px rgba(47,47,47,0.06)' }}>
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, fontWeight: 600, color: '#9C8A7A', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 22 }}>
                Escrow Workflow
              </div>

              {[
                { icon: <User className="w-4 h-4" />,          label: 'Client',                sub: 'Creates contract',         badge: 'Step 1',  bc: '#EFE5DB', bt: '#8B6F5A', done: true  },
                { icon: <Lock className="w-4 h-4" />,          label: 'Escrow Locked',          sub: '2,000 MON on Monad',       badge: 'Funded',  bc: '#EFE5DB', bt: '#8B6F5A', done: true  },
                { icon: <Github className="w-4 h-4" />,        label: 'Pull Request Submitted', sub: 'github.com/user/repo #42', badge: 'PR #42',  bc: '#F7F4F1', bt: '#666666', done: true  },
                { icon: <Bot className="w-4 h-4" />,           label: 'AI Verification',        sub: '6 agents analyzing…',      badge: 'Live',    bc: '#FEF7E6', bt: '#C59A5A', done: false, active: true },
                { icon: <Banknote className="w-4 h-4" />,      label: 'Payment Released',        sub: '1,840 MON → developer',   badge: 'Pending', bc: '#F0F7F0', bt: '#5F7A61', done: false },
              ].map((step, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0' }}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: step.done ? '#EFE5DB' : step.active ? '#FEF7E6' : '#F7F4F1', border: '1px solid #DCCABB', display: 'flex', alignItems: 'center', justifyContent: 'center', color: step.done ? 'var(--accent)' : step.active ? 'var(--warning)' : 'var(--subtle)', flexShrink: 0 }}>
                      {step.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13.5, fontWeight: 600, color: step.done ? '#2F2F2F' : step.active ? '#2F2F2F' : '#9C8A7A', marginBottom: 2 }}>{step.label}</div>
                      <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11.5, color: step.done ? '#666666' : step.active ? '#C59A5A' : '#DCCABB' }}>{step.sub}</div>
                    </div>
                    <div style={{ padding: '3px 10px', borderRadius: 100, background: step.bc, border: `1px solid ${step.bt}30`, fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 600, color: step.bt, flexShrink: 0 }}>
                      {step.badge}
                    </div>
                  </div>
                  {i < 4 && <div style={{ marginLeft: 19, width: 1, height: 10, background: '#DCCABB' }} />}
                </div>
              ))}
            </div>

            {/* Score float card */}
            <div style={{ position: 'absolute', bottom: -22, right: -22, background: '#FFFFFF', border: '1px solid #DCCABB', borderRadius: 14, padding: '14px 18px', boxShadow: '0 8px 30px rgba(47,47,47,0.07)', minWidth: 170 }}>
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, fontWeight: 600, color: '#9C8A7A', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 10 }}>AI Score</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: 36, fontWeight: 800, letterSpacing: '-0.04em', color: '#5F7A61', lineHeight: 1 }}>92</div>
                <div>
                  <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#2F2F2F', fontWeight: 600 }}>% Complete</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                    <CheckCircle className="w-3.5 h-3.5" style={{ color: '#5F7A61' }} />
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: '#5F7A61', fontWeight: 600 }}>Approved</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUST BAR ────────────────────────────────────────────────────── */}
      <section style={{ padding: '32px 40px', borderTop: '1px solid #DCCABB', borderBottom: '1px solid #DCCABB', background: '#EFE5DB' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 600, color: '#9C8A7A', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 18 }}>Built With</p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 44, flexWrap: 'wrap' }}>
            {TRUST_BAR.map(b => (
              <span key={b} style={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: 15, fontWeight: 600, color: '#9C8A7A', letterSpacing: '-0.02em', transition: 'color 0.15s', cursor: 'default' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#2F2F2F')}
                onMouseLeave={e => (e.currentTarget.style.color = '#9C8A7A')}>
                {b}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── THE PROBLEM ──────────────────────────────────────────────────── */}
      <section id="features" style={{ padding: '100px 40px', background: '#F7F4F1' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <FadeSection>
            <div style={{ textAlign: 'center', marginBottom: 60 }}>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600, color: '#8B6F5A', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14 }}>The Problem</p>
              <h2 style={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: 42, fontWeight: 800, letterSpacing: '-0.04em', color: '#2F2F2F', marginBottom: 18 }}>
                Freelance payments still<br />rely on trust.
              </h2>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 16, color: '#666666', maxWidth: 460, margin: '0 auto' }}>
                Every platform has the same issue — subjective judgements delay and block payments that developers have earned.
              </p>
            </div>
          </FadeSection>

          <FadeSection>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              {/* Traditional */}
              <div style={{ background: '#FFF8F8', border: '1px solid #DCCABB', borderRadius: 16, padding: '28px 30px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#B85C5C' }}>
                    <XCircle className="w-5 h-5" />
                  </div>
                  <span style={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: 15, fontWeight: 700, color: '#B85C5C' }}>Traditional Platforms</span>
                </div>
                {PROBLEMS.map((p, i) => (
                  <div key={p} style={{ display: 'flex', alignItems: 'center', gap: 10, fontFamily: 'Inter, sans-serif', fontSize: 13.5, color: '#7F1D1D', padding: '6px 0', borderBottom: i < PROBLEMS.length - 1 ? '1px solid #FEE2E2' : 'none' }}>
                    <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#FCA5A5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 9, color: '#DC2626', fontWeight: 700 }}>✕</div>
                    {p}
                  </div>
                ))}
              </div>

              {/* krow */}
              <div style={{ background: '#F5FAF5', border: '1px solid #DCCABB', borderRadius: 16, padding: '28px 30px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#5F7A61' }}>
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <span style={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: 15, fontWeight: 700, color: '#5F7A61' }}>krow</span>
                </div>
                {SOLUTIONS.map((s, i) => (
                  <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 10, fontFamily: 'Inter, sans-serif', fontSize: 13.5, color: '#14532D', padding: '6px 0', borderBottom: i < SOLUTIONS.length - 1 ? '1px solid #D1FAE5' : 'none' }}>
                    <CheckCircle className="w-4 h-4" style={{ color: '#5F7A61', flexShrink: 0 }} />
                    {s}
                  </div>
                ))}
              </div>
            </div>
          </FadeSection>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section id="how-it-works" style={{ padding: '90px 40px', background: '#EFE5DB', borderTop: '1px solid #DCCABB' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <FadeSection>
            <div style={{ textAlign: 'center', marginBottom: 56 }}>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600, color: '#8B6F5A', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14 }}>How It Works</p>
              <h2 style={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: 42, fontWeight: 800, letterSpacing: '-0.04em', color: '#2F2F2F' }}>
                From Commit to Payout.
              </h2>
            </div>
          </FadeSection>

          <FadeSection>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
              {STEPS.map((step, i) => (
                <div key={i} style={{ background: '#FFFFFF', border: '1px solid #DCCABB', borderRadius: 16, padding: '24px 20px', position: 'relative', transition: 'all 0.2s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 30px rgba(47,47,47,0.07)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'none'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: step.bg, border: '1px solid #DCCABB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <step.icon className="w-5 h-5" style={{ color: step.color }} />
                    </div>
                    <span style={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: 30, fontWeight: 900, color: '#EFE5DB', letterSpacing: '-0.04em' }}>{step.n}</span>
                  </div>
                  <h3 style={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: 14, fontWeight: 700, color: '#2F2F2F', marginBottom: 8, lineHeight: 1.35 }}>{step.title}</h3>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12.5, color: '#666666', lineHeight: 1.65 }}>{step.sub}</p>
                  {i < STEPS.length - 1 && (
                    <div style={{ position: 'absolute', right: -9, top: '50%', transform: 'translateY(-50%)', zIndex: 1, width: 18, height: 18, background: '#FFFFFF', border: '1px solid #DCCABB', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ChevronRight className="w-3 h-3" style={{ color: '#9C8A7A' }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </FadeSection>
        </div>
      </section>

      {/* ── AI ORCHESTRA — BENTO GRID ─────────────────────────────────────── */}
      <section id="verification" style={{ padding: '100px 40px', background: '#F7F4F1' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <FadeSection>
            <div style={{ textAlign: 'center', marginBottom: 56 }}>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600, color: '#8B6F5A', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14 }}>The AI Orchestra</p>
              <h2 style={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: 42, fontWeight: 800, letterSpacing: '-0.04em', color: '#2F2F2F', marginBottom: 16 }}>
                6 Specialised Agents.<br />
                <em style={{ color: '#8B6F5A', fontStyle: 'italic' }}>One Objective Verdict.</em>
              </h2>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 16, color: '#666666', maxWidth: 500, margin: '0 auto' }}>
                Each agent has a single responsibility. They work sequentially, feeding results to the next, creating a tamper-proof audit trail.
              </p>
            </div>
          </FadeSection>

          <FadeSection>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
              {AGENTS.map((agent, i) => (
                <div key={i}
                  style={{ background: '#FFFFFF', border: '1px solid #DCCABB', borderRadius: 16, padding: '24px', transition: 'all 0.2s', cursor: 'default' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#D3B9A2'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 30px rgba(211,185,162,0.2)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#DCCABB'; (e.currentTarget as HTMLElement).style.boxShadow = 'none'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 14 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: agent.bg, border: '1px solid #DCCABB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <agent.icon className="w-5 h-5" style={{ color: agent.color }} />
                    </div>
                    <div>
                      <div style={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: 14.5, fontWeight: 700, color: '#2F2F2F', marginBottom: 3 }}>{agent.label}</div>
                      <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 10.5, fontWeight: 600, color: '#8B6F5A', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{agent.role}</div>
                    </div>
                  </div>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#666666', lineHeight: 1.7 }}>{agent.desc}</p>
                  <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#5F7A61', animation: 'pulse-dot 2s infinite' }} />
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: '#5F7A61', fontWeight: 600 }}>Active</span>
                  </div>
                </div>
              ))}
            </div>
          </FadeSection>
        </div>
      </section>

      {/* ── LIVE DEMO ─────────────────────────────────────────────────────── */}
      <section style={{ padding: '90px 40px', background: '#EFE5DB', borderTop: '1px solid #DCCABB' }}>
        <div style={{ maxWidth: 940, margin: '0 auto' }}>
          <FadeSection>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
              <div>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600, color: '#8B6F5A', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 16 }}>Live Demo</p>
                <h2 style={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: 36, fontWeight: 800, letterSpacing: '-0.04em', color: '#2F2F2F', marginBottom: 18 }}>
                  Real verification.<br />Real results.
                </h2>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, color: '#666666', lineHeight: 1.75, marginBottom: 26 }}>
                  Connect your GitHub repository, define milestones, and watch krow's AI verify your developer's work objectively and automatically.
                </p>
                <Link href="/visualizer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '12px 24px', borderRadius: 9, background: '#2F2F2F', color: '#fff', textDecoration: 'none', fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 600, transition: 'all 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.opacity = '0.85'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                  <Bot className="w-4 h-4" /> Open Verification Center
                </Link>
              </div>

              {/* Simulated card */}
              <div style={{ background: '#FFFFFF', border: '1px solid #DCCABB', borderRadius: 20, padding: 24, boxShadow: '0 8px 40px rgba(47,47,47,0.06)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, paddingBottom: 16, borderBottom: '1px solid #EFE5DB' }}>
                  <div>
                    <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, fontWeight: 600, color: '#9C8A7A', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4 }}>AI Verification Report</div>
                    <div style={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: 15, fontWeight: 700, color: '#2F2F2F' }}>frontend-dashboard</div>
                    <div style={{ fontFamily: 'monospace', fontSize: 11.5, color: '#9C8A7A', marginTop: 3, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Github className="w-3 h-3" /> user/frontend-dashboard
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 5, marginBottom: 3 }}>
                      <CheckCircle className="w-4 h-4" style={{ color: '#5F7A61' }} />
                      <span style={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: 13, fontWeight: 700, color: '#5F7A61' }}>Approved</span>
                    </div>
                    <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: '#9C8A7A' }}>Escrow Released</div>
                  </div>
                </div>

                <div style={{ marginBottom: 18, padding: '10px 14px', background: '#F7F4F1', borderRadius: 9, border: '1px solid #DCCABB' }}>
                  <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, fontWeight: 600, color: '#9C8A7A', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4 }}>Milestone</div>
                  <div style={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: 13.5, fontWeight: 600, color: '#2F2F2F' }}>Build Escrow Workflow</div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 18 }}>
                  <ScoreRing score={92} label="Completion"   color="#8B6F5A" />
                  <ScoreRing score={95} label="Req. Match"   color="#5F7A61" />
                  <ScoreRing score={94} label="Code Quality" color="#C59A5A" />
                </div>

                <div style={{ padding: '12px 16px', borderRadius: 10, background: '#F5FAF5', border: '1px solid #DCCABB', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <CheckCircle className="w-5 h-5" style={{ color: '#5F7A61', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: 13, fontWeight: 700, color: '#5F7A61' }}>AI Verdict: Approved</div>
                    <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11.5, color: '#666666' }}>1,840 MON released to developer</div>
                  </div>
                </div>
              </div>
            </div>
          </FadeSection>
        </div>
      </section>

      {/* ── WHY MONAD ────────────────────────────────────────────────────── */}
      <section style={{ padding: '100px 40px', background: '#F7F4F1' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <FadeSection>
            <div style={{ textAlign: 'center', marginBottom: 52 }}>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600, color: '#8B6F5A', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14 }}>Infrastructure</p>
              <h2 style={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: 40, fontWeight: 800, letterSpacing: '-0.04em', color: '#2F2F2F' }}>
                Built for Instant Settlement.
              </h2>
            </div>
          </FadeSection>
          <FadeSection>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
              {MONAD_STATS.map(s => (
                <div key={s.val}
                  style={{ background: '#FFFFFF', border: '1px solid #DCCABB', borderRadius: 14, padding: '26px 22px', textAlign: 'center', transition: 'all 0.18s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#EFE5DB'; (e.currentTarget as HTMLElement).style.borderColor = '#D3B9A2'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#FFFFFF'; (e.currentTarget as HTMLElement).style.borderColor = '#DCCABB'; }}>
                  <div style={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: 32, fontWeight: 800, letterSpacing: '-0.04em', color: '#2F2F2F', lineHeight: 1, marginBottom: 7 }}>
                    {s.val}<span style={{ fontSize: 20, color: '#8B6F5A' }}>{s.unit}</span>
                  </div>
                  <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12.5, color: '#666666', fontWeight: 500 }}>{s.desc}</div>
                </div>
              ))}
            </div>
          </FadeSection>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────────────────────── */}
      <section style={{ padding: '110px 40px', background: '#2F2F2F' }}>
        <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center' }}>
          <FadeSection>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '5px 14px', borderRadius: 100, background: 'rgba(211,185,162,0.12)', border: '1px solid rgba(211,185,162,0.25)', marginBottom: 32 }}>
              <Zap className="w-3.5 h-3.5" style={{ color: '#D3B9A2' }} />
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12.5, fontWeight: 600, color: '#D3B9A2' }}>Hackathon Demo — Monad Devnet</span>
            </div>

            <h2 style={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: 50, fontWeight: 800, letterSpacing: '-0.04em', color: '#F7F4F1', lineHeight: 1.1, marginBottom: 22 }}>
              Build software.<br />
              <em style={{ color: '#D3B9A2', fontStyle: 'italic' }}>Let AI handle</em><br />
              the trust.
            </h2>

            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 16, color: '#9C8A7A', lineHeight: 1.75, marginBottom: 42, maxWidth: 420, margin: '0 auto 42px' }}>
              The first escrow platform where code becomes proof of work. No disputes. No delays. Just verified, automated payments.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
              <Link href="/dashboard"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 32px', borderRadius: 10, background: '#D3B9A2', color: '#2F2F2F', textDecoration: 'none', fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 700, letterSpacing: '-0.01em', transition: 'all 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#C4A88F'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#D3B9A2'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                Launch App <ArrowRight className="w-4 h-4" />
              </Link>
              <a href="https://github.com" target="_blank" rel="noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '14px 28px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', color: '#9C8A7A', textDecoration: 'none', fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 600, border: '1px solid rgba(255,255,255,0.09)', transition: 'all 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.09)'; e.currentTarget.style.color = '#F7F4F1'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#9C8A7A'; }}>
                <Github className="w-4 h-4" /> Read Documentation
              </a>
            </div>
          </FadeSection>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer style={{ padding: '26px 40px', background: '#1C1814', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 26, height: 26, borderRadius: 7, background: '#D3B9A2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
                <path d="M4 2.5V15.5M4 9L13.5 2.5M4 9L13.5 15.5" stroke="#2F2F2F" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <div style={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: 14, fontWeight: 700, color: '#F7F4F1', letterSpacing: '-0.02em' }}>krow</div>
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: '#4A3F38' }}>AI-Verified Escrow for Developers</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            {[
              { l: 'GitHub',     h: 'https://github.com' },
              { l: 'Twitter',    h: 'https://twitter.com' },
              { l: 'Docs',       h: '#' },
              { l: 'Launch App', h: '/dashboard' },
            ].map(link => (
              <a key={link.l} href={link.h} style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#4A3F38', textDecoration: 'none', transition: 'color 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#9C8A7A')}
                onMouseLeave={e => (e.currentTarget.style.color = '#4A3F38')}>
                {link.l}
              </a>
            ))}
          </div>

          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11.5, color: '#2E2420' }}>
            © 2025 krow · Monad Hackathon
          </div>
        </div>
      </footer>
    </div>
  );
}
