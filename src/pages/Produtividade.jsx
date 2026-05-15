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
    Tooltip,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import StarIcon from "@mui/icons-material/Star";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

import { ThemeContext } from "../context/ThemeContext";
import "../style/App.css";

const API_NOTAS = "http://192.168.1.185:8077/api/notas/listar";
const API_ITENS = "http://192.168.1.185:8077/api/itens_nfe";
const API_FUNCIONARIOS = "http://192.168.1.185:8077/api/funcionarios/listar";

export default function Produtividade() {

    const { dark } = useContext(ThemeContext);

    const [loading, setLoading] = useState(true);
    const [dados, setDados] = useState([]);
    const [error, setError] = useState(null);

    const [dataInicio, setDataInicio] = useState("");
    const [dataFim, setDataFim] = useState("");
    const [lastUpdate, setLastUpdate] = useState(null);

    // MODAL
    const [openDetalhes, setOpenDetalhes] = useState(false);
    const [detalhesSelecionados, setDetalhesSelecionados] = useState([]);
    const [nomeSelecionado, setNomeSelecionado] = useState("");

    // Auto-Refresh
    useEffect(() => {
        if (!dataInicio || !dataFim) return;

        carregarDados();

        const interval = setInterval(() => {
            carregarDados();
        }, 5 * 60 * 1000);

        return () => clearInterval(interval);

    }, [dataInicio, dataFim]);

    useEffect(() => {
        const hoje = new Date();
        const seteDias = new Date();
        seteDias.setDate(hoje.getDate() - 7);

        const fmt = (d) => d.toISOString().split("T")[0];

        const ini = fmt(seteDias);
        const fim = fmt(hoje);

        setDataInicio(ini);
        setDataFim(fim);

        // força primeira carga
        carregarDados(ini, fim);

    }, []);

    useEffect(() => {
        if (dados.length > 0) {
            setLastUpdate(new Date().toLocaleTimeString());
        }
    }, [dados]);

    const parseDate = (dateStr) => {
        if (!dateStr) return null;

        // ISO já funciona
        if (dateStr.includes("T")) {
            return new Date(dateStr);
        }

        // fallback BR -> yyyy-mm-dd
        const [d, m, y] = dateStr.split(/[-/]/);
        return new Date(`${y}-${m}-${d}T00:00:00`);
    };

    // =====================================
    // PONTUAÇÃO
    // =====================================
    const calcularPontosItem = (item) => {
        const desc = (item.descricao || "")
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");

        // =========================
        // PESADO (prioridade alta)
        // =========================
        if (
            desc.includes("caixa de direcao") ||
            desc.includes("semi eixo") ||
            desc.includes("homocinetica completa") ||
            desc.includes("amortecedor") ||
            desc.includes("disco") ||
            desc.includes("tambor")
        ) {
            return 10;
        }

        if (desc.includes("radiador") && !desc.includes("mangueira")) {
            return 10;
        }

        if (desc.includes("radiador") && desc.includes("mangueira")) {
            return 5;
        }

        if (desc.includes("bandeja") && !desc.includes("pivo")) {
            return 10;
        }

        if (desc.includes("bandeja") && desc.includes("pivo")) {
            return 10;
        }

        if (desc.includes("bandeja") && desc.includes("bucha")) {
            return 2;
        }

        // =========================
        // MÉDIO
        // =========================
        if (
            desc.includes("mangueira") ||
            desc.includes("cilindro") ||
            desc.includes("coxim") ||
            desc.includes("junta") ||
            desc.includes("pastilha") ||
            desc.includes("cubo") ||
            desc.includes("homocinetica fixa") ||
            desc.includes("servo freio") ||
            desc.includes("cabo") ||
            desc.includes("bobina") ||
            desc.includes("parafusos cabecote") ||
            desc.includes("bomba")
        ) {
            return 5;
        }

        if (
            desc.includes("terminal") ||
            desc.includes("pivo")
        ) {
            return 5;
        }

        // =========================
        // LEVE
        // =========================
        return 2;
    };

    // =====================================
    // VALIDA CAIXA
    // =====================================
    const normalizarRua = (valor) => {
        return (valor || "")
            .toUpperCase()
            .trim()
            .replace(/\s+/g, "")
            .replace(/^0+(?=\d)/, "");
    };

    // Extrai rua da localização
    const extrairRuaLoc = (loc) => {

        const texto = normalizarRua(loc);

        // LOC01 -> LOC
        if (texto.startsWith("LOC")) {
            return "LOC";
        }

        // 044B128 -> 44B
        const match = texto.match(/^(\d+[A-Z])/);

        if (match) {
            return normalizarRua(match[1]);
        }

        return texto;
    };

    // Extrai ruas da caixa
    const extrairRuasCaixa = (caixa) => {

        if (!caixa) return [];

        const texto = normalizarRua(caixa);

        // Remove final "-1"
        const semVolume = texto.split("-")[0];

        // Ex:
        // 35A/44B
        // 000A
        // LOC

        return semVolume
            .split("/")
            .map(r => {

                // LOC
                if (r.startsWith("LOC")) {
                    return "LOC";
                }

                const match = r.match(/^(\d+[A-Z])/);

                if (match) {
                    return normalizarRua(match[1]);
                }

                return normalizarRua(r);
            });
    };

    // Validação final
    const validarCaixa = (item) => {

        const loc = item.loc_sistema || "";
        const caixa = item.caixa || "";

        // Sem caixa:
        // NÃO penaliza
        // NÃO soma pontos
        // NÃO conta item
        if (
            !caixa ||
            caixa === "0" ||
            caixa === "null"
        ) {
            return {
                valida: false,
                ignorar: true,
            };
        }

        const ruaLoc = extrairRuaLoc(loc);

        const ruasCaixa = extrairRuasCaixa(caixa);

        const correta = ruasCaixa.includes(ruaLoc);

        return {
            valida: correta,
            ignorar: false,
        };
    };

    // =====================================
    // MODAL
    // =====================================
    const abrirDetalhes = (row) => {
        setDetalhesSelecionados(row.detalhes || []);
        setNomeSelecionado(row.nome || row.conferente);
        setOpenDetalhes(true);
    };

    // =====================================
    // CARREGAR
    // =====================================
    const carregarDados = async (inicioParam, fimParam) => {

        try {

            setLoading(true);

            // FUNCIONÁRIOS
            const resFunc = await fetch(API_FUNCIONARIOS);
            const funcionarios = await resFunc.json();

            const mapaFuncs = {};

            funcionarios.forEach((f) => {
                mapaFuncs[f.codigo] = f.nome;
            });

            // NOTAS
            const resNotas = await fetch(API_NOTAS);
            const notas = await resNotas.json();

            // Filtro por data
            const inicio = new Date((inicioParam || dataInicio) + "T00:00:00");
            const fim = new Date((fimParam || dataFim) + "T23:59:59");

            const notasFiltradas = notas.filter((nota) => {

                const dataNota = parseDate(nota.data_recebimento);

                if (!dataNota) return false;

                const ini = new Date(dataInicio + "T00:00:00");
                const fim = new Date(dataFim + "T23:59:59");

                return dataNota >= ini && dataNota <= fim;
            });

            const mapa = {};

            for (const nota of notasFiltradas) {

                const conf = nota.conferente || "SEM_CONFERENTE";

                if (!mapa[conf]) {

                    mapa[conf] = {
                        conferente: conf,
                        nome: mapaFuncs[conf] || conf,
                        notas: 0,
                        pontos: 0,
                        descontos: 0,
                        itens: 0,
                        errosCaixa: 0,
                        detalhes: [],
                    };
                }

                mapa[conf].notas += 1;

                try {

                    const resItens = await fetch(`${API_ITENS}/${nota.id}`);
                    const data = await resItens.json();

                    const itens = data.items || [];

                    for (const item of itens) {

                        if (
                            item.status_item === "ITEM_CONFERIDO" ||
                            Number(item.qtd_conferida) > 0
                        ) {

                            const qtd = Number(item.qtd_conferida || 1);

                            const ptsUnitario = calcularPontosItem(item);

                            const pts = ptsUnitario * qtd;

                            mapa[conf].pontos += pts;

                            mapa[conf].itens += qtd;

                            // =========================
                            // VALIDA CAIXA
                            // =========================
                            const validacao = validarCaixa(item);

                            // Sem caixa:
                            // não pontua
                            // não penaliza
                            // não contabiliza
                            if (validacao.ignorar) {
                                continue;
                            }

                            if (!validacao.valida) {

                                mapa[conf].descontos += 15;
                                mapa[conf].errosCaixa += 1;

                                mapa[conf].detalhes.push({
                                    tipo: item.descricao,
                                    codigo: item.basico,
                                    pontos: -15,
                                    erro: true,
                                    motivo: `Caixa incorreta (${item.caixa})`,
                                    localizacao: item.loc_sistema,
                                });

                            } else {

                                mapa[conf].detalhes.push({
                                    tipo: item.descricao,
                                    codigo: item.basico,
                                    quantidade: qtd,
                                    pontosUnitario: ptsUnitario,
                                    pontos: pts,
                                    erro: false,
                                    localizacao: item.loc_sistema,
                                });

                            }

                        }

                    }

                } catch (err) {
                    console.log("Erro nota:", nota.id);
                }

            }

            // =====================================
            // AGRUPAR
            // =====================================
            const resultado = Object.values(mapa).map((item) => {

                const pontosFinais =
                    item.pontos - item.descontos;

                // ((ganhos - descontos) / ganhos) * 100

                let produtividade = 100;

                if (item.pontos > 0) {

                    produtividade = (
                        (
                            pontosFinais / item.pontos
                        ) * 100
                    ).toFixed(1);

                }

                return {
                    ...item,
                    pontosFinais,
                    produtividade,
                };

            });

            // RANKING
            resultado.sort(
                (a, b) => b.pontosFinais - a.pontosFinais
            );

            setDados(resultado);

        } catch (err) {

            console.error(err);
            setError("Erro ao carregar produtividade");

        } finally {

            setLoading(false);

        }

    };

    // =====================================
    // LOADING
    // =====================================
    if (loading) {

        return (
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "70vh",
                }}
            >
                <CircularProgress size={60} />
            </Box>
        );
    }

    // =====================================
    // ERRO
    // =====================================
    if (error) {

        return (
            <Container maxWidth="md" sx={{ mt: 4 }}>
                <Paper
                    sx={{
                        p: 3,
                        borderRadius: 4,
                        bgcolor: "error.main",
                        color: "#fff",
                    }}
                >
                    <Typography>{error}</Typography>
                </Paper>
            </Container>
        );
    }

    const top = dados[0];

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 5 }}>

            {/* HEADER */}
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
                        variant="h4"
                        fontWeight="bold"
                        color="text.primary"
                    >
                        📊 Produtividade de conferência do SIGEL - WMS
                    </Typography>

                    <Typography
                        variant="body2"
                        color="text.primary"
                    >
                        Controle operacional inteligente
                    </Typography>

                </Box>

            </Box>
            <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>

                <TextField
                    type="date"
                    label="Data início"
                    InputLabelProps={{ shrink: true }}
                    value={dataInicio}
                    onChange={(e) => setDataInicio(e.target.value)}
                />

                <TextField
                    type="date"
                    label="Data fim"
                    InputLabelProps={{ shrink: true }}
                    value={dataFim}
                    onChange={(e) => setDataFim(e.target.value)}
                />

                <Button
                    variant="contained"
                    onClick={carregarDados}
                >
                    Filtrar
                </Button>

                <Typography variant="caption">
                    Última atualização: {lastUpdate}
                </Typography>

            </Box>
            {/* KPI */}
            <Grid container spacing={2} sx={{ mb: 4 }}>

                <Grid item xs={12} md={3}>
                    <Card sx={{ borderRadius: 4, bgcolor: 'background.tabela' }}>
                        <CardContent>
                            <Typography color="text.secondary">
                                Conferentes
                            </Typography>

                            <Typography
                                variant="h4"
                                fontWeight="bold"
                            >
                                {dados.length}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={3}>
                    <Card sx={{ borderRadius: 4, bgcolor: 'background.tabela' }}>
                        <CardContent>

                            <Typography color="text.secondary">
                                Pontos Totais
                            </Typography>

                            <Typography
                                variant="h4"
                                fontWeight="bold"
                            >
                                {
                                    dados.reduce(
                                        (a, b) => a + b.pontosFinais,
                                        0
                                    )
                                }
                            </Typography>

                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={3}>
                    <Card sx={{ borderRadius: 4, bgcolor: 'background.tabela' }}>
                        <CardContent>

                            <Typography color="text.secondary">
                                Erros de Caixa
                            </Typography>

                            <Typography
                                variant="h4"
                                fontWeight="bold"
                                color="error.main"
                            >
                                {
                                    dados.reduce(
                                        (a, b) => a + b.errosCaixa,
                                        0
                                    )
                                }
                            </Typography>

                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={3}>
                    <Card
                        sx={{
                            borderRadius: 4,
                            bgcolor: "background.tabela",
                        }}
                    >
                        <CardContent>

                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                }}
                            >
                                <EmojiEventsIcon color="warning" />

                                <Typography color="text.secondary">
                                    Top 1
                                </Typography>

                            </Box>

                            <Typography
                                variant="h6"
                                fontWeight="bold"
                                sx={{ mt: 1 }}
                            >
                                {top?.nome || "-"}
                            </Typography>

                            <Typography variant="body2">
                                {top?.pontosFinais || 0} pts
                            </Typography>

                        </CardContent>
                    </Card>
                </Grid>

            </Grid>

            {/* LISTA */}
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                }}
            >

                {dados.map((row, index) => (

                    <Paper
                        key={row.conferente}
                        sx={{
                            borderRadius: 4,
                            p: 3,
                            transition: "0.2s",
                            "&:hover": {
                                transform: "translateY(-2px)",
                            },
                            bgcolor: "background.tabela"
                        }}
                    >

                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                flexWrap: "wrap",
                                gap: 2,
                            }}
                        >

                            {/* ESQUERDA */}
                            <Box>

                                <Box
                                    sx={{
                                        display: "flex",
                                        gap: 1,
                                        mb: 1,
                                        flexWrap: "wrap",
                                    }}
                                >

                                    <Chip
                                        label={`#${index + 1}`}
                                        color={
                                            index === 0
                                                ? "success"
                                                : index === 1
                                                    ? "primary"
                                                    : index === 2
                                                        ? "warning"
                                                        : "default"
                                        }
                                        sx={{
                                            color: "primary.branco",
                                            fontWeight: 700,
                                            "& .MuiChip-icon": {
                                                color: "primary.branco",
                                            },
                                        }}
                                    />

                                    {index === 0 && (
                                        <Chip
                                            icon={<StarIcon />}
                                            label="TOP PERFORMANCE"
                                            color="warning"
                                            sx={{
                                                color: "primary.branco",
                                                fontWeight: "bold",
                                            }}
                                        />
                                    )}

                                    {row.errosCaixa > 0 && (
                                        <Chip
                                            icon={<WarningAmberIcon />}
                                            label={`${row.errosCaixa} erros`}
                                            color="error"
                                            sx={{
                                                color: "primary.branco",
                                                fontWeight: "bold",
                                            }}
                                        />
                                    )}

                                </Box>

                                <Typography
                                    variant="h6"
                                    fontWeight="bold"
                                >
                                    {row.nome}
                                </Typography>

                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    {row.conferente}
                                </Typography>

                            </Box>

                            {/* DIREITA */}
                            <Box
                                sx={{
                                    display: "flex",
                                    gap: 1,
                                    flexWrap: "wrap",
                                    alignItems: "center",
                                }}
                            >

                                <Chip
                                    icon={<Inventory2Icon />}
                                    label={`${row.itens} itens conferidos`}
                                />

                                <Chip
                                    label={`${row.notas} notas conferidas`}
                                />

                                <Chip
                                    label={`${row.pontos} ganhos`}
                                    color="success"
                                    sx={{
                                        color: "primary.branco"
                                    }}
                                />

                                <Chip
                                    label={`-${row.descontos} descontos`}
                                    color="error"
                                />

                                <Chip
                                    label={`${row.pontosFinais} pts`}
                                    color="info"
                                    sx={{
                                        color: "primary.branco"
                                    }}
                                />

                                <Chip
                                    label={`${row.produtividade}%`}
                                    color={
                                        row.produtividade >= 90
                                            ? "success"
                                            : row.produtividade >= 60
                                                ? "warning"
                                                : "error"
                                    }
                                    sx={{
                                        color: "primary.branco"
                                    }}
                                />

                                <Button
                                    variant="contained"
                                    onClick={() => abrirDetalhes(row)}
                                    sx={{
                                        borderRadius: 3,
                                        textTransform: "none",
                                    }}
                                >
                                    Ver itens conferidos
                                </Button>

                            </Box>

                        </Box>

                    </Paper>

                ))}

            </Box>

            {/* MODAL */}
            <Dialog
                open={openDetalhes}
                onClose={() => setOpenDetalhes(false)}
                fullWidth
                maxWidth="md"
                PaperProps={{
                    sx: {
                        bgcolor: dark ? "#121212" : "#fff",
                        color: dark ? "#fff" : "#000",
                        borderRadius: 4,
                    }
                }}
            >

                <DialogTitle>

                    📦 Itens conferidos — {nomeSelecionado}

                    <IconButton
                        onClick={() => setOpenDetalhes(false)}
                        sx={{
                            position: "absolute",
                            right: 10,
                            top: 10,
                        }}
                    >
                        <CloseIcon />
                    </IconButton>

                </DialogTitle>

                <DialogContent dividers>

                    {detalhesSelecionados.length === 0 ? (

                        <Typography>
                            Nenhum item encontrado
                        </Typography>

                    ) : (

                        detalhesSelecionados.map((item, index) => (

                            <Box key={index}>

                                <Box
                                    sx={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        py: 1.5,
                                        gap: 2,
                                    }}
                                >

                                    <Box>
                                        <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                                            <Typography fontWeight="bold">
                                                {item.codigo} - {item.tipo}
                                            </Typography>

                                            <Typography variant="caption" sx={{ marginLeft: 2 }}>
                                                {item.quantidade}x • {item.pontosUnitario} pts
                                            </Typography>
                                        </Box>
                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                        >
                                            Localização:
                                            {" "}
                                            {item.localizacao || "-"}
                                        </Typography>

                                        {item.erro && (
                                            <Typography
                                                variant="caption"
                                                color="error.main"
                                                sx={{
                                                    display: "block",
                                                    mt: 0.5,
                                                    fontWeight: "bold"
                                                }}
                                            >
                                                ❌ {item.motivo}
                                            </Typography>
                                        )}

                                    </Box>

                                    <Chip
                                        icon={
                                            item.erro
                                                ? <WarningAmberIcon />
                                                : <CheckCircleIcon />
                                        }
                                        sx={{
                                            color: "primary.branco"
                                        }}
                                        label={
                                            item.erro
                                                ? `${item.pontos} pts`
                                                : `+${item.pontos} pts`
                                        }
                                        color={
                                            item.erro
                                                ? "error"
                                                : "success"
                                        }
                                    />

                                </Box>

                                <Divider />

                            </Box>

                        ))

                    )}

                </DialogContent>

            </Dialog>

        </Container>
    );
}