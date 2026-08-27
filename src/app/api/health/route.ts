import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { logger } from '@/lib/logger';

const healthLog = logger.child({ module: 'health-api' });

export async function GET() {
  const timestamp = new Date().toISOString();
  const checks: Record<string, any> = {
    status: 'healthy',
    timestamp,
    services: {
      api: { status: 'up' },
      database: { status: 'unknown' },
      razorpay: { status: 'unknown' },
      groq_llm: { status: 'unknown' },
    },
  };

  // 1. Check Database Access
  try {
    const projects = await db.getProjects();
    checks.services.database = {
      status: 'up',
      project_count: projects.length,
    };
  } catch (err: any) {
    healthLog.error({ err, message: err.message }, 'Database health check failed');
    checks.services.database = {
      status: 'down',
      error: err.message || 'Database read error',
    };
    checks.status = 'degraded';
  }

  // 2. Check Razorpay Configuration
  const rzpKey = process.env.RAZORPAY_KEY_ID;
  const rzpSecret = process.env.RAZORPAY_KEY_SECRET;
  if (rzpKey && rzpSecret) {
    checks.services.razorpay = {
      status: 'configured',
      key_prefix: rzpKey.slice(0, 8),
    };
  } else {
    checks.services.razorpay = {
      status: 'unconfigured',
      warning: 'RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET missing in environment',
    };
  }

  // 3. Check Groq LLM Configuration
  const groqKey = process.env.GROQ_API_KEY;
  if (groqKey) {
    checks.services.groq_llm = {
      status: 'configured',
      key_prefix: groqKey.slice(0, 6) + '...',
    };
  } else {
    checks.services.groq_llm = {
      status: 'unconfigured',
      warning: 'GROQ_API_KEY missing in environment',
    };
  }

  const httpStatus = checks.status === 'healthy' || checks.status === 'degraded' ? 200 : 503;
  return NextResponse.json(checks, { status: httpStatus });
}
