import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api";
import { Stars } from "../components/ui";

export default function TutorDetail() {
  const { id } = useParams();
  const [t, setT] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get(`/tutors/${id}/`).then((r) => setT(r.data)).catch(() => setError("Tutor not found."));
  }, [id]);

  if (error) return <div className="container py-5"><div className="alert alert-warning">{error}</div></div>;
  if (!t) return <div className="container py-5">Loading...</div>;

  return (
    <div className="container py-4" style={{ maxWidth: 760 }}>
      <Link to="/tutors">← Back to tutors</Link>
      <div className="card mt-3"><div className="card-body">
        <h3>{t.name} <span className="badge badge-success">Verified</span></h3>
        <Stars rating={t.rating} count={t.review_count} />
        <hr />
        <p className="mb-1"><b>Education:</b> {t.education || "—"}</p>
        <p className="mb-1"><b>Experience:</b> {t.experience || "—"}</p>
        <p className="mb-1"><b>Subjects:</b> {t.subjects || "—"}</p>
        <p className="mb-1"><b>Area:</b> {t.area || "—"}</p>
        <p className="mb-1"><b>Expected salary:</b> ৳{t.expected_salary}/month</p>
        {t.bio && <p className="mt-2 mb-0">{t.bio}</p>}
      </div></div>
      <h5 className="mt-4">Reviews</h5>
      {t.reviews.length === 0 ? <p className="text-muted">No reviews yet.</p> : t.reviews.map((r) => (
        <div className="card mb-2" key={r.id}><div className="card-body py-2">
          <Stars rating={r.rating} /> <small className="text-muted">by {r.guardian_name}</small>
          {r.comment && <p className="mb-0">{r.comment}</p>}
        </div></div>
      ))}
    </div>
  );
}
