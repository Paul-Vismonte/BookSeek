import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/database/connection-sqlite';
import { hashPassword, generateToken } from '@/utils/auth';

export async function POST(request: NextRequest) {
  console.log('Register API called');
  
  try {
    const { username, email, password } = await request.json();
    console.log('Request data received:', { username, email: email ? 'provided' : 'missing', password: password ? 'provided' : 'missing' });

    if (!username || !email || !password) {
      console.log('Validation failed: missing fields');
      return NextResponse.json(
        { error: 'Username, email, and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      console.log('Validation failed: password too short');
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Get database (will be mock on Vercel, real on local)
    const db = getDatabase();
    if (!db) {
      console.log('Database initialization failed');
      return NextResponse.json(
        { error: 'Database initialization failed' },
        { status: 500 }
      );
    }

    try {
      // Check if user already exists
      const existingUser = db.prepare(
        'SELECT id FROM users WHERE email = ? OR username = ?'
      ).get(email, username);

      if (existingUser) {
        return NextResponse.json(
          { error: 'User with this email or username already exists' },
          { status: 409 }
        );
      }

      // Hash password and create user
      const passwordHash = await hashPassword(password);
      
      const result = db.prepare(
        'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)'
      ).run(username, email, passwordHash);

      const userId = Number(result.lastInsertRowid);
      const token = generateToken(userId, email);

      return NextResponse.json(
        { 
          message: 'User created successfully',
          user: { id: userId, username, email },
          token
        },
        { status: 201 }
      );

    } catch (dbError: any) {
      if (dbError.code === 'SQLITE_CONSTRAINT') {
        return NextResponse.json(
          { error: 'User with this email or username already exists' },
          { status: 409 }
        );
      }
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: 'Database operation failed' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Invalid request format' },
      { status: 400 }
    );
  }
}
