
import { useState, useContext, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

import {
    Container,
    Typography,
    Card,
    CardContent,
    TextField,
    Backdrop,
    Button,
    Box,
    CircularProgress,
    Tabs,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Tooltip,
    Chip,
    Grid,
    Paper,
    Divider,
    Alert,
    Snackbar,
    Stack
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import RefreshIcon from "@mui/icons-material/Refresh";
import ClearIcon from "@mui/icons-material/Clear";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import SyncIcon from "@mui/icons-material/Sync";

// Componentes
import MenuUsuario from "../components/MenuUsuario";
import LoginFuncionario from "../components/LoginFuncionario";
import NotificacoesMenu from "../components/Notificacoes";

import "../style/App.css";

function NotasGravadas() {

    const navigate = useNavigate();

    const API = "http://192.168.1.185:8077";
    const API_CONSULTA = "http://192.168.1.185:7079";

    // Refs
    const buscaRef = useRef(null);

    // Estado das notas pendentes
    const [notas, setNotas] = useState([]);

    // Busca individual
    const [busca, setBusca] = useState("");

    // Loading geral
    const [loading, setLoading] = useState(false);

    // Loading da conciliação
    const [conciliando, setConciliando] = useState(false);

    // Resultado da conciliação
    const [resultado, setResultado] = useState(null);

    // Status selecionado nas tabs
    const [statusSelecionado, setStatusSelecionado] = useState("EM_TRANSITO");

    // Feedback visual
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success"
    });

    // LOGIN
    const [userInfo, setUserInfo] = useState(() => {

        const user =
            localStorage.getItem("user_info");

        return user
            ? JSON.parse(user)
            : null;
    });

    const [token, setToken] = useState(
        () => localStorage.getItem("nfe_token") || ""
    );

    const logout = () => {

        setToken("");
        setUserInfo(null);

        localStorage.removeItem("nfe_token");
        localStorage.removeItem("user_info");
    };

    const mostrarFeedback = (message, severity = "success") => {

        setSnackbar({
            open: true,
            message,
            severity
        });
    };

    const fecharSnackbar = () => {

        setSnackbar((prev) => ({
            ...prev,
            open: false
        }));
    };

    // BUSCA INDIVIDUAL NO ssplus

    const limparBusca = () => {

        setBusca("");
        setNotas([]);

        setTimeout(() => {
            buscaRef.current?.focus();
        }, 100);
    };

    const buscaNota = async () => {

        const chave = busca.trim();

        if (!chave) {

            mostrarFeedback(
                "Informe uma chave de acesso.",
                "warning"
            );

            return;
        }

        try {

            setLoading(true);

            const response = await fetch(
                `${API_CONSULTA}/api/consulta_nfe?nfe_chave=${encodeURIComponent(chave)}`,
                {
                    headers: {
                        "X-Auth-Token": token
                    }
                }
            );

            if (!response.ok) {

                throw new Error(
                    `Erro HTTP ${response.status}`
                );
            }

            const data = await response.json();

            console.log("Retorno API ssplus:", data);

            setNotas(
                removerNotasDuplicadas(
                    Array.isArray(data) ? data : []
                )
            );

            if (!Array.isArray(data) || data.length === 0) {

                mostrarFeedback(
                    "Esta nota não foi gravada no SSPLUS.",
                    "warning"
                );

            } else {

                mostrarFeedback(
                    "Nota encontrada no ssplus.",
                    "success"
                );
            }

        } catch (error) {

            console.error(
                "Erro ao consultar nota:",
                error
            );

            mostrarFeedback(
                "Erro ao consultar nota no ssplus.",
                "error"
            );

        } finally {

            setLoading(false);
        }
    };

    // CONCILIAÇÃO COMPLETA COM O SSPLUS
    const conciliarssplus = async () => {

        try {

            setConciliando(true);

            setResultado(null);

            const response = await fetch(
                `${API}/api/notas/conciliar-ssplus`,
                {
                    method: "POST",

                    headers: {
                        "X-Auth-Token": token,
                        "Content-Type": "application/json"
                    }
                }
            );

            const data = await response.json();

            console.log(
                "Resultado conciliação ssplus:",
                data
            );

            if (!response.ok || !data.sucesso) {

                throw new Error(
                    data.erro ||
                    "Erro ao realizar conciliação."
                );
            }

            setResultado(data);

            // Exibir notas pendentes sem duplicidade pela chave de acesso
            setNotas(
                removerNotasDuplicadas(data.pendentes || [])
            );

            mostrarFeedback(
                data.mensagem ||
                "Conciliação realizada com sucesso.",
                "success"
            );

        } catch (error) {

            console.error(
                "Erro na conciliação:",
                error
            );

            mostrarFeedback(
                error.message ||
                "Erro ao realizar conciliação com ssplus.",
                "error"
            );

        } finally {

            setConciliando(false);
        }
    };

    // Remove notas duplicadas usando a chave de acesso
    const removerNotasDuplicadas = (lista = []) => {
        const chavesExistentes = new Set();

        return lista.filter((nota) => {
            const chave = String(nota.chave_acesso || "").trim();

            // Se não houver chave, mantém a nota
            if (!chave) {
                return true;
            }

            // Se a chave já apareceu, remove a duplicata
            if (chavesExistentes.has(chave)) {
                return false;
            }

            chavesExistentes.add(chave);
            return true;
        });
    };


    // Filtra as notas pelo status e remove duplicadas pela chave de acesso
    const notasPorStatus = (status) => {
        const notasUnicas = removerNotasDuplicadas(notas);

        return notasUnicas.filter(
            (nota) => nota.status === status
        );
    };


    // Quantidade de notas únicas por status
    const quantidadePorStatus = (status) => {
        return notasPorStatus(status).length;
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

        <Container
            maxWidth="100%"
            sx={{
                mt: 4,
                pb: 4,
                bgcolor: "background.default"
            }}
        >

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
                    mb: 4,
                    borderRadius: '2vh',
                    zoom: '0.9'
                }}
            >

                <Box>

                    <Typography
                        variant="h4"
                        sx={{
                            fontFamily: 'Consolas',
                            color: "background.paper",
                            fontWeight: "bold"
                        }}
                    >
                        Notas Gravadas
                    </Typography>

                    <Typography
                        sx={{
                            color: "rgba(255,255,255,0.7)"
                        }}
                    >
                        Identifique notas gravadas no SSPLUS
                    </Typography>

                </Box>

                <Box>

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

                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "row",
                            justifyContent: "right",
                            mr: "2vh"
                        }}
                    >

                        <Tooltip title="Retornar ao dashboard">

                            <Button
                                onClick={() =>
                                    navigate("/")
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

                                Voltar

                                <ArrowBackIcon />

                            </Button>

                        </Tooltip>

                    </Box>

                </Box>

            </Box>

            <Card
                variant="outlined"
                sx={{
                    mb: 3,
                    borderRadius: 3,
                    bgcolor: 'background.alerta'
                }}
            >

                <CardContent>

                    <Stack
                        direction={{
                            xs: "column",
                            sm: "row"
                        }}
                        spacing={2}
                        alignItems={{
                            xs: "stretch",
                            sm: "center"
                        }}
                    >

                        <Button
                            variant="contained"
                            color="primary"
                            size="large"
                            startIcon={
                                conciliando
                                    ? <CircularProgress
                                        size={20}
                                        color="inherit"
                                    />
                                    : <SyncIcon />
                            }
                            onClick={conciliarssplus}
                            disabled={conciliando}
                            sx={{
                                minHeight: 48
                            }}
                        >

                            {conciliando
                                ? "Consultando ssplus..."
                                : "Consultar ssplus"
                            }

                        </Button>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                        >

                            Busca todas as notas e verifica
                            se já foi dado entrada no SSPLUS.

                        </Typography>

                    </Stack>

                </CardContent>

            </Card>

            {/* RESUMO DA CONCILIAÇÃO */}

            {resultado && (

                <Box sx={{ mb: 4, zoom: 0.8 }}>

                    <Grid
                        container
                        spacing={2}
                    >

                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>

                            <Card
                                variant="outlined"
                                sx={{
                                    borderRadius: 3,
                                    height: "100%",
                                    bgcolor: 'background.alerta'
                                }}
                            >

                                <CardContent>

                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        Consultadas
                                    </Typography>

                                    <Typography
                                        variant="h4"
                                        fontWeight="bold"
                                    >
                                        {resultado.total_consultadas ?? 0}
                                    </Typography>

                                </CardContent>

                            </Card>

                        </Grid>

                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>

                            <Card
                                variant="outlined"
                                sx={{
                                    borderRadius: 3,
                                    height: "100%",
                                    bgcolor: 'background.alerta'
                                }}
                            >

                                <CardContent>

                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        Atualizadas
                                    </Typography>

                                    <Typography
                                        variant="h4"
                                        fontWeight="bold"
                                        color="success.main"
                                    >
                                        {resultado.total_atualizadas ?? 0}
                                    </Typography>

                                </CardContent>

                            </Card>

                        </Grid>

                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>

                            <Card
                                variant="outlined"
                                sx={{
                                    borderRadius: 3,
                                    height: "100%",
                                    bgcolor: 'background.alerta'
                                }}
                            >

                                <CardContent>

                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        Pendentes
                                    </Typography>

                                    <Typography
                                        variant="h4"
                                        fontWeight="bold"
                                        color="warning.main"
                                    >
                                        {resultado.total_pendentes ?? 0}
                                    </Typography>

                                </CardContent>

                            </Card>

                        </Grid>

                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>

                            <Card
                                variant="outlined"
                                sx={{
                                    borderRadius: 3,
                                    height: "100%",
                                    bgcolor: 'background.alerta'
                                }}
                            >

                                <CardContent>

                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        Erros
                                    </Typography>

                                    <Typography
                                        variant="h4"
                                        fontWeight="bold"
                                        color="error.main"
                                    >
                                        {resultado.total_erros ?? 0}
                                    </Typography>

                                </CardContent>

                            </Card>

                        </Grid>

                    </Grid>

                </Box>

            )}

            {/* BUSCA INDIVIDUAL */}

            <Card
                variant="outlined"
                sx={{
                    mb: 3,
                    borderRadius: 3,
                    bgcolor: 'background.alerta'
                }}
            >

                <CardContent>

                    <Typography
                        variant="h6"
                        fontWeight="bold"
                        gutterBottom
                    >
                        Consulta individual no SSPLUS
                    </Typography>

                    <Stack
                        direction={{
                            xs: "column",
                            sm: "row"
                        }}
                        spacing={1}
                    >

                        <TextField
                            inputRef={buscaRef}
                            label="Chave de acesso"
                            variant="outlined"
                            size="small"
                            fullWidth
                            value={busca}
                            onChange={(e) =>
                                setBusca(e.target.value)
                            }
                            onKeyDown={(e) => {

                                if (e.key === "Enter") {
                                    buscaNota();
                                }

                            }}
                            autoComplete="off"
                            inputProps={{
                                spellCheck: false,
                                autoCorrect: "off",
                                autoCapitalize: "off",
                            }}
                        />

                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<SearchIcon />}
                            onClick={buscaNota}
                            sx={{
                                minWidth: {
                                    xs: "100%",
                                    sm: "130px"
                                }
                            }}
                        >
                            Buscar
                        </Button>

                        <Button
                            variant="outlined"
                            color="primary"
                            startIcon={<ClearIcon />}
                            onClick={limparBusca}
                            sx={{
                                minWidth: {
                                    xs: "100%",
                                    sm: "110px"
                                }
                            }}
                        >
                            Limpar
                        </Button>

                    </Stack>

                </CardContent>

            </Card>

            {/* RESULTADO DA BUSCA INDIVIDUAL */}

            {busca.trim() && notas.length > 0 && !resultado && (

                <Box sx={{ mb: 3 }}>

                    <Typography
                        variant="h6"
                        fontWeight="bold"
                        gutterBottom
                    >
                        Resultado da consulta individual
                    </Typography>

                    <Grid
                        container
                        spacing={2}
                    >

                        {notas.map((nota, index) => (

                            <Grid
                                size={{ xs: 12, md: 4 }}
                                key={`${nota.nfe_chave || nota.nronff}-${index}`}
                            >

                                <Card
                                    variant="outlined"
                                    sx={{
                                        borderRadius: 3,
                                        height: "100%",
                                        bgcolor: 'background.alerta'
                                    }}
                                >

                                    <CardContent>

                                        <Typography
                                            fontWeight="bold"
                                            color="primary.main"
                                        >
                                            NF {nota.nronff}
                                        </Typography>

                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                        >
                                            Série: {nota.serie?.trim?.() || nota.serie}
                                        </Typography>

                                        <Typography
                                            sx={{
                                                mt: 1
                                            }}
                                        >
                                            {nota.descri}
                                        </Typography>

                                        <Chip
                                            icon={<CheckCircleIcon />}
                                            label="NOTA GRAVADA"
                                            color="success"
                                            size="small"
                                            sx={{
                                                mt: 2,
                                                color: 'primary.branco'
                                            }}
                                        />

                                    </CardContent>

                                </Card>

                            </Grid>

                        ))}

                    </Grid>

                </Box>

            )}


            {/* NOTAS PENDENTES */}

            <Box sx={{ mt: 4 }}>

                <Stack
                    direction={{
                        xs: "column",
                        sm: "row"
                    }}
                    spacing={1}
                    justifyContent="space-between"
                    alignItems={{
                        xs: "stretch",
                        sm: "center"
                    }}
                    sx={{ mb: 2 }}
                >

                    <Box>

                        <Typography
                            variant="h6"
                            fontWeight="bold"
                        >
                            Notas não gravadas
                        </Typography>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                        >
                            Consulte as notas separadas por status.
                        </Typography>

                    </Box>

                </Stack>

                {resultado && resultado.total_pendentes === 0 ? (

                    <Alert
                        severity="success"
                        icon={<CheckCircleIcon />}
                    >
                        Todas as notas consultadas foram identificadas
                        como gravadas no SSPLUS.
                    </Alert>

                ) : resultado ? (

                    <Box>

                        {/* TABS DE STATUS */}

                        <Paper
                            variant="outlined"
                            sx={{
                                borderRadius: 1,
                                mb: 2,
                                bgcolor: "background.alerta"
                            }}
                        >

                            <Tabs
                                value={statusSelecionado}
                                onChange={(event, novoStatus) => {
                                    setStatusSelecionado(novoStatus);
                                }}
                                variant="scrollable"
                                scrollButtons="auto"
                                allowScrollButtonsMobile
                            >

                                <Tab
                                    value="EM_TRANSITO"
                                    label={
                                        <Stack
                                            direction="row"
                                            spacing={1}
                                            alignItems="center"
                                        >

                                            <span>
                                                EM TRÂNSITO
                                            </span>

                                            <Chip
                                                label={
                                                    quantidadePorStatus(
                                                        "EM_TRANSITO"
                                                    )
                                                }
                                                size="small"
                                                color={
                                                    statusSelecionado ===
                                                        "EM_TRANSITO"
                                                        ? "primary"
                                                        : "default"
                                                }
                                            />

                                        </Stack>
                                    }
                                />

                                <Tab
                                    value="PENDENTE"
                                    label={
                                        <Stack
                                            direction="row"
                                            spacing={1}
                                            alignItems="center"
                                        >

                                            <span>
                                                PENDENTE
                                            </span>

                                            <Chip
                                                label={
                                                    quantidadePorStatus(
                                                        "PENDENTE"
                                                    )
                                                }
                                                size="small"
                                                color={
                                                    statusSelecionado ===
                                                        "PENDENTE"
                                                        ? "primary"
                                                        : "default"
                                                }
                                            />

                                        </Stack>
                                    }
                                />

                                <Tab
                                    value="CONFERIDA"
                                    label={
                                        <Stack
                                            direction="row"
                                            spacing={1}
                                            alignItems="center"
                                        >

                                            <span>
                                                CONFERIDA
                                            </span>

                                            <Chip
                                                label={
                                                    quantidadePorStatus(
                                                        "CONFERIDA"
                                                    )
                                                }
                                                size="small"
                                                color={
                                                    statusSelecionado ===
                                                        "CONFERIDA"
                                                        ? "primary"
                                                        : "default"
                                                }
                                            />

                                        </Stack>
                                    }
                                />

                            </Tabs>

                        </Paper>

                        {/* TABELA FILTRADA */}

                        {notasPorStatus(statusSelecionado).length === 0 ? (

                            <Alert
                                severity="success"
                                icon={<CheckCircleIcon />}
                            >
                                Nenhuma nota encontrada com o status{" "}
                                {statusSelecionado}.
                            </Alert>

                        ) : (

                            <Paper
                                variant="outlined"
                                sx={{
                                    borderRadius: 3,
                                    overflow: "hidden",
                                    bgcolor: "background.alerta"
                                }}
                            >

                                <Box
                                    sx={{
                                        overflowX: "auto"
                                    }}
                                >

                                    <Table
                                        size="small"
                                        sx={{
                                            minWidth: 900
                                        }}
                                    >

                                        <TableHead>

                                            <TableRow>

                                                <TableCell>
                                                    ID
                                                </TableCell>

                                                <TableCell>
                                                    Número
                                                </TableCell>

                                                <TableCell>
                                                    Série
                                                </TableCell>

                                                <TableCell>
                                                    Fornecedor
                                                </TableCell>

                                                <TableCell>
                                                    Chave de acesso
                                                </TableCell>

                                                <TableCell>
                                                    Etiqueta
                                                </TableCell>

                                                <TableCell>
                                                    Status
                                                </TableCell>

                                            </TableRow>

                                        </TableHead>

                                        <TableBody>

                                            {notasPorStatus(
                                                statusSelecionado
                                            ).map((nota, index) => (

                                                <TableRow
                                                    key={`${nota.id}-${index}`}
                                                    hover
                                                >

                                                    <TableCell>
                                                        {nota.id}
                                                    </TableCell>

                                                    <TableCell>
                                                        {nota.numero}
                                                    </TableCell>

                                                    <TableCell>
                                                        {nota.serie}
                                                    </TableCell>

                                                    <TableCell>
                                                        {nota.fornecedor || "-"}
                                                    </TableCell>

                                                    <TableCell>

                                                        <Tooltip
                                                            title={
                                                                nota.chave_acesso ||
                                                                ""
                                                            }
                                                        >

                                                            <Typography
                                                                variant="body2"
                                                                sx={{
                                                                    maxWidth: 220,
                                                                    overflow: "hidden",
                                                                    textOverflow:
                                                                        "ellipsis",
                                                                    whiteSpace:
                                                                        "nowrap"
                                                                }}
                                                            >

                                                                {nota.chave_acesso ||
                                                                    "-"}

                                                            </Typography>

                                                        </Tooltip>

                                                    </TableCell>

                                                    <TableCell>

                                                        <Chip
                                                            label={
                                                                nota.etiqueta?.toUpperCase() ||
                                                                "Sem etiqueta"
                                                            }
                                                            size="small"
                                                            variant="contained"
                                                            sx={{
                                                                width: '100%',
                                                                px: 1,
                                                                py: 0.3,
                                                                borderRadius: '999px',
                                                                fontSize: '0.7rem',
                                                                fontWeight: 700,
                                                                bgcolor:
                                                                    nota.etiqueta === "Gravada"
                                                                        ? "primary.gravada"
                                                                        : nota.etiqueta === "Lançada"
                                                                            ? "primary.lancada"
                                                                            : nota.etiqueta === "Cancelada"
                                                                                ? "primary.cancelada"
                                                                                : "primary.default",
                                                                color: "primary.branco"
                                                            }}
                                                        />

                                                    </TableCell>

                                                    <TableCell>

                                                        <Chip
                                                            label={nota.status?.toUpperCase() || "Sem registro"}
                                                            color="warning"
                                                            size="small"
                                                            sx={{
                                                                width: '100%',
                                                                px: 1,
                                                                py: 0.3,
                                                                borderRadius: '999px',
                                                                bgcolor:
                                                                    nota.status === "FORNECEDOR_DIRETO"
                                                                        ? 'background.forndireto'
                                                                        : nota.status === "PENDENTE"
                                                                            ? 'primary.parcial'
                                                                            : nota.status === "EM_CONFERENCIA"
                                                                                ? 'primary.em_conferencia'
                                                                                : nota.status === "CONFERIDA"
                                                                                    ? 'primary.conferidos'
                                                                                    : 'primary.guardado',
                                                                color: 'primary.branco',
                                                                fontSize: '0.7rem',
                                                                fontWeight: 700
                                                            }}
                                                        />

                                                    </TableCell>

                                                </TableRow>

                                            ))}

                                        </TableBody>

                                    </Table>

                                </Box>

                            </Paper>

                        )}

                    </Box>

                ) : (

                    <Alert
                        severity="info"
                        icon={<SyncIcon />}
                    >
                        Execute a conciliação para verificar as notas
                        pendentes no SSPLUS.
                    </Alert>

                )}

            </Box>

            {/* ERROS DA CONCILIAÇÃO */}

            {resultado?.erros?.length > 0 && (

                <Box sx={{ mt: 4 }}>

                    <Typography
                        variant="h6"
                        fontWeight="bold"
                        gutterBottom
                    >
                        Erros de consulta
                    </Typography>

                    <Alert
                        severity="error"
                        icon={<ErrorOutlineIcon />}
                        sx={{ mb: 2 }}
                    >
                        Algumas notas não puderam ser consultadas.
                        Elas não foram marcadas como gravadas.
                    </Alert>

                    <Paper
                        variant="outlined"
                        sx={{
                            borderRadius: 3,
                            overflow: "hidden"
                        }}
                    >

                        <Box sx={{ overflowX: "auto" }}>

                            <Table
                                size="small"
                                sx={{ minWidth: 650 }}
                            >

                                <TableHead>

                                    <TableRow>

                                        <TableCell>
                                            ID
                                        </TableCell>

                                        <TableCell>
                                            Número
                                        </TableCell>

                                        <TableCell>
                                            Chave
                                        </TableCell>

                                        <TableCell>
                                            Erro
                                        </TableCell>

                                    </TableRow>

                                </TableHead>

                                <TableBody>

                                    {resultado.erros.map((erro) => (

                                        <TableRow
                                            key={erro.id}
                                        >

                                            <TableCell>
                                                {erro.id}
                                            </TableCell>

                                            <TableCell>
                                                {erro.numero}
                                            </TableCell>

                                            <TableCell>
                                                {erro.chave_acesso}
                                            </TableCell>

                                            <TableCell>
                                                {erro.erro}
                                            </TableCell>

                                        </TableRow>

                                    ))}

                                </TableBody>

                            </Table>

                        </Box>

                    </Paper>

                </Box>

            )}

            {/* LOADING */}

            <Backdrop
                open={conciliando}
                sx={{
                    zIndex: (theme) =>
                        theme.zIndex.drawer + 1
                }}
            >

                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 2
                    }}
                >

                    <CircularProgress color="inherit" />

                    <Typography color="inherit">
                        Consultando notas no ssplus...
                    </Typography>

                    <Typography
                        variant="body2"
                        color="inherit"
                    >
                        Aguarde a conclusão da conciliação.
                    </Typography>

                </Box>

            </Backdrop>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={fecharSnackbar}
            >

                <Alert
                    onClose={fecharSnackbar}
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
    );
}

export default NotasGravadas;