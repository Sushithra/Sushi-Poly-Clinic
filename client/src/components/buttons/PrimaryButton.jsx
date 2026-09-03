// Primary button placeholder.
// Future responsibility: support major healthcare actions with large touch targets and clear emphasis.

export default function PrimaryButton({ children = "Primary Action", type = "button", onClick, disabled, ...rest }) {
  return (
    <button type={type} className="btn btn-primary" onClick={onClick} disabled={disabled} {...rest}>
      {children}
    </button>
  );
}
