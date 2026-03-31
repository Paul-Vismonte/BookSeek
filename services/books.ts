import { getMockBooks } from './mockBooks';

export interface Book {
  id: string;
  title: string;
  authors?: string[];
  description?: string;
  coverUrl?: string;
  publishDate?: string;
  isbn?: string;
  pageCount?: number;
  categories?: string[];
}

export interface GoogleBooksResponse {
  items: GoogleBookItem[];
  totalItems: number;
  kind: string;
}

export interface GoogleBookItem {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    description?: string;
    imageLinks?: {
      thumbnail?: string;
      smallThumbnail?: string;
    };
    publishedDate?: string;
    industryIdentifiers?: Array<{
      type: string;
      identifier: string;
    }>;
    pageCount?: number;
    categories?: string[];
  };
}

export class BooksService {
  private static readonly BASE_URL = 'https://www.googleapis.com/books/v1/volumes';

  static async searchBooks(query: string, maxResults: number = 20, startIndex: number = 0): Promise<Book[]> {
    if (!query.trim()) {
      return [];
    }

    try {
      // Add API key if available
      const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
      let url = `${this.BASE_URL}?q=${encodeURIComponent(query)}&maxResults=${maxResults}&startIndex=${startIndex}&langRestrict=en`;
      
      if (apiKey) {
        url += `&key=${apiKey}`;
      }

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'BookSeek/1.0'
        },
        // Add timeout to prevent hanging requests
        signal: AbortSignal.timeout(10000)
      });
      
      if (!response.ok) {
        if (response.status === 503) {
          console.error('Google Books API temporarily unavailable (503). Using fallback data.');
          // Return mock data as fallback
          return getMockBooks(query, maxResults);
        } else if (response.status === 429) {
          console.error('Google Books API rate limit exceeded (429). Using fallback data.');
          // Return mock data as fallback
          return getMockBooks(query, maxResults);
        } else {
          throw new Error(`Google Books API error: ${response.status}`);
        }
      }

      const data: GoogleBooksResponse = await response.json();
      
      if (!data.items || data.items.length === 0) {
        // If no results from Google Books, try mock data
        const mockResults = getMockBooks(query, maxResults);
        if (mockResults.length > 0) {
          console.log('No results from Google Books, showing mock data');
          return mockResults;
        }
        return [];
      }
      
      return data.items.map(this.transformGoogleBook);
    } catch (error) {
      console.error('Error searching books:', error);
      
      // If there's a network error or other issue, try mock data as fallback
      if (error instanceof Error && (error.name === 'AbortError' || error.message.includes('fetch'))) {
        console.log('Network error, using mock data as fallback');
        return getMockBooks(query, maxResults);
      }
      
      // Re-throw with more user-friendly message
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to search books. Please try again.');
    }
  }

  static async getBookById(id: string): Promise<Book | null> {
    try {
      const response = await fetch(`${this.BASE_URL}/${id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Google Books API error: ${response.status}`);
      }

      const data: GoogleBookItem = await response.json();
      return this.transformGoogleBook(data);
    } catch (error) {
      console.error('Error fetching book:', error);
      throw error;
    }
  }

  private static transformGoogleBook(item: GoogleBookItem): Book {
    const { volumeInfo } = item;
    
    return {
      id: item.id,
      title: volumeInfo.title || 'Unknown Title',
      authors: volumeInfo.authors || [],
      description: volumeInfo.description || '',
      coverUrl: volumeInfo.imageLinks?.thumbnail || volumeInfo.imageLinks?.smallThumbnail,
      publishDate: volumeInfo.publishedDate,
      isbn: volumeInfo.industryIdentifiers?.find(id => id.type === 'ISBN_13' || id.type === 'ISBN_10')?.identifier,
      pageCount: volumeInfo.pageCount,
      categories: volumeInfo.categories || []
    };
  }
}
