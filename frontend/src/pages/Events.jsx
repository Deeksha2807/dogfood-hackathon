import { useState } from "react";
import Sidebar from "../components/Sidebar";

const initialEvents = [
  {
    id: 1,
    name: "AI Genesis Hackathon 2026",
    date: "Oct 15 - Oct 17, 2026",
    status: "Upcoming",
    teamsCount: 24,
  },
  {
    id: 2,
    name: "Web3 Innovation Challenge",
    date: "Sep 20 - Sep 22, 2026",
    status: "Active",
    teamsCount: 18,
  },
  {
    id: 3,
    name: "Global HealthTech Sprint",
    date: "Aug 05 - Aug 07, 2026",
    status: "Completed",
    teamsCount: 32,
  },
  {
    id: 4,
    name: "FinTech Breakthrough Summit",
    date: "Nov 10 - Nov 12, 2026",
    status: "Upcoming",
    teamsCount: 15,
  },
];

function getStatusClass(status) {
  switch (status.toLowerCase()) {
    case "active":
      return "status-badge status-active";
    case "upcoming":
      return "status-badge status-upcoming";
    case "completed":
      return "status-badge status-completed";
    default:
      return "status-badge";
  }
}

function Events() {
  const [events, setEvents] = useState(initialEvents);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState(null);
  const [deletingEvent, setDeletingEvent] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    date: "",
    status: "Active",
    teamsCount: "",
  });
  const [errors, setErrors] = useState({});

  const handleOpenAddModal = () => {
    setEditingEventId(null);
    setFormData({
      name: "",
      date: "",
      status: "Active",
      teamsCount: "",
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (event) => {
    setEditingEventId(event.id);
    setFormData({
      name: event.name,
      date: event.date,
      status: event.status,
      teamsCount: event.teamsCount ?? "",
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingEventId(null);
    setFormData({
      name: "",
      date: "",
      status: "Active",
      teamsCount: "",
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
      newErrors.name = "Event name is required";
    }
    if (!formData.date.trim()) {
      newErrors.date = "Date is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const parsedTeamsCount =
      formData.teamsCount === ""
        ? 0
        : Math.max(0, parseInt(formData.teamsCount, 10) || 0);

    if (editingEventId !== null) {
      setEvents((prev) =>
        prev.map((item) =>
          item.id === editingEventId
            ? {
                ...item,
                name: formData.name.trim(),
                date: formData.date.trim(),
                status: formData.status,
                teamsCount: parsedTeamsCount,
              }
            : item
        )
      );
    } else {
      const newEvent = {
        id: Date.now(),
        name: formData.name.trim(),
        date: formData.date.trim(),
        status: formData.status,
        teamsCount: parsedTeamsCount,
      };
      setEvents((prev) => [...prev, newEvent]);
    }

    handleCloseModal();
  };

  const handleConfirmDelete = () => {
    if (deletingEvent) {
      setEvents((prev) => prev.filter((event) => event.id !== deletingEvent.id));
      setDeletingEvent(null);
    }
  };

  return (
    <div className="admin-layout">
      <Sidebar />

      <main className="dashboard">
        <div className="page-header">
          <h1>Event Management</h1>
          <button
            type="button"
            className="btn-primary"
            onClick={handleOpenAddModal}
          >
            + Add Event
          </button>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Event Name</th>
                <th>Date</th>
                <th>Status</th>
                <th>Teams</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.id}>
                  <td>
                    <strong>{event.name}</strong>
                  </td>
                  <td>{event.date}</td>
                  <td>
                    <span className={getStatusClass(event.status)}>
                      {event.status}
                    </span>
                  </td>
                  <td>{event.teamsCount}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        type="button"
                        className="btn-action btn-edit"
                        onClick={() => handleOpenEditModal(event)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn-action btn-delete"
                        onClick={() => setDeletingEvent(event)}
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

      {/* Add / Edit Event Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="modal-header">
              <h2>{editingEventId ? "Edit Event" : "Add New Event"}</h2>
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
                <label htmlFor="eventName">Event Name *</label>
                <input
                  id="eventName"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. AI Genesis Hackathon 2026"
                  className={errors.name ? "input-error" : ""}
                />
                {errors.name && <p className="error-text">{errors.name}</p>}
              </div>

              <div className="form-group">
                <label htmlFor="eventDate">Date *</label>
                <input
                  id="eventDate"
                  type="text"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  placeholder="e.g. Oct 15 - Oct 17, 2026"
                  className={errors.date ? "input-error" : ""}
                />
                {errors.date && <p className="error-text">{errors.date}</p>}
              </div>

              <div className="form-group">
                <label htmlFor="eventStatus">Status</label>
                <select
                  id="eventStatus"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="Active">Active</option>
                  <option value="Upcoming">Upcoming</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="teamsCount">Number of Teams</label>
                <input
                  id="teamsCount"
                  type="number"
                  name="teamsCount"
                  min="0"
                  value={formData.teamsCount}
                  onChange={handleChange}
                  placeholder="0"
                />
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
                  {editingEventId ? "Update Event" : "Save Event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingEvent && (
        <div className="modal-overlay" onClick={() => setDeletingEvent(null)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="modal-header">
              <h2>Delete Event</h2>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setDeletingEvent(null)}
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
              Are you sure you want to delete the event{" "}
              <strong>"{deletingEvent.name}"</strong>? This action cannot be
              undone.
            </p>

            <div className="modal-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setDeletingEvent(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-danger"
                onClick={handleConfirmDelete}
              >
                Delete Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Events;
