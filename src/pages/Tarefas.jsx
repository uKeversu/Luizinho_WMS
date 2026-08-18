import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import {
    Alert,
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    Checkbox,
    Chip,
    CircularProgress,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Drawer,
    FormControl,
    FormControlLabel,
    Grid,
    IconButton,
    InputAdornment,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    MenuItem,
    Modal,
    Radio,
    Select,
    Snackbar,
    Stack,
    Tab,
    Tabs,
    TextField,
    Tooltip,
    Typography,
    Fab
} from "@mui/material";

import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import SearchIcon from "@mui/icons-material/Search";
import AssignmentIcon from "@mui/icons-material/Assignment";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import PersonRemoveIcon from "@mui/icons-material/PersonRemove";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import InfoIcon from "@mui/icons-material/Info";
import SchoolIcon from "@mui/icons-material/School";
import HistoryIcon from "@mui/icons-material/History";
import StarIcon from "@mui/icons-material/Star";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import SaveIcon from "@mui/icons-material/Save";
import ArticleIcon from '@mui/icons-material/Article';
import WarningIcon from '@mui/icons-material/Warning';
import LeaderboardIcon from "@mui/icons-material/Leaderboard";
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

import LoginFuncionario from "../components/LoginFuncionario";

const API_URL = "http://192.168.1.185:8077";

export default function Tarefas() {

    const navigate = useNavigate();

    // USUÁRIO

    const [userInfo] = useState(() => {
        const u = localStorage.getItem("user_info");
        return u ? JSON.parse(u) : null;
    });

    const [token, setToken] = useState(
        () => localStorage.getItem("nfe_token") || ""
    );

    function logout() {
        localStorage.removeItem("nfe_token");
        localStorage.removeItem("user_info");
        setToken("");
        navigate("/");
    }

    // Cadastro de funcionario
    const [openDialog, setOpenDialog] = useState(false);
    const [senhaAdmin, setSenhaAdmin] = useState("");
    const [showSenha, setShowSenha] = useState(false);

    // STATES
    const [tarefas, setTarefas] = useState([]);
    const [funcionarios, setFuncionarios] = useState([]);
    const [dashboard, setDashboard] = useState({
        tarefas: 0,
        colaboradores: 0,
        livres: 0,
        atribuidos: 0
    });
    const [busca, setBusca] = useState("");
    const [buscaColaborador, setBuscaColaborador] = useState("");
    const [tarefaSelecionada, setTarefaSelecionada] = useState(null);
    const [funcionariosSelecionados, setFuncionariosSelecionados] = useState([]);
    const [novaTarefa, setNovaTarefa] = useState("");
    const [editarTarefa, setEditarTarefa] = useState(null);
    const [dialogExcluir, setDialogExcluir] = useState(false);
    const [modalColaboradores, setModalColaboradores] = useState(null);
    const [drawerFuncionario, setDrawerFuncionario] = useState(false);
    const [funcionarioSelecionado, setFuncionarioSelecionado] = useState(null);
    const [detalhesFuncionario, setDetalhesFuncionario] = useState(null);
    const [modalCompetencias, setModalCompetencias] = useState(false);
    const [competencias, setCompetencias] = useState([]);
    const [modalObservacao, setModalObservacao] = useState(false);
    const [tipoObservacao, setTipoObservacao] = useState("ELOGIO");
    const [descricaoObservacao, setDescricaoObservacao] = useState("");
    const [impactoPontos, setImpactoPontos] = useState(0);
    const [tabDrawer, setTabDrawer] = useState(0);
    const [loading, setLoading] = useState(false);
    const [modalNovaTarefa, setModalNovaTarefa] = useState(false);

    const [snackbar, setSnackbar] = useState({
        open: false,
        severity: "success",
        message: ""
    });

    useEffect(() => {

        carregar();

        const interval = setInterval(() => {

            carregar(false);

        }, 15000);

        return () => clearInterval(interval);

    }, []);

    // CARREGAR DADOS
    async function carregar(showLoading = true) {

        try {

            if (showLoading)
                setLoading(true);

            const [
                tarefasRes,
                funcionariosRes
            ] = await Promise.all([
                axios.get(`${API_URL}/api/tarefas`),
                axios.get(`${API_URL}/api/tarefas/funcionarios`)
            ]);

            setTarefas(tarefasRes.data);
            setFuncionarios(funcionariosRes.data);

            setDashboard({
                tarefas: tarefasRes.data.length,
                colaboradores: funcionariosRes.data.length,
                livres: funcionariosRes.data.filter(f => !f.tarefa_id).length,
                atribuidos: funcionariosRes.data.filter(f => f.tarefa_id).length
            });

        } catch (err) {

            console.error(err);

            setSnackbar({
                open: true,
                severity: "error",
                message: "Erro ao carregar painel."
            });

        } finally {

            if (showLoading)
                setLoading(false);

        }

    }

    // DETALHES DO FUNCIONÁRIO
    async function abrirFuncionario(codigo) {

        try {

            setLoading(true);

            const { data } = await axios.get(
                `${API_URL}/api/tarefas/funcionarios/${codigo}`
            );

            setFuncionarioSelecionado(codigo);

            setDetalhesFuncionario(data);

            setDrawerFuncionario(true);

            setTabDrawer(0);

        }
        catch (err) {

            console.error(err);

            setSnackbar({
                open: true,
                severity: "error",
                message: "Erro ao carregar colaborador."
            });

        }
        finally {
            setLoading(false);
        }
    }

    // HELPERS
    function corTarefa(cor) {

        return cor || "#1976d2";

    }

    function toggleFuncionario(codigo) {

        setFuncionariosSelecionados(prev =>

            prev.includes(codigo)

                ? prev.filter(x => x !== codigo)

                : [...prev, codigo]

        );

    }

    function limparSelecao() {

        setFuncionariosSelecionados([]);

        setTarefaSelecionada(null);

    }

    function formatarHora(data) {

        if (!data)
            return "";

        return new Date(data).toLocaleTimeString(
            "pt-BR",
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );

    }

    function tempoNaTarefa(data) {

        if (!data)
            return "";

        const minutos = Math.floor(
            (Date.now() - new Date(data)) / 60000
        );

        const dias = Math.floor(minutos / 1440);

        const horas = Math.floor((minutos % 1440) / 60);

        const mins = minutos % 60;

        if (dias > 0)
            return `${dias}d ${horas}h`;

        if (horas > 0)
            return `${horas}h ${mins}min`;

        return `${mins} min`;

    }

    // FILTROS
    const tarefasFiltradas = useMemo(() => {

        if (!busca.trim())
            return tarefas;

        const texto = busca.toLowerCase();

        return tarefas.filter(tarefa => {

            if (tarefa.nome.toLowerCase().includes(texto))
                return true;

            return tarefa.colaboradores.some(c =>

                c.nome.toLowerCase().includes(texto)

                ||

                c.codigo.includes(texto)

            );

        });

    }, [tarefas, busca]);

    const funcionariosSemTarefa = useMemo(() => {

        return funcionarios.filter(f => !f.tarefa_id);

    }, [funcionarios]);

    const funcionariosFiltrados = useMemo(() => {

        if (!buscaColaborador.trim())
            return funcionarios;

        const texto = buscaColaborador.toLowerCase();

        return funcionarios.filter(f =>

            f.nome.toLowerCase().includes(texto)

            ||

            f.codigo.includes(texto)

        );

    }, [funcionarios, buscaColaborador]);

    // MÉTRICAS
    const totalObservacoes = useMemo(() => {

        if (!detalhesFuncionario)
            return 0;

        return detalhesFuncionario.observacoes.length;

    }, [detalhesFuncionario]);

    const totalCompetencias = useMemo(() => {

        if (!detalhesFuncionario)
            return 0;

        return detalhesFuncionario.competencias.length;

    }, [detalhesFuncionario]);
  
    const saldoPontos = useMemo(() => {

        if (!detalhesFuncionario)
            return 0;

        return detalhesFuncionario.estatisticas.saldo_pontos;

    }, [detalhesFuncionario]);

    // ATRIBUIR TAREFA
    async function atribuir() {

        if (!tarefaSelecionada) {

            setSnackbar({
                open: true,
                severity: "warning",
                message: "Selecione uma tarefa."
            });

            return;
        }

        if (funcionariosSelecionados.length === 0) {

            setSnackbar({
                open: true,
                severity: "warning",
                message: "Selecione pelo menos um colaborador."
            });

            return;
        }

        try {

            setLoading(true);

            const { data } = await axios.post(
                `${API_URL}/api/tarefas/atribuir`,
                {
                    tarefa: tarefaSelecionada,
                    funcionarios: funcionariosSelecionados,
                    supervisor: userInfo.codigo
                }
            );

            limparSelecao();

            carregar(false);

            let mensagem = data.message;
            let severity = "success";

            if (data.ignorados?.length) {
                mensagem += ` (${data.ignorados.length} sem competência)`;

                if (data.ignorados.length === funcionariosSelecionados.length) {
                    severity = "error";
                } else {
                    severity = "warning";
                }
            }

            setSnackbar({
                open: true,
                severity,
                message: mensagem
            });

        }

        catch (err) {
            console.error(err);
            setSnackbar({
                open: true,
                severity: "error",
                message:
                    err.response?.data?.message ||
                    "Erro ao atribuir tarefa."
            });
        }
        finally {
            setLoading(false);
        }
    }

    // CADASTRAR TAREFA
    async function cadastrarTarefa() {
        if (!novaTarefa.trim())
            return;
        try {
            await axios.post(
                `${API_URL}/api/tarefas`,
                {
                    nome: novaTarefa,
                    usuario: userInfo.codigo
                }
            );
            setNovaTarefa("");
            carregar(false);
            setSnackbar({
                open: true,
                severity: "success",
                message: "Tarefa cadastrada."
            });
        }
        catch (err) {
            console.error(err);
            setSnackbar({
                open: true,
                severity: "error",
                message:
                    err.response?.data?.message ||
                    "Erro ao cadastrar."
            });
        }
    }

    // EDITAR TAREFA
    async function salvarEdicaoTarefa() {
        if (!editarTarefa)
            return;
        try {
            await axios.put(
                `${API_URL}/api/tarefas/${editarTarefa.id}`,
                {
                    nome: editarTarefa.nome
                }
            );
            setEditarTarefa(null);
            carregar(false);
            setSnackbar({
                open: true,
                severity: "success",
                message: "Tarefa atualizada."
            });
        }
        catch (err) {
            console.error(err);
            setSnackbar({
                open: true,
                severity: "error",
                message:
                    err.response?.data?.message ||
                    "Erro ao editar."
            });
        }
    }

    // EXCLUIR TAREFA
    async function excluirTarefa() {
        if (!editarTarefa)
            return;
        try {
            await axios.delete(
                `${API_URL}/api/tarefas/${editarTarefa.id}`
            );
            setDialogExcluir(false);
            setEditarTarefa(null);
            carregar(false);
            setSnackbar({
                open: true,
                severity: "success",
                message: "Tarefa removida."
            });
        }
        catch (err) {
            console.error(err);
            setSnackbar({
                open: true,
                severity: "error",
                message:
                    err.response?.data?.message ||
                    "Erro ao excluir."
            });
        }
    }

    // REMOVER COLABORADOR
    async function removerFuncionario(codigo) {
        try {
            await axios.delete(
                `${API_URL}/api/tarefas/remover/${codigo}`,
                {
                    params: {
                        supervisor: userInfo.codigo
                    }
                }
            );
            setModalColaboradores(null);
            carregar(false);
            setSnackbar({
                open: true,
                severity: "success",
                message: "Colaborador removido."
            });
        }
        catch (err) {
            console.error(err);
            setSnackbar({
                open: true,
                severity: "error",
                message:
                    err.response?.data?.message ||
                    "Erro ao remover."
            });
        }
    }

    // CARREGAR COMPETÊNCIAS
    async function abrirCompetencias() {
        try {
            const { data } = await axios.get(
                `${API_URL}/api/tarefas/competencias/${funcionarioSelecionado}`
            );
            setCompetencias(data.competencias);
            setModalCompetencias(true);
        }
        catch (err) {
            console.error(err);
        }
    }

    // SALVAR COMPETÊNCIAS
    async function salvarCompetencias() {
        try {
            await axios.post(
                `${API_URL}/api/tarefas/competencias`,
                {
                    funcionario: funcionarioSelecionado,
                    supervisor: userInfo.codigo,
                    competencias
                }
            );
            setModalCompetencias(false);
            abrirFuncionario(funcionarioSelecionado);
            setSnackbar({
                open: true,
                severity: "success",
                message: "Competências atualizadas."
            });
        }
        catch (err) {
            console.error(err);
        }
    }

    // NOVA OBSERVAÇÃO
    async function salvarObservacao() {
        try {
            await axios.post(
                `${API_URL}/api/tarefas/observacoes`,
                {
                    funcionario: funcionarioSelecionado,
                    tarefa_id:
                        detalhesFuncionario.funcionario.tarefa_id,
                    supervisor: userInfo.codigo,
                    tipo: tipoObservacao,
                    descricao: descricaoObservacao,
                }
            );
            setDescricaoObservacao("");
            setTipoObservacao("ELOGIO");
            setModalObservacao(false);
            abrirFuncionario(funcionarioSelecionado);
            setSnackbar({
                open: true,
                severity: "success",
                message: "Observação registrada."
            });
        }
        catch (err) {
            console.error(err);
        }
    }

    // EXCLUIR OBSERVAÇÃO
    async function excluirObservacao(id) {

        try {

            await axios.delete(

                `${API_URL}/api/tarefas/observacoes/${id}`

            );

            abrirFuncionario(funcionarioSelecionado);

            setSnackbar({
                open: true,
                severity: "success",
                message: "Observação excluída."
            });
        }

        catch (err) {

            console.error(err);

        }

    }

    // Bloqueia cadastro sem senha
    const acessarCadastro = () => {
        if (senhaAdmin !== "Admin100378") {
            setSnackbar({
                open: true,
                message: "Senha de administrador inválida",
                severity: "error"
            });
            return;
        }

        setOpenDialog(false);
        setSenhaAdmin("");
        navigate("/CadastrarFuncionario");
    };

    return (
        !token ? (
            <LoginFuncionario
                onLogin={(data) => {
                    localStorage.setItem("nfe_token", data.token);

                    const user = {
                        nome: data.nome,
                        codigo: data.codigo
                    };

                    localStorage.setItem("user_info", JSON.stringify(user));

                    setUserInfo(user);
                    setToken(data.token);
                }}
            />
        ) : (

            <Container
                maxWidth="xl"
                sx={{
                    mt: 2,
                    mb: 5
                }}
            >

                {/* HEADER */}
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: {
                            xs: 'column',
                            md: 'row'
                        },
                        justifyContent: 'space-between',
                        alignItems: {
                            xs: 'flex-start',
                            md: 'center'
                        },
                        gap: 2,
                        p: 2,
                        bgcolor: 'var(--azul)',
                        mb: 2,
                        borderRadius: '2vh',
                        zoom: '0.9'
                    }}
                >
                    <Typography
                        variant="h4"
                        sx={{
                            fontFamily: 'Consolas',
                            color: "background.paper"
                        }}
                    >
                        <strong>
                            Gestão de tarefas
                        </strong>
                    </Typography>

                    <Box>
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'right'
                            }}
                        >

                            <PersonIcon
                                sx={{
                                    color: "background.paper",
                                    pr: 1
                                }}
                            />

                            <Typography
                                sx={{
                                    color: "background.paper",
                                    fontSize: '0.9rem'
                                }}
                            >
                                {userInfo?.nome}
                            </Typography>

                            {token && (

                                <Button
                                    size="small"
                                    onClick={logout}
                                    sx={{
                                        color: "background.paper"
                                    }}
                                >
                                    <LogoutIcon />
                                </Button>
                            )}
                        </Box>

                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'right'
                            }}
                        >
                            <Tooltip title="Cadastro de funcionários">
                                <Button
                                    onClick={() => setOpenDialog(true)}
                                    sx={{
                                        color: "background.paper",
                                        display: 'flex',
                                        gap: 0.5,
                                        fontSize: '0.75rem',
                                        minWidth: 'auto',
                                        padding: '4px 8px',
                                        whiteSpace: 'nowrap'
                                    }}
                                >
                                    FUNCIONARIOS
                                    {< PersonAddIcon />}
                                </Button>
                            </Tooltip>
                            <Tooltip title="Desempenho dos conferentes">
                                <Button
                                    onClick={() => navigate("/Produtividade")}
                                    sx={{
                                        color: "background.paper",
                                        display: "flex",
                                        gap: 0.7,
                                        fontSize: "0.75rem",
                                        minWidth: "auto",
                                        padding: "4px 10px",
                                        whiteSpace: "nowrap",
                                    }}
                                >
                                    PRODUTIVIDADE
                                    <LeaderboardIcon fontSize="small" />
                                </Button>
                            </Tooltip>
                            <Tooltip title="Notas com pendências ou alertas">
                                <Button
                                    onClick={() => navigate("/Alertas")}
                                    sx={{
                                        color: "background.paper",
                                        display: 'flex',
                                        gap: 0.5,
                                        fontSize: '0.75rem',
                                        minWidth: 'auto',
                                        padding: '4px 8px',
                                        whiteSpace: 'nowrap'
                                    }}
                                >
                                    Alertas
                                    {< WarningIcon />}
                                </Button>
                            </Tooltip>
                            <Tooltip title="Dashboard de notas recebidas">
                                <Button
                                    onClick={() => navigate("/")}
                                    sx={{
                                        color: "background.paper",
                                        display: 'flex',
                                        gap: 0.5,
                                        fontSize: '0.75rem',
                                        minWidth: 'auto',
                                        padding: '4px 8px',
                                        whiteSpace: 'nowrap'
                                    }}
                                >
                                    NOTAS
                                    {< ArticleIcon />}
                                </Button>
                            </Tooltip>
                            <Tooltip title="Atribua notas para conferentes">
                                <Button
                                    onClick={() =>
                                        navigate("/PainelGerencial")
                                    }
                                    sx={{
                                        color: "background.paper",
                                        display: 'flex',
                                        gap: 0.5,
                                        fontSize: '0.75rem',
                                        minWidth: 'auto',
                                        padding: '4px 8px',
                                        whiteSpace: 'nowrap'
                                    }}
                                >
                                    ATRIBUIÇÕES
                                    <AssignmentTurnedInIcon />
                                </Button>
                            </Tooltip>
                        </Box>
                    </Box>
                </Box>

                {/* DASHBOARD */}
                <Box
                    sx={{
                        display: 'flex',
                        gap: 2,
                        mb: 2,
                        flexDirection: { xs: 'column', md: 'row' },
                        alignItems: 'stretch',
                        width: '100%'
                    }}
                >
                    {/* BARRA DE BUSCA */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Card sx={{ bgcolor: 'background.card', height: '100%', display: 'flex', alignItems: 'center' }}>
                            <CardContent sx={{ width: '100%', '&:last-child': { pb: 2 } }}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    value={busca}
                                    onChange={(e) => setBusca(e.target.value)}
                                    placeholder="Pesquisar tarefa ou colaborador"
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchIcon />
                                            </InputAdornment>
                                        )
                                    }}
                                    autoComplete="off"
                                    inputProps={{
                                        spellCheck: false,
                                        autoCorrect: "off",
                                        autoCapitalize: "off",
                                    }}
                                />
                            </CardContent>
                        </Card>
                    </Box>

                    {/* CONTAINER DAS MÉTRICAS - Alinhados lado a lado no final */}
                    <Box
                        sx={{
                            display: 'flex',
                            gap: 2,
                            flexWrap: { xs: 'wrap', md: 'nowrap' },
                            justifyContent: 'space-between'
                        }}
                    >
                        {/* METRICA 1 - TAREFAS */}
                        <Card sx={{ bgcolor: 'background.card', width: { xs: 'calc(50% - 8px)', md: '110px' }, height: '100%' }}>
                            <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 }, textAlign: 'center' }}>
                                <Typography variant="h5" fontWeight="bold" color="warning.main">
                                    {dashboard.tarefas}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" display="block" noWrap>
                                    Tarefas
                                </Typography>
                            </CardContent>
                        </Card>

                        {/* METRICA 2 - COLABORADORES */}
                        <Card sx={{ bgcolor: 'background.card', width: { xs: 'calc(50% - 8px)', md: '110px' }, height: '100%' }}>
                            <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 }, textAlign: 'center' }}>
                                <Typography variant="h5" fontWeight="bold" color="info.main">
                                    {dashboard.colaboradores}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" display="block" noWrap>
                                    Colaboradores
                                </Typography>
                            </CardContent>
                        </Card>

                        {/* METRICA 3 - LIVRES */}
                        <Card sx={{ bgcolor: 'background.card', width: { xs: 'calc(50% - 8px)', md: '110px' }, height: '100%' }}>
                            <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 }, textAlign: 'center' }}>
                                <Typography variant="h5" fontWeight="bold" color="success.main">
                                    {dashboard.livres}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" display="block" noWrap>
                                    Livres
                                </Typography>
                            </CardContent>
                        </Card>

                        {/* METRICA 4 - EM ATIVIDADE */}
                        <Card sx={{ bgcolor: 'background.card', width: { xs: 'calc(50% - 8px)', md: '110px' }, height: '100%' }}>
                            <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 }, textAlign: 'center' }}>
                                <Typography variant="h5" fontWeight="bold" color="primary.main">
                                    {dashboard.atribuidos}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" display="block" noWrap>
                                    Em atividade
                                </Typography>
                            </CardContent>
                        </Card>
                    </Box>
                </Box>

                {/* CONTAINER PRINCIPAL*/}
                <Box
                    sx={{
                        display: 'flex',
                        gap: 3,
                        width: '100%',
                        flexDirection: { xs: 'column', md: 'row' },
                        alignItems: 'stretch',
                        mb: 1
                    }}
                >

                    {/* COLUNA ESQUERDA - SEM TAREFA (Largura: 20%) */}
                    <Box sx={{ flex: { xs: '1 1 auto', md: '2' }, minWidth: 0 }}>
                        <Card
                            sx={{
                                bgcolor: "background.card",
                                height: "100%",
                                display: "flex",
                                flexDirection: "column",
                                borderRadius: 2
                            }}
                        >
                            <CardContent sx={{ display: "flex", flexDirection: "column", height: "100%", p: 2 }}>
                                <Stack
                                    direction="row"
                                    justifyContent="space-between"
                                    alignItems="center"
                                    mb={2}
                                >
                                    <Typography
                                        variant="subtitle1"
                                        fontWeight="bold"
                                    >
                                        Sem tarefa
                                    </Typography>

                                    <Chip
                                        color="success"
                                        size="small"
                                        label={funcionariosSemTarefa.length}
                                    />
                                </Stack>

                                <Divider sx={{ mb: 2 }} />

                                <Box
                                    sx={{
                                        flexGrow: 1,
                                        maxHeight: "380px",
                                        overflowY: "auto",
                                        pr: 0.5,
                                        "&::-webkit-scrollbar": { width: "6px" },
                                        "&::-webkit-scrollbar-thumb": { bgcolor: "rgba(255,255,255,0.15)", borderRadius: "4px" }
                                    }}
                                >
                                    {funcionariosSemTarefa.length === 0 ? (
                                        <Typography color="text.secondary" variant="body2">
                                            Todos os colaboradores possuem tarefa.
                                        </Typography>
                                    ) : (
                                        funcionariosSemTarefa.map(funcionario => (
                                            <ListItemButton
                                                key={funcionario.codigo}
                                                sx={{
                                                    borderRadius: 2,
                                                    mb: 1,
                                                    p: 1,
                                                    bgcolor: "rgba(255, 255, 255, 0.03)"
                                                }}
                                                onClick={() => abrirFuncionario(funcionario.codigo)}
                                            >
                                                <Avatar
                                                    sx={{
                                                        mr: 1.5,
                                                        width: 36,
                                                        height: 36,
                                                        bgcolor: "success.main",
                                                    }}
                                                >
                                                    <PersonIcon fontSize="small" />
                                                </Avatar>

                                                <ListItemText
                                                    primary={funcionario.nome}
                                                    secondary={funcionario.codigo}
                                                    primaryTypographyProps={{ variant: "body2", fontWeight: "medium", noWrap: true }}
                                                    secondaryTypographyProps={{ variant: "caption", noWrap: true }}
                                                />
                                            </ListItemButton>
                                        ))
                                    )}
                                </Box>
                            </CardContent>
                        </Card>
                    </Box>

                    {/* COLUNA CENTRAL - CARDS DAS TAREFAS (Largura: 60%)*/}
                    <Box
                        sx={{
                            flex: { xs: '1 1 auto', md: '6' },
                            minWidth: 0,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 2
                        }}
                    >
                        <Box
                            sx={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: 2,
                                width: '100%'
                            }}
                        >
                            {tarefasFiltradas.map((tarefa) => (
                                <Card
                                    key={tarefa.id}
                                    sx={{
                                        flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', lg: '1 1 calc(33.333% - 11px)' },
                                        minWidth: '200px',
                                        borderLeft: `6px solid ${corTarefa(tarefa.cor)}`,
                                        transition: ".2s",
                                        "&:hover": {
                                            transform: "translateY(-4px)",
                                            boxShadow: 6
                                        },
                                        bgcolor: 'background.card',
                                        borderRadius: 2,
                                    }}
                                >
                                    <CardContent sx={{ p: 2 }}>
                                        <Stack
                                            direction="row"
                                            justifyContent="space-between"
                                            alignItems="flex-start"
                                        >
                                            <Box sx={{ minWidth: 0 }}>
                                                <Typography
                                                    variant="h7"
                                                    fontWeight="bold"
                                                    noWrap
                                                >
                                                    {tarefa.nome}
                                                </Typography>

                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                >
                                                    {tarefa.colaboradores.length} colaborador(es)
                                                </Typography>
                                            </Box>

                                            <Chip
                                                size="small"
                                                sx={{ padding: "4px 8px", ml: 1 }}
                                                color="primary"
                                                icon={<AssignmentIcon style={{ fontSize: 16 }} />}
                                                label={tarefa.colaboradores.length}
                                            />
                                        </Stack>

                                        <Divider sx={{ my: 1.5 }} />

                                        <Stack
                                            direction="row"
                                            spacing={1}
                                            justifyContent="space-between"
                                            alignItems="center"
                                        >
                                            <Button
                                                size="small"
                                                startIcon={<InfoIcon />}
                                                onClick={() => setModalColaboradores(tarefa)}
                                                sx={{ textTransform: "none" }}
                                            >
                                                Colaboradores
                                            </Button>

                                            <Box>
                                                <Tooltip title="Editar">
                                                    <IconButton
                                                        size="small"
                                                        color="primary"
                                                        onClick={() => setEditarTarefa({ id: tarefa.id, nome: tarefa.nome })}
                                                    >
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>

                                                <Tooltip title="Excluir">
                                                    <IconButton
                                                        size="small"
                                                        color="error"
                                                        onClick={() => {
                                                            setDialogExcluir(true);
                                                        }}
                                                    >
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                        </Stack>
                                    </CardContent>
                                </Card>
                            ))}
                        </Box>
                    </Box>

                    {/* COLUNA DIREITA - ATRIBUIÇÃO (Largura: 20%) */}
                    <Box sx={{ flex: { xs: '1 1 auto', md: '2' }, minWidth: 0 }}>
                        <Card
                            sx={{
                                bgcolor: "background.card",
                                height: "100%",
                                display: "flex",
                                flexDirection: "column",
                                borderRadius: 2
                            }}
                        >
                            <CardContent sx={{ display: "flex", flexDirection: "column", height: "100%", p: 1 }}>
                                <Typography
                                    variant="subtitle1"
                                    fontWeight="bold"

                                >
                                    Nova atribuição
                                </Typography>

                                <Divider sx={{ mb: 1 }} />

                                <FormControl
                                    fullWidth
                                    size="small"
                                    sx={{ mb: 1.5 }}
                                >
                                    <Select
                                        value={tarefaSelecionada ?? ""}
                                        displayEmpty
                                        onChange={(e) => setTarefaSelecionada(e.target.value)}
                                        MenuProps={{
                                            PaperProps: {
                                                sx: {
                                                    bgcolor: "background.default",
                                                    color: "text.primary",
                                                },
                                            },
                                        }}
                                    >
                                        <MenuItem value="">
                                            <em>Selecione...</em>
                                        </MenuItem>
                                        {tarefas.map(tarefa => (
                                            <MenuItem key={tarefa.id} value={tarefa.id}>
                                                {tarefa.nome}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                <TextField
                                    size="small"
                                    fullWidth
                                    placeholder="Buscar colaborador"
                                    value={buscaColaborador}
                                    onChange={(e) => setBuscaColaborador(e.target.value)}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchIcon fontSize="small" />
                                            </InputAdornment>
                                        )
                                    }}
                                    autoComplete="off"
                                    inputProps={{
                                        spellCheck: false,
                                        autoCorrect: "off",
                                        autoCapitalize: "off",
                                    }}
                                />

                                <Box
                                    sx={{
                                        flexGrow: 1,
                                        maxHeight: "220px",
                                        overflowY: "auto",
                                        mt: 1,
                                        pr: 0.5,
                                        "&::-webkit-scrollbar": { width: "6px" },
                                        "&::-webkit-scrollbar-thumb": { bgcolor: "rgba(255,255,255,0.15)", borderRadius: "4px" }
                                    }}
                                >
                                    <List dense disablePadding>
                                        {funcionariosFiltrados.map(funcionario => (
                                            <ListItem
                                                key={funcionario.codigo}
                                                disablePadding
                                                sx={{ mb: 0.5 }}
                                            >
                                                <Checkbox
                                                    size="small"
                                                    checked={funcionariosSelecionados.includes(funcionario.codigo)}
                                                    onChange={() => toggleFuncionario(funcionario.codigo)}
                                                    sx={{ p: 0.5 }}
                                                />
                                                <ListItemText
                                                    primary={funcionario.nome}
                                                    secondary={
                                                        funcionario.tarefa ? (
                                                            funcionario.tarefa
                                                        ) : (
                                                            <Box component="span" sx={{ color: "success.main", fontWeight: "medium" }}>
                                                                Livre
                                                            </Box>
                                                        )
                                                    }
                                                    primaryTypographyProps={{ variant: "body2", noWrap: true }}
                                                    secondaryTypographyProps={{ variant: "caption", noWrap: true }}
                                                />
                                            </ListItem>
                                        ))}
                                    </List>
                                </Box>

                                <Divider sx={{ my: 1.5 }} />

                                <Alert
                                    severity="info"
                                    sx={{
                                        py: 0.5,
                                        px: 1,
                                        fontSize: "0.75rem",
                                        bgcolor: "rgba(2, 136, 209, 0.1)"
                                    }}
                                >
                                    <strong>{funcionariosSelecionados.length}</strong> selecionado(s)
                                </Alert>

                                <Button
                                    fullWidth
                                    sx={{ mt: 1, textTransform: "none" }}
                                    variant="contained"
                                    size="medium"
                                    startIcon={<AssignmentIndIcon />}
                                    onClick={atribuir}
                                >
                                    Atribuir
                                </Button>
                            </CardContent>
                        </Card>
                    </Box>

                </Box>

                {/* MODAL COLABORADORES */}
                <Modal
                    open={Boolean(modalColaboradores)}
                    onClose={() => setModalColaboradores(null)}
                >
                    <Box
                        sx={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%,-50%)",
                            width: 550,
                            maxWidth: "95vw",
                            bgcolor: "background.card",
                            borderRadius: 2,
                            p: 3,
                            maxHeight: "80vh",
                            overflow: "auto",
                        }}
                    >

                        <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                            mb={2}
                        >

                            <Typography
                                variant="h6"
                                fontWeight="bold"
                            >
                                {modalColaboradores?.nome}
                            </Typography>

                            <IconButton
                                onClick={() =>
                                    setModalColaboradores(null)
                                }
                            >
                                <CloseIcon />
                            </IconButton>

                        </Stack>

                        <Divider sx={{ mb: 2 }} />

                        <List>

                            {
                                modalColaboradores?.colaboradores.map(colaborador => (

                                    <ListItem
                                        key={colaborador.codigo}
                                        secondaryAction={

                                            <Stack
                                                direction="row"
                                                spacing={1}
                                            >

                                                <Chip
                                                    size="small"
                                                    color="success"
                                                    label={tempoNaTarefa(colaborador.inicio)}
                                                />

                                                <Tooltip title="Detalhes">

                                                    <IconButton
                                                        color="primary"
                                                        onClick={() => {
                                                            setModalColaboradores(null),
                                                                abrirFuncionario(colaborador.codigo)
                                                        }
                                                        }
                                                    >

                                                        <InfoIcon />

                                                    </IconButton>

                                                </Tooltip>

                                                <Tooltip title="Remover">

                                                    <IconButton
                                                        color="error"
                                                        onClick={() =>
                                                            removerFuncionario(colaborador.codigo)
                                                        }
                                                    >

                                                        <PersonRemoveIcon />

                                                    </IconButton>

                                                </Tooltip>

                                            </Stack>

                                        }
                                    >

                                        <ListItemText
                                            primary={colaborador.nome}
                                            secondary={colaborador.codigo}
                                        />

                                    </ListItem>

                                ))
                            }

                        </List>

                    </Box>

                </Modal>

                {/* DRAWER DO COLABORADOR */}
                <Drawer
                    anchor="right"
                    open={drawerFuncionario}
                    onClose={() => setDrawerFuncionario(false)}
                    PaperProps={{
                        sx: {
                            width: 620,
                            maxWidth: "100vw",
                            bgcolor: "background.drawer",
                            color: "text.primary",
                        },
                    }}
                >
                    <Box
                        sx={{
                            p: 3,
                            minHeight: "100%",
                            zoom: '0.9'
                        }}
                    >

                        <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                            mb={2}
                        >

                            <Typography
                                variant="h5"
                                fontWeight="bold"
                            >
                                Colaborador
                            </Typography>

                            <IconButton
                                onClick={() =>
                                    setDrawerFuncionario(false)
                                }
                            >
                                <CloseIcon />
                            </IconButton>

                        </Stack>

                        {
                            detalhesFuncionario && (
                                <>
                                    <Card sx={{ mb: 3, bgcolor: 'background.card' }}>
                                        <CardContent>
                                            <Stack
                                                direction="row"
                                                spacing={2}
                                                alignItems="center"
                                            >
                                                <Avatar
                                                    sx={{
                                                        width: 70,
                                                        height: 70,
                                                        bgcolor: 'success.main'
                                                    }}
                                                >
                                                    <PersonIcon />
                                                </Avatar>
                                                <Box>

                                                    <Typography
                                                        variant="h6"
                                                        fontWeight="bold"
                                                    >
                                                        {
                                                            detalhesFuncionario.funcionario.nome
                                                        }
                                                    </Typography>

                                                    <Typography
                                                        color="text.secondary"
                                                    >
                                                        Código: {
                                                            detalhesFuncionario.funcionario.codigo
                                                        }
                                                    </Typography>

                                                    <Chip
                                                        sx={{ mt: 1 }}
                                                        color={
                                                            detalhesFuncionario.funcionario.tarefa
                                                                ? "primary"
                                                                : "success"
                                                        }
                                                        label={
                                                            detalhesFuncionario.funcionario.tarefa ??
                                                            "Sem tarefa"
                                                        }
                                                    />

                                                </Box>

                                            </Stack>

                                        </CardContent>

                                    </Card>

                                    <Grid
                                        container
                                        spacing={2}
                                        mb={3}
                                    >

                                        <Grid item xs={4}>

                                            <Card sx={{ bgcolor: 'background.card' }}>

                                                <CardContent>

                                                    <Typography
                                                        variant="h5"
                                                        fontWeight="bold"
                                                    >
                                                        {totalCompetencias}
                                                    </Typography>

                                                    <Typography>
                                                        Competências
                                                    </Typography>

                                                </CardContent>

                                            </Card>

                                        </Grid>

                                        <Grid item xs={4}>

                                            <Card sx={{ bgcolor: 'background.card' }}>

                                                <CardContent>

                                                    <Typography
                                                        variant="h5"
                                                        fontWeight="bold"
                                                    >
                                                        {totalObservacoes}
                                                    </Typography>

                                                    <Typography>
                                                        Observações
                                                    </Typography>

                                                </CardContent>

                                            </Card>

                                        </Grid>

                                        <Grid item xs={4}>
                                            <Card sx={{ bgcolor: 'background.card' }}>
                                                <CardContent>
                                                    <Typography
                                                        variant="h5"
                                                        fontWeight="bold"
                                                        color={
                                                            saldoPontos >= 0
                                                                ? "success.main"
                                                                : "error.main"
                                                        }
                                                    >
                                                        {saldoPontos}
                                                    </Typography>

                                                    <Typography>
                                                        Saldo
                                                    </Typography>

                                                </CardContent>

                                            </Card>

                                        </Grid>

                                    </Grid>

                                    <Tabs
                                        value={tabDrawer}
                                        onChange={(e, v) => setTabDrawer(v)}
                                        sx={{
                                            mb: 3, "& .MuiTabs-indicator": {
                                                display: "none",
                                            },
                                        }}
                                    >

                                        <Tab
                                            icon={<InfoIcon />}
                                            label="Resumo"
                                        />

                                        <Tab
                                            icon={<SchoolIcon />}
                                            label="Competências"
                                        />

                                        <Tab
                                            icon={<HistoryIcon />}
                                            label="Observações"
                                        />

                                    </Tabs>

                                    {/* RESUMO */}

                                    {
                                        tabDrawer === 0 && (

                                            <Stack spacing={2}>

                                                <Alert severity="info">

                                                    Tarefa atual:
                                                    {" "}
                                                    <strong>
                                                        {
                                                            detalhesFuncionario.funcionario.tarefa ??
                                                            "Sem tarefa"
                                                        }
                                                    </strong>

                                                </Alert>

                                                <Grid
                                                    container
                                                    spacing={2}
                                                >

                                                    <Grid item xs={4}>

                                                        <Card sx={{ bgcolor: 'background.card' }}>

                                                            <CardContent>

                                                                <Stack
                                                                    alignItems="center"
                                                                >

                                                                    <StarIcon
                                                                        color="success"
                                                                    />

                                                                    <Typography
                                                                        variant="h5"
                                                                    >
                                                                        {
                                                                            detalhesFuncionario.estatisticas.elogios
                                                                        }
                                                                    </Typography>

                                                                    <Typography>
                                                                        Elogios
                                                                    </Typography>
                                                                </Stack>
                                                            </CardContent>
                                                        </Card>
                                                    </Grid>

                                                    <Grid item xs={4}>
                                                        <Card sx={{ bgcolor: 'background.card' }}>
                                                            <CardContent>
                                                                <Stack
                                                                    alignItems="center"
                                                                >
                                                                    <WarningAmberIcon
                                                                        color="warning"
                                                                    />
                                                                    <Typography
                                                                        variant="h5"
                                                                    >
                                                                        {
                                                                            detalhesFuncionario.estatisticas.advertencias
                                                                        }
                                                                    </Typography>

                                                                    <Typography>
                                                                        Advertências
                                                                    </Typography>
                                                                </Stack>
                                                            </CardContent>
                                                        </Card>
                                                    </Grid>

                                                    <Grid item xs={4}>
                                                        <Card sx={{ bgcolor: 'background.card' }}>
                                                            <CardContent>
                                                                <Stack
                                                                    alignItems="center"
                                                                >
                                                                    <ReportProblemIcon
                                                                        color="error"
                                                                    />
                                                                    <Typography
                                                                        variant="h5"
                                                                    >
                                                                        {
                                                                            detalhesFuncionario.estatisticas.erros
                                                                        }
                                                                    </Typography>

                                                                    <Typography>
                                                                        Erros
                                                                    </Typography>
                                                                </Stack>
                                                            </CardContent>
                                                        </Card>
                                                    </Grid>
                                                </Grid>
                                            </Stack>
                                        )
                                    }
                                    {/* COMPETÊNCIAS */}
                                    {
                                        tabDrawer === 1 && (

                                            <Stack spacing={2}>

                                                <Stack
                                                    direction="row"
                                                    justifyContent="space-between"
                                                    alignItems="center"
                                                >

                                                    <Typography
                                                        variant="h6"
                                                        fontWeight="bold"
                                                    >
                                                        Competências
                                                    </Typography>

                                                    <Button
                                                        variant="contained"
                                                        startIcon={<SchoolIcon />}
                                                        onClick={abrirCompetencias}
                                                    >
                                                        Editar
                                                    </Button>

                                                </Stack>

                                                <Divider />

                                                {
                                                    detalhesFuncionario.competencias.length === 0
                                                        ?
                                                        <Alert severity="warning">
                                                            Nenhuma competência cadastrada.
                                                        </Alert>
                                                        :
                                                        detalhesFuncionario.competencias.map(comp => (
                                                            <Card
                                                                key={comp.tarefa_id}
                                                                sx={{ bgcolor: 'background.card' }}
                                                            >
                                                                <CardContent>
                                                                    <Stack
                                                                        direction="row"
                                                                        justifyContent="space-between"
                                                                        alignItems="center"
                                                                    >
                                                                        <Box>
                                                                            <Typography
                                                                                fontWeight="bold"
                                                                            >
                                                                                {comp.tarefa}
                                                                            </Typography>

                                                                            <Typography
                                                                                color="text.secondary"
                                                                            >
                                                                                Nível: {comp.nivel}
                                                                            </Typography>
                                                                        </Box>

                                                                        <Chip
                                                                            color="success"
                                                                            label={comp.nivel}
                                                                        />
                                                                    </Stack>
                                                                </CardContent>
                                                            </Card>
                                                        ))
                                                }
                                            </Stack>
                                        )
                                    }

                                    {/* OBSERVAÇÕES */}
                                    {
                                        tabDrawer === 2 && (
                                            <Stack spacing={2}>
                                                <Stack
                                                    direction="row"
                                                    justifyContent="space-between"
                                                >
                                                    <Typography
                                                        variant="h6"
                                                        fontWeight="bold"
                                                    >
                                                        Histórico
                                                    </Typography>

                                                    <Button
                                                        variant="contained"
                                                        startIcon={<AddIcon />}
                                                        onClick={() =>
                                                            setModalObservacao(true)
                                                        }
                                                    >
                                                        Nova observação
                                                    </Button>

                                                </Stack>

                                                <Divider />

                                                {
                                                    detalhesFuncionario.observacoes.length === 0
                                                        ?
                                                        <Alert severity="info">
                                                            Nenhuma observação registrada.
                                                        </Alert>
                                                        :
                                                        detalhesFuncionario.observacoes.map(obs => (
                                                            <Card
                                                                key={obs.id}
                                                                sx={{
                                                                    color: 'primary.text',
                                                                    bgcolor: 'background.card'
                                                                }}
                                                            >
                                                                <CardContent>
                                                                    <Stack spacing={2}>

                                                                        {/* Cabeçalho */}
                                                                        <Stack
                                                                            direction="row"
                                                                            justifyContent="space-between"
                                                                            alignItems="flex-start"
                                                                        >
                                                                            <Box sx={{ flex: 1 }}>
                                                                                <Stack direction="row" spacing={1} mb={1}>
                                                                                    <Chip
                                                                                        size="small"
                                                                                        color={
                                                                                            obs.tipo === "ELOGIO"
                                                                                                ? "success"
                                                                                                : obs.tipo === "ERRO"
                                                                                                    ? "error"
                                                                                                    : "warning"
                                                                                        }
                                                                                        label={obs.tipo}
                                                                                    />
                                                                                </Stack>

                                                                                <Typography fontWeight="bold">
                                                                                    {obs.tarefa || "Sem tarefa"}
                                                                                </Typography>
                                                                            </Box>

                                                                            <Tooltip title="Excluir">
                                                                                <IconButton
                                                                                    color="error"
                                                                                    onClick={() => excluirObservacao(obs.id)}
                                                                                >
                                                                                    <DeleteIcon />
                                                                                </IconButton>
                                                                            </Tooltip>
                                                                        </Stack>

                                                                        {/* Corpo */}
                                                                        <Typography>
                                                                            {obs.descricao}
                                                                        </Typography>

                                                                        {/* Rodapé */}
                                                                        <Stack
                                                                            direction="row"
                                                                            justifyContent="space-between"
                                                                            alignItems="center"
                                                                        >
                                                                            <Typography
                                                                                variant="caption"
                                                                                color="text.secondary"
                                                                            >
                                                                                {new Date(obs.criado_em).toLocaleString("pt-BR")}
                                                                            </Typography>

                                                                            <Typography
                                                                                variant="caption"
                                                                                color="text.secondary"
                                                                            >
                                                                                {obs.supervisor}
                                                                            </Typography>
                                                                        </Stack>

                                                                    </Stack>
                                                                </CardContent>
                                                            </Card>
                                                        ))
                                                }
                                            </Stack>
                                        )
                                    }
                                </>
                            )
                        }
                    </Box>
                </Drawer>

                {/* MODAL COMPETÊNCIAS */}
                <Dialog
                    open={modalCompetencias}
                    onClose={() => setModalCompetencias(false)}
                    maxWidth="md"
                    fullWidth
                    slotProps={{
                        paper: {
                            sx: {
                                bgcolor: "background.card",
                                color: "text.primary",
                                borderRadius: 3
                            }
                        }
                    }}
                >

                    <DialogTitle>
                        Competências
                    </DialogTitle>

                    <DialogContent dividers>

                        <Stack spacing={2}>

                            {
                                tarefas.map(tarefa => {

                                    const possui = competencias.find(
                                        c => c.tarefa_id === tarefa.id
                                    );

                                    return (

                                        <FormControlLabel
                                            key={tarefa.id}
                                            control={

                                                <Checkbox
                                                    checked={Boolean(possui)}
                                                    onChange={(e) => {

                                                        if (e.target.checked) {

                                                            setCompetencias(prev => [

                                                                ...prev,

                                                                {
                                                                    tarefa_id: tarefa.id,
                                                                    tarefa: tarefa.nome,
                                                                    nivel: "APTO"
                                                                }

                                                            ]);

                                                        } else {

                                                            setCompetencias(prev =>
                                                                prev.filter(
                                                                    x => x.tarefa_id !== tarefa.id
                                                                )
                                                            );

                                                        }

                                                    }}
                                                />
                                            }
                                            label={tarefa.nome}
                                        />
                                    );
                                })
                            }
                        </Stack>

                    </DialogContent>

                    <DialogActions>

                        <Button
                            onClick={() =>
                                setModalCompetencias(false)
                            }
                        >
                            Cancelar
                        </Button>

                        <Button
                            variant="contained"
                            startIcon={<SaveIcon />}
                            onClick={salvarCompetencias}
                        >
                            Salvar
                        </Button>

                    </DialogActions>

                </Dialog>

                {/* MODAL OBSERVAÇÃO */}
                <Dialog
                    open={modalObservacao}
                    onClose={() => setModalObservacao(false)}
                    maxWidth="sm"
                    fullWidth
                    slotProps={{
                        paper: {
                            sx: {
                                bgcolor: "background.card",
                                color: "text.primary",
                                borderRadius: 3
                            }
                        }
                    }}
                >

                    <DialogTitle>
                        Nova observação
                    </DialogTitle>

                    <DialogContent dividers>
                        <Stack spacing={2} mt={1}>
                            <FormControl fullWidth>
                                <Select
                                    value={tipoObservacao}
                                    onChange={(e) =>
                                        setTipoObservacao(e.target.value)
                                    }
                                    MenuProps={{
                                        PaperProps: {
                                            sx: {
                                                bgcolor: "background.default",
                                                color: "text.primary",
                                            },
                                        },
                                    }}
                                >
                                    <MenuItem value="ELOGIO">
                                        Elogio
                                    </MenuItem>

                                    <MenuItem value="ADVERTENCIA">
                                        Advertência
                                    </MenuItem>

                                    <MenuItem value="ERRO">
                                        Erro
                                    </MenuItem>

                                </Select>

                            </FormControl>

                            <TextField
                                multiline
                                rows={5}
                                label="Descrição"
                                value={descricaoObservacao}
                                onChange={(e) =>
                                    setDescricaoObservacao(e.target.value)
                                }
                            />

                        </Stack>

                    </DialogContent>

                    <DialogActions>

                        <Button
                            onClick={() =>
                                setModalObservacao(false)
                            }
                        >
                            Cancelar
                        </Button>

                        <Button
                            variant="contained"
                            startIcon={<SaveIcon />}
                            onClick={salvarObservacao}
                        >
                            Salvar
                        </Button>

                    </DialogActions>

                </Dialog>
                {/* EDITAR TAREFA */}
                <Dialog
                    open={Boolean(editarTarefa)}
                    onClose={() => setEditarTarefa(null)}
                    maxWidth="xs"
                    fullWidth
                    slotProps={{
                        paper: {
                            sx: {
                                bgcolor: "background.card",
                                color: "text.primary",
                                borderRadius: 3
                            }
                        }
                    }}
                >
                    <DialogTitle>
                        Editar tarefa
                    </DialogTitle>

                    <DialogContent dividers>

                        <TextField
                            fullWidth
                            label="Nome"
                            value={editarTarefa?.nome || ""}
                            onChange={(e) =>
                                setEditarTarefa(prev => ({
                                    ...prev,
                                    nome: e.target.value
                                }))
                            }
                        />
                    </DialogContent>

                    <DialogActions>
                        <Button
                            onClick={() =>
                                setEditarTarefa(null)
                            }
                        >
                            Cancelar
                        </Button>

                        <Button
                            variant="contained"
                            startIcon={<SaveIcon />}
                            onClick={salvarEdicaoTarefa}
                        >
                            Salvar
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* EXCLUIR */}
                <Dialog
                    open={dialogExcluir}
                    onClose={() => setDialogExcluir(false)}
                    slotProps={{
                        paper: {
                            sx: {
                                bgcolor: "background.card",
                                color: "text.primary",
                                borderRadius: 3
                            }
                        }
                    }}
                >
                    <DialogTitle>
                        Excluir tarefa
                    </DialogTitle>

                    <DialogContent>
                        <Typography>
                            Deseja realmente excluir esta tarefa?
                        </Typography>

                    </DialogContent>

                    <DialogActions>

                        <Button
                            onClick={() =>
                                setDialogExcluir(false)
                            }
                        >
                            Cancelar
                        </Button>

                        <Button
                            color="error"
                            variant="contained"
                            startIcon={<DeleteIcon />}
                            onClick={excluirTarefa}
                        >
                            Excluir
                        </Button>
                    </DialogActions>
                </Dialog>

                <Dialog open={modalNovaTarefa} onClose={() => setModalNovaTarefa(false)}
                    slotProps={{
                        paper: {
                            sx: {
                                bgcolor: "background.card",
                                color: "text.primary",
                                borderRadius: 3
                            }
                        }
                    }}>
                    <DialogTitle>Nova Tarefa</DialogTitle>
                    <DialogContent>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Nome da Tarefa"
                            fullWidth
                            variant="outlined"
                            value={novaTarefa}
                            onChange={(e) => setNovaTarefa(e.target.value)}
                            autoComplete="off"
                            inputProps={{
                                spellCheck: false,
                                autoCorrect: "off",
                                autoCapitalize: "off",
                            }}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setModalNovaTarefa(false)}>Cancelar</Button>
                        <Button
                            onClick={() => {
                                cadastrarTarefa();
                                setModalNovaTarefa(false);
                            }}
                            variant="contained"
                            disabled={!novaTarefa.trim()}
                        >
                            Salvar
                        </Button>
                    </DialogActions>
                </Dialog>

                <Dialog open={openDialog} onClose={() => setOpenDialog(false)}
                    slotProps={{
                        paper: {
                            sx: {
                                bgcolor: "background.card",
                                color: "text.primary",
                            }
                        }
                    }}>
                    <DialogTitle>Acesso restrito</DialogTitle>

                    <DialogContent>
                        <TextField
                            label="Senha de administrador"
                            type={showSenha ? "text" : "password"}
                            fullWidth
                            value={senhaAdmin}
                            onChange={(e) => setSenhaAdmin(e.target.value)}
                            autoFocus
                            sx={{
                                mt: 1,
                                '& .MuiOutlinedInput-root': {
                                    '&:hover fieldset': {
                                        borderColor: 'primary.main',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: 'primary.main',
                                    }
                                }
                            }}
                            autoComplete="off"
                            inputProps={{
                                spellCheck: false,
                                autoCorrect: "off",
                                autoCapitalize: "off",
                            }}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() => setShowSenha(!showSenha)}
                                            edge="end"
                                        >
                                            {showSenha ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                        />
                    </DialogContent>

                    <DialogActions>
                        <Button sx={{ color: "primary.branco", bgcolor: 'primary.cancelar', '&:hover': { bgcolor: 'primary.cancelarHover' } }} onClick={() => setOpenDialog(false)}>
                            Cancelar
                        </Button>

                        <Button
                            variant="contained"
                            onClick={acessarCadastro}
                            sx={{ color: "primary.branco", bgcolor: 'primary.confirmar', '&:hover': { bgcolor: 'primary.confirmarHover' } }}>
                            Entrar
                        </Button>
                    </DialogActions>
                </Dialog>

                <Tooltip title="Cadastrar nova tarefa">
                    <Fab
                        color="primary"
                        aria-label="add"
                        onClick={() => setModalNovaTarefa(true)}
                        sx={{ position: 'fixed', bottom: 16, left: 16 }}
                    >
                        <AddIcon />
                    </Fab>
                </Tooltip>

                {/* LOADING */}
                {
                    loading && (
                        <Box
                            sx={{
                                position: "fixed",
                                inset: 0,
                                bgcolor: "rgba(0,0,0,.35)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                zIndex: 9999
                            }}
                        >
                            <CircularProgress />
                        </Box>
                    )
                }

                {/* SNACKBAR */}
                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={3000}
                    onClose={() =>
                        setSnackbar(prev => ({
                            ...prev,
                            open: false
                        }))
                    }
                >
                    <Alert
                        severity={snackbar.severity}
                        variant="filled"
                        sx={{
                            color: 'primary.branco',

                            "& .MuiAlert-icon": {
                                color: 'primary.branco'
                            },

                            "& .MuiAlert-action": {
                                color: 'primary.branco'
                            }
                        }}
                    >
                        {snackbar.message}
                    </Alert>
                </Snackbar>
            </Container>
        ));
}