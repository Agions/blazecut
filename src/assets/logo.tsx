import React from 'react';

interface LogoProps {
  width?: number;
  height?: number;
  color?: string;
  secondaryColor?: string;
}

const Logo: React.FC<LogoProps> = ({ 
  width = 36, 
  height = 36, 
  color = '#ff4d4f', 
  secondaryColor = '#1890ff' 
}) => {
  return (
    <svg 
      width={width} 
      height={height} 
      viewBox="0 0 64 64" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 底部剪刀形状 */}
      <path 
        d="M24 40C24 43.3137 21.3137 46 18 46C14.6863 46 12 43.3137 12 40C12 36.6863 14.6863 34 18 34C21.3137 34 24 36.6863 24 40Z" 
        fill={secondaryColor} 
      />
      <path 
        d="M52 40C52 43.3137 49.3137 46 46 46C42.6863 46 40 43.3137 40 40C40 36.6863 42.6863 34 46 34C49.3137 34 52 36.6863 52 40Z" 
        fill={secondaryColor} 
      />
      <path 
        d="M46 38L24 26M24 38L46 26" 
        stroke={secondaryColor} 
        strokeWidth="4" 
        strokeLinecap="round" 
      />
      
      {/* 上部视频胶片框 */}
      <rect 
        x="14" 
        y="10" 
        width="36" 
        height="24" 
        rx="3" 
        stroke={secondaryColor} 
        strokeWidth="3" 
        fill="transparent" 
      />
      
      {/* 胶片孔 */}
      <circle cx="19" cy="15" r="2" fill={secondaryColor} />
      <circle cx="19" cy="29" r="2" fill={secondaryColor} />
      <circle cx="45" cy="15" r="2" fill={secondaryColor} />
      <circle cx="45" cy="29" r="2" fill={secondaryColor} />
      
      {/* 火焰效果 */}
      <path 
        d="M32 8C32 8 36 14 36 18C36 20.2091 34.2091 22 32 22C29.7909 22 28 20.2091 28 18C28 14 32 8 32 8Z" 
        fill={color} 
      />
      <path 
        d="M38 12C38 12 40 16 40 18C40 19.1046 39.1046 20 38 20C36.8954 20 36 19.1046 36 18C36 16 38 12 38 12Z" 
        fill={color} 
      />
      <path 
        d="M26 12C26 12 24 16 24 18C24 19.1046 24.8954 20 26 20C27.1046 20 28 19.1046 28 18C28 16 26 12 26 12Z" 
        fill={color} 
      />
    </svg>
  );
};

export default Logo; 