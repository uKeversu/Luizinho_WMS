import { useEffect, useState, useContext } from "react";

import {
    Container,
    Grid,
    Typography,
    Paper,
    Box,
    Chip,
    Button,
    Card,
    CardContent,
    Dialog,
    DialogTitle,
    DialogContent,
    Divider,
    CircularProgress
} from "@mui/material";

import {
    EmojiEvents,
    MilitaryTech,
    ArrowBack
} from "@mui/icons-material";

import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";

import { motion } from "framer-motion";

import { ThemeContext } from "../context/ThemeContext";

import { useNavigate } from "react-router-dom";

const API = "http://192.168.1.185:8077";

export default function Temporadas() {


    const navigate = useNavigate();

    const { dark } = useContext(ThemeContext);

    const [temporadas, setTemporadas] = useState([]);

    const [open, setOpen] = useState(false);

    const [loading, setLoading] = useState(false);

    const [detalhes, setDetalhes] = useState(null);

    useEffect(() => {

        carregarTemporadas();

    }, []);

    async function carregarTemporadas() {

        try {

            const response =
                await fetch(
                    `${API}/api/temporadas`
                );

            const data =
                await response.json();

            setTemporadas(
                Array.isArray(data.items)
                    ? data.items
                    : []
            );

        } catch (err) {
            console.error(err);
        }
    }

    async function abrirTemporada(id) {

        try {

            setLoading(true);

            const response =
                await fetch(
                    `${API}/api/temporadas/${id}/ranking`
                );

            const data =
                await response.json();

            setDetalhes(data);

            setOpen(true);

        } catch (err) {

            console.error(err);

        } finally {

            setLoading(false);

        }

    }

    const obterNivel = (xp, itens) => {

        if (xp >= 1000000 && itens >= 25000)
            return {
                nome: "TRANSCENDENTAL",
                cor: "#3256f5",
                imagem: "/ranks/icone-transcendental.png",
            };

        else if (xp >= 750000 && itens >= 15000)
            return {
                nome: "LENDÁRIO",
                cor: "#a724ff",
                imagem: "/ranks/icone-lendario.png",
            };

        else if (xp >= 500000 && itens >= 10000)
            return {
                nome: "MESTRE",
                cor: "#ff2929",
                imagem: "/ranks/icone-mestre.png",
            };

        else if (xp >= 300000 && itens >= 7000)
            return {
                nome: "ESMERALDA",
                cor: "#06c730",
                imagem: "/ranks/icone-esmeralda.png",
            };

        else if (xp >= 150000 && itens >= 5000)
            return {
                nome: "DIAMANTE",
                cor: "#00d5ff",
                imagem: "/ranks/icone-diamante.png",
            };

        else if (xp >= 100000 && itens >= 3000)
            return {
                nome: "PLATINA",
                cor: "#b0e0e6",
                imagem: "/ranks/icone-platina.png",
            };

        else if (xp >= 70000 && itens >= 2000)
            return {
                nome: "OURO",
                cor: "#FFD700",
                imagem: "/ranks/icone-ouro.png",
            };

        else if (xp >= 30000 && itens >= 1000)
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

    const glassStyle = {

        borderRadius: 5,

        background: dark
            ? "linear-gradient(135deg,#141414,#0a0a0a)"
            : "#fff",

        border: dark
            ? "1px solid rgba(255,255,255,0.08)"
            : "1px solid rgba(0,0,0,0.08)",

        transition: ".25s",

        "&:hover": {
            transform: "translateY(-6px)"
        }

    };

    return (

        <Container
            maxWidth="xl"
            sx={{
                mt: 4,
                mb: 6
            }}
        >

            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 4
                }}
            >

                <Box>

                    <Typography
                        variant="h4"
                        fontWeight="bold"
                    >
                        🏆 Histórico de Temporadas
                    </Typography>

                    <Typography>
                        Lendas que deixaram seu legado
                    </Typography>

                </Box>

                <Button
                    startIcon={<ArrowBack />}
                    variant="contained"
                    onClick={() =>
                        navigate("/Produtividade")
                    }
                >
                    Voltar
                </Button>

            </Box>

            <Grid container spacing={3}>

                {temporadas.map((temp) => (

                    <Grid
                        item
                        xs={12}
                        md={6}
                        lg={4}
                        key={temp.id}
                    >

                        <motion.div
                            whileHover={{
                                scale: 1.02
                            }}
                        >

                            <Paper sx={glassStyle}>

                                <CardContent>

                                    <Typography
                                        variant="h4"
                                        fontWeight="bold"
                                    >
                                        {temp.nome}
                                    </Typography>

                                    <Typography sx={{ mt: 1 }}>
                                        {new Date(temp.data_inicio).toLocaleDateString("pt-BR", {
                                            timeZone: "UTC",
                                        })}
                                        {" até "}
                                        {new Date(temp.data_fim).toLocaleDateString("pt-BR", {
                                            timeZone: "UTC",
                                        })}
                                    </Typography>

                                    <Divider
                                        sx={{ my: 2 }}
                                    />

                                    <Chip
                                        color={
                                            temp.ativa
                                                ? "success"
                                                : "default"
                                        }
                                        label={
                                            temp.ativa
                                                ? "ATIVA"
                                                : "ENCERRADA"
                                        }
                                        sx={{ color: 'white' }}
                                    />

                                    <Button
                                        fullWidth
                                        sx={{ mt: 3 }}
                                        variant="contained"
                                        onClick={() =>
                                            abrirTemporada(
                                                temp.id
                                            )
                                        }
                                    >
                                        Ver Temporada
                                    </Button>

                                </CardContent>

                            </Paper>

                        </motion.div>

                    </Grid>

                ))}

            </Grid>

            <Dialog
                open={open}
                onClose={() => setOpen(false)}
                maxWidth="xl"
                fullWidth
                PaperProps={{
                    sx: {
                        overflow: "hidden",
                        borderRadius: 5,
                        bgcolor: dark ? "#0f1115" : "#fafafa",
                        color: dark ? "#fff" : "#111",
                        border: dark
                            ? "1px solid rgba(255,255,255,.08)"
                            : "1px solid rgba(0,0,0,.08)",
                        backgroundImage: dark
                            ? "linear-gradient(180deg,#181b22 0%,#0f1115 100%)"
                            : "linear-gradient(180deg,#ffffff 0%,#f4f6fa 100%)",
                    },
                }}
                sx={{ zoom: '0.8' }}
            >
                {loading ? (

                    <Box
                        sx={{
                            p: 8,
                            display: "flex",
                            justifyContent: "center",
                        }}
                    >
                        <CircularProgress size={60} />
                    </Box>

                ) : detalhes && (
                    <>
                        <Box
                            sx={{
                                position: "relative",
                                overflow: "hidden",
                                p: 4,
                                background: `
            radial-gradient(circle at top right, rgba(255,215,0,.18), transparent 35%),
            radial-gradient(circle at bottom left, rgba(0,255,153,.08), transparent 35%),
            linear-gradient(135deg,#1b2434,#0d1117)
        `,
                                borderBottom: "1px solid rgba(255,255,255,.08)",
                            }}
                        >
                            <Box
                                sx={{
                                    position: "absolute",
                                    top: -40,
                                    right: -20,
                                    fontSize: 160,
                                    opacity: .06,
                                    userSelect: "none",
                                }}
                            >
                                🏆
                            </Box>

                            <Typography
                                variant="overline"
                                sx={{
                                    color: "#FFD700",
                                    letterSpacing: 3,
                                    fontWeight: 700,
                                }}
                            >
                                TEMPORADA
                            </Typography>

                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Typography
                                    variant="h3"
                                    fontWeight="bold"
                                >
                                    {detalhes.temporada.nome}
                                </Typography>

                                <Typography sx={{ color: "secondary", ml: 2 }}>
                                    {new Date(detalhes.temporada.data_inicio).toLocaleDateString("pt-BR", {
                                        timeZone: "UTC",
                                    })}
                                    {"  •  "}
                                    {new Date(detalhes.temporada.data_fim).toLocaleDateString("pt-BR", {
                                        timeZone: "UTC",
                                    })}
                                </Typography>
                                <Chip sx={{ ml: 2, color: 'white' }}
                                    color={
                                        detalhes.temporada.ativa
                                            ? "success"
                                            : "default"
                                    }
                                    label={
                                        detalhes.temporada.ativa
                                            ? "TEMPORADA ATIVA"
                                            : "TEMPORADA ENCERRADA"
                                    }
                                />
                            </Box>

                            <Box
                                sx={{
                                    display: "flex",
                                    gap: 1.5,
                                    mt: 3,
                                    flexWrap: "wrap",
                                }}
                            >

                            </Box>
                            <IconButton
                                onClick={() => setOpen(false)}
                                sx={{
                                    position: "absolute",
                                    top: 16,
                                    right: 16,
                                    color: "#fff",
                                    bgcolor: "rgba(255,255,255,.08)",

                                    "&:hover": {
                                        bgcolor: "rgba(255,255,255,.15)"
                                    }
                                }}
                            >
                                <CloseIcon />
                            </IconButton>
                        </Box>

                        <DialogContent sx={{
                            p: 4, "&::-webkit-scrollbar": {
                                width: 8
                            },

                            "&::-webkit-scrollbar-thumb": {
                                background: "#444",
                                borderRadius: 20
                            }
                        }}>
                            <Grid container spacing={3} sx={{ mb: 2 }}>

                                <Grid item xs={12} md={3}>
                                    <Paper
                                        sx={{
                                            p: 2,
                                            height: "100%",
                                            borderRadius: 4,
                                            textAlign: "center",
                                            background:
                                                "linear-gradient(145deg,#3d2b00,#221600)",
                                            border: "1px solid rgba(255,215,0,.25)",
                                        }}
                                    >
                                        <Typography fontSize={40}>
                                            👑
                                        </Typography>

                                        <Typography
                                            variant="subtitle2"
                                            color="rgba(255,255,255,.7)"
                                        >
                                            CAMPEÃO
                                        </Typography>

                                        <Typography
                                            variant="h6"
                                            fontWeight="bold"
                                            mt={1}
                                        >
                                            {detalhes.campeao?.nome ?? "-"}
                                        </Typography>
                                    </Paper>
                                </Grid>

                                <Grid item xs={12} md={3}>
                                    <Paper
                                        sx={{
                                            p: 3,
                                            height: "100%",
                                            borderRadius: 4,
                                            textAlign: "center",
                                            bgcolor: "background.default",
                                        }}
                                    >
                                        <Typography fontSize={30}>
                                            👥
                                        </Typography>

                                        <Typography
                                            variant="subtitle2"
                                            color="text.secondary"
                                        >
                                            PARTICIPANTES
                                        </Typography>

                                        <Typography
                                            variant="h4"
                                            fontWeight="bold"
                                            mt={1}
                                        >
                                            {detalhes.estatisticas?.participantes ?? 0}
                                        </Typography>
                                    </Paper>
                                </Grid>

                                <Grid item xs={12} md={3}>
                                    <Paper
                                        sx={{
                                            p: 3,
                                            height: "100%",
                                            borderRadius: 4,
                                            textAlign: "center",
                                            bgcolor: "background.default",
                                        }}
                                    >
                                        <Typography fontSize={30}>
                                            🚚
                                        </Typography>

                                        <Typography
                                            variant="subtitle2"
                                            color="text.secondary"
                                        >
                                            RECEBIMENTOS
                                        </Typography>

                                        <Typography
                                            variant="h4"
                                            fontWeight="bold"
                                            mt={1}
                                            color="#ff8a1c"
                                        >
                                            {Number(
                                                detalhes.estatisticas?.recebimentos_total ?? 0
                                            ).toLocaleString()}
                                        </Typography>
                                    </Paper>
                                </Grid>

                                <Grid item xs={12} md={3}>
                                    <Paper
                                        sx={{
                                            p: 3,
                                            height: "100%",
                                            borderRadius: 4,
                                            textAlign: "center",
                                            bgcolor: "background.default",
                                        }}
                                    >
                                        <Typography fontSize={30}>
                                            🧾
                                        </Typography>

                                        <Typography
                                            variant="subtitle2"
                                            color="text.secondary"
                                        >
                                            NOTAS CONFERIDAS
                                        </Typography>

                                        <Typography
                                            variant="h4"
                                            fontWeight="bold"
                                            mt={1}
                                            color="#00e676"
                                        >
                                            {Number(
                                                detalhes.estatisticas?.notas_total ?? 0
                                            ).toLocaleString()}
                                        </Typography>
                                    </Paper>
                                </Grid>

                                <Grid item xs={12} md={3}>
                                    <Paper
                                        sx={{
                                            p: 3,
                                            height: "100%",
                                            borderRadius: 4,
                                            textAlign: "center",
                                            bgcolor: "background.default",
                                        }}
                                    >
                                        <Typography fontSize={30}>
                                            📦
                                        </Typography>

                                        <Typography
                                            variant="subtitle2"
                                            color="text.secondary"
                                        >
                                            ITENS CONFERIDOS
                                        </Typography>

                                        <Typography
                                            variant="h4"
                                            fontWeight="bold"
                                            mt={1}
                                            color="#fc2828"
                                        >
                                            {Number(
                                                detalhes.estatisticas?.itens_total ?? 0
                                            ).toLocaleString()}
                                        </Typography>
                                    </Paper>
                                </Grid>

                                <Grid item xs={12} md={3}>
                                    <Paper
                                        sx={{
                                            p: 3,
                                            height: "100%",
                                            borderRadius: 4,
                                            textAlign: "center",
                                            bgcolor: "background.default",
                                        }}
                                    >
                                        <Typography fontSize={30}>
                                            🎯
                                        </Typography>

                                        <Typography
                                            variant="subtitle2"
                                            color="text.secondary"
                                        >
                                            PRECISÃO
                                        </Typography>

                                        <Typography
                                            variant="h4"
                                            fontWeight="bold"
                                            mt={1}
                                            color="#28f1ff"
                                        >
                                            {Number(
                                                detalhes.estatisticas?.produtividade_media ?? 0
                                            ).toLocaleString()}%
                                        </Typography>
                                    </Paper>
                                </Grid>

                                <Grid item xs={12} md={3}>
                                    <Paper
                                        sx={{
                                            p: 3,
                                            height: "100%",
                                            borderRadius: 4,
                                            textAlign: "center",
                                            bgcolor: "background.default",
                                        }}
                                    >
                                        <Typography fontSize={30}>
                                            ⚡
                                        </Typography>

                                        <Typography
                                            variant="subtitle2"
                                            color="text.secondary"
                                        >
                                            XP TOTAL
                                        </Typography>

                                        <Typography
                                            variant="h4"
                                            fontWeight="bold"
                                            mt={1}
                                            color="#ffca28"
                                        >
                                            {Number(
                                                detalhes.estatisticas?.xp_total ?? 0
                                            ).toLocaleString()}
                                        </Typography>
                                    </Paper>
                                </Grid>
                            </Grid>

                            <Typography
                                variant="h4"
                                fontWeight="bold"
                                sx={{ my: 3 }}
                            >
                                🏆 Ranking da Temporada
                            </Typography>
                            {/* ==================== TOP 3 ==================== */}

                            <Grid container spacing={3} sx={{ mb: 5 }}>

                                {detalhes.ranking.slice(0, 3).map((jogador, index) => {

                                    const nivel = obterNivel(
                                        Number(jogador.xp),
                                        jogador.itens
                                    );

                                    const medalhas = ["🥇", "🥈", "🥉"];

                                    const cores = [
                                        "#FFD700",
                                        "#C0C0C0",
                                        "#CD7F32"
                                    ];

                                    return (

                                        <Grid
                                            item
                                            xs={12}
                                            md={4}
                                            key={jogador.codigo}
                                        >
                                            <Paper
                                                sx={{
                                                    p: 3,
                                                    borderRadius: 5,
                                                    height: "100%",
                                                    position: "relative",
                                                    overflow: "hidden",
                                                    display: "flex",
                                                    flexDirection: "column",
                                                    alignItems: "center",
                                                    background: `
                                                    radial-gradient(circle at top,
                                                    ${cores[index]}22,
                                                    transparent 60%),
                                                    ${dark ? "#16181d" : "#fff"}`,
                                                    border: `2px solid ${cores[index]}55`,
                                                    transition: ".25s",
                                                    "&:hover": {
                                                        transform: "translateY(-6px)",
                                                        boxShadow: 8,
                                                    },
                                                    minWidth: '40vh'
                                                }}
                                            >
                                                {/* Rank */}
                                                <Box
                                                    component="img"
                                                    src={nivel.imagem}
                                                    alt={nivel.nome}
                                                    sx={{
                                                        width: 120,
                                                        height: 120,
                                                        my: 1,
                                                    }}
                                                />
                                                {/* Nome */}
                                                <Typography
                                                    variant="h5"
                                                    fontWeight="bold"
                                                >
                                                    {jogador.nome}
                                                </Typography>
                                                <Typography
                                                    sx={{
                                                        color: nivel.cor,
                                                        fontWeight: "bold",
                                                        fontSize: 18,
                                                        mb: 2,
                                                    }}
                                                >
                                                    {nivel.nome}
                                                </Typography>

                                                {/* Estatísticas */}
                                                <Box
                                                    sx={{
                                                        width: "100%",
                                                        display: "flex",
                                                        justifyContent: "space-between",
                                                        gap: 1,
                                                        mb: 3,
                                                    }}
                                                >
                                                    <Paper
                                                        elevation={0}
                                                        sx={{
                                                            flex: 1,
                                                            p: 1,
                                                            textAlign: "center",
                                                            bgcolor: "rgba(255,255,255,.05)",
                                                        }}
                                                    >
                                                        <Typography variant="caption">
                                                            🚚
                                                        </Typography>

                                                        <Typography fontWeight="bold">
                                                            {jogador.recebimentos.toLocaleString()}
                                                        </Typography>
                                                    </Paper>

                                                    <Paper
                                                        elevation={0}
                                                        sx={{
                                                            flex: 1,
                                                            p: 1,
                                                            textAlign: "center",
                                                            bgcolor: "rgba(255,255,255,.05)",
                                                        }}
                                                    >
                                                        <Typography variant="caption">
                                                            🧾
                                                        </Typography>

                                                        <Typography fontWeight="bold">
                                                            {jogador.notas.toLocaleString()}
                                                        </Typography>
                                                    </Paper>

                                                    <Paper
                                                        elevation={0}
                                                        sx={{
                                                            flex: 1,
                                                            p: 1,
                                                            textAlign: "center",
                                                            bgcolor: "rgba(255,255,255,.05)",
                                                        }}
                                                    >
                                                        <Typography variant="caption">
                                                            📦
                                                        </Typography>

                                                        <Typography fontWeight="bold">
                                                            {jogador.itens.toLocaleString()}
                                                        </Typography>
                                                    </Paper>

                                                    <Paper
                                                        elevation={0}
                                                        sx={{
                                                            flex: 1,
                                                            p: 1,
                                                            textAlign: "center",
                                                            bgcolor: "rgba(255,255,255,.05)",
                                                        }}
                                                    >
                                                        <Typography variant="caption">
                                                            🎯
                                                        </Typography>

                                                        <Typography fontWeight="bold">
                                                            {jogador.produtividade}%
                                                        </Typography>
                                                    </Paper>
                                                </Box>

                                                {/* XP */}
                                                <Typography
                                                    variant="h5"
                                                    fontWeight="bold"
                                                    sx={{
                                                        color: cores[index],
                                                    }}
                                                >
                                                    {jogador.xp.toLocaleString()}
                                                </Typography>

                                                <Typography
                                                    variant="overline"
                                                    color="text.secondary"
                                                >
                                                    XP
                                                </Typography>

                                            </Paper>
                                        </Grid>
                                    );
                                })}
                            </Grid>

                            <Typography
                                variant="h5"
                                fontWeight="bold"
                                sx={{ mb: 2 }}
                            >
                                📜 Classificação Completa
                            </Typography>

                            <Paper
                                sx={{
                                    p: 2,
                                    borderRadius: 5,
                                    bgcolor: "background.default",
                                    border: "1px solid rgba(255,255,255,.08)"
                                }}
                            >
                                {detalhes.ranking.slice(3).map((jogador) => {

                                    const nivel = obterNivel(
                                        Number(jogador.xp),
                                        jogador.itens
                                    );

                                    return (

                                        <Paper
                                            key={jogador.codigo}
                                            elevation={0}
                                            sx={{
                                                mb: 2,
                                                p: 2,
                                                borderRadius: 4,
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "space-between",
                                                transition: ".2s",
                                                bgcolor: "background.card",
                                                border: "1px solid rgba(255,255,255,.06)",

                                                "&:hover": {
                                                    transform: "translateY(-2px)",
                                                    borderColor: nivel.cor,
                                                    boxShadow: 6,
                                                },
                                            }}
                                        >

                                            {/* Lado esquerdo */}
                                            <Box
                                                sx={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 2,
                                                    flex: 1,
                                                }}
                                            >

                                                <Box
                                                    sx={{
                                                        width: 46,
                                                        height: 46,
                                                        borderRadius: "50%",
                                                        bgcolor: "rgba(255,255,255,.05)",
                                                        display: "flex",
                                                        justifyContent: "center",
                                                        alignItems: "center",
                                                        fontWeight: "bold",
                                                        fontSize: 18,
                                                    }}
                                                >
                                                    #{jogador.posicao}
                                                </Box>

                                                <Box
                                                    component="img"
                                                    src={nivel.imagem}
                                                    alt={nivel.nome}
                                                    sx={{
                                                        width: 64,
                                                        height: 64,
                                                        objectFit: "contain",
                                                    }}
                                                />

                                                <Box>

                                                    <Typography
                                                        fontWeight="bold"
                                                        fontSize={18}
                                                    >
                                                        {jogador.nome}
                                                    </Typography>

                                                    <Typography
                                                        sx={{
                                                            color: nivel.cor,
                                                            fontWeight: "bold",
                                                            mb: .5,
                                                        }}
                                                    >
                                                        {nivel.nome}
                                                    </Typography>

                                                    <Box
                                                        sx={{
                                                            display: "flex",
                                                            gap: 2,
                                                            flexWrap: "wrap",
                                                        }}
                                                    >
                                                        <Typography
                                                            variant="body2"
                                                            color="text.secondary"
                                                        >
                                                            🚚 {jogador.recebimentos.toLocaleString()}
                                                        </Typography>
                                                        <Typography
                                                            variant="body2"
                                                            color="text.secondary"
                                                        >
                                                            🧾 {jogador.notas.toLocaleString()}
                                                        </Typography>
                                                        <Typography
                                                            variant="body2"
                                                            color="text.secondary"
                                                        >
                                                            📦 {jogador.itens.toLocaleString()}
                                                        </Typography>
                                                        <Typography
                                                            variant="body2"
                                                            color="text.secondary"
                                                        >
                                                            🎯 {jogador.produtividade.toLocaleString()}%
                                                        </Typography>
                                                    </Box>

                                                </Box>

                                            </Box>

                                            {/* XP */}

                                            <Box
                                                sx={{
                                                    textAlign: "center",
                                                    minWidth: 150,
                                                }}
                                            >

                                                <Paper
                                                    elevation={0}
                                                    sx={{
                                                        px: 3,
                                                        py: 1.5,
                                                        borderRadius: 3,
                                                        bgcolor: "#ffc10718",
                                                        border: "1px solid #ffc10755",
                                                    }}
                                                >

                                                    <Typography
                                                        variant="h5"
                                                        fontWeight="bold"
                                                        color="warning.main"
                                                    >
                                                        {jogador.xp.toLocaleString()}
                                                    </Typography>

                                                    <Typography
                                                        variant="caption"
                                                        color="text.secondary"
                                                    >
                                                        XP
                                                    </Typography>
                                                </Paper>
                                            </Box>
                                        </Paper>
                                    );
                                })}</Paper>
                        </DialogContent>
                    </>
                )}
            </Dialog>

        </Container>

    );


}
