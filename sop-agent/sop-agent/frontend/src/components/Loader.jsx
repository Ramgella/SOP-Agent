export default function Loader({ label = 'Loading...', size = 24 }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-ink-muted">
      <div
        style={{ width: size, height: size }}
        className="animate-spin rounded-full border-2 border-accent-500 border-t-transparent"
      />
      <p className="text-sm">{label}</p>
    </div>
  );
}
