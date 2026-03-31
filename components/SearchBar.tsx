'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface SearchBarProps {
  placeholder?: string;
  className?: string;
}

export default function SearchBar({ placeholder = "Search for books...", className = "" }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim()) {
        router.push(`/?q=${encodeURIComponent(query)}`);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`w-full max-w-2xl ${className}`}>
      <div className="relative group">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            className={`
              w-full px-5 py-4 pr-14 
              text-foreground bg-input border-2 border-border 
              rounded-xl focus:outline-none focus:ring-0 
              focus:border-ring transition-all duration-300
              focus:bg-background focus:shadow-lg
              ${isFocused ? 'border-ring shadow-lg' : 'hover:border-border/80'}
              placeholder:text-muted-foreground/60
            `}
          />
          
          {/* Search icon */}
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <svg
              className={`
                w-6 h-6 text-muted-foreground 
                transition-all duration-300
                ${isFocused ? 'text-ring scale-110' : ''}
              `}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          {/* Loading indicator */}
          {query && (
            <div className="absolute right-14 top-1/2 transform -translate-y-1/2">
              <div className="w-5 h-5 border-2 border-t-2 border-ring border-t-transparent animate-spin rounded-full"></div>
            </div>
          )}
        </div>

        {/* Subtle glow effect when focused */}
        <div className={`
          absolute inset-0 rounded-xl bg-ring/5 
          transition-opacity duration-300 pointer-events-none
          ${isFocused ? 'opacity-100' : 'opacity-0'}
        `}></div>
      </div>
    </form>
  );
}
