import { FileText } from 'lucide-react';

export default function SourceCitation({ source }) {
  return (
    <div className="flex items-center gap-1.5 rounded-full border border-border bg-surface-elevated px-3 py-1 text-xs text-ink-muted transition-colors duration-150 hover:border-accent-500/40 hover:text-ink">
      <FileText size={12} className="text-accent-400" />
      <span className="max-w-[160px] truncate">{source.documentName}</span>
      <span className="text-ink-faint">&middot;</span>
      <span>Page {source.pageNumber}</span>
    </div>
  );
}
