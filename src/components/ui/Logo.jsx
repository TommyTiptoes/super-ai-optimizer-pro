import React from 'react';

export default function Logo({ size = 'normal', className = '' }) {
  const dimensions = {
    small: 'w-8 h-8',
    normal: 'w-12 h-12',
    large: 'w-16 h-16'
  };

  return (
    <div className={`${dimensions[size]} ${className} relative`}>
      {/* Arc Reactor Design */}
      <div className="w-full h-full rounded-full bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 p-0.5">
        <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center relative overflow-hidden">
          {/* Inner glow */}
          <div className="absolute inset-2 rounded-full bg-gradient-to-r from-cyan-400/30 to-blue-400/30 animate-pulse"></div>
          
          {/* Center core */}
          <div className="w-4 h-4 rounded-full bg-gradient-to-br from-cyan-300 to-blue-400 relative z-10 shadow-lg shadow-cyan-400/50">
            <div className="absolute inset-1 rounded-full bg-white/90"></div>
          </div>
          
          {/* Radiating lines */}
          <div className="absolute inset-0">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute w-0.5 h-3 bg-gradient-to-t from-cyan-400 to-transparent"
                style={{
                  top: '2px',
                  left: '50%',
                  transformOrigin: '50% 20px',
                  transform: `translateX(-50%) rotate(${i * 45}deg)`,
                  opacity: 0.6
                }}
              />
            ))}
          </div>
          
          {/* Outer ring segments */}
          <div className="absolute inset-1 rounded-full border border-cyan-400/40">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-0.5 bg-cyan-400/60 rounded-full"
                style={{
                  top: '1px',
                  left: '50%',
                  transformOrigin: '50% 16px',
                  transform: `translateX(-50%) rotate(${i * 30}deg)`
                }}
              />
            ))}
          </div>
        </div>
      </div>
      
      {/* Outer glow effect */}
      <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-cyan-400/20 to-blue-400/20 blur-sm -z-10"></div>
    </div>
  );
}