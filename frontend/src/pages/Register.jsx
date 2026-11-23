
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api, { errMsg } from "../api";
import { useAuth } from "../auth";
import { Msg } from "../components/ui";
import "./Register.css";

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [f, setF] = useState({
    role: "GUARDIAN",
    first_name: "",
    username: "",
    email: "",
    phone: "",
    password: "",
  });

  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) =>
    setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);

    try {
      await api.post("/auth/register/", f);
      await login(f.username, f.password);
      navigate("/dashboard");
    } catch (err) {
      setMsg({ type: "danger", text: errMsg(err) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-background">
        <div className="register-decoration register-decoration-one"></div>
        <div className="register-decoration register-decoration-two"></div>
      </div>

      <div className="register-container">
        <div className="register-info">
          <span className="register-tag">TUITION FINDER</span>
          <h1>Start Your Learning Journey</h1>
          <p>
            Connect with trusted tutors and find the right
            learning opportunities through Tuition Finder.
          </p>

          <div className="register-feature">
            <span>✓</span> Find suitable tuition opportunities
          </div>
          <div className="register-feature">
            <span>✓</span> Connect with guardians and tutors
          </div>
          <div className="register-feature">
            <span>✓</span> Manage your profile easily
          </div>
        </div>

        <div className="register-card">
          <div className="register-heading">
            <span>Create Account</span>
            <h2>Join Tuition Finder</h2>
            <p>Enter your details to get started.</p>
          </div>

          <Msg msg={msg} />

          <form onSubmit={submit}>
            <div className="register-field">
              <label>I want to join as</label>
              <select value={f.role} onChange={set("role")}>
                <option value="GUARDIAN">Guardian (Need a tutor)</option>
                <option value="TUTOR">Tutor (Want to teach)</option>
              </select>
            </div>

            <div className="register-field">
              <label>Full Name</label>
              <input
                type="text"
                required
                placeholder="Enter your full name"
                value={f.first_name}
                onChange={set("first_name")}
              />
            </div>

            <div className="register-two-fields">
              <div className="register-field">
                <label>Username</label>
                <input
                  required
                  placeholder="Username"
                  value={f.username}
                  onChange={set("username")}
                />
              </div>

              <div className="register-field">
                <label>Phone</label>
                <input
                  type="tel"
                  placeholder="Phone number"
                  value={f.phone}
                  onChange={set("phone")}
                />
              </div>
            </div>

            <div className="register-field">
              <label>Email Address</label>
              <input
                type="email"
                required
                placeholder="Enter your email"
                value={f.email}
                onChange={set("email")}
              />
            </div>

            <div className="register-field">
              <label>Password</label>
              <input
                type="password"
                required
                minLength={8}
                placeholder="At least 8 characters"
                value={f.password}
                onChange={set("password")}
              />
              <small>Use at least 8 characters.</small>
            </div>

            <button className="register-submit" disabled={loading}>
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <div className="register-login">
            Already have an account? <Link to="/login">Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
