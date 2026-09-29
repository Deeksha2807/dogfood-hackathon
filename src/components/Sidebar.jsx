import React from 'react';
import { Calendar, FolderGit2, Gavel, Award, Users, FileCode2 } from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
  const menuItems = [
    { id: 'events', label: 'Events Hub', icon: Calendar, badge: 'Main' },
    { id: 'submissions', label: 'Submissions', icon: FolderGit2 },
    { id: 'judges', label: 'Judges & Rubrics', icon: Gavel },
    { id: 'voting', label: 'Community Voting', icon: Award, highlight: true },
    { id: 'users', label: 'User Directory', icon: Users },
    { id: 'contracts', label: 'API Specifications', icon: FileCode2, badge: 'Docs' }
  ];

  return (
    <aside style={{
      width: '250px',
      background: 'rgba(17, 24, 39, 0.95)',
      borderRight: '1px solid var(--border-color)',
      padding: '24px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      minHeight: 'calc(100vh - 70px)'
    }}>
      <div style={{ padding: '0 12px 12px 12px', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
        Navigation Menu
      </div>

      {menuItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '11px 14px',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              background: isActive ? 'var(--gradient-brand)' : item.highlight ? 'rgba(99, 102, 241, 0.08)' : 'transparent',
              color: isActive ? '#ffffff' : item.highlight ? '#818cf8' : 'var(--text-secondary)',
              fontWeight: isActive ? 700 : 600,
              fontSize: '0.875rem',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.2s ease',
              boxShadow: isActive ? 'var(--shadow-glow)' : 'none'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Icon size={18} color={isActive ? '#ffffff' : item.highlight ? '#818cf8' : 'var(--text-secondary)'} />
              <span>{item.label}</span>
            </div>
            {item.badge && (
              <span style={{
                fontSize: '0.68rem',
                padding: '2px 6px',
                borderRadius: '6px',
                background: isActive ? 'rgba(255,255,255,0.2)' : '#1f2937',
                color: isActive ? '#fff' : 'var(--text-muted)'
              }}>
                {item.badge}
              </span>
            )}
          </button>
        );
      })}

      <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid var(--border-color)', paddingLeft: '12px', paddingRight: '12px' }}>
        <div className="glass-panel" style={{ padding: '14px', borderRadius: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
            API Status Monitor
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span>
            Service Ready (REST / Mock)
          </div>
        </div>
      </div>
    </aside>
  );
}
