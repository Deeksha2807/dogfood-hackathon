import React, { useState } from "react";
import { useHackathon } from "../../context/HackathonContext";
import { useToast } from "../../context/ToastContext";
import { Track } from "../../types";
import {
  Layers,
  Plus,
  Edit,
  Trash2,
  FolderGit2,
  Users,
  Compass,
  CheckCircle,
  HelpCircle,
  Cpu,
  Globe,
  Coins,
  HeartPulse,
  Leaf,
} from "lucide-react";

export const TracksManagement: React.FC = () => {
  const { tracks, submissions, teams, addTrack, updateTrack, deleteTrack } = useHackathon();
  const { success, error, info } = useToast();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTrack, setEditingTrack] = useState<Track | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    criteria: "",
  });

  const getSubmissionsCountForTrack = (track: Track) => {
    return submissions.filter(
      (s) => s.trackId === track.id || s.trackName.toLowerCase() === track.name.toLowerCase()
    ).length;
  };

  const getTeamsCountForTrack = (track: Track) => {
    return teams.filter(
      (t) => t.trackId === track.id || t.trackName.toLowerCase() === track.name.toLowerCase()
    ).length;
  };

  const handleOpenAdd = () => {
    setFormData({ name: "", description: "", criteria: "" });
    setIsAddModalOpen(true);
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.description.trim()) {
      error("Track name and description are required.");
      return;
    }
    addTrack(formData);
    success(`Track "${formData.name}" created successfully.`);
    setIsAddModalOpen(false);
  };

  const handleOpenEdit = (track: Track) => {
    setEditingTrack(track);
    setFormData({
      name: track.name,
      description: track.description,
      criteria: track.criteria || "",
    });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTrack) return;
    updateTrack(editingTrack.id, formData);
    success(`Track "${formData.name}" updated successfully.`);
    setEditingTrack(null);
  };

  const handleDelete = (track: Track) => {
    const subCount = getSubmissionsCountForTrack(track);
    if (subCount > 0) {
      if (
        !window.confirm(
          `Track "${track.name}" currently has ${subCount} submissions associated with it. Are you sure you want to delete this track?`
        )
      ) {
        return;
      }
    } else {
      if (!window.confirm(`Are you sure you want to delete track "${track.name}"?`)) {
        return;
      }
    }
    deleteTrack(track.id);
    info(`Deleted track "${track.name}".`);
  };

  const getIconForTrack = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes("ai") || n.includes("intelligence")) return <Cpu size={24} color="#6366F1" />;
    if (n.includes("web") || n.includes("fullstack")) return <Globe size={24} color="#06B6D4" />;
    if (n.includes("fin") || n.includes("pay")) return <Coins size={24} color="#F59E0B" />;
    if (n.includes("health") || n.includes("med")) return <HeartPulse size={24} color="#F43F5E" />;
    if (n.includes("sustain") || n.includes("climate")) return <Leaf size={24} color="#10B981" />;
    return <Layers size={24} color="var(--primary)" />;
  };

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div className="page-header">
        <div className="page-title">
          <h1>
            <Layers size={28} color="var(--primary)" /> Challenge Tracks (CRUD)
          </h1>
          <p>
            Configure specialized technical tracks, evaluation focus criteria, and monitor submission distribution
          </p>
        </div>

        <div className="page-actions">
          <button onClick={handleOpenAdd} className="btn btn-primary">
            <Plus size={16} /> Create New Track
          </button>
        </div>
      </div>

      {/* Track Stats Overview */}
      <div className="grid-3" style={{ marginBottom: "2rem" }}>
        <div className="card" style={{ padding: "1.25rem" }}>
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600 }}>ACTIVE TRACKS</div>
          <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--primary)" }}>{tracks.length}</div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Specialized domain categories</div>
        </div>
        <div className="card" style={{ padding: "1.25rem" }}>
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600 }}>TOTAL SUBMISSIONS</div>
          <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--accent-emerald)" }}>{submissions.length}</div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Assigned across tracks</div>
        </div>
        <div className="card" style={{ padding: "1.25rem" }}>
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600 }}>TOTAL SQUADS</div>
          <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--accent-amber)" }}>{teams.length}</div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Teams competing for grand prizes</div>
        </div>
      </div>

      {/* Tracks Grid */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        {tracks.map((track) => {
          const subCount = getSubmissionsCountForTrack(track);
          const teamCount = getTeamsCountForTrack(track);

          return (
            <div
              key={track.id}
              className="card"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                padding: "1.75rem",
                gap: "1.5rem",
                flexWrap: "wrap",
              }}
            >
              <div style={{ display: "flex", gap: "1.25rem", flex: "1 1 500px" }}>
                <div
                  style={{
                    width: "52px",
                    height: "52px",
                    borderRadius: "12px",
                    background: "var(--bg-input)",
                    border: "1px solid var(--border-color)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {getIconForTrack(track.name)}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
                    <h3 style={{ fontSize: "1.3rem", fontWeight: 700 }}>{track.name}</h3>
                    <span className="badge badge-primary">ID: {track.id}</span>
                  </div>
                  <p style={{ fontSize: "0.925rem", color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: "0.875rem" }}>
                    {track.description}
                  </p>

                  <div
                    style={{
                      background: "var(--bg-input)",
                      padding: "0.6rem 0.875rem",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--border-subtle)",
                      fontSize: "0.825rem",
                      color: "var(--text-muted)",
                    }}
                  >
                    <strong style={{ color: "var(--text-primary)" }}>Evaluation Focus:</strong>{" "}
                    {track.criteria || "Standard multi-factor rubric criteria"}
                  </div>
                </div>
              </div>

              {/* Counters & Actions */}
              <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
                <div style={{ display: "flex", gap: "1rem" }}>
                  <div
                    style={{
                      background: "var(--bg-input)",
                      border: "1px solid var(--border-color)",
                      borderRadius: "var(--radius-md)",
                      padding: "0.625rem 1rem",
                      textAlign: "center",
                      minWidth: "90px",
                    }}
                  >
                    <div style={{ fontSize: "1.35rem", fontWeight: 800, color: "var(--accent-cyan)" }}>
                      {subCount}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Submissions</div>
                  </div>

                  <div
                    style={{
                      background: "var(--bg-input)",
                      border: "1px solid var(--border-color)",
                      borderRadius: "var(--radius-md)",
                      padding: "0.625rem 1rem",
                      textAlign: "center",
                      minWidth: "90px",
                    }}
                  >
                    <div style={{ fontSize: "1.35rem", fontWeight: 800, color: "var(--accent-emerald)" }}>
                      {teamCount}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Teams</div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button onClick={() => handleOpenEdit(track)} className="btn btn-secondary btn-sm">
                    <Edit size={14} /> Edit
                  </button>
                  <button onClick={() => handleDelete(track)} className="btn btn-danger btn-sm">
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Create Competition Track</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="btn-icon">
                ✕
              </button>
            </div>
            <form onSubmit={handleSaveAdd}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Track Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Artificial Intelligence"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Description *</label>
                  <textarea
                    className="form-textarea"
                    placeholder="Describe the scope, problem areas, and expectations for this track..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Judging Focus Criteria</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Model latency, autonomy, agent orchestration"
                    value={formData.criteria}
                    onChange={(e) => setFormData({ ...formData, criteria: e.target.value })}
                  />
                  <span className="form-hint">Displayed to participants and judges during evaluation.</span>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Track
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingTrack && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Edit Challenge Track</h3>
              <button onClick={() => setEditingTrack(null)} className="btn-icon">
                ✕
              </button>
            </div>
            <form onSubmit={handleSaveEdit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Track Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-textarea"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Judging Focus Criteria</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.criteria}
                    onChange={(e) => setFormData({ ...formData, criteria: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setEditingTrack(null)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
