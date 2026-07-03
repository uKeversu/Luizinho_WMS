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

                                    <Typography
                                        sx={{ mt: 1 }}
                                    >
                                        {new Date(
                                            temp.data_inicio
                                        ).toLocaleDateString("pt-BR")}
                                        {" até "}
                                        {new Date(
                                            temp.data_fim
                                        ).toLocaleDateString("pt-BR")}
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
                onClose={() =>
                    setOpen(false)
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

                {loading ? (

                    <Box
                        sx={{
                            p: 6,
                            textAlign: "center"
                        }}
                    >
                        <CircularProgress />
                    </Box>

                ) : detalhes && (

                    <>
                        <DialogTitle>

                            🏆 {
                                detalhes.temporada.nome
                            }

                        </DialogTitle>

                        <DialogContent>

                            <Grid
                                container
                                spacing={3}
                            >

                                <Grid item xs={12} md={4}>

                                    <Card sx={{bgcolor: 'background.default'}}>

                                        <CardContent>

                                            <Typography
                                                variant="h6"
                                            >
                                                👑 Campeão
                                            </Typography>

                                            <Typography
                                                fontWeight="bold"
                                            >
                                                {
                                                    detalhes.campeao?.nome
                                                }
                                            </Typography>

                                            <Typography>
                                                {
                                                    detalhes.campeao?.xp
                                                } XP
                                            </Typography>

                                        </CardContent>

                                    </Card>

                                </Grid>

                                <Grid item xs={12} md={4}>

                                    <Card sx={{bgcolor: 'background.default'}}>

                                        <CardContent>

                                            <Typography>
                                                ⚡ XP Total
                                            </Typography>

                                            <Typography
                                                fontWeight="bold"
                                            >
                                                {
                                                    detalhes.estatisticas?.xp_total
                                                }
                                            </Typography>

                                        </CardContent>

                                    </Card>

                                </Grid>

                                <Grid item xs={12} md={4}>

                                    <Card sx={{bgcolor: 'background.default'}}>

                                        <CardContent>

                                            <Typography>
                                                👥 Participantes
                                            </Typography>

                                            <Typography
                                                fontWeight="bold"
                                            >
                                                {
                                                    detalhes.estatisticas?.participantes
                                                }
                                            </Typography>

                                        </CardContent>

                                    </Card>

                                </Grid>

                            </Grid>

                            <Divider
                                sx={{ my: 4 }}
                            />

                            <Grid
                                container
                                spacing={2}
                            >

                                <Grid item xs={6} md={3}>
                                    <Chip sx={{bgcolor: 'background.default'}}
                                        label={`📦 ${detalhes.estatisticas?.itens_total} itens`}
                                    />
                                </Grid>

                                <Grid item xs={6} md={3}>
                                    <Chip sx={{bgcolor: 'background.default'}}
                                        label={`🧾 ${detalhes.estatisticas?.notas_total} notas`}
                                    />
                                </Grid>

                                <Grid item xs={6} md={3}>
                                    <Chip sx={{bgcolor: 'background.default'}}
                                        label={`⚡ ${detalhes.estatisticas?.xp_total} XP`}
                                    />
                                </Grid>

                                <Grid item xs={6} md={3}>
                                    <Chip sx={{bgcolor: 'background.default'}}
                                        label={`🎯 ${detalhes.estatisticas?.produtividade_media}%`}
                                    />
                                </Grid>

                            </Grid>

                            <Divider
                                sx={{ my: 4 }}
                            />

                            <Typography
                                variant="h5"
                                fontWeight="bold"
                                gutterBottom
                            >
                                🥇 Ranking
                            </Typography>

                            <Paper
                                sx={{
                                    p: 3,
                                    borderRadius: 4,
                                    bgcolor: 'background.default'
                                }}
                            >

                                {detalhes.ranking.map(
                                    (jogador) => (

                                        <Box
                                            key={
                                                jogador.codigo
                                            }
                                            sx={{
                                                display: "flex",
                                                justifyContent:
                                                    "space-between",
                                                py: 1.5,
                                                borderBottom:
                                                    "1px solid rgba(255,255,255,0.08)"
                                            }}
                                        >

                                            <Box>

                                                <Typography
                                                    fontWeight="bold"
                                                >

                                                    {jogador.posicao === 1 &&
                                                        "🥇 "}

                                                    {jogador.posicao === 2 &&
                                                        "🥈 "}

                                                    {jogador.posicao === 3 &&
                                                        "🥉 "}

                                                    {
                                                        jogador.nome
                                                    }

                                                </Typography>

                                                <Typography
                                                    variant="body2"
                                                >
                                                    {
                                                        jogador.itens
                                                    }
                                                    {" itens • "}
                                                    {
                                                        jogador.notas
                                                    }
                                                    {" notas"}
                                                </Typography>

                                            </Box>

                                            <Typography
                                                fontWeight="bold"
                                            >
                                                {
                                                    jogador.xp
                                                } XP
                                            </Typography>

                                        </Box>

                                    )
                                )}

                            </Paper>

                        </DialogContent>

                    </>
                )}

            </Dialog>

        </Container>

    );


}
