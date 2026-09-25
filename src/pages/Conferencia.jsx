import { useState, useEffect, useContext, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useMemo } from "react";
import {
    Container, Typography, Card, CardContent, Chip, Divider, Box, TextField, Button,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogActions,
    CircularProgress, Backdrop, IconButton, Tooltip, FormControl, InputLabel,
    Select, MenuItem, Stack
} from "@mui/material";

import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SyncIcon from '@mui/icons-material/Sync';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import LocalPrintshopIcon from '@mui/icons-material/LocalPrintshop';

//Icones caixa
import DeleteIcon from '@mui/icons-material/Delete';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import ListIcon from "@mui/icons-material/List";
import ReplayIcon from "@mui/icons-material/Replay";

// Componentes
import MenuUsuario from "../components/MenuUsuario";
import LoginFuncionario from "../components/LoginFuncionario";
import SolicitarCorrecaoFab from "../components/SolicitarCorrecaoFab";
import NotificacoesMenu from "../components/Notificacoes";

import '../style/App.css';

function Conferencia() {

    // Acessar outras pages        
    const navigate = useNavigate();

    // API BASE
    const API = "http://192.168.1.185:8077";

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
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith("itens_conferencia") || key.startsWith("caixas_conferencia")) {
                localStorage.removeItem(key);
            }
        });
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

    // Logs
    const [logsRetiradaVenda, setLogsRetiradaVenda] = useState([]);

    // Bloqueio operação manual
    const [inicioLeitura, setInicioLeitura] = useState(null);
    const [bloqueioManual, setBloqueioManual] = useState(false);
    const [solicitacaoManualId, setSolicitacaoManualId] = useState(null);
    const [statusAutorizacao, setStatusAutorizacao] = useState(null);
    const [superiorAtendimento, setSuperiorAtendimento] = useState(null);
    const [codigoManualPendente, setCodigoManualPendente] = useState(null);
    const [codigoCracha, setCodigoCracha] = useState("");
    const [pinSuperior, setPinSuperior] = useState("");
    const [autorizandoManual, setAutorizandoManual] = useState(false);
    const [erroAutorizacao, setErroAutorizacao] = useState("");
    const [cancelandoManual, setCancelandoManual] = useState(false);

    const notaAtual = useMemo(() => {
        return notas.find(n => n?.id);
    }, [notas]);

    const notasIds = useMemo(() => {
        return notas.map(n => typeof n === "object" ? n.id : n);
    }, [notas]);

    const modo = notas.some(n =>
        typeof n === "object" && n.status === "FORNECEDOR_DIRETO"
    )
        ? "MULTIPLO"
        : "UNICO";

    // Impressora
    const [printer, setPrinter] = useState("");
    const [printers, setPrinters] = useState([]);

    // Etiquetas
    const [modoEtiqueta, setModoEtiqueta] = useState(
        localStorage.getItem("modoEtiqueta") || "padrao"
    );

    const alterarModoEtiqueta = (modo) => {
        setModoEtiqueta(modo);
        localStorage.setItem("modoEtiqueta", modo);
    };

    useEffect(() => {

        const carregarImpressoras = async () => {

            try {

                const response = await fetch("http://127.0.0.1:5000/printers");

                const data = await response.json();

                if (response.ok) {
                    setPrinters(data.printers || []);
                }

            } catch (error) {

                console.error("Erro ao buscar impressoras:", error);

                setSnackbar({
                    open: true,
                    message: "SIGEL Print não encontrado",
                    severity: "error"
                });
            }
        };

        carregarImpressoras();

        const salva = localStorage.getItem("printer");

        if (salva) {
            setPrinter(salva);
        }

    }, []);

    const selecionarImpressora = (novaPrinter) => {

        setPrinter(novaPrinter);

        localStorage.setItem("printer", novaPrinter);

        setSnackbar({
            open: true,
            message: `Impressora alterada para ${novaPrinter}`,
            severity: "success"
        });
    };

    // Atalhos
    const inputRef = useRef(null);
    const qtdRef = useRef(null);
    const grupoRef = useRef(null);

    const [modoQuantidade, setModoQuantidade] = useState(false);
    const [ultimoItemScaneado, setUltimoItemScaneado] = useState(null);
    const [quantidadeInput, setQuantidadeInput] = useState("");

    const [modoAgrupamento, setModoAgrupamento] = useState(false);
    const [tamanhoGrupoInput, setTamanhoGrupoInput] = useState("");
    const [processandoAgrupamento, setProcessandoAgrupamento] = useState(false);

    // Caixa aberta e fechadas
    const [caixaAberta, setCaixaAberta] = useState(null);
    const [caixas, setCaixas] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [caixaFechadaDialog, setCaixaFechadaDialog] = useState(null);
    const [openFecharDialog, setOpenFecharDialog] = useState(false);
    const [numeroCaixa, setNumeroCaixa] = useState("");
    const caixasRef = useRef(caixas);
    const [modalCaixaItem, setModalCaixaItem] = useState({
        open: false,
        item: null,
        caixa: null,
        cheia: false
    });
    const [processandoScanner, setProcessandoScanner] = useState(false);

    // Agrupa caixas por localizações próximas
    const [agrupamentosSelecionados, setAgrupamentosSelecionados] = useState([]);
    const [gruposLocalizacao, setGruposLocalizacao] = useState([]);
    const [dialogAgrupamentos, setDialogAgrupamentos] = useState({
        open: false,
        sugestoes: []
    });

    const addCaixaSafe = (nova) => {
        atualizarCaixas(prev => {
            const existe = prev.some(c => c.id === nova.id);
            if (existe) return prev;
            return [...prev, nova];
        });
    };

    useEffect(() => {
        caixasRef.current = caixas;
    }, [caixas]);

    // Modal de confirmação
    const [confirmDialog, setConfirmDialog] = useState({
        open: false,
        type: null, // "remover_item" | "remover_caixa"
        payload: null
    });

    // SS Plus Sync
    const [loadingSync, setLoadingSync] = useState(false);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    useEffect(() => {

        if (!notasIds || notasIds.length === 0) return;

        const chaveItens = `itens_conferencia_${notasIds.join("_")}`;
        const chaveCaixas = `caixas_conferencia_${notasIds.join("_")}`;

        const itensSalvos = localStorage.getItem(chaveItens);

        const caixasSalvas = JSON.parse(
            localStorage.getItem(chaveCaixas) || "[]"
        );

        const itensParse = itensSalvos
            ? JSON.parse(itensSalvos)
            : [];

        const itensCorrigidos = itensParse.map(i => ({
            ...i,
            caixaId: i.caixaId ?? i.caixa ?? null
        }));

        const caixasParse = caixasSalvas.map(c => ({
            ...c,
            cheia: c.cheia ?? false
        }));

        const cacheValido =
            itensCorrigidos.length > 0 &&
            itensCorrigidos.some(i =>
                notasIds.includes(i.notaId)
            );

        if (cacheValido) {

            console.log("USANDO CACHE");

            setItens(itensCorrigidos);
            atualizarCaixas(caixasParse);

            return;

        } else {

            console.log("CACHE INVALIDO → BUSCANDO API");

            carregarTudo();
        }

    }, [notasIds]);

    useEffect(() => {
        if (notaAtual?.id) {
            carregarLogsRetiradaVenda();
        }
    }, [notaAtual?.id]);

    // Sempre que caixas mudar, salva no local storage
    useEffect(() => {
        if (!notasIds || notasIds.length === 0) return;

        const chaveCaixas = `caixas_conferencia_${notasIds.join("_")}`;
        localStorage.setItem(chaveCaixas, JSON.stringify(caixas));
    }, [caixas, notasIds]);

    // Sempre que itens mudar, salva no local storage
    useEffect(() => {
        if (!notasIds || notasIds.length === 0) return;

        const chaveItens = `itens_conferencia_${notasIds.join("_")}`;
        localStorage.setItem(chaveItens, JSON.stringify(itens));
    }, [itens, notasIds]);

    // Teclas de atalho
    useEffect(() => {
        const handleKeyDown = (e) => {

            const isInput = document.activeElement.tagName === "INPUT";

            if ((e.ctrlKey || e.metaKey) && e.code === "Space") {
                e.preventDefault();

                setCodigo("");
                setQuantidadeInput("");
                setTamanhoGrupoInput("");
                return;
            }

            // Permitir alguns atalhos mesmo no input
            if (isInput && !["F2", "F3", "F4", "F7", "F8", "F9", "Escape"].includes(e.key)) {
                return;
            }

            switch (e.key) {

                case "F2":
                    e.preventDefault();
                    abrirCaixa();
                    break;

                case "F3":
                    e.preventDefault();

                    const quantidade = Number(quantidadeInput);

                    // 1. Validar modo de quantidade
                    if (!modoQuantidade) {
                        setSnackbar({
                            open: true,
                            message: "Informe primeiro uma quantidade válida no F7",
                            severity: "warning"
                        });

                        setTimeout(() => qtdRef.current?.focus(), 100);
                        return;
                    }

                    // 2. Validar quantidade
                    if (
                        !Number.isFinite(quantidade) ||
                        quantidade <= 0 ||
                        !Number.isInteger(quantidade)
                    ) {
                        setSnackbar({
                            open: true,
                            message: "A quantidade informada deve ser um número inteiro maior que zero",
                            severity: "warning"
                        });

                        setTimeout(() => qtdRef.current?.focus(), 100);
                        return;
                    }

                    // 3. Agrupamento não pode ser utilizado com Bremsys
                    if (modoEtiqueta === "bremsys") {
                        setSnackbar({
                            open: true,
                            message: "Não é permitido agrupar itens da marca Bremsys",
                            severity: "warning"
                        });

                        setTimeout(() => qtdRef.current?.focus(), 100);
                        return;
                    }

                    // 4. Alternar modo
                    const novoModoAgrupamento = !modoAgrupamento;

                    setModoAgrupamento(novoModoAgrupamento);
                    setTamanhoGrupoInput("");

                    if (novoModoAgrupamento) {

                        setSnackbar({
                            open: true,
                            message: "Modo agrupamento ATIVADO. Informe o tamanho do grupo.",
                            severity: "info"
                        });

                        registrarLog({
                            acao: "Modo agrupamento ATIVADO"
                        });

                        setTimeout(() => grupoRef.current?.focus(), 100);

                    } else {

                        setSnackbar({
                            open: true,
                            message: "Modo agrupamento DESATIVADO",
                            severity: "info"
                        });

                        registrarLog({
                            acao: "Modo agrupamento DESATIVADO"
                        });

                        setTimeout(() => inputRef.current?.focus(), 100);
                    }

                    break;

                case "F4":
                    e.preventDefault();
                    finalizarConferencia();
                    break;

                case "F6":
                    e.preventDefault();

                    if (caixaAberta) {
                        setSnackbar({
                            open: true,
                            message: "Feche a caixa atual antes de reabrir outra",
                            severity: "warning"
                        });
                        return;
                    }

                    if (caixas.length > 0) {
                        reabrirCaixa(caixas[caixas.length - 1]);
                    }
                    break;

                case "F7":
                    e.preventDefault();

                    const novoModo = !modoQuantidade;

                    setModoQuantidade(novoModo);

                    setSnackbar({
                        open: true,
                        message: novoModo
                            ? "Modo quantidade ATIVADO"
                            : "Modo quantidade DESATIVADO",
                        severity: "info"
                    });

                    registrarLog({
                        acao: novoModo
                            ? "Modo quantidade ATIVADO"
                            : "Modo quantidade DESATIVADO"
                    });

                    if (novoModo) {
                        setTimeout(() => qtdRef.current?.focus(), 100);
                    }

                    break;

                case "F8":
                    e.preventDefault();
                    if (ultimoItemScaneado) {
                        imprimirEtiqueta(ultimoItemScaneado);
                    }
                    break;

                case "F9":
                    e.preventDefault();
                    inputRef.current?.focus();
                    break;

                case "Escape":
                    setCodigo("");
                    break;

                default:
                    break;
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [caixaAberta, ultimoItemScaneado, modoQuantidade, modoAgrupamento, quantidadeInput]);

    // Pooling da solicitação para sincronização
    useEffect(() => {

        if (
            !bloqueioManual ||
            !solicitacaoManualId
        ) {
            return;
        }

        let intervalId = null;
        let ativo = true;

        const consultarStatus = async () => {

            try {

                const token =
                    localStorage.getItem("nfe_token");

                if (!token) {
                    return;
                }

                const response = await fetch(
                    `${API}/api/autorizacoes/manual/${solicitacaoManualId}`,
                    {
                        headers: {
                            "X-Auth-Token": token
                        }
                    }
                );

                if (!response.ok) {
                    throw new Error(
                        "Erro ao consultar autorização"
                    );
                }

                const data = await response.json();

                console.log(
                    "Status autorização:",
                    data
                );

                if (!ativo) {
                    return;
                }

                // O Flask retorna os dados dentro de "solicitacao"
                const solicitacao = data.solicitacao;

                if (!solicitacao) {
                    console.error(
                        "Resposta da autorização não possui solicitacao:",
                        data
                    );
                    return;
                }

                const status =
                    solicitacao.status;

                const superiorNome =
                    solicitacao.superior_nome;

                setStatusAutorizacao(status);

                if (superiorNome) {

                    setSuperiorAtendimento(
                        superiorNome
                    );
                }

                // AUTORIZADA
                if (status === "autorizada") {

                    if (intervalId) {
                        clearInterval(intervalId);
                        intervalId = null;
                    }

                    await utilizarAutorizacaoManual(
                        solicitacaoManualId
                    );

                    return;
                }

                // EXPIRADA
                if (status === "expirada") {

                    if (intervalId) {
                        clearInterval(intervalId);
                        intervalId = null;
                    }

                    setBloqueioManual(false);
                    setSolicitacaoManualId(null);
                    setStatusAutorizacao(null);
                    setSuperiorAtendimento(null);
                    setCodigoManualPendente(null);
                    setCodigo("");

                    setSnackbar({
                        open: true,
                        message:
                            "A solicitação de autorização expirou.",
                        severity: "warning"
                    });

                    return;
                }

                // CANCELADA
                if (status === "cancelada") {

                    if (intervalId) {
                        clearInterval(intervalId);
                        intervalId = null;
                    }

                    setBloqueioManual(false);
                    setSolicitacaoManualId(null);
                    setStatusAutorizacao(null);
                    setSuperiorAtendimento(null);
                    setCodigoManualPendente(null);
                    setCodigo("");

                    setSnackbar({
                        open: true,
                        message:
                            "A solicitação de autorização foi cancelada.",
                        severity: "warning"
                    });

                    return;
                }

            } catch (error) {

                console.error(
                    "Erro no polling da autorização:",
                    error
                );
            }
        };

        // Consulta imediatamente
        consultarStatus();

        // Depois consulta a cada 2 segundos
        intervalId = setInterval(
            consultarStatus,
            2000
        );

        return () => {

            ativo = false;

            if (intervalId) {
                clearInterval(intervalId);
            }

        };

    }, [
        bloqueioManual,
        solicitacaoManualId
    ]);

    const carregarLogsRetiradaVenda = async () => {
        try {
            const response = await fetch(
                `${API}/api/nfe/item/movimentacao/log?nota_id=${notaAtual?.id}`,
                {
                    headers: {
                        "Content-Type": "application/json",
                        "X-Auth-Token": token
                    }
                }
            );

            const data = await response.json();

            if (response.ok) {
                setLogsRetiradaVenda(
                    (data.logs || []).filter(
                        log => log.acao === "Retirado para venda"
                    )
                );
            }

        } catch (error) {
            console.error("Erro ao buscar logs:", error);
        }
    };

    // Sincroniza com SSPLUS pelo ID da nota
    const syncSSPlus = async () => {
        if (!notaAtual?.id) {
            setSnackbar({
                open: true,
                message: "Nota não encontrada",
                severity: "warning"
            });
            return;
        }

        setLoadingSync(true);

        const tempoMinimo = 2000;
        const inicio = Date.now();

        let snackbarData = null;

        try {
            // 1 - Atualiza locais do SS Plus
            const responseLocal = await fetch(
                "http://192.168.1.185:8077/api/sync/local_sistema",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        todos: true
                    })
                }
            );

            const dataLocal = await responseLocal.json();

            if (!responseLocal.ok) {
                throw new Error("Erro ao buscar localizações no SS Plus");
            }

            const {
                erros = 0,
                inseridos = 0,
                total_processados = 0
            } = dataLocal.estatisticas || {};

            console.log("Total processados:", total_processados);
            console.log("Atualizados:", inseridos);
            console.log("Erros:", erros);

            // 2 - Sincroniza a nota
            console.log(
                "SINCRONIZANDO A NOTA:",
                notaAtual.id,
                "NF:",
                notaAtual.numero
            );

            const responseSync = await fetch(
                `${API}/api/sync/nfe_item_x_local_sistema`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                    })
                }
            );

            const dataSync = await responseSync.json();

            if (!responseSync.ok) {
                throw new Error(dataSync?.erro || "Erro ao sincronizar nota");
            }

            registrarLog({
                acao: "Sincronizou nota"
            });

            await carregarTudo();

            const semDados =
                total_processados === 0 &&
                inseridos === 0 &&
                erros === 0;

            if (semDados) {
                snackbarData = {
                    open: true,
                    message: "Nenhum item para sincronizar",
                    severity: "info"
                };
            } else {
                snackbarData = {
                    open: true,
                    message: "Nota sincronizada",
                    severity: "success"
                };
            }

        } catch (err) {
            console.error(err);

            snackbarData = {
                open: true,
                message: err.message || "Erro ao sincronizar com SS Plus",
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

    const carregarTudo = async () => {
        try {
            setLoading(true);

            if (!notas || notas.length === 0) return;

            console.log("NOTAS RECEBIDAS:", notas);
            setNotaInfo(notas);

            const chaveItens = `itens_conferencia_${notasIds.join("_")}`;
            const itensSalvos = JSON.parse(localStorage.getItem(chaveItens) || "[]");

            const chaveCaixas = `caixas_conferencia_${notasIds.join("_")}`;
            const caixasSalvas = JSON.parse(
                localStorage.getItem(chaveCaixas) || "[]"
            );

            const agrupamentosSalvos = JSON.parse(
                localStorage.getItem(
                    `agrupamentos_${notasIds.join("_")}`
                ) || "[]"
            );

            setAgrupamentosSelecionados(
                agrupamentosSalvos
            );

            let todosItens = [];

            // Sugestões de agrupamento
            const sugestoes = [];

            // Gera codigo da caixa vindo da API
            const gerarIdCaixa = (nome) => nome;

            for (const nota of notas) {

                const response = await fetch(`${API}/api/itens_nfe/${nota.id}`, {
                    headers: {
                        "Content-Type": "application/json",
                        "X-Auth-Token": token
                    }
                });

                const dataItens = await response.json();

                if (!response.ok) {
                    console.error("Erro ao buscar itens da nota:", nota.id, dataItens);
                    continue;
                }

                console.log("Data itens:", dataItens)

                const itensFormatados = (dataItens.items || []).map((item) => {

                    const itemSalvo = itensSalvos.find(i => {

                        const codigoItem =
                            item.cean && item.cean !== "SEM GTIN"
                                ? item.cean
                                : item.cod_produto;

                        const codigoSalvo =
                            i.codigo_barras && i.codigo_barras !== "SEM GTIN"
                                ? i.codigo_barras
                                : i.codigo_produto;

                        return (
                            codigoSalvo === codigoItem &&
                            i.notaId === nota.id
                        );
                    });

                    return {
                        id: item.id,
                        nfe_id: item.nfe_id,

                        descricao: item.descricao || "Item sem identificação",
                        codigo_barras: item.cean || "",
                        codigo_produto: item.cod_produto || "",
                        basico: item.basico || "-",
                        localizacao: item.loc_sistema || "Sem localização",
                        quantidade: Number(item.quantidade_comercial) || 0,

                        conferido:
                            itemSalvo?.conferido ??
                            (Number(item.qtd_conferida) || 0),

                        caixaId:
                            itemSalvo?.caixaId ??
                            item.caixa ??
                            null,

                        caixaApi: item.caixa || null,

                        status: item.status_item,

                        notaId: nota.id,
                        notaNumero: nota.numero || "-",
                        notaSerie: nota.serie || "-"
                    };
                });

                todosItens = [...todosItens, ...itensFormatados];
            }

            const mapaLocalizacoes = {};

            todosItens.forEach(item => {

                const loc = getPrateleira(item.localizacao);

                if (!mapaLocalizacoes[loc]) {
                    mapaLocalizacoes[loc] = 0;
                }

                mapaLocalizacoes[loc] =
                    (mapaLocalizacoes[loc] || 0) + 1;
            });

            const localizacoes = Object.keys(mapaLocalizacoes).sort();
            const localizacoesUsadas = new Set();

            for (let i = 0; i < localizacoes.length - 1; i++) {

                const atual = localizacoes[i];
                const proxima = localizacoes[i + 1];

                // Já usada em outro agrupamento
                if (
                    localizacoesUsadas.has(atual) ||
                    localizacoesUsadas.has(proxima)
                ) {
                    continue;
                }

                const qtdAtual = mapaLocalizacoes[atual];
                const qtdProxima = mapaLocalizacoes[proxima];

                const numeroAtual =
                    parseInt(atual.match(/\d+/)?.[0] || 0);

                const numeroProximo =
                    parseInt(proxima.match(/\d+/)?.[0] || 0);

                const distancia =
                    Math.abs(numeroAtual - numeroProximo);

                // Mesmo número (042A + 042B)
                // OU até UMA ruas próximas (042A + 043A)
                const agrupamentoPermitido =
                    distancia <= 1;

                const poucasPecas =
                    (qtdAtual + qtdProxima) <= 50;

                const jaSalvo = agrupamentosSalvos.some(g =>
                    g.nome === `${atual}/${proxima}`
                );

                if (
                    agrupamentoPermitido &&
                    poucasPecas &&
                    !jaSalvo
                ) {

                    sugestoes.push({
                        nome: `${atual}/${proxima}`,
                        localizacoes: [atual, proxima],
                        quantidade: qtdAtual + qtdProxima,

                        itens: todosItens
                            .filter(item => {

                                const prateleira =
                                    getPrateleira(item.localizacao);

                                return (
                                    prateleira === atual ||
                                    prateleira === proxima
                                );
                            })
                            .sort((a, b) =>
                                a.localizacao.localeCompare(
                                    b.localizacao
                                )
                            )
                    });

                    // Marca como usadas
                    localizacoesUsadas.add(atual);
                    localizacoesUsadas.add(proxima);
                }
            }

            // Agrupa as caixas da API
            const mapaCaixas = {};
            let novasCaixas = [];

            todosItens.forEach(item => {

                const nomeCaixa = item.caixaApi;

                if (!nomeCaixa || nomeCaixa === "0") return;

                if (!mapaCaixas[nomeCaixa]) {

                    const caixaSalva = caixasRef.current.find(
                        c => c.id === nomeCaixa
                    ) || caixasSalvas.find(
                        c => c.id === nomeCaixa
                    );

                    // EX:
                    // 001A - 1
                    // 001A/001B - 1
                    const match = nomeCaixa.match(/^(.+)\s-\s(\d+)$/);

                    const grupo =
                        caixaSalva?.grupo ||
                        match?.[1] ||
                        "SEM_LOC";

                    const sequencia =
                        caixaSalva?.sequencia ||
                        Number(match?.[2] || 1);

                    const novaCaixa = {
                        id: nomeCaixa,
                        numero: nomeCaixa,
                        grupo,
                        prateleira: grupo,
                        localizacoes: grupo.includes("/")
                            ? grupo.split("/")
                            : [grupo],

                        sequencia,

                        itens: [],

                        jaImprimiu: true,
                        origem: "API",

                        cheia: caixaSalva?.cheia ?? false
                    };

                    mapaCaixas[nomeCaixa] = novaCaixa;

                    novasCaixas.push(novaCaixa);
                }
            });

            agrupamentosSalvos.forEach(grupo => {

                const caixasDoGrupo = novasCaixas.filter(caixa =>
                    grupo.localizacoes.some(loc =>
                        caixa.grupo?.includes(loc)
                    )
                );

                caixasDoGrupo.forEach(caixa => {

                    caixa.grupo = grupo.nome;
                    caixa.prateleira = grupo.nome;

                    caixa.localizacoes =
                        grupo.localizacoes;
                });
            });

            const itensComCaixaCorrigida = todosItens.map(item => {

                // JÁ POSSUI CAIXA LOCAL
                if (item.caixaId) {

                    const caixaLocal = novasCaixas.find(
                        c => c.id === item.caixaId
                    );

                    return item;
                }

                // USA CAIXA DA API
                if (item.caixaApi) {

                    const caixaObj = mapaCaixas[item.caixaApi];

                    if (caixaObj) {

                        return {
                            ...item,
                            caixaId: caixaObj.id
                        };
                    }
                }

                return item;
            });

            // Preenche as caixas da api com os itens
            novasCaixas = novasCaixas.map(caixa => ({
                ...caixa,
                itens: itensComCaixaCorrigida.filter(i => i.caixaId === caixa.id)
            }));

            console.log("ITENS CARREGADOS:", itensComCaixaCorrigida);
            console.log("CAIXAS CARREGADAS:", novasCaixas);
            console.log("SUGESTOES COMPLETAS:", sugestoes);

            if (sugestoes.length > 0) {
                setDialogAgrupamentos({
                    open: true,
                    sugestoes
                });
            }

            setItens(itensComCaixaCorrigida);
            atualizarCaixas(novasCaixas);

        } catch (error) {
            console.error("Erro no carregarTudo:", error);
        } finally {
            setLoading(false);
        }
    };

    const itensNulos = itens.filter((item) => {
        const erros = [];

        const localizacao = String(item.localizacao ?? "").trim().toUpperCase();
        const basico = String(item.basico ?? "").trim().toUpperCase();
        const cean = String(item.codigo_barras ?? "").trim().toUpperCase();

        if (localizacao === "" || localizacao === "SEM LOCALIZAÇÃO") {
            erros.push("localização");
        }

        if (basico === "" || basico === "-") {
            erros.push("basico");
        }

        if (cean === "" || cean === "SEM GTIN") {
            erros.push("cean");
        }

        if (erros.length) {
            console.log(item.id, erros);
        }

        return erros.length > 0;
    });

    const registrarLog = async ({
        item = null,
        acao,
        caixa = null,
        quantidade = null,
        observacao = ""
    }) => {

        try {

            console.log({
                nfe_item_id: item?.id ?? null,
                nota_id: notaAtual?.id,
                usuario: userInfo.codigo,
                acao,
                local_anterior: item?.localizacao ?? null,
                local_novo: item?.localizacao ?? null,
                status_anterior: item?.status ?? null,
                status_novo: item?.status ?? null,
                cod_produto: item?.basico ?? null,
                cod_barras: item?.codigo_barras ?? null,
                quantidade: quantidade ?? null,
                caixa: caixa?.numero ?? null,
                observacoes: observacao
            });

            const response = await fetch(
                `${API}/api/nfe/item/movimentacao/log`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-Auth-Token": token
                    },
                    body: JSON.stringify({
                        nfe_item_id: item?.id ?? null,
                        nota_id: notaAtual?.id,

                        usuario: userInfo.codigo,

                        acao,

                        local_anterior: item?.localizacao ?? null,
                        local_novo: item?.localizacao ?? null,

                        status_anterior: item?.status ?? null,
                        status_novo: item?.status ?? null,

                        cod_produto: item?.basico ?? null,
                        cod_barras: item?.codigo_barras ?? null,

                        quantidade: quantidade ?? null,

                        caixa: caixa?.numero ?? null,

                        observacoes: observacao ?? null,
                    })
                }
            );

            console.log("ENVIANDO LOG:", acao)
            if (!response.ok) {
                const text = await response.text();
                throw new Error(text);
            }

        } catch (error) {
            console.error("Erro ao enviar log: ", error);
        }
    };

    const iniciarConferencia = async () => {
        try {
            for (const nota of notaInfo) {
                const response = await fetch(
                    `${API}/api/nfe/finalizar_nfe/${nota.serie}/${nota.numero}`,
                    {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                            "X-Auth-Token": token
                        },
                        body: JSON.stringify({
                            status: "EM_CONFERENCIA"
                        })
                    }
                );

                console.log("ATUALIZANDO STATUS DA NOTA: EM_CONFERENCIA")

                const text = await response.text();

                if (!response.ok) {
                    throw new Error(text || "Erro ao enviar status EM_CONFERENCIA");
                }

                registrarLog({
                    acao: "Iniciou conferência"
                });

            }
        } catch (error) {
            console.error(error);
        }
    }

    async function atribuirNotas() {
        try {
            console.log(`Atribuindo nota ${notaAtual.numero} ao usuário ${userInfo?.nome}...`)
            console.log(`Prioridade da NF ${notaAtual?.numero}: ${notaAtual?.prioridade}`)
            const response = await fetch(
                `${API}/api/notas/atribuir`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        nota_id: notaAtual?.id,
                        usuarios: [userInfo?.codigo],
                        prioridade: notaAtual?.prioridade
                    })
                }
            );

            const data = await response.json();

            console.log("STATUS:", response.status);
            console.log("RETORNO:", data);

            if (!response.ok) {
                throw new Error(data.erro || "Erro ao atribuir nota");
            }

        } catch (error) {
            console.error(error);
            console.log(error)
        } finally {
            console.log(`Nota atribuida somente ao usuario ${userInfo?.nome}`)

        }
    }

    // Fecha caixa e envia para API
    const enviarItensDaCaixa = async (caixa, itensAtualizados = itens) => {
        try {

            const itensDaCaixa = itensAtualizados.filter(i =>
                i.caixaId === caixa.id
            );

            if (itensDaCaixa.length === 0) return true;

            for (const item of itensDaCaixa) {

                const codigoEnvio =
                    item.codigo_barras && item.codigo_barras !== "SEM GTIN"
                        ? item.codigo_barras
                        : item.codigo_produto;

                if (!codigoEnvio) {
                    setSnackbar({
                        open: true,
                        message: "Código inválido para envio",
                        severity: "error"
                    });
                    return false;
                }

                const hoje = new Date().toISOString().slice(0, 19).replace("T", " ")
                console.log("ENVIANDO PARA API A CAIXA: ", caixa.numero)
                console.log("LOCALIZAÇÃO EM CONFERENCIA: ", item.localizacao)

                const response = await fetch(
                    `${API}/api/atualizar_item/${item.notaId}/${codigoEnvio}`,
                    {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            status_item: item.conferido === item.quantidade
                                ? "ITEM_CONFERIDO"
                                : "CONFERIDO_PARCIAL",

                            caixa: caixa.numero,
                            conferente: userInfo?.codigo,
                            qtd_conferida: item.conferido,
                            loc_em_conferencia: item.localizacao,
                            data_conferencia: hoje
                        })
                    }
                );

                console.log("STATUS_ENVIO_CAIXA:", response.status);

                if (response.status === 401) {
                    logout();
                    return false;
                }

                if (!response.ok) {
                    const text = await response.text();
                    throw new Error(text);
                }
            }

            return true;

        } catch (error) {
            console.error(error);

            setSnackbar({
                open: true,
                message: `Erro ao enviar itens da caixa ${caixa.numero}`,
                severity: "error"
            });

            return false;
        }
    };

    const getPrateleira = (localizacao) => {
        if (!localizacao) return "SEM_LOC";

        // Pega só a primeira parte das localizações, antes do espaço
        return localizacao.split(" ")[0];
    };

    const obterOuCriarCaixa = (localizacao) => {

        const prateleira = getPrateleira(localizacao);

        const grupo = buscarGrupoDaLocalizacao(prateleira);

        const chaveGrupo = grupo
            ? grupo.nome
            : prateleira;

        const caixaExistente = caixasRef.current.find(c =>
            c.grupo === chaveGrupo &&
            c.cheia !== true
        );

        if (caixaExistente) return caixaExistente;

        const caixasMesmaPrateleira = caixasRef.current.filter(c =>
            c.grupo === chaveGrupo
        );

        const maiorSequencia = caixasMesmaPrateleira.length > 0
            ? Math.max(...caixasMesmaPrateleira.map(c => c.sequencia || 1))
            : 0;

        const novaSequencia = maiorSequencia + 1;

        const numero = `${chaveGrupo} - ${novaSequencia}`;

        return {
            id: numero,
            numero,
            grupo: chaveGrupo,
            prateleira,
            localizacoes: grupo
                ? grupo.localizacoes
                : [prateleira],
            sequencia: novaSequencia,
            cheia: false,
            itens: [],
            jaImprimiu: false
        };
    };

    // Agrupa localizações para usar nas caixas
    const buscarGrupoDaLocalizacao = (prateleira) => {

        return gruposLocalizacao.find(g =>
            g.localizacoes.includes(prateleira)
        );
    };

    const resolverCaixa = (item) => {

        // ITEM JÁ POSSUI CAIXA
        if (item.caixaId) {

            const caixaItem = caixasRef.current.find(
                c => c.id === item.caixaId
            );

            if (caixaItem) {

                // CAIXA DO ITEM ESTÁ CHEIA
                if (caixaItem.cheia) {

                    return {
                        caixa: caixaItem,
                        origem: "ITEM_CAIXA_CHEIA"
                    };
                }

                return {
                    caixa: caixaItem,
                    origem: "ITEM"
                };
            }
        }

        // PRIORIDADE TOTAL:
        // SE EXISTE CAIXA ABERTA, USA ELA
        if (caixaAberta) {

            return {
                caixa: caixaAberta,
                origem: "MANUAL"
            };
        }

        const prateleira = getPrateleira(item.localizacao);

        const grupo = buscarGrupoDaLocalizacao(prateleira);

        const chaveGrupo = grupo
            ? grupo.nome
            : prateleira;

        // PROCURA CAIXA DISPONÍVEL
        const caixaDisponivel = caixasRef.current.find(c =>
            c.grupo === chaveGrupo &&
            !c.cheia
        );

        if (caixaDisponivel) {

            return {
                caixa: caixaDisponivel,
                origem: "AUTO"
            };
        }

        // CRIA NOVA
        return {
            caixa: obterOuCriarCaixa(item.localizacao),
            origem: "NOVA"
        };
        console.log("CAIXAS REF:", caixasRef.current);
        console.log("ITEM:", item);
    };

    // Abrir nova caixa
    const abrirCaixa = () => {
        const novaCaixa = { id: Date.now(), itens: [] };
        setCaixaAberta(novaCaixa);
        registrarLog({
            acao: "Abriu caixa"
        });
    };

    // Fechar caixa
    const fecharCaixa = () => {
        if (!caixaAberta) return;
        atualizarCaixas([...caixas, caixaAberta]);
        setCaixaAberta(null);
        registrarLog({
            caixa: caixaAberta,
            acao: "Fechou caixa"
        });
    };

    const confirmarFechamento = async () => {
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
            jaImprimiu: caixaAberta.jaImprimiu || false,
            reaberta: false,
            cheia: caixaAberta.cheia || false
        };

        if (!caixaFinal.jaImprimiu) {
            imprimirEtiquetaCaixa(caixaFinal);
            caixaFinal.jaImprimiu = true;
        }

        const sucesso = await enviarItensDaCaixa(
            caixaFinal,
            itens
        );

        if (!sucesso) {
            return; // Não fecha se deu erro
        }

        atualizarCaixas(prev => {
            const existe = prev.some(c => c.id === caixaFinal.id);
            if (existe) {
                return prev.map(c => c.id === caixaFinal.id ? caixaFinal : c);
            }
            return [...prev, caixaFinal];
        });

        setCaixaAberta(null);
        setNumeroCaixa("");
        setOpenFecharDialog(false);

        registrarLog({
            caixa: caixaAberta,
            acao: "Fechou caixa"
        });

        setSnackbar({
            open: true,
            message: `Caixa ${caixaFinal.numero} fechada`,
            severity: "success"
        });
    };

    // Reabre caixa para adicionar mais itens
    const reabrirCaixa = (caixa) => {

        // Bloqueia se caixa estiver cheia
        if (caixa.cheia) {
            setSnackbar({
                open: true,
                message: "Caixa está marcada como cheia",
                severity: "warning"
            });
            return;
        }

        // Bloqueia se usuário estiver com caixa aberta
        if (caixaAberta) {
            setSnackbar({
                open: true,
                message: "Feche a caixa atual antes de reabrir outra",
                severity: "warning"
            });
            return;
        }

        // Remove das fechadas
        atualizarCaixas(prev => prev.filter(c => c.id !== caixa.id));

        // Recalcula os itens com base no estado atual
        const itensAtualizados = itens
            .filter(i => i.caixaId === caixa.id)
            .map(i => ({ ...i, caixaId: caixa.id }));

        setCaixaAberta({
            ...caixa,
            itens: itensAtualizados,
            reaberta: true,
        });

        registrarLog({
            caixa,
            acao: "Reabriu caixa"
        });

        setSnackbar({
            open: true,
            message: `Caixa ${caixa.numero} reaberta`,
            severity: "info"
        });
    };

    const abrirConfirmacaoRemoverItem = (item) => {
        setConfirmDialog({
            open: true,
            type: "remover_item",
            payload: item
        });
        registrarLog({
            item: item,
            caixa: caixaAberta,
            quantidade: 1,
            acao: "Removeu item da caixa"
        });
    };

    const abrirConfirmacaoRemoverCaixa = (caixa) => {
        setConfirmDialog({
            open: true,
            type: "remover_caixa",
            payload: caixa
        });
        registrarLog({
            caixa,
            acao: "Removeu caixa vazia"
        });
    };

    const confirmarAcao = () => {
        const { type, payload } = confirmDialog;

        if (type === "remover_item") {
            removerItemDaCaixa(payload);
        }

        if (type === "remover_caixa") {
            atualizarCaixas(prev => prev.filter(c => c.id !== payload.id));

            setSnackbar({
                open: true,
                message: `Caixa ${payload.numero} removida com sucesso!`,
                severity: "success"
            });
        }

        setConfirmDialog({ open: false, type: null, payload: null });
    };

    const removerItemDaCaixa = async (itemAlvo) => {

        const novosItens = [...itens];

        const index = novosItens.findIndex(i =>
            i.codigo_barras === itemAlvo.codigo_barras &&
            i.notaId === itemAlvo.notaId
        );

        if (index === -1) return;

        const itemOriginal = itens[index];

        if (itemOriginal.conferido <= 0) return;

        const item = {
            ...itemOriginal,
            conferido: itemOriginal.conferido - 1,
        };

        // Código necessário caso o item saia completamente da caixa
        let codigoEnvio = null;

        if (item.conferido === 0) {

            codigoEnvio =
                item.codigo_barras &&
                    item.codigo_barras !== "SEM GTIN"
                    ? item.codigo_barras
                    : item.codigo_produto;

            if (!codigoEnvio) {

                setSnackbar({
                    open: true,
                    message: "Código inválido para atualizar o item",
                    severity: "error"
                });

                return;
            }
        }

        // Devolve UMA unidade para PENDENTE
        const unidadeDesconferida = await desconferirUnidade(
            itemOriginal.id,
            1
        );

        if (!unidadeDesconferida) {
            return;
        }

        // Só envia para API quando o item sair completamente da caixa
        if (item.conferido === 0) {

            try {

                const hoje = new Date()
                    .toISOString()
                    .slice(0, 19)
                    .replace("T", " ");

                console.log("REMOVENDO ITEM DA CAIXA");
                console.log("NFE ITEM:", item.id);
                console.log("NOTA:", item.notaId);
                console.log("CÓDIGO:", codigoEnvio);
                console.log("CAIXA:", item.caixaId);

                const response = await fetch(
                    `${API}/api/atualizar_item/${item.notaId}/${codigoEnvio}`,
                    {
                        method: "PUT",

                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${token}`
                        },

                        body: JSON.stringify({
                            status_item: "CONFERIDO_PARCIAL",
                            // Remove o item da caixa
                            caixa: 0,
                            conferente: userInfo?.codigo,
                            qtd_conferida: 0,
                            loc_em_conferencia: item.localizacao,
                            data_conferencia: hoje
                        })
                    }
                );

                console.log(
                    "STATUS_REMOVER_ITEM:",
                    response.status
                );

                if (response.status === 401) {

                    logout();
                    return;
                }

                if (!response.ok) {

                    const text = await response.text();

                    throw new Error(text);
                }

                // Só remove a associação local da caixa
                // depois que a API confirmou
                item.caixaId = null;

            } catch (error) {

                console.error(
                    "Erro ao remover item da caixa:",
                    error
                );

                setSnackbar({
                    open: true,
                    message: "Erro ao remover item da caixa",
                    severity: "error"
                });

                return;
            }
        }

        // Atualiza lista local
        novosItens.splice(index, 1);

        novosItens.unshift(item);

        setItens(novosItens);

        // Atualiza caixa aberta
        if (caixaAberta) {

            setCaixaAberta(prev => ({
                ...prev,

                itens: novosItens.filter(
                    i => i.caixaId === prev.id
                )
            }));
        }

        setSnackbar({
            open: true,
            message: "Item removido da caixa",
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

    // Valida caixa
    const caixaInvalida = (caixa) => {
        return (
            !caixa ||
            caixa === "0" ||
            caixa === 0 ||
            caixa === "" ||
            caixa === "DESCONHECIDA"
        );
    };

    // Marca caixa como cheia
    const toggleCaixaCheia = (caixaId) => {

        atualizarCaixas(prev =>
            prev.map(c =>
                c.id === caixaId
                    ? { ...c, cheia: !c.cheia }
                    : c
            )
        );

        setCaixaAberta(prev => {

            if (!prev || prev.id !== caixaId) {
                return prev;
            }

            return {
                ...prev,
                cheia: !prev.cheia
            };
        });
    };

    // Altera status das unidades IDs unicos
    const conferirUnidades = async (nfeItemId, quantidade) => {
        try {

            const response = await fetch(
                `${API}/api/conferencia/conferir_unidades`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        nfe_item_id: nfeItemId,
                        quantidade: quantidade
                    })
                }
            );

            const data = await response.json();

            if (response.status === 401) {
                logout();
                return false;
            }

            if (!response.ok) {
                throw new Error(
                    data.erro || "Erro ao conferir unidades"
                );
            }

            console.log("UNIDADES CONFERIDAS:", data.unidades);

            return data;

        } catch (error) {

            console.error(
                "Erro ao conferir unidades:",
                error
            );

            setSnackbar({
                open: true,
                message: error.message || "Erro ao conferir unidades",
                severity: "error"
            });

            return false;
        }
    };

    // Remove itens da caixa e altera para PENDENTE
    const desconferirUnidade = async (nfeItemId, quantidade = 1) => {
        try {
            const response = await fetch(
                `${API}/api/conferencia/desconferir_unidade`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        nfe_item_id: nfeItemId,
                        quantidade: quantidade
                    })
                }
            );

            const data = await response.json();

            if (response.status === 401) {
                logout();
                return false;
            }

            if (!response.ok) {
                throw new Error(
                    data.erro ||
                    "Erro ao devolver unidade para PENDENTE"
                );
            }

            if (data.legado) {
                console.warn(
                    "ITEM LEGADO: nenhuma unidade CONFERIDO encontrada.",
                    {
                        nfeItemId,
                        quantidade
                    }
                );

            } else {
                console.log("UNIDADES DESCONFERIDAS:", data.unidades);
            }

            return data;

        } catch (error) {
            console.error(
                "Erro ao desconferir unidade:",
                error
            );

            setSnackbar({
                open: true,
                message:
                    error.message ||
                    "Erro ao devolver unidade",
                severity: "error"
            });

            return false;
        }
    };

    // Identifica digitação para conferir item
    const handleCodigoKeyDown = async (e) => {

        if (bloqueioManual) {
            e.preventDefault();
            return;
        }

        if (!inicioLeitura && e.key.length === 1) {
            setInicioLeitura(Date.now());
        }

        if (e.key !== "Enter") {
            return;
        }

        e.preventDefault();

        const duracao = inicioLeitura
            ? Date.now() - inicioLeitura
            : 0;

        const codigoRecebido = codigo.trim();

        console.log(
            `Código: ${codigoRecebido} | Duração: ${duracao}ms`
        );

        setInicioLeitura(null);

        if (!codigoRecebido) {
            setCodigo("");
            return;
        }

        /* DIGITAÇÃO MANUAL */
        if (
            codigoRecebido.length >= 8 &&
            duracao > 2500
        ) {

            registrarLog({
                acao: "Tentativa de digitação de código de barras",
                observacao: `Código digitado: ${codigoRecebido}`
            });

            setCodigoManualPendente(codigoRecebido);

            setCodigo("");

            const sucesso =
                await solicitarAutorizacaoManual(
                    codigoRecebido
                );

            if (!sucesso) {
                setCodigoManualPendente(null);
            }

            return;
        }

        /* SCANNER FÍSICO */
        await scanner(codigoRecebido);
    };

    // Scanner
    const scanner = async (codigoForcado = null) => {

        if (processandoScanner) return;

        setProcessandoScanner(true);

        try {

            const codigoLimpo = (
                codigoForcado ?? codigo
            ).trim();

            if (!codigoLimpo) return;

            // VALIDA IMPRESSORA
            if (!printer || !printer.trim()) {

                setSnackbar({
                    open: true,
                    message: "Selecione uma impressora antes de conferir itens",
                    severity: "warning"
                });

                setCodigo("");

                return;
            }

            // BUSCA ITEM

            const index = itens.findIndex(item => {

                const codigoBarrasValido =
                    item.codigo_barras &&
                    item.codigo_barras !== "SEM GTIN";

                return (
                    (codigoBarrasValido &&
                        item.codigo_barras === codigoLimpo) ||
                    item.codigo_produto === codigoLimpo
                );
            });

            // NÃO ENCONTRADO
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

            const itemAtual = itens[index];

            // QUANTIDADE TOTAL JÁ CONFERIDA
            if (itemAtual.conferido >= itemAtual.quantidade) {

                setSnackbar({
                    open: true,
                    message: "Quantidade total já conferida",
                    severity: "info"
                });

                setCodigo("");
                return;
            }

            // MODO AGRUPAMENTO
            if (modoAgrupamento) {

                const quantidade = Number(quantidadeInput);
                const tamanhoGrupo = Number(tamanhoGrupoInput);

                if (modoEtiqueta === "bremsys") {
                    setSnackbar({
                        open: true,
                        message: "Não é permitido agrupar itens da marca Bremsys",
                        severity: "warning"
                    });

                    setCodigo("");
                    return;
                }

                if (!quantidade || quantidade <= 0) {
                    setSnackbar({
                        open: true,
                        message: "Informe uma quantidade válida",
                        severity: "warning"
                    });

                    setCodigo("");
                    return;
                }

                if (!tamanhoGrupo || tamanhoGrupo <= 0) {
                    setSnackbar({
                        open: true,
                        message: "Informe um tamanho de grupo válido",
                        severity: "warning"
                    });

                    setCodigo("");
                    setTimeout(() => grupoRef.current?.focus(), 100);
                    return;
                }

                if (quantidade % tamanhoGrupo !== 0) {
                    setSnackbar({
                        open: true,
                        message: "A quantidade deve ser dividida igualmente entre os grupos",
                        severity: "warning"
                    });

                    setCodigo("");
                    setTimeout(() => grupoRef.current?.focus(), 100);
                    return;
                }

                const restante =
                    itemAtual.quantidade - itemAtual.conferido;

                if (quantidade > restante) {
                    setSnackbar({
                        open: true,
                        message: `Quantidade solicitada maior que o restante (${restante})`,
                        severity: "warning"
                    });

                    setCodigo("");
                    return;
                }
            }

            // Procura caixa
            const resultadoCaixa = resolverCaixa(itemAtual);

            let caixaDestino = resultadoCaixa.caixa;

            // Item possui caixa cheia
            if (resultadoCaixa.origem === "ITEM_CAIXA_CHEIA") {

                setModalCaixaItem({
                    open: true,
                    item: itemAtual,
                    caixa: caixaDestino,
                    cheia: true
                });

                // Se existe caixa aberta, usa ela
                if (caixaAberta && !caixaAberta.cheia) {

                    caixaDestino = caixaAberta;

                } else {

                    setCodigo("");
                    return;
                }
            }

            // Item possui caixa fixa
            if (resultadoCaixa.origem === "ITEM") {

                const caixaAtualizada = caixasRef.current.find(
                    c => c.id === caixaDestino.id
                );

                // Caixa original do item está cheia
                if (caixaAtualizada?.cheia) {

                    setModalCaixaItem({
                        open: true,
                        item: itemAtual,
                        caixa: caixaAtualizada,
                        cheia: true
                    });

                    setCodigo("");

                    return;
                }

                // Caixa disponível -> usa obrigatoriamente ela
                caixaDestino = caixaAtualizada || caixaDestino;
            }

            // Caixa cheia
            if (caixaDestino?.cheia) {

                setSnackbar({
                    open: true,
                    message: `Caixa ${caixaDestino.numero} está cheia`,
                    severity: "warning"
                });

                setCodigo("");
                return;
            }

            // MODO AGRUPAMENTO
            if (modoAgrupamento) {

                const quantidade = Number(quantidadeInput);
                const tamanhoGrupo = Number(tamanhoGrupoInput);

                const resposta = await fetch(
                    `${API}/api/conferencia/agrupar`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            nfe_item_id: itemAtual.id,
                            quantidade: quantidade,
                            tamanho_grupo: tamanhoGrupo
                        })
                    }
                );

                const data = await resposta.json();

                if (!resposta.ok) {

                    setSnackbar({
                        open: true,
                        message: data.erro || "Erro ao criar agrupamento",
                        severity: "error"
                    });

                    setCodigo("");
                    return;
                }

                const incremento = quantidade;

                const ehCaixaNova = !caixasRef.current.some(
                    c => c.id === caixaDestino.id
                );

                // Garante que a caixa existe
                addCaixaSafe({
                    ...caixaDestino,
                    itens: caixaDestino.itens || []
                });

                // Atualiza quantidade conferida do item
                const novosItensBase = itens.map((i, idx) => {

                    if (idx !== index) return i;

                    return {
                        ...i,
                        conferido: i.conferido + incremento,
                        caixaId: caixaDestino.id
                    };
                });

                const itemAtualizado = novosItensBase[index];

                // Ordena item escaneado para cima e se conferido, vai para baixo 
                const listaFinal = [
                    itemAtualizado,
                    ...novosItensBase.filter((_, idx) => idx !== index)
                ].sort((a, b) => {

                    const aFinalizado =
                        Number(a.conferido) >= Number(a.quantidade);

                    const bFinalizado =
                        Number(b.conferido) >= Number(b.quantidade);

                    if (aFinalizado && !bFinalizado) return 1;
                    if (!aFinalizado && bFinalizado) return -1;

                    if (a === itemAtualizado) return -1;
                    if (b === itemAtualizado) return 1;

                    return 0;
                });

                setItens(listaFinal);

                // Atualiza caixa
                const caixasAtualizadas = [
                    ...caixasRef.current.filter(
                        c => c.id !== caixaDestino.id
                    ),
                    {
                        ...caixaDestino,
                        itens: listaFinal.filter(
                            i => i.caixaId === caixaDestino.id
                        ),
                        jaImprimiu: caixaDestino.jaImprimiu ?? false,
                        cheia: caixaDestino.cheia ?? false
                    }
                ];

                atualizarCaixas(caixasAtualizadas);

                // Caixa final
                const caixaFinal = {
                    ...caixaDestino,
                    itens: listaFinal.filter(
                        i => i.caixaId === caixaDestino.id
                    ),
                    jaImprimiu: caixaDestino.jaImprimiu ?? false,
                    cheia: caixaDestino.cheia ?? false
                };

                // Envia os itens da caixa para a API existente
                const sucesso = await enviarItensDaCaixa(
                    caixaFinal,
                    listaFinal
                );

                if (!sucesso) {
                    return;
                }

                await iniciarConferencia();
                await atribuirNotas();

                // Imprime uma etiqueta para cada grupo criado
                for (const grupo of data.grupos) {

                    await imprimirEtiquetaGrupo(
                        itemAtual,
                        grupo
                    );
                }

                // Logs
                registrarLog({
                    item: itemAtual,
                    quantidade: incremento,
                    caixa: caixaFinal,
                    acao: "Escaneou item em modo agrupamento"
                });

                if (ehCaixaNova) {

                    registrarLog({
                        caixa: caixaFinal,
                        acao: "Criou caixa"
                    });
                }

                if (
                    ehCaixaNova &&
                    !caixaFinal.jaImprimiu
                ) {

                    await imprimirEtiquetaCaixa(caixaFinal);

                    caixaFinal.jaImprimiu = true;

                    atualizarCaixas(prev =>
                        prev.map(c =>
                            c.id === caixaDestino.id
                                ? {
                                    ...c,
                                    jaImprimiu: true
                                }
                                : c
                        )
                    );
                }

                setUltimoItemScaneado(itemAtualizado);

                registrarLog({
                    item: itemAtual,
                    quantidade: incremento,
                    caixa: caixaFinal,
                    acao: `Item agrupado e adicionado na caixa ${caixaFinal.numero}`
                });

                setSnackbar({
                    open: true,
                    message: `${data.quantidade_grupos} grupos criados e adicionados à caixa ${caixaFinal.numero}`,
                    severity: "success"
                });

                setCodigo("");

                return;
            }

            const ehCaixaNova = !caixasRef.current.some(
                c => c.id === caixaDestino.id
            );

            // Garante que a caixa existe
            addCaixaSafe({
                ...caixaDestino,
                itens: caixaDestino.itens || []
            });

            // Modo quantidade

            let incremento = 1;

            if (modoQuantidade) {

                let qtd = Number(quantidadeInput);

                if (!qtd || qtd <= 0) {

                    setSnackbar({
                        open: true,
                        message: "Informe uma quantidade válida",
                        severity: "warning"
                    });

                    return;
                }

                const restante =
                    itemAtual.quantidade - itemAtual.conferido;

                if (qtd > restante) {

                    qtd = restante;

                    setSnackbar({
                        open: true,
                        message: `Quantidade ajustada para ${restante}`,
                        severity: "warning"
                    });
                }

                incremento = qtd;

                setQuantidadeInput("");
            }

            // Altera status das unidades IDs únicos
            const unidadesConferidas = await conferirUnidades(
                itemAtual.id,
                incremento
            );

            if (!unidadesConferidas) {
                return;
            }

            // Imprime etiqueta dos itens
            for (let i = 0; i < incremento; i++) {
                await imprimirEtiqueta(itemAtual);
            }

            // Atualiza itens
            const novosItensBase = itens.map((i, idx) => {

                if (idx !== index) return i;

                return {
                    ...i,
                    conferido: i.conferido + incremento,
                    caixaId: caixaDestino.id
                };
            });

            // Move item recém conferido vai para o topo
            const itemAtualizado = novosItensBase[index];

            // Ordena:
            // 1. Itens pendentes primeiro
            // 2. Itens conferidos por último
            // 3. Item recém bipado sobe dentro dos pendentes
            const listaFinal = [
                itemAtualizado,
                ...novosItensBase.filter((_, idx) => idx !== index)
            ].sort((a, b) => {

                const aFinalizado =
                    Number(a.conferido) >= Number(a.quantidade);

                const bFinalizado =
                    Number(b.conferido) >= Number(b.quantidade);

                // finalizados vão pro final
                if (aFinalizado && !bFinalizado) return 1;
                if (!aFinalizado && bFinalizado) return -1;

                // mantém recém bipado no topo dos pendentes
                if (a === itemAtualizado) return -1;
                if (b === itemAtualizado) return 1;

                return 0;
            });

            setItens(listaFinal);

            // Atualiza caixa
            const caixasAtualizadas = [
                ...caixasRef.current.filter(c => c.id !== caixaDestino.id),
                {
                    ...caixaDestino,
                    itens: listaFinal.filter(i => i.caixaId === caixaDestino.id),
                    jaImprimiu: caixaDestino.jaImprimiu ?? false,
                    cheia: caixaDestino.cheia ?? false
                }
            ];

            atualizarCaixas(caixasAtualizadas);

            // Caixa final
            const caixaFinal = {
                ...caixaDestino,
                itens: listaFinal.filter(
                    i => i.caixaId === caixaDestino.id
                ),
                jaImprimiu: caixaDestino.jaImprimiu ?? false,
                cheia: caixaDestino.cheia ?? false
            };

            // Envia itens pra API
            const sucesso = await enviarItensDaCaixa(caixaFinal, listaFinal);

            if (!sucesso) {
                return;
            }

            await iniciarConferencia();
            await atribuirNotas();

            registrarLog({
                item: itemAtual,
                quantidade: incremento,
                caixa: caixaFinal,
                acao: "Escaneou item"
            });

            if (ehCaixaNova) {
                registrarLog({
                    caixa: caixaFinal,
                    acao: "Criou caixa"
                });
            }

            const caixaAtualState = caixasRef.current.find(
                c => c.id === caixaDestino.id
            );

            if (ehCaixaNova && !caixaFinal.jaImprimiu) {

                await imprimirEtiquetaCaixa(caixaFinal);

                caixaFinal.jaImprimiu = true;

                atualizarCaixas(prev =>
                    prev.map(c =>
                        c.id === caixaDestino.id
                            ? {
                                ...c,
                                jaImprimiu: true
                            }
                            : c
                    )
                );
            }

            // Feedback
            setUltimoItemScaneado(itemAtualizado);

            registrarLog({
                item: itemAtual,
                quantidade: incremento,
                caixa: caixaFinal,
                acao: `Item adicionado na caixa ${caixaFinal.numero}`
            });

            setSnackbar({
                open: true,
                message: `Item adicionado na caixa ${caixaFinal.numero}`,
                severity: "success"
            });

            setCodigo("");

        } catch (error) {

            console.error(error);

            setSnackbar({
                open: true,
                message: "Erro ao ler código de barras",
                severity: "error"
            });

        } finally {

            setProcessandoScanner(false);

            setTimeout(() => {
                inputRef.current?.focus();
            }, 50);
        }
    };

    // Impressão de etiquetas de peça
    const gerarZPLPadrao = (unidade, qr) => {
        const url = `http://192.168.1.82:4173/Rastreio/${unidade.id_unico}`;

        return `
^XA
^PW480
^LL240
^LH0,0

^PR3
^MD15

^FO10,20
^BQN,2,6
^FDLA,${url}^FS

^FO60,210
^A0N,30,30
^FD${unidade.id_unico}^FS

^FO190,30
^A0N,35,35
^FD${unidade.basico}^FS

^FO190,70
^A0N,45,50
^FD${unidade.loc_sistema}^FS

^FO190,140
^A0N,30,30
^FD${unidade.numero}/${unidade.serie}^FS

^FO190,170
^A0N,28,28
^FD${new Date().toLocaleString("pt-BR")}^FS

^FO440,70
^A0B,35,35
^FD${userInfo?.codigo || ""}^FS

^XZ

`;
    }

    const gerarZPLBremsys = (unidade, qr) => {
        const url = `http://192.168.1.82:4173/Rastreio/${unidade.id_unico}`;

        const dataHora = new Date().toLocaleString("pt-BR");

        // Limpa os campos recebidos da API
        const idUnico = (unidade.id_unico || "").trim();
        const basico = (unidade.basico || "").trim();
        const localizacao = (unidade.loc_sistema || "").trim();
        const numero = (unidade.numero || "").trim();
        const serie = (unidade.serie || "").trim();
        const descricao = (unidade.descricao || "").trim();
        const codigoBarras = (unidade.cean || "").trim();

        return `
^XA
^PW840
^LL480
^LH0,0

^PR3
^MD15

^FO80,120
^BQN,2,6
^FDLA,${url}^FS

^FO140,380
^A0N,25,25
^FD${idUnico}^FS

^FO300,220
^A0N,32,32
^FD${basico}^FS

^FO300,260
^A0N,40,42
^FD${localizacao}^FS

^FO300,315
^A0N,26,26
^FD${numero}/${serie}^FS

^FO300,340
^A0N,23,23
^FD${dataHora}^FS

^FO500,240
^A0B,30,30
^FD${userInfo?.codigo || ""}^FS

^FO250,420
^BY4,3,70
^BEN,70,Y,N
^FD${codigoBarras}^FS

^FO300,540
^A0N,22,22
^FB750,2,0,L,0
^FD${descricao}^FS

^XZ
`;
    };

    // Impressão de etiquetas de grupo
    const gerarZPLGrupoPadrao = (item, grupo) => {

        const url = `http://192.168.1.82:4173/Rastreio/grupo/${grupo.id_grupo}`;
        const idGrupo = (grupo.id_grupo || "").trim();
        const basico = (item.basico || "").trim();
        const localizacao = (item.localizacao || "").trim();
        const numero = (item.notaNumero || "").trim();
        const serie = (item.notaSerie || "").trim();
        const quantidade = grupo.quantidade || 0;

        return `
^XA
^PW480
^LL240
^LH0,0

^PR3
^MD15

^FO10,20
^BQN,2,6
^FDLA,${url}^FS

^FO190,115
^A0N,30,30
^FDQTD: ${quantidade}^FS

^FO20,210
^A0N,30,30
^FD${idGrupo}^FS

^FO190,30
^A0N,35,35
^FD${basico}^FS

^FO190,70
^A0N,45,50
^FD${localizacao}^FS

^FO190,150
^A0N,30,30
^FD${numero}/${serie}^FS

^FO190,180
^A0N,28,28
^FD${new Date().toLocaleString("pt-BR")}^FS

^FO440,70
^A0B,35,35
^FD${userInfo?.codigo || ""}^FS

^XZ
`;
    };


    const gerarZPLGrupoBremsys = (item, grupo) => {

        const url = `http://192.168.1.82:4173/Rastreio/grupo/${grupo.id_grupo}`;
        const dataHora = new Date().toLocaleString("pt-BR");
        const idGrupo = (grupo.id_grupo || "").trim();
        const basico = (item.basico || "").trim();
        const localizacao = (item.localizacao || "").trim();
        const numero = (item.notaNumero || "").trim();
        const serie = (item.notaSerie || "").trim();
        const descricao = (item.descricao || "").trim();
        const codigoBarras = (item.codigo_barras || "").trim();
        const quantidade = grupo.quantidade || 0;

        return `
^XA
^PW840
^LL480
^LH0,0

^PR3
^MD15

^FO80,120
^BQN,2,6
^FDLA,${url}^FS

^FO140,340
^A0N,25,25
^FDQTD: ${quantidade}^FS

^FO140,370
^A0N,25,25
^FD${idGrupo}^FS

^FO300,220
^A0N,32,32
^FD${basico}^FS

^FO300,260
^A0N,40,42
^FD${localizacao}^FS

^FO300,315
^A0N,26,26
^FD${numero}/${serie}^FS

^FO300,340
^A0N,23,23
^FD${dataHora}^FS

^FO500,240
^A0B,30,30
^FD${userInfo?.codigo || ""}^FS

^FO250,420
^BY4,3,70
^BEN,70,Y,N
^FD${codigoBarras}^FS

^FO300,540
^A0N,22,22
^FB750,2,0,L,0
^FD${descricao}^FS

^XZ
`;
    };

    const imprimirViaPython = async (zpl) => {
        try {
            const printerSalva = localStorage.getItem("printer");

            if (!printerSalva) {
                setSnackbar({
                    open: true,
                    message: "Defina uma impressora antes de imprimir!",
                    severity: "warning"
                });
                return;
            }

            const response = await fetch(`http://127.0.0.1:5000/print`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    tipo: "windows",
                    conteudo: zpl,
                    printer: printerSalva
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
            if (!item.id) {
                setSnackbar({
                    open: true,
                    message: "Item não encontrado.",
                    severity: "error"
                });
                return;
            }

            const res = await fetch(
                `${API}/api/reimpressao/unidades/${item.id}`
            );
            console.log(item.id)

            if (!res.ok) {
                throw new Error("Erro ao buscar unidades.");
            }

            const data = await res.json();

            if (!data.unidades || data.unidades.length === 0) {
                setSnackbar({
                    open: true,
                    message: "Nenhuma etiqueta disponível",
                    severity: "warning"
                });
                return;
            }

            console.log(data.unidades)

            // AQUI ENTRA A FILA LOCAL
            const chaveFila = `fila_${item.id}`;

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

            const zpl =
                modoEtiqueta === "bremsys"
                    ? gerarZPLBremsys(unidade, qr)
                    : gerarZPLPadrao(unidade, qr);

            await imprimirViaPython(zpl);

            registrarLog({
                item,
                acao: "Imprimiu etiqueta do item"
            });

        } catch (error) {
            console.error(error);
            setSnackbar({
                open: true,
                message: "Erro ao imprimir etiqueta",
                severity: "error"
            });
        }
    };

    const imprimirEtiquetaGrupo = async (item, grupo) => {

        try {

            if (!grupo?.id_grupo) {

                setSnackbar({
                    open: true,
                    message: "Grupo inválido para impressão",
                    severity: "error"
                });

                return;
            }

            const zpl =
                modoEtiqueta === "bremsys"
                    ? gerarZPLGrupoBremsys(item, grupo)
                    : gerarZPLGrupoPadrao(item, grupo);

            await imprimirViaPython(zpl);

            registrarLog({
                item,
                grupo: grupo.id_grupo,
                quantidade: grupo.quantidade,
                acao: "Imprimiu etiqueta de grupo"
            });

        } catch (error) {

            console.error(
                "Erro ao imprimir etiqueta de grupo:",
                error
            );

            setSnackbar({
                open: true,
                message: "Erro ao imprimir etiqueta de grupo",
                severity: "error"
            });
        }
    };

    // Impressão etiquetas de caixa
    const gerarZPLCaixaPadrao = (caixa) => {
        const codigoCaixa = caixa.numero;
        const dataAtual = new Date().toLocaleDateString("pt-BR");

        return `
^XA
^PW480
^LL240
^LH0,0

^PR3
^MD15

^FO5,25
^BQN,2,8
^FDLA,${codigoCaixa}^FS

^FO275,15
^A0N,32,32
^FDCAIXA^FS

^FO220,50
^A0N,50,50
^FD${codigoCaixa}^FS

^FO220,120
^A0N,26,26
^FD${new Date().toLocaleString("pt-BR")}^FS

^FO220,160
^A0N,35,35
^FD${userInfo?.codigo}^FS

^XZ
`;
    };

    const gerarZPLCaixaBremsys = (caixa) => {
        const codigoCaixa = caixa.numero;
        const dataAtual = new Date().toLocaleDateString("pt-BR");

        return `
^XA
^PW480
^LL240
^LH0,0

^PR3
^MD15

^FO5,120
^BQN,2,8
^FDLA,${codigoCaixa}^FS

^FO220,110
^A0N,32,32
^FDCAIXA^FS

^FO220,145
^A0N,50,50
^FD${codigoCaixa}^FS

^FO220,235
^A0N,26,26
^FD${new Date().toLocaleString("pt-BR")}^FS

^FO220,315
^A0N,35,35
^FD${userInfo?.codigo}^FS

^XZ
`;
    };

    // Imprime etiqueta chamando API
    const imprimirEtiquetaCaixa = async (caixa) => {
        try {
            const zpl =
                modoEtiqueta === "bremsys"
                    ? gerarZPLCaixaBremsys(caixa)
                    : gerarZPLCaixaPadrao(caixa);

            await imprimirViaPython(zpl);

            registrarLog({
                caixa,
                acao: "Imprimiu etiqueta de caixa"
            });

        } catch (error) {
            console.error("Erro ao imprimir caixa:", error);

            setSnackbar({
                open: true,
                message: "Erro ao imprimir etiqueta da caixa",
                severity: "error"
            });
        }
    };

    const atualizarCaixas = (updater) => {

        setCaixas(prev => {

            const novo =
                typeof updater === "function"
                    ? updater(prev)
                    : updater;

            caixasRef.current = novo;

            return novo;
        });
    };

    // Finalizar conferência
    const finalizarConferencia = async () => {
        try {
            if (!notaInfo || notaInfo.length === 0) {
                setSnackbar({
                    open: true,
                    message: "Sincronize a nota antes de finalizar",
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

            const itensSemCaixa = itens.filter(i => i.conferido > 0 && !i.caixaId);

            if (itensSemCaixa.length > 0) {
                setSnackbar({
                    open: true,
                    message: "Existem itens conferidos sem caixa",
                    severity: "warning"
                });
                return;
            }

            for (const caixa of caixas) {
                const sucesso = await enviarItensDaCaixa(
                    caixa,
                    itens
                );
                if (!sucesso) return;
            }

            console.log({
                status: "CONFERIDA",
                localizacao: localizacaoFinal,
                observacao: observacao,
                conferente: userInfo?.codigo
            });

            for (const nota of notaInfo) {
                const response = await fetch(
                    `${API}/api/nfe/finalizar_nfe/${nota.serie}/${nota.numero}`,
                    {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                            "X-Auth-Token": token
                        },
                        body: JSON.stringify({
                            status: "CONFERIDA",
                            localizacao: localizacaoFinal,
                            observacao: observacao,
                            conferencia: true
                        })
                    }
                );

                console.log("Enviando observação:", observacao)

                const text = await response.text();

                if (!response.ok) {

                    if (tratarErroAutenticacao(text)) {
                        return;
                    }

                    throw new Error(
                        text?.erro || "Erro ao finalizar nota"
                    );
                }
            }

            setSnackbar({
                open: true,
                message: "Conferência finalizada com sucesso!",
                severity: "success"
            });

            const notasKey = [...notasIds].sort().join("_");

            localStorage.removeItem(`itens_conferencia_${notasKey}`);
            localStorage.removeItem(`caixas_conferencia_${notasKey}`);

            navigate("/");

            registrarLog({
                acao: "Finalizou conferência"
            });

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

    // Ordena de forma crescente as caixas fechadas
    const ordenarCaixas = (lista) => {
        return [...lista].sort((a, b) => {

            const parseCaixa = (numero) => {

                const match = numero?.match(/^([A-Z0-9]+)\s*-\s*(\d+)$/i);

                if (!match) {
                    return {
                        prateleira: numero || "",
                        sequencia: 0
                    };
                }

                return {
                    prateleira: match[1],
                    sequencia: Number(match[2])
                };
            };

            const caixaA = parseCaixa(a.numero);
            const caixaB = parseCaixa(b.numero);

            // Ordena pela prateleira
            const prateleiraCompare =
                caixaA.prateleira.localeCompare(
                    caixaB.prateleira,
                    undefined,
                    { numeric: true }
                );

            if (prateleiraCompare !== 0) {
                return prateleiraCompare;
            }

            // Ordena pela sequência
            return caixaA.sequencia - caixaB.sequencia;
        });
    };

    const confirmarAgrupamentos = async (selecionados) => {

        setGruposLocalizacao(selecionados);

        localStorage.setItem(
            `agrupamentos_${notasIds.join("_")}`,
            JSON.stringify(selecionados)
        );

        setDialogAgrupamentos({
            open: false,
            sugestoes: []
        });

        await carregarTudo();

        registrarLog({
            acao: "Agrupou caixas com localizações próximas"
        });

        setSnackbar({
            open: true,
            message: "Agrupamentos aplicados",
            severity: "success"
        });
    };

    const solicitarAutorizacaoManual = async (codigoManual) => {

        const token = localStorage.getItem("nfe_token");

        if (!token) {

            setSnackbar({
                open: true,
                message: "Sessão expirada. Faça login novamente.",
                severity: "error"
            });

            return false;
        }

        try {

            const response = await fetch(
                `${API}/api/autorizacoes/manual/solicitar`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-Auth-Token": token
                    },
                    body: JSON.stringify({
                        codigo: codigoManual,
                        item_id: null
                    })
                }
            );

            const data = await response.json();

            console.log(
                "Solicitação de autorização:",
                response.status,
                data
            );

            if (response.status === 201) {

                setSolicitacaoManualId(
                    data.solicitacao_id
                );

                setStatusAutorizacao(
                    data.status || "aguardando"
                );

                setSuperiorAtendimento(null);

                setBloqueioManual(true);

                return true;
            }

            if (response.status === 409) {

                setSnackbar({
                    open: true,
                    message:
                        data.erro ||
                        "Já existe uma solicitação em andamento.",
                    severity: "warning"
                });

                return false;
            }

            if (response.status === 401) {

                setSnackbar({
                    open: true,
                    message:
                        "Sua sessão expirou. Faça login novamente.",
                    severity: "error"
                });

                return false;
            }

            setSnackbar({
                open: true,
                message:
                    data.erro ||
                    "Erro ao solicitar autorização.",
                severity: "error"
            });

            return false;

        } catch (error) {

            console.error(
                "Erro ao solicitar autorização manual:",
                error
            );

            setSnackbar({
                open: true,
                message:
                    "Não foi possível solicitar autorização.",
                severity: "error"
            });

            return false;
        }
    };

    const utilizarAutorizacaoManual = async (
        solicitacaoId
    ) => {

        const token =
            localStorage.getItem("nfe_token");

        if (!token) {
            setSnackbar({
                open: true,
                message: "Sessão expirada. Faça login novamente.",
                severity: "error"
            });

            return false;
        }

        try {

            const response = await fetch(
                `${API}/api/autorizacoes/manual/${solicitacaoId}/utilizar`,
                {
                    method: "POST",
                    headers: {
                        "X-Auth-Token": token
                    }
                }
            );

            const data = await response.json();

            console.log(
                "Utilização da autorização:",
                response.status,
                data
            );

            if (!response.ok) {

                setSnackbar({
                    open: true,
                    message:
                        data.erro ||
                        "Não foi possível utilizar a autorização.",
                    severity: "error"
                });

                return false;
            }

            const codigoAutorizado =
                data.codigo?.trim();

            if (!codigoAutorizado) {

                setSnackbar({
                    open: true,
                    message:
                        "Autorização inválida: código não informado.",
                    severity: "error"
                });

                return false;
            }

            /* GARANTE QUE A AUTORIZAÇÃO É PARA O MESMO CÓDIGO SOLICITADO */
            if (
                codigoManualPendente &&
                codigoAutorizado !== codigoManualPendente
            ) {

                console.error(
                    "Código autorizado diferente do código pendente",
                    {
                        pendente: codigoManualPendente,
                        autorizado: codigoAutorizado
                    }
                );

                setSnackbar({
                    open: true,
                    message:
                        "O código autorizado não corresponde à solicitação.",
                    severity: "error"
                });

                return false;
            }

            /* LIMPA ESTADO DA AUTORIZAÇÃO */
            setBloqueioManual(false);
            setSolicitacaoManualId(null);
            setStatusAutorizacao(null);
            setSuperiorAtendimento(null);
            setCodigoManualPendente(null);

            setCodigo("");

            registrarLog({
                acao: "Autorização manual utilizada",
                observacao:
                    `Código autorizado: ${codigoAutorizado}`
            });

            /* Entra no fluxo normal de conferência */

            await scanner(codigoAutorizado);

            return true;

        } catch (error) {

            console.error(
                "Erro ao utilizar autorização:",
                error
            );

            setSnackbar({
                open: true,
                message:
                    "Erro ao utilizar autorização.",
                severity: "error"
            });

            return false;
        }
    };

    const autorizarConferenciaManual = async () => {
        if (!codigoCracha.trim()) {
            setErroAutorizacao("Informe o código do crachá.");
            return;
        }

        if (!pinSuperior.trim()) {
            setErroAutorizacao("Informe o PIN do superior.");
            return;
        }

        if (!solicitacaoManualId) {
            setErroAutorizacao("Solicitação de autorização não encontrada.");
            return;
        }

        setAutorizandoManual(true);
        setErroAutorizacao("");

        try {
            const token = localStorage.getItem("nfe_token");

            const response = await fetch(
                `${API}/api/autorizacoes/manual/${solicitacaoManualId}/autorizar`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-Auth-Token": token
                    },
                    body: JSON.stringify({
                        codigo_cracha: codigoCracha.trim(),
                        pin: pinSuperior.trim()
                    })
                }
            );

            const data = await response.json();

            console.log("🔐 AUTORIZAÇÃO PRESENCIAL:", response.status, data);

            if (!response.ok) {
                setErroAutorizacao(
                    data.erro || "Não foi possível autorizar a conferência."
                );

                return;
            }

            console.log("✅ CONFERÊNCIA AUTORIZADA");

            setStatusAutorizacao("autorizada");

            setCodigoCracha("");
            setPinSuperior("");

        } catch (error) {
            console.error(
                "❌ Erro ao autorizar conferência:",
                error
            );

            setErroAutorizacao(
                "Erro de comunicação com o servidor."
            );

        } finally {
            setAutorizandoManual(false);
        }
    };

    const cancelarConferenciaManual = async () => {
        if (!solicitacaoManualId) {
            setErroAutorizacao("Solicitação de autorização não encontrada.");
            return;
        }

        setCancelandoManual(true);
        setErroAutorizacao("");

        try {
            const token = localStorage.getItem("nfe_token");

            const response = await fetch(
                `${API}/api/autorizacoes/manual/${solicitacaoManualId}/cancelar`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-Auth-Token": token
                    }
                }
            );

            const data = await response.json();

            console.log(
                "❌ CANCELAMENTO DA SOLICITAÇÃO:",
                response.status,
                data
            );

            if (!response.ok) {
                setErroAutorizacao(
                    data.erro || "Não foi possível cancelar a solicitação."
                );

                return;
            }

            console.log("✅ SOLICITAÇÃO CANCELADA");

            setStatusAutorizacao("cancelada");

            setCodigoCracha("");
            setPinSuperior("");

            // Se você tiver o estado da solicitação completa:

        } catch (error) {
            console.error(
                "❌ Erro ao cancelar solicitação:",
                error
            );

            setErroAutorizacao(
                "Erro de comunicação com o servidor."
            );

        } finally {
            setCancelandoManual(false);
        }
    };

    const confirmarCancelamento = () => {
        const confirmar = window.confirm(
            "Deseja realmente cancelar a solicitação de conferência manual?"
        );

        if (!confirmar) {
            return;
        }

        cancelarConferenciaManual();
    };

    const tratarErroAutenticacao = (data) => {

        if (data?.codigo === "SESSION_EXPIRED") {

            setSnackbar({
                open: true,
                message: "Sua sessão expirou. Faça login novamente.",
                severity: "error"
            });

            return true;
        }

        if (data?.codigo === "NFE_PERMISSION_DENIED") {

            setSnackbar({
                open: true,
                message: "Você não tem permissão para alterar esta informação.",
                severity: "error"
            });

            return true;
        }

        return false;
    };

    if (!token) {
        return (
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
        );
    }

    return (
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
                    zoom: 0.9
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
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "row",
                            justifyContent: "right",
                        }}
                    >
                        <NotificacoesMenu
                            apiBase={API}
                            token={token}
                            userInfo={userInfo}
                        />
                        <MenuUsuario
                            userInfo={userInfo}
                            onLogout={logout}
                        />
                    </Box>
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "row",
                            justifyContent: "right",
                            mr: "2vh"
                        }}
                    >
                        <Tooltip title="Sincronizar itens da nota com SS Plus">
                            <Button
                                id="btnAtualizar" onClick={syncSSPlus}
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
                        </Tooltip>
                        <Tooltip title="Voltar ao Dashboard de notas">
                            <Button onClick={() => navigate("/")} sx={{
                                color: "background.paper",
                                display: 'flex',
                                gap: 0.5,
                                fontSize: '0.75rem',
                                minWidth: 'auto',
                                padding: '4px 8px',
                                whiteSpace: 'nowrap'
                            }}>Voltar {< ArrowBackIcon />}
                            </Button>
                        </Tooltip>
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
                        Sincronizando nota com o SS Plus...
                    </Typography>
                </Box>
            </Backdrop>

            <Box
                sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 1,
                    justifyContent: 'center',
                    fontSize: '0.7rem',
                    mt: 1,
                    color: 'primary.main',
                    zoom: 0.9
                }}
            >
                {[
                    { tecla: "F2", acao: "Abrir caixa" },
                    { tecla: "F3", acao: "Modo Agrupamento" },
                    { tecla: "F4", acao: "Finalizar conferência" },
                    { tecla: "F6", acao: "Reabrir caixa" },
                    { tecla: "F7", acao: "Modo quantidade" },
                    { tecla: "F8", acao: "Reimprimir" },
                    { tecla: "F9", acao: "Focar leitor" },
                    { tecla: "ESC", acao: "Limpar leitor" },
                    { tecla: "Ctrl + Space", acao: "Limpar campos" }
                ].map((a, i) => (
                    <Box
                        key={i}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                            px: 1,
                            py: 0.5,
                            borderRadius: 1,
                            bgcolor: 'background.alerta',
                        }}
                    >
                        <Box
                            sx={{
                                fontWeight: 'bold',
                                px: 0.5,
                                borderRadius: 0.5
                            }}
                        >
                            {a.tecla}
                        </Box>
                        <Typography sx={{ fontSize: '0.75rem' }}>
                            {a.acao}
                        </Typography>
                    </Box>
                ))}
            </Box>
            {/* Informações da nota e scanner */}
            <Box sx={{ mt: 1 }}>
                {modo === "MULTIPLO" ? (
                    <Box sx={{ zoom: 0.9 }}>
                        {notaInfo?.map((n, i) => (
                            <Typography key={i} variant="h5">
                                NF: {n.numero} | Fornecedor: {n.fornecedor}
                            </Typography>
                        ))}
                    </Box>
                ) : (
                    <Box sx={{ zoom: 0.9 }}>
                        <Typography variant="h6">
                            Nota: {notaInfo?.[0]?.numero}
                        </Typography>
                        <Typography variant="h6">
                            Fornecedor: {notaInfo?.[0]?.fornecedor}
                        </Typography>
                    </Box>
                )}
                <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                    <TextField
                        label="Código de barras"
                        variant="outlined"
                        size="small"
                        value={codigo}
                        onChange={(e) => setCodigo(e.target.value)}
                        onKeyDown={handleCodigoKeyDown}
                        onPaste={(e) => {
                            e.preventDefault();

                            registrarLog({
                                acao: "Tentativa de colar código de barras"
                            });
                            setSnackbar({
                                open: true,
                                message: "Colar códigos não é permitido",
                                severity: "warning"
                            });
                        }}
                        inputRef={inputRef}
                        autoFocus
                        disabled={bloqueioManual}
                        fullWidth
                        sx={{
                            mb: 2, width: '100%', bgcolor: 'background.card', zoom: 0.9,
                            '& .MuiOutlinedInput-root': {
                                '&:hover fieldset': {
                                    borderColor: 'var(--azul)',
                                },
                                '&.Mui-focused fieldset': {
                                    borderColor: 'var(--azul)',
                                }
                            }
                        }}
                        autoComplete="off"
                        inputProps={{
                            spellCheck: false,
                            autoCorrect: "off",
                            autoCapitalize: "off",
                        }}
                    />

                    {modoQuantidade && (
                        <TextField
                            label="Qtd"
                            size="small"
                            value={quantidadeInput}
                            onChange={(e) => setQuantidadeInput(e.target.value)}
                            inputRef={qtdRef}
                            sx={{ ml: 2, mb: 2, zoom: 0.9 }}
                        />
                    )}

                    {modoAgrupamento && (
                        <TextField
                            label="Grupo"
                            size="small"
                            value={tamanhoGrupoInput}
                            onChange={(e) => {
                                setTamanhoGrupoInput(e.target.value);
                            }}
                            inputRef={grupoRef}
                            onKeyDown={(e) => {

                                if (e.key !== "Enter") {
                                    return;
                                }

                                e.preventDefault();

                                const quantidade = Number(quantidadeInput);
                                const tamanhoGrupo = Number(tamanhoGrupoInput);

                                if (!quantidade || quantidade <= 0) {
                                    setSnackbar({
                                        open: true,
                                        message: "Informe uma quantidade válida no campo Qtd",
                                        severity: "warning"
                                    });

                                    qtdRef.current?.focus();
                                    return;
                                }

                                if (!tamanhoGrupo || tamanhoGrupo <= 0) {
                                    setSnackbar({
                                        open: true,
                                        message: "Informe um tamanho de grupo válido",
                                        severity: "warning"
                                    });

                                    return;
                                }

                                if (quantidade % tamanhoGrupo !== 0) {
                                    setSnackbar({
                                        open: true,
                                        message: "A quantidade deve ser dividida igualmente entre os grupos",
                                        severity: "warning"
                                    });

                                    return;
                                }

                                if (modoEtiqueta === "bremsys") {
                                    setSnackbar({
                                        open: true,
                                        message: "Não é permitido agrupar itens da marca Bremsys",
                                        severity: "warning"
                                    });

                                    setCodigo("");
                                    setQuantidadeInput("");
                                    setTamanhoGrupoInput("");

                                    return;
                                }

                                setSnackbar({
                                    open: true,
                                    message: `${quantidade / tamanhoGrupo} grupos de ${tamanhoGrupo} unidades. Bipe o produto.`,
                                    severity: "success"
                                });

                                registrarLog({
                                    acao: "Tamanho de grupo definido",
                                    observacao: `Quantidade: ${quantidade} | Grupo: ${tamanhoGrupo}`
                                });

                                setTimeout(() => inputRef.current?.focus(), 100);
                            }}
                            sx={{
                                ml: 2,
                                mb: 2,
                                zoom: 0.9,
                                width: 110
                            }}
                            inputProps={{
                                inputMode: "numeric"
                            }}
                        />
                    )}

                    <FormControl
                        size="small"
                        sx={{ ml: 2, mb: 2, zoom: 0.9, width: 200 }}
                    >
                        <InputLabel>Etiqueta</InputLabel>

                        <Select
                            value={modoEtiqueta}
                            label="Etiqueta"
                            onChange={(e) => alterarModoEtiqueta(e.target.value)}
                            MenuProps={{
                                PaperProps: {
                                    sx: {
                                        bgcolor: "background.default",
                                        color: "text.primary",
                                    },
                                },
                            }}
                        >
                            <MenuItem value="padrao">
                                Padrão
                            </MenuItem>

                            <MenuItem
                                value="bremsys"
                                disabled={modoAgrupamento}
                            >
                                Bremsys
                            </MenuItem>
                        </Select>
                    </FormControl>
                </Box>

                {/* Tabela de conferência + caixas*/}
                <Box sx={{ display: 'flex', gap: 2, zoom: 0.9 }}>
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
                                                <TableCell sx={{ color: 'background.paper' }}>Código</TableCell>
                                                <TableCell sx={{ color: 'background.paper' }}>Descrição</TableCell>
                                                <TableCell sx={{ color: 'background.paper', minWidth: '20vh' }}>Código de Barras</TableCell>
                                                <TableCell sx={{ color: 'background.paper' }} align="right">Qtd (Conf./Nota)</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {itens.map((item, index) => (
                                                <TableRow key={index} sx={{
                                                    bgcolor: item.conferido === item.quantidade ? 'primary.conferido' : 'background.alerta'
                                                }}>
                                                    <TableCell>{item.localizacao}</TableCell>
                                                    <TableCell>{item.basico}</TableCell>
                                                    <TableCell>{item.descricao}</TableCell>
                                                    <TableCell>{item.codigo_barras}</TableCell>
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
                        {itensNulos.length > 0 && (
                            <Card
                                sx={{
                                    position: "sticky",
                                    top: 10,
                                    zIndex: 999,
                                    mb: 2,
                                    p: 3,
                                    borderRadius: 3,
                                    bgcolor: "background.alerta",
                                    border: "2px solid",
                                    borderColor: "warning.main",
                                    boxShadow: "0 8px 24px rgba(255,152,0,.25)"
                                }}
                            >
                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 2
                                    }}
                                >
                                    <Stack>
                                        <WarningAmberIcon
                                            sx={{
                                                fontSize: 60,
                                                color: "warning.main",
                                                margin: 'auto'
                                            }}
                                        />

                                        <Box flex={1}>
                                            <Typography
                                                variant="h6"
                                                fontWeight="bold"
                                            >
                                                {itensNulos.length} {itensNulos.length === 1 ? "item possui" : "itens possuem"} informações pendentes
                                            </Typography>

                                            <Typography
                                                variant="body1"
                                                sx={{
                                                    mt: 1,
                                                    lineHeight: 1.2
                                                }}
                                            >
                                                Antes de iniciar a conferência, verifique se todos os itens possuem
                                                <strong> localização, código básico e código de barras</strong> cadastrados.
                                                <br /><br />

                                                O sistema utiliza exclusivamente as informações disponíveis no momento da
                                                leitura do código de barras. Caso um item seja conferido sem localização,
                                                ele será direcionado para uma caixa incorreta.
                                                <br /><br />

                                                <strong>
                                                    Atualizar a localização posteriormente não move automaticamente o item
                                                    para a caixa correta.
                                                </strong>
                                            </Typography>

                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    mt: 2,
                                                    p: 1.5,
                                                    borderRadius: 2,
                                                    bgcolor: "warning.main",
                                                    color: "warning.contrastText",
                                                    fontWeight: "bold"
                                                }}
                                            >
                                                Evite retrabalho. Alguns segundos verificando os cadastros antes da
                                                primeira leitura economizam vários minutos de correções após o início da
                                                conferência.
                                            </Typography>
                                        </Box>
                                    </Stack>
                                </Box>
                            </Card>
                        )}
                        <Card sx={{ p: 2, boxShadow: '0vh 0.1vh 0.5vh var(--sombra)', bgcolor: 'background.alerta' }}>
                            <Typography variant="h6">Caixas</Typography>

                            {/* Caixa aberta */}
                            {caixaAberta ? (
                                <>
                                    <Typography>Caixa aberta: {caixaAberta?.numero}</Typography>
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
                                            Itens
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
                                            {itens.filter(i => i.caixaId === caixaAberta.id).length === 0 ? (
                                                <Typography>Nenhum item conferido ainda</Typography>
                                            ) : (
                                                <Table size="small">
                                                    <TableBody>
                                                        {itens
                                                            .filter(i => i.caixaId === caixaAberta.id)
                                                            .map((item, i) => (
                                                                <TableRow key={i}>
                                                                    <TableCell>{item.localizacao}</TableCell>
                                                                    <TableCell>{item.basico}</TableCell>
                                                                    <TableCell>{item.descricao}</TableCell>
                                                                    <TableCell align="right">{item.conferido}</TableCell>
                                                                    <TableCell>
                                                                        <Button
                                                                            size="small"
                                                                            color="error"
                                                                            onClick={() => abrirConfirmacaoRemoverItem(item)}
                                                                        >
                                                                            Remover
                                                                        </Button>
                                                                    </TableCell>
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
                                ordenarCaixas(caixas).map((c, i) => (
                                    <Box key={c.id} sx={{ mb: 1, p: 1, border: '1px solid var(--fundo-card-caixa)', borderRadius: 1 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Typography><strong>Caixa: {c.numero}</strong></Typography>
                                            <Box sx={{ display: 'flex', justifyContent: 'right', gap: 1 }}>

                                                {/* Reimprimir etiqueta da caixa */}
                                                <Tooltip title="Reimprimir etiqueta da caixa">
                                                    <IconButton
                                                        size="small"
                                                        disabled
                                                        onClick={() => setCaixaFechadaDialog(c)}
                                                    >
                                                        <LocalPrintshopIcon />
                                                    </IconButton>
                                                </Tooltip>

                                                {/* Ver itens */}
                                                <Tooltip title="Ver itens da caixa">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => setCaixaFechadaDialog(c)}
                                                    >
                                                        <ListIcon />
                                                    </IconButton>
                                                </Tooltip>

                                                {/* Reabrir */}
                                                <Tooltip title="Reabrir caixa">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => reabrirCaixa(c)}
                                                    >
                                                        <ReplayIcon />
                                                    </IconButton>
                                                </Tooltip>

                                                {/* Caixa cheia / disponível */}
                                                <Tooltip
                                                    title={c.cheia ? "Caixa cheia" : "Caixa disponível"}
                                                >
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => {

                                                            const novoEstado = !c.cheia;

                                                            const novasCaixas = caixasRef.current.map(cx =>
                                                                cx.id === c.id
                                                                    ? {
                                                                        ...cx,
                                                                        cheia: novoEstado
                                                                    }
                                                                    : cx
                                                            );

                                                            atualizarCaixas(novasCaixas);

                                                            setCaixaAberta(prev => {

                                                                if (!prev || prev.id !== c.id) {
                                                                    return prev;
                                                                }

                                                                return {
                                                                    ...prev,
                                                                    cheia: novoEstado
                                                                };
                                                            });

                                                            setSnackbar({
                                                                open: true,
                                                                message: novoEstado
                                                                    ? `Caixa ${c.numero} marcada como CHEIA`
                                                                    : `Caixa ${c.numero} marcada como DISPONÍVEL`,
                                                                severity: novoEstado ? "error" : "success"
                                                            });

                                                            registrarLog({
                                                                caixa: c.numero,
                                                                acao: novoEstado
                                                                    ? `Caixa ${c.numero} marcada como CHEIA`
                                                                    : `Caixa ${c.numero} marcada como DISPONÍVEL`,
                                                            });
                                                        }}
                                                    >
                                                        <Inventory2Icon
                                                            color={c.cheia ? "error" : "success"}
                                                        />
                                                    </IconButton>
                                                </Tooltip>

                                                {/* Remover (só se vazio) */}
                                                {itens.filter(i => i.caixaId === c.id).length === 0 && (
                                                    <Tooltip title="Remover caixa">
                                                        <IconButton
                                                            size="small"
                                                            color="error"
                                                            onClick={() => abrirConfirmacaoRemoverCaixa(c)}
                                                        >
                                                            <DeleteIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}

                                            </Box>
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
                                        itens.filter(i => i.caixaId === caixaFechadaDialog.id).length > 0 ? (

                                        <Table size="small">
                                            <TableBody>
                                                {itens
                                                    .filter(i => i.caixaId === caixaFechadaDialog.id)
                                                    .map((item, i) => (
                                                        <TableRow key={i}>
                                                            <TableCell>{item.localizacao}</TableCell>
                                                            <TableCell>{item.basico}</TableCell>
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
                                        onKeyDown={(e) => e.key === "Enter" && confirmarFechamento()}
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

                        <Card
                            sx={{
                                p: 2,
                                mt: 2,
                                boxShadow: '0vh 0.1vh 0.5vh var(--sombra)',
                                bgcolor: 'background.alerta'
                            }}
                        >
                            <Typography variant="h6" sx={{ mb: 1 }}>
                                Itens retirados para venda ({logsRetiradaVenda.length})
                            </Typography>

                            {logsRetiradaVenda.length === 0 ? (
                                <Typography variant="body2">
                                    Nenhum item retirado para venda.
                                </Typography>
                            ) : (
                                logsRetiradaVenda.map((log) => (
                                    <Box
                                        key={log.id}
                                        sx={{
                                            py: 0.5,
                                            borderBottom: '1px solid',
                                            borderColor: 'divider'
                                        }}
                                    >
                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                            sx={{
                                                display: "block",
                                                mt: 0.3
                                            }}
                                        >
                                            {log.observacoes}
                                        </Typography>
                                        <Box
                                            sx={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                flexWrap: "wrap",
                                                gap: 1
                                            }}
                                        >
                                            <Typography variant="caption">
                                                <strong>{log.cod_barras}</strong>
                                            </Typography>

                                            <Typography variant="caption">
                                                {log.usuario}
                                            </Typography>

                                            <Typography variant="caption">
                                                {new Date(log.data_hora).toLocaleString("pt-BR")}
                                            </Typography>
                                        </Box>
                                    </Box>
                                ))
                            )}
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
                                sx={{ marginBottom: 2, color: "primary.branco", bgcolor: 'primary.confirmar', '&:hover': { bgcolor: 'primary.confirmarHover' } }}
                                fullWidth
                                onClick={finalizarConferencia}
                            >
                                {finalizando ? "Finalizando..." : "Finalizar Conferência"}
                            </Button>
                            <FormControl fullWidth size="small">
                                <InputLabel>Impressora</InputLabel>

                                <Select
                                    value={printer}
                                    label="Impressora"
                                    onChange={(e) => selecionarImpressora(e.target.value)}
                                    sx={{
                                        bgcolor: "background.card",
                                        color: "text.primary",

                                        "& .MuiSelect-select": {
                                            bgcolor: "background.alerta",
                                            color: "text.primary",
                                        },

                                        "& .MuiOutlinedInput-notchedOutline": {
                                            borderColor: "divider",
                                        },

                                        "&:hover .MuiOutlinedInput-notchedOutline": {
                                            borderColor: "primary.main",
                                        },

                                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                            borderColor: "primary.main",
                                        },
                                    }}
                                >
                                    {printers.map((p) => (
                                        <MenuItem
                                            key={p}
                                            value={p}
                                            sx={{
                                                bgcolor: "background.card",
                                                color: "text.primary",

                                                "&:hover": {
                                                    bgcolor: "background.alerta",
                                                },

                                                "&.Mui-selected": {
                                                    bgcolor: "primary.main",
                                                    color: "primary.branco",
                                                },

                                                "&.Mui-selected:hover": {
                                                    bgcolor: "primary.dark",
                                                },
                                            }}
                                        >
                                            {p}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Card>
                    </Box>
                </Box>
            </Box>

            {/* Modal de confirmar remoção */}
            <Dialog
                open={confirmDialog.open}
                onClose={() => setConfirmDialog({ open: false, type: null, payload: null })}
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
                    Confirmar remoção
                </DialogTitle>

                <DialogContent>
                    <Typography>
                        {confirmDialog.type === "remover_item" &&
                            "Tem certeza que deseja remover este item da caixa?"}

                        {confirmDialog.type === "remover_caixa" &&
                            "Tem certeza que deseja remover esta caixa vazia?"}
                    </Typography>
                </DialogContent>

                <DialogActions>
                    <Button sx={{ color: "primary.branco", bgcolor: 'primary.cancelar', '&:hover': { bgcolor: 'primary.cancelarHover' } }}
                        onClick={() => setConfirmDialog({ open: false, type: null, payload: null })}
                    >
                        Cancelar
                    </Button>

                    <Button
                        sx={{ color: "primary.branco", bgcolor: 'primary.confirmar', '&:hover': { bgcolor: 'primary.confirmarHover' } }}
                        onClick={confirmarAcao}
                    >
                        Confirmar
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={modalCaixaItem.open}
                onClose={() =>
                    setModalCaixaItem({
                        open: false,
                        item: null,
                        caixa: null,
                        cheia: false
                    })
                }
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
                    Item já possui caixa
                </DialogTitle>

                <DialogContent>
                    <Typography>
                        Este item pertence à caixa:
                    </Typography>

                    <Typography sx={{ mt: 1, fontWeight: "bold" }}>
                        {modalCaixaItem.caixa?.numero}
                    </Typography>

                    {modalCaixaItem.cheia && (
                        <Typography sx={{ mt: 2 }} color="error">
                            Essa caixa está marcada como CHEIA.
                        </Typography>
                    )}
                </DialogContent>

                <DialogActions>

                    {modalCaixaItem.cheia && (
                        <Button
                            variant="contained"
                            onClick={() =>
                                imprimirEtiquetaCaixa(modalCaixaItem.caixa)
                            }
                        >
                            Reimprimir etiqueta
                        </Button>
                    )}

                    <Button
                        onClick={() =>
                            setModalCaixaItem({
                                open: false,
                                item: null,
                                caixa: null,
                                cheia: false
                            })
                        }
                    >
                        Fechar
                    </Button>
                </DialogActions>
            </Dialog>

            {/* SUGESTÃO DE AGRUPAMENTOS DE CAIXAS */}
            <Dialog
                open={dialogAgrupamentos.open}
                maxWidth="md"
                fullWidth
                slotProps={{
                    paper: {
                        sx: {
                            bgcolor: "background.card",
                            color: "text.primary",
                            borderRadius: 3
                        }
                    }
                }}
            >
                <DialogTitle
                    sx={{
                        fontWeight: 700,
                        borderBottom: "1px solid",
                        borderColor: "divider"
                    }}
                >
                    Sugestão de agrupamentos de caixas
                </DialogTitle>

                <DialogContent sx={{ mt: 2 }}>

                    <Typography sx={{ mb: 3 }}>
                        Deseja agrupá-las em uma única caixa?
                    </Typography>

                    {dialogAgrupamentos.sugestoes.map((sugestao, i) => {

                        const marcado =
                            agrupamentosSelecionados.some(
                                g => g.nome === sugestao.nome
                            );

                        return (
                            <Card
                                key={i}
                                onClick={() => {

                                    if (marcado) {

                                        setAgrupamentosSelecionados(prev =>
                                            prev.filter(g =>
                                                g.nome !== sugestao.nome
                                            )
                                        );

                                    } else {

                                        setAgrupamentosSelecionados(prev => [
                                            ...prev,
                                            sugestao
                                        ]);
                                    }
                                }}
                                sx={{
                                    mb: 2,
                                    cursor: "pointer",
                                    border: marcado
                                        ? "2px solid"
                                        : "1px solid",
                                    borderColor: marcado
                                        ? "primary.main"
                                        : "divider",
                                    transition: "0.2s",
                                    bgcolor: marcado
                                        ? "action.selected"
                                        : "background.paper",
                                }}
                            >
                                <CardContent sx={{
                                    bgcolor: 'background.alerta',
                                    color: 'text.primary'
                                }}>

                                    <Box
                                        sx={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            mb: 2,
                                            color: 'text.primary'
                                        }}
                                    >
                                        <Typography
                                            variant="h6"
                                            sx={{ fontWeight: 700 }}
                                        >
                                            {sugestao.nome}
                                        </Typography>

                                        <Chip
                                            label={`${sugestao.quantidade} itens diferentes`}
                                            color="primary"
                                            size="small"
                                        />
                                    </Box>

                                    <Divider sx={{ mb: 2 }} />

                                    <Box
                                        sx={{
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: 1
                                        }}
                                    >
                                        {sugestao.itens?.map((item, idx) => (
                                            <Box
                                                key={idx}
                                                sx={{
                                                    p: 1.2,
                                                    borderRadius: 2,
                                                    bgcolor: "background.default",
                                                    border: "1px solid",
                                                    borderColor: "divider",
                                                    display: "flex",
                                                    justifyContent: "space-between",
                                                    alignItems: "center",
                                                    gap: 2
                                                }}
                                            >
                                                <Box sx={{ flex: 1 }}>
                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            fontWeight: 700
                                                        }}
                                                    >
                                                        {item.localizacao}
                                                    </Typography>

                                                    <Typography
                                                        variant="body2"
                                                        color="text.secondary"
                                                    >
                                                        {item.basico} - {item.descricao}
                                                    </Typography>
                                                </Box>

                                                <Chip
                                                    label={`${item.quantidade} unidade(s)`}
                                                    size="small"
                                                    color="primary"
                                                    sx={{
                                                        fontWeight: 700,
                                                        minWidth: 60
                                                    }}
                                                />
                                            </Box>
                                        ))}
                                    </Box>

                                </CardContent>
                            </Card>
                        );
                    })}
                </DialogContent>

                <DialogActions
                    sx={{
                        px: 3,
                        pb: 2
                    }}
                >
                    <Button
                        onClick={() =>
                            setDialogAgrupamentos({
                                open: false,
                                sugestoes: []
                            })
                        }
                    >
                        Ignorar
                    </Button>

                    <Button
                        variant="contained"
                        disabled={
                            agrupamentosSelecionados.length === 0
                        }
                        onClick={() =>
                            confirmarAgrupamentos(
                                agrupamentosSelecionados
                            )
                        }
                    >
                        Confirmar agrupamentos
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Modal de solicitação de conferência manual */}
            <Dialog
                open={bloqueioManual}
                fullWidth
                maxWidth="sm"
                disableEscapeKeyDown
                onClose={() => { }}
                slotProps={{
                    paper: {
                        sx: {
                            bgcolor: "background.card",
                            color: "text.primary",
                            borderRadius: 3,
                            p: 2
                        }
                    }
                }}
            >
                <DialogContent
                    sx={{
                        textAlign: "center",
                        py: 5
                    }}
                >

                    {statusAutorizacao === "aguardando" && (
                        <>
                            <Typography
                                sx={{
                                    fontSize: "4rem",
                                    mb: 2
                                }}
                            >
                                ⚠️
                            </Typography>

                            <Typography
                                variant="h4"
                                sx={{
                                    fontWeight: 800,
                                    mb: 3
                                }}
                            >
                                AUTORIZAÇÃO NECESSÁRIA
                            </Typography>

                            <Typography
                                variant="h6"
                                sx={{
                                    mb: 3
                                }}
                            >
                                Aguarde
                            </Typography>

                            <Typography
                                variant="body1"
                                sx={{
                                    mb: 4,
                                    opacity: 0.8
                                }}
                            >
                                Solicitação enviada para supervisão
                                e gerência.
                                <br /><br />
                                Um superior precisa assumir sua
                                solicitação.
                            </Typography>

                            {/* STATUS DE AGUARDANDO */}
                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    gap: 2,
                                    mb: 4
                                }}
                            >
                                <CircularProgress size={28} />

                                <Typography
                                    variant="h6"
                                    sx={{
                                        fontWeight: 700
                                    }}
                                >
                                    Aguardando superior...
                                </Typography>
                            </Box>

                            {/* SEPARADOR */}
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 2,
                                    maxWidth: 400,
                                    mx: "auto",
                                    mb: 3
                                }}
                            >
                                <Box
                                    sx={{
                                        flex: 1,
                                        height: "1px",
                                        bgcolor: "divider"
                                    }}
                                />

                                <Typography
                                    variant="caption"
                                    sx={{
                                        whiteSpace: 'nowrap',
                                        opacity: 0.6
                                    }}
                                >
                                    Não precisa mais da autorização?
                                </Typography>

                                <Box
                                    sx={{
                                        flex: 1,
                                        height: "1px",
                                        bgcolor: "divider"
                                    }}
                                />
                            </Box>

                            {/* CANCELAMENTO */}
                            <Box
                                sx={{
                                    textAlign: "center",
                                    pb: 1
                                }}
                            >

                                <Button
                                    type="button"
                                    variant="outlined"
                                    color="error"
                                    onClick={confirmarCancelamento}
                                    disabled={
                                        cancelandoManual ||
                                        autorizandoManual
                                    }
                                    sx={{
                                        borderRadius: 2,
                                        px: 3,
                                        fontWeight: 700
                                    }}
                                >
                                    {cancelandoManual
                                        ? "CANCELANDO..."
                                        : "CANCELAR CHAMADO"}
                                </Button>
                            </Box>
                        </>
                    )}

                    {statusAutorizacao === "em_atendimento" && (
                        <>
                            <Typography
                                sx={{
                                    fontSize: "4rem",
                                    mb: 1
                                }}
                            >
                                🚶
                            </Typography>

                            <Typography
                                variant="h4"
                                sx={{
                                    fontWeight: 800,
                                    mb: 2
                                }}
                            >
                                SUPERIOR A CAMINHO
                            </Typography>

                            <Typography
                                variant="h6"
                                sx={{
                                    mb: 2
                                }}
                            >
                                {superiorAtendimento || "Um superior"} está a caminho.
                            </Typography>

                            <Typography
                                variant="body1"
                                sx={{
                                    mb: 4,
                                    opacity: 0.8
                                }}
                            >
                                Aguarde a chegada do superior para
                                autorizar a conferência.
                            </Typography>

                            {/* IDENTIFICAÇÃO PRESENCIAL */}
                            <Box
                                sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 2,
                                    maxWidth: 400,
                                    mx: "auto",
                                    textAlign: "left"
                                }}
                            >
                                <Typography
                                    variant="subtitle1"
                                    sx={{
                                        fontWeight: 700
                                    }}
                                >
                                    Identificação do superior
                                </Typography>

                                <TextField
                                    fullWidth
                                    label="Código do crachá"
                                    placeholder="Digite ou bipe o crachá"
                                    value={codigoCracha}
                                    onChange={(e) => {
                                        setCodigoCracha(e.target.value);
                                        setErroAutorizacao("");
                                    }}
                                    autoFocus
                                    inputProps={{
                                        maxLength: 7
                                    }}
                                />

                                <TextField
                                    fullWidth
                                    label="PIN"
                                    placeholder="Digite o PIN"
                                    type="password"
                                    value={pinSuperior}
                                    onChange={(e) => {
                                        setPinSuperior(e.target.value);
                                        setErroAutorizacao("");
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            autorizarConferenciaManual();
                                        }
                                    }}
                                />

                                {erroAutorizacao && (
                                    <Alert
                                        severity="error"
                                        sx={{
                                            borderRadius: 2
                                        }}
                                    >
                                        {erroAutorizacao}
                                    </Alert>
                                )}

                                {/* AÇÃO PRINCIPAL */}
                                <Button
                                    fullWidth
                                    variant="contained"
                                    size="large"
                                    onClick={autorizarConferenciaManual}
                                    disabled={
                                        autorizandoManual ||
                                        !codigoCracha.trim() ||
                                        !pinSuperior.trim()
                                    }
                                    sx={{
                                        py: 1.5,
                                        fontWeight: 800,
                                        fontSize: "1rem"
                                    }}
                                >
                                    {autorizandoManual
                                        ? "VALIDANDO..."
                                        : "AUTORIZAR CONFERÊNCIA"}
                                </Button>

                                {/* SEPARADOR */}
                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 2,
                                        my: 1
                                    }}
                                >
                                    <Box
                                        sx={{
                                            flex: 1,
                                            height: "1px",
                                            bgcolor: "divider"
                                        }}
                                    />

                                    <Typography
                                        variant="caption"
                                        sx={{
                                            opacity: 0.6,
                                            whiteSpace: "nowrap"
                                        }}
                                    >
                                        ou
                                    </Typography>

                                    <Box
                                        sx={{
                                            flex: 1,
                                            height: "1px",
                                            bgcolor: "divider"
                                        }}
                                    />
                                </Box>

                                {/* CANCELAMENTO */}
                                <Box
                                    sx={{
                                        textAlign: "center",
                                        pb: 1
                                    }}
                                >
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            display: "block",
                                            mb: 1,
                                            opacity: 0.6
                                        }}
                                    >
                                        Não precisa mais da autorização?
                                    </Typography>

                                    <Button
                                        type="button"
                                        variant="outlined"
                                        color="error"
                                        onClick={confirmarCancelamento}
                                        disabled={
                                            cancelandoManual ||
                                            autorizandoManual
                                        }
                                        sx={{
                                            borderRadius: 2,
                                            px: 3,
                                            fontWeight: 700
                                        }}
                                    >
                                        {cancelandoManual
                                            ? "CANCELANDO..."
                                            : "CANCELAR CHAMADO"}
                                    </Button>
                                </Box>

                            </Box>
                        </>
                    )}

                    {statusAutorizacao === "autorizada" && (
                        <>
                            <Typography
                                sx={{
                                    fontSize: "4rem",
                                    mb: 2
                                }}
                            >
                                ✅
                            </Typography>

                            <Typography
                                variant="h4"
                                sx={{
                                    fontWeight: 800
                                }}
                            >
                                AUTORIZADO
                            </Typography>

                            <Typography
                                sx={{ mt: 2 }}
                            >
                                Processando código autorizado...
                            </Typography>
                        </>
                    )}

                </DialogContent>
            </Dialog>

            <SolicitarCorrecaoFab
                API={API}
                token={token}
                notaAtual={notaAtual}
            />

            {/* Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
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
    );
}

export default Conferencia;