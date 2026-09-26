import { useState } from "react";
import Sidebar from "../components/Sidebar";

const mockSubmissions = [
  {
    id: 1,
    projectName: "MediScan AI",
    teamName: "NeuralHealth",
    event: "AI Genesis Hackathon 2026",
    submittedAt: "2026-10-16 14:32",
    status: "Under Review",
    description:
      "An automated medical imaging diagnostic tool leveraging lightweight vision transformers to detect anomalies in real-time chest radiographs.",
  },
  {
    id: 2,
    projectName: "Decentralized Credential Vault",
    teamName: "CipherNode",
    event: "Web3 Innovation Challenge",
    submittedAt: "2026-09-21 11:15",
    status: "Evaluated",
    description:
      "Zero-knowledge verifiable credentials stored on EVM-compatible chains enabling cryptographically provable student and employment records.",
  },
  {
    id: 3,
    projectName: "EcoTrace Supply Tracker",
    teamName: "GreenByte",
    event: "Global HealthTech Sprint",
    submittedAt: "2026-08-06 09:45",
    status: "Evaluated",
    description:
      "IoT sensor-integrated dashboard tracking pharmaceutical cold chains with automated tamper and temperature alerts.",
  },
  {
    id: 4,
    projectName: "QuantRisk Sentinel",
    teamName: "AlphaPulse",
    event: "FinTech Breakthrough Summit",
    submittedAt: "2026-11-11 16:20",
    status: "Submitted",
    description:
      "Algorithmic market volatility and high-frequency risk modeling platform with real-time liquidity stress simulation.",
  },
  {
    id: 5,
    projectName: "SmartTriage Assistant",
    teamName: "CareFlow",
    event: "AI Genesis Hackathon 2026",
    submittedAt: "2026-10-17 08:10",
    status: "Submitted",
    description:
      "Voice-driven multimodal triage assistant for emergency dispatch operators that transcribes caller inputs and predicts case severity.",
  },
];

function getStatusClass(status) {
  switch (status.toLowerCase()) {
    case "submitted":
      return "status-badge status-submitted";
    case "under review":
      return "status-badge status-review";
    case "evaluated":
      return "status-badge status-evaluated";
    default:
      return "status-badge";
  }
}

function Submissions() {
  const [submissions] = useState(mockSubmissions);
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  const filteredSubmissions =
    statusFilter === "All"
      ? submissions
      : submissions.filter((sub) => sub.status === statusFilter);

  return (
    <div className="admin-layout">
      <Sidebar />

      <main className="dashboard">
        <div className="page-header">
          <h1>Submission Management</h1>
        </div>

        <div className="filter-bar">
          <label htmlFor="statusFilter" className="filter-label">
            Filter by Status:
          </label>
          <select
            id="statusFilter"
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All</option>
            <option value="Submitted">Submitted</option>
            <option value="Under Review">Under Review</option>
            <option value="Evaluated">Evaluated</option>
          </select>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Project Name</th>
                <th>Team Name</th>
                <th>Event</th>
                <th>Submitted At</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubmissions.length > 0 ? (
                filteredSubmissions.map((submission) => (
                  <tr key={submission.id}>
                    <td>
                      <strong>{submission.projectName}</strong>
                    </td>
                    <td>{submission.teamName}</td>
                    <td>{submission.event}</td>
                    <td>{submission.submittedAt}</td>
                    <td>
                      <span className={getStatusClass(submission.status)}>
                        {submission.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          type="button"
                          className="btn-action btn-view"
                          onClick={() => setSelectedSubmission(submission)}
                        >
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    style={{
                      textAlign: "center",
                      color: "#6b7280",
                      padding: "30px",
                    }}
                  >
                    No submissions found for the selected status.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* Submission Detail Modal */}
      {selectedSubmission && (
        <div
          className="modal-overlay"
          onClick={() => setSelectedSubmission(null)}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="modal-header">
              <h2>Submission Details</h2>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setSelectedSubmission(null)}
                aria-label="Close modal"
              >
                &times;
              </button>
            </div>

            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">Project Name</span>
                <span className="detail-value">
                  <strong>{selectedSubmission.projectName}</strong>
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Team Name</span>
                <span className="detail-value">
                  {selectedSubmission.teamName}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Event</span>
                <span className="detail-value">{selectedSubmission.event}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Submitted At</span>
                <span className="detail-value">
                  {selectedSubmission.submittedAt}
                </span>
              </div>
              <div className="detail-item" style={{ gridColumn: "span 2" }}>
                <span className="detail-label">Status</span>
                <div style={{ marginTop: "4px" }}>
                  <span className={getStatusClass(selectedSubmission.status)}>
                    {selectedSubmission.status}
                  </span>
                </div>
              </div>
              <div className="detail-item" style={{ gridColumn: "span 2" }}>
                <span className="detail-label">Description</span>
                <div className="detail-description">
                  {selectedSubmission.description}
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setSelectedSubmission(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Submissions;
