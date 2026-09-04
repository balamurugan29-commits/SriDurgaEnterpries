import React, { useState, useEffect, useMemo } from 'react';
import { 
  fetchEmployees, 
  createEmployee, 
  updateEmployee, 
  deleteEmployee 
} from '../services/api';
import { EmployeeModal } from '../components/EmployeeModal';
import { ExportDesignerModal } from '../components/ExportDesignerModal';
import { Toast } from '../components/Toast';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  RefreshCw, 
  Phone, 
  Mail, 
  MapPin, 
  Download, 
  ChevronRight as BreadcrumbChevron, 
  Eye, 
  X, 
  Landmark, 
  ShieldCheck, 
  Calendar, 
  Briefcase, 
  Copy, 
  Printer, 
  Building2, 
  Heart, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

const EMPLOYEE_COLUMNS = [
  { key: 'serialNumber', label: 'S.NO.' },
  { key: 'employeeNumber', label: 'EMPLOYEE ID / NUMBER' },
  { key: 'employeeName', label: 'EMPLOYEE NAME' },
  { key: 'designation', label: 'DESIGNATION' },
  { key: 'dob', label: 'DATE OF BIRTH (DOB)' },
  { key: 'phone', label: 'PHONE / MOBILE' },
  { key: 'email', label: 'EMAIL ADDRESS' },
  { key: 'address', label: 'RESIDENTIAL ADDRESS' },
  { key: 'epfNumber', label: 'EPF NUMBER / UAN' },
  { key: 'esiNumber', label: 'ESI NUMBER' },
  { key: 'bankName', label: 'BANK NAME' },
  { key: 'branchName', label: 'BRANCH' },
  { key: 'accountNumber', label: 'ACCOUNT NUMBER' },
  { key: 'ifscCode', label: 'IFSC CODE' },
  { key: 'joiningDate', label: 'JOINING DATE' },
  { key: 'releasingDate', label: 'RELEASING DATE' },
  { key: 'status', label: 'STATUS' },
  { key: 'bloodGroup', label: 'BLOOD GROUP' }
];

export const EmployeeMasterPage = () => {
  const [employees, setEmployees] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL', 'Active', 'Relieved'
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [viewEmployee, setViewEmployee] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const data = await fetchEmployees(searchQuery);
      setEmployees(data || []);
    } catch (err) {
      console.error('Failed to load employees:', err);
      setToast({ message: 'Failed to load employee directory: ' + err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, [searchQuery]);

  const filteredEmployees = useMemo(() => {
    if (statusFilter === 'ALL') return employees;
    return employees.filter(e => (e.status || 'Active').toLowerCase() === statusFilter.toLowerCase());
  }, [employees, statusFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = employees.length;
    const active = employees.filter(e => (e.status || 'Active').toLowerCase() === 'active').length;
    const relieved = employees.filter(e => (e.status || '').toLowerCase() === 'relieved').length;
    const epfEnrolled = employees.filter(e => e.epfNumber && e.epfNumber.trim()).length;
    const bankEnrolled = employees.filter(e => e.accountNumber && e.accountNumber.trim()).length;
    return { total, active, relieved, epfEnrolled, bankEnrolled };
  }, [employees]);

  const handleCreateNew = () => {
    setSelectedEmployee(null);
    setModalOpen(true);
  };

  const handleEdit = (employee) => {
    setSelectedEmployee(employee);
    setModalOpen(true);
  };

  const handleView = (employee) => {
    setViewEmployee(employee);
  };

  const handleDelete = async (employee) => {
    if (!window.confirm(`Are you sure you want to delete employee record for '${employee.employeeName}' (${employee.employeeNumber || 'ID #' + employee.id})?`)) {
      return;
    }
    try {
      await deleteEmployee(employee.id);
      setToast({ message: `Employee record '${employee.employeeName}' deleted successfully`, type: 'success' });
      loadEmployees();
      if (viewEmployee && viewEmployee.id === employee.id) {
        setViewEmployee(null);
      }
    } catch (err) {
      setToast({ message: 'Delete failed: ' + err.message, type: 'error' });
    }
  };

  const handleSaveEmployee = async (employeeData) => {
    try {
      if (selectedEmployee) {
        await updateEmployee(selectedEmployee.id, employeeData);
        setToast({ message: `Employee '${employeeData.employeeName}' updated successfully!`, type: 'success' });
      } else {
        await createEmployee(employeeData);
        setToast({ message: `Employee '${employeeData.employeeName}' added to Master Directory!`, type: 'success' });
      }
      setModalOpen(false);
      loadEmployees();
      if (viewEmployee && selectedEmployee && viewEmployee.id === selectedEmployee.id) {
        setViewEmployee({ ...viewEmployee, ...employeeData });
      }
    } catch (err) {
      setToast({ message: err.message || 'Operation failed', type: 'error' });
    }
  };

  const copyToClipboard = (text, label) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setToast({ message: `Copied ${label} to clipboard!`, type: 'info' });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  const calculateAge = (dobStr) => {
    if (!dobStr) return null;
    try {
      const birth = new Date(dobStr);
      const today = new Date();
      let age = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
      return age > 0 ? `${age} yrs` : null;
    } catch {
      return null;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />

      {/* Header Banner with Breadcrumbs */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(56, 189, 248, 0.15) 100%)',
        border: '1.5px solid rgba(99, 102, 241, 0.35)',
        borderRadius: '18px',
        padding: '1.35rem 1.75rem',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.25)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            background: 'rgba(99, 102, 241, 0.25)',
            border: '1px solid rgba(99, 102, 241, 0.4)',
            padding: '0.85rem',
            borderRadius: '14px',
            color: '#818cf8',
            display: 'flex'
          }}>
            <Users size={32} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
              <span style={{ fontWeight: 600 }}>Master Page</span>
              <BreadcrumbChevron size={12} />
              <span style={{ color: '#818cf8', fontWeight: 700 }}>Employee Master Directory</span>
            </div>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'white', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              Employee Details Master Profile
            </h2>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', margin: '4px 0 0 0', maxWidth: '680px', lineHeight: 1.5 }}>
              Central directory for staff records, dates of birth, joining and releasing dates, designations, EPF & ESI statutory numbers, and bank salary accounts.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          <button 
            onClick={() => setExportModalOpen(true)}
            className="btn btn-outline" 
            style={{ fontSize: '0.85rem', color: '#818cf8', borderColor: 'rgba(99, 102, 241, 0.4)' }}
          >
            <Download size={16} />
            <span>Export Employee Register</span>
          </button>

          <button 
            onClick={handleCreateNew} 
            className="btn btn-primary" 
            style={{ fontSize: '0.875rem', fontWeight: 700, background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' }}
          >
            <Plus size={16} />
            <span>Add New Employee</span>
          </button>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <div className="glass-panel" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', padding: '0.65rem', borderRadius: '12px' }}>
            <Users size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
              Total Registered Staff
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#818cf8' }}>
              {stats.total} Employees
            </div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ background: 'rgba(52, 211, 153, 0.15)', color: '#34d399', padding: '0.65rem', borderRadius: '12px' }}>
            <UserCheck size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
              Active on Payroll
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#34d399' }}>
              {stats.active} Active
            </div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ background: 'rgba(167, 139, 250, 0.15)', color: '#a78bfa', padding: '0.65rem', borderRadius: '12px' }}>
            <ShieldCheck size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
              EPF & ESI Enrolled
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#a78bfa' }}>
              {stats.epfEnrolled} Staff
            </div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ background: 'rgba(251, 191, 36, 0.15)', color: '#fbbf24', padding: '0.65rem', borderRadius: '12px' }}>
            <Landmark size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
              Bank Account Verified
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fbbf24' }}>
              {stats.bankEnrolled} Accounts
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="glass-panel" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '280px', maxWidth: '480px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '2.25rem', fontSize: '0.85rem' }}
            placeholder="Search by employee name, ID, designation, phone, EPF, ESI, bank..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Status Filter Buttons */}
          <div style={{ display: 'flex', background: 'rgba(0, 0, 0, 0.25)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '3px' }}>
            <button
              onClick={() => setStatusFilter('ALL')}
              style={{
                padding: '0.35rem 0.8rem',
                fontSize: '0.78rem',
                fontWeight: statusFilter === 'ALL' ? 700 : 500,
                borderRadius: '7px',
                border: 'none',
                background: statusFilter === 'ALL' ? 'rgba(99, 102, 241, 0.3)' : 'transparent',
                color: statusFilter === 'ALL' ? '#818cf8' : 'var(--text-muted)',
                cursor: 'pointer'
              }}
            >
              All ({employees.length})
            </button>
            <button
              onClick={() => setStatusFilter('Active')}
              style={{
                padding: '0.35rem 0.8rem',
                fontSize: '0.78rem',
                fontWeight: statusFilter === 'Active' ? 700 : 500,
                borderRadius: '7px',
                border: 'none',
                background: statusFilter === 'Active' ? 'rgba(52, 211, 153, 0.25)' : 'transparent',
                color: statusFilter === 'Active' ? '#34d399' : 'var(--text-muted)',
                cursor: 'pointer'
              }}
            >
              Active ({stats.active})
            </button>
            <button
              onClick={() => setStatusFilter('Relieved')}
              style={{
                padding: '0.35rem 0.8rem',
                fontSize: '0.78rem',
                fontWeight: statusFilter === 'Relieved' ? 700 : 500,
                borderRadius: '7px',
                border: 'none',
                background: statusFilter === 'Relieved' ? 'rgba(239, 68, 68, 0.25)' : 'transparent',
                color: statusFilter === 'Relieved' ? '#f87171' : 'var(--text-muted)',
                cursor: 'pointer'
              }}
            >
              Relieved ({stats.relieved})
            </button>
          </div>

          <button 
            onClick={loadEmployees} 
            className="btn btn-outline" 
            style={{ padding: '0.5rem 0.75rem' }}
            title="Refresh Directory"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Main Employee Registry Table */}
      <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={18} color="#818cf8" />
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
              Master Employee Registry & Statutory Profile
            </h3>
          </div>

          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Showing: <strong>{filteredEmployees.length}</strong> of <strong>{employees.length}</strong> records
          </span>
        </div>

        <div className="custom-table-container" style={{ border: 'none', borderRadius: 0, overflowX: 'auto' }}>
          <table className="custom-table" style={{ minWidth: '1250px' }}>
            <thead>
              <tr>
                <th style={{ width: '45px', textAlign: 'center' }}>S.No</th>
                <th style={{ width: '220px' }}>Employee Details & Designation</th>
                <th style={{ width: '150px' }}>DOB & Age</th>
                <th style={{ width: '220px' }}>Contact & Address</th>
                <th style={{ width: '180px' }}>EPF & ESI Numbers</th>
                <th style={{ width: '230px' }}>Bank & Account Details</th>
                <th style={{ width: '160px' }}>Joining & Releasing</th>
                <th style={{ width: '110px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <RefreshCw size={26} className="animate-spin" style={{ margin: '0 auto 0.6rem auto', color: '#818cf8' }} />
                    <p style={{ margin: 0, fontSize: '0.9rem' }}>Loading employee records...</p>
                  </td>
                </tr>
              ) : filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem auto', color: '#818cf8' }}>
                      <Users size={24} />
                    </div>
                    <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)', margin: '0 0 0.25rem 0' }}>
                      No Employee Records Found
                    </p>
                    <p style={{ fontSize: '0.8rem', margin: '0 0 1rem 0' }}>
                      {searchQuery ? 'No employees match your search query.' : 'Get started by adding your first employee to the directory.'}
                    </p>
                    <button onClick={handleCreateNew} className="btn btn-primary" style={{ fontSize: '0.825rem', margin: '0 auto' }}>
                      <Plus size={14} />
                      <span>Add New Employee</span>
                    </button>
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp, idx) => {
                  const isActive = (emp.status || 'Active').toLowerCase() === 'active';
                  const age = calculateAge(emp.dob);
                  return (
                    <tr key={emp.id || idx} style={{ transition: 'background 0.15s ease' }}>
                      {/* S.No */}
                      <td style={{ textAlign: 'center', fontWeight: 600, color: 'var(--text-muted)' }}>
                        {emp.serialNumber || idx + 1}
                      </td>

                      {/* Employee Details & Designation */}
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <span style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '0.925rem' }}>
                              {emp.employeeName}
                            </span>
                            {emp.bloodGroup && (
                              <span style={{ fontSize: '0.65rem', background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', padding: '1px 5px', borderRadius: '4px', fontWeight: 700 }}>
                                {emp.bloodGroup}
                              </span>
                            )}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                            {emp.employeeNumber && (
                              <span style={{ fontSize: '0.7rem', background: 'rgba(99, 102, 241, 0.18)', color: '#818cf8', padding: '1px 6px', borderRadius: '4px', fontWeight: 700, fontFamily: 'monospace' }}>
                                {emp.employeeNumber}
                              </span>
                            )}
                            <span style={{ fontSize: '0.78rem', color: '#38bdf8', fontWeight: 600 }}>
                              {emp.designation || 'Staff / Worker'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* DOB & Age */}
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-main)' }}>
                            {formatDate(emp.dob)}
                          </span>
                          {age && (
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                              Age: <strong style={{ color: '#34d399' }}>{age}</strong>
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Contact & Address */}
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                          {emp.phone && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.825rem', fontWeight: 700, color: '#34d399' }}>
                              <Phone size={12} />
                              <span>{emp.phone}</span>
                              <button 
                                onClick={() => copyToClipboard(emp.phone, 'Phone Number')} 
                                className="btn-icon-subtle" 
                                title="Copy Phone"
                                style={{ padding: '2px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                              >
                                <Copy size={11} />
                              </button>
                            </div>
                          )}
                          {emp.email && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                              <Mail size={11} />
                              <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '170px' }}>
                                {emp.email}
                              </span>
                            </div>
                          )}
                          {emp.address && (
                            <div style={{ fontSize: '0.725rem', color: 'var(--text-subtle)', lineHeight: 1.3, marginTop: '2px' }} title={emp.address}>
                              {emp.address.length > 50 ? `${emp.address.substring(0, 50)}...` : emp.address}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* EPF & ESI Numbers */}
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem' }}>
                            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600 }}>EPF:</span>
                            <span style={{ fontFamily: 'monospace', fontWeight: 700, color: emp.epfNumber ? '#a78bfa' : 'var(--text-subtle)' }}>
                              {emp.epfNumber || 'N/A'}
                            </span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem' }}>
                            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600 }}>ESI:</span>
                            <span style={{ fontFamily: 'monospace', fontWeight: 700, color: emp.esiNumber ? '#38bdf8' : 'var(--text-subtle)' }}>
                              {emp.esiNumber || 'N/A'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Bank Details */}
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                          <div style={{ fontSize: '0.825rem', fontWeight: 700, color: '#fbbf24' }}>
                            {emp.bankName || 'Bank Not Added'}
                          </div>
                          {emp.accountNumber && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', fontFamily: 'monospace' }}>
                              <span style={{ color: 'var(--text-muted)' }}>A/C:</span>
                              <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{emp.accountNumber}</span>
                            </div>
                          )}
                          {emp.ifscCode && (
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                              IFSC: <strong style={{ color: '#38bdf8' }}>{emp.ifscCode}</strong> {emp.branchName ? `(${emp.branchName})` : ''}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Service Dates & Status */}
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px',
                              fontSize: '0.68rem',
                              fontWeight: 700,
                              padding: '2px 6px',
                              borderRadius: '4px',
                              background: isActive ? 'rgba(52, 211, 153, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                              color: isActive ? '#34d399' : '#f87171'
                            }}>
                              <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: isActive ? '#34d399' : '#f87171' }}></span>
                              {emp.status || 'Active'}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            DOJ: <strong style={{ color: 'var(--text-main)' }}>{formatDate(emp.joiningDate)}</strong>
                          </div>
                          {emp.releasingDate && (
                            <div style={{ fontSize: '0.72rem', color: '#f87171' }}>
                              Relieved: <strong>{formatDate(emp.releasingDate)}</strong>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
                          <button
                            onClick={() => handleView(emp)}
                            className="btn btn-outline"
                            style={{ padding: '0.4rem', color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.3)' }}
                            title="View Employee Profile Card"
                          >
                            <Eye size={14} />
                          </button>

                          <button
                            onClick={() => handleEdit(emp)}
                            className="btn btn-outline"
                            style={{ padding: '0.4rem', color: '#818cf8', borderColor: 'rgba(99, 102, 241, 0.3)' }}
                            title="Edit Employee"
                          >
                            <Edit3 size={14} />
                          </button>

                          <button
                            onClick={() => handleDelete(emp)}
                            className="btn btn-outline"
                            style={{ padding: '0.4rem', color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                            title="Delete Record"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Employee ID / Profile Card Modal */}
      {viewEmployee && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 999999,
          background: 'rgba(0, 0, 0, 0.82)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div 
            className="glass-panel" 
            style={{
              width: '100%',
              maxWidth: '680px',
              maxHeight: '90vh',
              background: 'var(--bg-card-solid)',
              border: '1.5px solid rgba(99, 102, 241, 0.4)',
              borderRadius: '20px',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
            }}
          >
            {/* Header */}
            <div style={{
              padding: '1.25rem 1.5rem',
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.25) 0%, rgba(56, 189, 248, 0.15) 100%)',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 900,
                  fontSize: '1.2rem',
                  boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)'
                }}>
                  {viewEmployee.employeeName ? viewEmployee.employeeName.charAt(0).toUpperCase() : 'E'}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                    {viewEmployee.employeeName}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '2px' }}>
                    <span style={{ fontSize: '0.75rem', color: '#818cf8', fontWeight: 700 }}>
                      {viewEmployee.employeeNumber || 'ID: ' + viewEmployee.id}
                    </span>
                    <span style={{ color: 'var(--text-subtle)' }}>•</span>
                    <span style={{ fontSize: '0.78rem', color: '#38bdf8', fontWeight: 600 }}>
                      {viewEmployee.designation || 'Staff'}
                    </span>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setViewEmployee(null)} 
                className="btn btn-outline" 
                style={{ padding: '0.4rem', borderRadius: '50%' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Profile Content */}
            <div style={{ padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              {/* Status and Dates bar */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '0.85rem 1.15rem',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: '0.75rem'
              }}>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Status</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: (viewEmployee.status || 'Active') === 'Active' ? '#34d399' : '#f87171' }}>
                    {viewEmployee.status || 'Active'}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Date of Birth</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    {formatDate(viewEmployee.dob)}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Joining Date</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#34d399' }}>
                    {formatDate(viewEmployee.joiningDate)}
                  </div>
                </div>

                {viewEmployee.releasingDate && (
                  <div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Releasing Date</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f87171' }}>
                      {formatDate(viewEmployee.releasingDate)}
                    </div>
                  </div>
                )}
              </div>

              {/* Statutory Compliance Identifiers */}
              <div style={{
                background: 'rgba(167, 139, 250, 0.08)',
                border: '1px solid rgba(167, 139, 250, 0.3)',
                borderRadius: '12px',
                padding: '1rem 1.25rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#a78bfa', fontWeight: 700, fontSize: '0.825rem', marginBottom: '0.75rem' }}>
                  <ShieldCheck size={16} />
                  <span>Statutory Registrations (EPF & ESI)</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>EPF / UAN Number</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, fontFamily: 'monospace', color: '#a78bfa' }}>
                      {viewEmployee.epfNumber || 'Not Registered'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>ESI Number / IP Code</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, fontFamily: 'monospace', color: '#38bdf8' }}>
                      {viewEmployee.esiNumber || 'Not Registered'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bank & Salary Remittance */}
              <div style={{
                background: 'rgba(251, 191, 36, 0.08)',
                border: '1px solid rgba(251, 191, 36, 0.3)',
                borderRadius: '12px',
                padding: '1rem 1.25rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#fbbf24', fontWeight: 700, fontSize: '0.825rem', marginBottom: '0.75rem' }}>
                  <Landmark size={16} />
                  <span>Bank & Salary Coordinates</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Bank Name & Branch</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      {viewEmployee.bankName || 'Not Set'} {viewEmployee.branchName ? `(${viewEmployee.branchName})` : ''}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Account Number</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, fontFamily: 'monospace', color: '#fbbf24' }}>
                      {viewEmployee.accountNumber || 'Not Set'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>IFSC Code</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 800, fontFamily: 'monospace', color: '#38bdf8' }}>
                      {viewEmployee.ifscCode || 'Not Set'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Blood Group</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#f87171' }}>
                      {viewEmployee.bloodGroup || 'Not Specified'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact & Address */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '1rem 1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.65rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#34d399', fontWeight: 700, fontSize: '0.825rem' }}>
                  <Phone size={16} />
                  <span>Contact & Residence</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Phone / Mobile</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#34d399' }}>
                      {viewEmployee.phone || '-'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Email</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>
                      {viewEmployee.email || '-'}
                    </div>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Residential Address</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: 1.4 }}>
                    {viewEmployee.address || 'Address not recorded.'}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div style={{
              padding: '1rem 1.5rem',
              background: 'var(--bg-card)',
              borderTop: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <button
                onClick={() => {
                  const emp = viewEmployee;
                  setViewEmployee(null);
                  handleEdit(emp);
                }}
                className="btn btn-outline"
                style={{ color: '#818cf8', borderColor: 'rgba(99, 102, 241, 0.4)' }}
              >
                <Edit3 size={15} />
                <span>Edit Profile</span>
              </button>

              <button
                onClick={() => setViewEmployee(null)}
                className="btn btn-primary"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      <EmployeeModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveEmployee}
        employee={selectedEmployee}
      />

      {/* Export Designer Modal */}
      <ExportDesignerModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        data={filteredEmployees}
        columns={EMPLOYEE_COLUMNS}
        documentTitle="SRI DURGA ENTERPRISES - MASTER EMPLOYEE REGISTER"
        fileName="Sri_Durga_Employee_Master_Register"
      />
    </div>
  );
};
