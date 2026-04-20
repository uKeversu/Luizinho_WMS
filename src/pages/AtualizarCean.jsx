import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
    CircularProgress,
    Divider
} from "@mui/material";

import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import '../style/App.css';

function AtualizarCean() {


    const navigate = useNavigate();

    // API BASE
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

    const [itens, setItens] = useState([]);
    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success"
    });

    const buscarItens = async () => {
        setLoading(true);

        try {
            const res = await fetch(`${API}/api/item/s_barra`);
            const data = await res.json();

            const nfeSalva = JSON.parse(localStorage.getItem("nfe_pendente_barra"));

            let lista = [];

            data.caixas.forEach(caixa => {
                caixa.itens.forEach(item => {
                    if (!nfeSalva || item.nfe_id == nfeSalva.nota) {
                        lista.push(item);
                    }
                });
            });

            setItens(lista);

        } catch {
            setSnackbar({
                open: true,
                message: "Erro ao carregar itens",
                severity: "error"
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        buscarItens();
    }, []);

    const handleChange = (index, value) => {
        const novos = [...itens];
        novos[index].codigo_barras = value;
        setItens(novos);
    };

    const salvarCodigo = async (item, index) => {

        if (!item.codigo_barras.trim()) {
            setSnackbar({
                open: true,
                message: "Informe um código válido",
                severity: "warning"
            });
            return;
        }

        console.log("URL:", `${API}/api/nfe/atualizarbarras/${item.nfe_id}/${item.id}`);
        console.log("ITEM:", item);

        try {
            const res = await fetch(
                `${API}/api/nfe/atualizarbarras/${item.nfe_id}/${item.id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        cean: item.codigo_barras
                    })
                }
            );

            if (!res.ok) throw new Error();

            const novos = itens.filter((_, i) => i !== index);
            setItens(novos);

            setSnackbar({
                open: true,
                message: "Código atualizado!",
                severity: "success"
            });

            if (novos.length === 0) {
                localStorage.removeItem("nfe_pendente_barra");

                setTimeout(() => {
                    navigate("/");
                }, 1000);
            }

        } catch {
            setSnackbar({
                open: true,
                message: "Erro ao salvar",
                severity: "error"
            });
        }
    };

    return (
        <Container maxWidth="100%" sx={{ mt: 4, bgcolor: "background.default" }}>
            {/* Header */}
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    justifyContent: 'space-between',
                    alignItems: { xs: 'flex-start', md: 'center' },
                    gap: 2,
                    p: 2,
                    bgcolor: 'primary.main',
                    mb: 5
                }}
            >
                <Typography variant="h4" sx={{ fontFamily: 'Consolas', color: "background.paper" }}>
                    <strong>Identificação de código de barras</strong>
                </Typography>
                <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'right', mr: '0' }}>
                        {<PersonIcon sx={{ color: "background.paper", paddingRight: '1vh' }} />}
                        <Typography sx={{ color: "background.paper", fontSize: '0.9rem', display: 'flex', alignItems: 'center' }}>
                            {userInfo?.nome}
                        </Typography>
                        {token && (
                            <Button
                                size="small"
                                onClick={logout}
                                sx={{ color: "background.paper", display: 'flex', gap: 1 }}
                            >{<LogoutIcon />}
                            </Button>
                        )}
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'right', mr: '2vh' }}>
                        <Button
                            onClick={() => navigate("/")}
                            sx={{ color: "background.paper", display: 'flex', gap: 1 }}
                        >
                            Voltar
                            {< ArrowBackIcon />}
                        </Button>
                        <pre id="resultado"></pre>
                    </Box>
                </Box>
            </Box>

            {loading ? (
                <Box textAlign="center">
                    <CircularProgress />
                </Box>
            ) : (
                itens.length === 0 ? (
                    <Typography>Nenhum item pendente</Typography>
                ) : (
                    <Grid container spacing={2}>
                        {itens.map((item, index) => (
                            <Grid item xs={12} md={6} lg={4} key={item.id} sx={{ display: "flex", margin: 'auto' }}>

                                <Card sx={{
                                    borderRadius: '2vh',
                                    boxShadow: '0vh 0.1vh 0.5vh var(--sombra)',
                                    bgcolor: 'background.card',
                                    display: "flex",
                                    flexDirection: "column",
                                    width: "100%",
                                    minHeight: 250,
                                    minWidth: 300,
                                    maxWidth: 300
                                }}>
                                    <CardContent sx={{ display: "flex", flexDirection: "column", flexGrow: 1 }}>

                                        <Typography variant="subtitle1"
                                            sx={{
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                            }}>
                                            {item.xProd}
                                        </Typography>

                                        <Typography variant="body2">
                                            <strong>Cod:</strong> {item.cprod}
                                        </Typography>

                                        <Typography variant="body2">
                                            <strong>ID NFe:</strong> {item.nfe_id}
                                        </Typography>

                                        <Typography variant="body2">
                                            <strong>Quantidade:</strong> {Number(item.quantidade_comercial)}
                                        </Typography>

                                        <TextField
                                            fullWidth
                                            label="Código de barras"
                                            value={item.codigo_barras || ""}
                                            onChange={(e) => handleChange(index, e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    salvarCodigo(item, index);
                                                }
                                            }}
                                            sx={{
                                                mt: 2, '& .MuiOutlinedInput-root': {
                                                    '&:hover fieldset': {
                                                        borderColor: 'primary.main',
                                                    },
                                                    '&.Mui-focused fieldset': {
                                                        borderColor: 'primary.main',
                                                    }
                                                }
                                            }}
                                        />

                                        <Button
                                            fullWidth
                                            variant="contained"
                                            sx={{ mt: "auto", color: "primary.branco", bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.mainHover' } }}
                                            onClick={() => salvarCodigo(item, index)}
                                        >
                                            Salvar
                                        </Button>

                                    </CardContent>
                                </Card>

                            </Grid>
                        ))}
                    </Grid>
                ))}

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

export default AtualizarCean;