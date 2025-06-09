export default function StyledInput({ style = {}, height = '40px', ...props }) {
  return (
    <input
      style={{
        width: '100%',
        height: '30px',
        borderWidth: 0.1,
        borderRadius: 4,
        marginBottom: 8,
        padding: '8px 12px',
        fontSize: '0.9rem',
        outline: 'none',
        boxSizing: 'border-box',
        ...style
      }}
      {...props}
    />
  );
}