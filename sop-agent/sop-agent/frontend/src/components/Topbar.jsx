import { Menu } from 'lucide-react';

export default function Topbar({ title, subtitle, onMenuClick, actions }) {
  return (
    <header className="flex items-center justify-between gap-4 border-b border-border bg-surface/60 px-5 py-4 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="rounded-md p-1.5 text-ink-muted hover:bg-surface-hover hover:text-ink lg:hidden"
        >
          <Menu size={20} />
        </button>
        <div>
          <h1 className="font-display text-base font-semibold text-ink sm:text-lg">{title}</h1>
          {subtitle && <p className="text-xs text-ink-muted sm:text-sm">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </header>
  );
}
