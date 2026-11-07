import { useEffect, useState } from "react";
import api, { errMsg } from "../api";
import { Badge, Msg, Tabs } from "../components/ui";

const STAT_LABELS = [
  ["total_users", "Total users", "primary"], ["guardians", "Guardians", "info"], ["tutors", "Tutors", "info"],
  ["total_posts", "Tuition posts", "secondary"], ["successful_matches", "Successful matches", "success"],
  ["pending_tutors", "Tutors awaiting verification", "warning"], ["pending_posts", "Posts awaiting approval", "warning"],
  ["total_reviews", "Reviews", "dark"],
];

function Stats() {
  const [s, setS] = useState(null);
  useEffect(() => { api.get("/admin/dashboard/").then((r) => setS(r.data)); }, []);
  if (!s) return <p>Loading...</p>;
  return (
    <div className="row">
      {STAT_LABELS.map(([key, label, color]) => (
        <div className="col-6 col-md-3 mb-3" key={key}>
          <div className={`card text-white bg-${color}`}><div className="card-body text-center">
            <div style={{ fontSize: 32, fontWeight: 700 }}>{s[key]}</div><small>{label}</small>
          </div></div>
        </div>
      ))}
    </div>
  );
}

function Users() {
  const [users, setUsers] = useState([]);
  const [q, setQ] = useState("");
  const [msg, setMsg] = useState(null);
  const load = () => api.get("/admin/users/", { params: q ? { q } : {} }).then((r) => setUsers(r.data));
  useEffect(() => { load(); }, []);

  const toggle = async (u) => {
    try {
      await api.post(`/admin/users/${u.id}/toggle-block/`);
      setMsg({ type: "success", text: `${u.first_name} was ${u.is_active ? "blocked" : "unblocked"}.` });
      load();
    } catch (err) { setMsg({ type: "danger", text: errMsg(err) }); }
  };

  return (
    <>
      <Msg msg={msg} />
      <form className="form-inline mb-3" onSubmit={(e) => { e.preventDefault(); load(); }}>
        <input className="form-control mr-2" placeholder="Search name / username / email" value={q} onChange={(e) => setQ(e.target.value)} />
        <button className="btn btn-primary">Search</button>
      </form>
      <div className="table-responsive"><table className="table table-sm table-bordered bg-white">
        <thead className="thead-light"><tr><th>Name</th><th>Username</th><th>Email</th><th>Role</th><th>Status</th><th></th></tr></thead>
        <tbody>{users.map((u) => (
          <tr key={u.id}>
            <td>{u.first_name}</td><td>{u.username}</td><td>{u.email}</td><td>{u.role}</td>
            <td><Badge status={u.is_active ? "ACTIVE" : "BLOCKED"} /></td>
            <td><button className={`btn btn-sm ${u.is_active ? "btn-outline-danger" : "btn-outline-success"}`} onClick={() => toggle(u)}>{u.is_active ? "Block" : "Unblock"}</button></td>
          </tr>))}
        </tbody>
      </table></div>
    </>
  );
}

function Tutors() {
  const [tutors, setTutors] = useState([]);
  const [filter, setFilter] = useState("PENDING");
  const load = () => api.get("/admin/tutors/", { params: filter ? { verification: filter } : {} }).then((r) => setTutors(r.data));
  useEffect(() => { load(); }, [filter]);

  const verify = async (id, status) => { await api.post(`/admin/tutors/${id}/verify/`, { status }); load(); };

  return (
    <>
      <div className="btn-group mb-3">
        {["PENDING", "APPROVED", "REJECTED", ""].map((v) => (
          <button key={v} className={`btn btn-sm ${filter === v ? "btn-primary" : "btn-outline-primary"}`} onClick={() => setFilter(v)}>{v || "ALL"}</button>
        ))}
      </div>
      {tutors.length === 0 && <div className="alert alert-info">No tutors in this list.</div>}
      {tutors.map((t) => (
        <div className="card mb-2" key={t.id}><div className="card-body py-2 d-flex justify-content-between flex-wrap">
          <div>
            <b>{t.name}</b> <Badge status={t.verification} />
            <div className="small text-muted">{t.education || "No education"} · {t.subjects || "No subjects"} · {t.experience || "No experience"} · {t.area || "No area"}</div>
          </div>
          <div>
            {t.verification !== "APPROVED" && <button className="btn btn-success btn-sm mr-1" onClick={() => verify(t.id, "APPROVED")}>Approve</button>}
            {t.verification !== "REJECTED" && <button className="btn btn-outline-danger btn-sm" onClick={() => verify(t.id, "REJECTED")}>Reject</button>}
          </div>
        </div></div>
      ))}
    </>
  );
}

function Posts() {
  const [posts, setPosts] = useState([]);
  const [filter, setFilter] = useState("PENDING");
  const load = () => api.get("/admin/posts/", { params: filter ? { approval: filter } : {} }).then((r) => setPosts(r.data));
  useEffect(() => { load(); }, [filter]);

  const moderate = async (id, action) => { await api.post(`/admin/posts/${id}/moderate/`, { action }); load(); };

  return (
    <>
      <div className="btn-group mb-3">
        {["PENDING", "APPROVED", "REMOVED", ""].map((v) => (
          <button key={v} className={`btn btn-sm ${filter === v ? "btn-primary" : "btn-outline-primary"}`} onClick={() => setFilter(v)}>{v || "ALL"}</button>
        ))}
      </div>
      {posts.length === 0 && <div className="alert alert-info">No posts in this list.</div>}
      {posts.map((p) => (
        <div className="card mb-2" key={p.id}><div className="card-body py-2 d-flex justify-content-between flex-wrap">
          <div>
            <b>{p.title}</b> <Badge status={p.approval} />
            <div className="small text-muted">By {p.guardian_name} · {p.student_class} · {p.subject} · {p.area} · ৳{p.salary}</div>
          </div>
          <div>
            {p.approval !== "APPROVED" && <button className="btn btn-success btn-sm mr-1" onClick={() => moderate(p.id, "approve")}>Approve</button>}
            {p.approval !== "REMOVED" && <button className="btn btn-outline-danger btn-sm" onClick={() => moderate(p.id, "remove")}>Remove</button>}
          </div>
        </div></div>
      ))}
    </>
  );
}

export default function AdminDashboard() {
  const [tab, setTab] = useState("stats");
  return (
    <>
      <h3 className="mb-3">Admin Dashboard</h3>
      <Tabs active={tab} onChange={setTab} tabs={[["stats", "Overview"], ["tutors", "Tutor Verification"], ["posts", "Post Moderation"], ["users", "Manage Users"]]} />
      {tab === "stats" && <Stats />}
      {tab === "tutors" && <Tutors />}
      {tab === "posts" && <Posts />}
      {tab === "users" && <Users />}
    </>
  );
}
