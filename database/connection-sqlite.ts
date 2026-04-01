import Database from 'better-sqlite3';
import { mkdirSync } from 'fs';
import { join } from 'path';

let db: Database.Database | null = null;
let dbInitialized = false;

function initializeDatabase() {
  if (dbInitialized) {
    return db;
  }

  // Only try to initialize database if we're not in a serverless environment
  const isServerless = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';
  
  console.log('Environment check - VERCEL:', process.env.VERCEL, 'NODE_ENV:', process.env.NODE_ENV, 'isServerless:', isServerless);

  if (!isServerless) {
    try {
      // Ensure database directory exists
      const dbDir = join(process.cwd(), 'database');
      mkdirSync(dbDir, { recursive: true });
      
      // Try to initialize database
      db = new Database(join(dbDir, 'bookseek.db'));
      
      // Initialize database tables
      db.exec(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS books (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          google_books_id TEXT UNIQUE NOT NULL,
          title TEXT NOT NULL,
          author TEXT,
          description TEXT,
          cover_url TEXT,
          publish_date TEXT,
          isbn TEXT,
          page_count INTEGER,
          categories TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS favorites (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          book_id INTEGER NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
          UNIQUE (user_id, book_id)
        );

        CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
        CREATE INDEX IF NOT EXISTS idx_books_google_id ON books(google_books_id);
        CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
        CREATE INDEX IF NOT EXISTS idx_favorites_book_id ON favorites(book_id);
      `);
      
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Failed to initialize database:', error);
      console.log('Running in database-less mode (authentication will be limited)');
      db = null;
    }
  } else {
    console.log('Running in serverless mode - database disabled');
    db = null;
  }

  dbInitialized = true;
  return db;
}

// Export a function that gets the database instance
export function getDatabase() {
  return initializeDatabase();
}

// For backward compatibility, export the database directly
export default getDatabase();
