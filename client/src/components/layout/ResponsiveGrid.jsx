// Shared responsive grid placeholder.
// Future responsibility: standardize stacked mobile grids that progressively expand
// into tablet and desktop card layouts.

export default function ResponsiveGrid({ children }) {
  return <div className="responsive-grid">{children}</div>;
}
