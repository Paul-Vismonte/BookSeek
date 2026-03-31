'use client';

import Link from 'next/link';
import { Book } from '@/services/books';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';

interface BookCardProps {
  book: Book;
  isFavorite?: boolean;
  onToggleFavorite?: (book: Book) => void;
}

export default function BookCard({ book, isFavorite = false, onToggleFavorite }: BookCardProps) {
  const { user, token } = useAuth();
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user || !token || !onToggleFavorite) return;
    
    setIsLoading(true);
    
    try {
      if (isFavorite) {
        // Remove from favorites
        const response = await fetch(`/api/favorites/${book.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (response.ok) {
          onToggleFavorite(book);
        }
      } else {
        // Add to favorites
        const response = await fetch('/api/favorites', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            googleBooksId: book.id,
            title: book.title,
            author: book.authors?.join(', '),
            description: book.description,
            coverUrl: book.coverUrl,
            publishDate: book.publishDate,
            isbn: book.isbn,
            pageCount: book.pageCount,
            categories: book.categories
          }),
        });
        
        if (response.ok) {
          onToggleFavorite(book);
        }
      }
    } catch (error) {
      console.error('Toggle favorite error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Link href={`/books/${book.id}`} className="block group">
      <div className="bg-card border border-border rounded-xl overflow-hidden card-shadow card-shadow-hover transition-all duration-300 hover-lift interactive-scale">
        <div className="relative aspect-3/4 bg-muted overflow-hidden">
          {book.coverUrl && !imageError ? (
            <img
              src={book.coverUrl}
              alt={book.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-border">
              <svg
                className="w-16 h-16 text-muted-foreground opacity-60"
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
          )}
          
          {user && onToggleFavorite && (
            <button
              onClick={handleFavoriteClick}
              disabled={isLoading}
              className="absolute top-3 right-3 p-2.5 bg-card/90 backdrop-blur-md rounded-full border border-border/50 hover:bg-card transition-all disabled:opacity-50 disabled:cursor-not-allowed card-shadow interactive-scale"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <svg
                  className={`w-5 h-5 transition-all duration-200 ${isFavorite ? 'text-destructive fill-current scale-110' : 'text-muted-foreground hover:text-foreground'}`}
                  fill={isFavorite ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              )}
            </button>
          )}
        </div>

        <div className="p-5 space-y-3">
          <h3 className="font-semibold text-card-foreground line-clamp-2 text-base leading-tight group-hover:text-ring transition-colors duration-200">
            {book.title}
          </h3>
          
          {book.authors && book.authors.length > 0 && (
            <p className="text-sm text-muted-foreground font-medium">
              {book.authors.slice(0, 3).join(', ')}
              {book.authors.length > 3 && ` +${book.authors.length - 3}`}
            </p>
          )}

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            {book.publishDate && (
              <span>
                {new Date(book.publishDate).getFullYear()}
              </span>
            )}
            {book.pageCount && (
              <span>
                {book.pageCount} pages
              </span>
            )}
          </div>

          {book.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {book.description}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
