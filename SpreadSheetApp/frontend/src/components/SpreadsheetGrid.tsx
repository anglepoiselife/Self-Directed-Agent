import React, { useState, useEffect, useRef, useCallback } from 'react';
import { fetchCells, updateCell } from '../services/cellService';
import { CellDTO } from '../types';

const COLS = 26; // A-Z
const ROWS = 32;

function colToLetter(col: number): string {
  return String.fromCharCode(65 + col);
}

function detectType(value: string): string {
  if (value.startsWith('=')) return 'formula';
  if (value !== '' && !isNaN(Number(value))) return 'number';
  return 'text';
}

interface SpreadsheetGridProps {
  sheetId: string;
}

export const SpreadsheetGrid: React.FC<SpreadsheetGridProps> = ({ sheetId }) => {
  const [cells, setCells] = useState<Record<string, CellDTO>>({});
  const [selectedRow, setSelectedRow] = useState(0);
  const [selectedCol, setSelectedCol] = useState(0);
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const editInputRef = useRef<HTMLInputElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const cellKey = (row: number, col: number) => `${row}-${col}`;

  useEffect(() => {
    fetchCells(sheetId).then((data) => {
      const map: Record<string, CellDTO> = {};
      for (const c of data) {
        map[cellKey(c.row, c.col)] = c;
      }
      setCells(map);
    }).catch(() => {});
  }, [sheetId]);

  useEffect(() => {
    if (editing && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editing]);

  const saveCell = useCallback(async () => {
    if (editValue.trim() === '') {
      setEditing(false);
      return;
    }
    const cellType = detectType(editValue);
    const formula = cellType === 'formula' ? editValue : null;
    try {
      const updated = await updateCell(
        sheetId,
        selectedRow,
        selectedCol,
        editValue,
        cellType,
        formula
      );
      setCells((prev) => ({
        ...prev,
        [cellKey(selectedRow, selectedCol)]: updated,
      }));
    } catch (err) {
      console.error('Failed to save cell:', err);
    }
    setEditing(false);
  }, [sheetId, selectedRow, selectedCol, editValue]);

  const startEdit = useCallback(() => {
    const key = cellKey(selectedRow, selectedCol);
    const existing = cells[key];
    setEditValue(existing ? existing.value : '');
    setEditing(true);
  }, [cells, selectedRow, selectedCol]);

  const cancelEdit = useCallback(() => {
    setEditing(false);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (editing) {
      if (e.key === 'Enter') {
        e.preventDefault();
        saveCell();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        cancelEdit();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        setSelectedRow((r) => Math.max(0, r - 1));
        break;
      case 'ArrowDown':
        e.preventDefault();
        setSelectedRow((r) => Math.min(ROWS - 1, r + 1));
        break;
      case 'ArrowLeft':
        e.preventDefault();
        setSelectedCol((c) => Math.max(0, c - 1));
        break;
      case 'ArrowRight':
        e.preventDefault();
        setSelectedCol((c) => Math.min(COLS - 1, c + 1));
        break;
      case 'Enter':
        e.preventDefault();
        startEdit();
        break;
      case 'F2':
        e.preventDefault();
        startEdit();
        break;
      default:
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
          setEditValue(e.key);
          setEditing(true);
        }
        break;
    }
  }, [editing, saveCell, cancelEdit, startEdit]);

  const handleCellClick = async (row: number, col: number) => {
    if (editing) {
      await saveCell();
    }
    setSelectedRow(row);
    setSelectedCol(col);
    const key = cellKey(row, col);
    const existing = cells[key];
    if (existing && existing.cellType?.toLowerCase() === 'formula' && existing.formula) {
      setEditValue(existing.formula);
    } else {
      setEditValue(existing ? (existing.value ?? '') : '');
    }
    setEditing(true);
  };

  const handleCellDoubleClick = async (row: number, col: number) => {
    if (editing) {
      await saveCell();
    }
    setSelectedRow(row);
    setSelectedCol(col);
    const key = cellKey(row, col);
    const existing = cells[key];
    if (existing && existing.cellType?.toLowerCase() === 'formula' && existing.formula) {
      setEditValue(existing.formula);
    } else {
      setEditValue(existing ? existing.value : '');
    }
    setEditing(true);
  };

  const getCellValue = (row: number, col: number): string => {
    const key = cellKey(row, col);
    const cell = cells[key];
    if (!cell) return '';
    if (cell.cellType?.toLowerCase() === 'formula' && cell.computedValue !== null && cell.computedValue !== undefined) {
      return cell.computedValue;
    }
    return cell.value || '';
  };

  const getSelectedFormula = (): string => {
    const key = cellKey(selectedRow, selectedCol);
    const cell = cells[key];
    if (cell && cell.cellType?.toLowerCase() === 'formula' && cell.formula) {
      return cell.formula;
    }
    return '';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div
        ref={gridRef}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        style={{
          border: '1px solid #ccc',
          overflow: 'auto',
          flex: 1,
          outline: 'none',
        }}
      >
        <table
          style={{
            borderCollapse: 'collapse',
            width: '100%',
            tableLayout: 'fixed',
          }}
        >
          <thead>
            <tr>
              <th
                style={{
                  width: '40px',
                  minWidth: '40px',
                  border: '1px solid #ddd',
                  background: '#f5f5f5',
                  padding: '4px',
                }}
              />
              {Array.from({ length: COLS }, (_, i) => (
                <th
                  key={i}
                  style={{
                    width: '80px',
                    minWidth: '80px',
                    border: '1px solid #ddd',
                    background: '#f5f5f5',
                    padding: '4px',
                    textAlign: 'center',
                    fontSize: '12px',
                  }}
                >
                  {colToLetter(i)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: ROWS }, (_, row) => (
              <tr key={row}>
                <td
                  style={{
                    width: '40px',
                    minWidth: '40px',
                    border: '1px solid #ddd',
                    background: '#f5f5f5',
                    padding: '4px',
                    textAlign: 'center',
                    fontSize: '12px',
                  }}
                >
                  {row + 1}
                </td>
                {Array.from({ length: COLS }, (_, col) => {
                  const isSelected = row === selectedRow && col === selectedCol;
                  const isEditing = isSelected && editing;
                  const value = getCellValue(row, col);

                  return (
                    <td
                      key={col}
                      onClick={() => handleCellClick(row, col)}
                      onDoubleClick={() => handleCellDoubleClick(row, col)}
                      style={{
                        border: '1px solid #ddd',
                        padding: '4px',
                        fontSize: '13px',
                        cursor: 'pointer',
                        background: isSelected ? '#e3f2fd' : '#fff',
                        outline: isSelected ? '2px solid #1976d2' : 'none',
                        outlineOffset: '-1px',
                        maxWidth: '80px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {isEditing ? (
                        <input
                          ref={editInputRef}
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              e.stopPropagation();
                              saveCell();
                            } else if (e.key === 'Escape') {
                              e.preventDefault();
                              e.stopPropagation();
                              cancelEdit();
                            }
                          }}
                          style={{
                            width: '100%',
                            border: 'none',
                            outline: '2px solid #1976d2',
                            padding: '2px',
                            fontSize: '13px',
                          }}
                        />
                      ) : (
                        <span>{value}</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div
        style={{
          border: '1px solid #ccc',
          borderTop: 'none',
          padding: '4px 8px',
          fontSize: '13px',
          background: '#fafafa',
          minHeight: '28px',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <span style={{ fontWeight: 'bold', marginRight: '8px', color: '#666' }}>
          {colToLetter(selectedCol)}{selectedRow + 1}
        </span>
        <span style={{ color: '#333' }}>
          {getSelectedFormula() || getCellValue(selectedRow, selectedCol)}
        </span>
      </div>
    </div>
  );
};