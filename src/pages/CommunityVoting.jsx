import React, { useState, useMemo } from 'react';
import { useHackathon } from '../context/HackathonContext';
import { Award, Heart, Flame, RefreshCw, Trophy, Calendar, Filter } from 'lucide-react';

export default function CommunityVoting({ setToast }) {
  const {
    events,
    votingData,
    loading,
    selectedEventId,
    setSelectedEventId,
    toggleCommunityVote,
    refreshAllData
  } = useHackathon();

  const [votingId, setVotingId] = useState(null);

  const handleVoteToggle = async (submissionId) => {
    setVotingId(submissionId);
    try {
      const res = await toggleCommunityVote(submissionId);
      if (res.success) {
        setToast && setToast({ type: 'success', message: res.message });
      }
    } catch (err) {
      setToast && setToast({ type: 'error', message: err.message || 'Voting failed' });
    } finally {
      setVotingId(null);
    }
  };

  // Filter leaderboard entries by selected event
  const filteredLeaderboard = useMemo(() => {
    if (!votingData?.leaderboard) return [];
    if (!selectedEventId) return votingData.leaderboard;
    // The leaderboard is already event-scoped via API, but we also show event context
    return votingData.leaderboard;
  }, [votingData, selectedEventId]);

  const selectedEventName = events.find(e => e.id === selectedEventId)?.title || 'All Events';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '4px' }}>
            Community Voting & Leaderboard
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Cast votes for your favorite dogfooding prototypes and see live rankings.
          </p>
        </div>

        <button onClick={refreshAllData} className="btn btn-secondary btn-sm">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh Leaderboard
        </button>
      </div>

      {/* Dynamic Event Selector populated from HackathonContext */}
      <div className="glass-panel" style={{ padding: '16px 20px', borderRadius: '14px', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calendar size={16} color="var(--accent-primary)" />
          <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Viewing results for event:</span>
        </div>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="form-select"
            style={{ width: '100%', padding: '8px 14px' }}
          >
            {events.map(evt => (
              <option key={evt.id} value={evt.id}>
                {evt.title} — {evt.status}
              </option>
            ))}
          </select>
        </div>
        {selectedEventId && (
          <span className={`badge ${events.find(e => e.id === selectedEventId)?.status === 'Active' ? 'badge-active' : 'badge-upcoming'}`}>
            {events.find(e => e.id === selectedEventId)?.status}
          </span>
        )}
      </div>

      {/* Leaderboard stats header */}
      {votingData && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(236, 72, 153, 0.15)', color: '#ec4899' }}>
              <Flame size={24} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Votes Cast</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{votingData.totalVotesCast}</div>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
              <Trophy size={24} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Current #1 Favorite</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px' }}>
                {votingData.leaderboard[0]?.title || 'None'}
              </div>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
              <Award size={24} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Your Votes</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{votingData.userVotedSubmissions?.length || 0}</div>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard Entries List */}
      <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Award size={20} color="var(--accent-amber)" /> Popular Choice Ranking
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 400, marginLeft: '4px' }}>
            — {selectedEventName}
          </span>
        </h3>

        {loading ? (
          <div className="skeleton" style={{ height: '180px', width: '100%' }}></div>
        ) : filteredLeaderboard.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Trophy size={36} style={{ marginBottom: '12px', opacity: 0.4 }} />
            <p>No submissions to rank for this event yet.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredLeaderboard.map((item) => {
              const hasVoted = votingData?.userVotedSubmissions?.includes(item.submissionId);
              const maxVotes = filteredLeaderboard[0]?.votes || 1;
              const pct = Math.min(100, Math.round((item.votes / maxVotes) * 100));

              return (
                <div
                  key={item.submissionId}
                  style={{
                    background: '#1f2937',
                    padding: '16px 20px',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px',
                    border: hasVoted ? '1px solid var(--accent-primary)' : '1px solid transparent',
                    transition: 'border-color 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
                    {/* Rank Badge */}
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: item.rank === 1 ? 'linear-gradient(135deg, #f59e0b, #d97706)' : item.rank === 2 ? '#9ca3af' : item.rank === 3 ? '#b45309' : '#374151',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '0.9rem',
                      flexShrink: 0
                    }}>
                      #{item.rank}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{item.title}</h4>
                        <span className="badge badge-active" style={{ fontSize: '0.68rem' }}>{item.category}</span>
                      </div>

                      {/* Vote Progress Bar */}
                      <div style={{ marginTop: '8px', background: 'rgba(0,0,0,0.3)', borderRadius: '999px', height: '6px', width: '100%', overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: 'var(--gradient-brand)', transition: 'width 0.5s ease' }}></div>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f3f4f6' }}>{item.votes}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>votes</div>
                    </div>

                    <button
                      onClick={() => handleVoteToggle(item.submissionId)}
                      disabled={votingId === item.submissionId}
                      className={`btn btn-sm ${hasVoted ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ padding: '8px 14px' }}
                    >
                      {votingId === item.submissionId ? (
                        <RefreshCw size={14} className="animate-spin" />
                      ) : (
                        <>
                          <Heart size={14} fill={hasVoted ? '#fff' : 'none'} /> {hasVoted ? 'Voted' : 'Vote'}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
