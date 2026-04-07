import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
    Container,
    Typography,
    Card,
    CardContent,
    Grid,
    Box,
    Button,
} from "@mui/material";

import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

function Alertas() {

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
                    mensagem: "Nota aguardando conferência há mais de 2 dias",
                    nota
                });
            }

            // CFOP garantia
            const itens = await buscarItensNota(nota.id);

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
        <Container maxWidth="100%" sx={{ mt: 4, bgcolor: '#FFFFFF' }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2, bgcolor: '#007bff', height: '7vh', mb: 2 }}>
                <Typography variant="h4" sx={{ fontFamily: 'Consolas', color: '#FFFFFF' }}>
                    <strong>Alerta de mercadorias</strong>
                </Typography>
                <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'right', mr: '0' }}>
                        {<PersonIcon sx={{ color: "#FFFFFF", paddingRight: '1vh' }} />}
                        <Typography sx={{ color: '#FFFFFF', fontSize: '0.9rem', display: 'flex', alignItems: 'center' }}>
                            {userInfo?.nome}
                        </Typography>
                        {token && (
                            <Button
                                size="small"
                                onClick={logout}
                                sx={{ color: '#FFFFFF', display: 'flex', gap: 1 }}
                            >{<LogoutIcon />}
                            </Button>
                        )}
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'right', mr: '2vh' }}>
                        <Button
                            onClick={() => navigate("/")}
                            sx={{ color: '#ffffff', display: 'flex', gap: 1 }}
                        >
                            Voltar
                            {< ArrowBackIcon />}
                        </Button>
                        <pre id="resultado"></pre>
                    </Box>
                </Box>
            </Box>

            {loading ? (
                <Typography>Carregando...</Typography>
            ) : alertas.length === 0 ? (
                <Typography>Nenhum alerta encontrado</Typography>
            ) : (
                <Grid container spacing={3}>

                    {alertas.map((alerta, idx) => (
                        <Grid item xs={12} md={3} key={idx}>
                            <Card
                                variant="outlined"
                                sx={{
                                    borderRadius: '2vh',
                                    boxShadow: '0vh 0.1vh 0.5vh #000000',
                                    bgcolor: '#f3f3f3',
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    textAlign: 'left',
                                    minHeight: '30vh',
                                    maxHeight: '30vh',
                                    minWidth: '50vh',
                                    maxWidth: '50vh',
                                    borderLeft: `6px solid ${alerta.tipo === "ATRASO_CONFERENCIA" ? "#d32f2f" :
                                        alerta.tipo === "CFOP_GARANTIA" ? "#7b1fa2" :
                                            alerta.tipo === "GUARDA_PENDENTE" ? "#f57c00" :
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
                                                fontSize: '0.8rem',
                                                fontWeight: 'bold',
                                                color:
                                                    alerta.tipo === "ATRASO_CONFERENCIA" ? "#d32f2f" :
                                                        alerta.tipo === "CFOP_GARANTIA" ? "#7b1fa2" :
                                                            alerta.tipo === "GUARDA_PENDENTE" ? "#f57c00" :
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