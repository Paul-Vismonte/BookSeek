import { NextResponse } from 'next/server';

export async function GET() {
  try {
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      message: 'API is functioning correctly',
      deployment: 'FORCE DEPLOYMENT - Database errors should be resolved',
      buildTime: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      deployment: 'FORCE DEPLOYMENT - Database errors should be resolved'
    }, { status: 500 });
  }
}
