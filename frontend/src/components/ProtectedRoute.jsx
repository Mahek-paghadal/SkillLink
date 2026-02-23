import { Navigate } from "react-router-dom";
import { isAuthenticated, getUserRole } from "../utils/auth";

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    if (!isAuthenticated()) {
        return <Navigate to="/" replace />;
    }

    // If specific roles are required, check them
    if (allowedRoles.length > 0) {
        const userRole = getUserRole();
        if (!allowedRoles.includes(userRole)) {
            // Redirect based on user's actual role
            if (userRole === "student") {
                return <Navigate to="/profile" replace />;
            } else if (userRole === "client") {
                return <Navigate to="/client/dashboard" replace />;
            }
            return <Navigate to="/" replace />;
        }
    }

    return children;
};

export default ProtectedRoute;
