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
    Divider,
    Chip,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Snackbar
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
    Save
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

    const [dialogFinalizar, setDialogFinalizar] =
        useState(false);

    const [dialogPremiacao, setDialogPremiacao] =
        useState(false);

    const [snackOpen, setSnackOpen] =
        useState(false);

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

            const response =
                await fetch(
                    `${API}/api/temporadas/salvar-ranking`,
                    {
                        method: "POST"
                    }
                );

            const data =
                await response.json();

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
                mt={10}
            >

                <CircularProgress />

            </Box>

        );

    }

    return (

        <Container
            maxWidth="xl"
            sx={{
                mt: 4,
                mb: 4
            }}
        >

            <Typography
                variant="h4"
                fontWeight="bold"
                gutterBottom
            >
                🎮 Central de Gamificação
            </Typography>

            <Typography
                color="text.secondary"
                sx={{ mb: 4 }}
            >
                Gerencie temporadas, premiações e a loja do SIGEL WMS.
            </Typography>

            <Grid
                container
                spacing={3}
            >

                {/* TEMPORADA */}

                <Grid
                    item
                    xs={12}
                    md={3}
                >

                    <Paper
                        sx={{
                            p: 3,
                            borderRadius: 4,
                            bgcolor: "background.default",
                            height: "100%"
                        }}
                    >

                        <Typography
                            variant="h6"
                            gutterBottom
                        >
                            🏆 Temporada Atual
                        </Typography>

                        <Divider sx={{ mb: 2 }} />

                        {temporadaAtual ? (

                            <>

                                <Typography variant="h5" fontWeight="bold">

                                    {temporadaAtual.nome}

                                </Typography>

                                <Typography sx={{ mt: 2 }}>

                                    📅 Início:

                                    {" "}

                                    {new Date(
                                        temporadaAtual.data_inicio
                                    ).toLocaleDateString("pt-BR")}

                                </Typography>

                                <Typography>

                                    🏁 Fim:

                                    {" "}

                                    {new Date(
                                        temporadaAtual.data_fim
                                    ).toLocaleDateString("pt-BR")}

                                </Typography>

                                <Box mt={3}>

                                    <Chip
                                        color="success"
                                        sx={{color: 'white'}}
                                        label={`${temporadaAtual.dias_restantes} dias restantes`}
                                    />

                                </Box>

                            </>

                        ) : (

                            <Alert severity="warning">

                                Nenhuma temporada ativa.

                            </Alert>

                        )}

                    </Paper>

                </Grid>

                {/* FINALIZAR */}

                <Grid
                    item
                    xs={12}
                    md={5}
                >

                    <Paper
                        sx={{
                            p: 3,
                            borderRadius: 4,
                            bgcolor: "background.default",
                            height: "100%",
                        }}
                    >

                        <Typography
                            variant="h6"
                            gutterBottom
                        >

                            🏁 Finalizar Temporada

                        </Typography>

                        <Divider sx={{ mb: 2 }} />

                        <Typography
                            sx={{
                                mb: 3
                            }}
                        >

                            Salva o ranking,
                            recompensa com SigelCoins,
                            encerra e cria a
                            próxima temporada.

                        </Typography>

                        <Button
                            fullWidth
                            size="large"
                            variant="contained"
                            color="error"
                            startIcon={
                                <MilitaryTech />
                            }
                            disabled={loading}
                            onClick={() =>
                                setDialogFinalizar(true)
                            }
                        >

                            Finalizar Temporada

                        </Button>

                    </Paper>
                </Grid>

                <Grid
                    item
                    xs={12}
                    md={4}
                >
                    <Paper
                        sx={{
                            p: 3,
                            borderRadius: 4,
                            bgcolor: "background.default",
                            height: "100%"
                        }}
                    >
                        <Typography
                            variant="h6"
                            gutterBottom
                        >
                            🚀 Acesso Rápido
                        </Typography>

                        <Divider sx={{ mb: 3 }} />

                        <Box
                            display="flex"
                            flexWrap="wrap"
                            gap={2}
                        >
                            <Button
                                variant="contained"
                                startIcon={
                                    <History />
                                }
                                onClick={() =>
                                    navigate("/Temporadas")
                                }
                            >
                                Histórico
                            </Button>

                            <Button
                                variant="contained"
                                startIcon={
                                    <Store />
                                }
                                onClick={() =>
                                    navigate("/Loja")
                                }
                            >
                                Loja

                            </Button>

                            <Button
                                variant="contained"
                                startIcon={
                                    <EmojiEvents />
                                }
                                onClick={() =>
                                    navigate("/Produtividade")
                                }
                            >
                                Ranking
                            </Button>
                        </Box>
                    </Paper>
                </Grid>

                {/* SALVAR RANKING */}

                <Grid
                    item
                    xs={12}
                    md={6}
                >
                    <Paper
                        sx={{
                            p: 3,
                            borderRadius: 4,
                            bgcolor: 'background.default'
                        }}
                    >
                        <Typography
                            variant="h6"
                            gutterBottom
                        >
                            💾 Atualizar Temporada
                        </Typography>

                        <Divider
                            sx={{ mb: 2 }}
                        />

                        <Typography
                            sx={{ mb: 3 }}
                        >
                            Salva o ranking atual
                            na tabela histórica.
                        </Typography>

                        <Button
                            fullWidth
                            size="large"
                            variant="contained"
                            color="warning"
                            startIcon={
                                <Save />
                            }
                            onClick={
                                salvarRanking
                            }
                            disabled={
                                loading
                            }
                        >
                            Salvar Ranking
                        </Button>
                    </Paper>
                </Grid>

                {/* DISTRIBUIR PREMIAÇÃO */}
                <Grid
                    item
                    xs={12}
                    md={6}
                >
                    <Paper
                        sx={{
                            p: 3,
                            borderRadius: 4,
                            bgcolor: "background.default"
                        }}
                    >

                        <Typography
                            variant="h6"
                            gutterBottom
                        >

                            💰 Distribuir Premiação

                        </Typography>

                        <Divider sx={{ mb: 2 }} />

                        <Typography
                            sx={{
                                mb: 3
                            }}
                        >

                            Distribui imediatamente
                            as SigelCoins para o
                            ranking atual sem
                            encerrar a temporada.

                        </Typography>

                        <Button
                            fullWidth
                            variant="contained"
                            color="warning"
                            startIcon={
                                <CardGiftcard />
                            }
                            disabled={loading}
                            onClick={
                                distribuirPremiacao
                            }
                        >

                            Distribuir Premiação

                        </Button>

                    </Paper>
                </Grid>

                {/* DIALOG FINALIZAR */}

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
                            gap={1}
                        >

                            <WarningAmber
                                color="warning"
                            />

                            Finalizar Temporada

                        </Box>

                    </DialogTitle>

                    <DialogContent>

                        <Alert
                            severity="warning"
                            sx={{ mb: 2 }}
                        >

                            Esta ação irá:

                        </Alert>

                        <Typography>

                            ✔ Salvar o ranking definitivo.

                        </Typography>

                        <Typography>

                            ✔ Distribuir SigelCoins para todos os jogadores.

                        </Typography>

                        <Typography>

                            ✔ Encerrar a temporada atual.

                        </Typography>

                        <Typography>

                            ✔ Criar automaticamente a próxima temporada.

                        </Typography>

                        <Typography
                            color="error"
                            fontWeight="bold"
                            mt={3}
                        >

                            Esta operação não poderá ser desfeita.

                        </Typography>

                    </DialogContent>

                    <DialogActions>

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

                {/* DIALOG PREMIAÇÃO */}

                <Dialog
                    open={dialogPremiacao}
                    onClose={() =>
                        setDialogPremiacao(false)
                    }
                    slotProps={{
                        paper: {
                            sx: {
                                bgcolor: "background.card",
                                color: "text.primary",
                            }
                        }
                    }}
                    maxWidth="sm"
                    fullWidth
                >

                    <DialogTitle>

                        <Box
                            display="flex"
                            alignItems="center"
                            gap={1}
                        >

                            <EmojiEvents
                                color="warning"
                            />

                            Premiação Distribuída

                        </Box>

                    </DialogTitle>

                    <DialogContent>

                        {premiados.length === 0 ? (

                            <Alert severity="info">

                                Nenhum jogador premiado.

                            </Alert>

                        ) : (

                            premiados.map((jogador, index) => (

                                <Paper
                                    key={jogador.codigo}
                                    sx={{
                                        p: 2,
                                        mb: 2,
                                        display: "flex",
                                        justifyContent:
                                            "space-between",
                                        alignItems: "center",
                                        bgcolor: 'background.default'
                                    }}
                                >

                                    <Box>

                                        <Typography
                                            fontWeight="bold"
                                        >

                                            {index + 1}º

                                            {" "}

                                            {jogador.nome}

                                        </Typography>

                                        <Typography
                                            variant="body2"
                                        >

                                            {jogador.codigo}

                                        </Typography>

                                    </Box>

                                    <Chip
                                        color="warning"
                                        sx={{ color: 'white' }}
                                        icon={<EmojiEvents />}
                                        label={`${jogador.premio.toLocaleString()} SigelCoins`}
                                    />

                                </Paper>

                            ))

                        )}

                    </DialogContent>

                    <DialogActions>

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

                {/* SNACKBAR */}
            </Grid>
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
                    >

                        {mensagem.texto}

                    </Alert>

                )}

            </Snackbar>

        </Container>

    );

}