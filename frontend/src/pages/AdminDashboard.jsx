
import { useEffect, useState } from "react";
import api, { errMsg } from "../api";
import { Badge, Msg, Tabs } from "../components/ui";
import "./AdminDashboard.css";

function Users() {
  const [users, setUsers] = useState([]);
  const [q, setQ] = useState("");
  const [role, setRole] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const response = await api.get("/admin/users/", {
        params: q.trim() ? { q: q.trim() } : {},
      });
      setUsers(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setMsg({ type: "danger", text: errMsg(err) });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const toggle = async (u) => {
    const action = u.is_active ? "block" : "unblock";

    if (!window.confirm(`Are you sure you want to ${action} ${u.first_name || u.username}?`)) {
      return;
    }

    setBusyId(u.id);
    setMsg(null);

    try {
      await api.post(`/admin/users/${u.id}/toggle-block/`);
      setMsg({
        type: "success",
        text: `${u.first_name || u.username} has been ${u.is_active ? "blocked" : "unblocked"} successfully.`,
      });
      await load();
    } catch (err) {
      setMsg({ type: "danger", text: errMsg(err) });
    } finally {
      setBusyId(null);
    }
  };

  const filteredUsers = users.filter((u) => {
    const roleMatch = role === "ALL" || u.role === role;
    const statusMatch =
      status === "ALL" ||
      (status === "ACTIVE" ? u.is_active : !u.is_active);

    return roleMatch && statusMatch;
  });

  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.is_active).length;
  const blockedUsers = users.filter((u) => !u.is_active).length;
  const tutors = users.filter((u) => u.role === "TUTOR").length;
  const guardians = users.filter((u) => u.role === "GUARDIAN").length;

  const getInitial = (u) =>
    (u.first_name || u.username || "U").charAt(0).toUpperCase();

  return (
    <div className="admin-users-page">
      <div className="admin-users-header">
        <div>
          <span className="admin-eyebrow">ADMINISTRATION</span>
          <h2>User Management</h2>
          <p>View, manage and control all registered users.</p>
        </div>
        <div className="admin-header-icon">♙</div>
      </div>

      <Msg msg={msg} />

      <div className="admin-user-stats">
        <div className="admin-stat-card">
          <div className="admin-stat-icon purple">♙</div>
          <div>
            <small>Total Users</small>
            <h3>{totalUsers}</h3>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon green">✓</div>
          <div>
            <small>Active Users</small>
            <h3>{activeUsers}</h3>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon red">⊘</div>
          <div>
            <small>Blocked Users</small>
            <h3>{blockedUsers}</h3>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon blue">♧</div>
          <div>
            <small>Tutors / Guardians</small>
            <h3>{tutors} / {guardians}</h3>
          </div>
        </div>
      </div>

      <div className="admin-user-content">
        <div className="admin-user-content-heading">
          <div>
            <h4>Registered Users</h4>
            <p>Manage account access and user information.</p>
          </div>
          <button className="admin-refresh-btn" onClick={load}>
            ↻ Refresh
          </button>
        </div>

        <form
          className="admin-user-filters"
          onSubmit={(e) => {
            e.preventDefault();
            load();
          }}
        >
          <div className="admin-search-box">
            <span>⌕</span>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search name, username or email..."
            />
          </div>

          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="ALL">All Roles</option>
            <option value="ADMIN">Admin</option>
            <option value="GUARDIAN">Guardian</option>
            <option value="TUTOR">Tutor</option>
          </select>

          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="BLOCKED">Blocked</option>
          </select>

          <button type="submit" className="admin-search-btn">
            Search
          </button>
        </form>

        <div className="admin-table-summary">
          <span>Showing <b>{filteredUsers.length}</b> users</span>
          <span>Account Management</span>
        </div>

        {loading ? (
          <div className="admin-users-empty">
            <div className="admin-loader"></div>
            <p>Loading users...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="admin-users-empty">
            <div className="admin-empty-icon">♙</div>
            <h5>No users found</h5>
            <p>Try changing your search or filter.</p>
          </div>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-user-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div className="admin-user-name">
                        <div className="admin-user-avatar">
                          {getInitial(u)}
                        </div>
                        <div>
                          <strong>{u.first_name || "No name"}</strong>
                          <small>User ID: #{u.id}</small>
                        </div>
                      </div>
                    </td>

                    <td>{u.username}</td>
                    <td className="admin-email">{u.email}</td>

                    <td>
                      <span className={`admin-role role-${u.role?.toLowerCase()}`}>
                        {u.role}
                      </span>
                    </td>

                    <td>
                      <span className={`admin-status ${u.is_active ? "active" : "blocked"}`}>
                        <span className="admin-status-dot"></span>
                        {u.is_active ? "Active" : "Blocked"}
                      </span>
                    </td>

                    <td>
                      <button
                        className={`admin-toggle-btn ${u.is_active ? "block-btn" : "unblock-btn"}`}
                        disabled={busyId === u.id || u.role === "ADMIN"}
                        onClick={() => toggle(u)}
                        title={u.role === "ADMIN" ? "Admin account cannot be changed here" : ""}
                      >
                        {busyId === u.id
                          ? "Please wait..."
                          : u.role === "ADMIN"
                            ? "Admin"
                            : u.is_active
                              ? "Block"
                              : "Unblock"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [tab, setTab] = useState("users");

  return (
    <div className="admin-dashboard">
      <div className="admin-main-heading">
        <div>
          <span>CONTROL CENTER</span>
          <h2>Admin Dashboard</h2>
          <p>Manage your Tuition Finder platform.</p>
        </div>
      </div>

      <Tabs
        active={tab}
        onChange={setTab}
        tabs={[
          ["users", "Manage Users"],
          ["stats", "Overview"],
          ["tutors", "Tutor Verification"],
          ["posts", "Post Moderation"],
        ]}
      />

      <div className="admin-tab-content">
        {tab === "users" && <Users />}
        {tab === "stats" && <div className="admin-existing-feature"><Stats /></div>}
        {tab === "tutors" && <Tutors />}
        {tab === "posts" && <Posts />}
      </div>
    </div>
  );
}

function Stats() {
  const [s, setS] = useState(null);

  useEffect(() => {
    api.get("/admin/dashboard/")
      .then((r) => setS(r.data))
      .catch(() => setS({}));
  }, []);

  if (!s) return <p>Loading...</p>;

  const labels = [
    ["total_users", "Total Users"],
    ["guardians", "Guardians"],
    ["tutors", "Tutors"],
    ["total_posts", "Tuition Posts"],
    ["successful_matches", "Successful Matches"],
    ["pending_tutors", "Pending Tutors"],
    ["pending_posts", "Pending Posts"],
    ["total_reviews", "Reviews"],
  ];

  return (
    <div className="admin-user-stats">
      {labels.map(([key, label]) => (
        <div className="admin-stat-card" key={key}>
          <div>
            <small>{label}</small>
            <h3>{s[key] ?? 0}</h3>
          </div>
        </div>
      ))}
    </div>
  );
}

function Tutors() {
  const [tutors, setTutors] = useState([]);
  const [filter, setFilter] = useState("PENDING");

  const load = () =>
    api.get("/admin/tutors/", {
      params: filter ? { verification: filter } : {},
    }).then((r) => setTutors(r.data));

  useEffect(() => {
    load();
  }, [filter]);

  const verify = async (id, status) => {
    try {
      await api.post(`/admin/tutors/${id}/verify/`, { status });
      load();
    } catch (err) {
      window.alert(errMsg(err));
    }
  };

  return (
    <div className="admin-user-content">
      <h4>Tutor Verification</h4>
      <div className="admin-filter-tabs">
        {["PENDING", "APPROVED", "REJECTED", ""].map((v) => (
          <button
            key={v}
            className={filter === v ? "selected" : ""}
            onClick={() => setFilter(v)}
          >
            {v || "ALL"}
          </button>
        ))}
      </div>

      {tutors.length === 0 && <p>No tutors in this list.</p>}

      {tutors.map((t) => (
        <div className="admin-simple-card" key={t.id}>
          <div>
            <strong>{t.name}</strong>
            <p>{t.education || "No education"} · {t.subjects || "No subjects"} · {t.area || "No area"}</p>
            <Badge status={t.verification} />
          </div>
          <div>
            {t.verification !== "APPROVED" && (
              <button onClick={() => verify(t.id, "APPROVED")}>Approve</button>
            )}
            {t.verification !== "REJECTED" && (
              <button onClick={() => verify(t.id, "REJECTED")}>Reject</button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function Posts() {
  const [posts, setPosts] = useState([]);
  const [filter, setFilter] = useState("PENDING");

  const load = () =>
    api.get("/admin/posts/", {
      params: filter ? { approval: filter } : {},
    }).then((r) => setPosts(r.data));

  useEffect(() => {
    load();
  }, [filter]);

  const moderate = async (id, action) => {
    try {
      await api.post(`/admin/posts/${id}/moderate/`, { action });
      load();
    } catch (err) {
      window.alert(errMsg(err));
    }
  };

  return (
    <div className="admin-user-content">
      <h4>Post Moderation</h4>
      <div className="admin-filter-tabs">
        {["PENDING", "APPROVED", "REMOVED", ""].map((v) => (
          <button
            key={v}
            className={filter === v ? "selected" : ""}
            onClick={() => setFilter(v)}
          >
            {v || "ALL"}
          </button>
        ))}
      </div>

      {posts.length === 0 && <p>No posts in this list.</p>}

      {posts.map((p) => (
        <div className="admin-simple-card" key={p.id}>
          <div>
            <strong>{p.title}</strong>
            <p>By {p.guardian_name} · {p.student_class} · {p.subject} · {p.area} · ৳{p.salary}</p>
            <Badge status={p.approval} />
          </div>
          <div>
            {p.approval !== "APPROVED" && (
              <button onClick={() => moderate(p.id, "approve")}>Approve</button>
            )}
            {p.approval !== "REMOVED" && (
              <button onClick={() => moderate(p.id, "remove")}>Remove</button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
