import React, { useState, useMemo } from 'react';
import { useHackathon } from '../context/HackathonContext';
import { FolderGit2, ExternalLink, Github, Plus, RefreshCw, Star, X, Search, Filter, Calendar } from 'lucide-react';

export default function Submissions({ setToast }) {
  const {
    events,
    submissions,
    loading,
    addSubmission,
    refreshAllData
  } = useHackathon();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [eventFilter, setEventFilter] = useState('All');

  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form - eventId defaults to first active event from shared context
  const defaultEventId = events.find(e => e.status === 'Active')?.id || events[0]?.id || 'evt-101';
  const [form, setForm] = useState({
    eventId: defaultEventId,
    title: '',
    tagline: '',
    description: '',
    repoUrl: '',
    demoUrl: '',
    teamName: '',
    members: 'Alex Rivera, Jane Doe',
    category: 'AI & ML'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const selectedEvent = events.find(evt => evt.id === form.eventId);
      const membersArray = form.members.split(',').map(m => m.trim());
      const res = await addSubmission({
        ...form,
        eventTitle: selectedEvent?.title || form.eventId,
        members: membersArray
      });
      if (res.success) {
        setShowSubmitModal(false);
        setForm({
          eventId: defaultEventId,
          title: '',
          tagline: '',
          description: '',
          repoUrl: '',
          demoUrl: '',
          teamName: '',
          members: 'Alex Rivera, Jane Doe',
          category: 'AI & ML'
        });
        setToast && setToast({ type: 'success', message: 'Project submitted and synced across platform!' });
      }
    } catch (err) {
      setToast && setToast({ type: 'error', message: err.message || 'Submission failed' });
    } finally {
      setSubmitting(false);
    }
  };

  // Real-time filtering combining search query, event, category, and status
  const filteredSubmissions = useMemo(() => {
    return submissions.filter(sub => {
      const matchesEvent = eventFilter === 'All' || sub.eventId === eventFilter;
      const matchesCategory = categoryFilter === 'All' || sub.category === categoryFilter;
      const matchesStatus = statusFilter === 'All' || sub.status.toLowerCase() === statusFilter.toLowerCase();
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || (
        sub.title?.toLowerCase().includes(q) ||
        sub.tagline?.toLowerCase().includes(q) ||
        sub.description?.toLowerCase().includes(q) ||
        sub.teamName?.toLowerCase().includes(q) ||
        sub.members?.some(m => m.toLowerCase().includes(q)) ||
        sub.category?.toLowerCase().includes(q)
      );
      return matchesEvent && matchesCategory && matchesStatus && matchesSearch;
    });
  }, [submissions, eventFilter, categoryFilter, statusFilter, searchQuery]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '4px' }}>
            Project Submissions Gallery
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Browse hackathon entries, inspect code repositories, and review team scores.
          </p>
        </div>
        <button onClick={() => setShowSubmitModal(true)} className="btn btn-primary">
          <Plus size={16} /> Submit Project
        </button>
      </div>

      {/* Global Real-Time Search Bar & Combined Dropdown Filters */}
      <div className="glass-panel" style={{ padding: '16px', borderRadius: 'var(--radius-md)', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Real-time Search Input */}
        <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search projects by title, tagline, team, or author..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input"
            style={{ width: '100%', paddingLeft: '38px', paddingRight: searchQuery ? '36px' : '12px' }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Dynamic Event Filter — populated from HackathonContext */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calendar size={14} color="var(--accent-primary)" />
          <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Event:</span>
          <select value={eventFilter} onChange={(e) => setEventFilter(e.target.value)} className="form-select" style={{ padding: '8px 12px', maxWidth: '180px' }}>
            <option value="All">All Events ({events.length})</option>
            {events.map(evt => (
              <option key={evt.id} value={evt.id}>{evt.title}</option>
            ))}
          </select>
        </div>

        {/* Category Dropdown Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={15} color="var(--text-muted)" />
          <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Category:</span>
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="form-select" style={{ padding: '8px 12px' }}>
            <option value="All">All Categories</option>
            <option value="AI & ML">AI & ML</option>
            <option value="Infrastructure">Infrastructure</option>
            <option value="Design & UX">Design & UX</option>
          </select>
        </div>

        {/* Status Dropdown Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Status:</span>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="form-select" style={{ padding: '8px 12px' }}>
            <option value="All">All Statuses</option>
            <option value="Under Review">Under Review</option>
            <option value="Evaluated">Evaluated</option>
            <option value="Winner">Winner</option>
          </select>
        </div>

        <button onClick={refreshAllData} className="btn btn-secondary btn-sm">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>

        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
          Showing {filteredSubmissions.length} of {submissions.length} projects
        </span>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {[1, 2, 3].map(i => (
            <div key={i} className="glass-panel" style={{ padding: '20px', borderRadius: '16px', height: '220px' }}>
              <div className="skeleton" style={{ width: '70%', height: '24px', marginBottom: '12px' }}></div>
              <div className="skeleton" style={{ width: '90%', height: '16px', marginBottom: '8px' }}></div>
              <div className="skeleton" style={{ width: '50%', height: '16px' }}></div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredSubmissions.length === 0 && (
        <div className="glass-panel" style={{ padding: '48px', textAlign: 'center', borderRadius: '16px' }}>
          <FolderGit2 size={40} color="var(--text-muted)" style={{ marginBottom: '12px' }} />
          <h4 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '6px' }}>No Projects Found</h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            No project submissions match your search or filter criteria.
          </p>
          <button onClick={() => { setSearchQuery(''); setCategoryFilter('All'); setStatusFilter('All'); setEventFilter('All'); }} className="btn btn-secondary btn-sm" style={{ marginTop: '12px' }}>
            Clear All Filters
          </button>
        </div>
      )}

      {/* Submissions Grid */}
      {!loading && filteredSubmissions.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {filteredSubmissions.map((sub) => {
            const parentEvent = events.find(e => e.id === sub.eventId);
            return (
              <div key={sub.id} className="glass-panel" style={{ padding: '22px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <span className="badge badge-active" style={{ fontSize: '0.7rem' }}>{sub.category}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className={`badge ${sub.status === 'Winner' ? 'badge-winner' : sub.status === 'Evaluated' ? 'badge-active' : 'badge-upcoming'}`} style={{ fontSize: '0.68rem' }}>
                      {sub.status}
                    </span>
                    {sub.score > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', padding: '4px 8px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700 }}>
                        <Star size={13} fill="#fbbf24" /> {sub.score}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '4px' }}>{sub.title}</h3>
                  <div style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', fontWeight: 600, marginBottom: '4px' }}>{sub.tagline}</div>
                  {parentEvent && (
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={11} /> {parentEvent.title}
                    </div>
                  )}
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.45' }}>{sub.description}</p>
                </div>

                <div style={{ marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Team: <strong>{sub.teamName}</strong>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {sub.repoUrl && (
                      <a href={sub.repoUrl} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm" style={{ padding: '6px' }}>
                        <Github size={14} />
                      </a>
                    )}
                    {sub.demoUrl && (
                      <a href={sub.demoUrl} target="_blank" rel="noreferrer" className="btn btn-primary btn-sm" style={{ padding: '6px 10px', fontSize: '0.75rem' }}>
                        Demo <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Modal — Event dropdown dynamically sourced from HackathonContext */}
      {showSubmitModal && (
        <div className="modal-overlay" onClick={() => setShowSubmitModal(false)}>
          <div className="modal-content animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Submit Project Entry</h3>
              <button onClick={() => setShowSubmitModal(false)} className="btn btn-secondary btn-sm" style={{ padding: '4px' }}><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              {/* Dynamic Event Selector from context */}
              <div className="form-group">
                <label className="form-label">Submit to Event</label>
                <select
                  value={form.eventId}
                  onChange={e => setForm({ ...form, eventId: e.target.value })}
                  className="form-select"
                  required
                >
                  {events.map(evt => (
                    <option key={evt.id} value={evt.id}>
                      {evt.title} ({evt.status})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Team Name</label>
                  <input required type="text" placeholder="Neural Nexus" value={form.teamName} onChange={e => setForm({ ...form, teamName: e.target.value })} className="form-input" />
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="form-select">
                    <option value="AI & ML">AI & ML</option>
                    <option value="Infrastructure">Infrastructure</option>
                    <option value="Design & UX">Design & UX</option>
                    <option value="Cybersecurity">Cybersecurity</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Project Title</label>
                <input required type="text" placeholder="AutoDoc Agentic Copilot" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="form-input" />
              </div>
              <div className="form-group">
                <label className="form-label">Tagline</label>
                <input required type="text" placeholder="Short 1-line elevator pitch..." value={form.tagline} onChange={e => setForm({ ...form, tagline: e.target.value })} className="form-input" />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea rows={3} required placeholder="Full technical explanation..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="form-textarea" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">GitHub Repo URL</label>
                  <input type="url" placeholder="https://github.com/..." value={form.repoUrl} onChange={e => setForm({ ...form, repoUrl: e.target.value })} className="form-input" />
                </div>
                <div className="form-group">
                  <label className="form-label">Demo URL</label>
                  <input type="url" placeholder="https://demo.internal..." value={form.demoUrl} onChange={e => setForm({ ...form, demoUrl: e.target.value })} className="form-input" />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                <button type="button" onClick={() => setShowSubmitModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" disabled={submitting} className="btn btn-primary">
                  {submitting ? <RefreshCw size={14} className="animate-spin" /> : 'Submit Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
