import React, { useState, useEffect } from 'react';
import { X, FileSpreadsheet, Download, FileText, Check } from 'lucide-react';

export const ExportDesignerModal = ({ isOpen, onClose, title = 'Master Data', data = [], availableColumns = [] }) => {
  const [format, setFormat] = useState('excel'); // 'excel' | 'pdf'
  const [selectedColumns, setSelectedColumns] = useState({});

  useEffect(() => {
    if (availableColumns.length > 0) {
      const initial = {};
      availableColumns.forEach(col => {
        initial[col.key] = true;
      });
      setSelectedColumns(initial);
    }
  }, [availableColumns, isOpen]);

  // Listen for Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' || e.key === 'Esc') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const activeCols = availableColumns.filter(c => selectedColumns[c.key]);

  const handleToggleColumn = (key) => {
    setSelectedColumns(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSelectAll = () => {
    const updated = {};
    availableColumns.forEach(col => { updated[col.key] = true; });
    setSelectedColumns(updated);
  };

  const handleSelectNone = () => {
    const updated = {};
    availableColumns.forEach(col => { updated[col.key] = false; });
    setSelectedColumns(updated);
  };

  // Convert column index (0 -> A, 1 -> B, etc.)
  const getColLetter = (index) => String.fromCharCode(65 + index);

  // Generate CSV and trigger download
  const handleDownload = () => {
    if (activeCols.length === 0) {
      alert('Please select at least one column to export.');
      return;
    }

    if (format === 'excel') {
      // Build CSV content
      const headers = activeCols.map(c => `"${c.label.replace(/"/g, '""')}"`).join(',');
      const rows = data.map((item, idx) => {
        return activeCols.map(c => {
          let val = item[c.key];
          if (c.key === 'serialNumber' && (val === undefined || val === null)) val = idx + 1;
          if (val === undefined || val === null) val = '';
          return `"${String(val).replace(/"/g, '""')}"`;
        }).join(',');
      });

      const csvString = [headers, ...rows].join('\n');
      const blob = new Blob(['\uFEFF' + csvString], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `${title.toLowerCase().replace(/\s+/g, '_')}_export_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // PDF Export via Clean Printable HTML Window
      const printWindow = window.open('', '_blank', 'width=900,height=1000');
      if (printWindow) {
        const tableHeaderHtml = activeCols.map(c => `<th style="border:1px solid #000; padding:6px; background:#f1f5f9; text-align:left;">${c.label}</th>`).join('');
        const tableBodyHtml = data.map((item, idx) => {
          const cells = activeCols.map(c => {
            let val = item[c.key];
            if (c.key === 'serialNumber' && (val === undefined || val === null)) val = idx + 1;
            if (val === undefined || val === null) val = '-';
            return `<td style="border:1px solid #000; padding:6px;">${val}</td>`;
          }).join('');
          return `<tr>${cells}</tr>`;
        }).join('');

        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>${title} Export PDF</title>
              <style>
                body { font-family: Arial, sans-serif; padding: 20px; color: #000; }
                h2 { margin-bottom: 5px; }
                p { font-size: 12px; color: #555; margin-bottom: 15px; }
                table { width: 100%; border-collapse: collapse; font-size: 12px; }
              </style>
            </head>
            <body>
              <h2>SRI DURGA ENTERPRISES - ${title}</h2>
              <p>Export Date: ${new Date().toLocaleString()}</p>
              <table>
                <thead><tr>${tableHeaderHtml}</tr></thead>
                <tbody>${tableBodyHtml}</tbody>
              </table>
              <script>
                window.onload = function() {
                  setTimeout(function() { window.print(); }, 300);
                };
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
      }
    }
  };

  const currentDateStr = new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }) + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 999999, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
      
      <div className="glass-panel" style={{ width: '100%', maxWidth: '1000px', maxHeight: '90vh', background: '#0f172a', border: '1px solid rgba(99, 102, 241, 0.4)', borderRadius: '16px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {/* Top Header */}
        <div style={{ padding: '1.25rem 1.5rem', background: 'rgba(30, 41, 59, 0.9)', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.2)', padding: '0.5rem', borderRadius: '10px', color: '#34d399' }}>
              <FileSpreadsheet size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'white', margin: 0 }}>
                Export Designer
              </h3>
              <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                {title} ({data.length} records) • {currentDateStr}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* Excel / PDF Toggle Switcher */}
            <div style={{ display: 'flex', background: 'rgba(15, 23, 42, 0.8)', padding: '3px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
              <button
                type="button"
                onClick={() => setFormat('excel')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.4rem 0.85rem',
                  borderRadius: '7px',
                  border: 'none',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: format === 'excel' ? '#0284c7' : 'transparent',
                  color: format === 'excel' ? 'white' : 'var(--text-muted)',
                  transition: 'all 0.2s ease'
                }}
              >
                <FileSpreadsheet size={15} /> Excel
              </button>

              <button
                type="button"
                onClick={() => setFormat('pdf')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.4rem 0.85rem',
                  borderRadius: '7px',
                  border: 'none',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: format === 'pdf' ? '#e11d48' : 'transparent',
                  color: format === 'pdf' ? 'white' : 'var(--text-muted)',
                  transition: 'all 0.2s ease'
                }}
              >
                <FileText size={15} /> PDF
              </button>
            </div>

            <button onClick={onClose} className="btn btn-outline" style={{ padding: '0.45rem' }}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Main Body Grid Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', flex: 1, overflow: 'hidden' }}>
          
          {/* Left Settings Sidebar */}
          <div style={{ padding: '1.25rem', borderRight: '1px solid var(--border-color)', background: 'rgba(15, 23, 42, 0.6)', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            <div>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'white', marginBottom: '0.25rem' }}>
                {format === 'excel' ? 'Excel Settings' : 'PDF Settings'}
              </h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                Select columns to include in the exported document.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'white' }}>Columns</span>
              <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.75rem' }}>
                <button type="button" onClick={handleSelectAll} style={{ background: 'none', border: 'none', color: '#818cf8', cursor: 'pointer', padding: 0, fontWeight: 600 }}>All</button>
                <span style={{ color: 'var(--text-subtle)' }}>|</span>
                <button type="button" onClick={handleSelectNone} style={{ background: 'none', border: 'none', color: '#818cf8', cursor: 'pointer', padding: 0, fontWeight: 600 }}>None</button>
              </div>
            </div>

            {/* Columns Checkbox List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {availableColumns.map(col => (
                <label key={col.key} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', fontSize: '0.825rem', color: selectedColumns[col.key] ? 'white' : 'var(--text-muted)', cursor: 'pointer', userSelect: 'none' }}>
                  <input
                    type="checkbox"
                    checked={!!selectedColumns[col.key]}
                    onChange={() => handleToggleColumn(col.key)}
                    style={{ accentColor: '#0284c7', width: '15px', height: '15px', borderRadius: '4px', cursor: 'pointer' }}
                  />
                  <span>{col.label}</span>
                </label>
              ))}
            </div>

          </div>

          {/* Center Main Excel Grid Spreadsheet Live Preview */}
          <div style={{ padding: '1rem', background: '#ffffff', color: '#000000', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            
            {/* Formula Bar Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.35rem 0.75rem', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '11px', fontWeight: 600, color: '#475569', marginBottom: '0.75rem' }}>
              <span style={{ color: '#0284c7', fontWeight: 700 }}>A1</span>
              <span style={{ color: '#cbd5e1' }}>|</span>
              <span style={{ color: '#64748b' }}>fx</span>
              <span style={{ color: '#000', flex: 1 }}>{activeCols.length > 0 ? activeCols[0].label : ''}</span>
            </div>

            {/* Interactive Excel Sheet Grid */}
            <div style={{ flex: 1, border: '1px solid #cbd5e1', borderRadius: '6px', overflow: 'auto', background: '#fff' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', fontFamily: 'Segoe UI, Arial, sans-serif' }}>
                <thead>
                  {/* Excel Column Letters A, B, C... */}
                  <tr style={{ background: '#0284c7', color: '#ffffff' }}>
                    <th style={{ width: '35px', padding: '4px', textAlign: 'center', borderRight: '1px solid #0369a1', fontSize: '10px' }}>#</th>
                    {activeCols.map((_, i) => (
                      <th key={i} style={{ padding: '5px 10px', textAlign: 'left', fontWeight: 700, borderRight: '1px solid #0369a1', fontSize: '11px' }}>
                        {getColLetter(i)}
                      </th>
                    ))}
                  </tr>

                  {/* Excel Table Header Row (S.NO, CODE, DESCRIPTION...) */}
                  <tr style={{ background: '#f1f5f9', color: '#0f172a', borderBottom: '1px solid #cbd5e1' }}>
                    <td style={{ padding: '5px', textAlign: 'center', fontWeight: 'bold', background: '#e2e8f0', borderRight: '1px solid #cbd5e1', fontSize: '11px' }}>1</td>
                    {activeCols.map((c, i) => (
                      <td key={i} style={{ padding: '6px 10px', fontWeight: 'bold', borderRight: '1px solid #cbd5e1', fontSize: '11.5px', textTransform: 'uppercase' }}>
                        {c.label}
                      </td>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.length === 0 ? (
                    <tr>
                      <td colSpan={activeCols.length + 1} style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                        No records available to display in preview.
                      </td>
                    </tr>
                  ) : (
                    data.slice(0, 10).map((item, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '5px', textAlign: 'center', fontWeight: 'bold', background: '#f8fafc', borderRight: '1px solid #cbd5e1', fontSize: '11px', color: '#64748b' }}>
                          {idx + 2}
                        </td>
                        {activeCols.map((c, i) => {
                          let val = item[c.key];
                          if (c.key === 'serialNumber' && (val === undefined || val === null)) val = idx + 1;
                          if (val === undefined || val === null) val = '-';
                          const isFirstCell = idx === 0 && i === 0;

                          return (
                            <td 
                              key={i} 
                              style={{ 
                                padding: '6px 10px', 
                                borderRight: '1px solid #cbd5e1', 
                                fontSize: '11.5px', 
                                color: '#1e293b',
                                background: isFirstCell ? '#e0f2fe' : 'transparent',
                                border: isFirstCell ? '2px solid #0284c7' : undefined
                              }}
                            >
                              {String(val)}
                            </td>
                          );
                        })}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Excel Sheet Footer Status Bar */}
            <div style={{ marginTop: '0.75rem', padding: '0.5rem 0.75rem', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: '#64748b' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ background: '#ffffff', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontWeight: 600, color: '#0f172a' }}>
                  Sheet1
                </span>
                <span>Ready</span>
              </div>
              <div>
                Showing 1 to {Math.min(10, data.length)} of {data.length} records
              </div>
            </div>

          </div>

        </div>

        {/* Modal Bottom Actions */}
        <div style={{ padding: '1rem 1.5rem', background: 'rgba(30, 41, 59, 0.9)', borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={onClose} className="btn btn-outline" style={{ padding: '0.5rem 1.25rem' }}>
            Cancel
          </button>

          <button onClick={handleDownload} className="btn btn-primary" style={{ padding: '0.55rem 1.5rem', background: '#10b981', borderColor: '#059669', color: 'white' }}>
            <Download size={16} />
            <span>Download {format === 'excel' ? 'Excel File' : 'PDF Document'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
