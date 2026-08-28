import { React, useState, useEffect, useMemo, useContext } from "react";
import { useNavigate } from "react-router-dom";

import {
    Container,
    Typography,
    Card,
    CardContent,
    Grid,
    Box,
    Button,
    CircularProgress,
    TextField,
    Chip,
    Tooltip,
    InputAdornment,
    Avatar,
    Divider
} from "@mui/material";

import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded';
import WarehouseRoundedIcon from '@mui/icons-material/WarehouseRounded';
import FactCheckRoundedIcon from '@mui/icons-material/FactCheckRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import AccessTimeFilledRoundedIcon from '@mui/icons-material/AccessTimeFilled';
import AssignmentReturnRoundedIcon from '@mui/icons-material/AssignmentReturnRounded';
import BarcodeReaderIcon from '@mui/icons-material/BarcodeReader';

// Componentes
import MenuUsuario from "../components/MenuUsuario";
import LoginFuncionario from "../components/LoginFuncionario";

import '../style/App.css';

function Alertas() {

    // API BASE
    const API = "http://192.168.1.185:8077";

    // Acessar outras pages
    const navigate = useNavigate();

    // Login e Logout
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

    // DADOS
    const [notas, setNotas] = useState([]);
    const [alertas, setAlertas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingAlertas, setLoadingAlertas] = useState(false);

    // FILTROS
    const [busca, setBusca] = useState("");
    const [filtroTipo, setFiltroTipo] = useState("TODOS");

    // ÚLTIMA ATUALIZAÇÃO
    const [ultimaAtualizacao, setUltimaAtualizacao] = useState(null);

    useEffect(() => {
        buscarAlertas();
    }, []);

    useEffect(() => {

        const interval = setInterval(() => {
            buscarAlertas();
        }, 60000);

        return () => clearInterval(interval);

    }, []);

    const buscarAlertas = async () => {

        setLoading(true);

        try {

            const response = await fetch(
                `${API}/api/alertas`
            );

            const data = await response.json();

            setAlertas(data.items || []);

            setUltimaAtualizacao(new Date());

        } catch (err) {

            console.error(err);

        } finally {

            setLoading(false);

        }
    };

    const alertasFiltrados = useMemo(() => {

        return alertas.filter(alerta => {

            const termo = busca.toLowerCase();

            const matchBusca =
                alerta.nota.numero?.toString().includes(termo) ||
                alerta.nota.fornecedor?.toLowerCase().includes(termo);

            const matchTipo =
                filtroTipo === "TODOS" ||
                alerta.alertas.some(a => a.tipo === filtroTipo);

            return matchBusca && matchTipo;
        });

    }, [alertas, busca, filtroTipo]);

    const totalConferencia = alertas.filter(a =>
        a.alertas.some(x => x.tipo === "ATRASO_CONFERENCIA")
    ).length;

    const totalGuarda = alertas.filter(a =>
        a.alertas.some(x => x.tipo === "GUARDA_PENDENTE")
    ).length;

    const totalGarantia = alertas.filter(a =>
        a.alertas.some(x => x.tipo === "CFOP_GARANTIA")
    ).length;

    const totalDevolucao = alertas.filter(a =>
        a.alertas.some(x => x.tipo === "CFOP_DEVOLUCAO")
    ).length;

    const totalSemGTIN = alertas.filter(a =>
        a.alertas.some(x => x.tipo === "SEM_GTIN")
    ).length;

    return (
        !token ? (
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
        ) : (
            <Container
                maxWidth="100%"
                sx={{
                    mt: 4,
                    mb: 5,
                    bgcolor: 'background.default'
                }}
            >

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
                    <Box>
                        <Typography variant="h4" sx={{ fontFamily: 'Consolas', color: "background.paper" }}>
                            <strong>Painel de alertas</strong>
                        </Typography>
                        <Typography variant="h7" sx={{ color: "background.subPaper" }}>
                            Monitoramento de processos logísticos
                        </Typography>
                    </Box>
                    <Box>
                        <MenuUsuario
                            userInfo={userInfo}
                            onLogout={logout}
                        />

                        <Box
                            sx={{
                                display: "flex",
                                flexDirection: "row",
                                justifyContent: "right",
                                mr: "2vh"
                            }}
                        >
                            <Button
                                onClick={() => navigate("/")}
                                sx={{
                                    color: "background.paper",
                                    display: 'flex',
                                    gap: 0.5,
                                    fontSize: '0.75rem',
                                    minWidth: 'auto',
                                    padding: '4px 8px',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                Voltar
                                {< ArrowBackIcon />}
                            </Button>
                            <pre id="resultado"></pre>
                        </Box>
                    </Box>
                </Box>

                {/* KPIs */}

                <Grid container spacing={3} sx={{ mb: 4 }}>

                    {[
                        {
                            titulo: "Total Alertas",
                            valor: alertas.length,
                            cor: "primary.main",
                            icon: <WarningAmberRoundedIcon />,
                            ajustarIconeWarning: true
                        },
                        {
                            titulo: "Conferência",
                            valor: totalConferencia,
                            cor: "var(--atraso-conferencia)",
                            icon: <FactCheckRoundedIcon />,
                            ajustarIconeConf: true
                        },
                        {
                            titulo: "Guarda",
                            valor: totalGuarda,
                            cor: "var(--atraso-guarda)",
                            icon: <WarehouseRoundedIcon />,
                            ajustarIconeGuarda: true
                        },
                        {
                            titulo: "Garantia",
                            valor: totalGarantia,
                            cor: "var(--garantia)",
                            icon: <Inventory2RoundedIcon />,
                            ajustarIconeGarantia: true
                        },
                        {
                            titulo: "Devolução",
                            valor: totalDevolucao,
                            cor: "primary.retorno",
                            icon: <AssignmentReturnRoundedIcon />,
                            ajustarIconeDevolucao: true
                        },
                        {
                            titulo: "Sem GTIN",
                            valor: totalSemGTIN,
                            cor: "warning.main",
                            icon: <BarcodeReaderIcon />,
                            ajustarIconeSemGtin: true
                        }
                    ].map((item, idx) => (

                        <Grid item xs={12} sm={6} md={3} key={idx}>

                            <Card
                                sx={{
                                    borderRadius: '20px',

                                    bgcolor:
                                        dark
                                            ? 'background.alerta'
                                            : 'background.default',

                                    border: '1px solid',
                                    borderColor: 'divider',

                                    boxShadow: dark
                                        ? '0 4px 20px rgba(0,0,0,0.4)'
                                        : '0 4px 14px rgba(0,0,0,0.08)'
                                }}
                            >

                                <CardContent>

                                    <Box
                                        sx={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                        }}
                                    >

                                        <Box>

                                            <Typography color="text.secondary">
                                                {item.titulo}
                                            </Typography>

                                            <Typography
                                                variant="h3"
                                                fontWeight="bold"
                                                sx={{
                                                    color: item.cor
                                                }}
                                            >
                                                {item.valor}
                                            </Typography>

                                        </Box>
                                        <Box sx={{ display: "flex", ml: 2, alignItems: "top", justifyContent: "center" }}>
                                            <Avatar
                                                sx={{
                                                    bgcolor: item.cor,
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    height: 40,
                                                    width: 40,
                                                    "& svg": {
                                                        fontSize: 24,
                                                        position: "relative",
                                                        top: item.ajustarIconeWarning ? "-2px" : 0,
                                                        right: item.ajustarIconeGuarda ? "0.5px" : 0,
                                                    }
                                                }}
                                            >
                                                {item.icon}
                                            </Avatar>
                                        </Box>
                                    </Box>

                                </CardContent>

                            </Card>

                        </Grid>
                    ))}

                </Grid>

                {/* FILTROS */}

                <Card
                    sx={{
                        borderRadius: '20px',
                        mb: 4,

                        bgcolor:
                            dark
                                ? 'background.alerta'
                                : 'background.default',

                        border: '1px solid',
                        borderColor: 'divider'
                    }}
                >

                    <CardContent>

                        <Grid container spacing={2}>

                            <Grid item xs={12} md={6}>

                                <TextField
                                    fullWidth
                                    size="small"
                                    label="Buscar NF ou fornecedor"
                                    value={busca}
                                    onChange={(e) => setBusca(e.target.value)}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchIcon />
                                            </InputAdornment>
                                        )
                                    }}
                                />

                            </Grid>

                            <Grid item xs={12} md={6}>

                                <Box
                                    sx={{
                                        display: 'flex',
                                        gap: 1,
                                        flexWrap: 'wrap'
                                    }}
                                >

                                    <Chip
                                        label="TODOS"
                                        clickable
                                        color={filtroTipo === "TODOS" ? "primary" : "default"}
                                        onClick={() => setFiltroTipo("TODOS")}
                                    />
                                    <Chip
                                        label="CONFERÊNCIA"
                                        clickable
                                        color={filtroTipo === "ATRASO_CONFERENCIA" ? "primary" : "default"}
                                        onClick={() => setFiltroTipo("ATRASO_CONFERENCIA")}
                                    />
                                    <Chip
                                        label="GUARDA"
                                        clickable
                                        color={filtroTipo === "GUARDA_PENDENTE" ? "primary" : "default"}
                                        onClick={() => setFiltroTipo("GUARDA_PENDENTE")}
                                    />
                                    <Chip
                                        label="GARANTIA"
                                        clickable
                                        color={filtroTipo === "CFOP_GARANTIA" ? "primary" : "default"}
                                        onClick={() => setFiltroTipo("CFOP_GARANTIA")}
                                    />
                                    <Chip
                                        label="DEVOLUÇÃO"
                                        clickable
                                        color={filtroTipo === "CFOP_DEVOLUCAO" ? "primary" : "default"}
                                        onClick={() => setFiltroTipo("CFOP_DEVOLUCAO")}
                                    />
                                    <Chip
                                        label="SEM GTIN"
                                        clickable
                                        color={filtroTipo === "SEM_GTIN" ? "primary" : "default"}
                                        onClick={() => setFiltroTipo("SEM_GTIN")}
                                    />

                                </Box>

                            </Grid>

                        </Grid>

                    </CardContent>

                </Card>

                {/* ÚLTIMA ATUALIZAÇÃO */}

                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        mb: 3
                    }}
                >

                    <AccessTimeFilledRoundedIcon
                        sx={{
                            fontSize: 18,
                            color: 'text.secondary'
                        }}
                    />

                    <Typography
                        sx={{
                            color: 'text.secondary',
                            fontSize: '0.9rem'
                        }}
                    >
                        Última atualização:
                        {" "}
                        {ultimaAtualizacao?.toLocaleTimeString("pt-BR")}
                    </Typography>

                </Box>

                {/* LOADING */}

                {loading || loadingAlertas ? (

                    <Box textAlign="center" mt={10}>
                        <CircularProgress />

                        <Typography
                            mt={2}
                            sx={{
                                color: 'text.secondary',
                                fontWeight: 600
                            }}
                        >
                            Carregando alertas...
                        </Typography>
                    </Box>

                ) : alertasFiltrados.length === 0 ? (

                    <Card
                        sx={{
                            borderRadius: '24px',
                            p: 6,
                            textAlign: 'center',

                            bgcolor:
                                dark
                                    ? 'background.alerta'
                                    : 'background.default'
                        }}
                    >

                        <WarningAmberRoundedIcon
                            sx={{
                                fontSize: 80,
                                color: 'text.secondary',
                                mb: 2
                            }}
                        />

                        <Typography variant="h5" fontWeight="bold">
                            Nenhum alerta encontrado
                        </Typography>

                    </Card>

                ) : (

                    <Grid container spacing={3}>

                        {alertasFiltrados.map((alerta, idx) => {

                            const possuiSemGTIN = alerta.alertas.some(
                                a => a.tipo === "SEM_GTIN"
                            );

                            return (

                                <Grid item xs={12} md={6} xl={4} key={idx}>

                                    <Card
                                        sx={{
                                            borderRadius: '20px',
                                            overflow: 'hidden',
                                            border: '1px solid',
                                            borderColor: 'divider',

                                            bgcolor:
                                                dark
                                                    ? 'background.alerta'
                                                    : 'background.default',

                                            backdropFilter: 'blur(10px)',

                                            boxShadow: dark
                                                ? '0 4px 20px rgba(0,0,0,0.45)'
                                                : '0 4px 14px rgba(0,0,0,0.08)',

                                            transition: '0.25s ease',

                                            minWidth: '280px',
                                            maxWidth: '280px',
                                            minHeight: '480px',
                                            maxHeight: '480px',

                                            display: 'flex',
                                            flexDirection: 'column',

                                            '&:hover': {
                                                transform: 'translateY(-3px)',

                                                boxShadow: dark
                                                    ? '0 8px 26px rgba(0,0,0,0.6)'
                                                    : '0 8px 22px rgba(0,0,0,0.12)'
                                            }
                                        }}
                                    >

                                        <CardContent
                                            sx={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                flexGrow: 1,
                                                gap: 1.2,
                                                p: 2,
                                                height: '100%'
                                            }}
                                        >

                                            {/* HEADER */}

                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'flex-start'
                                                }}
                                            >

                                                <Box>
                                                    <Typography
                                                        sx={{
                                                            fontSize: '1.15rem',
                                                            fontWeight: 'bold',
                                                            color: 'primary.main'
                                                        }}
                                                    >
                                                        NF {alerta.nota.numero}
                                                    </Typography>

                                                    <Typography
                                                        sx={{
                                                            fontSize: '0.72rem',
                                                            color: 'text.secondary'
                                                        }}
                                                    >
                                                        Série {alerta.nota.serie}
                                                    </Typography>
                                                </Box>

                                                <Box
                                                    sx={{
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        gap: 1,
                                                        alignItems: 'flex-end'
                                                    }}
                                                >
                                                    <Chip
                                                        label={alerta.prioridade.label}
                                                        sx={{
                                                            bgcolor: alerta.prioridade.color,
                                                            color: '#fff',
                                                            fontWeight: 700
                                                        }}
                                                    />
                                                </Box>
                                            </Box>

                                            {/* FORNECEDOR */}

                                            <Box
                                                sx={{
                                                    bgcolor:
                                                        dark
                                                            ? 'background.card'
                                                            : 'background.inputBg',

                                                    borderRadius: '14px',
                                                    p: 1
                                                }}
                                            >

                                                <Typography
                                                    sx={{
                                                        fontSize: '0.6rem',
                                                        color: 'text.secondary',
                                                        textTransform: 'uppercase'
                                                    }}
                                                >
                                                    Fornecedor
                                                </Typography>

                                                <Tooltip title={alerta.nota.fornecedor}>

                                                    <Typography
                                                        sx={{
                                                            fontSize: '0.82rem',
                                                            fontWeight: 700,
                                                            whiteSpace: 'nowrap',
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis'
                                                        }}
                                                    >
                                                        {alerta.nota.fornecedor}
                                                    </Typography>

                                                </Tooltip>

                                            </Box>

                                            {/* ALERTAS */}

                                            {alerta.alertas.map((item, index) => {

                                                const cor =
                                                    item.tipo === "ATRASO_CONFERENCIA"
                                                        ? "var(--atraso-conferencia)"
                                                        : item.tipo === "GUARDA_PENDENTE"
                                                            ? "var(--atraso-guarda)"
                                                            : item.tipo === "CFOP_GARANTIA"
                                                                ? "var(--garantia)"
                                                                : item.tipo === "CFOP_DEVOLUCAO"
                                                                    ? "primary.retorno"
                                                                    : item.tipo === "SEM_GTIN"
                                                                        ? "warning.main"
                                                                        : "background.default";

                                                return (

                                                    <Box
                                                        key={index}
                                                        onClick={() => {
                                                            if (item.tipo === "SEM_GTIN") {
                                                                navigate(`/AtualizarCean?nota=${alerta.nota.numero}`);
                                                            }
                                                        }}
                                                        sx={{
                                                            borderRadius: '14px',
                                                            cursor:
                                                                item.tipo === "SEM_GTIN"
                                                                    ? 'pointer'
                                                                    : 'default',

                                                            bgcolor:
                                                                dark
                                                                    ? `${cor}20`
                                                                    : `${cor}15`,

                                                            border: `1px solid ${cor}40`,
                                                            p: 1.2,

                                                            '&:hover': item.tipo === "SEM_GTIN"
                                                                ? {
                                                                    transform: 'scale(1.02)'
                                                                }
                                                                : {}
                                                        }}
                                                    >

                                                        <Typography
                                                            sx={{
                                                                fontSize: '0.74rem',
                                                                fontWeight: 800,
                                                                color: cor,
                                                                mb: 0.5
                                                            }}
                                                        >
                                                            {item.tipo}
                                                        </Typography>

                                                        <Typography
                                                            sx={{
                                                                fontSize: '0.82rem'
                                                            }}
                                                        >
                                                            {item.tipo === "SEM_GTIN"
                                                                ? `${item.mensagem} • Clique para corrigir`
                                                                : item.mensagem
                                                            }
                                                        </Typography>

                                                    </Box>
                                                );
                                            })}

                                            <Divider />

                                            {/* INFO */}

                                            <Box
                                                sx={{
                                                    display: 'grid',
                                                    gridTemplateColumns: '1fr 1fr',
                                                    gap: 1
                                                }}
                                            >

                                                <Box
                                                    sx={{
                                                        bgcolor:
                                                            dark
                                                                ? 'background.card'
                                                                : 'background.inputBg',

                                                        borderRadius: '12px',
                                                        p: 1
                                                    }}
                                                >

                                                    <Typography
                                                        sx={{
                                                            fontSize: '0.58rem',
                                                            color: 'text.secondary'
                                                        }}
                                                    >
                                                        Dias alerta
                                                    </Typography>

                                                    <Typography
                                                        sx={{
                                                            fontWeight: 800,
                                                            color: alerta.prioridade.color
                                                        }}
                                                    >
                                                        {alerta.dias} dias
                                                    </Typography>

                                                </Box>

                                                <Box
                                                    sx={{
                                                        bgcolor:
                                                            dark
                                                                ? 'background.card'
                                                                : 'background.inputBg',

                                                        borderRadius: '12px',
                                                        p: 1
                                                    }}
                                                >

                                                    <Typography
                                                        sx={{
                                                            fontSize: '0.58rem',
                                                            color: 'text.secondary'
                                                        }}
                                                    >
                                                        Itens
                                                    </Typography>

                                                    <Typography
                                                        sx={{
                                                            fontWeight: 800
                                                        }}
                                                    >
                                                        {alerta.quantidadeItens}
                                                    </Typography>

                                                </Box>

                                            </Box>

                                            {/* DATAS */}

                                            <Box
                                                sx={{
                                                    display: 'grid',
                                                    gridTemplateColumns: '1fr 1fr',
                                                    gap: 1
                                                }}
                                            >

                                                <Box
                                                    sx={{
                                                        bgcolor:
                                                            dark
                                                                ? 'background.card'
                                                                : 'background.inputBg',

                                                        borderRadius: '12px',
                                                        p: 1
                                                    }}
                                                >

                                                    <Typography
                                                        sx={{
                                                            fontSize: '0.55rem',
                                                            color: 'text.secondary'
                                                        }}
                                                    >
                                                        Emissão
                                                    </Typography>

                                                    <Typography
                                                        sx={{
                                                            fontSize: '0.74rem',
                                                            fontWeight: 700
                                                        }}
                                                    >
                                                        {alerta.nota.data_emissao}
                                                    </Typography>

                                                </Box>

                                                <Box
                                                    sx={{
                                                        bgcolor:
                                                            dark
                                                                ? 'background.card'
                                                                : 'background.inputBg',

                                                        borderRadius: '12px',
                                                        p: 1
                                                    }}
                                                >

                                                    <Typography
                                                        sx={{
                                                            fontSize: '0.55rem',
                                                            color: 'text.secondary'
                                                        }}
                                                    >
                                                        Importação
                                                    </Typography>

                                                    <Typography
                                                        sx={{
                                                            fontSize: '0.74rem',
                                                            fontWeight: 700
                                                        }}
                                                    >
                                                        {alerta.nota.data_recebimento}
                                                    </Typography>

                                                </Box>

                                            </Box>

                                            {/* OBS */}

                                            {alerta.nota.observacao && (

                                                <Box
                                                    sx={{
                                                        bgcolor:
                                                            dark
                                                                ? 'rgba(255,255,255,0.05)'
                                                                : 'primary.observacao',

                                                        borderRadius: '14px',
                                                        p: 1
                                                    }}
                                                >

                                                    <Typography
                                                        sx={{
                                                            fontSize: '0.72rem',

                                                            color:
                                                                dark
                                                                    ? 'warning.light'
                                                                    : '#fff'
                                                        }}
                                                    >
                                                        <strong>Obs:</strong>
                                                        {" "}
                                                        {alerta.nota.observacao}
                                                    </Typography>
                                                </Box>
                                            )}
                                        </CardContent>
                                    </Card>
                                </Grid>
                            );
                        })}
                    </Grid>
                )}
            </Container>
        )
    );
}

export default Alertas;