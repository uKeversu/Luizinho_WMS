import { useEffect, useState, useContext } from "react";

import {
    Container,
    Typography,
    TextField,
    Paper,
    CircularProgress,
    Box,
    Chip,
    Grid,
    Card,
    CardContent,
    Dialog,
    DialogTitle,
    DialogContent,
    IconButton,
    Divider,
    Button,
    Tabs,
    Tab,
    LinearProgress,
    Avatar,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from "@mui/material";

import {
    Close as CloseIcon,
    EmojiEvents as EmojiEventsIcon,
    Inventory2 as Inventory2Icon,
    WarningAmber as WarningAmberIcon,
    CheckCircle as CheckCircleIcon,
    Bolt as BoltIcon,
    MilitaryTech as MilitaryTechIcon,
    Shield as ShieldIcon,
    TrendingUp as TrendingUpIcon,
    Psychology as PsychologyIcon,
    LocalFireDepartment as LocalFireDepartmentIcon,
    Stars as StarsIcon,
    WorkspacePremium as WorkspacePremiumIcon,
} from "@mui/icons-material";

import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Tooltip,
    CartesianGrid,
    XAxis,
    YAxis,
    AreaChart,
    Area,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
    BarChart,
    Bar,
    LineChart,
    Line,
} from "recharts";

import { motion } from "framer-motion";

import { ThemeContext } from "../context/ThemeContext";

// API
const API = "http://192.168.1.185:8077/";

export default function Produtividade() {

    const { dark } = useContext(ThemeContext);

    // STATES
    const [loading, setLoading] = useState(true);

    const [dados, setDados] = useState([]);

    const [error, setError] = useState(null);

    const [tab, setTab] = useState(0);

    const [dataInicio, setDataInicio] = useState("");

    const [dataFim, setDataFim] = useState("");

    const [lastUpdate, setLastUpdate] = useState(null);

    const [openDetalhes, setOpenDetalhes] =
        useState(false);

    const [detalhesSelecionados,
        setDetalhesSelecionados] = useState([]);

    const [nomeSelecionado,
        setNomeSelecionado] = useState("");

    const [openRanks, setOpenRanks] = useState(false);

    const [imagemFullscreen, setImagemFullscreen] =
        useState(false);

    // Cores
    const textColor = dark
        ? "primary.branco"
        : "text.primary";

    const subTextColor = dark
        ? "primary.branco"
        : "text.secondary";

    const paperBg = dark
        ? "linear-gradient(135deg,#141414,#0a0a0a)"
        : "#fff";

    // Cards
    const glassStyle = {

        borderRadius: 5,

        background: paperBg,

        border: dark
            ? "1px solid rgba(255,255,255,0.08)"
            : "1px solid rgba(0,0,0,0.08)",

        boxShadow: dark
            ? "0 0 30px rgba(0,255,120,0.12)"
            : "0 10px 25px rgba(0,0,0,0.08)",

        backdropFilter: "blur(10px)",

        transition: "0.25s",

        "&:hover": {

            transform: "translateY(-4px)",

            boxShadow: dark
                ? "0 0 45px rgba(0,255,120,0.18)"
                : "0 14px 30px rgba(0,0,0,0.12)",
        },
    };

    // Carrega últimos 7 dias
    useEffect(() => {

        const hoje = new Date();

        const seteDias = new Date();

        seteDias.setDate(hoje.getDate() - 7);

        const fmt = (d) =>
            d.toISOString().split("T")[0];

        const ini = fmt(seteDias);

        const fim = fmt(hoje);

        setDataInicio(ini);

        setDataFim(fim);

        carregarDados(ini, fim);

    }, []);

    // Auto refresh a cada 5min
    useEffect(() => {

        if (!dataInicio || !dataFim) return;

        const interval = setInterval(() => {

            carregarDados(
                dataInicio,
                dataFim
            );

        }, 5 * 60 * 1000);

        return () => clearInterval(interval);

    }, [dataInicio, dataFim]);

    // Gera patente do usuário
    const obterNivel = (xp, itens, pontosFinais, produtividade, errosCaixa) => {

        if (xp >= 300000 && itens >= 10000 && pontosFinais >= 15000 && produtividade >= 98)
            return {
                nome: "LENDARIO",
                cor: "#a724ff",
                imagem: "/ranks/icone-lendario.png",
            };

        else if (xp >= 200000 && itens >= 5000 && pontosFinais >= 10000 && produtividade >= 95)
            return {
                nome: "MESTRE",
                cor: "#ff2929",
                imagem: "/ranks/icone-mestre.png",
            };

        else if (xp >= 150000 && itens >= 3000 && pontosFinais >= 5000 && produtividade >= 90)
            return {
                nome: "ESMERALDA",
                cor: "#06c730",
                imagem: "/ranks/icone-esmeralda.png",
            };

        else if (xp >= 100000 && itens >= 2000 && pontosFinais >= 3000 && produtividade >= 85)
            return {
                nome: "DIAMANTE",
                cor: "#00d5ff",
                imagem: "/ranks/icone-diamante.png",
            };

        else if (xp >= 70000 && itens >= 1500 && pontosFinais >= 1000 && produtividade >= 80)
            return {
                nome: "OURO",
                cor: "#FFD700",
                imagem: "/ranks/icone-ouro.png",
            };

        else if (xp >= 30000 && itens >= 800 && pontosFinais >= 500 && produtividade >= 75)
            return {
                nome: "PRATA",
                cor: "#9c9c9c",
                imagem: "/ranks/icone-prata.png",
            };

        return {
            nome: "BRONZE",
            cor: "#d17920",
            imagem: "/ranks/icone-bronze.png",
        };

    };

    // Itens conferidos pelo usuário
    const abrirDetalhes = (row) => {

        setDetalhesSelecionados(
            row.detalhes || []
        );

        setNomeSelecionado(row.nome);

        setOpenDetalhes(true);

    };

    // Carrega página com dados preenchidos
    const carregarDados = async (ini, fim) => {

        try {

            setLoading(true);

            const response = await fetch(
                `${API}/api/produtividade?data_inicio=${ini}&data_fim=${fim}`
            );

            const data = await response.json();

            const items = data.items || [];

            const resultado = items.map(item => ({

                ...item,

                nivel: obterNivel(
                    item.xp,
                    item.itens,
                    item.pontosFinais,
                    item.produtividade,
                    item.errosCaixa
                )

            }));

            setDados(resultado);

            setLastUpdate(
                new Date().toLocaleTimeString()
            );

        } catch (err) {

            console.error(err);

            setError("Erro ao carregar");

        } finally {

            setLoading(false);
        }
    };

    // Icone de carregamento
    if (loading) {

        return (
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "80vh",
                }}
            >
                <CircularProgress size={60} />
            </Box>
        );

    }

    // Dados totais
    const totalItens =
        dados.reduce(
            (a, b) => a + b.itens,
            0
        );

    const totalPontos =
        dados.reduce(
            (a, b) =>
                a + b.pontosFinais,
            0
        );

    const totalErros =
        dados.reduce(
            (a, b) =>
                a + b.errosCaixa,
            0
        );

    // MVP - Melhor conferente
    const mvp = dados[0];

    const pior =
        [...dados].sort(
            (a, b) =>
                a.produtividade
                - b.produtividade
        )[0];

    const maisXP =
        [...dados].sort(
            (a, b) =>
                b.xp - a.xp
        )[0];

    const maisPesados =
        [...dados].sort(
            (a, b) =>
                b.pontosPesados
                - a.pontosPesados
        )[0];

    // Tela
    return (

        <Container
            maxWidth="xl"
            sx={{
                mt: 4,
                mb: 6,
            }}
        >

            {/* HEADER */}
            <Box sx={{ mb: 4 }}>

                <Typography
                    variant="h4"
                    fontWeight="bold"
                    color={textColor}
                >
                    SIGEL WMS
                </Typography>

                <Typography
                    color={subTextColor}
                >
                    Sistema avançado de produtividade
                </Typography>

            </Box>

            {/* CAMPOS DE FILTRO POR DATA */}
            <Box
                sx={{
                    display: "flex",
                    gap: 2,
                    mb: 3,
                    flexWrap: "wrap",
                }}
            >

                <TextField
                    type="date"
                    label="Data início"
                    InputLabelProps={{
                        shrink: true,
                    }}
                    value={dataInicio}
                    onChange={(e) =>
                        setDataInicio(
                            e.target.value
                        )
                    }
                />

                <TextField
                    type="date"
                    label="Data fim"
                    InputLabelProps={{
                        shrink: true,
                    }}
                    value={dataFim}
                    onChange={(e) =>
                        setDataFim(
                            e.target.value
                        )
                    }
                />

                <Button
                    variant="contained"
                    onClick={() =>
                        carregarDados(
                            dataInicio,
                            dataFim
                        )
                    }
                >
                    Atualizar
                </Button>

                <IconButton
                    onClick={() => setOpenRanks(true)}
                    sx={{
                        bgcolor: "#1a1a1a",
                        color: "#fff",
                        width: "50px",
                        height: "50px",

                        "&:hover": {
                            bgcolor: "#2a2a2a",
                        },
                    }}
                >
                    ?
                </IconButton>

            </Box>

            {/* TABS */}
            <Paper
                sx={{
                    ...glassStyle,
                    mb: 10,
                }}
            >

                <Tabs
                    value={tab}
                    onChange={(e, v) =>
                        setTab(v)
                    }
                    variant="scrollable"
                >

                    <Tab
                        label="📊 Operacional"
                        sx={{
                            color: textColor,
                        }}
                    />

                    <Tab
                        label="📈 Gerencial"
                        sx={{
                            color: textColor,
                        }}
                    />

                    <Tab
                        label="🎮 Arena"
                        sx={{
                            color: textColor,
                        }}
                    />

                </Tabs>

            </Paper>

            {/* ===================================== */}
            {/* OPERACIONAL */}
            {/* ===================================== */}
            {tab === 0 && (

                <Grid
                    container
                    spacing={3}
                >

                    {dados.map((row, index) => {

                        const nivel =
                            obterNivel(
                                Number(
                                    row.xp
                                ), row.itens,
                                row.pontosFinais,
                                row.produtividade,
                                row.errosCaixa
                            );

                        return (

                            <Grid
                                item
                                xs={12}
                                md={6}
                                key={row.conferente}
                            >

                                <motion.div
                                    initial={{
                                        opacity: 0,
                                        y: 20,
                                    }}
                                    animate={{
                                        opacity: 1,
                                        y: 0,
                                    }}
                                >

                                    <Paper
                                        sx={{
                                            ...glassStyle,

                                            position: "relative",

                                            overflow: "visible",

                                            pt: 12,
                                            pb: 3,
                                            px: 3,

                                            border: `1px solid ${nivel.cor}55`,

                                            boxShadow: `
                                                0 0 20px ${nivel.cor}22,
                                                0 0 60px ${nivel.cor}11
                                            `,

                                            background: dark
                                                ? `
                                                linear-gradient(
                                                180deg,
                                                ${nivel.cor}15 0%,
                                                #111 35%
                                                )
                                                `
                                                : "#fff",
                                        }}
                                    >

                                        {/* GLOW FUNDO */}
                                        <Box
                                            sx={{
                                                position: "absolute",
                                                top: -80,
                                                left: "50%",
                                                transform: "translateX(-50%)",

                                                width: 180,
                                                height: 180,

                                                borderRadius: "50%",

                                                background: `${nivel.cor}55`,

                                                filter: "blur(70px)",

                                                zIndex: 1,
                                            }}
                                        />

                                        {/* RANK */}
                                        <Box
                                            sx={{
                                                position: "absolute",

                                                top: -70,

                                                left: "50%",

                                                transform: "translateX(-50%)",

                                                zIndex: 20,

                                                display: "flex",

                                                flexDirection: "column",

                                                alignItems: "center",
                                            }}
                                        >

                                            <motion.img
                                                src={nivel.imagem}
                                                alt={nivel.nome}

                                                animate={{
                                                    y: [0, -6, 0],
                                                }}

                                                transition={{
                                                    duration: 3,
                                                    repeat: Infinity,
                                                }}

                                                style={{

                                                    width: 140,
                                                    height: 140,

                                                    objectFit: "contain",

                                                    filter: `
                                                    drop-shadow(0 0 12px ${nivel.cor}
                                                    drop-shadow(0 0 30px ${nivel.cor})
                                                `,
                                                }}
                                            />

                                            <Typography
                                                sx={{
                                                    mt: -1,

                                                    fontWeight: 900,

                                                    letterSpacing: 2,

                                                    fontSize: 18,

                                                    color: nivel.cor,

                                                    textShadow: `
                                                    0 0 10px ${nivel.cor},
                                                    0 0 20px ${nivel.cor}
                                                `,
                                                }}
                                            >
                                                {nivel.nome}
                                            </Typography>

                                        </Box>

                                        <Box
                                            sx={{
                                                position: "absolute",
                                                top: -30,
                                                right: -30,
                                                width: 120,
                                                height: 120,
                                                borderRadius: "50%",
                                                bgcolor:
                                                    `${nivel.cor}22`,
                                                filter:
                                                    "blur(40px)",
                                            }}
                                        />

                                        <Box
                                            sx={{
                                                display: "flex",
                                                justifyContent:
                                                    "space-between",

                                                alignItems:
                                                    "center",
                                            }}
                                        >

                                            <Box
                                                sx={{
                                                    display: "flex",
                                                    alignItems:
                                                        "center",
                                                    gap: 2,
                                                }}
                                            >

                                                <Avatar
                                                    sx={{
                                                        width: 70,
                                                        height: 70,
                                                        bgcolor:
                                                            nivel.cor,
                                                        color:
                                                            "#ffffff",
                                                        fontWeight:
                                                            "bold",
                                                        fontSize:
                                                            28,
                                                    }}
                                                >
                                                    {index + 1}
                                                </Avatar>

                                                <Box>
                                                    <Typography
                                                        variant="h6"
                                                        fontWeight="bold"
                                                        color={textColor}
                                                    >
                                                        {row.nome}
                                                    </Typography>
                                                </Box>

                                            </Box>

                                            <Chip
                                                icon={
                                                    <BoltIcon />
                                                }
                                                label={`${row.xp} XP`}
                                                color="secondary"
                                                sx={{ ml: 2 }}
                                            />

                                        </Box>

                                        <Divider
                                            sx={{
                                                my: 2,
                                            }}
                                        />

                                        <Stack
                                            spacing={1.5}
                                        >

                                            <Chip
                                                icon={
                                                    <EmojiEventsIcon />
                                                }
                                                label={`${row.pontosFinais} pts`}
                                                color="warning"
                                                sx={{ color: 'primary.branco' }}
                                            />

                                            <Chip
                                                icon={
                                                    <Inventory2Icon />
                                                }
                                                label={`${row.itens} itens`}
                                            />

                                            <Chip
                                                icon={
                                                    <ShieldIcon />
                                                }
                                                label={`${row.produtividade}% precisão`}
                                                color="success"
                                                sx={{ color: 'primary.branco' }}
                                            />

                                            <Chip
                                                icon={
                                                    <WarningAmberIcon />
                                                }
                                                label={`${row.errosCaixa} divergências`}
                                                color="error"
                                            />

                                        </Stack>

                                        <Box
                                            sx={{
                                                mt: 3,
                                            }}
                                        >

                                            <LinearProgress
                                                variant="determinate"
                                                value={Number(
                                                    row.produtividade
                                                )}
                                                sx={{
                                                    height: 14,
                                                    borderRadius: 20,
                                                }}
                                            />

                                        </Box>

                                        <Button
                                            fullWidth
                                            variant="contained"
                                            sx={{
                                                mt: 3,
                                            }}
                                            onClick={() =>
                                                abrirDetalhes(
                                                    row
                                                )
                                            }
                                        >
                                            Ver detalhes
                                        </Button>

                                    </Paper>

                                </motion.div>

                            </Grid>

                        );

                    })}

                </Grid>

            )}

            {/* ===================================== */}
            {/* GERENCIAL */}
            {/* ===================================== */}
            {tab === 1 && (

                <Grid container spacing={3}>

                    <Grid item xs={12}>

                        <Grid container spacing={12}>

                            {/* TOTAL ITENS */}
                            <Grid item xs={12} md={2}>
                                <Card sx={glassStyle}>
                                    <CardContent>

                                        <Typography color={subTextColor}>
                                            Total de itens
                                        </Typography>

                                        <Typography
                                            variant="h4"
                                            fontWeight="bold"
                                            color="#00ff99"
                                        >
                                            {totalItens}
                                        </Typography>

                                        <Typography
                                            variant="caption"
                                            color={subTextColor}
                                        >
                                            peças conferidas
                                        </Typography>

                                    </CardContent>
                                </Card>
                            </Grid>

                            {/* PONTOS */}
                            <Grid item xs={12} md={2}>
                                <Card sx={glassStyle}>
                                    <CardContent>

                                        <Typography color={subTextColor}>
                                            Pontuação
                                        </Typography>

                                        <Typography
                                            variant="h4"
                                            fontWeight="bold"
                                            color="#00bfff"
                                        >
                                            {totalPontos}
                                        </Typography>

                                        <Typography
                                            variant="caption"
                                            color={subTextColor}
                                        >
                                            produtividade geral
                                        </Typography>

                                    </CardContent>
                                </Card>
                            </Grid>

                            {/* ERROS */}
                            <Grid item xs={12} md={2}>
                                <Card sx={glassStyle}>
                                    <CardContent>

                                        <Typography color={subTextColor}>
                                            Divergências
                                        </Typography>

                                        <Typography
                                            variant="h4"
                                            fontWeight="bold"
                                            color="#ff5252"
                                        >
                                            {totalErros}
                                        </Typography>

                                        <Typography
                                            variant="caption"
                                            color={subTextColor}
                                        >
                                            erros operacionais
                                        </Typography>

                                    </CardContent>
                                </Card>
                            </Grid>

                            {/* MEDIA */}
                            <Grid item xs={12} md={2}>
                                <Card sx={glassStyle}>
                                    <CardContent>

                                        <Typography color={subTextColor}>
                                            Média equipe
                                        </Typography>

                                        <Typography
                                            variant="h4"
                                            fontWeight="bold"
                                            color="#FFD700"
                                        >
                                            {
                                                (
                                                    dados.reduce(
                                                        (a, b) =>
                                                            a +
                                                            Number(
                                                                b.produtividade
                                                            ),
                                                        0
                                                    ) / dados.length
                                                ).toFixed(1)
                                            }%
                                        </Typography>

                                        <Typography
                                            variant="caption"
                                            color={subTextColor}
                                        >
                                            eficiência média
                                        </Typography>

                                    </CardContent>
                                </Card>
                            </Grid>

                            {/* MVP */}
                            <Grid item xs={12} md={2}>
                                <Card sx={glassStyle}>
                                    <CardContent>

                                        <Typography color={subTextColor}>
                                            MVP operacional
                                        </Typography>

                                        <Typography
                                            fontWeight="bold"
                                            color="#00ff99"
                                        >
                                            {mvp?.nome}
                                        </Typography>

                                        <Typography
                                            variant="caption"
                                            color={subTextColor}
                                        >
                                            melhor operador
                                        </Typography>

                                    </CardContent>
                                </Card>
                            </Grid>

                            {/* PIOR */}
                            <Grid item xs={12} md={2}>
                                <Card sx={glassStyle}>
                                    <CardContent>

                                        <Typography color={subTextColor}>
                                            Atenção
                                        </Typography>

                                        <Typography
                                            fontWeight="bold"
                                            color="#ff5252"
                                        >
                                            {pior?.nome}
                                        </Typography>

                                        <Typography
                                            variant="caption"
                                            color={subTextColor}
                                        >
                                            menor eficiência
                                        </Typography>

                                    </CardContent>
                                </Card>
                            </Grid>

                        </Grid>

                    </Grid>

                    {/* ===================================== */}
                    {/* RELATÓRIO*/}
                    {/* ===================================== */}
                    <Grid item xs={12}>

                        <Grid container spacing={3}>

                            {/* ===================================== */}
                            {/* TABELA GERENCIAL */}
                            {/* ===================================== */}
                            <Grid item xs={12} lg={8}>

                                <Paper
                                    sx={{
                                        ...glassStyle,
                                        p: 3,
                                        height: "100%",
                                    }}
                                >

                                    <Box
                                        sx={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            mb: 3,
                                            flexWrap: "wrap",
                                            gap: 2,
                                        }}
                                    >

                                        <Box>

                                            <Typography
                                                variant="h6"
                                                fontWeight="bold"
                                                color={textColor}
                                            >
                                                📋 Relatório gerencial
                                            </Typography>

                                            <Typography
                                                variant="body2"
                                                color={subTextColor}
                                            >
                                                Indicadores completos da equipe operacional
                                            </Typography>

                                        </Box>

                                        <Chip
                                            label={`Última atualização • ${lastUpdate}`}
                                            color="info"
                                        />

                                    </Box>

                                    <TableContainer>

                                        <Table>

                                            <TableHead>

                                                <TableRow>

                                                    <TableCell sx={{ color: "#fff" }}>
                                                        Operador
                                                    </TableCell>

                                                    <TableCell sx={{ color: "#fff" }}>
                                                        Itens
                                                    </TableCell>

                                                    <TableCell sx={{ color: "#fff" }}>
                                                        Pontos
                                                    </TableCell>

                                                    <TableCell sx={{ color: "#fff" }}>
                                                        Erros
                                                    </TableCell>

                                                    <TableCell sx={{ color: "#fff" }}>
                                                        Eficiência
                                                    </TableCell>

                                                    <TableCell sx={{ color: "#fff" }}>
                                                        XP
                                                    </TableCell>

                                                    <TableCell sx={{ color: "#fff" }}>
                                                        Pesados
                                                    </TableCell>

                                                    <TableCell sx={{ color: "#fff" }}>
                                                        Status
                                                    </TableCell>

                                                </TableRow>

                                            </TableHead>

                                            <TableBody>

                                                {dados.map((row, index) => {

                                                    const nivel =
                                                        obterNivel(
                                                            Number(
                                                                row.xp
                                                            ), row.itens,
                                                            row.pontosFinais,
                                                            row.produtividade,
                                                            row.errosCaixa
                                                        );
                                                    return (

                                                        <TableRow
                                                            key={row.conferente}
                                                            hover
                                                            sx={{
                                                                transition: "0.2s",

                                                                "&:hover": {
                                                                    bgcolor:
                                                                        dark
                                                                            ? "rgba(255,255,255,0.03)"
                                                                            : "rgba(0,0,0,0.03)",
                                                                },
                                                            }}
                                                        >

                                                            {/* OPERADOR */}
                                                            <TableCell>

                                                                <Box
                                                                    sx={{
                                                                        display: "flex",
                                                                        alignItems: "center",
                                                                        gap: 1.5,
                                                                    }}
                                                                >

                                                                    <Avatar
                                                                        sx={{
                                                                            width: 72,
                                                                            height: 72,

                                                                            bgcolor: "#111",

                                                                            border: `3px solid ${nivel.cor}`,

                                                                            color: "#fff",

                                                                            fontWeight: "bold",

                                                                            fontSize: 30,

                                                                            boxShadow: `
                                                                            0 0 15px ${nivel.cor}
                                                                        `,
                                                                        }}
                                                                    >
                                                                        {index + 1}
                                                                    </Avatar>

                                                                    <Box>

                                                                        <Typography
                                                                            color={textColor}
                                                                            fontWeight="bold"
                                                                        >
                                                                            {row.nome}
                                                                        </Typography>

                                                                        <Typography
                                                                            variant="caption"
                                                                            color={subTextColor}
                                                                        >
                                                                            {nivel.emoji} {nivel.nome}
                                                                        </Typography>

                                                                    </Box>

                                                                </Box>

                                                            </TableCell>

                                                            {/* ITENS */}
                                                            <TableCell>

                                                                <Typography
                                                                    color={textColor}
                                                                    fontWeight="bold"
                                                                >
                                                                    {row.itens}
                                                                </Typography>

                                                            </TableCell>

                                                            {/* PONTOS */}
                                                            <TableCell>

                                                                <Typography
                                                                    color="#00ff99"
                                                                    fontWeight="bold"
                                                                >
                                                                    {row.pontosFinais}
                                                                </Typography>

                                                            </TableCell>

                                                            {/* ERROS */}
                                                            <TableCell>

                                                                <Typography
                                                                    color={
                                                                        row.errosCaixa > 0
                                                                            ? "#ff5252"
                                                                            : "#00ff99"
                                                                    }
                                                                    fontWeight="bold"
                                                                >
                                                                    {row.errosCaixa}
                                                                </Typography>

                                                            </TableCell>

                                                            {/* EFICIENCIA */}
                                                            <TableCell>

                                                                <Chip
                                                                    label={`${row.produtividade}%`}
                                                                    color={
                                                                        row.produtividade >= 90
                                                                            ? "success"
                                                                            : row.produtividade >= 70
                                                                                ? "warning"
                                                                                : "error"
                                                                    }
                                                                    sx={{ color: "primary.branco" }}
                                                                />

                                                            </TableCell>

                                                            {/* XP */}
                                                            <TableCell>

                                                                <Typography
                                                                    color="#FFD700"
                                                                    fontWeight="bold"
                                                                >
                                                                    {row.xp}
                                                                </Typography>

                                                            </TableCell>

                                                            {/* PESADOS */}
                                                            <TableCell>

                                                                <Typography
                                                                    color="#00bfff"
                                                                    fontWeight="bold"
                                                                >
                                                                    {row.pontosPesados}
                                                                </Typography>

                                                            </TableCell>

                                                            {/* STATUS */}
                                                            <TableCell>

                                                                <Chip sx={{
                                                                    color: '#FFFFFF',
                                                                    fontWeight: "bold"
                                                                }}
                                                                    label={
                                                                        row.produtividade >= 99
                                                                            ? "MASTER"
                                                                            :
                                                                            row.produtividade >= 95
                                                                                ? "ELITE"
                                                                                : row.produtividade >= 85
                                                                                    ? "ÓTIMO"
                                                                                    : row.produtividade >= 70
                                                                                        ? "OK"
                                                                                        : "CRÍTICO"
                                                                    }
                                                                    color={
                                                                        row.produtividade >= 99
                                                                            ? "warning"
                                                                            :
                                                                            row.produtividade >= 95
                                                                                ? "info"
                                                                                : row.produtividade >= 70
                                                                                    ? "success"
                                                                                    : "error"
                                                                    }
                                                                />

                                                            </TableCell>

                                                        </TableRow>

                                                    );

                                                })}

                                            </TableBody>

                                        </Table>

                                    </TableContainer>

                                </Paper>

                            </Grid>

                            {/* ===================================== */}
                            {/* SALA DE GUERRA */}
                            {/* ===================================== */}
                            <Grid item xs={12} lg={4}>

                                <Paper
                                    sx={{
                                        ...glassStyle,
                                        p: 3,
                                        height: "100%",
                                    }}
                                >

                                    <Typography
                                        variant="h6"
                                        fontWeight="bold"
                                        color={textColor}
                                        sx={{ mb: 3 }}
                                    >
                                        🧠 Sala de guerra
                                    </Typography>

                                    <Stack spacing={2}>

                                        {/* MVP */}
                                        <Paper
                                            sx={{
                                                p: 2.5,
                                                borderRadius: 4,
                                                bgcolor:
                                                    "rgba(0,255,120,0.08)",
                                                border:
                                                    "1px solid rgba(0,255,120,0.2)",
                                            }}
                                        >

                                            <Typography
                                                color="#00ff99"
                                                fontWeight="bold"
                                            >
                                                🏆 MVP DA SEMANA
                                            </Typography>

                                            <Typography
                                                variant="h5"
                                                fontWeight="bold"
                                                color={textColor}
                                                sx={{ mt: 1 }}
                                            >
                                                {mvp?.nome}
                                            </Typography>

                                            <Typography
                                                color={subTextColor}
                                            >
                                                {mvp?.pontosFinais} pts
                                            </Typography>

                                        </Paper>

                                        {/* MAIS PRECISO */}
                                        <Paper
                                            sx={{
                                                p: 2.5,
                                                borderRadius: 4,
                                                bgcolor:
                                                    "rgba(0,191,255,0.08)",
                                                border:
                                                    "1px solid rgba(0,191,255,0.2)",
                                            }}
                                        >

                                            <Typography
                                                color="#00bfff"
                                                fontWeight="bold"
                                            >
                                                🎯 MAIS PRECISO
                                            </Typography>

                                            <Typography
                                                variant="h5"
                                                fontWeight="bold"
                                                color={textColor}
                                                sx={{ mt: 1 }}
                                            >
                                                {
                                                    [...dados]
                                                        .sort(
                                                            (a, b) =>
                                                                b.produtividade -
                                                                a.produtividade
                                                        )[0]?.nome
                                                }
                                            </Typography>

                                            <Typography
                                                color={subTextColor}
                                            >
                                                {
                                                    [...dados]
                                                        .sort(
                                                            (a, b) =>
                                                                b.produtividade -
                                                                a.produtividade
                                                        )[0]
                                                        ?.produtividade
                                                }%
                                            </Typography>

                                        </Paper>

                                        {/* MAIOR XP */}
                                        <Paper
                                            sx={{
                                                p: 2.5,
                                                borderRadius: 4,
                                                bgcolor:
                                                    "rgba(255,215,0,0.08)",
                                                border:
                                                    "1px solid rgba(255,215,0,0.2)",
                                            }}
                                        >

                                            <Typography
                                                color="#FFD700"
                                                fontWeight="bold"
                                            >
                                                ⚡ MAIOR XP
                                            </Typography>

                                            <Typography
                                                variant="h5"
                                                fontWeight="bold"
                                                color={textColor}
                                                sx={{ mt: 1 }}
                                            >
                                                {maisXP?.nome}
                                            </Typography>

                                            <Typography
                                                color={subTextColor}
                                            >
                                                {maisXP?.xp} XP
                                            </Typography>

                                        </Paper>

                                        {/* MAIS PESADOS */}
                                        <Paper
                                            sx={{
                                                p: 2.5,
                                                borderRadius: 4,
                                                bgcolor:
                                                    "rgba(255,82,82,0.08)",
                                                border:
                                                    "1px solid rgba(255,82,82,0.2)",
                                            }}
                                        >

                                            <Typography
                                                color="#ff5252"
                                                fontWeight="bold"
                                            >
                                                🔥 MAIS ITENS PESADOS
                                            </Typography>

                                            <Typography
                                                variant="h5"
                                                fontWeight="bold"
                                                color={textColor}
                                                sx={{ mt: 1 }}
                                            >
                                                {maisPesados?.nome}
                                            </Typography>

                                            <Typography
                                                color={subTextColor}
                                            >
                                                {maisPesados?.pontosPesados} itens pesados
                                            </Typography>

                                        </Paper>

                                        {/* ALERTA */}
                                        <Paper
                                            sx={{
                                                p: 2.5,
                                                borderRadius: 4,
                                                bgcolor:
                                                    "rgba(255,0,0,0.06)",
                                                border:
                                                    "1px solid rgba(255,0,0,0.15)",
                                            }}
                                        >

                                            <Typography
                                                color="#ff5252"
                                                fontWeight="bold"
                                            >
                                                ⚠️ ALERTA OPERACIONAL
                                            </Typography>

                                            <Typography
                                                color={textColor}
                                                sx={{ mt: 1 }}
                                            >
                                                {
                                                    totalErros > 50
                                                        ? "Equipe apresentou alto índice de divergências."
                                                        : "Operação dentro da normalidade."
                                                }
                                            </Typography>

                                        </Paper>

                                    </Stack>

                                </Paper>

                            </Grid>

                        </Grid>

                    </Grid>

                    {/* ===================================== */}
                    {/* PERFORMANCE + QUALIDADE */}
                    {/* ===================================== */}
                    <Grid item xs={12}>

                        <Grid container spacing={3}>

                            {/* ===================================== */}
                            {/* PERFORMANCE OPERACIONAL */}
                            {/* ===================================== */}
                            <Grid item xs={12} lg={6}>

                                <Paper
                                    sx={{
                                        ...glassStyle,
                                        p: 3,
                                        height: 600,
                                        display: "flex",
                                        flexDirection: "column",
                                    }}
                                >

                                    <Box
                                        sx={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            mb: 3,
                                        }}
                                    >

                                        <Box>

                                            <Typography
                                                variant="h5"
                                                fontWeight="bold"
                                                color={textColor}
                                            >
                                                📈 Performance operacional
                                            </Typography>

                                            <Typography
                                                color={subTextColor}
                                                variant="body2"
                                            >
                                                Pontuação líquida da equipe
                                            </Typography>

                                        </Box>

                                        <Chip
                                            label="Tempo real"
                                            color="success"
                                            sx={{ ml: 2 }}
                                        />

                                    </Box>

                                    <Box
                                        sx={{
                                            flex: 1,
                                        }}
                                    >

                                        <ResponsiveContainer
                                            width="100%"
                                            height="100%"
                                        >

                                            <BarChart
                                                data={dados}
                                                margin={{
                                                    top: 10,
                                                    right: 20,
                                                    left: 0,
                                                    bottom: 10,
                                                }}
                                            >

                                                <CartesianGrid
                                                    strokeDasharray="3 3"
                                                    stroke={
                                                        dark
                                                            ? "rgba(255,255,255,0.08)"
                                                            : "#ddd"
                                                    }
                                                />

                                                <XAxis
                                                    dataKey="nome"
                                                    stroke={
                                                        dark
                                                            ? "#fff"
                                                            : "#555"
                                                    }
                                                    tick={{
                                                        fill:
                                                            dark
                                                                ? "#fff"
                                                                : "#555",
                                                    }}
                                                />

                                                <YAxis
                                                    stroke={
                                                        dark
                                                            ? "#fff"
                                                            : "#555"
                                                    }
                                                    tick={{
                                                        fill:
                                                            dark
                                                                ? "#fff"
                                                                : "#555",
                                                    }}
                                                />

                                                <Tooltip
                                                    contentStyle={{
                                                        background:
                                                            dark
                                                                ? "#111"
                                                                : "#fff",

                                                        border:
                                                            "1px solid rgba(255,255,255,0.1)",

                                                        borderRadius: 12,
                                                    }}
                                                />

                                                <Bar
                                                    dataKey="pontosFinais"
                                                    fill="#00ff99"
                                                    radius={[10, 10, 0, 0]}
                                                />

                                                <Bar
                                                    dataKey="descontos"
                                                    fill="#ff5252"
                                                    radius={[10, 10, 0, 0]}
                                                />

                                            </BarChart>

                                        </ResponsiveContainer>

                                    </Box>

                                </Paper>

                            </Grid>

                            {/* ===================================== */}
                            {/* QUALIDADE */}
                            {/* ===================================== */}
                            <Grid item xs={12} lg={6}>

                                <Paper
                                    sx={{
                                        ...glassStyle,
                                        p: 3,
                                        height: 600,
                                        width: 800,
                                        display: "flex",
                                        flexDirection: "column",
                                    }}
                                >

                                    <Box
                                        sx={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            mb: 2,
                                            flexWrap: "wrap",
                                            gap: 2,
                                        }}
                                    >

                                        <Box>

                                            <Typography
                                                variant="h5"
                                                fontWeight="bold"
                                                color={textColor}
                                            >
                                                🎯 Índice de qualidade operacional
                                            </Typography>

                                            <Typography
                                                variant="body2"
                                                color={subTextColor}
                                            >
                                                Relação entre produtividade e divergências
                                            </Typography>

                                        </Box>

                                        <Chip
                                            label={`${(
                                                (
                                                    totalPontos /
                                                    (
                                                        totalPontos +
                                                        (totalErros * 15 || 1)
                                                    )
                                                ) * 100
                                            ).toFixed(1)}% assertividade`}
                                            color="success"
                                            sx={{
                                                fontWeight: "bold",
                                                fontSize: 14,
                                                height: 36,
                                            }}
                                        />

                                    </Box>

                                    <Box
                                        sx={{
                                            flex: 1,
                                            width: "100%",
                                        }}
                                    >

                                        <ResponsiveContainer
                                            width="100%"
                                            height="100%"
                                        >

                                            <PieChart>

                                                <Pie
                                                    data={[
                                                        {
                                                            name: "Pontos positivos",
                                                            value: totalPontos,
                                                        },
                                                        {
                                                            name: "Pontos negativos",
                                                            value: totalErros * 15,
                                                        },
                                                    ]}
                                                    dataKey="value"
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={90}
                                                    outerRadius={170}
                                                    paddingAngle={5}
                                                    labelLine={false}
                                                    label={({ name, percent }) =>
                                                        `${name} ${(
                                                            percent * 100
                                                        ).toFixed(0)}%`
                                                    }
                                                >

                                                    <Cell fill="#00ff99" />

                                                    <Cell fill="#ff5252" />

                                                </Pie>

                                                <Tooltip
                                                    contentStyle={{
                                                        background: dark
                                                            ? "#111"
                                                            : "#fff",

                                                        border:
                                                            "1px solid rgba(255,255,255,0.1)",

                                                        borderRadius: 12,

                                                        color: "#fff",
                                                    }}
                                                />

                                            </PieChart>

                                        </ResponsiveContainer>

                                    </Box>

                                    {/* RESUMO */}
                                    <Grid
                                        container
                                        spacing={2}
                                        sx={{ mt: 1 }}
                                    >

                                        <Grid item xs={6}>

                                            <Paper
                                                sx={{
                                                    p: 2,
                                                    borderRadius: 3,
                                                    bgcolor:
                                                        "rgba(0,255,120,0.08)",

                                                    border:
                                                        "1px solid rgba(0,255,120,0.15)",
                                                }}
                                            >

                                                <Typography
                                                    color="#00ff99"
                                                    fontWeight="bold"
                                                >
                                                    ✅ Acertos
                                                </Typography>

                                                <Typography
                                                    variant="h5"
                                                    fontWeight="bold"
                                                    color={textColor}
                                                >
                                                    {totalPontos}
                                                </Typography>

                                            </Paper>

                                        </Grid>

                                        <Grid item xs={6}>

                                            <Paper
                                                sx={{
                                                    p: 2,
                                                    borderRadius: 3,
                                                    bgcolor:
                                                        "rgba(255,0,0,0.08)",

                                                    border:
                                                        "1px solid rgba(255,0,0,0.15)",
                                                }}
                                            >

                                                <Typography
                                                    color="#ff5252"
                                                    fontWeight="bold"
                                                >
                                                    ❌ Erros
                                                </Typography>

                                                <Typography
                                                    variant="h5"
                                                    fontWeight="bold"
                                                    color={textColor}
                                                >
                                                    {totalErros * 15}
                                                </Typography>

                                            </Paper>

                                        </Grid>

                                    </Grid>

                                </Paper>

                            </Grid>

                        </Grid>

                    </Grid>

                </Grid>

            )}

            {/* ===================================== */}
            {/* ARENA */}
            {/* ===================================== */}
            {tab === 2 && (

                <Grid
                    container
                    spacing={3}
                >

                    {dados.map((row, index) => {

                        const nivel =
                            obterNivel(
                                Number(
                                    row.xp
                                ), row.itens,
                                row.pontosFinais,
                                row.produtividade,
                                row.errosCaixa
                            );

                        return (

                            <Grid
                                item
                                xs={12}
                                md={6}
                                lg={4}
                                key={row.conferente}
                            >

                                <motion.div
                                    whileHover={{
                                        scale: 1.03,
                                        y: -5,
                                    }}
                                    transition={{
                                        type: "spring",
                                        stiffness: 300,
                                    }}
                                >
                                    <Paper
                                        sx={{
                                            ...glassStyle,

                                            position: "relative",

                                            overflow: "visible",

                                            pt: 10,
                                            p: 3,

                                            border: `1px solid ${nivel.cor}55`,

                                            background: dark
                                                ? `
                linear-gradient(
                    180deg,
                    ${nivel.cor}18 0%,
                    #111 40%
                )
            `
                                                : "#fff",

                                            boxShadow: `
            0 0 20px ${nivel.cor}22,
            0 0 50px ${nivel.cor}11
        `,
                                        }}
                                    >

                                        {/* GLOW TOPO */}
                                        <Box
                                            sx={{
                                                position: "absolute",

                                                top: -70,

                                                left: "50%",

                                                transform: "translateX(-50%)",

                                                width: 170,

                                                height: 170,

                                                borderRadius: "50%",

                                                background: `${nivel.cor}55`,

                                                filter: "blur(70px)",

                                                zIndex: 1,
                                            }}
                                        />

                                        {/* IMAGEM RANK */}
                                        <motion.div
                                            animate={{
                                                y: [0, -6, 0],
                                            }}
                                            transition={{
                                                duration: 3,
                                                repeat: Infinity,
                                            }}
                                            style={{
                                                position: "absolute",
                                                top: -75,
                                                transform: "translateX(-50%)",
                                                zIndex: 20,
                                            }}
                                        >
                                            <Box
                                                component="img"
                                                src={nivel.imagem}
                                                alt={nivel.nome}
                                                sx={{
                                                    width: 100,
                                                    height: 100,
                                                    objectFit: "contain",

                                                    filter: `
                    drop-shadow(0 0 12px ${nivel.cor})
                    drop-shadow(0 0 30px ${nivel.cor})
                `,
                                                }}
                                            />

                                            <Typography
                                                sx={{
                                                    textAlign: "center",

                                                    mt: -1,

                                                    fontWeight: 900,

                                                    letterSpacing: 2,

                                                    fontSize: 18,

                                                    color: nivel.cor,

                                                    textShadow: `
                    0 0 10px ${nivel.cor},
                    0 0 20px ${nivel.cor}
                `,
                                                }}
                                            >
                                                {nivel.nome}
                                            </Typography>
                                        </motion.div>

                                        {/* CONTEÚDO */}
                                        <Box
                                            sx={{
                                                mt: 5,
                                            }}
                                        >

                                            <Box
                                                sx={{
                                                    display: "flex",
                                                    justifyContent: "space-between",
                                                    alignItems: "center",
                                                }}
                                            >

                                                <Avatar
                                                    sx={{
                                                        width: 80,
                                                        height: 80,

                                                        bgcolor: "#111",

                                                        border: `3px solid ${nivel.cor}`,

                                                        color: "#fff",

                                                        fontWeight: "bold",

                                                        fontSize: 28,

                                                        boxShadow: `
                        0 0 15px ${nivel.cor}
                    `,
                                                    }}
                                                >
                                                    {index + 1}
                                                </Avatar>

                                                <Chip
                                                    icon={<MilitaryTechIcon />}
                                                    label={`${row.xp} XP`}
                                                    sx={{
                                                        ml: 2,
                                                        bgcolor: `${nivel.cor}22`,
                                                        color: nivel.cor,
                                                        border: `1px solid ${nivel.cor}55`,
                                                        fontWeight: "bold",
                                                    }}
                                                />

                                            </Box>

                                            <Typography
                                                variant="h5"
                                                fontWeight="bold"
                                                color={textColor}
                                                sx={{
                                                    mt: 2,
                                                }}
                                            >
                                                {row.nome}
                                            </Typography>

                                            <Divider
                                                sx={{
                                                    my: 2,
                                                    borderColor: `${nivel.cor}33`,
                                                }}
                                            />

                                            <Stack
                                                spacing={1}
                                            >

                                                <Chip
                                                    label={`🏆 ${row.pontosFinais} pontos`}
                                                    color="warning"
                                                    sx={{ color: 'primary.branco' }}
                                                />

                                                <Chip
                                                    label={`📦 ${row.itens} itens`}
                                                    sx={{ color: 'primary.branco' }}
                                                />

                                                <Chip
                                                    label={`⚡ ${row.produtividade}% precisão`}
                                                    color="success"
                                                    sx={{ color: 'primary.branco' }}
                                                />

                                                <Chip
                                                    label={`🔥 ${row.pontosPesados} itens pesados`}
                                                    color="error"
                                                    sx={{ color: 'primary.branco' }}
                                                />

                                            </Stack>

                                            {/* ACHIEVEMENTS */}
                                            <Box
                                                sx={{
                                                    mt: 3,
                                                }}
                                            >

                                                <Typography
                                                    fontWeight="bold"
                                                    color={textColor}
                                                    sx={{
                                                        mb: 1,
                                                    }}
                                                >
                                                    🎖️ Conquistas
                                                </Typography>

                                                <Stack
                                                    spacing={1}
                                                >

                                                    {row.itens >= 1000 && row.itens <= 2999 && (
                                                        <Chip
                                                            label="🥉 1000 itens"
                                                            color="warning"
                                                            sx={{ color: 'primary.branco' }}
                                                        />
                                                    )}

                                                    {row.itens >= 3000 && row.itens <= 4999 && (
                                                        <Chip
                                                            label="🥈 3000 itens"
                                                            color="warning"
                                                            sx={{ color: 'primary.branco' }}
                                                        />
                                                    )}

                                                    {row.itens >= 5000 && row.itens <= 9999 && (
                                                        <Chip
                                                            label="🥇 5000 itens"
                                                            color="warning"
                                                            sx={{ color: 'primary.branco' }}
                                                        />
                                                    )}

                                                    {row.itens >= 10000 && (
                                                        <Chip
                                                            label="🏆 10000 itens"
                                                            color="warning"
                                                            sx={{ color: 'primary.branco' }}
                                                        />
                                                    )}

                                                    {row.errosCaixa === 0 && (
                                                        <Chip
                                                            label="🐐 G.O.A.T"
                                                            color="success"
                                                            sx={{ color: 'primary.branco' }}
                                                        />
                                                    )}

                                                    {row.pontosFinais >= 1000 && row.pontosFinais <= 3000 && (
                                                        <Chip
                                                            label="🔥 1000 pontos"
                                                            color="error"
                                                            sx={{ color: 'primary.branco' }}
                                                        />
                                                    )}

                                                    {row.pontosFinais >= 5000 && row.pontosFinais <= 9999 && (
                                                        <Chip
                                                            label="🚀 5000 pontos"
                                                            color="error"
                                                            sx={{ color: 'primary.branco' }}
                                                        />
                                                    )}

                                                    {row.pontosFinais >= 10000 && row.pontosFinais <= 14999 && (
                                                        <Chip
                                                            label="🌟 10000 pontos"
                                                            color="error"
                                                            sx={{ color: 'primary.branco' }}
                                                        />
                                                    )}

                                                    {row.pontosFinais >= 15000 && row.pontosFinais <= 29999 && (
                                                        <Chip
                                                            label="👑 15000 pontos"
                                                            color="error"
                                                            sx={{ color: 'primary.branco' }}
                                                        />
                                                    )}

                                                    {row.pontosFinais >= 30000 && (
                                                        <Chip
                                                            label="🌩️ Zeus"
                                                            color="info"
                                                            sx={{ color: 'primary.branco' }}
                                                        />
                                                    )}

                                                    {row.produtividade >= 98 && (
                                                        <Chip
                                                            label="🎯 Precisão absurda"
                                                            color="info"
                                                            sx={{ color: 'primary.branco' }}
                                                        />
                                                    )}

                                                    {row.pontosPesados >= 500 && (
                                                        <Chip
                                                            label="🚜 Trator humano"
                                                            sx={{
                                                                bgcolor: "#1ac723",
                                                                color: "#fff",
                                                                fontWeight: "bold",
                                                            }}
                                                        />
                                                    )}

                                                    {row.errosCaixa <= 5 && row.produtividade > 0 && (
                                                        <Chip
                                                            label="🏹 Sem vacilo"
                                                            sx={{
                                                                bgcolor: "#20c766",
                                                                color: "#fff",
                                                                fontWeight: "bold",
                                                            }}
                                                        />
                                                    )}

                                                    {row.pontosFinais >= 30000 &&
                                                        row.pontosPesados >= 500 &&
                                                        row.errosCaixa <= 3 &&
                                                        row.produtividade >= 99 && (
                                                            <Chip
                                                                label="🔮 MÍSTICO"
                                                                sx={{
                                                                    background:
                                                                        "linear-gradient(45deg, #4a148c, #7b1fa2, #ba68c8)",
                                                                    color: "#fff",
                                                                    fontWeight: "bold",
                                                                    border: "2px solid #d1a3ff",
                                                                    boxShadow: "0 0 18px rgba(186,104,200,0.9)",
                                                                    animation: "pulse 1.5s infinite",
                                                                    textShadow: "0 0 8px rgba(255,255,255,0.6)",
                                                                }}
                                                            />
                                                        )}

                                                </Stack>

                                            </Box>
                                        </Box>
                                    </Paper>

                                </motion.div>

                            </Grid>

                        );

                    })}

                </Grid>

            )
            }

            {/* ===================================== */}
            {/* MODAL */}
            {/* ===================================== */}
            <Dialog
                open={openDetalhes}
                onClose={() =>
                    setOpenDetalhes(false)
                }
                maxWidth="lg"
                fullWidth
                PaperProps={{
                    sx: {
                        bgcolor:
                            dark
                                ? "#111"
                                : "#fff",

                        color:
                            dark
                                ? "#fff"
                                : "#000",

                        borderRadius: 4,
                    },
                }}
            >

                <DialogTitle>

                    📦 Itens conferidos — {nomeSelecionado}

                    <IconButton
                        onClick={() =>
                            setOpenDetalhes(false)
                        }
                        sx={{
                            position: "absolute",
                            right: 10,
                            top: 10,
                            color: "#fff",
                        }}
                    >
                        <CloseIcon />
                    </IconButton>

                </DialogTitle>

                <DialogContent dividers>

                    <Paper
                        sx={{
                            p: 3,
                            borderRadius: 4,
                            mb: 3,
                            bgcolor: dark ? "#1b1b1b" : "#f5f5f5",
                        }}
                    >

                        <Typography
                            variant="h6"
                            fontWeight="bold"
                            color={textColor}
                            sx={{ mb: 3 }}
                        >
                            📊 Explicação da pontuação
                        </Typography>

                        <Grid container spacing={2}>

                            {/* LADO ESQUERDO */}
                            <Grid item xs={12} md={4}>

                                {/* Divergência de caixas */}
                                <Typography
                                    color="error.main"
                                    sx={{ fontWeight: "bold" }}
                                >
                                    Divergência de caixa = -30 pts
                                </Typography>

                            </Grid>

                            {/* LADO DIREITO */}
                            <Grid item xs={12} md={8}>

                                <Typography
                                    variant="subtitle1"
                                    fontWeight="bold"
                                    color={textColor}
                                    sx={{ mb: 2 }}
                                >
                                    Categorias de itens
                                </Typography>

                                <Grid container spacing={2}>

                                    {/* PESADOS */}
                                    <Grid item xs={12} md={6}>
                                        <Box
                                            sx={{
                                                p: 2,
                                                borderRadius: 3,
                                                bgcolor: dark ? "#262626" : "#fff",
                                                border: "1px solid",
                                                borderColor: dark ? "#333" : "#ddd",
                                                height: "100%",
                                            }}
                                        >
                                            <Typography
                                                fontWeight="bold"
                                                color="#ff9800"
                                                sx={{ mb: 1 }}
                                            >
                                                🏋️ Pesados — 10 pts
                                            </Typography>

                                            <Typography variant="body2" color={textColor}>
                                                Balança, Bandeja, Braço oscilante,
                                                Semi eixo, Deslizante, Amortecedor,
                                                Comando de válvula, Caixa de direção,
                                                Homocinética completa, Kit embreagem,
                                                Radiador, Disco, Tampa de válvula, Carter
                                            </Typography>
                                        </Box>
                                    </Grid>

                                    {/* MÉDIO/PESADO */}
                                    <Grid item xs={12} md={6}>
                                        <Box
                                            sx={{
                                                p: 2,
                                                borderRadius: 3,
                                                bgcolor: dark ? "#262626" : "#fff",
                                                border: "1px solid",
                                                borderColor: dark ? "#333" : "#ddd",
                                                height: "100%",
                                            }}
                                        >
                                            <Typography
                                                fontWeight="bold"
                                                color="#ab47bc"
                                                sx={{ mb: 1 }}
                                            >
                                                ⚙️ Médio/Pesado — 7 pts
                                            </Typography>

                                            <Typography variant="body2" color={textColor}>
                                                Junta homocinética, Tulipa com trizeta,
                                                Jogo de Pistão, Pastilha de freio,
                                                Sapata de freio, Lona de freio
                                            </Typography>
                                        </Box>
                                    </Grid>

                                    {/* MÉDIOS */}
                                    <Grid item xs={12}>
                                        <Box
                                            sx={{
                                                p: 2,
                                                borderRadius: 3,
                                                bgcolor: dark ? "#262626" : "#fff",
                                                border: "1px solid",
                                                borderColor: dark ? "#333" : "#ddd",
                                            }}
                                        >
                                            <Typography
                                                fontWeight="bold"
                                                color="#2196f3"
                                                sx={{ mb: 1 }}
                                            >
                                                📦 Médios — 5 pts
                                            </Typography>

                                            <Typography variant="body2" color={textColor}>
                                                Mangueira, Cilindro, Coxim, Pivô,
                                                Cabo de vela, Cabo de embreagem, Cabo de freio,
                                                Junta de cabeçote, Junta de tampa de válvula
                                                Bomba de óleo, Bomba de água
                                                Carcaça de válvula termostática, Antichama,
                                                Tubo, Reservatório, Kit correia,
                                                Kit parafuso,
                                                Terminal de direção, Barra axial
                                            </Typography>
                                        </Box>
                                    </Grid>

                                    {/* LEVES */}
                                    <Grid item xs={12}>
                                        <Box
                                            sx={{
                                                p: 2,
                                                borderRadius: 3,
                                                bgcolor: dark ? "#262626" : "#fff",
                                                border: "1px solid",
                                                borderColor: dark ? "#333" : "#ddd",
                                            }}
                                        >
                                            <Typography
                                                fontWeight="bold"
                                                color="#4caf50"
                                                sx={{ mb: 1 }}
                                            >
                                                🍃 Leves — 2 pts
                                            </Typography>

                                            <Typography variant="body2" color={textColor}>
                                                Todos os itens que não entram
                                                nas categorias acima.
                                            </Typography>
                                        </Box>

                                    </Grid>
                                </Grid>

                            </Grid>

                        </Grid>

                    </Paper>

                    <TableContainer
                        component={Paper}
                        sx={{
                            borderRadius: 4,
                            bgcolor:
                                dark
                                    ? "#1b1b1b"
                                    : "#fff",
                        }}
                    >

                        <Table>

                            <TableHead>

                                <TableRow>

                                    <TableCell sx={{ color: "#fff" }}>
                                        Item
                                    </TableCell>

                                    <TableCell sx={{ color: "#fff" }}>
                                        Quantidade
                                    </TableCell>

                                    <TableCell sx={{ color: "#fff" }}>
                                        Regra
                                    </TableCell>

                                    <TableCell sx={{ color: "#fff" }}>
                                        Resultado
                                    </TableCell>

                                </TableRow>

                            </TableHead>

                            <TableBody>

                                {detalhesSelecionados.map(
                                    (item, index) => (

                                        <TableRow
                                            key={index}
                                        >

                                            <TableCell>

                                                <Typography
                                                    fontWeight="bold"
                                                    color={textColor}
                                                >
                                                    {item.codigo}
                                                </Typography>

                                                <Typography
                                                    variant="caption"
                                                    color={subTextColor}
                                                >
                                                    {item.tipo}
                                                </Typography>

                                                <Typography
                                                    fontWeight="bold"
                                                    color={textColor}
                                                >
                                                    {item.localizacao}
                                                </Typography>

                                            </TableCell>

                                            <TableCell>

                                                <Typography color={textColor}>
                                                    {item.quantidade}x
                                                </Typography>

                                            </TableCell>

                                            <TableCell >

                                                {!item.erro ? (

                                                    <Typography color={textColor}>

                                                        {item.quantidade}
                                                        {" x "}
                                                        {item.pontosUnitario}
                                                        {" pts"}

                                                    </Typography>

                                                ) : (

                                                    <Typography color="error.main">
                                                        Caixa {item.caixaItem}
                                                    </Typography>

                                                )}

                                            </TableCell>

                                            <TableCell>

                                                <Chip
                                                    label={
                                                        item.erro
                                                            ? "-30 pts"
                                                            : `+${item.pontosTotal} pts`
                                                    }
                                                    color={
                                                        item.erro
                                                            ? "error"
                                                            : "success"
                                                    }
                                                />

                                            </TableCell>

                                        </TableRow>

                                    )
                                )}

                            </TableBody>

                        </Table>

                    </TableContainer>

                </DialogContent>

            </Dialog>

            <Dialog
                open={openRanks}
                onClose={() => setOpenRanks(false)}
                maxWidth="lg"
                fullWidth
                PaperProps={{
                    sx: {
                        background: "#0a0a0a",
                        border: "1px solid #333",
                        borderRadius: 4,
                        overflow: "hidden",
                    },
                }}
            >

                <DialogTitle
                    sx={{
                        color: "#fff",
                        fontWeight: "bold",
                        fontSize: 32,
                        textAlign: "center",
                        background:
                            "linear-gradient(90deg,#111,#1a1a1a,#111)",
                    }}
                >
                    🏆 SISTEMA DE RANKS
                </DialogTitle>

                <DialogContent
                    sx={{
                        p: 0,
                        bgcolor: "#0a0a0a",
                    }}
                >

                    {/* BANNER */}
                    <Box
                        component="img"
                        src="/ranks/banner-ranks.png"
                        onClick={() =>
                            setImagemFullscreen(true)
                        }
                        sx={{
                            width: "100%",
                            borderRadius: 3,
                            cursor: "zoom-in",

                            transition: "0.25s",

                            "&:hover": {
                                transform: "scale(1.02)",
                            },
                        }}
                    />

                    {/* EXPLICAÇÃO */}
                    <Box sx={{ p: 4 }}>

                        <Typography
                            variant="h4"
                            fontWeight="bold"
                            color="#fff"
                            mb={2}
                        >
                            COMO SUBIR DE RANK
                        </Typography>

                        <Typography
                            sx={{
                                color: "#ccc",
                                fontSize: 18,
                                lineHeight: 1.8,
                            }}
                        >
                            Você ganha XP conferindo itens,
                            mantendo alta precisão e evitando
                            erros de caixa.
                        </Typography>

                        <Typography
                            sx={{
                                color: "#ccc",
                                fontSize: 18,
                                lineHeight: 1.8,
                                mt: 2,
                            }}
                        >
                            Quanto maior a dificuldade do item,
                            mais XP você recebe.
                        </Typography>

                    </Box>

                    {/* FORMAS DE GANHAR XP */}
                    <Box sx={{ px: 4, pb: 4 }}>

                        <Typography
                            variant="h5"
                            fontWeight="bold"
                            color="#fff"
                            mb={3}
                        >
                            ⚡ COMO GANHAR XP
                        </Typography>

                        <Grid container spacing={2}>

                            <Grid item xs={12} md={6}>
                                <Paper
                                    sx={{
                                        p: 3,
                                        bgcolor: "#111",
                                        border:
                                            "1px solid #00ff88",
                                    }}
                                >
                                    <Typography
                                        color="#00ff88"
                                        fontWeight="bold"
                                        mb={1}
                                    >
                                        📦 Conferir itens
                                    </Typography>

                                    <Typography color="#ccc">
                                        Cada item conferido gera XP.
                                    </Typography>
                                </Paper>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <Paper
                                    sx={{
                                        p: 3,
                                        bgcolor: "#111",
                                        border:
                                            "1px solid #ffcc00",
                                    }}
                                >
                                    <Typography
                                        color="#ffcc00"
                                        fontWeight="bold"
                                        mb={1}
                                    >
                                        🔥 Itens pesados
                                    </Typography>

                                    <Typography color="#ccc">
                                        Itens complexos dão muito mais XP.
                                    </Typography>
                                </Paper>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <Paper
                                    sx={{
                                        p: 3,
                                        bgcolor: "#111",
                                        border:
                                            "1px solid #00d5ff",
                                    }}
                                >
                                    <Typography
                                        color="#00d5ff"
                                        fontWeight="bold"
                                        mb={1}
                                    >
                                        🎯 Precisão
                                    </Typography>

                                    <Typography color="#ccc">
                                        Alta produtividade aumenta sua evolução.
                                    </Typography>
                                </Paper>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <Paper
                                    sx={{
                                        p: 3,
                                        bgcolor: "#111",
                                        border:
                                            "1px solid #ff4444",
                                    }}
                                >
                                    <Typography
                                        color="#ff4444"
                                        fontWeight="bold"
                                        mb={1}
                                    >
                                        ❌ Erros reduzem XP
                                    </Typography>

                                    <Typography color="#ccc">
                                        Divergências diminuem pontuação final.
                                    </Typography>
                                </Paper>
                            </Grid>

                        </Grid>

                    </Box>

                    {/* RANKS */}
                    <Box sx={{ px: 4, pb: 5 }}>

                        <Typography
                            variant="h5"
                            fontWeight="bold"
                            color="#fff"
                            mb={3}
                        >
                            🏅 PROGRESSÃO DE RANKS
                        </Typography>

                        <Stack spacing={2}>

                            <Chip
                                label="🥉 BRONZE — 0 XP"
                                sx={{
                                    bgcolor: "#7a4b22",
                                    color: "#fff",
                                    fontWeight: "bold",
                                }}
                            />

                            <Chip
                                label="🥈 PRATA — 30.000 XP"
                                sx={{
                                    bgcolor: "#9c9c9c",
                                    color: "#fff",
                                    fontWeight: "bold",
                                }}
                            />

                            <Chip
                                label="🥇 OURO — 70.000 XP"
                                sx={{
                                    bgcolor: "#d6a500",
                                    color: "#fff",
                                    fontWeight: "bold",
                                }}
                            />

                            <Chip
                                label="💎 DIAMANTE — 100.000 XP"
                                sx={{
                                    bgcolor: "#00bfff",
                                    color: "#fff",
                                    fontWeight: "bold",
                                }}
                            />

                            <Chip
                                label="🟢 ESMERALDA — 150.000 XP"
                                sx={{
                                    bgcolor: "#00b140",
                                    color: "#fff",
                                    fontWeight: "bold",
                                }}
                            />

                            <Chip
                                label="👑 MESTRE — 200.000 XP"
                                sx={{
                                    bgcolor: "#d10000",
                                    color: "#fff",
                                    fontWeight: "bold",
                                }}
                            />

                            <Chip
                                label="🦅 LENDÁRIO — 300.000 XP"
                                sx={{
                                    bgcolor: "#7b00ff",
                                    color: "#fff",
                                    fontWeight: "bold",
                                }}
                            />

                        </Stack>

                    </Box>

                </DialogContent>

            </Dialog>

            <Dialog
                open={imagemFullscreen}
                onClose={() =>
                    setImagemFullscreen(false)
                }
                fullScreen
                PaperProps={{
                    sx: {
                        bgcolor: "#000",
                    },
                }}
            >

                {/* BOTÃO FECHAR */}
                <IconButton
                    onClick={() =>
                        setImagemFullscreen(false)
                    }
                    sx={{
                        position: "absolute",
                        top: 20,
                        right: 20,
                        zIndex: 10,

                        bgcolor: "#00000099",
                        color: "#fff",

                        "&:hover": {
                            bgcolor: "#222",
                        },
                    }}
                >
                    <CloseIcon />
                </IconButton>

                {/* IMAGEM */}
                <Box
                    sx={{
                        width: "100%",
                        height: "100vh",

                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",

                        p: 4,
                    }}
                >

                    <Box
                        component="img"
                        src="/ranks/banner-ranks.png"
                        sx={{
                            maxWidth: "100%",
                            maxHeight: "100%",

                            objectFit: "contain",
                        }}
                    />

                </Box>

            </Dialog>

        </Container >

    );

}