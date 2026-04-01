import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    environment: {
      VERCEL: process.env.VERCEL,
      NODE_ENV: process.env.NODE_ENV,
      isServerless: process.env.VERCEL === '1' || process.env.NODE_ENV === 'production',
      cwd: process.cwd(),
      timestamp: new Date().toISOString(),
      deployment: 'FINAL FIX APPLIED - Mock database system deployed'
    }
  });
}
