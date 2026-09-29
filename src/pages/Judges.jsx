import React, { useState, useMemo } from 'react';
import { useHackathon } from '../context/HackathonContext';
import { Gavel, Star, Award, CheckCircle2, RefreshCw, X, Sliders, Search, Filter, Calendar } from 'lucide-react';

export default function Judges({ setToast }) {
  // Consume events and shared state from HackathonContext
  const {
    events,
    submissions,
    judges,
    loading,
    evaluateSubmission,
    refreshAllData
  } = useHackathon();

  const [evaluatingSub, setEvaluatingSub] = useState(null);

  // Search & Filter State for Evaluation Table
  const [searchQuery, setSearchQuery] = useState('');
  const [eventFilter, setEventFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Search for Judges Roster
  const [judgeSearch, setJudgeSearch] = useState('');

  // Rubric scores (0-100)
  const [scores, setScores] = useState({
    innovation: 90,
    technicalExecution: 88,
    dogfoodUtility: 95,
    presentation: 85
  });
  const [feedback, setFeedback] = useState('Great execution and dogfood utility across team workflows.');
  const [submitting, setSubmitting] = useState(false);

  const handleEvaluateSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await evaluateSubmission({
        submissionId: evaluatingSub.id,
        judgeId: 'jdg-01',
        criteriaScores: scores,
        feedback
      });
      if (res.success) {
        setEvaluatingSub(null);
        setToast && setToast({ type: 'success', message: 'Evaluation saved and synchronized across platform!' });
      }
    } catch (err) {
      setToast && setToast({ type: 'error', message: err.message || 'Evaluation failed' });
    } finally {
      setSubmitting(false);
    }
  };

  // Real-time filtering of submissions table by search query, event, status, and category
  const filteredSubmissions = useMemo(() => {
    return submissions.filter(sub => {
      const matchesEvent = eventFilter === 'All' || sub.eventId === eventFilter;
      const matchesStatus = statusFilter === 'All' || sub.status.toLowerCase() === statusFilter.toLowerCase();
      const matchesCategory = categoryFilter === 'All' || sub.category === categoryFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || (
        sub.title?.toLowerCase().includes(q) ||
        sub.teamName?.toLowerCase().includes(q) ||
        sub.category?.toLowerCase().includes(q) ||
        sub.tagline?.toLowerCase().includes(q) ||
        sub.status?.toLowerCase().includes(q) ||
        sub.members?.some(m => m.toLowerCase().includes(q))
      );
      return matchesEvent && matchesStatus && matchesCategory && matchesSearch;
    });
  }, [submissions, eventFilter, statusFilter, categoryFilter, searchQuery]);

  // Real-time filtering of judges roster
  const filteredJudges = useMemo(() => {
    const q = judgeSearch.toLowerCase().trim();
    if (!q) return judges;
    return judges.filter(j =>
      j.name?.toLowerCase().includes(q) ||
      j.expertise?.some(exp => exp.toLowerCase().includes(q))
    );
  }, [judges, judgeSearch]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '4px' }}>
            Judge Portal & Rubric Scoring
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Evaluate assigned hackathon submissions using standardized rubrics for innovation, execution, and dogfood impact.
          </p>
        </div>
        <button onClick={refreshAllData} className="btn btn-secondary btn-sm">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh Data
        </button>
      </div>

      {/* Judges Roster */}
      <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Gavel size={18} color="var(--accent-primary)" /> Appointed Panel of Judges
          </h3>
          <div style={{ position: 'relative', width: '240px' }}>
            <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search judges by name or skill..."
              value={judgeSearch}
              onChange={(e) => setJudgeSearch(e.target.value)}
              className="form-input"
              style={{ width: '100%', paddingLeft: '32px', paddingRight: '28px', fontSize: '0.8rem', padding: '6px 28px 6px 32px' }}
            />
            {judgeSearch && (
              <button
                onClick={() => setJudgeSearch('')}
                style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
          {filteredJudges.map(j => (
            <div key={j.id} style={{ background: '#1f2937', padding: '14px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid var(--border-color)' }}>
              <img src={j.avatar} alt={j.name} style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--accent-primary)' }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{j.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{j.expertise.join(', ')}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)', marginTop: '2px', fontWeight: 600 }}>
                  {j.evaluatedCount} Submissions Evaluated
                </div>
              </div>
            </div>
          ))}
          {filteredJudges.length === 0 && (
            <div style={{ gridColumn: '1 / -1', padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              No judges found matching "{judgeSearch}".
            </div>
          )}
        </div>
      </div>

      {/* Assigned Submissions Table & Real-Time Filtering Controls */}
      <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Submissions Ready for Evaluation</h3>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            Showing {filteredSubmissions.length} of {submissions.length} submissions
          </span>
        </div>

        {/* Search & Combined Filter Bar Above Table (Consuming Context Events Dynamically) */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '16px', background: '#111827', padding: '12px', borderRadius: '10px' }}>
          {/* Real-time search query input */}
          <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
            <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search table by project title, team, member, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ width: '100%', paddingLeft: '34px', paddingRight: searchQuery ? '32px' : '12px' }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* Dynamic Event Dropdown populated from HackathonContext */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Calendar size={14} color="var(--accent-primary)" />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Event:</span>
            <select
              value={eventFilter}
              onChange={(e) => setEventFilter(e.target.value)}
              className="form-select"
              style={{ padding: '6px 10px', fontSize: '0.82rem', maxWidth: '200px' }}
            >
              <option value="All">All Events ({events.length})</option>
              {events.map(evt => (
                <option key={evt.id} value={evt.id}>
                  {evt.title}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Filter size={14} color="var(--text-muted)" />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Status:</span>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="form-select" style={{ padding: '6px 10px', fontSize: '0.82rem' }}>
              <option value="All">All Statuses</option>
              <option value="Under Review">Under Review</option>
              <option value="Evaluated">Evaluated</option>
              <option value="Winner">Winner</option>
            </select>
          </div>

          {/* Category Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Category:</span>
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="form-select" style={{ padding: '6px 10px', fontSize: '0.82rem' }}>
              <option value="All">All Categories</option>
              <option value="AI & ML">AI & ML</option>
              <option value="Infrastructure">Infrastructure</option>
              <option value="Design & UX">Design & UX</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="skeleton" style={{ height: '120px', width: '100%' }}></div>
        ) : filteredSubmissions.length === 0 ? (
          <div style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No submissions match your search query or filter selection.
            <div style={{ marginTop: '10px' }}>
              <button onClick={() => { setSearchQuery(''); setEventFilter('All'); setStatusFilter('All'); setCategoryFilter('All'); }} className="btn btn-secondary btn-sm">
                Clear Filters
              </button>
            </div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '10px' }}>Project Title</th>
                  <th style={{ padding: '10px' }}>Event</th>
                  <th style={{ padding: '10px' }}>Team</th>
                  <th style={{ padding: '10px' }}>Category</th>
                  <th style={{ padding: '10px' }}>Status</th>
                  <th style={{ padding: '10px' }}>Current Score</th>
                  <th style={{ padding: '10px', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubmissions.map(sub => {
                  const parentEvent = events.find(e => e.id === sub.eventId);
                  return (
                    <tr key={sub.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '12px 10px', fontWeight: 700 }}>
                        <div>{sub.title}</div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 400 }}>{sub.tagline}</div>
                      </td>
                      <td style={{ padding: '12px 10px', fontSize: '0.8rem', color: 'var(--accent-primary)', fontWeight: 600 }}>
                        {parentEvent ? parentEvent.title : sub.eventTitle || 'General'}
                      </td>
                      <td style={{ padding: '12px 10px', color: 'var(--text-secondary)' }}>
                        <div>{sub.teamName}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{sub.members?.join(', ')}</div>
                      </td>
                      <td style={{ padding: '12px 10px' }}><span className="badge badge-active">{sub.category}</span></td>
                      <td style={{ padding: '12px 10px' }}>
                        <span className={`badge ${sub.status === 'Evaluated' ? 'badge-active' : sub.status === 'Winner' ? 'badge-winner' : 'badge-upcoming'}`}>{sub.status}</span>
                      </td>
                      <td style={{ padding: '12px 10px', fontWeight: 700, color: 'var(--accent-amber)' }}>
                        {sub.score > 0 ? `${sub.score} / 100` : 'Pending'}
                      </td>
                      <td style={{ padding: '12px 10px', textAlign: 'right' }}>
                        <button onClick={() => setEvaluatingSub(sub)} className="btn btn-primary btn-sm">
                          <Sliders size={13} /> {sub.status === 'Evaluated' ? 'Re-Score' : 'Evaluate'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* EVALUATION MODAL */}
      {evaluatingSub && (
        <div className="modal-overlay" onClick={() => setEvaluatingSub(null)}>
          <div className="modal-content animate-fade-in" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Evaluate Submission: {evaluatingSub.title}</h3>
              <button onClick={() => setEvaluatingSub(null)} className="btn btn-secondary btn-sm" style={{ padding: '4px' }}><X size={18} /></button>
            </div>

            <form onSubmit={handleEvaluateSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '16px' }}>
                {['innovation', 'technicalExecution', 'dogfoodUtility', 'presentation'].map((criteria) => (
                  <div key={criteria} style={{ background: '#1f2937', padding: '12px 16px', borderRadius: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ textTransform: 'capitalize', fontWeight: 600, fontSize: '0.85rem' }}>
                        {criteria.replace(/([A-Z])/g, ' $1')}
                      </span>
                      <span style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>{scores[criteria]} / 100</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={scores[criteria]}
                      onChange={(e) => setScores({ ...scores, [criteria]: Number(e.target.value) })}
                      style={{ width: '100%', accentColor: 'var(--accent-primary)' }}
                    />
                  </div>
                ))}

                <div className="form-group">
                  <label className="form-label">Judge Feedback</label>
                  <textarea rows={3} value={feedback} onChange={e => setFeedback(e.target.value)} className="form-textarea" />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" onClick={() => setEvaluatingSub(null)} className="btn btn-secondary">Cancel</button>
                <button type="submit" disabled={submitting} className="btn btn-primary">
                  {submitting ? <RefreshCw size={14} className="animate-spin" /> : 'Submit Score'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
