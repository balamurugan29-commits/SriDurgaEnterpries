import React, { useState, useEffect } from 'react';
import { fetchCustomers, createCustomer, updateCustomer, deleteCustomer } from '../services/api';
import { CustomerModal } from '../components/CustomerModal';
import { ExportDesignerModal } from '../components/ExportDesignerModal';
import { Toast } from '../components/Toast';
import { 
  Building2, 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  RefreshCw, 
  Phone, 
  MapPin, 
  Download, 
  ChevronRight as BreadcrumbChevron, 
  Eye, 
  X, 
  FileText, 
  ShieldCheck, 
  Calendar, 
  Hash, 
  CheckCircle2,
  Copy
} from 'lucide-react';

const CUSTOMER_COLUMNS = [
  { key: 'serialNumber', label: 'S.NO.' },
  { key: 'customerName', label: 'CUSTOMER / COMPANY NAME' },
  { key: 'address', label: 'CUSTOMER ADDRESS' },
  { key: 'phone', label: 'CUSTOMER PHONE / MOBILE' },
  { key: 'pan', label: 'CUSTOMER PAN' },
  { key: 'gstin', label: 'CUSTOMER GSTIN' },
  { key: 'stateCode', label: 'CUSTOMER STATE CODE' },
  { key: 'poNumber', label: 'P.O. NUMBER / REF.' },
  { key: 'poDate', label: 'P.O. DATE' },
  { key: 'vendorCode', label: 'VENDOR CODE' },
  { key: 'sacCode', label: 'SAC / HSN CODE' },
  { key: 'contractNo', label: 'CONTRACT NUMBER' },
  { key: 'contractPeriod', label: 'CON. PERIOD' },
  { key: 'bgNo', label: 'B.G. NO' }
];

export const CustomerMasterPage = () => {
  const [customers, setCustomers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [viewCustomer, setViewCustomer] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const data = await fetchCustomers(searchQuery);
      setCustomers(data || []);
    } catch (err) {
      console.error('Failed to load customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, [searchQuery]);

  const handleCreateNew = () => {
    setSelectedCustomer(null);
    setModalOpen(true);
  };

  const handleEdit = (customer) => {
    setSelectedCustomer(customer);
    setModalOpen(true);
  };

  const handleView = (customer) => {
    setViewCustomer(customer);
  };

  const handleDelete = async (customer) => {
    if (!window.confirm(`Are you sure you want to delete customer '${customer.customerName}'?`)) {
      return;
    }
    try {
      await deleteCustomer(customer.id);
      setToast({ message: `Customer '${customer.customerName}' deleted successfully`, type: 'success' });
      loadCustomers();
      if (viewCustomer && viewCustomer.id === customer.id) {
        setViewCustomer(null);
      }
    } catch (err) {
      setToast({ message: 'Delete failed: ' + err.message, type: 'error' });
    }
  };

  const handleSaveCustomer = async (customerData) => {
    try {
      if (selectedCustomer) {
        await updateCustomer(selectedCustomer.id, customerData);
        setToast({ message: `Customer '${customerData.customerName}' updated successfully!`, type: 'success' });
      } else {
        await createCustomer(customerData);
        setToast({ message: `Customer '${customerData.customerName}' added to Directory!`, type: 'success' });
      }
      setModalOpen(false);
      loadCustomers();
      if (viewCustomer && selectedCustomer && viewCustomer.id === selectedCustomer.id) {
        setViewCustomer({ ...viewCustomer, ...customerData });
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />

      {/* Breadcrumb & Header Banner */}
      <div style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.18) 0%, rgba(99, 102, 241, 0.12) 100%)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '16px', padding: '1.25rem 1.5rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.25)', padding: '0.75rem', borderRadius: '12px', color: '#34d399' }}>
            <Building2 size={28} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
              <span style={{ fontWeight: 600 }}>Master Page</span>
              <BreadcrumbChevron size={12} />
              <span style={{ color: '#34d399', fontWeight: 700 }}>Customer Directory Master</span>
            </div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'white', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              Customer & Party Directory
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
              Master database of clients, billing addresses, GSTIN, PAN, and direct contract connections.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexWrap: 'wrap' }}>
          <button 
            onClick={() => setExportModalOpen(true)}
            className="btn btn-outline" 
            style={{ fontSize: '0.85rem', color: '#34d399', borderColor: 'rgba(16, 185, 129, 0.4)' }}
          >
            <Download size={16} />
            <span>Export Catalog</span>
          </button>

          <button 
            onClick={handleCreateNew} 
            className="btn btn-primary" 
            style={{ fontSize: '0.85rem', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
          >
            <Plus size={16} />
            <span>Add New Customer</span>
          </button>
        </div>
      </div>

      {/* Search & Statistics Bar */}
      <div className="glass-panel" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '280px', maxWidth: '450px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '2.25rem', fontSize: '0.85rem' }}
            placeholder="Search by name, GSTIN, PAN, phone, or contract..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '0.4rem 0.85rem', borderRadius: '10px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></span>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#34d399' }}>
              {customers.length} Registered Parties
            </span>
          </div>

          <button 
            onClick={loadCustomers} 
            className="btn btn-outline" 
            style={{ padding: '0.5rem 0.75rem' }}
            title="Refresh Directory"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Customer Directory Table with All 12 Fields */}
      <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Building2 size={18} color="#34d399" />
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
              Master Customer Registry & Tax Parameters
            </h3>
          </div>

          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Total Registered: <strong>{customers.length}</strong>
          </span>
        </div>

        <div className="custom-table-container" style={{ border: 'none', borderRadius: 0, overflowX: 'auto' }}>
          <table className="custom-table" style={{ minWidth: '1100px' }}>
            <thead>
              <tr>
                <th style={{ width: '45px', textAlign: 'center' }}>S.No</th>
                <th style={{ width: '220px' }}>Customer / Company Name</th>
                <th style={{ width: '200px' }}>Customer Address</th>
                <th style={{ width: '150px' }}>Phone / Mobile & PAN</th>
                <th style={{ width: '160px' }}>GSTIN & State Code</th>
                <th style={{ width: '160px' }}>P.O. Number & Date</th>
                <th style={{ width: '130px' }}>Vendor & SAC Code</th>
                <th style={{ width: '160px' }}>Contract & Validity</th>
                <th style={{ width: '100px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 0.5rem auto' }} />
                    <p style={{ margin: 0 }}>Loading customer directory...</p>
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No customer records found. Click '+ Add New Customer' to register one.
                  </td>
                </tr>
              ) : (
                customers.map((cust, idx) => {
                  const stateVal = cust.stateCode || (cust.gstin && cust.gstin.startsWith('34') ? 'Puducherry (34)' : cust.gstin && cust.gstin.startsWith('33') ? 'Tamil Nadu (33)' : 'N/A');
                  return (
                    <tr key={cust.id} style={{ transition: 'background-color 0.15s' }}>
                      <td style={{ textAlign: 'center', fontWeight: 600, color: 'var(--text-muted)' }}>
                        {idx + 1}
                      </td>
                      <td style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                        <div style={{ fontSize: '0.925rem', marginBottom: '2px' }}>{cust.customerName}</div>
                        {cust.vendorCode && (
                          <div style={{ fontSize: '0.75rem', color: '#fbbf24', fontWeight: 600 }}>
                            Vendor Code: <span>{cust.vendorCode}</span>
                          </div>
                        )}
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.825rem', lineHeight: 1.4 }}>
                        {cust.address ? (
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.3rem' }}>
                            <MapPin size={13} color="#818cf8" style={{ flexShrink: 0, marginTop: '2px' }} />
                            <span>{cust.address}</span>
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-subtle)' }}>No address</span>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                          {cust.phone ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-main)', fontSize: '0.825rem', fontWeight: 600 }}>
                              <Phone size={12} color="#818cf8" /> {cust.phone}
                            </span>
                          ) : (
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>No Phone</span>
                          )}
                          {cust.pan ? (
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', fontWeight: 600 }}>
                              PAN: <strong>{cust.pan}</strong>
                            </span>
                          ) : null}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                          <span className="badge badge-code" style={{ color: '#34d399', borderColor: 'rgba(16, 185, 129, 0.3)', background: 'rgba(16, 185, 129, 0.15)', fontSize: '0.775rem' }}>
                            {cust.gstin || 'No GSTIN'}
                          </span>
                          <span style={{ 
                            display: 'inline-block',
                            fontSize: '0.725rem',
                            fontWeight: 700,
                            color: '#38bdf8',
                            background: 'rgba(56, 189, 248, 0.1)',
                            padding: '0.15rem 0.4rem',
                            borderRadius: '4px',
                            border: '1px solid rgba(56, 189, 248, 0.2)'
                          }}>
                            {stateVal}
                          </span>
                        </div>
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {cust.poNumber ? (
                          <div>
                            <div>PO: <strong style={{ color: '#818cf8' }}>{cust.poNumber}</strong></div>
                            {cust.poDate && <div style={{ fontSize: '0.725rem', color: 'var(--text-subtle)' }}>Date: {cust.poDate}</div>}
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-subtle)' }}>-</span>
                        )}
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        <div>Vendor: <strong style={{ color: '#fbbf24' }}>{cust.vendorCode || '-'}</strong></div>
                        <div>SAC: <strong style={{ color: '#34d399' }}>{cust.sacCode || '-'}</strong></div>
                      </td>
                      <td style={{ fontSize: '0.775rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                        {cust.contractNo && <div>Contract: <strong style={{ color: '#38bdf8' }}>{cust.contractNo}</strong></div>}
                        {cust.contractPeriod && <div>Period: <span>{cust.contractPeriod}</span></div>}
                        {cust.bgNo && <div>BG: <span style={{ color: '#94a3b8' }}>{cust.bgNo}</span></div>}
                        {!cust.contractNo && !cust.contractPeriod && !cust.bgNo && (
                          <span style={{ color: 'var(--text-subtle)' }}>-</span>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
                          <button 
                            onClick={() => handleView(cust)} 
                            className="btn btn-outline" 
                            style={{ padding: '0.35rem 0.45rem', color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.3)' }}
                            title="View Full Customer Profile"
                          >
                            <Eye size={13} />
                          </button>
                          <button 
                            onClick={() => handleEdit(cust)} 
                            className="btn btn-outline" 
                            style={{ padding: '0.35rem 0.45rem', color: '#818cf8', borderColor: 'rgba(99, 102, 241, 0.3)' }}
                            title="Edit Customer Details"
                          >
                            <Edit3 size={13} />
                          </button>
                          <button 
                            onClick={() => handleDelete(cust)} 
                            className="btn btn-danger" 
                            style={{ padding: '0.35rem 0.45rem' }}
                            title="Delete Customer"
                          >
                            <Trash2 size={13} />
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

      {/* Customer Full Profile Card Modal (View Details) */}
      {viewCustomer && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '720px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-card-solid)', border: '1px solid var(--border-color-accent)', borderRadius: '16px', overflow: 'hidden' }}>
            
            {/* Modal Header */}
            <div style={{ padding: '1.25rem 1.5rem', background: 'var(--bg-card)', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#34d399' }}>
                <Building2 size={24} />
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                    {viewCustomer.customerName}
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Customer Master Profile & Direct Tax Invoice Connection
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button 
                  onClick={() => {
                    setSelectedCustomer(viewCustomer);
                    setViewCustomer(null);
                    setModalOpen(true);
                  }}
                  className="btn btn-outline" 
                  style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem', color: '#818cf8', borderColor: 'rgba(99, 102, 241, 0.4)' }}
                >
                  <Edit3 size={14} /> Edit
                </button>
                <button onClick={() => setViewCustomer(null)} className="btn btn-outline" style={{ padding: '0.4rem' }}>
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Modal Body: All 12 Fields Display */}
            <div style={{ padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              {/* 1. Address & Contact Information */}
              <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1rem 1.25rem' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#34d399', textTransform: 'uppercase', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>
                  1. Contact & Address Details
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  <div style={{ gridColumn: 'span 2' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '2px' }}>Customer Address</div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 600 }}>{viewCustomer.address || 'N/A'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '2px' }}>Customer Phone / Mobile</div>
                    <div style={{ fontSize: '0.9rem', color: '#818cf8', fontWeight: 700 }}>{viewCustomer.phone || 'N/A'}</div>
                  </div>
                </div>
              </div>

              {/* 2. Tax & Statutory Identifiers */}
              <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1rem 1.25rem' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>
                  2. Tax & GST Identifiers
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '2px' }}>Customer GSTIN</div>
                    <div style={{ fontSize: '0.9rem', color: '#34d399', fontWeight: 700 }}>{viewCustomer.gstin || 'N/A'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '2px' }}>Customer PAN</div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 700 }}>{viewCustomer.pan || 'N/A'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '2px' }}>Customer State Code</div>
                    <div style={{ fontSize: '0.9rem', color: '#38bdf8', fontWeight: 700 }}>{viewCustomer.stateCode || 'N/A'}</div>
                  </div>
                </div>
              </div>

              {/* 3. Contract, PO & Billing Parameters */}
              <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1rem 1.25rem' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#fbbf24', textTransform: 'uppercase', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>
                  3. P.O., Contract & Billing Parameters
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '2px' }}>P.O. Number / Ref.</div>
                    <div style={{ fontSize: '0.9rem', color: '#818cf8', fontWeight: 700 }}>{viewCustomer.poNumber || 'N/A'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '2px' }}>P.O. Date</div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 600 }}>{viewCustomer.poDate || 'N/A'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '2px' }}>Vendor Code</div>
                    <div style={{ fontSize: '0.9rem', color: '#fbbf24', fontWeight: 700 }}>{viewCustomer.vendorCode || 'N/A'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '2px' }}>SAC / HSN Code</div>
                    <div style={{ fontSize: '0.9rem', color: '#34d399', fontWeight: 700 }}>{viewCustomer.sacCode || 'N/A'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '2px' }}>Contract Number</div>
                    <div style={{ fontSize: '0.9rem', color: '#38bdf8', fontWeight: 700 }}>{viewCustomer.contractNo || 'N/A'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '2px' }}>CON. Period</div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 600 }}>{viewCustomer.contractPeriod || 'N/A'}</div>
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '2px' }}>B.G. No</div>
                    <div style={{ fontSize: '0.9rem', color: '#94a3b8', fontWeight: 600 }}>{viewCustomer.bgNo || 'N/A'}</div>
                  </div>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div style={{ padding: '1rem 1.5rem', background: 'var(--bg-card)', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setViewCustomer(null)} className="btn btn-outline" style={{ padding: '0.5rem 1.25rem' }}>
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      <CustomerModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveCustomer}
        customer={selectedCustomer}
      />

      <ExportDesignerModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        title="Customer Directory Master Details"
        data={customers}
        availableColumns={CUSTOMER_COLUMNS}
      />
    </div>
  );
};
