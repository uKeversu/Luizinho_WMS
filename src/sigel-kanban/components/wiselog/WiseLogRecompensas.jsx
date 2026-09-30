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
    MenuItem,
    Paper,
    Select,
    Stack,
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
    CardGiftcardOutlined,
    CheckCircleOutlined,
    CloseOutlined,
    LocalShippingOutlined,
    RefreshOutlined,
} from "@mui/icons-material";


const API_BASE_URL = "http://192.168.1.185:8077";


function getToken() {
    return localStorage.getItem("nfe_token") || "";
}


function getCurrentDateString() {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


function apiRequest(path, options = {}) {
    const token = getToken();

    return fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            "X-Auth-Token": token,
            ...(options.headers || {}),
        },
    }).then(async (response) => {
        const contentType =
            response.headers.get("content-type") || "";

        const result = contentType.includes("application/json")
            ? await response.json()
            : await response.text();

        if (!response.ok) {
            const message =
                typeof result === "object"
                    ? result?.message ||
                    result?.erro ||
                    result?.error
                    : result;

            throw new Error(
                message ||
                `Erro HTTP ${response.status}.`,
            );
        }

        return result;
    });
}


function extractList(result) {
    if (Array.isArray(result)) {
        return result;
    }

    if (!result || typeof result !== "object") {
        return [];
    }

    if (Array.isArray(result.recompensas)) {
        return result.recompensas;
    }

    if (Array.isArray(result.dados?.recompensas)) {
        return result.dados.recompensas;
    }

    if (Array.isArray(result.items)) {
        return result.items;
    }

    if (Array.isArray(result.dados?.items)) {
        return result.dados.items;
    }

    return [];
}


function getRewardId(reward) {
    return reward?.id ?? reward?.recompensa_id;
}


function getMotoboyName(reward) {
    return (
        reward?.motoboy_nome ||
        reward?.nome ||
        reward?.nome_motoboy ||
        reward?.motoboy?.nome ||
        `Motoboy #${reward?.motoboy_id || "-"}`
    );
}


function getStatusLabel(status) {
    const labels = {
        ELEGIVEL: "Pendente",
        PENDENTE: "Pendente",
        PENDING: "Pendente",
        GERADA: "Gerada",
        GENERATED: "Gerada",
        ENTREGUE: "Entregue",
        DELIVERED: "Entregue",
        CANCELADA: "Cancelada",
        CANCELLED: "Cancelada",
    };

    return (
        labels[String(status || "").toUpperCase()] ||
        status ||
        "Desconhecido"
    );
}


function getStatusColor(status) {
    const normalized = String(
        status || "",
    ).toUpperCase();

    if (
        normalized === "ENTREGUE" ||
        normalized === "DELIVERED"
    ) {
        return "success";
    }

    if (
        normalized === "CANCELADA" ||
        normalized === "CANCELLED"
    ) {
        return "error";
    }

    if (
        normalized === "ELEGIVEL" ||
        normalized === "PENDENTE" ||
        normalized === "PENDING"
    ) {
        return "warning";
    }

    return "info";
}


function formatDate(value) {
    if (!value) {
        return "-";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return String(value).slice(0, 10);
    }

    return date.toLocaleDateString("pt-BR");
}


function formatCurrency(value) {
    const numericValue = Number(value);

    if (!Number.isFinite(numericValue)) {
        return "R$ 0,00";
    }

    return numericValue.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
    });
}


const EMPTY_DELIVERY_FORM = {
    tipo_oleo: "",
    observacao: "",
};


export default function WiseLogRecompensas({ notify }) {
    const [rewards, setRewards] = useState([]);

    const [statusFilter, setStatusFilter] =
        useState("TODOS");

    /*
     * Data usada como referência para a semana.
     *
     * Exemplo:
     * 2026-09-22
     *
     * O backend transforma isso em:
     * segunda 22/09
     * até sexta 26/09
     */
    const [selectedWeekDate, setSelectedWeekDate] =
        useState(getCurrentDateString());

    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] =
        useState(false);
    const [processingId, setProcessingId] =
        useState("");

    const [error, setError] = useState("");

    const [deliveryDialogOpen, setDeliveryDialogOpen] =
        useState(false);

    const [selectedReward, setSelectedReward] =
        useState(null);

    const [deliveryForm, setDeliveryForm] =
        useState(EMPTY_DELIVERY_FORM);


    /*
     * Carrega as recompensas da semana selecionada.
     */
    const loadRewards = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const params = new URLSearchParams();

            /*
             * O backend recebe semana_inicio e calcula
             * automaticamente a segunda e sexta daquela semana.
             */
            params.set(
                "semana_inicio",
                selectedWeekDate,
            );

            if (statusFilter !== "TODOS") {
                params.set(
                    "status",
                    statusFilter,
                );
            }

            const result = await apiRequest(
                `/api/wiselog/recompensas?${params.toString()}`,
            );

            const extractedRewards =
                extractList(result);

            setRewards(extractedRewards);
        } catch (requestError) {
            const message =
                requestError?.message ||
                "Não foi possível carregar as recompensas.";

            setError(message);

            notify?.(message, "error");
        } finally {
            setLoading(false);
        }
    }, [
        notify,
        selectedWeekDate,
        statusFilter,
    ]);


    useEffect(() => {
        loadRewards();
    }, [loadRewards]);


    /*
     * Quantidade de recompensas pendentes
     * dentro da semana selecionada.
     */
    const pendingRewards = useMemo(() => {
        if (!Array.isArray(rewards)) {
            return 0;
        }

        return rewards.filter((reward) => {
            const status = String(
                reward?.status || "",
            ).toUpperCase();

            return (
                status === "ELEGIVEL" ||
                status === "PENDENTE" ||
                status === "PENDING" ||
                status === "GERADA" ||
                status === "GENERATED"
            );
        }).length;
    }, [rewards]);


    /*
     * Gera recompensas para todos os motoboys
     * elegíveis da semana selecionada.
     */
    const handleGenerateRewards = async () => {
        if (!selectedWeekDate) {
            notify?.(
                "Selecione uma data para a semana.",
                "warning",
            );

            return;
        }

        /*
         * Não permite semana futura.
         *
         * A comparação é feita usando a data YYYY-MM-DD
         * diretamente para evitar problemas de timezone.
         */
        const today = getCurrentDateString();

        if (selectedWeekDate > today) {
            notify?.(
                "Não é possível gerar recompensa para uma semana futura.",
                "warning",
            );

            return;
        }

        setGenerating(true);

        try {
            /*
             * Busca os motoboys da semana selecionada.
             */
            const weekResult = await apiRequest(
                `/api/wiselog/semana?data=${encodeURIComponent(
                    selectedWeekDate,
                )}`,
            );

            const motoboys = Array.isArray(
                weekResult?.dados?.motoboys,
            )
                ? weekResult.dados.motoboys
                : [];

            /*
             * O backend já calcula:
             *
             * dias_validados >= 5
             *
             * e retorna elegivel=true.
             */
            const eligibleMotoboys =
                motoboys.filter(
                    (motoboy) =>
                        motoboy?.elegivel === true,
                );

            if (eligibleMotoboys.length === 0) {
                notify?.(
                    "Nenhum motoboy elegível para gerar recompensa nesta semana.",
                    "info",
                );

                return;
            }

            let processedCount = 0;
            let alreadyExistsCount = 0;
            let errorCount = 0;

            for (const motoboy of eligibleMotoboys) {
                const motoboyId = Number(
                    motoboy?.motoboy_id,
                );

                if (
                    !Number.isInteger(motoboyId) ||
                    motoboyId <= 0
                ) {
                    console.warn(
                        "[WiseLog] Motoboy com ID inválido:",
                        motoboy,
                    );

                    errorCount += 1;
                    continue;
                }

                try {
                    console.log(
                        "[WiseLog] Gerando recompensa:",
                        {
                            motoboy_id: motoboyId,
                            data_referencia:
                                selectedWeekDate,
                            nome: motoboy?.nome,
                            dias_validados:
                                motoboy?.dias_validados,
                        },
                    );

                    const result = await apiRequest(
                        "/api/wiselog/recompensas/gerar",
                        {
                            method: "POST",
                            body: JSON.stringify({
                                motoboy_id:
                                    motoboyId,
                                data_referencia:
                                    selectedWeekDate,
                            }),
                        },
                    );

                    if (
                        result?.dados?.ja_existia === true ||
                        result?.ja_existia === true
                    ) {
                        alreadyExistsCount += 1;
                    } else {
                        processedCount += 1;
                    }
                } catch (requestError) {
                    errorCount += 1;

                    console.error(
                        `[WiseLog] Erro ao gerar recompensa para o motoboy ${motoboyId}:`,
                        requestError,
                    );
                }
            }

            /*
             * Mensagem final.
             */
            const messages = [];

            if (processedCount > 0) {
                messages.push(
                    `${processedCount} recompensa(s) gerada(s)`,
                );
            }

            if (alreadyExistsCount > 0) {
                messages.push(
                    `${alreadyExistsCount} já existente(s)`,
                );
            }

            if (errorCount > 0) {
                messages.push(
                    `${errorCount} com erro`,
                );
            }

            if (messages.length > 0) {
                notify?.(
                    `${messages.join(", ")}.`,
                    errorCount > 0
                        ? "warning"
                        : "success",
                );
            }

            /*
             * Atualiza a tabela da semana selecionada.
             */
            await loadRewards();
        } catch (requestError) {
            notify?.(
                requestError?.message ||
                "Não foi possível consultar os motoboys elegíveis.",
                "error",
            );
        } finally {
            setGenerating(false);
        }
    };


    const openDeliveryDialog = (reward) => {
        setSelectedReward(reward);
        setDeliveryForm(
            EMPTY_DELIVERY_FORM,
        );
        setDeliveryDialogOpen(true);
    };


    const closeDeliveryDialog = () => {
        if (processingId) {
            return;
        }

        setDeliveryDialogOpen(false);
        setSelectedReward(null);
        setDeliveryForm(
            EMPTY_DELIVERY_FORM,
        );
    };


    const handleDeliveryChange = (
        field,
        value,
    ) => {
        setDeliveryForm((current) => ({
            ...current,
            [field]: value,
        }));
    };


    const handleConfirmDelivery =
        async () => {
            const rewardId =
                getRewardId(selectedReward);

            if (!rewardId) {
                notify?.(
                    "Recompensa sem identificador válido.",
                    "error",
                );

                return;
            }

            if (!deliveryForm.tipo_oleo) {
                notify?.(
                    "Selecione o tipo de óleo entregue.",
                    "warning",
                );

                return;
            }

            setProcessingId(
                String(rewardId),
            );

            try {
                await apiRequest(
                    `/api/wiselog/recompensas/${rewardId}/entregar`,
                    {
                        method: "PATCH",
                        body: JSON.stringify({
                            oleo_descricao:
                                deliveryForm.tipo_oleo,
                            observacao:
                                deliveryForm.observacao.trim() ||
                                null,
                        }),
                    },
                );

                notify?.(
                    "Recompensa registrada como entregue.",
                    "success",
                );

                closeDeliveryDialog();

                await loadRewards();
            } catch (requestError) {
                notify?.(
                    requestError?.message ||
                    "Não foi possível registrar a entrega.",
                    "error",
                );
            } finally {
                setProcessingId("");
            }
        };


    const handleCancelReward =
        async (reward) => {
            const rewardId =
                getRewardId(reward);

            if (!rewardId) {
                notify?.(
                    "Recompensa sem identificador válido.",
                    "error",
                );

                return;
            }

            const confirmed =
                window.confirm(
                    "Deseja realmente cancelar esta recompensa?",
                );

            if (!confirmed) {
                return;
            }

            setProcessingId(
                String(rewardId),
            );

            try {
                await apiRequest(
                    `/api/wiselog/recompensas/${rewardId}/cancelar`,
                    {
                        method: "PATCH",
                        body: JSON.stringify({
                            observacao:
                                "Cancelada",
                        }),
                    },
                );

                notify?.(
                    "Recompensa cancelada.",
                    "success",
                );

                await loadRewards();
            } catch (requestError) {
                notify?.(
                    requestError?.message ||
                    "Não foi possível cancelar a recompensa.",
                    "error",
                );
            } finally {
                setProcessingId("");
            }
        };


    const canProcessReward = (
        reward,
    ) => {
        const status = String(
            reward?.status || "",
        ).toUpperCase();

        return (
            status === "ELEGIVEL" ||
            status === "PENDENTE" ||
            status === "PENDING" ||
            status === "GERADA" ||
            status === "GENERATED"
        );
    };


    return (
        <Box>
            <Paper
                variant="outlined"
                sx={{
                    p: 2,
                    mb: 2,
                    borderRadius: 3,
                    bgcolor:
                        "background.default",
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
                            Recompensas
                        </Typography>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                        >
                            Controle das recompensas de
                            R$ 50,00 e 1 litro de óleo.
                        </Typography>
                    </Box>

                    <Button
                        variant="contained"
                        startIcon={
                            <CardGiftcardOutlined />
                        }
                        onClick={
                            handleGenerateRewards
                        }
                        disabled={generating}
                    >
                        {generating
                            ? "Processando..."
                            : "Gerar recompensas"}
                    </Button>
                </Stack>

                <Divider
                    sx={{ my: 2 }}
                />

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
                    <Stack
                        direction={{
                            xs: "column",
                            sm: "row",
                        }}
                        spacing={1}
                    >
                        <TextField
                            size="small"
                            type="date"
                            label="Semana de referência"
                            value={
                                selectedWeekDate
                            }
                            onChange={(
                                event,
                            ) =>
                                setSelectedWeekDate(
                                    event.target
                                        .value,
                                )
                            }
                            InputLabelProps={{
                                shrink: true,
                            }}
                            inputProps={{
                                max: getCurrentDateString(),
                            }}
                            sx={{
                                minWidth: 200,
                            }}
                        />

                        <Select
                            size="small"
                            value={
                                statusFilter
                            }
                            onChange={(
                                event,
                            ) =>
                                setStatusFilter(
                                    event.target
                                        .value,
                                )
                            }
                            sx={{
                                minWidth: 180,
                            }}
                            MenuProps={{
                                PaperProps: {
                                    sx: {
                                        bgcolor:
                                            "background.default",
                                        color:
                                            "text.primary",
                                    },
                                },
                            }}
                        >
                            <MenuItem value="TODOS">
                                Todos os status
                            </MenuItem>

                            <MenuItem value="ELEGIVEL">
                                Pendentes
                            </MenuItem>

                            <MenuItem value="ENTREGUE">
                                Entregues
                            </MenuItem>

                            <MenuItem value="CANCELADA">
                                Canceladas
                            </MenuItem>
                        </Select>
                    </Stack>

                    <Stack
                        direction="row"
                        alignItems="center"
                        spacing={1}
                    >
                        <Chip
                            color="warning"
                            size="small"
                            label={`${pendingRewards} pendente(s)`}
                            sx={{
                                color:
                                    "primary.branco",
                            }}
                        />

                        <Tooltip title="Atualizar">
                            <span>
                                <IconButton
                                    onClick={
                                        loadRewards
                                    }
                                    disabled={
                                        loading
                                    }
                                >
                                    <RefreshOutlined />
                                </IconButton>
                            </span>
                        </Tooltip>
                    </Stack>
                </Stack>

                <Box sx={{ mt: 1 }}>
                    <Typography
                        variant="caption"
                        color="text.secondary"
                    >
                        A data selecionada é usada como
                        referência para a semana. O sistema
                        considera segunda a sexta-feira.
                    </Typography>
                </Box>
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
                        justifyContent:
                            "center",
                    }}
                >
                    <CircularProgress />
                </Paper>
            ) : rewards.length === 0 ? (
                <Alert severity="info">
                    Nenhuma recompensa encontrada
                    para a semana selecionada.
                </Alert>
            ) : (
                <TableContainer
                    component={Paper}
                    variant="outlined"
                    sx={{
                        borderRadius: 3,
                        overflowX: "auto",
                        bgcolor:
                            "background.default",
                    }}
                >
                    <Table
                        sx={{
                            minWidth: 900,
                        }}
                    >
                        <TableHead>
                            <TableRow>
                                <TableCell>
                                    <strong>
                                        Motoboy
                                    </strong>
                                </TableCell>

                                <TableCell>
                                    <strong>
                                        Período
                                    </strong>
                                </TableCell>

                                <TableCell>
                                    <strong>
                                        Dias
                                    </strong>
                                </TableCell>

                                <TableCell>
                                    <strong>
                                        Valor
                                    </strong>
                                </TableCell>

                                <TableCell>
                                    <strong>
                                        Óleo
                                    </strong>
                                </TableCell>

                                <TableCell>
                                    <strong>
                                        Status
                                    </strong>
                                </TableCell>

                                <TableCell align="right">
                                    <strong>
                                        Ações
                                    </strong>
                                </TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {rewards.map(
                                (reward) => {
                                    const rewardId =
                                        getRewardId(
                                            reward,
                                        );

                                    const processing =
                                        processingId ===
                                        String(
                                            rewardId,
                                        );

                                    const canProcess =
                                        canProcessReward(
                                            reward,
                                        );

                                    return (
                                        <TableRow
                                            key={
                                                rewardId
                                            }
                                            hover
                                        >
                                            <TableCell>
                                                <Typography
                                                    variant="body2"
                                                    fontWeight={
                                                        700
                                                    }
                                                >
                                                    {getMotoboyName(
                                                        reward,
                                                    )}
                                                </Typography>
                                            </TableCell>

                                            <TableCell>
                                                <Typography variant="body2">
                                                    {formatDate(
                                                        reward?.semana_inicio,
                                                    )}
                                                    {" até "}
                                                    {formatDate(
                                                        reward?.semana_fim,
                                                    )}
                                                </Typography>
                                            </TableCell>

                                            <TableCell>
                                                <Chip
                                                    size="small"
                                                    label={`${reward?.dias_validados ?? 0}/5`}
                                                    color={
                                                        Number(
                                                            reward?.dias_validados ||
                                                            0,
                                                        ) >=
                                                            5
                                                            ? "success"
                                                            : "warning"
                                                    }
                                                    sx={{color: 'primary.branco'}}
                                                />
                                            </TableCell>

                                            <TableCell>
                                                <Typography
                                                    variant="body2"
                                                    fontWeight={
                                                        700
                                                    }
                                                >
                                                    {formatCurrency(
                                                        reward?.valor_dinheiro,
                                                    )}
                                                </Typography>
                                            </TableCell>

                                            <TableCell>
                                                {reward?.oleo_descricao ||
                                                    "A definir"}
                                            </TableCell>

                                            <TableCell>
                                                <Chip
                                                    size="small"
                                                    color={getStatusColor(
                                                        reward?.status,
                                                    )}
                                                    label={getStatusLabel(
                                                        reward?.status,
                                                    )}
                                                    sx={{
                                                        color:
                                                            "primary.branco",
                                                    }}
                                                />
                                            </TableCell>

                                            <TableCell align="right">
                                                {canProcess ? (
                                                    <Stack
                                                        direction="row"
                                                        justifyContent="flex-end"
                                                        spacing={
                                                            0.5
                                                        }
                                                    >
                                                        <Tooltip title="Registrar entrega">
                                                            <span>
                                                                <IconButton
                                                                    size="small"
                                                                    color="success"
                                                                    disabled={
                                                                        processing
                                                                    }
                                                                    onClick={() =>
                                                                        openDeliveryDialog(
                                                                            reward,
                                                                        )
                                                                    }
                                                                >
                                                                    {processing ? (
                                                                        <CircularProgress
                                                                            size={
                                                                                18
                                                                            }
                                                                        />
                                                                    ) : (
                                                                        <CheckCircleOutlined fontSize="small" />
                                                                    )}
                                                                </IconButton>
                                                            </span>
                                                        </Tooltip>

                                                        <Tooltip title="Cancelar recompensa">
                                                            <span>
                                                                <IconButton
                                                                    size="small"
                                                                    color="error"
                                                                    disabled={
                                                                        processing
                                                                    }
                                                                    onClick={() =>
                                                                        handleCancelReward(
                                                                            reward,
                                                                        )
                                                                    }
                                                                >
                                                                    <CloseOutlined fontSize="small" />
                                                                </IconButton>
                                                            </span>
                                                        </Tooltip>
                                                    </Stack>
                                                ) : (
                                                    <Typography
                                                        variant="caption"
                                                        color="text.secondary"
                                                    >
                                                        Sem ações
                                                    </Typography>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                },
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}


            <Dialog
                open={
                    deliveryDialogOpen
                }
                onClose={
                    closeDeliveryDialog
                }
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
                            border: "1px solid",
                            borderColor:
                                "divider",
                        },
                    },
                }}
            >
                <DialogTitle>
                    Registrar entrega
                </DialogTitle>

                <DialogContent>
                    <Stack
                        spacing={2}
                        sx={{ pt: 1 }}
                    >
                        <Alert severity="info">
                            Registre o tipo de óleo
                            entregue ao motoboy
                            junto com a recompensa
                            de R$ 50,00.
                        </Alert>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                        >
                            Motoboy:{" "}
                            <strong>
                                {getMotoboyName(
                                    selectedReward ||
                                    {},
                                )}
                            </strong>
                        </Typography>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                        >
                            Período:{" "}
                            <strong>
                                {formatDate(
                                    selectedReward?.semana_inicio,
                                )}
                                {" até "}
                                {formatDate(
                                    selectedReward?.semana_fim,
                                )}
                            </strong>
                        </Typography>

                        <TextField
                            select
                            fullWidth
                            required
                            label="Tipo de óleo"
                            value={
                                deliveryForm.tipo_oleo
                            }
                            onChange={(event) =>
                                handleDeliveryChange(
                                    "tipo_oleo",
                                    event.target
                                        .value,
                                )
                            }
                            SelectProps={{
                                MenuProps: {
                                    PaperProps: {
                                        sx: {
                                            bgcolor:
                                                "background.default",
                                        },
                                    },
                                },
                            }}
                        >
                            <MenuItem value="5W30">
                                5W30
                            </MenuItem>

                            <MenuItem value="10W30">
                                10W30
                            </MenuItem>

                            <MenuItem value="OUTRO">
                                Outro
                            </MenuItem>

                            <MenuItem value="NAO_INFORMADO">
                                Não informado
                            </MenuItem>
                        </TextField>

                        <TextField
                            fullWidth
                            multiline
                            minRows={2}
                            label="Observação"
                            placeholder="Observações sobre a entrega..."
                            value={
                                deliveryForm.observacao
                            }
                            onChange={(event) =>
                                handleDeliveryChange(
                                    "observacao",
                                    event.target
                                        .value,
                                )
                            }
                        />
                    </Stack>
                </DialogContent>

                <DialogActions>
                    <Button
                        onClick={
                            closeDeliveryDialog
                        }
                        disabled={Boolean(
                            processingId,
                        )}
                        color="error"
                    >
                        Cancelar
                    </Button>

                    <Button
                        variant="contained"
                        color="success"
                        startIcon={
                            <LocalShippingOutlined />
                        }
                        onClick={
                            handleConfirmDelivery
                        }
                        disabled={Boolean(
                            processingId,
                        )}
                    >
                        {processingId
                            ? "Salvando..."
                            : "Confirmar entrega"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
