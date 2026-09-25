import { Navigate } from "react-router-dom";

function ProtectedRoute({ permissao, children }) {
    const user = localStorage.getItem("user_info");

    const userInfo = user
        ? JSON.parse(user)
        : null;

    if (!userInfo) {
        return <Navigate to="/" replace />;
    }

    const temPermissao = Array.isArray(permissao)
        ? permissao.some(
            (nomePermissao) => userInfo?.[nomePermissao] === true
        )
        : userInfo?.[permissao] === true;

    if (!temPermissao) {
        return <Navigate to="/" replace />;
    }

    return children;
}

export default ProtectedRoute;