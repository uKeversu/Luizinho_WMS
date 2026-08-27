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

import '../style/App.css';

function CadastroFuncionario() {

    const navigate = useNavigate();
    const API = "http://192.168.1.185:8077";

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

                    localStorage.setItem(
                        "nfe_token",
                        data.token
                    );

                    const user = {
                        id: data.id,
                        nome: data.nome,
                        codigo: data.codigo,
                        tipo: data.tipo,
                        pode_autorizar_conferencia: data.pode_autorizar_conferencia,
                        pode_corrigir_nfe: data.pode_corrigir_nfe,
                        pode_finalizar_nfe: data.pode_finalizar_nfe,
                        pode_acessar_alertas: data.pode_acessar_alertas,
                        pode_acessar_cadastrar_funcionario: data.pode_acessar_cadastrar_funcionario,
                        pode_acessar_painel_games: data.pode_acessar_painel_games,
                        pode_acessar_painel_gerencial: data.pode_acessar_painel_gerencial,
                        pode_acessar_reimprimir_senhas: data.pode_acessar_reimprimir_senhas,
                        pode_acessar_tarefas: data.pode_acessar_tarefas,
                    };

                    localStorage.setItem(
                        "user_info",
                        JSON.stringify(user)
                    );

                    setUserInfo(user);
                    setToken(data.token);
                }}
            />
        );
    }

    return (
        <Container maxWidth="100%" sx={{ mt: 4, bgcolor: "background.default" }}>

            {/* Header */}
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: {
                        xs: 'column',
                        md: 'row'
                    },
                    justifyContent: 'space-between',
                    alignItems: {
                        xs: 'flex-start',
                        md: 'center'
                    },
                    gap: 2,
                    p: 2,
                    bgcolor: 'var(--azul)',
                    mb: 4,
                    borderRadius: '2vh',
                    zoom: 0.9
                }}
            >
                <Typography variant="h4" sx={{ color: "background.paper" }}>
                    <strong>Cadastro de Funcionário</strong>
                </Typography>

                <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'right', mr: '0' }}>
                        {<PersonIcon sx={{ color: "background.paper", paddingRight: '1vh' }} />}
                        <Typography sx={{ color: "background.paper", fontSize: '0.9rem', display: 'flex', alignItems: 'center' }}>{userInfo?.nome}</Typography>
                        {token && (
                            <Button size="small" onClick={logout} sx={{ color: "background.paper", display: 'flex', gap: 1 }}>{<LogoutIcon />}</Button>
                        )}
                    </Box>
                </Box>
            </Box>

            {/* Form */}
            <Card sx={{
                mt: 3,
                mb: 3,
                borderRadius: '2vh',
                boxShadow: '0vh 0.1vh 0.5vh var(--sombra)',
                bgcolor: 'background.card',
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
                                    borderColor: 'var(--azul)',
                                },
                                '&.Mui-focused fieldset': {
                                    borderColor: 'var(--azul)',
                                }
                            }
                        }}
                        autoComplete="off"
                        inputProps={{
                            spellCheck: false,
                            autoCorrect: "off",
                            autoCapitalize: "off",
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
                                    borderColor: 'var(--azul)',
                                },
                                '&.Mui-focused fieldset': {
                                    borderColor: 'var(--azul)',
                                }
                            }
                        }}
                        autoComplete="off"
                        inputProps={{
                            spellCheck: false,
                            autoCorrect: "off",
                            autoCapitalize: "off",
                        }}
                    />

                    <Button
                        fullWidth
                        variant="contained"
                        sx={{
                            mt: 3,
                            color: "primary.branco",
                            bgcolor: 'primary.confirmar',
                            '&:hover': { bgcolor: 'primary.confirmarHover' }
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