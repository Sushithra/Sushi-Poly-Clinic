// Icon button placeholder.
// Future responsibility: support compact actions while preserving accessible tap areas.

export default function IconButton({ label = "Icon action" }) {
  return (
    <button type="button" className="icon-button" aria-label={label}>
      <span aria-hidden="true">+</span>
    </button>
  );
}
