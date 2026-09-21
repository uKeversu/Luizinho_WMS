import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    Container,
    Typography,
    Box,
    Button,
    Paper,
    TextField,
    CircularProgress,
    IconButton,
    Divider,
    Avatar,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Autocomplete,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    InputAdornment,
    Snackbar,
    Alert,
    Badge,
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SendIcon from "@mui/icons-material/Send";
import ChatIcon from "@mui/icons-material/Chat";
import PersonIcon from "@mui/icons-material/Person";
import GroupIcon from "@mui/icons-material/Group";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ReplyIcon from "@mui/icons-material/Reply";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import ImageIcon from "@mui/icons-material/Image";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import MenuUsuario from "../../components/MenuUsuario";
import LoginFuncionario from "../../components/LoginFuncionario";

function Chat() {

    useEffect(() => {
        document.title = "SIGEL - Chat";
    })

    const navigate = useNavigate();

    const mensagensRef = useRef(null);
    const inputArquivoRef = useRef(null);

    const [userInfo, setUserInfo] = useState(() => {
        const user = localStorage.getItem("user_info");
        return user ? JSON.parse(user) : null;
    });

    const [token, setToken] = useState(
        () => localStorage.getItem("nfe_token") || ""
    );

    const [conversas, setConversas] = useState([]);
    const [conversaSelecionada, setConversaSelecionada] = useState(null);
    const [mensagens, setMensagens] = useState([]);

    const [loadingConversas, setLoadingConversas] = useState(false);
    const [loadingMensagens, setLoadingMensagens] = useState(false);
    const [enviando, setEnviando] = useState(false);

    const [texto, setTexto] = useState("");

    const [imagemSelecionada, setImagemSelecionada] = useState(null);
    const [previewImagem, setPreviewImagem] = useState(null);
    const [enviandoImagem, setEnviandoImagem] = useState(false);
    const [imagensAutenticadas, setImagensAutenticadas] = useState({});

    const [dialogNovaConversa, setDialogNovaConversa] = useState(false);
    const [funcionarios, setFuncionarios] = useState([]);
    const [funcionarioSelecionado, setFuncionarioSelecionado] = useState(null);
    const [carregandoFuncionarios, setCarregandoFuncionarios] = useState(false);
    const [criandoConversa, setCriandoConversa] = useState(false);
    const [carregandoConversas, setCarregandoConversas] = useState(false);

    const [buscaConversas, setBuscaConversas] = useState("");

    // Responder / editar / menu
    const [menuAnchorEl, setMenuAnchorEl] = useState(null);
    const [mensagemMenuAtiva, setMensagemMenuAtiva] = useState(null);
    const [respondendoA, setRespondendoA] = useState(null);
    const [editandoMensagem, setEditandoMensagem] = useState(null);
    const [mensagemDestacada, setMensagemDestacada] = useState(null);

    // Exclusão
    const [mensagemParaExcluir, setMensagemParaExcluir] = useState(null);
    const [excluindoMensagem, setExcluindoMensagem] = useState(false);

    // Snackbar
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "info",
    });

    const mostrarSnackbar = (message, severity = "info") => {
        setSnackbar({
            open: true,
            message,
            severity,
        });
    };

    const fecharSnackbar = () => {
        setSnackbar((anterior) => ({
            ...anterior,
            open: false,
        }));
    };

    // ---------------------------------------------------------
    // LOGIN / LOGOUT
    // ---------------------------------------------------------

    const logout = () => {

        setToken("");
        setUserInfo(null);

        localStorage.removeItem("nfe_token");
        localStorage.removeItem("user_info");
    };

    // ---------------------------------------------------------
    // CONVERSAS
    // ---------------------------------------------------------

    const carregarConversas = async () => {

        try {

            setCarregandoConversas(true);

            const response = await fetch(
                "/api/chat/conversas",
                {
                    headers: {
                        "X-Auth-Token": token,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {

                console.error(
                    "Erro ao carregar conversas:",
                    data
                );

                mostrarSnackbar(
                    data.erro ||
                    "Não foi possível carregar as conversas.",
                    "error"
                );

                return [];

            }

            const lista = data.conversas || [];

            setConversas(lista);

            return lista;

        } catch (error) {

            console.error(
                "Erro ao carregar conversas:",
                error
            );

            mostrarSnackbar(
                "Erro ao carregar conversas.",
                "error"
            );

            return [];

        } finally {

            setCarregandoConversas(false);
        }
    };

    // ---------------------------------------------------------
    // MENSAGENS
    // ---------------------------------------------------------

    const carregarMensagens = async (conversa) => {

        if (!conversa?.id) {
            return;
        }

        try {

            setLoadingMensagens(true);

            const response = await fetch(
                `/api/chat/conversas/${conversa.id}/mensagens`,
                {
                    headers: {
                        "X-Auth-Token": token,
                    },
                }
            );

            if (!response.ok) {

                const data = await response
                    .json()
                    .catch(() => null);

                throw new Error(
                    data?.erro ||
                    `Erro ao carregar mensagens: ${response.status}`
                );
            }

            const data = await response.json();

            const mensagensCarregadas =
                data.mensagens || [];

            setMensagens(mensagensCarregadas);

            // MARCAR A CONVERSA COMO LIDA
            if (
                mensagensCarregadas.length > 0 &&
                Number(conversa.mensagens_nao_lidas || 0) > 0
            ) {

                const ultimaMensagem =
                    mensagensCarregadas[
                    mensagensCarregadas.length - 1
                    ];

                try {

                    const responseLida = await fetch(
                        `/api/chat/conversas/${conversa.id}/ler`,
                        {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                "X-Auth-Token": token,
                            },
                            body: JSON.stringify({
                                mensagem_id:
                                    ultimaMensagem.id,
                            }),
                        }
                    );

                    if (!responseLida.ok) {

                        const dataLida =
                            await responseLida
                                .json()
                                .catch(() => null);

                        console.error(
                            "Erro ao marcar conversa como lida:",
                            dataLida?.erro ||
                            responseLida.status
                        );

                    } else {

                        // Atualiza a lista lateral imediatamente
                        setConversas((anteriores) =>
                            anteriores.map((item) =>
                                String(item.id) ===
                                    String(conversa.id)
                                    ? {
                                        ...item,
                                        mensagens_nao_lidas: 0,
                                        ultima_leitura_id:
                                            ultimaMensagem.id,
                                    }
                                    : item
                            )
                        );

                        // Atualiza a conversa aberta
                        setConversaSelecionada((anterior) => {

                            if (
                                !anterior ||
                                String(anterior.id) !==
                                String(conversa.id)
                            ) {
                                return anterior;
                            }

                            return {
                                ...anterior,
                                mensagens_nao_lidas: 0,
                                ultima_leitura_id:
                                    ultimaMensagem.id,
                            };
                        });
                    }

                } catch (error) {

                    console.error(
                        "Erro ao marcar conversa como lida:",
                        error
                    );
                }
            }

        } catch (error) {
            console.error(
                "Erro ao carregar mensagens:",
                error
            );

            mostrarSnackbar(
                error.message ||
                "Erro ao carregar mensagens.",
                "error"
            );

        } finally {
            setLoadingMensagens(false);
        }
    };

    // ---------------------------------------------------------
    // FUNCIONÁRIOS
    // ---------------------------------------------------------

    const carregarFuncionarios = async () => {

        try {

            setCarregandoFuncionarios(true);

            const response = await fetch(
                "/api/funcionarios/listar",
                {
                    headers: {
                        "X-Auth-Token": token,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {

                console.error(
                    "Erro ao carregar funcionários:",
                    data
                );

                mostrarSnackbar(
                    data.erro ||
                    "Não foi possível carregar os funcionários.",
                    "error"
                );

                return;
            }

            setFuncionarios(
                Array.isArray(data)
                    ? data
                    : []
            );

        } catch (error) {

            console.error(
                "Erro ao carregar funcionários:",
                error
            );

            mostrarSnackbar(
                "Erro ao carregar funcionários.",
                "error"
            );

        } finally {

            setCarregandoFuncionarios(false);
        }
    };

    const abrirNovaConversa = () => {

        setFuncionarioSelecionado(null);
        setDialogNovaConversa(true);

        carregarFuncionarios();
    };

    const fecharNovaConversa = () => {

        if (criandoConversa) {
            return;
        }

        setDialogNovaConversa(false);
        setFuncionarioSelecionado(null);
    };

    const criarConversa = async () => {

        if (!funcionarioSelecionado) {
            return;
        }

        try {

            setCriandoConversa(true);
            const response = await fetch(
                "/api/chat/conversas",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-Auth-Token": token,
                    },
                    body: JSON.stringify({
                        tipo: "individual",
                        nome: funcionarioSelecionado.nome,
                        participantes: [
                            funcionarioSelecionado.id,
                        ],
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {

                console.error(
                    "Erro ao criar conversa:",
                    data
                );

                mostrarSnackbar(
                    data.erro ||
                    "Não foi possível criar a conversa.",
                    "error"
                );

                return;
            }

            const conversaId = data.conversa_id;

            if (!conversaId) {

                console.error(
                    "Backend não retornou conversa_id:",
                    data
                );

                mostrarSnackbar(
                    "A conversa foi processada, mas o backend não retornou o ID.",
                    "error"
                );

                return;
            }

            setDialogNovaConversa(false);
            setFuncionarioSelecionado(null);

            const listaAtualizada =
                await carregarConversas();

            const conversa =
                listaAtualizada.find(
                    (item) =>
                        String(item.id) ===
                        String(conversaId)
                );

            if (conversa) {

                setConversaSelecionada(conversa);
                setMensagens([]);

                await carregarMensagens(conversa);

            } else {

                console.error(
                    "Conversa não encontrada após atualizar a lista:",
                    conversaId
                );

                mostrarSnackbar(
                    "A conversa foi criada, mas não foi possível carregá-la na lista.",
                    "error"
                );
            }

        } catch (error) {

            console.error(
                "Erro ao criar conversa:",
                error
            );

            mostrarSnackbar(
                "Erro ao criar conversa.",
                "error"
            );

        } finally {

            setCriandoConversa(false);
        }
    };

    // ---------------------------------------------------------
    // SELECIONAR CONVERSA
    // ---------------------------------------------------------

    const selecionarConversa = async (conversa) => {

        cancelarResposta();
        cancelarEdicao();
        fecharMenuMensagem();

        setConversaSelecionada(conversa);
        setMensagens([]);

        await carregarMensagens(conversa);
    };

    // ---------------------------------------------------------
    // IMAGEM
    // ---------------------------------------------------------

    const selecionarImagem = (event) => {

        const arquivo = event.target.files?.[0];

        event.target.value = "";

        if (!arquivo) {
            return;
        }

        const tiposPermitidos = [
            "image/jpeg",
            "image/png",
            "image/webp",
        ];

        if (!tiposPermitidos.includes(arquivo.type)) {

            mostrarSnackbar(
                "Formato inválido. Selecione uma imagem JPG, PNG ou WEBP.",
                "warning"
            );

            return;
        }

        const limite = 5 * 1024 * 1024;

        if (arquivo.size > limite) {

            mostrarSnackbar(
                "A imagem não pode ultrapassar 5 MB.",
                "warning"
            );

            return;
        }

        if (previewImagem) {
            URL.revokeObjectURL(previewImagem);
        }

        setImagemSelecionada(arquivo);

        const url = URL.createObjectURL(arquivo);

        setPreviewImagem(url);
    };

    const removerImagemSelecionada = () => {

        if (previewImagem) {
            URL.revokeObjectURL(previewImagem);
        }

        setImagemSelecionada(null);
        setPreviewImagem(null);
    };

    const enviarImagem = async () => {

        if (!imagemSelecionada || !conversaSelecionada) {
            return;
        }

        try {

            setEnviandoImagem(true);

            const formData = new FormData();

            formData.append(
                "imagem",
                imagemSelecionada
            );

            if (respondendoA) {

                formData.append(
                    "resposta_a_id",
                    respondendoA.id
                );
            }

            const response = await fetch(
                `/api/chat/conversas/${conversaSelecionada.id}/mensagens/imagem`,
                {
                    method: "POST",
                    headers: {
                        "X-Auth-Token": token,
                    },
                    body: formData,
                }
            );

            const data = await response.json();

            if (!response.ok) {

                console.error(
                    "Erro ao enviar imagem:",
                    data
                );

                mostrarSnackbar(
                    data.erro ||
                    "Não foi possível enviar a imagem.",
                    "error"
                );

                return;
            }

            if (data.mensagem) {

                setMensagens((anteriores) => [
                    ...anteriores,
                    data.mensagem,
                ]);
            }

            removerImagemSelecionada();
            setRespondendoA(null);

            await carregarConversas();

        } catch (error) {

            console.error(
                "Erro ao enviar imagem:",
                error
            );

            mostrarSnackbar(
                "Erro ao enviar imagem.",
                "error"
            );

        } finally {

            setEnviandoImagem(false);
        }
    };

    // ---------------------------------------------------------
    // IMAGENS AUTENTICADAS
    // ---------------------------------------------------------

    const abrirImagem = async (url) => {

        try {

            const response = await fetch(
                url,
                {
                    headers: {
                        "X-Auth-Token": token,
                    },
                }
            );

            if (!response.ok) {

                const data = await response
                    .json()
                    .catch(() => null);

                console.error(
                    "Erro ao abrir imagem:",
                    data
                );

                mostrarSnackbar(
                    "Não foi possível abrir a imagem.",
                    "error"
                );

                return;
            }

            const blob = await response.blob();

            const blobUrl =
                URL.createObjectURL(blob);

            window.open(
                blobUrl,
                "_blank",
                "noopener,noreferrer"
            );

            setTimeout(() => {
                URL.revokeObjectURL(blobUrl);
            }, 60000);

        } catch (error) {

            console.error(
                "Erro ao abrir imagem:",
                error
            );

            mostrarSnackbar(
                "Erro ao abrir imagem.",
                "error"
            );
        }
    };

    const carregarImagemAutenticada = async (url) => {

        try {

            const response = await fetch(
                url,
                {
                    headers: {
                        "X-Auth-Token": token,
                    },
                }
            );

            if (!response.ok) {

                throw new Error(
                    `Erro ao carregar imagem: ${response.status}`
                );
            }

            const blob = await response.blob();

            return URL.createObjectURL(blob);

        } catch (error) {

            console.error(
                "Erro ao carregar imagem:",
                error
            );

            return null;
        }
    };

    // ---------------------------------------------------------
    // ENVIAR MENSAGEM
    // ---------------------------------------------------------

    const enviarMensagem = async () => {

        const textoLimpo = texto.trim();

        if (!textoLimpo || !conversaSelecionada) {
            return;
        }

        try {

            setEnviando(true);

            const response = await fetch(
                `/api/chat/conversas/${conversaSelecionada.id}/mensagens`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-Auth-Token": token,
                    },
                    body: JSON.stringify({
                        texto: textoLimpo,
                        ...(respondendoA
                            ? {
                                resposta_a_id:
                                    respondendoA.id,
                            }
                            : {}),
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {

                console.error(
                    "Erro ao enviar mensagem:",
                    data
                );

                mostrarSnackbar(
                    data.erro ||
                    "Não foi possível enviar a mensagem.",
                    "error"
                );

                return;
            }

            if (data.mensagem) {

                setMensagens((anteriores) => [
                    ...anteriores,
                    data.mensagem,
                ]);
            }

            setTexto("");
            setRespondendoA(null);

            await carregarConversas();

        } catch (error) {

            console.error(
                "Erro ao enviar mensagem:",
                error
            );

            mostrarSnackbar(
                "Erro ao enviar mensagem.",
                "error"
            );

        } finally {

            setEnviando(false);
        }
    };

    // ---------------------------------------------------------
    // RESPONDER
    // ---------------------------------------------------------

    const iniciarResposta = (mensagem) => {

        fecharMenuMensagem();
        cancelarEdicao();

        setRespondendoA(mensagem);
    };

    const cancelarResposta = () => {
        setRespondendoA(null);
    };

    const rolarAteMensagem = (mensagemId) => {

        if (!mensagemId) {
            return;
        }

        const elemento =
            document.getElementById(
                `msg-${mensagemId}`
            );

        if (!elemento) {
            return;
        }

        elemento.scrollIntoView({
            behavior: "smooth",
            block: "center",
        });

        setMensagemDestacada(mensagemId);

        setTimeout(() => {

            setMensagemDestacada((atual) =>
                atual === mensagemId
                    ? null
                    : atual
            );

        }, 1500);
    };

    // ---------------------------------------------------------
    // EDITAR
    // ---------------------------------------------------------

    const iniciarEdicao = (mensagem) => {

        fecharMenuMensagem();
        cancelarResposta();

        setEditandoMensagem(mensagem);
        setTexto(mensagem.texto || "");
    };

    const cancelarEdicao = () => {

        setEditandoMensagem(null);
        setTexto("");
    };

    const salvarEdicao = async () => {

        if (!editandoMensagem || !conversaSelecionada) {
            return;
        }

        const textoLimpo = texto.trim();

        if (!textoLimpo) {
            return;
        }

        try {

            setEnviando(true);

            const response = await fetch(
                `/api/chat/conversas/${conversaSelecionada.id}/mensagens/${editandoMensagem.id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "X-Auth-Token": token,
                    },
                    body: JSON.stringify({
                        texto: textoLimpo,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {

                console.error(
                    "Erro ao editar mensagem:",
                    data
                );

                mostrarSnackbar(
                    data.erro ||
                    "Não foi possível editar a mensagem.",
                    "error"
                );

                return;
            }

            if (data.mensagem) {

                setMensagens((anteriores) =>
                    anteriores.map((item) =>
                        item.id === data.mensagem.id
                            ? data.mensagem
                            : item
                    )
                );
            }

            cancelarEdicao();

        } catch (error) {

            console.error(
                "Erro ao editar mensagem:",
                error
            );

            mostrarSnackbar(
                "Erro ao editar mensagem.",
                "error"
            );

        } finally {

            setEnviando(false);
        }
    };

    // ---------------------------------------------------------
    // EXCLUIR
    // ---------------------------------------------------------

    const solicitarExclusao = (mensagem) => {

        fecharMenuMensagem();

        setMensagemParaExcluir(mensagem);
    };

    const cancelarExclusao = () => {

        if (excluindoMensagem) {
            return;
        }

        setMensagemParaExcluir(null);
    };

    const excluirMensagemAtual = async () => {

        if (
            !mensagemParaExcluir ||
            !conversaSelecionada
        ) {
            return;
        }

        try {

            setExcluindoMensagem(true);

            const response = await fetch(
                `/api/chat/conversas/${conversaSelecionada.id}/mensagens/${mensagemParaExcluir.id}`,
                {
                    method: "DELETE",
                    headers: {
                        "X-Auth-Token": token,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {

                console.error(
                    "Erro ao excluir mensagem:",
                    data
                );

                mostrarSnackbar(
                    data.erro ||
                    "Não foi possível excluir a mensagem.",
                    "error"
                );

                return;
            }

            if (data.mensagem) {

                setMensagens((anteriores) =>
                    anteriores.map((item) =>
                        item.id === data.mensagem.id
                            ? data.mensagem
                            : item
                    )
                );
            }

            setMensagemParaExcluir(null);

            await carregarConversas();

            mostrarSnackbar(
                "Mensagem excluída.",
                "success"
            );

        } catch (error) {

            console.error(
                "Erro ao excluir mensagem:",
                error
            );

            mostrarSnackbar(
                "Erro ao excluir mensagem.",
                "error"
            );

        } finally {

            setExcluindoMensagem(false);
        }
    };

    // ---------------------------------------------------------
    // COPIAR
    // ---------------------------------------------------------

    const copiarMensagem = async (mensagem) => {

        fecharMenuMensagem();

        if (!mensagem?.texto) {
            return;
        }

        try {

            if (navigator.clipboard?.writeText) {

                await navigator.clipboard.writeText(
                    mensagem.texto
                );

                mostrarSnackbar(
                    "Mensagem copiada.",
                    "success"
                );
            }

        } catch (error) {

            console.error(
                "Erro ao copiar mensagem:",
                error
            );

            mostrarSnackbar(
                "Não foi possível copiar a mensagem.",
                "error"
            );
        }
    };

    // ---------------------------------------------------------
    // MENU CONTEXTUAL
    // ---------------------------------------------------------

    const abrirMenuMensagem = (
        event,
        mensagem
    ) => {

        event.stopPropagation();

        setMenuAnchorEl(
            event.currentTarget
        );

        setMensagemMenuAtiva(mensagem);
    };

    const fecharMenuMensagem = () => {

        setMenuAnchorEl(null);
        setMensagemMenuAtiva(null);
    };

    // ---------------------------------------------------------
    // ENTER / ESC
    // ---------------------------------------------------------

    const handleKeyDown = (event) => {

        if (
            event.key === "Enter" &&
            !event.shiftKey
        ) {

            event.preventDefault();

            if (editandoMensagem) {

                salvarEdicao();

            } else if (imagemSelecionada) {

                enviarImagem();

            } else {

                enviarMensagem();
            }

            return;
        }

        if (event.key === "Escape") {

            if (editandoMensagem) {

                cancelarEdicao();

            } else if (respondendoA) {

                cancelarResposta();
            }
        }
    };

    // ---------------------------------------------------------
    // DATA
    // ---------------------------------------------------------

    const formatarData = (data) => {
        if (!data) {
            return "";
        }

        try {
            return new Date(data).toLocaleString(
                "pt-BR",
                {
                    timeZone: "America/Sao_Paulo",
                    day: "2-digit",
                    month: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit"
                }
            );
        } catch {
            return data;
        }
    };

    const formatarHorario = (data) => {

        if (!data) {
            return "";
        }

        try {
            return new Date(data).toLocaleTimeString(
                "pt-BR",
                {
                    timeZone: "America/Sao_Paulo",
                    hour: "2-digit",
                    minute: "2-digit",
                }
            );
        } catch {
            return "";
        }
    };

    // ---------------------------------------------------------
    // NOME DA CONVERSA
    // ---------------------------------------------------------

    const obterNomeConversa = (conversa) => {
        if (!conversa) {
            return "Conversa";
        }

        if (conversa.tipo === "grupo") {
            return conversa.nome || "Grupo";
        }

        const participantes = conversa.participantes || [];

        const outroParticipante = participantes.find(
            (participante) =>
                String(participante.id) !==
                String(userInfo?.id)
        );

        return (
            outroParticipante?.nome ||
            conversa.nome ||
            "Conversa"
        );
    };

    // ---------------------------------------------------------
    // PREVIEW
    // ---------------------------------------------------------

    const previaTexto = (mensagem) => {

        if (!mensagem) {
            return "";
        }

        if (mensagem.apagada_em) {
            return "Mensagem apagada";
        }

        if (mensagem.tipo === "imagem") {
            return "Imagem";
        }

        return mensagem.texto || "";
    };

    // ---------------------------------------------------------
    // AVATAR
    // ---------------------------------------------------------

    const obterInicial = (nome) => {

        if (!nome) {
            return "?";
        }

        return nome
            .trim()
            .charAt(0)
            .toUpperCase();
    };

    const obterCorAvatar = (id) => {

        const numero =
            Number(id || 0);

        const cores = [
            "primary.main",
            "secondary.main",
            "success.main",
            "warning.main",
            "info.main",
        ];

        return cores[
            Math.abs(numero) % cores.length
        ];
    };

    // ---------------------------------------------------------
    // CONVERSAS FILTRADAS
    // ---------------------------------------------------------

    const conversasFiltradas = useMemo(() => {

        const termo =
            buscaConversas
                .trim()
                .toLowerCase();

        if (!termo) {
            return conversas;
        }

        return conversas.filter(
            (conversa) => {

                const nome =
                    obterNomeConversa(
                        conversa
                    ).toLowerCase();

                const ultimaMensagem =
                    (
                        conversa.ultima_mensagem ||
                        ""
                    ).toLowerCase();

                return (
                    nome.includes(termo) ||
                    ultimaMensagem.includes(termo)
                );
            }
        );

    }, [conversas, buscaConversas]);

    // IDENTIFICA SE ÚLTIMA MENSAGEM FOI VISUALIZADA
    const conversaFoiVisualizada = (conversa) => {

        if (
            conversa?.tipo === "grupo" ||
            !conversa?.ultima_mensagem ||
            String(conversa.ultima_mensagem_remetente_id) !==
            String(userInfo?.id)
        ) {
            return false;
        }

        const outroParticipante =
            conversa.participantes?.find(
                (participante) =>
                    String(participante.id) !==
                    String(userInfo?.id)
            );

        if (!outroParticipante) {
            return false;
        }

        return (
            Number(
                outroParticipante.ultima_leitura_id || 0
            ) >=
            Number(
                conversa.ultima_mensagem_id || 0
            )
        );
    };

    // ---------------------------------------------------------
    // CARREGAMENTO INICIAL
    // ---------------------------------------------------------

    useEffect(() => {

        if (!token) {
            return;
        }

        carregarConversas();

    }, [token]);

    // ---------------------------------------------------------
    // CARREGAR IMAGENS
    // ---------------------------------------------------------

    useEffect(() => {

        let cancelado = false;

        const carregarImagens = async () => {

            const imagensPendentes =
                mensagens.filter(
                    (mensagem) =>
                        mensagem.tipo === "imagem" &&
                        mensagem.anexo?.url &&
                        !imagensAutenticadas[
                        mensagem.anexo.id
                        ]
                );

            if (!imagensPendentes.length) {
                return;
            }

            const resultados =
                await Promise.all(
                    imagensPendentes.map(
                        async (mensagem) => {

                            const url =
                                await carregarImagemAutenticada(
                                    mensagem.anexo.url
                                );

                            return {
                                id: mensagem.anexo.id,
                                url,
                            };
                        }
                    )
                );

            if (cancelado) {
                return;
            }

            setImagensAutenticadas(
                (anteriores) => {

                    const novas = {
                        ...anteriores,
                    };

                    resultados.forEach(
                        ({ id, url }) => {

                            if (url) {
                                novas[id] = url;
                            }
                        }
                    );

                    return novas;
                }
            );
        };

        carregarImagens();

        return () => {
            cancelado = true;
        };

    }, [mensagens]);

    // ---------------------------------------------------------
    // AUTO SCROLL
    // ---------------------------------------------------------

    useEffect(() => {

        if (!mensagensRef.current) {
            return;
        }

        const elemento =
            mensagensRef.current;

        requestAnimationFrame(() => {

            elemento.scrollTo({
                top: elemento.scrollHeight,
                behavior: "smooth",
            });

        });

    }, [
        mensagens,
        loadingMensagens,
        respondendoA,
    ]);

    // ---------------------------------------------------------
    // LIMPEZA DE OBJETOS
    // ---------------------------------------------------------

    useEffect(() => {

        return () => {

            if (previewImagem) {
                URL.revokeObjectURL(
                    previewImagem
                );
            }

            Object.values(
                imagensAutenticadas
            ).forEach((url) => {

                if (url) {
                    URL.revokeObjectURL(url);
                }
            });
        };

    }, []);

    // ---------------------------------------------------------
    // LOGIN
    // ---------------------------------------------------------

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
                        pode_autorizar_conferencia:
                            data.pode_autorizar_conferencia,
                        pode_corrigir_nfe:
                            data.pode_corrigir_nfe,
                        pode_finalizar_nfe:
                            data.pode_finalizar_nfe,
                        pode_acessar_alertas:
                            data.pode_acessar_alertas,
                        pode_acessar_cadastrar_funcionario:
                            data.pode_acessar_cadastrar_funcionario,
                        pode_acessar_painel_games:
                            data.pode_acessar_painel_games,
                        pode_acessar_painel_gerencial:
                            data.pode_acessar_painel_gerencial,
                        pode_acessar_reimprimir_senhas:
                            data.pode_acessar_reimprimir_senhas,
                        pode_acessar_tarefas:
                            data.pode_acessar_tarefas,
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

    // ---------------------------------------------------------
    // PERMISSÕES DE MENSAGEM
    // ---------------------------------------------------------

    const podeEditar = (mensagem) =>
        mensagem &&
        !mensagem.apagada_em &&
        mensagem.tipo === "texto" &&
        String(
            mensagem.remetente_id
        ) === String(
            userInfo?.id
        );

    const podeExcluir = (mensagem) =>
        mensagem &&
        !mensagem.apagada_em &&
        String(
            mensagem.remetente_id
        ) === String(
            userInfo?.id
        );

    const podeCopiar = (mensagem) =>
        mensagem &&
        !mensagem.apagada_em &&
        mensagem.tipo === "texto";

    return (

        <Container
            maxWidth={false}
            disableGutters
            sx={{
                minHeight: "100vh",
                bgcolor: "background.default",
                px: {
                    xs: 0,
                    md: 2,
                },
                py: {
                    xs: 0,
                    md: 2,
                },
            }}
        >

            {/* =================================================
            HEADER PRINCIPAL
        ================================================= */}

            <Paper
                elevation={0}
                sx={{
                    mb: {
                        xs: 0,
                        md: 2,
                    },
                    px: {
                        xs: 1.5,
                        md: 2.5,
                    },
                    py: 1.25,
                    borderRadius: {
                        xs: 0,
                        md: 3,
                    },
                    bgcolor: "var(--azul)",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 2,
                    minHeight: 70,
                }}
            >

                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        minWidth: 0,
                    }}
                >

                    <Avatar
                        sx={{
                            width: 44,
                            height: 44,
                            bgcolor:
                                "rgba(255,255,255,0.15)",
                            color: "white",
                        }}
                    >
                        <ChatIcon />
                    </Avatar>

                    <Box sx={{ minWidth: 0 }}>

                        <Typography
                            variant="h6"
                            fontWeight={800}
                            sx={{
                                lineHeight: 1.1,
                                whiteSpace: "nowrap",
                            }}
                        >
                            SIGEL Chat
                        </Typography>

                        <Typography
                            variant="caption"
                            sx={{
                                opacity: 0.75,
                            }}
                        >
                            Comunicação interna
                        </Typography>

                    </Box>

                </Box>

                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                    }}
                >

                    <Box
                        sx={{
                            display: {
                                xs: "none",
                                sm: "block",
                            },
                        }}
                    >
                        <MenuUsuario
                            userInfo={userInfo}
                            onLogout={logout}
                        />
                    </Box>

                    <Tooltip title="Voltar ao SIGEL">

                        <IconButton
                            onClick={() => navigate("/")}
                            sx={{
                                color: "white",
                                bgcolor:
                                    "rgba(255,255,255,0.08)",
                                "&:hover": {
                                    bgcolor:
                                        "rgba(255,255,255,0.16)",
                                },
                            }}
                        >
                            <ArrowBackIcon />
                        </IconButton>

                    </Tooltip>

                </Box>

            </Paper>

            {/* =================================================
            CHAT
        ================================================= */}

            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: {
                        xs: "1fr",
                        md: "320px minmax(0, 1fr)",
                    },
                    gap: {
                        xs: 0,
                        md: 1.5,
                    },
                    height: {
                        xs: "calc(100vh - 70px)",
                        md: "calc(100vh - 102px)",
                    },
                    minHeight: {
                        xs: 0,
                        md: 600,
                    },
                }}
            >

                {/* =================================================
                LISTA DE CONVERSAS
            ================================================= */}

                <Paper
                    elevation={0}
                    sx={{
                        bgcolor:
                            "background.card",
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: {
                            xs: 0,
                            md: 3,
                        },
                        overflow: "hidden",
                        display: "flex",
                        flexDirection: "column",
                        minHeight: 0,
                    }}
                >

                    {/* CABEÇALHO DA LISTA */}

                    <Box
                        sx={{
                            p: 1.5,
                            pb: 1,
                        }}
                    >

                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent:
                                    "space-between",
                                mb: 1.25,
                            }}
                        >

                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                }}
                            >

                                <Typography
                                    fontWeight={800}
                                >
                                    Conversas
                                </Typography>

                                {conversas.length > 0 && (

                                    <Box
                                        sx={{
                                            px: 0.8,
                                            py: 0.2,
                                            borderRadius: 10,
                                            bgcolor:
                                                "action.hover",
                                            fontSize:
                                                "0.7rem",
                                            fontWeight: 700,
                                            color:
                                                "text.secondary",
                                        }}
                                    >
                                        {conversas.length}
                                    </Box>

                                )}

                            </Box>

                            <Box
                                sx={{
                                    display: "flex",
                                    gap: 0.25,
                                }}
                            >

                                <Tooltip title="Atualizar">

                                    <span>

                                        <IconButton
                                            size="small"
                                            onClick={
                                                carregarConversas
                                            }
                                            disabled={
                                                carregandoConversas
                                            }
                                        >
                                            {carregandoConversas ? (
                                                <CircularProgress
                                                    size={18}
                                                />
                                            ) : (
                                                <RefreshIcon
                                                    fontSize="small"
                                                />
                                            )}
                                        </IconButton>

                                    </span>

                                </Tooltip>

                                <Tooltip title="Nova conversa">

                                    <IconButton
                                        size="small"
                                        color="primary"
                                        onClick={
                                            abrirNovaConversa
                                        }
                                        sx={{
                                            bgcolor:
                                                "primary.main",
                                            color:
                                                "primary.contrastText",
                                            "&:hover": {
                                                bgcolor:
                                                    "primary.dark",
                                            },
                                        }}
                                    >
                                        <AddIcon
                                            fontSize="small"
                                        />
                                    </IconButton>

                                </Tooltip>

                            </Box>

                        </Box>

                        {/* PESQUISA */}

                        <TextField
                            fullWidth
                            size="small"
                            value={buscaConversas}
                            onChange={(event) =>
                                setBuscaConversas(
                                    event.target.value
                                )
                            }
                            placeholder="Pesquisar conversas..."
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon
                                            fontSize="small"
                                            sx={{
                                                color:
                                                    "text.secondary",
                                            }}
                                        />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{
                                "& .MuiOutlinedInput-root": {
                                    borderRadius: 2.5,
                                    bgcolor:
                                        "action.hover",
                                },
                            }}
                        />

                    </Box>

                    <Divider />

                    {/* LISTA */}

                    <Box
                        sx={{
                            flex: 1,
                            overflowY: "auto",
                            minHeight: 0,
                            "&::-webkit-scrollbar": {
                                width: 6,
                            },
                            "&::-webkit-scrollbar-thumb": {
                                bgcolor:
                                    "action.disabled",
                                borderRadius: 10,
                            },
                        }}
                    >

                        {loadingConversas ? (

                            <Box
                                sx={{
                                    display: "flex",
                                    flexDirection:
                                        "column",
                                    alignItems:
                                        "center",
                                    justifyContent:
                                        "center",
                                    py: 6,
                                    gap: 1.5,
                                }}
                            >

                                <CircularProgress
                                    size={28}
                                />

                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    Carregando conversas...
                                </Typography>

                            </Box>

                        ) : conversasFiltradas.length === 0 ? (

                            <Box
                                sx={{
                                    p: 4,
                                    textAlign: "center",
                                }}
                            >

                                <Avatar
                                    sx={{
                                        width: 52,
                                        height: 52,
                                        mx: "auto",
                                        mb: 1.5,
                                        bgcolor:
                                            "action.hover",
                                        color:
                                            "text.secondary",
                                    }}
                                >
                                    {buscaConversas ? (
                                        <SearchIcon />
                                    ) : (
                                        <ChatIcon />
                                    )}
                                </Avatar>

                                <Typography
                                    fontWeight={700}
                                    sx={{ mb: 0.5 }}
                                >
                                    {buscaConversas
                                        ? "Nenhuma conversa encontrada"
                                        : "Nenhuma conversa ainda"}
                                </Typography>

                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    {buscaConversas
                                        ? "Tente pesquisar por outro nome."
                                        : "Comece uma conversa com um funcionário."}
                                </Typography>

                            </Box>

                        ) : (

                            conversasFiltradas.map(
                                (conversa) => {

                                    const selecionada =
                                        String(
                                            conversaSelecionada?.id
                                        ) ===
                                        String(
                                            conversa.id
                                        );

                                    const nome =
                                        obterNomeConversa(
                                            conversa
                                        );

                                    const naoLidas =
                                        Number(
                                            conversa.mensagens_nao_lidas ||
                                            0
                                        );
                                    console.log("CONVERSA:", conversa)
                                    return (

                                        <Box
                                            key={conversa.id}
                                            onClick={() =>
                                                selecionarConversa(
                                                    conversa
                                                )
                                            }
                                            sx={{
                                                px: 1.5,
                                                py: 1.35,
                                                cursor:
                                                    "pointer",
                                                position:
                                                    "relative",
                                                bgcolor:
                                                    selecionada
                                                        ? "action.selected"
                                                        : "transparent",
                                                borderBottom:
                                                    "1px solid",
                                                borderColor:
                                                    "divider",
                                                transition:
                                                    "background-color 0.15s ease",
                                                "&:hover": {
                                                    bgcolor:
                                                        selecionada
                                                            ? "action.selected"
                                                            : "action.hover",
                                                },
                                                "&::before": {
                                                    content:
                                                        '""',
                                                    position:
                                                        "absolute",
                                                    left: 0,
                                                    top: 8,
                                                    bottom: 8,
                                                    width: 3,
                                                    borderRadius:
                                                        "0 5px 5px 0",
                                                    bgcolor:
                                                        selecionada
                                                            ? "primary.main"
                                                            : "transparent",
                                                },
                                            }}
                                        >

                                            <Box
                                                sx={{
                                                    display:
                                                        "flex",
                                                    alignItems:
                                                        "center",
                                                    gap: 1.25,
                                                }}
                                            >

                                                <Badge
                                                    badgeContent={
                                                        naoLidas > 99
                                                            ? "99+"
                                                            : naoLidas
                                                    }
                                                    color="primary"
                                                    invisible={
                                                        naoLidas === 0
                                                    }
                                                    sx={{
                                                        "& .MuiBadge-badge":
                                                        {
                                                            fontSize:
                                                                "0.62rem",
                                                            minWidth:
                                                                18,
                                                            height:
                                                                18,
                                                        },
                                                    }}
                                                >

                                                    <Avatar
                                                        sx={{
                                                            width: 43,
                                                            height: 43,
                                                            bgcolor:
                                                                conversa.tipo ===
                                                                    "grupo"
                                                                    ? "secondary.main"
                                                                    : obterCorAvatar(
                                                                        conversa.id
                                                                    ),
                                                        }}
                                                    >
                                                        {conversa.tipo ===
                                                            "grupo" ? (
                                                            <GroupIcon />
                                                        ) : (
                                                            obterInicial(
                                                                nome
                                                            )
                                                        )}
                                                    </Avatar>

                                                </Badge>

                                                <Box
                                                    sx={{
                                                        minWidth: 0,
                                                        flex: 1,
                                                    }}
                                                >

                                                    <Box
                                                        sx={{
                                                            display:
                                                                "flex",
                                                            justifyContent:
                                                                "space-between",
                                                            alignItems:
                                                                "center",
                                                            gap: 1,
                                                        }}
                                                    >

                                                        <Typography
                                                            fontWeight={
                                                                naoLidas > 0
                                                                    ? 800
                                                                    : 650
                                                            }
                                                            noWrap
                                                            sx={{
                                                                minWidth:
                                                                    0,
                                                            }}
                                                        >
                                                            {nome}
                                                        </Typography>

                                                        {conversa.ultima_mensagem_em && (

                                                            <Typography
                                                                variant="caption"
                                                                color="text.secondary"
                                                                sx={{
                                                                    flexShrink:
                                                                        0,
                                                                    fontSize:
                                                                        "0.68rem",
                                                                }}
                                                            >
                                                                {formatarHorario(
                                                                    conversa.ultima_mensagem_em
                                                                )}
                                                            </Typography>

                                                        )}

                                                    </Box>

                                                    <Box
                                                        sx={{
                                                            display:
                                                                "flex",
                                                            alignItems:
                                                                "center",
                                                            gap: 0.5,
                                                            mt: 0.25,
                                                        }}
                                                    >

                                                        {conversa.tipo !== "grupo" &&
                                                            conversa.ultima_mensagem_id &&
                                                            String(
                                                                conversa.ultima_mensagem_remetente_id
                                                            ) ===
                                                            String(userInfo?.id) && (

                                                                <DoneAllIcon
                                                                    sx={{
                                                                        fontSize: 14,
                                                                        color: conversaFoiVisualizada(
                                                                            conversa
                                                                        )
                                                                            ? "primary.confirmar"
                                                                            : "text.secondary",
                                                                    }}
                                                                />

                                                            )}

                                                        <Typography
                                                            variant="body2"
                                                            color={
                                                                naoLidas > 0
                                                                    ? "text.primary"
                                                                    : "text.secondary"
                                                            }
                                                            fontWeight={
                                                                naoLidas > 0
                                                                    ? 600
                                                                    : 400
                                                            }
                                                            noWrap
                                                            sx={{
                                                                minWidth:
                                                                    0,
                                                            }}
                                                        >
                                                            {conversa.ultima_mensagem ||
                                                                (
                                                                    conversa.tipo ===
                                                                        "grupo"
                                                                        ? "Grupo"
                                                                        : "Nenhuma mensagem"
                                                                )}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </Box>
                                        </Box>
                                    );
                                }
                            )
                        )}
                    </Box>
                </Paper>

                {/* ÁREA DA CONVERSA */}

                <Paper
                    elevation={0}
                    sx={{
                        bgcolor:
                            "background.card",
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: {
                            xs: 0,
                            md: 3,
                        },
                        overflow: "hidden",
                        display: "flex",
                        flexDirection: "column",
                        minHeight: 0,
                    }}
                >

                    {!conversaSelecionada ? (

                        <Box
                            sx={{
                                flex: 1,
                                display: "flex",
                                flexDirection:
                                    "column",
                                alignItems:
                                    "center",
                                justifyContent:
                                    "center",
                                p: 4,
                                background:
                                    "radial-gradient(circle at center, rgba(127,127,127,0.06), transparent 55%)",
                            }}
                        >

                            <Avatar
                                sx={{
                                    width: 86,
                                    height: 86,
                                    mb: 2,
                                    bgcolor:
                                        "action.hover",
                                    color:
                                        "text.secondary",
                                }}
                            >
                                <ChatIcon
                                    sx={{
                                        fontSize: 42,
                                    }}
                                />
                            </Avatar>

                            <Typography
                                variant="h5"
                                fontWeight={800}
                            >
                                SIGEL Chat
                            </Typography>

                            <Typography
                                color="text.secondary"
                                sx={{
                                    mt: 0.75,
                                    textAlign: "center",
                                    maxWidth: 420,
                                }}
                            >
                                Selecione uma conversa ao lado
                                ou inicie uma nova para
                                começar.
                            </Typography>

                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={
                                    abrirNovaConversa
                                }
                                sx={{
                                    mt: 2.5,
                                    borderRadius: 2.5,
                                    textTransform:
                                        "none",
                                    fontWeight: 700,
                                }}
                            >
                                Nova conversa
                            </Button>

                        </Box>

                    ) : (

                        <>

                            {/* CABEÇALHO DA CONVERSA */}

                            <Box
                                sx={{
                                    px: {
                                        xs: 1.5,
                                        md: 2,
                                    },
                                    py: 1.25,
                                    display: "flex",
                                    alignItems:
                                        "center",
                                    gap: 1.25,
                                    minHeight: 68,
                                    bgcolor:
                                        "background.card",
                                }}
                            >

                                <Avatar
                                    sx={{
                                        width: 43,
                                        height: 43,
                                        bgcolor:
                                            conversaSelecionada.tipo ===
                                                "grupo"
                                                ? "secondary.main"
                                                : obterCorAvatar(
                                                    conversaSelecionada.id
                                                ),
                                    }}
                                >
                                    {conversaSelecionada.tipo ===
                                        "grupo" ? (
                                        <GroupIcon />
                                    ) : (
                                        obterInicial(
                                            obterNomeConversa(
                                                conversaSelecionada
                                            )
                                        )
                                    )}
                                </Avatar>

                                <Box
                                    sx={{
                                        minWidth: 0,
                                        flex: 1,
                                    }}
                                >

                                    <Typography
                                        fontWeight={800}
                                        noWrap
                                    >
                                        {obterNomeConversa(
                                            conversaSelecionada
                                        )}
                                    </Typography>

                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                    >
                                        {conversaSelecionada.tipo ===
                                            "grupo"
                                            ? "Grupo"
                                            : "Conversa individual"}
                                    </Typography>

                                </Box>

                                <Tooltip title="Atualizar mensagens">

                                    <IconButton
                                        size="small"
                                        onClick={() =>
                                            carregarMensagens(
                                                conversaSelecionada
                                            )
                                        }
                                        disabled={
                                            loadingMensagens
                                        }
                                    >
                                        {loadingMensagens ? (
                                            <CircularProgress
                                                size={19}
                                            />
                                        ) : (
                                            <RefreshIcon
                                                fontSize="small"
                                            />
                                        )}
                                    </IconButton>

                                </Tooltip>

                            </Box>

                            <Divider />

                            {/* MENSAGENS */}

                            <Box
                                ref={mensagensRef}
                                sx={{
                                    flex: 1,
                                    overflowY: "auto",
                                    px: {
                                        xs: 1.25,
                                        md: 3,
                                    },
                                    py: 2,
                                    display: "flex",
                                    flexDirection:
                                        "column",
                                    gap: 1,
                                    bgcolor:
                                        "background.default",
                                    backgroundImage:
                                        "radial-gradient(rgba(127,127,127,0.08) 1px, transparent 1px)",
                                    backgroundSize:
                                        "20px 20px",
                                    "&::-webkit-scrollbar":
                                    {
                                        width: 7,
                                    },
                                    "&::-webkit-scrollbar-thumb":
                                    {
                                        bgcolor:
                                            "action.disabled",
                                        borderRadius: 10,
                                    },
                                }}
                            >

                                {loadingMensagens ? (

                                    <Box
                                        sx={{
                                            flex: 1,
                                            display:
                                                "flex",
                                            flexDirection:
                                                "column",
                                            alignItems:
                                                "center",
                                            justifyContent:
                                                "center",
                                            gap: 1.5,
                                        }}
                                    >

                                        <CircularProgress
                                            size={30}
                                        />

                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                        >
                                            Carregando mensagens...
                                        </Typography>

                                    </Box>

                                ) : mensagens.length === 0 ? (

                                    <Box
                                        sx={{
                                            flex: 1,
                                            display:
                                                "flex",
                                            flexDirection:
                                                "column",
                                            alignItems:
                                                "center",
                                            justifyContent:
                                                "center",
                                            textAlign:
                                                "center",
                                        }}
                                    >

                                        <Avatar
                                            sx={{
                                                width: 58,
                                                height: 58,
                                                mb: 1.5,
                                                bgcolor:
                                                    "action.hover",
                                                color:
                                                    "text.secondary",
                                            }}
                                        >
                                            <ChatIcon />
                                        </Avatar>

                                        <Typography
                                            fontWeight={700}
                                        >
                                            Nenhuma mensagem ainda
                                        </Typography>

                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{
                                                mt: 0.5,
                                            }}
                                        >
                                            Envie a primeira mensagem.
                                        </Typography>

                                    </Box>

                                ) : (

                                    mensagens.map(
                                        (mensagem) => {

                                            const minha =
                                                String(
                                                    mensagem.remetente_id
                                                ) ===
                                                String(
                                                    userInfo?.id
                                                );

                                            const destacada =
                                                mensagemDestacada ===
                                                mensagem.id;
                                            console.log("MENSAGEM RESPONDIDA:", mensagem);
                                            return (

                                                <Box
                                                    key={
                                                        mensagem.id
                                                    }
                                                    id={`msg-${mensagem.id}`}
                                                    sx={{
                                                        display:
                                                            "flex",
                                                        justifyContent:
                                                            minha
                                                                ? "flex-end"
                                                                : "flex-start",
                                                        px: {
                                                            xs: 0,
                                                            md: 1,
                                                        },
                                                    }}
                                                >

                                                    <Box
                                                        sx={{
                                                            maxWidth: {
                                                                xs: "88%",
                                                                sm: "75%",
                                                                md: "68%",
                                                            },
                                                            minWidth:
                                                                70,
                                                            px: 1.6,
                                                            py: 1,
                                                            borderRadius:
                                                                minha
                                                                    ? "18px 18px 4px 18px"
                                                                    : "18px 18px 18px 4px",
                                                            position:
                                                                "relative",
                                                            bgcolor:
                                                                destacada
                                                                    ? "warning.light"
                                                                    : minha
                                                                        ? "primary.main"
                                                                        : "background.alerta",
                                                            color:
                                                                destacada
                                                                    ? "text.primary"
                                                                    : minha
                                                                        ? "primary.contrastText"
                                                                        : "text.primary",
                                                            border:
                                                                minha
                                                                    ? "none"
                                                                    : "1px solid",
                                                            borderColor:
                                                                minha
                                                                    ? "transparent"
                                                                    : "divider",
                                                            boxShadow:
                                                                "0 1px 2px rgba(0,0,0,0.08)",
                                                            transition:
                                                                "all 0.25s ease",
                                                            "&:hover .menu-mensagem-btn":
                                                            {
                                                                opacity: 1,
                                                            },
                                                        }}
                                                    >

                                                        {/* MENU */}

                                                        {!mensagem.apagada_em && (

                                                            <IconButton
                                                                className="menu-mensagem-btn"
                                                                size="small"
                                                                onClick={(
                                                                    event
                                                                ) =>
                                                                    abrirMenuMensagem(
                                                                        event,
                                                                        mensagem
                                                                    )
                                                                }
                                                                sx={{
                                                                    position: "absolute",
                                                                    top: -1,
                                                                    right: minha ? 5 : "auto",
                                                                    left: minha ? "auto" : 0,
                                                                    width: 20,
                                                                    height: 20,

                                                                    opacity: 0,
                                                                    transition: "opacity 0.2s ease",

                                                                    "&:hover": {
                                                                        opacity: 1,
                                                                    },
                                                                }}
                                                            >
                                                                <ExpandMoreIcon
                                                                    sx={{
                                                                        fontSize: 15,
                                                                    }}
                                                                />
                                                            </IconButton>

                                                        )}

                                                        {/* REMETENTE */}

                                                        {!minha && conversaSelecionada.tipo !== "individual" && (

                                                            <Typography
                                                                variant="caption"
                                                                fontWeight={800}
                                                                sx={{
                                                                    display:
                                                                        "block",
                                                                    mb: 0.4,
                                                                    color:
                                                                        "primary.main",
                                                                }}
                                                            >
                                                                {mensagem.remetente_nome ||
                                                                    mensagem.remetente_codigo ||
                                                                    "Usuário"}
                                                            </Typography>

                                                        )}

                                                        {/* RESPOSTA */}

                                                        {mensagem.resposta && (

                                                            <Box
                                                                onClick={() =>
                                                                    rolarAteMensagem(
                                                                        mensagem.resposta_a_id
                                                                    )
                                                                }
                                                                sx={{
                                                                    cursor:
                                                                        "pointer",
                                                                    mb: 0.8,
                                                                    pl: 1,
                                                                    py: 0.55,
                                                                    pr: 0.8,
                                                                    borderLeft:
                                                                        "3px solid",
                                                                    borderColor:
                                                                        minha
                                                                            ? "rgba(255,255,255,0.75)"
                                                                            : "primary.main",
                                                                    bgcolor:
                                                                        minha
                                                                            ? "rgba(255,255,255,0.12)"
                                                                            : "action.hover",
                                                                    borderRadius:
                                                                        1,
                                                                    overflow:
                                                                        "hidden",
                                                                    transition:
                                                                        "background-color 0.2s",
                                                                    "&:hover":
                                                                    {
                                                                        bgcolor:
                                                                            minha
                                                                                ? "rgba(255,255,255,0.18)"
                                                                                : "action.selected",
                                                                    },
                                                                }}
                                                            >

                                                                <Typography
                                                                    variant="caption"
                                                                    fontWeight={800}
                                                                    sx={{
                                                                        display:
                                                                            "block",
                                                                    }}
                                                                >
                                                                    {mensagem.resposta.remetente_nome ||
                                                                        "Usuário"}
                                                                </Typography>

                                                                <Typography
                                                                    variant="caption"
                                                                    noWrap
                                                                    sx={{
                                                                        display:
                                                                            "block",
                                                                        opacity:
                                                                            0.75,
                                                                    }}
                                                                >
                                                                    {previaTexto(
                                                                        mensagem.resposta
                                                                    )}
                                                                </Typography>

                                                            </Box>

                                                        )}

                                                        {/* CONTEÚDO */}

                                                        {mensagem.apagada_em ? (

                                                            <Typography
                                                                variant="body2"
                                                                sx={{
                                                                    fontStyle:
                                                                        "italic",
                                                                    opacity:
                                                                        0.65,
                                                                    py: 0.25,
                                                                }}
                                                            >
                                                                Mensagem apagada
                                                            </Typography>

                                                        ) : mensagem.tipo ===
                                                            "imagem" &&
                                                            mensagem.anexo ? (

                                                            <Box>

                                                                {imagensAutenticadas[
                                                                    mensagem.anexo.id
                                                                ] ? (

                                                                    <Box
                                                                        component="img"
                                                                        src={
                                                                            imagensAutenticadas[
                                                                            mensagem.anexo.id
                                                                            ]
                                                                        }
                                                                        alt={
                                                                            mensagem.anexo.nome_original ||
                                                                            "Imagem enviada"
                                                                        }
                                                                        onClick={() =>
                                                                            abrirImagem(
                                                                                mensagem.anexo.url
                                                                            )
                                                                        }
                                                                        sx={{
                                                                            display:
                                                                                "block",
                                                                            maxWidth:
                                                                            {
                                                                                xs: 250,
                                                                                sm: 330,
                                                                            },
                                                                            maxHeight:
                                                                                350,
                                                                            width:
                                                                                "auto",
                                                                            height:
                                                                                "auto",
                                                                            objectFit:
                                                                                "contain",
                                                                            borderRadius:
                                                                                1.5,
                                                                            cursor:
                                                                                "pointer",
                                                                            border:
                                                                                "1px solid",
                                                                            borderColor:
                                                                                minha
                                                                                    ? "rgba(255,255,255,0.18)"
                                                                                    : "divider",
                                                                            "&:hover":
                                                                            {
                                                                                opacity:
                                                                                    0.9,
                                                                            },
                                                                        }}
                                                                    />

                                                                ) : (

                                                                    <Box
                                                                        sx={{
                                                                            width: 180,
                                                                            height: 140,
                                                                            display:
                                                                                "flex",
                                                                            flexDirection:
                                                                                "column",
                                                                            alignItems:
                                                                                "center",
                                                                            justifyContent:
                                                                                "center",
                                                                            gap: 1,
                                                                            borderRadius:
                                                                                2,
                                                                            bgcolor:
                                                                                minha
                                                                                    ? "rgba(255,255,255,0.1)"
                                                                                    : "action.hover",
                                                                        }}
                                                                    >

                                                                        <CircularProgress
                                                                            size={24}
                                                                            sx={{
                                                                                color:
                                                                                    minha
                                                                                        ? "inherit"
                                                                                        : "primary.main",
                                                                            }}
                                                                        />

                                                                        <Typography
                                                                            variant="caption"
                                                                        >
                                                                            Carregando imagem...
                                                                        </Typography>

                                                                    </Box>

                                                                )}

                                                                {mensagem.anexo.nome_original && (

                                                                    <Typography
                                                                        variant="caption"
                                                                        sx={{
                                                                            display:
                                                                                "block",
                                                                            mt: 0.5,
                                                                            opacity:
                                                                                0.65,
                                                                            maxWidth:
                                                                                330,
                                                                            overflow:
                                                                                "hidden",
                                                                            textOverflow:
                                                                                "ellipsis",
                                                                            whiteSpace:
                                                                                "nowrap",
                                                                        }}
                                                                    >
                                                                        {mensagem.anexo.nome_original}
                                                                    </Typography>

                                                                )}

                                                            </Box>

                                                        ) : (

                                                            <Typography
                                                                sx={{
                                                                    whiteSpace:
                                                                        "pre-wrap",
                                                                    wordBreak:
                                                                        "break-word",
                                                                    lineHeight:
                                                                        1.45,
                                                                }}
                                                            >
                                                                {mensagem.texto}
                                                            </Typography>

                                                        )}

                                                        {/* DATA */}

                                                        <Box
                                                            sx={{
                                                                display:
                                                                    "flex",
                                                                justifyContent:
                                                                    "flex-end",
                                                                alignItems:
                                                                    "center",
                                                                gap: 0.5,
                                                                mt: 0.45,
                                                                ml: 1,
                                                            }}
                                                        >

                                                            {mensagem.editada_em &&
                                                                !mensagem.apagada_em && (

                                                                    <Typography
                                                                        variant="caption"
                                                                        sx={{
                                                                            opacity:
                                                                                0.55,
                                                                            fontSize:
                                                                                "0.64rem",
                                                                        }}
                                                                    >
                                                                        editada
                                                                    </Typography>

                                                                )}

                                                            <Typography
                                                                variant="caption"
                                                                sx={{
                                                                    opacity:
                                                                        0.6,
                                                                    fontSize:
                                                                        "0.64rem",
                                                                }}
                                                            >
                                                                {formatarHorario(
                                                                    mensagem.criada_em
                                                                )}
                                                            </Typography>

                                                            {minha &&
                                                                !mensagem.apagada_em && (

                                                                    <DoneAllIcon
                                                                        sx={{
                                                                            fontSize: 14,
                                                                            color: mensagem.visualizada
                                                                                ? "primary.confirmar"
                                                                                : "text.secondary",
                                                                        }}
                                                                    />

                                                                )}

                                                        </Box>
                                                    </Box>
                                                </Box>
                                            );
                                        }
                                    )
                                )}
                            </Box>

                            {/* COMPOSER */}

                            <Divider />

                            <Box
                                sx={{
                                    p: {
                                        xs: 1,
                                        md: 1.5,
                                    },
                                    bgcolor:
                                        "background.card",
                                }}
                            >

                                {/* RESPONDENDO */}

                                {respondendoA && (

                                    <Box
                                        sx={{
                                            mb: 1,
                                            px: 1.25,
                                            py: 0.8,
                                            display:
                                                "flex",
                                            alignItems:
                                                "center",
                                            gap: 1,
                                            borderLeft:
                                                "3px solid",
                                            borderColor:
                                                "primary.main",
                                            bgcolor:
                                                "action.hover",
                                            borderRadius: 1.5,
                                        }}
                                    >

                                        <ReplyIcon
                                            fontSize="small"
                                            color="primary"
                                        />

                                        <Box
                                            sx={{
                                                minWidth: 0,
                                                flex: 1,
                                            }}
                                        >

                                            <Typography
                                                variant="caption"
                                                fontWeight={800}
                                                color="primary.main"
                                                sx={{
                                                    display:
                                                        "block",
                                                }}
                                            >
                                                Respondendo a{" "}
                                                {respondendoA.remetente_nome ||
                                                    "mensagem"}
                                            </Typography>

                                            <Typography
                                                variant="caption"
                                                noWrap
                                                color="text.secondary"
                                            >
                                                {previaTexto(
                                                    respondendoA
                                                )}
                                            </Typography>

                                        </Box>

                                        <IconButton
                                            size="small"
                                            onClick={
                                                cancelarResposta
                                            }
                                        >
                                            <CloseIcon
                                                fontSize="small"
                                            />
                                        </IconButton>

                                    </Box>

                                )}

                                {/* EDITANDO */}

                                {editandoMensagem && (

                                    <Box
                                        sx={{
                                            mb: 1,
                                            px: 1.25,
                                            py: 0.8,
                                            display:
                                                "flex",
                                            alignItems:
                                                "center",
                                            gap: 1,
                                            borderLeft:
                                                "3px solid",
                                            borderColor:
                                                "warning.main",
                                            bgcolor:
                                                "action.hover",
                                            borderRadius: 1.5,
                                        }}
                                    >

                                        <EditIcon
                                            fontSize="small"
                                            sx={{
                                                color:
                                                    "warning.main",
                                            }}
                                        />

                                        <Box
                                            sx={{
                                                flex: 1,
                                            }}
                                        >

                                            <Typography
                                                variant="caption"
                                                fontWeight={800}
                                                color="warning.main"
                                            >
                                                Editando mensagem
                                            </Typography>

                                            <Typography
                                                variant="caption"
                                                display="block"
                                                color="text.secondary"
                                            >
                                                Pressione Enter para
                                                salvar ou Esc para
                                                cancelar.
                                            </Typography>

                                        </Box>

                                        <IconButton
                                            size="small"
                                            onClick={
                                                cancelarEdicao
                                            }
                                        >
                                            <CloseIcon
                                                fontSize="small"
                                            />
                                        </IconButton>

                                    </Box>

                                )}

                                {/* PREVIEW IMAGEM */}

                                {previewImagem && (

                                    <Box
                                        sx={{
                                            mb: 1,
                                            p: 0.75,
                                            width:
                                                "fit-content",
                                            border:
                                                "1px solid",
                                            borderColor:
                                                "divider",
                                            borderRadius:
                                                2,
                                            display:
                                                "flex",
                                            alignItems:
                                                "center",
                                            gap: 1,
                                            position:
                                                "relative",
                                            bgcolor:
                                                "action.hover",
                                        }}
                                    >

                                        <Box
                                            component="img"
                                            src={
                                                previewImagem
                                            }
                                            alt="Pré-visualização"
                                            sx={{
                                                width: 76,
                                                height: 76,
                                                objectFit:
                                                    "cover",
                                                borderRadius:
                                                    1.5,
                                            }}
                                        />

                                        <Box
                                            sx={{
                                                mr: 4,
                                                minWidth: 0,
                                            }}
                                        >

                                            <Typography
                                                variant="body2"
                                                fontWeight={700}
                                                noWrap
                                                sx={{
                                                    maxWidth:
                                                        220,
                                                }}
                                            >
                                                {imagemSelecionada?.name}
                                            </Typography>

                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                            >
                                                Imagem pronta para
                                                envio
                                            </Typography>

                                        </Box>

                                        <IconButton
                                            size="small"
                                            onClick={
                                                removerImagemSelecionada
                                            }
                                            disabled={
                                                enviandoImagem
                                            }
                                            sx={{
                                                position:
                                                    "absolute",
                                                top: 4,
                                                right: 4,
                                                bgcolor:
                                                    "background.paper",
                                                border:
                                                    "1px solid",
                                                borderColor:
                                                    "divider",
                                                "&:hover":
                                                {
                                                    bgcolor:
                                                        "background.paper",
                                                },
                                            }}
                                        >
                                            <CloseIcon
                                                fontSize="small"
                                            />
                                        </IconButton>

                                    </Box>

                                )}

                                {/* INPUT */}

                                <Box
                                    sx={{
                                        display:
                                            "flex",
                                        alignItems:
                                            "flex-end",
                                        gap: 0.75,
                                    }}
                                >

                                    {/* ANEXO */}

                                    <Tooltip title="Enviar imagem">

                                        <span>

                                            <IconButton
                                                color="primary"
                                                onClick={() =>
                                                    inputArquivoRef.current?.click()
                                                }
                                                disabled={
                                                    enviando ||
                                                    enviandoImagem ||
                                                    Boolean(
                                                        editandoMensagem
                                                    )
                                                }
                                                sx={{
                                                    width: 44,
                                                    height: 44,
                                                    flexShrink: 0,
                                                    mb: 0.15,
                                                }}
                                            >

                                                <AttachFileIcon />

                                                <input
                                                    ref={
                                                        inputArquivoRef
                                                    }
                                                    hidden
                                                    type="file"
                                                    accept="image/jpeg,image/png,image/webp"
                                                    onChange={
                                                        selecionarImagem
                                                    }
                                                />

                                            </IconButton>

                                        </span>

                                    </Tooltip>

                                    {/* CAMPO */}

                                    <TextField
                                        fullWidth
                                        multiline
                                        maxRows={5}
                                        value={texto}
                                        onChange={(event) =>
                                            setTexto(
                                                event.target.value
                                            )
                                        }
                                        onKeyDown={
                                            handleKeyDown
                                        }
                                        disabled={
                                            enviando ||
                                            enviandoImagem
                                        }
                                        placeholder={
                                            editandoMensagem
                                                ? "Edite sua mensagem..."
                                                : imagemSelecionada
                                                    ? "Adicione uma mensagem ou envie a imagem..."
                                                    : "Digite uma mensagem..."
                                        }
                                        sx={{
                                            "& .MuiOutlinedInput-root":
                                            {
                                                borderRadius:
                                                    3,
                                                bgcolor:
                                                    "action.hover",
                                                px: 1.5,
                                                py: 0.75,
                                            },
                                            "& textarea":
                                            {
                                                lineHeight:
                                                    1.4,
                                            },
                                        }}
                                    />

                                    {/* ENVIAR */}

                                    <Tooltip
                                        title={
                                            editandoMensagem
                                                ? "Salvar edição"
                                                : "Enviar"
                                        }
                                    >

                                        <span>

                                            <IconButton
                                                color="primary"
                                                onClick={
                                                    editandoMensagem
                                                        ? salvarEdicao
                                                        : imagemSelecionada
                                                            ? enviarImagem
                                                            : enviarMensagem
                                                }
                                                disabled={
                                                    enviando ||
                                                    enviandoImagem ||
                                                    (
                                                        editandoMensagem
                                                            ? !texto.trim()
                                                            : (
                                                                !texto.trim() &&
                                                                !imagemSelecionada
                                                            )
                                                    )
                                                }
                                                sx={{
                                                    width: 46,
                                                    height: 46,
                                                    flexShrink: 0,
                                                    bgcolor:
                                                        "primary.main",
                                                    color:
                                                        "primary.contrastText",
                                                    "&:hover":
                                                    {
                                                        bgcolor:
                                                            "primary.dark",
                                                    },
                                                    "&.Mui-disabled":
                                                    {
                                                        bgcolor:
                                                            "action.disabledBackground",
                                                        color:
                                                            "action.disabled",
                                                    },
                                                }}
                                            >

                                                {enviando ||
                                                    enviandoImagem ? (

                                                    <CircularProgress
                                                        size={22}
                                                        sx={{
                                                            color:
                                                                "inherit",
                                                        }}
                                                    />

                                                ) : editandoMensagem ? (

                                                    <CheckIcon />

                                                ) : (

                                                    <SendIcon />
                                                )}

                                            </IconButton>

                                        </span>

                                    </Tooltip>

                                </Box>

                                {/* DICA */}

                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{
                                        display: {
                                            xs: "none",
                                            sm: "block",
                                        },
                                        mt: 0.65,
                                        ml: 6,
                                        opacity: 0.65,
                                    }}
                                >
                                    Enter envia · Shift + Enter
                                    quebra linha · Esc cancela
                                </Typography>

                            </Box>

                        </>
                    )}

                </Paper>

            </Box>

            {/* MENU DA MENSAGEM */}

            <Menu
                anchorEl={menuAnchorEl}
                open={Boolean(menuAnchorEl)}
                onClose={fecharMenuMensagem}
                slotProps={{
                    paper: {
                        elevation: 4,
                        sx: {
                            minWidth: 180,
                            borderRadius: 2,
                            mt: 0.5,
                            border: "1px solid",
                            borderColor: "divider",
                            bgcolor: 'background.card'
                        },
                    },
                }}
            >

                <MenuItem
                    onClick={() =>
                        mensagemMenuAtiva &&
                        iniciarResposta(
                            mensagemMenuAtiva
                        )
                    }
                >
                    <ListItemIcon>
                        <ReplyIcon
                            fontSize="small"
                        />
                    </ListItemIcon>

                    <ListItemText>
                        Responder
                    </ListItemText>
                </MenuItem>

                {podeCopiar(
                    mensagemMenuAtiva
                ) && (

                        <MenuItem
                            onClick={() =>
                                copiarMensagem(
                                    mensagemMenuAtiva
                                )
                            }
                        >
                            <ListItemIcon>
                                <ContentCopyIcon
                                    fontSize="small"
                                />
                            </ListItemIcon>

                            <ListItemText>
                                Copiar
                            </ListItemText>
                        </MenuItem>
                    )}

                {podeEditar(
                    mensagemMenuAtiva
                ) && (

                        <MenuItem
                            onClick={() =>
                                iniciarEdicao(
                                    mensagemMenuAtiva
                                )
                            }
                        >
                            <ListItemIcon>
                                <EditIcon
                                    fontSize="small"
                                />
                            </ListItemIcon>

                            <ListItemText>
                                Editar
                            </ListItemText>
                        </MenuItem>
                    )}

                {podeExcluir(
                    mensagemMenuAtiva
                ) && (

                        <MenuItem
                            onClick={() =>
                                solicitarExclusao(
                                    mensagemMenuAtiva
                                )
                            }
                        >
                            <ListItemIcon>
                                <DeleteIcon
                                    fontSize="small"
                                    color="error"
                                />
                            </ListItemIcon>

                            <ListItemText
                                sx={{
                                    color:
                                        "error.main",
                                }}
                            >
                                Excluir
                            </ListItemText>
                        </MenuItem>
                    )}

            </Menu>

            {/* NOVA CONVERSA */}

            <Dialog
                open={dialogNovaConversa}
                onClose={fecharNovaConversa}
                fullWidth
                maxWidth="sm"
                slotProps={{
                    paper: {
                        sx: {
                            bgcolor:
                                "background.default",
                            color:
                                "text.primary",
                            borderRadius: 3,
                            border:
                                "1px solid",
                            borderColor:
                                "divider",
                        },
                    },
                }}
            >

                <DialogTitle
                    sx={{
                        pb: 1,
                        display: "flex",
                        alignItems: "center",
                        gap: 1.25,
                    }}
                >

                    <Avatar
                        sx={{
                            width: 40,
                            height: 40,
                            bgcolor:
                                "primary.main",
                        }}
                    >
                        <ChatIcon sx={{ color: 'primary.branco', fontSize: 20 }} />
                    </Avatar>

                    <Box>

                        <Typography
                            fontWeight={800}
                        >
                            Nova conversa
                        </Typography>

                        <Typography
                            variant="caption"
                            color="text.secondary"
                        >
                            Escolha um funcionário para
                            conversar.
                        </Typography>

                    </Box>

                </DialogTitle>

                <DialogContent
                    sx={{
                        pt: "12px !important",
                    }}
                >

                    <Autocomplete
                        slotProps={{
                            paper: {
                                sx: {
                                    bgcolor: "background.default",
                                    color: "text.primary",
                                    border: "1px solid",
                                    borderColor: "divider",
                                    boxShadow: 8,

                                    "& .MuiAutocomplete-option": {
                                        color: "text.primary",

                                        "&[aria-selected='true']": {
                                            bgcolor: "action.selected",
                                        },

                                        "&.Mui-focused": {
                                            bgcolor: "action.hover",
                                        },

                                        "&[aria-selected='true'].Mui-focused": {
                                            bgcolor: "action.selected",
                                        },
                                    },

                                    "& .MuiAutocomplete-noOptions": {
                                        color: "text.secondary",
                                    },

                                    "& .MuiAutocomplete-loading": {
                                        color: "text.secondary",
                                    },
                                },
                            },
                        }}
                        fullWidth
                        options={funcionarios.filter(
                            (funcionario) =>
                                String(
                                    funcionario.id
                                ) !==
                                String(
                                    userInfo?.id
                                )
                        )}
                        loading={
                            carregandoFuncionarios
                        }
                        value={
                            funcionarioSelecionado
                        }
                        onChange={(
                            event,
                            novoFuncionario
                        ) => {
                            setFuncionarioSelecionado(
                                novoFuncionario
                            );
                        }}
                        getOptionLabel={(
                            funcionario
                        ) =>
                            funcionario
                                ? `${funcionario.nome} (${funcionario.codigo})`
                                : ""
                        }
                        isOptionEqualToValue={(
                            option,
                            value
                        ) =>
                            String(
                                option.id
                            ) ===
                            String(
                                value.id
                            )
                        }

                        noOptionsText="Nenhum funcionário encontrado"
                        loadingText="Carregando funcionários..."
                        renderOption={(
                            props,
                            funcionario
                        ) => (

                            <Box
                                component="li"
                                {...props}
                                key={
                                    funcionario.id
                                }
                                sx={{
                                    display:
                                        "flex !important",
                                    gap: 1.25,
                                    alignItems:
                                        "center",
                                    py:
                                        "10px !important",
                                }}
                            >

                                <Avatar
                                    sx={{
                                        width: 36,
                                        height: 36,
                                        fontSize:
                                            "0.9rem",
                                        bgcolor:
                                            obterCorAvatar(
                                                funcionario.id
                                            ),
                                    }}
                                >
                                    {obterInicial(
                                        funcionario.nome
                                    )}
                                </Avatar>

                                <Box
                                    sx={{
                                        minWidth: 0,
                                    }}
                                >

                                    <Typography
                                        fontWeight={650}
                                        noWrap
                                    >
                                        {
                                            funcionario.nome
                                        }
                                    </Typography>

                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                    >
                                        Código:{" "}
                                        {
                                            funcionario.codigo
                                        }
                                    </Typography>

                                </Box>

                            </Box>
                        )}

                        renderInput={(
                            params
                        ) => (

                            <TextField
                                {...params}
                                autoFocus
                                label="Funcionário"
                                placeholder="Digite o nome..."
                                sx={{
                                    mt: 1,
                                    "& .MuiOutlinedInput-root":
                                    {
                                        borderRadius: 2.5,
                                    },
                                }}
                            />
                        )}

                    />

                </DialogContent>

                <DialogActions
                    sx={{
                        px: 3,
                        pb: 2.5,
                        pt: 1,
                    }}
                >

                    <Button
                        onClick={
                            fecharNovaConversa
                        }
                        disabled={
                            criandoConversa
                        }
                        color="inherit"
                        sx={{
                            textTransform:
                                "none",
                            fontWeight: 600,
                        }}
                    >
                        Cancelar
                    </Button>

                    <Button
                        variant="contained"
                        onClick={
                            criarConversa
                        }
                        disabled={
                            !funcionarioSelecionado ||
                            criandoConversa
                        }
                        startIcon={
                            criandoConversa ? (
                                <CircularProgress
                                    size={18}
                                    color="inherit"
                                />
                            ) : (
                                <ChatIcon />
                            )
                        }
                        sx={{
                            borderRadius: 2,
                            textTransform:
                                "none",
                            fontWeight: 700,
                        }}
                    >
                        {criandoConversa
                            ? "Criando..."
                            : "Iniciar conversa"}
                    </Button>

                </DialogActions>

            </Dialog>

            {/* CONFIRMAÇÃO DE EXCLUSÃO */}

            <Dialog
                open={
                    Boolean(
                        mensagemParaExcluir
                    )
                }
                onClose={
                    cancelarExclusao
                }
                maxWidth="xs"
                fullWidth
                slotProps={{
                    paper: {
                        sx: {
                            borderRadius: 3,
                            bgcolor:
                                "background.default",
                            border:
                                "1px solid",
                            borderColor:
                                "divider",
                        },
                    },
                }}
            >

                <DialogTitle
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        fontWeight: 800,
                    }}
                >

                    <DeleteIcon
                        color="error"
                    />

                    Excluir mensagem?
                </DialogTitle>

                <DialogContent>

                    <Typography
                        color="text.secondary"
                    >
                        Essa ação irá marcar a mensagem
                        como apagada para a conversa.
                    </Typography>

                    {mensagemParaExcluir &&
                        !mensagemParaExcluir.apagada_em &&
                        mensagemParaExcluir.tipo ===
                        "texto" && (

                            <Box
                                sx={{
                                    mt: 2,
                                    p: 1.5,
                                    borderRadius: 2,
                                    bgcolor:
                                        "action.hover",
                                    borderLeft:
                                        "3px solid",
                                    borderColor:
                                        "error.main",
                                }}
                            >

                                <Typography
                                    variant="body2"
                                    sx={{
                                        whiteSpace:
                                            "pre-wrap",
                                        wordBreak:
                                            "break-word",
                                    }}
                                >
                                    {mensagemParaExcluir.texto}
                                </Typography>

                            </Box>
                        )}

                </DialogContent>

                <DialogActions
                    sx={{
                        px: 3,
                        pb: 2.5,
                    }}
                >

                    <Button
                        onClick={
                            cancelarExclusao
                        }
                        disabled={
                            excluindoMensagem
                        }
                        color="inherit"
                        sx={{
                            textTransform:
                                "none",
                        }}
                    >
                        Cancelar
                    </Button>

                    <Button
                        variant="contained"
                        color="error"
                        onClick={
                            excluirMensagemAtual
                        }
                        disabled={
                            excluindoMensagem
                        }
                        startIcon={
                            excluindoMensagem ? (
                                <CircularProgress
                                    size={18}
                                    color="inherit"
                                />
                            ) : (
                                <DeleteIcon />
                            )
                        }
                        sx={{
                            textTransform:
                                "none",
                            borderRadius: 2,
                            fontWeight: 700,
                        }}
                    >
                        {excluindoMensagem
                            ? "Excluindo..."
                            : "Excluir"}
                    </Button>

                </DialogActions>

            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={3500}
                onClose={fecharSnackbar}
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "center",
                }}
            >
                <Alert
                    onClose={fecharSnackbar}
                    severity={
                        snackbar.severity
                    }
                    variant="filled"
                    sx={{
                        width: "100%",
                        borderRadius: 2,
                    }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>

        </Container>
    );

}

export default Chat;