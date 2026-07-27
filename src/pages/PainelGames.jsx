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
            maxWidth={false}
            sx={{
                py: 3,
                display: "flex",
                justifyContent: "center",
            }}
        >

            <Stack
                spacing={2.5}
                sx={{
                    width: "100%",
                    maxWidth: 920,
                }}
            >

                {/* ==================== BANNER ==================== */}

                <Paper
                    elevation={0}
                    sx={{
                        overflow: "hidden",
                        borderRadius: 4,
                        border: "1px solid rgba(255,255,255,.08)",
                        transition: ".25s",

                        "&:hover": {
                            transform: "translateY(-2px)",
                            boxShadow: 6,
                        }
                    }}
                >

                    <Box
                        component="img"
                        src="/banner_seasons/banner_temporada_genesis.png"
                        sx={{
                            width: "100%",
                            height: 240,
                            objectFit: "cover",
                            display: "block",
                        }}
                    />

                </Paper>

                {/* ==================== TEMPORADA ==================== */}

                <Paper
                    elevation={0}
                    sx={{
                        p: 1,
                        borderRadius: 4,
                        border: "1px solid rgba(255,255,255,.08)",
                        bgcolor: "background.card",
                        transition: ".25s",

                        "&:hover": {
                            transform: "translateY(-2px)",
                            boxShadow: 6,
                        }
                    }}
                >

                    <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        flexWrap="wrap"
                        gap={2}
                        sx={{px:5}}
                    >

                        {/* Lado esquerdo */}

                        <Box>

                            <Typography
                                variant="caption"
                                color="success.main"
                                fontWeight={700}
                                letterSpacing={1}
                            >
                                TEMPORADA ATIVA
                            </Typography>

                            <Typography
                                variant="h4"
                                fontWeight={900}
                            >
                                {temporadaAtual?.nome || "--"}
                            </Typography>

                        </Box>

                        {/* Dias restantes */}

                        <Chip
                            color="success"
                            icon={<Timer />}
                            label={`${temporadaAtual?.dias_restantes ?? 0} dias restantes`}
                            sx={{
                                fontWeight: 700,
                                color: "#FFF",
                                px: 1
                            }}
                        />

                    </Box>

                    <Box
                        sx={{
                            mt: 3,
                            display: "grid",
                            gridTemplateColumns: {
                                xs: "1fr",
                                sm: "1fr 1fr"
                            },
                            gap: 2
                        }}
                    >

                        {/* Data início */}

                        <Paper
                            elevation={0}
                            sx={{
                                p: 2,
                                borderRadius: 3,
                                bgcolor: "background.default",
                            }}
                        >

                            <Box
                                display="flex"
                                alignItems="center"
                                gap={1.5}
                            >

                                <CalendarMonth color="success" />

                                <Box>

                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                    >
                                        Início
                                    </Typography>

                                    <Typography fontWeight={700}>
                                        {temporadaAtual
                                            ? new Date(
                                                temporadaAtual.data_inicio
                                            ).toLocaleDateString("pt-BR")
                                            : "--"}
                                    </Typography>

                                </Box>

                            </Box>

                        </Paper>

                        {/* Data fim */}

                        <Paper
                            elevation={0}
                            sx={{
                                p: 2,
                                borderRadius: 3,
                                bgcolor: "background.default",
                            }}
                        >

                            <Box
                                display="flex"
                                alignItems="center"
                                gap={1.5}
                            >

                                <Flag color="error" />

                                <Box>

                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                    >
                                        Encerramento
                                    </Typography>

                                    <Typography fontWeight={700}>
                                        {temporadaAtual
                                            ? new Date(
                                                temporadaAtual.data_fim
                                            ).toLocaleDateString("pt-BR")
                                            : "--"}
                                    </Typography>

                                </Box>

                            </Box>

                        </Paper>

                    </Box>

                </Paper>
                {/* ==================== AÇÕES ==================== */}

                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: {
                            xs: "1fr",
                            md: "repeat(3, 1fr)"
                        },
                        gap: 2
                    }}
                >

                    {/* ================= SALVAR ================= */}

                    <Paper
                        elevation={0}
                        sx={{
                            p: 2.5,
                            borderRadius: 4,
                            border: "1px solid rgba(255,255,255,.08)",
                            bgcolor: "background.card",
                            display: "flex",
                            flexDirection: "column",
                            transition: ".25s",

                            "&:hover": {
                                transform: "translateY(-3px)",
                                boxShadow: 6,
                            }
                        }}
                    >

                        <Save
                            sx={{
                                color: "#ff9800",
                                fontSize: 32,
                                mb: 2
                            }}
                        />

                        <Typography
                            variant="h6"
                            fontWeight={800}
                        >
                            Salvar Ranking
                        </Typography>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                                mt: 1,
                                mb: 3,
                                flexGrow: 1
                            }}
                        >
                            Salva um snapshot da classificação atual.
                        </Typography>

                        <Button
                            fullWidth
                            color="warning"
                            variant="outlined"
                            startIcon={<Save />}
                            onClick={salvarRanking}
                            disabled={loading}
                            sx={{
                                borderRadius: 2,
                                fontWeight: 700,
                                textTransform: "none"
                            }}
                        >
                            Salvar Ranking
                        </Button>

                    </Paper>

                    {/* ================= DISTRIBUIR ================= */}

                    <Paper
                        elevation={0}
                        sx={{
                            p: 2.5,
                            borderRadius: 4,
                            border: "1px solid rgba(255,255,255,.08)",
                            bgcolor: "background.card",
                            display: "flex",
                            flexDirection: "column",
                            transition: ".25s",

                            "&:hover": {
                                transform: "translateY(-3px)",
                                boxShadow: 6,
                            }
                        }}
                    >

                        <CardGiftcard
                            sx={{
                                color: "#4CAF50",
                                fontSize: 32,
                                mb: 2
                            }}
                        />

                        <Typography
                            variant="h6"
                            fontWeight={800}
                        >
                            Premiar jogadores
                        </Typography>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                                mt: 1,
                                mb: 3,
                                flexGrow: 1
                            }}
                        >
                            Envia automaticamente as SigelCoins para os jogadores.
                        </Typography>

                        <Button
                            fullWidth
                            color="success"
                            variant="outlined"
                            startIcon={<CardGiftcard />}
                            onClick={distribuirPremiacao}
                            disabled={loading}
                            sx={{
                                borderRadius: 2,
                                fontWeight: 700,
                                textTransform: "none"
                            }}
                        >
                            Distribuir
                        </Button>

                    </Paper>

                    {/* ================= FINALIZAR ================= */}

                    <Paper
                        elevation={0}
                        sx={{
                            p: 2.5,
                            borderRadius: 4,
                            border: "1px solid rgba(255,255,255,.08)",
                            bgcolor: "background.card",
                            display: "flex",
                            flexDirection: "column",
                            transition: ".25s",

                            "&:hover": {
                                transform: "translateY(-3px)",
                                boxShadow: 6,
                            }
                        }}
                    >

                        <Celebration
                            sx={{
                                color: "#f44336",
                                fontSize: 32,
                                mb: 2
                            }}
                        />

                        <Typography
                            variant="h6"
                            fontWeight={800}
                        >
                            Finalizar Temporada
                        </Typography>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                                mt: 1,
                                mb: 3,
                                flexGrow: 1
                            }}
                        >
                            Salva o ranking final, distribui as recompensas e inicia automaticamente a próxima temporada.
                        </Typography>

                        <Button
                            fullWidth
                            color="error"
                            variant="outlined"
                            startIcon={<Celebration />}
                            onClick={() => setDialogFinalizar(true)}
                            disabled={loading}
                            sx={{
                                borderRadius: 2,
                                fontWeight: 700,
                                textTransform: "none"
                            }}
                        >
                            Finalizar
                        </Button>

                    </Paper>

                </Box>

                {/* ==================== ACESSOS RÁPIDOS ==================== */}

                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: {
                            xs: "1fr",
                            md: "repeat(3, 1fr)"
                        },
                        gap: 2
                    }}
                >

                    {/* HISTÓRICO */}

                    <Paper
                        elevation={0}
                        onClick={() => navigate("/Temporadas")}
                        sx={{
                            p: 2.5,
                            borderRadius: 4,
                            border: "1px solid rgba(255,255,255,.08)",
                            bgcolor: "background.card",
                            cursor: "pointer",
                            transition: ".25s",
                            display: "flex",
                            alignItems: "center",
                            gap: 2,

                            "&:hover": {
                                transform: "translateY(-3px)",
                                borderColor: "primary.main",
                                boxShadow: 6,
                            }
                        }}
                    >

                        <History
                            sx={{
                                fontSize: 42,
                                color: "primary.main"
                            }}
                        />

                        <Box>

                            <Typography
                                fontWeight={800}
                                fontSize={18}
                            >
                                Histórico
                            </Typography>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                            >
                                Consulte temporadas encerradas e resultados anteriores.
                            </Typography>

                        </Box>

                    </Paper>

                    {/* LOJA */}

                    <Paper
                        elevation={0}
                        onClick={() => navigate("/Loja")}
                        sx={{
                            p: 2.5,
                            borderRadius: 4,
                            border: "1px solid rgba(255,255,255,.08)",
                            bgcolor: "background.card",
                            cursor: "pointer",
                            transition: ".25s",
                            display: "flex",
                            alignItems: "center",
                            gap: 2,

                            "&:hover": {
                                transform: "translateY(-3px)",
                                borderColor: "#43A047",
                                boxShadow: 6,
                            }
                        }}
                    >

                        <Store
                            sx={{
                                fontSize: 42,
                                color: "#43A047"
                            }}
                        />

                        <Box>

                            <Typography
                                fontWeight={800}
                                fontSize={18}
                            >
                                Loja
                            </Typography>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                            >
                                Gerencie itens, cosméticos e recompensas disponíveis.
                            </Typography>

                        </Box>

                    </Paper>

                    {/* RANKING */}

                    <Paper
                        elevation={0}
                        onClick={() => navigate("/Produtividade")}
                        sx={{
                            p: 2.5,
                            borderRadius: 4,
                            border: "1px solid rgba(255,255,255,.08)",
                            bgcolor: "background.card",
                            cursor: "pointer",
                            transition: ".25s",
                            display: "flex",
                            alignItems: "center",
                            gap: 2,

                            "&:hover": {
                                transform: "translateY(-3px)",
                                borderColor: "#FFB300",
                                boxShadow: 6,
                            }
                        }}
                    >

                        <EmojiEvents
                            sx={{
                                fontSize: 42,
                                color: "#FFB300"
                            }}
                        />

                        <Box>

                            <Typography
                                fontWeight={800}
                                fontSize={18}
                            >
                                Ranking
                            </Typography>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                            >
                                Visualize a classificação e a produtividade dos jogadores.
                            </Typography>

                        </Box>
                    </Paper>
                </Box>
            </Stack>

            {/* ========================= DIALOG FINALIZAR ========================= */}

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

                        <Celebration
                            color="error"
                            sx={{ fontSize: 34 }}
                        />

                        <Box>

                            <Typography
                                variant="h6"
                                fontWeight={800}
                            >
                                Finalizar Temporada
                            </Typography>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                            >
                                Esta ação não poderá ser desfeita.
                            </Typography>

                        </Box>

                    </Box>

                </DialogTitle>

                <DialogContent>

                    <Alert
                        severity="warning"
                        sx={{ mb: 3 }}
                    >
                        Antes de continuar confira as informações abaixo.
                    </Alert>

                    <Stack spacing={1.5}>

                        <Paper
                            elevation={0}
                            sx={{
                                p: 2,
                                bgcolor: "background.default",
                                borderRadius: 3
                            }}
                        >
                            💾 Salvar ranking definitivo
                        </Paper>

                        <Paper
                            elevation={0}
                            sx={{
                                p: 2,
                                bgcolor: "background.default",
                                borderRadius: 3
                            }}
                        >
                            🪙 Distribuir SigelCoins automaticamente
                        </Paper>

                        <Paper
                            elevation={0}
                            sx={{
                                p: 2,
                                bgcolor: "background.default",
                                borderRadius: 3
                            }}
                        >
                            🏁 Encerrar a temporada atual
                        </Paper>

                        <Paper
                            elevation={0}
                            sx={{
                                p: 2,
                                bgcolor: "background.default",
                                borderRadius: 3
                            }}
                        >
                            🚀 Criar automaticamente a próxima temporada
                        </Paper>

                    </Stack>

                </DialogContent>

                <DialogActions sx={{ p: 2.5 }}>

                    <Button
                        onClick={() => setDialogFinalizar(false)}
                    >
                        Cancelar
                    </Button>

                    <Button
                        variant="contained"
                        color="error"
                        startIcon={<Celebration />}
                        onClick={finalizarTemporada}
                        disabled={loading}
                        sx={{
                            borderRadius: 2,
                            fontWeight: 700,
                            textTransform: "none"
                        }}
                    >
                        Finalizar
                    </Button>

                </DialogActions>

            </Dialog>

            {/* ========================= DIALOG PREMIAÇÃO ========================= */}

            <Dialog
                open={dialogPremiacao}
                onClose={() => setDialogPremiacao(false)}
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
                                fontSize: 34
                            }}
                        />

                        <Box>

                            <Typography
                                variant="h6"
                                fontWeight={800}
                            >
                                Premiação Distribuída
                            </Typography>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                            >
                                Resultado da distribuição automática.
                            </Typography>

                        </Box>

                    </Box>

                </DialogTitle>

                <DialogContent>

                    {premiados.length === 0 ? (

                        <Alert severity="info">
                            Nenhum jogador recebeu premiação.
                        </Alert>

                    ) : (

                        <Stack spacing={1.5}>

                            {premiados.map((jogador, index) => (

                                <Paper
                                    key={jogador.codigo}
                                    elevation={0}
                                    sx={{
                                        p: 2,
                                        borderRadius: 3,
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        border:
                                            index === 0
                                                ? "2px solid #FFD54F"
                                                : "1px solid rgba(255,255,255,.08)",

                                        bgcolor:
                                            index === 0
                                                ? "warning.light"
                                                : "background.default"
                                    }}
                                >

                                    <Box>

                                        <Typography
                                            fontWeight={700}
                                        >
                                            #{index + 1} • {jogador.nome}
                                        </Typography>

                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                        >
                                            Código {jogador.codigo}
                                        </Typography>

                                    </Box>

                                    <Chip
                                        color="warning"
                                        icon={<EmojiEvents />}
                                        label={`${jogador.premio.toLocaleString()} SigelCoins`}
                                        sx={{
                                            fontWeight: 700,
                                            color: "#FFF"
                                        }}
                                    />

                                </Paper>

                            ))}

                        </Stack>

                    )}

                </DialogContent>

                <DialogActions sx={{ p: 2.5 }}>

                    <Button
                        variant="contained"
                        onClick={() => setDialogPremiacao(false)}
                        sx={{
                            borderRadius: 2,
                            textTransform: "none",
                            fontWeight: 700
                        }}
                    >
                        Fechar
                    </Button>

                </DialogActions>

            </Dialog>

            {/* ==================== SNACKBAR ==================== */}

            <Snackbar
                open={snackOpen}
                autoHideDuration={4500}
                onClose={() => setSnackOpen(false)}
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "right",
                }}
            >

                {mensagem && (

                    <Alert
                        severity={mensagem.tipo}
                        variant="filled"
                        onClose={() => setSnackOpen(false)}
                        sx={{
                            minWidth: 320,
                            borderRadius: 3,
                            fontWeight: 600,
                            boxShadow: 8
                        }}
                    >

                        {mensagem.texto}

                    </Alert>

                )}

            </Snackbar>

        </Container>
    );
}