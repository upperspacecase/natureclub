export default function TravelTimeLabel({ walkMin, driveMin, loading }) {
  if (!loading && walkMin == null && driveMin == null) return null;

  const opacity = loading ? "text-white/30" : "text-white/60";

  function formatTime(min) {
    if (min == null) return "--";
    if (min < 1) return "<1 min";
    if (min >= 60) {
      const h = Math.floor(min / 60);
      const m = min % 60;
      return m > 0 ? `${h}h ${m}m` : `${h}h`;
    }
    return `${min} min`;
  }

  return (
    <span className={`mt-1.5 inline-flex items-center gap-1.5 text-sm ${opacity}`}>
      {/* Walking icon */}
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="shrink-0">
        <circle cx="12" cy="4.5" r="2" fill="currentColor" />
        <path
          d="M13.5 8.5h-3L9 12l3 3-1.5 5.5M14.5 12l1.5 3.5v5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span>{formatTime(walkMin)}</span>
      <span className="text-white/30">·</span>
      {/* Car icon */}
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="shrink-0">
        <path
          d="M5 17h14v-5l-2-5H7L5 12v5zM7.5 17v1.5a1 1 0 01-1 1h-1a1 1 0 01-1-1V17M19.5 17v1.5a1 1 0 01-1 1h-1a1 1 0 01-1-1V17"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="7.5" cy="14.5" r="1" fill="currentColor" />
        <circle cx="16.5" cy="14.5" r="1" fill="currentColor" />
      </svg>
      <span>{formatTime(driveMin)}</span>
    </span>
  );
}
