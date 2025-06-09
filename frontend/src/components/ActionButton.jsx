import React from 'react';

const ActionButton = ({ 
  onClick, 
  type = 'button', 
  children, 
  disabled = false,
  style = {},
  variant = 'primary',
  ...props 
}) => {
  const baseStyles = {
    padding: '0px 16px',
    border: 'none',
    borderRadius: '4px',
    height: '30px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontSize: '0.9rem',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    outline: 'none',
    ...style
  };

  const variantStyles = {
    primary: {
      backgroundColor: '#007bff',
      color: 'white',
      '&:hover': !disabled ? {
        backgroundColor: '#0056b3'
      } : {}
    },
    danger: {
      backgroundColor: '#dc3545',
      color: 'white',
      '&:hover': !disabled ? {
        backgroundColor: '#c82333'
      } : {}
    },
    secondary: {
      backgroundColor: '#6c757d',
      color: 'white',
      '&:hover': !disabled ? {
        backgroundColor: '#545b62'
      } : {}
    }
  };

  const buttonStyles = {
    ...baseStyles,
    ...variantStyles[variant],
    opacity: disabled ? 0.6 : 1
  };

  const handleMouseEnter = (e) => {
    if (!disabled && variantStyles[variant]['&:hover']) {
      Object.assign(e.target.style, variantStyles[variant]['&:hover']);
    }
  };

  const handleMouseLeave = (e) => {
    if (!disabled) {
      e.target.style.backgroundColor = variantStyles[variant].backgroundColor;
    }
  };

  return (
    <button
      type={type}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      style={buttonStyles}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {children}
    </button>
  );
};

export default ActionButton; 