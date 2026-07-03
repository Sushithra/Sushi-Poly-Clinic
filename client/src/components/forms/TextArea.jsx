// Text area placeholder.
// Future responsibility: provide accessible long-form input for notes, support requests, and medical text entry.

export default function TextArea({ label = "Notes", placeholder = "Enter details" }) {
  return (
    <label className="form-field">
      <span>{label}</span>
      <textarea className="ui-textarea" rows="4" placeholder={placeholder} />
    </label>
  );
}
