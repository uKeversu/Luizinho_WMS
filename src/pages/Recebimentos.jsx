import { useState, useEffect, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
    CircularProgress,
    Tooltip
} from "@mui/material";

import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import ArticleIcon from '@mui/icons-material/Article';
import AttachmentIcon from '@mui/icons-material/Attachment';
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
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
import Cronometro from "../components/Cronometro";

import { ThemeContext } from "../context/ThemeContext";
import '../style/App.css';

function Recebimentos() {

    // Tema noturno
    const { dark, toggleTheme } = useContext(ThemeContext);

    // Acessar outras pages
    const navigate = useNavigate();
    const location = useLocation();

    // API BASE
    const API = "http://192.168.1.185:8077";

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

    // Puxa Nfe do dashboard
    useEffect(() => {
        if (location.state?.modo === "PENDENTE") {
            const nota = location.state.nota;

            setXmlData({
                nota: nota.numero,
                serie: nota.serie,
                fornecedor: nota.fornecedor,
                cnpj: nota.cnpj_emitente || "Não informado",
                totalPecas: nota.total_itens || "Não informado",
                volumes: nota.volumes || "Não informado",
                cfop: nota.cfop || "Não informado"
            });
        }
    }, [location.state]);

    // Salva nfe pendente
    useEffect(() => {
        if (location.state?.nota) {
            localStorage.setItem("nf_pendente", JSON.stringify(location.state.nota));
        }
    }, [location.state]);

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
    const [inicioRecebimento, setInicioRecebimento] = useState(null);
    const [tempoDecorrido, setTempoDecorrido] = useState(0);

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

    // Cronometro de recebimento
    useEffect(() => {
        if (!inicioRecebimento) return;

        const interval = setInterval(() => {
            setTempoDecorrido(
                Math.floor((new Date() - inicioRecebimento) / 1000)
            );
        }, 1000);

        return () => clearInterval(interval);
    }, [inicioRecebimento]);

    const handleTempoRecebimento = (data) => {
        console.log("TEMPO RECEBIMENTO:", data);
    };

    // Enviar XML para API
    async function enviarXML() {
        if (loading) return;

        setLoading(true);

        try {
            // Validações básicas
            if (!file) {
                throw new Error("Nenhum arquivo XML selecionado.");
            }

            if (!xmlData?.nota || !xmlData?.serie) {
                throw new Error("Dados da NF-e não encontrados.");
            }

            if (!funcionario?.trim()) {
                throw new Error("Informe o funcionário.");
            }

            const paletesValidos = paletes.filter(
                (p) =>
                    p?.palete?.trim() !== "" ||
                    p?.volume?.trim() !== ""
            );

            if (paletesValidos.length === 0) {
                throw new Error("Informe pelo menos um palete.");
            }

            // Itens corrigidos sem GTIN
            const itensCorrigidos = itensSemGTIN.map((item) => ({
                index: item.index,
                codigo_barras: item.codigo
            }));

            // Localização
            const localizacao = paletesValidos
                .map(
                    (p) =>
                        `Palete ${p.palete} - Volume ${p.volume}`
                )
                .join(" | ");

            // Status final
            let statusFinal = "EM_TRANSITO";

            if (emTransito) {
                statusFinal = "PENDENTE";
            } else if (fornecedorDireto) {
                statusFinal = "FORNECEDOR_DIRETO";
            }

            // Tempo de recebimento
            const fim = new Date();

            let tempoSegundos = null;

            if (inicioRecebimento) {
                tempoSegundos = Math.floor(
                    (fim - inicioRecebimento) / 1000
                );
            }

            // Logs
            console.log("INICIANDO RECEBIMENTO");
            console.log("NF:", xmlData.nota);
            console.log("Série:", xmlData.serie);
            console.log("Fornecedor:", xmlData.fornecedor);
            console.log("Conferente:", funcionario);
            console.log("Localização:", localizacao);
            console.log("Observação:", observacao_palet);
            console.log("Fornecedor direto:", fornecedorDireto);
            console.log("Em trânsito:", emTransito);
            console.log("Status final:", statusFinal);
            console.log("Tempo:", tempoSegundos, "segundos");
            console.log("Itens corrigidos:", itensCorrigidos);

            // 1. IMPORTAR XML
            console.log("1. IMPORTANDO XML");

            const formData = new FormData();
            formData.append("file", file);

            const uploadResponse = await fetch(
                `${API}/api/nfe/upload`,
                {
                    method: "POST",
                    headers: {
                        "X-Auth-Token": token
                    },
                    body: formData
                }
            );

            console.log("UPLOAD NFE STATUS:", uploadResponse.status);

            // Tenta obter resposta JSON
            let uploadData = null;

            try {
                uploadData = await uploadResponse.json();
            } catch {
                // Backend pode não retornar JSON.
            }

            if (!uploadResponse.ok) {
                console.error(
                    "IMPORTAÇÃO DA NF REJEITADA:",
                    uploadData
                );

                throw new Error(
                    uploadData?.message ||
                    uploadData?.detail ||
                    (uploadResponse.status === 409
                        ? "Não foi possível importar a NF-e. Status: NF-e duplicada"
                        : `Não foi possível importar a NF-e. Status: ${uploadResponse.status}`
                    )
                );
            }

            console.log(
                "NF-e importada com sucesso:",
                uploadData
            );

            // 2. ATUALIZAR STATUS DA NF
            console.log("2. ATUALIZANDO STATUS");

            const updateResponse = await fetch(
                `${API}/api/nfe/atualizar_por_nfe/${xmlData.serie}/${xmlData.nota}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        status: statusFinal,
                        conferente: funcionario,
                        localizacao,
                        observacao: observacao_palet,
                        origem: "Manual",
                        etiqueta: "Sem etiqueta",
                        itens_corrigidos: itensCorrigidos
                    })
                }
            );

            console.log(
                "STATUS ATUALIZAR:",
                updateResponse.status
            );

            // Tenta obter resposta JSON
            let updateData = null;

            try {
                updateData = await updateResponse.json();
            } catch {
                // Backend pode não retornar JSON.
            }

            // Verifica atualização
            if (!updateResponse.ok) {
                console.error(
                    "ATUALIZAÇÃO DA NF REJEITADA:",
                    updateData
                );

                throw new Error(
                    updateData?.message ||
                    updateData?.detail ||
                    `Não foi possível atualizar a NF-e. Status: ${updateResponse.status}`
                );
            }

            console.log(
                "NF-e atualizada com sucesso:",
                updateData
            );

            // 3. SUCESSO
            console.log("RECEBIMENTO CONCLUÍDO COM SUCESSO");

            setSnackbar({
                open: true,
                message: "Recebimento enviado com sucesso!",
                severity: "success"
            });

            setOpenConfirmar(false);

            // Limpa formulário
            setXmlData(null);
            setPaletes([
                {
                    palete: "",
                    volume: ""
                }
            ]);

            setFile(null);
            setItensSemGTIN([]);
            setObservacaoPalet("");

            setInicioRecebimento(null);
            setTempoDecorrido(0);

            setFornecedorDireto(false);
            setEmTransito(false);

        } catch (err) {
            console.error("==========================================");
            console.error("ERRO AO PROCESSAR RECEBIMENTO");
            console.error("==========================================");
            console.error(err);

            setSnackbar({
                open: true,
                message:
                    err?.message ||
                    "Erro ao enviar o recebimento.",
                severity: "error"
            });

        } finally {
            setLoading(false);
        }
    }

    // Upload e leitura do XML
    async function handleFileUpload(e) {
        const selectedFile = e.target.files?.[0];

        if (!selectedFile) {
            return;
        }

        // Validação da extensão
        if (
            !selectedFile.name
                .toLowerCase()
                .endsWith(".xml")
        ) {
            setSnackbar({
                open: true,
                message: "Arquivo deve ser XML.",
                severity: "error"
            });

            e.target.value = "";
            return;
        }

        // Salva arquivo
        setFile(selectedFile);

        const reader = new FileReader();

        reader.onload = (event) => {
            try {
                const xmlString = event.target?.result;

                if (!xmlString) {
                    throw new Error(
                        "Não foi possível ler o arquivo XML."
                    );
                }

                // Faz parsing do XML
                const parser = new DOMParser();

                const xml = parser.parseFromString(
                    xmlString,
                    "text/xml"
                );

                // Verifica XML inválido
                const parserError =
                    xml.querySelector("parsererror");

                if (parserError) {
                    throw new Error(
                        "O arquivo XML é inválido ou está corrompido."
                    );
                }

                // Namespace da NF-e
                const ns =
                    "http://www.portalfiscal.inf.br/nfe";

                // Produtos
                const dets =
                    xml.getElementsByTagName("det");

                let totalPecas = 0;

                let temSemGTIN = false;

                for (let i = 0; i < dets.length; i++) {

                    // Quantidade
                    const qCom =
                        dets[i]
                            .getElementsByTagName("qCom")[0]
                            ?.textContent;

                    totalPecas += Number.parseFloat(
                        qCom || 0
                    );

                    // GTIN
                    const prod =
                        dets[i]
                            .getElementsByTagName("prod")[0];

                    const cEAN =
                        prod
                            ?.getElementsByTagName("cEAN")[0]
                            ?.textContent
                            ?.trim();

                    if (
                        !cEAN ||
                        cEAN.toUpperCase() === "SEM GTIN"
                    ) {
                        temSemGTIN = true;
                    }
                }

                // Dados principais da NF
                const nota =
                    xml
                        .getElementsByTagName("nNF")[0]
                        ?.textContent;

                const serie =
                    xml
                        .getElementsByTagName("serie")[0]
                        ?.textContent;

                const fornecedor =
                    xml
                        .getElementsByTagName("xNome")[0]
                        ?.textContent;

                const cnpj =
                    xml
                        .getElementsByTagName("CNPJ")[0]
                        ?.textContent;

                // CFOP
                const detNode =
                    xml.getElementsByTagNameNS(
                        ns,
                        "det"
                    )[0];

                const prodNode =
                    detNode?.getElementsByTagNameNS(
                        ns,
                        "prod"
                    )[0];

                const cfop =
                    prodNode
                        ?.getElementsByTagNameNS(
                            ns,
                            "CFOP"
                        )[0]
                        ?.textContent;

                // Volumes
                let volumes = "Não informado";

                const volNode =
                    xml.getElementsByTagName("vol")[0];

                if (volNode) {
                    volumes =
                        volNode
                            .getElementsByTagName("qVol")[0]
                            ?.textContent ||
                        "0";
                }

                // Destinatário
                const destNode =
                    xml.getElementsByTagName("dest")[0];

                const cnpjDest =
                    destNode
                        ?.getElementsByTagName("CNPJ")[0]
                        ?.textContent ||
                    destNode
                        ?.getElementsByTagName("CPF")[0]
                        ?.textContent;

                const nomeDest =
                    destNode
                        ?.getElementsByTagName("xNome")[0]
                        ?.textContent;

                // Validação da empresa destinatária
                const CNPJ_EMPRESA =
                    "03978085000175";

                console.log(
                    "CFOP:",
                    cfop
                );

                console.log(
                    "Destinatário:",
                    nomeDest
                );

                console.log(
                    "CNPJ destinatário:",
                    cnpjDest
                );

                // Impede XML de outra empresa
                if (
                    cnpjDest !== CNPJ_EMPRESA
                ) {
                    setSnackbar({
                        open: true,
                        message:
                            `Este XML pertence à ${nomeDest || "outra empresa"}.`,
                        severity: "error"
                    });

                    setFile(null);
                    setXmlData(null);

                    return;
                }

                // Salva dados da NF
                setXmlData({
                    nota,
                    serie,
                    fornecedor,
                    cnpj,
                    totalPecas,
                    volumes,
                    cfop
                });

                // Registra início do recebimento
                setInicioRecebimento(
                    new Date()
                );

                // Limpa correções anteriores
                setItensSemGTIN([]);

                console.log(
                    "XML carregado com sucesso."
                );

                console.log(
                    "NF:",
                    nota
                );

                console.log(
                    "Série:",
                    serie
                );

                console.log(
                    "Fornecedor:",
                    fornecedor
                );

                console.log(
                    "Total de peças:",
                    totalPecas
                );

                console.log(
                    "Volumes:",
                    volumes
                );

                console.log(
                    "CFOP:",
                    cfop
                );

                console.log(
                    "Possui itens sem GTIN:",
                    temSemGTIN
                );

            } catch (error) {

                console.error(
                    "ERRO AO PROCESSAR XML:",
                    error
                );

                setFile(null);
                setXmlData(null);

                setSnackbar({
                    open: true,
                    message:
                        error?.message ||
                        "Erro ao processar o XML.",
                    severity: "error"
                });
            }
        };

        // Erro de leitura do arquivo
        reader.onerror = () => {
            console.error(
                "Erro ao ler arquivo XML."
            );

            setFile(null);
            setXmlData(null);

            setSnackbar({
                open: true,
                message:
                    "Não foi possível ler o arquivo XML.",
                severity: "error"
            });
        };

        // Lê arquivo
        reader.readAsText(selectedFile);
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

    return (
        !token ? (
            <LoginFuncionario
                onLogin={(data) => {

                    localStorage.setItem(
                        "nfe_token",
                        data.token
                    );

                    const user = {
                        id: data.id,
                        nome: data.nome,
                        codigo: data.codigo,
                        tipo: data.tipo,
                        pode_autorizar_conferencia: data.pode_autorizar_conferencia,
                        pode_corrigir_nfe: data.pode_corrigir_nfe,
                        pode_finalizar_nfe: data.pode_finalizar_nfe,
                        pode_acessar_alertas: data.pode_acessar_alertas,
                        pode_acessar_cadastrar_funcionario: data.pode_acessar_cadastrar_funcionario,
                        pode_acessar_painel_games: data.pode_acessar_painel_games,
                        pode_acessar_painel_gerencial: data.pode_acessar_painel_gerencial,
                        pode_acessar_reimprimir_senhas: data.pode_acessar_reimprimir_senhas,
                        pode_acessar_tarefas: data.pode_acessar_tarefas,
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
                        borderRadius: '2vh',
                        zoom: '0.9'
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
                            <Tooltip title="Dashboard de notas recebidas">
                                <Button
                                    onClick={() => navigate("/")}
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
                                    NOTAS
                                    {< ArticleIcon />}
                                </Button>
                            </Tooltip>
                            <pre id="resultado"></pre>
                        </Box>
                    </Box>
                </Box>

                <Cronometro onFinish={handleTempoRecebimento} />

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
                                                Pendente
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
                                    if (!xmlData) {
                                        setSnackbar({
                                            open: true,
                                            message: "Carregue ou selecione uma nota primeiro",
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