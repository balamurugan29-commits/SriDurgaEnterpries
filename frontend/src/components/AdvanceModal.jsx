import React, { useState, useEffect } from 'react';
import { X, Save, CreditCard, DollarSign, Calendar, User, FileText } from 'lucide-react';

export const AdvanceModal = ({ isOpen, onClose, onSave, employees = [] }) => {
  const [employeeId, setEmployeeId] = useState('');
  const [employeeName, setEmployeeName] = useState('');
  const [employeeNumber, setEmployeeNumber] = useState('');
  const [advanceDate, setAdvanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [amount, setAmount] = useState('');
  const [transactionType, setTransactionType] = useState('LOAN_GIVEN'); // LOAN_GIVEN, MANUAL_REPAYMENT
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (employees.length > 0 && !employeeId) {
      setEmployeeId(employees[0].id);
      setEmployeeName(employees[0].employeeName);
      setEmployeeNumber(employees[0].employeeNumber || '');
    }
  }, [employees, employeeId, isOpen]);

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

  const handleEmployeeChange = (e) => {
    const id = Number(e.target.value);
    setEmployeeId(id);
    const emp = employees.find(x => x.id === id);
    if (emp) {
      setEmployeeName(emp.employeeName);
      setEmployeeNumber(emp.employeeNumber || '');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      alert('Please enter a valid advance amount');
      return;
    }

    onSave({
      employeeId,
      employeeName,
      employeeNumber,
      advanceDate,
      amount: numAmount,
      transactionType,
      description: description.trim()
    });
  };

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
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '520px',
          background: 'var(--bg-card-solid)',
          border: '1.5px solid rgba(251, 191, 36, 0.45)',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.75)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '1.1rem 1.5rem',
          background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.15) 0%, rgba(245, 158, 11, 0.08) 100%)',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              background: 'rgba(251, 191, 36, 0.2)',
              border: '1px solid rgba(251, 191, 36, 0.4)',
              padding: '0.5rem',
              borderRadius: '10px',
              color: '#fbbf24',
              display: 'flex'
            }}>
              <CreditCard size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                Record Employee Advance / Loan
              </h3>
              <p style={{ fontSize: '0.725rem', color: 'var(--text-muted)', margin: 0 }}>
                Staff advance disbursement and loan repayment ledger
              </p>
            </div>
          </div>

          <button onClick={onClose} className="btn btn-outline" style={{ padding: '0.4rem', borderRadius: '50%' }}>
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label className="form-label">Select Employee <span style={{ color: '#f87171' }}>*</span></label>
            <select
              className="form-select"
              value={employeeId}
              onChange={handleEmployeeChange}
              required
            >
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.employeeName} {emp.employeeNumber ? `(${emp.employeeNumber})` : ''} - {emp.designation || 'Staff'}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
            <div>
              <label className="form-label">Transaction Type <span style={{ color: '#f87171' }}>*</span></label>
              <select
                className="form-select"
                value={transactionType}
                onChange={e => setTransactionType(e.target.value)}
                style={{
                  color: transactionType === 'LOAN_GIVEN' ? '#fbbf24' : '#34d399',
                  fontWeight: 700
                }}
              >
                <option value="LOAN_GIVEN">📤 Advance Given / Loan</option>
                <option value="MANUAL_REPAYMENT">📥 Direct Repayment (Cash/Bank)</option>
              </select>
            </div>

            <div>
              <label className="form-label">Transaction Date <span style={{ color: '#f87171' }}>*</span></label>
              <input
                type="date"
                className="form-input"
                value={advanceDate}
                onChange={e => setAdvanceDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="form-label">Advance Amount (Rs.) <span style={{ color: '#f87171' }}>*</span></label>
            <input
              type="number"
              step="0.01"
              className="form-input"
              style={{ fontSize: '1.1rem', fontWeight: 800, fontFamily: 'monospace' }}
              placeholder="e.g. 5000.00"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div>
            <label className="form-label">Description / Remarks</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Festival advance, Medical assistance..."
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
            <button type="button" onClick={onClose} className="btn btn-outline">
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              style={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem'
              }}
            >
              <Save size={16} />
              <span>Record Advance Entry</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
