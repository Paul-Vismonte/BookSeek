const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../database/bookseek.db');
const db = new Database(dbPath);

console.log('📊 BookSeek Database Viewer');
console.log('📍 Database:', dbPath);
console.log('');

// Show tables
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log('📋 Tables:');
tables.forEach(table => {
  console.log(`  - ${table.name}`);
});

console.log('');

// Show users
const users = db.prepare('SELECT id, username, email, created_at FROM users').all();
console.log('👥 Users:');
users.forEach(user => {
  console.log(`  ID: ${user.id} | Username: ${user.username} | Email: ${user.email} | Created: ${user.created_at}`);
});

console.log('');

// Show books count
const bookCount = db.prepare('SELECT COUNT(*) as count FROM books').get();
console.log('📚 Books:', bookCount.count);

// Show recent books
const recentBooks = db.prepare('SELECT google_books_id, title, author FROM books ORDER BY created_at DESC LIMIT 5').all();
console.log('📖 Recent Books:');
recentBooks.forEach(book => {
  console.log(`  - ${book.title} by ${book.author || 'Unknown'} (ID: ${book.google_books_id})`);
});

console.log('');

// Show favorites count
const favoriteCount = db.prepare('SELECT COUNT(*) as count FROM favorites').get();
console.log('❤️  Favorites:', favoriteCount.count);

// Show recent favorites
const recentFavorites = db.prepare(`
  SELECT u.username, b.title, f.created_at 
  FROM favorites f 
  JOIN users u ON f.user_id = u.id 
  JOIN books b ON f.book_id = b.id 
  ORDER BY f.created_at DESC 
  LIMIT 5
`).all();

if (recentFavorites.length > 0) {
  console.log('❤️  Recent Favorites:');
  recentFavorites.forEach(fav => {
    console.log(`  - ${fav.title} (by ${fav.username} on ${fav.created_at})`);
  });
}

db.close();
console.log('');
console.log('✅ Database viewer complete!');
