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
    const salvarItem = async (item) => {

        try {
            const codigoEnvio = item.id;

            const res = await fetch(
                `${API}/api/nfe/itemcod/${codigoEnvio}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        basico: item.basico,
                        cean:
                            item.cean === "SEM GTIN"
                                ? ""
                                : item.cean,
                        codire:
                            item.cean === "SEM GTIN"
                                ? ""
                                : item.cean,
                        loc_sistema: item.loc_sistema,
                    })
                }
            );

            if (!res.ok) {

                const erro = await res.text();

                console.error(erro);

                throw new Error(erro);
            }

            console.log("ITEM ATUALIZADO:", item.id,
                item.basico,
                item.cean,
                item.loc_sistema,
            )
            setSnackbar({
                open: true,
                message: "Item atualizado!",
                severity: "success"
            });

        } catch (err) {

            console.error(err);
            console.log("ITEM ATUALIZADO:", item.id,
                item.basico,
                item.cean,
                item.loc_sistema,
            )

            setSnackbar({
                open: true,
                message: err.message || "Erro ao atualizar item",
                severity: "error"
            });
        }
    };

    return (
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
                    bgcolor: 'var(--azul)',
                    mb: 5
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
                alignItems="center"
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
                        width: '100%',
                        "& .MuiOutlinedInput-root": {
                            bgcolor: "background.card",
                            color: "text.primary",
                            fontSize: "0.85rem",
                            height: 38
                        }
                    }}
                />

                <Button
                    variant="contained"
                    size="small"
                    onClick={buscarNotaPorNumero}
                    sx={{
                        minWidth: 90,
                        height: 38,
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
                    <Table
                        stickyHeader
                        size="small"
                    >
                        <TableHead>
                            <TableRow>
                                <TableCell width={35} sx={{ p: 0.5 }} />
                                <TableCell
                                    width={110}
                                    sx={{
                                        color: 'background.paper',
                                        p: 0.5,
                                        fontSize: '0.8rem'
                                    }}
                                >
                                    LOC
                                </TableCell>

                                <TableCell
                                    width={140}
                                    sx={{
                                        color: 'background.paper',
                                        p: 0.5,
                                        fontSize: '0.8rem'
                                    }}
                                >
                                    Código SSPlus
                                </TableCell>

                                <TableCell
                                    width={140}
                                    sx={{
                                        color: 'background.paper',
                                        p: 0.5,
                                        fontSize: '0.8rem'
                                    }}
                                >
                                    Código Nfe
                                </TableCell>

                                <TableCell
                                    sx={{
                                        color: 'background.paper',
                                        p: 0.5,
                                        fontSize: '0.8rem'
                                    }}
                                >
                                    Descrição
                                </TableCell>

                                <TableCell
                                    width={140}
                                    sx={{
                                        color: 'background.paper',
                                        p: 0.5,
                                        fontSize: '0.8rem'
                                    }}
                                >
                                    CEAN
                                </TableCell>

                                <TableCell
                                    width={90}
                                    align="right"
                                    sx={{
                                        color: 'background.paper',
                                        p: 0.5,
                                        paddingRight: 2.5,
                                        fontSize: '0.8rem'
                                    }}
                                >
                                    Ação
                                </TableCell>

                            </TableRow>
                        </TableHead>

                        <TableBody>

                            {itens.map((item, index) => {

                                const semCodigo =
                                    !item.cean ||
                                    item.cean === "SEM GTIN";

                                return (

                                    <TableRow
                                        key={item.id}
                                        hover
                                        sx={{
                                            height: 48
                                        }}
                                    >

                                        <TableCell sx={{ p: 0.5 }}>

                                            {semCodigo && (
                                                <Tooltip title="Produto sem código de barras">
                                                    <WarningAmberIcon
                                                        sx={{
                                                            color: "primary.parcial",
                                                            fontSize: 18,
                                                            marginLeft: 1
                                                        }}
                                                    />
                                                </Tooltip>
                                            )}

                                        </TableCell>

                                        <TableCell sx={{ p: 0.5 }}>
                                            <TextField
                                                size="small"
                                                value={item.loc_sistema || ""}
                                                onChange={(e) =>
                                                    alterarCampo(index, "loc_sistema", e.target.value)
                                                }
                                                sx={{
                                                    "& .MuiOutlinedInput-root": {
                                                        height: 34,
                                                        fontSize: "0.8rem"
                                                    }
                                                }}
                                            />
                                        </TableCell>

                                        <TableCell sx={{ p: 0.5 }}>
                                            <TextField
                                                size="small"
                                                value={item.basico || ""}
                                                onChange={(e) =>
                                                    alterarCampo(index, "basico", e.target.value)
                                                }
                                                sx={{
                                                    "& .MuiOutlinedInput-root": {
                                                        height: 34,
                                                        fontSize: "0.8rem"
                                                    }
                                                }}
                                            />
                                        </TableCell>

                                        <TableCell sx={{ p: 0.5 }}>
                                            <TextField
                                                size="small"
                                                value={item.cod_produto || ""}
                                                onChange={(e) =>
                                                    alterarCampo(index, "cod_produto", e.target.value)
                                                }
                                                sx={{
                                                    "& .MuiOutlinedInput-root": {
                                                        height: 34,
                                                        fontSize: "0.8rem"
                                                    }
                                                }}
                                            />
                                        </TableCell>

                                        <TableCell sx={{ p: 0.5 }}>
                                            <TextField
                                                fullWidth
                                                size="small"
                                                value={item.descricao || ""}
                                                onChange={(e) =>
                                                    alterarCampo(index, "descricao", e.target.value)
                                                }
                                                sx={{
                                                    "& .MuiOutlinedInput-root": {
                                                        height: 34,
                                                        fontSize: "0.8rem"
                                                    }
                                                }}
                                            />
                                        </TableCell>

                                        <TableCell sx={{ p: 0.5 }}>
                                            <TextField
                                                fullWidth
                                                size="small"
                                                value={item.cean || ""}
                                                onChange={(e) =>
                                                    alterarCampo(index, "cean", e.target.value)
                                                }
                                                sx={{
                                                    "& .MuiOutlinedInput-root": {
                                                        height: 34,
                                                        fontSize: "0.8rem"
                                                    }
                                                }}
                                            />
                                        </TableCell>

                                        <TableCell
                                            align="right"
                                            sx={{ p: 0.5 }}
                                        >
                                            <Button
                                                variant="contained"
                                                size="small"
                                                onClick={() => salvarItem(item)}
                                                sx={{
                                                    minWidth: 70,
                                                    height: 30,
                                                    fontSize: "0.72rem"
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