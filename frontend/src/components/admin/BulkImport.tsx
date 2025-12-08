import React, { useState } from 'react';
import { parseBulkText } from '../../services/admin.api';
import './BulkImport.css';

interface BulkImportProps {
  onImport: (questions: Array<{ expression: string; answer: number }>, replace: boolean) => void;
}

export default function BulkImport({ onImport }: BulkImportProps) {
  const [bulkText, setBulkText] = useState('');
  const [preview, setPreview] = useState<Array<{ expression: string; answer: number }>>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [replaceAll, setReplaceAll] = useState(false);

  const handlePreview = async () => {
    if (!bulkText.trim()) {
      setError('Please enter some questions');
      return;
    }

    try {
      setIsParsing(true);
      setError(null);
      const result = await parseBulkText(bulkText);
      setPreview(result.questions);

      if (result.questions.length === 0) {
        setError('No valid questions found. Check the format.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to parse questions');
      console.error(err);
    } finally {
      setIsParsing(false);
    }
  };

  const handleImport = () => {
    if (preview.length === 0) {
      setError('No questions to import. Click Preview first.');
      return;
    }

    onImport(preview, replaceAll);
    setBulkText('');
    setPreview([]);
  };

  const handleClear = () => {
    setBulkText('');
    setPreview([]);
    setError(null);
  };

  return (
    <div className="bulk-import">
      <div className="import-instructions">
        <h3>Supported Formats</h3>
        <ul>
          <li><strong>Comma-separated:</strong> 5+3-2,6</li>
          <li><strong>Tab-separated:</strong> 5+3-2{'\t'}6 (from Excel/Sheets)</li>
          <li><strong>Expression only:</strong> 5+3-2 (answer auto-calculated)</li>
        </ul>
        <p>One question per line. Lines starting with # are ignored.</p>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}

      <div className="import-area">
        <textarea
          value={bulkText}
          onChange={(e) => setBulkText(e.target.value)}
          placeholder="Paste questions here...&#10;&#10;Example:&#10;5+3-2,6&#10;10-4+1,7&#10;8+9"
          rows={10}
        />

        <div className="import-options">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={replaceAll}
              onChange={(e) => setReplaceAll(e.target.checked)}
            />
            Replace all existing questions
          </label>
        </div>

        <div className="import-actions">
          <button
            className="btn btn-secondary"
            onClick={handlePreview}
            disabled={isParsing || !bulkText.trim()}
          >
            {isParsing ? 'Parsing...' : 'Preview'}
          </button>
          <button
            className="btn btn-primary"
            onClick={handleImport}
            disabled={preview.length === 0}
          >
            Import {preview.length > 0 ? `(${preview.length})` : ''}
          </button>
          <button
            className="btn btn-secondary"
            onClick={handleClear}
          >
            Clear
          </button>
        </div>
      </div>

      {preview.length > 0 && (
        <div className="preview-section">
          <h3>Preview ({preview.length} questions)</h3>
          <div className="preview-list">
            {preview.slice(0, 20).map((q, i) => (
              <div key={i} className="preview-item">
                <span className="preview-number">{i + 1}</span>
                <span className="preview-expression">{q.expression}</span>
                <span className="preview-answer">= {q.answer}</span>
              </div>
            ))}
            {preview.length > 20 && (
              <div className="preview-more">
                ... and {preview.length - 20} more
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
