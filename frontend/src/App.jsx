import React, { useState, Suspense, lazy } from 'react';
import { HashRouter, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SettingsProvider, useSettings } from './context/SettingsContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { AppSettingsModal } from './components/AppSettingsModal';
import { LoginPage } from './pages/LoginPage';
import { ShieldAlert, Loader2 } from 'lucide-react';

// Code-split page components for optimal bundle performance
const DashboardPage = lazy(() => import('./pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const MasterPage = lazy(() => import('./pages/MasterPage').then(m => ({ default: m.MasterPage })));
const CustomerMasterPage = lazy(() => import('./pages/CustomerMasterPage').then(m => ({ default: m.CustomerMasterPage })));
const CompanyDetailsPage = lazy(() => import('./pages/CompanyDetailsPage').then(m => ({ default: m.CompanyDetailsPage })));
const WorkCompletionPage = lazy(() => import('./pages/WorkCompletionPage').then(m => ({ default: m.WorkCompletionPage })));
const WorkCompletionListPage = lazy(() => import('./pages/WorkCompletionListPage').then(m => ({ default: m.WorkCompletionListPage })));
const ChallanPage = lazy(() => import('./pages/ChallanPage').then(m => ({ default: m.ChallanPage })));
const ChallanListPage = lazy(() => import('./pages/ChallanListPage').then(m => ({ default: m.ChallanListPage })));
const JobCardPage = lazy(() => import('./pages/JobCardPage').then(m => ({ default: m.JobCardPage })));
const JobCardListPage = lazy(() => import('./pages/JobCardListPage').then(m => ({ default: m.JobCardListPage })));
const GatePassPage = lazy(() => import('./pages/GatePassPage').then(m => ({ default: m.GatePassPage })));
const GatePassListPage = lazy(() => import('./pages/GatePassListPage').then(m => ({ default: m.GatePassListPage })));
const SalesLedgerPage = lazy(() => import('./pages/SalesLedgerPage').then(m => ({ default: m.SalesLedgerPage })));
const PurchaseLedgerPage = lazy(() => import('./pages/PurchaseLedgerPage').then(m => ({ default: m.PurchaseLedgerPage })));
const ProformaInvoicePage = lazy(() => import('./pages/ProformaInvoicePage').then(m => ({ default: m.ProformaInvoicePage })));
const ProformaInvoiceListPage = lazy(() => import('./pages/ProformaInvoiceListPage').then(m => ({ default: m.ProformaInvoiceListPage })));

const PageLoader = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', gap: '0.75rem', color: 'var(--primary, #6366f1)' }}>
    <Loader2 className="animate-spin" size={28} />
    <span style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--text-muted)' }}>Loading module...</span>
  </div>
);

// Permission Guard Component for Route Protection
const PermissionGuard = ({ requiredPermission, children }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const isAllowed = !requiredPermission || 
    user?.role === 'ADMIN' || 
    user?.permissions === 'all' || 
    (user?.permissions && user.permissions.split(',').map(s => s.trim()).includes(requiredPermission));

  if (!isAllowed) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center', padding: '2rem' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: 'rgba(239, 68, 68, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', marginBottom: '1.25rem' }}>
          <ShieldAlert size={36} />
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
          Access Restricted
        </h2>
        <p style={{ maxWidth: '500px', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
          You do not have permission to access this module (<strong>{requiredPermission}</strong>). Please contact the Administrator to request access.
        </p>
        <button onClick={() => navigate('/dashboard')} className="btn btn-primary" style={{ padding: '0.6rem 1.25rem' }}>
          Return to Dashboard
        </button>
      </div>
    );
  }

  return children;
};

const MainApp = () => {
  const { user, isAuthenticated } = useAuth();
  const { layout, sidebarHidden } = useSettings();
  const navigate = useNavigate();
  const location = useLocation();

  // Determine activePage from current URL path
  const pathSegment = location.pathname.replace(/^\//, '') || 'dashboard';
  const activePage = pathSegment;

  const [editingChallan, setEditingChallan] = useState(null);
  const [editingProforma, setEditingProforma] = useState(null);
  const [editingJobCard, setEditingJobCard] = useState(null);
  const [editingCertificate, setEditingCertificate] = useState(null);
  const [editingGatePass, setEditingGatePass] = useState(null);

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // Unified page switcher that updates the browser URL
  const handleSetActivePage = (page) => {
    navigate(`/${page}`);
  };

  const handleEditChallanFromList = (challan) => {
    setEditingChallan(challan);
    navigate('/challan');
  };

  const handleClearEditingChallan = () => {
    setEditingChallan(null);
  };

  const handleEditProformaFromList = (proforma) => {
    setEditingProforma(proforma);
    navigate('/proforma-invoice');
  };

  const handleClearEditingProforma = () => {
    setEditingProforma(null);
  };

  const handleEditJobCardFromList = (jobCard) => {
    setEditingJobCard(jobCard);
    navigate('/job-card');
  };

  const handleClearEditingJobCard = () => {
    setEditingJobCard(null);
  };

  const handleEditCertificateFromList = (cert) => {
    setEditingCertificate(cert);
    navigate('/work-completion');
  };

  const handleClearEditingCertificate = () => {
    setEditingCertificate(null);
  };

  const handleEditGatePassFromList = (gatePass) => {
    setEditingGatePass(gatePass);
    navigate('/gate-pass');
  };

  const handleClearEditingGatePass = () => {
    setEditingGatePass(null);
  };

  const isTopLayout = layout === 'top' || layout === 'topbar';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-dark)' }}>
      <Navbar activePage={activePage} setActivePage={handleSetActivePage} />
      <div style={{ display: 'flex', flex: 1, position: 'relative' }}>
        {!sidebarHidden && (
          <Sidebar activePage={activePage} setActivePage={handleSetActivePage} />
        )}
        <main 
          className="app-main-content"
          style={{ 
            flex: 1, 
            padding: '1.5rem 2rem', 
            overflowY: 'auto', 
            maxHeight: isTopLayout ? 'calc(100vh - 110px)' : 'calc(100vh - 65px)',
            width: '100%',
            position: 'relative',
            zIndex: 1
          }}
        >
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<PermissionGuard requiredPermission="dashboard"><DashboardPage setActivePage={handleSetActivePage} /></PermissionGuard>} />
              <Route path="/master" element={<PermissionGuard requiredPermission="master"><MasterPage /></PermissionGuard>} />
              <Route path="/customer-master" element={<PermissionGuard requiredPermission="customer-master"><CustomerMasterPage /></PermissionGuard>} />
              <Route path="/company-details" element={<PermissionGuard requiredPermission="company-details"><CompanyDetailsPage /></PermissionGuard>} />
              <Route 
                path="/work-completion" 
                element={
                  <PermissionGuard requiredPermission="work-completion">
                    <WorkCompletionPage 
                      editingCertificate={editingCertificate}
                      onCancelEdit={handleClearEditingCertificate}
                    />
                  </PermissionGuard>
                } 
              />
              <Route 
                path="/work-completion-history" 
                element={
                  <PermissionGuard requiredPermission="work-completion-history">
                    <WorkCompletionListPage 
                      onEditCertificate={handleEditCertificateFromList}
                      onNewCertificate={() => {
                        handleClearEditingCertificate();
                        navigate('/work-completion');
                      }}
                    />
                  </PermissionGuard>
                } 
              />
              <Route 
                path="/work-completion-list" 
                element={<Navigate to="/work-completion-history" replace />} 
              />
              <Route 
                path="/challan" 
                element={
                  <PermissionGuard requiredPermission="challan">
                    <ChallanPage
                      initialChallan={editingChallan}
                      clearEditingChallan={handleClearEditingChallan}
                    />
                  </PermissionGuard>
                } 
              />
              <Route 
                path="/challan-list" 
                element={<PermissionGuard requiredPermission="challan-list"><ChallanListPage onEditChallan={handleEditChallanFromList} /></PermissionGuard>} 
              />
              <Route 
                path="/challans-list" 
                element={<Navigate to="/challan-list" replace />} 
              />
              <Route 
                path="/proforma-invoice" 
                element={
                  <PermissionGuard requiredPermission="proforma-invoice">
                    <ProformaInvoicePage
                      initialProforma={editingProforma}
                      clearEditingProforma={handleClearEditingProforma}
                    />
                  </PermissionGuard>
                } 
              />
              <Route 
                path="/proforma-invoice-history" 
                element={<PermissionGuard requiredPermission="proforma-invoice-history"><ProformaInvoiceListPage onEditProforma={handleEditProformaFromList} /></PermissionGuard>} 
              />
              <Route 
                path="/proforma-invoice-list" 
                element={<Navigate to="/proforma-invoice-history" replace />} 
              />
              <Route 
                path="/proforma-invoices" 
                element={<Navigate to="/proforma-invoice-history" replace />} 
              />
              <Route 
                path="/job-card" 
                element={
                  <PermissionGuard requiredPermission="job-card">
                    <JobCardPage 
                      editingJobCard={editingJobCard} 
                      onCancelEdit={handleClearEditingJobCard} 
                    />
                  </PermissionGuard>
                } 
              />
              <Route 
                path="/job-card-history" 
                element={
                  <PermissionGuard requiredPermission="job-card-history">
                    <JobCardListPage 
                      onEditJobCard={handleEditJobCardFromList}
                      onNewJobCard={() => {
                        handleClearEditingJobCard();
                        navigate('/job-card');
                      }}
                    />
                  </PermissionGuard>
                } 
              />
              <Route 
                path="/job-card-list" 
                element={<Navigate to="/job-card-history" replace />} 
              />
              <Route 
                path="/gate-pass" 
                element={
                  <PermissionGuard requiredPermission="gate-pass">
                    <GatePassPage 
                      editingGatePass={editingGatePass} 
                      onCancelEdit={handleClearEditingGatePass} 
                    />
                  </PermissionGuard>
                } 
              />
              <Route 
                path="/gate-pass-list" 
                element={<PermissionGuard requiredPermission="gate-pass-list"><GatePassListPage onEditGatePass={handleEditGatePassFromList} onNewGatePass={() => { handleClearEditingGatePass(); navigate('/gate-pass'); }} /></PermissionGuard>} 
              />
              <Route 
                path="/gate-pass-history" 
                element={<Navigate to="/gate-pass-list" replace />} 
              />
              <Route 
                path="/sales-ledger" 
                element={<PermissionGuard requiredPermission="sales-ledger"><SalesLedgerPage /></PermissionGuard>} 
              />
              <Route 
                path="/purchase-ledger" 
                element={<PermissionGuard requiredPermission="purchase-ledger"><PurchaseLedgerPage /></PermissionGuard>} 
              />
            </Routes>
          </Suspense>
        </main>
      </div>

      {/* Global App Settings Modal */}
      <AppSettingsModal />
    </div>
  );
};

export default function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <SettingsProvider>
          <MainApp />
        </SettingsProvider>
      </AuthProvider>
    </HashRouter>
  );
}
