import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { errMsg } from "../api";
import { useAuth } from "../auth";
import { Msg } from "../components/ui";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [f, setF] = useState({ username: "", password: "" });
  const [msg, setMsg] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    try {
      await login(f.username, f.password);
      navigate("/dashboard");
    } catch (err) {
      setMsg({ type: "danger", text: errMsg(err) });
    }
  };

  return (
    <div className="container py-5" style={{ maxWidth: 440 }}>
      <div className="card"><div className="card-body">
        <h4 className="mb-3">Login</h4>
        <Msg msg={msg} />
        <form onSubmit={submit}>
          <div className="form-group"><label>Username</label>
            <input className="form-control" required value={f.username} onChange={(e) => setF({ ...f, username: e.target.value })} /></div>
          <div className="form-group"><label>Password</label>
            <input type="password" className="form-control" required value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} /></div>
          <button className="btn btn-primary btn-block">Login</button>
        </form>
        <p className="mt-3 mb-0 text-center">New here? <Link to="/register">Register</Link></p>
      </div></div>
    </div>
  );
}
