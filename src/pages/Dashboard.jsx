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
    DialogActions
} from "@mui/material";

import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import SyncIcon from '@mui/icons-material/Sync';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';

import LoginFuncionario from "../components/LoginFuncionario";
import Conferencia from "./Conferencia";

function Dashboard({ tipo }) {

    // API Base
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

    useEffect(() => {
        if (token) buscarNotas();
    }, [token]);

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

    const notasPorTipo = notasFiltradas.filter(nota => {
        if (tipo === "transito") return nota.status === "EM_TRANSITO";
        if (tipo === "recebidas") return nota.status === "RECEBIDA";
        if (tipo === "conferidas") return nota.status === "CONFERIDA";
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

    // Sincroniza com SS PLUS
    const pegarLocal = async () => {
        try {
            const response = await fetch('http://192.168.1.184:8077/api/checar_localizacao_lote', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ todos: true })
            });
            const data = await response.json();
            if (response.ok && data.encontrado) {
                console.log(`Localização atualizada: ${data.localiza} (via ${data.metodo})`);
            } else {
                setSnackbar({
                    open: true,
                    message: "Sincronização com sucesso!",
                    severity: "success"
                });
                console.error(data.mensagem || 'Produto não encontrado no ERP');
            }
        } catch (err) {
            console.error('Erro na requisição:', err);
            setSnackbar({
                open: true,
                message: "Erro ao sincronizar com SS PLus!",
                severity: "error"
            });
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
            <Container maxWidth="100%" sx={{ mt: 4, bgcolor: '#FFFFFF' }}>
                {/* Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2, bgcolor: '#007bff', height: '7vh' }}>
                    <Typography variant="h4" sx={{ fontFamily: 'Consolas', color: '#FFFFFF' }}>
                        <strong>
                            {
                                tipo === "transito" ? "Notas em Trânsito" :
                                    tipo === "recebidas" ? "Notas Recebidas" :
                                        "Notas Conferidas"
                            }
                        </strong>
                    </Typography>
                    <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'right', mr: '0' }}>
                            {<PersonIcon sx={{ color: "#FFFFFF", paddingRight: '1vh' }} />}
                            <Typography sx={{ color: '#FFFFFF', fontSize: '0.9rem', display: 'flex', alignItems: 'center' }}>
                                {userInfo?.nome}
                            </Typography>
                            {token && (
                                <Button
                                    size="small"
                                    onClick={logout}
                                    sx={{ color: '#FFFFFF', display: 'flex', gap: 1 }}
                                >{<LogoutIcon />}
                                </Button>
                            )}
                        </Box>
                        <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'right', mr: '2vh' }}>
                            <Button
                                id="btnAtualizar" onClick={pegarLocal}
                                size="small"
                                sx={{ color: '#ffffff', display: 'flex', gap: 1 }}>
                                SS Plus Sync
                                {<SyncIcon />}
                            </Button>
                            <Button
                                onClick={() => navigate("/")}
                                sx={{ color: '#ffffff', display: 'flex', gap: 1 }}
                            >
                                Recebimento
                                {<LocalShippingIcon />}
                            </Button>
                            <pre id="resultado"></pre>
                        </Box>
                    </Box>
                </Box>
                <Box sx={{ mt: 3 }}>

                    <TextField
                        label="Buscar por NF"
                        variant="outlined"
                        size="small"
                        sx={{
                            mb: 2, width: '100%', bgcolor: '#f3f3f3',
                            '& .MuiOutlinedInput-root': {
                                '&:hover fieldset': {
                                    borderColor: '#007bff',
                                },
                                '&.Mui-focused fieldset': {
                                    borderColor: '#007bff',
                                }
                            }
                        }}
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                    />

                    {loadingNotas ? (
                        <Typography>Carregando...</Typography>
                    ) : notasPorTipo.length === 0 ? (
                        <Typography>Nenhuma nota encontrada</Typography>
                    ) : (
                        <Grid container spacing={4}>
                            {notasPorTipo.map((nota, idx) => (
                                <Grid size={{ xs: 12, md: 3 }} key={idx}>
                                    <Card variant="outlined" sx={{
                                        borderRadius: '2vh',
                                        boxShadow: '0vh 0.1vh 0.5vh #000000',
                                        bgcolor: '#f3f3f3',
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
                                            <Typography><strong>NF:</strong> {nota.numero}</Typography>
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
                                            <Typography sx={{ fontSize: '0.8rem' }}><strong>Recebimento:</strong> {nota.data_recebimento}</Typography>
                                            <Typography sx={{ fontSize: '0.8rem' }}><strong>Local:</strong> {nota.pallets?.toUpperCase()}</Typography>
                                            {nota.observacao_palet?.trim() && (
                                                <Typography sx={{ fontSize: '0.8rem', color: '#696969', fontStyle: 'italic' }}>
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
                                                        bgcolor: '#007bff',
                                                        '&:hover': { bgcolor: '#0056b3' }
                                                    }}
                                                    onClick={() => { buscarItens(nota) }}
                                                >Ver itens
                                                </Button>
                                                <Button
                                                    fullWidth
                                                    variant="contained"
                                                    sx={{
                                                        bgcolor: '#007bff',
                                                        '&:hover': { bgcolor: '#0056b3' }
                                                    }}
                                                    onClick={() => navigate(`/Conferencia/${nota.id}`)}
                                                >Iniciar Conferência
                                                </Button>
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
                            mb: 2, display: 'flex', margin: 'auto', width: '90%', bgcolor: '#f3f3f3',
                            '& .MuiOutlinedInput-root': {
                                '&:hover fieldset': {
                                    borderColor: '#007bff',
                                },
                                '&.Mui-focused fieldset': {
                                    borderColor: '#007bff',
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

                                    <Card key={index} sx={{ mt: 2, mb: 2, p: 2, borderRadius: '1vh', boxShadow: '0vh 0.1vh 0.5vh #000000', bgcolor: '#f3f3f3', }}>
                                        <Typography>
                                            <strong>Produto:</strong> {item.descricao || item.xProd}
                                        </Typography>

                                        <Typography>
                                            <strong>Quantidade:</strong> {Number(item.quantidade_comercial)}
                                        </Typography>

                                        <Typography>
                                            <strong>Código de barras:</strong> {item.cean || item.codigo_barras || "-"}
                                        </Typography>

                                    </Card>
                                );
                            })
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button sx={{ color: '#FFFFFF', bgcolor: 'rgb(255, 53, 53)', '&:hover': { bgcolor: 'rgb(202, 40, 40)' } }} onClick={() => setOpenModal(false)}>Fechar</Button>
                    </DialogActions>
                </Dialog>
            </Container>
        )
    )
}

export default Dashboard;