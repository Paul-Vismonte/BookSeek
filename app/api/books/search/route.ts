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
    const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
    let countUrl = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=1`;
    
    if (apiKey) {
      countUrl += `&key=${apiKey}`;
    }

    const countResponse = await fetch(countUrl, {
      headers: {
        'User-Agent': 'BookSeek/1.0'
      },
      signal: AbortSignal.timeout(5000)
    });
    
    if (!countResponse.ok) {
      if (countResponse.status === 503 || countResponse.status === 429) {
        // For API errors, we'll let the BooksService handle fallback
        console.log(`Google Books API error ${countResponse.status}, proceeding with search service fallback`);
      } else {
        throw new Error(`Google Books API error: ${countResponse.status}`);
      }
    }

    let totalItems = 0;
    if (countResponse.ok) {
      const countData = await countResponse.json();
      totalItems = countData.totalItems || 0;
    }

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
    
    // Return more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('temporarily unavailable')) {
        return NextResponse.json(
          { error: error.message },
          { status: 503 }
        );
      } else if (error.message.includes('Rate limit')) {
        return NextResponse.json(
          { error: error.message },
          { status: 429 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to search books. Please try again.' },
      { status: 500 }
    );
  }
}
