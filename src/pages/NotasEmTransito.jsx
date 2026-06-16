import { useState, useEffect, useRef } from "react";
import {
    Container,
    Typography,
    Card,
    CardContent,
    Grid,
    Button,
    Box,
    CircularProgress,
    Snackbar,
    Alert,
    Backdrop,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from "@mui/material";

import RefreshIcon from "@mui/icons-material/Refresh";
import ClearIcon from "@mui/icons-material/Clear";

import LoginFuncionario from "../components/LoginFuncionario";

function NotasEmTransito() {

    const API = "http://192.168.1.185:8077";

    const [token, setToken] = useState(
        () => localStorage.getItem("nfe_token") || ""
    );

    const [userInfo, setUserInfo] = useState(() => {
        const user = localStorage.getItem("user_info");
        return user ? JSON.parse(user) : null;
    });

    const [notas, setNotas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingIds, setLoadingIds] = useState([]);
    const [busca, setBusca] = useState("");
    const [modalPendente, setModalPendente] = useState(false);
    const [notaSelecionada, setNotaSelecionada] = useState(null);
    const [codigoFuncionario, setCodigoFuncionario] = useState("");

    const buscaRef = useRef(null);
    const codigoFuncionarioRef = useRef(null);

    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success"
    });

    useEffect(() => {
        if (token) {
            buscarNotas();
        }
    }, [token, busca]);

    // Foca no input
    useEffect(() => {
        if (token) {
            setTimeout(() => {
                buscaRef.current?.focus();
            }, 100);
        }
    }, [token]);

    useEffect(() => {
        if (modalPendente) {
            setTimeout(() => {
                codigoFuncionarioRef.current?.focus();
            }, 100);
        }
    }, [modalPendente]);

    const limparBusca = () => {
        setBusca("");
        buscarNotas();

        setTimeout(() => {
            buscaRef.current?.focus();
        }, 100);
    };

    const atualizarTela = () => {
        setBusca("");
        window.location.reload();
    };

    const registrarLog = async ({
        nota,
        acao,
        observacao = null
    }) => {

        try {

            await fetch(
                `${API}/api/nfe/item/movimentacao/log`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-Auth-Token": token
                    },
                    body: JSON.stringify({
                        nota_id: nota.id,
                        usuario: userInfo?.codigo,
                        acao,
                        observacoes: observacao
                    })
                }
            );

        } catch (error) {
            console.error(error);
        }
    };

    const buscarNotas = async () => {
        try {
            setLoading(true);

            const params = new URLSearchParams({
                status,
            });

            if (busca.trim()) {

                const valor = busca.trim();

                if (/^\d{44}$/.test(valor)) {
                    params.append("chave_acesso", valor);

                } else if (/^\d{14}$/.test(valor)) {
                    params.append("cnpj_emitente", valor);

                } else if (/^\d+$/.test(valor)) {
                    params.append("numero", valor);

                } else {
                    params.append("razao_social_emitente", valor);
                }
            }

            const response = await fetch(
                `${API}/api/notas/listar?${params}`,
                {
                    headers: {
                        "X-Auth-Token": token
                    }
                }
            );

            const data = await response.json();

            setNotas(data.data || []);

        } catch (error) {

            console.error(error);

            setSnackbar({
                open: true,
                message: "Erro ao carregar notas",
                severity: "error"
            });

        } finally {
            setLoading(false);
        }
    };

    const obterVolume = (xml) => {
        try {
            const xmlDoc = new DOMParser().parseFromString(
                xml,
                "text/xml"
            );

            const volumes =
                xmlDoc.getElementsByTagName("vol");

            let total = 0;

            for (const vol of volumes) {
                total += Number(
                    vol.getElementsByTagName("qVol")[0]
                        ?.textContent || 0
                );
            }

            return total;
        } catch {
            return 0;
        }
    };

    const obterQuantidadeTotalItens = (xml) => {
        try {

            const xmlDoc = new DOMParser().parseFromString(
                xml,
                "text/xml"
            );

            const itens =
                xmlDoc.getElementsByTagName("det");

            let total = 0;

            for (const item of itens) {

                total += Number(
                    item.getElementsByTagName("qCom")[0]
                        ?.textContent || 0
                );
            }

            return Math.round(total);

        } catch {
            return 0;
        }
    };

    const abrirModalPendente = (nota) => {
        setNotaSelecionada(nota);
        setCodigoFuncionario("");
        setModalPendente(true);
    };

    const marcarComoPendente = async (nota, codigoFuncionario) => {

        try {

            setLoadingIds(prev => [...prev, nota.id]);

            const response = await fetch(
                `${API}/api/nfe/atualizar_por_nfe/${nota.serie}/${nota.numero}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "X-Auth-Token": token
                    },
                    body: JSON.stringify({
                        status: "PENDENTE"
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data?.erro || "Erro ao atualizar nota"
                );
            }

            await registrarLog({
                nota,
                acao: "Alterou status da nota",
                observacao: `Novo status: PENDENTE | Funcionário: ${codigoFuncionario}`
            });

            setNotas(prev =>
                prev.filter(n => n.id !== nota.id)
            );

            setSnackbar({
                open: true,
                message: `NF ${nota.numero} marcada como pendente`,
                severity: "success"
            });

            setModalPendente(false);

        } catch (error) {

            console.error(error);

            setSnackbar({
                open: true,
                message: error.message,
                severity: "error"
            });

        } finally {

            setLoadingIds(prev =>
                prev.filter(id => id !== nota.id)
            );
        }
    };

    return (
        !token ? (
            <LoginFuncionario
                onLogin={(data) => {

                    localStorage.setItem(
                        "nfe_token",
                        data.token
                    );

                    const user = {
                        nome: data.nome,
                        codigo: data.codigo
                    };

                    localStorage.setItem(
                        "user_info",
                        JSON.stringify(user)
                    );

                    setUserInfo(user);
                    setToken(data.token);
                }}
            />
        ) : (
            <Container maxWidth="xl" sx={{ mt: 4 }}>

                <Typography
                    variant="h4"
                    sx={{
                        mb: 3,
                        fontWeight: "bold"
                    }}
                >
                    Notas em Trânsito
                </Typography>

                <Box
                    sx={{
                        display: "flex",
                        gap: 1,
                        mb: 3
                    }}
                >
                    <TextField
                        inputRef={buscaRef}
                        label="Buscar NF, fornecedor, CNPJ ou chave de acesso"
                        variant="outlined"
                        size="small"
                        fullWidth
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                    />

                    <Button
                        variant="outlined"
                        color="primary"
                        startIcon={<ClearIcon />}
                        onClick={limparBusca}
                    >
                        Limpar
                    </Button>

                    <Button
                        variant="contained"
                        startIcon={<RefreshIcon />}
                        onClick={atualizarTela}
                    >
                        Atualizar
                    </Button>
                </Box>

                <Backdrop
                    open={loading}
                    sx={{
                        zIndex: (theme) =>
                            theme.zIndex.drawer + 1
                    }}
                >
                    <CircularProgress color="inherit" />
                </Backdrop>

                {loading ? (
                    <Box textAlign="center">
                        <CircularProgress />
                        <Typography mt={2}>
                            Carregando notas...
                        </Typography>
                    </Box>
                ) : notas.length === 0 ? (
                    <Typography>
                        Nenhuma nota encontrada
                    </Typography>
                ) : (
                    <Grid container spacing={4}>

                        {notas.map((nota, idx) => (

                            <Grid size={{ xs: 12, md: 3 }} key={idx}>
                                <Card
                                    variant="outlined"
                                    sx={{
                                        borderRadius: '16px',
                                        overflow: 'hidden',
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        bgcolor:
                                            nota.status === "FORNECEDOR_DIRETO"
                                                ? 'background.forndireto'
                                                : 'background.inputBg',
                                        boxShadow: '0 3px 10px rgba(0,0,0,0.08)',
                                        transition: '0.2s ease',
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',

                                        '&:hover': {
                                            transform: 'translateY(-2px)',
                                            boxShadow: '0 6px 16px rgba(0,0,0,0.12)',
                                        }
                                    }}
                                >
                                    <CardContent
                                        sx={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            flexGrow: 1,
                                            p: 1.5,
                                            gap: 1
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-around' }}>
                                            <Typography
                                                sx={{
                                                    fontSize: '1rem',
                                                    fontWeight: 700,
                                                    color: 'primary.main',
                                                    lineHeight: 1
                                                }}
                                            >
                                                NF {nota.numero}
                                            </Typography>

                                            <Typography
                                                sx={{
                                                    fontSize: '0.7rem',
                                                    color: 'text.secondary',
                                                    mt: 0.3
                                                }}
                                            >
                                                Série {nota.serie}
                                            </Typography>

                                            <Box
                                                sx={{
                                                    alignSelf: 'flex-start',
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
                                            >
                                                {nota.status}
                                            </Box>
                                        </Box>

                                        <Typography
                                            sx={{
                                                mt: 1,
                                                fontWeight: 600
                                            }}
                                        >
                                            {nota.fornecedor}
                                        </Typography>

                                        <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-around' }}>
                                            <Typography sx={{ mt: 1, fontSize: '0.8rem' }}>
                                                Emissão:
                                                {" "}
                                                {nota.data_emissao}
                                            </Typography>

                                            <Typography sx={{ mt: 1, fontSize: '0.8rem' }}>
                                                Importação:
                                                {" "}
                                                {nota.data_recebimento}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-around' }}>
                                            <Typography>
                                                Volume(s): {obterVolume(nota.xml)}
                                            </Typography>
                                            <Typography>
                                                Itens: {obterQuantidadeTotalItens(nota.xml)}
                                            </Typography>
                                        </Box>
                                        {nota.status === "EM_TRANSITO" && (
                                            <Button
                                                fullWidth
                                                variant="contained"
                                                sx={{
                                                    mt: 2
                                                }}
                                                disabled={
                                                    loadingIds.includes(
                                                        nota.id
                                                    )
                                                }
                                                onClick={() =>
                                                    abrirModalPendente(nota)
                                                }
                                            >
                                                {loadingIds.includes(
                                                    nota.id
                                                )
                                                    ? "Atualizando..."
                                                    : "Marcar como Pendente"}
                                            </Button>
                                        )}
                                    </CardContent>
                                </Card>
                            </Grid>

                        ))}

                    </Grid>
                )}

                <Dialog
                    open={modalPendente}
                    onClose={() => setModalPendente(false)}
                    maxWidth="sm"
                    fullWidth
                    slotProps={{
                        paper: {
                            sx: {
                                bgcolor: "background.card",
                                color: "text.primary",
                            }
                        }
                    }}
                >
                    <DialogTitle>
                        Confirmo que recebi a nota sem volumes faltantes
                    </DialogTitle>

                    <DialogContent>

                        {notaSelecionada && (
                            <Box mt={1}>

                                <Typography>
                                    <strong>NF:</strong> {notaSelecionada.numero}
                                </Typography>

                                <Typography>
                                    <strong>Fornecedor:</strong> {notaSelecionada.fornecedor}
                                </Typography>

                                <Typography>
                                    <strong>Volumes:</strong>{" "}
                                    {obterVolume(notaSelecionada.xml)}
                                </Typography>

                                <Typography>
                                    <strong>Itens:</strong>{" "}
                                    {obterQuantidadeTotalItens(
                                        notaSelecionada.xml
                                    )}
                                </Typography>

                                <TextField
                                    inputRef={codigoFuncionarioRef}
                                    fullWidth
                                    sx={{ mt: 3 }}
                                    label="Código do Funcionário"
                                    value={codigoFuncionario}
                                    onChange={(e) =>
                                        setCodigoFuncionario(e.target.value)
                                    }
                                />

                            </Box>
                        )}

                    </DialogContent>

                    <DialogActions>

                        <Button
                            onClick={() =>
                                setModalPendente(false)
                            }
                        >
                            Cancelar
                        </Button>

                        <Button
                            variant="contained"
                            disabled={!codigoFuncionario.trim()}
                            onClick={() =>
                                marcarComoPendente(
                                    notaSelecionada,
                                    codigoFuncionario
                                )
                            }
                        >
                            Confirmar
                        </Button>

                    </DialogActions>
                </Dialog>

                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={3000}
                    onClose={() =>
                        setSnackbar(prev => ({
                            ...prev,
                            open: false
                        }))
                    }
                >
                    <Alert
                        variant="filled"
                        severity={snackbar.severity}
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
        )
    );
}

export default NotasEmTransito;