import { useState } from "react";
import Sidebar from "../components/Sidebar";

const initialUsers = [
  {
    id: 1,
    name: "Alex Rivera",
    email: "alex.rivera@example.com",
    role: "Admin",
    status: "Active",
  },
  {
    id: 2,
    name: "Samantha Chen",
    email: "sam.chen@example.com",
    role: "Judge",
    status: "Active",
  },
  {
    id: 3,
    name: "Marcus Vance",
    email: "marcus.v@example.com",
    role: "Participant",
    status: "Active",
  },
  {
    id: 4,
    name: "Dr. Evelyn Reed",
    email: "e.reed@university.edu",
    role: "Judge",
    status: "Active",
  },
  {
    id: 5,
    name: "Priya Patel",
    email: "priya.p@techhub.org",
    role: "Participant",
    status: "Inactive",
  },
  {
    id: 6,
    name: "David Kim",
    email: "david.kim@innovate.io",
    role: "Participant",
    status: "Active",
  },
];

function getStatusClass(status) {
  return status.toLowerCase() === "active"
    ? "status-badge status-active"
    : "status-badge status-inactive";
}

function getRoleClass(role) {
  switch (role.toLowerCase()) {
    case "admin":
      return "role-badge role-admin";
    case "judge":
      return "role-badge role-judge";
    case "participant":
      return "role-badge role-participant";
    default:
      return "role-badge";
  }
}

function Users() {
  const [users, setUsers] = useState(initialUsers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "Participant",
    status: "Active",
  });
  const [errors, setErrors] = useState({});

  const handleOpenAddModal = () => {
    setEditingUserId(null);
    setFormData({
      name: "",
      email: "",
      role: "Participant",
      status: "Active",
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user) => {
    setEditingUserId(user.id);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUserId(null);
    setFormData({
      name: "",
      email: "",
      role: "Participant",
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
    if (!formData.role) {
      newErrors.role = "Role is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (editingUserId !== null) {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === editingUserId
            ? {
                ...u,
                name: formData.name.trim(),
                email: formData.email.trim(),
                role: formData.role,
                status: formData.status,
              }
            : u
        )
      );
    } else {
      const newUser = {
        id: Date.now(),
        name: formData.name.trim(),
        email: formData.email.trim(),
        role: formData.role,
        status: formData.status,
      };
      setUsers((prev) => [...prev, newUser]);
    }

    handleCloseModal();
  };

  const handleConfirmDelete = () => {
    if (deletingUser) {
      setUsers((prev) => prev.filter((u) => u.id !== deletingUser.id));
      setDeletingUser(null);
    }
  };

  return (
    <div className="admin-layout">
      <Sidebar />

      <main className="dashboard">
        <div className="page-header">
          <h1>User Management</h1>
          <button
            type="button"
            className="btn-primary"
            onClick={handleOpenAddModal}
          >
            + Add User
          </button>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>
                    <strong>{user.name}</strong>
                  </td>
                  <td>{user.email}</td>
                  <td>
                    <span className={getRoleClass(user.role)}>
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <span className={getStatusClass(user.status)}>
                      {user.status}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        type="button"
                        className="btn-action btn-edit"
                        onClick={() => handleOpenEditModal(user)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn-action btn-delete"
                        onClick={() => setDeletingUser(user)}
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

      {/* Add / Edit User Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="modal-header">
              <h2>{editingUserId ? "Edit User" : "Add New User"}</h2>
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
                <label htmlFor="userName">Name *</label>
                <input
                  id="userName"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Alex Rivera"
                  className={errors.name ? "input-error" : ""}
                />
                {errors.name && <p className="error-text">{errors.name}</p>}
              </div>

              <div className="form-group">
                <label htmlFor="userEmail">Email *</label>
                <input
                  id="userEmail"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="e.g. alex.rivera@example.com"
                  className={errors.email ? "input-error" : ""}
                />
                {errors.email && <p className="error-text">{errors.email}</p>}
              </div>

              <div className="form-group">
                <label htmlFor="userRole">Role *</label>
                <select
                  id="userRole"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className={errors.role ? "input-error" : ""}
                >
                  <option value="Admin">Admin</option>
                  <option value="Judge">Judge</option>
                  <option value="Participant">Participant</option>
                </select>
                {errors.role && <p className="error-text">{errors.role}</p>}
              </div>

              <div className="form-group">
                <label htmlFor="userStatus">Status</label>
                <select
                  id="userStatus"
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
                  {editingUserId ? "Update User" : "Save User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete User Confirmation Modal */}
      {deletingUser && (
        <div className="modal-overlay" onClick={() => setDeletingUser(null)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="modal-header">
              <h2>Delete User</h2>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setDeletingUser(null)}
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
              Are you sure you want to delete the user{" "}
              <strong>"{deletingUser.name}"</strong>? This action cannot be
              undone.
            </p>

            <div className="modal-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setDeletingUser(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-danger"
                onClick={handleConfirmDelete}
              >
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Users;
