import { NextRequest, NextResponse } from 'next/server';
import { BooksService } from '@/services/books';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const book = await BooksService.getBookById(id);

    if (!book) {
      return NextResponse.json(
        { error: 'Book not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ book }, { status: 200 });

  } catch (error) {
    console.error('Book fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch book' },
      { status: 500 }
    );
  }
}
