import { Sparkles } from 'lucide-react';
import SourceCitation from './SourceCitation';

function AssistantAvatar() {
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent-400 to-accent-700 shadow-glow">
      <Sparkles size={14} className="text-white" />
    </div>
  );
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-1 py-1.5">
      <span className="h-1.5 w-1.5 animate-pulseGlow rounded-full bg-accent-400 [animation-delay:0ms]" />
      <span className="h-1.5 w-1.5 animate-pulseGlow rounded-full bg-accent-400 [animation-delay:200ms]" />
      <span className="h-1.5 w-1.5 animate-pulseGlow rounded-full bg-accent-400 [animation-delay:400ms]" />
    </div>
  );
}

export default function ChatMessage({ role, content, sources = [], isPending = false }) {
  const isUser = role === 'user';

  return (
    <div className={`flex w-full animate-fadeIn gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && <AssistantAvatar />}

      <div className={`flex max-w-[80%] flex-col gap-2 sm:max-w-[70%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-card ${
            isUser
              ? 'rounded-br-sm bg-gradient-to-br from-accent-500 to-accent-700 text-white'
              : 'rounded-bl-sm border border-border bg-surface-elevated text-ink'
          }`}
        >
          {isPending ? <TypingDots /> : <p className="whitespace-pre-wrap">{content}</p>}
        </div>

        {!isPending && sources.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {sources.map((source, i) => (
              <SourceCitation key={`${source.documentId}-${source.pageNumber}-${i}`} source={source} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
