// Secondary button placeholder.
// Future responsibility: support lower-emphasis actions while keeping touch-friendly sizing.

export default function SecondaryButton({ children = "Secondary Action", type = "button" }) {
  return (
    <button type={type} className="btn btn-secondary">
      {children}
    </button>
  );
}
