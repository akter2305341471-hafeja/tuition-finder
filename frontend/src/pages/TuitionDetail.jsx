import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api, { errMsg } from "../api";
import { useAuth } from "../auth";
import { Badge, Msg } from "../components/ui";

export default function TuitionDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [message, setMessage] = useState("");
  const [msg, setMsg] = useState(null);
  const [error, setError] = useState("");

  const load = () => api.get(`/posts/${id}/`).then((r) => setPost(r.data)).catch(() => setError("This tuition post was not found."));
  useEffect(() => { load(); }, [id]);

  const apply = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/posts/${id}/apply/`, { message });
      setMsg({ type: "success", text: "Application sent! The guardian will review it." });
      load();
    } catch (err) {
      setMsg({ type: "danger", text: errMsg(err) });
    }
  };

  if (error) return <div className="container py-5"><div className="alert alert-warning">{error}</div></div>;
  if (!post) return <div className="container py-5">Loading...</div>;

  return (
    <div className="container py-4" style={{ maxWidth: 760 }}>
      <Link to="/tuitions">← Back to tuitions</Link>
      <div className="card mt-3"><div className="card-body">
        <h3>{post.title} {post.is_filled && <Badge status="FILLED" />}</h3>
        <p className="mb-1"><span className="badge badge-info mr-1">{post.student_class}</span><span className="badge badge-secondary">{post.subject}</span></p>
        <p className="mb-1">📍 {post.area}</p>
        <p className="mb-1">💰 ৳{post.salary}/month · {post.days_per_week} days/week</p>
        <p className="mb-1">👤 Posted by {post.guardian_name}</p>
        <hr />
        <p style={{ whiteSpace: "pre-wrap" }}>{post.description || "No extra description."}</p>
      </div></div>

      <div className="mt-3">
        <Msg msg={msg} />
        {!user && <div className="alert alert-info"><Link to="/login">Login</Link> as a tutor to apply for this tuition.</div>}
        {user?.role === "GUARDIAN" && <div className="alert alert-secondary">Guardians manage their posts from the Dashboard.</div>}
        {user?.role === "TUTOR" && (post.has_applied
          ? <div className="alert alert-success">You have already applied to this post.</div>
          : post.is_filled ? <div className="alert alert-secondary">This tuition has been filled.</div>
          : (
            <form className="card card-body" onSubmit={apply}>
              <h5>Apply for this tuition</h5>
              <textarea className="form-control mb-2" rows="3" placeholder="Write a short message to the guardian" value={message} onChange={(e) => setMessage(e.target.value)} />
              <div><button className="btn btn-primary">Apply now</button></div>
            </form>
          ))}
      </div>
    </div>
  );
}
