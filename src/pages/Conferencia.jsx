import { useState, useEffect, useContext, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useMemo } from "react";
import {
    Container, Typography, Card, Box, TextField, Button,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogActions,
    CircularProgress, Backdrop
} from "@mui/material";

import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SyncIcon from '@mui/icons-material/Sync';

import LoginFuncionario from "../components/LoginFuncionario";

import { ThemeContext } from "../context/ThemeContext";
import '../style/App.css';

function Conferencia() {

    // Tema noturno
    const { dark, toggleTheme } = useContext(ThemeContext);

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

    // Atalhos
    const inputRef = useRef(null);
    const qtdRef = useRef(null);
    const [modoQuantidade, setModoQuantidade] = useState(false);
    const [ultimoItemScaneado, setUltimoItemScaneado] = useState(null);
    const [quantidadeInput, setQuantidadeInput] = useState("");

    // Caixa aberta e fechadas
    const [caixaAberta, setCaixaAberta] = useState(null);
    const [caixas, setCaixas] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [caixaFechadaDialog, setCaixaFechadaDialog] = useState(null);
    const [openFecharDialog, setOpenFecharDialog] = useState(false);
    const [numeroCaixa, setNumeroCaixa] = useState("");

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
        const caixasSalvas = localStorage.getItem(chaveCaixas);

        const itensParse = itensSalvos ? JSON.parse(itensSalvos) : [];
        const itensCorrigidos = itensParse.map(i => ({
            ...i,
            caixaId: i.caixaId ?? i.caixa ?? null
        }));

        const caixasParse = caixasSalvas ? JSON.parse(caixasSalvas) : [];

        const cacheValido =
            itensCorrigidos.length > 0 &&
            itensCorrigidos.some(i => notasIds.includes(i.notaId));

        if (cacheValido) {
            console.log("USANDO CACHE");

            setItens(itensCorrigidos);
            setCaixas(caixasParse);

            return;
        } else {
            console.log("CACHE INVALIDO → BUSCANDO API");

            carregarTudo();
        }

    }, [notasIds]);

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

        console.log("SINCRONIZANDO A NOTA:",notaAtual.id)

        try {
            const response = await fetch(`${API}/api/sync_nfe`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ 
                    nfe_id: notaAtual.id
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data?.erro || "Erro ao sincronizar");
            }

            setSnackbar({
                open: true,
                message: `Sincronização concluída`,
                severity: "success"
            });

            await carregarTudo();

        } catch (err) {
            console.error("Erro sync:", err);

            setSnackbar({
                open: true,
                message: "Erro ao conectar com API",
                severity: "error"
            });

        } finally {
            setLoadingSync(false);
        }
    };

    // Teclas de atalho
    useEffect(() => {
        const handleKeyDown = (e) => {

            const isInput = document.activeElement.tagName === "INPUT";

            if ((e.ctrlKey || e.metaKey) && e.code === "Space") {
                e.preventDefault();

                setCodigo("");
                setQuantidadeInput("");
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
                    if (caixaAberta) {
                        setOpenFecharDialog(true);
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
                    setModoQuantidade(prev => {
                        const novo = !prev;

                        setSnackbar({
                            open: true,
                            message: novo ? "Modo quantidade ATIVADO" : "Modo quantidade DESATIVADO",
                            severity: "info"
                        });

                        if (novo) {
                            setTimeout(() => {
                                qtdRef.current?.focus();
                            }, 100);
                        }

                        return novo;
                    });
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
    }, [caixaAberta, ultimoItemScaneado]);

    const carregarTudo = async () => {
        try {
            setLoading(true);

            if (!notas || notas.length === 0) return;

            console.log("NOTAS RECEBIDAS:", notas);
            setNotaInfo(notas);

            let todosItens = [];

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

                const chaveItens = `itens_conferencia_${notasIds.join("_")}`;
                const itensSalvos = JSON.parse(localStorage.getItem(chaveItens) || "[]");

                const itensFormatados = (dataItens.items || []).map((item) => {

                    const itemSalvo = itensSalvos.find(i =>
                        i.codigo_barras === item.cean &&
                        i.notaId === nota.id
                    );

                    return {
                        descricao: item.descricao || "Item sem identificação",
                        codigo_barras: item.cean || "",
                        codigo_produto: item.cod_produto || "",
                        basico: item.basico || "-",
                        localizacao: item.loc_sistema || "Sem localização",
                        quantidade: Number(item.quantidade_comercial) || 0,

                        conferido: itemSalvo?.conferido ?? (Number(item.qtd_conferida) || 0),
                        caixaId: itemSalvo?.caixaId ?? (item.caixa || null),

                        status: item.status_item,
                        notaId: nota.id,
                        notaNumero: nota.numero || "-",
                        notaSerie: nota.serie || "-"
                    };
                });

                todosItens = [...todosItens, ...itensFormatados];
            }

            console.log("ITENS CARREGADOS:", todosItens);
            setItens(todosItens);

        } catch (error) {
            console.error("Erro no carregarTudo:", error);
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
            reaberta: false
        };

        if (!caixaFinal.jaImprimiu) {
            imprimirEtiquetaCaixa(caixaFinal);
            caixaFinal.jaImprimiu = true;
        }

        const sucesso = await enviarItensDaCaixa(caixaFinal);

        if (!sucesso) {
            return; // Não fecha se deu erro
        }

        setCaixas(prev => [...prev, caixaFinal]);

        setCaixaAberta(null);
        setNumeroCaixa("");
        setOpenFecharDialog(false);

        setSnackbar({
            open: true,
            message: `Caixa ${caixaFinal.numero} fechada`,
            severity: "success"
        });
    };

    // Reabre caixa para adicionar mais itens
    const reabrirCaixa = (caixa) => {

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
        setCaixas(prev => prev.filter(c => c.id !== caixa.id));

        // Recalcula os itens com base no estado atual
        const itensAtualizados = itens
            .filter(i => i.caixaId === caixa.id)
            .map(i => ({ ...i, caixaId: caixa.id }));

        setCaixaAberta({
            ...caixa,
            itens: itensAtualizados,
            reaberta: true,
        });

        setSnackbar({
            open: true,
            message: `Caixa ${caixa.numero} reaberta`,
            severity: "info"
        });
    };

    const removerItemDaCaixa = (itemAlvo) => {
        const novosItens = [...itens];

        const index = novosItens.findIndex(i =>
            i.codigo_barras === itemAlvo.codigo_barras &&
            i.notaId === itemAlvo.notaId
        );

        if (index === -1) return;

        const item = novosItens[index];

        if (item.conferido <= 0) return;

        item.conferido -= 1;

        // Se zerou, remove da caixa
        if (item.conferido === 0) {
            item.caixaId = null;
        }

        novosItens.splice(index, 1);
        novosItens.unshift(item);

        setItens(novosItens);

        // Atualiza caixa aberta
        if (caixaAberta) {
            setCaixaAberta(prev => ({
                ...prev,
                itens: novosItens.filter(i => i.caixaId === prev.id)
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

    // Scanner
    const scanner = async () => {
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

        if (caixaInvalida(item.caixaId)) {
            item.caixaId = null;
        }

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

        if (!caixaInvalida(item.caixaId) && item.caixaId !== caixaAberta.id) {

            const caixaEncontrada = caixas.find(c => c.id === item.caixaId);

            const numeroCaixa =
                caixaEncontrada?.numero ??
                (item.caixaId ? `#${item.caixaId}` : "DESCONHECIDA");

            setSnackbar({
                open: true,
                message: `Item já está na caixa ${numeroCaixa}`,
                severity: "warning"
            });

            setCodigo("");

            return;
        }

        item.caixaId = caixaAberta.id;

        // Impressão e conferência
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

            const restante = item.quantidade - item.conferido;

            if (qtd > restante) {
                qtd = restante;

                setSnackbar({
                    open: true,
                    message: `Quantidade ajustada para ${restante}`,
                    severity: "warning"
                });
            }

            for (let i = 0; i < qtd; i++) {
                // await imprimirEtiqueta(item);
                item.conferido += 1;
            }

            setQuantidadeInput("");

        } else {
            // Modo normal
            item.conferido += 1;
            // await imprimirEtiqueta(item);
        }

        novosItens.splice(index, 1);
        novosItens.unshift(item);

        setItens(novosItens);

        setCaixaAberta(prev => ({
            ...prev,
            itens: novosItens.filter(i => i.caixaId === prev.id)
        }));

        setCodigo("");

        setUltimoItemScaneado(item);
    };

    // Impressão de etiquetas de peça
    const gerarZPL = (unidade, qr) => {
        const url = `http://192.168.1.82:4173/Rastreio/${unidade.id_unico}`;

        return `
^XA
^PW520
^LL192
^LH0,0

^PR3
^MD15

^FO3,3
^BQN,2,6
^FDLA,${url}^FS

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

^FO185,30
^A0B,30,40
^FD${unidade.id_unico}^FS

^FO460,30
^A0B,50,40
^FD${(userInfo?.codigo || "")}^FS

^XZ

`;
    }

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

^FO190,10
^A0N,45,45
^FDCaixa^FS

^FO190,60
^A0N,45,45
^FD${codigoCaixa}^FS

^FO190,120
^A0N,30,30
^FD${dataAtual}^FS

^FO190,150
^A0N,30,30
^FD${userInfo?.codigo || ""}^FS

^XZ
`;
    };

    // Imprime etiqueta chamando API
    const imprimirEtiquetaCaixa = async (caixa) => {
        try {
            const zpl = gerarZPLCaixa(caixa);

            // await imprimirViaPython(zpl);

        } catch (error) {
            console.error("Erro ao imprimir caixa:", error);

            setSnackbar({
                open: true,
                message: "Erro ao imprimir etiqueta da caixa",
                severity: "error"
            });
        }
    };

    // Fecha caixa e envia para API
    const enviarItensDaCaixa = async (caixa) => {
        try {

            const itensDaCaixa = itens.filter(i =>
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

                console.log("ENVIANDO PARA API A CAIXA: ", caixa.numero)

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
                            qtd_conferida: item.conferido
                        })
                    }
                );

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
                const sucesso = await enviarItensDaCaixa(caixa);
                if (!sucesso) return;
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

            const notasKey = [...notasIds].sort().join("_");

            localStorage.removeItem(`itens_conferencia_${notasKey}`);
            localStorage.removeItem(`caixas_conferencia_${notasKey}`);

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
                        <Button onClick={() => navigate("/Dashboard")} sx={{ color: "background.paper", display: 'flex', gap: 1 }}>Voltar {< ArrowBackIcon />}</Button>
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
                    color: 'primary.main'
                }}
            >
                {[
                    { tecla: "F2", acao: "Abrir caixa" },
                    { tecla: "F3", acao: "Fechar caixa" },
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
                <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                    <TextField
                        label="Código de barras"
                        variant="outlined"
                        size="small"
                        value={codigo}
                        onChange={(e) => setCodigo(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") scanner(); }}
                        inputRef={inputRef}
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
                    {modoQuantidade && (
                        <TextField
                            label="Qtd"
                            size="small"
                            value={quantidadeInput}
                            onChange={(e) => setQuantidadeInput(e.target.value)}
                            inputRef={qtdRef}
                            sx={{ ml: 2, mb: 2 }}
                        />
                    )}
                </Box>

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
                                                <TableCell sx={{ color: 'background.paper' }}>Código</TableCell>
                                                <TableCell sx={{ color: 'background.paper' }}>Descrição</TableCell>
                                                <TableCell sx={{ color: 'background.paper' }}>Código de Barras</TableCell>
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
                                                                            onClick={() => removerItemDaCaixa(item)}
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