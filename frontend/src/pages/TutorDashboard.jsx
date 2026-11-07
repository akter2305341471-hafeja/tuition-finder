import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import ProfileForm from "../components/ProfileForm";
import { Badge, Tabs } from "../components/ui";

function MyApplications() {
  const [apps, setApps] = useState(null);
  useEffect(() => { api.get("/applications/mine/").then((r) => setApps(r.data)); }, []);
  if (!apps) return <p>Loading...</p>;
  if (apps.length === 0) return <div className="alert alert-info">You have not applied anywhere yet. <Link to="/tuitions">Browse tuitions</Link></div>;
  return apps.map((a) => (
    <div className="card mb-2" key={a.id}><div className="card-body py-2">
      <Link to={`/tuitions/${a.post}`}><b>{a.post_title}</b></Link> <Badge status={a.status} />
      <div className="small text-muted">📍 {a.post_area} · ৳{a.post_salary}/month</div>
      {a.status === "ACCEPTED" && <div className="text-success">🎉 You are hired! The guardian will contact you.</div>}
    </div></div>
  ));
}

export default function TutorDashboard() {
  const [tab, setTab] = useState("profile");
  return (
    <>
      <h3 className="mb-3">Tutor Dashboard</h3>
      <Tabs active={tab} onChange={setTab} tabs={[["profile", "My Profile"], ["apps", "My Applications"]]} />
      {tab === "profile" && <ProfileForm role="TUTOR" />}
      {tab === "apps" && <MyApplications />}
    </>
  );
}
