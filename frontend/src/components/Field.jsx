// label + input wrapper with the error message underneath
export default function Field({ label, error, hint, children }) {
  return (
    <label className={`field ${error ? 'field-bad' : ''}`}>
      <span className="field-label">{label}</span>
      {children}
      {hint && !error && <span className="field-hint">{hint}</span>}
      {error && <span className="field-error">{error}</span>}
    </label>
  );
}
