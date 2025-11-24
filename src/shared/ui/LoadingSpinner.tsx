interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fullScreen?: boolean;
  message?: string;
  variant?: 'default' | 'minimal';
}

const sizeClasses = {
  sm: 'h-8 w-8 border-2',
  md: 'h-12 w-12 border-3',
  lg: 'h-16 w-16 border-4',
  xl: 'h-20 w-20 border-4',
};

export default function LoadingSpinner({ 
  size = 'md', 
  fullScreen = false, 
  message = 'Đang tải...',
  variant = 'default'
}: LoadingSpinnerProps) {
  const spinnerContent = (
    <div className="text-center animate-fade-in">
      {variant === 'default' ? (
        <>
          <div className="relative inline-block">
            <div className={`animate-spin rounded-full border-blue-200 border-t-blue-600 ${sizeClasses[size]}`}></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <i className="fa-solid fa-blog text-blue-600 animate-pulse" 
                 style={{ fontSize: size === 'sm' ? '12px' : size === 'md' ? '18px' : size === 'lg' ? '24px' : '30px' }}></i>
            </div>
          </div>
          <p className="mt-4 text-gray-600 font-medium">{message}</p>
          <div className="mt-2 flex justify-center gap-1">
            <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
            <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
            <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
          </div>
        </>
      ) : (
        <>
          <div className={`animate-spin rounded-full border-blue-200 border-t-blue-600 ${sizeClasses[size]} mx-auto`}></div>
          {message && <p className="mt-3 text-gray-600 text-sm">{message}</p>}
        </>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        {spinnerContent}
      </div>
    );
  }

  return spinnerContent;
}
