import { NextRequest, NextResponse } from 'next/server';
import db from '@/database/connection-sqlite';
import { getTokenFromHeaders, verifyToken } from '@/utils/auth';

export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromHeaders(request.headers);
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Check if database is available
    if (!db) {
      return NextResponse.json(
        { favorites: [] },
        { status: 200 }
      );
    }

    try {
      const favorites = db.prepare(`
        SELECT 
          b.google_books_id as id,
          b.title,
          b.author,
          b.description,
          b.cover_url as coverUrl,
          b.publish_date as publishDate,
          b.isbn,
          b.page_count as pageCount,
          b.categories,
          f.created_at as favoritedAt
        FROM favorites f
        JOIN books b ON f.book_id = b.id
        WHERE f.user_id = ?
        ORDER BY f.created_at DESC
      `).all(decoded.userId) as {
        id: string;
        title: string;
        author?: string;
        description?: string;
        coverUrl?: string;
        publishDate?: string;
        isbn?: string;
        pageCount?: number;
        categories?: string;
        favoritedAt: string;
      }[];

      return NextResponse.json({ favorites }, { status: 200 });

    } catch (dbError: any) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { favorites: [] },
        { status: 200 }
      );
    }

  } catch (error) {
    console.error('Get favorites error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch favorites' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = getTokenFromHeaders(request.headers);
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Check if database is available
    if (!db) {
      return NextResponse.json(
        { error: 'Database is not available. Favorites are temporarily disabled.' },
        { status: 503 }
      );
    }

    const { googleBooksId, title, author, description, coverUrl, publishDate, isbn, pageCount, categories } = await request.json();

    if (!googleBooksId || !title) {
      return NextResponse.json(
        { error: 'Book ID and title are required' },
        { status: 400 }
      );
    }

    try {
      // Start transaction
      const transaction = db!.transaction(() => {
        // Check if book already exists
        const existingBook = db!.prepare(
          'SELECT id FROM books WHERE google_books_id = ?'
        ).get(googleBooksId) as { id: number } | undefined;

        let bookId: number;
        
        if (existingBook) {
          bookId = existingBook.id;
        } else {
          // Insert new book
          const insertResult = db!.prepare(
            `INSERT INTO books (google_books_id, title, author, description, cover_url, publish_date, isbn, page_count, categories) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
          ).run(
            googleBooksId,
            title,
            author || null,
            description || null,
            coverUrl || null,
            publishDate || null,
            isbn || null,
            pageCount || null,
            categories ? categories.join(', ') : null
          );
          bookId = Number(insertResult.lastInsertRowid);
        }

        // Check if already favorited
        const existingFavorite = db!.prepare(
          'SELECT id FROM favorites WHERE user_id = ? AND book_id = ?'
        ).get(decoded.userId, bookId);

        if (existingFavorite) {
          throw new Error('Book already in favorites');
        }

        // Add to favorites
        db!.prepare(
          'INSERT INTO favorites (user_id, book_id) VALUES (?, ?)'
        ).run(decoded.userId, bookId);
      });

      transaction();

      return NextResponse.json(
        { message: 'Book added to favorites' },
        { status: 201 }
      );

    } catch (dbError: any) {
      if (dbError.message === 'Book already in favorites') {
        return NextResponse.json(
          { error: 'Book already in favorites' },
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
    console.error('Add favorite error:', error);
    return NextResponse.json(
      { error: 'Invalid request format' },
      { status: 400 }
    );
  }
}
