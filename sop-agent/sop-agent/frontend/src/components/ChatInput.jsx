import { useRef } from 'react';
import { Paperclip, SendHorizontal } from 'lucide-react';

export default function ChatInput({ value, onChange, onSend, onUploadClick, disabled }) {
  const textareaRef = useRef(null);

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !disabled) onSend();
    }
  }

  function handleChange(e) {
    onChange(e.target.value);
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
    }
  }

  return (
    <div className="border-t border-border bg-surface/80 px-4 py-3 backdrop-blur-sm sm:px-6">
      <div className="mx-auto flex max-w-3xl items-end gap-2 rounded-2xl border border-border bg-surface-elevated px-3 py-2 shadow-card transition-colors duration-150 focus-within:border-accent-500/50">
        <button
          type="button"
          onClick={onUploadClick}
          title="Upload SOP PDF"
          className="shrink-0 rounded-lg p-2 text-ink-muted transition-colors duration-150 hover:bg-surface-hover hover:text-accent-400"
        >
          <Paperclip size={18} />
        </button>

        <textarea
          ref={textareaRef}
          rows={1}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question about your SOP documents..."
          disabled={disabled}
          className="max-h-40 flex-1 resize-none bg-transparent py-2 text-sm text-ink placeholder:text-ink-faint focus:outline-none disabled:opacity-60"
        />

        <button
          type="button"
          onClick={onSend}
          disabled={disabled || !value.trim()}
          className="shrink-0 rounded-lg bg-accent-500 p-2 text-white transition-all duration-150 hover:bg-accent-600 disabled:cursor-not-allowed disabled:bg-surface-hover disabled:text-ink-faint"
        >
          <SendHorizontal size={18} />
        </button>
      </div>
      <p className="mx-auto mt-2 max-w-3xl text-center text-xs text-ink-faint">
        Answers are generated only from your uploaded SOP documents.
      </p>
    </div>
  );
}
