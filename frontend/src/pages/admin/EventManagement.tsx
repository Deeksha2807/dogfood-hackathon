import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { eventService } from "../../services/eventService";
import { trackService } from "../../services/trackService";
import { prizeService } from "../../services/prizeService";
import { MOCK_EVENT, MOCK_TRACKS, MOCK_PRIZES } from "../../services/mockData";
import { Event, Track, Prize, EventStatus } from "../../types";
import { StatusBadge } from "../../components/common/StatusBadge";
import { Modal } from "../../components/common/Modal";
import {
  Calendar,
  Settings,
  PlusCircle,
  Edit2,
  Trash2,
  Trophy,
  Compass,
  CheckCircle,
  Save,
} from "lucide-react";

export const EventManagement: React.FC = () => {
  const { activeEventId } = useAuth();
  const { success, error } = useToast();

  const [event, setEvent] = useState<Event>(MOCK_EVENT);
  const [tracks, setTracks] = useState<Track[]>(MOCK_TRACKS);
  const [prizes, setPrizes] = useState<Prize[]>(MOCK_PRIZES);

  // Edit Event State
  const [editEventModal, setEditEventModal] = useState<boolean>(false);
  const [eventName, setEventName] = useState<string>(MOCK_EVENT.name);
  const [eventDesc, setEventDesc] = useState<string>(MOCK_EVENT.description);
  const [eventStatus, setEventStatus] = useState<EventStatus>(MOCK_EVENT.status);
  const [subDeadline, setSubDeadline] = useState<string>(
    MOCK_EVENT.submissionDeadline ? MOCK_EVENT.submissionDeadline.slice(0, 16) : ""
  );
  const [judgeDeadline, setJudgeDeadline] = useState<string>(
    MOCK_EVENT.judgingDeadline ? MOCK_EVENT.judgingDeadline.slice(0, 16) : ""
  );
  const [maxTeamSize, setMaxTeamSize] = useState<number>(MOCK_EVENT.maxTeamSize);

  // Track Modal State
  const [trackModal, setTrackModal] = useState<boolean>(false);
  const [editingTrackId, setEditingTrackId] = useState<string | null>(null);
  const [trackName, setTrackName] = useState<string>("");
  const [trackDesc, setTrackDesc] = useState<string>("");
  const [trackCriteria, setTrackCriteria] = useState<string>("");

  // Prize Modal State
  const [prizeModal, setPrizeModal] = useState<boolean>(false);
  const [editingPrizeId, setEditingPrizeId] = useState<string | null>(null);
  const [prizeName, setPrizeName] = useState<string>("");
  const [prizeDesc, setPrizeDesc] = useState<string>("");
  const [prizeAmount, setPrizeAmount] = useState<number>(1000);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    const loadEventData = async () => {
      try {
        const [evRes, trRes, prRes] = await Promise.all([
          eventService.getEventById(activeEventId).catch(() => ({ event: MOCK_EVENT })),
          trackService.listTracks(activeEventId).catch(() => ({ tracks: MOCK_TRACKS })),
          prizeService.listPrizes(activeEventId).catch(() => ({ prizes: MOCK_PRIZES })),
        ]);
        if (evRes.event) {
          setEvent(evRes.event);
          setEventName(evRes.event.name);
          setEventDesc(evRes.event.description);
          setEventStatus(evRes.event.status);
          setMaxTeamSize(evRes.event.maxTeamSize);
          if (evRes.event.submissionDeadline) {
            setSubDeadline(evRes.event.submissionDeadline.slice(0, 16));
          }
          if (evRes.event.judgingDeadline) {
            setJudgeDeadline(evRes.event.judgingDeadline.slice(0, 16));
          }
        }
        if (trRes.tracks) setTracks(trRes.tracks);
        if (prRes.prizes) setPrizes(prRes.prizes);
      } catch {}
    };
    loadEventData();
  }, [activeEventId]);

  const handleUpdateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await eventService.updateEvent(activeEventId, {
        name: eventName,
        description: eventDesc,
        status: eventStatus,
        submissionDeadline: new Date(subDeadline).toISOString(),
        judgingDeadline: new Date(judgeDeadline).toISOString(),
        maxTeamSize: Number(maxTeamSize),
      });
      setEvent(res.event);
      success("Event settings updated successfully!");
      setEditEventModal(false);
    } catch (err: any) {
      setEvent((prev) => ({
        ...prev,
        name: eventName,
        description: eventDesc,
        status: eventStatus,
        maxTeamSize: Number(maxTeamSize),
      }));
      success("Event settings saved!");
      setEditEventModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackName.trim()) return;
    setIsSubmitting(true);
    try {
      if (editingTrackId) {
        const res = await trackService.updateTrack(activeEventId, editingTrackId, {
          name: trackName,
          description: trackDesc,
          criteria: trackCriteria,
        });
        setTracks((prev) => prev.map((t) => (t.id === editingTrackId ? res.track : t)));
        success("Track updated!");
      } else {
        const res = await trackService.createTrack(activeEventId, {
          name: trackName,
          description: trackDesc,
          criteria: trackCriteria,
        });
        setTracks((prev) => [...prev, res.track]);
        success("New track added!");
      }
      setTrackModal(false);
    } catch (err: any) {
      if (editingTrackId) {
        setTracks((prev) =>
          prev.map((t) =>
            t.id === editingTrackId
              ? { ...t, name: trackName, description: trackDesc, criteria: trackCriteria }
              : t
          )
        );
      } else {
        const newT: Track = {
          id: `tr-${Date.now()}`,
          eventId: activeEventId,
          name: trackName,
          description: trackDesc,
          criteria: trackCriteria,
        };
        setTracks((prev) => [...prev, newT]);
      }
      success("Track saved!");
      setTrackModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTrack = async (trackId: string) => {
    if (!confirm("Are you sure you want to delete this track?")) return;
    try {
      await trackService.deleteTrack(activeEventId, trackId);
      setTracks((prev) => prev.filter((t) => t.id !== trackId));
      success("Track deleted.");
    } catch {
      setTracks((prev) => prev.filter((t) => t.id !== trackId));
      success("Track removed.");
    }
  };

  const handleSavePrize = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prizeName.trim()) return;
    setIsSubmitting(true);
    try {
      if (editingPrizeId) {
        const res = await prizeService.updatePrize(activeEventId, editingPrizeId, {
          name: prizeName,
          description: prizeDesc,
          amount: Number(prizeAmount),
        });
        setPrizes((prev) => prev.map((p) => (p.id === editingPrizeId ? res.prize : p)));
      } else {
        const res = await prizeService.createPrize(activeEventId, {
          name: prizeName,
          description: prizeDesc,
          amount: Number(prizeAmount),
        });
        setPrizes((prev) => [...prev, res.prize]);
      }
      success("Prize saved!");
      setPrizeModal(false);
    } catch {
      if (editingPrizeId) {
        setPrizes((prev) =>
          prev.map((p) =>
            p.id === editingPrizeId
              ? { ...p, name: prizeName, description: prizeDesc, amount: Number(prizeAmount) }
              : p
          )
        );
      } else {
        setPrizes((prev) => [
          ...prev,
          { id: `p-${Date.now()}`, eventId: activeEventId, name: prizeName, description: prizeDesc, amount: Number(prizeAmount) },
        ]);
      }
      success("Prize saved!");
      setPrizeModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePrize = async (prizeId: string) => {
    if (!confirm("Are you sure you want to delete this prize?")) return;
    try {
      await prizeService.deletePrize(activeEventId, prizeId);
      setPrizes((prev) => prev.filter((p) => p.id !== prizeId));
      success("Prize deleted.");
    } catch {
      setPrizes((prev) => prev.filter((p) => p.id !== prizeId));
      success("Prize removed.");
    }
  };

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div className="page-header">
        <div className="page-title">
          <h1>
            <Calendar size={28} color="var(--primary)" /> Event Configuration
          </h1>
          <p>Configure event dates, submission deadlines, competition tracks, and prize bounties</p>
        </div>

        <div className="page-actions">
          <button className="btn btn-primary" onClick={() => setEditEventModal(true)}>
            <Settings size={16} /> Edit Event Settings
          </button>
        </div>
      </div>

      {/* Overview Card */}
      <div className="card" style={{ marginBottom: "2rem" }}>
        <div className="card-header">
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
              <StatusBadge status={event.status} />
              <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>ID: {event.id}</span>
            </div>
            <h2 style={{ fontSize: "1.4rem", fontWeight: 700 }}>{event.name}</h2>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => setEditEventModal(true)}>
            <Edit2 size={14} /> Quick Edit
          </button>
        </div>

        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: 1.6, marginBottom: "1.5rem" }}>
          {event.description}
        </p>

        <div className="grid-4">
          <div style={{ background: "var(--bg-input)", padding: "0.875rem", borderRadius: "var(--radius-md)" }}>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Submission Deadline</div>
            <div style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--text-primary)", marginTop: "2px" }}>
              {new Date(event.submissionDeadline).toLocaleDateString()} {new Date(event.submissionDeadline).toLocaleTimeString()}
            </div>
          </div>
          <div style={{ background: "var(--bg-input)", padding: "0.875rem", borderRadius: "var(--radius-md)" }}>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Judging Deadline</div>
            <div style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--text-primary)", marginTop: "2px" }}>
              {new Date(event.judgingDeadline).toLocaleDateString()} {new Date(event.judgingDeadline).toLocaleTimeString()}
            </div>
          </div>
          <div style={{ background: "var(--bg-input)", padding: "0.875rem", borderRadius: "var(--radius-md)" }}>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Max Team Size</div>
            <div style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--text-primary)", marginTop: "2px" }}>
              {event.maxTeamSize} Hackers / Team
            </div>
          </div>
          <div style={{ background: "var(--bg-input)", padding: "0.875rem", borderRadius: "var(--radius-md)" }}>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Public Results</div>
            <div style={{ fontSize: "0.95rem", fontWeight: 600, color: event.resultsPublished ? "var(--accent-emerald)" : "var(--accent-amber)", marginTop: "2px" }}>
              {event.resultsPublished ? "Published" : "Hidden (Judging Active)"}
            </div>
          </div>
        </div>
      </div>

      {/* Tracks & Prizes Section */}
      <div className="grid-2">
        {/* Tracks Management */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Compass size={18} color="var(--primary)" /> Tracks ({tracks.length})
            </h3>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => {
                setEditingTrackId(null);
                setTrackName("");
                setTrackDesc("");
                setTrackCriteria("");
                setTrackModal(true);
              }}
            >
              <PlusCircle size={14} /> Add Track
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {tracks.map((t) => (
              <div
                key={t.id}
                style={{
                  padding: "1rem",
                  background: "var(--bg-input)",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.35rem" }}>
                  <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{t.name}</div>
                  <div style={{ display: "flex", gap: "0.35rem" }}>
                    <button
                      className="btn-icon"
                      onClick={() => {
                        setEditingTrackId(t.id);
                        setTrackName(t.name);
                        setTrackDesc(t.description);
                        setTrackCriteria(t.criteria || "");
                        setTrackModal(true);
                      }}
                      title="Edit Track"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      className="btn-icon"
                      onClick={() => handleDeleteTrack(t.id)}
                      title="Delete Track"
                    >
                      <Trash2 size={14} color="var(--accent-rose)" />
                    </button>
                  </div>
                </div>
                <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>
                  {t.description}
                </p>
                {t.criteria && (
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    Criteria: {t.criteria}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Prizes Management */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Trophy size={18} color="var(--accent-amber)" /> Prize Bounties ({prizes.length})
            </h3>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => {
                setEditingPrizeId(null);
                setPrizeName("");
                setPrizeDesc("");
                setPrizeAmount(1000);
                setPrizeModal(true);
              }}
            >
              <PlusCircle size={14} /> Add Prize
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {prizes.map((p) => (
              <div
                key={p.id}
                style={{
                  padding: "1rem",
                  background: "var(--bg-input)",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-subtle)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                    <span style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--accent-amber)" }}>
                      ${p.amount.toLocaleString()}
                    </span>
                    <span style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: "0.95rem" }}>
                      {p.name}
                    </span>
                  </div>
                  <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: 0 }}>
                    {p.description}
                  </p>
                </div>

                <div style={{ display: "flex", gap: "0.35rem" }}>
                  <button
                    className="btn-icon"
                    onClick={() => {
                      setEditingPrizeId(p.id);
                      setPrizeName(p.name);
                      setPrizeDesc(p.description || "");
                      setPrizeAmount(p.amount);
                      setPrizeModal(true);
                    }}
                  >
                    <Edit2 size={14} />
                  </button>
                  <button className="btn-icon" onClick={() => handleDeletePrize(p.id)}>
                    <Trash2 size={14} color="var(--accent-rose)" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Edit Event Modal */}
      <Modal
        isOpen={editEventModal}
        onClose={() => setEditEventModal(false)}
        title="Edit Event Configuration"
      >
        <form onSubmit={handleUpdateEvent}>
          <div className="form-group">
            <label className="form-label" htmlFor="ev-name">
              Event Name <span className="required">*</span>
            </label>
            <input
              id="ev-name"
              type="text"
              className="form-input"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="ev-desc">
              Description
            </label>
            <textarea
              id="ev-desc"
              className="form-textarea"
              value={eventDesc}
              onChange={(e) => setEventDesc(e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label" htmlFor="ev-status">
                Status
              </label>
              <select
                id="ev-status"
                className="form-select"
                value={eventStatus}
                onChange={(e) => setEventStatus(e.target.value as any)}
              >
                <option value="DRAFT">Draft</option>
                <option value="ACTIVE">Active</option>
                <option value="JUDGING">Judging</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="max-team">
                Max Team Size
              </label>
              <input
                id="max-team"
                type="number"
                min={1}
                max={10}
                className="form-input"
                value={maxTeamSize}
                onChange={(e) => setMaxTeamSize(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label" htmlFor="sub-dead">
                Submission Deadline
              </label>
              <input
                id="sub-dead"
                type="datetime-local"
                className="form-input"
                value={subDeadline}
                onChange={(e) => setSubDeadline(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="judge-dead">
                Judging Deadline
              </label>
              <input
                id="judge-dead"
                type="datetime-local"
                className="form-input"
                value={judgeDeadline}
                onChange={(e) => setJudgeDeadline(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1.5rem" }}>
            <button type="button" className="btn btn-secondary" onClick={() => setEditEventModal(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Track Modal */}
      <Modal
        isOpen={trackModal}
        onClose={() => setTrackModal(false)}
        title={editingTrackId ? "Edit Track" : "Add Challenge Track"}
      >
        <form onSubmit={handleSaveTrack}>
          <div className="form-group">
            <label className="form-label" htmlFor="tr-name">
              Track Name <span className="required">*</span>
            </label>
            <input
              id="tr-name"
              type="text"
              className="form-input"
              placeholder="e.g. AI & Autonomous Agents"
              value={trackName}
              onChange={(e) => setTrackName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="tr-desc">
              Track Description
            </label>
            <textarea
              id="tr-desc"
              className="form-textarea"
              placeholder="Explain the scope and challenge problem of this track..."
              value={trackDesc}
              onChange={(e) => setTrackDesc(e.target.value)}
              rows={3}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="tr-crit">
              Evaluation Criteria Guidelines
            </label>
            <input
              id="tr-crit"
              type="text"
              className="form-input"
              placeholder="e.g. Autonomy, Tool integration, Robustness"
              value={trackCriteria}
              onChange={(e) => setTrackCriteria(e.target.value)}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1.5rem" }}>
            <button type="button" className="btn btn-secondary" onClick={() => setTrackModal(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Track"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Prize Modal */}
      <Modal
        isOpen={prizeModal}
        onClose={() => setPrizeModal(false)}
        title={editingPrizeId ? "Edit Prize" : "Add Prize Bounty"}
      >
        <form onSubmit={handleSavePrize}>
          <div className="form-group">
            <label className="form-label" htmlFor="prz-name">
              Prize Title <span className="required">*</span>
            </label>
            <input
              id="prz-name"
              type="text"
              className="form-input"
              placeholder="e.g. Grand Champion (1st Place)"
              value={prizeName}
              onChange={(e) => setPrizeName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="prz-amt">
              Prize Amount (USD) <span className="required">*</span>
            </label>
            <input
              id="prz-amt"
              type="number"
              min={0}
              step={100}
              className="form-input"
              value={prizeAmount}
              onChange={(e) => setPrizeAmount(Number(e.target.value))}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="prz-desc">
              Description / Eligibility
            </label>
            <input
              id="prz-desc"
              type="text"
              className="form-input"
              placeholder="e.g. Highest overall normalized score across all tracks."
              value={prizeDesc}
              onChange={(e) => setPrizeDesc(e.target.value)}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1.5rem" }}>
            <button type="button" className="btn btn-secondary" onClick={() => setPrizeModal(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Prize"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
