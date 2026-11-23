
import { useEffect, useState } from "react";
import api, { errMsg } from "../api";
import ProfileForm from "../components/ProfileForm";
import { Badge, Msg, Tabs } from "../components/ui";
import "./GuardianDashboard.css";

const EMPTY = {
  title: "",
  student_class: "",
  subject: "",
  area: "",
  salary: "",
  days_per_week: 3,
  description: "",
};

function PostForm({ editing, onDone }) {
  const [f, setF] = useState(editing || EMPTY);
  const [msg, setMsg] = useState(null);
  const [saving, setSaving] = useState(false);

  const set = (k) => (e) =>
    setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);

    try {
      if (editing) {
        await api.put(`/posts/${editing.id}/`, f);
      } else {
        await api.post("/posts/", f);
      }

      onDone(
        editing
          ? "Post updated successfully."
          : "Post created. It will be visible after admin approval."
      );
    } catch (err) {
      setMsg({ type: "danger", text: errMsg(err) });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="guardian-form-card">
      <div className="guardian-section-heading">
        <span>{editing ? "UPDATE TUITION" : "NEW OPPORTUNITY"}</span>
        <h4>{editing ? "Edit Tuition Post" : "Create a Tuition Post"}</h4>
      </div>

      <Msg msg={msg} />

      <form onSubmit={submit}>
        <div className="guardian-form-grid">
          <div className="guardian-field guardian-field-full">
            <label>Post Title</label>
            <input
              required
              value={f.title}
              onChange={set("title")}
              placeholder="e.g. Math tutor for Class 8"
            />
          </div>

          <div className="guardian-field">
            <label>Student Class</label>
            <input
              required
              value={f.student_class}
              onChange={set("student_class")}
              placeholder="Class 8"
            />
          </div>

          <div className="guardian-field">
            <label>Subject</label>
            <input
              required
              value={f.subject}
              onChange={set("subject")}
              placeholder="Mathematics"
            />
          </div>

          <div className="guardian-field">
            <label>Area</label>
            <input
              required
              value={f.area}
              onChange={set("area")}
              placeholder="Enter area"
            />
          </div>

          <div className="guardian-field">
            <label>Salary (৳/month)</label>
            <input
              type="number"
              min="1"
              required
              value={f.salary}
              onChange={set("salary")}
              placeholder="5000"
            />
          </div>

          <div className="guardian-field">
            <label>Days Per Week</label>
            <input
              type="number"
              min="1"
              max="7"
              required
              value={f.days_per_week}
              onChange={set("days_per_week")}
            />
          </div>

          <div className="guardian-field guardian-field-full">
            <label>Description</label>
            <textarea
              rows="4"
              value={f.description}
              onChange={set("description")}
              placeholder="Write details about the tuition..."
            />
          </div>
        </div>

        <div className="guardian-form-actions">
          <button className="guardian-primary-btn" disabled={saving}>
            {saving
              ? "Saving..."
              : editing
                ? "Update Post"
                : "Create Post"}
          </button>

          {editing && (
            <button
              type="button"
              className="guardian-cancel-btn"
              onClick={() => onDone()}
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

function Applications({ postId, filled, onChange }) {
  const [apps, setApps] = useState(null);
  const [msg, setMsg] = useState(null);

  const load = async () => {
    try {
      const r = await api.get(`/posts/${postId}/applications/`);
      setApps(r.data);
    } catch (err) {
      setMsg({ type: "danger", text: errMsg(err) });
    }
  };

  useEffect(() => {
    load();
  }, [postId]);

  const decide = async (id, status) => {
    try {
      await api.post(`/applications/${id}/decide/`, { status });
      await load();
      onChange();
    } catch (err) {
      setMsg({ type: "danger", text: errMsg(err) });
    }
  };

  if (!apps) {
    return <p className="guardian-muted">Loading applications...</p>;
  }

  if (apps.length === 0) {
    return <p className="guardian-muted">No applications yet.</p>;
  }

  return (
    <div className="guardian-applications">
      <Msg msg={msg} />

      {apps.map((a) => (
        <div className="guardian-application-card" key={a.id}>
          <div className="guardian-application-top">
            <strong>{a.tutor_name}</strong>
            <Badge status={a.status} />
          </div>

          <p>
            {a.tutor_info?.education} · {a.tutor_info?.subjects} ·{" "}
            {a.tutor_info?.experience}
            {a.tutor_info?.rating && ` · ⭐ ${a.tutor_info.rating}`}
          </p>

          {a.message && <div className="guardian-message">{a.message}</div>}

          {a.status === "ACCEPTED" && a.tutor_info?.phone && (
            <p className="guardian-contact">
              Contact: {a.tutor_info.phone}
            </p>
          )}

          {a.status === "PENDING" && !filled && (
            <div className="guardian-action-row">
              <button
                className="guardian-accept-btn"
                onClick={() => decide(a.id, "ACCEPTED")}
              >
                Accept
              </button>
              <button
                className="guardian-reject-btn"
                onClick={() => decide(a.id, "REJECTED")}
              >
                Reject
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function MyPosts() {
  const [posts, setPosts] = useState([]);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [openId, setOpenId] = useState(null);
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const r = await api.get("/posts/mine/");
      setPosts(r.data);
    } catch (err) {
      setMsg({ type: "danger", text: errMsg(err) });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const done = (text) => {
    setShowForm(false);
    setEditing(null);

    if (text) setMsg({ type: "success", text });
    load();
  };

  const remove = async (id) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;

    try {
      await api.delete(`/posts/${id}/`);
      setMsg({ type: "success", text: "Post deleted successfully." });
      load();
    } catch (err) {
      setMsg({ type: "danger", text: errMsg(err) });
    }
  };

  return (
    <div className="guardian-section">
      <div className="guardian-section-heading">
        <span>YOUR TUITION POSTS</span>
        <h4>Manage Your Posts</h4>
        <p>Create, edit, delete and manage tutor applications.</p>
      </div>

      <Msg msg={msg} />

      {!showForm && (
        <button
          className="guardian-primary-btn guardian-new-post"
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
        >
          + Create New Post
        </button>
      )}

      {showForm && (
        <PostForm
          key={editing?.id || "new"}
          editing={editing}
          onDone={done}
        />
      )}

      {loading && <p className="guardian-muted">Loading posts...</p>}

      {!loading && posts.length === 0 && (
        <div className="guardian-empty">
          <h5>No Tuition Posts Yet</h5>
          <p>Create your first tuition post to find a suitable tutor.</p>
        </div>
      )}

      <div className="guardian-post-grid">
        {posts.map((p) => (
          <div className="guardian-post-card" key={p.id}>
            <div className="guardian-post-header">
              <div>
                <span className="guardian-card-label">TUITION POST</span>
                <h5>{p.title}</h5>
              </div>

              <div className="guardian-statuses">
                <Badge status={p.approval} />
                {p.is_filled && <Badge status="FILLED" />}
              </div>
            </div>

            <div className="guardian-post-details">
              <span>Class: {p.student_class}</span>
              <span>Subject: {p.subject}</span>
              <span>Area: {p.area}</span>
              <span>Salary: ৳{p.salary}/month</span>
              <span>Applicants: {p.applications_count}</span>
            </div>

            <div className="guardian-post-actions">
              <button
                className="guardian-view-btn"
                onClick={() =>
                  setOpenId(openId === p.id ? null : p.id)
                }
              >
                {openId === p.id ? "Hide Applications" : "Applications"}
              </button>

              <button
                className="guardian-edit-btn"
                onClick={() => {
                  setEditing(p);
                  setShowForm(true);
                  window.scrollTo(0, 0);
                }}
              >
                Edit
              </button>

              <button
                className="guardian-delete-btn"
                onClick={() => remove(p.id)}
              >
                Delete
              </button>
            </div>

            {openId === p.id && (
              <div className="guardian-application-area">
                <h6>Applications for this post</h6>
                <Applications
                  postId={p.id}
                  filled={p.is_filled}
                  onChange={load}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function HiredTutors() {
  const [list, setList] = useState([]);
  const [form, setForm] = useState({});
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const r = await api.get("/reviews/hired/");
      setList(r.data);
    } catch (err) {
      setMsg({ type: "danger", text: errMsg(err) });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (tutorId) => {
    const f = form[tutorId] || {};

    try {
      await api.post("/reviews/", {
        tutor: tutorId,
        rating: Number(f.rating || 5),
        comment: f.comment || "",
      });

      setMsg({
        type: "success",
        text: "Thank you! Your review was submitted.",
      });

      load();
    } catch (err) {
      setMsg({ type: "danger", text: errMsg(err) });
    }
  };

  const upd = (id, k, v) => {
    setForm((prev) => ({
      ...prev,
      [id]: { ...prev[id], [k]: v },
    }));
  };

  return (
    <div className="guardian-section">
      <div className="guardian-section-heading">
        <span>YOUR TUTOR CONNECTIONS</span>
        <h4>Hired Tutors & Reviews</h4>
        <p>View hired tutors and share your experience.</p>
      </div>

      <Msg msg={msg} />

      {loading && <p className="guardian-muted">Loading hired tutors...</p>}

      {!loading && list.length === 0 && (
        <div className="guardian-empty">
          <h5>No Hired Tutors Yet</h5>
          <p>When you accept a tutor, their information will appear here.</p>
        </div>
      )}

      <div className="guardian-hired-grid">
        {list.map((h) => (
          <div
            className="guardian-hired-card"
            key={`${h.tutor_id}-${h.post_title}`}
          >
            <div className="guardian-tutor-avatar">
              {(h.tutor_name || "T").charAt(0).toUpperCase()}
            </div>

            <div className="guardian-hired-info">
              <span className="guardian-card-label">HIRED TUTOR</span>
              <h5>{h.tutor_name}</h5>
              <p>Tuition: {h.post_title}</p>
              <p>Phone: {h.phone || "Not available"}</p>

              {h.reviewed ? (
                <div className="guardian-reviewed">
                  ✓ You have already reviewed this tutor
                </div>
              ) : (
                <div className="guardian-review-form">
                  <label>Give a Rating</label>
                  <select
                    value={form[h.tutor_id]?.rating || 5}
                    onChange={(e) =>
                      upd(h.tutor_id, "rating", e.target.value)
                    }
                  >
                    {[5, 4, 3, 2, 1].map((n) => (
                      <option key={n} value={n}>
                        {n} ★
                      </option>
                    ))}
                  </select>

                  <label>Your Review</label>
                  <input
                    placeholder="Write your comment..."
                    value={form[h.tutor_id]?.comment || ""}
                    onChange={(e) =>
                      upd(h.tutor_id, "comment", e.target.value)
                    }
                  />

                  <button
                    className="guardian-primary-btn"
                    onClick={() => submit(h.tutor_id)}
                  >
                    Submit Review
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function GuardianDashboard() {
  const [tab, setTab] = useState("posts");

  return (
    <div className="guardian-dashboard">
      <div className="guardian-dashboard-header">
        <span>WELCOME BACK</span>
        <h3>Guardian Dashboard</h3>
        <p>Manage tuition posts, tutors and your personal profile.</p>
      </div>

      <Tabs
        active={tab}
        onChange={setTab}
        tabs={[
          ["posts", "My Posts"],
          ["hired", "Hired Tutors & Reviews"],
          ["profile", "My Profile"],
        ]}
      />

      {tab === "posts" && <MyPosts />}
      {tab === "hired" && <HiredTutors />}
      {tab === "profile" && <ProfileForm role="GUARDIAN" />}
    </div>
  );
}
