
import React, { useCallback, useEffect, useMemo, useState } from "react";

import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    Divider,
    IconButton,
    Paper,
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
    CheckCircleOutlined,
    ChevronLeftOutlined,
    ChevronRightOutlined,
    CloseOutlined,
    RefreshOutlined,
    SaveOutlined,
} from "@mui/icons-material";


const API_BASE_URL = "http://192.168.1.185:8077";


/**
 * Retorna o token atual do SIGEL.
 */
function getToken() {
    return localStorage.getItem("nfe_token") || "";
}


/**
 * Faz requisições autenticadas para a API.
 */
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


/**
 * Formata uma data no padrão YYYY-MM-DD.
 */
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


/**
 * Converte YYYY-MM-DD para uma data local.
 */
function parseDate(value) {
    const [year, month, day] = value.split("-").map(Number);

    return new Date(year, month - 1, day);
}


/**
 * Retorna a segunda-feira da semana informada.
 */
function getMonday(date) {
    const result = new Date(date);
    const day = result.getDay();

    const difference = day === 0 ? -6 : 1 - day;

    result.setDate(result.getDate() + difference);
    result.setHours(0, 0, 0, 0);

    return result;
}


/**
 * Retorna os cinco dias úteis da semana.
 */
function getBusinessDays(weekStart) {
    return Array.from({ length: 5 }, (_, index) => {
        const date = new Date(weekStart);

        date.setDate(date.getDate() + index);

        return {
            date: formatDate(date),
            label: date.toLocaleDateString("pt-BR", {
                weekday: "short",
                day: "2-digit",
                month: "2-digit",
            }),
        };
    });
}


/**
 * Formata uma data para apresentação.
 */
function formatDateLabel(value) {
    if (!value) {
        return "-";
    }

    const date = parseDate(value);

    return date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
}


/**
 * Extrai uma lista de uma resposta da API.
 */
function extractList(result, keys = []) {
    if (Array.isArray(result)) {
        return result;
    }

    for (const key of keys) {
        if (Array.isArray(result?.[key])) {
            return result[key];
        }
    }

    return [];
}


/**
 * Obtém o identificador do motoboy.
 */
function getMotoboyId(motoboy) {
    return motoboy?.id ?? motoboy?.motoboy_id;
}


/**
 * Retorna o nome do motoboy.
 */
function getMotoboyName(motoboy) {
    return (
        motoboy?.nome ||
        motoboy?.apelido ||
        `Motoboy #${getMotoboyId(motoboy) || "-"}`
    );
}


/**
 * Normaliza os registros da semana.
 *
 * A API pode retornar os registros em formatos diferentes.
 * Este método concentra a adaptação no frontend.
 */
function normalizeRecords(result) {
    const motoboys = Array.isArray(result?.dados?.motoboys)
        ? result.dados.motoboys
        : [];

    const map = new Map();

    motoboys.forEach((motoboy) => {
        const motoboyId =
            motoboy?.motoboy_id ??
            motoboy?.id;

        if (!motoboyId) {
            return;
        }

        const dias = motoboy?.dias;

        if (!dias || typeof dias !== "object") {
            return;
        }

        Object.entries(dias).forEach(([date, record]) => {
            if (!record || !date) {
                return;
            }

            const key = `${motoboyId}_${date}`;

            const utilizou = record?.utilizou_wiselog;

            const utilizouNormalizado =
                utilizou === true ||
                utilizou === 1 ||
                utilizou === "1" ||
                utilizou === "true";

            map.set(key, {
                ...record,
                motoboy_id: motoboyId,
                data_referencia: String(date).slice(0, 10),
                utilizou_wiselog: utilizouNormalizado,
                observacao: record?.observacao ?? "",
            });
        });
    });

    return map;
}

export default function WiseLogSemana({ notify }) {
    const [weekStart, setWeekStart] = useState(() => {
        return getMonday(new Date());
    });

    const [motoboys, setMotoboys] = useState([]);
    const [records, setRecords] = useState(new Map());

    const [loading, setLoading] = useState(true);
    const [savingKey, setSavingKey] = useState("");
    const [error, setError] = useState("");

    const [observations, setObservations] = useState({});


    const businessDays = useMemo(() => {
        return getBusinessDays(weekStart);
    }, [weekStart]);


    const weekStartString = useMemo(() => {
        return formatDate(weekStart);
    }, [weekStart]);


    const weekEndString = useMemo(() => {
        const end = new Date(weekStart);

        end.setDate(end.getDate() + 4);

        return formatDate(end);
    }, [weekStart]);


    const activeMotoboys = useMemo(() => {
        return motoboys.filter((motoboy) => {
            return motoboy?.ativo !== false;
        });
    }, [motoboys]);


    const loadWeek = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const [motoboysResult, weekResult] = await Promise.all([
                apiRequest("/api/wiselog/motoboys?ativos=1"),

                apiRequest(
                    `/api/wiselog/semana?data=${weekStartString}`,
                ),
            ]);

            const motoboysList = extractList(
                motoboysResult,
                [
                    "motoboys",
                    "dados",
                    "items",
                ],
            );

            setMotoboys(motoboysList);

            setRecords(
                normalizeRecords(weekResult),
            );
        } catch (requestError) {
            const message =
                requestError?.message ||
                "Não foi possível carregar os dados da semana.";

            setError(message);

            notify?.(
                message,
                "error",
            );
        } finally {
            setLoading(false);
        }
    }, [
        notify,
        weekStartString,
    ]);


    useEffect(() => {
        loadWeek();
    }, [loadWeek]);


    const changeWeek = (amount) => {
        setWeekStart((current) => {
            const next = new Date(current);

            next.setDate(next.getDate() + amount * 7);

            return getMonday(next);
        });
    };


    const goToCurrentWeek = () => {
        setWeekStart(getMonday(new Date()));
    };


    const getRecord = (motoboyId, date) => {
        return records.get(`${motoboyId}_${date}`);
    };


    const isChecked = (motoboyId, date) => {
        const record = getRecord(motoboyId, date);

        return Boolean(record?.utilizou_wiselog);
    };


    const handleSave = async (
        motoboy,
        date,
        value,
        observationOverride = undefined,
    ) => {
        const motoboyId = getMotoboyId(motoboy);
        const key = `${motoboyId}_${date}`;

        if (!motoboyId) {
            notify?.(
                "Motoboy sem identificador válido.",
                "error",
            );

            return;
        }

        const currentRecord = getRecord(
            motoboyId,
            date,
        );

        const observation =
            observationOverride !== undefined
                ? observationOverride
                : observations[key] ??
                currentRecord?.observacao ??
                "";

        const observationNormalized =
            typeof observation === "string"
                ? observation.trim() || null
                : observation;

        const payload = {
            motoboy_id: motoboyId,
            data_referencia: date,
            utilizou_wiselog: Boolean(value),
            observacao: observationNormalized,
        };

        console.log(
            "[WiseLog] Salvando utilização:",
            payload,
        );

        setSavingKey(key);

        try {
            const result = await apiRequest(
                "/api/wiselog/utilizacoes",
                {
                    method: "PUT",
                    body: JSON.stringify(payload),
                },
            );

            const responseData =
                result?.dados ||
                result?.data ||
                result?.registro ||
                {};

            const updatedRecord = {
                ...currentRecord,
                ...responseData,

                motoboy_id: motoboyId,
                data_referencia: date,
                utilizou_wiselog: Boolean(value),
                observacao: observationNormalized ?? "",
            };

            setRecords((current) => {
                const next = new Map(current);

                next.set(
                    key,
                    updatedRecord,
                );

                return next;
            });

            setObservations((current) => ({
                ...current,
                [key]: observationNormalized ?? "",
            }));

            notify?.(
                "Validação salva com sucesso.",
                "success",
            );
        } catch (requestError) {
            notify?.(
                requestError?.message ||
                "Não foi possível salvar a validação.",
                "error",
            );
        } finally {
            setSavingKey("");
        }
    };

    const handleObservationChange = (
        motoboyId,
        date,
        value,
    ) => {
        const key = `${motoboyId}_${date}`;

        setObservations((current) => ({
            ...current,
            [key]: value,
        }));
    };

    const handleObservationBlur = (
        motoboy,
        date,
    ) => {
        const motoboyId = getMotoboyId(motoboy);

        const key = `${motoboyId}_${date}`;

        const currentRecord = getRecord(
            motoboyId,
            date,
        );

        const observation =
            observations[key] ??
            currentRecord?.observacao ??
            "";

        const currentValue = Boolean(
            currentRecord?.utilizou_wiselog,
        );

        handleSave(
            motoboy,
            date,
            currentValue,
            observation,
        );
    };


    const getCompletedDays = (motoboyId) => {
        return businessDays.filter((day) => {
            return isChecked(motoboyId, day.date);
        }).length;
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
                            Validação semanal
                        </Typography>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                        >
                            Registre a utilização do WiseLog de
                            segunda a sexta-feira.
                        </Typography>
                    </Box>

                    <Stack
                        direction="row"
                        alignItems="center"
                        spacing={1}
                    >
                        <Tooltip title="Semana anterior">
                            <IconButton
                                onClick={() => changeWeek(-1)}
                            >
                                <ChevronLeftOutlined />
                            </IconButton>
                        </Tooltip>

                        <Button
                            variant="contained"
                            size="small"
                            onClick={goToCurrentWeek}
                        >
                            Semana atual
                        </Button>

                        <Tooltip title="Próxima semana">
                            <IconButton
                                onClick={() => changeWeek(1)}
                            >
                                <ChevronRightOutlined />
                            </IconButton>
                        </Tooltip>

                        <Tooltip title="Atualizar">
                            <IconButton
                                onClick={loadWeek}
                                disabled={loading}
                            >
                                <RefreshOutlined />
                            </IconButton>
                        </Tooltip>
                    </Stack>
                </Stack>

                <Divider sx={{ my: 2 }} />

                <Stack
                    direction={{
                        xs: "column",
                        sm: "row",
                    }}
                    justifyContent="space-between"
                    spacing={1}
                >
                    <Typography
                        variant="body2"
                        fontWeight={700}
                    >
                        {formatDateLabel(weekStartString)}
                        {" até "}
                        {formatDateLabel(weekEndString)}
                    </Typography>

                    <Chip
                        size="small"
                        label={`${activeMotoboys.length} motoboys ativos`}
                    />
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
            ) : activeMotoboys.length === 0 ? (
                <Alert severity="info">
                    Nenhum motoboy ativo foi encontrado.
                </Alert>
            ) : (
                <TableContainer
                    component={Paper}
                    variant="outlined"
                    sx={{
                        borderRadius: 3,
                        overflowX: "auto",
                        bgcolor: "background.default"
                    }}
                >
                    <Table
                        size="small"
                        sx={{
                            minWidth: 950,
                        }}
                    >
                        <TableHead>
                            <TableRow>
                                <TableCell>
                                    <strong>Motoboy</strong>
                                </TableCell>

                                {businessDays.map((day) => (
                                    <TableCell
                                        key={day.date}
                                        align="center"
                                    >
                                        <strong>
                                            {day.label}
                                        </strong>
                                    </TableCell>
                                ))}

                                <TableCell align="center">
                                    <strong>Total</strong>
                                </TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {activeMotoboys.map((motoboy) => {
                                const motoboyId =
                                    getMotoboyId(motoboy);

                                return (
                                    <TableRow
                                        key={motoboyId}
                                        hover
                                    >
                                        <TableCell>
                                            <Stack spacing={0.25}>
                                                <Typography
                                                    variant="body2"
                                                    fontWeight={700}
                                                >
                                                    {getMotoboyName(
                                                        motoboy,
                                                    )}
                                                </Typography>

                                                <Typography
                                                    variant="caption"
                                                    color="text.secondary"
                                                >
                                                    {motoboy?.apelido &&
                                                        motoboy?.nome
                                                        ? motoboy.apelido
                                                        : `ID: ${motoboyId}`}
                                                </Typography>
                                            </Stack>
                                        </TableCell>

                                        {businessDays.map((day) => {
                                            const key = `${motoboyId}_${day.date}`;
                                            const checked = isChecked(
                                                motoboyId,
                                                day.date,
                                            );

                                            const saving =
                                                savingKey === key;

                                            return (
                                                <TableCell
                                                    key={day.date}
                                                    align="center"
                                                >
                                                    <Stack
                                                        alignItems="center"
                                                        spacing={0.5}
                                                    >
                                                        <Tooltip
                                                            title={
                                                                checked
                                                                    ? "Marcar como não utilizado"
                                                                    : "Marcar como utilizado"
                                                            }
                                                        >
                                                            <span>
                                                                <IconButton
                                                                    size="small"
                                                                    color={
                                                                        checked
                                                                            ? "success"
                                                                            : "default"
                                                                    }
                                                                    disabled={saving}
                                                                    onClick={() =>
                                                                        handleSave(
                                                                            motoboy,
                                                                            day.date,
                                                                            !checked,
                                                                        )
                                                                    }
                                                                >
                                                                    {saving ? (
                                                                        <CircularProgress
                                                                            size={18}
                                                                        />
                                                                    ) : checked ? (
                                                                        <CheckCircleOutlined />
                                                                    ) : (
                                                                        <CloseOutlined />
                                                                    )}
                                                                </IconButton>
                                                            </span>
                                                        </Tooltip>

                                                        <TextField
                                                            size="small"
                                                            variant="standard"
                                                            placeholder="Obs."
                                                            value={
                                                                observations[key] !== undefined
                                                                    ? observations[key]
                                                                    : getRecord(
                                                                        motoboyId,
                                                                        day.date,
                                                                    )?.observacao || ""
                                                            }
                                                            onChange={(event) =>
                                                                handleObservationChange(
                                                                    motoboyId,
                                                                    day.date,
                                                                    event.target.value,
                                                                )
                                                            }
                                                            onBlur={() =>
                                                                handleObservationBlur(
                                                                    motoboy,
                                                                    day.date,
                                                                )
                                                            }
                                                            disabled={saving}
                                                            inputProps={{
                                                                "aria-label": `Observação de ${getMotoboyName(motoboy)} em ${day.date}`,
                                                            }}
                                                            sx={{
                                                                width: 150,
                                                            }}
                                                        />
                                                    </Stack>
                                                </TableCell>
                                            );
                                        })}

                                        <TableCell align="center">
                                            <Chip
                                                size="small"
                                                color={
                                                    getCompletedDays(
                                                        motoboyId,
                                                    ) === 5
                                                        ? "success"
                                                        : "default"
                                                }
                                                label={`${getCompletedDays(motoboyId)}/5`}
                                                sx={{color: 'primary.branco'}}
                                            />
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Box>
    );
}
