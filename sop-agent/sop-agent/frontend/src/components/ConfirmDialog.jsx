import { AlertTriangle, Loader2 } from 'lucide-react';

export default function ConfirmDialog({ open, title, description, confirmLabel = 'Confirm', loading, onConfirm, onCancel }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
      <div className="w-full max-w-sm animate-slideUp rounded-2xl border border-border bg-surface-elevated p-6 shadow-card">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-danger/10 text-danger">
            <AlertTriangle size={18} />
          </div>
          <h2 className="font-display text-base font-semibold text-ink">{title}</h2>
        </div>
        <p className="text-sm text-ink-muted">{description}</p>

        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onCancel}
            disabled={loading}
            className="rounded-lg px-4 py-2 text-sm font-medium text-ink-muted transition-colors duration-150 hover:bg-surface-hover hover:text-ink disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg bg-danger px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-red-500 disabled:opacity-60"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
