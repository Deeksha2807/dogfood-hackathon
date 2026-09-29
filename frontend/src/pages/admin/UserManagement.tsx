import React, { useState, useEffect } from "react";
import { userService } from "../../services/userService";
import { useToast } from "../../context/ToastContext";
import { MOCK_USERS } from "../../services/mockData";
import { User, GlobalRole } from "../../types";
import { StatusBadge } from "../../components/common/StatusBadge";
import {
  Users,
  Search,
  Shield,
  CheckCircle,
  XCircle,
  UserCheck,
  Filter,
} from "lucide-react";

export const UserManagement: React.FC = () => {
  const { success, error } = useToast();
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [search, setSearch] = useState<string>("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const list = await userService.listUsers();
        if (list && list.length > 0) setUsers(list);
      } catch {}
    };
    loadUsers();
  }, []);

  const handleRoleChange = async (userId: string, newRole: GlobalRole) => {
    try {
      await userService.updateUserRole(userId, newRole);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, globalRole: newRole } : u))
      );
      success(`User role updated to ${newRole}`);
    } catch (err: any) {
      error(err.message || "Failed to update user role.");
    }
  };

  const handleToggleStatus = async (userId: string) => {
    try {
      const updated = await userService.toggleUserStatus(userId);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, isActive: updated.isActive } : u))
      );
      success(`User status ${updated.isActive ? "activated" : "deactivated"}`);
    } catch (err: any) {
      error(err.message || "Failed to toggle user status.");
    }
  };

  const filtered = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "ALL" || u.globalRole === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div className="page-title">
          <h1>
            <Users size={28} color="var(--primary)" /> User Directory & RBAC
          </h1>
          <p>Inspect registered platform users, elevate administrative privileges, and manage account statuses</p>
        </div>
      </div>

      {/* Filter Bar */}
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
            placeholder="Search by user name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
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
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            style={{ minWidth: "160px" }}
          >
            <option value="ALL">All Roles</option>
            <option value="SUPER_ADMIN">Super Admin</option>
            <option value="ADMIN">Admin</option>
            <option value="USER">Standard User</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Global Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id}>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <div
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        background: "var(--primary-light)",
                        color: "var(--primary)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 600,
                        fontSize: "0.85rem",
                      }}
                    >
                      {u.name ? u.name.charAt(0).toUpperCase() : "U"}
                    </div>
                    <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{u.name}</span>
                  </div>
                </td>
                <td>
                  <span style={{ color: "var(--text-secondary)", fontSize: "0.85rem", fontFamily: "var(--font-mono)" }}>
                    {u.email}
                  </span>
                </td>
                <td>
                  <select
                    className="form-select"
                    value={u.globalRole}
                    onChange={(e) => handleRoleChange(u.id, e.target.value as GlobalRole)}
                    style={{ fontSize: "0.8rem", padding: "0.3rem 0.6rem", width: "auto" }}
                  >
                    <option value="USER">USER</option>
                    <option value="ADMIN">ADMIN</option>
                    <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                  </select>
                </td>
                <td>
                  <span
                    className={`badge ${u.isActive ? "badge-success" : "badge-danger"}`}
                    style={{ cursor: "pointer" }}
                    onClick={() => handleToggleStatus(u.id)}
                  >
                    {u.isActive ? "Active" : "Disabled"}
                  </span>
                </td>
                <td>
                  <button
                    className={`btn ${u.isActive ? "btn-danger" : "btn-success"} btn-sm`}
                    onClick={() => handleToggleStatus(u.id)}
                  >
                    {u.isActive ? "Deactivate" : "Activate"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
