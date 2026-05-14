import { useEffect, useState, useContext } from "react";
import {
    Container,
    Typography,
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

    // MODAL
    const [openDetalhes, setOpenDetalhes] = useState(false);
    const [detalhesSelecionados, setDetalhesSelecionados] = useState([]);
    const [nomeSelecionado, setNomeSelecionado] = useState("");

    useEffect(() => {
        carregarDados();
    }, []);

    // =====================================
    // PONTUAÇÃO
    // =====================================
    const calcularPontosItem = (item) => {

        const desc = (item.descricao || "").toLowerCase();

        // PESADO
        if (
            desc.includes("amortecedor") ||
            desc.includes("amort") ||
            desc.includes("caixa de direção") ||
            desc.includes("caixa de direcao") ||
            desc.includes("semi eixo") ||
            desc.includes("homocinetica completa") ||
            desc.includes("bandeja") ||
            desc.includes("balanca") ||
            desc.includes("balança")
        ) {
            return 10;
        }

        // MÉDIO
        if (
            desc.includes("pastilha") ||
            desc.includes("cubo") ||
            desc.includes("mangueira") ||
            desc.includes("cilindro") ||
            desc.includes("coxim") ||
            desc.includes("junta") ||
            desc.includes("homocinetica fixa") ||
            desc.includes("terminal") ||
            desc.includes("pivo")
        ) {
            return 5;
        }

        // LEVE
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
    const carregarDados = async () => {

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

            const mapa = {};

            for (const nota of notas) {

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

                            const pts = calcularPontosItem(item);

                            mapa[conf].pontos += pts;

                            mapa[conf].itens += Number(
                                item.qtd_conferida || 1
                            );

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
                                    pontos: -15,
                                    erro: true,
                                    motivo: `Caixa incorreta (${item.caixa})`,
                                    localizacao: item.loc_sistema,
                                });

                            } else {

                                mapa[conf].detalhes.push({
                                    tipo: item.descricao,
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
                    >
                        📊 Produtividade de conferência do SIGEL - WMS
                    </Typography>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                    >
                        Controle operacional inteligente
                    </Typography>

                </Box>

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
                                    />

                                    {index === 0 && (
                                        <Chip
                                            icon={<StarIcon />}
                                            label="TOP PERFORMANCE"
                                            color="warning"
                                        />
                                    )}

                                    {row.errosCaixa > 0 && (
                                        <Chip
                                            icon={<WarningAmberIcon />}
                                            label={`${row.errosCaixa} erros`}
                                            color="error"
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
                                />

                                <Chip
                                    label={`-${row.descontos} descontos`}
                                    color="error"
                                />

                                <Chip
                                    label={`${row.pontosFinais} pts`}
                                    color="info"
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

                                        <Typography fontWeight="bold">
                                            {item.tipo}
                                        </Typography>

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