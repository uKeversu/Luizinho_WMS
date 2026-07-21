import { useEffect, useState, useContext } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
    Container,
    Typography,
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    CircularProgress,
    Backdrop,
    Snackbar,
    Alert,
    Button,
    Tooltip
} from "@mui/material";

import { ThemeContext } from "../context/ThemeContext";

import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SyncIcon from '@mui/icons-material/Sync';

function AtualizarCean() {

    const { dark } = useContext(ThemeContext);
    const navigate = useNavigate();

    const API = "http://192.168.1.185:8077";

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

    const [numeroNota, setNumeroNota] = useState("");
    const [razaoSocial, setRazaoSocial] = useState("");
    const [cnpjEmitente, setCnpjEmitente] = useState("");

    const [notasEncontradas, setNotasEncontradas] = useState([]);
    const [notaSelecionada, setNotaSelecionada] = useState(null);

    const [itens, setItens] = useState([]);
    const [editIndex, setEditIndex] = useState(null);
    const [itensEditados, setItensEditados] = useState({});

    const [loadingNotas, setLoadingNotas] = useState(false);
    const [loadingItens, setLoadingItens] = useState(false);
    const [searchParams] = useSearchParams();

    const [loadingSync, setLoadingSync] = useState(false);

    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success"
    });

    // BUSCAR NOTAS
    const buscarNotas = async () => {

        try {

            setLoadingNotas(true);

            const hoje = new Date();

            const inicio = new Date();
            inicio.setMonth(inicio.getMonth() - 24);

            const params = new URLSearchParams({
                page: 1,
                data_inicio: inicio.toISOString().split("T")[0],
                data_fim: hoje.toISOString().split("T")[0],
                sort_by: "data_emissao",
                sort_order: "DESC"
            });

            if (numeroNota.trim()) {
                params.append("numero", numeroNota.trim());
            }

            if (razaoSocial.trim()) {
                params.append(
                    "razao_social_emitente",
                    razaoSocial.trim()
                );
            }

            if (cnpjEmitente.trim()) {
                params.append(
                    "cnpj_emitente",
                    cnpjEmitente.trim()
                );
            }

            const res = await fetch(
                `${API}/api/notas/listar?${params}`,
                {
                    headers: {
                        "X-Auth-Token": token
                    }
                }
            );

            const data = await res.json();

            setNotasEncontradas(data.data || []);

            if ((data.data || []).length === 0) {
                setSnackbar({
                    open: true,
                    message: "Nenhuma nota encontrada",
                    severity: "warning"
                });
            }

        } catch (err) {

            console.error(err);

            setSnackbar({
                open: true,
                message: "Erro ao buscar notas",
                severity: "error"
            });

        } finally {
            setLoadingNotas(false);
        }
    };

    useEffect(() => {
        const notaUrl = searchParams.get("nota");

        if (!notaUrl) return;

        setNumeroNota(notaUrl);

    }, [searchParams]);

    useEffect(() => {
        if (numeroNota) {
            buscarNotas();
        }
    }, [numeroNota]);

    // BUSCAR ITENS DA NOTA
    const buscarItens = async (notaId) => {

        setLoadingItens(true);

        try {

            const res = await fetch(`${API}/api/itens_nfe/${notaId}`);
            const data = await res.json();

            console.log(data);

            const itensFormatados = data.items.map(item => ({
                ...item,
                original: { ...item }
            }));

            setItens(itensFormatados);

        } catch (err) {

            console.error(err);

            setSnackbar({
                open: true,
                message: "Erro ao carregar itens",
                severity: "error"
            });

        } finally {
            setLoadingItens(false);
        }
    };

    const registrarLog = async ({
        item = null,
        acao,
        local_anterior = null,
        local_novo = null,
        cod_produto_anterior = null,
        cod_produto_novo = null,
        cod_barras_anterior = null,
        cod_barras_novo = null,
        observacao = null,
    }) => {

        try {

            const payload = {
                nfe_item_id: item?.id ?? null,
                nota_id: notaSelecionada?.id ?? null,

                usuario: userInfo?.codigo,

                acao,

                local_anterior,
                local_novo,

                cod_produto_anterior,
                cod_produto: cod_produto_novo,

                cod_barras_anterior,
                cod_barras: cod_barras_novo,

                observacoes: observacao
            };

            console.log("LOG ALTERAÇÃO ITEM:", payload);

            const response = await fetch(
                `${API}/api/nfe/item/movimentacao/log`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-Auth-Token": token
                    },
                    body: JSON.stringify(payload)
                }
            );

            if (!response.ok) {
                throw new Error(await response.text());
            }

        } catch (error) {
            console.error("Erro ao enviar log:", error);
        }
    };

    const alterarCampo = (index, campo, valor) => {
        const novos = [...itens];

        novos[index][campo] = valor;

        setItens(novos);

        setItensEditados(prev => ({
            ...prev,
            [index]: {
                ...prev[index],
                [campo]: valor
            }
        }));
    };

    // SALVAR
    const salvarItem = async (item, index) => {

        const itemOriginal = item.original;

        const alteracoes = [];

        if (itemOriginal.loc_sistema !== item.loc_sistema) {
            alteracoes.push(
                `LOC: ${itemOriginal.loc_sistema} -> ${item.loc_sistema}`
            );
        }

        if (itemOriginal.basico !== item.basico) {
            alteracoes.push(
                `CÓDIGO SSPLUS: ${itemOriginal.basico} -> ${item.basico}`
            );
        }

        if (itemOriginal.cean !== item.cean) {
            alteracoes.push(
                `CEAN: ${itemOriginal.cean} -> ${item.cean}`
            );
        }

        if (alteracoes.length === 0) {
            setSnackbar({
                open: true,
                message: "Nenhuma alteração realizada",
                severity: "warning"
            });
            return;
        }

        try {

            const res = await fetch(
                `${API}/api/nfe/itemcod/${item.id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        basico: item.basico,
                        cean: item.cean === "SEM GTIN" ? "" : item.cean,
                        codire: item.cean === "SEM GTIN" ? "" : item.cean,
                        loc_sistema: item.loc_sistema,
                    })
                }
            );

            if (!res.ok) throw new Error(await res.text());

            await registrarLog({
                item,
                acao: "Alterou cadastro do item",

                local_anterior: itemOriginal.loc_sistema,
                local_novo: item.loc_sistema,

                cod_produto_anterior: itemOriginal.basico,
                cod_produto_novo: item.basico,

                cod_barras_anterior: itemOriginal.cean,
                cod_barras_novo: item.cean,
                observacao: alteracoes.join(" | ")
            });

            // atualiza o snapshot original
            item.original = {
                ...item
            };

            setSnackbar({
                open: true,
                message: "Item atualizado!",
                severity: "success"
            });

            setEditIndex(null);

            setItensEditados(prev => {
                const copy = { ...prev };
                delete copy[index];
                return copy;
            });

        } catch (err) {

            setSnackbar({
                open: true,
                message: err.message,
                severity: "error"
            });

        }
    };

    const handleKeyDown = (e, item, index) => {
        if (e.key === "Enter") {
            salvarItem(item, index);

            // Pula linha depois de salvar alteração
            const next = index + 1;
            if (next < itens.length) {
                setEditIndex(next);
            } else {
                setEditIndex(null);
            }
        }

        if (e.key === "Escape") {
            setEditIndex(null);
        }
    };

    const syncSSPlus = async () => {
        setLoadingSync(true);

        const tempoMinimo = 2000;
        const inicio = Date.now();

        let snackbarData = null;

        try {
            // 1 - Atualiza locais do SS Plus
            const responseLocal = await fetch(
                "http://192.168.1.185:8077/api/sync/local_sistema",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        todos: true
                    })
                }
            );

            const dataLocal = await responseLocal.json();

            if (!responseLocal.ok) {
                throw new Error("Erro ao buscar localizações no SS Plus");
            }

            const {
                erros = 0,
                inseridos = 0,
                total_processados = 0
            } = dataLocal.estatisticas || {};

            console.log("Total processados:", total_processados);
            console.log("Atualizados:", inseridos);
            console.log("Erros:", erros);

            const responseSync = await fetch(
                `${API}/api/sync/nfe_item_x_local_sistema`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                    })
                }
            );

            const dataSync = await responseSync.json();

            if (!responseSync.ok) {
                throw new Error(dataSync?.erro || "Erro ao sincronizar nota");
            }

            registrarLog({
                acao: "Sincronizou nota"
            });

            const semDados =
                total_processados === 0 &&
                inseridos === 0 &&
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
                    message: "Itens sincronizados",
                    severity: "success"
                };
            }

        } catch (err) {
            console.error(err);

            snackbarData = {
                open: true,
                message: err.message || "Erro ao sincronizar com SS Plus",
                severity: "error"
            };

        } finally {
            const tempoPassado = Date.now() - inicio;
            const tempoRestante = tempoMinimo - tempoPassado;
            buscarItens(notaSelecionada.id);

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
        <Container maxWidth="100%" sx={{ mt: 4, bgcolor: "background.default" }}>
            {/* Header */}
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
                <Typography variant="h4" sx={{ fontFamily: 'Consolas', color: "background.paper" }}>
                    <strong>Correção de Notas</strong>
                </Typography>
                <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'right', mr: '0' }}>
                        {<PersonIcon sx={{ color: "background.paper", paddingRight: '1vh' }} />}
                        <Typography sx={{ color: "background.paper", fontSize: '0.9rem', display: 'flex', alignItems: 'center' }}>
                            {userInfo?.nome}
                        </Typography>
                        {token && (
                            <Button
                                size="small"
                                onClick={logout}
                                sx={{ color: "background.paper", display: 'flex', gap: 1 }}
                            >{<LogoutIcon />}
                            </Button>
                        )}
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'right', mr: '2vh' }}>
                        <Tooltip title="Buscar códigos e localizações do SS Plus">
                            <Button
                                id="btnAtualizar" onClick={syncSSPlus}
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
                        </Tooltip>
                        <Tooltip title="Voltar ao Dashboard">
                            <Button
                                onClick={() => navigate("/Dashboard")}
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
                                {< ArrowBackIcon />}
                            </Button>
                        </Tooltip>
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
                        Sincronizando itens com o SS Plus...
                    </Typography>
                </Box>
            </Backdrop>

            {/* BUSCA NOTA */}
            <Box
                mb={2}
                display="flex"
                gap={1}
                alignItems="stretch"
                sx={{ zoom: 0.9 }}
            >
                <TextField
                    label="Número NF"
                    size="small"
                    value={numeroNota}
                    onChange={(e) => setNumeroNota(e.target.value)}
                    sx={{ flex: 1 }}
                    autoComplete="off"
                    inputProps={{
                        spellCheck: false,
                        autoCorrect: "off",
                        autoCapitalize: "off",
                    }}
                />

                <TextField
                    label="Fornecedor"
                    size="small"
                    value={razaoSocial}
                    onChange={(e) => setRazaoSocial(e.target.value)}
                    sx={{ flex: 2 }}
                    autoComplete="off"
                    inputProps={{
                        spellCheck: false,
                        autoCorrect: "off",
                        autoCapitalize: "off",
                    }}
                />

                <TextField
                    label="CNPJ"
                    size="small"
                    value={cnpjEmitente}
                    onChange={(e) => setCnpjEmitente(e.target.value)}
                    sx={{ flex: 1 }}
                    autoComplete="off"
                    inputProps={{
                        spellCheck: false,
                        autoCorrect: "off",
                        autoCapitalize: "off",
                    }}
                />

                <Button
                    variant="contained"
                    onClick={buscarNotas}
                    sx={{
                        height: "40px",
                        minWidth: "140px"
                    }}
                >
                    Buscar
                </Button>
            </Box>

            {notasEncontradas.length > 0 && (

                <Paper
                    sx={{
                        mb: 2,
                        maxHeight: 250,
                        overflow: "auto",
                        bgcolor: 'background.alerta',
                        zoom: 0.9
                    }}
                >
                    <Typography variant="h6">
                        NOTAS ENCONTRADAS
                    </Typography>
                    {notasEncontradas.map((nota) => (

                        <Box
                            key={nota.id}
                            onClick={() => {
                                setItens([]);
                                setItensEditados({});
                                setEditIndex(null);

                                setNotaSelecionada(nota);

                                buscarItens(nota.id);
                            }}
                            sx={{
                                p: 1.5,
                                borderBottom: "1px solid",
                                borderColor: "divider",
                                cursor: "pointer",
                                display: 'flex',
                                justifyContent: 'space-around',
                                "&:hover": {
                                    bgcolor: "action.hover"
                                },
                            }}
                        >
                            <Typography fontWeight={600}>
                                NF: {nota.numero}-{nota.serie}
                            </Typography>
                            <Typography variant="body2">
                                {nota.fornecedor}
                            </Typography>
                            <Typography variant="body2">
                                CNPJ: {nota.cnpj_emitente}
                            </Typography>
                        </Box>

                    ))}
                </Paper>

            )}

            {loadingNotas && <CircularProgress size={22} />}

            {notaSelecionada && (

                <Paper sx={{ p: 2, mb: 2, bgcolor: 'background.alerta', zoom: 0.8 }}>

                    <Typography variant="h6">
                        NOTA SELECIONADA
                    </Typography>
                    <Typography variant="h5">
                        NF {notaSelecionada.numero}-{notaSelecionada.serie}
                    </Typography>

                    <Typography variant="h7">
                        {notaSelecionada.fornecedor}
                    </Typography>

                </Paper>

            )}

            {loadingItens ? (
                <CircularProgress size={22} />
            ) : (
                <TableContainer
                    component={Paper}
                    sx={{
                        maxHeight: "78vh",
                        boxShadow: '0vh 0.1vh 0.5vh var(--sombra)',
                        bgcolor: 'background.tabela',
                        color: 'text.primary',
                        mb: 5,
                        zoom: 0.9
                    }}
                >
                    <Table stickyHeader size="small">

                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ color: 'background.paper', bgcolor: 'primary.main' }} />
                                <TableCell sx={{ color: 'background.paper', bgcolor: 'primary.main' }}>LOC</TableCell>
                                <TableCell sx={{ color: 'background.paper', bgcolor: 'primary.main' }}>Código SSPlus</TableCell>
                                <TableCell sx={{ color: 'background.paper', bgcolor: 'primary.main' }}>Código NFe</TableCell>
                                <TableCell sx={{ color: 'background.paper', bgcolor: 'primary.main' }}>Descrição</TableCell>
                                <TableCell sx={{ color: 'background.paper', bgcolor: 'primary.main' }}>CEAN</TableCell>
                                <TableCell sx={{ color: 'background.paper', bgcolor: 'primary.main' }} align="right">Ação</TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {itens.map((item, index) => {

                                const camposVazios = [
                                    item.loc_sistema,
                                    item.basico,
                                    item.cod_produto,
                                    item.descricao,
                                    item.cean
                                ].some(campo =>
                                    !campo || String(campo).trim() === "" || campo === "SEM GTIN"
                                );

                                const isEditing = editIndex === index;
                                const hasChanges = !!itensEditados[index];

                                return (
                                    <TableRow
                                        key={item.id}
                                        onClick={() => setEditIndex(index)}
                                        sx={{
                                            bgcolor: camposVazios
                                                ? 'background.alerta'
                                                : hasChanges
                                                    ? 'background.editado'
                                                    : 'inherit',

                                            transition: "0.2s",
                                            cursor: "pointer",

                                            "&:hover": {
                                                bgcolor: "action.hover"
                                            }
                                        }}
                                    >

                                        {/* ALERTA */}
                                        <TableCell sx={{ p: 0.5 }}>
                                            {camposVazios && (
                                                <Tooltip title="Campos pendentes">
                                                    <WarningAmberIcon
                                                        sx={{
                                                            color: "primary.parcial",
                                                            fontSize: 18
                                                        }}
                                                    />
                                                </Tooltip>
                                            )}
                                        </TableCell>

                                        {/* LOC */}
                                        <TableCell sx={{ p: 0.5 }}>
                                            {isEditing ? (
                                                <TextField
                                                    size="small"
                                                    value={item.loc_sistema || ""}
                                                    onChange={(e) =>
                                                        alterarCampo(index, "loc_sistema", e.target.value)
                                                    }
                                                    onKeyDown={(e) => handleKeyDown(e, item, index)}
                                                    autoFocus
                                                    sx={{
                                                        "& .MuiOutlinedInput-root": { height: 32, fontSize: "0.75rem" }
                                                    }}
                                                />
                                            ) : (
                                                item.loc_sistema
                                            )}
                                        </TableCell>

                                        {/* SSPLUS */}
                                        <TableCell sx={{ p: 0.5 }}>
                                            {isEditing ? (
                                                <TextField
                                                    size="small"
                                                    value={item.basico || ""}
                                                    onChange={(e) =>
                                                        alterarCampo(index, "basico", e.target.value)
                                                    }
                                                    onKeyDown={(e) => handleKeyDown(e, item, index)}
                                                    sx={{ "& .MuiOutlinedInput-root": { height: 32 } }}
                                                />
                                            ) : (
                                                item.basico
                                            )}
                                        </TableCell>

                                        {/* NFE */}
                                        <TableCell sx={{ p: 0.5 }}>
                                            {isEditing ? (
                                                <TextField
                                                    size="small"
                                                    value={item.cod_produto || ""}
                                                    onChange={(e) =>
                                                        alterarCampo(index, "cod_produto", e.target.value)
                                                    }
                                                    onKeyDown={(e) => handleKeyDown(e, item, index)}
                                                    sx={{ "& .MuiOutlinedInput-root": { height: 32 } }}
                                                />
                                            ) : (
                                                item.cod_produto
                                            )}
                                        </TableCell>

                                        {/* DESCRIÇÃO */}
                                        <TableCell sx={{ p: 0.5 }}>
                                            {isEditing ? (
                                                <TextField
                                                    fullWidth
                                                    size="small"
                                                    value={item.descricao || ""}
                                                    onChange={(e) =>
                                                        alterarCampo(index, "descricao", e.target.value)
                                                    }
                                                    onKeyDown={(e) => handleKeyDown(e, item, index)}
                                                    sx={{ "& .MuiOutlinedInput-root": { height: 32 } }}
                                                />
                                            ) : (
                                                item.descricao
                                            )}
                                        </TableCell>

                                        {/* CEAN */}
                                        <TableCell sx={{ p: 0.5 }}>
                                            {isEditing ? (
                                                <TextField
                                                    fullWidth
                                                    size="small"
                                                    value={item.cean || ""}
                                                    onChange={(e) =>
                                                        alterarCampo(index, "cean", e.target.value)
                                                    }
                                                    onKeyDown={(e) => handleKeyDown(e, item, index)}
                                                    sx={{ "& .MuiOutlinedInput-root": { height: 32 } }}
                                                />
                                            ) : (
                                                item.cean
                                            )}
                                        </TableCell>

                                        {/* SALVAR ALTERAÇÃO */}
                                        <TableCell sx={{ p: 0.5 }}>
                                            <Button
                                                variant="contained"
                                                size="small"
                                                onClick={() => salvarItem(item, index)}
                                                sx={{
                                                    minWidth: 70,
                                                    height: 28,
                                                    fontSize: "0.7rem",
                                                    opacity: hasChanges ? 1 : 0.4
                                                }}
                                            >
                                                Salvar
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() =>
                    setSnackbar({
                        ...snackbar,
                        open: false
                    })
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
    );
}

export default AtualizarCean;