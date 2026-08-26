import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SettingsProvider, useSettings } from './context/SettingsContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { AppSettingsModal } from './components/AppSettingsModal';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { MasterPage } from './pages/MasterPage';
import { CustomerMasterPage } from './pages/CustomerMasterPage';
import { WorkCompletionPage } from './pages/WorkCompletionPage';
import { WorkCompletionListPage } from './pages/WorkCompletionListPage';
import { ChallanPage } from './pages/ChallanPage';
import { ChallanListPage } from './pages/ChallanListPage';
import { JobCardPage } from './pages/JobCardPage';
import { JobCardListPage } from './pages/JobCardListPage';
import { GatePassPage } from './pages/GatePassPage';
import { GatePassListPage } from './pages/GatePassListPage';
import { SalesLedgerPage } from './pages/SalesLedgerPage';
import { PurchaseLedgerPage } from './pages/PurchaseLedgerPage';

const MainApp = () => {
  const { isAuthenticated } = useAuth();
  const { layout } = useSettings();
  const navigate = useNavigate();
  const location = useLocation();

  // Determine activePage from current URL path
  const pathSegment = location.pathname.replace(/^\//, '') || 'master';
  const activePage = pathSegment;

  const [editingChallan, setEditingChallan] = useState(null);
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

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-dark)' }}>
      <Navbar activePage={activePage} setActivePage={handleSetActivePage} />
      <div style={{ display: 'flex', flex: 1, position: 'relative' }}>
        <Sidebar activePage={activePage} setActivePage={handleSetActivePage} />
        <main 
          className="app-main-content"
          style={{ 
            flex: 1, 
            padding: '1.5rem 2rem', 
            overflowY: 'auto', 
            maxHeight: layout === 'top' ? 'calc(100vh - 110px)' : 'calc(100vh - 65px)',
            width: '100%',
            position: 'relative',
            zIndex: 1
          }}
        >
          <Routes>
            <Route path="/" element={<MasterPage />} />
            <Route path="/dashboard" element={<DashboardPage setActivePage={handleSetActivePage} />} />
            <Route path="/master" element={<MasterPage />} />
            <Route path="/customer-master" element={<CustomerMasterPage />} />
            <Route 
              path="/work-completion" 
              element={
                <WorkCompletionPage 
                  editingCertificate={editingCertificate}
                  onCancelEdit={handleClearEditingCertificate}
                />
              } 
            />
            <Route 
              path="/work-completion-history" 
              element={
                <WorkCompletionListPage 
                  onEditCertificate={handleEditCertificateFromList}
                  onNewCertificate={() => {
                    handleClearEditingCertificate();
                    navigate('/work-completion');
                  }}
                />
              } 
            />
            <Route 
              path="/work-completion-list" 
              element={<Navigate to="/work-completion-history" replace />} 
            />
            <Route 
              path="/challan" 
              element={
                <ChallanPage
                  initialChallan={editingChallan}
                  clearEditingChallan={handleClearEditingChallan}
                />
              } 
            />
            <Route 
              path="/challan-list" 
              element={<ChallanListPage onEditChallan={handleEditChallanFromList} />} 
            />
            <Route 
              path="/challans-list" 
              element={<Navigate to="/challan-list" replace />} 
            />
            <Route 
              path="/job-card" 
              element={
                <JobCardPage 
                  editingJobCard={editingJobCard} 
                  onCancelEdit={handleClearEditingJobCard} 
                />
              } 
            />
            <Route 
              path="/job-card-history" 
              element={
                <JobCardListPage 
                  onEditJobCard={handleEditJobCardFromList}
                  onNewJobCard={() => {
                    handleClearEditingJobCard();
                    navigate('/job-card');
                  }}
                />
              } 
            />
            <Route 
              path="/job-card-list" 
              element={<Navigate to="/job-card-history" replace />} 
            />
            <Route 
              path="/gate-pass" 
              element={
                <GatePassPage 
                  editingGatePass={editingGatePass} 
                  onCancelEdit={() => {
                    handleClearEditingGatePass();
                    navigate('/gate-pass-list');
                  }} 
                />
              } 
            />
            <Route 
              path="/gate-pass-list" 
              element={
                <GatePassListPage 
                  onEditGatePass={handleEditGatePassFromList}
                  onNewGatePass={() => {
                    handleClearEditingGatePass();
                    navigate('/gate-pass');
                  }}
                />
              } 
            />
            <Route 
              path="/gate-pass-history" 
              element={<Navigate to="/gate-pass-list" replace />} 
            />
            <Route path="/sales-ledger" element={<SalesLedgerPage />} />
            <Route path="/purchase-ledger" element={<PurchaseLedgerPage />} />
            <Route path="*" element={<Navigate to="/master" replace />} />
          </Routes>
        </main>
      </div>

      {/* Global App Settings Modal */}
      <AppSettingsModal />
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SettingsProvider>
          <MainApp />
        </SettingsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
