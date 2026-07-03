// Search bar placeholder.
// Future responsibility: provide lightweight mobile-first search with touch-friendly clear and submit affordances.

export default function SearchBar({ placeholder = "Search..." }) {
  return <input className="ui-input search-bar" placeholder={placeholder} type="search" />;
}
