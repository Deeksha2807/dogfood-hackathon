import { useState } from "react";
import Sidebar from "../components/Sidebar";

const initialJudges = [
  {
    id: 1,
    name: "Dr. Evelyn Reed",
    email: "e.reed@university.edu",
    assignedEvent: "AI Genesis Hackathon 2026",
    status: "Active",
  },
  {
    id: 2,
    name: "Samantha Chen",
    email: "sam.chen@example.com",
    assignedEvent: "Web3 Innovation Challenge",
    status: "Active",
  },
  {
    id: 3,
    name: "Liam O'Connor",
    email: "liam.oc@ventures.com",
    assignedEvent: "Global HealthTech Sprint",
    status: "Inactive",
  },
  {
    id: 4,
    name: "Dr. Sophia Patel",
    email: "sophia.p@neurotech.org",
    assignedEvent: "AI Genesis Hackathon 2026",
    status: "Active",
  },
  {
    id: 5,
    name: "Carlos Mendez",
    email: "carlos.m@fintechsummit.io",
    assignedEvent: "FinTech Breakthrough Summit",
    status: "Active",
  },
];

function getStatusClass(status) {
  return status.toLowerCase() === "active"
    ? "status-badge status-active"
    : "status-badge status-inactive";
}

function Judges() {
  const [judges, setJudges] = useState(initialJudges);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJudgeId, setEditingJudgeId] = useState(null);
  const [deletingJudge, setDeletingJudge] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    assignedEvent: "",
    status: "Active",
  });
  const [errors, setErrors] = useState({});

  const handleOpenAddModal = () => {
    setEditingJudgeId(null);
    setFormData({
      name: "",
      email: "",
      assignedEvent: "",
      status: "Active",
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (judge) => {
    setEditingJudgeId(judge.id);
    setFormData({
      name: judge.name,
      email: judge.email,
      assignedEvent: judge.assignedEvent,
      status: judge.status,
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingJudgeId(null);
    setFormData({
      name: "",
      email: "",
      assignedEvent: "",
      status: "Active",
    });
    setErrors({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email.trim())) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!formData.assignedEvent.trim()) {
      newErrors.assignedEvent = "Assigned event is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (editingJudgeId !== null) {
      setJudges((prev) =>
        prev.map((j) =>
          j.id === editingJudgeId
            ? {
                ...j,
                name: formData.name.trim(),
                email: formData.email.trim(),
                assignedEvent: formData.assignedEvent.trim(),
                status: formData.status,
              }
            : j
        )
      );
    } else {
      const newJudge = {
        id: Date.now(),
        name: formData.name.trim(),
        email: formData.email.trim(),
        assignedEvent: formData.assignedEvent.trim(),
        status: formData.status,
      };
      setJudges((prev) => [...prev, newJudge]);
    }

    handleCloseModal();
  };

  const handleConfirmDelete = () => {
    if (deletingJudge) {
      setJudges((prev) => prev.filter((j) => j.id !== deletingJudge.id));
      setDeletingJudge(null);
    }
  };

  return (
    <div className="admin-layout">
      <Sidebar />

      <main className="dashboard">
        <div className="page-header">
          <h1>Judge Management</h1>
          <button
            type="button"
            className="btn-primary"
            onClick={handleOpenAddModal}
          >
            + Add Judge
          </button>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Assigned Event</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {judges.map((judge) => (
                <tr key={judge.id}>
                  <td>
                    <strong>{judge.name}</strong>
                  </td>
                  <td>{judge.email}</td>
                  <td>{judge.assignedEvent}</td>
                  <td>
                    <span className={getStatusClass(judge.status)}>
                      {judge.status}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        type="button"
                        className="btn-action btn-edit"
                        onClick={() => handleOpenEditModal(judge)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn-action btn-delete"
                        onClick={() => setDeletingJudge(judge)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* Add / Edit Judge Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="modal-header">
              <h2>{editingJudgeId ? "Edit Judge" : "Add New Judge"}</h2>
              <button
                type="button"
                className="modal-close-btn"
                onClick={handleCloseModal}
                aria-label="Close modal"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="judgeName">Name *</label>
                <input
                  id="judgeName"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Dr. Evelyn Reed"
                  className={errors.name ? "input-error" : ""}
                />
                {errors.name && <p className="error-text">{errors.name}</p>}
              </div>

              <div className="form-group">
                <label htmlFor="judgeEmail">Email *</label>
                <input
                  id="judgeEmail"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="e.g. e.reed@university.edu"
                  className={errors.email ? "input-error" : ""}
                />
                {errors.email && <p className="error-text">{errors.email}</p>}
              </div>

              <div className="form-group">
                <label htmlFor="judgeAssignedEvent">Assigned Event *</label>
                <input
                  id="judgeAssignedEvent"
                  type="text"
                  name="assignedEvent"
                  value={formData.assignedEvent}
                  onChange={handleChange}
                  placeholder="e.g. AI Genesis Hackathon 2026"
                  className={errors.assignedEvent ? "input-error" : ""}
                />
                {errors.assignedEvent && (
                  <p className="error-text">{errors.assignedEvent}</p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="judgeStatus">Status</label>
                <select
                  id="judgeStatus"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleCloseModal}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingJudgeId ? "Update Judge" : "Save Judge"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Judge Confirmation Modal */}
      {deletingJudge && (
        <div className="modal-overlay" onClick={() => setDeletingJudge(null)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="modal-header">
              <h2>Delete Judge</h2>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setDeletingJudge(null)}
                aria-label="Close modal"
              >
                &times;
              </button>
            </div>

            <p
              style={{
                margin: "0 0 20px 0",
                color: "#4b5563",
                lineHeight: "1.5",
              }}
            >
              Are you sure you want to delete the judge{" "}
              <strong>"{deletingJudge.name}"</strong>? This action cannot be
              undone.
            </p>

            <div className="modal-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setDeletingJudge(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-danger"
                onClick={handleConfirmDelete}
              >
                Delete Judge
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Judges;
