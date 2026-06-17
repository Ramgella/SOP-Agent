import { useEffect, useRef, useState } from 'react';
import { Plus, Sparkles } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import ChatMessage from '../components/ChatMessage';
import ChatInput from '../components/ChatInput';
import UploadModal from '../components/UploadModal';
import api from '../api/axios';

const SUGGESTIONS = [
  'What is the step-by-step process described in this SOP?',
  'What approvals are required before starting this procedure?',
  'What safety precautions should be followed?',
];

export default function Chat() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [hasDocuments, setHasDocuments] = useState(true);
  const [checkingDocs, setCheckingDocs] = useState(true);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);

  const bottomRef = useRef(null);

  useEffect(() => {
    api
      .get('/documents')
      .then(({ data }) => setHasDocuments(data.documents.some((d) => d.status === 'ready')))
      .finally(() => setCheckingDocs(false));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function sendMessage(text) {
    const question = text ?? input;
    if (!question.trim() || sending) return;

    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: question }, { role: 'assistant', pending: true }]);
    setSending(true);

    try {
      const { data } = await api.post('/chat/ask', { question });
      setMessages((prev) => {
        const next = [...prev];
        next[next.length - 1] = { role: 'assistant', content: data.answer, sources: data.sources };
        return next;
      });
    } catch (err) {
      setMessages((prev) => {
        const next = [...prev];
        next[next.length - 1] = {
          role: 'assistant',
          content: err.response?.data?.message || 'Something went wrong while getting an answer. Please try again.',
          sources: [],
        };
        return next;
      });
    } finally {
      setSending(false);
    }
  }

  function handleUploaded() {
    setHasDocuments(true);
  }

  return (
    <div className="flex h-screen bg-base">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar
          title="Chat"
          subtitle="Ask anything about your uploaded SOPs"
          onMenuClick={() => setSidebarOpen(true)}
          actions={
            <button
              onClick={() => setUploadOpen(true)}
              className="flex items-center gap-2 rounded-lg border border-border bg-surface-elevated px-3.5 py-2 text-sm font-medium text-ink transition-colors duration-150 hover:border-accent-500/40 hover:text-accent-200"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">Upload PDF</span>
            </button>
          }
        />

        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
          <div className="mx-auto flex max-w-3xl flex-col gap-5">
            {messages.length === 0 && (
              <div className="flex flex-col items-center gap-4 py-16 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-400 to-accent-700 shadow-glow">
                  <Sparkles size={24} className="text-white" />
                </div>

                {checkingDocs ? null : hasDocuments ? (
                  <>
                    <p className="font-display text-lg font-semibold text-ink">Ask about your SOPs</p>
                    <p className="max-w-sm text-sm text-ink-muted">
                      Answers are grounded only in the documents you&apos;ve uploaded, with page citations.
                    </p>
                    <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                      {SUGGESTIONS.map((s) => (
                        <button
                          key={s}
                          onClick={() => sendMessage(s)}
                          disabled={sending}
                          className="rounded-full border border-border bg-surface-elevated px-3.5 py-2 text-xs text-ink-muted transition-colors duration-150 hover:border-accent-500/40 hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    <p className="font-display text-lg font-semibold text-ink">Upload an SOP to get started</p>
                    <p className="max-w-sm text-sm text-ink-muted">
                      You don&apos;t have any processed documents yet. Upload a PDF and ask away.
                    </p>
                    <button
                      onClick={() => setUploadOpen(true)}
                      className="mt-2 flex items-center gap-2 rounded-lg bg-accent-500 px-4 py-2 text-sm font-medium text-white shadow-glow transition-colors duration-150 hover:bg-accent-600"
                    >
                      <Plus size={16} />
                      Upload PDF
                    </button>
                  </>
                )}
              </div>
            )}

            {messages.map((m, i) => (
              <ChatMessage
                key={i}
                role={m.role}
                content={m.content}
                sources={m.sources}
                isPending={m.pending}
              />
            ))}
            <div ref={bottomRef} />
          </div>
        </main>

        <ChatInput
          value={input}
          onChange={setInput}
          onSend={() => sendMessage()}
          onUploadClick={() => setUploadOpen(true)}
          disabled={sending}
        />
      </div>

      <UploadModal open={uploadOpen} onClose={() => setUploadOpen(false)} onUploaded={handleUploaded} />
    </div>
  );
}
