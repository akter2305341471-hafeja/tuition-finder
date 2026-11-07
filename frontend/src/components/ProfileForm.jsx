import { useEffect, useState } from "react";
import api, { errMsg } from "../api";
import { Badge, Msg } from "./ui";

const FIELDS = {
  GUARDIAN: [["name", "Full name"], ["phone", "Phone"], ["address", "Address"], ["area", "Area"]],
  TUTOR: [["name", "Full name"], ["phone", "Phone"], ["education", "Education"], ["experience", "Experience (e.g. 2 years)"],
    ["subjects", "Subjects (comma separated)"], ["area", "Area"], ["expected_salary", "Expected salary (৳/month)", "number"], ["bio", "About you", "textarea"]],
};

export default function ProfileForm({ role }) {
  const [p, setP] = useState(null);
  const [msg, setMsg] = useState(null);

  useEffect(() => { api.get("/profile/").then((r) => setP(r.data)); }, []);

  const save = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.put("/profile/", p);
      setP(data);
      const user = JSON.parse(localStorage.getItem("user"));
      localStorage.setItem("user", JSON.stringify({ ...user, first_name: data.name, phone: data.phone }));
      setMsg({ type: "success", text: "Profile saved." });
    } catch (err) {
      setMsg({ type: "danger", text: errMsg(err) });
    }
  };

  if (!p) return <p>Loading...</p>;
  return (
    <form onSubmit={save} style={{ maxWidth: 600 }}>
      {role === "TUTOR" && (
        <div className="alert alert-light border">
          Verification status: <Badge status={p.verification} />
          {p.verification === "PENDING" && " — an admin must approve your profile before you can apply to tuitions."}
          {p.verification === "REJECTED" && " — update your profile and save to request review again."}
        </div>
      )}
      <Msg msg={msg} />
      {FIELDS[role].map(([key, label, type]) => (
        <div className="form-group" key={key}>
          <label>{label}</label>
          {type === "textarea"
            ? <textarea className="form-control" rows="3" value={p[key] ?? ""} onChange={(e) => setP({ ...p, [key]: e.target.value })} />
            : <input type={type || "text"} className="form-control" value={p[key] ?? ""} onChange={(e) => setP({ ...p, [key]: e.target.value })} />}
        </div>
      ))}
      <button className="btn btn-primary">Save profile</button>
    </form>
  );
}
