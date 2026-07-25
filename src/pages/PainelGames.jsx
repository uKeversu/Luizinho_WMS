import { useState, useEffect, useContext } from "react";
import axios from "axios";

import {
    Container,
    Grid,
    Paper,
    Typography,
    Button,
    Box,
    Alert,
    Chip,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Snackbar,
    Stack
} from "@mui/material";

import {
    EmojiEvents,
    MilitaryTech,
    Store,
    History,
    Celebration,
    WarningAmber,
    CheckCircle,
    CardGiftcard,
    Save,
    CalendarMonth,
    Flag,
    Timer
} from "@mui/icons-material";

import { useNavigate } from "react-router-dom";
import { ThemeContext } from "../context/ThemeContext";

const API = "http://192.168.1.185:8077";

export default function PainelGames() {

    const navigate = useNavigate();

    const { dark } = useContext(ThemeContext);

    const [temporadaAtual, setTemporadaAtual] = useState(null);

    const [loading, setLoading] = useState(false);

    const [mensagem, setMensagem] = useState(null);

    const [premiados, setPremiados] = useState([]);

    const [dialogFinalizar, setDialogFinalizar] = useState(false);

    const [dialogPremiacao, setDialogPremiacao] = useState(false);

    const [snackOpen, setSnackOpen] = useState(false);

    useEffect(() => {

        carregarTemporada();

    }, []);

    async function carregarTemporada() {

        try {

            const response = await axios.get(
                `${API}/api/temporadas/atual`
            );

            setTemporadaAtual(response.data);

        } catch (err) {

            console.error(err);

        }

    }

    async function salvarRanking() {

        try {

            setLoading(true);

            const response = await fetch(
                `${API}/api/temporadas/salvar-ranking`,
                {
                    method: "POST"
                }
            );

            const data = await response.json();

            setMensagem({

                tipo: "success",

                texto:
                    data.mensagem ||
                    "Ranking salvo com sucesso"

            });

        } catch {

            setMensagem({

                tipo: "error",

                texto:
                    "Erro ao salvar ranking"

            });

        } finally {

            setLoading(false);

        }

    }

    async function finalizarTemporada() {

        try {

            setLoading(true);

            const response = await axios.post(
                `${API}/api/temporadas/finalizar`
            );

            setMensagem({

                tipo: "success",

                texto:
                    `Temporada ${response.data.temporada_finalizada}
encerrada com sucesso.
Nova temporada criada:
${response.data.nova_temporada}`

            });

            setSnackOpen(true);

            setDialogFinalizar(false);

            await carregarTemporada();

        } catch (err) {

            setMensagem({

                tipo: "error",

                texto:
                    err.response?.data?.erro ||
                    "Erro ao finalizar temporada"

            });

            setSnackOpen(true);

        } finally {

            setLoading(false);

        }

    }

    async function distribuirPremiacao() {

        try {

            setLoading(true);

            const response = await axios.post(
                `${API}/api/temporadas/distribuir-premiacao`
            );

            setPremiados(
                response.data.premiados || []
            );

            setDialogPremiacao(true);

            setMensagem({

                tipo: "success",

                texto:
                    "Premiação distribuída com sucesso."

            });

            setSnackOpen(true);

        } catch (err) {

            setMensagem({

                tipo: "error",

                texto:
                    err.response?.data?.erro ||
                    "Erro ao distribuir premiação"

            });

            setSnackOpen(true);

        } finally {

            setLoading(false);

        }

    }

    if (loading && !temporadaAtual) {

        return (

            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                height="80vh"
            >

                <CircularProgress size={60} />

            </Box>

        );

    }

    return (

        <Container
            maxWidth="xl"
            sx={{
                py: 2
            }}
        >

            {/* ================= BANNER ================= */}

            <Paper
                elevation={0}
                sx={{
                    mb: 2,
                    borderRadius: 4,
                    overflow: "hidden",
                    border: "1px solid rgba(255,255,255,.08)",
                    height: 220
                }}
            >
                <Box
                    component="img"
                    src="/banner_seasons/banner_temporada_genesis.png"
                    sx={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                    }}
                />
            </Paper>

            <Grid
                container
                spacing={2}
                alignItems="stretch"
            >
                {/* ================= INFORMAÇÕES DA TEMPORADA ================= */}

                <Grid
                    item
                    xs={12}
                    md={4}
                    display="flex"
                >

                    {temporadaAtual ? (

                        <Paper
                            elevation={0}
                            sx={{
                                p: 2,
                                height: "100%",
                                width: "100%",
                                borderRadius: 5,
                                bgcolor: "background.card",
                                border: "1px solid rgba(255,255,255,.08)"
                            }}
                        >

                            <Box
                                display="flex"
                                justifyContent="space-between"
                                alignItems="center"
                                mb={4}
                            >

                                <Box>

                                    <Typography
                                        color="warning.main"
                                        fontWeight="bold"
                                        sx={{
                                            letterSpacing: 2
                                        }}
                                    >
                                        TEMPORADA ATIVA
                                    </Typography>

                                    <Typography
                                        variant="h4"
                                        fontWeight={900}
                                    >
                                        {temporadaAtual.nome}
                                    </Typography>

                                </Box>

                                <Chip
                                    icon={<Timer />}
                                    label={`${temporadaAtual.dias_restantes} dias restantes`}
                                    color="success"
                                    sx={{
                                        color: "#FFF",
                                        px: 1,
                                        ml: 2,
                                        fontWeight: "bold"
                                    }}
                                />

                            </Box>

                            <Grid
                                container
                                spacing={3}
                            >

                                <Grid
                                    item
                                    xs={12}
                                    md={4}
                                >

                                    <Paper
                                        elevation={0}
                                        sx={{
                                            p: 3,
                                            borderRadius: 4,
                                            bgcolor: "background.default",
                                            textAlign: "center"
                                        }}
                                    >

                                        <CalendarMonth
                                            color="success"
                                            sx={{
                                                fontSize: 42,
                                                mb: 1
                                            }}
                                        />

                                        <Typography
                                            color="text.secondary"
                                        >
                                            Início
                                        </Typography>

                                        <Typography
                                            variant="subtitle1"
                                            fontWeight="bold"
                                        >
                                            {new Date(
                                                temporadaAtual.data_inicio
                                            ).toLocaleDateString("pt-BR")}
                                        </Typography>

                                    </Paper>

                                </Grid>

                                <Grid
                                    item
                                    xs={12}
                                    md={4}
                                >

                                    <Paper
                                        elevation={0}
                                        sx={{
                                            p: 3,
                                            borderRadius: 4,
                                            bgcolor: "background.default",
                                            textAlign: "center"
                                        }}
                                    >

                                        <Flag
                                            color="error"
                                            sx={{
                                                fontSize: 42,
                                                mb: 1
                                            }}
                                        />

                                        <Typography
                                            color="text.secondary"
                                        >
                                            Encerramento
                                        </Typography>

                                        <Typography
                                            variant="subtitle1"
                                            fontWeight="bold"
                                        >
                                            {new Date(
                                                temporadaAtual.data_fim
                                            ).toLocaleDateString("pt-BR")}
                                        </Typography>

                                    </Paper>

                                </Grid>

                            </Grid>

                        </Paper>

                    ) : (

                        <Alert severity="warning">

                            Nenhuma temporada ativa.

                        </Alert>

                    )}



                </Grid>
                {/* SALVAR RANKING */}

                <Grid
                    item
                    xs={12}
                    md={4}
                    display="flex"
                >

                    <Paper
                        elevation={0}
                        sx={{
                            p: 2,
                            height: "100%",
                            width: "100%",
                            borderRadius: 5,
                            bgcolor: "background.card",
                            border: "1px solid rgba(255,255,255,.08)"
                        }}
                    >

                        <Save
                            sx={{
                                fontSize: 28,
                                color: "#ff9800",
                                mb: 3
                            }}
                        />

                        <Typography
                            variant="subtitle1"
                            fontWeight={800}
                        >

                            Salvar Ranking

                        </Typography>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                            mt={1}
                            mb={4}
                        >

                            Salva a classificação atual sem finalizar a temporada.

                        </Typography>

                        <Button
                            fullWidth
                            variant="outlined"
                            color="warning"
                            startIcon={<Save />}
                            disabled={loading}
                            onClick={salvarRanking}
                        >

                            Salvar

                        </Button>

                    </Paper>

                </Grid>

                {/* DISTRIBUIR */}

                <Grid
                    item
                    xs={12}
                    md={4}
                    display="flex"
                >

                    <Paper
                        elevation={0}
                        sx={{
                            p: 2,
                            height: "100%",
                            width: "100%",
                            borderRadius: 5,
                            bgcolor: "background.card",
                            border: "1px solid rgba(255,255,255,.08)"
                        }}
                    >

                        <CardGiftcard
                            sx={{
                                fontSize: 28,
                                color: "#43a047",
                                mb: 3
                            }}
                        />

                        <Typography
                            variant="subtitle1"
                            fontWeight={800}
                        >

                            Distribuir Premiação

                        </Typography>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                            mt={1}
                            mb={4}
                        >

                            Entrega imediatamente as SigelCoins aos jogadores.

                        </Typography>

                        <Button
                            fullWidth
                            variant="outlined"
                            color="success"
                            startIcon={<CardGiftcard />}
                            disabled={loading}
                            onClick={distribuirPremiacao}
                        >

                            Distribuir

                        </Button>

                    </Paper>

                </Grid>
                {/* ================= AÇÃO PRINCIPAL ================= */}

                <Paper
                    elevation={0}
                    fullWidth
                    sx={{
                        p: 2,
                        borderRadius: 5,
                        height: "100%",
                        width: "100%",
                        display: "flex",
                        flexDirection: "column",
                        bgcolor: "background.card",
                        border: "1px solid rgba(255,255,255,.08)"
                    }}
                >

                    <Typography
                        variant="h6"
                        fontWeight={900}
                    >
                        Finalizar Temporada
                    </Typography>

                    <Typography
                        color="text.secondary"
                        mt={2}
                    >

                        Salva automaticamente o ranking definitivo,
                        distribui as SigelCoins, encerra a temporada
                        atual e cria a próxima temporada.

                    </Typography>

                    <Box flexGrow={1} />

                    <Button
                        fullWidth
                        size="large"
                        variant="outlined"
                        startIcon={<Celebration />}
                        onClick={() =>
                            setDialogFinalizar(true)
                        }
                        disabled={loading}
                        sx={{
                            mt: 4,
                            py: 1.7,
                            fontWeight: "bold"
                        }}
                    >

                        FINALIZAR TEMPORADA

                    </Button>

                </Paper>
                {/* ================= PAINEL DE AÇÕES ================= */}

                <Grid
                    item
                    xs={12}
                >

                    <Grid
                        container
                        spacing={2}
                    >

                        {/* HISTÓRICO */}

                        <Grid item xs={12} md={4}>

                            <Paper
                                onClick={() =>
                                    navigate("/Temporadas")
                                }
                                elevation={0}
                                sx={{
                                    p: 2,
                                    height: "100%",
                                    cursor: "pointer",
                                    borderRadius: 5,
                                    bgcolor: "background.card",
                                    border: "1px solid rgba(255,255,255,.08)",
                                    transition: ".25s",
                                    "&:hover": {
                                        transform: "translateY(-8px)",
                                        borderColor: "primary.main"
                                    }
                                }}
                            >

                                <History
                                    sx={{
                                        fontSize: 28,
                                        color: "primary.main",
                                        mb: 3
                                    }}
                                />

                                <Typography
                                    variant="subtitle1"
                                    fontWeight={800}
                                >

                                    Histórico

                                </Typography>

                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    mt={1}
                                >

                                    Consulte todas as temporadas encerradas e seus vencedores.

                                </Typography>

                            </Paper>

                        </Grid>

                        {/* LOJA */}

                        <Grid item xs={12} md={4}>

                            <Paper
                                onClick={() =>
                                    navigate("/Loja")
                                }
                                elevation={0}
                                sx={{
                                    p: 2,
                                    height: "100%",
                                    cursor: "pointer",
                                    borderRadius: 5,
                                    bgcolor: "background.card",
                                    border: "1px solid rgba(255,255,255,.08)",
                                    transition: ".25s",
                                    "&:hover": {
                                        transform: "translateY(-8px)",
                                        borderColor: "#43a047"
                                    }
                                }}
                            >

                                <Store
                                    sx={{
                                        fontSize: 28,
                                        color: "#43a047",
                                        mb: 3
                                    }}
                                />

                                <Typography
                                    variant="subtitle1"
                                    fontWeight={800}
                                >

                                    Loja

                                </Typography>

                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    mt={1}
                                >

                                    Gerencie itens, cosméticos e recompensas da gamificação.

                                </Typography>

                            </Paper>

                        </Grid>

                        {/* RANKING */}

                        <Grid item xs={12} md={4}>

                            <Paper
                                onClick={() =>
                                    navigate("/Produtividade")
                                }
                                elevation={0}
                                sx={{
                                    p: 2,
                                    height: "100%",
                                    cursor: "pointer",
                                    borderRadius: 5,
                                    bgcolor: "background.card",
                                    border: "1px solid rgba(255,255,255,.08)",
                                    transition: ".25s",
                                    "&:hover": {
                                        transform: "translateY(-8px)",
                                        borderColor: "#ffb300"
                                    }
                                }}
                            >

                                <EmojiEvents
                                    sx={{
                                        fontSize: 28,
                                        color: "#ffb300",
                                        mb: 3
                                    }}
                                />

                                <Typography
                                    variant="subtitle1"
                                    fontWeight={800}
                                >

                                    Ranking

                                </Typography>

                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    mt={1}
                                >

                                    Visualize a classificação atual dos conferentes.

                                </Typography>

                            </Paper>

                        </Grid>

                    </Grid>

                </Grid>

                {/* ================= DIALOG FINALIZAR ================= */}

                <Dialog
                    open={dialogFinalizar}
                    onClose={() => setDialogFinalizar(false)}
                    maxWidth="sm"
                    fullWidth
                >

                    <DialogTitle>

                        <Box
                            display="flex"
                            alignItems="center"
                            gap={2}
                        >

                            <WarningAmber
                                sx={{
                                    color: "warning.main",
                                    fontSize: 40
                                }}
                            />

                            <Box>

                                <Typography
                                    variant="h5"
                                    fontWeight={900}
                                >
                                    Finalizar Temporada
                                </Typography>

                                <Typography
                                    color="text.secondary"
                                >
                                    Esta operação não poderá ser desfeita.
                                </Typography>

                            </Box>

                        </Box>

                    </DialogTitle>

                    <DialogContent>

                        <Alert
                            severity="warning"
                            sx={{
                                mb: 3
                            }}
                        >
                            Confirme que deseja finalizar a temporada.
                        </Alert>

                        <Stack spacing={2}>

                            <Paper
                                elevation={0}
                                sx={{
                                    p: 2,
                                    borderRadius: 3,
                                    bgcolor: "background.default"
                                }}
                            >
                                ✅ Salvar ranking definitivo.
                            </Paper>

                            <Paper
                                elevation={0}
                                sx={{
                                    p: 2,
                                    borderRadius: 3,
                                    bgcolor: "background.default"
                                }}
                            >
                                🪙 Distribuir SigelCoins para todos os jogadores.
                            </Paper>

                            <Paper
                                elevation={0}
                                sx={{
                                    p: 2,
                                    borderRadius: 3,
                                    bgcolor: "background.default"
                                }}
                            >
                                🏁 Encerrar a temporada atual.
                            </Paper>

                            <Paper
                                elevation={0}
                                sx={{
                                    p: 2,
                                    borderRadius: 3,
                                    bgcolor: "background.default"
                                }}
                            >
                                🚀 Criar automaticamente a próxima temporada.
                            </Paper>

                        </Stack>

                    </DialogContent>

                    <DialogActions
                        sx={{
                            p: 3
                        }}
                    >

                        <Button
                            onClick={() =>
                                setDialogFinalizar(false)
                            }
                        >
                            Cancelar
                        </Button>

                        <Button
                            variant="contained"
                            color="error"
                            startIcon={<Celebration />}
                            onClick={finalizarTemporada}
                            disabled={loading}
                        >
                            Confirmar
                        </Button>

                    </DialogActions>

                </Dialog>

                {/* ================= DIALOG PREMIAÇÃO ================= */}

                <Dialog
                    open={dialogPremiacao}
                    onClose={() =>
                        setDialogPremiacao(false)
                    }
                    maxWidth="md"
                    fullWidth
                >

                    <DialogTitle>

                        <Box
                            display="flex"
                            alignItems="center"
                            gap={2}
                        >

                            <EmojiEvents
                                sx={{
                                    color: "#FFD54F",
                                    fontSize: 42
                                }}
                            />

                            <Typography
                                variant="h5"
                                fontWeight={900}
                            >
                                Premiação Distribuída
                            </Typography>

                        </Box>

                    </DialogTitle>

                    <DialogContent>

                        {premiados.length === 0 ? (

                            <Alert severity="info">

                                Nenhum jogador premiado.

                            </Alert>

                        ) : (

                            <Stack spacing={2}>

                                {premiados.map((jogador, index) => (

                                    <Paper
                                        key={jogador.codigo}
                                        elevation={0}
                                        sx={{
                                            p: 3,
                                            borderRadius: 4,
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            bgcolor:
                                                index === 0
                                                    ? "warning.light"
                                                    : "background.default",
                                            border:
                                                index === 0
                                                    ? "2px solid #FFD54F"
                                                    : "1px solid rgba(255,255,255,.08)"
                                        }}
                                    >

                                        <Box
                                            display="flex"
                                            alignItems="center"
                                            gap={2}
                                        >

                                            <Avatar
                                                sx={{
                                                    bgcolor:
                                                        index === 0
                                                            ? "#FFD54F"
                                                            : index === 1
                                                                ? "#B0BEC5"
                                                                : index === 2
                                                                    ? "#A1887F"
                                                                    : "primary.main",
                                                    width: 54,
                                                    height: 54,
                                                    fontWeight: "bold"
                                                }}
                                            >

                                                {index + 1}

                                            </Avatar>

                                            <Box>

                                                <Typography
                                                    fontWeight="bold"
                                                >
                                                    {jogador.nome}
                                                </Typography>

                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                >
                                                    Código {jogador.codigo}
                                                </Typography>

                                            </Box>

                                        </Box>

                                        <Chip
                                            color="warning"
                                            icon={<EmojiEvents />}
                                            label={`${jogador.premio.toLocaleString()} SigelCoins`}
                                            sx={{
                                                color: "#FFF",
                                                fontWeight: "bold"
                                            }}
                                        />

                                    </Paper>

                                ))}

                            </Stack>

                        )}

                    </DialogContent>

                    <DialogActions
                        sx={{
                            p: 3
                        }}
                    >

                        <Button
                            variant="contained"
                            onClick={() =>
                                setDialogPremiacao(false)
                            }
                        >
                            Fechar
                        </Button>

                    </DialogActions>

                </Dialog>

            </Grid>

            {/* ================= SNACKBAR ================= */}

            <Snackbar
                open={snackOpen}
                autoHideDuration={5000}
                onClose={() =>
                    setSnackOpen(false)
                }
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "right"
                }}
            >
                {mensagem && (
                    <Alert
                        severity={mensagem.tipo}
                        variant="filled"
                        icon={<CheckCircle />}
                        onClose={() =>
                            setSnackOpen(false)
                        }
                        sx={{
                            width: "100%",
                            borderRadius: 3
                        }}
                    >
                        {mensagem.texto}
                    </Alert>
                )}
            </Snackbar>
        </Container>
    );
}