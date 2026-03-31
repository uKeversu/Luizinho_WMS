import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    Container, Typography, Card, Box, TextField, Button,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogActions,
    Select, MenuItem, FormControl, InputLabel
} from "@mui/material";

import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import SyncIcon from '@mui/icons-material/Sync';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import LoginFuncionario from "../components/LoginFuncionario";

function Conferencia() {
    const navigate = useNavigate();
    const { id } = useParams();
    const API = "http://192.168.1.184:8077";

    // Login
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

    // Conferência
    const [itens, setItens] = useState([]);
    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
    const [codigo, setCodigo] = useState("");
    const [caixasDisponiveis, setCaixasDisponiveis] = useState([]);
    const [loadingCaixas, setLoadingCaixas] = useState(false);
    const [ultimoItem, setUltimoItem] = useState(null);

    // Caixa aberta e fechadas
    const [caixaAberta, setCaixaAberta] = useState(null);
    const [caixas, setCaixas] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [caixaFechadaDialog, setCaixaFechadaDialog] = useState(null);
    const [openFecharDialog, setOpenFecharDialog] = useState(false);
    const [numeroCaixa, setNumeroCaixa] = useState("");

    const [notaInfo, setNotaInfo] = useState(null);

    useEffect(() => {
        if (id) {
            buscarItens();
            buscarNota();
        }
    }, [id]);

    const buscarNota = async () => {
        const res = await fetch(`${API}/api/notas/listar`);
        const data = await res.json();
        const encontrada = data.find(n => n.id == id);
        setNotaInfo(encontrada);
    };

    const buscarItens = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API}/api/itens_nfe/${id}`);
            const data = await response.json();

            const toNumber = (value) => {
                const n = parseFloat(value);
                return isNaN(n) ? 0 : n;
            };

            if (response.ok) {
                const formatado = (data.items || []).map(item => ({
                    descricao: item.descricao || "Item sem identificação",
                    codigo_barras: item.cean || "Sem código de barras",
                    quantidade: toNumber(item.quantidade_comercial) || 0,
                    localizacao: item.loc_sistema || "Sem localização",
                    conferido: 0,
                    caixa: null
                }));
                setItens(formatado);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // Abrir nova caixa
    const abrirCaixa = () => {
        const novaCaixa = { id: Date.now(), itens: [] };
        setCaixaAberta(novaCaixa);
    };

    // Fechar caixa
    const fecharCaixa = () => {
        if (!caixaAberta) return;
        setCaixas([...caixas, caixaAberta]);
        setCaixaAberta(null);
    };

    const confirmarFechamento = () => {
        if (!caixaAberta?.numero && !numeroCaixa.trim()) {
            setSnackbar({
                open: true,
                message: "Informe o número da caixa",
                severity: "warning"
            });
            return;
        }

        const caixaFinal = {
            ...caixaAberta,
            numero: caixaAberta.numero || numeroCaixa
        };

        setCaixas([...caixas, caixaFinal]);
        setCaixaAberta(null);
        setNumeroCaixa("");
        setOpenFecharDialog(false);
    };

    // Reabre caixa para adicionar mais itens
    const reabrirCaixa = (caixa) => {
        // Remove das fechadas
        setCaixas(prev => prev.filter(c => c.id !== caixa.id));

        // Recalcula os itens com base no estado atual
        const itensAtualizados = itens.filter(i => i.caixa === caixa.id);

        setCaixaAberta({
            ...caixa,
            itens: itensAtualizados
        });

        setSnackbar({
            open: true,
            message: `Caixa ${caixa.numero} reaberta`,
            severity: "info"
        });
    };

    const buscarCaixasDisponiveis = async () => {
        try {
            setLoadingCaixas(true);

            const response = await fetch(`${API}/api/caixas_para_guarda/listar`);
            const data = await response.json();

            if (response.ok) {
                setCaixasDisponiveis(data || []);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingCaixas(false);
        }
    };

    // Scanner
    const scanner = () => {
        const codigoLimpo = codigo.trim();
        setUltimoItem(item.codigo_barras);

        if (!caixaAberta) {
            setSnackbar({ open: true, message: "Abra uma caixa antes de conferir itens", severity: "warning" });
            setCodigo("");
            return;
        }

        const index = itens.findIndex(item => item.codigo_barras === codigoLimpo);

        if (index === -1) {
            setSnackbar({ open: true, message: "Produto não encontrado", severity: "warning" });
            setCodigo("");
            return;
        }

        const novosItens = [...itens];
        const item = novosItens[index];

        if (item.conferido >= item.quantidade) {
            setSnackbar({ open: true, message: "Quantidade total já conferida", severity: "info" });
            setCodigo("");
            return;
        }

        // Atualiza quantidade conferida e marca a caixa
        item.conferido += 1;
        item.caixa = caixaAberta.id;

        // Move o item conferido para o topo (opcional)
        novosItens.splice(index, 1);
        novosItens.unshift(item);

        setItens(novosItens);

        // Atualiza itens na caixa aberta
        setCaixaAberta(prev => ({
            ...prev,
            itens: novosItens.filter(i => i.caixa === prev.id)
        }));

        setCodigo("");
    };

    if (!token) {
        return (
            <LoginFuncionario onLogin={(data) => {
                localStorage.setItem("nfe_token", data.token);
                const user = { nome: data.nome, codigo: data.codigo };
                localStorage.setItem("user_info", JSON.stringify(user));
                setUserInfo(user);
                setToken(data.token);
            }} />
        );
    }

    return (
        <Container maxWidth="100%" sx={{ mt: 4, bgcolor: '#FFFFFF' }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2, bgcolor: '#007bff', height: '7vh' }}>
                <Typography variant="h4" sx={{ fontFamily: 'Consolas', color: '#FFFFFF' }}><strong>Conferência de mercadorias</strong></Typography>
                <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'right', mr: '0' }}>
                        {<PersonIcon sx={{ color: "#FFFFFF", paddingRight: '1vh' }} />}
                        <Typography sx={{ color: '#FFFFFF', fontSize: '0.9rem', display: 'flex', alignItems: 'center' }}>{userInfo?.nome}</Typography>
                        {token && (
                            <Button size="small" onClick={logout} sx={{ color: '#FFFFFF', display: 'flex', gap: 1 }}>{<LogoutIcon />}</Button>
                        )}
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'right', mr: '2vh' }}>
                        <Button id="btnAtualizar" size="small" sx={{ color: '#ffffff', display: 'flex', gap: 1 }}>SS Plus Sync {<SyncIcon />}</Button>
                        <Button onClick={() => navigate("/Dashboard")} sx={{ color: '#ffffff', display: 'flex', gap: 1 }}>Voltar {< ArrowBackIcon />}</Button>
                    </Box>
                </Box>
            </Box>

            {/* Informações da nota e scanner */}
            <Box sx={{ mt: 3 }}>
                <Typography variant="h6">NF: {notaInfo?.numero || id}</Typography>
                <Typography variant="h6">{notaInfo?.fornecedor}</Typography>
                <TextField
                    label="Código de barras"
                    variant="outlined"
                    size="small"
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") scanner(); }}
                    autoFocus
                    fullWidth
                    sx={{ mb: 2, width: '100%', bgcolor: '#f3f3f3' }}
                />

                {/* Tabela de conferência + caixas*/}
                <Box sx={{ display: 'flex', gap: 2 }}>
                    {/* Tabela de itens */}
                    <Box sx={{ flex: 2 }}>
                        {loading ? <Typography>Carregando...</Typography> :
                            itens.length === 0 ? <Typography>Nenhum item</Typography> :
                                <TableContainer component={Paper} sx={{ boxShadow: '0vh 0.1vh 0.5vh #000000' }}>
                                    <Table>
                                        <TableHead>
                                            <TableRow sx={{ bgcolor: '#007bff' }}>
                                                <TableCell sx={{ color: '#fff' }}>Localização</TableCell>
                                                <TableCell sx={{ color: '#fff' }}>Código de Barras</TableCell>
                                                <TableCell sx={{ color: '#fff' }}>Descrição</TableCell>
                                                <TableCell sx={{ color: '#fff' }} align="right">Qtd (Conf./Nota)</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {itens.map((item, index) => (
                                                <TableRow key={index} sx={{
                                                    bgcolor: item.codigo_barras === ultimoItem ? '#ffe082'
                                                        : item.conferido === item.quantidade ? '#a8ecaa' : '#f3f3f3'
                                                }}>
                                                    <TableCell>{item.localizacao}</TableCell>
                                                    <TableCell>{item.codigo_barras}</TableCell>
                                                    <TableCell>{item.descricao}</TableCell>
                                                    <TableCell align="right">{item.conferido} / {item.quantidade}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                        }
                    </Box>

                    {/* Card de caixas */}
                    <Box sx={{ flex: 1 }}>
                        <Card sx={{ p: 2 }}>
                            <Typography variant="h6">Caixas</Typography>

                            {/* Caixa aberta */}
                            {caixaAberta ? (
                                <>
                                    <Button variant="contained" color="success" fullWidth sx={{ my: 1 }}
                                        onClick={() => {
                                            if (caixaAberta?.numero) {
                                                confirmarFechamento();
                                            } else {
                                                buscarCaixasDisponiveis();
                                                setOpenFecharDialog(true);
                                            }
                                        }}>
                                        Fechar Caixa
                                    </Button>
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        <Button
                                            size="small"
                                            variant="outlined"
                                            onClick={() => setOpenDialog(true)}
                                        >
                                            Ver itens
                                        </Button>
                                    </Box>

                                    {/* Modal de itens da caixa aberta */}
                                    <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="sm">
                                        <DialogTitle>Itens na caixa aberta</DialogTitle>
                                        <DialogContent>
                                            {itens.filter(i => i.caixa === caixaAberta.id).length === 0 ? (
                                                <Typography>Nenhum item conferido ainda</Typography>
                                            ) : (
                                                <Table size="small">
                                                    <TableBody>
                                                        {itens
                                                            .filter(i => i.caixa === caixaAberta.id)
                                                            .map((item, i) => (
                                                                <TableRow key={i}>
                                                                    <TableCell>{item.localizacao}</TableCell>
                                                                    <TableCell>{item.descricao}</TableCell>
                                                                    <TableCell align="right">{item.conferido}</TableCell>
                                                                </TableRow>
                                                            ))}
                                                    </TableBody>
                                                </Table>
                                            )}
                                        </DialogContent>
                                        <DialogActions>
                                            <Button onClick={() => setOpenDialog(false)}>Fechar</Button>
                                        </DialogActions>
                                    </Dialog>
                                </>
                            ) : (
                                <Button variant="contained" color="primary" fullWidth sx={{ my: 1 }} onClick={abrirCaixa}>
                                    Abrir Nova Caixa
                                </Button>
                            )}

                            {/* Caixas fechadas */}
                            <Typography sx={{ mt: 2 }}>Caixas Fechadas:</Typography>
                            {caixas.length === 0 ? (
                                <Typography>Nenhuma caixa fechada ainda</Typography>
                            ) : (
                                caixas.map((c, i) => (
                                    <Box key={c.id} sx={{ mb: 1, p: 1, border: '1px solid #ccc', borderRadius: 1 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Typography><strong>Caixa: {c.numero}</strong></Typography>
                                            <Button size="small" variant="outlined" onClick={() => setCaixaFechadaDialog(c)}>
                                                Ver itens
                                            </Button>
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                onClick={() => reabrirCaixa(c)}
                                            >
                                                Reabrir
                                            </Button>
                                        </Box>
                                    </Box>
                                ))
                            )}

                            {/* Modal para ver itens da caixa fechada */}
                            <Dialog open={!!caixaFechadaDialog} onClose={() => setCaixaFechadaDialog(null)} fullWidth maxWidth="sm">
                                <DialogTitle>
                                    Itens na caixa {caixaFechadaDialog?.numero || ""}
                                </DialogTitle>

                                <DialogContent>
                                    {caixaFechadaDialog &&
                                        itens.filter(i => i.caixa === caixaFechadaDialog.id).length > 0 ? (

                                        <Table size="small">
                                            <TableBody>
                                                {itens
                                                    .filter(i => i.caixa === caixaFechadaDialog.id)
                                                    .map((item, i) => (
                                                        <TableRow key={i}>
                                                            <TableCell>{item.localizacao}</TableCell>
                                                            <TableCell>{item.descricao}</TableCell>
                                                            <TableCell align="right">{item.conferido}</TableCell>
                                                        </TableRow>
                                                    ))}
                                            </TableBody>
                                        </Table>
                                    ) : (
                                        <Typography>Nenhum item conferido nesta caixa</Typography>
                                    )}
                                </DialogContent>

                                <DialogActions>
                                    <Button onClick={() => setCaixaFechadaDialog(null)}>Fechar</Button>
                                </DialogActions>
                            </Dialog>

                            {/* Modal para nomear caixa*/}
                            <Dialog open={openFecharDialog} onClose={() => setOpenFecharDialog(false)}>
                                <DialogTitle>Informar Caixa</DialogTitle>
                                <DialogContent>
                                    <TextField
                                        label="Identificação da Caixa"
                                        fullWidth
                                        value={numeroCaixa}
                                        onChange={(e) => setNumeroCaixa(e.target.value)}
                                        autoFocus
                                    />
                                </DialogContent>
                                <DialogActions>
                                    <Button onClick={() => setOpenFecharDialog(false)}>Cancelar</Button>
                                    <Button
                                        variant="contained"
                                        onClick={() => confirmarFechamento()}
                                    >
                                        Confirmar
                                    </Button>
                                </DialogActions>
                            </Dialog>
                        </Card>
                    </Box>
                </Box>
            </Box>

            {/* Snackbar */}
            <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
                <Alert variant="filled" severity={snackbar.severity}>{snackbar.message}</Alert>
            </Snackbar>
        </Container>
    );
}

export default Conferencia;