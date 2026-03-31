import { NextResponse } from 'next/server';

export async function GET() {
  const envVars = {
    JWT_SECRET: process.env.JWT_SECRET ? 'Set' : 'Not set',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
    GOOGLE_BOOKS_API_KEY: process.env.GOOGLE_BOOKS_API_KEY ? 'Set' : 'Not set',
    NODE_ENV: process.env.NODE_ENV,
  };

  return NextResponse.json({
    message: 'Debug info',
    environment: envVars,
    timestamp: new Date().toISOString()
  });
}
