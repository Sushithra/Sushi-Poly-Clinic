// Tabs placeholder.
// Future responsibility: provide responsive tabs that can stack or scroll horizontally on narrow screens.

export default function Tabs() {
  return (
    <div className="tab-strip" role="tablist" aria-label="Tabs placeholder">
      <button className="tab-chip" type="button">
        Overview
      </button>
      <button className="tab-chip" type="button">
        Details
      </button>
    </div>
  );
}
