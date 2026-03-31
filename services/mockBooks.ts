import { Book } from './books';

export const mockBooks: Book[] = [
  {
    id: 'mock1',
    title: 'The Great Gatsby',
    authors: ['F. Scott Fitzgerald'],
    description: 'A classic American novel set in the Jazz Age, exploring themes of wealth, love, and the American Dream.',
    coverUrl: 'https://books.google.com/books/content?id=wrOQLV6xB-wC&printsec=frontcover&img=1&zoom=1&source=gbs_api',
    publishDate: '1925',
    isbn: '9780743273565',
    pageCount: 180,
    categories: ['Fiction', 'Classics']
  },
  {
    id: 'mock2',
    title: 'To Kill a Mockingbird',
    authors: ['Harper Lee'],
    description: 'A gripping tale of racial injustice and childhood innocence in the American South.',
    coverUrl: 'https://books.google.com/books/content?id=PGR2AwAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api',
    publishDate: '1960',
    isbn: '9780061120084',
    pageCount: 324,
    categories: ['Fiction', 'Classic Literature']
  },
  {
    id: 'mock3',
    title: '1984',
    authors: ['George Orwell'],
    description: 'A dystopian social science fiction novel and cautionary tale about the dangers of totalitarianism.',
    coverUrl: 'https://books.google.com/books/content?id=sxG1DAAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api',
    publishDate: '1949',
    isbn: '9780451524935',
    pageCount: 328,
    categories: ['Fiction', 'Dystopian', 'Science Fiction']
  },
  {
    id: 'mock4',
    title: 'Pride and Prejudice',
    authors: ['Jane Austen'],
    description: 'A romantic novel of manners that critiques the British landed gentry at the end of the 18th century.',
    coverUrl: 'https://books.google.com/books/content?id=184BAAAACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api',
    publishDate: '1813',
    isbn: '9780141439518',
    pageCount: 432,
    categories: ['Fiction', 'Romance', 'Classics']
  },
  {
    id: 'mock5',
    title: 'The Catcher in the Rye',
    authors: ['J.D. Salinger'],
    description: 'The story of teenage rebellion and angst, narrated by the iconic Holden Caulfield.',
    coverUrl: 'https://books.google.com/books/content?id=Dh0E0G_4M4AC&printsec=frontcover&img=1&zoom=1&source=gbs_api',
    publishDate: '1951',
    isbn: '9780316769174',
    pageCount: 234,
    categories: ['Fiction', 'Coming-of-age']
  }
];

export function getMockBooks(query: string, maxResults: number = 20): Book[] {
  const lowerQuery = query.toLowerCase();
  const filtered = mockBooks.filter(book => 
    book.title.toLowerCase().includes(lowerQuery) ||
    (book.authors && book.authors.some(author => author.toLowerCase().includes(lowerQuery))) ||
    (book.description && book.description.toLowerCase().includes(lowerQuery))
  );
  
  return filtered.slice(0, maxResults);
}
