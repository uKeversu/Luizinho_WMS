import { useState, useEffect, useContext } from "react";

import {
    Container,
    Grid,
    Paper,
    Typography,
    Button,
    TextField,
    Box,
    Alert,
    Divider,
    Chip
} from "@mui/material";

import {
    EmojiEvents,
    Save,
    Add,
    Store,
    History
} from "@mui/icons-material";

import { useNavigate } from "react-router-dom";

import { ThemeContext } from "../context/ThemeContext";

const API = "http://192.168.1.185:8077";

export default function PainelGames() {

    const navigate = useNavigate();

    const { dark } = useContext(ThemeContext);

    const [temporadaAtual, setTemporadaAtual] =
        useState(null);

    const [loading, setLoading] =
        useState(false);

    const [mensagem, setMensagem] =
        useState(null);

    const [novaTemporada, setNovaTemporada] =
        useState({

            nome: "",

            data_inicio: "",

            data_fim: ""

        });

    useEffect(() => {

        carregarTemporada();

    }, []);

    async function carregarTemporada() {

        try {

            const response =
                await fetch(
                    `${API}/api/temporadas/atual`
                );

            const data =
                await response.json();

            setTemporadaAtual(data);

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

    async function criarTemporada() {

        try {

            setLoading(true);

            const response =
                await fetch(
                    `${API}/api/temporadas`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify(
                            novaTemporada
                        )
                    }
                );

            const data =
                await response.json();

            if (!response.ok)
                throw new Error(
                    data.erro
                );

            setMensagem({
                tipo: "success",
                texto:
                    "Temporada criada com sucesso"
            });

            setNovaTemporada({

                nome: "",

                data_inicio: "",

                data_fim: ""

            });

        } catch (err) {

            setMensagem({
                tipo: "error",
                texto:
                    err.message
            });

        } finally {

            setLoading(false);

        }

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
                🎮 Central de Gamificação do SIGEL WMS
            </Typography>

            <Typography
                color="text.secondary"
                sx={{ mb: 4 }}
            >
                Administração de temporadas,
                ranking e recompensas.
            </Typography>

            {mensagem && (

                <Alert
                    severity={mensagem.tipo}
                    sx={{ mb: 3 }}
                >
                    {mensagem.texto}
                </Alert>

            )}

            <Grid container spacing={3}>

                {/* TEMPORADA ATUAL */}

                <Grid item xs={12} md={6}>

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
                            🏆 Temporada Atual
                        </Typography>

                        <Divider
                            sx={{ mb: 2 }}
                        />

                        {temporadaAtual ? (

                            <>

                                <Typography>
                                    Nome:
                                    {" "}
                                    <strong>
                                        {
                                            temporadaAtual.nome
                                        }
                                    </strong>
                                </Typography>

                                <Typography>
                                    Início:
                                    {" "}
                                    {
                                        new Date(
                                            temporadaAtual.data_inicio
                                        )
                                        .toLocaleDateString(
                                            "pt-BR"
                                        )
                                    }
                                </Typography>

                                <Typography>
                                    Fim:
                                    {" "}
                                    {
                                        new Date(
                                            temporadaAtual.data_fim
                                        )
                                        .toLocaleDateString(
                                            "pt-BR"
                                        )
                                    }
                                </Typography>

                                <Box
                                    sx={{
                                        mt: 2
                                    }}
                                >

                                    <Chip
                                        color="success"
                                        label={`${temporadaAtual.dias_restantes} dias restantes`}
                                    />

                                </Box>

                            </>

                        ) : (

                            <Typography>
                                Nenhuma temporada ativa
                            </Typography>

                        )}

                    </Paper>

                </Grid>

                {/* SALVAR RANKING */}

                <Grid item xs={12} md={6}>

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
                            💾 Encerrar Temporada
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

                {/* NOVA TEMPORADA */}

                <Grid item xs={12}>

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
                            ➕ Nova Temporada
                        </Typography>

                        <Divider
                            sx={{ mb: 3 }}
                        />

                        <Grid
                            container
                            spacing={2}
                        >

                            <Grid
                                item
                                xs={12}
                                md={4}
                            >

                                <TextField
                                    fullWidth
                                    label="Nome"
                                    value={
                                        novaTemporada.nome
                                    }
                                    onChange={(
                                        e
                                    ) =>
                                        setNovaTemporada(
                                            {
                                                ...novaTemporada,
                                                nome:
                                                    e
                                                        .target
                                                        .value
                                            }
                                        )
                                    }
                                />

                            </Grid>

                            <Grid
                                item
                                xs={12}
                                md={4}
                            >

                                <TextField
                                    fullWidth
                                    type="date"
                                    label="Início"
                                    InputLabelProps={{
                                        shrink:
                                            true
                                    }}
                                    value={
                                        novaTemporada.data_inicio
                                    }
                                    onChange={(
                                        e
                                    ) =>
                                        setNovaTemporada(
                                            {
                                                ...novaTemporada,
                                                data_inicio:
                                                    e
                                                        .target
                                                        .value
                                            }
                                        )
                                    }
                                />

                            </Grid>

                            <Grid
                                item
                                xs={12}
                                md={4}
                            >

                                <TextField
                                    fullWidth
                                    type="date"
                                    label="Fim"
                                    InputLabelProps={{
                                        shrink:
                                            true
                                    }}
                                    value={
                                        novaTemporada.data_fim
                                    }
                                    onChange={(
                                        e
                                    ) =>
                                        setNovaTemporada(
                                            {
                                                ...novaTemporada,
                                                data_fim:
                                                    e
                                                        .target
                                                        .value
                                            }
                                        )
                                    }
                                />

                            </Grid>

                        </Grid>

                        <Button
                            sx={{ mt: 3 }}
                            variant="contained"
                            startIcon={
                                <Add />
                            }
                            onClick={
                                criarTemporada
                            }
                        >
                            Criar Temporada
                        </Button>

                    </Paper>

                </Grid>

                {/* NAVEGAÇÃO */}

                <Grid item xs={12}>

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
                            🔗 Acesso Rápido
                        </Typography>

                        <Divider
                            sx={{ mb: 3 }}
                        />

                        <Box
                            sx={{
                                display: "flex",
                                gap: 2,
                                flexWrap: "wrap"
                            }}
                        >

                            <Button
                                variant="contained"
                                startIcon={
                                    <EmojiEvents />
                                }
                                onClick={() =>
                                    navigate(
                                        "/Temporadas"
                                    )
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
                                    navigate(
                                        "/Loja"
                                    )
                                }
                            >
                                Loja
                            </Button>

                        </Box>

                    </Paper>

                </Grid>

            </Grid>

        </Container>

    );

}