import { useEffect, useState, useContext, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
    Container,
    Typography,
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    CircularProgress,
    Backdrop,
    Snackbar,
    Alert,
    Button,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from "@mui/material";

// Ícones do MUI
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SyncIcon from '@mui/icons-material/Sync';
import UploadFileIcon from "@mui/icons-material/UploadFile";
import SearchIcon from "@mui/icons-material/Search";

// Componentes
import MenuUsuario from "../components/MenuUsuario";
import LoginFuncionario from "../components/LoginFuncionario";

function AtualizarCean() {

    // API BASE
    const API = "http://192.168.1.185:8077";

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

    const [numeroNota, setNumeroNota] = useState("");
    const [razaoSocial, setRazaoSocial] = useState("");
    const [cnpjEmitente, setCnpjEmitente] = useState("");

    const [notasEncontradas, setNotasEncontradas] = useState([]);
    const [notaSelecionada, setNotaSelecionada] = useState(null);

    const [itens, setItens] = useState([]);
    const [editIndex, setEditIndex] = useState(null);
    const [itensEditados, setItensEditados] = useState({});

    const [loadingNotas, setLoadingNotas] = useState(false);
    const [loadingItens, setLoadingItens] = useState(false);
    const [loadingCean, setLoadingCean] = useState(false);
    const [searchParams] = useSearchParams();

    const [loadingSync, setLoadingSync] = useState(false);

    const [confirmarCorrecaoCean, setConfirmarCorrecaoCean] = useState(false);
    const [resultadoCorrecaoCean, setResultadoCorrecaoCean] = useState(null);

    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success"
    });

    const SENHAS = [
        "4Kq7Zp2M4vN1yX",
        "Y3AhD8mQ1sJ6cV",
        "F7KkR9uT3wB5yN",
        "M2vH7pK9DdS4jW",
        "L5vN1pK7DtS8v3W",
        "W8nA4pQ6BfJ3r5K",
        "K9xT4"
    ];

    const [senha, setSenha] = useState("");
    const [autorizado, setAutorizado] = useState(false);

    const inputArquivoRef = useRef(null);
    const [loadingCorrespondencias, setLoadingCorrespondencias] = useState(false);

    const validarSenha = () => {

        if (SENHAS.includes(senha.trim())) {
            setAutorizado(true);
            return;
        }

        setSnackbar({
            open: true,
            message: "Senha inválida",
            severity: "error"
        });

        setSenha("");
    };

    // BUSCAR NOTAS
    const buscarNotas = async () => {

        try {

            setLoadingNotas(true);

            const hoje = new Date();

            const inicio = new Date();
            inicio.setMonth(inicio.getMonth() - 24);

            const params = new URLSearchParams({
                page: 1,
                data_inicio: inicio.toISOString().split("T")[0],
                data_fim: hoje.toISOString().split("T")[0],
                sort_by: "data_emissao",
                sort_order: "DESC"
            });

            if (numeroNota.trim()) {
                params.append("numero", numeroNota.trim());
            }

            if (razaoSocial.trim()) {
                params.append(
                    "razao_social_emitente",
                    razaoSocial.trim()
                );
            }

            if (cnpjEmitente.trim()) {
                params.append(
                    "cnpj_emitente",
                    cnpjEmitente.trim()
                );
            }

            const res = await fetch(
                `${API}/api/notas/listar?${params}`,
                {
                    headers: {
                        "X-Auth-Token": token
                    }
                }
            );

            const data = await res.json();

            setNotasEncontradas(data.data || []);

            if ((data.data || []).length === 0) {
                setSnackbar({
                    open: true,
                    message: "Nenhuma nota encontrada",
                    severity: "warning"
                });
            }

        } catch (err) {

            console.error(err);

            setSnackbar({
                open: true,
                message: "Erro ao buscar notas",
                severity: "error"
            });

        } finally {
            setLoadingNotas(false);
        }
    };

    // BUSCAR NOTA DIRETAMENTE PELO ID
    const buscarNotaPorId = async (notaId) => {
        if (!notaId) {
            return null;
        }

        try {
            const res = await fetch(
                `${API}/api/notas/listar?id=${encodeURIComponent(notaId)}`,
                {
                    headers: {
                        "X-Auth-Token": token
                    }
                }
            );

            if (!res.ok) {
                throw new Error(
                    "Erro ao buscar nota pelo ID"
                );
            }

            const data = await res.json();

            const nota = (data.data || []).find(
                item => String(item.id) === String(notaId)
            );

            return nota || null;

        } catch (error) {
            console.error(
                "Erro ao buscar nota pelo ID:",
                error
            );

            return null;
        }
    };

    useEffect(() => {
        const notaUrl = searchParams.get("nota");

        if (!notaUrl) return;

        setNumeroNota(notaUrl);

    }, [searchParams]);

    useEffect(() => {
        if (numeroNota) {
            buscarNotas();
        }
    }, [numeroNota]);

    // BUSCAR ITENS DA NOTA
    const buscarItens = async (notaId) => {

        setLoadingItens(true);

        try {

            const res = await fetch(
                `${API}/api/itens_nfe/${notaId}`,
                {
                    headers: {
                        "X-Auth-Token": token
                    }
                }
            );
            const data = await res.json();

            console.log(data);

            const itensFormatados = data.items.map(item => ({
                ...item,
                original: { ...item }
            }));

            setItens(itensFormatados);

        } catch (err) {

            console.error(err);

            setSnackbar({
                open: true,
                message: "Erro ao carregar itens",
                severity: "error"
            });

        } finally {
            setLoadingItens(false);
        }
    };

    useEffect(() => {
        const notaIdUrl = searchParams.get("nota_id");

        if (!notaIdUrl) {
            return;
        }

        let cancelado = false;

        const carregarNotaDaNotificacao = async () => {
            setLoadingNotas(true);

            try {
                const nota = await buscarNotaPorId(notaIdUrl);

                if (cancelado) {
                    return;
                }

                if (!nota) {
                    setSnackbar({
                        open: true,
                        message:
                            "Não foi possível encontrar a nota da notificação.",
                        severity: "warning"
                    });

                    return;
                }

                // Limpa seleções anteriores
                setItens([]);
                setItensEditados({});
                setEditIndex(null);

                // Preenche a lista e seleciona a nota
                setNotasEncontradas([nota]);
                setNotaSelecionada(nota);

                // Carrega automaticamente os itens da NF-e
                await buscarItens(nota.id);

            } catch (error) {
                console.error(
                    "Erro ao abrir nota da notificação:",
                    error
                );

                if (!cancelado) {
                    setSnackbar({
                        open: true,
                        message:
                            "Erro ao carregar a nota da notificação.",
                        severity: "error"
                    });
                }

            } finally {
                if (!cancelado) {
                    setLoadingNotas(false);
                }
            }
        };

        carregarNotaDaNotificacao();

        return () => {
            cancelado = true;
        };
    }, [searchParams]);

    const registrarLog = async ({
        item = null,
        acao,
        local_anterior = null,
        local_novo = null,
        cod_produto_anterior = null,
        cod_produto_novo = null,
        cod_barras_anterior = null,
        cod_barras_novo = null,
        observacao = null,
    }) => {

        try {

            const payload = {
                nfe_item_id: item?.id ?? null,
                nota_id: notaSelecionada?.id ?? null,

                usuario: userInfo?.codigo,

                acao,

                local_anterior,
                local_novo,

                cod_produto_anterior,
                cod_produto: cod_produto_novo,

                cod_barras_anterior,
                cod_barras: cod_barras_novo,

                observacoes: observacao
            };

            console.log("LOG ALTERAÇÃO ITEM:", payload);

            const response = await fetch(
                `${API}/api/nfe/item/movimentacao/log`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-Auth-Token": token
                    },
                    body: JSON.stringify(payload)
                }
            );

            if (!response.ok) {
                throw new Error(await response.text());
            }

        } catch (error) {
            console.error("Erro ao enviar log:", error);
        }
    };

    const alterarCampo = (index, campo, valor) => {
        const novos = [...itens];

        novos[index][campo] = valor;

        setItens(novos);

        setItensEditados(prev => ({
            ...prev,
            [index]: {
                ...prev[index],
                [campo]: valor
            }
        }));
    };

    // SALVAR
    const salvarItem = async (item, index) => {

        const itemOriginal = item.original;

        const alteracoes = [];

        if (itemOriginal.loc_sistema !== item.loc_sistema) {
            alteracoes.push(
                `LOC: ${itemOriginal.loc_sistema} -> ${item.loc_sistema}`
            );
        }

        if (itemOriginal.basico !== item.basico) {
            alteracoes.push(
                `CÓDIGO SSPLUS: ${itemOriginal.basico} -> ${item.basico}`
            );
        }

        if (itemOriginal.cean !== item.cean) {
            alteracoes.push(
                `CEAN: ${itemOriginal.cean} -> ${item.cean}`
            );
        }

        if (alteracoes.length === 0) {
            setSnackbar({
                open: true,
                message: "Nenhuma alteração realizada",
                severity: "warning"
            });
            return;
        }

        try {

            const res = await fetch(
                `${API}/api/nfe/itemcod/${item.id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "X-Auth-Token": token
                    },
                    body: JSON.stringify({
                        basico: item.basico,
                        cean: item.cean === "SEM GTIN" ? "" : item.cean,
                        codire: item.cean === "SEM GTIN" ? "" : item.cean,
                        loc_sistema: item.loc_sistema,
                    })
                }
            );

            if (!res.ok) {
                const data = await res.json().catch(() => null);

                const mensagens = {
                    NFE_PERMISSION_DENIED:
                        "Você não tem permissão para corrigir notas fiscais.",

                    SESSION_EXPIRED:
                        "Sua sessão expirou. Faça login novamente."
                };

                throw new Error(
                    mensagens[data?.codigo] ||
                    data?.erro ||
                    "Não foi possível atualizar o item."
                );
            }

            await registrarLog({
                item,
                acao: "Alterou cadastro do item",

                local_anterior: itemOriginal.loc_sistema,
                local_novo: item.loc_sistema,

                cod_produto_anterior: itemOriginal.basico,
                cod_produto_novo: item.basico,

                cod_barras_anterior: itemOriginal.cean,
                cod_barras_novo: item.cean,
                observacao: alteracoes.join(" | ")
            });

            // atualiza o snapshot original
            item.original = {
                ...item
            };

            setSnackbar({
                open: true,
                message: "Item atualizado!",
                severity: "success"
            });

            setEditIndex(null);

            setItensEditados(prev => {
                const copy = { ...prev };
                delete copy[index];
                return copy;
            });

        } catch (err) {

            setSnackbar({
                open: true,
                message: err.message,
                severity: "error"
            });

        }
    };

    const handleKeyDown = (e, item, index) => {
        if (e.key === "Enter") {
            salvarItem(item, index);

            // Pula linha depois de salvar alteração
            const next = index + 1;
            if (next < itens.length) {
                setEditIndex(next);
            } else {
                setEditIndex(null);
            }
        }

        if (e.key === "Escape") {
            setEditIndex(null);
        }
    };

    const syncSSPlus = async () => {
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
                    message: "Itens sincronizados",
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
            buscarItens(notaSelecionada.id);

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

    const importarCorrespondencias = async (arquivo) => {

        if (!notaSelecionada) {
            setSnackbar({
                open: true,
                severity: "warning",
                message: "Selecione uma nota primeiro."
            });
            return;
        }

        setLoadingCorrespondencias(true);

        try {
            // IMPORTA O TXT
            const form = new FormData();

            form.append("arquivo", arquivo);
            form.append(
                "cnpj_emitente",
                notaSelecionada.cnpj_emitente
            );

            const responseImport = await fetch(
                `${API}/api/correspondencias/importar`,
                {
                    method: "POST",
                    body: form
                }
            );

            const dataImport = await responseImport.json();

            if (!responseImport.ok)
                throw new Error(dataImport.erro);

            // APLICA NA NOTA
            const responseAplicar = await fetch(
                `${API}/api/correspondencias/aplicar`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        nota_id: notaSelecionada.id
                    })
                }
            );

            const dataAplicar = await responseAplicar.json();

            if (!responseAplicar.ok)
                throw new Error(dataAplicar.erro);

            // SINCRONIZA COM SSPLUS
            await syncSSPlus();

            // RECARREGA A TABELA
            await buscarItens(notaSelecionada.id);

            setSnackbar({
                open: true,
                severity: "success",
                message:
                    `${dataImport.importados} correspondências importadas • ${dataAplicar.atualizados} itens atualizados`
            });

            registrarLog({
                acao: "Importou base de dados"
            });

        } catch (err) {
            setSnackbar({
                open: true,
                severity: "error",
                message: err.message
            });
        } finally {
            setLoadingCorrespondencias(false);
        }
    };

    // CORRIGIR CEANS DA NOTA PELO HISTÓRICO
    const corrigirCeansNota = async () => {

        if (!notaSelecionada?.id) {
            setSnackbar({
                open: true,
                message: "Selecione uma nota primeiro.",
                severity: "warning"
            });
            return;
        }
        console.log(notaSelecionada.id)
        try {

            setLoadingCean(true);

            const response = await fetch(
                `${API}/api/nfe/cean/auto`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-Auth-Token": token
                    },
                    body: JSON.stringify({
                        nota_id: notaSelecionada.id
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data?.erro ||
                    data?.message ||
                    "Erro ao corrigir CEANs."
                );
            }

            console.log("Resultado correção CEAN:", data);

            setResultadoCorrecaoCean(data);

            /*
             * Atualiza somente os itens que o backend
             * conseguiu corrigir automaticamente.
             */
            if (Array.isArray(data.itens)) {

                setItens(prev =>
                    prev.map(item => {

                        const resultado = data.itens.find(
                            r => Number(r.item_id) === Number(item.id)
                        );

                        if (
                            resultado?.status === "atualizado" &&
                            resultado?.cean
                        ) {

                            return {
                                ...item,

                                cean: resultado.cean,

                                // Mantém o código interno sincronizado
                                codire: resultado.cean,

                                // Atualiza o snapshot para o React
                                // não considerar o CEAN como alteração manual
                                original: {
                                    ...item.original,
                                    cean: resultado.cean,
                                    codire: resultado.cean
                                }
                            };
                        }

                        return item;
                    })
                );
            }

            /*
             * Quantidades retornadas pelo backend.
             */
            const atualizados = Number(
                data.atualizados || 0
            );

            const naoEncontrados = Number(
                data.nao_encontrados || 0
            );

            const conflitos = Number(
                data.conflitos || 0
            );

            let mensagem = "";

            if (atualizados > 0) {
                mensagem +=
                    `${atualizados} CEAN` +
                    `${atualizados !== 1 ? "s" : ""} corrigido` +
                    `${atualizados !== 1 ? "s" : ""}. `;
            }

            if (naoEncontrados > 0) {
                mensagem +=
                    `${naoEncontrados} sem correspondência. `;
            }

            if (conflitos > 0) {
                mensagem +=
                    `${conflitos} com conflito.`;
            }

            if (!mensagem) {
                mensagem =
                    "Nenhum CEAN precisou ser corrigido.";
            }

            setSnackbar({
                open: true,
                message: mensagem.trim(),
                severity:
                    conflitos > 0 || naoEncontrados > 0
                        ? "warning"
                        : "success"
            });

            // SINCRONIZA COM SSPLUS
            await syncSSPlus();

            // RECARREGA A TABELA
            await buscarItens(notaSelecionada.id);

            registrarLog({
                acao: "Corrigiu CEANs automáticamente através do histórico"
            });

        } catch (err) {

            console.error(
                "Erro ao corrigir CEANs:",
                err
            );

            setSnackbar({
                open: true,
                message:
                    err.message ||
                    "Erro ao corrigir CEANs.",
                severity: "error"
            });

        } finally {

            setLoadingCean(false);
        }
    };

    const totalSemCean = itens.filter(item => {

        const cean = String(
            item.cean || ""
        )
            .trim()
            .toUpperCase();

        return (
            !cean ||
            cean === "SEM GTIN"
        );

    }).length;

    if (!autorizado) {
        return (
            <Container
                maxWidth="sm"
                sx={{
                    height: "100vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                }}
            >
                <Paper sx={{ p: 4, width: "100%", maxWidth: 420, bgcolor: 'background.card' }}>
                    <Typography
                        variant="h5"
                        fontWeight="bold"
                        mb={2}
                    >
                        Acesso Restrito
                    </Typography>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                        mb={3}
                    >
                        Informe uma senha para acessar a correção de notas.
                    </Typography>

                    <TextField
                        fullWidth
                        label="Senha"
                        type="password"
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                validarSenha();
                            }
                        }}
                        autoComplete="off"
                        inputProps={{
                            spellCheck: false,
                            autoCorrect: "off",
                            autoCapitalize: "off",
                        }}
                    />

                    <Button
                        fullWidth
                        variant="contained"
                        sx={{ mt: 2 }}
                        onClick={validarSenha}
                    >
                        Entrar
                    </Button>
                </Paper>

                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={3000}
                    onClose={() =>
                        setSnackbar({
                            ...snackbar,
                            open: false
                        })
                    }
                >
                    <Alert
                        severity={snackbar.severity}
                        variant="filled"
                    >
                        {snackbar.message}
                    </Alert>
                </Snackbar>
            </Container>
        );
    }

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
                <input
                    ref={inputArquivoRef}
                    type="file"
                    accept=".txt,.csv"
                    hidden
                    onChange={(e) => {

                        if (!e.target.files?.length)
                            return;

                        importarCorrespondencias(e.target.files[0]);

                        e.target.value = "";

                    }}
                />

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
                        <strong>Correção de Notas</strong>
                    </Typography>
                    <Box>
                        <MenuUsuario
                            userInfo={userInfo}
                            onLogout={logout}
                        />

                        <Box
                            sx={{
                                display: "flex",
                                flexDirection: "row",
                                justifyContent: "right",
                                mr: "2vh"
                            }}
                        >
                            <Tooltip title="Importar base do fornecedor e aplicar automaticamente">
                                <span>
                                    <Button
                                        size="small"
                                        disabled={!notaSelecionada || loadingCorrespondencias}
                                        onClick={() => inputArquivoRef.current?.click()}
                                        sx={{
                                            color: "background.paper",
                                            display: "flex",
                                            gap: 0.5,
                                            fontSize: "0.75rem",
                                            minWidth: "auto",
                                            padding: "4px 8px",
                                            whiteSpace: "nowrap"
                                        }}
                                    >
                                        {loadingCorrespondencias ? (
                                            <>
                                                <CircularProgress
                                                    size={14}
                                                    sx={{ color: "background.paper" }}
                                                />
                                                Importando...
                                            </>
                                        ) : (
                                            <>
                                                Importar Base
                                                <UploadFileIcon />
                                            </>
                                        )}
                                    </Button>
                                </span>
                            </Tooltip>

                            <Tooltip
                                title={
                                    !notaSelecionada
                                        ? "Selecione uma nota primeiro"
                                        : totalSemCean === 0
                                            ? "Esta nota não possui itens sem CEAN"
                                            : "Procurar CEANs no histórico usando CNPJ do fornecedor + CPROD"
                                }
                            >
                                <span>
                                    <Button
                                        size="small"
                                        disabled={
                                            !notaSelecionada ||
                                            totalSemCean === 0 ||
                                            loadingCean
                                        }
                                        onClick={() =>
                                            setConfirmarCorrecaoCean(true)
                                        }
                                        sx={{
                                            color: "background.paper",
                                            display: "flex",
                                            gap: 0.5,
                                            fontSize: "0.75rem",
                                            minWidth: "auto",
                                            padding: "4px 8px",
                                            whiteSpace: "nowrap"
                                        }}
                                    >
                                        {loadingCean ? (
                                            <>
                                                <CircularProgress
                                                    size={14}
                                                    sx={{
                                                        color: "background.paper"
                                                    }}
                                                />

                                                Consultando...
                                            </>
                                        ) : (
                                            <>
                                                Corrigir CEANs
                                                <SearchIcon />
                                            </>
                                        )}
                                    </Button>
                                </span>
                            </Tooltip>

                            <Tooltip title="Buscar códigos e localizações do SS Plus">
                                <Button
                                    id="btnAtualizar" onClick={syncSSPlus}
                                    disabled={!notaSelecionada || loadingCorrespondencias || loadingSync}
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
                            <Tooltip title="Voltar ao Dashboard">
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
                                    Voltar
                                    {< ArrowBackIcon />}
                                </Button>
                            </Tooltip>
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
                            Sincronizando itens com o SS Plus...
                        </Typography>
                    </Box>
                </Backdrop>

                {/* BUSCA NOTA */}
                <Box
                    mb={2}
                    display="flex"
                    gap={1}
                    alignItems="stretch"
                    sx={{ zoom: 0.9 }}
                >
                    <TextField
                        label="Número NF"
                        size="small"
                        value={numeroNota}
                        onChange={(e) => setNumeroNota(e.target.value)}
                        sx={{ flex: 1 }}
                        autoComplete="off"
                        inputProps={{
                            spellCheck: false,
                            autoCorrect: "off",
                            autoCapitalize: "off",
                        }}
                    />

                    <TextField
                        label="Fornecedor"
                        size="small"
                        value={razaoSocial}
                        onChange={(e) => setRazaoSocial(e.target.value)}
                        sx={{ flex: 2 }}
                        autoComplete="off"
                        inputProps={{
                            spellCheck: false,
                            autoCorrect: "off",
                            autoCapitalize: "off",
                        }}
                    />

                    <TextField
                        label="CNPJ"
                        size="small"
                        value={cnpjEmitente}
                        onChange={(e) => setCnpjEmitente(e.target.value)}
                        sx={{ flex: 1 }}
                        autoComplete="off"
                        inputProps={{
                            spellCheck: false,
                            autoCorrect: "off",
                            autoCapitalize: "off",
                        }}
                    />

                    <Button
                        variant="contained"
                        onClick={buscarNotas}
                        sx={{
                            height: "40px",
                            minWidth: "140px"
                        }}
                    >
                        Buscar
                    </Button>
                </Box>

                {notasEncontradas.length > 0 && (

                    <Paper
                        sx={{
                            mb: 2,
                            maxHeight: 250,
                            overflow: "auto",
                            bgcolor: 'background.alerta',
                            zoom: 0.9
                        }}
                    >
                        <Typography variant="h6">
                            NOTAS ENCONTRADAS
                        </Typography>
                        {notasEncontradas.map((nota) => (

                            <Box
                                key={nota.id}
                                onClick={() => {
                                    setItens([]);
                                    setItensEditados({});
                                    setEditIndex(null);

                                    setNotaSelecionada(nota);

                                    buscarItens(nota.id);
                                }}
                                sx={{
                                    p: 1.5,
                                    borderBottom: "1px solid",
                                    borderColor: "divider",
                                    cursor: "pointer",
                                    display: 'flex',
                                    justifyContent: 'space-around',
                                    "&:hover": {
                                        bgcolor: "action.hover"
                                    },
                                }}
                            >
                                <Typography fontWeight={600}>
                                    NF: {nota.numero}-{nota.serie}
                                </Typography>
                                <Typography variant="body2">
                                    {nota.fornecedor}
                                </Typography>
                                <Typography variant="body2">
                                    CNPJ: {nota.cnpj_emitente}
                                </Typography>
                            </Box>

                        ))}
                    </Paper>

                )}

                {loadingNotas && <CircularProgress size={22} />}

                {notaSelecionada && (

                    <Paper
                        sx={{
                            p: 2,
                            mb: 2,
                            bgcolor: 'background.alerta',
                            zoom: 0.8
                        }}
                    >

                        <Typography variant="h6">
                            NOTA SELECIONADA
                        </Typography>

                        <Typography variant="h5">
                            NF {notaSelecionada.numero}-{notaSelecionada.serie}
                        </Typography>

                        <Typography variant="h7">
                            {notaSelecionada.fornecedor}
                        </Typography>

                        <Typography
                            variant="body2"
                            sx={{ mt: 1 }}
                        >
                            Itens sem CEAN:{" "}
                            <strong>
                                {totalSemCean}
                            </strong>
                        </Typography>

                    </Paper>

                )}

                {loadingItens ? (
                    <CircularProgress size={22} />
                ) : (
                    <TableContainer
                        component={Paper}
                        sx={{
                            maxHeight: "78vh",
                            boxShadow: '0vh 0.1vh 0.5vh var(--sombra)',
                            bgcolor: 'background.tabela',
                            color: 'text.primary',
                            mb: 5,
                            zoom: 0.9,
                            "&::-webkit-scrollbar": { width: "6px" },
                            "&::-webkit-scrollbar-thumb": { bgcolor: "rgba(255,255,255,0.15)", borderRadius: "4px" }
                        }}
                    >
                        <Table stickyHeader size="small">

                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ color: 'background.paper', bgcolor: 'primary.main' }} />
                                    <TableCell sx={{ color: 'background.paper', bgcolor: 'primary.main' }}>LOC</TableCell>
                                    <TableCell sx={{ color: 'background.paper', bgcolor: 'primary.main' }}>Código SSPlus</TableCell>
                                    <TableCell sx={{ color: 'background.paper', bgcolor: 'primary.main' }}>Código NFe</TableCell>
                                    <TableCell sx={{ color: 'background.paper', bgcolor: 'primary.main' }}>Descrição</TableCell>
                                    <TableCell sx={{ color: 'background.paper', bgcolor: 'primary.main' }}>CEAN</TableCell>
                                    <TableCell sx={{ color: 'background.paper', bgcolor: 'primary.main' }} align="right">Ação</TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {itens.map((item, index) => {

                                    const camposVazios = [
                                        item.loc_sistema,
                                        item.basico,
                                        item.cod_produto,
                                        item.descricao,
                                        item.cean
                                    ].some(campo =>
                                        !campo || String(campo).trim() === "" || campo === "SEM GTIN"
                                    );

                                    const isEditing = editIndex === index;
                                    const hasChanges = !!itensEditados[index];

                                    return (
                                        <TableRow
                                            key={item.id}
                                            onClick={() => setEditIndex(index)}
                                            sx={{
                                                bgcolor: camposVazios
                                                    ? 'background.alerta'
                                                    : hasChanges
                                                        ? 'background.editado'
                                                        : 'inherit',

                                                transition: "0.2s",
                                                cursor: "pointer",

                                                "&:hover": {
                                                    bgcolor: "action.hover"
                                                }
                                            }}
                                        >

                                            {/* ALERTA */}
                                            <TableCell sx={{ p: 0.5 }}>
                                                {camposVazios && (
                                                    <Tooltip title="Campos pendentes">
                                                        <WarningAmberIcon
                                                            sx={{
                                                                color: "primary.parcial",
                                                                fontSize: 18
                                                            }}
                                                        />
                                                    </Tooltip>
                                                )}
                                            </TableCell>

                                            {/* LOC */}
                                            <TableCell sx={{ p: 0.5 }}>
                                                {isEditing ? (
                                                    <TextField
                                                        size="small"
                                                        value={item.loc_sistema || ""}
                                                        onChange={(e) =>
                                                            alterarCampo(index, "loc_sistema", e.target.value)
                                                        }
                                                        onKeyDown={(e) => handleKeyDown(e, item, index)}
                                                        autoFocus
                                                        sx={{
                                                            "& .MuiOutlinedInput-root": { height: 32, fontSize: "0.75rem" }
                                                        }}
                                                    />
                                                ) : (
                                                    item.loc_sistema
                                                )}
                                            </TableCell>

                                            {/* SSPLUS */}
                                            <TableCell sx={{ p: 0.5 }}>
                                                {isEditing ? (
                                                    <TextField
                                                        size="small"
                                                        value={item.basico || ""}
                                                        onChange={(e) =>
                                                            alterarCampo(index, "basico", e.target.value)
                                                        }
                                                        onKeyDown={(e) => handleKeyDown(e, item, index)}
                                                        sx={{ "& .MuiOutlinedInput-root": { height: 32 } }}
                                                    />
                                                ) : (
                                                    item.basico
                                                )}
                                            </TableCell>

                                            {/* NFE */}
                                            <TableCell sx={{ p: 0.5 }}>
                                                {isEditing ? (
                                                    <TextField
                                                        size="small"
                                                        value={item.cod_produto || ""}
                                                        onChange={(e) =>
                                                            alterarCampo(index, "cod_produto", e.target.value)
                                                        }
                                                        onKeyDown={(e) => handleKeyDown(e, item, index)}
                                                        sx={{ "& .MuiOutlinedInput-root": { height: 32 } }}
                                                    />
                                                ) : (
                                                    item.cod_produto
                                                )}
                                            </TableCell>

                                            {/* DESCRIÇÃO */}
                                            <TableCell sx={{ p: 0.5 }}>
                                                {isEditing ? (
                                                    <TextField
                                                        fullWidth
                                                        size="small"
                                                        value={item.descricao || ""}
                                                        onChange={(e) =>
                                                            alterarCampo(index, "descricao", e.target.value)
                                                        }
                                                        onKeyDown={(e) => handleKeyDown(e, item, index)}
                                                        sx={{ "& .MuiOutlinedInput-root": { height: 32 } }}
                                                    />
                                                ) : (
                                                    item.descricao
                                                )}
                                            </TableCell>

                                            {/* CEAN */}
                                            <TableCell sx={{ p: 0.5 }}>
                                                {isEditing ? (
                                                    <TextField
                                                        fullWidth
                                                        size="small"
                                                        value={item.cean || ""}
                                                        onChange={(e) =>
                                                            alterarCampo(index, "cean", e.target.value)
                                                        }
                                                        onKeyDown={(e) => handleKeyDown(e, item, index)}
                                                        sx={{ "& .MuiOutlinedInput-root": { height: 32 } }}
                                                    />
                                                ) : (
                                                    item.cean
                                                )}
                                            </TableCell>

                                            {/* SALVAR ALTERAÇÃO */}
                                            <TableCell sx={{ p: 0.5 }}>
                                                <Button
                                                    variant="contained"
                                                    size="small"
                                                    onClick={() => salvarItem(item, index)}
                                                    sx={{
                                                        minWidth: 70,
                                                        height: 28,
                                                        fontSize: "0.7rem",
                                                        opacity: hasChanges ? 1 : 0.4
                                                    }}
                                                >
                                                    Salvar
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}

                <Dialog
                    open={confirmarCorrecaoCean}
                    onClose={() => {
                        if (!loadingCean) {
                            setConfirmarCorrecaoCean(false);
                        }
                    }}
                    maxWidth="sm"
                    fullWidth
                    slotProps={{
                        paper: {
                            sx: {
                                bgcolor: "background.card",
                                color: "text.primary",
                                zoom: '0.9',
                            }
                        }
                    }}
                >
                    <DialogTitle>
                        Corrigir CEANs automaticamente?
                    </DialogTitle>

                    <DialogContent>

                        <Typography
                            variant="body1"
                            sx={{ mb: 2 }}
                        >
                            O sistema vai procurar correspondências
                            históricas para os{" "}
                            <strong>
                                {totalSemCean}
                            </strong>{" "}
                            itens que estão sem CEAN nesta nota.
                        </Typography>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 2 }}
                        >
                            A busca será feita utilizando o CNPJ do
                            fornecedor e o CPROD do produto.
                        </Typography>

                        <Alert
                            severity="info"
                            sx={{ mb: 1 }}
                        >
                            Se existir exatamente um CEAN válido no
                            histórico para o CPROD, ele será preenchido
                            automaticamente.
                        </Alert>

                        <Alert
                            severity="warning"
                        >
                            Produtos sem histórico ou com múltiplos CEANs
                            diferentes não serão alterados e continuarão
                            disponíveis para correção manual.
                        </Alert>

                    </DialogContent>

                    <DialogActions>

                        <Button
                            color="error"
                            onClick={() =>
                                setConfirmarCorrecaoCean(false)
                            }
                            disabled={loadingCean}
                        >
                            Cancelar
                        </Button>

                        <Button
                            variant="contained"
                            startIcon={
                                loadingCean
                                    ? (
                                        <CircularProgress
                                            size={16}
                                            color="inherit"
                                        />
                                    )
                                    : (
                                        <SearchIcon />
                                    )
                            }
                            disabled={loadingCean}
                            onClick={() => {

                                setConfirmarCorrecaoCean(false);

                                corrigirCeansNota();

                            }}
                        >
                            {loadingCean
                                ? "Consultando..."
                                : "Corrigir CEANs"}
                        </Button>

                    </DialogActions>

                </Dialog>

                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={3000}
                    onClose={() =>
                        setSnackbar({
                            ...snackbar,
                            open: false
                        })
                    }
                >
                    <Alert
                        severity={snackbar.severity}
                        variant="filled"
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

export default AtualizarCean;