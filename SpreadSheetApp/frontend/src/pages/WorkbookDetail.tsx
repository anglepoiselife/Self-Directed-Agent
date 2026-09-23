import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchSheets, createSheet, renameSheet, deleteSheet } from '../services/sheetService';
import { fetchWorkbooks } from '../services/workbookService';
import { SpreadsheetGrid } from '../components/SpreadsheetGrid';
import { SheetDTO, WorkbookDTO } from '../types';

export const WorkbookDetail: React.FC = () => {
  const { workbookId } = useParams<{ workbookId: string }>();
  const navigate = useNavigate();
  const [workbook, setWorkbook] = useState<WorkbookDTO | null>(null);
  const [sheets, setSheets] = useState<SheetDTO[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<SheetDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [newSheetName, setNewSheetName] = useState('');
  const [renamingSheet, setRenamingSheet] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const newSheetInputRef = useRef<HTMLInputElement>(null);
  const renameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!workbookId) return;
    const load = async () => {
      try {
        const wbList = await fetchWorkbooks();
        const wb = wbList.find((w) => w.id === workbookId);
        if (wb) {
          setWorkbook(wb);
        }
        const sheetList = await fetchSheets(workbookId);
        if (sheetList.length === 0) {
          const created = await createSheet(workbookId, 'Sheet1');
          setSheets([created]);
          setSelectedSheet(created);
        } else {
          setSheets(sheetList);
          setSelectedSheet(sheetList[0]);
        }
      } catch (err) {
        console.error('Failed to load workbook detail:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [workbookId]);

  const handleCreateSheet = useCallback(async () => {
    if (!workbookId || !newSheetName.trim()) return;
    try {
      const created = await createSheet(workbookId, newSheetName.trim());
      setSheets((prev) => [...prev, created]);
      setSelectedSheet(created);
      setNewSheetName('');
    } catch (err) {
      console.error('Failed to create sheet:', err);
    }
  }, [workbookId, newSheetName]);

  const handleRenameSheet = useCallback(async () => {
    if (!renamingSheet || !renameValue.trim()) {
      setRenamingSheet(null);
      return;
    }
    try {
      const updated = await renameSheet(renamingSheet, renameValue.trim());
      setSheets((prev) =>
        prev.map((s) => (s.id === updated.id ? updated : s))
      );
      if (selectedSheet?.id === updated.id) {
        setSelectedSheet(updated);
      }
      setRenamingSheet(null);
      setRenameValue('');
    } catch (err) {
      console.error('Failed to rename sheet:', err);
      setRenamingSheet(null);
    }
  }, [renamingSheet, renameValue, selectedSheet]);

  const handleDeleteSheet = useCallback(
    async (sheetId: string) => {
      if (sheets.length <= 1) return;
      try {
        await deleteSheet(sheetId);
        const remaining = sheets.filter((s) => s.id !== sheetId);
        setSheets(remaining);
        if (selectedSheet?.id === sheetId) {
          setSelectedSheet(remaining[0] || null);
        }
      } catch (err) {
        console.error('Failed to delete sheet:', err);
      }
    },
    [sheets, selectedSheet]
  );

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        Loading...
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          padding: '8px 16px',
          borderBottom: '1px solid #ddd',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          flexShrink: 0,
        }}
      >
        <a
          href="/app"
          style={{
            color: '#1976d2',
            textDecoration: 'none',
            fontSize: '14px',
          }}
        >
          ← Back to Workbooks
        </a>
        <span
          style={{
            fontWeight: 'bold',
            fontSize: '16px',
          }}
        >
          {workbook?.name || 'Workbook'}
        </span>
      </div>

      <div style={{ flex: 1, overflow: 'auto', minHeight: '0' }}>
        {selectedSheet ? (
          <SpreadsheetGrid sheetId={selectedSheet.id} />
        ) : (
          <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
            No sheet selected
          </div>
        )}
      </div>


      <div
        style={{
          borderTop: '1px solid #ddd',
          padding: '4px 8px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          overflowX: 'auto',
          background: '#f5f5f5',
          flexShrink: 0,
          minHeight: '36px',
        }}
      >
        {(sheets || []).map((sheet) => (
          <div
            key={sheet.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '2px',
            }}
          >
            {renamingSheet === sheet.id ? (
              <input
                ref={renameInputRef}
                type="text"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleRenameSheet();
                  } else if (e.key === 'Escape') {
                    setRenamingSheet(null);
                  }
                }}
                style={{
                  width: '100px',
                  border: '1px solid #1976d2',
                  padding: '2px 6px',
                  fontSize: '13px',
                }}
              />
            ) : (
              <button
                onClick={() => setSelectedSheet(sheet)}
                onDoubleClick={() => {
                  setRenamingSheet(sheet.id);
                  setRenameValue(sheet.name);
                }}
                style={{
                  padding: '4px 12px',
                  fontSize: '13px',
                  border: 'none',
                  cursor: 'pointer',
                  background:
                    selectedSheet?.id === sheet.id
                      ? '#fff'
                      : 'transparent',
                  borderBottom:
                    selectedSheet?.id === sheet.id
                      ? '2px solid #1976d2'
                      : '2px solid transparent',
                  color:
                    selectedSheet?.id === sheet.id
                      ? '#1976d2'
                      : '#333',
                }}
              >
                {sheet.name}
              </button>
            )}
            {(sheets || []).length > 1 && (
              <button
                onClick={() => handleDeleteSheet(sheet.id)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  fontSize: '12px',
                  color: '#999',
                  padding: '2px',
                }}
                title="Delete sheet"
              >
                ×
              </button>
            )}
          </div>
        ))}

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            marginLeft: '8px',
          }}
        >
          <input
            ref={newSheetInputRef}
            type="text"
            value={newSheetName}
            onChange={(e) => setNewSheetName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleCreateSheet();
              }
            }}
            placeholder="New sheet"
            style={{
              width: '90px',
              border: '1px solid #ccc',
              padding: '2px 6px',
              fontSize: '13px',
            }}
          />
          <button
            onClick={handleCreateSheet}
            style={{
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              fontSize: '16px',
              color: '#1976d2',
              padding: '2px 6px',
            }}
            title="Add sheet"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
};