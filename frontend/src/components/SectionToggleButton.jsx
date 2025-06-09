export default function SectionToggleButton({ 
  label, 
  toggled, 
  onClick, 
  iconOn, 
  iconOff, 
  style = {}, 
  colorScheme = 'default',
  ...props 
}) {
  // Define color schemes
  const colorSchemes = {
    default: {
      active: {
        backgroundColor: '#e3f2fd',
        color: '#1565c0',
        borderColor: '#1976d2',
        iconColor: '#1565c0'
      },
      inactive: {
        backgroundColor: 'transparent',
        borderColor: '#dee2e6',
      },
      hover: {
        active: '#bbdefb',
        inactive: '#f8f9fa'
      }
    },
  };

  const scheme = colorSchemes[colorScheme] || colorSchemes.default;
  const currentState = toggled ? scheme.active : scheme.inactive;

  const buttonStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    marginRight: 12,
    border: toggled 
      ? `2px solid ${currentState.borderColor}` 
      : `1px dashed ${currentState.borderColor}`,
    borderRadius: '20px', // More rounded for toggle appearance
    backgroundColor: currentState.backgroundColor,
    color: currentState.color,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontSize: '1.1rem',
    fontWeight: toggled ? '500' : '400',
    outline: 'none',
    minHeight: '32px',
    position: 'relative',
    ...style
  };

  const iconStyle = {
    color: currentState.iconColor,
    transition: 'all 0.3s ease',
    fontSize: '0.9rem'
  };

  const handleMouseEnter = (e) => {
    const hoverColor = toggled ? scheme.hover.active : scheme.hover.inactive;
    e.target.style.backgroundColor = hoverColor;
    if (!toggled) {
      e.target.style.borderStyle = 'solid';
    }
  };

  const handleMouseLeave = (e) => {
    e.target.style.backgroundColor = currentState.backgroundColor;
    if (!toggled) {
      e.target.style.borderStyle = 'dashed';
    }
  };

  return (
    <button
      onClick={onClick}
      style={buttonStyle}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      title={toggled ? `Hide ${label}` : `Show ${label}`}
      {...props}
    >
      <span style={iconStyle}>
        {toggled ? iconOff : iconOn}
      </span>
      {label}
      {/* Add a small visual indicator for toggle state */}
      <span style={{
        width: '6px',
        height: '6px',
        borderRadius: '50%',
        backgroundColor: toggled ? currentState.color : 'transparent',
        marginLeft: '4px',
        transition: 'all 0.3s ease'
      }} />
    </button>
  );
}