import { Navigate } from "react-router-dom";
import { useAuth } from "../auth";

const COLORS = {
  PENDING: "warning", APPROVED: "success", ACCEPTED: "success",
  REJECTED: "danger", REMOVED: "danger", FILLED: "secondary", BLOCKED: "danger", ACTIVE: "success",
};

export const Badge = ({ status }) => (
  <span className={`badge badge-${COLORS[status] || "secondary"}`}>{status}</span>
);

export const Msg = ({ msg }) =>
  msg ? <div className={`alert alert-${msg.type}`}>{msg.text}</div> : null;

export const Stars = ({ rating, count }) =>
  rating ? (
    <span className="text-warning">
      {"★".repeat(Math.round(rating))}{"☆".repeat(5 - Math.round(rating))}
      <small className="text-muted"> {rating} ({count ?? 0})</small>
    </span>
  ) : (
    <small className="text-muted">No reviews yet</small>
  );

export function Tabs({ tabs, active, onChange }) {
  return (
    <ul className="nav nav-tabs mb-3">
      {tabs.map(([key, label]) => (
        <li className="nav-item" key={key}>
          <a className={`nav-link ${active === key ? "active" : ""}`} onClick={() => onChange(key)}>{label}</a>
        </li>
      ))}
    </ul>
  );
}

export function ProtectedRoute({ roles, children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}
