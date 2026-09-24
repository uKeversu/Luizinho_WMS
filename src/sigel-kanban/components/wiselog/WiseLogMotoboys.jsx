
import React, { useCallback, useEffect, useMemo, useState } from "react";

import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    IconButton,
    InputAdornment,
    Paper,
    Stack,
    Switch,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";

import {
    AddOutlined,
    EditOutlined,
    PersonAddOutlined,
    RefreshOutlined,
    SearchOutlined,
} from "@mui/icons-material";


const API_BASE_URL = "http://192.168.1.185:8077";


function getToken() {
    return localStorage.getItem("nfe_token") || "";
}


async function apiRequest(path, options = {}) {
    const token = getToken();

    const response = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            "X-Auth-Token": token,
            ...(options.headers || {}),
        },
    });

    const contentType = response.headers.get("content-type") || "";

    const result = contentType.includes("application/json")
        ? await response.json()
        : await response.text();

    if (!response.ok) {
        const message =
            typeof result === "object"
                ? result?.message || result?.erro || result?.error
                : result;

        throw new Error(
            message || `Erro HTTP ${response.status}.`,
        );
    }

    return result;
}


function extractList(result) {
    if (Array.isArray(result)) {
        return result;
    }

    return (
        result?.motoboys ||
        result?.dados ||
        result?.items ||
        []
    );
}


function getMotoboyId(motoboy) {
    return motoboy?.id ?? motoboy?.motoboy_id;
}


function getStatusLabel(ativo) {
    return ativo ? "Ativo" : "Inativo";
}


function getStatusColor(ativo) {
    return ativo ? "success" : "default";
}


const EMPTY_FORM = {
    nome: "",
    apelido: "",
};


export default function WiseLogMotoboys({ notify }) {
    const [motoboys, setMotoboys] = useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [showInactive, setShowInactive] = useState(true);

    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingMotoboy, setEditingMotoboy] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);


    const loadMotoboys = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const result = await apiRequest(
                "/api/wiselog/motoboys",
            );

            setMotoboys(extractList(result));
        } catch (requestError) {
            const message =
                requestError?.message ||
                "Não foi possível carregar os motoboys.";

            setError(message);

            notify?.(message, "error");
        } finally {
            setLoading(false);
        }
    }, [notify]);


    useEffect(() => {
        loadMotoboys();
    }, [loadMotoboys]);


    const filteredMotoboys = useMemo(() => {
        const normalizedSearch = search
            .trim()
            .toLocaleLowerCase("pt-BR");

        return motoboys.filter((motoboy) => {
            const ativo = motoboy?.ativo !== false;

            if (!showInactive && !ativo) {
                return false;
            }

            if (!normalizedSearch) {
                return true;
            }

            const nome = String(
                motoboy?.nome || "",
            ).toLocaleLowerCase("pt-BR");

            const apelido = String(
                motoboy?.apelido || "",
            ).toLocaleLowerCase("pt-BR");

            return (
                nome.includes(normalizedSearch) ||
                apelido.includes(normalizedSearch)
            );
        });
    }, [
        motoboys,
        search,
        showInactive,
    ]);


    const openCreateDialog = () => {
        setEditingMotoboy(null);
        setForm(EMPTY_FORM);
        setDialogOpen(true);
    };


    const openEditDialog = (motoboy) => {
        setEditingMotoboy(motoboy);

        setForm({
            nome: motoboy?.nome || "",
            apelido: motoboy?.apelido || "",
        });

        setDialogOpen(true);
    };


    const closeDialog = () => {
        if (saving) {
            return;
        }

        setDialogOpen(false);
        setEditingMotoboy(null);
        setForm(EMPTY_FORM);
    };


    const handleFormChange = (field, value) => {
        setForm((current) => ({
            ...current,
            [field]: value,
        }));
    };


    const validateForm = () => {
        if (!form.nome.trim()) {
            notify?.(
                "Informe o nome do motoboy.",
                "warning",
            );

            return false;
        }

        return true;
    };


    const handleSubmit = async () => {
        if (!validateForm()) {
            return;
        }

        setSaving(true);

        try {
            const editingId = getMotoboyId(
                editingMotoboy,
            );

            const isEditing = Boolean(editingId);

            const result = await apiRequest(
                isEditing
                    ? `/api/wiselog/motoboys/${editingId}`
                    : "/api/wiselog/motoboys",
                {
                    method: isEditing ? "PUT" : "POST",
                    body: JSON.stringify({
                        nome: form.nome.trim(),
                        apelido: form.apelido.trim() || null,
                    }),
                },
            );

            const savedMotoboy =
                result?.motoboy ||
                result?.data ||
                result;

            if (savedMotoboy?.id || savedMotoboy?.motoboy_id) {
                setMotoboys((current) => {
                    if (!isEditing) {
                        return [
                            savedMotoboy,
                            ...current,
                        ];
                    }

                    return current.map((item) => {
                        return getMotoboyId(item) === editingId
                            ? {
                                ...item,
                                ...savedMotoboy,
                            }
                            : item;
                    });
                });
            } else {
                await loadMotoboys();
            }

            notify?.(
                isEditing
                    ? "Motoboy atualizado com sucesso."
                    : "Motoboy cadastrado com sucesso.",
                "success",
            );

            closeDialog();
        } catch (requestError) {
            notify?.(
                requestError?.message ||
                "Não foi possível salvar o motoboy.",
                "error",
            );
        } finally {
            setSaving(false);
        }
    };


    const handleStatusChange = async (motoboy, nextStatus) => {
        const motoboyId = getMotoboyId(motoboy);

        if (!motoboyId) {
            notify?.(
                "Motoboy sem identificador válido.",
                "error",
            );

            return;
        }

        try {
            await apiRequest(
                `/api/wiselog/motoboys/${motoboyId}/status`,
                {
                    method: "PATCH",
                    body: JSON.stringify({
                        ativo: nextStatus,
                    }),
                },
            );

            setMotoboys((current) => {
                return current.map((item) => {
                    return getMotoboyId(item) === motoboyId
                        ? {
                            ...item,
                            ativo: nextStatus,
                        }
                        : item;
                });
            });

            notify?.(
                nextStatus
                    ? "Motoboy ativado."
                    : "Motoboy inativado.",
                "success",
            );
        } catch (requestError) {
            notify?.(
                requestError?.message ||
                "Não foi possível alterar o status.",
                "error",
            );
        }
    };


    return (
        <Box>
            <Paper
                variant="outlined"
                sx={{
                    p: 2,
                    mb: 2,
                    borderRadius: 3,
                    bgcolor: 'background.default'
                }}
            >
                <Stack
                    direction={{
                        xs: "column",
                        sm: "row",
                    }}
                    justifyContent="space-between"
                    alignItems={{
                        xs: "stretch",
                        sm: "center",
                    }}
                    spacing={2}
                >
                    <Box>
                        <Typography
                            variant="h6"
                            fontWeight={800}
                        >
                            Motoboys
                        </Typography>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                        >
                            Cadastre e gerencie os motoboys
                            terceirizados.
                        </Typography>
                    </Box>

                    <Button
                        variant="contained"
                        startIcon={<PersonAddOutlined />}
                        onClick={openCreateDialog}
                    >
                        Novo motoboy
                    </Button>
                </Stack>

                <Divider sx={{ my: 2 }} />

                <Stack
                    direction={{
                        xs: "column",
                        sm: "row",
                    }}
                    spacing={1.5}
                    alignItems={{
                        xs: "stretch",
                        sm: "center",
                    }}
                >
                    <TextField
                        fullWidth
                        size="small"
                        placeholder="Buscar por nome ou apelido..."
                        value={search}
                        onChange={(event) =>
                            setSearch(event.target.value)
                        }
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchOutlined fontSize="small" />
                                </InputAdornment>
                            ),
                        }}
                    />

                    <Button
                        variant={
                            showInactive
                                ? "contained"
                                : "outlined"
                        }
                        color="inherit"
                        onClick={() =>
                            setShowInactive((current) => !current)
                        }
                        sx={{
                            whiteSpace: "nowrap",
                        }}
                    >
                        {showInactive
                            ? "Ocultar inativos"
                            : "Mostrar inativos"}
                    </Button>

                    <Tooltip title="Atualizar">
                        <span>
                            <IconButton
                                onClick={loadMotoboys}
                                disabled={loading}
                            >
                                <RefreshOutlined />
                            </IconButton>
                        </span>
                    </Tooltip>
                </Stack>
            </Paper>


            {error && (
                <Alert
                    severity="error"
                    sx={{ mb: 2 }}
                >
                    {error}
                </Alert>
            )}


            {loading ? (
                <Paper
                    variant="outlined"
                    sx={{
                        p: 4,
                        borderRadius: 3,
                        display: "flex",
                        justifyContent: "center",
                    }}
                >
                    <CircularProgress />
                </Paper>
            ) : filteredMotoboys.length === 0 ? (
                <Alert severity="info">
                    Nenhum motoboy encontrado.
                </Alert>
            ) : (
                <TableContainer
                    component={Paper}
                    variant="outlined"
                    sx={{
                        borderRadius: 3,
                        bgcolor: "background.default"
                    }}
                >
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>
                                    <strong>Nome</strong>
                                </TableCell>

                                <TableCell>
                                    <strong>Apelido/Região</strong>
                                </TableCell>

                                <TableCell>
                                    <strong>Status</strong>
                                </TableCell>

                                <TableCell align="right">
                                    <strong>Ações</strong>
                                </TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {filteredMotoboys.map((motoboy) => {
                                const motoboyId =
                                    getMotoboyId(motoboy);

                                const ativo =
                                    motoboy?.ativo !== false;

                                return (
                                    <TableRow
                                        key={motoboyId}
                                        hover
                                    >
                                        <TableCell>
                                            <Typography
                                                variant="body2"
                                                fontWeight={700}
                                            >
                                                {motoboy?.nome || "-"}
                                            </Typography>
                                        </TableCell>

                                        <TableCell>
                                            {motoboy?.apelido || "-"}
                                        </TableCell>

                                        <TableCell>
                                            <Chip
                                                size="small"
                                                color={getStatusColor(
                                                    ativo,
                                                )}
                                                label={getStatusLabel(
                                                    ativo,
                                                )}
                                                sx={{color: 'primary.branco'}}
                                            />
                                        </TableCell>

                                        <TableCell align="right">
                                            <Stack
                                                direction="row"
                                                justifyContent="flex-end"
                                                alignItems="center"
                                                spacing={0.5}
                                            >
                                                <Tooltip title="Editar">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() =>
                                                            openEditDialog(
                                                                motoboy,
                                                            )
                                                        }
                                                    >
                                                        <EditOutlined fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>

                                                <Tooltip
                                                    title={
                                                        ativo
                                                            ? "Inativar"
                                                            : "Ativar"
                                                    }
                                                >
                                                    <Switch
                                                        size="small"
                                                        checked={ativo}
                                                        onChange={(
                                                            _event,
                                                            checked,
                                                        ) =>
                                                            handleStatusChange(
                                                                motoboy,
                                                                checked,
                                                            )
                                                        }
                                                    />
                                                </Tooltip>
                                            </Stack>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}


            <Dialog
                open={dialogOpen}
                onClose={closeDialog}
                fullWidth
                maxWidth="sm"
                slotProps={{
                    paper: {
                        sx: {
                            bgcolor: "background.default",
                            color: "text.primary",
                            borderRadius: 3,
                            border: "1px solid",
                            borderColor: "divider",
                        },
                    },
                }}
            >
                <DialogTitle>
                    {editingMotoboy
                        ? "Editar motoboy"
                        : "Cadastrar motoboy"}
                </DialogTitle>

                <DialogContent>
                    <Stack
                        spacing={2}
                        sx={{ pt: 1 }}
                    >
                        <TextField
                            label="Nome completo"
                            required
                            fullWidth
                            value={form.nome}
                            onChange={(event) =>
                                handleFormChange(
                                    "nome",
                                    event.target.value,
                                )
                            }
                            autoFocus
                        />

                        <TextField
                            label="Apelido/Região"
                            fullWidth
                            value={form.apelido}
                            onChange={(event) =>
                                handleFormChange(
                                    "apelido",
                                    event.target.value,
                                )
                            }
                        />
                    </Stack>
                </DialogContent>

                <DialogActions>
                    <Button
                        onClick={closeDialog}
                        disabled={saving}
                    >
                        Cancelar
                    </Button>

                    <Button
                        variant="contained"
                        startIcon={<AddOutlined />}
                        onClick={handleSubmit}
                        disabled={saving}
                    >
                        {saving
                            ? "Salvando..."
                            : editingMotoboy
                                ? "Salvar alterações"
                                : "Cadastrar"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
