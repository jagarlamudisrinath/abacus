import React, { useState, useRef } from 'react';
import { parseBulkText, scrapeGoogleForm } from '../../services/admin.api';
import './BulkImport.css';

interface BulkImportProps {
  onImport: (questions: Array<{ expression: string; answer: number }>, replace: boolean) => void;
}

type ImportMode = 'csv' | 'google-forms';

export default function BulkImport({ onImport }: BulkImportProps) {
  const [importMode, setImportMode] = useState<ImportMode>('csv');
  const [bulkText, setBulkText] = useState('');
  const [googleFormUrl, setGoogleFormUrl] = useState('');
  const [preview, setPreview] = useState<Array<{ expression: string; answer: number }>>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [replaceAll, setReplaceAll] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      setBulkText(content);
      setPreview([]);
      setError(null);

      // Auto-preview after file load
      if (content.trim()) {
        try {
          setIsParsing(true);
          const result = await parseBulkText(content);
          setPreview(result.questions);
          if (result.questions.length === 0) {
            setError('No valid questions found in file. Check the format.');
          }
        } catch (err: any) {
          setError(err.message || 'Failed to parse file');
        } finally {
          setIsParsing(false);
        }
      }
    };
    reader.readAsText(file);

    // Reset file input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

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

  const handleFetchGoogleForm = async () => {
    if (!googleFormUrl.trim()) {
      setError('Please enter a Google Forms URL');
      return;
    }

    if (!googleFormUrl.includes('docs.google.com/forms')) {
      setError('Please enter a valid Google Forms URL');
      return;
    }

    try {
      setIsParsing(true);
      setError(null);
      const result = await scrapeGoogleForm(googleFormUrl);
      setPreview(result.questions);

      if (result.questions.length === 0) {
        setError('No math expressions found in the form.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch Google Form');
      console.error(err);
    } finally {
      setIsParsing(false);
    }
  };

  const handleImport = () => {
    if (preview.length === 0) {
      setError('No questions to import. Click Preview or Fetch first.');
      return;
    }

    onImport(preview, replaceAll);
    setBulkText('');
    setGoogleFormUrl('');
    setPreview([]);
  };

  const handleClear = () => {
    setBulkText('');
    setGoogleFormUrl('');
    setPreview([]);
    setError(null);
  };

  const handleModeChange = (mode: ImportMode) => {
    setImportMode(mode);
    setPreview([]);
    setError(null);
  };

  return (
    <div className="bulk-import">
      <div className="import-mode-tabs">
        <button
          className={`import-mode-tab ${importMode === 'csv' ? 'active' : ''}`}
          onClick={() => handleModeChange('csv')}
        >
          CSV / Text
        </button>
        <button
          className={`import-mode-tab ${importMode === 'google-forms' ? 'active' : ''}`}
          onClick={() => handleModeChange('google-forms')}
        >
          Google Forms
        </button>
      </div>

      {importMode === 'csv' ? (
        <>
          <div className="import-instructions">
            <h3>Supported Formats</h3>
            <ul>
              <li><strong>Comma-separated:</strong> 5+3-2,6</li>
              <li><strong>Tab-separated:</strong> 5+3-2{'\t'}6 (from Excel/Sheets)</li>
              <li><strong>Expression only:</strong> 5+3-2 (answer auto-calculated)</li>
            </ul>
            <p>One question per line. Lines starting with # are ignored.</p>
          </div>

          <div className="file-upload-section">
            <input
              type="file"
              ref={fileInputRef}
              accept=".csv,.tsv,.txt"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
            <button
              className="btn btn-secondary file-upload-btn"
              onClick={() => fileInputRef.current?.click()}
              disabled={isParsing}
            >
              Upload CSV/TSV File
            </button>
            <span className="file-hint">or paste text below</span>
          </div>

          <div className="import-area">
            <textarea
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              placeholder="Paste questions here...&#10;&#10;Example:&#10;5+3-2,6&#10;10-4+1,7&#10;8+9"
              rows={10}
            />
          </div>
        </>
      ) : (
        <>
          <div className="import-instructions">
            <h3>Import from Google Forms</h3>
            <p>Paste a Google Forms URL to automatically extract math expressions. Answers will be calculated automatically.</p>
            <p className="hint-text">Example: https://docs.google.com/forms/d/e/.../viewform</p>
          </div>

          <div className="google-form-input">
            <input
              type="text"
              value={googleFormUrl}
              onChange={(e) => setGoogleFormUrl(e.target.value)}
              placeholder="https://docs.google.com/forms/d/e/..."
              className="url-input"
            />
            <button
              className="btn btn-primary"
              onClick={handleFetchGoogleForm}
              disabled={isParsing || !googleFormUrl.trim()}
            >
              {isParsing ? 'Fetching...' : 'Fetch Questions'}
            </button>
          </div>
        </>
      )}

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}

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
        {importMode === 'csv' && (
          <button
            className="btn btn-secondary"
            onClick={handlePreview}
            disabled={isParsing || !bulkText.trim()}
          >
            {isParsing ? 'Parsing...' : 'Preview'}
          </button>
        )}
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
