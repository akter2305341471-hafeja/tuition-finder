import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api, { errMsg } from "../api";
import { useAuth } from "../auth";
import { Msg } from "../components/ui";

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [f, setF] = useState({ role: "GUARDIAN", first_name: "", username: "", email: "", phone: "", password: "" });
  const [msg, setMsg] = useState(null);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/auth/register/", f);
      await login(f.username, f.password);
      navigate("/dashboard");
    } catch (err) {
      setMsg({ type: "danger", text: errMsg(err) });
    }
  };

  return (
    <div className="container py-5" style={{ maxWidth: 520 }}>
      <div className="card"><div className="card-body">
        <h4 className="mb-3">Create an account</h4>
        <Msg msg={msg} />
        <form onSubmit={submit}>
          <div className="form-group"><label>I am a</label>
            <select className="form-control" value={f.role} onChange={set("role")}>
              <option value="GUARDIAN">Guardian (I need a tutor)</option>
              <option value="TUTOR">Tutor (I want to teach)</option>
            </select></div>
          <div className="form-group"><label>Full name</label><input className="form-control" required value={f.first_name} onChange={set("first_name")} /></div>
          <div className="form-row">
            <div className="form-group col-md-6"><label>Username</label><input className="form-control" required value={f.username} onChange={set("username")} /></div>
            <div className="form-group col-md-6"><label>Phone</label><input className="form-control" value={f.phone} onChange={set("phone")} /></div>
          </div>
          <div className="form-group"><label>Email</label><input type="email" className="form-control" required value={f.email} onChange={set("email")} /></div>
          <div className="form-group"><label>Password</label><input type="password" className="form-control" required minLength={8} value={f.password} onChange={set("password")} />
            <small className="text-muted">At least 8 characters.</small></div>
          <button className="btn btn-primary btn-block">Register</button>
        </form>
        <p className="mt-3 mb-0 text-center">Already have an account? <Link to="/login">Login</Link></p>
      </div></div>
    </div>
  );
}
