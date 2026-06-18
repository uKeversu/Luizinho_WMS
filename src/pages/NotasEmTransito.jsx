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
import SearchIcon from "@mui/icons-material/Search";

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
    const [motivoPendente, setMotivoPendente] = useState("");
    const [aguardandoCracha, setAguardandoCracha] = useState(false);
    const [tipoConfirmacao, setTipoConfirmacao] = useState("");

    const buscaRef = useRef(null);
    const codigoFuncionarioRef = useRef(null);
    const crachaValido = /^\d{7}$/.test(codigoFuncionario);

    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success"
    });

    useEffect(() => {
        if (token) {
            buscarNotas();
        }
    }, [token]);

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
        setMotivoPendente("");
        setCodigoFuncionario("");
        setAguardandoCracha(false);
        setModalPendente(true);
    };

    const selecionarAcao = (tipo) => {

        setTipoConfirmacao(tipo);

        if (tipo === "RECEBIMENTO_COMPLETO") {
            setMotivoPendente("");
        } else {
            setMotivoPendente(tipo);
        }

        setAguardandoCracha(true);

        setTimeout(() => {
            codigoFuncionarioRef.current?.focus();
        }, 100);
    };

    const selecionarMotivo = (motivo) => {
        setMotivoPendente(motivo);
        setAguardandoCracha(true);

        setTimeout(() => {
            codigoFuncionarioRef.current?.focus();
        }, 100);
    };

    const obterItensDetalhados = (xml) => {
        try {
            const xmlDoc = new DOMParser().parseFromString(
                xml,
                "text/xml"
            );

            const itens = xmlDoc.getElementsByTagName("det");

            return Array.from(itens).map((item) => ({
                descricao:
                    item.getElementsByTagName("xProd")[0]
                        ?.textContent || "Sem descrição",

                quantidade:
                    item.getElementsByTagName("qCom")[0]
                        ?.textContent || "0",

                unidade:
                    item.getElementsByTagName("uCom")[0]
                        ?.textContent || ""
            }));

        } catch {
            return [];
        }
    };

    const marcarComoPendente = async (
        nota,
        codigoFuncionario,
        motivo = ""
    ) => {

        try {

            setLoadingIds(prev => [...prev, nota.id]);

            const recebimentoCompleto =
                tipoConfirmacao === "RECEBIMENTO_COMPLETO";

            let observacao = "";

            if (!recebimentoCompleto) {

                const motivos = {
                    FALTA_VOLUME: "Recebimento com falta de volume",
                    FALTA_ITEM: "Recebimento com falta de item",
                    FALTA_VOLUME_E_ITEM: "Recebimento com falta de volume e item",
                    AVARIA: "Recebimento com avaria"
                };

                observacao =
                    `${motivos[motivo]} | ` +
                    `Volumes NF: ${obterVolume(nota.xml)} | ` +
                    `Itens NF: ${obterQuantidadeTotalItens(nota.xml)}`;
            }

            const response = await fetch(
                `${API}/api/nfe/atualizar_por_nfe/${nota.serie}/${nota.numero}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "X-Auth-Token": token
                    },
                    body: JSON.stringify({
                        status: "PENDENTE",
                        observacao
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data?.erro || "Erro ao atualizar nota"
                );
            }

            if (recebimentoCompleto) {

                await registrarLog({
                    nota,
                    acao: "Recebimento confirmado",
                    usuario: codigoFuncionario,
                    observacao: "Novo Status: PENDENTE"
                });

            } else {

                await registrarLog({
                    nota,
                    acao: "Recebimento com divergência",
                    usuario: codigoFuncionario,
                    observacao: `${observacao} | Novo Status: PENDENTE`
                });
            }

            setNotas(prev =>
                prev.filter(n => n.id !== nota.id)
            );

            setSnackbar({
                open: true,
                message: recebimentoCompleto
                    ? `NF ${nota.numero} recebida com sucesso`
                    : `NF ${nota.numero} marcada com observação`,
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
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                buscarNotas();
                            }
                        }}
                    />

                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<SearchIcon />}
                        onClick={buscarNotas}
                        sx={{minWidth: '15vh'}}
                    >
                        Buscar
                    </Button>

                    <Button
                        variant="outlined"
                        color="primary"
                        startIcon={<ClearIcon />}
                        onClick={limparBusca}
                        sx={{minWidth: '15vh'}}
                    >
                        Limpar
                    </Button>

                    <Button
                        variant="outlined"
                        color="primary"
                        startIcon={<RefreshIcon />}
                        onClick={atualizarTela}
                        sx={{minWidth: '15vh'}}
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
                                        <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
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
                    maxWidth="md"
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
                        Confirmação de Recebimento
                    </DialogTitle>

                    <DialogContent>

                        {notaSelecionada && (

                            <Box>

                                <Typography
                                    variant="h5"
                                    align="center"
                                    fontWeight="bold"
                                    mb={2}
                                >
                                    NF {notaSelecionada.numero}
                                </Typography>

                                <Box
                                    sx={{
                                        display: "flex",
                                        gap: 3,
                                        mt: 2
                                    }}
                                >
                                    {/* Lado esquerdo */}
                                    <Box sx={{ flex: 1 }}>
                                        <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-around' }}>
                                            <Typography
                                                variant="h5"
                                                align="center"
                                            >
                                                📦 {obterVolume(notaSelecionada.xml)} Volumes
                                            </Typography>

                                            <Typography
                                                variant="h5"
                                                align="center"
                                                mb={3}
                                            >
                                                📋 {obterQuantidadeTotalItens(
                                                    notaSelecionada.xml
                                                )} Itens
                                            </Typography>
                                        </Box>
                                        {!aguardandoCracha ? (
                                            <Grid container spacing={2}>
                                                <Grid size={12}>
                                                    <Button
                                                        fullWidth
                                                        color="success"
                                                        variant="contained"
                                                        size="large"
                                                        sx={{
                                                            height: 70,
                                                            fontSize: "1.1rem",
                                                            fontWeight: "bold"
                                                        }}
                                                        onClick={() =>
                                                            selecionarAcao(
                                                                "RECEBIMENTO_COMPLETO"
                                                            )
                                                        }
                                                    >
                                                        ✅ Recebimento Completo
                                                    </Button>
                                                </Grid>

                                                <Grid size={12}>
                                                    <Button
                                                        fullWidth
                                                        size="large"
                                                        variant="contained"
                                                        onClick={() =>
                                                            selecionarMotivo("FALTA_VOLUME")
                                                        }
                                                    >
                                                        📦 Falta Volume
                                                    </Button>
                                                </Grid>

                                                <Grid size={12}>
                                                    <Button
                                                        fullWidth
                                                        size="large"
                                                        variant="contained"
                                                        onClick={() =>
                                                            selecionarMotivo("FALTA_ITEM")
                                                        }
                                                    >
                                                        📋 Falta Item
                                                    </Button>
                                                </Grid>

                                                <Grid size={12}>
                                                    <Button
                                                        fullWidth
                                                        size="large"
                                                        variant="contained"
                                                        onClick={() =>
                                                            selecionarMotivo("FALTA_VOLUME_E_ITEM")
                                                        }
                                                    >
                                                        📦📋 Falta Volume e Item
                                                    </Button>
                                                </Grid>

                                                <Grid size={12}>
                                                    <Button
                                                        fullWidth
                                                        size="large"
                                                        variant="contained"
                                                        onClick={() =>
                                                            selecionarMotivo("AVARIA")
                                                        }
                                                    >
                                                        ❌ Avaria
                                                    </Button>
                                                </Grid>
                                            </Grid>
                                        ) : (
                                            <Box>
                                                <Typography
                                                    align="center"
                                                    variant="h6"
                                                    mb={2}
                                                >
                                                    Informe seu código de funcionário
                                                </Typography>

                                                <TextField
                                                    inputRef={codigoFuncionarioRef}
                                                    fullWidth
                                                    autoFocus
                                                    value={codigoFuncionario}
                                                    onChange={(e) => {
                                                        const valor = e.target.value.replace(/\D/g, "");
                                                        setCodigoFuncionario(valor.slice(0, 7));
                                                    }}
                                                    onKeyDown={(e) => {
                                                        if (
                                                            e.key === "Enter" &&
                                                            /^\d{7}$/.test(codigoFuncionario)
                                                        ) {
                                                            marcarComoPendente(
                                                                notaSelecionada,
                                                                codigoFuncionario,
                                                                motivoPendente
                                                            );
                                                        }
                                                    }}
                                                />
                                                <Box mt={2}>
                                                    <Button
                                                        fullWidth
                                                        variant="contained"
                                                        color="success"
                                                        disabled={!crachaValido}
                                                        onClick={() =>
                                                            marcarComoPendente(
                                                                notaSelecionada,
                                                                codigoFuncionario,
                                                                motivoPendente
                                                            )
                                                        }
                                                    >
                                                        Confirmar Recebimento
                                                    </Button>
                                                </Box>
                                            </Box>
                                        )}

                                    </Box>

                                    {/* Lado direito */}
                                    <Box
                                        sx={{
                                            width: 450,
                                            maxHeight: 400,
                                            overflowY: "auto",
                                            border: "1px solid",
                                            borderColor: "divider",
                                            borderRadius: 2,
                                            p: 2
                                        }}
                                    >
                                        <Typography
                                            variant="h6"
                                            fontWeight="bold"
                                            mb={2}
                                        >
                                            Itens da Nota
                                        </Typography>

                                        {obterItensDetalhados(notaSelecionada.xml).map(
                                            (item, index) => (
                                                <Box
                                                    key={index}
                                                    sx={{
                                                        mb: 1,
                                                        pb: 1,
                                                        borderBottom: "1px solid",
                                                        borderColor: "divider"
                                                    }}
                                                >
                                                    <Typography
                                                        variant="body2"
                                                        fontWeight={600}
                                                    >
                                                        {item.descricao}
                                                    </Typography>

                                                    <Typography
                                                        variant="caption"
                                                        color="text.secondary"
                                                    >
                                                        Quantidade: {item.quantidade} {item.unidade}
                                                    </Typography>
                                                </Box>
                                            )
                                        )}
                                    </Box>
                                </Box>
                            </Box>
                        )}
                    </DialogContent>
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