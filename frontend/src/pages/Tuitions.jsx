import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";

const EMPTY = { q: "", student_class: "", subject: "", area: "", min_salary: "", max_salary: "" };

export default function Tuitions() {
  const [f, setF] = useState(EMPTY);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const load = (params) => {
    setLoading(true);
    const clean = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== ""));
    api.get("/posts/", { params: clean }).then((r) => setPosts(r.data)).finally(() => setLoading(false));
  };
  useEffect(() => load(EMPTY), []);

  return (
    <div className="container py-4">
      <h3 className="mb-3">Find a Tuition</h3>
      <form className="card card-body mb-4" onSubmit={(e) => { e.preventDefault(); load(f); }}>
        <div className="form-row">
          <div className="col-md-4 mb-2"><input className="form-control" placeholder="Search keyword" value={f.q} onChange={set("q")} /></div>
          <div className="col-md-2 mb-2"><input className="form-control" placeholder="Class" value={f.student_class} onChange={set("student_class")} /></div>
          <div className="col-md-2 mb-2"><input className="form-control" placeholder="Subject" value={f.subject} onChange={set("subject")} /></div>
          <div className="col-md-2 mb-2"><input className="form-control" placeholder="Area" value={f.area} onChange={set("area")} /></div>
          <div className="col-md-1 mb-2"><input type="number" className="form-control" placeholder="Min ৳" value={f.min_salary} onChange={set("min_salary")} /></div>
          <div className="col-md-1 mb-2"><input type="number" className="form-control" placeholder="Max ৳" value={f.max_salary} onChange={set("max_salary")} /></div>
        </div>
        <div>
          <button className="btn btn-primary btn-sm mr-2">Search</button>
          <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => { setF(EMPTY); load(EMPTY); }}>Reset</button>
        </div>
      </form>

      {loading ? <p>Loading...</p> : posts.length === 0 ? <div className="alert alert-info">No tuition found. Try different filters.</div> : (
        <div className="row">
          {posts.map((p) => (
            <div className="col-md-6 col-lg-4 mb-3" key={p.id}>
              <div className="card card-hover h-100"><div className="card-body">
                <h5>{p.title}</h5>
                <p className="mb-1"><span className="badge badge-info mr-1">{p.student_class}</span><span className="badge badge-secondary">{p.subject}</span></p>
                <p className="mb-1">📍 {p.area}</p>
                <p className="mb-1">💰 ৳{p.salary}/month · {p.days_per_week} days/week</p>
                <small className="text-muted">{p.applications_count} applicant(s)</small>
              </div>
              <div className="card-footer bg-white"><Link className="btn btn-outline-primary btn-sm" to={`/tuitions/${p.id}`}>View details</Link></div></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
