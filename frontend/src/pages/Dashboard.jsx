import { useAuth } from "../auth";
import AdminDashboard from "./AdminDashboard";
import GuardianDashboard from "./GuardianDashboard";
import TutorDashboard from "./TutorDashboard";

// One /dashboard URL, a different dashboard for each role
export default function Dashboard() {
  const { user } = useAuth();
  return (
    <div className="container py-4">
      {user.role === "ADMIN" && <AdminDashboard />}
      {user.role === "GUARDIAN" && <GuardianDashboard />}
      {user.role === "TUTOR" && <TutorDashboard />}
    </div>
  );
}
