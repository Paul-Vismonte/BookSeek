export default function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' | 'xl' }) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3',
    xl: 'w-16 h-16 border-4'
  };

  const containerClasses = {
    sm: 'p-2',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8'
  };

  return (
    <div className={`flex items-center justify-center ${containerClasses[size]}`}>
      <div className="relative">
        <div
          className={`${sizeClasses[size]} border-muted border-t-transparent rounded-full animate-spin`}
          style={{ animationDuration: '0.8s' }}
        ></div>
        <div
          className={`absolute inset-0 ${sizeClasses[size]} border-ring/30 border-t-transparent rounded-full animate-spin`}
          style={{ animationDuration: '1.2s', animationDirection: 'reverse' }}
        ></div>
      </div>
    </div>
  );
}
