// src/sigel-chamados/pages/Chamados.jsx

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    Alert,
    Avatar,
    Box,
    Button,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Drawer,
    Fab,
    FormControl,
    Grid,
    IconButton,
    InputAdornment,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";

import {
    Add,
    ArrowBack,
    Assignment,
    AssignmentTurnedIn,
    Cancel,
    CheckCircle,
    Close,
    Comment,
    ConfirmationNumber,
    FilterAlt,
    HourglassTop,
    Logout,
    MoreVert,
    Person,
    Refresh,
    Search,
    Send,
    SupportAgent,
    TaskAlt,
    Warning,
    DescriptionOutlined,
    InfoOutlined,
    BusinessOutlined,
    PersonOutline,
    CalendarMonthOutlined,
    Tune,
    CommentOutlined,
    HistoryOutlined,
} from "@mui/icons-material";

import MenuUsuario from "../../components/MenuUsuario";
import LoginFuncionario from "../../components/LoginFuncionario";
import NotificacoesMenu from "../../components/Notificacoes";


const API = "http://192.168.1.185:8077";

const TOKEN_KEY = "nfe_token";
const USER_KEY = "user_info";

const SETORES = [
    "TI",
    "FINANCEIRO",
    "ESTOQUE",
    "COMPRAS",
    "GERENCIA",
    "DESPACHO",
    "DEVOLUÇÃO/GARANTIA",
    "PRAIAS",
];

const PRIORIDADES = [
    { value: "BAIXA", label: "Baixa" },
    { value: "MEDIA", label: "Média" },
    { value: "ALTA", label: "Alta" },
    { value: "URGENTE", label: "Urgente" },
];

const STATUS = [
    { value: "ABERTO", label: "Aberto" },
    { value: "EM_ATENDIMENTO", label: "Em atendimento" },
    { value: "AGUARDANDO_RETORNO", label: "Aguardando retorno" },
    { value: "RESOLVIDO", label: "Resolvido" },
];


function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}


function getUser() {
    try {
        return JSON.parse(localStorage.getItem(USER_KEY) || "{}");
    } catch {
        return {};
    }
}


function formatarData(valor, incluirHora = true) {
    if (!valor) return "-";

    const data = new Date(valor);

    if (Number.isNaN(data.getTime())) return valor;

    // Desconta 3 horas
    data.setTime(data.getTime() - (3 * 60 * 60 * 1000));

    return data.toLocaleString("pt-BR", incluirHora
        ? {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }
        : {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        }
    );
}


function nomeStatus(valor) {
    return STATUS.find((item) => item.value === valor)?.label || valor;
}


function nomePrioridade(valor) {
    return PRIORIDADES.find((item) => item.value === valor)?.label || valor;
}


function corPrioridade(valor) {
    switch (valor) {
        case "URGENTE":
            return "error";
        case "ALTA":
            return "warning";
        case "MEDIA":
            return "info";
        case "BAIXA":
            return "success";
        default:
            return "default";
    }
}


function corStatus(valor) {
    switch (valor) {
        case "ABERTO":
            return "info";
        case "EM_ATENDIMENTO":
            return "warning";
        case "AGUARDANDO_RETORNO":
            return "secondary";
        case "RESOLVIDO":
            return "success";
        default:
            return "default";
    }
}


async function apiRequest(endpoint, options = {}) {
    const token = getToken();

    const response = await fetch(`${API}/api/chamados${endpoint}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            "X-Auth-Token": token || "",
            ...(options.headers || {}),
        },
    });

    let data = {};

    try {
        data = await response.json();
    } catch {
        data = {};
    }

    if (response.status === 401) {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        window.location.reload();
        throw new Error("Sua sessão expirou. Faça login novamente.");
    }

    if (!response.ok || data.sucesso === false) {
        throw new Error(data.erro || "Não foi possível concluir a operação.");
    }

    return data;
}

function SectionTitle({ icon, children }) {
    return (
        <Stack
            direction="row"
            alignItems="center"
            spacing={1}
            sx={{ mb: 0.5 }}
        >
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    color: "primary.main",
                }}
            >
                {icon}
            </Box>

            <Typography
                variant="subtitle2"
                fontWeight={800}
                color="text.primary"
            >
                {children}
            </Typography>
        </Stack>
    );
}

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export default function Chamados() {
    const navigate = useNavigate();

    const [userInfo, setUserInfo] = useState(() => {
        try {
            const user = localStorage.getItem(USER_KEY);
            return user ? JSON.parse(user) : null;
        } catch {
            return null;
        }
    });

    const [token, setToken] = useState(
        () => localStorage.getItem(TOKEN_KEY) || ""
    );

    const logout = () => {
        setToken("");
        setUserInfo(null);

        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);

        localStorage.removeItem("nfe_token");
        localStorage.removeItem("user_info");
    };

    const user = useMemo(() => getUser(), []);

    const [usuario, setUsuario] = useState(getUser());

    const [chamados, setChamados] = useState([]);
    const [indicadores, setIndicadores] = useState({});
    const [setores, setSetores] = useState(SETORES);

    const [carregando, setCarregando] = useState(true);
    const [atualizando, setAtualizando] = useState(false);

    const [erro, setErro] = useState("");
    const [sucesso, setSucesso] = useState("");

    const [busca, setBusca] = useState("");
    const [filtroStatus, setFiltroStatus] = useState("");
    const [filtroPrioridade, setFiltroPrioridade] = useState("");
    const [filtroSetor, setFiltroSetor] = useState("");
    const [incluirCancelados, setIncluirCancelados] = useState(false);

    const [dialogNovo, setDialogNovo] = useState(false);
    const [dialogDetalhes, setDialogDetalhes] = useState(false);
    const [dialogCancelar, setDialogCancelar] = useState(false);

    const [chamadoSelecionado, setChamadoSelecionado] = useState(null);
    const [historico, setHistorico] = useState([]);
    const [comentarios, setComentarios] = useState([]);

    const [novoTitulo, setNovoTitulo] = useState("");
    const [novaDescricao, setNovaDescricao] = useState("");
    const [novoSetor, setNovoSetor] = useState("");
    const [novaPrioridade, setNovaPrioridade] = useState("MEDIA");
    const [novoAtendenteId, setNovoAtendenteId] = useState("");
    const [funcionariosNovoChamado, setFuncionariosNovoChamado] = useState([]);
    const [ehSuperior, setEhSuperior] = useState(false);
    const [funcionariosAtribuicao, setFuncionariosAtribuicao] = useState([]);
    const [novoResponsavelId, setNovoResponsavelId] = useState("");

    const [novoComentario, setNovoComentario] = useState("");
    const [motivoCancelamento, setMotivoCancelamento] = useState("");

    const [salvando, setSalvando] = useState(false);

    const [menuUsuario, setMenuUsuario] = useState(null);

    const funcionarioId = Number(usuario?.id || usuario?.funcionario_id || 0);

    const setorUsuario = String(usuario?.setor || "").trim().toUpperCase();

    const carregarDados = useCallback(async (silencioso = false) => {
        if (!getToken()) {
            setCarregando(false);
            return;
        }

        if (silencioso) {
            setAtualizando(true);
        } else {
            setCarregando(true);
        }

        setErro("");

        try {
            const params = new URLSearchParams();

            if (filtroStatus) params.set("status", filtroStatus);
            if (filtroPrioridade) params.set("prioridade", filtroPrioridade);
            if (filtroSetor) params.set("setor", filtroSetor);
            if (busca.trim()) params.set("busca", busca.trim());
            if (incluirCancelados) params.set("incluir_cancelados", "1");

            const [lista, resumo, setoresResponse, perfilResponse] = await Promise.all([
                apiRequest(`?${params.toString()}`),
                apiRequest("/indicadores"),
                apiRequest("/setores"),
                apiRequest("/perfil"),
            ]);

            setChamados(lista.chamados || []);
            setIndicadores(resumo.indicadores || {});
            setSetores(setoresResponse.setores || SETORES);

            const perfil = perfilResponse.perfil || {};
            setEhSuperior(Number(perfil.superior) === 1);
            setUsuario((anterior) => ({ ...anterior, ...perfil }));

        } catch (err) {
            setErro(err.message || "Erro ao carregar chamados.");
        } finally {
            setCarregando(false);
            setAtualizando(false);
        }
    }, [
        busca,
        filtroStatus,
        filtroPrioridade,
        filtroSetor,
        incluirCancelados,
    ]);


    useEffect(() => {
        setToken(getToken());
        setUsuario(getUser());
    }, []);


    useEffect(() => {
        if (token) carregarDados();
        else setCarregando(false);
    }, [token, carregarDados]);


    useEffect(() => {
        if (!sucesso) return;

        const timer = setTimeout(() => setSucesso(""), 4000);
        return () => clearTimeout(timer);
    }, [sucesso]);


    const abrirNovoChamado = () => {
        setNovoTitulo("");
        setNovaDescricao("");
        setNovoSetor("");
        setNovaPrioridade("MEDIA");
        setNovoAtendenteId("");
        setFuncionariosNovoChamado([]);
        setErro("");
        setDialogNovo(true);
    };

    const alterarSetorNovoChamado = async (setor) => {
        setNovoSetor(setor);
        setNovoAtendenteId("");
        setFuncionariosNovoChamado([]);

        const podeAtribuirNesseSetor =
            setorUsuario === "TI" ||
            setorUsuario === "GERENCIA" ||
            setorUsuario === String(setor).trim().toUpperCase();

        if (!ehSuperior || !setor || !podeAtribuirNesseSetor) return;

        try {
            const resposta = await apiRequest(`/funcionarios?setor=${encodeURIComponent(setor)}`);
            setFuncionariosNovoChamado(resposta.funcionarios || []);
        } catch (err) {
            setErro(err.message || "Não foi possível carregar os colaboradores do setor.");
        }
    };


    const criarChamado = async () => {
        if (!novoTitulo.trim() || !novaDescricao.trim() || !novoSetor) {
            setErro("Preencha o título, a descrição e o setor destinatário.");
            return;
        }

        setSalvando(true);
        setErro("");

        try {
            await apiRequest("", {
                method: "POST",
                body: JSON.stringify({
                    titulo: novoTitulo.trim(),
                    descricao: novaDescricao.trim(),
                    setor_destino: novoSetor,
                    prioridade: novaPrioridade,
                    ...(ehSuperior && novoAtendenteId
                        ? { atendente_id: Number(novoAtendenteId) }
                        : {}),
                }),
            });

            setDialogNovo(false);
            setSucesso(novoAtendenteId
                ? "Chamado aberto e atribuído ao colaborador selecionado!"
                : "Chamado aberto com sucesso! Os funcionários do setor foram notificados.");
            await carregarDados(true);

        } catch (err) {
            setErro(err.message);
        } finally {
            setSalvando(false);
        }
    };


    const abrirDetalhes = async (chamado) => {
        setChamadoSelecionado(chamado);
        setDialogDetalhes(true);
        setHistorico([]);
        setComentarios([]);
        setNovoComentario("");
        setErro("");

        try {
            const resposta = await apiRequest(`/${chamado.id}`);

            const chamadoAtual = resposta.chamado || chamado;
            setChamadoSelecionado(chamadoAtual);
            setHistorico(resposta.historico || []);
            setComentarios(resposta.comentarios || []);
            setNovoResponsavelId(chamadoAtual.atendente_id ? String(chamadoAtual.atendente_id) : "");
            setFuncionariosAtribuicao([]);

            if (ehSuperior) {
                const equipe = await apiRequest(`/funcionarios?setor=${encodeURIComponent(chamadoAtual.setor_destino)}`);
                setFuncionariosAtribuicao(equipe.funcionarios || []);
            }

        } catch (err) {
            setErro(err.message);
        }
    };


    const atualizarDetalhes = async () => {
        if (!chamadoSelecionado) return;

        const resposta = await apiRequest(`/${chamadoSelecionado.id}`);

        setChamadoSelecionado(resposta.chamado || chamadoSelecionado);
        setHistorico(resposta.historico || []);
        setComentarios(resposta.comentarios || []);
    };


    const assumirChamado = async () => {
        if (!chamadoSelecionado) return;

        setSalvando(true);
        setErro("");

        try {
            await apiRequest(`/${chamadoSelecionado.id}/assumir`, {
                method: "PATCH",
            });

            setSucesso("Chamado assumido com sucesso!");
            await atualizarDetalhes();
            await carregarDados(true);

        } catch (err) {
            setErro(err.message);
        } finally {
            setSalvando(false);
        }
    };

    const atribuirChamado = async () => {
        if (!chamadoSelecionado || !novoResponsavelId) return;

        setSalvando(true);
        setErro("");

        try {
            await apiRequest(`/${chamadoSelecionado.id}/atribuir`, {
                method: "PATCH",
                body: JSON.stringify({ atendente_id: Number(novoResponsavelId) }),
            });

            setSucesso("Chamado atribuído com sucesso!");
            await atualizarDetalhes();
            await carregarDados(true);
        } catch (err) {
            setErro(err.message || "Não foi possível atribuir o chamado.");
        } finally {
            setSalvando(false);
        }
    };


    const alterarStatus = async (novoStatus) => {
        if (!chamadoSelecionado) return;

        setSalvando(true);
        setErro("");

        try {
            await apiRequest(`/${chamadoSelecionado.id}/status`, {
                method: "PATCH",
                body: JSON.stringify({ status: novoStatus }),
            });

            setSucesso("Status atualizado com sucesso!");
            await atualizarDetalhes();
            await carregarDados(true);

        } catch (err) {
            setErro(err.message);
        } finally {
            setSalvando(false);
        }
    };


    const enviarComentario = async () => {
        if (!chamadoSelecionado || !novoComentario.trim()) return;

        setSalvando(true);
        setErro("");

        try {
            await apiRequest(`/${chamadoSelecionado.id}/comentarios`, {
                method: "POST",
                body: JSON.stringify({
                    comentario: novoComentario.trim(),
                }),
            });

            setNovoComentario("");
            await atualizarDetalhes();
            setSucesso("Comentário adicionado.");

        } catch (err) {
            setErro(err.message);
        } finally {
            setSalvando(false);
        }
    };


    const cancelarChamado = async () => {
        if (!chamadoSelecionado || !motivoCancelamento.trim()) {
            setErro("Informe o motivo do cancelamento.");
            return;
        }

        setSalvando(true);
        setErro("");

        try {
            await apiRequest(`/${chamadoSelecionado.id}/cancelar`, {
                method: "POST",
                body: JSON.stringify({
                    motivo: motivoCancelamento.trim(),
                }),
            });

            setDialogCancelar(false);
            setDialogDetalhes(false);
            setMotivoCancelamento("");

            setSucesso("Chamado cancelado. O histórico foi preservado.");
            await carregarDados(true);

        } catch (err) {
            setErro(err.message);
        } finally {
            setSalvando(false);
        }
    };


    const criarTarefaKanban = async () => {
        if (!chamadoSelecionado) return;

        setSalvando(true);
        setErro("");

        try {
            const resposta = await apiRequest(
                `/${chamadoSelecionado.id}/criar-tarefa`,
                { method: "POST" }
            );

            setSucesso(
                `Tarefa #${resposta.tarefa_id} criada no seu Kanban pessoal!`
            );

            await atualizarDetalhes();

        } catch (err) {
            setErro(err.message);
        } finally {
            setSalvando(false);
        }
    };

    const chamadosVisiveis = chamados;

    const podeAssumir = (chamado) => (
        !chamado.cancelado &&
        chamado.atendente_id == null &&
        chamado.status !== "RESOLVIDO" &&
        Number(chamado.solicitante_id) != funcionarioId
    );

    const podeAlterarStatus = (chamado) => (
        ehSuperior &&
        !chamado.cancelado &&
        (setorUsuario === "TI" || setorUsuario === "GERENCIA" ||
            setorUsuario === String(chamado.setor_destino || "").trim().toUpperCase())
    );

    const podeCancelar = (chamado) => (
        !chamado.cancelado &&
        Number(chamado.solicitante_id) === funcionarioId
    );

    const jaCriouTarefa = useMemo(() => {
        if (!historico.length) return false;

        return historico.some((item) => (
            item.acao === "TAREFA_KANBAN_CRIADA" &&
            Number(item.funcionario_id) === funcionarioId
        ));
    }, [historico, funcionarioId]);


    if (!token) {

        return (
            <LoginFuncionario
                onLogin={(data) => {

                    localStorage.setItem(
                        "nfe_token",
                        data.token
                    );

                    const user = {
                        id: data.id,
                        nome: data.nome,
                        codigo: data.codigo,
                        tipo: data.tipo,
                        pode_autorizar_conferencia:
                            data.pode_autorizar_conferencia,
                        pode_corrigir_nfe:
                            data.pode_corrigir_nfe,
                        pode_finalizar_nfe:
                            data.pode_finalizar_nfe,
                        pode_acessar_alertas:
                            data.pode_acessar_alertas,
                        pode_acessar_cadastrar_funcionario:
                            data.pode_acessar_cadastrar_funcionario,
                        pode_acessar_painel_games:
                            data.pode_acessar_painel_games,
                        pode_acessar_painel_gerencial:
                            data.pode_acessar_painel_gerencial,
                        pode_acessar_reimprimir_senhas:
                            data.pode_acessar_reimprimir_senhas,
                        pode_acessar_tarefas:
                            data.pode_acessar_tarefas,
                    };

                    localStorage.setItem(
                        "user_info",
                        JSON.stringify(user)
                    );

                    setUserInfo(user);
                    setToken(data.token);
                }}
            />
        );
    }


    return (
        <Box sx={{ p: { xs: 1.5, md: 3 }, minHeight: "100%" }}>

            {/* =====================================================
                CABEÇALHO E NAVEGAÇÃO
            ====================================================== */}

            <Paper
                elevation={0}
                sx={{
                    position: "sticky",
                    mb: {
                        xs: 0,
                        md: 2,
                    },
                    px: {
                        xs: 1.5,
                        md: 2.5,
                    },
                    py: 1.25,
                    borderRadius: {
                        xs: 0,
                        md: 3,
                    },
                    bgcolor: "primary.main",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 2,
                    minHeight: 70,
                }}
            >

                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        minWidth: 0,
                    }}
                >

                    <Box sx={{ minWidth: 0 }}>

                        <Typography
                            variant="h6"
                            fontWeight={800}
                            sx={{
                                lineHeight: 1.1,
                                whiteSpace: "nowrap",
                            }}
                        >
                            SIGEL Desk
                        </Typography>

                        <Typography
                            variant="caption"
                            sx={{
                                opacity: 0.75,
                            }}
                        >
                            Solicitações de chamados e acompanhamento
                        </Typography>

                    </Box>

                </Box>

                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        zoom: 0.9
                    }}
                >

                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "row",
                            justifyContent: "right",
                        }}
                    >
                        <NotificacoesMenu
                            apiBase={API}
                            token={token}
                            userInfo={userInfo}
                        />
                        <MenuUsuario
                            userInfo={userInfo}
                            onLogout={logout}
                        />
                    </Box>

                    <Tooltip title="Voltar ao SIGEL">

                        <IconButton
                            onClick={() => navigate("/")}
                            sx={{
                                color: "white",
                                bgcolor:
                                    "rgba(255,255,255,0.08)",
                                "&:hover": {
                                    bgcolor:
                                        "rgba(255,255,255,0.16)",
                                },
                            }}
                        >
                            <ArrowBack />
                        </IconButton>
                    </Tooltip>

                </Box>
            </Paper>


            {/* =====================================================
                CONTEÚDO
            ====================================================== */}

            <Box
                sx={{
                    maxWidth: 1600,
                    mx: "auto",
                }}
            >

                <Tooltip title="Abrir chamado">
                    <Fab
                        color="primary"
                        aria-label="add"
                        onClick={abrirNovoChamado}
                        sx={{ position: 'fixed', bottom: 16, right: 16 }}
                    >
                        <Add />
                    </Fab>
                </Tooltip>


                {erro && (
                    <Alert
                        severity="error"
                        sx={{ mb: 2 }}
                        onClose={() => setErro("")}
                    >
                        {erro}
                    </Alert>
                )}

                {sucesso && (
                    <Alert
                        severity="success"
                        sx={{ mb: 2 }}
                        onClose={() => setSucesso("")}
                    >
                        {sucesso}
                    </Alert>
                )}

                {/* INDICADORES */}

                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: {
                            xs: "repeat(2, 1fr)",
                            sm: "repeat(3, 1fr)",
                            lg: "repeat(6, 1fr)",
                        },
                        gap: 1.5,
                        mb: 2.5,
                    }}
                >
                    {[
                        {
                            label: "Total",
                            value: indicadores.total ?? 0,
                            icon: <Assignment />,
                            color: "primary.main",
                        },
                        {
                            label: "Abertos",
                            value: indicadores.abertos ?? 0,
                            icon: <ConfirmationNumber />,
                            color: "info.main",
                        },
                        {
                            label: "Em atendimento",
                            value: indicadores.em_atendimento ?? 0,
                            icon: <SupportAgent />,
                            color: "warning.main",
                        },
                        {
                            label: "Aguardando",
                            value: indicadores.aguardando_retorno ?? 0,
                            icon: <HourglassTop />,
                            color: "text.secondary",
                        },
                        {
                            label: "Resolvidos",
                            value: indicadores.resolvidos ?? 0,
                            icon: <CheckCircle />,
                            color: "success.main",
                        },
                        {
                            label: "Urgentes",
                            value: indicadores.urgentes ?? 0,
                            icon: <Warning />,
                            color: "error.main",
                        },
                    ].map((item) => (
                        <Paper
                            key={item.label}
                            variant="outlined"
                            sx={{
                                p: 1.75,
                                borderRadius: 2.5,
                                backgroundColor: "background.default",
                                color: "text.primary",
                                height: "100%",
                                boxSizing: "border-box",
                            }}
                        >
                            <Stack
                                direction="row"
                                alignItems="center"
                                justifyContent="space-between"
                                spacing={1}
                            >
                                <Box sx={{ minWidth: 0 }}>
                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                        sx={{
                                            display: "block",
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        {item.label}
                                    </Typography>

                                    <Typography
                                        variant="h5"
                                        fontWeight={900}
                                        color="text.primary"
                                    >
                                        {item.value}
                                    </Typography>
                                </Box>

                                <Box
                                    sx={{
                                        color: item.color,
                                        display: "flex",
                                        alignItems: "center",
                                        flexShrink: 0,
                                        "& svg": {
                                            fontSize: 26,
                                        },
                                    }}
                                >
                                    {item.icon}
                                </Box>
                            </Stack>
                        </Paper>
                    ))}
                </Box>

                {/* FILTROS */}

                <Paper variant="outlined" sx={{ bgcolor: 'background.default', p: 1.5, mb: 2.5, borderRadius: 2.5 }}>
                    <Stack
                        direction="row"
                        alignItems="center"
                        spacing={1}
                        sx={{ mb: 2 }}
                    >
                        <FilterAlt color="action" />
                        <Typography fontWeight={700}>Filtros</Typography>
                    </Stack>

                    <Grid container spacing={2}>
                        <Grid item xs={12} md={4}>
                            <TextField
                                fullWidth
                                size="small"
                                label="Buscar chamado"
                                placeholder="Título, descrição, solicitante ou número..."
                                value={busca}
                                onChange={(event) => setBusca(event.target.value)}
                                onKeyDown={(event) => {
                                    if (event.key === "Enter") carregarDados();
                                }}
                                sx={{
                                    minWidth: '60vh'
                                }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Search />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6} md={2}>
                            <FormControl fullWidth size="small" sx={{
                                minWidth: '16vh'
                            }}>
                                <InputLabel>Status</InputLabel>
                                <Select
                                    value={filtroStatus}
                                    label="Status"
                                    onChange={(event) => setFiltroStatus(event.target.value)}
                                    MenuProps={{
                                        PaperProps: {
                                            sx: {
                                                bgcolor: "background.default",
                                                color: "text.primary"
                                            },
                                        },
                                    }}
                                >
                                    <MenuItem value="">Todos</MenuItem>
                                    {STATUS.map((item) => (
                                        <MenuItem key={item.value} value={item.value}>
                                            {item.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} sm={6} md={2}>
                            <FormControl fullWidth size="small" sx={{
                                minWidth: '16vh'
                            }}>
                                <InputLabel>Prioridade</InputLabel>
                                <Select
                                    value={filtroPrioridade}
                                    label="Prioridade"
                                    onChange={(event) => setFiltroPrioridade(event.target.value)}
                                    MenuProps={{
                                        PaperProps: {
                                            sx: {
                                                bgcolor: "background.default",
                                                color: "text.primary",
                                            },
                                        },
                                    }}
                                >
                                    <MenuItem value="">Todas</MenuItem>
                                    {PRIORIDADES.map((item) => (
                                        <MenuItem key={item.value} value={item.value}>
                                            {item.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} sm={6} md={2}>
                            <FormControl fullWidth size="small" sx={{
                                minWidth: '16vh'
                            }}>
                                <InputLabel>Setor</InputLabel>
                                <Select
                                    value={filtroSetor}
                                    label="Setor"
                                    onChange={(event) => setFiltroSetor(event.target.value)}
                                    MenuProps={{
                                        PaperProps: {
                                            sx: {
                                                bgcolor: "background.default",
                                                color: "text.primary",
                                            },
                                        },
                                    }}
                                >
                                    <MenuItem value="">Todos</MenuItem>
                                    {setores.map((setor) => (
                                        <MenuItem key={setor} value={setor}>
                                            {setor}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} sm={6} md={2}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Cancelados</InputLabel>
                                <Select
                                    value={incluirCancelados ? "1" : "0"}
                                    label="Cancelados"
                                    onChange={(event) => setIncluirCancelados(event.target.value === "1")}
                                    MenuProps={{
                                        PaperProps: {
                                            sx: {
                                                bgcolor: "background.default",
                                                color: "text.primary",
                                            },
                                        },
                                    }}
                                >
                                    <MenuItem value="0">Ocultar</MenuItem>
                                    <MenuItem value="1">Incluir</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12}>
                            <Stack direction="row" justifyContent="flex-end" spacing={1}>
                                <Button
                                    color="inherit"
                                    onClick={() => {
                                        setBusca("");
                                        setFiltroStatus("");
                                        setFiltroPrioridade("");
                                        setFiltroSetor("");
                                        setIncluirCancelados(false);
                                    }}
                                >
                                    Limpar
                                </Button>

                                <Button
                                    variant="contained"
                                    startIcon={<Search />}
                                    onClick={() => carregarDados()}
                                >
                                    Filtrar
                                </Button>
                            </Stack>
                        </Grid>
                    </Grid>
                </Paper>


                {/* TABELA */}

                <Paper variant="outlined" sx={{ bgcolor: 'background.default', p: 1.5, mb: 2.5, borderRadius: 2.5 }}>
                    <Box
                        sx={{
                            p: 2,
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}
                    >
                        <Typography variant="h6" fontWeight={800}>
                            Lista de chamados
                        </Typography>

                        <Chip
                            label={`${chamadosVisiveis.length} registro(s)`}
                            variant="outlined"
                        />
                    </Box>

                    <Divider />

                    {carregando ? (
                        <Box sx={{ py: 8, display: "flex", justifyContent: "center" }}>
                            <CircularProgress />
                        </Box>
                    ) : chamadosVisiveis.length === 0 ? (
                        <Box sx={{ py: 8, textAlign: "center" }}>
                            <AssignmentTurnedIn
                                sx={{ fontSize: 54, color: "text.disabled", mb: 1 }}
                            />

                            <Typography fontWeight={700}>
                                Nenhum chamado encontrado
                            </Typography>

                            <Typography color="text.secondary" variant="body2">
                                Tente alterar os filtros ou abra um novo chamado.
                            </Typography>
                        </Box>
                    ) : (
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell width={80}>Nº</TableCell>
                                        <TableCell>Chamado</TableCell>
                                        <TableCell>Setor</TableCell>
                                        <TableCell>Solicitante</TableCell>
                                        <TableCell>Atendente</TableCell>
                                        <TableCell>Prioridade</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell>Data</TableCell>
                                        <TableCell align="right">Ações</TableCell>
                                    </TableRow>
                                </TableHead>

                                <TableBody>
                                    {chamadosVisiveis.map((chamado) => (
                                        <TableRow
                                            key={chamado.id}
                                            hover
                                            sx={{
                                                opacity: chamado.cancelado ? 0.55 : 1,
                                                cursor: "pointer",
                                            }}
                                            onClick={() => abrirDetalhes(chamado)}
                                        >
                                            <TableCell>
                                                <Typography fontWeight={800}>
                                                    #{chamado.id}
                                                </Typography>
                                            </TableCell>

                                            <TableCell sx={{ minWidth: 220 }}>
                                                <Typography fontWeight={700}>
                                                    {chamado.titulo}
                                                </Typography>

                                                {chamado.cancelado == 1 && (
                                                    <Chip
                                                        size="small"
                                                        color="error"
                                                        label="Cancelado"
                                                        sx={{ mt: 0.5 }}
                                                    />
                                                )}
                                            </TableCell>

                                            <TableCell>
                                                <Chip
                                                    size="small"
                                                    variant="outlined"
                                                    label={chamado.setor_destino}
                                                />
                                            </TableCell>

                                            <TableCell>
                                                {chamado.solicitante_nome || "-"}
                                            </TableCell>

                                            <TableCell>
                                                {chamado.atendente_nome || (
                                                    <Typography variant="body2" color="text.secondary">
                                                        Não assumido
                                                    </Typography>
                                                )}
                                            </TableCell>

                                            <TableCell>
                                                <Chip sx={{ color: 'primary.branco' }}
                                                    size="small"
                                                    color={corPrioridade(chamado.prioridade)}
                                                    label={nomePrioridade(chamado.prioridade)}
                                                />
                                            </TableCell>

                                            <TableCell>
                                                <Chip sx={{ color: 'primary.branco' }}
                                                    size="small"
                                                    color={corStatus(chamado.status)}
                                                    label={nomeStatus(chamado.status)}
                                                />
                                            </TableCell>

                                            <TableCell sx={{ whiteSpace: "nowrap" }}>
                                                {formatarData(chamado.criado_em)}
                                            </TableCell>

                                            <TableCell align="right">
                                                <Tooltip title="Ver detalhes">
                                                    <IconButton
                                                        size="small"
                                                        onClick={(event) => {
                                                            event.stopPropagation();
                                                            abrirDetalhes(chamado);
                                                        }}
                                                    >
                                                        <MoreVert />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </Paper>
            </Box>


            {/* =====================================================
                DIALOG: NOVO CHAMADO
            ====================================================== */}

            <Dialog
                open={dialogNovo}
                onClose={() => !salvando && setDialogNovo(false)}
                fullWidth
                maxWidth="sm"
                slotProps={{
                    paper: {
                        sx: {
                            bgcolor: "background.default",
                            color: "text.primary",
                            borderRadius: 3,
                            border: "1px solid",
                            borderColor: "divider",
                        },
                    },
                }}
            >
                <DialogTitle>
                    <Stack direction="row" alignItems="center" spacing={1}>

                        <SupportAgent sx={{ color: 'primary.main' }} />
                        <Typography variant="h6" fontWeight={800} sx={{ color: 'text.primary' }}>
                            Abrir novo chamado
                        </Typography>
                    </Stack>
                </DialogTitle>

                <DialogContent dividers>
                    <Stack spacing={2.5} sx={{ pt: 1 }}>
                        <TextField
                            fullWidth
                            label="Título do chamado"
                            placeholder="Ex.: Problema no recebimento de mercadorias"
                            value={novoTitulo}
                            onChange={(event) => setNovoTitulo(event.target.value)}
                            inputProps={{ maxLength: 255 }}
                            required
                        />

                        <TextField
                            fullWidth
                            multiline
                            minRows={5}
                            label="Descrição"
                            placeholder="Descreva o problema, a solicitação ou a necessidade..."
                            value={novaDescricao}
                            onChange={(event) => setNovaDescricao(event.target.value)}
                            inputProps={{ maxLength: 10000 }}
                            required
                        />

                        <FormControl fullWidth required>
                            <InputLabel>Setor destinatário</InputLabel>
                            <Select
                                value={novoSetor}
                                label="Setor destinatário"
                                onChange={(event) => alterarSetorNovoChamado(event.target.value)}
                                MenuProps={{
                                    PaperProps: {
                                        sx: {
                                            bgcolor: "background.default",
                                            color: "text.primary",
                                        },
                                    },
                                }}
                            >
                                {setores.map((setor) => (
                                    <MenuItem key={setor} value={setor}>
                                        {setor}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        {ehSuperior && novoSetor &&
                            (setorUsuario === "TI" || setorUsuario === "GERENCIA" ||
                                setorUsuario === String(novoSetor).trim().toUpperCase()) && (
                                <FormControl fullWidth>
                                    <InputLabel>Atribuir para colaborador (opcional)</InputLabel>
                                    <Select
                                        value={novoAtendenteId}
                                        label="Atribuir para colaborador (opcional)"
                                        onChange={(event) => setNovoAtendenteId(event.target.value)}
                                        MenuProps={{ PaperProps: { sx: { bgcolor: "background.default", color: "text.primary" } } }}
                                    >
                                        <MenuItem value="">Deixar sem responsável</MenuItem>
                                        {funcionariosNovoChamado.map((funcionario) => (
                                            <MenuItem key={funcionario.id} value={String(funcionario.id)}>
                                                {funcionario.nome} {funcionario.codigo ? `(${funcionario.codigo})` : ""}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                                        Apenas colaboradores ativos do setor selecionado.
                                    </Typography>
                                </FormControl>
                            )}

                        <FormControl fullWidth>
                            <InputLabel>Prioridade</InputLabel>
                            <Select
                                value={novaPrioridade}
                                label="Prioridade"
                                onChange={(event) => setNovaPrioridade(event.target.value)}
                                MenuProps={{
                                    PaperProps: {
                                        sx: {
                                            bgcolor: "background.default",
                                            color: "text.primary",
                                        },
                                    },
                                }}
                            >
                                {PRIORIDADES.map((item) => (
                                    <MenuItem key={item.value} value={item.value}>
                                        {item.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <Alert severity="info">
                            Ao abrir o chamado, todos os funcionários ativos do setor selecionado
                            receberão uma notificação.
                        </Alert>
                    </Stack>
                </DialogContent>

                <DialogActions sx={{ p: 2 }}>
                    <Button
                        color="error"
                        variant="contained"
                        onClick={() => setDialogNovo(false)}
                        disabled={salvando}
                    >
                        Cancelar
                    </Button>

                    <Button
                        variant="contained"
                        onClick={criarChamado}
                        disabled={salvando}
                        startIcon={salvando
                            ? <CircularProgress size={18} color="inherit" />
                            : <Send />
                        }
                    >
                        Abrir chamado
                    </Button>
                </DialogActions>
            </Dialog>


            {/* DIALOG: DETALHES DO CHAMADO */}


            {/* =====================================================
    DRAWER: DETALHES DO CHAMADO
====================================================== */}

            <Drawer
                anchor="right"
                open={dialogDetalhes}
                onClose={() => !salvando && setDialogDetalhes(false)}
                slotProps={{
                    paper: {
                        sx: {
                            width: { xs: "100%", sm: 520, md: 600 },
                            maxWidth: "100vw",
                            height: "100%",
                            display: "flex",
                            flexDirection: "column",
                            bgcolor: "background.default",
                            color: "text.primary",
                            borderLeft: "1px solid",
                            borderColor: "divider",
                        },
                    },
                }}
            >
                {chamadoSelecionado && (
                    <>
                        {/* CABEÇALHO */}

                        <Box
                            sx={{
                                p: 2,
                                borderBottom: 1,
                                borderColor: "divider",
                                flexShrink: 0,
                            }}
                        >
                            <Stack
                                direction="row"
                                alignItems="center"
                                justifyContent="space-between"
                                spacing={2}
                            >
                                <Stack
                                    direction="row"
                                    alignItems="center"
                                    spacing={1}
                                >
                                    <SupportAgent color="primary" />

                                    <Typography fontWeight={800}>
                                        Detalhes do chamado
                                    </Typography>
                                </Stack>

                                <IconButton
                                    onClick={() => !salvando && setDialogDetalhes(false)}
                                    disabled={salvando}
                                    sx={{ color: "text.primary" }}
                                >
                                    <Close />
                                </IconButton>
                            </Stack>

                            <Box sx={{ mt: 2 }}>
                                <Typography
                                    variant="overline"
                                    color="text.secondary"
                                >
                                    CHAMADO #{chamadoSelecionado.id}
                                </Typography>

                                <Typography
                                    variant="h6"
                                    fontWeight={800}
                                    sx={{ overflowWrap: "anywhere" }}
                                >
                                    {chamadoSelecionado.titulo}
                                </Typography>

                                <Stack
                                    direction="row"
                                    spacing={0.75}
                                    flexWrap="wrap"
                                    useFlexGap
                                    sx={{ mt: 1 }}
                                >
                                    <Chip sx={{ color: 'primary.branco' }}
                                        color={corPrioridade(chamadoSelecionado.prioridade)}
                                        label={nomePrioridade(chamadoSelecionado.prioridade)}
                                        size="small"
                                    />

                                    <Chip sx={{ color: 'primary.branco' }}
                                        color={corStatus(chamadoSelecionado.status)}
                                        label={nomeStatus(chamadoSelecionado.status)}
                                        size="small"
                                    />

                                    {chamadoSelecionado.cancelado == 1 && (
                                        <Chip
                                            label="Cancelado"
                                            size="small"
                                            color="error"
                                            sx={{ color: 'primary.branco' }}
                                        />
                                    )}
                                </Stack>
                            </Box>
                        </Box>

                        {/* CONTEÚDO COM ROLAGEM */}

                        <Box
                            sx={{
                                p: 2,
                                flex: 1,
                                minHeight: 0,
                                overflowY: "auto",
                                bgcolor: "background.default",
                            }}
                        >
                            <Stack spacing={2.5}>

                                {/* AVISO DE CANCELAMENTO */}

                                {chamadoSelecionado.cancelado == 1 && (
                                    <Alert severity="error">
                                        <Typography variant="body2" fontWeight={700}>
                                            Este chamado foi cancelado.
                                        </Typography>

                                        {chamadoSelecionado.motivo_cancelamento && (
                                            <Typography variant="body2" sx={{ mt: 0.5 }}>
                                                <strong>Motivo:</strong>{" "}
                                                {chamadoSelecionado.motivo_cancelamento}
                                            </Typography>
                                        )}
                                    </Alert>
                                )}

                                {/* DESCRIÇÃO */}

                                <Box>
                                    <Stack
                                        direction="row"
                                        alignItems="center"
                                        spacing={1}
                                        sx={{ mb: 1 }}
                                    >
                                        <DescriptionOutlined
                                            fontSize="small"
                                            color="action"
                                            sx={{ color: 'primary.main' }}
                                        />

                                        <Typography fontWeight={800}>
                                            Descrição
                                        </Typography>
                                    </Stack>

                                    <Paper
                                        variant="outlined"
                                        sx={{
                                            p: 1.5,
                                            bgcolor: "action.hover",
                                            borderColor: "divider",
                                            whiteSpace: "pre-wrap",
                                            overflowWrap: "anywhere",
                                        }}
                                    >
                                        <Typography variant="body2">
                                            {chamadoSelecionado.descricao}
                                        </Typography>
                                    </Paper>
                                </Box>

                                {/* INFORMAÇÕES */}

                                <Divider />

                                <SectionTitle icon={<InfoOutlined fontSize="small" />}>
                                    Informações do chamado
                                </SectionTitle>

                                <Stack spacing={1.5}>
                                    <Stack direction="row" spacing={1.25} alignItems="center">
                                        <BusinessOutlined fontSize="small" color="action" />
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">
                                                Setor responsável
                                            </Typography>
                                            <Typography variant="body2" fontWeight={700}>
                                                {chamadoSelecionado.setor_destino}
                                            </Typography>
                                        </Box>
                                    </Stack>

                                    <Stack direction="row" spacing={1.25} alignItems="center">
                                        <PersonOutline fontSize="small" color="action" />
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">
                                                Solicitante
                                            </Typography>
                                            <Typography variant="body2" fontWeight={700}>
                                                {chamadoSelecionado.solicitante_nome || "-"}
                                            </Typography>
                                        </Box>
                                    </Stack>

                                    <Stack direction="row" spacing={1.25} alignItems="center">
                                        <SupportAgent fontSize="small" color="action" />
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">
                                                Atendente
                                            </Typography>
                                            <Typography variant="body2" fontWeight={700}>
                                                {chamadoSelecionado.atendente_nome || "Aguardando responsável"}
                                            </Typography>
                                        </Box>
                                    </Stack>

                                    <Stack direction="row" spacing={1.25} alignItems="center">
                                        <CalendarMonthOutlined fontSize="small" color="action" />
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">
                                                Aberto em
                                            </Typography>
                                            <Typography variant="body2" fontWeight={700}>
                                                {formatarData(chamadoSelecionado.criado_em)}
                                            </Typography>
                                        </Box>
                                    </Stack>

                                    {chamadoSelecionado.resolvido_em && (
                                        <Stack direction="row" spacing={1.25} alignItems="center">
                                            <TaskAlt fontSize="small" color="success" />
                                            <Box>
                                                <Typography variant="caption" color="text.secondary">
                                                    Resolvido em
                                                </Typography>
                                                <Typography variant="body2" fontWeight={700}>
                                                    {formatarData(chamadoSelecionado.resolvido_em)}
                                                </Typography>
                                            </Box>
                                        </Stack>
                                    )}
                                </Stack>

                                <Divider />

                                {/* AÇÕES */}

                                <SectionTitle icon={<Tune fontSize="small" />}>
                                    Ações do chamado
                                </SectionTitle>

                                <Stack spacing={1}>
                                    {podeAssumir(chamadoSelecionado) && (
                                        <Button
                                            fullWidth
                                            variant="contained"
                                            color="primary"
                                            startIcon={<SupportAgent />}
                                            onClick={assumirChamado}
                                            disabled={salvando}
                                        >
                                            Assumir chamado
                                        </Button>
                                    )}

                                    {ehSuperior &&
                                        !chamadoSelecionado.cancelado &&
                                        chamadoSelecionado.status !== "RESOLVIDO" &&
                                        (setorUsuario === "TI" || setorUsuario === "GERENCIA" ||
                                            setorUsuario === String(chamadoSelecionado.setor_destino || "").trim().toUpperCase()) && (
                                            <Stack spacing={1}>
                                                <FormControl fullWidth size="small">
                                                    <InputLabel>Responsável do chamado</InputLabel>
                                                    <Select
                                                        value={novoResponsavelId}
                                                        label="Responsável do chamado"
                                                        onChange={(event) => setNovoResponsavelId(event.target.value)}
                                                        MenuProps={{ PaperProps: { sx: { bgcolor: "background.default", color: "text.primary" } } }}
                                                    >
                                                        {funcionariosAtribuicao.map((funcionario) => (
                                                            <MenuItem key={funcionario.id} value={String(funcionario.id)}>
                                                                {funcionario.nome} {funcionario.codigo ? `(${funcionario.codigo})` : ""}
                                                            </MenuItem>
                                                        ))}
                                                    </Select>
                                                </FormControl>
                                                <Button
                                                    fullWidth
                                                    variant="outlined"
                                                    onClick={atribuirChamado}
                                                    disabled={salvando || !novoResponsavelId || Number(novoResponsavelId) === Number(chamadoSelecionado.atendente_id)}
                                                >
                                                    Atribuir responsável
                                                </Button>
                                            </Stack>
                                        )}

                                    {podeAlterarStatus(chamadoSelecionado) && (
                                        <FormControl fullWidth size="small">
                                            <InputLabel>Atualizar status</InputLabel>

                                            <Select
                                                value=""
                                                label="Atualizar status"
                                                onChange={(event) => alterarStatus(event.target.value)}
                                                disabled={salvando}
                                                MenuProps={{
                                                    PaperProps: {
                                                        sx: {
                                                            bgcolor: "background.default",
                                                            color: "text.primary",
                                                        },
                                                    },
                                                }}
                                            >
                                                {STATUS
                                                    .filter((item) => ehSuperior || item.value !== "ABERTO")
                                                    .filter((item) => item.value !== chamadoSelecionado.status)
                                                    .map((item) => (
                                                        <MenuItem key={item.value} value={item.value}>
                                                            {item.label}
                                                        </MenuItem>
                                                    ))}
                                            </Select>
                                        </FormControl>
                                    )}

                                    {!chamadoSelecionado.cancelado &&
                                        chamadoSelecionado.status !== "RESOLVIDO" && (
                                            <Button
                                                fullWidth
                                                variant="outlined"
                                                color="primary"
                                                startIcon={<TaskAlt />}
                                                onClick={criarTarefaKanban}
                                                disabled={salvando || jaCriouTarefa}
                                            >
                                                {jaCriouTarefa
                                                    ? "Tarefa já criada"
                                                    : "Criar tarefa no Kanban"}
                                            </Button>
                                        )}

                                    {podeCancelar(chamadoSelecionado) && (
                                        <Button
                                            fullWidth
                                            variant="outlined"
                                            color="error"
                                            startIcon={<Cancel />}
                                            onClick={() => setDialogCancelar(true)}
                                            disabled={salvando}
                                        >
                                            Cancelar chamado
                                        </Button>
                                    )}
                                </Stack>

                                {!chamadoSelecionado.cancelado &&
                                    chamadoSelecionado.status !== "RESOLVIDO" && (
                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                        >
                                            A tarefa criada será adicionada ao seu quadro pessoal do Kanban.
                                        </Typography>
                                    )}

                                <Divider />

                                {/* COMENTÁRIOS */}

                                <SectionTitle icon={<CommentOutlined fontSize="small" />}>
                                    Comentários ({comentarios.length})
                                </SectionTitle>

                                {comentarios.length === 0 ? (
                                    <Typography variant="body2" color="text.secondary">
                                        Nenhum comentário registrado.
                                    </Typography>
                                ) : (
                                    <Stack spacing={1.25}>
                                        {comentarios.map((item) => (
                                            <Paper
                                                key={item.id}
                                                variant="outlined"
                                                sx={{
                                                    p: 1.5,
                                                    bgcolor: "background.default",
                                                    borderColor: "divider",
                                                }}
                                            >
                                                <Stack direction="row" spacing={1}>
                                                    <Avatar
                                                        sx={{
                                                            width: 30,
                                                            height: 30,
                                                            bgcolor: "action.selected",
                                                            color: "text.secondary",
                                                            fontSize: 13,
                                                        }}
                                                    >
                                                        {item.funcionario_nome?.charAt(0)?.toUpperCase() || "?"}
                                                    </Avatar>

                                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                                        <Typography
                                                            variant="body2"
                                                            fontWeight={800}
                                                        >
                                                            {item.funcionario_nome || "Funcionário"}
                                                        </Typography>

                                                        <Typography
                                                            variant="body2"
                                                            sx={{
                                                                mt: 0.5,
                                                                whiteSpace: "pre-wrap",
                                                                overflowWrap: "anywhere",
                                                            }}
                                                        >
                                                            {item.comentario}
                                                        </Typography>

                                                        <Typography
                                                            variant="caption"
                                                            color="text.secondary"
                                                        >
                                                            {formatarData(item.criado_em)}
                                                        </Typography>
                                                    </Box>
                                                </Stack>
                                            </Paper>
                                        ))}
                                    </Stack>
                                )}

                                {!chamadoSelecionado.cancelado && (
                                    <Stack spacing={1}>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            multiline
                                            minRows={2}
                                            maxRows={4}
                                            placeholder="Escreva um comentário..."
                                            value={novoComentario}
                                            onChange={(event) => setNovoComentario(event.target.value)}
                                            inputProps={{ maxLength: 10000 }}
                                        />

                                        <Button
                                            fullWidth
                                            variant="contained"
                                            onClick={enviarComentario}
                                            disabled={salvando || !novoComentario.trim()}
                                            startIcon={<Send />}
                                        >
                                            Enviar comentário
                                        </Button>
                                    </Stack>
                                )}

                                <Divider />

                                {/* HISTÓRICO */}

                                <SectionTitle icon={<HistoryOutlined fontSize="small" />}>
                                    Histórico do chamado
                                </SectionTitle>

                                {historico.length === 0 ? (
                                    <Typography variant="body2" color="text.secondary">
                                        Nenhum evento registrado.
                                    </Typography>
                                ) : (
                                    <Stack spacing={1.75}>
                                        {historico.map((item) => (
                                            <Box
                                                key={item.id}
                                                sx={{
                                                    display: "flex",
                                                    gap: 1.25,
                                                    alignItems: "flex-start",
                                                }}
                                            >
                                                <Avatar
                                                    sx={{
                                                        width: 30,
                                                        height: 30,
                                                        bgcolor: "action.selected",
                                                        color: "text.secondary",
                                                    }}
                                                >
                                                    <Assignment fontSize="small" />
                                                </Avatar>

                                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                                    <Typography variant="body2" fontWeight={700}>
                                                        {item.acao?.replaceAll("_", " ")}
                                                    </Typography>

                                                    <Typography
                                                        variant="body2"
                                                        color="text.secondary"
                                                        sx={{ overflowWrap: "anywhere" }}
                                                    >
                                                        {item.detalhes || "Registro de atividade"}
                                                    </Typography>

                                                    <Typography variant="caption" color="text.secondary">
                                                        {item.funcionario_nome || "Funcionário"} ·{" "}
                                                        {formatarData(item.criado_em)}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        ))}
                                    </Stack>
                                )}

                            </Stack>
                        </Box>

                        {/* RODAPÉ FIXO */}

                        <Box
                            sx={{
                                p: 2,
                                borderTop: 1,
                                borderColor: "divider",
                                flexShrink: 0,
                                bgcolor: "background.default",
                            }}
                        >
                            <Button
                                fullWidth
                                variant="outlined"
                                color="inherit"
                                onClick={() => setDialogDetalhes(false)}
                                disabled={salvando}
                            >
                                Fechar
                            </Button>
                        </Box>
                    </>
                )}
            </Drawer>


            {/* DIALOG: CANCELAMENTO  */}

            <Dialog
                open={dialogCancelar}
                onClose={() => !salvando && setDialogCancelar(false)}
                fullWidth
                maxWidth="xs"
                slotProps={{
                    paper: {
                        sx: {
                            bgcolor: "background.default",
                            color: "text.primary",
                            borderRadius: 3,
                            border: "1px solid",
                            borderColor: "divider",
                        },
                    },
                }}
            >
                <DialogTitle>
                    Cancelar chamado #{chamadoSelecionado?.id}
                </DialogTitle>

                <DialogContent>
                    <Alert severity="warning" sx={{ mb: 2 }}>
                        O cancelamento será registrado no histórico e não poderá ser desfeito por esta tela.
                    </Alert>

                    <TextField
                        fullWidth
                        multiline
                        minRows={3}
                        label="Motivo do cancelamento"
                        placeholder="Explique por que este chamado será cancelado..."
                        value={motivoCancelamento}
                        onChange={(event) => setMotivoCancelamento(event.target.value)}
                        inputProps={{ maxLength: 2000 }}
                        required
                    />
                </DialogContent>

                <DialogActions sx={{ p: 2 }}>
                    <Button
                        color="inherit"
                        onClick={() => setDialogCancelar(false)}
                        disabled={salvando}
                    >
                        Voltar
                    </Button>

                    <Button
                        color="error"
                        variant="contained"
                        onClick={cancelarChamado}
                        disabled={salvando || !motivoCancelamento.trim()}
                        startIcon={<Cancel />}
                    >
                        Confirmar cancelamento
                    </Button>
                </DialogActions>
            </Dialog>

        </Box>
    );
}