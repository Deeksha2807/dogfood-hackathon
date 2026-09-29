import React, { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import { Users as UsersIcon, Search, Filter, Mail, RefreshCw, X, Shield, UserCheck } from 'lucide-react';

export default function UsersPage({ setToast }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.users.getAll();
      setUsers(res.data || []);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      const res = await api.users.updateRole(userId, newRole);
      if (res.success) {
        setToast && setToast({ type: 'success', message: `Updated user role to ${newRole}` });
        fetchUsers();
      }
    } catch (err) {
      setToast && setToast({ type: 'error', message: err.message || 'Failed to update role' });
    }
  };

  // Real-time client-side filtered user list combining search query & role filter dropdown
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesRole = roleFilter === 'All' || user.role.toLowerCase() === roleFilter.toLowerCase();
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || (
        user.name?.toLowerCase().includes(q) ||
        user.email?.toLowerCase().includes(q) ||
        user.department?.toLowerCase().includes(q) ||
        user.role?.toLowerCase().includes(q) ||
        user.bio?.toLowerCase().includes(q)
      );
      return matchesRole && matchesSearch;
    });
  }, [users, roleFilter, searchQuery]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '4px' }}>
            User Directory & Access Controls
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Manage platform users, search profiles, assign judging credentials, and configure roles.
          </p>
        </div>
        <button onClick={fetchUsers} className="btn btn-secondary btn-sm">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {/* Global Search Bar & Combined Dropdown Filters */}
      <div className="glass-panel" style={{ padding: '16px', borderRadius: 'var(--radius-md)', display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Real-Time Search Input */}
        <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search users by name, email, department, or bio..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input"
            style={{ width: '100%', paddingLeft: '38px', paddingRight: searchQuery ? '36px' : '14px' }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Combined Role Dropdown Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={15} color="var(--text-muted)" />
          <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Role Filter:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="form-select"
            style={{ padding: '8px 12px' }}
          >
            <option value="All">All Roles</option>
            <option value="Participant">Participant</option>
            <option value="Judge">Judge</option>
            <option value="Admin">Admin</option>
            <option value="Organizer">Organizer</option>
          </select>
        </div>

        {/* Filter Count Badge */}
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
          Showing {filteredUsers.length} of {users.length} users
        </span>
      </div>

      {loading ? (
        <div className="skeleton" style={{ height: '200px', width: '100%' }}></div>
      ) : error ? (
        <div className="glass-panel" style={{ padding: '24px', borderRadius: '12px', color: '#f43f5e', textAlign: 'center' }}>
          {error}
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', borderRadius: '16px' }}>
          <UsersIcon size={40} color="var(--text-muted)" style={{ marginBottom: '12px' }} />
          <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '6px' }}>No Users Found</h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            No user profiles match your search criteria "{searchQuery}".
          </p>
          <button onClick={() => { setSearchQuery(''); setRoleFilter('All'); }} className="btn btn-secondary btn-sm" style={{ marginTop: '12px' }}>
            Reset Search
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {filteredUsers.map(u => (
            <div key={u.id} className="glass-panel" style={{ padding: '20px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img src={u.avatar} alt={u.name} style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--accent-primary)' }} />
                <div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 700 }}>{u.name}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Mail size={12} /> {u.email}
                  </div>
                </div>
              </div>

              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', background: '#1f2937', padding: '10px 14px', borderRadius: '8px', lineHeight: '1.45' }}>
                {u.bio}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Dept: <strong>{u.department}</strong>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Shield size={14} color="var(--accent-primary)" />
                  <select
                    value={u.role}
                    onChange={(e) => handleRoleChange(u.id, e.target.value)}
                    className="form-select"
                    style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                  >
                    <option value="Participant">Participant</option>
                    <option value="Judge">Judge</option>
                    <option value="Admin">Admin</option>
                    <option value="Organizer">Organizer</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
