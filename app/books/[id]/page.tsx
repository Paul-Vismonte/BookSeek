'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Book } from '@/services/books';

export default function BookDetails() {
  const params = useParams();
  const router = useRouter();
  const bookId = params.id as string;
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBook();
  }, [bookId]);

  const fetchBook = async () => {
    try {
      const response = await fetch(`/api/books/${bookId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('Book not found');
        } else {
          setError('Failed to fetch book details');
        }
        return;
      }

      const data = await response.json();
      setBook(data.book);
    } catch (err) {
      setError('Failed to fetch book details. Please try again.');
      console.error('Book fetch error:', err);
    } finally {
      setLoading(false);
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

  if (error || !book) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">
              {error || 'Book not found'}
            </h1>
            <Link
              href="/"
              className="text-ring hover:text-ring/80 underline"
            >
              Back to search
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link
            href="/"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to search
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <div className="aspect-3/4 bg-muted rounded-lg overflow-hidden mb-4">
                {book.coverUrl ? (
                  <img
                    src={book.coverUrl}
                    alt={book.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg
                      className="w-24 h-24 text-muted-foreground"
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
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <h1 className="text-3xl font-bold text-foreground mb-4">
              {book.title}
            </h1>

            {book.authors && book.authors.length > 0 && (
              <p className="text-lg text-muted-foreground mb-6">
                by {book.authors.join(', ')}
              </p>
            )}

            <div className="prose prose-gray max-w-none">
              {book.description && (
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-foreground mb-4">
                    Description
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {book.description}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {book.publishDate && (
                  <div>
                    <h3 className="text-sm font-medium text-foreground mb-1">
                      Published
                    </h3>
                    <p className="text-muted-foreground">
                      {new Date(book.publishDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                )}

                {book.pageCount && (
                  <div>
                    <h3 className="text-sm font-medium text-foreground mb-1">
                      Pages
                    </h3>
                    <p className="text-muted-foreground">{book.pageCount}</p>
                  </div>
                )}

                {book.isbn && (
                  <div>
                    <h3 className="text-sm font-medium text-foreground mb-1">
                      ISBN
                    </h3>
                    <p className="text-muted-foreground">{book.isbn}</p>
                  </div>
                )}

                {book.categories && book.categories.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-foreground mb-1">
                      Categories
                    </h3>
                    <p className="text-muted-foreground">
                      {book.categories.join(', ')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
