import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
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

const MainApp = () => {
  const { isAuthenticated } = useAuth();
  const [activePage, setActivePage] = useState('master');
  const [editingChallan, setEditingChallan] = useState(null);
  const [editingJobCard, setEditingJobCard] = useState(null);
  const [editingCertificate, setEditingCertificate] = useState(null);
  const [editingGatePass, setEditingGatePass] = useState(null);

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const handleEditChallanFromList = (challan) => {
    setEditingChallan(challan);
    setActivePage('challan');
  };

  const handleClearEditingChallan = () => {
    setEditingChallan(null);
  };

  const handleEditJobCardFromList = (jobCard) => {
    setEditingJobCard(jobCard);
    setActivePage('job-card');
  };

  const handleClearEditingJobCard = () => {
    setEditingJobCard(null);
  };

  const handleEditCertificateFromList = (cert) => {
    setEditingCertificate(cert);
    setActivePage('work-completion');
  };

  const handleClearEditingCertificate = () => {
    setEditingCertificate(null);
  };

  const handleEditGatePassFromList = (gatePass) => {
    setEditingGatePass(gatePass);
    setActivePage('gate-pass');
  };

  const handleClearEditingGatePass = () => {
    setEditingGatePass(null);
  };

  const renderContent = () => {
    switch (activePage) {
      case 'dashboard':
        return <DashboardPage setActivePage={setActivePage} />;
      case 'master':
        return <MasterPage />;
      case 'customer-master':
        return <CustomerMasterPage />;
      case 'work-completion':
        return (
          <WorkCompletionPage 
            editingCertificate={editingCertificate}
            onCancelEdit={handleClearEditingCertificate}
          />
        );
      case 'work-completion-history':
      case 'work-completion-list':
        return (
          <WorkCompletionListPage 
            onEditCertificate={handleEditCertificateFromList}
            onNewCertificate={() => {
              handleClearEditingCertificate();
              setActivePage('work-completion');
            }}
          />
        );
      case 'challan':
        return (
          <ChallanPage
            initialChallan={editingChallan}
            clearEditingChallan={handleClearEditingChallan}
          />
        );
      case 'challan-list':
      case 'challans-list':
        return (
          <ChallanListPage
            onEditChallan={handleEditChallanFromList}
          />
        );
      case 'job-card':
        return (
          <JobCardPage 
            editingJobCard={editingJobCard} 
            onCancelEdit={handleClearEditingJobCard} 
          />
        );
      case 'job-card-history':
      case 'job-card-list':
        return (
          <JobCardListPage 
            onEditJobCard={handleEditJobCardFromList}
            onNewJobCard={() => {
              handleClearEditingJobCard();
              setActivePage('job-card');
            }}
          />
        );
      case 'gate-pass':
        return (
          <GatePassPage 
            editingGatePass={editingGatePass} 
            onCancelEdit={() => {
              handleClearEditingGatePass();
              setActivePage('gate-pass-list');
            }} 
          />
        );
      case 'gate-pass-list':
      case 'gate-pass-history':
        return (
          <GatePassListPage 
            onEditGatePass={handleEditGatePassFromList}
            onNewGatePass={() => {
              handleClearEditingGatePass();
              setActivePage('gate-pass');
            }}
          />
        );
      default:
        return <MasterPage />;
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-dark)' }}>
      <Navbar activePage={activePage} />
      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar activePage={activePage} setActivePage={setActivePage} />
        <main style={{ flex: 1, padding: '1.5rem 2rem', overflowY: 'auto', maxHeight: 'calc(100vh - 65px)' }}>
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
