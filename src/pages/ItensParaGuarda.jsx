import { useState, useEffect } from "react";
import {
    Container,
    Typography,
    Card,
    CardContent,
    Grid,
    TextField,
    Button,
    Box,
    Snackbar,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from "@mui/material";
import LogoutIcon from '@mui/icons-material/Logout';
import SyncIcon from '@mui/icons-material/Sync';
import {
    UploadFile,
    BugReport,
    Logout,
    Description
} from "@mui/icons-material";

import LoginFuncionario from "../components/LoginFuncionario";

import ModalErro from "../components/modalErro";
import ModalRetira from "../components/modalRetira";

function ItensParaGuarda() {

    // Login
    const [userInfo, setUserInfo] = useState(() => {
        const user = localStorage.getItem("user_info");
        return user ? JSON.parse(user) : null;
    });
    const [token, setToken] = useState(() => localStorage.getItem("nfe_token") || "");

    // Modal retirar peças
    const [openRetirada, setOpenRetirada] = useState(false);
    const [retirada, setRetirada] = useState({
        quantidade: "",
        nf: "",
        funcionario: ""
    });

    // Modal relatar erro
    const [openErro, setOpenErro] = useState(false);
    const [erro, setErro] = useState({
        codigo: "",
        tipo: "",
        descricao: "",
        funcionario: ""
    });

    const API = "http://192.168.1.184:8077";

    const logout = () => {
        setToken("");
        setUserInfo(null);
        localStorage.removeItem("nfe_token");
        localStorage.removeItem("user_info");
    };
    // Retirar peças
    const handleRetiradaChange = (e) => {
        setRetirada({ ...retirada, [e.target.name]: e.target.value });
    };

    const confirmarRetirada = () => {
        console.log("Retirada:", retirada);

        setSnackbar({
            open: true,
            message: "Retirada registrada!",
            severity: "success"
        });

        setOpenRetirada(false);
    };

    // Relatar erro
    const handleErroChange = (e) => {
        setErro({ ...erro, [e.target.name]: e.target.value });
    };

    const confirmarErro = () => {

        if (!erro.tipo) {
            setSnackbar({
                open: true,
                message: "Selecione o tipo de erro",
                severity: "warning"
            });
            return;
        }

        if (!erro.descricao.trim()) {
            setSnackbar({
                open: true,
                message: "Descreva o erro",
                severity: "warning"
            });
            return;
        }

        if (!erro.funcionario.trim()) {
            setSnackbar({
                open: true,
                message: "Informe o código do funcionário",
                severity: "warning"
            });
            return;
        }

        console.log("Erro:", erro);

        setSnackbar({
            open: true,
            message: "Erro registrado!",
            severity: "success"
        });

        setOpenErro(false);
    };

    const buscarItensNaoGuardados = async () => {
        try {
            const response = await fetch(`${API}/api/dashboard/itens_nao_guardados`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "X-Auth-Token": token
                }
            });

            const data = await response.json();

            if (!response.ok) {
                console.error("Erro:", data);
                return;
            }

            console.log("Itens não guardados:", data);

        } catch (error) {
            console.error("Erro na requisição:", error);
        }
    };
}