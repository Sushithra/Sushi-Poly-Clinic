// Primary button placeholder.
// Future responsibility: support major healthcare actions with large touch targets and clear emphasis.

export default function PrimaryButton({ children = "Primary Action", type = "button" }) {
  return (
    <button type={type} className="btn btn-primary">
      {children}
    </button>
  );
}
