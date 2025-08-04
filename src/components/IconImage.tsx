import React from 'react';

interface IconImageProps {
  name: string;
  size?: number;
  color?: string;
  className?: string;
}

export const IconImage: React.FC<IconImageProps> = ({ 
  name, 
  size = 24, 
  color = "#000000",
  className = ""
}) => {
  const getIcon = (iconName: string) => {
    switch (iconName.toLowerCase()) {
      case 'gallery':
        return (
          <svg 
            width={size} 
            height={size} 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className={className}
          >
            <path 
              d="M3 3H21V21H3V3ZM5 5V19H19V5H5ZM7 7H17V9H7V7ZM7 11H17V13H7V11ZM7 15H17V17H7V15Z" 
              fill={color}
            />
          </svg>
        );
      case 'camera':
        return (
          <svg 
            width={size} 
            height={size} 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className={className}
          >
            <path 
              d="M12 15.2C13.7673 15.2 15.2 13.7673 15.2 12C15.2 10.2327 13.7673 8.8 12 8.8C10.2327 8.8 8.8 10.2327 8.8 12C8.8 13.7673 10.2327 15.2 12 15.2ZM12 7C14.7614 7 17 9.23858 17 12C17 14.7614 14.7614 17 12 17C9.23858 17 7 14.7614 7 12C7 9.23858 9.23858 12 12 7ZM20 5H17L15.8 3H8.2L7 5H4C2.9 5 2 5.9 2 7V19C2 20.1 2.9 21 4 21H20C21.1 21 22 20.1 22 19V7C22 5.9 21.1 5 20 5Z" 
              fill={color}
            />
          </svg>
        );
      case 'construction':
        return (
          <svg 
            width={size} 
            height={size} 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className={className}
          >
            <path 
              d="M22.7 19L13.6 9.9L14.4 9.1L15.8 10.5L17.2 9.1L15.8 7.7L17.2 6.3L18.6 7.7L20 6.3L18.6 4.9L20 3.5L18.6 2.1L17.2 3.5L15.8 2.1L14.4 3.5L15.8 4.9L14.4 6.3L13 4.9L11.6 6.3L13 7.7L11.6 9.1L13 10.5L14.4 9.1L13.6 9.9L22.7 19ZM13.6 9.9L4.5 19L3.1 17.6L12.2 8.5L13.6 9.9Z" 
              fill={color}
            />
          </svg>
        );
      default:
        return (
          <svg 
            width={size} 
            height={size} 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className={className}
          >
            <path 
              d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" 
              fill={color}
            />
          </svg>
        );
    }
  };

  return getIcon(name);
}; 