
import { useCallback, useEffect, useMemo, useState } from "react";
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
    Fab,
    FormControl,
    Grid,
    IconButton,
    InputAdornment,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Snackbar,
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
    Add as AddIcon,
    Autorenew as RefreshIcon,
    Business as BusinessIcon,
    CalendarMonth as CalendarIcon,
    CheckCircle as CheckIcon,
    Close as CloseIcon,
    CloudUpload as UploadIcon,
    Delete as DeleteIcon,
    ErrorOutline as ErrorIcon,
    History as HistoryIcon,
    Lock as LockIcon,
    NotificationsActive as NotificationsIcon,
    Security as SecurityIcon,
    VerifiedUser as VerifiedIcon,
    Visibility as VisibilityIcon,
    WarningAmber as WarningIcon,
    ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";

import MenuUsuario from "../components/MenuUsuario";
import LoginFuncionario from "../components/LoginFuncionario";
import NotificacoesMenu from "../components/Notificacoes";

const API = "http://192.168.1.185:8077";

function obterToken() {
    return localStorage.getItem("nfe_token");
}

function formatarData(data) {
    if (!data) return "-";

    const valor = new Date(data);

    if (Number.isNaN(valor.getTime())) return "-";

    return valor.toLocaleDateString("pt-BR", {
        timeZone: "UTC",
    });
}

function formatarDataHora(data) {
    if (!data) return "-";

    const valor = new Date(data);

    if (Number.isNaN(valor.getTime())) return "-";

    return valor.toLocaleString("pt-BR");
}

function obterSituacao(certificado) {
    if (certificado.status === "ANTERIOR") {
        return {
            label: "Anterior",
            color: "default",
            icon: <HistoryIcon fontSize="small" />,
        };
    }

    const dias = Number(certificado.dias_restantes);

    if (dias < 0) {
        return {
            label: "Vencido",
            color: "error",
            icon: <ErrorIcon fontSize="small" />,
        };
    }

    if (dias <= 30) {
        return {
            label: "Próximo do vencimento",
            color: "warning",
            icon: <WarningIcon fontSize="small" />,
        };
    }

    return {
        label: "Válido",
        color: "success",
        icon: <CheckIcon fontSize="small" />,
    };
}

function formatarCnpj(valor) {
    if (!valor) return "-";

    const numeros = String(valor).replace(/\D/g, "");

    if (numeros.length !== 14) return valor;

    return numeros.replace(
        /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
        "$1.$2.$3/$4-$5"
    );
}

function Indicador({ titulo, valor, descricao, icon, cor }) {
    return (
        <Paper
            elevation={0}
            sx={{
                p: 2.5,
                height: "100%",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 3,
                bgcolor: 'background.default'
            }}
        >
            <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                    <Typography variant="body2" color="text.secondary">
                        {titulo}
                    </Typography>

                    <Typography
                        variant="h4"
                        fontWeight={800}
                        sx={{ mt: 1 }}
                    >
                        {valor}
                    </Typography>

                    <Typography variant="caption" color="text.secondary">
                        {descricao}
                    </Typography>
                </Box>

                <Avatar
                    sx={{
                        width: 48,
                        height: 48,
                        bgcolor: `background.default`,
                        color: `${cor}.main`,
                    }}
                >
                    {icon}
                </Avatar>
            </Stack>
        </Paper>
    );
}

export default function Certificados() {
    const navigate = useNavigate();

    const TOKEN_KEY = "nfe_token";
    const USER_KEY = "user_info";

    const [empresas, setEmpresas] = useState([]);
    const [certificados, setCertificados] = useState([]);
    const [historico, setHistorico] = useState([]);

    const [carregando, setCarregando] = useState(true);
    const [erroCarregamento, setErroCarregamento] = useState("");

    const [empresaFiltro, setEmpresaFiltro] = useState("");
    const [statusFiltro, setStatusFiltro] = useState("");

    const [dialogUpload, setDialogUpload] = useState(false);
    const [dialogHistorico, setDialogHistorico] = useState(false);
    const [dialogDetalhes, setDialogDetalhes] = useState(false);

    const [certificadoSelecionado, setCertificadoSelecionado] = useState(null);

    const [empresaUpload, setEmpresaUpload] = useState("");
    const [arquivo, setArquivo] = useState(null);
    const [senha, setSenha] = useState("");
    const [mostrarSenha, setMostrarSenha] = useState(false);

    const [enviando, setEnviando] = useState(false);
    const [processandoAlertas, setProcessandoAlertas] = useState(false);

    const [mensagem, setMensagem] = useState("");
    const [tipoMensagem, setTipoMensagem] = useState("success");

    const [historicoCarregando, setHistoricoCarregando] = useState(false);

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

    const headers = useMemo(() => ({
        "X-Auth-Token": token,
    }), [token]);

    const notificar = (texto, tipo = "success") => {
        setMensagem(texto);
        setTipoMensagem(tipo);
    };

    const requisicao = useCallback(async (rota, opcoes = {}) => {
        const resposta = await fetch(`${API}/api/certificados${rota}`, {
            ...opcoes,
            headers: {
                ...headers,
                ...(opcoes.headers || {}),
            },
        });

        const dados = await resposta.json().catch(() => ({}));

        if (!resposta.ok || dados.sucesso === false) {
            throw new Error(
                dados.erro || `Erro na requisição (${resposta.status}).`
            );
        }

        return dados;
    }, [headers]);

    const carregarDados = useCallback(async () => {
        setCarregando(true);
        setErroCarregamento("");

        try {
            const [resEmpresas, resCertificados] = await Promise.all([
                requisicao("/empresas"),
                requisicao("/"),
            ]);

            setEmpresas(resEmpresas.empresas || []);
            setCertificados(resCertificados.certificados || []);

        } catch (error) {
            setErroCarregamento(error.message);
        } finally {
            setCarregando(false);
        }
    }, [requisicao]);

    useEffect(() => {
        if (token) {
            carregarDados();
        } else {
            setCarregando(false);
        }
    }, [token, carregarDados]);

    const certificadosFiltrados = useMemo(() => {
        return certificados.filter((certificado) => {
            const correspondeEmpresa =
                !empresaFiltro ||
                String(certificado.empresa_id) === String(empresaFiltro);

            const correspondeStatus =
                !statusFiltro ||
                certificado.status === statusFiltro;

            return correspondeEmpresa && correspondeStatus;
        });
    }, [certificados, empresaFiltro, statusFiltro]);

    const indicadores = useMemo(() => {
        const atuais = certificados.filter(
            (certificado) => certificado.status === "ATUAL"
        );

        const vencidos = atuais.filter(
            (certificado) => Number(certificado.dias_restantes) < 0
        );

        const proximos = atuais.filter((certificado) => {
            const dias = Number(certificado.dias_restantes);
            return dias >= 0 && dias <= 30;
        });

        return {
            empresas: empresas.length,
            atuais: atuais.length,
            proximos: proximos.length,
            vencidos: vencidos.length,
        };
    }, [certificados, empresas]);

    const abrirUpload = () => {
        setEmpresaUpload("");
        setArquivo(null);
        setSenha("");
        setMostrarSenha(false);
        setDialogUpload(true);
    };

    const fecharUpload = () => {
        if (enviando) return;

        setDialogUpload(false);
        setArquivo(null);
        setSenha("");
    };

    const enviarCertificado = async () => {
        if (!empresaUpload || !arquivo || !senha) {
            notificar(
                "Selecione a empresa, o arquivo e informe a senha.",
                "warning"
            );
            return;
        }

        const extensao = arquivo.name.split(".").pop().toLowerCase();

        if (!["pfx", "p12"].includes(extensao)) {
            notificar("Selecione um arquivo PFX ou P12.", "error");
            return;
        }

        if (arquivo.size > 450 * 1024) {
            notificar("O arquivo excede o limite de 450 KB.", "error");
            return;
        }

        const formulario = new FormData();

        formulario.append("empresa_id", empresaUpload);
        formulario.append("senha", senha);
        formulario.append("arquivo", arquivo);

        setEnviando(true);

        try {
            const dados = await requisicao("/upload", {
                method: "POST",
                body: formulario,
            });

            notificar(
                dados.mensagem || "Certificado cadastrado com sucesso!"
            );

            setDialogUpload(false);
            setArquivo(null);
            setSenha("");

            await carregarDados();

        } catch (error) {
            notificar(error.message, "error");
        } finally {
            setEnviando(false);
            setSenha("");
        }
    };

    const abrirHistorico = async (certificado = null) => {
        setCertificadoSelecionado(certificado);
        setHistorico([]);
        setDialogHistorico(true);
        setHistoricoCarregando(true);

        try {
            const rota = certificado
                ? `/${certificado.id}/historico`
                : "/historico";

            const dados = await requisicao(rota);

            setHistorico(dados.historico || []);

        } catch (error) {
            notificar(error.message, "error");
        } finally {
            setHistoricoCarregando(false);
        }
    };

    const abrirDetalhes = (certificado) => {
        setCertificadoSelecionado(certificado);
        setDialogDetalhes(true);
    };

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
            {/* CABEÇALHO */}
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
                            SIGEL Certificados
                        </Typography>

                        <Typography
                            variant="caption"
                            sx={{
                                opacity: 0.75,
                            }}
                        >
                            Cadastro e gerenciamento de certificados
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
                            <ArrowBackIcon />
                        </IconButton>
                    </Tooltip>

                </Box>
            </Paper>

            <Box sx={{
                maxWidth: 1600,
                mx: "auto",
            }}>

                <Tooltip title="Novo certificado">
                    <Fab
                        color="primary"
                        aria-label="add"
                        onClick={abrirUpload}
                        sx={{ position: 'fixed', bottom: 16, right: 16 }}
                    >
                        <AddIcon />
                    </Fab>
                </Tooltip>

                {erroCarregamento && (
                    <Alert
                        severity="error"
                        sx={{ mb: 3 }}
                        action={
                            <Button
                                color="inherit"
                                size="small"
                                onClick={carregarDados}
                            >
                                Tentar novamente
                            </Button>
                        }
                    >
                        {erroCarregamento}
                    </Alert>
                )}

                {/* INDICADORES */}
                <Grid container spacing={2} sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={6} md={3}>
                        <Indicador
                            titulo="Empresas cadastradas"
                            valor={indicadores.empresas}
                            descricao="Empresas monitoradas"
                            icon={<BusinessIcon />}
                            cor="primary"
                        />
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <Indicador
                            titulo="Certificados atuais"
                            valor={indicadores.atuais}
                            descricao="Certificados em uso"
                            icon={<VerifiedIcon />}
                            cor="success"
                        />
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <Indicador
                            titulo="Próximos do vencimento"
                            valor={indicadores.proximos}
                            descricao="Vencimento em até 30 dias"
                            icon={<WarningIcon />}
                            cor="warning"
                        />
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <Indicador
                            titulo="Certificados vencidos"
                            valor={indicadores.vencidos}
                            descricao="Exigem renovação"
                            icon={<ErrorIcon />}
                            cor="error"
                        />
                    </Grid>
                </Grid>

                {/* LISTAGEM */}
                <Paper
                    elevation={0}
                    sx={{
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 3,
                        overflow: "hidden",
                        bgcolor: 'background.default'
                    }}
                >
                    <Box sx={{ p: 2.5 }}>
                        <Stack
                            direction={{ xs: "column", md: "row" }}
                            justifyContent="space-between"
                            alignItems={{ xs: "stretch", md: "center" }}
                            spacing={2}
                        >
                            <Box>
                                <Typography variant="h6" fontWeight={700}>
                                    Certificados cadastrados
                                </Typography>

                                <Typography variant="caption" color="text.secondary">
                                    {certificadosFiltrados.length} registro(s) encontrado(s)
                                </Typography>
                            </Box>

                            <Stack
                                direction={{ xs: "column", sm: "row" }}
                                spacing={1.5}
                            >
                                <FormControl size="small" sx={{ minWidth: 220 }}>
                                    <InputLabel>Empresa</InputLabel>

                                    <Select
                                        value={empresaFiltro}
                                        label="Empresa"
                                        onChange={(event) =>
                                            setEmpresaFiltro(event.target.value)
                                        }
                                        MenuProps={{
                                            PaperProps: {
                                                sx: {
                                                    bgcolor: "background.default",
                                                    color: "text.primary",
                                                    zoom: 0.9
                                                },
                                            },
                                        }}
                                    >
                                        <MenuItem value="">Todas as empresas</MenuItem>

                                        {empresas.map((empresa) => (
                                            <MenuItem
                                                key={empresa.id}
                                                value={String(empresa.id)}
                                            >
                                                {empresa.razao_social}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                <FormControl size="small" sx={{ minWidth: 170 }}>
                                    <InputLabel>Situação</InputLabel>

                                    <Select
                                        value={statusFiltro}
                                        label="Situação"
                                        onChange={(event) =>
                                            setStatusFiltro(event.target.value)
                                        }
                                        MenuProps={{
                                            PaperProps: {
                                                sx: {
                                                    bgcolor: "background.default",
                                                    color: "text.primary"
                                                },
                                            },
                                        }}
                                    >
                                        <MenuItem value="">Todas</MenuItem>
                                        <MenuItem value="ATUAL">Atuais</MenuItem>
                                        <MenuItem value="ANTERIOR">Anteriores</MenuItem>
                                    </Select>
                                </FormControl>
                            </Stack>
                        </Stack>
                    </Box>

                    <Divider />

                    {carregando ? (
                        <Box sx={{ py: 8, textAlign: "center" }}>
                            <CircularProgress />

                            <Typography
                                color="text.secondary"
                                variant="body2"
                                sx={{ mt: 2 }}
                            >
                                Carregando certificados...
                            </Typography>
                        </Box>
                    ) : certificadosFiltrados.length === 0 ? (
                        <Box sx={{ py: 8, textAlign: "center" }}>
                            <SecurityIcon
                                sx={{
                                    fontSize: 48,
                                    color: "text.disabled",
                                    mb: 1,
                                }}
                            />

                            <Typography fontWeight={700}>
                                Nenhum certificado encontrado
                            </Typography>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mt: 0.5 }}
                            >
                                Cadastre um certificado ou altere os filtros.
                            </Typography>

                            <Button
                                startIcon={<AddIcon />}
                                sx={{ mt: 2 }}
                                onClick={abrirUpload}
                            >
                                Cadastrar certificado
                            </Button>
                        </Box>
                    ) : (
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Empresa</TableCell>
                                        <TableCell>Titular</TableCell>
                                        <TableCell>Emissor</TableCell>
                                        <TableCell>Validade</TableCell>
                                        <TableCell>Situação</TableCell>
                                        <TableCell align="right">Ações</TableCell>
                                    </TableRow>
                                </TableHead>

                                <TableBody>
                                    {certificadosFiltrados.map((certificado) => {
                                        const situacao = obterSituacao(certificado);

                                        return (
                                            <TableRow
                                                key={certificado.id}
                                                hover
                                            >
                                                <TableCell>
                                                    <Typography fontWeight={700} variant="body2">
                                                        {certificado.razao_social}
                                                    </Typography>

                                                    <Typography
                                                        variant="caption"
                                                        color="text.secondary"
                                                    >
                                                        {certificado.cnpj_empresa}
                                                    </Typography>
                                                </TableCell>

                                                <TableCell>
                                                    <Typography variant="body2">
                                                        {certificado.titular}
                                                    </Typography>

                                                    <Typography
                                                        variant="caption"
                                                        color="text.secondary"
                                                    >
                                                        {certificado.tipo}
                                                    </Typography>
                                                </TableCell>

                                                <TableCell>
                                                    <Typography variant="body2">
                                                        {certificado.emissor || "-"}
                                                    </Typography>
                                                </TableCell>

                                                <TableCell>
                                                    <Typography variant="body2" fontWeight={600}>
                                                        {formatarData(certificado.valido_ate)}
                                                    </Typography>

                                                    <Typography
                                                        variant="caption"
                                                        color="text.secondary"
                                                    >
                                                        {certificado.status === "ANTERIOR"
                                                            ? "Registro anterior"
                                                            : Number(certificado.dias_restantes) < 0
                                                                ? `Vencido há ${Math.abs(Number(certificado.dias_restantes))} dia(s)`
                                                                : `${certificado.dias_restantes} dia(s) restantes`}
                                                    </Typography>
                                                </TableCell>

                                                <TableCell>
                                                    <Chip
                                                        size="small"
                                                        icon={situacao.icon}
                                                        label={situacao.label}
                                                        color={situacao.color}
                                                        variant="contained"
                                                        sx={{ p: 1, color: 'primary.branco' }}
                                                    />
                                                </TableCell>

                                                <TableCell align="right">
                                                    <Tooltip title="Detalhes">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => abrirDetalhes(certificado)}
                                                        >
                                                            <VisibilityIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>

                                                    <Tooltip title="Histórico">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => abrirHistorico(certificado)}
                                                        >
                                                            <HistoryIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </Paper>

                {/* EMPRESAS MONITORADAS */}
                <Box sx={{ mt: 4 }}>
                    <Stack
                        direction={{ xs: "column", sm: "row" }}
                        justifyContent="space-between"
                        alignItems={{ xs: "flex-start", sm: "center" }}
                        spacing={1}
                        sx={{ mb: 2 }}
                    >
                        <Box>
                            <Typography variant="h6" fontWeight={800}>
                                Empresas monitoradas
                            </Typography>

                            <Typography variant="body2" color="text.secondary">
                                Acompanhamento individual dos certificados digitais
                            </Typography>
                        </Box>

                        <Chip
                            icon={<BusinessIcon />}
                            label={`${empresas.length} empresas cadastradas`}
                            variant="contained"
                            size="small"
                            sx={{ p: 1 }}
                        />
                    </Stack>

                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: {
                                xs: "1fr",
                                sm: "repeat(2, minmax(0, 1fr))",
                                md: "repeat(3, minmax(0, 1fr))",
                            },
                            gap: 2,
                            alignItems: "stretch",
                        }}
                    >
                        {empresas.map((empresa) => {
                            const possuiCertificado = Boolean(
                                empresa.certificado_atual_id
                            );

                            const diasRestantes = empresa.valido_ate
                                ? Math.ceil(
                                    (
                                        new Date(empresa.valido_ate).getTime() -
                                        new Date().setHours(0, 0, 0, 0)
                                    ) / (1000 * 60 * 60 * 24)
                                )
                                : null;

                            const certificadoVencido =
                                possuiCertificado && diasRestantes < 0;

                            const certificadoProximo =
                                possuiCertificado &&
                                diasRestantes >= 0 &&
                                diasRestantes <= 30;

                            const corSituacao = !possuiCertificado
                                ? "warning"
                                : certificadoVencido
                                    ? "error"
                                    : certificadoProximo
                                        ? "warning"
                                        : "success";

                            const textoSituacao = !possuiCertificado
                                ? "Sem certificado"
                                : certificadoVencido
                                    ? "Certificado vencido"
                                    : certificadoProximo
                                        ? "Próximo do vencimento"
                                        : "Certificado válido";

                            const iconeSituacao = !possuiCertificado
                                ? <WarningIcon fontSize="small" />
                                : certificadoVencido || certificadoProximo
                                    ? <WarningIcon fontSize="small" />
                                    : <VerifiedIcon fontSize="small" />;

                            return (
                                <Box key={empresa.id} sx={{ minWidth: 0, display: "flex" }}>
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            width: "100%",
                                            height: "100%",
                                            boxSizing: "border-box",
                                            p: 2,
                                            border: "1px solid",
                                            borderColor: "divider",
                                            borderRadius: 2,
                                            bgcolor: "background.default",
                                            transition: "all 0.2s ease",
                                            "&:hover": {
                                                borderColor: "primary.main",
                                                boxShadow: 2,
                                            },
                                        }}
                                    >
                                        {/* IDENTIFICAÇÃO */}
                                        <Stack
                                            direction="row"
                                            alignItems="center"
                                            spacing={1.5}
                                        >
                                            <Avatar
                                                variant="rounded"
                                                sx={{
                                                    bgcolor: "action.hover",
                                                    color: "text.secondary",
                                                    borderRadius: 2,
                                                }}
                                            >
                                                <BusinessIcon />
                                            </Avatar>

                                            <Box sx={{ minWidth: 0, flex: 1 }}>
                                                <Typography
                                                    variant="subtitle2"
                                                    fontWeight={800}
                                                    sx={{ lineHeight: 1.4 }}
                                                >
                                                    {empresa.razao_social}
                                                </Typography>

                                                <Typography
                                                    variant="caption"
                                                    color="text.secondary"
                                                >
                                                    CNPJ: {formatarCnpj(empresa.cnpj)}
                                                </Typography>
                                            </Box>
                                        </Stack>

                                        <Divider sx={{ my: 2 }} />

                                        {/* SITUAÇÃO */}
                                        <Stack spacing={1}>
                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                                fontWeight={600}
                                            >
                                                SITUAÇÃO DO CERTIFICADO
                                            </Typography>

                                            <Chip
                                                size="small"
                                                color={corSituacao}
                                                icon={iconeSituacao}
                                                label={textoSituacao}
                                                variant="contained"
                                                sx={{ p: 1, color: "primary.branco" }}
                                            />

                                            {possuiCertificado ? (
                                                <>
                                                    <Stack
                                                        direction="row"
                                                        justifyContent="space-between"
                                                        alignItems="center"
                                                    >
                                                        <Stack
                                                            direction="row"
                                                            spacing={0.8}
                                                            alignItems="center"
                                                        >
                                                            <CalendarIcon
                                                                sx={{
                                                                    fontSize: 17,
                                                                    color: "text.secondary",
                                                                }}
                                                            />

                                                            <Typography
                                                                variant="body2"
                                                                color="text.secondary"
                                                            >
                                                                Válido até
                                                            </Typography>
                                                        </Stack>

                                                        <Typography
                                                            variant="body2"
                                                            fontWeight={800}
                                                            color={
                                                                certificadoVencido
                                                                    ? "error.main"
                                                                    : certificadoProximo
                                                                        ? "warning.main"
                                                                        : "success.main"
                                                            }
                                                        >
                                                            {formatarData(empresa.valido_ate)}
                                                        </Typography>
                                                    </Stack>

                                                    <Typography
                                                        variant="caption"
                                                        color="text.secondary"
                                                        textAlign="right"
                                                    >
                                                        {certificadoVencido
                                                            ? `Vencido há ${Math.abs(diasRestantes)} dia(s)`
                                                            : diasRestantes === 0
                                                                ? "Vence hoje"
                                                                : `${diasRestantes} dia(s) restantes`}
                                                    </Typography>
                                                </>
                                            ) : (
                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                >
                                                    Nenhum certificado atual cadastrado para esta empresa.
                                                </Typography>
                                            )}
                                        </Stack>
                                    </Paper>
                                </Box>
                            );
                        })}
                    </Box>
                </Box>
            </Box>

            {/* DIALOG DE UPLOAD */}
            <Dialog
                open={dialogUpload}
                onClose={fecharUpload}
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
                        <UploadIcon color="primary" />
                        <Typography variant="h6" fontWeight={700}>
                            Novo certificado
                        </Typography>
                    </Stack>
                </DialogTitle>

                <DialogContent dividers>
                    <Alert severity="info" sx={{ mb: 3 }}>
                        O certificado será validado antes do cadastro. O arquivo e a senha
                        não serão armazenados pelo SIGEL.
                    </Alert>

                    <Stack spacing={2.5}>
                        <FormControl fullWidth required>
                            <InputLabel>Empresa</InputLabel>

                            <Select
                                value={empresaUpload}
                                label="Empresa"
                                onChange={(event) => setEmpresaUpload(event.target.value)}
                                MenuProps={{
                                    PaperProps: {
                                        sx: {
                                            bgcolor: "background.default",
                                            color: "text.primary"
                                        },
                                    },
                                }}
                            >
                                {empresas.map((empresa) => (
                                    <MenuItem
                                        key={empresa.id}
                                        value={String(empresa.id)}
                                    >
                                        {empresa.razao_social}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <Box>
                            <Typography
                                variant="body2"
                                fontWeight={600}
                                sx={{ mb: 1 }}
                            >
                                Arquivo do certificado
                            </Typography>

                            <Button
                                component="label"
                                variant="outlined"
                                fullWidth
                                startIcon={<UploadIcon />}
                                sx={{
                                    py: 2,
                                    borderStyle: "dashed",
                                    textTransform: "none",
                                }}
                            >
                                {arquivo ? arquivo.name : "Selecionar arquivo PFX ou P12"}

                                <input
                                    type="file"
                                    hidden
                                    accept=".pfx,.p12"
                                    onChange={(event) => {
                                        setArquivo(event.target.files?.[0] || null);
                                    }}
                                />
                            </Button>

                            <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ display: "block", mt: 1 }}
                            >
                                Tamanho máximo: 450 KB.
                            </Typography>

                            {arquivo && (
                                <Stack
                                    direction="row"
                                    alignItems="center"
                                    justifyContent="space-between"
                                    sx={{ mt: 1 }}
                                >
                                    <Typography variant="caption">
                                        {(arquivo.size / 1024).toFixed(1)} KB
                                    </Typography>

                                    <IconButton
                                        size="small"
                                        color="error"
                                        onClick={() => setArquivo(null)}
                                    >
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </Stack>
                            )}
                        </Box>

                        <TextField
                            fullWidth
                            required
                            label="Senha do certificado"
                            type={mostrarSenha ? "text" : "password"}
                            value={senha}
                            onChange={(event) => setSenha(event.target.value)}
                            autoComplete="new-password"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <LockIcon fontSize="small" />
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() => setMostrarSenha(!mostrarSenha)}
                                            edge="end"
                                        >
                                            <VisibilityIcon fontSize="small" />
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Stack>
                </DialogContent>

                <DialogActions sx={{ p: 2 }}>
                    <Button
                        onClick={fecharUpload}
                        disabled={enviando}
                        color="error"
                    >
                        Cancelar
                    </Button>

                    <Button
                        variant="contained"
                        startIcon={
                            enviando
                                ? <CircularProgress size={16} color="inherit" />
                                : <UploadIcon />
                        }
                        onClick={enviarCertificado}
                        disabled={enviando}
                    >
                        {enviando ? "Validando..." : "Validar e cadastrar"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* DIALOG DE DETALHES */}
            <Dialog
                open={dialogDetalhes}
                onClose={() => setDialogDetalhes(false)}
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
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6" fontWeight={700}>
                            Detalhes do certificado
                        </Typography>

                        <IconButton onClick={() => setDialogDetalhes(false)}>
                            <CloseIcon />
                        </IconButton>
                    </Stack>
                </DialogTitle>

                <DialogContent dividers>
                    {certificadoSelecionado && (
                        <Stack spacing={2}>
                            <Alert
                                severity={obterSituacao(certificadoSelecionado).color}
                            >
                                {obterSituacao(certificadoSelecionado).label}
                            </Alert>

                            {[
                                ["Empresa", certificadoSelecionado.razao_social],
                                ["CNPJ da empresa", certificadoSelecionado.cnpj_empresa],
                                ["Titular", certificadoSelecionado.titular],
                                ["CNPJ do certificado", certificadoSelecionado.cnpj_certificado],
                                ["Emissor", certificadoSelecionado.emissor],
                                ["Tipo", certificadoSelecionado.tipo],
                                ["Número de série", certificadoSelecionado.numero_serie],
                                ["Fingerprint SHA-256", certificadoSelecionado.fingerprint_sha256],
                                ["Início da validade", formatarData(certificadoSelecionado.valido_de)],
                                ["Fim da validade", formatarData(certificadoSelecionado.valido_ate)],
                                ["Cadastrado por", certificadoSelecionado.cadastrado_por_nome],
                                ["Data do cadastro", formatarDataHora(certificadoSelecionado.criado_em)],
                            ].map(([titulo, valor]) => (
                                <Box key={titulo}>
                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                    >
                                        {titulo}
                                    </Typography>

                                    <Typography
                                        variant="body2"
                                        sx={{
                                            fontWeight: 600,
                                            overflowWrap: "anywhere",
                                        }}
                                    >
                                        {valor || "-"}
                                    </Typography>
                                </Box>
                            ))}
                        </Stack>
                    )}
                </DialogContent>

                <DialogActions>
                    <Button
                        startIcon={<HistoryIcon />}
                        onClick={() => {
                            setDialogDetalhes(false);
                            abrirHistorico(certificadoSelecionado);
                        }}
                        variant="contained"
                        fullWidth
                    >
                        Consultar histórico
                    </Button>
                </DialogActions>
            </Dialog>

            {/* DIALOG DE HISTÓRICO */}
            <Dialog
                open={dialogHistorico}
                onClose={() => setDialogHistorico(false)}
                fullWidth
                maxWidth="md"
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
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Box>
                            <Typography variant="h6" fontWeight={700}>
                                Histórico de operações
                            </Typography>

                            <Typography variant="caption" color="text.secondary">
                                {certificadoSelecionado
                                    ? `Certificado #${certificadoSelecionado.id}`
                                    : "Todas as operações registradas"}
                            </Typography>
                        </Box>

                        <IconButton onClick={() => setDialogHistorico(false)}>
                            <CloseIcon />
                        </IconButton>
                    </Stack>
                </DialogTitle>

                <DialogContent dividers>
                    {historicoCarregando ? (
                        <Box sx={{ py: 5, textAlign: "center" }}>
                            <CircularProgress />
                        </Box>
                    ) : historico.length === 0 ? (
                        <Alert severity="info">
                            Nenhuma operação registrada.
                        </Alert>
                    ) : (
                        <Stack spacing={2}>
                            {historico.map((item) => (
                                <Paper
                                    key={item.id}
                                    variant="outlined"
                                    sx={{ p: 2, borderRadius: 2, bgcolor: 'background.default' }}
                                >
                                    <Stack
                                        direction={{ xs: "column", sm: "row" }}
                                        justifyContent="space-between"
                                        spacing={1}
                                    >
                                        <Box>
                                            <Typography fontWeight={700}>
                                                {item.acao}
                                            </Typography>

                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                            >
                                                {item.razao_social || "Empresa não identificada"}
                                            </Typography>
                                        </Box>

                                        <Chip
                                            size="small"
                                            label={item.resultado}
                                            color={
                                                item.resultado === "SUCESSO"
                                                    ? "success"
                                                    : item.resultado === "ERRO"
                                                        ? "error"
                                                        : "default"
                                            }
                                            sx={{ color: 'primary.branco' }}
                                        />
                                    </Stack>

                                    <Divider sx={{ my: 1.5 }} />

                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                    >
                                        Funcionário: {item.funcionario_nome || "Sistema"}
                                    </Typography>

                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                        display="block"
                                    >
                                        Data: {formatarDataHora(item.criado_em)}
                                    </Typography>

                                    {item.detalhes && (
                                        <Box
                                            sx={{
                                                mt: 1.5,
                                                p: 1.5,
                                                bgcolor: "action.hover",
                                                borderRadius: 1.5,
                                            }}
                                        >
                                            {Object.entries(item.detalhes).map(([chave, valor]) => (
                                                <Typography
                                                    key={chave}
                                                    variant="caption"
                                                    display="block"
                                                    sx={{ overflowWrap: "anywhere" }}
                                                >
                                                    <strong>{chave.replaceAll("_", " ")}:</strong>{" "}
                                                    {typeof valor === "object"
                                                        ? JSON.stringify(valor)
                                                        : String(valor)}
                                                </Typography>
                                            ))}
                                        </Box>
                                    )}
                                </Paper>
                            ))}
                        </Stack>
                    )}
                </DialogContent>
            </Dialog>

            <Snackbar
                open={Boolean(mensagem)}
                autoHideDuration={5000}
                onClose={() => setMensagem("")}
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "left",
                }}
            >
                <Alert
                    severity={tipoMensagem}
                    variant="filled"
                    onClose={() => setMensagem("")}
                    sx={{ width: "100%", color: "primary.branco" }}
                >
                    {mensagem}
                </Alert>
            </Snackbar>
        </Box >
    );
}
