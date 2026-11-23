
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import "./Tuitions.css";

const EMPTY = {
  q: "",
  student_class: "",
  subject: "",
  area: "",
  min_salary: "",
  max_salary: "",
};

export default function Tuitions() {
  const [f, setF] = useState(EMPTY);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const set = (k) => (e) =>
    setF((prev) => ({ ...prev, [k]: e.target.value }));

  const load = (params) => {
    setLoading(true);

    const clean = Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== "")
    );

    api
      .get("/posts/", { params: clean })
      .then((r) => setPosts(r.data))
      .catch((err) => {
        console.error("Could not load tuition posts:", err);
        setPosts([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load(EMPTY);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    load(f);
  };

  const handleReset = () => {
    setF(EMPTY);
    load(EMPTY);
  };

  return (
    <div className="tuition-page">
      <section className="tuition-hero">
        <div className="tuition-hero-content">
          <span className="tuition-eyebrow">YOUR LEARNING JOURNEY STARTS HERE</span>
          <h1>Find Your Perfect Tuition</h1>
          <p>
            Explore available tuition opportunities and find the right
            learning match for your needs.
          </p>

          <div className="tuition-hero-stats">
            <div>
              <strong>{posts.length}</strong>
              <span>Available Results</span>
            </div>
            <div>
              <strong>Easy</strong>
              <span>Search & Filter</span>
            </div>
            <div>
              <strong>Flexible</strong>
              <span>Tuition Options</span>
            </div>
          </div>
        </div>
      </section>

      <main className="tuition-container">
        <div className="tuition-section-heading">
          <div>
            <span className="tuition-label">EXPLORE OPPORTUNITIES</span>
            <h2>Available Tuitions</h2>
            <p>Use the filters below to find a tuition that matches your preferences.</p>
          </div>
        </div>

        <form className="tuition-filter-card" onSubmit={handleSearch}>
          <div className="tuition-filter-heading">
            <div className="tuition-filter-icon">⌕</div>
            <div>
              <h3>Find your match</h3>
              <p>Search by keyword, class, subject, location or salary.</p>
            </div>
          </div>

          <div className="tuition-filter-grid">
            <div className="tuition-field tuition-field-wide">
              <label htmlFor="tuition-keyword">Search keyword</label>
              <input
                id="tuition-keyword"
                type="text"
                placeholder="Search tuition title or keyword..."
                value={f.q}
                onChange={set("q")}
              />
            </div>

            <div className="tuition-field">
              <label htmlFor="tuition-class">Class</label>
              <input
                id="tuition-class"
                type="text"
                placeholder="e.g. Class 8"
                value={f.student_class}
                onChange={set("student_class")}
              />
            </div>

            <div className="tuition-field">
              <label htmlFor="tuition-subject">Subject</label>
              <input
                id="tuition-subject"
                type="text"
                placeholder="e.g. Mathematics"
                value={f.subject}
                onChange={set("subject")}
              />
            </div>

            <div className="tuition-field">
              <label htmlFor="tuition-area">Location / Area</label>
              <input
                id="tuition-area"
                type="text"
                placeholder="e.g. Dhanmondi"
                value={f.area}
                onChange={set("area")}
              />
            </div>

            <div className="tuition-field">
              <label htmlFor="tuition-min">Minimum Salary (৳)</label>
              <input
                id="tuition-min"
                type="number"
                min="0"
                placeholder="Minimum"
                value={f.min_salary}
                onChange={set("min_salary")}
              />
            </div>

            <div className="tuition-field">
              <label htmlFor="tuition-max">Maximum Salary (৳)</label>
              <input
                id="tuition-max"
                type="number"
                min="0"
                placeholder="Maximum"
                value={f.max_salary}
                onChange={set("max_salary")}
              />
            </div>
          </div>

          <div className="tuition-filter-actions">
            <button type="submit" className="tuition-search-btn">
              <span>⌕</span> Search Tuitions
            </button>
            <button
              type="button"
              className="tuition-reset-btn"
              onClick={handleReset}
            >
              Reset Filters
            </button>
          </div>
        </form>

        <div className="tuition-results-heading">
          <div>
            <h3>Tuition Opportunities</h3>
            <p>Browse the available tuition posts below.</p>
          </div>
          {!loading && (
            <span className="tuition-result-count">
              {posts.length} result(s)
            </span>
          )}
        </div>

        {loading ? (
          <div className="tuition-loading">
            <div className="tuition-spinner"></div>
            <p>Finding available tuitions...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="tuition-empty">
            <div className="tuition-empty-icon">⌕</div>
            <h3>No tuition found</h3>
            <p>Try changing your search keyword or filters.</p>
            <button type="button" onClick={handleReset}>
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="tuition-card-grid">
            {posts.map((p) => (
              <article className="tuition-card" key={p.id}>
                <div className="tuition-card-top">
                  <span className="tuition-card-tag">TUITION OPPORTUNITY</span>
                  <span className="tuition-card-id">#{p.id}</span>
                </div>

                <div className="tuition-card-body">
                  <h3>{p.title}</h3>

                  <div className="tuition-badges">
                    <span className="tuition-badge tuition-class-badge">
                      {p.student_class}
                    </span>
                    <span className="tuition-badge tuition-subject-badge">
                      {p.subject}
                    </span>
                  </div>

                  <div className="tuition-info-list">
                    <div className="tuition-info-item">
                      <span className="tuition-info-icon">📍</span>
                      <div>
                        <small>Location</small>
                        <strong>{p.area}</strong>
                      </div>
                    </div>

                    <div className="tuition-info-item">
                      <span className="tuition-info-icon">📅</span>
                      <div>
                        <small>Schedule</small>
                        <strong>{p.days_per_week} days / week</strong>
                      </div>
                    </div>
                  </div>

                  <div className="tuition-salary-box">
                    <div>
                      <small>Monthly Salary</small>
                      <strong>৳{p.salary}</strong>
                    </div>
                    <span>Per Month</span>
                  </div>

                  <div className="tuition-applicants">
                    <span>👥</span>
                    {p.applications_count} applicant(s)
                  </div>
                </div>

                <div className="tuition-card-footer">
                  <Link
                    className="tuition-details-btn"
                    to={`/tuitions/${p.id}`}
                  >
                    View Details <span>→</span>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
