'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-background/80 backdrop-blur-lg border-b border-border/50 sticky top-0 z-50 card-shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link 
              href="/" 
              className="text-2xl font-bold text-foreground hover:text-ring transition-all duration-200 interactive-scale flex items-center space-x-2"
            >
              <span className="text-3xl">📚</span>
              <span>BookSeek</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-1">
            <Link
              href="/"
              className="text-muted-foreground hover:text-foreground px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-accent interactive-press"
            >
              Search
            </Link>
            {user && (
              <Link
                href="/dashboard"
                className="text-muted-foreground hover:text-foreground px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-accent interactive-press"
              >
                My Books
              </Link>
            )}
          </div>

          <div className="flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-3 animate-fade-in">
                <div className="hidden sm:flex items-center space-x-2 px-3 py-2 bg-accent rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-muted-foreground">
                    Welcome,{' '}
                    <span className="font-medium text-foreground">{user.username}</span>
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 interactive-scale card-shadow"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3 animate-slide-in">
                <Link
                  href="/login"
                  className="text-muted-foreground hover:text-foreground px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-accent interactive-press"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-foreground text-background hover:bg-foreground/90 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 interactive-scale card-shadow"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile menu */}
        <div className="md:hidden border-t border-border/50">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              href="/"
              className="text-muted-foreground hover:text-foreground block px-3 py-2 rounded-lg text-base font-medium transition-colors hover:bg-accent"
            >
              Search
            </Link>
            {user && (
              <Link
                href="/dashboard"
                className="text-muted-foreground hover:text-foreground block px-3 py-2 rounded-lg text-base font-medium transition-colors hover:bg-accent"
              >
                My Books
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
