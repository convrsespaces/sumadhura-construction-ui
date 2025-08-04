import React from 'react';

interface RadialGradientBackgroundProps {
  className?: string;
}

const RadialGradientBackground: React.FC<RadialGradientBackgroundProps> = ({ 
  className = "" 
}) => {
  return (
    <div 
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{
        background: `
          radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
          radial-gradient(circle at 40% 80%, rgba(120, 219, 255, 0.3) 0%, transparent 50%),
          radial-gradient(circle at 80% 80%, rgba(255, 219, 120, 0.3) 0%, transparent 50%)
        `,
        backgroundSize: '100% 100%',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    />
  );
};

export default RadialGradientBackground; 