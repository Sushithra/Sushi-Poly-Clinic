// Collapsible sidebar placeholder.
// Future responsibility: support tablet and desktop sidebar expansion while collapsing cleanly on smaller screens.
export default function CollapsibleSidebar() {
  return (
    <aside className="collapsible-sidebar">
      <p className="eyebrow">Navigation</p>
      <ul>
        <li>Overview</li>
        <li>Records</li>
        <li>Analytics</li>
      </ul>
    </aside>
  );
}
