// src\components\ProtectedRoute.jsx

import { Navigate } from "react-router-dom";

function ProtectedRoute({ permissao, children }) {
    const user = localStorage.getItem("user_info");

    const userInfo = user
        ? JSON.parse(user)
        : null;

    if (!userInfo) {
        return <Navigate to="/" replace />;
    }

    if (!userInfo[permissao]) {
        return <Navigate to="/" replace />;
    }

    return children;
}

export default ProtectedRoute;