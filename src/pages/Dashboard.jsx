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
    Snackbar
} from "@mui/material";

import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';

import LoginFuncionario from "../components/LoginFuncionario";

import '../style/App.css';

import Conferencia from "./Conferencia";

function Dashboard({ tipo }) {

    // API BASE
    const API = "http://192.168.1.184:8077";

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

    useEffect(() => {
        if (token) buscarNotas();
    }, [token]);

    useEffect(() => {
        setNotasSelecionadas([]);
    }, [aba]);

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

    const notasFiltradasPorAba = notasFiltradas.filter(nota => {
        if (aba === 0) return nota.status === "EM_TRANSITO";
        if (aba === 1) { return ["RECEBIDA", "FORNECEDOR_DIRETO"].includes(nota.status); }
        if (aba === 2) return nota.status === "CONFERIDA";
        return true;
    });

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
                setItensNota(todosItens);
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
            item?.codigo_barras?.toString().includes(termo)
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
                        status: "RECEBIDA"
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
                        ? { ...n, status: "RECEBIDA", data_recebimento: new Date().toISOString() }
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
            <Container maxWidth="100%" sx={{ mt: 4, bgcolor: "var(--branco)" }}>
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
                    <Typography variant="h4" sx={{ fontFamily: 'Consolas', color: "var(--branco)" }}>
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
                <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: "var(--branco)" }}>
                    <Tabs
                        value={aba}
                        onChange={(e, newValue) => setAba(newValue)}
                        textColor="primary"
                        indicatorColor="primary"
                        centered
                    >
                        <Tab label="Em Trânsito" />
                        <Tab label="Recebidas" />
                        <Tab label="Guarda pendente" />
                        <Tab label="Histórico" />
                    </Tabs>
                </Box>
                <Box sx={{ mt: 3 }}>

                    <TextField
                        label="Buscar por NF"
                        variant="outlined"
                        size="small"
                        sx={{
                            mb: 2, width: '100%', bgcolor: 'var(--fundo-card)',
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
                    {aba === 1 && (
                        <Button
                            variant="contained"
                            sx={{ mb: 2 }}
                            disabled={notasSelecionadas.length === 0}
                            onClick={() => {
                                const notasValidas = notasSelecionadas.filter(id => {
                                    const nota = notas.find(n => n.id === id);
                                    return nota?.status === "FORNECEDOR_DIRETO" || nota?.status === "RECEBIDA";
                                });

                                const temRecebida = notasValidas.some(id => {
                                    const nota = notas.find(n => n.id === id);
                                    return nota?.status === "RECEBIDA";
                                });

                                if (temRecebida && notasValidas.length > 1) {
                                    setSnackbar({
                                        open: true,
                                        message: "Notas com status 'RECEBIDA' só podem ser conferidas uma por vez!",
                                        severity: "success"
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
                    ) : notasFiltradasPorAba.length === 0 ? (
                        <Typography>Nenhuma nota encontrada</Typography>
                    ) : (
                        <Grid container spacing={4}>

                            {notasFiltradasPorAba.map((nota, idx) => (

                                <Grid size={{ xs: 12, md: 3 }} key={idx}>
                                    <Card variant="outlined" sx={{
                                        borderRadius: '2vh',
                                        boxShadow: '0vh 0.1vh 0.5vh var(--sombra)',
                                        bgcolor: nota.status === "FORNECEDOR_DIRETO" ? 'var(--fundo-forn-direto)' : 'var(--card)',
                                        height: '100%',
                                        display: 'flex',
                                        textAlign: 'left',
                                        flexDirection: 'column'
                                    }}>
                                        <CardContent sx={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            flexGrow: 1,
                                            gap: 1,
                                        }}>
                                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                <Typography><strong>NF:</strong> {nota.numero}</Typography>

                                                {(nota.status === "FORNECEDOR_DIRETO" || nota.status === "RECEBIDA") && (
                                                    <Checkbox
                                                        checked={notasSelecionadas.includes(nota.id)}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                const notaAtual = nota;
                                                                if (notaAtual.status === "RECEBIDA" && notasSelecionadas.length >= 1) {
                                                                    setSnackbar({
                                                                        open: true,
                                                                        message: "Só é permitido uma nota por vez",
                                                                        severity: "warning"
                                                                    });
                                                                    return;
                                                                }

                                                                setNotasSelecionadas(prev => [...prev, nota.id]);
                                                            } else {
                                                                setNotasSelecionadas(prev => prev.filter(id => id !== nota.id));
                                                            }
                                                        }}
                                                    />
                                                )}
                                            </Box>
                                            <Typography><strong>Série:</strong> {nota.serie}</Typography>
                                            <Typography sx={{
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                fontSize: '0.8rem'
                                            }}>
                                                <strong>Fornecedor:</strong> {nota.fornecedor}
                                            </Typography>

                                            <Typography sx={{ fontSize: '0.8rem' }}><strong>Emissão:</strong> {nota.data_emissao}</Typography>
                                            <Typography sx={{ fontSize: '0.8rem' }}><strong>Importação:</strong> {nota.data_recebimento}</Typography>
                                            <Typography sx={{ fontSize: '0.8rem' }}><strong>Local:</strong> {nota.pallets?.toUpperCase()}</Typography>
                                            {nota.observacao_palet?.trim() && (
                                                <Typography sx={{ fontSize: '0.8rem', color: 'var(--observacao-texto)', fontStyle: 'italic' }}>
                                                    <strong>Obs:</strong> {nota.observacao_palet}
                                                </Typography>
                                            )}
                                            <Typography sx={{ fontSize: '0.8rem' }}><strong>Status:</strong> {nota.status}</Typography>

                                            <Box sx={{ mt: 'auto' }}>
                                                <Button
                                                    fullWidth
                                                    variant="contained"
                                                    sx={{
                                                        mb: '1vh',
                                                        bgcolor: 'var(--azul)',
                                                        '&:hover': { bgcolor: 'var(--azul-hover)' }
                                                    }}
                                                    onClick={() => { buscarItens(nota) }}
                                                >Ver itens
                                                </Button>
                                                {nota.status === "EM_TRANSITO" && (
                                                    <Button
                                                        fullWidth
                                                        variant="contained"
                                                        disabled={loadingNotasIds.includes(nota.id)}
                                                        sx={{
                                                            bgcolor: "var(--confirmar)",
                                                            '&:hover': { bgcolor: "var(--confirmar-hover)" }
                                                        }}
                                                        onClick={() => atualizarStatusNota(nota)}
                                                    >
                                                        {loadingNotasIds.includes(nota.id)
                                                            ? "Atualizando..."
                                                            : "Marcar como Recebida"}
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
                <Dialog open={openModal} onClose={() => setOpenModal(false)} fullWidth maxWidth="md">
                    <DialogTitle>
                        Itens da NF {notaSelecionada?.numero}
                    </DialogTitle>
                    <TextField
                        label="Buscar por item"
                        variant="outlined"
                        size="small"
                        sx={{
                            mb: 2, display: 'flex', margin: 'auto', width: '90%', bgcolor: 'var(--fundo-card)',
                            '& .MuiOutlinedInput-root': {
                                '&:hover fieldset': {
                                    borderColor: 'var(--azul)',
                                },
                                '&.Mui-focused fieldset': {
                                    borderColor: 'var(--azul)',
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

                                    <Card key={index} sx={{ mt: 2, mb: 2, p: 2, borderRadius: '1vh', boxShadow: '0vh 0.1vh 0.5vh var(--sombra)', bgcolor: 'var(--fundo-card)', }}>
                                        <Typography>
                                            <strong>Produto:</strong> {item.descricao || item.xProd}
                                        </Typography>

                                        <Typography>
                                            <strong>Quantidade:</strong> {Number(item.quantidade_comercial)}
                                        </Typography>

                                        <Typography>
                                            <strong>Código de barras:</strong> {item.cean || item.codigo_barras || "-"}
                                        </Typography>
                                        <Typography>
                                            <strong>Caixa:</strong> {item.caixa !== "0" ? item.caixa : "SEM CAIXA"}
                                        </Typography>
                                        <Typography sx={{
                                            color:
                                                item.status_item === "ITEM_CONFERIDO" ? "var(--confirmar)" :
                                                    item.status_item === "PENDENTE" ? "var(--azul)" :
                                                        item.status_item === "FORNECEDOR_DIRETO" ? "var(--observacao)" :
                                                            item.status_item === "EM_TRANSITO" ? "var(--em-transito)" :
                                                                "var(--em-transito)"
                                        }}>
                                            <strong>Status:</strong> {item.status_item || "SEM STATUS"}
                                        </Typography>
                                    </Card>
                                );
                            })
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button sx={{ color: "var(--branco)", bgcolor: 'var(--cancelar)', '&:hover': { bgcolor: 'var(--cancelar-hover)' } }} onClick={() => setOpenModal(false)}>Fechar</Button>
                    </DialogActions>
                </Dialog>
            </Container>
        )
    )
}

export default Dashboard;