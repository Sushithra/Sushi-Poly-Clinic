// Password field placeholder.
// Future responsibility: provide secure entry affordances with touch-friendly visibility toggles later.

export default function PasswordField({ label = "Password" }) {
  return (
    <label className="form-field">
      <span>{label}</span>
      <input className="ui-input" type="password" placeholder="Enter password" />
    </label>
  );
}
