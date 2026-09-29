import React from 'react';
import { FileCode2, CheckCircle2, Server, Globe, Shield, Terminal, ArrowRight } from 'lucide-react';
import { apiConfig } from '../services/api';

export default function ApiContractsView() {
  const currentMode = apiConfig.getUseMock() ? 'Mock Local Service' : 'Live REST Backend';
  const baseUrl = apiConfig.getBaseUrl();

  const contracts = [
    {
      module: "Events Module",
      endpoints: [
        { method: "GET", path: "/api/v1/events", params: "status, category, search", desc: "Fetch hackathons with optional filter query parameters." },
        { method: "POST", path: "/api/v1/events", params: "Event Payload JSON", desc: "Publish a new hackathon or dogfooding sprint event." },
        { method: "POST", path: "/api/v1/events/:id/register", params: "{ userId }", desc: "Register or unregister user for target event." }
      ]
    },
    {
      module: "Users & Auth Module",
      endpoints: [
        { method: "GET", path: "/api/v1/users", params: "None", desc: "Fetch platform user directory." },
        { method: "PATCH", path: "/api/v1/users/:id/role", params: "{ role }", desc: "Elevate user privileges (Participant, Judge, Admin)." }
      ]
    },
    {
      module: "Judges & Evaluation Module",
      endpoints: [
        { method: "GET", path: "/api/v1/judges", params: "None", desc: "Fetch appointed judge roster and metrics." },
        { method: "POST", path: "/api/v1/judges/scores", params: "{ submissionId, judgeId, criteriaScores, feedback }", desc: "Submit rubric evaluation and score." }
      ]
    },
    {
      module: "Submissions Gallery Module",
      endpoints: [
        { method: "GET", path: "/api/v1/submissions", params: "eventId, category", desc: "List project entries with team & demo links." },
        { method: "POST", path: "/api/v1/submissions", params: "Submission Payload JSON", desc: "Submit project entry for an event." }
      ]
    },
    {
      module: "Community Voting Module",
      endpoints: [
        { method: "GET", path: "/api/v1/voting/leaderboard", params: "eventId", desc: "Real-time popular vote leaderboard." },
        { method: "POST", path: "/api/v1/voting/vote", params: "{ submissionId, userId }", desc: "Toggle community vote for project." }
      ]
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} className="animate-fade-in">
      <div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '4px' }}>
          API Contracts & Specifications
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Centralized specification layer defining REST endpoints, request schemas, and responses.
        </p>
      </div>

      {/* Active API Service status bar */}
      <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Server size={24} color="var(--accent-primary)" />
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>Active Endpoint Target: <span style={{ color: 'var(--accent-cyan)' }}>{baseUrl}</span></div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Current Service Adapter: <strong>{currentMode}</strong></div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="badge badge-active"><CheckCircle2 size={12} /> RESTful v1 Ready</span>
        </div>
      </div>

      {/* Modules listing */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {contracts.map((item, idx) => (
          <div key={idx} className="glass-panel" style={{ padding: '20px', borderRadius: '16px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '14px', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileCode2 size={18} /> {item.module}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {item.endpoints.map((ep, i) => (
                <div key={i} style={{ background: '#1f2937', padding: '12px 16px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      padding: '4px 8px',
                      borderRadius: '6px',
                      background: ep.method === 'GET' ? 'rgba(16,185,129,0.2)' : ep.method === 'POST' ? 'rgba(99,102,241,0.2)' : 'rgba(245,158,11,0.2)',
                      color: ep.method === 'GET' ? '#34d399' : ep.method === 'POST' ? '#818cf8' : '#fbbf24'
                    }}>
                      {ep.method}
                    </span>
                    <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.9rem', color: '#f9fafb' }}>
                      {ep.path}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {ep.desc}
                  </div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                    Params: {ep.params}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
