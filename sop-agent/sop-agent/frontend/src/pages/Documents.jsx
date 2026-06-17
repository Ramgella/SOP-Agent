import { useEffect, useState } from 'react';
import { Plus, FileText } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import DocumentCard from '../components/DocumentCard';
import UploadModal from '../components/UploadModal';
import ConfirmDialog from '../components/ConfirmDialog';
import Loader from '../components/Loader';
import api from '../api/axios';

export default function Documents() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  async function fetchDocuments() {
    try {
      const { data } = await api.get('/documents');
      setDocuments(data.documents);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDocuments();
  }, []);

  function handleUploaded(document) {
    setDocuments((prev) => [document, ...prev]);
  }

  async function handleConfirmDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await api.delete(`/documents/${pendingDelete._id}`);
      setDocuments((prev) => prev.filter((d) => d._id !== pendingDelete._id));
      setPendingDelete(null);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex h-screen bg-base">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar
          title="Documents"
          subtitle={`${documents.length} SOP ${documents.length === 1 ? 'file' : 'files'} uploaded`}
          onMenuClick={() => setSidebarOpen(true)}
          actions={
            <button
              onClick={() => setUploadOpen(true)}
              className="flex items-center gap-2 rounded-lg bg-accent-500 px-3.5 py-2 text-sm font-medium text-white shadow-glow transition-colors duration-150 hover:bg-accent-600"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">Upload PDF</span>
            </button>
          }
        />

        <main className="flex-1 overflow-y-auto px-5 py-6 sm:px-8">
          {loading ? (
            <Loader label="Loading your documents..." />
          ) : documents.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 py-20 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-500/10 text-accent-400">
                <FileText size={28} />
              </div>
              <p className="font-display text-base font-medium text-ink">No documents yet</p>
              <p className="max-w-xs text-sm text-ink-muted">
                Upload your first SOP PDF to start asking questions about it.
              </p>
              <button
                onClick={() => setUploadOpen(true)}
                className="mt-2 flex items-center gap-2 rounded-lg bg-accent-500 px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-accent-600"
              >
                <Plus size={16} />
                Upload PDF
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {documents.map((document) => (
                <DocumentCard
                  key={document._id}
                  document={document}
                  onDelete={(doc) => setPendingDelete(doc)}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      <UploadModal open={uploadOpen} onClose={() => setUploadOpen(false)} onUploaded={handleUploaded} />

      <ConfirmDialog
        open={!!pendingDelete}
        title="Delete this document?"
        description={`"${pendingDelete?.originalName}" and all of its indexed content will be permanently removed.`}
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
