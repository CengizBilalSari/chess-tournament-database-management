export default function StyledDropdown({ value, onChange, children, style = {}, ...props }) {
  return (
    <select
      value={value}
      onChange={onChange}
      style={{
        padding: '0 12px',
        borderWidth: 0.1,
        borderRadius: 4,
        fontSize: '0.9rem',
        marginBottom: 8,
        outline: 'none',
        minWidth: 120,
        height: '30px',
        ...style
      }}
      {...props}
    >
      {children}
    </select>
  );
}