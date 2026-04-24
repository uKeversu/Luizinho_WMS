import { useState, useEffect, useContext } from "react";
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
    Snackbar,
    Alert,
    FormControlLabel,
    Switch,
    DialogTitle,
    Dialog,
    DialogContent,
    DialogActions,
    Backdrop,
    CircularProgress
} from "@mui/material";

import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import SyncIcon from '@mui/icons-material/Sync';
import ArticleIcon from '@mui/icons-material/Article';
import AttachmentIcon from '@mui/icons-material/Attachment';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import WarningIcon from '@mui/icons-material/Warning';
import BorderColorIcon from '@mui/icons-material/BorderColor';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';

import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

import LoginFuncionario from "../components/LoginFuncionario";
import Dashboard from "./Dashboard";

import ModalErro from "../components/ModalErro";
import ModalRetira from "../components/ModalRetira";
import ModalObservacao from "../components/ModalObservacoes";
import ModalConfirmaRecebimento from "../components/ModalConfirmaRecebimento";

import { ThemeContext } from "../context/ThemeContext";
import '../style/App.css';

function Recebimentos() {

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

    useEffect(() => {
        if (userInfo?.codigo) {
            setFuncionario(userInfo.codigo);
        }
    }, [userInfo]);

    const logout = () => {
        setToken("");
        setUserInfo(null);
        localStorage.removeItem("nfe_token");
        localStorage.removeItem("user_info");
    };

    // Cadastro de funcionario
    const [openDialog, setOpenDialog] = useState(false);
    const [senhaAdmin, setSenhaAdmin] = useState("");
    const [showSenha, setShowSenha] = useState(false);

    // Sistema
    const [xmlData, setXmlData] = useState(null);
    const [paletes, setPaletes] = useState([{ palete: "", volume: "" }]);
    const [funcionario, setFuncionario] = useState("");
    const [file, setFile] = useState(null);
    const [itensSemGTIN, setItensSemGTIN] = useState([]);
    const [openGTINDialog, setOpenGTINDialog] = useState(false);

    // Fornecedor direto
    const [fornecedorDireto, setFornecedorDireto] = useState(false);
    const [emTransito, setEmTransito] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [refreshInterval, setRefreshInterval] = useState("");

    // Loading de XML 
    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success"
    });

    // SS PLUS Sync
    const [loadingSync, setLoadingSync] = useState(false);

    // Modal retirar peças
    const [openRetirada, setOpenRetirada] = useState(false);
    const [retirada, setRetirada] = useState({
        codigo: "",
        codigo_interno: "",
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

    // Modal observacao
    const [openObservacao, setOpenObservacao] = useState(false);
    const [observacao_palet, setObservacaoPalet] = useState("");

    // Modal confirmar recebimento
    const [openConfirmar, setOpenConfirmar] = useState(false);

    const handleFornecedorToggle = (event) => {
        setFornecedorDireto(event.target.checked);
        if (event.target.checked) {
            setSuccessMessage(`FORNECEDOR_DIRETO, ativado (${refreshInterval / 1000}s)`);
        } else {
            setSuccessMessage('Fornecedor normal');
        }
    };

    // Enviar XML para API
    async function enviarXML() {
        setLoading(true);
        try {
            console.log("TOKEN:", token);
            const formData = new FormData();
            formData.append("file", file);

            let itensCorrigidos = [];

            if (itensSemGTIN.length > 0) {
                itensCorrigidos = itensSemGTIN.map(i => ({
                    index: i.index,
                    codigo_barras: i.codigo
                }));
            }

            const res = await fetch(`${API}/api/nfe/upload`, {
                method: "POST",
                headers: {
                    "X-Auth-Token": token
                },
                body: formData
            });

            console.log("UPLOAD NFE STATUS:", res.status);
            console.log("Conferente:", funcionario);
            console.log("Localização:", paletes
                .filter(p => p.palete.trim() !== "" || p.volume.trim() !== "")
                .map(p => `Palete:${p.palete}-${p.volume}`).join(" | "));
            console.log("Observação antes de atualizar:", observacao_palet);
            console.log("Status da nota antes:", fornecedorDireto);

            let statusFinal = "PENDENTE";
            if (emTransito) {
                statusFinal = "EM_TRANSITO";
            } else if (fornecedorDireto) {
                statusFinal = "FORNECEDOR_DIRETO";
            }

            const response = await fetch(
                `${API}/api/nfe/atualizar_por_nfe/${xmlData?.serie}/${xmlData?.nota}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        status: statusFinal,
                        conferente: funcionario,
                        localizacao: paletes
                            .filter(p => p.palete.trim() !== "" || p.volume.trim() !== "")
                            .map(p => `Palete ${p.palete} - Volume ${p.volume}`).join(" | "),
                        observacao_palet: observacao_palet,
                        itens_corrigidos: itensCorrigidos
                    })
                }
            );

            console.log("Status da nota depois:", fornecedorDireto);
            console.log("STATUS ATUALIZAR:", response.status);
            console.log("Observação depois de atualizar:", observacao_palet);
            setSnackbar({
                open: true,
                message: "Recebimento enviado com sucesso!",
                severity: "success"
            });
            setOpenConfirmar(false);

            // Limpa campos
            setXmlData(null);
            setPaletes([{ palete: "", volume: "" }]);
            setFuncionario("");
            setFile(null);

        } catch (err) {
            console.error("ERRO REAL:", err);

            setSnackbar({
                open: true,
                message: err.message || "Erro no envio",
                severity: "error"
            });
        } finally {
            setLoading(false);
        }
    }

    // Upload de XML
    async function handleFileUpload(e) {
        const f = e.target.files[0];
        if (!f) return;

        if (!f.name.endsWith(".xml")) {
            setSnackbar({
                open: true,
                message: "Arquivo deve ser XML",
                severity: "error"
            });
            return;
        }

        // Salva XML
        setFile(f);

        const reader = new FileReader();

        reader.onload = (event) => {
            const xmlString = event.target.result;
            const parser = new DOMParser();
            const xml = parser.parseFromString(xmlString, "text/xml");

            const dets = xml.getElementsByTagName("det");

            let totalPecas = 0;
            let volumes = "Não informado";

            for (let i = 0; i < dets.length; i++) {
                const qCom = dets[i].getElementsByTagName("qCom")[0]?.textContent;
                totalPecas += parseFloat(qCom || 0);
            }

            let temSemGTIN = false;

            for (let i = 0; i < dets.length; i++) {
                const prod = dets[i].getElementsByTagName("prod")[0];
                const cEAN = prod?.getElementsByTagName("cEAN")[0]?.textContent;

                if (!cEAN || cEAN === "SEM GTIN") {
                    temSemGTIN = true;
                    break;
                }
            }

            // Para acessar cfop
            const ns = "http://www.portalfiscal.inf.br/nfe";

            const nota = xml.getElementsByTagName("nNF")[0]?.textContent;
            const serie = xml.getElementsByTagName("serie")[0]?.textContent;
            const fornecedor = xml.getElementsByTagName("xNome")[0]?.textContent;
            const cnpj = xml.getElementsByTagName("CNPJ")[0]?.textContent;
            const detNode = xml.getElementsByTagNameNS(ns, "det")[0];
            const prodNode = detNode?.getElementsByTagNameNS(ns, "prod")[0];
            const cfop = prodNode?.getElementsByTagNameNS(ns, "CFOP")[0]?.textContent;
            const volNode = xml.getElementsByTagName("vol")[0];
            if (volNode) { volumes = volNode.getElementsByTagName("qVol")[0]?.textContent || "0"; }
            const destNode = xml.getElementsByTagName("dest")[0];
            const cnpjDest = destNode?.getElementsByTagName("CNPJ")[0]?.textContent ||
                destNode?.getElementsByTagName("CPF")[0]?.textContent;
            const nomeDest = destNode?.getElementsByTagName("xNome")[0]?.textContent

            const CNPJ_EMPRESA = "03978085000175";

            console.log("CFOP:", cfop);

            if (cnpjDest !== CNPJ_EMPRESA) {
                setSnackbar({
                    open: true,
                    message: `Este XML pertence à ${nomeDest}`,
                    severity: "error"
                });

                setFile(null);
                setXmlData(null);
                return;
            }

            setXmlData({
                nota,
                serie,
                fornecedor,
                cnpj,
                totalPecas,
                volumes,
                cfop
            });
        };

        reader.readAsText(f);
    }

    const CFOP_GARANTIA = ["5949", "6949"];
    const detectaGarantia = xmlData && CFOP_GARANTIA.includes(xmlData.cfop);
    useEffect(() => {
        if (xmlData?.cfop && CFOP_GARANTIA.includes(xmlData.cfop)) {
            setObservacaoPalet("RETORNO DE GARANTIA");
        }
    }, [xmlData]);

    // Paletes
    function handlePaleteChange(index, field, value) {
        const novos = [...paletes];
        novos[index][field] = value;
        setPaletes(novos);
    }

    function adicionarPalete() {
        setPaletes([...paletes, { palete: "", volume: "" }]);
    }

    function removerPalete(index) {
        if (paletes.length === 1) return;
        setPaletes(paletes.filter((_, i) => i !== index));
    }

    // Retirar peças
    const handleRetiradaChange = (e) => {
        setRetirada({ ...retirada, [e.target.name]: e.target.value });
    };

    const confirmarRetirada = async () => {

        if (!retirada.codigo.trim()) {
            setSnackbar({
                open: true,
                message: "Informe o código do produto",
                severity: "warning"
            });
            return;
        }

        if (!retirada.codigo_interno.trim()) {
            setSnackbar({
                open: true,
                message: "Informe o código interno do produto",
                severity: "warning"
            });
            return;
        }

        if (!retirada.quantidade || Number(retirada.quantidade) <= 0) {
            setSnackbar({
                open: true,
                message: "Informe uma quantidade válida",
                severity: "warning"
            });
            return;
        }

        if (!retirada.motivo.trim()) {
            setSnackbar({
                open: true,
                message: "Informe o motivo da retirada",
                severity: "warning"
            });
            return;
        }

        if (!retirada.nf.trim()) {
            setSnackbar({
                open: true,
                message: "Informe a nota fiscal",
                severity: "warning"
            });
            return;
        }

        if (!retirada.funcionario.trim()) {
            setSnackbar({
                open: true,
                message: "Informe o funcionário que retirou",
                severity: "warning"
            });
            return;
        }

        try {
            const response = await fetch(`${API}/api/retirada`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    ...retirada,
                    quantidade: Number(retirada.quantidade),
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Erro ao registrar retirada");
            }

            setSnackbar({
                open: true,
                message: "Retirada registrada!",
                severity: "success"
            });

            setOpenRetirada(false);

            setRetirada({
                codigo: "",
                codigo_interno: "",
                quantidade: "",
                nf: "",
                funcionario: ""
            });

        } catch (error) {
            console.error(error);

            setSnackbar({
                open: true,
                message: "Erro ao enviar para o servidor",
                severity: "error"
            });
        }
    };

    // Relatar erro
    const handleErroChange = (e) => {
        setErro({ ...erro, [e.target.name]: e.target.value });
    };

    const confirmarErro = () => {

        if (!erro.tipo) {
            setSnackbar({
                open: true,
                message: "Selecione o tipo de erro",
                severity: "warning"
            });
            return;
        }

        if (!erro.descricao.trim()) {
            setSnackbar({
                open: true,
                message: "Descreva o erro",
                severity: "warning"
            });
            return;
        }

        if (!erro.funcionario.trim()) {
            setSnackbar({
                open: true,
                message: "Informe o código do funcionário",
                severity: "warning"
            });
            return;
        }

        console.log("Erro:", erro);

        setSnackbar({
            open: true,
            message: "Erro registrado!",
            severity: "success"
        });

        setOpenErro(false);
    };

    // Adiciona observação
    const handleObservacaoChange = (e) => {
        setObservacaoPalet(e.target.value);
    };

    const confirmarObservacao = () => {
        if (!observacao_palet.trim()) {
            setSnackbar({
                open: true,
                message: "Informe a observação",
                severity: "warning"
            });
            return;
        }

        setSnackbar({
            open: true,
            message: "Observação adicionada!",
            severity: "success"
        });

        setOpenObservacao(false);
    };

    // Bloqueia cadastro sem senha
    const acessarCadastro = () => {
        if (senhaAdmin !== "Admin100378") {
            setSnackbar({
                open: true,
                message: "Senha de administrador inválida",
                severity: "error"
            });
            return;
        }

        setOpenDialog(false);
        setSenhaAdmin("");
        navigate("/CadastrarFuncionario");
    };

    // Sincroniza com SS PLUS
    const pegarLocal = async () => {
        setLoadingSync(true);

        const tempoMinimo = 2000;
        const inicio = Date.now();

        let snackbarData = null;

        try {
            const response = await fetch('http://192.168.1.185:8077/api/checar_localizacao_lote', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ todos: true })
            });

            const data = await response.json();

            console.log("RESPOSTA API:", data);

            if (response.ok) {
                const { atualizados, erros, nao_encontrados, total_processados } = data;

                snackbarData = {
                    open: true,
                    message: `Processados: ${total_processados} | Atualizados: ${atualizados} | Erros: ${erros}`,
                    severity: erros > 0 ? "warning" : "success"
                };
            } else {
                snackbarData = {
                    open: true,
                    message: "Erro ao buscar localizações no SS Plus!",
                    severity: "error"
                };
            }

        } catch (err) {
            console.error('Erro na requisição:', err);
            snackbarData = {
                open: true,
                message: "Erro ao sincronizar com SS Plus!",
                severity: "error"
            };

        } finally {
            const tempoPassado = Date.now() - inicio;
            const tempoRestante = tempoMinimo - tempoPassado;

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
                    <Typography variant="h4" sx={{ fontFamily: 'Consolas', color: "background.paper" }}>
                        <strong>Recebimento de mercadorias</strong>
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
                            <Button sx={{ color: 'background.paper' }} onClick={toggleTheme}>
                                {dark ? <LightModeIcon /> : <DarkModeIcon />}
                            </Button>
                        </Box>
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'row',
                                justifyContent: 'flex-end',
                                alignItems: 'center',
                                gap: 1,
                                flexWrap: 'nowrap',
                                overflow: 'hidden'
                            }}>
                            <Button
                                onClick={() => navigate("/AtualizarCean")}
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
                                ATUALIZAR CEAN
                                {<BorderColorIcon />}
                            </Button>
                            <Button
                                onClick={() => setOpenDialog(true)}
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
                                CADASTRAR FUNCIONARIO
                                {< PersonAddIcon />}
                            </Button>
                            <Button
                                onClick={() => navigate("/Alertas")}
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
                                Alertas
                                {< WarningIcon />}
                            </Button>
                            <Button
                                id="btnAtualizar" onClick={pegarLocal}
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
                                NOTAS PENDENTES
                                {< ArticleIcon />}
                            </Button>
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
                            Sincronizando com o SS Plus...
                        </Typography>
                    </Box>
                </Backdrop>

                {/* Importar XML */}
                <Card sx={{ mt: 3, mb: 3, borderRadius: '2vh', boxShadow: '0vh 0.1vh 0.5vh var(--sombra)', bgcolor: 'background.card' }}>
                    <CardContent>
                        <Typography variant="h6" sx={{ color: "text.primary" }}>Importar XML</Typography>

                        <Button
                            variant="contained"
                            component="label"
                            disabled={loading}
                            sx={{
                                mt: 2, bgcolor: 'primary.main',
                                '&:hover': { bgcolor: 'primaryHover.main' }
                            }}
                        ><AttachmentIcon sx={{ mr: '5px' }} />
                            Selecionar XML
                            <input hidden type="file" accept=".xml" onChange={handleFileUpload} />
                        </Button>
                    </CardContent>
                </Card>

                <Grid container spacing={3} justifyContent="space-between" alignItems="stretch">

                    {/* Dados da nota */}
                    <Grid item xs={12} md={3} lg={2} sx={{ maxWidth: '50vh' }}>
                        <Card sx={{ borderRadius: '2vh', boxShadow: '0vh 0.1vh 0.5vh var(--sombra)', bgcolor: 'background.card' }}>
                            <CardContent>
                                <Typography variant="h6">Dados da Nota</Typography>

                                {xmlData ? (
                                    <Box mt={2}>
                                        {detectaGarantia && (
                                            <Box sx={{ display: 'flex', justifyContent: 'space-around', mt: 2, mb: 2 }}>
                                                <Typography severity="warning">
                                                    Nota de retorno de garantia (CFOP: {xmlData.cfop})
                                                </Typography>
                                            </Box>
                                        )}
                                        <Typography><strong>Nota:</strong> {xmlData.nota}</Typography>
                                        <Typography><strong>Serie:</strong> {xmlData.serie}</Typography>
                                        <Typography><strong>Fornecedor:</strong> {xmlData.fornecedor}</Typography>
                                        <Typography><strong>CFOP:</strong> {xmlData.cfop}</Typography>
                                        <Typography><strong>CNPJ:</strong> {xmlData.cnpj}</Typography>
                                        <Typography><strong>Total de peças:</strong> {xmlData.totalPecas}</Typography>
                                        <Typography><strong>Volumes:</strong> {xmlData.volumes}</Typography>
                                    </Box>
                                ) : (
                                    <Typography mt={2}>Nenhum XML carregado</Typography>
                                )}
                                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-around' }}>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={fornecedorDireto}
                                                onChange={(e) => {
                                                    setFornecedorDireto(e.target.checked);
                                                    if (e.target.checked) setEmTransito(false);
                                                }}
                                                color="primary"
                                                size="small"
                                            />
                                        }
                                        label={
                                            <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                Fornecedor direto
                                            </Typography>
                                        }
                                        sx={{ mr: 1 }}
                                    />

                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={emTransito}
                                                onChange={(e) => {
                                                    setEmTransito(e.target.checked);
                                                    if (e.target.checked) setFornecedorDireto(false);
                                                }}
                                                color="primary"
                                                size="small"
                                            />
                                        }
                                        label={
                                            <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                Em trânsito
                                            </Typography>
                                        }
                                        sx={{ mr: 1 }}
                                    />
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Paletes */}
                    <Grid item xs={12} md={9} lg={8}>
                        <Card sx={{ borderRadius: '2vh', boxShadow: '0vh 0.1vh 0.5vh var(--sombra)', bgcolor: 'background.card', width: '100%', minWidth: '40vw' }}>
                            <CardContent>

                                <Typography variant="h6">Organização em Paletes</Typography>

                                {paletes.map((p, index) => (
                                    <Box key={index} sx={{ display: 'flex', gap: 1, mt: 2 }}>
                                        <TextField
                                            fullWidth
                                            placeholder="Palete"
                                            value={p?.palete || ""}
                                            onChange={(e) => handlePaleteChange(index, 'palete', e.target.value)}
                                            sx={{
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

                                        <TextField
                                            fullWidth
                                            placeholder="Volume(s)"
                                            value={p?.volume || ""}
                                            onChange={(e) => handlePaleteChange(index, 'volume', e.target.value)}
                                            sx={{
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
                                            sx={{ bgcolor: 'var(--cancelar)', '&:hover': { bgcolor: 'var(--cancelar-hover)' } }}
                                            onClick={() => removerPalete(index)}
                                        >
                                            X
                                        </Button>
                                    </Box>
                                ))}
                                <Button
                                    variant="contained"
                                    size="large"
                                    sx={{ bgcolor: 'var(--azul)', mt: 2, display: 'flex', justifyContent: 'left', '&:hover': { bgcolor: 'var(--azul-hover)' } }}
                                    onClick={adicionarPalete}
                                >
                                    Adicionar palete
                                </Button>

                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Botões extras */}
                    <Grid item xs={12} md={12} lg={2}>
                        <Card sx={{ borderRadius: '2vh', boxShadow: '0vh 0.1vh 0.5vh var(--sombra)', bgcolor: 'background.card', maxWidth: '30vh' }}>
                            <CardContent>
                                <Button
                                    variant="contained"
                                    size="large"
                                    sx={{ width: '100%', bgcolor: 'var(--azul)', mb: 2, '&:hover': { bgcolor: 'var(--azul-hover)' } }}
                                    onClick={() => setOpenRetirada(true)}
                                    disabled
                                >
                                    Retirar peça
                                </Button>
                                <Button
                                    variant="contained"
                                    size="large"
                                    sx={{ width: '100%', bgcolor: 'var(--observacao)', mb: 2, '&:hover': { bgcolor: 'var(--observacao-hover)' } }}
                                    onClick={() => {

                                        setOpenObservacao(true);
                                    }}
                                >
                                    Observação
                                </Button>
                                <Button
                                    variant="contained"
                                    size="large"
                                    sx={{ width: '100%', bgcolor: 'var(--cancelar)', '&:hover': { bgcolor: 'var(--cancelar-hover)' } }}
                                    onClick={() => {
                                        setErro({
                                            codigo: "",
                                            tipo: "",
                                            descricao: "",
                                            funcionario: userInfo?.codigo || ""
                                        });
                                        setOpenErro(true);
                                    }}
                                    disabled
                                >
                                    Relatar erro
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Funcionário */}
                <Card sx={{ mt: 3, borderRadius: '2vh', boxShadow: '0vh 0.1vh 0.5vh var(--sombra)', bgcolor: 'background.card' }}>
                    <CardContent>
                        <Typography variant="h6">Identificação de funcionário</Typography>

                        <Box sx={{ display: 'flex' }}>
                            <TextField
                                fullWidth
                                label="Código do Funcionário"
                                name="funcionario"
                                value={funcionario}
                                onChange={(e) => setFuncionario(e.target.value)}
                                sx={{
                                    mt: 1, width: '80%', '& .MuiOutlinedInput-root': {
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
                                sx={{ mt: 1, ml: 1, bgcolor: 'var(--confirmar)', '&:hover': { bgcolor: 'var(--confirmar-hover)' }, height: "7.3vh" }}
                                onClick={() => {
                                    if (!file) {
                                        setSnackbar({
                                            open: true,
                                            message: "Selecione um XML antes",
                                            severity: "warning"
                                        });
                                        return;
                                    }
                                    if (paletes.every(p => !p?.palete?.trim() && !p?.volume?.trim())) {
                                        setSnackbar({
                                            open: true,
                                            message: "Informe pelo menos um palete",
                                            severity: "warning"
                                        });
                                        return;
                                    }
                                    if (!funcionario.trim()) {
                                        setSnackbar({
                                            open: true,
                                            message: "Informe o funcionário",
                                            severity: "warning"
                                        });
                                        return;
                                    }

                                    if (itensSemGTIN.length > 0) {
                                        setOpenGTINDialog(true);
                                        return;
                                    }

                                    setOpenConfirmar(true);
                                }}
                            >Confirmar recebimento
                            </Button>
                        </Box>
                    </CardContent>
                </Card>

                <Dialog open={openGTINDialog} onClose={() => { }}>
                    <DialogTitle>Itens sem código de barras</DialogTitle>

                    <DialogContent>
                        <Typography sx={{ mb: 2 }}>
                            Existem itens sem código de barras. Informe manualmente:
                        </Typography>

                        {itensSemGTIN.map((item, index) => (
                            <TextField
                                key={index}
                                fullWidth
                                label={`Item ${item.index + 1}`}
                                value={item.codigo}
                                onChange={(e) => {
                                    const novos = [...itensSemGTIN];
                                    novos[index].codigo = e.target.value;
                                    setItensSemGTIN(novos);
                                }}
                                sx={{ mb: 2 }}
                            />
                        ))}
                    </DialogContent>

                    <DialogActions>
                        <Button
                            variant="contained"
                            onClick={() => {
                                const invalido = itensSemGTIN.some(i => !i.codigo.trim());

                                if (invalido) {
                                    setSnackbar({
                                        open: true,
                                        message: "Preencha todos os códigos de barras",
                                        severity: "warning"
                                    });
                                    return;
                                }

                                setOpenGTINDialog(false);
                                setOpenConfirmar(true);
                            }}
                        >
                            Confirmar
                        </Button>
                    </DialogActions>
                </Dialog>

                <Dialog open={openDialog} onClose={() => setOpenDialog(false)}
                    slotProps={{
                        paper: {
                            sx: {
                                bgcolor: "background.card",
                                color: "text.primary",
                            }
                        }
                    }}>
                    <DialogTitle>Acesso restrito</DialogTitle>

                    <DialogContent>
                        <TextField
                            label="Senha de administrador"
                            type={showSenha ? "text" : "password"}
                            fullWidth
                            value={senhaAdmin}
                            onChange={(e) => setSenhaAdmin(e.target.value)}
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
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() => setShowSenha(!showSenha)}
                                            edge="end"
                                        >
                                            {showSenha ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                        />
                    </DialogContent>

                    <DialogActions>
                        <Button sx={{ color: "primary.branco", bgcolor: 'primary.cancelar', '&:hover': { bgcolor: 'primary.cancelarHover' } }} onClick={() => setOpenDialog(false)}>
                            Cancelar
                        </Button>

                        <Button
                            variant="contained"
                            onClick={acessarCadastro}
                            sx={{ color: "primary.branco", bgcolor: 'primary.confirmar', '&:hover': { bgcolor: 'primary.confirmarHover' } }}>
                            Entrar
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Modal retirada de peças */}
                <ModalRetira
                    open={openRetirada}
                    onClose={() => setOpenRetirada(false)}
                    retirada={retirada}
                    onChange={handleRetiradaChange}
                    onConfirm={confirmarRetirada}
                />

                {/* Modal de relatar erros */}
                <ModalErro
                    open={openErro}
                    onClose={() => setOpenErro(false)}
                    erro={erro}
                    onChange={handleErroChange}
                    onConfirm={confirmarErro}
                />

                {/* Modal de observação */}
                <ModalObservacao
                    open={openObservacao}
                    onClose={() => setOpenObservacao(false)}
                    observacao={observacao_palet}
                    onChange={handleObservacaoChange}
                    onConfirm={confirmarObservacao}
                />

                {/* Modal confirmar recebimento */}
                <ModalConfirmaRecebimento
                    open={openConfirmar}
                    onClose={() => setOpenConfirmar(false)}
                    onConfirm={enviarXML}
                />

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
            </Container >
        )
    );
};
export default Recebimentos