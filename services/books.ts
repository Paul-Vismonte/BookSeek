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
      const url = `${this.BASE_URL}?q=${encodeURIComponent(query)}&maxResults=${maxResults}&startIndex=${startIndex}&langRestrict=en`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Google Books API error: ${response.status}`);
      }

      const data: GoogleBooksResponse = await response.json();
      
      return data.items.map(this.transformGoogleBook);
    } catch (error) {
      console.error('Error searching books:', error);
      throw error;
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
