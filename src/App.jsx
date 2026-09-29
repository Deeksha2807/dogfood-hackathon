import React, { useState } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Events from './pages/Events';
import Submissions from './pages/Submissions';
import Judges from './pages/Judges';
import CommunityVoting from './pages/CommunityVoting';
import UsersPage from './pages/Users';
import ApiContractsView from './pages/ApiContractsView';
import { HackathonProvider, useHackathon } from './context/HackathonContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

function AppLayout() {
  const [activeTab, setActiveTab] = useState('events');
  const [toast, setToast] = useState(null);
  const { refreshAllData } = useHackathon();

  const showToast = (toastObj) => {
    setToast(toastObj);
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const handleGlobalRefresh = () => {
    refreshAllData();
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Bar Navigation & API Settings */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onRefresh={handleGlobalRefresh}
      />

      {/* Main Container */}
      <div style={{ display: 'flex', flex: 1 }}>
        {/* Sidebar Nav */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Content View Area */}
        <main style={{ flex: 1, padding: '28px 36px', overflowY: 'auto' }}>
          {activeTab === 'events' && (
            <Events setToast={showToast} />
          )}
          {activeTab === 'submissions' && (
            <Submissions setToast={showToast} />
          )}
          {activeTab === 'judges' && (
            <Judges setToast={showToast} />
          )}
          {activeTab === 'voting' && (
            <CommunityVoting setToast={showToast} />
          )}
          {activeTab === 'users' && (
            <UsersPage setToast={showToast} />
          )}
          {activeTab === 'contracts' && (
            <ApiContractsView />
          )}
        </main>
      </div>

      {/* Floating Toast Notification */}
      {toast && (
        <div className="toast-banner">
          {toast.type === 'error' ? (
            <AlertCircle size={20} color="#f43f5e" />
          ) : (
            <CheckCircle2 size={20} color="#10b981" />
          )}
          <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', marginLeft: '12px' }}
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <HackathonProvider>
      <AppLayout />
    </HackathonProvider>
  );
}
