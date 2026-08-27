import React, { useState, useEffect } from 'react';
import { fetchCustomers, createCustomer, updateCustomer, deleteCustomer } from '../services/api';
import { CustomerModal } from '../components/CustomerModal';
import { ExportDesignerModal } from '../components/ExportDesignerModal';
import { Toast } from '../components/Toast';
import { Building2, Search, Plus, Edit3, Trash2, RefreshCw, Phone, MapPin, Download, ChevronRight as BreadcrumbChevron, FilterX } from 'lucide-react';

const CUSTOMER_COLUMNS = [
  { key: 'serialNumber', label: 'S.NO.' },
  { key: 'customerName', label: 'CUSTOMER / COMPANY NAME' },
  { key: 'gstin', label: 'GSTIN' },
  { key: 'pan', label: 'PAN' },
  { key: 'stateCode', label: 'STATE CODE' },
  { key: 'phone', label: 'PHONE' },
  { key: 'address', label: 'ADDRESS' }
];

export const CustomerMasterPage = () => {
  const [customers, setCustomers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
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

  const handleDelete = async (customer) => {
    if (!window.confirm(`Are you sure you want to delete customer '${customer.customerName}'?`)) {
      return;
    }
    try {
      await deleteCustomer(customer.id);
      setToast({ message: `Customer '${customer.customerName}' deleted successfully`, type: 'success' });
      loadCustomers();
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
    } catch (err) {
      setToast({ message: err.message || 'Operation failed', type: 'error' });
    }
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
            {/* Breadcrumb Navigation Trail */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
              <span style={{ fontWeight: 600 }}>Master Page</span>
              <BreadcrumbChevron size={12} />
              <span style={{ color: '#34d399', fontWeight: 700 }}>Customer Directory Master</span>
            </div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'white', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              Customer & Party Directory
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
              Maintain verified customer GSTIN, PAN, State Code, and billing address profiles for auto-fetch.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <span className="badge badge-code" style={{ color: '#34d399', borderColor: 'rgba(16, 185, 129, 0.4)', background: 'rgba(16, 185, 129, 0.15)', fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}>
            Directory: <strong>{customers.length}</strong> Parties Registered
          </span>
        </div>
      </div>

      {/* Top Search & Actions Toolbar */}
      <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '280px', maxWidth: '450px' }}>
          <Search size={18} color="var(--text-subtle)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '2.75rem', paddingRight: searchQuery ? '2.5rem' : '1rem' }}
            placeholder="Search Customers by Name, GSTIN, State..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <FilterX size={16} />
            </button>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button onClick={() => setExportModalOpen(true)} className="btn btn-outline" style={{ border: '1px solid rgba(16, 185, 129, 0.4)', color: '#34d399' }} title="Open Export Designer for Excel / PDF">
            <Download size={16} /> Export Designer
          </button>

          <button onClick={loadCustomers} className="btn btn-outline" style={{ fontSize: '0.8rem' }}>
            <RefreshCw size={15} /> Refresh
          </button>

          <button onClick={handleCreateNew} className="btn btn-secondary">
            <Plus size={16} />
            <span>+ Add New Customer</span>
          </button>
        </div>
      </div>

      {/* Customer Directory Table */}
      <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.5rem', background: 'rgba(15, 23, 42, 0.6)', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <Building2 size={20} color="#34d399" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
              Registered Customer Directory
            </h3>
          </div>

          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Total Registered: <strong>{customers.length}</strong>
          </span>
        </div>

        <div className="custom-table-container" style={{ border: 'none', borderRadius: 0 }}>
          <table className="custom-table">
            <thead>
              <tr>
                <th style={{ width: '50px', textAlign: 'center' }}>S.No</th>
                <th>Customer / Company Name</th>
                <th style={{ width: '160px' }}>GSTIN</th>
                <th style={{ width: '110px' }}>PAN</th>
                <th style={{ width: '140px' }}>State Code</th>
                <th style={{ width: '130px' }}>Phone / Mobile</th>
                <th>Registered Address</th>
                <th style={{ width: '90px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 0.5rem auto' }} />
                    <p style={{ margin: 0 }}>Loading customer directory...</p>
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No customer records found. Click '+ Add New Customer' to register one.
                  </td>
                </tr>
              ) : (
                customers.map((cust, idx) => {
                  const stateVal = cust.stateCode || (cust.gstin && cust.gstin.startsWith('34') ? 'Puducherry (34)' : cust.gstin && cust.gstin.startsWith('33') ? 'Tamil Nadu (33)' : 'N/A');
                  return (
                    <tr key={cust.id}>
                      <td style={{ textAlign: 'center', fontWeight: 600, color: 'var(--text-muted)' }}>
                        {idx + 1}
                      </td>
                      <td style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                        {cust.customerName}
                      </td>
                      <td>
                        <span className="badge badge-code" style={{ color: '#34d399', borderColor: 'rgba(16, 185, 129, 0.3)', background: 'rgba(16, 185, 129, 0.15)' }}>
                          {cust.gstin || 'N/A'}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-subtle)', fontWeight: 600 }}>
                        {cust.pan || 'N/A'}
                      </td>
                      <td>
                        <span style={{ 
                          display: 'inline-block',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          color: '#38bdf8',
                          background: 'rgba(56, 189, 248, 0.12)',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          border: '1px solid rgba(56, 189, 248, 0.25)'
                        }}>
                          {stateVal}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        {cust.phone ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                            <Phone size={12} color="#818cf8" /> {cust.phone}
                          </span>
                        ) : 'N/A'}
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem', maxWidth: '280px', lineHeight: 1.4 }}>
                        {cust.address || 'N/A'}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                          <button 
                            onClick={() => handleEdit(cust)} 
                            className="btn btn-outline" 
                            style={{ padding: '0.35rem 0.5rem', color: '#818cf8', borderColor: 'rgba(99, 102, 241, 0.3)' }}
                            title="Edit Customer Details"
                          >
                            <Edit3 size={13} />
                          </button>
                          <button 
                            onClick={() => handleDelete(cust)} 
                            className="btn btn-danger" 
                            style={{ padding: '0.35rem 0.5rem' }}
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
