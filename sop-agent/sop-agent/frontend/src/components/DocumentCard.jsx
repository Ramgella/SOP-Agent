import { FileText, Trash2, Clock, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

const statusConfig = {
  ready: { label: 'Ready', icon: CheckCircle2, classes: 'bg-success/10 text-success' },
  processing: { label: 'Processing', icon: Loader2, classes: 'bg-warning/10 text-warning' },
  failed: { label: 'Failed', icon: XCircle, classes: 'bg-danger/10 text-danger' },
};

function formatSize(bytes) {
  if (!bytes) return '—';
  const mb = bytes / 1024 / 1024;
  return mb >= 1 ? `${mb.toFixed(2)} MB` : `${(bytes / 1024).toFixed(0)} KB`;
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function DocumentCard({ document, onDelete }) {
  const status = statusConfig[document.status] || statusConfig.processing;
  const StatusIcon = status.icon;

  return (
    <div className="group flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-accent-500/30">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-500/10 text-accent-400">
            <FileText size={20} />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-ink" title={document.originalName}>
              {document.originalName}
            </p>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-ink-faint">
              <Clock size={12} />
              {formatDate(document.createdAt)}
            </div>
          </div>
        </div>

        <button
          onClick={() => onDelete(document)}
          title="Delete document"
          className="shrink-0 rounded-lg p-2 text-ink-faint opacity-0 transition-colors duration-150 hover:bg-danger/10 hover:text-danger group-hover:opacity-100"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <div className="flex items-center justify-between">
        <span
          className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${status.classes}`}
        >
          <StatusIcon size={12} className={document.status === 'processing' ? 'animate-spin' : ''} />
          {status.label}
        </span>

        <div className="flex gap-3 text-xs text-ink-faint">
          <span>{document.totalPages || 0} pages</span>
          <span>{formatSize(document.fileSize)}</span>
        </div>
      </div>

      {document.status === 'failed' && document.errorMessage && (
        <p className="rounded-lg bg-danger/5 px-3 py-2 text-xs text-danger/90">{document.errorMessage}</p>
      )}
    </div>
  );
}
