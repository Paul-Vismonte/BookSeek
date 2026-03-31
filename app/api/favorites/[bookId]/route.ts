import { NextRequest, NextResponse } from 'next/server';
import connection from '@/database/connection';
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

    const db = await connection.getConnection();
    
    try {
      // Find book ID by Google Books ID
      const [bookRows] = await db.execute(
        'SELECT id FROM books WHERE google_books_id = ?',
        [bookId]
      ) as [any[], any];

      if (!Array.isArray(bookRows) || bookRows.length === 0) {
        return NextResponse.json(
          { error: 'Book not found' },
          { status: 404 }
        );
      }

      const dbBookId = (bookRows[0] as any).id;

      // Remove from favorites
      const [result] = await db.execute(
        'DELETE FROM favorites WHERE user_id = ? AND book_id = ?',
        [decoded.userId, dbBookId]
      ) as [any, any];

      if ((result as any).affectedRows === 0) {
        return NextResponse.json(
          { error: 'Book not in favorites' },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { message: 'Book removed from favorites' },
        { status: 200 }
      );

    } finally {
      db.release();
    }

  } catch (error) {
    console.error('Remove favorite error:', error);
    return NextResponse.json(
      { error: 'Failed to remove favorite' },
      { status: 500 }
    );
  }
}
