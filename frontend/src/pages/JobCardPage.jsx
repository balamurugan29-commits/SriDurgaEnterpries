import React, { useState, useEffect, useRef } from 'react';
import { fetchJobCards, fetchNextJobNo, createJobCard, updateJobCard, deleteJobCard, fetchCustomers } from '../services/api';
import { JobCardPrintModal } from '../components/JobCardPrintModal';
import { Toast } from '../components/Toast';
import { Wrench, Plus, Save, Printer, Edit3, Trash2, Search, RefreshCw, FileText, ChevronRight, CheckCircle2, RotateCcw, Building2, Cpu, Activity, UserCheck, Image as ImageIcon, Camera, Upload, UploadCloud, Trash, Eye } from 'lucide-react';

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
    newList[index] = val.replace(/,/g, ''); // strip commas to prevent parsing issues
    onChangeList(newList.join(','));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '0.5rem' }}>
      <label className="form-label">{label} (Count)</label>
      <input 
        type="number" 
        min="0"
        className="form-input" 
        placeholder={`e.g. 5`}
        value={countValue || ''}
        onChange={e => handleCountChange(e.target.value)} 
      />
      {count > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginTop: '0.2rem', padding: '0.4rem', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', border: '1px dashed rgba(255,255,255,0.1)' }}>
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

    // Photo / Diagram Upload
    diagramPhoto: ''
  };

  const [formData, setFormData] = useState(initialFormState);
  const fileInputRef = useRef(null);

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

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setToast({ message: 'Please select a valid image file (PNG, JPG, JPEG, WEBP)', type: 'error' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setToast({ message: 'Image size exceeds 5MB limit. Please choose a smaller image.', type: 'error' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result;
      if (base64) {
        handleInputChange('diagramPhoto', base64);
        setToast({ message: 'Diagram / Photo uploaded successfully!', type: 'success' });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    handleInputChange('diagramPhoto', '');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setToast({ message: 'Diagram / Photo removed', type: 'info' });
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

        {/* Section 4: Diagram & Equipment Photo Upload */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ImageIcon size={18} color="#10b981" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white', margin: 0 }}>
                4. Diagram & Equipment Photo Upload
              </h3>
            </div>
            {formData.diagramPhoto && (
              <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <CheckCircle2 size={14} /> Photo Attached & Ready
              </span>
            )}
          </div>

          <input 
            type="file" 
            ref={fileInputRef} 
            accept="image/*" 
            style={{ display: 'none' }} 
            onChange={handlePhotoUpload} 
          />

          {!formData.diagramPhoto ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: '2px dashed rgba(16, 185, 129, 0.4)',
                borderRadius: '12px',
                padding: '2rem 1.5rem',
                textAlign: 'center',
                background: 'rgba(16, 185, 129, 0.03)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#10b981';
                e.currentTarget.style.background = 'rgba(16, 185, 129, 0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.4)';
                e.currentTarget.style.background = 'rgba(16, 185, 129, 0.03)';
              }}
            >
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
                <UploadCloud size={28} />
              </div>
              <div>
                <p style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem', color: '#f8fafc' }}>
                  Click to Upload Diagram or Equipment Photo
                </p>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Attach winding diagrams, motor nameplate, or equipment photos (PNG, JPG, JPEG, WEBP up to 5MB)
                </p>
              </div>
              <button 
                type="button" 
                className="btn btn-outline" 
                style={{ borderColor: 'rgba(16, 185, 129, 0.5)', color: '#10b981', fontSize: '0.8rem', padding: '0.4rem 1rem' }}
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
              >
                <Camera size={15} />
                <span>Browse File...</span>
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'flex-start' }}>
                {/* Photo Preview Container */}
                <div style={{ 
                  position: 'relative', 
                  borderRadius: '12px', 
                  overflow: 'hidden', 
                  border: '1.5px solid rgba(16, 185, 129, 0.4)', 
                  background: '#0f172a',
                  maxWidth: '360px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.4)'
                }}>
                  <img 
                    src={formData.diagramPhoto} 
                    alt="Uploaded Diagram / Equipment" 
                    style={{ 
                      width: '100%', 
                      maxHeight: '260px', 
                      objectFit: 'contain', 
                      display: 'block' 
                    }} 
                  />
                  <div style={{ 
                    position: 'absolute', 
                    bottom: 0, 
                    left: 0, 
                    right: 0, 
                    background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)', 
                    padding: '8px 12px', 
                    color: '#f8fafc', 
                    fontSize: '0.75rem',
                    fontWeight: 600
                  }}>
                    Uploaded Photo / Diagram Preview
                  </div>
                </div>

                {/* Control Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1, minWidth: '220px' }}>
                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600, color: '#f8fafc' }}>
                      Image Attached to Job Card
                    </p>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      This image will automatically be included and printed on the Job Card format.
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <button 
                      type="button" 
                      onClick={() => fileInputRef.current?.click()}
                      className="btn btn-outline" 
                      style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}
                    >
                      <Upload size={14} />
                      <span>Replace Photo</span>
                    </button>

                    <button 
                      type="button" 
                      onClick={handleRemovePhoto}
                      className="btn btn-outline" 
                      style={{ fontSize: '0.8rem', padding: '0.5rem 1rem', borderColor: 'rgba(239, 68, 68, 0.4)', color: '#f87171' }}
                    >
                      <Trash size={14} />
                      <span>Remove Photo</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
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

    </div>
  );
};
