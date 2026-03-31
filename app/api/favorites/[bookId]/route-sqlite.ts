import { NextRequest, NextResponse } from 'next/server';
import db from '@/database/connection-sqlite';
import { getTokenFromHeaders, verifyToken } from '@/utils/auth';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ bookId: string }> }
) {
  try {
    const { bookId } = await params;
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

    try {
      // Find book ID by Google Books ID
      const bookRow = db.prepare(
        'SELECT id FROM books WHERE google_books_id = ?'
      ).get(bookId) as { id: number } | undefined;

      if (!bookRow) {
        return NextResponse.json(
          { error: 'Book not found' },
          { status: 404 }
        );
      }

      // Remove from favorites
      const result = db.prepare(
        'DELETE FROM favorites WHERE user_id = ? AND book_id = ?'
      ).run(decoded.userId, bookRow.id);

      if (result.changes === 0) {
        return NextResponse.json(
          { error: 'Book not in favorites' },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { message: 'Book removed from favorites' },
        { status: 200 }
      );

    } catch (dbError: any) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: 'Failed to remove favorite' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Remove favorite error:', error);
    return NextResponse.json(
      { error: 'Failed to remove favorite' },
      { status: 500 }
    );
  }
}
