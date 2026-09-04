import React, { useState, useRef, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { Upload, FileSpreadsheet, Download, CheckCircle, AlertCircle, X, Trash2, Plus, ArrowRight } from 'lucide-react';

export const LineItemUploadModal = ({ isOpen, onClose, onImport, masterItems = [] }) => {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [parsedRows, setParsedRows] = useState([]);
  const [importMode, setImportMode] = useState('REPLACE'); // 'REPLACE' or 'APPEND'
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

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

  // Process Excel / CSV File
  const processFile = (selectedFile) => {
    setError('');
    if (!selectedFile) return;

    setFile(selectedFile);
    setFileName(selectedFile.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert to JSON with raw headers
        const rawJson = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (!rawJson || rawJson.length === 0) {
          setError('The uploaded file contains no data or could not be read.');
          setParsedRows([]);
          return;
        }

        // Map and normalize row keys
        const mappedItems = rawJson.map((row, idx) => {
          // Normalize keys by lowercasing and trimming
          const keys = Object.keys(row);
          const normalized = {};
          keys.forEach(k => {
            normalized[k.toLowerCase().replace(/[^a-z0-9]/g, '')] = row[k];
          });

          // Detect Item Code
          const itemCode = String(
            normalized.itemcode ||
            normalized.itemno ||
            normalized.code ||
            normalized.slno ||
            normalized.itemnumber ||
            normalized.no ||
            ''
          ).trim();

          // Detect Description
          let description = String(
            normalized.description ||
            normalized.itemdescription ||
            normalized.desc ||
            normalized.particulars ||
            normalized.itemname ||
            normalized.name ||
            normalized.workdescription ||
            ''
          ).trim();

          // Detect Quantity
          let quantity = parseFloat(
            normalized.quantity ||
            normalized.qty ||
            normalized.count ||
            normalized.nos ||
            1
          );
          if (isNaN(quantity) || quantity <= 0) quantity = 1;

          // Detect Unit
          let unit = String(
            normalized.unit ||
            normalized.uom ||
            normalized.units ||
            'No'
          ).trim() || 'No';

          // Detect Rate
          let rate = parseFloat(
            normalized.rate ||
            normalized.price ||
            normalized.unitrate ||
            normalized.unitprice ||
            0
          );
          if (isNaN(rate)) rate = 0;

          // Auto-match with Item Master if description or rate is missing
          if (itemCode && masterItems.length > 0) {
            const matchedMaster = masterItems.find(
              m => m.itemCode && m.itemCode.toUpperCase().trim() === itemCode.toUpperCase().trim()
            );
            if (matchedMaster) {
              if (!description) description = matchedMaster.description || '';
              if (!unit || unit === 'No') unit = matchedMaster.unit || 'No';
              if (rate === 0) rate = Number(matchedMaster.rate || 0);
            }
          }

          const amount = quantity * rate;

          return {
            serialNumber: idx + 1,
            itemCode: itemCode || 'CUSTOM',
            description: description || `Line Item ${idx + 1}`,
            quantity: quantity,
            unit: unit,
            rate: rate,
            amount: amount,
            fetched: true
          };
        }).filter(item => item.itemCode || item.description || item.rate > 0);

        if (mappedItems.length === 0) {
          setError('No valid line items found in the file. Please ensure columns include Item Code/No, Description, Qty, Unit, and Rate.');
          setParsedRows([]);
        } else {
          setParsedRows(mappedItems);
        }

      } catch (err) {
        console.error('Failed to parse uploaded spreadsheet:', err);
        setError('Failed to parse the file. Please upload a valid .xlsx, .xls, or .csv file.');
        setParsedRows([]);
      }
    };

    reader.readAsArrayBuffer(selectedFile);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  // Generate & Download Sample Template
  const downloadSampleTemplate = () => {
    const sampleData = [
      {
        'Item Code': '1.1',
        'Description': 'Complete Overhauling & Servicing of 10HP Submersible Pump Motor',
        'Quantity': 1,
        'Unit': 'No',
        'Rate': 4500.00
      },
      {
        'Item Code': '1.2',
        'Description': 'Rewinding of 3-Phase Induction Motor with F-Class Copper Wire',
        'Quantity': 2,
        'Unit': 'Nos',
        'Rate': 3200.00
      },
      {
        'Item Code': '2.1',
        'Description': 'Replacement of Heavy Duty Deep Groove Ball Bearings (SKF/FAG)',
        'Quantity': 4,
        'Unit': 'Set',
        'Rate': 850.00
      },
      {
        'Item Code': 'CUSTOM',
        'Description': 'Dynamic Balancing and Precision Vibration Testing',
        'Quantity': 1,
        'Unit': 'Job',
        'Rate': 1200.00
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'LineItems');

    // Auto-size columns
    worksheet['!cols'] = [
      { wch: 15 },
      { wch: 55 },
      { wch: 12 },
      { wch: 10 },
      { wch: 15 }
    ];

    XLSX.writeFile(workbook, 'Sri_Durga_Line_Items_Template.xlsx');
  };

  const handleConfirmImport = () => {
    if (parsedRows.length === 0) {
      setError('Please select a valid spreadsheet file with items first.');
      return;
    }
    onImport(parsedRows, importMode);
    onClose();
  };

  const totalCalculated = parsedRows.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  return (
    <div 
      className="no-print-modal-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999999,
        background: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        overflow: 'hidden'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '850px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          overflow: 'hidden'
        }}
      >
        {/* Modal Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(15, 23, 42, 0.6)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
            }}>
              <Upload size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'white', margin: 0 }}>
                Upload & Import Line Items
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Import Item Code, Description, Quantity, Unit, and Rate from Excel (.xlsx/.xls) or CSV
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button 
              type="button"
              onClick={downloadSampleTemplate} 
              className="btn btn-outline"
              style={{
                fontSize: '0.8rem',
                padding: '0.45rem 0.85rem',
                borderColor: 'rgba(56, 189, 248, 0.4)',
                color: '#38bdf8'
              }}
              title="Download clean pre-formatted Excel template"
            >
              <Download size={15} />
              <span>Sample Template</span>
            </button>

            <button 
              type="button"
              onClick={onClose} 
              className="btn btn-outline" 
              style={{ padding: '0.45rem' }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Dropzone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
            style={{
              border: dragActive ? '2px dashed #10b981' : '2px dashed rgba(255, 255, 255, 0.15)',
              borderRadius: '12px',
              padding: '2rem',
              textAlign: 'center',
              cursor: 'pointer',
              background: dragActive ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255, 255, 255, 0.02)',
              transition: 'all 0.2s ease',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.75rem'
            }}
          >
            <input 
              ref={fileInputRef} 
              type="file" 
              accept=".xlsx, .xls, .csv" 
              style={{ display: 'none' }} 
              onChange={handleFileChange}
            />

            <FileSpreadsheet size={42} color={parsedRows.length > 0 ? '#10b981' : '#38bdf8'} />
            
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                {fileName ? `Selected: ${fileName}` : 'Click to Browse or Drag & Drop Excel / CSV File'}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Supports standard spreadsheets with columns: <strong>Item Code, Description, Quantity, Unit, Rate</strong>
              </div>
            </div>

            {fileName && (
              <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                <CheckCircle size={13} /> {parsedRows.length} Items Parsed Successfully
              </span>
            )}
          </div>

          {/* Error Notice */}
          {error && (
            <div style={{
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#f87171',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Parsed Items Preview Table */}
          {parsedRows.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#fbbf24' }}>
                  Parsed Items Preview ({parsedRows.length} Items)
                </span>
                
                {/* Import Mode: Replace vs Append */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.8rem' }}>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', userSelect: 'none' }}>
                    <input
                      type="radio"
                      name="importMode"
                      value="REPLACE"
                      checked={importMode === 'REPLACE'}
                      onChange={() => setImportMode('REPLACE')}
                      style={{ accentColor: '#10b981' }}
                    />
                    <span style={{ color: importMode === 'REPLACE' ? '#ffffff' : 'var(--text-muted)', fontWeight: importMode === 'REPLACE' ? 700 : 400 }}>
                      Replace all current items
                    </span>
                  </label>

                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', userSelect: 'none' }}>
                    <input
                      type="radio"
                      name="importMode"
                      value="APPEND"
                      checked={importMode === 'APPEND'}
                      onChange={() => setImportMode('APPEND')}
                      style={{ accentColor: '#10b981' }}
                    />
                    <span style={{ color: importMode === 'APPEND' ? '#ffffff' : 'var(--text-muted)', fontWeight: importMode === 'APPEND' ? 700 : 400 }}>
                      Append to existing items
                    </span>
                  </label>
                </div>
              </div>

              <div style={{
                maxHeight: '260px',
                overflowY: 'auto',
                border: '1px solid var(--border-color)',
                borderRadius: '8px'
              }}>
                <table className="custom-table" style={{ margin: 0 }}>
                  <thead>
                    <tr style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                      <th style={{ width: '45px', textAlign: 'center' }}>#</th>
                      <th style={{ width: '120px' }}>Item Code</th>
                      <th>Description</th>
                      <th style={{ width: '70px', textAlign: 'center' }}>Qty</th>
                      <th style={{ width: '70px', textAlign: 'center' }}>Unit</th>
                      <th style={{ width: '110px', textAlign: 'right' }}>Rate (₹)</th>
                      <th style={{ width: '120px', textAlign: 'right' }}>Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedRows.map((item, idx) => (
                      <tr key={idx}>
                        <td style={{ textAlign: 'center', color: 'var(--text-muted)' }}>{idx + 1}</td>
                        <td style={{ fontWeight: 700, color: '#818cf8' }}>{item.itemCode}</td>
                        <td style={{ fontSize: '0.85rem' }}>{item.description}</td>
                        <td style={{ textAlign: 'center', fontWeight: 600 }}>{item.quantity}</td>
                        <td style={{ textAlign: 'center', color: '#10b981', fontWeight: 700 }}>{item.unit}</td>
                        <td style={{ textAlign: 'right', fontWeight: 600 }}>₹{item.rate.toFixed(2)}</td>
                        <td style={{ textAlign: 'right', fontWeight: 700, color: '#34d399' }}>₹{item.amount.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Total Summary Footer */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '0.75rem 1rem',
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.9rem'
              }}>
                <span>Total Items: {parsedRows.length}</span>
                <span style={{ color: '#34d399' }}>Total Subtotal: ₹{totalCalculated.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '1rem 1.5rem',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: '0.75rem',
          background: 'rgba(15, 23, 42, 0.6)'
        }}>
          <button 
            type="button"
            onClick={onClose} 
            className="btn btn-outline"
            style={{ fontSize: '0.85rem' }}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleConfirmImport}
            disabled={parsedRows.length === 0}
            className="btn btn-primary"
            style={{
              fontSize: '0.85rem',
              padding: '0.55rem 1.25rem',
              background: parsedRows.length > 0 ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : undefined,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <Plus size={16} />
            <span>Import {parsedRows.length} Line Items to Invoice</span>
          </button>
        </div>

      </div>
    </div>
  );
};
