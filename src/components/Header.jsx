import React, { useState } from 'react';
import { apiConfig } from '../services/api';
import { Zap, Database, AlertTriangle, ShieldCheck, Sparkles, RefreshCw } from 'lucide-react';

export default function Header({ activeTab, setActiveTab, onRefresh }) {
  const [useMock, setUseMock] = useState(apiConfig.getUseMock());
  const [forceError, setForceError] = useState(false);

  const handleToggleMock = () => {
    const nextVal = !useMock;
    setUseMock(nextVal);
    apiConfig.setUseMock(nextVal);
    onRefresh && onRefresh();
  };

  const handleToggleError = () => {
    const nextVal = !forceError;
    setForceError(nextVal);
    apiConfig.setForceError(nextVal);
    onRefresh && onRefresh();
  };

  return (
    <header className="glass-panel" style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      padding: '14px 28px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottom: '1px solid var(--border-color)'
    }}>
      {/* Brand & Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '12px',
          background: 'var(--gradient-brand)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'var(--shadow-glow)'
        }}>
          <Zap size={22} color="#fff" />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
              DevPulse <span className="gradient-text">Hackathons</span>
            </h1>
            <span className="badge badge-active" style={{ fontSize: '0.68rem', padding: '2px 8px' }}>
              Dogfooding v2.4
            </span>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            Centralized Hackathon & Internal Dogfooding Platform
          </p>
        </div>
      </div>

      {/* Controls: API Mode Toggle & Error Simulator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Force Error State Toggle (for testing error UI) */}
        <button
          onClick={handleToggleError}
          className={`btn btn-sm ${forceError ? 'btn-danger' : 'btn-secondary'}`}
          title="Simulate network error response from API"
          style={{ gap: '6px' }}
        >
          <AlertTriangle size={14} />
          {forceError ? 'Simulating Error ⚠️' : 'Simulate API Error'}
        </button>

        {/* API Mode Toggle: Mock vs Live Backend */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          background: '#1f2937',
          padding: '4px',
          borderRadius: '12px',
          border: '1px solid var(--border-color)'
        }}>
          <button
            onClick={handleToggleMock}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              border: 'none',
              background: useMock ? 'var(--accent-primary)' : 'transparent',
              color: useMock ? '#fff' : 'var(--text-secondary)',
              transition: 'all 0.2s ease'
            }}
          >
            <Database size={14} />
            Mock API
          </button>
          <button
            onClick={handleToggleMock}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              border: 'none',
              background: !useMock ? 'var(--accent-emerald)' : 'transparent',
              color: !useMock ? '#fff' : 'var(--text-secondary)',
              transition: 'all 0.2s ease'
            }}
          >
            <ShieldCheck size={14} />
            Live Backend API
          </button>
        </div>

        {/* User Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingLeft: '8px', borderLeft: '1px solid var(--border-color)' }}>
          <img
            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80"
            alt="User Avatar"
            style={{ width: '36px', height: '36px', borderRadius: '50%', border: '2px solid var(--accent-primary)' }}
          />
          <div style={{ textAlign: 'left', display: 'none', '@media (min-width: 768px)': { display: 'block' } }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>Alex Rivera</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Participant / Dev</div>
          </div>
        </div>
      </div>
    </header>
  );
}
