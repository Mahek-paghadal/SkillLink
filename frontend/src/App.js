import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import AuthPage from "./pages/AuthPage";
import StudentDashboard from "./pages/StudentDashboard";
import ClientDashboard from "./pages/ClientDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ProtectedRoute from "./components/ProtectedRoute";
import { isAuthenticated, getUserRole } from "./utils/auth";

function App() {
  const getRedirectPath = () => {
    if (!isAuthenticated()) return "/";
    const role = getUserRole();
    if (role === "student") return "/student/dashboard";
    if (role === "client") return "/client/dashboard";
    if (role === "admin") return "/admin/dashboard";
    return "/";
  };

  return (
    <ThemeProvider>
      <Router>
        <Routes>
        {/* Public Routes */}
        <Route
          path="/"
          element={
            isAuthenticated() ? <Navigate to={getRedirectPath()} replace /> : <AuthPage />
          }
        />
        <Route
          path="/forgot-password"
          element={
            isAuthenticated() ? <Navigate to={getRedirectPath()} replace /> : <ForgotPassword />
          }
        />
        <Route
          path="/reset-password"
          element={
            isAuthenticated() ? <Navigate to={getRedirectPath()} replace /> : <ResetPassword />
          }
        />

        {/* Protected Student Routes */}
        <Route
          path="/student/dashboard"
          element={
            <ProtectedRoute allowedRoles={["student", "admin"]}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />

        {/* Protected Client Routes */}
        <Route
          path="/client/dashboard"
          element={
            <ProtectedRoute allowedRoles={["client", "admin"]}>
              <ClientDashboard />
            </ProtectedRoute>
          }
        />

        {/* Protected Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Fallback - redirect based on role */}
        <Route path="*" element={<Navigate to={getRedirectPath()} replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
