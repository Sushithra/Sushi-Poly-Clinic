// Input field placeholder.
// Future responsibility: provide a consistent mobile-first text input shell with readable labels and spacing.

export default function InputField({ label = "Input label", placeholder = "Enter value" }) {
  return (
    <label className="form-field">
      <span>{label}</span>
      <input className="ui-input" placeholder={placeholder} />
    </label>
  );
}
