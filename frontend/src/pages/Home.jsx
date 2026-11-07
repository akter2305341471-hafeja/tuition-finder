import { Link } from "react-router-dom";
import { useAuth } from "../auth";

const FEATURES = [
  ["🔐", "Role-based login", "Separate access for guardians, tutors and admins."],
  ["🧑‍🏫", "Verified tutors", "Admin approves every tutor before they can apply."],
  ["📝", "Post tuition jobs", "Guardians create, edit and delete tuition posts."],
  ["🔎", "Search & filter", "Find posts by class, subject, area and salary."],
  ["✉️", "Apply & hire", "Tutors apply; guardians accept or reject."],
  ["⭐", "Reviews & ratings", "Guardians rate the tutors they hire."],
];

export default function Home() {
  const { user } = useAuth();
  return (
    <>
      <section className="hero text-center">
        <div className="container">
          <h1 className="display-4 font-weight-bold">Find the right tutor. Find the right tuition.</h1>
          <p className="lead">One organized place that replaces Facebook posts and word-of-mouth.</p>
          <Link className="btn btn-light btn-lg mr-2" to="/tuitions">Browse Tuitions</Link>
          <Link className="btn btn-outline-light btn-lg" to="/tutors">Find Tutors</Link>
          {!user && <div className="mt-3"><Link className="text-white" to="/register"><u>Create a free account</u></Link></div>}
        </div>
      </section>
      <div className="container py-5">
        <div className="row">
          {FEATURES.map(([icon, title, text]) => (
            <div className="col-md-4 mb-4" key={title}>
              <div className="card card-hover h-100 text-center"><div className="card-body">
                <div style={{ fontSize: 36 }}>{icon}</div>
                <h5 className="mt-2">{title}</h5>
                <p className="text-muted mb-0">{text}</p>
              </div></div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
