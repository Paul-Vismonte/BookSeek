import { NextRequest, NextResponse } from 'next/server';
import db from '@/database/connection-sqlite';
import { comparePassword, generateToken } from '@/utils/auth';

export async function POST(request: NextRequest) {
  console.log('Login API called');
  
  try {
    const { email, password } = await request.json();
    console.log('Login request received:', { email: email ? 'provided' : 'missing', password: password ? 'provided' : 'missing' });

    if (!email || !password) {
      console.log('Login validation failed: missing fields');
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Check if database is available
    if (!db) {
      console.log('Login: Database not available');
      return NextResponse.json(
        { error: 'Database is not available. Authentication is temporarily disabled.' },
        { status: 503 }
      );
    }

    try {
      // Find user by email
      const user = db.prepare(
        'SELECT id, username, email, password_hash FROM users WHERE email = ?'
      ).get(email) as {
        id: number;
        username: string;
        email: string;
        password_hash: string;
      } | undefined;

      if (!user) {
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        );
      }

      // Verify password
      const isValidPassword = await comparePassword(password, user.password_hash);
      
      if (!isValidPassword) {
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        );
      }

      // Generate token
      const token = generateToken(user.id, user.email);

      return NextResponse.json(
        { 
          message: 'Login successful',
          user: { id: user.id, username: user.username, email: user.email },
          token
        },
        { status: 200 }
      );

    } catch (dbError: any) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: 'Database operation failed' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Invalid request format' },
      { status: 400 }
    );
  }
}
