import React, { useState } from "react";
import { useHackathon } from "../../context/HackathonContext";
import { ParticipantData } from "../../data/hackathonData";
import { useToast } from "../../context/ToastContext";
import {
  Users,
  Search,
  Filter,
  Download,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Eye,
  Mail,
  Phone,
  Building,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";

export const ParticipantsPage: React.FC = () => {
  const {
    participants,
    teams,
    addParticipant,
    updateParticipant,
    toggleParticipantStatus,
    removeParticipant,
    exportParticipantsCSV,
    assignParticipantToTeam,
  } = useHackathon();
  const { success, error, info } = useToast();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "Active" | "Pending">("ALL");
  const [teamFilter, setTeamFilter] = useState<"ALL" | "ASSIGNED" | "LONE">("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  // Modals state
  const [selectedParticipant, setSelectedParticipant] = useState<ParticipantData | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    collegeCompany: "",
    phone: "",
    status: "Active" as "Active" | "Pending",
  });
  const [selectedTeamId, setSelectedTeamId] = useState("");

  // Filtering
  const filtered = participants.filter((p) => {
    const q = search.toLowerCase();
    const matchesSearch =
      p.name.toLowerCase().includes(q) ||
      p.email.toLowerCase().includes(q) ||
      p.collegeCompany.toLowerCase().includes(q) ||
      (p.teamName && p.teamName.toLowerCase().includes(q));

    const matchesStatus = statusFilter === "ALL" || p.status === statusFilter;
    const matchesTeam =
      teamFilter === "ALL" ||
      (teamFilter === "ASSIGNED" && !!p.teamId) ||
      (teamFilter === "LONE" && !p.teamId);

    return matchesSearch && matchesStatus && matchesTeam;
  });

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Stats
  const activeCount = participants.filter((p) => p.status === "Active").length;
  const pendingCount = participants.filter((p) => p.status === "Pending").length;
  const loneCount = participants.filter((p) => !p.teamId).length;

  const handleOpenAdd = () => {
    setFormData({
      name: "",
      email: "",
      collegeCompany: "",
      phone: "",
      status: "Active",
    });
    setIsAddModalOpen(true);
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      error("Name and Email are required.");
      return;
    }
    addParticipant(formData);
    success(`Participant ${formData.name} added successfully.`);
    setIsAddModalOpen(false);
  };

  const handleOpenEdit = (p: ParticipantData) => {
    setSelectedParticipant(p);
    setFormData({
      name: p.name,
      email: p.email,
      collegeCompany: p.collegeCompany,
      phone: p.phone,
      status: p.status,
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedParticipant) return;
    updateParticipant(selectedParticipant.id, formData);
    success(`Updated participant profile for ${formData.name}.`);
    setIsEditModalOpen(false);
  };

  const handleToggleStatus = (p: ParticipantData) => {
    toggleParticipantStatus(p.id);
    success(
      `Participant ${p.name} status changed to ${p.status === "Active" ? "Pending" : "Active"}.`
    );
  };

  const handleRemove = (p: ParticipantData) => {
    if (window.confirm(`Are you sure you want to remove ${p.name} from the hackathon?`)) {
      removeParticipant(p.id);
      info(`Removed ${p.name} from hackathon roster.`);
    }
  };

  const handleAssignTeam = (p: ParticipantData) => {
    setSelectedParticipant(p);
    setSelectedTeamId(teams[0]?.id || "");
    setIsAssignModalOpen(true);
  };

  const handleConfirmAssign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedParticipant || !selectedTeamId) return;
    assignParticipantToTeam(selectedParticipant.id, selectedTeamId);
    const targetTeam = teams.find((t) => t.id === selectedTeamId);
    success(`Assigned ${selectedParticipant.name} to ${targetTeam?.name || "team"}.`);
    setIsAssignModalOpen(false);
  };

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div className="page-header">
        <div className="page-title">
          <h1>
            <Users size={28} color="var(--primary)" /> Participant Management
          </h1>
          <p>Complete directory of all 120 hackathon participants, status verification, and squad assignments</p>
        </div>

        <div className="page-actions">
          <button onClick={exportParticipantsCSV} className="btn btn-secondary">
            <Download size={16} /> Export CSV
          </button>
          <button onClick={handleOpenAdd} className="btn btn-primary">
            <Plus size={16} /> Add Participant
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid-4" style={{ marginBottom: "1.5rem" }}>
        <div className="card" style={{ padding: "1.25rem" }}>
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600 }}>TOTAL ROSTER</div>
          <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--primary)" }}>{participants.length}</div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Verified Google registrations</div>
        </div>
        <div className="card" style={{ padding: "1.25rem" }}>
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600 }}>ACTIVE HACKERS</div>
          <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--accent-emerald)" }}>{activeCount}</div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Passed onboarding requirements</div>
        </div>
        <div className="card" style={{ padding: "1.25rem" }}>
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600 }}>PENDING ONBOARDING</div>
          <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--accent-amber)" }}>{pendingCount}</div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Awaiting profile completion</div>
        </div>
        <div className="card" style={{ padding: "1.25rem" }}>
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600 }}>LONE PARTICIPANTS</div>
          <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--accent-cyan)" }}>{loneCount}</div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Need squad placement</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        className="card"
        style={{
          marginBottom: "1.5rem",
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          padding: "1rem 1.25rem",
          flexWrap: "wrap",
        }}
      >
        <div style={{ position: "relative", flex: "1 1 280px" }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search by participant name, email, university/company, or team..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            style={{ paddingLeft: "2.25rem" }}
          />
          <Search
            size={16}
            color="var(--text-muted)"
            style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)" }}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Filter size={16} color="var(--text-muted)" />
          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as any);
              setCurrentPage(1);
            }}
            style={{ minWidth: "140px" }}
          >
            <option value="ALL">All Statuses</option>
            <option value="Active">Active Only</option>
            <option value="Pending">Pending Only</option>
          </select>

          <select
            className="form-select"
            value={teamFilter}
            onChange={(e) => {
              setTeamFilter(e.target.value as any);
              setCurrentPage(1);
            }}
            style={{ minWidth: "160px" }}
          >
            <option value="ALL">All Assignments</option>
            <option value="ASSIGNED">In a Team</option>
            <option value="LONE">Lone Participant</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="table-container" style={{ marginBottom: "1rem" }}>
        <table className="table">
          <thead>
            <tr>
              <th>Participant</th>
              <th>Contact Details</th>
              <th>Team Squad</th>
              <th>Status</th>
              <th>Registered</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
                  No participants found matching the current filters.
                </td>
              </tr>
            ) : (
              paginated.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <div
                        style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "50%",
                          background: "var(--bg-input)",
                          border: "1px solid var(--border-color)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "0.85rem",
                          fontWeight: 700,
                          color: "var(--primary)",
                        }}
                      >
                        {p.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{p.name}</div>
                        <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                          {p.collegeCompany}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: "0.85rem", color: "var(--text-primary)" }}>{p.email}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{p.phone}</div>
                  </td>
                  <td>
                    {p.teamName ? (
                      <span className="badge badge-primary">{p.teamName}</span>
                    ) : (
                      <button
                        onClick={() => handleAssignTeam(p)}
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: "0.75rem", padding: "0.2rem 0.5rem" }}
                      >
                        + Assign Squad
                      </button>
                    )}
                  </td>
                  <td>
                    <span className={`badge ${p.status === "Active" ? "badge-success" : "badge-warning"}`}>
                      {p.status}
                    </span>
                  </td>
                  <td style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    {new Date(p.registeredAt).toLocaleDateString()}
                  </td>
                  <td>
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.35rem" }}>
                      <button
                        onClick={() => {
                          setSelectedParticipant(p);
                          setIsViewModalOpen(true);
                        }}
                        className="btn-icon"
                        title="View details"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(p)}
                        className="btn-icon"
                        title="Edit profile"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(p)}
                        className="btn-icon"
                        title={p.status === "Active" ? "Deactivate" : "Activate"}
                      >
                        {p.status === "Active" ? (
                          <XCircle size={16} color="var(--accent-amber)" />
                        ) : (
                          <CheckCircle size={16} color="var(--accent-emerald)" />
                        )}
                      </button>
                      <button
                        onClick={() => handleRemove(p)}
                        className="btn-icon"
                        title="Remove participant"
                      >
                        <Trash2 size={16} color="var(--accent-rose)" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.5rem" }}>
        <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
          Showing {(currentPage - 1) * pageSize + 1} to{" "}
          {Math.min(currentPage * pageSize, filtered.length)} of {filtered.length} participants
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="btn btn-secondary btn-sm"
          >
            <ChevronLeft size={16} /> Previous
          </button>
          <div style={{ display: "flex", alignItems: "center", padding: "0 0.5rem", fontSize: "0.85rem", fontWeight: 600 }}>
            Page {currentPage} of {totalPages}
          </div>
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="btn btn-secondary btn-sm"
          >
            Next <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* View Modal */}
      {isViewModalOpen && selectedParticipant && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Participant Dossier</h3>
              <button onClick={() => setIsViewModalOpen(false)} className="btn-icon">
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
                <div
                  style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "50%",
                    background: "var(--primary-light)",
                    color: "var(--primary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.25rem",
                    fontWeight: 700,
                  }}
                >
                  {selectedParticipant.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h4 style={{ fontSize: "1.2rem", fontWeight: 700 }}>{selectedParticipant.name}</h4>
                  <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                    {selectedParticipant.collegeCompany}
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="card" style={{ padding: "0.875rem" }}>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>EMAIL</div>
                  <div style={{ fontSize: "0.9rem", fontWeight: 600 }}>{selectedParticipant.email}</div>
                </div>
                <div className="card" style={{ padding: "0.875rem" }}>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>PHONE</div>
                  <div style={{ fontSize: "0.9rem", fontWeight: 600 }}>{selectedParticipant.phone}</div>
                </div>
                <div className="card" style={{ padding: "0.875rem" }}>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>TEAM</div>
                  <div style={{ fontSize: "0.9rem", fontWeight: 600 }}>
                    {selectedParticipant.teamName || "Not yet assigned"}
                  </div>
                </div>
                <div className="card" style={{ padding: "0.875rem" }}>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>STATUS</div>
                  <div style={{ fontSize: "0.9rem", fontWeight: 600 }}>{selectedParticipant.status}</div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setIsViewModalOpen(false)} className="btn btn-secondary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && selectedParticipant && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Edit Participant Profile</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="btn-icon">
                ✕
              </button>
            </div>
            <form onSubmit={handleSaveEdit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-input"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">College / Company</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.collegeCompany}
                    onChange={(e) => setFormData({ ...formData, collegeCompany: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    className="form-select"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  >
                    <option value="Active">Active</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="btn btn-secondary">
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

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Register New Participant</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="btn-icon">
                ✕
              </button>
            </div>
            <form onSubmit={handleSaveAdd}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Maya Lin"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="e.g. maya@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">College / Company</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Stanford University"
                    value={formData.collegeCompany}
                    onChange={(e) => setFormData({ ...formData, collegeCompany: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. +1 (555) 019-2831"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add Participant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Squad Modal */}
      {isAssignModalOpen && selectedParticipant && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Assign Squad Placement</h3>
              <button onClick={() => setIsAssignModalOpen(false)} className="btn-icon">
                ✕
              </button>
            </div>
            <form onSubmit={handleConfirmAssign}>
              <div className="modal-body">
                <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", marginBottom: "1rem" }}>
                  Select an active squad to assign <strong>{selectedParticipant.name}</strong> to:
                </p>
                <div className="form-group">
                  <label className="form-label">Target Team Squad</label>
                  <select
                    className="form-select"
                    value={selectedTeamId}
                    onChange={(e) => setSelectedTeamId(e.target.value)}
                  >
                    {teams.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.members.length} members • {t.trackName})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setIsAssignModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Confirm Placement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
