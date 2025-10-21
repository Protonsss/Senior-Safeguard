export default function Logo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: { container: 'w-8 h-8', text: 'text-xl', badge: 'text-[10px]' },
    md: { container: 'w-12 h-12', text: 'text-3xl', badge: 'text-xs' },
    lg: { container: 'w-20 h-20', text: 'text-5xl', badge: 'text-base' },
  };

  const s = sizes[size];

  return (
    <div className="flex items-center gap-3">
      {/* Logo Icon with gradient */}
      <div className={`${s.container} relative`}>
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 rounded-2xl shadow-lg" />
        
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-purple-500 to-indigo-600 rounded-2xl blur-md opacity-50 animate-pulse" />
        
        {/* Icon */}
        <div className={`relative ${s.container} flex items-center justify-center text-white ${s.text} font-bold`}>
          🛡️
        </div>
        
        {/* AI Badge */}
        <div className={`absolute -bottom-1 -right-1 bg-gradient-to-r from-emerald-400 to-cyan-500 ${s.badge} font-bold px-1.5 py-0.5 rounded-full text-white shadow-lg border-2 border-white`}>
          AI
        </div>
      </div>
      
      {/* Logo Text */}
      {size !== 'sm' && (
        <div className="flex flex-col">
          <span className={`font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent ${size === 'lg' ? 'text-3xl' : 'text-xl'}`}>
            Senior Safeguard
          </span>
          <span className="text-xs text-gray-500 font-medium tracking-wide">
            AI-Powered Protection
          </span>
        </div>
      )}
    </div>
  );
}

