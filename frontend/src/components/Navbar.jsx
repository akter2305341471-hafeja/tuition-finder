import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../auth";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const close = () => setOpen(false);

  return (
    <nav className="navbar navbar-expand-md navbar-dark bg-primary">
      <div className="container">
        <Link className="navbar-brand" to="/" onClick={close}>🎓 Tuition Finder</Link>
        <button className="navbar-toggler" onClick={() => setOpen(!open)}>
          <span className="navbar-toggler-icon" />
        </button>
        <div className={`collapse navbar-collapse ${open ? "show" : ""}`}>
          <ul className="navbar-nav mr-auto">
            <li className="nav-item"><NavLink className="nav-link" to="/tuitions" onClick={close}>Tuitions</NavLink></li>
            <li className="nav-item"><NavLink className="nav-link" to="/tutors" onClick={close}>Tutors</NavLink></li>
            {user && <li className="nav-item"><NavLink className="nav-link" to="/dashboard" onClick={close}>Dashboard</NavLink></li>}
          </ul>
          <ul className="navbar-nav">
            {user ? (
              <>
                <li className="nav-item"><span className="navbar-text mr-3">{user.first_name} ({user.role.toLowerCase()})</span></li>
                <li className="nav-item">
                  <button className="btn btn-outline-light btn-sm" onClick={() => { logout(); close(); navigate("/"); }}>Logout</button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item"><NavLink className="nav-link" to="/login" onClick={close}>Login</NavLink></li>
                <li className="nav-item"><NavLink className="nav-link" to="/register" onClick={close}>Register</NavLink></li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
