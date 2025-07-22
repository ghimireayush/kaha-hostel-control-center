import React from 'react';

interface KahaLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showText?: boolean;
}

const sizeMap = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
  xl: 'w-24 h-24'
};

export const KahaLogo: React.FC<KahaLogoProps> = ({ 
  size = 'md', 
  className = '', 
  showText = false 
}) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`${sizeMap[size]} flex-shrink-0`}>
        <svg viewBox="0 0 200 200" className="w-full h-full">
          {/* Green location pin background */}
          <path 
            d="M100 20C70 20 45 45 45 75C45 105 100 180 100 180S155 105 155 75C155 45 130 20 100 20Z" 
            fill="#4CAF50"
          />
          
          {/* Blue circle */}
          <circle 
            cx="100" 
            cy="75" 
            r="35" 
            fill="#2196F3" 
            stroke="white" 
            strokeWidth="3"
          />
          
          {/* White inner circle */}
          <circle 
            cx="100" 
            cy="75" 
            r="28" 
            fill="white"
          />
          
          {/* Kaha text in Devanagari */}
          <text 
            x="100" 
            y="85" 
            textAnchor="middle" 
            fontFamily="serif" 
            fontSize="24" 
            fontWeight="bold" 
            fill="black"
          >
            कहाँ
          </text>
          
          {/* Small decorative elements */}
          <circle cx="110" cy="60" r="2" fill="black"/>
          <circle cx="115" cy="58" r="1.5" fill="black"/>
          
          {/* Bottom dot of location pin */}
          <circle cx="100" cy="185" r="8" fill="#4CAF50"/>
        </svg>
      </div>
      
      {showText && (
        <div className="flex flex-col">
          <span className="font-bold text-lg text-gray-800">Kaha</span>
          <span className="text-sm text-gray-600">Hostel Control Center</span>
        </div>
      )}
    </div>
  );
};