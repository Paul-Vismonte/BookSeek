import { NextRequest, NextResponse } from 'next/server';
import { BooksService } from '@/services/books';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const maxResults = parseInt(searchParams.get('maxResults') || '20');
    const startIndex = parseInt(searchParams.get('startIndex') || '0');

    if (!query) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    // First, get the total count
    const countUrl = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=1`;
    const countResponse = await fetch(countUrl);
    
    if (!countResponse.ok) {
      throw new Error(`Google Books API error: ${countResponse.status}`);
    }

    const countData = await countResponse.json();
    const totalItems = countData.totalItems || 0;

    // Then get the actual results
    const books = await BooksService.searchBooks(query, maxResults, startIndex);

    return NextResponse.json({ 
      books, 
      totalItems,
      startIndex,
      maxResults 
    }, { status: 200 });

  } catch (error) {
    console.error('Book search error:', error);
    return NextResponse.json(
      { error: 'Failed to search books' },
      { status: 500 }
    );
  }
}
