import { useState, useEffect, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
    Container,
    Typography,
    Card,
    CardContent,
    Grid,
    Box,
    Button,
    CircularProgress,
} from "@mui/material";

import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import { ThemeContext } from "../context/ThemeContext";
import '../style/App.css';

function Alertas() {

    // Tema noturno
    const { dark, toggleTheme } = useContext(ThemeContext);

    // Acessar outras pages
    const navigate = useNavigate();

    // API BASE
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

    // Alertas
    const [notas, setNotas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [cacheItens, setCacheItens] = useState({});
    const [alertas, setAlertas] = useState([]);

    useEffect(() => {
        const carregarAlertas = async () => {
            const resultado = await gerarAlertas();
            setAlertas(resultado);
        };

        if (notas.length > 0) {
            carregarAlertas();
        }
    }, [notas]);

    useEffect(() => {
        buscarNotas();
    }, []);

    useEffect(() => {
        const interval = setInterval(buscarNotas, 60000);
        return () => clearInterval(interval);
    }, []);

    const buscarNotas = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API}/api/notas/listar`);
            const data = await response.json();

            if (response.ok) {
                setNotas(Array.isArray(data) ? data : []);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const diasEntre = (data) => {
        if (!data) return 0;

        const [dia, mes, ano] = data.split("-");

        const dataFormatada = new Date(`${ano}-${mes}-${dia}`);

        const hoje = new Date();

        const diff = Math.floor((hoje - dataFormatada) / (1000 * 60 * 60 * 24));

        return diff;
    };

    const buscarItensNota = async (id) => {
        if (cacheItens[id]) return cacheItens[id];

        try {
            const response = await fetch(`${API}/api/itens_nfe/${id}`);
            const data = await response.json();

            const itens = data.items || [];

            setCacheItens(prev => ({ ...prev, [id]: itens }));

            return itens;
        } catch (err) {
            console.error(err);
            return [];
        }
    };

    const gerarAlertas = async () => {
        let alertas = [];

        const CFOP_GARANTIA = ["5949", "6949"];

        for (const nota of notas) {

            // Atraso conferência
            if (
                ["RECEBIDA", "FORNECEDOR_DIRETO"].includes(nota.status) &&
                diasEntre(nota.data_recebimento) > 2
            ) {
                alertas.push({
                    tipo: "ATRASO_CONFERENCIA",
                    mensagem: "Nota aguardando conferência",
                    nota
                });
            }

            const itens = await buscarItensNota(nota.id);

            const atrasoGuarda = diasEntre(nota.data_recebimento) > 3;

            const temItemPendenteGuarda = itens.some(item => {
                const loc = item.loc_sistema ? item.loc_sistema.trim() : "";

                return (
                    item.status_item === "ITEM_CONFERIDO" &&
                    item.status_item !== "ITEM_GUARDADO" &&
                    loc !== "LOC01" &&
                    loc !== "LOC 01"
                );
            });

            if (atrasoGuarda && temItemPendenteGuarda) {
                alertas.push({
                    tipo: "GUARDA_PENDENTE",
                    mensagem: "Itens pendentes para guarda",
                    nota
                });
            }

            const temCfopGarantia = itens.some(item =>
                item.cfop &&
                CFOP_GARANTIA.includes(item.cfop.toString().trim())
            );

            if (temCfopGarantia) {
                alertas.push({
                    tipo: "CFOP_GARANTIA",
                    mensagem: "Nota com CFOP de garantia",
                    nota
                });
            }
        }

        return alertas;
    };

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
                    borderRadius: '2vh'
                }}
            >
                <Typography variant="h4" sx={{ fontFamily: 'Consolas', color: "background.paper" }}>
                    <strong>Alerta de mercadorias</strong>
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

            <Box
                sx={{
                    display: "flex",
                    color: 'text.primary',
                    gap: 3,
                    flexWrap: "wrap",
                    alignItems: "center",
                    mb: 3,
                    px: 1
                }}
            >
                {/* ATRASO CONFERÊNCIA */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box sx={{
                        width: 16,
                        height: 16,
                        borderRadius: "4px",
                        bgcolor: "var(--atraso-conferencia)"
                    }} />
                    <Typography sx={{ fontSize: "0.85rem" }}>
                        Atraso na conferência há mais de 2 dias
                    </Typography>
                </Box>

                {/* GUARDA PENDENTE */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box sx={{
                        width: 16,
                        height: 16,
                        borderRadius: "4px",
                        bgcolor: "var(--atraso-guarda)"
                    }} />
                    <Typography sx={{ fontSize: "0.85rem" }}>
                        Itens não guardados há mais de 3 dias
                    </Typography>
                </Box>

                {/* CFOP GARANTIA */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box sx={{
                        width: 16,
                        height: 16,
                        borderRadius: "4px",
                        bgcolor: "var(--garantia)"
                    }} />
                    <Typography sx={{ fontSize: "0.85rem" }}>
                        Nota com CFOP de garantia
                    </Typography>
                </Box>
            </Box>

            {loading ? (
                <Box textAlign="center">
                    <CircularProgress />
                </Box>
            ) : alertas.length === 0 ? (
                <Typography>Nenhum alerta encontrado</Typography>
            ) : (

                <Grid container spacing={3} sx={{ display: 'flex', justifyContent: 'space-between' }}>

                    {alertas.map((alerta, idx) => (
                        <Grid item xs={12} md={3} key={idx}>
                            <Card
                                variant="outlined"
                                sx={{
                                    borderRadius: '2vh',
                                    boxShadow: '0vh 0.1vh 0.5vh var(--sombra)',
                                    bgcolor: 'background.alerta',
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    textAlign: 'left',
                                    width: 'auto',
                                    minHeight: 250,
                                    minWidth: 300,
                                    maxWidth: 300,
                                    borderLeft: `6px solid ${alerta.tipo === "ATRASO_CONFERENCIA" ? "var(--atraso-conferencia)" :
                                        alerta.tipo === "CFOP_GARANTIA" ? "var(--garantia)" :
                                            alerta.tipo === "GUARDA_PENDENTE" ? "var(--atraso-guarda)" :
                                                "#607d8b"
                                        }`
                                }}
                            >
                                <CardContent
                                    sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        flexGrow: 1,
                                        gap: 1,
                                    }}
                                >

                                    {/* HEADER */}
                                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <Typography><strong>NF:</strong> {alerta.nota.numero}</Typography>
                                    </Box>

                                    <Typography><strong>Série:</strong> {alerta.nota.serie}</Typography>

                                    <Typography sx={{
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        fontSize: '0.8rem'
                                    }}>
                                        <strong>Fornecedor:</strong> {alerta.nota.fornecedor}
                                    </Typography>

                                    <Typography sx={{ fontSize: '0.8rem' }}>
                                        <strong>Emissão:</strong> {alerta.nota.data_emissao}
                                    </Typography>

                                    <Typography sx={{ fontSize: '0.8rem' }}>
                                        <strong>Importação:</strong> {alerta.nota.data_recebimento}
                                    </Typography>

                                    <Typography sx={{ fontSize: '0.8rem' }}>
                                        <strong>Status:</strong> {alerta.nota.status}
                                    </Typography>

                                    <Box sx={{ mt: 'auto' }}>
                                        <Typography
                                            sx={{
                                                fontSize: '0.75rem',
                                                fontWeight: 'bold',
                                                color:
                                                    alerta.tipo === "ATRASO_CONFERENCIA" ? "var(--atraso-conferencia)" :
                                                        alerta.tipo === "CFOP_GARANTIA" ? "var(--garantia)" :
                                                            alerta.tipo === "GUARDA_PENDENTE" ? "var(--atraso-guarda)" :
                                                                "#607d8b"
                                            }}
                                        >
                                            {alerta.mensagem}
                                        </Typography>
                                    </Box>

                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Container>
    )
}

export default Alertas;