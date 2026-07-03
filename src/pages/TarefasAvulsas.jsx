import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import {
    Container,
    Typography,
    Card,
    CardContent,
    Grid,
    Box,
    Button,
    Checkbox,
    Chip,
    TextField,
    Select,
    MenuItem,
    InputLabel,
    FormControl,
    CircularProgress,
    Snackbar,
    Alert,
    Divider
} from "@mui/material";

import LogoutIcon from "@mui/icons-material/Logout";

const API_URL = "http://192.168.1.185:8077";

export default function TarefasAvulsas() {

    const navigate = useNavigate();

    // =========================
    // USER
    // =========================
    const [userInfo] = useState(() => {
        const u = localStorage.getItem("user_info");
        return u ? JSON.parse(u) : null;
    });

    // =========================
    // DATA
    // =========================
    const [tarefas, setTarefas] = useState([]);
    const [funcionarios, setFuncionarios] = useState([]);

    const [selecionadas, setSelecionadas] = useState([]);
    const [operadoresSelecionados, setOperadoresSelecionados] = useState([]);

    const [prioridade, setPrioridade] = useState("MEDIA");
    const [busca, setBusca] = useState("");

    const [loading, setLoading] = useState(false);

    const [snackbar, setSnackbar] = useState({
        open: false,
        severity: "success",
        message: ""
    });

    // =========================
    // LOAD
    // =========================
    useEffect(() => {
        carregar();
    }, []);

    async function carregar() {
        try {
            setLoading(true);

            const [funcionariosRes] = await Promise.all([
                axios.get(`${API_URL}/api/tarefas/listar`),
                axios.get(`${API_URL}/api/funcionarios/listar`)
            ]);

            setTarefas(tarefasRes.data.data || []);

            const operadoresAtivos = (funcionariosRes.data || [])
                .filter(f => f.ativo === 1)
                .map(f => ({
                    id: f.codigo,
                    nome: f.nome,
                    codigo: f.codigo
                }));

            setFuncionarios(operadoresAtivos);

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    // =========================
    // HELPERS
    // =========================
    function toggleTarefa(id) {
        setSelecionadas(prev =>
            prev.includes(id)
                ? prev.filter(x => x !== id)
                : [...prev, id]
        );
    }

    function toggleOperador(id) {
        setOperadoresSelecionados(prev =>
            prev.includes(id)
                ? prev.filter(x => x !== id)
                : [...prev, id]
        );
    }

    function diasAbertos(data) {
        if (!data) return 0;
        return Math.floor((new Date() - new Date(data)) / 86400000);
    }

    function prioridadeColor(p) {
        switch (p) {
            case "URGENTE": return "error";
            case "ALTA": return "warning";
            case "MEDIA": return "info";
            case "BAIXA": return "success";
            default: return "default";
        }
    }

    // =========================
    // ATRIBUIÇÃO
    // =========================
    async function distribuir() {

        if (!selecionadas.length || !operadoresSelecionados.length) {
            setSnackbar({
                open: true,
                severity: "warning",
                message: "Selecione tarefas e operadores"
            });
            return;
        }

        try {
            setLoading(true);

            await Promise.all(
                selecionadas.map(id =>
                    axios.post(`${API_URL}/api/tarefas/atribuir`, {
                        tarefa_id: id,
                        operadores: operadoresSelecionados,
                        prioridade,
                        atribuido_por: userInfo?.codigo
                    })
                )
            );

            setSelecionadas([]);
            setOperadoresSelecionados([]);

            setSnackbar({
                open: true,
                severity: "success",
                message: "Tarefas distribuídas com sucesso"
            });

            carregar();

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    // =========================
    // KPIs
    // =========================
    const totalTarefas = tarefas.length;
    const semOperador = tarefas.filter(t => !t.operadores?.length).length;
    const emAndamento = tarefas.filter(t => t.status === "EM_ANDAMENTO").length;
    const atrasadas = tarefas.filter(t => diasAbertos(t.created_at) > 2).length;

    const operadoresComCarga = funcionarios.map(op => ({
        ...op,
        tarefas: tarefas.filter(t =>
            t.operadores?.includes(op.id)
        ),
        carga: tarefas.filter(t =>
            t.operadores?.includes(op.id)
        ).length
    }));

    // =========================
    // FILTRO
    // =========================
    const tarefasFiltradas = tarefas.filter(t =>
        t.descricao?.toLowerCase().includes(busca.toLowerCase())
    );

    // =========================
    // RENDER CARD
    // =========================
    const renderTarefa = (t) => {

        const dias = diasAbertos(t.created_at);

        return (
            <Card sx={{
                mb: 2,
                borderLeft: `6px solid ${
                    t.tipo === "SEPARACAO"
                        ? "#1976d2"
                        : t.tipo === "GUARDA"
                        ? "#2e7d32"
                        : "#ed6c02"
                }`
            }}>

                <CardContent>
                    <Checkbox
                        checked={selecionadas.includes(t.id)}
                        onChange={() => toggleTarefa(t.id)}
                    />

                    <Typography fontWeight="bold">
                        {t.descricao}
                    </Typography>

                    <Box mt={1} display="flex" gap={1} flexWrap="wrap">
                        <Chip label={t.tipo} size="small" />

                        <Chip
                            label={t.prioridade}
                            size="small"
                            color={prioridadeColor(t.prioridade)}
                        />

                        <Chip
                            label={`${dias}d`}
                            size="small"
                            color={dias > 2 ? "error" : "success"}
                        />
                    </Box>
                </CardContent>
            </Card>
        );
    };

    return (
        <Container maxWidth="xl" sx={{ mt: 3 }}>
            {/* HEADER */}
            <Box sx={{
                display: "flex",
                justifyContent: "space-between",
                mb: 3,
                p: 2,
                bgcolor: "#1976d2",
                color: "#fff",
                borderRadius: 2
            }}>
                <Typography variant="h5">
                    Painel de controle logístico
                </Typography>

                <Box display="flex" gap={2}>
                    <Typography>{userInfo?.nome}</Typography>
                    <LogoutIcon />
                </Box>
            </Box>

            {/* KPIs */}
            <Grid container spacing={2} mb={3}>

                <Grid item xs={12} md={3}>
                    <Card sx={{bgcolor: 'background.default'}}><CardContent>
                        <Typography variant="h4">{totalTarefas}</Typography>
                        <Typography>Total tarefas</Typography>
                    </CardContent></Card>
                </Grid>

                <Grid item xs={12} md={3}>
                    <Card sx={{bgcolor: 'background.default'}}><CardContent>
                        <Typography variant="h4" color="warning.main">
                            {semOperador}
                        </Typography>
                        <Typography>Sem operador</Typography>
                    </CardContent></Card>
                </Grid>

                <Grid item xs={12} md={3}>
                    <Card sx={{bgcolor: 'background.default'}}><CardContent>
                        <Typography variant="h4" color="success.main">
                            {emAndamento}
                        </Typography>
                        <Typography>Em execução</Typography>
                    </CardContent></Card>
                </Grid>

                <Grid item xs={12} md={3}>
                    <Card sx={{bgcolor: 'background.default'}}><CardContent>
                        <Typography variant="h4" color="error.main">
                            {atrasadas}
                        </Typography>
                        <Typography>Atrasadas</Typography>
                    </CardContent></Card>
                </Grid>

            </Grid>

            {/* BUSCA */}
            <Card sx={{ mb: 3, bgcolor: 'background.default' }}>
                <CardContent>
                    <TextField
                        fullWidth
                        label="Buscar tarefa"
                        value={busca}
                        onChange={e => setBusca(e.target.value)}
                    />
                </CardContent>
            </Card>

            {/* LAYOUT */}
            <Grid container spacing={3}>

                {/* TAREFAS */}
                <Grid item xs={12} md={8}>
                    {tarefasFiltradas.map(renderTarefa)}
                </Grid>

                {/* OPERADORES */}
                <Grid item xs={12} md={4}>

                    <Card sx={{bgcolor: 'background.default'}}>
                        <CardContent>

                            <Typography variant="h6">
                                Funcionários
                            </Typography>

                            <Divider sx={{ mb: 2 }} />

                            {operadoresComCarga.map(op => (
                                <Box key={op.id}
                                    display="flex"
                                    justifyContent="space-between"
                                    mb={1}
                                >
                                    <Typography>
                                        {op.nome}
                                    </Typography>

                                    <Chip
                                        label={op.carga}
                                        color={op.carga > 5 ? "error" : "success"}
                                    />
                                </Box>
                            ))}

                            <Divider sx={{ my: 2 }} />

                            <FormControl fullWidth>
                                <InputLabel>Prioridade</InputLabel>
                                <Select
                                    value={prioridade}
                                    onChange={e => setPrioridade(e.target.value)}
                                >
                                    <MenuItem value="URGENTE">URGENTE</MenuItem>
                                    <MenuItem value="ALTA">ALTA</MenuItem>
                                    <MenuItem value="MEDIA">MEDIA</MenuItem>
                                    <MenuItem value="BAIXA">BAIXA</MenuItem>
                                </Select>
                            </FormControl>

                            <Button
                                fullWidth
                                variant="contained"
                                sx={{ mt: 2 }}
                                onClick={distribuir}
                            >
                                Distribuir tarefas
                            </Button>

                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* LOADING */}
            {loading && (
                <Box sx={{
                    position: "fixed",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: "rgba(0,0,0,0.4)"
                }}>
                    <CircularProgress />
                </Box>
            )}

            {/* SNACKBAR */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar(s => ({ ...s, open: false }))}
            >
                <Alert severity={snackbar.severity}>
                    {snackbar.message}
                </Alert>
            </Snackbar>

        </Container>
    );
}