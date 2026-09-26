import { useState } from "react";
import Sidebar from "../components/Sidebar";

const mockResults = [
  {
    id: 1,
    rank: 1,
    projectName: "MediScan AI",
    teamName: "NeuralHealth",
    event: "AI Genesis Hackathon 2026",
    score: 96.5,
    status: "Evaluated",
  },
  {
    id: 2,
    rank: 2,
    projectName: "Decentralized Credential Vault",
    teamName: "CipherNode",
    event: "Web3 Innovation Challenge",
    score: 93.0,
    status: "Evaluated",
  },
  {
    id: 3,
    rank: 3,
    projectName: "EcoTrace Supply Tracker",
    teamName: "GreenByte",
    event: "Global HealthTech Sprint",
    score: 89.2,
    status: "Evaluated",
  },
  {
    id: 4,
    rank: 4,
    projectName: "QuantRisk Sentinel",
    teamName: "AlphaPulse",
    event: "FinTech Breakthrough Summit",
    score: 85.8,
    status: "Evaluated",
  },
  {
    id: 5,
    rank: "-",
    projectName: "SmartTriage Assistant",
    teamName: "CareFlow",
    event: "AI Genesis Hackathon 2026",
    score: "-",
    status: "Pending",
  },
  {
    id: 6,
    rank: "-",
    projectName: "BioSync Wearable Analytics",
    teamName: "PulseGen",
    event: "Global HealthTech Sprint",
    score: "-",
    status: "Pending",
  },
];

function getStatusClass(status) {
  switch (status.toLowerCase()) {
    case "evaluated":
      return "status-badge status-evaluated";
    case "pending":
      return "status-badge status-pending";
    default:
      return "status-badge";
  }
}

function Results() {
  const [results] = useState(mockResults);
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedResult, setSelectedResult] = useState(null);

  const filteredResults =
    statusFilter === "All"
      ? results
      : results.filter((res) => res.status === statusFilter);

  return (
    <div className="admin-layout">
      <Sidebar />

      <main className="dashboard">
        <div className="page-header">
          <h1>Results Management</h1>
          <button type="button" className="btn-primary">
            Publish Results
          </button>
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
            <option value="Evaluated">Evaluated</option>
            <option value="Pending">Pending</option>
          </select>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Project Name</th>
                <th>Team Name</th>
                <th>Event</th>
                <th>Score</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredResults.length > 0 ? (
                filteredResults.map((result) => (
                  <tr key={result.id}>
                    <td>
                      <strong>
                        {typeof result.rank === "number"
                          ? `#${result.rank}`
                          : result.rank}
                      </strong>
                    </td>
                    <td>
                      <strong>{result.projectName}</strong>
                    </td>
                    <td>{result.teamName}</td>
                    <td>{result.event}</td>
                    <td>
                      {typeof result.score === "number"
                        ? `${result.score} / 100`
                        : result.score}
                    </td>
                    <td>
                      <span className={getStatusClass(result.status)}>
                        {result.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          type="button"
                          className="btn-action btn-view"
                          onClick={() => setSelectedResult(result)}
                        >
                          View Details
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="7"
                    style={{
                      textAlign: "center",
                      color: "#6b7280",
                      padding: "30px",
                    }}
                  >
                    No results found for the selected status.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* Result Details Modal */}
      {selectedResult && (
        <div
          className="modal-overlay"
          onClick={() => setSelectedResult(null)}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="modal-header">
              <h2>Result Details</h2>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setSelectedResult(null)}
                aria-label="Close modal"
              >
                &times;
              </button>
            </div>

            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">Project Name</span>
                <span className="detail-value">
                  <strong>{selectedResult.projectName}</strong>
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Team Name</span>
                <span className="detail-value">{selectedResult.teamName}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Event</span>
                <span className="detail-value">{selectedResult.event}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Rank</span>
                <span className="detail-value">
                  {typeof selectedResult.rank === "number"
                    ? `#${selectedResult.rank}`
                    : selectedResult.rank}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Score</span>
                <span className="detail-value">
                  {typeof selectedResult.score === "number"
                    ? `${selectedResult.score} / 100`
                    : selectedResult.score}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Status</span>
                <div style={{ marginTop: "4px" }}>
                  <span className={getStatusClass(selectedResult.status)}>
                    {selectedResult.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setSelectedResult(null)}
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

export default Results;
