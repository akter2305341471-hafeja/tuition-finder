

import { useEffect, useState } from "react";
import api, { errMsg } from "../api";
import { Badge, Msg } from "./ui";
import "./ProfileForm.css";

const FIELDS = {
  GUARDIAN: [
    ["name", "Full Name"],
    ["phone", "Phone Number"],
    ["address", "Full Address"],
    ["area", "Area"],
  ],
  TUTOR: [
    ["name", "Full Name"],
    ["phone", "Phone Number"],
    ["education", "Education"],
    ["experience", "Experience"],
    ["subjects", "Subjects"],
    ["area", "Area"],
    ["expected_salary", "Expected Salary", "number"],
    ["bio", "About You", "textarea"],
  ],
};

export default function ProfileForm({ role }) {
  const [p, setP] = useState(null);
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    api.get("/profile/")
      .then((r) => {
        if (active) setP(r.data);
      })
      .catch((err) => {
        if (active) setMsg({ type: "danger", text: errMsg(err) });
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const save = async (e) => {
    e.preventDefault();

    try {
      const { data } = await api.put("/profile/", p);
      setP(data);

      const user = JSON.parse(localStorage.getItem("user") || "null");
      if (user) {
        localStorage.setItem(
          "user",
          JSON.stringify({
            ...user,
            first_name: data.name,
            phone: data.phone,
          })
        );
      }

      setMsg({ type: "success", text: "Profile saved successfully." });
    } catch (err) {
      setMsg({ type: "danger", text: errMsg(err) });
    }
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="profile-spinner"></div>
        Loading profile...
      </div>
    );
  }

  if (!p) {
    return <div className="profile-error"><Msg msg={msg} /></div>;
  }

  return (
    <div className="profile-page">
      <div className="profile-top">
        <div className="profile-avatar">
          {(p.name || "U").charAt(0).toUpperCase()}
        </div>

        <div>
          <span className="profile-label">MY ACCOUNT</span>
          <h2>{p.name || "Your Profile"}</h2>
          <p>{role === "TUTOR" ? "Tutor Profile" : "Guardian Profile"}</p>

          {role === "TUTOR" && (
            <div className="profile-verification">
              Verification Status: <Badge status={p.verification} />
            </div>
          )}
        </div>
      </div>

      <div className="profile-card">
        <div className="profile-card-heading">
          <h5>Personal Information</h5>
          <span className="profile-edit-icon">✎</span>
        </div>

        <Msg msg={msg} />

        <form onSubmit={save}>
          <div className="profile-form-grid">
            {(FIELDS[role] || FIELDS.GUARDIAN).map(([key, label, type]) => (
              <div
                className={`profile-field ${
                  type === "textarea" ? "profile-field-full" : ""
                }`}
                key={key}
              >
                <label htmlFor={`profile-${key}`}>{label}</label>

                {type === "textarea" ? (
                  <textarea
                    id={`profile-${key}`}
                    className="profile-textarea"
                    rows="4"
                    value={p[key] ?? ""}
                    onChange={(e) =>
                      setP({ ...p, [key]: e.target.value })
                    }
                  />
                ) : (
                  <input
                    id={`profile-${key}`}
                    type={type || "text"}
                    className="profile-input"
                    value={p[key] ?? ""}
                    onChange={(e) =>
                      setP({ ...p, [key]: e.target.value })
                    }
                  />
                )}
              </div>
            ))}
          </div>

          <div className="profile-form-footer">
            <button type="submit" className="profile-save-btn">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


