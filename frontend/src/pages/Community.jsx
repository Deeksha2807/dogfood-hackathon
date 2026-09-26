import { useState } from "react";
import Sidebar from "../components/Sidebar";

const initialProjects = [
  {
    id: 1,
    name: "MediScan AI",
    teamName: "NeuralHealth",
    event: "Hackathon 2026",
    description:
      "Automated medical imaging diagnostic tool leveraging lightweight vision transformers to detect anomalies in chest radiographs.",
    votes: 42,
  },
  {
    id: 2,
    name: "Decentralized Credential Vault",
    teamName: "CipherNode",
    event: "Innovation Challenge",
    description:
      "Zero-knowledge verifiable credentials stored on EVM-compatible chains for privacy-preserving digital identification.",
    votes: 35,
  },
  {
    id: 3,
    name: "SmartTriage Assistant",
    teamName: "CareFlow",
    event: "Hackathon 2026",
    description:
      "Voice-driven multimodal triage assistant for emergency dispatch operators that transcribes caller inputs and predicts severity.",
    votes: 28,
  },
  {
    id: 4,
    name: "EcoTrace Supply Tracker",
    teamName: "GreenByte",
    event: "Innovation Challenge",
    description:
      "IoT sensor-integrated logistics tracking cold chains with automated tamper and temperature alert verification.",
    votes: 31,
  },
  {
    id: 5,
    name: "PulseGuard AI",
    teamName: "BioTechies",
    event: "Hackathon 2026",
    description:
      "Continuous cardiac arrhythmia monitoring platform for consumer smartwatches using lightweight on-device neural nets.",
    votes: 19,
  },
  {
    id: 6,
    name: "ZeroGas MicroPay",
    teamName: "TokenCraft",
    event: "Innovation Challenge",
    description:
      "Scalable layer-2 micropayment protocol designed for creator tips and streaming content monetization.",
    votes: 24,
  },
];

function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function Community() {
  const [projects, setProjects] = useState(() => shuffleArray(initialProjects));
  const [selectedEvent, setSelectedEvent] = useState("All Events");
  const [votedProjectIds, setVotedProjectIds] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);

  const handleVote = (projectId) => {
    if (votedProjectIds.includes(projectId)) {
      return;
    }

    setProjects((prev) =>
      prev.map((proj) =>
        proj.id === projectId ? { ...proj, votes: proj.votes + 1 } : proj
      )
    );
    setVotedProjectIds((prev) => [...prev, projectId]);
  };

  const filteredProjects =
    selectedEvent === "All Events"
      ? projects
      : projects.filter((project) => project.event === selectedEvent);

  return (
    <div className="admin-layout">
      <Sidebar />

      <main className="dashboard">
        <div className="community-header">
          <h1>Community Voting</h1>
          <p className="community-desc">
            Vote for your favorite hackathon projects! Each vote helps showcase
            outstanding community creations.
          </p>
        </div>

        <div className="filter-bar">
          <label htmlFor="eventFilter" className="filter-label">
            Filter by Event:
          </label>
          <select
            id="eventFilter"
            className="filter-select"
            value={selectedEvent}
            onChange={(e) => setSelectedEvent(e.target.value)}
          >
            <option value="All Events">All Events</option>
            <option value="Hackathon 2026">Hackathon 2026</option>
            <option value="Innovation Challenge">Innovation Challenge</option>
          </select>
        </div>

        <div className="projects-grid">
          {filteredProjects.length > 0 ? (
            filteredProjects.map((project) => {
              const hasVoted = votedProjectIds.includes(project.id);

              return (
                <div key={project.id} className="project-card">
                  <div>
                    <div className="project-card-header">
                      <h3>{project.name}</h3>
                      <span className="role-badge role-participant">
                        {project.event}
                      </span>
                    </div>

                    <div className="project-team">By {project.teamName}</div>

                    <div className="project-description">
                      {project.description}
                    </div>
                  </div>

                  <div>
                    <div className="project-card-footer">
                      <div className="vote-count">
                        <span>🔥</span>
                        <span>
                          {project.votes}{" "}
                          {project.votes === 1 ? "vote" : "votes"}
                        </span>
                      </div>

                      <div className="vote-actions">
                        <button
                          type="button"
                          className="btn-action btn-view"
                          onClick={() => setSelectedProject(project)}
                        >
                          View Project
                        </button>

                        {hasVoted ? (
                          <button
                            type="button"
                            className="btn-voted"
                            disabled
                          >
                            Voted ✓
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="btn-primary"
                            style={{ padding: "6px 14px", fontSize: "13px" }}
                            onClick={() => handleVote(project.id)}
                          >
                            Vote
                          </button>
                        )}
                      </div>
                    </div>

                    {hasVoted && (
                      <div className="vote-recorded-msg">
                        Your vote has been recorded.
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <p style={{ color: "#6b7280" }}>
              No projects found for the selected event.
            </p>
          )}
        </div>
      </main>

      {/* Project Details Modal */}
      {selectedProject && (
        <div
          className="modal-overlay"
          onClick={() => setSelectedProject(null)}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="modal-header">
              <h2>Project Details</h2>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setSelectedProject(null)}
                aria-label="Close modal"
              >
                &times;
              </button>
            </div>

            <div className="detail-grid">
              <div className="detail-item" style={{ gridColumn: "span 2" }}>
                <span className="detail-label">Project Name</span>
                <span className="detail-value">
                  <strong>{selectedProject.name}</strong>
                </span>
              </div>

              <div className="detail-item">
                <span className="detail-label">Team Name</span>
                <span className="detail-value">{selectedProject.teamName}</span>
              </div>

              <div className="detail-item">
                <span className="detail-label">Event</span>
                <span className="detail-value">{selectedProject.event}</span>
              </div>

              <div className="detail-item" style={{ gridColumn: "span 2" }}>
                <span className="detail-label">Vote Count</span>
                <span className="detail-value">
                  <strong>
                    {
                      projects.find((p) => p.id === selectedProject.id)
                        ?.votes ?? selectedProject.votes
                    }
                  </strong>{" "}
                  votes
                </span>
              </div>

              <div className="detail-item" style={{ gridColumn: "span 2" }}>
                <span className="detail-label">Description</span>
                <div className="detail-description">
                  {selectedProject.description}
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setSelectedProject(null)}
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

export default Community;
