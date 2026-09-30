import React, { useState } from "react";

import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Fab,
    Snackbar,
    TextField,
    Tooltip
} from "@mui/material";

import EditNoteIcon from "@mui/icons-material/EditNote";


const SolicitarCorrecaoFab = ({
    API,
    token,
    notaAtual,
    onSucesso
}) => {
    const [dialogAberto, setDialogAberto] = useState(false);
    const [observacao, setObservacao] = useState("");
    const [enviando, setEnviando] = useState(false);

    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success"
    });

    const abrirDialog = () => {
        if (!notaAtual?.id) {
            setSnackbar({
                open: true,
                message: "Nenhuma nota selecionada.",
                severity: "warning"
            });

            return;
        }

        setObservacao("");
        setDialogAberto(true);
    };

    const fecharDialog = () => {
        if (enviando) return;

        setDialogAberto(false);
        setObservacao("");
    };

    const fecharSnackbar = () => {
        setSnackbar(prev => ({
            ...prev,
            open: false
        }));
    };

    const solicitarCorrecao = async () => {
        const observacaoLimpa = observacao.trim();

        if (!observacaoLimpa) {
            setSnackbar({
                open: true,
                message: "Informe o motivo da correção.",
                severity: "warning"
            });

            return;
        }

        if (!notaAtual?.id) {
            setSnackbar({
                open: true,
                message: "Nenhuma nota selecionada.",
                severity: "warning"
            });

            return;
        }

        try { 
            setEnviando(true);

            const response = await fetch(
                `${API}/api/notificacoes/solicitar-correcao`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-Auth-Token": token
                    },
                    body: JSON.stringify({
                        nfe_id: notaAtual.id,
                        observacao: observacaoLimpa
                    })
                }
            );

            const data = await response.json();

            if (response.status === 401) {
                throw new Error(
                    "Sua sessão expirou. Faça login novamente."
                );
            }

            if (!response.ok) {
                throw new Error(
                    data.erro ||
                    "Erro ao solicitar correção."
                );
            }

            setDialogAberto(false);
            setObservacao("");

            setSnackbar({
                open: true,
                message: (
                    data.mensagem ||
                    "Solicitação enviada com sucesso."
                ),
                severity: "success"
            });

            if (onSucesso) {
                onSucesso(data);
            }

        } catch (error) {
            console.error(
                "Erro ao solicitar correção:",
                error
            );

            setSnackbar({
                open: true,
                message: error.message ||
                    "Erro ao enviar solicitação.",
                severity: "error"
            });

        } finally {
            setEnviando(false);
        }
    };

    return (
        <>
            <Tooltip title="Solicitar correção da NF-e">
                <span>
                    <Fab
                        color="info"
                        aria-label="Solicitar correção da NF-e"
                        onClick={abrirDialog}
                        disabled={!notaAtual?.id || enviando}
                        sx={{
                            position: "fixed",
                            bottom: 24,
                            right: 24,
                            zIndex: 1100
                        }}
                    >
                        <EditNoteIcon />
                    </Fab>
                </span>
            </Tooltip>

            <Dialog
                open={dialogAberto}
                onClose={fecharDialog}
                fullWidth
                maxWidth="sm"
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
                <DialogTitle>
                    Solicitar correção da NF-e
                </DialogTitle>

                <DialogContent>
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 2,
                            mt: 1
                        }}
                    >
                        <Alert severity="info">
                            A solicitação será enviada aos
                            responsáveis pela correção de NF-e.
                        </Alert>

                        <TextField
                            label="NF-e"
                            value={
                                notaAtual?.numero
                                    ? String(notaAtual.numero)
                                    : String(notaAtual?.id || "")
                            }
                            fullWidth
                            disabled
                        />

                        <TextField
                            label="Motivo da correção"
                            value={observacao}
                            onChange={(event) =>
                                setObservacao(event.target.value)
                            }
                            multiline
                            minRows={4}
                            fullWidth
                            required
                            disabled={enviando}
                            placeholder="Descreva o que precisa ser corrigido..."
                        />
                    </Box>
                </DialogContent>

                <DialogActions>
                    <Button
                        onClick={fecharDialog}
                        disabled={enviando}
                        color="error"
                    >
                        Cancelar
                    </Button>

                    <Button
                        variant="contained"
                        onClick={solicitarCorrecao}
                        disabled={
                            enviando ||
                            !observacao.trim()
                        }
                    >
                        {enviando ? (
                            <>
                                <CircularProgress
                                    size={20}
                                    sx={{ mr: 1 }}
                                />

                                Enviando...
                            </>
                        ) : (
                            "Enviar solicitação"
                        )}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={5000}
                onClose={fecharSnackbar}
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "center"
                }}
            >
                <Alert
                    onClose={fecharSnackbar}
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
        </>
    );
};

export default SolicitarCorrecaoFab;