import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  Users, 
  UserCheck, 
  Calendar, 
  Phone, 
  Mail, 
  MapPin, 
  Landmark, 
  ShieldCheck, 
  Briefcase, 
  Heart, 
  ArrowRight, 
  ArrowLeft, 
  CreditCard,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

const COMMON_DESIGNATIONS = [
  'Managing Director',
  'Proprietor',
  'Works Manager',
  'Electrical Supervisor',
  'Senior Electrical Engineer',
  'Electrical Engineer',
  'Senior Electrician',
  'Electrician',
  'Motor Winder Specialist',
  'Motor Winder',
  'Assistant Motor Winder',
  'Technician',
  'Lathe Machinist',
  'Mechanical Fitter',
  'Helper / Trainee',
  'Site Supervisor',
  'Accounts & GST Executive',
  'Office Assistant',
  'Store Keeper',
  'Driver & Delivery Incharge'
];

const COMMON_BANKS = [
  'State Bank of India (SBI)',
  'Indian Overseas Bank (IOB)',
  'Canara Bank',
  'Indian Bank',
  'HDFC Bank',
  'ICICI Bank',
  'Axis Bank',
  'Bank of Baroda',
  'Punjab National Bank',
  'Union Bank of India',
  'City Union Bank',
  'Karur Vysya Bank',
  'Kotak Mahindra Bank',
  'Federal Bank',
  'Bank of India',
  'Central Bank of India'
];

export const EmployeeModal = ({ isOpen, onClose, onSave, employee }) => {
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'banking'

  // Profile & Identity Fields
  const [employeeName, setEmployeeName] = useState('');
  const [employeeNumber, setEmployeeNumber] = useState('');
  const [designation, setDesignation] = useState('');
  const [dob, setDob] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [status, setStatus] = useState('Active');
  
  // Service Timeline
  const [joiningDate, setJoiningDate] = useState('');
  const [releasingDate, setReleasingDate] = useState('');
  
  // Contact & Residence
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  
  // Statutory Compliance (EPF / ESI)
  const [epfNumber, setEpfNumber] = useState('');
  const [esiNumber, setEsiNumber] = useState('');

  // Banking & Financial Details
  const [bankName, setBankName] = useState('');
  const [branchName, setBranchName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  
  // Salary & Wage Defaults
  const [monthlySalary, setMonthlySalary] = useState(20000);
  const [minWage, setMinWage] = useState(600);
  const [basicRate, setBasicRate] = useState(400);

  useEffect(() => {
    if (employee) {
      setEmployeeName(employee.employeeName || '');
      setEmployeeNumber(employee.employeeNumber || '');
      setDesignation(employee.designation || '');
      setDob(employee.dob || '');
      setBloodGroup(employee.bloodGroup || '');
      setStatus(employee.status || 'Active');
      setJoiningDate(employee.joiningDate || '');
      setReleasingDate(employee.releasingDate || '');
      setPhone(employee.phone || '');
      setEmail(employee.email || '');
      setAddress(employee.address || '');
      setEpfNumber(employee.epfNumber || '');
      setEsiNumber(employee.esiNumber || '');
      setBankName(employee.bankName || '');
      setBranchName(employee.branchName || '');
      setAccountNumber(employee.accountNumber || '');
      setIfscCode(employee.ifscCode || '');
      setMonthlySalary(employee.monthlySalary !== undefined ? employee.monthlySalary : 20000);
      setMinWage(employee.minWage !== undefined ? employee.minWage : 600);
      setBasicRate(employee.basicRate !== undefined ? employee.basicRate : 400);
      setActiveTab('profile');
    } else {
      setEmployeeName('');
      setEmployeeNumber('');
      setDesignation('');
      setDob('');
      setBloodGroup('');
      setStatus('Active');
      setJoiningDate(new Date().toISOString().split('T')[0]);
      setReleasingDate('');
      setPhone('');
      setEmail('');
      setAddress('');
      setEpfNumber('');
      setEsiNumber('');
      setBankName('');
      setBranchName('');
      setAccountNumber('');
      setIfscCode('');
      setMonthlySalary(20000);
      setMinWage(600);
      setBasicRate(400);
      setActiveTab('profile');
    }
  }, [employee, isOpen]);

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

  const hasBankingData = !!(epfNumber || esiNumber || bankName || accountNumber || ifscCode);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!employeeName.trim()) {
      setActiveTab('profile');
      alert('Please enter Employee Full Name');
      return;
    }

    onSave({
      id: employee ? employee.id : undefined,
      serialNumber: employee ? employee.serialNumber : undefined,
      employeeName: employeeName.trim(),
      employeeNumber: employeeNumber.trim(),
      designation: designation.trim(),
      dob: dob.trim(),
      bloodGroup: bloodGroup.trim(),
      status: status.trim() || 'Active',
      joiningDate: joiningDate.trim(),
      releasingDate: releasingDate.trim(),
      phone: phone.trim(),
      email: email.trim(),
      address: address.trim(),
      epfNumber: epfNumber.trim().toUpperCase(),
      esiNumber: esiNumber.trim(),
      bankName: bankName.trim(),
      branchName: branchName.trim(),
      accountNumber: accountNumber.trim(),
      ifscCode: ifscCode.trim().toUpperCase(),
      monthlySalary: parseFloat(monthlySalary) || 26000,
      minWage: parseFloat(minWage) || 600,
      basicRate: parseFloat(basicRate) || 400
    });
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 999999,
      background: 'rgba(0, 0, 0, 0.78)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0.75rem',
      animation: 'fadeIn 0.2s ease-out'
    }}>
      {/* Datalists for Auto-suggestions */}
      <datalist id="employee-designation-list">
        {COMMON_DESIGNATIONS.map((d, i) => (
          <option key={i} value={d} />
        ))}
      </datalist>

      <datalist id="employee-bank-list">
        {COMMON_BANKS.map((b, i) => (
          <option key={i} value={b} />
        ))}
      </datalist>

      <div 
        className="glass-panel" 
        style={{
          width: '100%',
          maxWidth: '820px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--bg-card-solid)',
          border: '1.5px solid rgba(99, 102, 241, 0.45)',
          borderRadius: '18px',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.75)',
          animation: 'scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Compact Modal Header */}
        <div style={{
          padding: '1rem 1.5rem',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(56, 189, 248, 0.12) 100%)',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
              padding: '0.55rem',
              borderRadius: '10px',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)'
            }}>
              <Users size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {employee ? `Edit: ${employee.employeeName}` : 'Add New Employee Record'}
                {status && (
                  <span style={{
                    fontSize: '0.68rem',
                    padding: '2px 7px',
                    borderRadius: '6px',
                    background: status === 'Active' ? 'rgba(52, 211, 153, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                    color: status === 'Active' ? '#34d399' : '#f87171',
                    fontWeight: 700
                  }}>
                    {status}
                  </span>
                )}
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                Master personnel identity, contact, EPF/ESI statutory IDs, and bank remittance.
              </p>
            </div>
          </div>

          <button 
            type="button" 
            onClick={onClose} 
            className="btn btn-outline" 
            style={{ padding: '0.4rem', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Tab Navigation Pill Bar */}
        <div style={{
          padding: '0.5rem 1.5rem',
          background: 'rgba(0, 0, 0, 0.2)',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(255, 255, 255, 0.04)', padding: '3px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.45rem 1rem',
                fontSize: '0.825rem',
                fontWeight: activeTab === 'profile' ? 700 : 500,
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'profile' ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' : 'transparent',
                color: activeTab === 'profile' ? '#ffffff' : 'var(--text-muted)',
                cursor: 'pointer',
                boxShadow: activeTab === 'profile' ? '0 2px 8px rgba(99, 102, 241, 0.4)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              <Briefcase size={14} />
              <span>1. Identity & Employment</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('banking')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.45rem 1rem',
                fontSize: '0.825rem',
                fontWeight: activeTab === 'banking' ? 700 : 500,
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'banking' ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' : 'transparent',
                color: activeTab === 'banking' ? '#ffffff' : 'var(--text-muted)',
                cursor: 'pointer',
                boxShadow: activeTab === 'banking' ? '0 2px 8px rgba(99, 102, 241, 0.4)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              <Landmark size={14} />
              <span>2. Statutory & Bank Details</span>
              {hasBankingData && (
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#34d399', display: 'inline-block' }} />
              )}
            </button>
          </div>

          <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)' }}>
            Step <strong>{activeTab === 'profile' ? '1 of 2' : '2 of 2'}</strong>
          </span>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          
          <div style={{ padding: '1.25rem 1.5rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            {/* ================= TAB 1: IDENTITY & EMPLOYMENT PROFILE ================= */}
            {activeTab === 'profile' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem', animation: 'fadeIn 0.15s ease' }}>
                
                {/* 1. Primary Name & Code */}
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(240px, 1.8fr) minmax(140px, 1fr) minmax(130px, 1fr)', gap: '0.85rem' }}>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.78rem', marginBottom: '4px' }}>
                      Employee Full Name <span style={{ color: '#f87171' }}>*</span>
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      style={{ fontWeight: 700, fontSize: '0.9rem', borderColor: employeeName ? 'rgba(99, 102, 241, 0.4)' : undefined }}
                      placeholder="e.g. R. Balamurugan"
                      value={employeeName}
                      onChange={e => setEmployeeName(e.target.value)}
                      required
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className="form-label" style={{ fontSize: '0.78rem', marginBottom: '4px' }}>
                      Employee ID / Code
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. SDE-001"
                      value={employeeNumber}
                      onChange={e => setEmployeeNumber(e.target.value)}
                      style={{ fontFamily: 'monospace', fontWeight: 600 }}
                    />
                  </div>

                  <div>
                    <label className="form-label" style={{ fontSize: '0.78rem', marginBottom: '4px' }}>
                      Status
                    </label>
                    <select
                      className="form-select"
                      value={status}
                      onChange={e => setStatus(e.target.value)}
                      style={{
                        color: status === 'Active' ? '#34d399' : status === 'Relieved' ? '#f87171' : '#fbbf24',
                        fontWeight: 700,
                        fontSize: '0.825rem'
                      }}
                    >
                      <option value="Active">🟢 Active</option>
                      <option value="Relieved">🔴 Relieved</option>
                      <option value="On Leave">🟡 On Leave</option>
                    </select>
                  </div>
                </div>

                {/* 2. Designation, DOB & Blood Group */}
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(220px, 1.6fr) minmax(140px, 1fr) minmax(120px, 0.9fr)', gap: '0.85rem' }}>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.78rem', marginBottom: '4px' }}>
                      Designation / Role
                    </label>
                    <input
                      type="text"
                      list="employee-designation-list"
                      className="form-input"
                      placeholder="e.g. Senior Electrician / Supervisor"
                      value={designation}
                      onChange={e => setDesignation(e.target.value)}
                      style={{ fontSize: '0.85rem' }}
                    />
                  </div>

                  <div>
                    <label className="form-label" style={{ fontSize: '0.78rem', marginBottom: '4px' }}>
                      Date of Birth (DOB)
                    </label>
                    <input
                      type="date"
                      className="form-input"
                      value={dob}
                      onChange={e => setDob(e.target.value)}
                      style={{ fontSize: '0.85rem' }}
                    />
                  </div>

                  <div>
                    <label className="form-label" style={{ fontSize: '0.78rem', marginBottom: '4px' }}>
                      Blood Group
                    </label>
                    <select
                      className="form-select"
                      value={bloodGroup}
                      onChange={e => setBloodGroup(e.target.value)}
                      style={{ fontSize: '0.85rem' }}
                    >
                      <option value="">Select</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                    </select>
                  </div>
                </div>

                {/* 3. Service Dates & Contacts */}
                <div style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  padding: '0.9rem 1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.85rem'
                }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                    <div>
                      <label className="form-label" style={{ fontSize: '0.75rem', color: '#38bdf8', marginBottom: '4px' }}>
                        Date of Joining (DOJ)
                      </label>
                      <input
                        type="date"
                        className="form-input"
                        value={joiningDate}
                        onChange={e => setJoiningDate(e.target.value)}
                        style={{ fontSize: '0.85rem' }}
                      />
                    </div>

                    <div>
                      <label className="form-label" style={{ fontSize: '0.75rem', color: releasingDate ? '#f87171' : 'var(--text-muted)', marginBottom: '4px' }}>
                        Date of Releasing / Relieving
                      </label>
                      <input
                        type="date"
                        className="form-input"
                        value={releasingDate}
                        onChange={e => setReleasingDate(e.target.value)}
                        style={{ fontSize: '0.85rem' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                    <div>
                      <label className="form-label" style={{ fontSize: '0.75rem', color: '#34d399', marginBottom: '4px' }}>
                        Phone / Mobile Number
                      </label>
                      <input
                        type="tel"
                        className="form-input"
                        placeholder="e.g. 9842492946"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        style={{ fontSize: '0.85rem' }}
                      />
                    </div>

                    <div>
                      <label className="form-label" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                        Email Address
                      </label>
                      <input
                        type="email"
                        className="form-input"
                        placeholder="e.g. employee@domain.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        style={{ fontSize: '0.85rem' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '4px' }}>
                      Residential Address
                    </label>
                    <textarea
                      className="form-textarea"
                      rows={2}
                      placeholder="Door no, street, locality, city & pincode..."
                      value={address}
                      onChange={e => setAddress(e.target.value)}
                      style={{ fontSize: '0.85rem', resize: 'vertical' }}
                    />
                  </div>
                </div>

              </div>
            )}

            {/* ================= TAB 2: STATUTORY COMPLIANCE & BANKING ================= */}
            {activeTab === 'banking' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', animation: 'fadeIn 0.15s ease' }}>
                
                {/* Statutory Numbers (EPF / ESI) */}
                <div style={{
                  background: 'linear-gradient(135deg, rgba(167, 139, 250, 0.08) 0%, rgba(99, 102, 241, 0.05) 100%)',
                  border: '1.5px solid rgba(167, 139, 250, 0.3)',
                  borderRadius: '14px',
                  padding: '1.1rem 1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.85rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#a78bfa', fontSize: '0.85rem', fontWeight: 700 }}>
                    <ShieldCheck size={18} />
                    <span>Statutory Compliance Identifiers (EPF & ESI)</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                    <div>
                      <label className="form-label" style={{ fontSize: '0.78rem', marginBottom: '4px' }}>
                        EPF Number / UAN
                      </label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. PC1758/0012480 or UAN 100984523610"
                        value={epfNumber}
                        onChange={e => setEpfNumber(e.target.value.toUpperCase())}
                        style={{ textTransform: 'uppercase', fontFamily: 'monospace', fontWeight: 700, fontSize: '0.85rem' }}
                      />
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '2px', display: 'block' }}>
                        Employees' Provident Fund account / 12-digit UAN
                      </span>
                    </div>

                    <div>
                      <label className="form-label" style={{ fontSize: '0.78rem', marginBottom: '4px' }}>
                        ESI Number / IP Code
                      </label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. 55000426770000602"
                        value={esiNumber}
                        onChange={e => setEsiNumber(e.target.value)}
                        style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.85rem' }}
                      />
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '2px', display: 'block' }}>
                        Employee State Insurance 17-digit IP code
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bank Account Coordinates */}
                <div style={{
                  background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.08) 0%, rgba(245, 158, 11, 0.04) 100%)',
                  border: '1.5px solid rgba(251, 191, 36, 0.3)',
                  borderRadius: '14px',
                  padding: '1.1rem 1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.85rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fbbf24', fontSize: '0.85rem', fontWeight: 700 }}>
                    <Landmark size={18} />
                    <span>Bank Account & Salary Remittance Coordinates</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.85rem' }}>
                    <div>
                      <label className="form-label" style={{ fontSize: '0.78rem', marginBottom: '4px' }}>
                        Bank Name
                      </label>
                      <input
                        type="text"
                        list="employee-bank-list"
                        className="form-input"
                        placeholder="e.g. State Bank of India, IOB, Canara Bank..."
                        value={bankName}
                        onChange={e => setBankName(e.target.value)}
                        style={{ fontSize: '0.85rem' }}
                      />
                    </div>

                    <div>
                      <label className="form-label" style={{ fontSize: '0.78rem', marginBottom: '4px' }}>
                        Branch Name
                      </label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. Karaikal Main Branch"
                        value={branchName}
                        onChange={e => setBranchName(e.target.value)}
                        style={{ fontSize: '0.85rem' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.85rem' }}>
                    <div>
                      <label className="form-label" style={{ fontSize: '0.78rem', marginBottom: '4px' }}>
                        Bank Account Number
                      </label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Enter Account Number"
                        value={accountNumber}
                        onChange={e => setAccountNumber(e.target.value)}
                        style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.875rem' }}
                      />
                    </div>

                    <div>
                      <label className="form-label" style={{ fontSize: '0.78rem', marginBottom: '4px' }}>
                        IFSC Code
                      </label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. SBIN0000854"
                        value={ifscCode}
                        onChange={e => setIfscCode(e.target.value.toUpperCase())}
                        style={{ textTransform: 'uppercase', fontFamily: 'monospace', fontWeight: 700, fontSize: '0.875rem' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Standard Wage & Salary Config */}
                <div style={{
                  background: 'rgba(59, 130, 246, 0.05)',
                  border: '1px solid rgba(59, 130, 246, 0.25)',
                  borderRadius: '12px',
                  padding: '1.15rem 1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.9rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid rgba(59, 130, 246, 0.15)', paddingBottom: '0.5rem' }}>
                    <CreditCard size={17} color="#60a5fa" />
                    <h4 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 700, color: '#60a5fa' }}>
                      Standard Wage & Rate Structure
                    </h4>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                    <div>
                      <label className="form-label" style={{ fontSize: '0.78rem', marginBottom: '4px' }}>
                        Monthly Wage (₹)
                      </label>
                      <input
                        type="number"
                        step="500"
                        className="form-input"
                        placeholder="e.g. 20000"
                        value={monthlySalary}
                        onChange={e => {
                          const val = Number(e.target.value) || 0;
                          setMonthlySalary(val);
                        }}
                        style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.875rem' }}
                      />
                      <span style={{ fontSize: '0.68rem', color: '#818cf8' }}>Per Day Rate: ₹{((monthlySalary || 0) / 26).toFixed(2)}</span>
                    </div>

                    <div>
                      <label className="form-label" style={{ fontSize: '0.78rem', marginBottom: '4px' }}>
                        Basic Wage / Day (₹)
                      </label>
                      <input
                        type="number"
                        step="10"
                        className="form-input"
                        placeholder="e.g. 400"
                        value={basicRate}
                        onChange={e => setBasicRate(Number(e.target.value) || 0)}
                        style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.875rem', background: 'rgba(99, 102, 241, 0.08)' }}
                        title="Basic Wage per day (Editable, default ₹400)"
                      />
                      <span style={{ fontSize: '0.68rem', color: '#60a5fa' }}>Standard Basic Rate</span>
                    </div>

                    <div>
                      <label className="form-label" style={{ fontSize: '0.78rem', marginBottom: '4px' }}>
                        Other Wage / Day (₹)
                      </label>
                      <div 
                        className="form-input" 
                        style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.875rem', background: 'rgba(255, 255, 255, 0.04)', color: '#a78bfa', display: 'flex', alignItems: 'center' }}
                      >
                        ₹{Math.max(0, ((monthlySalary || 0) / 26) - (basicRate || 0)).toFixed(2)}
                      </div>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>= Per Day - Basic Wage</span>
                    </div>
                  </div>
                </div>

              </div>
            )}

          </div>

          {/* Sticky Modal Footer Actions */}
          <div style={{
            padding: '0.85rem 1.5rem',
            background: 'var(--bg-card)',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
            flexWrap: 'wrap'
          }}>
            <div>
              {activeTab === 'banking' ? (
                <button
                  type="button"
                  onClick={() => setActiveTab('profile')}
                  className="btn btn-outline"
                  style={{ fontSize: '0.825rem', display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 0.9rem' }}
                >
                  <ArrowLeft size={14} />
                  <span>Back to Profile</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setActiveTab('banking')}
                  className="btn btn-outline"
                  style={{ fontSize: '0.825rem', display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 0.9rem', color: '#818cf8', borderColor: 'rgba(99, 102, 241, 0.4)' }}
                >
                  <span>Statutory & Bank Details</span>
                  <ArrowRight size={14} />
                </button>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <button
                type="button"
                onClick={onClose}
                className="btn btn-outline"
                style={{ fontSize: '0.825rem', padding: '0.5rem 1rem' }}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="btn btn-primary"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                  padding: '0.55rem 1.5rem',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)'
                }}
              >
                <Save size={16} />
                <span>{employee ? 'Update Employee Record' : 'Save Employee Details'}</span>
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};
