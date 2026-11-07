import { Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import { ProtectedRoute } from "./components/ui";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Tuitions from "./pages/Tuitions";
import TuitionDetail from "./pages/TuitionDetail";
import Tutors from "./pages/Tutors";
import TutorDetail from "./pages/TutorDetail";
import Dashboard from "./pages/Dashboard";

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/tuitions" element={<Tuitions />} />
        <Route path="/tuitions/:id" element={<TuitionDetail />} />
        <Route path="/tutors" element={<Tutors />} />
        <Route path="/tutors/:id" element={<TutorDetail />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="*" element={<div className="container py-5"><h3>Page not found</h3></div>} />
      </Routes>
    </>
  );
}
