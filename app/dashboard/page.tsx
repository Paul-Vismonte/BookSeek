'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import BookCard from '@/components/BookCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useAuth } from '@/contexts/AuthContext';
import { Book } from '@/services/books';

interface FavoriteBook extends Book {
  favoritedAt: string;
}

export default function Dashboard() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [favorites, setFavorites] = useState<FavoriteBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    fetchFavorites();
  }, [user, router]);

  const fetchFavorites = async () => {
    if (!token) return;

    try {
      const response = await fetch('/api/favorites', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch favorites');
      }

      const data = await response.json();
      setFavorites(data.favorites || []);
    } catch (err) {
      setError('Failed to load your saved books. Please try again.');
      console.error('Favorites fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async (book: Book) => {
    if (!token) return;

    try {
      const response = await fetch(`/api/favorites/${book.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setFavorites(prev => prev.filter(fav => fav.id !== book.id));
      }
    } catch (err) {
      console.error('Remove favorite error:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex justify-center items-center flex-1 py-12">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            My Books
          </h1>
          <p className="text-muted-foreground">
            Your personal collection of saved books
          </p>
        </div>

        {error && (
          <div className="text-center py-12">
            <p className="text-destructive mb-4">{error}</p>
            <button
              onClick={fetchFavorites}
              className="text-ring hover:text-ring/80 underline"
            >
              Try again
            </button>
          </div>
        )}

        {!error && favorites.length === 0 && (
          <div className="text-center py-12">
            <div className="mb-6">
              <svg
                className="w-24 h-24 text-muted-foreground mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              No saved books yet
            </h2>
            <p className="text-muted-foreground mb-6">
              Start searching for books and save your favorites to build your personal library.
            </p>
            <a
              href="/"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-background bg-foreground hover:bg-foreground/90 transition-colors"
            >
              Search for books
            </a>
          </div>
        )}

        {!error && favorites.length > 0 && (
          <div>
            <div className="mb-6">
              <p className="text-sm text-muted-foreground">
                {favorites.length} {favorites.length === 1 ? 'book' : 'books'} in your collection
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {favorites.map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  isFavorite={true}
                  onToggleFavorite={handleToggleFavorite}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
