// Mock database for Vercel serverless environment
interface MockUser {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  created_at: string;
}

interface MockFavorite {
  id: number;
  user_id: number;
  google_books_id: string;
  created_at: string;
}

// In-memory storage (will reset on each function invocation)
let mockUsers: MockUser[] = [];
let mockFavorites: MockFavorite[] = [];
let userIdCounter = 1;
let favoriteIdCounter = 1;

export class MockDatabase {
  constructor() {
    console.log('Using mock database for serverless environment');
  }

  // User operations
  prepare(query: string) {
    return new MockStatement(query);
  }

  exec(query: string) {
    console.log('Mock exec:', query);
  }

  transaction(callback: Function) {
    console.log('Mock transaction');
    return callback;
  }
}

class MockStatement {
  constructor(private query: string) {}

  get(...params: any[]) {
    console.log('Mock query:', this.query, 'params:', params);
    
    if (this.query.includes('SELECT id FROM users WHERE email = ?')) {
      const email = params[0];
      return mockUsers.find(user => user.email === email);
    }
    
    if (this.query.includes('SELECT id FROM users WHERE email = ? OR username = ?')) {
      const [email, username] = params;
      return mockUsers.find(user => user.email === email || user.username === username);
    }
    
    if (this.query.includes('SELECT id, username, email, password_hash FROM users WHERE email = ?')) {
      const email = params[0];
      return mockUsers.find(user => user.email === email);
    }
    
    if (this.query.includes('SELECT id FROM books WHERE google_books_id = ?')) {
      // For favorites, we don't need actual book storage
      return { id: 1 }; // Mock book ID
    }
    
    return null;
  }

  all(...params: any[]) {
    console.log('Mock query all:', this.query, 'params:', params);
    
    if (this.query.includes('SELECT.*FROM favorites f.*JOIN books b')) {
      const userId = params[0];
      const userFavorites = mockFavorites.filter(fav => fav.user_id === userId);
      return userFavorites.map(fav => ({
        id: fav.google_books_id,
        title: `Mock Book ${fav.google_books_id}`,
        author: 'Mock Author',
        description: 'Mock description',
        coverUrl: 'https://via.placeholder.com/128x192.png?text=Mock+Book',
        publishDate: '2024-01-01',
        isbn: '1234567890',
        pageCount: 200,
        categories: 'Fiction',
        favoritedAt: fav.created_at
      }));
    }
    
    return [];
  }

  run(...params: any[]) {
    console.log('Mock run:', this.query, 'params:', params);
    
    if (this.query.includes('INSERT INTO users')) {
      const [username, email, passwordHash] = params;
      const newUser: MockUser = {
        id: userIdCounter++,
        username,
        email,
        password_hash: passwordHash,
        created_at: new Date().toISOString()
      };
      mockUsers.push(newUser);
      return { lastInsertRowid: newUser.id };
    }
    
    if (this.query.includes('INSERT INTO favorites')) {
      const [userId, bookId] = params;
      const newFavorite: MockFavorite = {
        id: favoriteIdCounter++,
        user_id: userId,
        google_books_id: `mock-book-${bookId}`,
        created_at: new Date().toISOString()
      };
      mockFavorites.push(newFavorite);
      return { lastInsertRowid: newFavorite.id };
    }
    
    if (this.query.includes('DELETE FROM favorites')) {
      const [userId, bookId] = params;
      const initialLength = mockFavorites.length;
      mockFavorites = mockFavorites.filter(fav => !(fav.user_id === userId && fav.google_books_id === `mock-book-${bookId}`));
      return { changes: initialLength - mockFavorites.length };
    }
    
    return { changes: 0 };
  }
}

export default MockDatabase;
