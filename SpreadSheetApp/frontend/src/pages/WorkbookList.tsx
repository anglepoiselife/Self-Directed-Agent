import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchWorkbooks, createWorkbook, renameWorkbook, deleteWorkbook } from '../services/workbookService';
import { WorkbookDTO } from '../types';

export default function WorkbookList() {
  const [workbooks, setWorkbooks] = useState<WorkbookDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const navigate = useNavigate();

  const loadWorkbooks = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchWorkbooks();
      setWorkbooks(data);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to load workbooks');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWorkbooks();
  }, [loadWorkbooks]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    let name = inputRef.current?.value?.trim() || '';
    if (!name) name = 'New Workbook';
    try {
      setCreating(true);
      await createWorkbook(name);
      if (inputRef.current) inputRef.current.value = '';
      await loadWorkbooks();
    } catch (err: any) {
      setError(err.message || 'Failed to create workbook');
    } finally {
      setCreating(false);
    }
  };

  const startRename = (wb: WorkbookDTO) => {
    setRenamingId(wb.id);
    setRenameValue(wb.name);
  };

  const handleRename = async (id: string) => {
    const name = renameValue.trim();
    if (!name) return;
    try {
      await renameWorkbook(id, name);
      setRenamingId(null);
      setRenameValue('');
      await loadWorkbooks();
    } catch (err: any) {
      setError(err.message || 'Failed to rename workbook');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteWorkbook(id);
      setDeletingId(null);
      await loadWorkbooks();
    } catch (err: any) {
      setError(err.message || 'Failed to delete workbook');
    }
  };

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return '';
    }
  };

  return (
    <div className="workbook-list" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: 600 }}>My Workbooks</h1>

      {error && (
        <div style={{ background: '#fee', border: '1px solid #c00', padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem', color: '#c00' }}>
          {error}
        </div>
      )}

      {/* Create section */}
      <form onSubmit={handleCreate} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <input
          type="text"
          ref={inputRef}
          placeholder="New workbook name"
          style={{ flex: 1, padding: '0.5rem 0.75rem', border: '1px solid #ccc', borderRadius: '6px', fontSize: '0.9rem' }}
        />
        <button
          type="submit"
          onClick={(e) => handleCreate(e as any)}
          disabled={creating}
          style={{ padding: '0.5rem 1rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.9rem' }}
        >
          {creating ? 'Creating...' : 'Create'}
        </button>
      </form>

      {/* Workbook list */}
      {loading ? (
        <p style={{ color: '#666' }}>Loading workbooks...</p>
      ) : workbooks.length === 0 ? (
        <p style={{ color: '#666', fontStyle: 'italic' }}>No workbooks yet. Create one above to get started.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {workbooks.map((wb) => (
            <li
              key={wb.id}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', border: '1px solid #e5e7eb', borderRadius: '6px', marginBottom: '0.5rem', background: '#fff' }}
            >
              {/* Name / rename */}
              {renamingId === wb.id ? (
                <div style={{ display: 'flex', gap: '0.5rem', flex: 1 }}>
                  <input
                    type="text"
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleRename(wb.id); }}
                    style={{ flex: 1, padding: '0.4rem 0.6rem', border: '1px solid #2563eb', borderRadius: '4px', fontSize: '0.9rem' }}
                  />
                  <button
                    type="button"
                    onClick={() => handleRename(wb.id)}
                    style={{ padding: '0.4rem 0.75rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => { setRenamingId(null); setRenameValue(''); }}
                    style={{ padding: '0.4rem 0.75rem', background: '#f3f4f6', color: '#333', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <a
                  href={`/app/workbook/${wb.id}`}
                  style={{ flex: 1, color: '#2563eb', textDecoration: 'none', fontSize: '0.95rem', fontWeight: 500 }}
                >
                  {wb.name}
                </a>
              )}

              {/* Date */}
              <span style={{ color: '#888', fontSize: '0.8rem', marginRight: '1rem', whiteSpace: 'nowrap' }}>
                {formatDate(wb.createdAt)}
              </span>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => startRename(wb)}
                  style={{ padding: '0.3rem 0.6rem', background: '#f3f4f6', color: '#333', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}
                >
                  Rename
                </button>
                {deletingId === wb.id ? (
                  <button
                    type="button"
                    onClick={() => handleDelete(wb.id)}
                    style={{ padding: '0.3rem 0.6rem', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}
                  >
                    Confirm
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setDeletingId(wb.id)}
                    style={{ padding: '0.3rem 0.6rem', background: '#fef2f2', color: '#dc2626', border: '1px solid #dc2626', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}
                  >
                    Delete
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}