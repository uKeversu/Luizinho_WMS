import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Container,
    Typography,
    Card,
    CardContent,
    TextField,
    Button,
    Box,
    Snackbar,
    Alert,
} from "@mui/material";

import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';

import LoginFuncionario from "../components/LoginFuncionario";

function CadastroFuncionario() {

    const navigate = useNavigate();
    const API = "http://192.168.1.184:8077";

    // Login
    const [userInfo, setUserInfo] = useState(() => {
        const user = localStorage.getItem("user_info");
        return user ? JSON.parse(user) : null;
    });

    const [token, setToken] = useState(() => localStorage.getItem("nfe_token") || "");

    const logout = () => {
        setToken("");
        setUserInfo(null);
        localStorage.removeItem("nfe_token");
        localStorage.removeItem("user_info");
    };

    // Form que vai para a API
    const [form, setForm] = useState({
        nome: "",
        codigo: "",
    });

    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success"
    });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const cadastrarFuncionario = async () => {
        if (!form.nome.trim()) {
            setSnackbar({ open: true, message: "Informe o nome", severity: "warning" });
            return;
        }

        if (!form.codigo.trim()) {
            setSnackbar({ open: true, message: "Informe o código", severity: "warning" });
            return;
        }

        try {
            const response = await fetch(`${API}/api/funcionarios/incluir`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(form)
            });

            if (response.status === 401) {
                logout();
                setSnackbar({
                    open: true,
                    message: "Sessão expirada",
                    severity: "error"
                });
                return;
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Erro ao cadastrar");
            }

            setSnackbar({
                open: true,
                message: "Funcionário cadastrado com sucesso!",
                severity: "success"
            });

            // Limpa form
            setForm({
                nome: "",
                codigo: "",
                senha: ""
            });

        } catch (error) {
            console.error(error);
            setSnackbar({
                open: true,
                message: error.message,
                severity: "error"
            });
        }
    };

    if (!token) {
        return (
            <LoginFuncionario
                onLogin={(data) => {
                    localStorage.setItem("nfe_token", data.token);

                    const user = {
                        nome: data.nome,
                        codigo: data.codigo
                    };

                    localStorage.setItem("user_info", JSON.stringify(user));

                    setUserInfo(user);
                    setToken(data.token);
                }}
            />
        );
    }

    return (
        <Container maxWidth="100%" sx={{ mt: 4, bgcolor: '#FFFFFF' }}>

            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2, bgcolor: '#007bff', mb: 10 }}>
                <Typography variant="h4" sx={{ color: "#FFFFFF" }}>
                    <strong>Cadastro de Funcionário</strong>
                </Typography>

                <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'right', mr: '0' }}>
                        {<PersonIcon sx={{ color: "#FFFFFF", paddingRight: '1vh' }} />}
                        <Typography sx={{ color: '#FFFFFF', fontSize: '0.9rem', display: 'flex', alignItems: 'center' }}>{userInfo?.nome}</Typography>
                        {token && (
                            <Button size="small" onClick={logout} sx={{ color: '#FFFFFF', display: 'flex', gap: 1 }}>{<LogoutIcon />}</Button>
                        )}
                    </Box>
                </Box>
            </Box>

            {/* Form */}
            <Card sx={{
                mt: 3,
                mb: 3,
                borderRadius: '2vh',
                boxShadow: '0vh 0.1vh 0.5vh #000000',
                bgcolor: '#f3f3f3',
                maxWidth: 500,
                margin: "0 auto"
            }}>
                <CardContent>

                    <Typography variant="h6">
                        Dados do Funcionário
                    </Typography>

                    <TextField
                        fullWidth
                        label="Nome"
                        name="nome"
                        value={form.nome}
                        onChange={handleChange}
                        sx={{
                            mt: 2,
                            '& .MuiOutlinedInput-root': {
                                '&:hover fieldset': {
                                    borderColor: '#007bff',
                                },
                                '&.Mui-focused fieldset': {
                                    borderColor: '#007bff',
                                }
                            }
                        }}
                    />

                    <TextField
                        fullWidth
                        label="Código"
                        name="codigo"
                        value={form.codigo}
                        onChange={handleChange}
                        sx={{
                            mt: 2,
                            '& .MuiOutlinedInput-root': {
                                '&:hover fieldset': {
                                    borderColor: '#007bff',
                                },
                                '&.Mui-focused fieldset': {
                                    borderColor: '#007bff',
                                }
                            }
                        }}
                    />

                    <Button
                        fullWidth
                        variant="contained"
                        sx={{
                            mt: 3,
                            bgcolor: '#02bb31',
                            '&:hover': { bgcolor: '#009425' }
                        }}
                        onClick={cadastrarFuncionario}
                    >
                        Cadastrar Funcionário
                    </Button>

                    <Button
                        fullWidth
                        variant="contained"
                        sx={{ mt: 2 }}
                        onClick={() => navigate("/")}
                    >
                        Voltar
                    </Button>

                </CardContent>
            </Card>

            {/* Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
            >
                <Alert variant="filled" severity={snackbar.severity}>
                    {snackbar.message}
                </Alert>
            </Snackbar>

        </Container>
    );
}

export default CadastroFuncionario;