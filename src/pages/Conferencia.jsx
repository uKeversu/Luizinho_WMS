import { useState, useEffect, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
    Container, Typography, Card, Box, TextField, Button,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogActions,
    CircularProgress
} from "@mui/material";

import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import LoginFuncionario from "../components/LoginFuncionario";

import { ThemeContext } from "../context/ThemeContext";
import '../style/App.css';

function Conferencia() {

    // Tema noturno
    const { dark, toggleTheme } = useContext(ThemeContext);

    // Acessar outras pages        
    const navigate = useNavigate();

    // API BASE
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
    const [ultimoItem, setUltimoItem] = useState(null);
    const [loadingCaixas, setLoadingCaixas] = useState(false);
    const [caixasDisponiveis, setCaixasDisponiveis] = useState([]);
    const [observacao, setObservacao] = useState("");
    const [finalizando, setFinalizando] = useState(false);
    const [notaInfo, setNotaInfo] = useState(null);
    const location = useLocation();
    const notas = location.state?.notas || [];
    const modo = notas.some(n => n.status === "FORNECEDOR_DIRETO") ? "MULTIPLO" : "UNICO";

    // Caixa aberta e fechadas
    const [caixaAberta, setCaixaAberta] = useState(null);
    const [caixas, setCaixas] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [caixaFechadaDialog, setCaixaFechadaDialog] = useState(null);
    const [openFecharDialog, setOpenFecharDialog] = useState(false);
    const [numeroCaixa, setNumeroCaixa] = useState("");

    useEffect(() => {
        if (notas.length > 0) {
            carregarTudo();
        }
    }, [notas]);

    const carregarTudo = async () => {
        try {
            setLoading(true);

            // Busca notas
            const res = await fetch(`${API}/api/notas/listar`);
            const data = await res.json();

            const selecionadas = data.filter(n => notas.includes(n.id));
            setNotaInfo(selecionadas);

            // Busca itens usando as notas carregadas
            let todosItens = [];

            for (const n of notas) {
                const notaId = typeof n === "object" ? n.id : n;

                const response = await fetch(`${API}/api/itens_nfe/${notaId}`);
                const dataItens = await response.json();

                if (response.ok) {
                    const notaAtual = selecionadas.find(n => n.id === notaId);

                    const itensFormatados = (dataItens.items || []).map(item => ({
                        descricao: item.descricao || "Item sem identificação",
                        codigo_barras: item.cean || "",
                        codigo_produto: item.cod_produto || "",
                        quantidade: Number(item.quantidade_comercial) || 0,
                        localizacao: item.loc_sistema || "Sem localização",
                        conferido: 0,
                        caixa: null,
                        notaId: notaId,
                        notaNumero: notaAtual?.numero || "-",
                        notaSerie: notaAtual?.serie || "-"
                    }));

                    todosItens = [...todosItens, ...itensFormatados];
                }
            }

            setItens(todosItens);

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const buscarNota = async () => {
        const res = await fetch(`${API}/api/notas/listar`);
        const data = await res.json();

        const selecionadas = data.filter(n => notas.includes(n.id));
        setNotaInfo(selecionadas);
    };

    const buscarItens = async () => {
        try {
            setLoading(true);

            let todosItens = [];

            for (const n of notas) {
                const notaId = typeof n === "object" ? n.id : n;

                const response = await fetch(`${API}/api/itens_nfe/${notaId}`);
                const data = await response.json();

                console.log("BUSCANDO ITENS:", data.items);

                if (response.ok) {
                    const notaAtual = notaInfo?.find(n => n.id === notaId);

                    const itensFormatados = (data.items || []).map(item => ({
                        descricao: item.descricao || "Item sem identificação",
                        codigo_barras: item.cean || "",
                        codigo_produto: item.cod_produto || "",
                        quantidade: Number(item.quantidade_comercial) || 0,
                        localizacao: item.loc_sistema || "Sem localização",
                        conferido: 0,
                        caixa: null,
                        notaId: notaId,
                        notaNumero: notaAtual?.numero || "-",
                        notaSerie: notaAtual?.serie || "-"
                    }));

                    todosItens = [...todosItens, ...itensFormatados];
                }
            }

            setItens(todosItens);

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
                message: "Informe o nome da caixa",
                severity: "warning"
            });
            return;
        }

        const caixaFinal = {
            ...caixaAberta,
            numero: caixaAberta.numero || numeroCaixa,
            jaImprimiu: caixaAberta.jaImprimiu || false
        };

        setCaixas(prev => [...prev, caixaFinal]);

        if (!caixaFinal.jaImprimiu) {
            imprimirEtiquetaCaixa(caixaFinal);

            caixaFinal.jaImprimiu = true;
        }

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

        if (!codigoLimpo) return;

        if (!caixaAberta) {
            setSnackbar({
                open: true,
                message: "Abra uma caixa antes de conferir itens",
                severity: "warning"
            });
            setCodigo("");
            return;
        }

        const index = itens.findIndex(item => {
            const codigoBarrasValido =
                item.codigo_barras &&
                item.codigo_barras !== "SEM GTIN";

            return (
                (codigoBarrasValido && item.codigo_barras === codigoLimpo) ||
                item.codigo_produto === codigoLimpo
            );
        });

        if (index === -1) {
            setUltimoItem(codigoLimpo);
            setSnackbar({
                open: true,
                message: `Produto não encontrado: ${codigoLimpo}`,
                severity: "warning"
            });
            setCodigo("");
            return;
        }

        const novosItens = [...itens];
        const item = novosItens[index];

        const codigoExibicao =
            item.codigo_barras && item.codigo_barras !== "SEM GTIN"
                ? item.codigo_barras
                : item.codigo_produto;

        setUltimoItem(codigoExibicao);

        if (item.conferido >= item.quantidade) {
            setSnackbar({
                open: true,
                message: "Quantidade total já conferida",
                severity: "info"
            });
            setCodigo("");
            return;
        }

        if (item.caixa && item.caixa !== caixaAberta.id) {
            setSnackbar({
                open: true,
                message: "Item já pertence a outra caixa",
                severity: "warning"
            });
            return;
        }

        item.conferido += 1;
        item.caixa = caixaAberta.id;

        // Chama função que imprime a etiqueta da peça
        imprimirEtiqueta(item);

        novosItens.splice(index, 1);
        novosItens.unshift(item);

        setItens(novosItens);

        setCaixaAberta(prev => ({
            ...prev,
            itens: novosItens.filter(i => i.caixa === prev.id)
        }));

        setCodigo("");
    };

    // Impressão de etiquetas de peça
    const gerarZPL = (unidade, qr) => `
^XA
^PW520
^LL192
^LH0,0

^PR3
^MD15

^FO3,3
^BQN,2,6
^FDLA,${qr.qr_url}^FS

^FO230,10
^A0N,40,45
^FD${unidade.basico}^FS

^FO230,60
^A0N,45,50
^FD${unidade.loc_sistema}^FS

^FO230,115
^A0N,30,30
^FD${unidade.numero}/${unidade.serie}^FS

^FO230,150
^A0N,25,25
^FD${new Date().toLocaleString("pt-BR")}^FS

^FO184,30
^A0B,30,40
^FD${unidade.id_unico}^FS

^FO460,30
^A0B,50,40
^FD${(userInfo?.codigo || "")}^FS

^XZ

`;

    const imprimirViaPython = async (zpl) => {
        try {
            const response = await fetch("http://192.168.1.82:5000/print", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    tipo: "windows",
                    conteudo: zpl,
                    printer: "ZDesigner GC420t"
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.erro || "Erro ao imprimir");
            }

        } catch (error) {
            console.error("Erro impressão Python:", error);
            setSnackbar({
                    open: true,
                    message: "Falha na impressão, ative o WMS Print!",
                    severity: "error"
                });
        }
    };

    const imprimirEtiqueta = async (item) => {
        try {
            const codigo =
                item.codigo_barras && item.codigo_barras !== "SEM GTIN"
                    ? item.codigo_barras
                    : item.codigo_produto;

            const res = await fetch(`${API}/api/nfe/unidades/nao_impressas/codire/${codigo}`);
            const data = await res.json();

            if (!data.unidades || data.unidades.length === 0) {
                setSnackbar({
                    open: true,
                    message: "Nenhuma etiqueta disponível",
                    severity: "warning"
                });
                return;
            }

            // AQUI ENTRA A FILA LOCAL
            const chaveFila = `fila_${codigo}`;

            let fila = JSON.parse(localStorage.getItem(chaveFila) || "[]");

            // Se não tiver fila salva, inicializa com API
            if (fila.length === 0) {
                fila = data.unidades;
            }

            // Pega só 1 unidade
            const unidade = fila.shift();

            // Atualiza fila no storage
            localStorage.setItem(chaveFila, JSON.stringify(fila));

            // Se não tiver mais nada pra imprimir
            if (!unidade) {
                setSnackbar({
                    open: true,
                    message: "Fila de impressão finalizada",
                    severity: "info"
                });
                return;
            }

            const resQr = await fetch(`${API}/api/nfe/unidade/imprimir/${unidade.id_unico}`);
            const qr = await resQr.json();

            if (!qr.qr_url) return;

            const zpl = gerarZPL(unidade, qr);

            await imprimirViaPython(zpl);

        } catch (error) {
            console.error(error);
            setSnackbar({
                open: true,
                message: "Erro ao imprimir etiqueta",
                severity: "error"
            });
        }
    };

    // Impressão etiquetas de caixa
    const gerarZPLCaixa = (caixa) => {
        const codigoCaixa = caixa.numero;
        const dataAtual = new Date().toLocaleDateString("pt-BR");

        return `
^XA
^PW400
^LL200
^LH0,0

^PR3
^MD15

^FO1,1
^BQN,2,8
^FDLA,${codigoCaixa}^FS

^FO210,10
^A0N,60,60
^FDCaixa^FS

^FO210,60
^A0N,60,60
^FD${codigoCaixa}^FS

^FO210,120
^A0N,30,30
^FD${dataAtual}^FS

^FO210,150
^A0N,30,30
^FD${userInfo?.codigo || ""}^FS

^XZ
`;
    };

    // Imprime etiqueta chamando API
    const imprimirEtiquetaCaixa = async (caixa) => {
        try {
            const zpl = gerarZPLCaixa(caixa);

            await imprimirViaPython(zpl);

        } catch (error) {
            console.error("Erro ao imprimir caixa:", error);

            setSnackbar({
                open: true,
                message: "Erro ao imprimir etiqueta da caixa",
                severity: "error"
            });
        }
    };

    // Finalizar conferência
    const finalizarConferencia = async () => {
        try {
            if (!notaInfo || notaInfo.length === 0) {
                setSnackbar({
                    open: true,
                    message: "Notas não carregadas",
                    severity: "warning"
                });
                return;
            }

            const localizacaoFinal = caixas.map(c => c.numero).join(", ");

            if (!localizacaoFinal) {
                setSnackbar({
                    open: true,
                    message: "Nenhuma caixa informada",
                    severity: "warning"
                });
                return;
            }

            if (itensPendentes && !observacao.trim()) {
                setSnackbar({
                    open: true,
                    message: "É obrigatório informar uma observação ao finalizar com itens pendentes",
                    severity: "warning"
                });
                return;
            }

            setFinalizando(true);

            const itensSemCaixa = itens.filter(i => i.conferido > 0 && !i.caixa);

            if (itensSemCaixa.length > 0) {
                setSnackbar({
                    open: true,
                    message: "Existem itens conferidos sem caixa",
                    severity: "warning"
                });
                return;
            }

            for (const item of itens) {

                const itemCompleto = item.conferido === item.quantidade;
                const itemEmCaixa = !!item.caixa;

                if (itemCompleto && itemEmCaixa) {

                    console.log("TOKEN:", token);
                    console.log("ENVIANDO ITEM:", {
                        notaId: item.notaId,
                        codigo: item.codigo_barras,
                        status_item: "ITEM_CONFERIDO",
                        itemCompleto: item
                    });

                    try {
                        const response = await fetch(
                            `${API}/api/nfe/item/${item.notaId}/${item.codigo_barras}`,
                            {
                                method: "PUT",
                                headers: {
                                    "Content-Type": "application/json",
                                    "Authorization": `Bearer ${token}`
                                },
                                body: JSON.stringify({
                                    status_item: "ITEM_CONFERIDO",
                                    caixa: caixas.find(c => c.id === item.caixa)?.numero || null
                                })
                            }
                        );

                        if (response.status === 401) {
                            logout();
                            setSnackbar({
                                open: true,
                                message: "Sessão expirada, faça login novamente!",
                                severity: "error"
                            });
                            return;
                        }

                        const text = await response.text();

                        if (!response.ok) {
                            throw new Error(`Erro item ${item.codigo_barras}: ${text}`);
                        }

                    } catch (error) {
                        console.error(error);

                        setSnackbar({
                            open: true,
                            message: `Erro ao enviar item ${codigo}`,
                            severity: "error"
                        });

                        return;
                    }
                }
            }

            for (const nota of notaInfo) {
                const response = await fetch(
                    `${API}/api/nfe/atualizar_por_nfe/${nota.serie}/${nota.numero}`,
                    {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            status: "CONFERIDA",
                            localizacao: localizacaoFinal,
                            observacao: observacao || null
                        })
                    }
                );

                const text = await response.text();

                if (!response.ok) {
                    throw new Error(text || "Erro ao finalizar");
                }
            }

            setSnackbar({
                open: true,
                message: "Conferência finalizada com sucesso!",
                severity: "success"
            });

            navigate("/Dashboard");

        } catch (error) {
            console.error(error);
            setSnackbar({
                open: true,
                message: "Erro ao finalizar conferência",
                severity: "error"
            });
        } finally {
            setFinalizando(false);
        }
    };

    const itensPendentes = itens.some(i => i.conferido < i.quantidade);

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
                    bgcolor: 'primary.main'
                }}
            >
                <Typography variant="h4" sx={{ color: "background.paper" }}>
                    <strong>
                        {modo === "MULTIPLO"
                            ? "Conferência - Múltiplas Notas)"
                            : "Conferência"}
                    </strong>
                </Typography>
                <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'right', mr: '0' }}>
                        {<PersonIcon sx={{ color: "background.paper", paddingRight: '1vh' }} />}
                        <Typography sx={{ color: "background.paper", fontSize: '0.9rem', display: 'flex', alignItems: 'center' }}>{userInfo?.nome}</Typography>
                        {token && (
                            <Button size="small" onClick={logout} sx={{ color: "background.paper", display: 'flex', gap: 1 }}>{<LogoutIcon />}</Button>
                        )}
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'right', mr: '2vh' }}>
                        <Button onClick={() => navigate("/Dashboard")} sx={{ color: "background.paper", display: 'flex', gap: 1 }}>Voltar {< ArrowBackIcon />}</Button>
                    </Box>
                </Box>
            </Box>

            {/* Informações da nota e scanner */}
            <Box sx={{ mt: 3 }}>
                {modo === "MULTIPLO" ? (
                    <Box>
                        {notaInfo?.map((n, i) => (
                            <Typography key={i} variant="h6">
                                NF: {n.numero} | Fornecedor: {n.fornecedor}
                            </Typography>
                        ))}
                    </Box>
                ) : (
                    <Box>
                        <Typography variant="h6">
                            Nota: {notaInfo?.[0]?.numero}
                        </Typography>
                        <Typography variant="h6">
                            Fornecedor: {notaInfo?.[0]?.fornecedor}
                        </Typography>
                    </Box>
                )}
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
                        mb: 2, width: '100%', bgcolor: 'background.card',
                        '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                                borderColor: 'var(--azul)',
                            },
                            '&.Mui-focused fieldset': {
                                borderColor: 'var(--azul)',
                            }
                        }
                    }}
                />

                {/* Tabela de conferência + caixas*/}
                <Box sx={{ display: 'flex', gap: 2 }}>
                    {/* Tabela de itens */}
                    <Box sx={{ flex: 2 }}>
                        {loading ?
                            <Box textAlign="center">
                                <CircularProgress />
                            </Box> :
                            itens.length === 0 ? <Typography>Nenhum item</Typography> :
                                <TableContainer component={Paper} sx={{ boxShadow: '0vh 0.1vh 0.5vh var(--sombra)', color: 'background.alerta' }}>
                                    <Table>
                                        <TableHead>
                                            <TableRow sx={{ bgcolor: 'var(--azul)' }}>
                                                <TableCell sx={{ color: 'background.paper' }}>Localização</TableCell>
                                                <TableCell sx={{ color: 'background.paper' }}>Código de Barras</TableCell>
                                                <TableCell sx={{ color: 'background.paper' }}>Descrição</TableCell>
                                                <TableCell sx={{ color: 'background.paper' }} align="right">Qtd (Conf./Nota)</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {itens.map((item, index) => (
                                                <TableRow key={index} sx={{
                                                    bgcolor: item.conferido === item.quantidade ? 'primary.conferido' : 'background.alerta'
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
                        <Card sx={{ p: 2, boxShadow: '0vh 0.1vh 0.5vh var(--sombra)', bgcolor: 'background.alerta' }}>
                            <Typography variant="h6">Caixas</Typography>

                            {/* Caixa aberta */}
                            {caixaAberta ? (
                                <>
                                    <Button variant="contained" fullWidth sx={{ my: 1, color: "primary.branco", bgcolor: 'primary.confirmar', '&:hover': { bgcolor: 'primary.confirmarHover' } }}
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
                                            variant="contained"
                                            onClick={() => setOpenDialog(true)}
                                        >
                                            Ver itens
                                        </Button>
                                    </Box>

                                    {/* Modal de itens da caixa aberta */}
                                    <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="sm"
                                        slotProps={{
                                            paper: {
                                                sx: {
                                                    bgcolor: "background.card",
                                                    color: "text.primary",
                                                }
                                            }
                                        }}>
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
                                    <Box key={c.id} sx={{ mb: 1, p: 1, border: '1px solid var(--fundo-card-caixa)', borderRadius: 1 }}>
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
                            <Dialog open={!!caixaFechadaDialog} onClose={() => setCaixaFechadaDialog(null)} fullWidth maxWidth="sm"
                                slotProps={{
                                    paper: {
                                        sx: {
                                            bgcolor: "background.card",
                                            color: "text.primary",
                                        }
                                    }
                                }}>
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
                            <Dialog open={openFecharDialog} onClose={() => setOpenFecharDialog(false)}
                                slotProps={{
                                    paper: {
                                        sx: {
                                            bgcolor: "background.card",
                                            color: "text.primary",
                                        }
                                    }
                                }}>
                                <DialogTitle>Informar Caixa</DialogTitle>
                                <DialogContent>
                                    <TextField
                                        label="Identificação da Caixa"
                                        fullWidth
                                        value={numeroCaixa}
                                        onChange={(e) => setNumeroCaixa(e.target.value)}
                                        autoFocus
                                        sx={{
                                            mt: 1,
                                            '& .MuiOutlinedInput-root': {
                                                '&:hover fieldset': {
                                                    borderColor: 'primary.main',
                                                },
                                                '&.Mui-focused fieldset': {
                                                    borderColor: 'primary.main',
                                                }
                                            }
                                        }}
                                    />
                                </DialogContent>
                                <DialogActions>
                                    <Button
                                        sx={{
                                            color: "primary.branco",
                                            bgcolor: 'primary.cancelar',
                                            '&:hover': { bgcolor: 'primary.cancelarHover' }
                                        }}
                                        onClick={() => setOpenFecharDialog(false)}
                                    >Cancelar</Button>
                                    <Button
                                        sx={{
                                            color: "primary.branco",
                                            bgcolor: 'primary.confirmar',
                                            '&:hover': { bgcolor: 'primary.confirmarHover' }
                                        }}
                                        onClick={() => confirmarFechamento()}
                                    >
                                        Confirmar
                                    </Button>
                                </DialogActions>
                            </Dialog>
                        </Card>
                        <Card sx={{ p: 2, mt: 2, boxShadow: '0vh 0.1vh 0.5vh var(--sombra)', bgcolor: 'background.alerta' }}>
                            <Typography variant="h6">Observações</Typography>

                            <TextField
                                label="Descrição"
                                multiline
                                rows={3}
                                fullWidth
                                value={observacao}
                                onChange={(e) => setObservacao(e.target.value)}
                                sx={{
                                    my: 2,
                                    '& .MuiOutlinedInput-root': {
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
                                sx={{ color: "primary.branco", bgcolor: 'primary.confirmar', '&:hover': { bgcolor: 'primary.confirmarHover' } }}
                                fullWidth
                                onClick={finalizarConferencia}
                            >
                                {finalizando ? "Finalizando..." : "Finalizar Conferência"}
                            </Button>
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