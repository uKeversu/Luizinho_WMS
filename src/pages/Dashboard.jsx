import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Container,
    Typography,
    Card,
    CardContent,
    Grid,
    TextField,
    Button,
    Box,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Tabs,
    Tab,
    Checkbox,
    CircularProgress,
    Backdrop,
    Snackbar,
    Alert,
    MenuItem
} from "@mui/material";

import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import SearchIcon from '@mui/icons-material/Search';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import BorderColorIcon from '@mui/icons-material/BorderColor';
import SyncIcon from '@mui/icons-material/Sync';
import LocalPrintshopIcon from '@mui/icons-material/LocalPrintshop';
import ReplayIcon from '@mui/icons-material/Replay';

import LoginFuncionario from "../components/LoginFuncionario";

import '../style/App.css';

import Conferencia from "./Conferencia";

function Dashboard({ tipo }) {

    // API BASE
    const API = "http://192.168.1.185:8077";

    // Acessar outras pages
    const navigate = useNavigate();

    // Login e Logout
    const [userInfo, setUserInfo] = useState(() => {
        const user = localStorage.getItem("user_info");
        return user ? JSON.parse(user) : null;
    });
    const [token, setToken] = useState(() => localStorage.getItem("nfe_token") || "");

    const logout = () => {
        setToken("");
        setUserInfo(null);
        localStorage.removeItem("nfe_token");
        localStorage.removeItem("user_info");
    };

    // Sistema
    const [notas, setNotas] = useState([]);
    const [loadingNotas, setLoadingNotas] = useState(false);
    const [busca, setBusca] = useState("");
    const [openModal, setOpenModal] = useState(false);
    const [itensNota, setItensNota] = useState([]);
    const [buscaItem, setBuscaItem] = useState("");
    const [notaSelecionada, setNotaSelecionada] = useState(null);
    const [observacaoPalet, setObservacaoPalet] = useState("");
    const [aba, setAba] = useState(1);
    const [notasSelecionadas, setNotasSelecionadas] = useState([]);
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
    const [loadingNotasIds, setLoadingNotasIds] = useState([]);
    const [ordemData, setOrdemData] = useState("desc");
    const [dataInicio, setDataInicio] = useState("");
    const [dataFim, setDataFim] = useState("");
    const [tipoDataFiltro, setTipoDataFiltro] = useState("recebimento");

    // SS Plus Sync
    const [loadingSync, setLoadingSync] = useState(false);

    useEffect(() => {
        if (token) buscarNotas();
    }, [token]);

    useEffect(() => {
        setNotasSelecionadas([]);
    }, [aba]);

    // Padroniza busca de notas dos últimos 7 dias
    useEffect(() => {
        const hoje = new Date();

        const seteDiasAtras = new Date();
        seteDiasAtras.setDate(hoje.getDate() - 7);

        const formatarData = (data) => {
            return data.toISOString().split("T")[0];
        };

        setDataInicio(formatarData(seteDiasAtras));
        setDataFim(formatarData(hoje));
    }, []);

    // Busca notas na API
    const buscarNotas = async () => {
        setLoadingNotas(true);
        try {
            const response = await fetch(`${API}/api/notas/listar`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "X-Auth-Token": token
                }
            });

            const data = await response.json();

            if (!response.ok) {
                console.error("Erro ao buscar notas:", data);
                setNotas([]);
                return;
            }

            const notasArray = Array.isArray(data) ? data : [];

            // Buscar observação do palete para cada nota
            const notasComObs = await Promise.all(
                notasArray.map(async (nota) => {
                    try {
                        const respPalet = await fetch(`${API}/api/palet_nfe/${nota.id}`);
                        const dataPalet = await respPalet.json();

                        const observacao = (dataPalet.items && dataPalet.items[0]?.observacao_palet) || "";

                        return { ...nota, observacao_palet: observacao };
                    } catch (err) {
                        console.error(`Erro ao buscar observação da nota ${nota.id}:`, err);
                        return { ...nota, observacao_palet: "" };
                    }
                })
            );

            setNotas(notasComObs);

        } catch (error) {
            console.error("Erro na requisição:", error);
            setNotas([]);
        } finally {
            setLoadingNotas(false);
        }
    };

    const notasFiltradas = notas.filter(nota => {
        const termo = busca.trim();
        if (!termo) return true;

        return (
            nota?.numero?.toString().includes(termo) ||
            nota?.serie?.toString().includes(termo)
        );
    });

    const caixaInvalida = (caixa) => {
        return caixa === "0" || caixa === 0 || caixa === null || caixa === "" || caixa === undefined;
    };

    // Busca itens das notas
    const buscarItens = async (nota) => {
        try {

            setItensNota([]);
            setNotaSelecionada(nota);
            setOpenModal(true);

            const response = await fetch(
                `${API}/api/itens_nfe/${nota.id}`
            );

            const data = await response.json();

            if (response.ok) {
                console.log("RESPOSTA ITENS:", data);

                const todosItens = data.items || [];

                const itensComDados = todosItens.map((item) => {

                    const caixa = caixaInvalida(item.caixa)
                        ? null
                        : item.caixa;

                    return {
                        ...item,
                        caixa,
                        basico: item.basico || "-",
                        localizacao: item.loc_sistema || "-",
                        qtd_conferida: Number(item.qtd_conferida) || 0
                    };
                });

                setItensNota(itensComDados);

                console.log("Buscando itens da nota:", nota.id);
                console.log("URL:", `${API}/api/itens_nfe/${nota.id}`);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const itensFiltrados = itensNota.filter(item => {
        const termo = buscaItem.trim().toLowerCase();
        if (!termo) return true;

        return (
            item?.descricao?.toLowerCase().includes(termo) ||
            item?.xProd?.toLowerCase().includes(termo) ||
            item?.cean?.toString().includes(termo) ||
            item?.codigo_barras?.toString().includes(termo) ||
            item?.basico?.toString().includes(termo) ||
            item?.loc_sistema?.toString().includes(termo)
        );
    });

    // Busca observação da nota
    const buscarObservacaoPalet = async (notaId) => {
        try {
            const response = await fetch(`${API}/api/palet_nfe/${notaId}`);
            const data = await response.json();

            if (response.ok && data.items && data.items.length > 0) {
                setObservacaoPalet(data.items[0].observacao_palet || "");
            } else {
                setObservacaoPalet("");
            }
        } catch (err) {
            console.error("Erro ao buscar observação do palet:", err);
            setObservacaoPalet("");
        }
    };

    // Altera status para recebida
    const atualizarStatusNota = async (nota) => {
        if (!nota.numero || !nota.serie) {
            console.error("Nota inválida:", nota);
            return;
        }

        setLoadingNotasIds(prev => [...prev, nota.id]);

        try {
            const response = await fetch(
                `${API}/api/nfe/atualizar_por_nfe/${nota.serie}/${nota.numero}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "X-Auth-Token": token
                    },
                    body: JSON.stringify({
                        status: "PENDENTE"
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data?.erro || "Erro ao atualizar");
            }

            const formatarDataBR = () => {
                const hoje = new Date();
                const dia = String(hoje.getDate()).padStart(2, '0');
                const mes = String(hoje.getMonth() + 1).padStart(2, '0');
                const ano = hoje.getFullYear();

                return `${dia}-${mes}-${ano}`;
            };

            setNotas(prev =>
                prev.map(n =>
                    n.id === nota.id
                        ? { ...n, status: "PENDENTE", data_recebimento: new Date().toISOString() }
                        : n
                )
            );

            setSnackbar({
                open: true,
                message: `NF ${nota.numero} atualizada com sucesso`,
                severity: "success"
            });

        } catch (error) {
            console.error(error);

            setSnackbar({
                open: true,
                message: error.message || "Erro ao atualizar nota",
                severity: "error"
            });

        } finally {
            setLoadingNotasIds(prev => prev.filter(id => id !== nota.id));
        }
    };

    // Converte data para ordenar
    const parseData = (data) => {
        if (!data) return new Date(0);

        // Se já estiver ISO, funciona direto
        if (data.includes("T")) return new Date(data);

        // Converter DD-MM-YYYY ou DD/MM/YYYY
        const [dia, mes, ano] = data.split(/[-/]/);

        return new Date(`${ano}-${mes}-${dia}`);
    };

    const notasFiltradasPorAba = notasFiltradas.filter(nota => {

        const campoData =
            tipoDataFiltro === "emissao"
                ? nota.data_emissao
                : nota.data_recebimento;

        const dataNota = parseData(campoData);

        // FILTRO DE DATA PARA TODAS AS ABAS
        if (dataInicio) {
            const inicio = new Date(dataInicio);
            inicio.setHours(0, 0, 0, 0);

            if (dataNota < inicio) return false;
        }

        if (dataFim) {
            const fim = new Date(dataFim);
            fim.setHours(23, 59, 59, 999);

            if (dataNota > fim) return false;
        }

        // FILTRO DAS ABAS
        if (aba === 0)
            return nota.status === "EM_TRANSITO";

        if (aba === 1)
            return ["PENDENTE", "FORNECEDOR_DIRETO"].includes(nota.status);

        if (aba === 2)
            return nota.status === "CONFERIDA";

        if (aba === 3)
            return true;

        return true;
    });

    // Ordena notas pela data de recebimento
    const notasOrdenadas = [...notasFiltradasPorAba].sort((a, b) => {

        const campoDataA =
            tipoDataFiltro === "emissao"
                ? a.data_emissao
                : a.data_recebimento;

        const campoDataB =
            tipoDataFiltro === "emissao"
                ? b.data_emissao
                : b.data_recebimento;

        const dataA = parseData(campoDataA);
        const dataB = parseData(campoDataB);

        return ordemData === "asc"
            ? dataA - dataB
            : dataB - dataA;
    });

    // Sincroniza com SS PLUS
    const pegarLocal = async () => {
        setLoadingSync(true);

        const tempoMinimo = 2000;
        const inicio = Date.now();

        let snackbarData = null;

        try {
            const response = await fetch('http://192.168.1.185:8077/api/checar_localizacao_lote', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ todos: true })
            });

            const data = await response.json();

            console.log("RESPOSTA API:", data);

            if (response.ok) {
                const {
                    atualizados = 0,
                    erros = 0,
                    nao_encontrados = 0,
                    total_processados = 0
                } = data || {};

                console.log("Total processados:", total_processados)
                console.log("Atualizados:", atualizados)
                console.log("Erros:", erros)
                console.log("Não encontrados:", nao_encontrados)

                const semDados =
                    total_processados === 0 &&
                    atualizados === 0 &&
                    nao_encontrados === 0 &&
                    erros === 0;

                if (semDados) {
                    snackbarData = {
                        open: true,
                        message: "Nenhum item para sincronizar",
                        severity: "info"
                    };
                } else {
                    snackbarData = {
                        open: true,
                        message: `Processados: ${total_processados} | Atualizados: ${atualizados} | Não encontrados: ${nao_encontrados}`,
                        severity: erros > 0 ? "warning" : "success"
                    };
                }
            } else {
                snackbarData = {
                    open: true,
                    message: "Erro ao buscar localizações no SS Plus!",
                    severity: "error"
                };
            }

        } catch (err) {
            console.error('Erro na requisição:', err);
            snackbarData = {
                open: true,
                message: "Erro ao sincronizar com SS Plus!",
                severity: "error"
            };

        } finally {
            const tempoPassado = Date.now() - inicio;
            const tempoRestante = tempoMinimo - tempoPassado;

            const finalizar = () => {
                setLoadingSync(false);
                if (snackbarData) {
                    setSnackbar(snackbarData);
                }
            };

            if (tempoRestante > 0) {
                setTimeout(finalizar, tempoRestante);
            } else {
                finalizar();
            }
        }
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
            <Container maxWidth="100%" sx={{ mt: 4, bgcolor: "background.default" }}>
                {/* Header */}
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', md: 'row' },
                        justifyContent: 'space-between',
                        alignItems: { xs: 'flex-start', md: 'center' },
                        gap: 2,
                        p: 2,
                        bgcolor: 'var(--azul)'
                    }}
                >
                    <Typography variant="h4" sx={{ fontFamily: 'Consolas', color: "background.paper" }}>
                        <strong>
                            {aba === 0 && "Notas em Trânsito"}
                            {aba === 1 && "Notas Recebidas"}
                            {aba === 2 && "Notas Conferidas"}
                            {aba === 3 && "Histórico"}
                        </strong>
                    </Typography>
                    <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'right', mr: '0' }}>
                            {<PersonIcon sx={{ color: "var(--branco)", paddingRight: '1vh' }} />}
                            <Typography sx={{ color: "var(--branco)", fontSize: '0.9rem', display: 'flex', alignItems: 'center' }}>
                                {userInfo?.nome}
                            </Typography>
                            {token && (
                                <Button
                                    size="small"
                                    onClick={logout}
                                    sx={{ color: "var(--branco)", display: 'flex', gap: 1 }}
                                >{<LogoutIcon />}
                                </Button>
                            )}
                        </Box>
                        <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'right', mr: '2vh' }}>

                            <Button
                                onClick={() => navigate("/PainelReimpressao")}
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
                                Reimpressão
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <LocalPrintshopIcon fontSize="small" />
                                    <ReplayIcon fontSize="small" sx={{ fontSize: 14 }} />
                                </Box>
                            </Button>
                            <Button
                                id="btnAtualizar" onClick={pegarLocal}
                                disabled={loadingSync}
                                size="small"
                                sx={{
                                    color: "background.paper",
                                    display: 'flex',
                                    gap: 0.5,
                                    fontSize: '0.75rem',
                                    minWidth: 'auto',
                                    padding: '4px 8px',
                                    whiteSpace: 'nowrap'
                                }}>
                                SS Plus Sync
                                {<SyncIcon />}
                            </Button>
                            <Button
                                onClick={() => navigate("/AtualizarCean")}
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
                                CORREÇÃO DE NOTAS
                                {<BorderColorIcon />}
                            </Button>
                            <Button
                                onClick={() => navigate("/ConsultaGeral")}
                                sx={{ color: "var(--branco)", display: 'flex', gap: 1 }}
                            >
                                Consulta Geral
                                {<SearchIcon />}
                            </Button>
                            <Button
                                onClick={() => navigate("/")}
                                sx={{ color: "var(--branco)", display: 'flex', gap: 1 }}
                            >
                                Recebimento
                                {<LocalShippingIcon />}
                            </Button>
                            <pre id="resultado"></pre>
                        </Box>
                    </Box>
                </Box>

                {/* Loading de sincronização SS Plus*/}
                <Backdrop
                    open={loadingSync}
                    sx={{ zIndex: (theme) => theme.zIndex.drawer + 999 }}
                >
                    <Box textAlign="center">
                        <CircularProgress sx={{ color: "background.paper" }} color="inherit" />
                        <Typography mt={2} sx={{ color: "background.paper" }}>
                            Sincronizando com o SS Plus...
                        </Typography>
                    </Box>
                </Backdrop>

                <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: "background.default" }}>
                    <Tabs
                        value={aba}
                        onChange={(e, newValue) => setAba(newValue)}
                        textColor="primary"
                        indicatorColor="primary"
                        centered
                    >
                        <Tab label="Em Trânsito" />
                        <Tab label="Pendentes" />
                        <Tab label="Conferidas" />
                        <Tab label="Histórico" />
                    </Tabs>
                </Box>
                <Box sx={{ mt: 3 }}>

                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                        <TextField
                            label="Buscar por NF"
                            variant="outlined"
                            size="small"
                            fullWidth
                            sx={{
                                bgcolor: 'background.default',
                                '& .MuiOutlinedInput-root': {
                                    '&:hover fieldset': {
                                        borderColor: 'var(--azul)',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: 'var(--azul)',
                                    }
                                }
                            }}
                            value={busca}
                            onChange={(e) => setBusca(e.target.value)}
                        />

                        <Box sx={{ display: 'flex', gap: 1 }}>

                            <TextField
                                select
                                label="Filtrar por"
                                size="small"
                                value={tipoDataFiltro}
                                onChange={(e) => setTipoDataFiltro(e.target.value)}
                                sx={{
                                    minWidth: 170,
                                    bgcolor: 'background.default'
                                }}
                                SelectProps={{
                                    MenuProps: {
                                        PaperProps: {
                                            sx: {
                                                bgcolor: 'background.default',
                                                color: 'text.primary'
                                            }
                                        }
                                    }
                                }}
                            >
                                <MenuItem value="recebimento">
                                    Data Importação
                                </MenuItem>

                                <MenuItem value="emissao">
                                    Data Emissão
                                </MenuItem>
                            </TextField>

                            <TextField
                                type="date"
                                label="Data início"
                                size="small"
                                InputLabelProps={{ shrink: true }}
                                value={dataInicio}
                                onChange={(e) => setDataInicio(e.target.value)}
                                sx={{ bgcolor: 'background.default' }}
                            />

                            <TextField
                                type="date"
                                label="Data fim"
                                size="small"
                                InputLabelProps={{ shrink: true }}
                                value={dataFim}
                                onChange={(e) => setDataFim(e.target.value)}
                                sx={{ bgcolor: 'background.default' }}
                            />

                            <Button
                                variant="outlined"
                                onClick={() => {
                                    setDataInicio("");
                                    setDataFim("");
                                }}
                            >
                                Limpar
                            </Button>
                        </Box>

                        <Button
                            variant="contained"
                            onClick={() => setOrdemData(prev => prev === "asc" ? "desc" : "asc")}
                            size="small"
                            sx={{
                                minWidth: "180px",
                                maxHeight: "100%",
                                bgcolor: 'var(--azul)',
                                '&:hover': { bgcolor: 'var(--azul-hover)' }
                            }}
                        >
                            {ordemData === "asc" ? "Mais recentes" : "Mais antigas"}
                            <SwapVertIcon />
                        </Button>
                    </Box>

                    {aba === 1 && aba !== 3 && (
                        <Button
                            variant="contained"
                            sx={{ mb: 2 }}
                            disabled={notasSelecionadas.length === 0}
                            onClick={() => {
                                const notasValidas = notasSelecionadas.map(id =>
                                    notas.find(n => n.id === id)
                                );

                                const temRecebida = notasValidas.some(nota => nota.status === "PENDENTE");

                                if (temRecebida && notasValidas.length > 1) {
                                    setSnackbar({
                                        open: true,
                                        message: "Notas com status 'PENDENTE' só podem ser conferidas uma por vez!",
                                        severity: "warning"
                                    });
                                    return;
                                }

                                navigate("/Conferencia", {
                                    state: { notas: notasValidas }
                                });
                            }}
                        >
                            Conferir selecionadas ({notasSelecionadas.length})
                        </Button>
                    )}

                    {loadingNotas ? (
                        <Box textAlign="center">
                            <CircularProgress />
                        </Box>
                    ) : notasOrdenadas.length === 0 ? (
                        <Typography>Nenhuma nota encontrada</Typography>
                    ) : (
                        <Grid container spacing={4}>

                            {notasOrdenadas.map((nota, idx) => (

                                <Grid size={{ xs: 12, md: 3 }} key={idx}>
                                    <Card
                                        variant="outlined"
                                        sx={{
                                            borderRadius: '16px',
                                            overflow: 'hidden',
                                            border: '1px solid',
                                            borderColor: 'divider',
                                            bgcolor:
                                                nota.status === "FORNECEDOR_DIRETO"
                                                    ? 'background.forndireto'
                                                    : 'background.inputBg',
                                            boxShadow: '0 3px 10px rgba(0,0,0,0.08)',
                                            transition: '0.2s ease',
                                            height: '100%',
                                            display: 'flex',
                                            flexDirection: 'column',

                                            '&:hover': {
                                                transform: 'translateY(-2px)',
                                                boxShadow: '0 6px 16px rgba(0,0,0,0.12)',
                                            }
                                        }}
                                    >
                                        <CardContent
                                            sx={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                flexGrow: 1,
                                                p: 1.5,
                                                gap: 1
                                            }}
                                        >
                                            {/* HEADER */}
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'flex-start',
                                                    gap: 1
                                                }}
                                            >
                                                <Box>
                                                    <Typography
                                                        sx={{
                                                            fontSize: '1rem',
                                                            fontWeight: 700,
                                                            color: 'primary.main',
                                                            lineHeight: 1
                                                        }}
                                                    >
                                                        NF {nota.numero}
                                                    </Typography>

                                                    <Typography
                                                        sx={{
                                                            fontSize: '0.7rem',
                                                            color: 'text.secondary',
                                                            mt: 0.3
                                                        }}
                                                    >
                                                        Série {nota.serie}
                                                    </Typography>
                                                </Box>

                                                {aba !== 3 &&
                                                    (nota.status === "FORNECEDOR_DIRETO" ||
                                                        nota.status === "PENDENTE") && (
                                                        <Checkbox
                                                            size="small"
                                                            checked={notasSelecionadas.includes(nota.id)}
                                                            onChange={(e) => {
                                                                if (e.target.checked) {
                                                                    const notaAtual = nota;

                                                                    if (
                                                                        notaAtual.status === "PENDENTE" &&
                                                                        notasSelecionadas.length >= 1
                                                                    ) {
                                                                        setSnackbar({
                                                                            open: true,
                                                                            message: "Só é permitido uma nota por vez",
                                                                            severity: "warning"
                                                                        });
                                                                        return;
                                                                    }

                                                                    setNotasSelecionadas(prev => [
                                                                        ...prev,
                                                                        nota.id
                                                                    ]);
                                                                } else {
                                                                    setNotasSelecionadas(prev =>
                                                                        prev.filter(id => id !== nota.id)
                                                                    );
                                                                }
                                                            }}
                                                        />
                                                    )}
                                            </Box>

                                            {/* STATUS */}
                                            <Box
                                                sx={{
                                                    alignSelf: 'flex-start',
                                                    px: 1,
                                                    py: 0.3,
                                                    borderRadius: '999px',
                                                    bgcolor:
                                                        nota.status === "FORNECEDOR_DIRETO"
                                                            ? 'background.forndireto'
                                                            : nota.status === "PENDENTE"
                                                                ? 'primary.parcial'
                                                                : nota.status === "CONFERIDA"
                                                                    ? 'primary.conferidos'
                                                                    : 'primary.guardado',
                                                    color: 'primary.branco',
                                                    fontSize: '0.7rem',
                                                    fontWeight: 700
                                                }}
                                            >
                                                {nota.status}
                                            </Box>

                                            {/* FORNECEDOR */}
                                            <Box
                                                sx={{
                                                    bgcolor: 'background.inputBg',
                                                    borderRadius: '10px',
                                                    p: 0.8
                                                }}
                                            >
                                                <Typography
                                                    sx={{
                                                        fontSize: '0.58rem',
                                                        color: 'text.secondary',
                                                        textTransform: 'uppercase',
                                                        mb: 0.2
                                                    }}
                                                >
                                                    Fornecedor
                                                </Typography>

                                                <Typography
                                                    sx={{
                                                        fontSize: '0.78rem',
                                                        fontWeight: 600,
                                                        whiteSpace: 'nowrap',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        color: 'text.primary'
                                                    }}
                                                >
                                                    {nota.fornecedor}
                                                </Typography>
                                            </Box>

                                            {/* DATAS */}
                                            <Box
                                                sx={{
                                                    display: 'grid',
                                                    gridTemplateColumns: '1fr 1fr',
                                                    gap: 0.8
                                                }}
                                            >
                                                <Box
                                                    sx={{
                                                        bgcolor: 'background.inputBg',
                                                        borderRadius: '10px',
                                                        p: 0.8
                                                    }}
                                                >
                                                    <Typography
                                                        sx={{
                                                            fontSize: '0.55rem',
                                                            color: 'text.secondary',
                                                            textTransform: 'uppercase'
                                                        }}
                                                    >
                                                        Emissão
                                                    </Typography>

                                                    <Typography
                                                        sx={{
                                                            fontSize: '0.72rem',
                                                            fontWeight: 700
                                                        }}
                                                    >
                                                        {nota.data_emissao}
                                                    </Typography>
                                                </Box>

                                                <Box
                                                    sx={{
                                                        bgcolor: 'background.inputBg',
                                                        borderRadius: '10px',
                                                        p: 0.8
                                                    }}
                                                >
                                                    <Typography
                                                        sx={{
                                                            fontSize: '0.55rem',
                                                            color: 'text.secondary',
                                                            textTransform: 'uppercase'
                                                        }}
                                                    >
                                                        Importação
                                                    </Typography>

                                                    <Typography
                                                        sx={{
                                                            fontSize: '0.72rem',
                                                            fontWeight: 700
                                                        }}
                                                    >
                                                        {nota.data_recebimento}
                                                    </Typography>
                                                </Box>
                                            </Box>

                                            {/* LOCAL */}
                                            <Box
                                                sx={{
                                                    bgcolor: 'background.inputBg',
                                                    borderRadius: '10px',
                                                    p: 0.8
                                                }}
                                            >
                                                <Typography
                                                    sx={{
                                                        fontSize: '0.55rem',
                                                        color: 'text.secondary',
                                                        textTransform: 'uppercase',
                                                        mb: 0.2
                                                    }}
                                                >
                                                    Local
                                                </Typography>

                                                <Typography
                                                    sx={{
                                                        fontSize: '0.78rem',
                                                        fontWeight: 700,
                                                        whiteSpace: 'nowrap',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis'
                                                    }}
                                                >
                                                    {nota.pallets?.toUpperCase()}
                                                </Typography>
                                            </Box>

                                            {/* OBS */}
                                            {nota.observacao_palet?.trim() && (
                                                <Box
                                                    sx={{
                                                        bgcolor: 'primary.observacao',
                                                        borderRadius: '10px',
                                                        p: 0.8
                                                    }}
                                                >
                                                    <Typography
                                                        sx={{
                                                            fontSize: '0.68rem',
                                                            color: 'primary.branco'
                                                        }}
                                                    >
                                                        <strong>Obs:</strong> {nota.observacao_palet}
                                                    </Typography>
                                                </Box>
                                            )}

                                            {/* BOTÕES */}
                                            <Box
                                                sx={{
                                                    mt: 'auto',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: 0.8
                                                }}
                                            >
                                                <Button
                                                    fullWidth
                                                    variant="contained"
                                                    size="small"
                                                    sx={{
                                                        borderRadius: '10px',
                                                        py: 0.7,
                                                        fontWeight: 700,
                                                        fontSize: '0.72rem',
                                                        textTransform: 'none',
                                                        bgcolor: 'primary.main',
                                                        boxShadow: 'none',

                                                        '&:hover': {
                                                            bgcolor: 'primary.mainHover',
                                                            boxShadow: 'none'
                                                        }
                                                    }}
                                                    onClick={() => {
                                                        buscarItens(nota);
                                                    }}
                                                >
                                                    Ver itens
                                                </Button>

                                                {aba !== 3 && nota.status === "EM_TRANSITO" && (
                                                    <Button
                                                        fullWidth
                                                        variant="contained"
                                                        size="small"
                                                        disabled={loadingNotasIds.includes(nota.id)}
                                                        sx={{
                                                            borderRadius: '10px',
                                                            py: 0.7,
                                                            fontWeight: 700,
                                                            fontSize: '0.72rem',
                                                            textTransform: 'none',
                                                            bgcolor: 'primary.confirmar',
                                                            boxShadow: 'none',

                                                            '&:hover': {
                                                                bgcolor: 'primary.confirmarHover',
                                                                boxShadow: 'none'
                                                            }
                                                        }}
                                                        onClick={() => atualizarStatusNota(nota)}
                                                    >
                                                        {loadingNotasIds.includes(nota.id)
                                                            ? "Atualizando..."
                                                            : "Marcar como Pendente"}
                                                    </Button>
                                                )}
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    )}
                </Box>
                <Dialog open={openModal} onClose={() => setOpenModal(false)} fullWidth maxWidth="md"
                    slotProps={{
                        paper: {
                            sx: {
                                bgcolor: "background.card",
                                color: "text.primary",
                            }
                        }
                    }}>
                    <DialogTitle>
                        Itens da NF {notaSelecionada?.numero}
                    </DialogTitle>
                    <TextField
                        label="Buscar por item"
                        variant="outlined"
                        size="small"
                        sx={{
                            mb: 2, display: 'flex', margin: 'auto', width: '90%', bgcolor: 'inputBg',
                            '& .MuiOutlinedInput-root': {
                                '&:hover fieldset': {
                                    borderColor: 'primary.main',
                                },
                                '&.Mui-focused fieldset': {
                                    borderColor: 'primary.main',
                                }
                            }
                        }}
                        value={buscaItem}
                        onChange={(e) => setBuscaItem(e.target.value)}
                    />
                    <DialogContent sx={{ mt: 2 }} dividers>
                        {itensNota.length === 0 ? (
                            <Typography>Nenhum item encontrado</Typography>
                        ) : (
                            itensFiltrados.map((item, index) => {

                                return (

                                    <Card
                                        key={index}
                                        sx={{
                                            mt: 1,
                                            mb: 1,
                                            p: 1.5,
                                            borderRadius: '1vh',
                                            boxShadow: '0vh 0.1vh 0.5vh background.sombra',
                                            bgcolor: 'background.default',
                                            fontSize: '0.85rem'
                                        }}
                                    >
                                        {/* Linha 1 */}
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography><strong>{item.basico || item.cod_produto || "-"}</strong></Typography>
                                            <Typography sx={{
                                                color:
                                                    item.status_item === "PENDENTE" ? "primary.pendentes" :
                                                        item.status_item === "FORNECEDOR_DIRETO" ? "primary.pendentes" :
                                                            item.status_item === "ITEM_CONFERIDO" ? "primary.conferidos" :
                                                                item.status_item === "CONFERIDO_PARCIAL" ? "primary.parcial" :
                                                                    item.status_item === "ITEM_GUARDADO" ? "primary.guardado" :
                                                                        item.status_item === "ITEM_VENDIDO" ? "primary.vendido" :
                                                                            item.status_item === "ITEM_DEVOLVIDO" ? "primary.devolvido" :
                                                                                item.status_item === "GARANTIA" ? "primary.garantia" :
                                                                                    item.status_item === "EM_TRANSITO" ? "primary.observacao" :
                                                                                        "var(--em-transito)"
                                            }}>
                                                <strong>Status:</strong> {item.status_item || "SEM STATUS"}
                                            </Typography>
                                        </Box>

                                        {/* Linha 2 */}
                                        <Typography
                                            sx={{
                                                fontSize: '0.8rem',
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis'
                                            }}
                                        >
                                            {item.descricao || item.xProd}
                                        </Typography>

                                        {/* Linha 3 */}
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                                            <Typography>{item.loc_sistema || "-"}</Typography>
                                            <Typography>{item.qtd_conferida} / {Number(item.quantidade_comercial)}</Typography>
                                        </Box>

                                        {/* Linha 4 */}
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                                            <Typography sx={{ fontSize: '0.75rem' }}>
                                                {item.cean || item.codigo_barras || "-"}
                                            </Typography>
                                            <Typography sx={{ fontSize: '0.75rem' }}>
                                                {caixaInvalida(item.caixa)
                                                    ? "SEM CAIXA"
                                                    : `Caixa ${item.caixa}`
                                                }
                                            </Typography>
                                        </Box>
                                    </Card>
                                );
                            })
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button sx={{ color: "primary.branco", bgcolor: 'primary.cancelar', '&:hover': { bgcolor: 'primary.cancelarHover' } }} onClick={() => setOpenModal(false)}>Fechar</Button>
                    </DialogActions>
                </Dialog>

                {/* Snackbar */}
                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={3000}
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                >
                    <Alert variant="filled" severity={snackbar.severity}>
                        {snackbar.message}
                    </Alert>
                </Snackbar>

            </Container>
        )
    )
}

export default Dashboard;