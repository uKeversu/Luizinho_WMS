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

/*
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

const API_URL = "http://192.168.1.185:8077";

function ProtectedRoute({ permissao, children }) {
    const [status, setStatus] = useState("carregando");
    const [permissoes, setPermissoes] = useState(null);

    useEffect(() => {
        let ativo = true;

        async function verificarAcesso() {
            const token = localStorage.getItem("nfe_token");

            if (!token) {
                if (ativo) setStatus("negado");
                return;
            }

            try {
                const response = await fetch(
                    `${API_URL}/api/funcionario/sessao`,
                    {
                        method: "GET",
                        headers: {
                            "X-Auth-Token": token
                        }
                    }
                );

                if (!response.ok) {
                    throw new Error("Sessão inválida");
                }

                const dados = await response.json();

                if (!ativo) return;
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
                if (!dados.ativo) {
                    setStatus("negado");
                    return;
                }

                setPermissoes(dados.permissoes || {});
                setStatus("verificado");

            } catch (error) {
                if (ativo) {
                    setStatus("negado");
                }
            }
        }

        verificarAcesso();

        return () => {
            ativo = false;
        };
    }, []);

    if (status === "carregando") {
        return null;
    }

    if (status === "negado") {
        return <Navigate to="/" replace />;
    }

    const temPermissao = Array.isArray(permissao)
        ? permissao.some(
            nome => permissoes?.[nome] === true
        )
        : permissoes?.[permissao] === true;

    if (!temPermissao) {
        return <Navigate to="/" replace />;
    }

    return children;
}

export default ProtectedRoute;
*/