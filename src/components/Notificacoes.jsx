// src\components\Notificacoes.jsx

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
    IconButton,
    Badge,
    Popover,
    Box,
    Typography,
    Button,
    List,
    ListItem,
    Divider,
    Tooltip,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";

const DEFAULT_API_BASE = "http://192.168.1.185:8077";

export default function Notificacoes({ apiBase, token, userInfo }) {
    const navigate = useNavigate();

    const [notificacoes, setNotificacoes] = useState([]);
    const [quantidadeNaoLidas, setQuantidadeNaoLidas] = useState(0);
    const [anchorNotificacoes, setAnchorNotificacoes] = useState(null);

    // Recupera configurações com prioridade para props e fallback para localStorage/constantes
    const baseUrl = apiBase || DEFAULT_API_BASE;
    const authToken = token || localStorage.getItem("nfe_token");

    const carregarNotificacoes = useCallback(async () => {
        try {
            const response = await fetch(`${baseUrl}/api/notificacoes`, {
                headers: {
                    "X-Auth-Token": authToken,
                },
            });

            if (!response.ok) {
                throw new Error("Erro ao buscar notificações");
            }

            const data = await response.json();
            const listaNotificacoes = data.notificacoes || [];

            setNotificacoes(listaNotificacoes);
            setQuantidadeNaoLidas(
                listaNotificacoes.filter((n) => !n.lida).length
            );
        } catch (error) {
            console.error("Erro ao carregar notificações:", error);
        }
    }, [baseUrl, authToken]);

    // Polling de 15 segundos
    useEffect(() => {
        carregarNotificacoes();

        const intervalo = setInterval(() => {
            carregarNotificacoes();
        }, 15000);

        return () => clearInterval(intervalo);
    }, [carregarNotificacoes]);

    // Atualização da aba do navegador (Title)
    useEffect(() => {
        if (quantidadeNaoLidas > 0) {
            document.title = `(${quantidadeNaoLidas}) SIGEL WMS`;
        } else {
            document.title = "SIGEL WMS";
        }

        return () => {
            document.title = "SIGEL WMS";
        };
    }, [quantidadeNaoLidas]);


    // Logs de alteração de notas
    const registrarLog = async ({
        nota,
        acao,
        observacao = null,
    }) => {

        console.log("NOTA NO REGISTRAR LOG:", nota)
        console.log("NOTA_ID:", nota.id)

        try {

            const payload = {
                nota_id: nota.id ?? null,
                usuario: userInfo?.codigo,
                acao,
                observacoes: observacao
            };

            const response = await fetch(
                `${baseUrl}/api/nfe/item/movimentacao/log`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-Auth-Token": authToken
                    },
                    body: JSON.stringify(payload)
                }
            );

            if (!response.ok) {
                throw new Error(await response.text());
            }

            return true;

        } catch (error) {
            console.error("Erro ao enviar log:", error);
            return false;
        }
    };

    const buscarNotaPorId = async (nfeId) => {
        try {
            const response = await fetch(
                `${baseUrl}/api/notas/listar?id=${nfeId}`,
                {
                    headers: {
                        "X-Auth-Token": authToken,
                    },
                }
            );

            if (!response.ok) {
                throw new Error("Erro ao buscar nota");
            }

            const data = await response.json();

            return data.data?.[0] || null;

        } catch (error) {
            console.error(
                "Erro ao buscar nota por ID:",
                error
            );

            return null;
        }
    };

    const alterarEtiqueta = async (nota, etiqueta) => {
        if (!nota?.numero || !nota?.serie) {
            console.error("Nota inválida:", nota);
            return false;
        }

        if (nota.etiqueta === etiqueta) {
            console.log(
                `A nota ${nota.id} já possui a etiqueta "${etiqueta}".`
            );

            return true;
        }

        try {
            const response = await fetch(
                `${baseUrl}/api/nfe/atualizar_por_nfe/${nota.serie}/${nota.numero}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "X-Auth-Token": authToken,
                    },
                    body: JSON.stringify({
                        etiqueta,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data?.erro || "Erro ao atualizar etiqueta"
                );
            }

            const logRegistrado = await registrarLog({
                nota,
                acao: "Alterou etiqueta da nota",
                observacao: `Nova etiqueta: ${etiqueta}`,
            });

            if (!logRegistrado) {
                console.error(
                    "Etiqueta alterada, mas o log não foi registrado."
                );

                return false;
            }

            return true;
        } catch (error) {
            console.error("Erro ao alterar etiqueta:", error);
            return false;
        }
    };

    const marcarComoGravada = async (notificacao) => {
        try {
            if (!notificacao?.nfe_id) {
                return false;
            }

            const nota = await buscarNotaPorId(
                notificacao.nfe_id
            );

            if (!nota) {
                console.error(
                    "Nota não encontrada:",
                    notificacao.nfe_id
                );

                return false;
            }

            const sucesso = await alterarEtiqueta(
                nota,
                "Gravada"
            );

            if (!sucesso) {
                return false;
            }

            await marcarNotificacaoComoLida(
                notificacao.id
            );

            return true;

        } catch (error) {
            console.error(
                "Erro ao marcar como gravada:",
                error
            );

            return false;
        }
    };

    const marcarNotificacaoComoLida = async (notificacaoId) => {
        try {
            const response = await fetch(
                `${baseUrl}/api/notificacoes/${notificacaoId}/ler`,
                {
                    method: "PUT",
                    headers: {
                        "X-Auth-Token": authToken,
                    },
                }
            );

            if (!response.ok) {
                throw new Error("Erro ao marcar notificação como lida");
            }

            setNotificacoes((prev) =>
                prev.map((n) =>
                    n.id === notificacaoId ? { ...n, lida: true } : n
                )
            );

            setQuantidadeNaoLidas((prev) => Math.max(0, prev - 1));
        } catch (error) {
            console.error("Erro ao marcar notificação como lida:", error);
        }
    };

    const marcarTodasComoLidas = async () => {
        try {
            const response = await fetch(
                `${baseUrl}/api/notificacoes/ler-todas`,
                {
                    method: "PUT",
                    headers: {
                        "X-Auth-Token": authToken,
                    },
                }
            );

            if (!response.ok) {
                throw new Error("Erro ao marcar todas as notificações");
            }

            setNotificacoes((prev) =>
                prev.map((n) => ({ ...n, lida: true }))
            );
            setQuantidadeNaoLidas(0);
        } catch (error) {
            console.error("Erro ao marcar todas como lidas:", error);
        }
    };

    const abrirNotificacao = async (notificacao) => {
        if (!notificacao?.nfe_id) return;

        try {
            if (!notificacao.lida) {
                await marcarNotificacaoComoLida(notificacao.id);
            }

            fecharNotificacoes();
            navigate(`/AtualizarCean?nota_id=${notificacao.nfe_id}`);
        } catch (error) {
            console.error("Erro ao abrir notificação:", error);
        }
    };

    const handleAcaoNotificacao = async (e, notificacao) => {
        e.stopPropagation();

        if (notificacao.tipo === "CONFERENCIA_FINALIZADA") {
            await marcarComoGravada(notificacao);
            return;
        }

        const textoNotificacao = `
            ${notificacao.tipo || ""}
            ${notificacao.titulo || ""}
            ${notificacao.mensagem || ""}
        `.toUpperCase();

        const ehNotificacaoCorrecao =
            textoNotificacao.includes("CEAN") ||
            textoNotificacao.includes("CORREÇÃO") ||
            textoNotificacao.includes("CORRECAO");

        if (notificacao.nfe_id && ehNotificacaoCorrecao) {
            await abrirNotificacao(notificacao);
        } else {
            await marcarNotificacaoComoLida(notificacao.id);
        }
    };

    const abrirNotificacoes = (event) => {
        setAnchorNotificacoes(event.currentTarget);
    };

    const fecharNotificacoes = () => {
        setAnchorNotificacoes(null);
    };

    const openPopover = Boolean(anchorNotificacoes);

    return (
        <>
            <Tooltip title="Notificações">
                <IconButton color="inherit" onClick={abrirNotificacoes}>
                    <Badge badgeContent={quantidadeNaoLidas} color="error">
                        <NotificationsIcon sx={{ color: 'primary.branco' }} />
                    </Badge>
                </IconButton>
            </Tooltip>

            <Popover
                open={openPopover}
                anchorEl={anchorNotificacoes}
                onClose={fecharNotificacoes}
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "right",
                }}
                transformOrigin={{
                    vertical: "top",
                    horizontal: "right",
                }}
            >
                <Box
                    sx={{
                        width: 380,
                        maxWidth: "90vw",
                        bgcolor: "background.card",
                        color: "text.primary",
                    }}
                >
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            p: 2,
                        }}
                    >
                        <Typography
                            variant="h6"
                            sx={{
                                fontFamily: "Consolas",
                                fontWeight: "bold",
                            }}
                        >
                            Notificações
                        </Typography>

                        {quantidadeNaoLidas > 0 && (
                            <Button
                                size="small"
                                onClick={marcarTodasComoLidas}
                            >
                                Marcar todas
                            </Button>
                        )}
                    </Box>

                    <Divider />

                    {notificacoes.length === 0 ? (
                        <Box
                            sx={{
                                p: 4,
                                textAlign: "center",
                            }}
                        >
                            <NotificationsIcon
                                sx={{
                                    fontSize: 40,
                                    opacity: 0.4,
                                    mb: 1,
                                }}
                            />

                            <Typography
                                variant="body2"
                                color="text.secondary"
                            >
                                Nenhuma notificação nova
                            </Typography>
                        </Box>
                    ) : (
                        <List
                            sx={{
                                maxHeight: 400,
                                overflowY: "auto",
                                p: 0,
                            }}
                        >
                            {notificacoes.map((notificacao) => (
                                <ListItem
                                    key={notificacao.id}
                                    sx={{
                                        px: 2,
                                        py: 1.5,
                                        alignItems: "flex-start",
                                        bgcolor: notificacao.lida
                                            ? "transparent"
                                            : "action.hover",
                                        opacity: notificacao.lida
                                            ? "60%"
                                            : "100%",
                                        "&:hover": {
                                            bgcolor: notificacao.lida
                                                ? "action.hover"
                                                : "action.selected",
                                        },
                                    }}
                                >
                                    <Box sx={{ width: "100%" }}>
                                        <Typography
                                            variant="body2"
                                            fontWeight="bold"
                                        >
                                            {notificacao.titulo}
                                        </Typography>

                                        <Typography
                                            variant="body2"
                                            sx={{ mt: 0.5 }}
                                        >
                                            {notificacao.mensagem}
                                        </Typography>

                                        <Box
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "space-between",
                                                mt: 1,
                                            }}
                                        >
                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                            >
                                                {new Date(
                                                    notificacao.data_criacao
                                                ).toLocaleString("pt-BR")}
                                            </Typography>

                                            {!notificacao.lida && (
                                                <Button
                                                    size="small"
                                                    onClick={(e) =>
                                                        handleAcaoNotificacao(
                                                            e,
                                                            notificacao
                                                        )
                                                    }
                                                >
                                                    {notificacao.tipo ===
                                                        "CONFERENCIA_FINALIZADA"
                                                        ? "Marcar como gravada"
                                                        : notificacao.tipo ===
                                                            "SOLICITACAO_CORRECAO_NFE"
                                                            ? "Corrigir nota"
                                                            : "Marcar como lida"}
                                                </Button>
                                            )}
                                        </Box>
                                    </Box>
                                </ListItem>
                            ))}
                        </List>
                    )}
                </Box>
            </Popover>
        </>
    );
}