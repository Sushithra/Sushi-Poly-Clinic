// Dropdown placeholder.
// Future responsibility: provide touch-friendly select fields for categories, roles, and preferences.

export default function Dropdown({ label = "Select option" }) {
  return (
    <label className="form-field">
      <span>{label}</span>
      <select className="ui-select" defaultValue="">
        <option value="" disabled>
          Choose an option
        </option>
      </select>
    </label>
  );
}
