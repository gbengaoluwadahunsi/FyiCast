export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        {/* Animated Spinner */}
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-white/5" />
          <div className="absolute top-0 left-0 w-16 h-16 rounded-full border-4 border-transparent border-t-cyan-500 animate-spin" />
        </div>
        
        {/* Loading Text */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-400">Loading</span>
          <span className="flex gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-bounce" style={{ animationDelay: '300ms' }} />
          </span>
        </div>
      </div>
    </div>
  );
}

