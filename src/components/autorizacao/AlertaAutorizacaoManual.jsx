// src\components\autorizacao\AlertaAutorizacaoManual.jsx

import { useEffect, useRef, useState } from "react";
import {
    Dialog,
    DialogContent,
    Typography,
    Button,
    Box,
    CircularProgress,
    Snackbar,
    Alert
} from "@mui/material";

const API = "http://192.168.1.185:8077";

export default function AlertaAutorizacaoManual({ userInfo, token }) {

    const [solicitacao, setSolicitacao] = useState(null);
    const [abrir, setAbrir] = useState(false);
    const [assumindo, setAssumindo] = useState(false);

    const intervaloRef = useRef(null);
    const ativoRef = useRef(true);

    const sessaoExpiradaRef = useRef(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

    // Busca solicitações pendentes
    const buscarSolicitacoes = async () => {

        if (!token || !userInfo) {
            console.log("❌ Sem token ou userInfo", {
                token,
                userInfo
            });
            return;
        }

        try {

            const response = await fetch(
                `${API}/api/autorizacoes/manual/pendentes`,
                {
                    method: "GET",
                    headers: {
                        "X-Auth-Token": token
                    }
                }
            );

            console.log("📡 /pendentes:", response.status);

            if (!response.ok) {

                const erro = await response.text();

                console.error(
                    "❌ Erro /pendentes:",
                    response.status,
                    erro
                );

                if (
                    (response.status === 401 || response.status === 403) &&
                    !sessaoExpiradaRef.current
                ) {

                    sessaoExpiradaRef.current = true;

                    setSnackbar({
                        open: true,
                        message: "Sessão expirada. Faça login novamente.",
                        severity: "error"
                    });
                }

                return;
            }

            const data = await response.json();

            console.log(
                "📥 Solicitações:",
                data
            );

            if (!ativoRef.current) {
                return;
            }

            const solicitacoes = data.solicitacoes || [];

            // Procura uma solicitação aguardando
            const pendente = solicitacoes.find(
                item => item.status === "aguardando"
            );

            if (pendente) {

                setSolicitacao(pendente);
                setAbrir(true);

            } else {

                setSolicitacao(null);
                setAbrir(false);

            }

        } catch (error) {

            console.error(
                "Erro ao buscar solicitações de autorização:",
                error
            );

        }

    };

    // Polling
    useEffect(() => {

        ativoRef.current = true;

        if (
            !token ||
            !userInfo ||
            !userInfo.pode_autorizar_conferencia
        ) {
            return;
        }

        // Busca imediatamente
        buscarSolicitacoes();

        // Depois a cada 2 segundos
        intervaloRef.current = setInterval(
            buscarSolicitacoes,
            2000
        );

        return () => {

            ativoRef.current = false;

            if (intervaloRef.current) {
                clearInterval(intervaloRef.current);
            }

        };

    }, [token, userInfo]);

    // Assume solicitação
    const assumirSolicitacao = async () => {

        if (!solicitacao || assumindo) {
            return;
        }

        setAssumindo(true);

        try {

            const response = await fetch(
                `${API}/api/autorizacoes/manual/${solicitacao.id}/assumir`,
                {
                    method: "POST",
                    headers: {
                        "X-Auth-Token": token
                    }
                }
            );

            const data = await response.json();

            console.log(
                "Resposta ao assumir autorização:",
                data
            );

            if (response.ok) {

                // Nós ganhamos
                setAbrir(false);
                setSolicitacao(null);

                return;
            }

            if (response.status === 409) {

                // Outro superior ganhou
                setAbrir(false);
                setSolicitacao(null);

                return;
            }

            console.error(
                "Erro ao assumir solicitação:",
                data
            );

        } catch (error) {

            console.error(
                "Erro ao assumir solicitação:",
                error
            );

        } finally {

            setAssumindo(false);

        }

    };

    // Não renderiza nada se não houver solicitação
    return (
        <>
            <Dialog
                open={abrir}
                fullScreen
                onClose={() => {
                    // Não permitimos fechar clicando fora.
                }}
                disableEscapeKeyDown
                slotProps={{
                    backdrop: {
                        sx: {
                            backgroundColor: "rgba(0, 0, 0, 0.90)"
                        }
                    },
                    paper: {
                        sx: {
                            backgroundColor: "#111",
                            color: "#fff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                        }
                    }
                }}
            >

                <DialogContent
                    sx={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        textAlign: "center"
                    }}
                >

                    <Box
                        sx={{
                            width: "100%",
                            maxWidth: 700,
                            px: 4
                        }}
                    >

                        <Typography
                            sx={{
                                fontSize: {
                                    xs: "3rem",
                                    md: "5rem"
                                },
                                mb: 3
                            }}
                        >
                            ⚠️
                        </Typography>

                        <Typography
                            variant="h3"
                            sx={{
                                fontWeight: 800,
                                mb: 4,
                                fontSize: {
                                    xs: "2rem",
                                    md: "3.5rem"
                                }
                            }}
                        >
                            AUTORIZAÇÃO SOLICITADA
                        </Typography>

                        {solicitacao && (
                            <>
                                <Typography
                                    variant="h5"
                                    sx={{
                                        mb: 2
                                    }}
                                >
                                    Operador:
                                </Typography>

                                <Typography
                                    variant="h4"
                                    sx={{
                                        fontWeight: 700,
                                        mb: 4
                                    }}
                                >
                                    {solicitacao.operador_nome}
                                </Typography>

                                <Typography
                                    variant="h6"
                                    sx={{
                                        mb: 1
                                    }}
                                >
                                    Solicitação para conferência manual
                                </Typography>

                                <Button
                                    variant="contained"
                                    size="large"
                                    onClick={assumirSolicitacao}
                                    disabled={assumindo}
                                    sx={{
                                        width: "100%",
                                        maxWidth: 500,
                                        minHeight: 80,
                                        fontSize: {
                                            xs: "1.3rem",
                                            md: "1.8rem"
                                        },
                                        fontWeight: 800,
                                        borderRadius: 3
                                    }}
                                >

                                    {assumindo ? (
                                        <>
                                            <CircularProgress
                                                size={30}
                                                sx={{ mr: 2 }}
                                            />

                                            ASSUMINDO...
                                        </>
                                    ) : (
                                        "ESTOU À CAMINHO!"
                                    )}

                                </Button>
                            </>
                        )}

                    </Box>

                </DialogContent>

            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={5000}
                onClose={() =>
                    setSnackbar({
                        ...snackbar,
                        open: false
                    })
                }
            >
                <Alert
                    variant="filled"
                    severity={snackbar.severity}
                    sx={{
                        color: "primary.branco",

                        "& .MuiAlert-icon": {
                            color: "primary.branco"
                        },

                        "& .MuiAlert-action": {
                            color: "primary.branco"
                        }
                    }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </>
    );
}