import { useEffect, useState } from "react";
import api, { errMsg } from "../api";
import ProfileForm from "../components/ProfileForm";
import { Badge, Msg, Tabs } from "../components/ui";

const EMPTY = { title: "", student_class: "", subject: "", area: "", salary: "", days_per_week: 3, description: "" };

function PostForm({ editing, onDone }) {
  const [f, setF] = useState(editing || EMPTY);
  const [msg, setMsg] = useState(null);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    try {
      if (editing) await api.put(`/posts/${editing.id}/`, f);
      else await api.post("/posts/", f);
      onDone(editing ? "Post updated." : "Post created. It will be visible after admin approval.");
    } catch (err) {
      setMsg({ type: "danger", text: errMsg(err) });
    }
  };

  return (
    <form className="card card-body mb-4" onSubmit={submit}>
      <h5>{editing ? "Edit tuition post" : "Create a tuition post"}</h5>
      <Msg msg={msg} />
      <div className="form-row">
        <div className="form-group col-md-6"><label>Title</label><input className="form-control" required value={f.title} onChange={set("title")} placeholder="e.g. Math tutor for Class 8" /></div>
        <div className="form-group col-md-3"><label>Class</label><input className="form-control" required value={f.student_class} onChange={set("student_class")} placeholder="Class 8" /></div>
        <div className="form-group col-md-3"><label>Subject</label><input className="form-control" required value={f.subject} onChange={set("subject")} /></div>
      </div>
      <div className="form-row">
        <div className="form-group col-md-4"><label>Area</label><input className="form-control" required value={f.area} onChange={set("area")} /></div>
        <div className="form-group col-md-4"><label>Salary (৳/month)</label><input type="number" min="1" className="form-control" required value={f.salary} onChange={set("salary")} /></div>
        <div className="form-group col-md-4"><label>Days per week</label><input type="number" min="1" max="7" className="form-control" required value={f.days_per_week} onChange={set("days_per_week")} /></div>
      </div>
      <div className="form-group"><label>Description</label><textarea className="form-control" rows="2" value={f.description} onChange={set("description")} /></div>
      <div>
        <button className="btn btn-primary mr-2">{editing ? "Update" : "Create post"}</button>
        {editing && <button type="button" className="btn btn-outline-secondary" onClick={() => onDone()}>Cancel</button>}
      </div>
    </form>
  );
}

function Applications({ postId, filled, onChange }) {
  const [apps, setApps] = useState(null);
  const load = () => api.get(`/posts/${postId}/applications/`).then((r) => setApps(r.data));
  useEffect(() => { load(); }, [postId]);

  const decide = async (id, status) => {
    try {
      await api.post(`/applications/${id}/decide/`, { status });
      await load();
      onChange();
    } catch (err) {
      alert(errMsg(err));
    }
  };

  if (!apps) return <p className="mb-0">Loading...</p>;
  if (apps.length === 0) return <p className="text-muted mb-0">No applications yet.</p>;
  return apps.map((a) => (
    <div className="border rounded p-2 mb-2 bg-white" key={a.id}>
      <b>{a.tutor_name}</b> <Badge status={a.status} />
      <div className="small text-muted">
        {a.tutor_info?.education} · {a.tutor_info?.subjects} · {a.tutor_info?.experience}
        {a.tutor_info?.rating && ` · ⭐ ${a.tutor_info.rating}`}
      </div>
      {a.message && <div className="my-1">“{a.message}”</div>}
      {a.status === "ACCEPTED" && a.tutor_info?.phone && <div className="text-success">📞 Contact: {a.tutor_info.phone}</div>}
      {a.status === "PENDING" && !filled && (
        <div className="mt-1">
          <button className="btn btn-success btn-sm mr-1" onClick={() => decide(a.id, "ACCEPTED")}>Accept</button>
          <button className="btn btn-outline-danger btn-sm" onClick={() => decide(a.id, "REJECTED")}>Reject</button>
        </div>
      )}
    </div>
  ));
}

function MyPosts() {
  const [posts, setPosts] = useState([]);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [openId, setOpenId] = useState(null);
  const [msg, setMsg] = useState(null);

  const load = () => api.get("/posts/mine/").then((r) => setPosts(r.data));
  useEffect(() => { load(); }, []);

  const done = (text) => {
    setShowForm(false); setEditing(null);
    if (text) setMsg({ type: "success", text });
    load();
  };
  const remove = async (id) => {
    if (!window.confirm("Delete this post?")) return;
    await api.delete(`/posts/${id}/`);
    setMsg({ type: "success", text: "Post deleted." });
    load();
  };

  return (
    <>
      <Msg msg={msg} />
      {showForm ? <PostForm key={editing?.id || "new"} editing={editing} onDone={done} />
        : <button className="btn btn-primary mb-3" onClick={() => { setEditing(null); setShowForm(true); }}>+ New tuition post</button>}
      {posts.length === 0 && <div className="alert alert-info">You have no posts yet.</div>}
      {posts.map((p) => (
        <div className="card mb-2" key={p.id}><div className="card-body">
          <div className="d-flex justify-content-between flex-wrap">
            <div>
              <h6 className="mb-1">{p.title} <Badge status={p.approval} /> {p.is_filled && <Badge status="FILLED" />}</h6>
              <small className="text-muted">{p.student_class} · {p.subject} · {p.area} · ৳{p.salary}/month · {p.applications_count} applicant(s)</small>
            </div>
            <div>
              <button className="btn btn-outline-primary btn-sm mr-1" onClick={() => setOpenId(openId === p.id ? null : p.id)}>Applications</button>
              <button className="btn btn-outline-secondary btn-sm mr-1" onClick={() => { setEditing(p); setShowForm(true); window.scrollTo(0, 0); }}>Edit</button>
              <button className="btn btn-outline-danger btn-sm" onClick={() => remove(p.id)}>Delete</button>
            </div>
          </div>
          {openId === p.id && <div className="mt-3 bg-light p-2 rounded"><Applications postId={p.id} filled={p.is_filled} onChange={load} /></div>}
        </div></div>
      ))}
    </>
  );
}

function HiredTutors() {
  const [list, setList] = useState([]);
  const [form, setForm] = useState({});
  const [msg, setMsg] = useState(null);
  const load = () => api.get("/reviews/hired/").then((r) => setList(r.data));
  useEffect(() => { load(); }, []);

  const submit = async (tutorId) => {
    const f = form[tutorId] || {};
    try {
      await api.post("/reviews/", { tutor: tutorId, rating: Number(f.rating || 5), comment: f.comment || "" });
      setMsg({ type: "success", text: "Thank you! Your review was submitted." });
      load();
    } catch (err) {
      setMsg({ type: "danger", text: errMsg(err) });
    }
  };
  const upd = (id, k, v) => setForm({ ...form, [id]: { ...form[id], [k]: v } });

  return (
    <>
      <Msg msg={msg} />
      {list.length === 0 && <div className="alert alert-info">When you accept a tutor, they appear here so you can review them.</div>}
      {list.map((h) => (
        <div className="card mb-2" key={`${h.tutor_id}-${h.post_title}`}><div className="card-body">
          <h6>{h.tutor_name} <small className="text-muted">· hired for “{h.post_title}” · 📞 {h.phone || "—"}</small></h6>
          {h.reviewed ? <span className="text-success">✓ You reviewed this tutor</span> : (
            <div className="form-row align-items-center">
              <div className="col-auto"><select className="form-control form-control-sm" value={form[h.tutor_id]?.rating || 5} onChange={(e) => upd(h.tutor_id, "rating", e.target.value)}>
                {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} ★</option>)}</select></div>
              <div className="col"><input className="form-control form-control-sm" placeholder="Write a comment" value={form[h.tutor_id]?.comment || ""} onChange={(e) => upd(h.tutor_id, "comment", e.target.value)} /></div>
              <div className="col-auto"><button className="btn btn-primary btn-sm" onClick={() => submit(h.tutor_id)}>Submit review</button></div>
            </div>
          )}
        </div></div>
      ))}
    </>
  );
}

export default function GuardianDashboard() {
  const [tab, setTab] = useState("posts");
  return (
    <>
      <h3 className="mb-3">Guardian Dashboard</h3>
      <Tabs active={tab} onChange={setTab} tabs={[["posts", "My Posts"], ["hired", "Hired Tutors & Reviews"], ["profile", "My Profile"]]} />
      {tab === "posts" && <MyPosts />}
      {tab === "hired" && <HiredTutors />}
      {tab === "profile" && <ProfileForm role="GUARDIAN" />}
    </>
  );
}
