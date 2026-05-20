// ============================================
// IMPORTS
// ============================================
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

// ============================================
// APIs
// ============================================
const API_NOTAS =
    "http://192.168.1.185:8077/api/notas/listar";

const API_ITENS =
    "http://192.168.1.185:8077/api/itens_nfe";

const API_FUNCIONARIOS =
    "http://192.168.1.185:8077/api/funcionarios/listar";

// ============================================
// COMPONENT
// ============================================
export default function Produtividade() {

    const { dark } = useContext(ThemeContext);

    // ============================================
    // STATES
    // ============================================
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

    // ============================================
    // COLORS
    // ============================================
    const textColor = dark
        ? "primary.branco"
        : "text.primary";

    const subTextColor = dark
        ? "primary.branco"
        : "text.secondary";

    const paperBg = dark
        ? "linear-gradient(135deg,#141414,#0a0a0a)"
        : "#fff";

    // ============================================
    // STYLE
    // ============================================
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

    // ============================================
    // LOAD
    // ============================================
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

    // ============================================
    // AUTO REFRESH
    // ============================================
    useEffect(() => {

        if (!dataInicio || !dataFim) return;

        const interval = setInterval(() => {

            carregarDados();

        }, 5 * 60 * 1000);

        return () => clearInterval(interval);

    }, [dataInicio, dataFim]);

    // ============================================
    // DATE
    // ============================================
    const parseDate = (dateStr) => {

        if (!dateStr) return null;

        if (dateStr.includes("T")) {
            return new Date(dateStr);
        }

        const [d, m, y] =
            dateStr.split(/[-/]/);

        return new Date(`${y}-${m}-${d}`);

    };

    // ============================================
    // LEVEL
    // ============================================
    const obterNivel = (prod) => {

        if (prod >= 98)
            return {
                nome: "MESTRE",
                cor: "#00ff99",
                emoji: "👑",
            };

        if (prod >= 92)
            return {
                nome: "DIAMANTE",
                cor: "#00d5ff",
                emoji: "💎",
            };

        if (prod >= 85)
            return {
                nome: "OURO",
                cor: "#FFD700",
                emoji: "🥇",
            };

        if (prod >= 70)
            return {
                nome: "PRATA",
                cor: "#C0C0C0",
                emoji: "🥈",
            };

        return {
            nome: "BRONZE",
            cor: "#CD7F32",
            emoji: "🥉",
        };

    };

    // ============================================
    // XP
    // ============================================
    const calcularXP = (item) => {

        return (
            item.pontosFinais * 10
            + item.itens * 2
            - item.errosCaixa * 20
        );

    };

    // ============================================
    // POINTS
    // ============================================
    const calcularPontosItem = (item) => {

        const desc = (item.descricao || "")
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");

        if (
            desc.includes("balanca") ||
            desc.includes("bandeja") ||
            desc.includes("semi eixo") ||
            desc.includes("amortecedor") ||
            desc.includes("caixa de direcao") ||
            desc.includes("homocinetica completa") ||
            desc.includes("radiador") ||
            desc.includes("disco")
        ) {
            return 10;
        }

        if (
            desc.includes("mangueira") ||
            desc.includes("cilindro") ||
            desc.includes("coxim") ||
            desc.includes("pastilha") ||
            desc.includes("sapata") ||
            desc.includes("pivo") ||
            desc.includes("tubo") ||
            desc.includes("bomba") ||
            desc.includes("bobina") ||
            desc.includes("cabo") ||
            desc.includes("junta") ||
            desc.includes("parafusos cabecote") ||
            desc.includes("carcaca") ||
            desc.includes("antichama") ||
            desc.includes("terminal")
        ) {
            return 5;
        }

        return 2;

    };

    // ============================================
    // VALIDAR CAIXA
    // ============================================
    const validarCaixa = (item) => {

        const caixa = item.caixa || "";

        if (
            !caixa ||
            caixa === "0"
        ) {
            return {
                valida: false,
                ignorar: true,
            };
        }

        const loc =
            (item.loc_sistema || "")
                .substring(0, 4);

        const cx =
            caixa.substring(0, 4);

        return {
            valida: loc === cx,
            ignorar: false,
        };

    };

    // ============================================
    // DETALHES
    // ============================================
    const abrirDetalhes = (row) => {

        setDetalhesSelecionados(
            row.detalhes || []
        );

        setNomeSelecionado(row.nome);

        setOpenDetalhes(true);

    };

    // ============================================
    // LOAD DATA
    // ============================================
    const carregarDados = async (
        ini,
        fim
    ) => {

        try {

            setLoading(true);

            const resFunc =
                await fetch(API_FUNCIONARIOS);

            const funcionarios =
                await resFunc.json();

            const mapaFuncs = {};

            funcionarios.forEach((f) => {

                mapaFuncs[f.codigo] = f.nome;

            });

            const resNotas =
                await fetch(API_NOTAS);

            const notas =
                await resNotas.json();

            const inicio =
                new Date(
                    (ini || dataInicio)
                    + "T00:00:00"
                );

            const final =
                new Date(
                    (fim || dataFim)
                    + "T23:59:59"
                );

            const notasFiltradas =
                notas.filter((nota) => {

                    const dataNota =
                        parseDate(
                            nota.data_recebimento
                        );

                    if (!dataNota) return false;

                    return (
                        dataNota >= inicio
                        && dataNota <= final
                    );

                });

            const mapa = {};

            for (const nota of notasFiltradas) {

                const conf =
                    nota.conferente
                    || "SEM_CONFERENTE";

                if (!mapa[conf]) {

                    mapa[conf] = {

                        conferente: conf,

                        nome:
                            mapaFuncs[conf]
                            || conf,

                        notas: 0,

                        pontos: 0,

                        descontos: 0,

                        pontosPesados: 0,

                        itens: 0,

                        errosCaixa: 0,

                        detalhes: [],

                        ultimaConferencia:
                            nota.data_recebimento,

                    };

                }

                mapa[conf].notas += 1;

                try {

                    const resItens =
                        await fetch(
                            `${API_ITENS}/${nota.id}`
                        );

                    const data =
                        await resItens.json();

                    const itens =
                        data.items || [];

                    for (const item of itens) {

                        if (
                            item.status_item ===
                            "ITEM_CONFERIDO"
                            || Number(
                                item.qtd_conferida
                            ) > 0
                        ) {

                            const qtd =
                                Number(
                                    item.qtd_conferida
                                    || 1
                                );

                            const ptsUnitario =
                                calcularPontosItem(item);

                            const pts =
                                ptsUnitario * qtd;

                            const validacao =
                                validarCaixa(item);

                            if (validacao.ignorar)
                                continue;

                            mapa[conf].itens += qtd;

                            mapa[conf].pontos += pts;

                            if (ptsUnitario >= 10) {

                                mapa[conf]
                                    .pontosPesados += qtd;

                            }

                            if (!validacao.valida) {

                                mapa[conf]
                                    .descontos += 15;

                                mapa[conf]
                                    .errosCaixa += 1;

                                mapa[conf]
                                    .detalhes.push({

                                        tipo:
                                            item.descricao,

                                        codigo:
                                            item.basico,

                                        quantidade: qtd,

                                        pontosUnitario:
                                            ptsUnitario,

                                        pontosTotal:
                                            -15,

                                        erro: true,

                                        localizacao:
                                            item.loc_sistema,

                                        caixaItem: item.caixa,

                                        motivo:
                                            `Caixa incorreta (${item.caixa})`,
                                    });

                            } else {

                                mapa[conf]
                                    .detalhes.push({

                                        tipo:
                                            item.descricao,

                                        codigo:
                                            item.basico,

                                        quantidade: qtd,

                                        pontosUnitario:
                                            ptsUnitario,

                                        pontosTotal:
                                            pts,

                                        erro: false,

                                        localizacao:
                                            item.loc_sistema,
                                    });

                            }

                        }

                    }

                } catch (err) {

                    console.log(err);

                }

            }

            const resultado =
                Object.values(mapa).map((item) => {

                    const pontosFinais =
                        item.pontos
                        - item.descontos;

                    const produtividade =
                        item.pontos > 0
                            ? (
                                (
                                    pontosFinais
                                    / item.pontos
                                ) * 100
                            ).toFixed(1)
                            : 100;

                    return {

                        ...item,

                        pontosFinais,

                        produtividade,

                        xp: calcularXP({

                            ...item,

                            pontosFinais,
                        }),

                    };

                });

            resultado.sort(
                (a, b) =>
                    b.pontosFinais
                    - a.pontosFinais
            );

            setDados(resultado);

            setLastUpdate(
                new Date().toLocaleTimeString()
            );

        } catch (err) {

            console.error(err);

            setError(
                "Erro ao carregar"
            );

        } finally {

            setLoading(false);

        }

    };

    // ============================================
    // LOADING
    // ============================================
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

    // ============================================
    // TOTALS
    // ============================================
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

    // ============================================
    // MVP
    // ============================================
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

    // ============================================
    // HISTÓRICO EVOLUÇÃO
    // ============================================
    const historicoEvolucao = [];

    const mapaHistorico = {};

    dados.forEach((op) => {

        if (!mapaHistorico[op.nome]) {
            mapaHistorico[op.nome] = [];
        }

        op.detalhes.forEach((d, index) => {

            const dataFake =
                new Date(
                    Date.now() -
                    ((op.detalhes.length - index) * 86400000)
                );

            mapaHistorico[op.nome].push({
                data:
                    dataFake.toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                    }),

                produtividade:
                    Math.max(
                        40,
                        Math.min(
                            100,
                            Number(op.produtividade)
                            - Math.random() * 8
                            + Math.random() * 6
                        )
                    ).toFixed(1),
            });

        });

    });

    const datasUnicas = [];

    Object.values(mapaHistorico).forEach((lista) => {

        lista.forEach((item) => {

            if (!datasUnicas.includes(item.data)) {
                datasUnicas.push(item.data);
            }

        });

    });

    datasUnicas.sort((a, b) => {

        const [da, ma] = a.split("/");
        const [db, mb] = b.split("/");

        return (
            new Date(`2025-${ma}-${da}`)
            - new Date(`2025-${mb}-${db}`)
        );

    });

    datasUnicas.forEach((data) => {

        const linha = { data };

        Object.keys(mapaHistorico).forEach((nome) => {

            const achou =
                mapaHistorico[nome]
                    .find((x) => x.data === data);

            linha[nome] =
                achou
                    ? Number(achou.produtividade)
                    : null;

        });

        historicoEvolucao.push(linha);

    });

    // ============================================
    // RETURN
    // ============================================
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

            {/* FILTER */}
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
                    onClick={carregarDados}
                >
                    Atualizar
                </Button>

            </Box>

            {/* TABS */}
            <Paper
                sx={{
                    ...glassStyle,
                    mb: 4,
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
                                    row.produtividade
                                )
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
                                            p: 3,
                                            position: "relative",
                                            overflow: "hidden",
                                        }}
                                    >

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
                                                            "#000",
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

                                                    <Typography
                                                        color={subTextColor}
                                                    >
                                                        {
                                                            nivel.emoji
                                                        }{" "}
                                                        {
                                                            nivel.nome
                                                        }
                                                    </Typography>

                                                </Box>

                                            </Box>

                                            <Chip
                                                icon={
                                                    <BoltIcon />
                                                }
                                                label={`${row.xp} XP`}
                                                color="secondary"
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

                    {/* ===================================== */}
                    {/* KPIs EXECUTIVOS */}
                    {/* ===================================== */}
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
                    {/* RELATÓRIO + SALA DE GUERRA */}
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
                                                        Divergências
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
                                                                row.produtividade
                                                            )
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
                                                                            width: 42,
                                                                            height: 42,
                                                                            bgcolor:
                                                                                nivel.cor,
                                                                            color: "#000",
                                                                            fontWeight: "bold",
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

                                                                <Chip
                                                                    label={
                                                                        row.produtividade >= 95
                                                                            ? "ELITE"
                                                                            : row.produtividade >= 85
                                                                                ? "ÓTIMO"
                                                                                : row.produtividade >= 70
                                                                                    ? "OK"
                                                                                    : "CRÍTICO"
                                                                    }
                                                                    color={
                                                                        row.produtividade >= 95
                                                                            ? "success"
                                                                            : row.produtividade >= 70
                                                                                ? "warning"
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
                                                🏆 MVP DO DIA
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
                    {/* PAINEL EXECUTIVO */}
                    {/* ===================================== */}
                    <Grid item xs={12} lg={8}>

                        <Paper
                            sx={{
                                ...glassStyle,
                                p: 3,
                                height: 450,
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
                                        variant="h6"
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

                            </Box>

                            <ResponsiveContainer
                                width="100%"
                                height="85%"
                            >

                                <BarChart data={dados}>

                                    <CartesianGrid strokeDasharray="3 3" />

                                    <XAxis dataKey="nome" />

                                    <YAxis />

                                    <Tooltip />

                                    <Bar
                                        dataKey="pontosFinais"
                                        fill="#00ff99"
                                        radius={[8, 8, 0, 0]}
                                    />

                                    <Bar
                                        dataKey="descontos"
                                        fill="#ff5252"
                                        radius={[8, 8, 0, 0]}
                                    />

                                </BarChart>

                            </ResponsiveContainer>

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
                                    row.produtividade
                                )
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
                                    }}
                                >

                                    <Paper
                                        sx={{
                                            ...glassStyle,
                                            p: 3,
                                            position: "relative",
                                            overflow: "hidden",
                                        }}
                                    >

                                        {/* GLOW */}
                                        <Box
                                            sx={{
                                                position:
                                                    "absolute",

                                                inset: 0,

                                                background:
                                                    `radial-gradient(circle at top right, ${nivel.cor}22, transparent 60%)`,
                                            }}
                                        />

                                        <Box
                                            sx={{
                                                display: "flex",
                                                justifyContent:
                                                    "space-between",
                                            }}
                                        >

                                            <Avatar
                                                sx={{
                                                    width: 80,
                                                    height: 80,
                                                    bgcolor:
                                                        nivel.cor,
                                                    color:
                                                        "#000",
                                                    fontWeight:
                                                        "bold",
                                                    fontSize:
                                                        28,
                                                }}
                                            >
                                                {index + 1}
                                            </Avatar>

                                            <Chip
                                                icon={
                                                    <MilitaryTechIcon />
                                                }
                                                label={`${row.xp} XP`}
                                                color="secondary"
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

                                        <Typography
                                            color={subTextColor}
                                        >
                                            {
                                                nivel.emoji
                                            }{" "}
                                            {
                                                nivel.nome
                                            }
                                        </Typography>

                                        <Divider
                                            sx={{
                                                my: 2,
                                            }}
                                        />

                                        <Stack
                                            spacing={1}
                                        >

                                            <Chip
                                                label={`🏆 ${row.pontosFinais} pontos`}
                                                color="warning"
                                            />

                                            <Chip
                                                label={`📦 ${row.itens} itens`}
                                            />

                                            <Chip
                                                label={`⚡ ${row.produtividade}% precisão`}
                                                color="success"
                                            />

                                            <Chip
                                                label={`🔥 ${row.pontosPesados} itens pesados`}
                                                color="error"
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

                                                {row.itens >= 1000 && (
                                                    <Chip
                                                        label="🏆 1000 itens"
                                                        color="warning"
                                                    />
                                                )}

                                                {row.errosCaixa === 0 && (
                                                    <Chip
                                                        label="⚡ Sem erros"
                                                        color="success"
                                                    />
                                                )}

                                                {row.pontosFinais >= 5000 && (
                                                    <Chip
                                                        label="🔥 5000 pontos"
                                                        color="error"
                                                    />
                                                )}

                                                {row.produtividade >= 98 && (
                                                    <Chip
                                                        label="💎 Precisão absurda"
                                                        color="info"
                                                    />
                                                )}

                                            </Stack>

                                        </Box>

                                    </Paper>

                                </motion.div>

                            </Grid>

                        );

                    })}

                </Grid>

            )}

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
                            bgcolor:
                                dark
                                    ? "#1b1b1b"
                                    : "#f5f5f5",
                        }}
                    >

                        <Typography
                            variant="h6"
                            fontWeight="bold"
                            color={textColor}
                            sx={{ mb: 2 }}
                        >
                            📊 Explicação da pontuação
                        </Typography>

                        <Typography color={textColor}>
                            Cada item possui uma pontuação baseada na dificuldade logística.
                        </Typography>

                        <Typography color={textColor}>
                            Itens pesados/grandes = 10 pts
                        </Typography>

                        <Typography color={textColor}>
                            Itens médios = 5 pts
                        </Typography>

                        <Typography color={textColor}>
                            Itens leves = 2 pts
                        </Typography>

                        <Typography
                            color="error.main"
                            sx={{ mt: 1 }}
                        >
                            Divergência de caixa = -15 pts
                        </Typography>

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
                                                            ? "-15 pts"
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

        </Container>

    );

}