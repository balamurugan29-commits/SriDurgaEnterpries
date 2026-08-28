import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Users, 
  UserPlus, 
  Shield, 
  Key, 
  Lock, 
  Check, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw,
  Eye,
  EyeOff,
  Sparkles,
  Layers,
  FileSpreadsheet,
  Award,
  Wrench,
  ArrowLeftRight,
  BookOpen
} from 'lucide-react';
import { 
  fetchUsersApi, 
  createUserApi, 
  updateUserApi, 
  deleteUserApi, 
  ALL_SYSTEM_PERMISSIONS 
} from '../services/api';

const PERMISSION_GROUPS = [
  {
    name: 'General & Overview',
    icon: Sparkles,
    color: '#818cf8',
    permissions: ['dashboard']
  },
  {
    name: 'Master Directory',
    icon: Layers,
    color: '#34d399',
    permissions: ['master', 'customer-master']
  },
  {
    name: 'Invoice Management',
    icon: FileSpreadsheet,
    color: '#fbbf24',
    permissions: ['challan', 'challan-list', 'proforma-invoice', 'proforma-invoice-history']
  },
  {
    name: 'Certificates',
    icon: Award,
    color: '#38bdf8',
    permissions: ['work-completion', 'work-completion-history']
  },
  {
    name: 'Job Cards',
    icon: Wrench,
    color: '#f472b6',
    permissions: ['job-card', 'job-card-history']
  },
  {
    name: 'Gate Pass System',
    icon: ArrowLeftRight,
    color: '#fb923c',
    permissions: ['gate-pass', 'gate-pass-list']
  },
  {
    name: 'Audit & Ledgers',
    icon: BookOpen,
    color: '#a78bfa',
    permissions: ['sales-ledger', 'purchase-ledger']
  }
];

export const UserManagementModal = ({ isOpen, onClose, currentUser }) => {
  const isAdmin = currentUser?.role === 'ADMIN' || currentUser?.userId?.toLowerCase() === 'admin';
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('list'); // 'list', 'form'
  const [editingUser, setEditingUser] = useState(null);
  const [toast, setToast] = useState(null);

  // Form State
  const [userId, setUserId] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('STAFF');
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const list = await fetchUsersApi();
      setUsers(list || []);
    } catch (err) {
      showToast('Failed to load user accounts: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadUsers();
      setActiveTab('list');
      setEditingUser(null);
      resetForm();
    }
  }, [isOpen]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const resetForm = () => {
    setUserId('');
    setFullName('');
    setPassword('');
    setRole('STAFF');
    setSelectedPermissions(ALL_SYSTEM_PERMISSIONS.map(p => p.id));
    setFormError('');
    setEditingUser(null);
  };

  const handleOpenAddForm = () => {
    if (!isAdmin) {
      showToast('Access Restricted: Only Administrators can create new users.', 'error');
      return;
    }
    resetForm();
    setEditingUser(null);
    setActiveTab('form');
  };

  const handleOpenEditForm = (u) => {
    if (!isAdmin) {
      showToast('Access Restricted: Only Administrators can edit user permissions.', 'error');
      return;
    }
    setEditingUser(u);
    setUserId(u.userId);
    setFullName(u.fullName || '');
    setPassword('');
    setRole(u.role || 'STAFF');
    if (u.permissions === 'all') {
      setSelectedPermissions(ALL_SYSTEM_PERMISSIONS.map(p => p.id));
    } else if (u.permissions) {
      setSelectedPermissions(u.permissions.split(',').map(s => s.trim()).filter(Boolean));
    } else {
      setSelectedPermissions([]);
    }
    setFormError('');
    setActiveTab('form');
  };

  const togglePermission = (permId) => {
    setSelectedPermissions(prev => 
      prev.includes(permId) ? prev.filter(p => p !== permId) : [...prev, permId]
    );
  };

  const handlePreset = (type) => {
    if (type === 'all') {
      setSelectedPermissions(ALL_SYSTEM_PERMISSIONS.map(p => p.id));
    } else if (type === 'billing') {
      setSelectedPermissions([
        'dashboard', 'master', 'customer-master', 
        'challan', 'challan-list', 'proforma-invoice', 'proforma-invoice-history',
        'gate-pass', 'gate-pass-list', 'job-card', 'job-card-history',
        'work-completion', 'work-completion-history'
      ]);
    } else if (type === 'dispatch') {
      setSelectedPermissions([
        'dashboard', 'gate-pass', 'gate-pass-list', 'job-card', 'job-card-history', 'work-completion', 'work-completion-history'
      ]);
    } else if (type === 'audit') {
      setSelectedPermissions([
        'dashboard', 'challan', 'challan-list', 'sales-ledger', 'purchase-ledger'
      ]);
    } else if (type === 'clear') {
      setSelectedPermissions([]);
    }
  };

  const handleSubmitUser = async (e) => {
    e.preventDefault();
    if (!userId.trim()) {
      setFormError('User ID is required.');
      return;
    }
    if (!fullName.trim()) {
      setFormError('Full Name is required.');
      return;
    }
    if (!editingUser && !password.trim()) {
      setFormError('Password is required for new user.');
      return;
    }
    if (selectedPermissions.length === 0 && role !== 'ADMIN') {
      setFormError('Please allow at least 1 module permission for this user.');
      return;
    }

    try {
      setSaving(true);
      setFormError('');

      const permissionsStr = role === 'ADMIN' && selectedPermissions.length === ALL_SYSTEM_PERMISSIONS.length 
        ? 'all' 
        : selectedPermissions.join(',');

      if (editingUser) {
        await updateUserApi(editingUser.id, {
          fullName: fullName.trim(),
          role,
          permissions: permissionsStr,
          ...(password.trim() ? { password: password.trim() } : {})
        });
        showToast(`User '${userId}' updated successfully!`, 'success');
      } else {
        await createUserApi({
          userId: userId.trim().toLowerCase(),
          fullName: fullName.trim(),
          password: password.trim(),
          role,
          permissions: permissionsStr
        });
        showToast(`User '${userId}' created successfully!`, 'success');
      }

      await loadUsers();
      setActiveTab('list');
      resetForm();
    } catch (err) {
      setFormError(err.message || 'Operation failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async (id, name, uid) => {
    if (uid.toLowerCase() === 'admin') {
      showToast('Master Admin account cannot be deleted.', 'error');
      return;
    }
    if (!window.confirm(`Are you sure you want to delete user '${name}' (${uid})?`)) {
      return;
    }

    try {
      setLoading(true);
      await deleteUserApi(id);
      showToast(`User '${name}' deleted successfully.`, 'success');
      await loadUsers();
    } catch (err) {
      showToast('Delete failed: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div 
      style={{ 
        position: 'fixed', 
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 999999, 
        background: 'rgba(5, 8, 16, 0.82)', 
        backdropFilter: 'blur(10px)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: '1.25rem',
        boxSizing: 'border-box'
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div 
        className="glass-panel" 
        style={{ 
          width: '100%', 
          maxWidth: '880px', 
          maxHeight: '90vh',
          background: 'var(--bg-card-solid, #0f172a)', 
          border: '1.5px solid rgba(99, 102, 241, 0.45)', 
          borderRadius: '16px', 
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 80px rgba(0,0,0,0.85), 0 0 40px rgba(99, 102, 241, 0.2)',
          overflow: 'hidden',
          animation: 'fadeIn 0.2s ease-out'
        }}
      >
        {/* Toast Notification inside modal */}
        {toast && (
          <div style={{
            position: 'absolute',
            top: '1rem',
            right: '1.5rem',
            zIndex: 100,
            background: toast.type === 'error' ? 'rgba(239, 68, 68, 0.95)' : 'rgba(16, 185, 129, 0.95)',
            color: 'white',
            padding: '0.6rem 1rem',
            borderRadius: '8px',
            fontSize: '0.8rem',
            fontWeight: 700,
            boxShadow: '0 8px 20px rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            animation: 'fadeIn 0.2s ease-out'
          }}>
            {toast.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
            <span>{toast.message}</span>
          </div>
        )}

        {/* Modal Top Header */}
        <div style={{ 
          padding: '1.15rem 1.5rem', 
          borderBottom: '1px solid var(--border-color)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          background: 'rgba(30, 41, 59, 0.6)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8' }}>
              <Shield size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                  User Management & Permissions Portal
                </h2>
                {isAdmin ? (
                  <span style={{ fontSize: '0.65rem', padding: '2px 8px', borderRadius: '6px', background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', fontWeight: 800, border: '1px solid rgba(16, 185, 129, 0.4)' }}>
                    ADMIN ACCESS
                  </span>
                ) : (
                  <span style={{ fontSize: '0.65rem', padding: '2px 8px', borderRadius: '6px', background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', fontWeight: 800, border: '1px solid rgba(239, 68, 68, 0.4)' }}>
                    STAFF (READ ONLY)
                  </span>
                )}
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                {isAdmin ? 'Create accounts, assign roles, and grant granular module access.' : 'Viewing registered system accounts. Only Administrators can modify users.'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={onClose}
              className="btn btn-outline"
              style={{ padding: '0.4rem', borderRadius: '8px', color: 'var(--text-muted)' }}
              title="Close (Esc)"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div style={{ padding: '0.75rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(15, 23, 42, 0.5)' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => { setActiveTab('list'); resetForm(); }}
              className={`btn ${activeTab === 'list' ? 'btn-primary' : 'btn-outline'}`}
              style={{ fontSize: '0.8rem', padding: '0.4rem 0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Users size={15} />
              <span>User Accounts ({users.length})</span>
            </button>

            {isAdmin && (
              <button
                onClick={handleOpenAddForm}
                className={`btn ${activeTab === 'form' && !editingUser ? 'btn-secondary' : 'btn-outline'}`}
                style={{ fontSize: '0.8rem', padding: '0.4rem 0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <UserPlus size={15} />
                <span>+ Create New User</span>
              </button>
            )}
          </div>

          <button
            onClick={loadUsers}
            className="btn btn-outline"
            style={{ padding: '0.4rem', fontSize: '0.75rem' }}
            title="Refresh Users"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        {/* Modal Main Scrollable Content */}
        <div style={{ padding: '1.25rem 1.5rem', overflowY: 'auto', flex: 1 }}>
          
          {/* TAB 1: USERS LIST VIEW */}
          {activeTab === 'list' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  Loading user accounts...
                </div>
              ) : users.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  No users found. Click "+ Create New User" above to add one.
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1rem' }}>
                  {users.map(u => {
                    const isMasterAdmin = u.userId.toLowerCase() === 'admin';
                    const isCurrent = currentUser && currentUser.userId && currentUser.userId.toLowerCase() === u.userId.toLowerCase();
                    const permsList = u.permissions === 'all' 
                      ? ALL_SYSTEM_PERMISSIONS 
                      : (u.permissions ? u.permissions.split(',').map(s => s.trim()) : []);

                    return (
                      <div 
                        key={u.id || u.userId}
                        style={{
                          background: 'rgba(30, 41, 59, 0.5)',
                          border: isMasterAdmin ? '1.5px solid rgba(99, 102, 241, 0.5)' : '1px solid var(--border-color)',
                          borderRadius: '12px',
                          padding: '1rem 1.15rem',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.75rem',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {/* User Card Top Row */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                            <div style={{ 
                              width: '36px', 
                              height: '36px', 
                              borderRadius: '50%', 
                              background: isMasterAdmin ? 'linear-gradient(135deg, #4f46e5 0%, #10b981 100%)' : 'rgba(56, 189, 248, 0.2)', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              fontWeight: 800,
                              fontSize: '0.85rem',
                              color: isMasterAdmin ? 'white' : '#38bdf8'
                            }}>
                              {(u.fullName || u.userId).charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <span style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '0.9rem' }}>
                                  {u.fullName || u.userId}
                                </span>
                                {isCurrent && (
                                  <span style={{ fontSize: '0.625rem', padding: '1px 5px', borderRadius: '4px', background: 'rgba(52, 211, 153, 0.2)', color: '#34d399', fontWeight: 700 }}>
                                    YOU
                                  </span>
                                )}
                              </div>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                User ID: <strong style={{ color: '#818cf8' }}>{u.userId}</strong>
                              </span>
                            </div>
                          </div>

                          {/* Role Badge */}
                          <span style={{ 
                            fontSize: '0.7rem', 
                            padding: '3px 8px', 
                            borderRadius: '12px', 
                            fontWeight: 800,
                            background: isMasterAdmin ? 'rgba(99, 102, 241, 0.25)' : 'rgba(56, 189, 248, 0.15)',
                            color: isMasterAdmin ? '#818cf8' : '#38bdf8',
                            border: isMasterAdmin ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid rgba(56, 189, 248, 0.3)'
                          }}>
                            {u.role || 'STAFF'}
                          </span>
                        </div>

                        {/* Permissions Summary */}
                        <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '0.6rem 0.75rem', borderRadius: '8px', fontSize: '0.75rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                            <span style={{ color: 'var(--text-subtle)', fontWeight: 600 }}>Allowed Modules:</span>
                            <span style={{ color: '#34d399', fontWeight: 800 }}>
                              {u.permissions === 'all' ? 'Full Access (All 15 Modules)' : `${permsList.length} of ${ALL_SYSTEM_PERMISSIONS.length} Modules`}
                            </span>
                          </div>
                          
                          {/* Module Pills preview */}
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', maxHeight: '52px', overflow: 'hidden' }}>
                            {u.permissions === 'all' ? (
                              <span style={{ fontSize: '0.675rem', padding: '1px 6px', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', fontWeight: 600 }}>
                                ✨ Master Administrator (Unrestricted Access)
                              </span>
                            ) : permsList.length === 0 ? (
                              <span style={{ fontSize: '0.675rem', color: '#f87171' }}>No permissions assigned</span>
                            ) : (
                              permsList.slice(0, 6).map(pId => {
                                const pObj = ALL_SYSTEM_PERMISSIONS.find(x => x.id === pId);
                                return (
                                  <span key={pId} style={{ fontSize: '0.65rem', padding: '1px 6px', borderRadius: '4px', background: 'rgba(255, 255, 255, 0.06)', color: 'var(--text-main)' }}>
                                    {pObj ? pObj.label : pId}
                                  </span>
                                );
                              })
                            )}
                            {u.permissions !== 'all' && permsList.length > 6 && (
                              <span style={{ fontSize: '0.65rem', color: 'var(--text-subtle)' }}>
                                +{permsList.length - 6} more...
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Actions Row */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.6rem' }}>
                          {isAdmin ? (
                            <>
                              <button
                                onClick={() => handleOpenEditForm(u)}
                                className="btn btn-outline"
                                style={{ fontSize: '0.75rem', padding: '0.3rem 0.65rem', color: '#fbbf24', borderColor: 'rgba(251, 191, 36, 0.3)' }}
                              >
                                <Edit3 size={12} />
                                <span>Edit & Permissions</span>
                              </button>

                              {!isMasterAdmin && (
                                <button
                                  onClick={() => handleDeleteUser(u.id, u.fullName, u.userId)}
                                  className="btn btn-outline"
                                  style={{ fontSize: '0.75rem', padding: '0.3rem 0.65rem', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                                >
                                  <Trash2 size={12} />
                                  <span>Delete</span>
                                </button>
                              )}
                            </>
                          ) : (
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                              <Lock size={12} color="#94a3b8" />
                              <span>Admin Access Required to Edit</span>
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CREATE / EDIT USER FORM */}
          {activeTab === 'form' && (
            <form onSubmit={handleSubmitUser} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              {formError && (
                <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', padding: '0.65rem 1rem', borderRadius: '8px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <AlertCircle size={16} />
                  <span>{formError}</span>
                </div>
              )}

              {/* Basic Details Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', background: 'rgba(30, 41, 59, 0.4)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <div>
                  <label className="form-label">User ID (Login ID) *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. staff1, billing_op"
                    value={userId}
                    onChange={e => setUserId(e.target.value)}
                    disabled={!!editingUser}
                    required
                  />
                </div>

                <div>
                  <label className="form-label">Full Name / Designation *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Karthik - Billing Officer"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="form-label">
                    {editingUser ? 'New Password (Optional)' : 'Password *'}
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="form-input"
                      placeholder={editingUser ? 'Leave blank to keep current' : 'Enter login password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required={!editingUser}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="form-label">Role</label>
                  <select
                    className="form-select"
                    value={role}
                    onChange={e => {
                      const newRole = e.target.value;
                      setRole(newRole);
                      if (newRole === 'ADMIN') handlePreset('all');
                    }}
                  >
                    <option value="STAFF">Billing & Operations Staff</option>
                    <option value="OPERATOR">Data Entry Operator</option>
                    <option value="MANAGER">Manager / Supervisor</option>
                    <option value="ACCOUNTANT">Accountant / Auditor</option>
                    <option value="ADMIN">System Administrator</option>
                  </select>
                </div>
              </div>

              {/* MODULE ACCESS & PERMISSIONS SECTION */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Shield size={16} color="#818cf8" />
                      <span>Select Allowed Modules & Pages ({selectedPermissions.length}/{ALL_SYSTEM_PERMISSIONS.length})</span>
                    </h3>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                      Only checked features will appear in this user's Navbar, Sidebar, and Dashboard.
                    </p>
                  </div>

                  {/* Preset Shortcuts */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-subtle)', fontWeight: 600 }}>Presets:</span>
                    <button type="button" onClick={() => handlePreset('all')} className="btn btn-outline" style={{ fontSize: '0.7rem', padding: '0.25rem 0.55rem' }}>
                      All Access
                    </button>
                    <button type="button" onClick={() => handlePreset('billing')} className="btn btn-outline" style={{ fontSize: '0.7rem', padding: '0.25rem 0.55rem' }}>
                      Billing Only
                    </button>
                    <button type="button" onClick={() => handlePreset('dispatch')} className="btn btn-outline" style={{ fontSize: '0.7rem', padding: '0.25rem 0.55rem' }}>
                      Gate Pass & Dispatch
                    </button>
                    <button type="button" onClick={() => handlePreset('audit')} className="btn btn-outline" style={{ fontSize: '0.7rem', padding: '0.25rem 0.55rem' }}>
                      Audit Only
                    </button>
                    <button type="button" onClick={() => handlePreset('clear')} className="btn btn-outline" style={{ fontSize: '0.7rem', padding: '0.25rem 0.55rem', color: '#f87171' }}>
                      Clear
                    </button>
                  </div>
                </div>

                {/* Categorized Permission Checkboxes Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem' }}>
                  {PERMISSION_GROUPS.map(group => {
                    const IconComp = group.icon;
                    const groupPerms = ALL_SYSTEM_PERMISSIONS.filter(p => group.permissions.includes(p.id));
                    const isGroupAllSelected = groupPerms.every(p => selectedPermissions.includes(p.id));

                    return (
                      <div 
                        key={group.name}
                        style={{
                          background: 'rgba(15, 23, 42, 0.6)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '10px',
                          padding: '0.75rem',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.5rem'
                        }}
                      >
                        {/* Group Header */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.4rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: group.color, fontWeight: 700, fontSize: '0.8rem' }}>
                            <IconComp size={15} />
                            <span>{group.name}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              if (isGroupAllSelected) {
                                setSelectedPermissions(prev => prev.filter(p => !group.permissions.includes(p)));
                              } else {
                                setSelectedPermissions(prev => Array.from(new Set([...prev, ...group.permissions])));
                              }
                            }}
                            style={{ background: 'none', border: 'none', color: isGroupAllSelected ? '#34d399' : 'var(--text-subtle)', fontSize: '0.65rem', cursor: 'pointer', fontWeight: 600 }}
                          >
                            {isGroupAllSelected ? 'Deselect All' : 'Select All'}
                          </button>
                        </div>

                        {/* Individual Checkboxes */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                          {groupPerms.map(perm => {
                            const isChecked = selectedPermissions.includes(perm.id);

                            return (
                              <label
                                key={perm.id}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.5rem',
                                  fontSize: '0.78rem',
                                  cursor: 'pointer',
                                  padding: '0.3rem 0.4rem',
                                  borderRadius: '6px',
                                  background: isChecked ? 'rgba(99, 102, 241, 0.12)' : 'transparent',
                                  transition: 'background 0.1s ease',
                                  color: isChecked ? 'var(--text-main)' : 'var(--text-muted)'
                                }}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => togglePermission(perm.id)}
                                  style={{ cursor: 'pointer' }}
                                />
                                <span>{perm.label}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Form Bottom Submit Actions */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => { setActiveTab('list'); resetForm(); }}
                  className="btn btn-outline"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <Check size={16} />
                  <span>{saving ? 'Saving...' : editingUser ? 'Update User & Permissions' : 'Save & Create User'}</span>
                </button>
              </div>

            </form>
          )}

        </div>

      </div>
    </div>,
    document.body
  );
};
