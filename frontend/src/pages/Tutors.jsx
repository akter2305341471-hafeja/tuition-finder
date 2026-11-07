import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import { Stars } from "../components/ui";

export default function Tutors() {
  const [f, setF] = useState({ subject: "", area: "" });
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = (params) => {
    setLoading(true);
    const clean = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== ""));
    api.get("/tutors/", { params: clean }).then((r) => setTutors(r.data)).finally(() => setLoading(false));
  };
  useEffect(() => load({}), []);

  return (
    <div className="container py-4">
      <h3 className="mb-3">Verified Tutors</h3>
      <form className="card card-body mb-4" onSubmit={(e) => { e.preventDefault(); load(f); }}>
        <div className="form-row">
          <div className="col-md-5 mb-2"><input className="form-control" placeholder="Subject" value={f.subject} onChange={(e) => setF({ ...f, subject: e.target.value })} /></div>
          <div className="col-md-5 mb-2"><input className="form-control" placeholder="Area" value={f.area} onChange={(e) => setF({ ...f, area: e.target.value })} /></div>
          <div className="col-md-2 mb-2"><button className="btn btn-primary btn-block">Search</button></div>
        </div>
      </form>
      {loading ? <p>Loading...</p> : tutors.length === 0 ? <div className="alert alert-info">No verified tutors found.</div> : (
        <div className="row">
          {tutors.map((t) => (
            <div className="col-md-6 col-lg-4 mb-3" key={t.id}>
              <div className="card card-hover h-100"><div className="card-body">
                <h5>{t.name} <span className="badge badge-success">Verified</span></h5>
                <p className="mb-1">🎓 {t.education || "—"}</p>
                <p className="mb-1">📚 {t.subjects || "—"}</p>
                <p className="mb-1">📍 {t.area || "—"} · ৳{t.expected_salary}/month</p>
                <Stars rating={t.rating} count={t.review_count} />
              </div>
              <div className="card-footer bg-white"><Link className="btn btn-outline-primary btn-sm" to={`/tutors/${t.id}`}>View profile</Link></div></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
