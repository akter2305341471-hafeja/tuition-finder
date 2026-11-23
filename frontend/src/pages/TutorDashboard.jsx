
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { errMsg } from "../api";
import ProfileForm from "../components/ProfileForm";
import { Badge, Msg, Tabs } from "../components/ui";
import "./TutorDashboard.css";

function MyApplications() {
  const [apps, setApps] = useState(null);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    api.get("/applications/mine/")
      .then((r) => setApps(r.data))
      .catch((err) => setMsg({ type: "danger", text: errMsg(err) }));
  }, []);

  if (!apps) {
    return (
      <div className="tutor-empty">
        <Msg msg={msg} />
        {!msg && "Loading applications..."}
      </div>
    );
  }

  if (apps.length === 0) {
    return (
      <div className="tutor-empty">
        <h5>No Applications Yet</h5>
        <p>You have not applied to any tuition posts.</p>
        <Link className="tutor-browse-btn" to="/tuitions">
          Browse Tuitions
        </Link>
      </div>
    );
  }

  return (
    <div className="tutor-app-grid">
      {apps.map((a) => (
        <div className="tutor-app-card" key={a.id}>
          <div className="tutor-app-top">
            <span className="tutor-card-label">YOUR APPLICATION</span>
            <Badge status={a.status} />
          </div>

          <h5>
            <Link to={`/tuitions/${a.post}`}>{a.post_title}</Link>
          </h5>

          <div className="tutor-app-details">
            <span>Area: {a.post_area}</span>
            <span>Salary: ৳{a.post_salary}/month</span>
          </div>

          {a.status === "ACCEPTED" && (
            <div className="tutor-hired-notice">
              🎉 Congratulations! Your application has been accepted.
            </div>
          )}

          {a.status === "REJECTED" && (
            <div className="tutor-rejected-notice">
              This application was not accepted.
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function TutorDashboard() {
  const [tab, setTab] = useState("profile");

  return (
    <div className="tutor-dashboard">
      <div className="tutor-dashboard-header">
        <span>TUTOR SPACE</span>
        <h3>Tutor Dashboard</h3>
        <p>Manage your profile and track your tuition applications.</p>
      </div>

      <Tabs
        active={tab}
        onChange={setTab}
        tabs={[
          ["profile", "My Profile"],
          ["apps", "My Applications"],
        ]}
      />

      {tab === "profile" && <ProfileForm role="TUTOR" />}

      {tab === "apps" && (
        <div className="tutor-applications-section">
          <h4>My Applications</h4>
          <p>Check the status of your submitted applications.</p>
          <MyApplications />
        </div>
      )}
    </div>
  );
}
