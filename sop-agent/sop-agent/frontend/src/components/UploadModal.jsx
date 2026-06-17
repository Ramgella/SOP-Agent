import { useRef, useState } from 'react';
import { UploadCloud, FileText, X, Loader2 } from 'lucide-react';
import api from '../api/axios';

export default function UploadModal({ open, onClose, onUploaded }) {
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  if (!open) return null;

  function pickFile(selected) {
    if (!selected) return;
    if (selected.type !== 'application/pdf') {
      setError('Only PDF files are supported');
      return;
    }
    setError('');
    setFile(selected);
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    pickFile(e.dataTransfer.files?.[0]);
  }

  function handleClose() {
    if (uploading) return;
    setFile(null);
    setError('');
    onClose();
  }

  async function handleUpload() {
    if (!file) return;
    setUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const { data } = await api.post('/documents/upload', formData);
      onUploaded?.(data.document);
      setFile(null);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md animate-slideUp rounded-2xl border border-border bg-surface-elevated p-6 shadow-card">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-base font-semibold text-ink">Upload SOP PDF</h2>
          <button
            onClick={handleClose}
            className="rounded-md p-1 text-ink-muted hover:bg-surface-hover hover:text-ink"
          >
            <X size={18} />
          </button>
        </div>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors duration-150 ${
            dragOver ? 'border-accent-500 bg-accent-500/5' : 'border-border hover:border-accent-500/40'
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => pickFile(e.target.files?.[0])}
          />

          {file ? (
            <>
              <FileText size={28} className="text-accent-400" />
              <p className="max-w-[260px] truncate text-sm font-medium text-ink">{file.name}</p>
              <p className="text-xs text-ink-faint">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </>
          ) : (
            <>
              <UploadCloud size={28} className="text-ink-muted" />
              <p className="text-sm text-ink-muted">Drag and drop a PDF, or click to browse</p>
              <p className="text-xs text-ink-faint">Max file size 20MB</p>
            </>
          )}
        </div>

        {error && <p className="mt-3 text-sm text-danger">{error}</p>}

        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={handleClose}
            disabled={uploading}
            className="rounded-lg px-4 py-2 text-sm font-medium text-ink-muted transition-colors duration-150 hover:bg-surface-hover hover:text-ink disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="flex items-center gap-2 rounded-lg bg-accent-500 px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-accent-600 disabled:cursor-not-allowed disabled:bg-surface-hover disabled:text-ink-faint"
          >
            {uploading && <Loader2 size={16} className="animate-spin" />}
            {uploading ? 'Processing...' : 'Upload'}
          </button>
        </div>
      </div>
    </div>
  );
}
