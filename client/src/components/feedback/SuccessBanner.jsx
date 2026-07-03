// Success banner placeholder.
// Future responsibility: display calm success confirmations with accessible contrast and touch-friendly dismissal later.

export default function SuccessBanner({ message = "Action completed successfully." }) {
  return <div className="feedback-banner">{message}</div>;
}
