import React, { useState, useMemo } from 'react';
import { useHackathon } from '../context/HackathonContext';
import {
  Calendar,
  MapPin,
  Users,
  Trophy,
  Plus,
  Search,
  Filter,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Tag,
  ArrowRight,
  X,
  Sparkles,
  Info
} from 'lucide-react';

export default function Events({ setToast }) {
  // Consume shared state and actions from HackathonContext
  const {
    events,
    loading,
    error,
    refreshAllData,
    addEvent,
    toggleRegisterEvent
  } = useHackathon();

  // Filters & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Modal States
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [registeringId, setRegisteringId] = useState(null);

  // Create Event Form State
  const [newEventForm, setNewEventForm] = useState({
    title: '',
    description: '',
    category: 'AI & ML',
    location: 'Hybrid (Building 42 + Virtual)',
    prizePool: '$10,000',
    maxParticipants: 100,
    tags: 'AI, Dogfooding, React'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter events in real-time
  const filteredEvents = useMemo(() => {
    return events.filter(evt => {
      const matchesStatus = statusFilter === 'All' || evt.status.toLowerCase() === statusFilter.toLowerCase();
      const matchesCategory = categoryFilter === 'All' || evt.category === categoryFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || (
        evt.title.toLowerCase().includes(q) ||
        evt.description.toLowerCase().includes(q) ||
        evt.tags?.some(t => t.toLowerCase().includes(q))
      );
      return matchesStatus && matchesCategory && matchesSearch;
    });
  }, [events, statusFilter, categoryFilter, searchQuery]);

  // Handle Participant Event Registration via Shared Context
  const handleRegister = async (eventId, e) => {
    e && e.stopPropagation();
    setRegisteringId(eventId);
    try {
      const res = await toggleRegisterEvent(eventId);
      if (res.success) {
        if (selectedEvent && selectedEvent.id === eventId) {
          setSelectedEvent(prev => ({
            ...prev,
            isRegistered: res.isRegistered,
            registeredCount: res.registeredCount
          }));
        }
        setToast && setToast({ type: 'success', message: res.message });
      }
    } catch (err) {
      setToast && setToast({ type: 'error', message: err.message || "Registration failed" });
    } finally {
      setRegisteringId(null);
    }
  };

  // Handle Event Creation Submission via Shared Context
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const tagsArray = newEventForm.tags.split(',').map(t => t.trim()).filter(Boolean);
      const res = await addEvent({
        ...newEventForm,
        tags: tagsArray,
        organizer: "DevPulse Engineering"
      });
      if (res.success) {
        setShowCreateModal(false);
        setNewEventForm({
          title: '',
          description: '',
          category: 'AI & ML',
          location: 'Hybrid (Building 42 + Virtual)',
          prizePool: '$10,000',
          maxParticipants: 100,
          tags: 'AI, Dogfooding, React'
        });
        setToast && setToast({ type: 'success', message: "Event created and synced to all pages!" });
      }
    } catch (err) {
      setToast && setToast({ type: 'error', message: err.message || "Could not create event" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} className="animate-fade-in">
      {/* Top Banner & Action Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '4px' }}>
            Hackathon & Dogfood Events
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Explore upcoming dogfooding challenges, register your team, and submit innovative prototypes.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={refreshAllData} className="btn btn-secondary btn-sm" title="Refresh API data">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button onClick={() => setShowCreateModal(true)} className="btn btn-primary">
            <Plus size={16} />
            Create Event
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="glass-panel" style={{ padding: '16px', borderRadius: 'var(--radius-md)', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Search input */}
        <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search events by title, description, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input"
            style={{ width: '100%', paddingLeft: '38px', paddingRight: searchQuery ? '36px' : '14px' }}
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

        {/* Status Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={15} color="var(--text-muted)" />
          <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="form-select"
            style={{ padding: '8px 12px' }}
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Upcoming">Upcoming</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        {/* Category Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Category:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="form-select"
            style={{ padding: '8px 12px' }}
          >
            <option value="All">All Categories</option>
            <option value="AI & ML">AI & ML</option>
            <option value="Infrastructure">Infrastructure</option>
            <option value="Design & UX">Design & UX</option>
            <option value="Cybersecurity">Cybersecurity</option>
          </select>
        </div>

        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
          Showing {filteredEvents.length} of {events.length} events
        </span>
      </div>

      {/* ERROR STATE */}
      {error && (
        <div className="glass-panel" style={{
          padding: '24px',
          borderRadius: 'var(--radius-md)',
          borderColor: 'rgba(244, 63, 94, 0.4)',
          background: 'rgba(244, 63, 94, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: '12px'
        }}>
          <AlertTriangle size={36} color="#f43f5e" />
          <div>
            <h3 style={{ fontSize: '1.1rem', color: '#f43f5e', fontWeight: 700, marginBottom: '4px' }}>
              API Request Failed
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', maxWidth: '500px' }}>
              {error}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
            <button onClick={refreshAllData} className="btn btn-danger btn-sm">
              <RefreshCw size={14} /> Retry Request
            </button>
          </div>
        </div>
      )}

      {/* LOADING STATE (Skeleton Cards) */}
      {loading && !error && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
          {[1, 2, 3].map(n => (
            <div key={n} className="glass-panel" style={{ borderRadius: 'var(--radius-lg)', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="skeleton" style={{ width: '100%', height: '160px', borderRadius: '12px' }}></div>
              <div className="skeleton" style={{ width: '60%', height: '24px' }}></div>
              <div className="skeleton" style={{ width: '90%', height: '16px' }}></div>
              <div className="skeleton" style={{ width: '40%', height: '16px' }}></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                <div className="skeleton" style={{ width: '80px', height: '32px' }}></div>
                <div className="skeleton" style={{ width: '100px', height: '32px' }}></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* EMPTY STATE */}
      {!loading && !error && filteredEvents.length === 0 && (
        <div className="glass-panel" style={{ padding: '48px', borderRadius: 'var(--radius-lg)', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
          <Calendar size={48} color="var(--text-muted)" />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>No Events Found</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', maxWidth: '400px' }}>
            No hackathon events match your current search query or filter settings.
          </p>
          <button onClick={() => { setSearchQuery(''); setStatusFilter('All'); setCategoryFilter('All'); }} className="btn btn-secondary btn-sm">
            Clear Filters
          </button>
        </div>
      )}

      {/* EVENTS LIST GRID */}
      {!loading && !error && filteredEvents.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
          {filteredEvents.map((evt) => {
            const badgeClass =
              evt.status === 'Active' ? 'badge-active' :
              evt.status === 'Upcoming' ? 'badge-upcoming' : 'badge-completed';

            return (
              <div
                key={evt.id}
                className="glass-panel"
                onClick={() => setSelectedEvent(evt)}
                style={{
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.borderColor = 'var(--accent-primary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                }}
              >
                {/* Event Banner */}
                <div style={{ height: '150px', position: 'relative', overflow: 'hidden' }}>
                  <img
                    src={evt.bannerUrl}
                    alt={evt.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to top, rgba(17, 24, 39, 0.95) 0%, rgba(17, 24, 39, 0.2) 100%)'
                  }}></div>
                  <span className={`badge ${badgeClass}`} style={{ position: 'absolute', top: '12px', right: '12px' }}>
                    {evt.status}
                  </span>
                  <span className="badge" style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(0,0,0,0.6)', color: '#fff' }}>
                    {evt.category}
                  </span>
                </div>

                {/* Event Body */}
                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1, gap: '14px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '6px' }}>
                      {evt.title}
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.83rem', lineHeight: '1.45', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {evt.description}
                    </p>
                  </div>

                  {/* Metadata info */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Calendar size={14} color="var(--accent-primary)" />
                      <span>{new Date(evt.startDate).toLocaleDateString()} - {new Date(evt.endDate).toLocaleDateString()}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <MapPin size={14} color="var(--accent-cyan)" />
                      <span>{evt.location}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Trophy size={14} color="var(--accent-amber)" />
                      <span style={{ color: 'var(--accent-amber)', fontWeight: 600 }}>{evt.prizePool}</span>
                    </div>
                  </div>

                  {/* Tags */}
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {evt.tags?.map((tag, idx) => (
                      <span key={idx} style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '6px', background: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)' }}>
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* Footer & Actions */}
                  <div style={{ marginTop: 'auto', paddingTop: '14px', borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Users size={14} /> {evt.registeredCount} / {evt.maxParticipants} Participants
                    </div>

                    <button
                      onClick={(e) => handleRegister(evt.id, e)}
                      disabled={registeringId === evt.id}
                      className={`btn btn-sm ${evt.isRegistered ? 'btn-secondary' : 'btn-primary'}`}
                      style={{ fontSize: '0.78rem' }}
                    >
                      {registeringId === evt.id ? (
                        <RefreshCw size={12} className="animate-spin" />
                      ) : evt.isRegistered ? (
                        <>
                          <CheckCircle2 size={12} color="#10b981" /> Registered
                        </>
                      ) : (
                        'Register Now'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* EVENT DETAILS DRAWER / MODAL */}
      {selectedEvent && (
        <div className="modal-overlay" onClick={() => setSelectedEvent(null)}>
          <div className="modal-content animate-fade-in" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <span className={`badge ${selectedEvent.status === 'Active' ? 'badge-active' : 'badge-upcoming'}`} style={{ marginBottom: '8px' }}>
                  {selectedEvent.status}
                </span>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{selectedEvent.title}</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Organized by {selectedEvent.organizer}</p>
              </div>
              <button onClick={() => setSelectedEvent(null)} className="btn btn-secondary btn-sm" style={{ padding: '6px' }}>
                <X size={18} />
              </button>
            </div>

            <img
              src={selectedEvent.bannerUrl}
              alt={selectedEvent.title}
              style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '12px', marginBottom: '16px' }}
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                {selectedEvent.description}
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: '#1f2937', padding: '14px', borderRadius: '12px' }}>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Dates</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{new Date(selectedEvent.startDate).toLocaleDateString()}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Location</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{selectedEvent.location}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Prize Pool</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent-amber)' }}>{selectedEvent.prizePool}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Capacity</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{selectedEvent.registeredCount} / {selectedEvent.maxParticipants} Joined</div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={() => setSelectedEvent(null)} className="btn btn-secondary">
                Close
              </button>
              <button
                onClick={(e) => handleRegister(selectedEvent.id, e)}
                disabled={registeringId === selectedEvent.id}
                className={`btn ${selectedEvent.isRegistered ? 'btn-secondary' : 'btn-primary'}`}
              >
                {selectedEvent.isRegistered ? 'Cancel Registration' : 'Confirm Registration'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE EVENT MODAL */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Create Hackathon Event</h3>
              <button onClick={() => setShowCreateModal(false)} className="btn btn-secondary btn-sm" style={{ padding: '4px' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit}>
              <div className="form-group">
                <label className="form-label">Event Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Autumn Dogfooding Hackathon"
                  value={newEventForm.title}
                  onChange={(e) => setNewEventForm({ ...newEventForm, title: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Outline the goal, rules, and dogfooding scope..."
                  value={newEventForm.description}
                  onChange={(e) => setNewEventForm({ ...newEventForm, description: e.target.value })}
                  className="form-textarea"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    value={newEventForm.category}
                    onChange={(e) => setNewEventForm({ ...newEventForm, category: e.target.value })}
                    className="form-select"
                  >
                    <option value="AI & ML">AI & ML</option>
                    <option value="Infrastructure">Infrastructure</option>
                    <option value="Design & UX">Design & UX</option>
                    <option value="Cybersecurity">Cybersecurity</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Prize Pool</label>
                  <input
                    type="text"
                    required
                    placeholder="$15,000"
                    value={newEventForm.prizePool}
                    onChange={(e) => setNewEventForm({ ...newEventForm, prizePool: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Tags (comma separated)</label>
                <input
                  type="text"
                  placeholder="AI, Kubernetes, Design"
                  value={newEventForm.tags}
                  onChange={(e) => setNewEventForm({ ...newEventForm, tags: e.target.value })}
                  className="form-input"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="btn btn-primary">
                  {isSubmitting ? <RefreshCw size={14} className="animate-spin" /> : <Plus size={16} />}
                  Publish Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
