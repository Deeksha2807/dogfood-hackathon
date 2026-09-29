import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const HackathonContext = createContext(null);

export function HackathonProvider({ children }) {
  const [events, setEvents] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [judges, setJudges] = useState([]);
  const [votingData, setVotingData] = useState(null);
  const [selectedEventId, setSelectedEventId] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initial load of events and shared data
  const refreshAllData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [eventsRes, subsRes, judgesRes, votingRes] = await Promise.all([
        api.events.getAll(),
        api.submissions.getAll(),
        api.judges.getAll(),
        api.voting.getLeaderboard(selectedEventId || 'evt-101')
      ]);

      const loadedEvents = eventsRes.data || [];
      setEvents(loadedEvents);
      setSubmissions(subsRes.data || []);
      setJudges(judgesRes.data || []);
      setVotingData(votingRes.data || null);

      // Default selectedEventId to the first event if not set
      if (!selectedEventId && loadedEvents.length > 0) {
        setSelectedEventId(loadedEvents[0].id);
      }
    } catch (err) {
      console.error("[HackathonContext] Failed to load data:", err);
      setError(err.message || "Failed to load hackathon data");
    } finally {
      setLoading(false);
    }
  }, [selectedEventId]);

  useEffect(() => {
    refreshAllData();
  }, [refreshAllData]);

  // Add a new event to shared state and API
  const addEvent = async (eventData) => {
    try {
      const res = await api.events.create(eventData);
      if (res.success && res.data) {
        setEvents(prev => [res.data, ...prev]);
        return { success: true, event: res.data };
      }
      return res;
    } catch (err) {
      console.error("[HackathonContext] Add event error:", err);
      throw err;
    }
  };

  // Update an existing event in shared state and API
  const updateEvent = async (id, updates) => {
    try {
      const res = await api.events.update(id, updates);
      if (res.success && res.data) {
        setEvents(prev => prev.map(evt => evt.id === id ? { ...evt, ...res.data } : evt));
        return { success: true, event: res.data };
      }
      return res;
    } catch (err) {
      console.error("[HackathonContext] Update event error:", err);
      throw err;
    }
  };

  // Toggle user registration for an event
  const toggleRegisterEvent = async (eventId, userId = 'usr-02') => {
    try {
      const res = await api.events.registerParticipant(eventId, userId);
      if (res.success) {
        setEvents(prev => prev.map(evt =>
          evt.id === eventId
            ? { ...evt, isRegistered: res.isRegistered, registeredCount: res.registeredCount }
            : evt
        ));
      }
      return res;
    } catch (err) {
      console.error("[HackathonContext] Registration error:", err);
      throw err;
    }
  };

  // Add a new submission to shared state and API
  const addSubmission = async (submissionData) => {
    try {
      const res = await api.submissions.create(submissionData);
      if (res.success && res.data) {
        setSubmissions(prev => [res.data, ...prev]);
        // Also update the submission count in the corresponding event
        setEvents(prev => prev.map(evt =>
          evt.id === submissionData.eventId
            ? { ...evt, submissionsCount: (evt.submissionsCount || 0) + 1 }
            : evt
        ));
        return { success: true, submission: res.data };
      }
      return res;
    } catch (err) {
      console.error("[HackathonContext] Add submission error:", err);
      throw err;
    }
  };

  // Submit judge evaluation score
  const evaluateSubmission = async (evalData) => {
    try {
      const res = await api.judges.submitEvaluation(evalData);
      if (res.success) {
        const { submissionId, criteriaScores } = evalData;
        const avgScore = Object.values(criteriaScores).reduce((a, b) => a + b, 0) / Object.keys(criteriaScores).length;
        const roundedScore = Math.round(avgScore * 10) / 10;

        setSubmissions(prev => prev.map(s =>
          s.id === submissionId
            ? { ...s, score: roundedScore, status: 'Evaluated' }
            : s
        ));
      }
      return res;
    } catch (err) {
      console.error("[HackathonContext] Evaluate error:", err);
      throw err;
    }
  };

  // Toggle community vote
  const toggleCommunityVote = async (submissionId, userId = 'usr-02') => {
    try {
      const res = await api.voting.toggleVote(submissionId, userId);
      if (res.success) {
        // Refresh voting data and submissions list
        const votingRes = await api.voting.getLeaderboard(selectedEventId || 'evt-101');
        if (votingRes.success) {
          setVotingData(votingRes.data);
        }
        setSubmissions(prev => prev.map(s =>
          s.id === submissionId ? { ...s, votes: res.newVoteCount } : s
        ));
      }
      return res;
    } catch (err) {
      console.error("[HackathonContext] Vote toggle error:", err);
      throw err;
    }
  };

  const value = {
    // Shared State
    events,
    submissions,
    judges,
    votingData,
    selectedEventId,
    setSelectedEventId,
    loading,
    error,

    // Actions
    refreshAllData,
    addEvent,
    updateEvent,
    toggleRegisterEvent,
    addSubmission,
    evaluateSubmission,
    toggleCommunityVote
  };

  return (
    <HackathonContext.Provider value={value}>
      {children}
    </HackathonContext.Provider>
  );
}

export function useHackathon() {
  const context = useContext(HackathonContext);
  if (!context) {
    throw new Error('useHackathon must be used within a HackathonProvider');
  }
  return context;
}

export default HackathonContext;
