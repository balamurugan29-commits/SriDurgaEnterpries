import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Upload, 
  Image as ImageIcon, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  RefreshCw, 
  ArrowRight, 
  Eye, 
  Layers, 
  Building2, 
  Trash2, 
  Plus,
  FileSpreadsheet,
  FileCode,
  Download
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { processUniversalDocument } from '../utils/invoiceImageExtractor';

export const InvoiceImageUploadModal = ({ 
  isOpen, 
  onClose, 
  onApplyExtractedData, 
  masterCustomers = [], 
  masterItems = [] 
}) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileTypeTag, setFileTypeTag] = useState('');
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrProgress, setOcrProgress] = useState({ status: '', progress: 0, message: '' });
  const [extractedData, setExtractedData] = useState(null);
  const [rawOcrText, setRawOcrText] = useState('');
  const [activeTab, setActiveTab] = useState('fields'); // 'fields', 'items', 'raw'
  const [errorMessage, setErrorMessage] = useState('');
  
  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      setSelectedFile(null);
      setFileTypeTag('');
      setPreviewUrl(null);
      setIsProcessing(false);
      setOcrProgress({ status: '', progress: 0, message: '' });
      setExtractedData(null);
      setRawOcrText('');
      setErrorMessage('');
      setActiveTab('fields');
    }
  }, [isOpen]);

  // Global Paste Listener for easy screenshot pasting (Ctrl+V)
  useEffect(() => {
    if (!isOpen) return;

    const handlePaste = (event) => {
      const items = (event.clipboardData || event.originalEvent.clipboardData).items;
      for (const item of items) {
        if (item.type.indexOf('image') === 0) {
          const file = item.getAsFile();
          if (file) {
            handleFileSelect(file);
          }
          break;
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => {
      window.removeEventListener('paste', handlePaste);
    };
  }, [isOpen, masterItems, masterCustomers]);

  const handleDownloadTemplate = (e) => {
    if (e) e.stopPropagation();
    const templateData = [
      ['Customer Name', 'Address', 'GSTIN', 'PO Number', 'Challan Number', 'Date'],
      ['M/s. ONGC Ltd, Karaikal', 'Neravy, Karaikal - 609604', '34AAACT0000A1Z5', 'PO-9010038288', '01/26-27', new Date().toISOString().split('T')[0]],
      [],
      ['Sl.No', 'Item Code', 'Description of Goods / Services', 'Quantity', 'Unit', 'Rate (Rs)', 'Amount (Rs)'],
      [1, '1001', 'Complete overhauling of Starter Motor', 1, 'No.', 18500, 18500],
      [2, '1002', 'Armature Commutator Rewinding', 1, 'Set', 12400, 12400],
      [3, '1003', 'Carbon Brush Set Replacement', 2, 'Sets', 850, 1700]
    ];
    const ws = XLSX.utils.aoa_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Tax Invoice Template');
    XLSX.writeFile(wb, 'Tax_Invoice_Sample_Template.xlsx');
  };

  if (!isOpen) return null;

  const handleFileSelect = async (file) => {
    if (!file) return;

    const fname = (file.name || '').toLowerCase();
    let typeTag = 'Document';
    if (fname.endsWith('.xlsx') || fname.endsWith('.xls') || fname.endsWith('.csv')) typeTag = 'Excel / Spreadsheet';
    else if (fname.endsWith('.pdf')) typeTag = 'PDF Document';
    else if (fname.endsWith('.json')) typeTag = 'JSON Data';
    else if (fname.endsWith('.txt')) typeTag = 'Text Document';
    else if (file.type.startsWith('image/')) typeTag = 'Image';

    setFileTypeTag(typeTag);
    setErrorMessage('');
    setSelectedFile(file);

    if (file.type.startsWith('image/')) {
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
    } else {
      setPreviewUrl(null);
    }

    // Process file with Universal Document & Image Processor
    setIsProcessing(true);
    try {
      const parsed = await processUniversalDocument(file, masterCustomers, masterItems, (prog) => {
        setOcrProgress(prog);
      });

      setRawOcrText(parsed.rawText || '');
      setExtractedData(parsed.extracted);
    } catch (err) {
      console.error('File Extraction Failed:', err);
      setErrorMessage(err.message || 'Unable to process document. Please verify the file or enter details manually.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFieldChange = (field, value) => {
    if (!extractedData) return;
    setExtractedData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleItemChange = (index, field, value) => {
    if (!extractedData || !extractedData.lineItems) return;
    const updated = [...extractedData.lineItems];
    updated[index][field] = value;
    if (field === 'quantity' || field === 'rate') {
      const q = Number(updated[index].quantity) || 0;
      const r = Number(updated[index].rate) || 0;
      updated[index].amount = q * r;
    }
    setExtractedData(prev => ({
      ...prev,
      lineItems: updated
    }));
  };

  const handleRemoveItem = (index) => {
    if (!extractedData || !extractedData.lineItems) return;
    const updated = extractedData.lineItems.filter((_, i) => i !== index);
    setExtractedData(prev => ({
      ...prev,
      lineItems: updated
    }));
  };

  const handleAddItem = () => {
    if (!extractedData) return;
    const items = extractedData.lineItems || [];
    setExtractedData(prev => ({
      ...prev,
      lineItems: [
        ...items,
        {
          serialNumber: items.length + 1,
          itemCode: 'CUSTOM',
          description: '',
          quantity: 1,
          unit: 'No',
          rate: 0,
          amount: 0,
          fetched: false
        }
      ]
    }));
  };

  const handleApply = () => {
    if (!extractedData) return;
    onApplyExtractedData(extractedData);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 1200,
      background: 'rgba(5, 8, 18, 0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div 
        className="glass-panel animate-modal-entry"
        style={{
          width: '100%',
          maxWidth: '1020px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          background: '#0f172a',
          border: '1px solid rgba(99, 102, 241, 0.4)',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.85)',
          overflow: 'hidden'
        }}
      >
        {/* Modal Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          background: 'linear-gradient(90deg, rgba(30, 27, 75, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)',
          borderBottom: '1px solid rgba(99, 102, 241, 0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
              padding: '0.55rem',
              borderRadius: '10px',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)'
            }}>
              <Sparkles size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'white', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                Upload & Auto-Extract Tax Invoice Details
              </h3>
              <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                Universal support for <strong style={{ color: '#34d399' }}>Excel (.xlsx, .xls, .csv)</strong>, <strong style={{ color: '#f87171' }}>PDF (.pdf)</strong>, <strong style={{ color: '#38bdf8' }}>Images (PNG, JPG)</strong>, and Text/JSON.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="btn btn-outline"
            style={{ padding: '0.4rem', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Template Download Option Banner */}
          {!extractedData && !isProcessing && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.75rem 1rem',
              background: 'rgba(99, 102, 241, 0.12)',
              border: '1px solid rgba(99, 102, 241, 0.35)',
              borderRadius: '10px',
              flexWrap: 'wrap',
              gap: '0.75rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <FileSpreadsheet size={20} color="#818cf8" />
                <span style={{ fontSize: '0.85rem', color: '#e0e7ff' }}>
                  Need standard format? Download the ready Excel template:
                </span>
              </div>
              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="btn btn-outline"
                style={{
                  fontSize: '0.8rem',
                  padding: '0.4rem 0.9rem',
                  color: '#818cf8',
                  borderColor: 'rgba(99, 102, 241, 0.5)',
                  background: 'rgba(99, 102, 241, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontWeight: 700
                }}
              >
                <Download size={14} />
                <span>Download Template Format (.xlsx)</span>
              </button>
            </div>
          )}

          {/* Upload Drop Zone / Picker Area */}
          {!extractedData && !isProcessing && (
            <div
              ref={dropZoneRef}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: '2px dashed rgba(99, 102, 241, 0.5)',
                borderRadius: '14px',
                padding: '3rem 2rem',
                textAlign: 'center',
                background: 'rgba(30, 27, 75, 0.25)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '1rem'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#818cf8';
                e.currentTarget.style.background = 'rgba(30, 27, 75, 0.45)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.5)';
                e.currentTarget.style.background = 'rgba(30, 27, 75, 0.25)';
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv,.pdf,.json,.txt,.doc,.docx,image/*"
                onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                style={{ display: 'none' }}
              />

              <div style={{
                background: 'rgba(99, 102, 241, 0.2)',
                padding: '1.25rem',
                borderRadius: '50%',
                color: '#818cf8'
              }}>
                <Upload size={36} />
              </div>

              <div>
                <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'white', margin: 0 }}>
                  Click to Browse or Drag & Drop Any Document or Image
                </h4>
                <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                  Supports <strong style={{ color: '#34d399' }}>Excel (.xlsx, .xls, .csv)</strong>, <strong style={{ color: '#f87171' }}>PDF (.pdf)</strong>, <strong style={{ color: '#38bdf8' }}>Images (PNG, JPG, WEBP)</strong>, or paste screenshot with <strong style={{ color: '#fbbf24' }}>Ctrl + V</strong>
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                <span style={{ fontSize: '0.725rem', padding: '3px 10px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)', fontWeight: 600 }}>
                  📗 Excel (.xlsx / .xls / .csv)
                </span>
                <span style={{ fontSize: '0.725rem', padding: '3px 10px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)', fontWeight: 600 }}>
                  📕 PDF Documents (.pdf)
                </span>
                <span style={{ fontSize: '0.725rem', padding: '3px 10px', borderRadius: '12px', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.3)', fontWeight: 600 }}>
                  🖼️ Images (Scans / Screenshots)
                </span>
                <span style={{ fontSize: '0.725rem', padding: '3px 10px', borderRadius: '12px', background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', border: '1px solid rgba(168, 85, 247, 0.3)', fontWeight: 600 }}>
                  📄 Text / JSON / CSV
                </span>
              </div>
            </div>
          )}

          {/* Processing State */}
          {isProcessing && (
            <div style={{
              border: '1px solid rgba(99, 102, 241, 0.3)',
              borderRadius: '14px',
              padding: '3rem 2rem',
              textAlign: 'center',
              background: 'rgba(15, 23, 42, 0.6)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1.25rem'
            }}>
              <div style={{ position: 'relative', width: '64px', height: '64px' }}>
                <RefreshCw size={56} color="#818cf8" className="animate-spin" />
              </div>

              <div>
                <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'white', margin: 0 }}>
                  Processing {fileTypeTag || 'File'} & Extracting Details...
                </h4>
                <p style={{ fontSize: '0.85rem', color: '#38bdf8', marginTop: '0.4rem', fontWeight: 600 }}>
                  {ocrProgress.message || 'Extracting invoice data...'}
                </p>
              </div>

              {/* Progress Bar */}
              <div style={{ width: '100%', maxWidth: '360px', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${Math.round((ocrProgress.progress || 0.25) * 100)}%`,
                  background: 'linear-gradient(90deg, #6366f1 0%, #10b981 100%)',
                  borderRadius: '4px',
                  transition: 'width 0.3s ease'
                }} />
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              borderRadius: '10px',
              padding: '0.75rem 1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              color: '#f87171',
              fontSize: '0.85rem'
            }}>
              <AlertCircle size={18} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Extracted Data Review & Verification Screen */}
          {extractedData && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              {/* Top Action / Summary Banner */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.75rem',
                background: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                padding: '0.75rem 1.25rem',
                borderRadius: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#34d399' }}>
                  <CheckCircle2 size={20} />
                  <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>
                    Details Successfully Extracted from {selectedFile?.name || 'File'}! Review and click "Apply to Tax Invoice".
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setExtractedData(null);
                      setPreviewUrl(null);
                    }}
                    className="btn btn-outline"
                    style={{ fontSize: '0.775rem', padding: '0.35rem 0.75rem', color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                  >
                    Upload Another File
                  </button>
                </div>
              </div>

              {/* Tabs Navigation */}
              <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setActiveTab('fields')}
                  className={`btn ${activeTab === 'fields' ? 'btn-primary' : 'btn-outline'}`}
                  style={{ fontSize: '0.825rem', padding: '0.45rem 0.95rem' }}
                >
                  <Building2 size={15} />
                  <span>Invoice & Customer Fields</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('items')}
                  className={`btn ${activeTab === 'items' ? 'btn-primary' : 'btn-outline'}`}
                  style={{ fontSize: '0.825rem', padding: '0.45rem 0.95rem' }}
                >
                  <Layers size={15} />
                  <span>Line Items ({extractedData.lineItems?.length || 0})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('raw')}
                  className={`btn ${activeTab === 'raw' ? 'btn-primary' : 'btn-outline'}`}
                  style={{ fontSize: '0.825rem', padding: '0.45rem 0.95rem' }}
                >
                  <FileText size={15} />
                  <span>Extracted Document Text</span>
                </button>
              </div>

              {/* TAB 1: Fields Form Grid */}
              {activeTab === 'fields' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                  
                  {/* Tax Invoice No */}
                  <div>
                    <label className="form-label">Tax Invoice No</label>
                    <input
                      type="text"
                      className="form-input"
                      style={{ fontWeight: 700, color: '#fbbf24' }}
                      value={extractedData.challanNumber || ''}
                      onChange={(e) => handleFieldChange('challanNumber', e.target.value)}
                      placeholder="e.g. 03/26-27"
                    />
                  </div>

                  {/* Invoice Date */}
                  <div>
                    <label className="form-label">Invoice Date</label>
                    <input
                      type="date"
                      className="form-input"
                      value={extractedData.challanDate || ''}
                      onChange={(e) => handleFieldChange('challanDate', e.target.value)}
                    />
                  </div>

                  {/* Customer / Party Name */}
                  <div style={{ gridColumn: 'span 2' }}>
                    <label className="form-label">Customer / Party Name</label>
                    <input
                      type="text"
                      className="form-input"
                      style={{ fontWeight: 600, color: '#38bdf8' }}
                      value={extractedData.customerName || ''}
                      onChange={(e) => handleFieldChange('customerName', e.target.value)}
                      placeholder="e.g. M/s Ocean Sparkle Ltd"
                    />
                  </div>

                  {/* Customer Address */}
                  <div style={{ gridColumn: 'span 2' }}>
                    <label className="form-label">Customer Address</label>
                    <textarea
                      className="form-input"
                      rows={2}
                      value={extractedData.customerAddress || ''}
                      onChange={(e) => handleFieldChange('customerAddress', e.target.value)}
                      placeholder="Address..."
                    />
                  </div>

                  {/* Customer Phone */}
                  <div>
                    <label className="form-label">Customer Phone</label>
                    <input
                      type="text"
                      className="form-input"
                      value={extractedData.customerPhone || ''}
                      onChange={(e) => handleFieldChange('customerPhone', e.target.value)}
                      placeholder="e.g. 9842492946"
                    />
                  </div>

                  {/* Customer PAN */}
                  <div>
                    <label className="form-label">Customer PAN</label>
                    <input
                      type="text"
                      className="form-input"
                      value={extractedData.customerPan || ''}
                      onChange={(e) => handleFieldChange('customerPan', e.target.value)}
                      placeholder="e.g. AAACO2519H"
                    />
                  </div>

                  {/* Customer GSTIN */}
                  <div>
                    <label className="form-label">Customer GSTIN</label>
                    <input
                      type="text"
                      className="form-input"
                      value={extractedData.customerGstin || ''}
                      onChange={(e) => handleFieldChange('customerGstin', e.target.value)}
                      placeholder="e.g. 34AAACO2519H1ZR"
                    />
                  </div>

                  {/* Customer State Code */}
                  <div>
                    <label className="form-label">Customer State Code</label>
                    <input
                      type="text"
                      className="form-input"
                      value={extractedData.customerStateCode || ''}
                      onChange={(e) => handleFieldChange('customerStateCode', e.target.value)}
                      placeholder="e.g. TAMILNADU (33)"
                    />
                  </div>

                  {/* P.O. Number */}
                  <div>
                    <label className="form-label">P.O. Number / Ref</label>
                    <input
                      type="text"
                      className="form-input"
                      value={extractedData.poNumber || ''}
                      onChange={(e) => handleFieldChange('poNumber', e.target.value)}
                      placeholder="e.g. 5060173862"
                    />
                  </div>

                  {/* P.O. Date */}
                  <div>
                    <label className="form-label">P.O. Date</label>
                    <input
                      type="date"
                      className="form-input"
                      value={extractedData.poDate || ''}
                      onChange={(e) => handleFieldChange('poDate', e.target.value)}
                    />
                  </div>

                  {/* Vendor Code */}
                  <div>
                    <label className="form-label">Vendor Code</label>
                    <input
                      type="text"
                      className="form-input"
                      value={extractedData.vendorCode || ''}
                      onChange={(e) => handleFieldChange('vendorCode', e.target.value)}
                    />
                  </div>

                  {/* SAC / HSN Code */}
                  <div>
                    <label className="form-label">SAC / HSN Code</label>
                    <input
                      type="text"
                      className="form-input"
                      value={extractedData.sacCode || ''}
                      onChange={(e) => handleFieldChange('sacCode', e.target.value)}
                    />
                  </div>

                  {/* Contract Number */}
                  <div>
                    <label className="form-label">Contract Number</label>
                    <input
                      type="text"
                      className="form-input"
                      value={extractedData.contractNo || ''}
                      onChange={(e) => handleFieldChange('contractNo', e.target.value)}
                    />
                  </div>

                  {/* Contract Period */}
                  <div>
                    <label className="form-label">CON. Period</label>
                    <input
                      type="text"
                      className="form-input"
                      value={extractedData.contractPeriod || ''}
                      onChange={(e) => handleFieldChange('contractPeriod', e.target.value)}
                    />
                  </div>

                  {/* B.G. No */}
                  <div style={{ gridColumn: 'span 2' }}>
                    <label className="form-label">B.G. No</label>
                    <input
                      type="text"
                      className="form-input"
                      value={extractedData.bgNo || ''}
                      onChange={(e) => handleFieldChange('bgNo', e.target.value)}
                    />
                  </div>

                  {/* Equipment / Scope Header */}
                  <div style={{ gridColumn: 'span 2' }}>
                    <label className="form-label">Equipment / Job Scope Header</label>
                    <input
                      type="text"
                      className="form-input"
                      value={extractedData.equipmentHeader || ''}
                      onChange={(e) => handleFieldChange('equipmentHeader', e.target.value)}
                      placeholder="e.g. OSL TIGER (KOK 022) / REPAIRING & FABRICATION CHARGES"
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: Line Items Table */}
              {activeTab === 'items' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div className="custom-table-container">
                    <table className="custom-table">
                      <thead>
                        <tr>
                          <th style={{ width: '40px', textAlign: 'center' }}>#</th>
                          <th style={{ width: '130px' }}>Item Code</th>
                          <th>Description</th>
                          <th style={{ width: '90px', textAlign: 'right' }}>Qty</th>
                          <th style={{ width: '80px', textAlign: 'center' }}>Unit</th>
                          <th style={{ width: '120px', textAlign: 'right' }}>Rate (₹)</th>
                          <th style={{ width: '130px', textAlign: 'right' }}>Amount (₹)</th>
                          <th style={{ width: '50px', textAlign: 'center' }}></th>
                        </tr>
                      </thead>
                      <tbody>
                        {extractedData.lineItems && extractedData.lineItems.length > 0 ? (
                          extractedData.lineItems.map((item, idx) => (
                            <tr key={idx}>
                              <td style={{ textAlign: 'center', color: 'var(--text-muted)' }}>{idx + 1}</td>
                              <td>
                                <input
                                  type="text"
                                  className="form-input"
                                  style={{ padding: '0.35rem 0.5rem', fontSize: '0.8rem' }}
                                  value={item.itemCode || ''}
                                  onChange={(e) => handleItemChange(idx, 'itemCode', e.target.value)}
                                />
                              </td>
                              <td>
                                <input
                                  type="text"
                                  className="form-input"
                                  style={{ padding: '0.35rem 0.5rem', fontSize: '0.8rem' }}
                                  value={item.description || ''}
                                  onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                                />
                              </td>
                              <td>
                                <input
                                  type="number"
                                  className="form-input"
                                  style={{ padding: '0.35rem 0.5rem', fontSize: '0.8rem', textAlign: 'right' }}
                                  value={item.quantity || 1}
                                  onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                                />
                              </td>
                              <td>
                                <input
                                  type="text"
                                  className="form-input"
                                  style={{ padding: '0.35rem 0.5rem', fontSize: '0.8rem', textAlign: 'center' }}
                                  value={item.unit || 'No'}
                                  onChange={(e) => handleItemChange(idx, 'unit', e.target.value)}
                                />
                              </td>
                              <td>
                                <input
                                  type="number"
                                  className="form-input"
                                  style={{ padding: '0.35rem 0.5rem', fontSize: '0.8rem', textAlign: 'right' }}
                                  value={item.rate || 0}
                                  onChange={(e) => handleItemChange(idx, 'rate', e.target.value)}
                                />
                              </td>
                              <td style={{ textAlign: 'right', fontWeight: 700, color: '#34d399' }}>
                                ₹{Number(item.amount || 0).toFixed(2)}
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveItem(idx)}
                                  className="btn btn-danger"
                                  style={{ padding: '0.35rem', borderRadius: '4px' }}
                                >
                                  <Trash2 size={13} />
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={8} style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}>
                              No line items extracted. Click "+ Add Line Item" below to add one.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="btn btn-outline"
                    style={{ alignSelf: 'flex-start', fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
                  >
                    <Plus size={14} />
                    <span>Add Line Item</span>
                  </button>
                </div>
              )}

              {/* TAB 3: Raw Text */}
              {activeTab === 'raw' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Raw extracted text and table content from the document:
                  </div>
                  <textarea
                    className="form-input"
                    rows={12}
                    style={{ fontFamily: 'monospace', fontSize: '0.8rem', whiteSpace: 'pre-wrap' }}
                    value={rawOcrText}
                    onChange={(e) => setRawOcrText(e.target.value)}
                  />
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '1.25rem 1.5rem',
          background: 'rgba(15, 23, 42, 0.95)',
          borderTop: '1px solid rgba(99, 102, 241, 0.25)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-outline"
            style={{ padding: '0.6rem 1.25rem', fontSize: '0.85rem' }}
          >
            Cancel
          </button>

          {extractedData && (
            <button
              type="button"
              onClick={handleApply}
              className="btn btn-primary animate-pulse"
              style={{
                padding: '0.65rem 1.75rem',
                fontSize: '0.9rem',
                fontWeight: 800,
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                borderColor: 'rgba(16, 185, 129, 0.4)',
                boxShadow: '0 4px 15px rgba(16, 185, 129, 0.35)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <Sparkles size={18} />
              <span>Apply All Details to Tax Invoice</span>
              <ArrowRight size={16} />
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
