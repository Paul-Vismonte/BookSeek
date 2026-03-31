'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import SearchBar from '@/components/SearchBar';
import BookCard from '@/components/BookCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Book } from '@/services/books';
import { useAuth } from '@/contexts/AuthContext';

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const currentPage = parseInt(searchParams.get('page') || '1');
  const [books, setBooks] = useState<Book[]>([]);
  const [favoriteBookIds, setFavoriteBookIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalItems, setTotalItems] = useState(0);
  const { user, token } = useAuth();

  const booksPerPage = 20;
  const totalPages = Math.ceil(totalItems / booksPerPage);

  useEffect(() => {
    if (query.trim()) {
      searchBooks(query, currentPage);
    } else {
      setBooks([]);
      setTotalItems(0);
    }
  }, [query, currentPage]);

  useEffect(() => {
    if (user && token) {
      fetchFavorites();
    }
  }, [user, token]);

  const searchBooks = async (searchQuery: string, page: number) => {
    setLoading(true);
    setError(null);

    try {
      const startIndex = (page - 1) * booksPerPage;
      const response = await fetch(`/api/books/search?q=${encodeURIComponent(searchQuery)}&maxResults=${booksPerPage}&startIndex=${startIndex}`);
      
      if (!response.ok) {
        throw new Error('Failed to search books');
      }

      const data = await response.json();
      setBooks(data.books || []);
      setTotalItems(data.totalItems || 0);
    } catch (err) {
      setError('Failed to search books. Please try again.');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFavorites = async () => {
    if (!token) return;

    try {
      const response = await fetch('/api/favorites', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const favoriteIds = new Set(data.favorites.map((fav: { id: string }) => fav.id) as string[]);
        setFavoriteBookIds(favoriteIds);
      }
    } catch (err) {
      console.error('Fetch favorites error:', err);
    }
  };

  const handleToggleFavorite = (book: Book) => {
    if (favoriteBookIds.has(book.id)) {
      setFavoriteBookIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(book.id);
        return newSet;
      });
    } else {
      setFavoriteBookIds(prev => new Set(prev).add(book.id));
    }
  };

  const handlePageChange = (page: number) => {
    const url = new URL(window.location.href);
    url.searchParams.set('page', page.toString());
    window.history.pushState({}, '', url.toString());
  };

  return (
    <div className="flex-1">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Discover Your Next Book
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Search through thousands of books to find your perfect read
          </p>
          <SearchBar className="mx-auto" />
        </div>

        {query && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-foreground">
              Search results for "{query}"
            </h2>
            <p className="text-sm text-muted-foreground">
              {totalItems} books found
            </p>
          </div>
        )}

        {loading && (
          <div className="flex justify-center py-16">
            <div className="text-center space-y-4">
              <LoadingSpinner size="xl" />
              <p className="text-muted-foreground animate-pulse">Searching for books...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <p className="text-destructive">{error}</p>
          </div>
        )}

        {!loading && !error && books.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-8 animate-fade-in">
              {books.map((book, index) => (
                <div
                  key={book.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <BookCard
                    book={book}
                    isFavorite={favoriteBookIds.has(book.id)}
                    onToggleFavorite={handleToggleFavorite}
                  />
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 animate-fade-in">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 interactive-press disabled:interactive-press-none"
                >
                  Previous
                </button>
                
                <span className="text-sm text-muted-foreground px-3 py-1 bg-accent rounded-lg">
                  Page {currentPage} of {totalPages}
                </span>
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 interactive-press disabled:interactive-press-none"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}

        {!loading && !error && query && books.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No books found for "{query}". Try a different search term.
            </p>
          </div>
        )}

        {!query && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Start searching for books to see results here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Suspense fallback={<LoadingSpinner size="lg" />}>
        <SearchResults />
      </Suspense>
    </div>
  );
}
