const Database = require('better-sqlite3');
const path = require('path');
const http = require('http');
const fs = require('fs');

const dbPath = path.join(__dirname, '../database/bookseek.db');
const db = new Database(dbPath);

const PORT = 3001;

const server = http.createServer((req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'GET') {
    const url = new URL(req.url, `http://localhost:${PORT}`);
    const pathname = url.pathname;

    // API Routes
    if (pathname === '/api/tables') {
      const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(tables));
      return;
    }

    if (pathname === '/api/users') {
      const users = db.prepare('SELECT id, username, email, created_at FROM users ORDER BY created_at DESC').all();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(users));
      return;
    }

    if (pathname === '/api/books') {
      const books = db.prepare('SELECT google_books_id, title, author, created_at FROM books ORDER BY created_at DESC LIMIT 50').all();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(books));
      return;
    }

    if (pathname === '/api/favorites') {
      const favorites = db.prepare(`
        SELECT u.username, b.title, b.author, f.created_at 
        FROM favorites f 
        JOIN users u ON f.user_id = u.id 
        JOIN books b ON f.book_id = b.id 
        ORDER BY f.created_at DESC 
        LIMIT 50
      `).all();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(favorites));
      return;
    }

    // Serve HTML dashboard
    const html = `
<!DOCTYPE html>
<html>
<head>
    <title>BookSeek Database Dashboard</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .header { background: #333; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 20px; }
        .stat-card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .stat-number { font-size: 2em; font-weight: bold; color: #333; }
        .stat-label { color: #666; margin-top: 5px; }
        .section { background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .section h2 { margin-top: 0; color: #333; }
        .api-list { list-style: none; padding: 0; }
        .api-list li { background: #f8f9fa; padding: 10px; margin: 5px 0; border-radius: 4px; }
        .api-list a { text-decoration: none; color: #0066cc; }
        .api-list a:hover { text-decoration: underline; }
        .refresh { background: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; }
        .refresh:hover { background: #0056b3; }
    </style>
</head>
<body>
    <div class="header">
        <h1>📊 BookSeek Database Dashboard</h1>
        <p>Database: ${dbPath}</p>
        <button class="refresh" onclick="location.reload()">🔄 Refresh</button>
    </div>

    <div class="stats">
        <div class="stat-card">
            <div class="stat-number" id="users-count">-</div>
            <div class="stat-label">Users</div>
        </div>
        <div class="stat-card">
            <div class="stat-number" id="books-count">-</div>
            <div class="stat-label">Books</div>
        </div>
        <div class="stat-card">
            <div class="stat-number" id="favorites-count">-</div>
            <div class="stat-label">Favorites</div>
        </div>
    </div>

    <div class="section">
        <h2>🔗 API Endpoints</h2>
        <ul class="api-list">
            <li><a href="/api/users">👥 View All Users</a></li>
            <li><a href="/api/books">📚 View All Books</a></li>
            <li><a href="/api/favorites">❤️ View All Favorites</a></li>
            <li><a href="/api/tables">📋 View Tables</a></li>
        </ul>
    </div>

    <script>
        // Load stats
        async function loadStats() {
            try {
                const [usersRes, booksRes, favoritesRes] = await Promise.all([
                    fetch('/api/users').then(r => r.json()),
                    fetch('/api/books').then(r => r.json()),
                    fetch('/api/favorites').then(r => r.json())
                ]);

                document.getElementById('users-count').textContent = usersRes.length;
                document.getElementById('books-count').textContent = booksRes.length;
                document.getElementById('favorites-count').textContent = favoritesRes.length;
            } catch (error) {
                console.error('Error loading stats:', error);
            }
        }

        // Load stats on page load
        loadStats();
        
        // Auto-refresh every 30 seconds
        setInterval(loadStats, 30000);
    </script>
</body>
</html>`;

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
  }
});

server.listen(PORT, () => {
  console.log(`🚀 Database Dashboard running on: http://localhost:${PORT}`);
  console.log(`📊 Database file: ${dbPath}`);
  console.log('🔗 Open your browser and navigate to the URL above');
});
