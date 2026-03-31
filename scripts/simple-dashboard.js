const Database = require('better-sqlite3');
const path = require('path');
const http = require('http');

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
    if (pathname === '/api/stats') {
      const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
      const bookCount = db.prepare('SELECT COUNT(*) as count FROM books').get();
      const favoriteCount = db.prepare('SELECT COUNT(*) as count FROM favorites').get();
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        users: userCount.count,
        books: bookCount.count,
        favorites: favoriteCount.count
      }));
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
    const html = `<!DOCTYPE html>
<html>
<head>
    <title>BookSeek Database Dashboard</title>
    <meta charset="UTF-8">
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
        .data-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        .data-table th, .data-table td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
        .data-table th { background: #f8f9fa; }
        .empty { color: #666; font-style: italic; }
    </style>
</head>
<body>
    <div class="header">
        <h1>BookSeek Database Dashboard</h1>
        <p>Database: ${dbPath}</p>
        <button class="refresh" onclick="location.reload()">Refresh</button>
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
        <h2>API Endpoints</h2>
        <ul class="api-list">
            <li><a href="/api/users">View All Users</a></li>
            <li><a href="/api/books">View All Books</a></li>
            <li><a href="/api/favorites">View All Favorites</a></li>
            <li><a href="/api/stats">View Stats JSON</a></li>
        </ul>
    </div>

    <div class="section">
        <h2>Recent Data</h2>
        <div id="data-display">Loading...</div>
    </div>

    <script>
        async function loadData() {
            try {
                const [statsRes, usersRes, booksRes, favoritesRes] = await Promise.all([
                    fetch('/api/stats').then(r => r.json()),
                    fetch('/api/users').then(r => r.json()),
                    fetch('/api/books').then(r => r.json()),
                    fetch('/api/favorites').then(r => r.json())
                ]);

                document.getElementById('users-count').textContent = statsRes.users;
                document.getElementById('books-count').textContent = statsRes.books;
                document.getElementById('favorites-count').textContent = statsRes.favorites;

                // Display data tables
                let html = '';
                
                if (usersRes.length > 0) {
                    html += '<h3>Recent Users</h3>';
                    html += '<table class="data-table">';
                    html += '<tr><th>ID</th><th>Username</th><th>Email</th><th>Created</th></tr>';
                    usersRes.slice(0, 5).forEach(user => {
                        html += '<tr><td>' + user.id + '</td><td>' + user.username + '</td><td>' + user.email + '</td><td>' + new Date(user.created_at).toLocaleString() + '</td></tr>';
                    });
                    html += '</table>';
                }

                if (booksRes.length > 0) {
                    html += '<h3>Recent Books</h3>';
                    html += '<table class="data-table">';
                    html += '<tr><th>Google ID</th><th>Title</th><th>Author</th><th>Created</th></tr>';
                    booksRes.slice(0, 5).forEach(book => {
                        html += '<tr><td>' + book.google_books_id + '</td><td>' + book.title + '</td><td>' + (book.author || 'N/A') + '</td><td>' + new Date(book.created_at).toLocaleString() + '</td></tr>';
                    });
                    html += '</table>';
                }

                if (favoritesRes.length > 0) {
                    html += '<h3>Recent Favorites</h3>';
                    html += '<table class="data-table">';
                    html += '<tr><th>Username</th><th>Book Title</th><th>Author</th><th>Created</th></tr>';
                    favoritesRes.slice(0, 5).forEach(fav => {
                        html += '<tr><td>' + fav.username + '</td><td>' + fav.title + '</td><td>' + (fav.author || 'N/A') + '</td><td>' + new Date(fav.created_at).toLocaleString() + '</td></tr>';
                    });
                    html += '</table>';
                }

                if (html === '') {
                    html = '<p class="empty">No data found. Register users and save books to see data here.</p>';
                }

                document.getElementById('data-display').innerHTML = html;
            } catch (error) {
                console.error('Error loading data:', error);
                document.getElementById('data-display').innerHTML = '<p style="color: red;">Error loading data</p>';
            }
        }

        loadData();
        setInterval(loadData, 30000);
    </script>
</body>
</html>`;

    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);
  }
});

server.listen(PORT, () => {
  console.log('Database Dashboard running on: http://localhost:' + PORT);
  console.log('Open your browser to see the dashboard');
});
