// Shared page scaffold placeholder.
// Future responsibility: provide consistent page headings, supporting copy,
// action slots, and responsive content structure across modules.

export default function PageScaffold({ eyebrow, title, description, children }) {
  return (
    <section className="page-scaffold">
      <div className="page-header">
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h1>{title}</h1>
        {description ? <p>{description}</p> : null}
      </div>
      {children}
    </section>
  );
}
