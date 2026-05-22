import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
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

    const [notas, setNotas] = useState([]);
    const [notaSelecionada, setNotaSelecionada] = useState("");

    const [itens, setItens] = useState([]);
    const [editIndex, setEditIndex] = useState(null);
    const [itensEditados, setItensEditados] = useState({});

    const [loadingNotas, setLoadingNotas] = useState(false);
    const [loadingItens, setLoadingItens] = useState(false);

    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success"
    });

    // BUSCAR NOTAS
    const buscarNotas = async () => {

        setLoadingNotas(true);

        try {

            const res = await fetch(`${API}/api/notas/listar`);
            const data = await res.json();

            setNotas(data || []);

        } catch {

            setSnackbar({
                open: true,
                message: "Erro ao carregar notas",
                severity: "error"
            });

        } finally {
            setLoadingNotas(false);
        }
    };

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

    useEffect(() => {
        buscarNotas();
    }, []);

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

    const buscarNotaPorNumero = async () => {

        if (!notaSelecionada.trim()) {
            return;
        }

        try {

            const notaEncontrada = notas.find(
                n => String(n.numero) === String(notaSelecionada)
            );

            if (!notaEncontrada) {

                setSnackbar({
                    open: true,
                    message: "Nota não encontrada",
                    severity: "warning"
                });

                return;
            }

            buscarItens(notaEncontrada.id);

        } catch (err) {

            console.error(err);

            setSnackbar({
                open: true,
                message: "Erro ao buscar nota",
                severity: "error"
            });
        }
    };

    // SALVAR
    const salvarItem = async (item, index) => {
        try {
            const res = await fetch(`${API}/api/nfe/itemcod/${item.id}`, {
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
            });

            if (!res.ok) throw new Error(await res.text());

            setSnackbar({
                open: true,
                message: "Item atualizado!",
                severity: "success"
            });

            // limpa edição
            setEditIndex(null);

            // Remove do cache de alterações
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
            salvarItem(item);

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
                    borderRadius: '2vh'
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
                        <Button
                            onClick={() => navigate("/Dashboard")}
                            sx={{ color: "background.paper", display: 'flex', gap: 1 }}
                        >
                            Voltar
                            {< ArrowBackIcon />}
                        </Button>
                        <pre id="resultado"></pre>
                    </Box>
                </Box>
            </Box>

            {/* BUSCA NOTA */}
            <Box
                mb={2}
                display="flex"
                gap={1}
                alignItems="stretch"
            >
                <TextField
                    label="Buscar nota"
                    size="small"
                    value={notaSelecionada}
                    onChange={(e) => setNotaSelecionada(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            buscarNotaPorNumero();
                        }
                    }}
                    sx={{
                        flex: 1,
                        bgcolor: 'background.card',
                        '& .MuiOutlinedInput-root': {
                            height: "40px",
                            '&:hover fieldset': {
                                borderColor: 'var(--azul)',
                            },
                            '&.Mui-focused fieldset': {
                                borderColor: 'var(--azul)',
                            }
                        }
                    }}
                />

                <Button
                    variant="contained"
                    onClick={buscarNotaPorNumero}
                    sx={{
                        height: "40px",
                        minWidth: "180px",
                        fontSize: "0.8rem"
                    }}
                >
                    Buscar
                </Button>
            </Box>

            {loadingNotas && <CircularProgress size={22} />}

            {loadingItens ? (
                <CircularProgress size={22} />
            ) : (
                <TableContainer
                    component={Paper}
                    sx={{
                        maxHeight: "78vh",
                        boxShadow: '0vh 0.1vh 0.5vh var(--sombra)',
                        bgcolor: 'background.tabela',
                        color: 'text.primary'
                    }}
                >
                    <Table stickyHeader size="small">

                        <TableHead>
                            <TableRow sx={{ bgcolor: 'var(--azul)' }}>
                                <TableCell sx={{ color: 'background.paper' }} />
                                <TableCell sx={{ color: 'background.paper' }}>LOC</TableCell>
                                <TableCell sx={{ color: 'background.paper' }}>Código SSPlus</TableCell>
                                <TableCell sx={{ color: 'background.paper' }}>Código NFe</TableCell>
                                <TableCell sx={{ color: 'background.paper' }}>Descrição</TableCell>
                                <TableCell sx={{ color: 'background.paper' }}>CEAN</TableCell>
                                <TableCell sx={{ color: 'background.paper' }} align="right">Ação</TableCell>
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
                                                    ? '#fff3cd'
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

                                        {/* AÇÃO */}
                                        <TableCell align="right" sx={{ p: 0.5 }}>
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
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>

        </Container>
    );
}

export default AtualizarCean;