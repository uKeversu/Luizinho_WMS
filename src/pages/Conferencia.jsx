import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useParams } from "react-router-dom";
import {
    Container,
    Typography,
    Card,
    CardContent,
    Grid,
    TextField,
    Button,
    Box,
    Snackbar,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper
} from "@mui/material";

import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import SyncIcon from '@mui/icons-material/Sync';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import LoginFuncionario from "../components/LoginFuncionario";

function Conferencia() {

    // Acessar outras pages
    const navigate = useNavigate();

    // API Base
    const API = "http://192.168.1.184:8077";

    // Login
    const [userInfo, setUserInfo] = useState(() => {
        const user = localStorage.getItem("user_info");
        return user ? JSON.parse(user) : null;
    });
    const [token, setToken] = useState(() => localStorage.getItem("nfe_token") || "");

    // Preenche automaticamente campo funcionário
    /*
    useEffect(() => {
        if (userInfo?.codigo) {
            setFuncionario(userInfo.codigo);
        }
    }, [userInfo]);
    */

    const logout = () => {
        setToken("");
        setUserInfo(null);
        localStorage.removeItem("nfe_token");
        localStorage.removeItem("user_info");
    };

    // Conferencia
    const { id } = useParams();
    const [itens, setItens] = useState([]);
    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success"
    });

    // Scanner
    const [codigo, setCodigo] = useState("");

    // Atualiza itens
    useEffect(() => {
        if (id) {
            buscarItens();
            buscarNota();
        }
    }, [id]);

    // Modal retirar peças
    const [openRetirada, setOpenRetirada] = useState(false);
    const [retirada, setRetirada] = useState({
        quantidade: "",
        nf: "",
        funcionario: ""
    });

    // Modal relatar erro
    const [openErro, setOpenErro] = useState(false);
    const [erro, setErro] = useState({
        codigo: "",
        tipo: "",
        descricao: "",
        funcionario: ""
    });

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
                console.error(data.mensagem || 'Produto não encontrado no ERP');
            }
        } catch (err) {
            console.error('Erro na requisição:', err);
        }
    };

    // Busca nota
    const [notaInfo, setNotaInfo] = useState(null);

    const buscarNota = async () => {
        const res = await fetch(`${API}/api/notas/listar`);
        const data = await res.json();

        const encontrada = data.find(n => n.id == id);
        setNotaInfo(encontrada);
    };

    // Busca itens da nota
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
                    caixa: item.caixa || null
                }));

                setItens(formatado);


                setItens(formatado);
            }

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const scanner = () => {
        const codigoLimpo = codigo.trim();

        const index = itens.findIndex(
            item => item.codigo_barras === codigoLimpo
        );

        if (index === -1) {
            setSnackbar({
                open: true,
                message: "Produto não encontrado",
                severity: "warning"
            });
            setCodigo("");
            return;
        }

        const novosItens = [...itens];

        if (novosItens[index].conferido >= novosItens[index].quantidade) {
            setCodigo("");
            return;
        }

        novosItens[index].conferido += 1;
        const itemMovido = novosItens.splice(index, 1)[0];
        // Move item conferido para primeiro da lista
        novosItens.unshift(itemMovido);

        setItens(novosItens);
        setCodigo("");
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
                        <strong>Conferência de mercadorias</strong>
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
                                onClick={() => navigate("/Dashboard")}
                                sx={{ color: '#ffffff', display: 'flex', gap: 1 }}
                            >
                                Voltar
                                {< ArrowBackIcon />}
                            </Button>
                            <pre id="resultado"></pre>
                        </Box>
                    </Box>
                </Box>
                <Box sx={{ mt: 3 }}>
                    <Typography variant="h6">
                        NF: {notaInfo?.numero || id}
                    </Typography>
                    <TextField
                        label="Código de barras"
                        variant="outlined"
                        size="small"
                        value={codigo}
                        onChange={(e) => setCodigo(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") scanner(); }}
                        autoFocus
                        fullWidth
                        sx={{
                            mb: 2,
                            width: '100%',
                            bgcolor: '#f3f3f3',
                            '& .MuiOutlinedInput-root': {
                                '&:hover fieldset': {
                                    borderColor: '#007bff',
                                },
                                '&.Mui-focused fieldset': {
                                    borderColor: '#007bff',
                                }
                            }
                        }}
                    />
                    {loading ? (
                        <Typography>Carregando...</Typography>
                    ) : itens.length === 0 ? (
                        <Typography>Nenhum item</Typography>
                    ) : (
                        <TableContainer component={Paper} sx={{ boxShadow: '0vh 0.1vh 0.5vh #000000' }}>
                            <Table>
                                <TableHead>
                                    <TableRow sx={{ bgcolor: '#007bff' }}>
                                        <TableCell sx={{ color: '#fff' }}><strong>Localização</strong></TableCell>
                                        <TableCell sx={{ color: '#fff' }}><strong>Código de Barras</strong></TableCell>
                                        <TableCell sx={{ color: '#fff' }}><strong>Descrição</strong></TableCell>
                                        <TableCell sx={{ color: '#fff' }} align="right">
                                            <strong>Qtd (Conf./Nota)</strong>
                                        </TableCell>
                                    </TableRow>
                                </TableHead>

                                <TableBody>
                                    {itens.map((item, index) => (
                                        <TableRow
                                            key={index}
                                            sx={{
                                                bgcolor: item.conferido === item.quantidade
                                                    ? '#a8ecaa'
                                                    : '#f3f3f3'
                                            }}
                                        >
                                            <TableCell>{item.localizacao}</TableCell>
                                            <TableCell>{item.codigo_barras}</TableCell>
                                            <TableCell>{item.descricao || item.xProd}</TableCell>
                                            <TableCell align="right">{item.conferido} / {item.quantidade}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </Box>
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

export default Conferencia;