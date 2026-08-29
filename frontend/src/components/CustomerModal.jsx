import React, { useState, useEffect } from 'react';
import { X, Save, Building2, MapPin, FileText, ShieldCheck, Calendar, Hash } from 'lucide-react';

export const CustomerModal = ({ isOpen, onClose, onSave, customer }) => {
  const [customerName, setCustomerName] = useState('');
  const [gstin, setGstin] = useState('');
  const [pan, setPan] = useState('');
  const [stateCode, setStateCode] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  
  // Extended Tax Invoice & Billing Connection Fields
  const [poNumber, setPoNumber] = useState('');
  const [poDate, setPoDate] = useState('');
  const [vendorCode, setVendorCode] = useState('');
  const [sacCode, setSacCode] = useState('');
  const [contractNo, setContractNo] = useState('');
  const [contractPeriod, setContractPeriod] = useState('');
  const [bgNo, setBgNo] = useState('');

  useEffect(() => {
    if (customer) {
      setCustomerName(customer.customerName || '');
      setGstin(customer.gstin || '');
      setPan(customer.pan || '');
      setStateCode(customer.stateCode || (customer.gstin && customer.gstin.startsWith('34') ? 'Puducherry (34)' : customer.gstin && customer.gstin.startsWith('33') ? 'Tamil Nadu (33)' : ''));
      setPhone(customer.phone || '');
      setAddress(customer.address || '');
      setPoNumber(customer.poNumber || '');
      setPoDate(customer.poDate || '');
      setVendorCode(customer.vendorCode || '');
      setSacCode(customer.sacCode || '');
      setContractNo(customer.contractNo || '');
      setContractPeriod(customer.contractPeriod || '');
      setBgNo(customer.bgNo || '');
    } else {
      setCustomerName('');
      setGstin('');
      setPan('');
      setStateCode('');
      setPhone('');
      setAddress('');
      setPoNumber('');
      setPoDate('');
      setVendorCode('');
      setSacCode('');
      setContractNo('');
      setContractPeriod('');
      setBgNo('');
    }
  }, [customer, isOpen]);

  if (!isOpen) return null;

  // Auto-extract PAN and State Code from GSTIN if valid format
  const handleGstinChange = (val) => {
    const cleanGst = val.toUpperCase().trim();
    setGstin(cleanGst);

    if (cleanGst.length >= 12 && !pan) {
      // Standard GSTIN: 2 digits state code + 10 chars PAN + 3 chars
      const extractedPan = cleanGst.substring(2, 12);
      setPan(extractedPan);
    }

    if (cleanGst.startsWith('34') && !stateCode) {
      setStateCode('Puducherry (34)');
    } else if (cleanGst.startsWith('33') && !stateCode) {
      setStateCode('Tamil Nadu (33)');
    } else if (cleanGst.startsWith('29') && !stateCode) {
      setStateCode('Karnataka (29)');
    } else if (cleanGst.startsWith('27') && !stateCode) {
      setStateCode('Maharashtra (27)');
    } else if (cleanGst.startsWith('37') && !stateCode) {
      setStateCode('Andhra Pradesh (37)');
    } else if (cleanGst.startsWith('32') && !stateCode) {
      setStateCode('Kerala (32)');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!customerName.trim()) {
      alert('Please enter Customer / Company Name');
      return;
    }

    onSave({
      id: customer ? customer.id : undefined,
      serialNumber: customer ? customer.serialNumber : undefined,
      customerName: customerName.trim(),
      gstin: gstin.trim(),
      pan: pan.trim(),
      stateCode: stateCode.trim(),
      phone: phone.trim(),
      address: address.trim(),
      poNumber: poNumber.trim(),
      poDate: poDate.trim(),
      vendorCode: vendorCode.trim(),
      sacCode: sacCode.trim(),
      contractNo: contractNo.trim(),
      contractPeriod: contractPeriod.trim(),
      bgNo: bgNo.trim()
    });
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '780px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-card-solid)', border: '1px solid var(--border-color-accent)', borderRadius: '16px', overflow: 'hidden' }}>
        
        {/* Modal Header */}
        <div style={{ padding: '1.25rem 1.5rem', background: 'var(--bg-card)', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', color: '#34d399' }}>
            <Building2 size={20} />
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                {customer ? `Edit Customer: ${customer.customerName}` : 'Add New Customer Profile'}
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                All details sync directly with Tax Invoice and Proforma Invoice auto-fetch.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-outline" style={{ padding: '0.4rem' }}>
            <X size={18} />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* 1. Basic Party Details */}
          <div>
            <label className="form-label">Customer / Company Name <span style={{ color: '#f87171' }}>*</span></label>
            <input
              type="text"
              className="form-input"
              style={{ fontWeight: 700 }}
              placeholder="e.g. M/s, Ocean Sparkle Ltd, Karaikal Port Pvt., Ltd."
              value={customerName}
              onChange={e => setCustomerName(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div>
              <label className="form-label">Customer GST Number</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. 34AAACO2519H1ZR"
                value={gstin}
                onChange={e => handleGstinChange(e.target.value)}
              />
            </div>

            <div>
              <label className="form-label">Customer PAN</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. AAACO2519H"
                value={pan}
                onChange={e => setPan(e.target.value.toUpperCase())}
              />
            </div>

            <div>
              <label className="form-label">Customer State Code</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. PUDUCHERRY (34) / TAMILNADU (33)"
                value={stateCode}
                onChange={e => setStateCode(e.target.value)}
              />
            </div>

            <div>
              <label className="form-label">Customer Mobile Number</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. 9842492946"
                value={phone}
                onChange={e => setPhone(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="form-label">Delivery & Billed Address</label>
            <textarea
              className="form-textarea"
              rows={2}
              placeholder="e.g. Keezhavanjore, Thirumalairajan Pattinam, Karaikal - 609606."
              value={address}
              onChange={e => setAddress(e.target.value)}
            />
          </div>

          {/* 2. Billing & Contract Connections */}
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.85rem' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>
              Tax Invoice & Contract Parameters (Direct Connection)
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <div>
                <label className="form-label">Customer PO Number (P.O. Number / Ref)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. 5060173862"
                  value={poNumber}
                  onChange={e => setPoNumber(e.target.value)}
                />
              </div>

              <div>
                <label className="form-label">Customer PO Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={poDate}
                  onChange={e => setPoDate(e.target.value)}
                />
              </div>

              <div>
                <label className="form-label">Vendor Code</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. 840305"
                  value={vendorCode}
                  onChange={e => setVendorCode(e.target.value)}
                />
              </div>

              <div>
                <label className="form-label">SAC / HSN Code (SIC Code)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. 995469"
                  value={sacCode}
                  onChange={e => setSacCode(e.target.value)}
                />
              </div>

              <div>
                <label className="form-label">Customer Number (Contract Number)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. 9010038288"
                  value={contractNo}
                  onChange={e => setContractNo(e.target.value)}
                />
              </div>

              <div>
                <label className="form-label">CON. Period</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. 01.05.2024 to 30.04.2027"
                  value={contractPeriod}
                  onChange={e => setContractPeriod(e.target.value)}
                />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label className="form-label">B.G. No</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. 8110IPEBG240001 Validity Upto: 30.09.2027"
                  value={bgNo}
                  onChange={e => setBgNo(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Modal Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
            <button type="button" onClick={onClose} className="btn btn-outline">
              Cancel
            </button>
            <button type="submit" className="btn btn-secondary" style={{ padding: '0.65rem 1.5rem', fontWeight: 800 }}>
              <Save size={16} />
              <span>{customer ? 'Update Customer' : 'Save Customer Profile'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
