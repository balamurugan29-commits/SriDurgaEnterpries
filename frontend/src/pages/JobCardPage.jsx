import React, { useState, useEffect, useRef } from 'react';
import { fetchJobCards, fetchNextJobNo, createJobCard, updateJobCard, deleteJobCard, fetchCustomers } from '../services/api';
import { JobCardPrintModal } from '../components/JobCardPrintModal';
import { Toast } from '../components/Toast';
import { Wrench, Plus, Save, Printer, Edit3, Trash2, Search, RefreshCw, FileText, ChevronRight, CheckCircle2, RotateCcw, Building2, Cpu, Activity, UserCheck, Image as ImageIcon, Camera, Upload, UploadCloud, Trash, Eye, Paperclip, Download, Maximize2, X, FileSpreadsheet, ExternalLink } from 'lucide-react';

const DynamicInputArray = ({ label, countValue, listString, onChangeCount, onChangeList, placeholder }) => {
  // Parse list from comma-separated string
  const list = listString ? listString.split(',') : [];
  const count = parseInt(countValue, 10) || 0;
  
  // Ensure list length matches count
  const items = Array.from({ length: count }, (_, i) => list[i] || '');

  const handleCountChange = (newVal) => {
    const newCount = Math.max(0, parseInt(newVal, 10) || 0);
    onChangeCount(newCount);
    
    // Resize list
    let newList = [...list];
    if (newList.length < newCount) {
      while (newList.length < newCount) newList.push('');
    } else if (newList.length > newCount) {
      newList = newList.slice(0, newCount);
    }
    onChangeList(newList.join(','));
  };

  const handleItemChange = (index, val) => {
    const newList = [...items];
    newList[index] = val; // strip commas to prevent parsing issues
    onChangeList(newList.join(','));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '0.5rem' }}>
      <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>{label}</span>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-subtle)', fontWeight: 'normal' }}>Count: {count}</span>
      </label>
      <input 
        type="number" 
        min="0"
        max="30"
        className="form-input" 
        placeholder="Count (e.g. 5)"
        style={{ marginBottom: '6px' }}
        value={countValue || ''}
        onChange={e => handleCountChange(e.target.value)} 
      />
      {count > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', background: 'rgba(255, 255, 255, 0.02)', padding: '6px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
          {items.map((val, idx) => (
            <input
              key={idx}
              type="text"
              className="form-input"
              placeholder={`#${idx + 1}`}
              style={{ width: '60px', padding: '4px 6px', fontSize: '0.75rem', textAlign: 'center', minWidth: '45px' }}
              value={val}
              onChange={e => handleItemChange(idx, e.target.value)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const JobCardPage = ({ editingJobCard, onCancelEdit }) => {
  const [masterCustomers, setMasterCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [selectedJobCardForPrint, setSelectedJobCardForPrint] = useState(null);
  const [toast, setToast] = useState({ message: '', type: 'success' });
  const [isDragging, setIsDragging] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);

  // Form State initialized with template fields
  const initialFormState = {
    jobNo: '',
    gPass: '',
    jobDate: new Date().toISOString().split('T')[0],
    customerName: '',
    site: '',
    make: '',
    equipment: '',
    slNo: '',
    deliveredOn: '',
    others: '',

    // 1. Rating
    ratingHp: '',
    ratingKw: '',
    ratingKva: '',

    // 2 & 3. Volt & Current
    volt: '',
    current: '',

    // 4. Frame Size & Type
    frameSize: '',
    type: '',

    // 5. Bearing DE & NDE
    bearingDe: '',
    bearingNde: '',

    // 6. Cooling Fan ID & OD
    coolingFanId: '',
    coolingFanOd: '',

    // 7. Fan Cover
    fanCoverCircumference: '',
    fanCoverHeight: '',
    fanCoverDia: '',

    // 8. Speed
    speed: '',

    // 9. Terminal Box (LEFT / RIGHT)
    terminalBox: 'RIGHT',

    // 10. Connection
    connection: '',

    // 11. Winding Details (Running Coil or Main Winding)
    pitch: '',
    turns: '',
    bobbin: '',
    coreLength: '',
    swg: '',
    coilWeight1Set: '',
    coilWeightTotal: '',
    setOfCoil: '',
    noOfSlots: '',
    totalNoCoil: '',
    jobCarried: '',

    // Running Coil Counts
    pitchCount: '',
    turnsCount: '',
    bobbinCount: '',

    // 11b. Starting Coil Winding Details (used when volt = 220)
    scPitch: '',
    scTurns: '',
    scBobbin: '',
    scCoreLength: '',
    scSwg: '',
    scCoilWeight1Set: '',
    scCoilWeightTotal: '',
    scSetOfCoil: '',
    scNoOfSlots: '',
    scTotalNoCoil: '',
    scJobCarried: '',

    // Starting Coil Counts
    scPitchCount: '',
    scTurnsCount: '',
    scBobbinCount: '',

    // 13. Test Details
    testWwResistance: '',
    testWbResistance: '',
    testNoLoadCurrent: '',
    testRpm: '',

    // Remarks & Signatures
    remarks: '',
    dismantledBy: '',
    coilDismantledBy: '',
    windingBy: '',
    assembledBy: '',
    testedBy: '',

    // 1. Diagram / Equipment Photo (Prints on Job Card)
    diagramPhoto: '',
    diagramPhotoName: '',
    diagramPhotoSize: '',
    attachmentName: '',
    attachmentType: '',

    // 2. Extra Document / PDF Attachment (Datasheets / Specs / Test Reports)
    extraAttachment: '',
    extraAttachmentName: '',
    extraAttachmentType: '',
    extraAttachmentSize: ''
  };

  const [formData, setFormData] = useState(initialFormState);
  const photoInputRef = useRef(null);
  const pdfInputRef = useRef(null);
  const [isPhotoDragging, setIsPhotoDragging] = useState(false);
  const [isPdfDragging, setIsPdfDragging] = useState(false);
  const [modalPreview, setModalPreview] = useState(null); // { url, name, type, title }

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [customersData, nextNo] = await Promise.all([
        fetchCustomers(),
        fetchNextJobNo()
      ]);
      setMasterCustomers(customersData || []);

      if (editingJobCard) {
        setEditingId(editingJobCard.id);
        setFormData({ ...editingJobCard });
      } else {
        setFormData(prev => ({ ...prev, jobNo: nextNo }));
      }
    } catch (err) {
      console.error('Failed to load Job Card initialization data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, [editingJobCard]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePreviewJobCard = () => {
    setSelectedJobCardForPrint({ ...formData });
    setPrintModalOpen(true);
  };

  // -------------------------------------------------------------
  // 1. DIAGRAM & EQUIPMENT PHOTO HANDLERS (Images)
  // -------------------------------------------------------------
  const processPhotoFile = (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/') && !/\.(png|jpe?g|webp|gif|bmp|svg)$/i.test(file.name)) {
      setToast({ message: 'Please select a valid image file (PNG, JPG, JPEG, WEBP) for the Diagram/Photo.', type: 'error' });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setToast({ message: 'Photo size exceeds 10MB limit. Please choose a smaller image.', type: 'error' });
      return;
    }

    const sizeStr = file.size > 1024 * 1024 
      ? (file.size / (1024 * 1024)).toFixed(2) + ' MB'
      : (file.size / 1024).toFixed(0) + ' KB';

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result;
      if (base64) {
        setFormData(prev => ({
          ...prev,
          diagramPhoto: base64,
          diagramPhotoName: file.name,
          diagramPhotoSize: sizeStr,
          attachmentName: file.name,
          attachmentType: 'image'
        }));
        setToast({ message: `Equipment Photo "${file.name}" attached successfully!`, type: 'success' });
      }
    };
    reader.readAsDataURL(file);
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) processPhotoFile(file);
  };

  const handlePhotoDrop = (e) => {
    e.preventDefault();
    setIsPhotoDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processPhotoFile(file);
  };

  const handleDownloadPhoto = () => {
    if (!formData.diagramPhoto) return;
    const link = document.createElement('a');
    link.href = formData.diagramPhoto;
    link.download = formData.diagramPhotoName || `${formData.jobNo ? formData.jobNo.replace(/\//g, '_') : 'JobCard'}_Photo.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRemovePhoto = () => {
    setFormData(prev => ({
      ...prev,
      diagramPhoto: '',
      diagramPhotoName: '',
      diagramPhotoSize: ''
    }));
    if (photoInputRef.current) photoInputRef.current.value = '';
    setToast({ message: 'Diagram / Photo removed', type: 'info' });
  };

  // -------------------------------------------------------------
  // 2. EXTRA PDF & DOCUMENT ATTACHMENT HANDLERS (PDF / Docs)
  // -------------------------------------------------------------
  const processPdfFile = (file) => {
    if (!file) return;

    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    const isDoc = /\.(doc|docx|xls|xlsx|txt|rtf)$/i.test(file.name);

    if (!isPdf && !isDoc && !file.type.startsWith('image/')) {
      setToast({ message: 'Please upload a PDF document or technical datasheet file.', type: 'error' });
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setToast({ message: 'File size exceeds 25MB limit. Please choose a smaller document.', type: 'error' });
      return;
    }

    const type = isPdf ? 'pdf' : file.type.startsWith('image/') ? 'image' : 'doc';
    const sizeStr = file.size > 1024 * 1024 
      ? (file.size / (1024 * 1024)).toFixed(2) + ' MB'
      : (file.size / 1024).toFixed(0) + ' KB';

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result;
      if (base64) {
        setFormData(prev => ({
          ...prev,
          extraAttachment: base64,
          extraAttachmentName: file.name,
          extraAttachmentType: type,
          extraAttachmentSize: sizeStr
        }));
        setToast({ message: `Extra Document "${file.name}" attached successfully!`, type: 'success' });
      }
    };
    reader.readAsDataURL(file);
  };

  const handlePdfUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) processPdfFile(file);
  };

  const handlePdfDrop = (e) => {
    e.preventDefault();
    setIsPdfDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processPdfFile(file);
  };

  const handleDownloadPdf = () => {
    if (!formData.extraAttachment) return;
    const link = document.createElement('a');
    link.href = formData.extraAttachment;
    link.download = formData.extraAttachmentName || `${formData.jobNo ? formData.jobNo.replace(/\//g, '_') : 'JobCard'}_Attachment.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRemovePdf = () => {
    setFormData(prev => ({
      ...prev,
      extraAttachment: '',
      extraAttachmentName: '',
      extraAttachmentType: '',
      extraAttachmentSize: ''
    }));
    if (pdfInputRef.current) pdfInputRef.current.value = '';
    setToast({ message: 'Extra PDF Document removed', type: 'info' });
  };

  const handleCustomerSelect = (name) => {
    handleInputChange('customerName', name);
    const matched = masterCustomers.find(c => c.customerName.toLowerCase().trim() === name.toLowerCase().trim());
    if (matched && matched.address) {
      if (!formData.site) {
        handleInputChange('site', matched.address.slice(0, 40));
      }
    }
  };

  const handleResetForm = async () => {
    setEditingId(null);
    if (onCancelEdit) onCancelEdit();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    try {
      const nextNo = await fetchNextJobNo();
      setFormData({ ...initialFormState, jobNo: nextNo });
    } catch (e) {
      setFormData(initialFormState);
    }
    setToast({ message: 'Cleared form. Ready for new Job Card entry.', type: 'info' });
  };

  const handleSave = async (shouldPrint = false) => {
    if (!formData.jobNo || !formData.jobNo.trim()) {
      setToast({ message: 'Job No is required', type: 'error' });
      return;
    }

    try {
      setSaving(true);
      let saved;
      if (editingId) {
        saved = await updateJobCard(editingId, formData);
        setToast({ message: `Job Card '${formData.jobNo}' updated successfully!`, type: 'success' });
      } else {
        saved = await createJobCard(formData);
        setToast({ message: `Job Card '${formData.jobNo}' created successfully!`, type: 'success' });
      }

      setSelectedJobCardForPrint(saved || formData);

      if (shouldPrint) {
        setPrintModalOpen(true);
      } else {
        handleResetForm();
      }
    } catch (err) {
      if (err.message && err.message.toLowerCase().includes('not found')) {
        setToast({ message: 'The Job Card you are editing was not found in the database. Switched to New Job Card mode.', type: 'error' });
        setEditingId(null);
        if (onCancelEdit) onCancelEdit();
      } else {
        setToast({ message: 'Save failed: ' + err.message, type: 'error' });
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />

      {/* Header Banner */}
      <div style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.18) 0%, rgba(16, 185, 129, 0.12) 100%)', border: '1px solid rgba(99, 102, 241, 0.3)', borderRadius: '16px', padding: '1.25rem 1.5rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
          <div style={{ background: 'rgba(99, 102, 241, 0.25)', padding: '0.75rem', borderRadius: '12px', color: '#818cf8' }}>
            <Wrench size={28} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
              <span style={{ fontWeight: 600 }}>Sri Durga Management</span>
              <ChevronRight size={12} />
              <span style={{ color: '#818cf8', fontWeight: 700 }}>
                {editingId ? 'Edit Job Card' : 'Create Job Card (Equipment Data)'}
              </span>
            </div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'white', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {editingId ? `Editing Job Card (${formData.jobNo})` : 'Job Card Management'}
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
              Create, manage, and print official Sri Durga Enterprises motor & equipment Job Cards.
            </p>
          </div>
        </div>

        {/* Top Right Action Button */}
        <div>
          <button 
            type="button"
            onClick={handleResetForm} 
            className="btn btn-primary"
            style={{ fontSize: '0.85rem' }}
          >
            <Plus size={15} />
            <span>New Job Card</span>
          </button>
        </div>
      </div>

      {/* JOB CARD DATA ENTRY FORM */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        
        {/* Section 1: General Job Information */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
            <FileText size={18} color="#818cf8" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white', margin: 0 }}>
              1. General Job & Customer Information
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            <div>
              <label className="form-label">Job No <span style={{ color: '#f87171' }}>*</span></label>
              <input 
                type="text" 
                className="form-input" 
                style={{ fontWeight: 700, color: '#fbbf24' }} 
                value={formData.jobNo} 
                onChange={e => handleInputChange('jobNo', e.target.value)} 
                required 
              />
            </div>

            <div>
              <label className="form-label">Gate Pass (G.Pass)</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="e.g. GP-8842" 
                value={formData.gPass} 
                onChange={e => handleInputChange('gPass', e.target.value)} 
              />
            </div>

            <div>
              <label className="form-label">Date</label>
              <input 
                type="date" 
                className="form-input" 
                value={formData.jobDate} 
                onChange={e => handleInputChange('jobDate', e.target.value)} 
              />
            </div>

            <div>
              <label className="form-label">Customer Name</label>
              <input 
                type="text" 
                list="jc-customer-list" 
                className="form-input" 
                placeholder="Select / Type Customer" 
                value={formData.customerName} 
                onChange={e => handleCustomerSelect(e.target.value)} 
              />
              <datalist id="jc-customer-list">
                {masterCustomers.map(c => <option key={c.id} value={c.customerName} />)}
              </datalist>
            </div>

            <div>
              <label className="form-label">Site / Plant</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="e.g. Karaikal Port" 
                value={formData.site} 
                onChange={e => handleInputChange('site', e.target.value)} 
              />
            </div>

            <div>
              <label className="form-label">Make</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="e.g. Kirloskar / ABB / Siemens" 
                value={formData.make} 
                onChange={e => handleInputChange('make', e.target.value)} 
              />
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Equipment</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="e.g. Induction Motor 50HP / Submersible Pump" 
                value={formData.equipment} 
                onChange={e => handleInputChange('equipment', e.target.value)} 
              />
            </div>

            <div>
              <label className="form-label">Sl.No.</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="e.g. SL-99482" 
                value={formData.slNo} 
                onChange={e => handleInputChange('slNo', e.target.value)} 
              />
            </div>

            <div>
              <label className="form-label">Delivered on</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="e.g. 2026-08-28" 
                value={formData.deliveredOn} 
                onChange={e => handleInputChange('deliveredOn', e.target.value)} 
              />
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Others</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Additional reference notes..." 
                value={formData.others} 
                onChange={e => handleInputChange('others', e.target.value)} 
              />
            </div>
          </div>
        </div>

        {/* Section 2: Equipment Specifications */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
            <Cpu size={18} color="#34d399" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white', margin: 0 }}>
              2. Equipment Details & Specifications
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            {/* Rating Fields */}
            <div>
              <label className="form-label">1. Rating (HP)</label>
              <input type="text" className="form-input" placeholder="e.g. 50 HP" value={formData.ratingHp} onChange={e => handleInputChange('ratingHp', e.target.value)} />
            </div>
            <div>
              <label className="form-label">Rating (KW)</label>
              <input type="text" className="form-input" placeholder="e.g. 37.5 KW" value={formData.ratingKw} onChange={e => handleInputChange('ratingKw', e.target.value)} />
            </div>
            <div>
              <label className="form-label">Rating (KVA)</label>
              <input type="text" className="form-input" placeholder="e.g. 45 KVA" value={formData.ratingKva} onChange={e => handleInputChange('ratingKva', e.target.value)} />
            </div>

            {/* Volt & Current */}
            <div>
              <label className="form-label">2. Volt</label>
              <select 
                className="form-select" 
                value={formData.volt} 
                onChange={e => handleInputChange('volt', e.target.value)}
              >
                <option value="">Select Volt</option>
                <option value="220">220</option>
                <option value="415">415</option>
              </select>
            </div>
            <div>
              <label className="form-label">3. Current</label>
              <input type="text" className="form-input" placeholder="e.g. 68 A" value={formData.current} onChange={e => handleInputChange('current', e.target.value)} />
            </div>

            {/* Frame Size & Type */}
            <div>
              <label className="form-label">4. Frame Size</label>
              <input type="text" className="form-input" placeholder="e.g. 225M" value={formData.frameSize} onChange={e => handleInputChange('frameSize', e.target.value)} />
            </div>
            <div>
              <label className="form-label">Type</label>
              <input type="text" className="form-input" placeholder="e.g. Squirrel Cage" value={formData.type} onChange={e => handleInputChange('type', e.target.value)} />
            </div>

            {/* Bearings */}
            <div>
              <label className="form-label">5. Bearing (DE)</label>
              <input type="text" className="form-input" placeholder="e.g. 6313 C3" value={formData.bearingDe} onChange={e => handleInputChange('bearingDe', e.target.value)} />
            </div>
            <div>
              <label className="form-label">Bearing (NDE)</label>
              <input type="text" className="form-input" placeholder="e.g. 6312 C3" value={formData.bearingNde} onChange={e => handleInputChange('bearingNde', e.target.value)} />
            </div>

            {/* Cooling Fan */}
            <div>
              <label className="form-label">6. Cooling Fan (ID)</label>
              <input type="text" className="form-input" placeholder="e.g. 65mm" value={formData.coolingFanId} onChange={e => handleInputChange('coolingFanId', e.target.value)} />
            </div>
            <div>
              <label className="form-label">Cooling Fan (OD)</label>
              <input type="text" className="form-input" placeholder="e.g. 320mm" value={formData.coolingFanOd} onChange={e => handleInputChange('coolingFanOd', e.target.value)} />
            </div>

            {/* Fan Cover */}
            <div>
              <label className="form-label">7. Fan Cover (Circumference)</label>
              <input type="text" className="form-input" placeholder="e.g. 1100mm" value={formData.fanCoverCircumference} onChange={e => handleInputChange('fanCoverCircumference', e.target.value)} />
            </div>
            <div>
              <label className="form-label">Fan Cover (Height)</label>
              <input type="text" className="form-input" placeholder="e.g. 180mm" value={formData.fanCoverHeight} onChange={e => handleInputChange('fanCoverHeight', e.target.value)} />
            </div>
            <div>
              <label className="form-label">Fan Cover (Dia)</label>
              <input type="text" className="form-input" placeholder="e.g. 350mm" value={formData.fanCoverDia} onChange={e => handleInputChange('fanCoverDia', e.target.value)} />
            </div>

            {/* Speed & Terminal Box */}
            <div>
              <label className="form-label">8. Speed (RPM)</label>
              <input type="text" className="form-input" placeholder="e.g. 1480 RPM" value={formData.speed} onChange={e => handleInputChange('speed', e.target.value)} />
            </div>

            <div>
              <label className="form-label">9. Terminal Box (Drive End View)</label>
              <select className="form-select" value={formData.terminalBox} onChange={e => handleInputChange('terminalBox', e.target.value)}>
                <option value="RIGHT">RIGHT</option>
                <option value="LEFT">LEFT</option>
              </select>
            </div>

            <div>
              <label className="form-label">10. Connection</label>
              <input type="text" className="form-input" placeholder="e.g. DELTA / STAR" value={formData.connection} onChange={e => handleInputChange('connection', e.target.value)} />
            </div>
          </div>
        </div>

        {/* Section 3: Winding Details */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
            <Wrench size={18} color="#fbbf24" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white', margin: 0 }}>
              3. Winding Detail & Job Carried
            </h3>
          </div>

          {formData.volt === '220' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {/* Running Coil Winding Details */}
              <div style={{ border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '1.25rem', background: 'rgba(255,255,255,0.01)' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fbbf24', marginBottom: '1rem', borderBottom: '1px dashed rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
                  A. Running Coil Winding Details
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                  <DynamicInputArray 
                    label="Pitch" 
                    countValue={formData.pitchCount} 
                    listString={formData.pitch} 
                    onChangeCount={val => handleInputChange('pitchCount', val)}
                    onChangeList={val => handleInputChange('pitch', val)}
                  />
                  <DynamicInputArray 
                    label="Turns" 
                    countValue={formData.turnsCount} 
                    listString={formData.turns} 
                    onChangeCount={val => handleInputChange('turnsCount', val)}
                    onChangeList={val => handleInputChange('turns', val)}
                  />
                  <DynamicInputArray 
                    label="Bobbin" 
                    countValue={formData.bobbinCount} 
                    listString={formData.bobbin} 
                    onChangeCount={val => handleInputChange('bobbinCount', val)}
                    onChangeList={val => handleInputChange('bobbin', val)}
                  />
                  <div>
                    <label className="form-label">Core Length</label>
                    <input type="text" className="form-input" placeholder="e.g. 240mm" value={formData.coreLength} onChange={e => handleInputChange('coreLength', e.target.value)} />
                  </div>
                  <div>
                    <label className="form-label">SWG</label>
                    <input type="text" className="form-input" placeholder="e.g. 17 SWG" value={formData.swg} onChange={e => handleInputChange('swg', e.target.value)} />
                  </div>
                  <div>
                    <label className="form-label">Coil Weight (1 Set)</label>
                    <input type="text" className="form-input" placeholder="e.g. 2.4 Kg" value={formData.coilWeight1Set} onChange={e => handleInputChange('coilWeight1Set', e.target.value)} />
                  </div>
                  <div>
                    <label className="form-label">Total Weight</label>
                    <input type="text" className="form-input" placeholder="e.g. 14.4 Kg" value={formData.coilWeightTotal} onChange={e => handleInputChange('coilWeightTotal', e.target.value)} />
                  </div>
                  <div>
                    <label className="form-label">Set of Coil</label>
                    <input type="text" className="form-input" placeholder="e.g. 6 Sets" value={formData.setOfCoil} onChange={e => handleInputChange('setOfCoil', e.target.value)} />
                  </div>
                  <div>
                    <label className="form-label">No. of Slots</label>
                    <input type="text" className="form-input" placeholder="e.g. 48" value={formData.noOfSlots} onChange={e => handleInputChange('noOfSlots', e.target.value)} />
                  </div>
                  <div>
                    <label className="form-label">Total No. Coil</label>
                    <input type="text" className="form-input" placeholder="e.g. 24" value={formData.totalNoCoil} onChange={e => handleInputChange('totalNoCoil', e.target.value)} />
                  </div>
                </div>

                <div>
                  <label className="form-label">Job Carried (Running Coil)</label>
                  <textarea 
                    className="form-input" 
                    rows={2} 
                    placeholder="Running coil specific tasks..." 
                    value={formData.jobCarried} 
                    onChange={e => handleInputChange('jobCarried', e.target.value)} 
                  />
                </div>
              </div>

              {/* Starting Coil Winding Details */}
              <div style={{ border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '1.25rem', background: 'rgba(255,255,255,0.01)' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#38bdf8', marginBottom: '1rem', borderBottom: '1px dashed rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
                  B. Starting Coil Winding Details
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                  <DynamicInputArray 
                    label="Pitch" 
                    countValue={formData.scPitchCount} 
                    listString={formData.scPitch} 
                    onChangeCount={val => handleInputChange('scPitchCount', val)}
                    onChangeList={val => handleInputChange('scPitch', val)}
                  />
                  <DynamicInputArray 
                    label="Turns" 
                    countValue={formData.scTurnsCount} 
                    listString={formData.scTurns} 
                    onChangeCount={val => handleInputChange('scTurnsCount', val)}
                    onChangeList={val => handleInputChange('scTurns', val)}
                  />
                  <DynamicInputArray 
                    label="Bobbin" 
                    countValue={formData.scBobbinCount} 
                    listString={formData.scBobbin} 
                    onChangeCount={val => handleInputChange('scBobbinCount', val)}
                    onChangeList={val => handleInputChange('scBobbin', val)}
                  />
                  <div>
                    <label className="form-label">Core Length</label>
                    <input type="text" className="form-input" placeholder="e.g. 240mm" value={formData.scCoreLength} onChange={e => handleInputChange('scCoreLength', e.target.value)} />
                  </div>
                  <div>
                    <label className="form-label">SWG</label>
                    <input type="text" className="form-input" placeholder="e.g. 19 SWG" value={formData.scSwg} onChange={e => handleInputChange('scSwg', e.target.value)} />
                  </div>
                  <div>
                    <label className="form-label">Coil Weight (1 Set)</label>
                    <input type="text" className="form-input" placeholder="e.g. 1.8 Kg" value={formData.scCoilWeight1Set} onChange={e => handleInputChange('scCoilWeight1Set', e.target.value)} />
                  </div>
                  <div>
                    <label className="form-label">Total Weight</label>
                    <input type="text" className="form-input" placeholder="e.g. 10.8 Kg" value={formData.scCoilWeightTotal} onChange={e => handleInputChange('scCoilWeightTotal', e.target.value)} />
                  </div>
                  <div>
                    <label className="form-label">Set of Coil</label>
                    <input type="text" className="form-input" placeholder="e.g. 6 Sets" value={formData.scSetOfCoil} onChange={e => handleInputChange('scSetOfCoil', e.target.value)} />
                  </div>
                  <div>
                    <label className="form-label">No. of Slots</label>
                    <input type="text" className="form-input" placeholder="e.g. 48" value={formData.scNoOfSlots} onChange={e => handleInputChange('scNoOfSlots', e.target.value)} />
                  </div>
                  <div>
                    <label className="form-label">Total No. Coil</label>
                    <input type="text" className="form-input" placeholder="e.g. 24" value={formData.scTotalNoCoil} onChange={e => handleInputChange('scTotalNoCoil', e.target.value)} />
                  </div>
                </div>

                <div>
                  <label className="form-label">Job Carried (Starting Coil)</label>
                  <textarea 
                    className="form-input" 
                    rows={2} 
                    placeholder="Starting coil specific tasks..." 
                    value={formData.scJobCarried} 
                    onChange={e => handleInputChange('scJobCarried', e.target.value)} 
                  />
                </div>
              </div>
            </div>
          ) : (
            <div>
              {/* Single / Standard Main Winding Details */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                <DynamicInputArray 
                  label="Pitch" 
                  countValue={formData.pitchCount} 
                  listString={formData.pitch} 
                  onChangeCount={val => handleInputChange('pitchCount', val)}
                  onChangeList={val => handleInputChange('pitch', val)}
                />
                <DynamicInputArray 
                  label="Turns" 
                  countValue={formData.turnsCount} 
                  listString={formData.turns} 
                  onChangeCount={val => handleInputChange('turnsCount', val)}
                  onChangeList={val => handleInputChange('turns', val)}
                />
                <DynamicInputArray 
                  label="Bobbin" 
                  countValue={formData.bobbinCount} 
                  listString={formData.bobbin} 
                  onChangeCount={val => handleInputChange('bobbinCount', val)}
                  onChangeList={val => handleInputChange('bobbin', val)}
                />
                <div>
                  <label className="form-label">Core Length</label>
                  <input type="text" className="form-input" placeholder="e.g. 240mm" value={formData.coreLength} onChange={e => handleInputChange('coreLength', e.target.value)} />
                </div>
                <div>
                  <label className="form-label">SWG</label>
                  <input type="text" className="form-input" placeholder="e.g. 17 SWG" value={formData.swg} onChange={e => handleInputChange('swg', e.target.value)} />
                </div>
                <div>
                  <label className="form-label">Coil Weight (1 Set)</label>
                  <input type="text" className="form-input" placeholder="e.g. 2.4 Kg" value={formData.coilWeight1Set} onChange={e => handleInputChange('coilWeight1Set', e.target.value)} />
                </div>
                <div>
                  <label className="form-label">Total Weight</label>
                  <input type="text" className="form-input" placeholder="e.g. 14.4 Kg" value={formData.coilWeightTotal} onChange={e => handleInputChange('coilWeightTotal', e.target.value)} />
                </div>
                <div>
                  <label className="form-label">Set of Coil</label>
                  <input type="text" className="form-input" placeholder="e.g. 6 Sets" value={formData.setOfCoil} onChange={e => handleInputChange('setOfCoil', e.target.value)} />
                </div>
                <div>
                  <label className="form-label">No. of Slots</label>
                  <input type="text" className="form-input" placeholder="e.g. 48" value={formData.noOfSlots} onChange={e => handleInputChange('noOfSlots', e.target.value)} />
                </div>
                <div>
                  <label className="form-label">Total No. Coil</label>
                  <input type="text" className="form-input" placeholder="e.g. 24" value={formData.totalNoCoil} onChange={e => handleInputChange('totalNoCoil', e.target.value)} />
                </div>
              </div>

              <div>
                <label className="form-label">12. Job Carried</label>
                <textarea 
                  className="form-input" 
                  rows={2} 
                  placeholder="Scope of work and tasks executed..." 
                  value={formData.jobCarried} 
                  onChange={e => handleInputChange('jobCarried', e.target.value)} 
                />
              </div>
            </div>
          )}
        </div>

        {/* Section 4: Diagram Photo & Extra PDF Attachment */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Paperclip size={18} color="#818cf8" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white', margin: 0 }}>
                4. Diagram Photo & Extra Attachments (PDF / Documents)
              </h3>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              {formData.diagramPhoto && (
                <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(16, 185, 129, 0.15)', padding: '0.25rem 0.75rem', borderRadius: '9999px', border: '1px solid rgba(16, 185, 129, 0.35)' }}>
                  <ImageIcon size={13} /> Photo / Diagram Attached
                </span>
              )}
              {formData.extraAttachment && (
                <span style={{ fontSize: '0.75rem', color: '#f43f5e', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(244, 63, 94, 0.15)', padding: '0.25rem 0.75rem', borderRadius: '9999px', border: '1px solid rgba(244, 63, 94, 0.35)' }}>
                  <FileText size={13} /> Extra PDF Attached
                </span>
              )}
            </div>
          </div>

          {/* Hidden File Pickers */}
          <input 
            type="file" 
            ref={photoInputRef} 
            accept="image/*" 
            style={{ display: 'none' }} 
            onChange={handlePhotoUpload} 
          />
          <input 
            type="file" 
            ref={pdfInputRef} 
            accept=".pdf,application/pdf,.doc,.docx,.xls,.xlsx" 
            style={{ display: 'none' }} 
            onChange={handlePdfUpload} 
          />

          {/* Dual Attachment Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem', alignItems: 'stretch' }}>
            
            {/* 4A. DIAGRAM & EQUIPMENT PHOTO */}
            <div style={{ border: '1.5px solid rgba(16, 185, 129, 0.3)', borderRadius: '14px', padding: '1.25rem', background: 'rgba(16, 185, 129, 0.02)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px dashed rgba(16, 185, 129, 0.25)', paddingBottom: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ImageIcon size={16} color="#10b981" />
                  <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#34d399' }}>
                    4A. Diagram & Equipment Photo
                  </span>
                </div>
                <span style={{ fontSize: '0.675rem', color: '#94a3b8', background: 'rgba(255,255,255,0.06)', padding: '2px 8px', borderRadius: '4px' }}>
                  Prints on Job Card
                </span>
              </div>

              {!formData.diagramPhoto ? (
                <div 
                  onClick={() => photoInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setIsPhotoDragging(true); }}
                  onDragLeave={(e) => { e.preventDefault(); setIsPhotoDragging(false); }}
                  onDrop={handlePhotoDrop}
                  style={{
                    border: isPhotoDragging ? '2px dashed #10b981' : '1.5px dashed rgba(16, 185, 129, 0.4)',
                    borderRadius: '12px',
                    padding: '2rem 1.25rem',
                    textAlign: 'center',
                    background: isPhotoDragging ? 'rgba(16, 185, 129, 0.12)' : 'rgba(16, 185, 129, 0.03)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.75rem',
                    minHeight: '200px'
                  }}
                >
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
                    <Camera size={24} />
                  </div>
                  <div>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem', color: '#f8fafc' }}>
                      Upload Diagram / Equipment Photo
                    </p>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Winding diagrams or motor nameplates (PNG, JPG, WEBP up to 10MB)
                    </p>
                  </div>
                  <button 
                    type="button" 
                    className="btn btn-outline" 
                    style={{ borderColor: 'rgba(16, 185, 129, 0.5)', color: '#10b981', fontSize: '0.75rem', padding: '0.35rem 0.85rem' }}
                    onClick={(e) => { e.stopPropagation(); photoInputRef.current?.click(); }}
                  >
                    <Camera size={13} />
                    <span>Browse Photo</span>
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                  <div 
                    onClick={() => setModalPreview({
                      url: formData.diagramPhoto,
                      name: formData.diagramPhotoName || 'Equipment_Photo.png',
                      type: 'image',
                      title: 'Equipment Photo & Winding Diagram'
                    })}
                    style={{
                      position: 'relative',
                      borderRadius: '10px',
                      overflow: 'hidden',
                      border: '1.5px solid rgba(16, 185, 129, 0.4)',
                      background: '#0f172a',
                      maxHeight: '220px',
                      cursor: 'pointer',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
                    }}
                    title="Click to view fullscreen"
                  >
                    <img 
                      src={formData.diagramPhoto} 
                      alt="Diagram / Equipment" 
                      style={{ width: '100%', height: '180px', objectFit: 'contain', display: 'block' }}
                    />
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)', padding: '6px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#f8fafc', fontSize: '0.725rem' }}>
                      <span style={{ fontWeight: 600, maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {formData.diagramPhotoName || 'Equipment Photo'}
                      </span>
                      <span style={{ color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '2px', fontSize: '0.675rem' }}>
                        <Maximize2 size={11} /> View
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button 
                      type="button" 
                      onClick={() => setModalPreview({
                        url: formData.diagramPhoto,
                        name: formData.diagramPhotoName || 'Equipment_Photo.png',
                        type: 'image',
                        title: 'Equipment Photo & Winding Diagram'
                      })}
                      className="btn btn-outline" 
                      style={{ flex: 1, fontSize: '0.75rem', padding: '0.4rem 0.6rem', color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.4)' }}
                    >
                      <Eye size={13} /> <span>View</span>
                    </button>

                    <button 
                      type="button" 
                      onClick={handleDownloadPhoto}
                      className="btn btn-outline" 
                      style={{ flex: 1, fontSize: '0.75rem', padding: '0.4rem 0.6rem', color: '#34d399', borderColor: 'rgba(52, 211, 153, 0.4)' }}
                    >
                      <Download size={13} /> <span>Download</span>
                    </button>

                    <button 
                      type="button" 
                      onClick={() => photoInputRef.current?.click()}
                      className="btn btn-outline" 
                      style={{ flex: 1, fontSize: '0.75rem', padding: '0.4rem 0.6rem' }}
                    >
                      <Upload size={13} /> <span>Replace</span>
                    </button>

                    <button 
                      type="button" 
                      onClick={handleRemovePhoto}
                      className="btn btn-outline" 
                      style={{ fontSize: '0.75rem', padding: '0.4rem 0.6rem', borderColor: 'rgba(239, 68, 68, 0.4)', color: '#f87171' }}
                    >
                      <Trash size={13} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 4B. EXTRA PDF & DOCUMENT ATTACHMENT */}
            <div style={{ border: '1.5px solid rgba(244, 63, 94, 0.3)', borderRadius: '14px', padding: '1.25rem', background: 'rgba(244, 63, 94, 0.02)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px dashed rgba(244, 63, 94, 0.25)', paddingBottom: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FileText size={16} color="#f43f5e" />
                  <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#f43f5e' }}>
                    4B. Extra PDF & Document Attachment
                  </span>
                </div>
                <span style={{ fontSize: '0.675rem', color: '#f43f5e', background: 'rgba(244,63,94,0.12)', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                  PDF / Datasheet / Report
                </span>
              </div>

              {!formData.extraAttachment ? (
                <div 
                  onClick={() => pdfInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setIsPdfDragging(true); }}
                  onDragLeave={(e) => { e.preventDefault(); setIsPdfDragging(false); }}
                  onDrop={handlePdfDrop}
                  style={{
                    border: isPdfDragging ? '2px dashed #f43f5e' : '1.5px dashed rgba(244, 63, 94, 0.4)',
                    borderRadius: '12px',
                    padding: '2rem 1.25rem',
                    textAlign: 'center',
                    background: isPdfDragging ? 'rgba(244, 63, 94, 0.12)' : 'rgba(244, 63, 94, 0.03)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.75rem',
                    minHeight: '200px'
                  }}
                >
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(244, 63, 94, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f43f5e' }}>
                    <FileText size={24} />
                  </div>
                  <div>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem', color: '#f8fafc' }}>
                      Upload Extra PDF / Datasheet
                    </p>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Technical specs, customer PO, test sheets (PDF up to 25MB)
                    </p>
                  </div>
                  <button 
                    type="button" 
                    className="btn btn-outline" 
                    style={{ borderColor: 'rgba(244, 63, 94, 0.5)', color: '#f43f5e', fontSize: '0.75rem', padding: '0.35rem 0.85rem' }}
                    onClick={(e) => { e.stopPropagation(); pdfInputRef.current?.click(); }}
                  >
                    <UploadCloud size={13} />
                    <span>Browse PDF File</span>
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                  <div 
                    onClick={() => setModalPreview({
                      url: formData.extraAttachment,
                      name: formData.extraAttachmentName || 'JobCard_Document.pdf',
                      type: formData.extraAttachmentType || 'pdf',
                      title: 'Extra Document / Technical Attachment'
                    })}
                    style={{
                      padding: '1rem',
                      borderRadius: '10px',
                      background: 'rgba(244, 63, 94, 0.08)',
                      border: '1.5px solid rgba(244, 63, 94, 0.35)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.875rem',
                      cursor: 'pointer'
                    }}
                    title="Click to open interactive PDF reader"
                  >
                    <div style={{ width: '42px', height: '42px', borderRadius: '8px', background: '#fee2e2', border: '1px solid #ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#b91c1c', fontSize: '12px', flexShrink: 0 }}>
                      PDF
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#f8fafc', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {formData.extraAttachmentName || 'JobCard_Attachment.pdf'}
                      </div>
                      <div style={{ fontSize: '0.725rem', color: '#cbd5e1' }}>
                        {formData.extraAttachmentSize ? `${formData.extraAttachmentSize} • ` : ''}Ready & Attached
                      </div>
                    </div>
                    <button 
                      type="button" 
                      className="btn btn-outline" 
                      style={{ padding: '4px 8px', fontSize: '0.7rem', color: '#38bdf8' }}
                    >
                      <Maximize2 size={12} /> Open
                    </button>
                  </div>

                  {/* Inline PDF Preview Frame */}
                  {formData.extraAttachment.startsWith('data:application/pdf') && (
                    <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(244,63,94,0.25)', height: '140px', background: '#fff' }}>
                      <iframe 
                        src={formData.extraAttachment} 
                        title="PDF Quick Preview" 
                        style={{ width: '100%', height: '100%', border: 'none' }}
                      />
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button 
                      type="button" 
                      onClick={() => setModalPreview({
                        url: formData.extraAttachment,
                        name: formData.extraAttachmentName || 'JobCard_Document.pdf',
                        type: formData.extraAttachmentType || 'pdf',
                        title: 'Extra Document / Technical Attachment'
                      })}
                      className="btn btn-outline" 
                      style={{ flex: 1, fontSize: '0.75rem', padding: '0.4rem 0.6rem', color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.4)' }}
                    >
                      <Eye size={13} /> <span>Open Reader</span>
                    </button>

                    <button 
                      type="button" 
                      onClick={handleDownloadPdf}
                      className="btn btn-outline" 
                      style={{ flex: 1, fontSize: '0.75rem', padding: '0.4rem 0.6rem', color: '#34d399', borderColor: 'rgba(52, 211, 153, 0.4)' }}
                    >
                      <Download size={13} /> <span>Download</span>
                    </button>

                    <button 
                      type="button" 
                      onClick={() => pdfInputRef.current?.click()}
                      className="btn btn-outline" 
                      style={{ flex: 1, fontSize: '0.75rem', padding: '0.4rem 0.6rem' }}
                    >
                      <Upload size={13} /> <span>Replace</span>
                    </button>

                    <button 
                      type="button" 
                      onClick={handleRemovePdf}
                      className="btn btn-outline" 
                      style={{ fontSize: '0.75rem', padding: '0.4rem 0.6rem', borderColor: 'rgba(239, 68, 68, 0.4)', color: '#f87171' }}
                    >
                      <Trash size={13} />
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Section 5: Test Details & Remarks */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
            <Activity size={18} color="#38bdf8" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white', margin: 0 }}>
              5. Test Details & Remarks
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div>
              <label className="form-label">(i) W-W Resistance</label>
              <input type="text" className="form-input" placeholder="e.g. 0.42 Ohms" value={formData.testWwResistance} onChange={e => handleInputChange('testWwResistance', e.target.value)} />
            </div>
            <div>
              <label className="form-label">(ii) W-B Resistance</label>
              <input type="text" className="form-input" placeholder="e.g. > 100 M-Ohms" value={formData.testWbResistance} onChange={e => handleInputChange('testWbResistance', e.target.value)} />
            </div>
            <div>
              <label className="form-label">(iii) No Load Current</label>
              <input type="text" className="form-input" placeholder="e.g. 18.5 A" value={formData.testNoLoadCurrent} onChange={e => handleInputChange('testNoLoadCurrent', e.target.value)} />
            </div>
            <div>
              <label className="form-label">(iv) RPM</label>
              <input type="text" className="form-input" placeholder="e.g. 1492 RPM" value={formData.testRpm} onChange={e => handleInputChange('testRpm', e.target.value)} />
            </div>
          </div>

          <div>
            <label className="form-label">Remarks</label>
            <textarea 
              className="form-input" 
              rows={2} 
              placeholder="Final remarks or observations..." 
              value={formData.remarks} 
              onChange={e => handleInputChange('remarks', e.target.value)} 
            />
          </div>
        </div>

        {/* Section 6: Personnel Sign-off */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
            <UserCheck size={18} color="#a855f7" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white', margin: 0 }}>
              6. Personnel Responsible
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
            <div>
              <label className="form-label">Dismantled by</label>
              <input type="text" className="form-input" placeholder="e.g. R. Kumar" value={formData.dismantledBy} onChange={e => handleInputChange('dismantledBy', e.target.value)} />
            </div>
            <div>
              <label className="form-label">Coil Dismantled by</label>
              <input type="text" className="form-input" placeholder="e.g. S. Murugan" value={formData.coilDismantledBy} onChange={e => handleInputChange('coilDismantledBy', e.target.value)} />
            </div>
            <div>
              <label className="form-label">Winding by</label>
              <input type="text" className="form-input" placeholder="e.g. M. Ramesh" value={formData.windingBy} onChange={e => handleInputChange('windingBy', e.target.value)} />
            </div>
            <div>
              <label className="form-label">Assembled by</label>
              <input type="text" className="form-input" placeholder="e.g. K. Balan" value={formData.assembledBy} onChange={e => handleInputChange('assembledBy', e.target.value)} />
            </div>
            <div>
              <label className="form-label">Tested by</label>
              <input type="text" className="form-input" placeholder="e.g. A. Engineer" value={formData.testedBy} onChange={e => handleInputChange('testedBy', e.target.value)} />
            </div>
          </div>
        </div>

        {/* Action Buttons Bar */}
        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <button 
            type="button" 
            onClick={handleResetForm} 
            className="btn btn-outline"
            style={{ color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.4)' }}
          >
            <RotateCcw size={16} />
            <span>Clear / New Job Card</span>
          </button>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button 
              type="button" 
              onClick={handlePreviewJobCard} 
              className="btn btn-outline"
              style={{ padding: '0.75rem 1.5rem', fontWeight: 700, color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.4)' }}
            >
              <Eye size={18} />
              <span>Preview Job Card</span>
            </button>

            <button 
              type="button" 
              disabled={saving} 
              onClick={() => handleSave(false)} 
              className="btn btn-primary"
              style={{ padding: '0.75rem 1.5rem', fontWeight: 700 }}
            >
              <Save size={18} />
              <span>{saving ? 'Saving...' : editingId ? 'Update Job Card' : 'Save Job Card'}</span>
            </button>

            <button 
              type="button" 
              disabled={saving} 
              onClick={() => handleSave(true)} 
              className="btn btn-secondary"
              style={{ padding: '0.75rem 1.5rem', fontWeight: 700 }}
            >
              <Printer size={18} />
              <span>Save & Print Job Card (PDF)</span>
            </button>
          </div>
        </div>

      </div>

      {/* 1:1 Print / PDF Preview Modal */}
      <JobCardPrintModal 
        isOpen={printModalOpen} 
        onClose={() => setPrintModalOpen(false)} 
        jobCard={selectedJobCardForPrint} 
      />

      {/* Unified Fullscreen Attachment / PDF Reader Modal */}
      {modalPreview && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999999,
            background: 'rgba(15, 23, 42, 0.88)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
            animation: 'fadeIn 0.2s ease-out'
          }}
          onClick={() => setModalPreview(null)}
        >
          <div 
            style={{
              background: 'var(--bg-card, #0f172a)',
              border: '1.5px solid var(--border-color-accent, rgba(99, 102, 241, 0.4))',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '960px',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
              overflow: 'hidden'
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1rem 1.5rem',
              borderBottom: '1px solid var(--border-color)',
              background: 'rgba(15, 23, 42, 0.6)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: (modalPreview.type === 'pdf' || modalPreview.url.startsWith('data:application/pdf')) ? 'rgba(244, 63, 94, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: (modalPreview.type === 'pdf' || modalPreview.url.startsWith('data:application/pdf')) ? '#f43f5e' : '#10b981'
                }}>
                  {(modalPreview.type === 'pdf' || modalPreview.url.startsWith('data:application/pdf')) ? <FileText size={20} /> : <ImageIcon size={20} />}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#f8fafc' }}>
                    {modalPreview.name}
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Job Card: <strong style={{ color: '#818cf8' }}>{formData.jobNo || 'Draft'}</strong> &bull; {modalPreview.title}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = modalPreview.url;
                    link.download = modalPreview.name;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  className="btn btn-outline"
                  style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem', color: '#34d399', borderColor: 'rgba(52, 211, 153, 0.4)' }}
                >
                  <Download size={14} /> Download
                </button>
                <button
                  type="button"
                  onClick={() => setModalPreview(null)}
                  className="btn btn-outline"
                  style={{ width: '36px', height: '36px', borderRadius: '50%', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  title="Close (Esc)"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', background: '#020617', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '480px' }}>
              {(modalPreview.type === 'pdf' || modalPreview.url.startsWith('data:application/pdf')) ? (
                <iframe 
                  src={modalPreview.url} 
                  title="PDF Attachment Reader" 
                  style={{ width: '100%', height: '70vh', border: 'none', borderRadius: '8px', background: '#fff' }}
                />
              ) : (
                <img 
                  src={modalPreview.url} 
                  alt="Attachment Fullscreen" 
                  style={{ maxWidth: '100%', maxHeight: '72vh', objectFit: 'contain', borderRadius: '8px', boxShadow: '0 8px 30px rgba(0,0,0,0.5)' }} 
                />
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
