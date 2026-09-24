import React, { useCallback, useEffect, useMemo, useState } from "react";

import { useNavigate } from "react-router-dom";

import {
    Alert,
    Avatar,
    AvatarGroup,
    Autocomplete,
    Badge,
    Box,
    Button,
    Chip,
    CircularProgress,
    Collapse,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Drawer,
    FormControl,
    IconButton,
    InputAdornment,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Skeleton,
    Snackbar,
    Stack,
    Tab,
    Tabs,
    TextField,
    Tooltip,
    Typography,
    useMediaQuery,
    useTheme,
    Fab
} from "@mui/material";

import {
    Add,
    ArrowBack,
    AssignmentTurnedInOutlined,
    AttachFileOutlined,
    CalendarMonthOutlined,
    CheckCircleOutline,
    Close,
    CommentOutlined,
    DeleteOutline,
    DragIndicator,
    EditOutlined,
    FilterAltOutlined,
    FlagOutlined,
    GroupOutlined,
    MoreHoriz,
    OpenInNew,
    PersonOutline,
    Search,
    Send,
    Sort,
    TaskAltOutlined,
    Tune,
    ViewKanbanOutlined,
    ScienceOutlined,
    TwoWheeler,
    WhatsApp
} from "@mui/icons-material";

import RefreshIcon from "@mui/icons-material/Refresh";

import MenuUsuario from "../../components/MenuUsuario";
import LoginFuncionario from "../../components/LoginFuncionario";
import WiseLog from "../components/wiselog/WiseLog";
import NotificacoesMenu from "../../components/Notificacoes";

const API = "http://192.168.1.185:8077";
const TOKEN_KEY = "nfe_token";
const USER_KEY = "user_info";

const PRIORIDADES = [
    { value: "BAIXA", label: "Baixa", color: "success" },
    { value: "MEDIA", label: "Média", color: "info" },
    { value: "ALTA", label: "Alta", color: "warning", },
    { value: "URGENTE", label: "Urgente", color: "error" },
];

const EMPTY_FORM = {
    titulo: "",
    descricao: "",
    prioridade: "MEDIA",
    prazo: "",
    responsavel_id: "",
    compartilhar_com: [],
};

function getToken() {
    return localStorage.getItem(TOKEN_KEY) || "";
}

function getUser() {
    try {
        return JSON.parse(localStorage.getItem(USER_KEY) || "null");
    } catch {
        return null;
    }
}

function priorityMeta(priority) {
    return PRIORIDADES.find((item) => item.value === priority) || PRIORIDADES[1];
}

function formatDate(value) {
    if (!value) return "Sem prazo";
    const date = new Date(`${String(value).slice(0, 10)}T12:00:00`);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString("pt-BR");
}

function isOverdue(value) {
    if (!value) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const date = new Date(`${String(value).slice(0, 10)}T00:00:00`);
    return date < today;
}

function initials(name = "") {
    return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase() || "?";
}

function KanbanAvatar({ name, size = 30 }) {
    return (
        <Avatar sx={{ width: size, height: size, fontSize: size * 0.38 }}>
            {initials(name)}
        </Avatar>
    );
}

function SectionTitle({ icon, children }) {
    return (
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
            {icon}
            <Typography variant="subtitle2" fontWeight={800}>{children}</Typography>
        </Stack>
    );
}

async function apiRequest(path, options = {}) {
    const response = await fetch(`${API}${path}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            "X-Auth-Token": getToken(),
            ...(options.headers || {}),
        },
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok || data.sucesso === false) {
        throw new Error(data.erro || `Erro HTTP ${response.status}`);
    }
    return data;
}

function TaskCard({ task, onOpen, onDragStart }) {
    const priority = priorityMeta(task.prioridade);
    const overdue = isOverdue(task.prazo) && task.coluna_nome !== "Concluído";

    return (
        <Paper
            draggable
            onDragStart={(event) => onDragStart(event, task)}
            onClick={() => onOpen(task)}
            elevation={0}
            sx={(theme) => ({
                p: 1.5,
                cursor: "grab",
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 2.5,
                background: theme.palette.background.default,
                transition: "transform .18s, box-shadow .18s, border-color .18s",
                "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: theme.shadows[4],
                    borderColor: theme.palette.primary.main,
                },
                "&:active": { cursor: "grabbing" },
            })}
        >
            <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={1}>
                <Typography variant="body2" fontWeight={800} sx={{ wordBreak: "break-word" }}>
                    {task.titulo}
                </Typography>
                <DragIndicator sx={{ fontSize: 18, color: "text.disabled" }} />
            </Stack>

            {task.descricao && (
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.75 }}>
                    {task.descricao.length > 110 ? `${task.descricao.slice(0, 110)}…` : task.descricao}
                </Typography>
            )}

            <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{ mt: 1.25 }}>
                <Chip size="small"
                    sx={{ color: 'text.primary' }}
                    label={priority.label}
                    color={priority.color}
                    variant="contained"
                />
                {overdue &&
                    <Chip size="small" label="Atrasada" color="error" />}
            </Stack>

            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 1.5 }}>
                <Stack direction="row" spacing={0.5} alignItems="center">
                    <CalendarMonthOutlined sx={{ fontSize: 15, color: overdue ? "error.main" : "text.secondary" }} />
                    <Typography variant="caption" color={overdue ? "error.main" : "text.secondary"}>
                        {formatDate(task.prazo)}
                    </Typography>
                </Stack>
                <Stack direction="row" spacing={0.5} alignItems="center">
                    {task.comentarios_count > 0 && <CommentOutlined sx={{ fontSize: 16, color: "text.secondary" }} />}
                    {task.compartilhamentos?.length > 0 && (
                        <GroupOutlined sx={{ fontSize: 16, color: "text.secondary" }} />
                    )}
                    {task.responsavel_nome && <KanbanAvatar name={task.responsavel_nome} size={25} />}
                </Stack>
            </Stack>
        </Paper>
    );
}

function Column({ column, tasks, onOpen, onDrop, onDragStart }) {
    const [dragOver, setDragOver] = useState(false);
    const completed = column.nome === "Concluído";

    return (
        <Paper
            elevation={0}
            onDragOver={(event) => { event.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(event) => { event.preventDefault(); setDragOver(false); onDrop(event, column); }}
            sx={(theme) => ({
                width: { xs: 285, sm: 315, md: 330 },
                minWidth: { xs: 285, sm: 315, md: 330 },
                display: "flex",
                flexDirection: "column",
                border: `1px solid ${dragOver ? theme.palette.primary.main : theme.palette.divider}`,
                borderRadius: 3,
                background: dragOver ? theme.palette.action.hover : theme.palette.background.default,
                overflow: "hidden",
            })}
        >
            <Box sx={{ px: 2, py: 1.75, borderBottom: 1, borderColor: "divider" }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <Box sx={{ width: 9, height: 9, borderRadius: "50%", bgcolor: completed ? "success.main" : "primary.main" }} />
                        <Typography fontWeight={800}>{column.nome}</Typography>
                    </Stack>
                    <Chip size="small" label={tasks.length} />
                </Stack>
            </Box>
            <Stack spacing={1.25} sx={{ p: 1.25, minHeight: 180, flex: 1 }}>
                {tasks.length === 0 ? (
                    <Stack alignItems="center" justifyContent="center" sx={{ py: 5, color: "text.secondary" }}>
                        <TaskAltOutlined sx={{ fontSize: 30, opacity: 0.35, mb: 1 }} />
                        <Typography variant="caption">Nenhuma tarefa aqui</Typography>
                    </Stack>
                ) : tasks.map((task) => (
                    <TaskCard key={task.id} task={task} onOpen={onOpen} onDragStart={onDragStart} />
                ))}
            </Stack>
        </Paper>
    );
}

function TaskFormDialog({ open, onClose, onSave, users, initialTask, loading }) {
    const editing = Boolean(initialTask);
    const [form, setForm] = useState(EMPTY_FORM);
    const [showSharing, setShowSharing] = useState(false);

    useEffect(() => {
        if (!open) return;
        setForm(initialTask ? {
            titulo: initialTask.titulo || "",
            descricao: initialTask.descricao || "",
            prioridade: initialTask.prioridade || "MEDIA",
            prazo: initialTask.prazo ? String(initialTask.prazo).slice(0, 10) : "",
            responsavel_id: initialTask.responsavel_id || "",
            compartilhar_com: (initialTask.compartilhamentos || []).map((item) => item.funcionario_id),
        } : EMPTY_FORM);
        setShowSharing(Boolean(initialTask?.compartilhamentos?.length));
    }, [open, initialTask]);

    const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));

    const toggleUser = (id) => {
        setForm((current) => ({
            ...current,
            compartilhar_com: current.compartilhar_com.includes(id)
                ? current.compartilhar_com.filter((item) => item !== id)
                : [...current.compartilhar_com, id],
        }));
    };

    const submit = () => {
        if (!form.titulo.trim()) return;
        onSave({ ...form, responsavel_id: form.responsavel_id || null });
    };

    return (
        <Dialog open={open} onClose={loading ? undefined : onClose} fullWidth maxWidth="sm"
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
            }}>
            <DialogTitle sx={{ pr: 6 }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                    <AssignmentTurnedInOutlined color="primary" />
                    <Box>
                        <Typography variant="h6" fontWeight={800}>{editing ? "Editar tarefa" : "Nova tarefa"}</Typography>
                        <Typography variant="caption" color="text.secondary">Organize uma demanda do seu dia a dia.</Typography>
                    </Box>
                </Stack>
                <IconButton onClick={onClose} disabled={loading} sx={{ position: "absolute", right: 12, top: 12 }}><Close /></IconButton>
            </DialogTitle>
            <DialogContent dividers>
                <Stack spacing={2} sx={{ pt: 0.5 }}>
                    <TextField
                        autoFocus
                        fullWidth
                        label="Título"
                        value={form.titulo}
                        onChange={(e) => update("titulo", e.target.value)}
                        required
                    />

                    <TextField
                        fullWidth
                        multiline
                        minRows={3}
                        label="Descrição"
                        value={form.descricao}
                        onChange={(e) => update("descricao", e.target.value)}
                    />

                    <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                        <FormControl fullWidth>
                            <InputLabel>Prioridade</InputLabel>

                            <Select
                                label="Prioridade"
                                value={form.prioridade}
                                onChange={(e) => update("prioridade", e.target.value)}
                                MenuProps={{
                                    PaperProps: {
                                        sx: {
                                            bgcolor: "background.default",
                                            color: "text.primary",
                                        },
                                    },
                                }}
                            >
                                {PRIORIDADES.map((item) => (
                                    <MenuItem
                                        key={item.value}
                                        value={item.value}
                                    >
                                        {item.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <TextField
                            fullWidth
                            type="date"
                            label="Prazo"
                            InputLabelProps={{ shrink: true }}
                            value={form.prazo}
                            onChange={(e) => update("prazo", e.target.value)}
                        />
                    </Stack>

                    <Autocomplete
                        fullWidth
                        options={users}
                        value={
                            users.find(
                                (user) =>
                                    String(user.id) ===
                                    String(form.responsavel_id)
                            ) || null
                        }
                        onChange={(event, novoFuncionario) => {
                            update(
                                "responsavel_id",
                                novoFuncionario
                                    ? novoFuncionario.id
                                    : ""
                            );
                        }}
                        getOptionLabel={(user) =>
                            user
                                ? `${user.nome} (${user.codigo})`
                                : ""
                        }
                        isOptionEqualToValue={(option, value) =>
                            String(option.id) ===
                            String(value.id)
                        }
                        noOptionsText="Nenhum funcionário encontrado"
                        renderOption={(props, user) => (
                            <Box
                                component="li"
                                {...props}
                                key={user.id}
                                sx={{
                                    display: "flex !important",
                                    alignItems: "center",
                                    gap: 1.25,
                                    py: "10px !important",
                                }}
                            >
                                <KanbanAvatar
                                    name={user.nome}
                                    size={36}
                                />

                                <Box sx={{ minWidth: 0 }}>
                                    <Typography
                                        fontWeight={650}
                                        noWrap
                                    >
                                        {user.nome}
                                    </Typography>

                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                    >
                                        Código: {user.codigo}
                                    </Typography>
                                </Box>
                            </Box>
                        )}
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
                                },
                            },
                        }}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Responsável"
                                placeholder="Digite o nome..."
                                sx={{
                                    "& .MuiOutlinedInput-root": {
                                        borderRadius: 2.5,
                                    },
                                }}
                            />
                        )}
                    />

                    <Box>
                        <Button
                            variant="contained"
                            startIcon={<GroupOutlined />}
                            onClick={() => setShowSharing((value) => !value)}
                            sx={{ px: 2 }}
                        >
                            Compartilhar com pessoas{" "}
                            {form.compartilhar_com.length
                                ? `(${form.compartilhar_com.length})`
                                : ""}
                        </Button>

                        <Collapse in={showSharing}>
                            <Box sx={{ mt: 1.5 }}>
                                <Autocomplete
                                    multiple
                                    fullWidth
                                    options={users}
                                    value={users.filter((user) =>
                                        form.compartilhar_com.some(
                                            (id) => String(id) === String(user.id)
                                        )
                                    )}
                                    onChange={(event, novosFuncionarios) => {
                                        update(
                                            "compartilhar_com",
                                            novosFuncionarios.map((user) => user.id)
                                        );
                                    }}
                                    getOptionLabel={(user) =>
                                        user
                                            ? `${user.nome} (${user.codigo})`
                                            : ""
                                    }
                                    isOptionEqualToValue={(option, value) =>
                                        String(option.id) === String(value.id)
                                    }
                                    filterSelectedOptions
                                    noOptionsText="Nenhum funcionário encontrado"
                                    renderOption={(props, user) => (
                                        <Box
                                            component="li"
                                            {...props}
                                            key={user.id}
                                            sx={{
                                                display: "flex !important",
                                                alignItems: "center",
                                                gap: 1.25,
                                                py: "10px !important",
                                            }}
                                        >
                                            <KanbanAvatar
                                                name={user.nome}
                                                size={36}
                                            />

                                            <Box sx={{ minWidth: 0 }}>
                                                <Typography
                                                    fontWeight={650}
                                                    noWrap
                                                >
                                                    {user.nome}
                                                </Typography>

                                                <Typography
                                                    variant="caption"
                                                    color="text.secondary"
                                                >
                                                    Código: {user.codigo}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    )}
                                    renderTags={(selectedUsers, getTagProps) =>
                                        selectedUsers.map((user, index) => (
                                            <Chip
                                                {...getTagProps({ index })}
                                                key={user.id}
                                                avatar={
                                                    <KanbanAvatar
                                                        name={user.nome}
                                                        size={24}
                                                    />
                                                }
                                                label={user.nome}
                                                sx={{
                                                    maxWidth: "100%",
                                                    color: "text.primary",
                                                    backgroundColor: "action.selected",
                                                    px: 0.5
                                                }}
                                            />
                                        ))
                                    }
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
                                            },
                                        },
                                        chip: {
                                            sx: {
                                                color: "text.primary",
                                                backgroundColor: "action.selected",
                                            },
                                        },
                                    }}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Compartilhar com"
                                            placeholder={
                                                form.compartilhar_com.length
                                                    ? ""
                                                    : "Digite o nome do funcionário..."
                                            }
                                            sx={{
                                                "& .MuiOutlinedInput-root": {
                                                    borderRadius: 2.5,
                                                },
                                            }}
                                        />
                                    )}
                                />
                            </Box>
                        </Collapse>
                    </Box>
                </Stack>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
                <Button
                    color="error"
                    variant="contained"
                    onClick={onClose}
                    disabled={loading}>
                    Cancelar
                </Button>
                <Button variant="contained"
                    onClick={submit}
                    disabled={loading || !form.titulo.trim()} startIcon={loading ?
                        <CircularProgress size={16} /> : <CheckCircleOutline />}>
                    {editing ? "Salvar alterações" : "Criar tarefa"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

function DetailsDrawer({ task, open, onClose, onEdit, onDelete, onMove, columns, comments, onAddComment, loading }) {
    const [comment, setComment] = useState("");
    const priority = task ? priorityMeta(task.prioridade) : null;

    useEffect(() => { if (!open) setComment(""); }, [open]);
    if (!task) return null;

    const sendComment = () => {
        if (!comment.trim()) return;
        onAddComment(comment.trim());
        setComment("");
    };

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: {
                    maxWidth: "100vw",
                    bgcolor: "background.default",
                    color: "text.primary",
                    width: { xs: "100%", sm: 460 },
                    p: 0,
                },
            }}
        >
            <Box
                sx={{
                    p: 2,
                    borderBottom: 1,
                    borderColor: "divider",
                    bgcolor: "background.default",
                    color: "text.primary",
                }}
            >
                <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                >
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <ViewKanbanOutlined color="primary" />

                        <Typography
                            fontWeight={800}
                            color="text.primary"
                        >
                            Detalhes da tarefa
                        </Typography>
                    </Stack>

                    <IconButton
                        onClick={onClose}
                        sx={{
                            color: "text.primary",
                        }}
                    >
                        <Close />
                    </IconButton>
                </Stack>
            </Box>

            <Box
                sx={{
                    p: 2,
                    overflowY: "auto",
                    flex: 1,
                    bgcolor: "background.default",
                    color: "text.primary",
                }}
            >
                <Stack spacing={2.25}>
                    <Box>
                        <Typography
                            variant="h6"
                            fontWeight={800}
                            color="text.primary"
                        >
                            {task.titulo}
                        </Typography>

                        <Stack
                            direction="row"
                            spacing={0.75}
                            flexWrap="wrap"
                            useFlexGap
                            sx={{ mt: 1 }}
                        >
                            <Chip
                                label={priority.label}
                                color={priority.color}
                                size="small"
                            />

                            <Chip
                                label={task.coluna_nome || "Sem coluna"}
                                size="small"
                                variant="outlined"
                                sx={{
                                    color: "text.primary",
                                    borderColor: "divider",
                                }}
                            />
                        </Stack>
                    </Box>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                            whiteSpace: "pre-wrap",
                        }}
                    >
                        {task.descricao || "Sem descrição informada."}
                    </Typography>

                    <Divider />

                    <SectionTitle icon={<Tune fontSize="small" />}>
                        Atualizar estágio
                    </SectionTitle>

                    <FormControl fullWidth size="small">
                        <InputLabel>Coluna</InputLabel>

                        <Select
                            label="Coluna"
                            value={task.coluna_id || ""}
                            onChange={(e) =>
                                onMove(Number(e.target.value))
                            }
                            sx={{
                                color: "text.primary",

                                "& .MuiOutlinedInput-notchedOutline": {
                                    borderColor: "divider",
                                },

                                "&:hover .MuiOutlinedInput-notchedOutline": {
                                    borderColor: "text.secondary",
                                },

                                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                    borderColor: "primary.main",
                                },
                            }}
                            MenuProps={{
                                PaperProps: {
                                    sx: {
                                        bgcolor: "background.default",
                                        color: "text.primary",
                                        border: "1px solid",
                                        borderColor: "divider",
                                        boxShadow: 8,

                                        "& .MuiMenuItem-root": {
                                            color: "text.primary",

                                            "&:hover": {
                                                bgcolor: "action.hover",
                                            },

                                            "&.Mui-selected": {
                                                bgcolor: "action.selected",
                                                color: "text.primary",
                                            },

                                            "&.Mui-selected:hover": {
                                                bgcolor: "action.hover",
                                            },
                                        },
                                    },
                                },
                            }}
                        >
                            {columns.map((column) => (
                                <MenuItem
                                    key={column.id}
                                    value={column.id}
                                >
                                    {column.nome}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <Stack spacing={1}>
                        <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                        >
                            <CalendarMonthOutlined
                                fontSize="small"
                                color="action"
                            />

                            <Typography
                                variant="body2"
                                color="text.primary"
                            >
                                Prazo: {formatDate(task.prazo)}
                            </Typography>
                        </Stack>

                        <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                        >
                            <PersonOutline
                                fontSize="small"
                                color="action"
                            />

                            <Typography
                                variant="body2"
                                color="text.primary"
                            >
                                Responsável:{" "}
                                {task.responsavel_nome || "Não definido"}
                            </Typography>
                        </Stack>

                        <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                        >
                            <GroupOutlined
                                fontSize="small"
                                color="action"
                            />

                            <Typography
                                variant="body2"
                                color="text.primary"
                            >
                                Compartilhamentos:{" "}
                                {task.compartilhamentos?.length || 0}
                            </Typography>
                        </Stack>
                    </Stack>

                    <Divider />

                    <SectionTitle
                        icon={<CommentOutlined fontSize="small" />}
                    >
                        Comentários
                    </SectionTitle>

                    <Stack spacing={1}>
                        {comments.length === 0 ? (
                            <Typography
                                variant="body2"
                                color="text.secondary"
                            >
                                Ainda não há comentários.
                            </Typography>
                        ) : (
                            comments.map((item) => (
                                <Paper
                                    key={item.id}
                                    variant="outlined"
                                    sx={{
                                        p: 1.25,
                                        bgcolor: "background.default",
                                        color: "text.primary",
                                        borderColor: "divider",
                                    }}
                                >
                                    <Stack direction="row" spacing={1}>
                                        <KanbanAvatar
                                            name={item.funcionario_nome}
                                            size={28}
                                        />

                                        <Box>
                                            <Typography
                                                variant="caption"
                                                fontWeight={800}
                                                color="text.primary"
                                            >
                                                {item.funcionario_nome}
                                            </Typography>

                                            <Typography
                                                variant="body2"
                                                color="text.primary"
                                                sx={{
                                                    whiteSpace: "pre-wrap",
                                                }}
                                            >
                                                {item.comentario}
                                            </Typography>

                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                            >
                                                {formatDate(item.criado_em)}
                                            </Typography>
                                        </Box>
                                    </Stack>
                                </Paper>
                            ))
                        )}
                    </Stack>

                    <TextField
                        fullWidth
                        multiline
                        minRows={2}
                        placeholder="Escreva uma atualização..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        sx={{
                            "& .MuiInputBase-input": {
                                color: "text.primary",
                            },

                            "& .MuiInputBase-input::placeholder": {
                                color: "text.secondary",
                                opacity: 1,
                            },

                            "& .MuiOutlinedInput-notchedOutline": {
                                borderColor: "divider",
                            },

                            "&:hover .MuiOutlinedInput-notchedOutline": {
                                borderColor: "text.secondary",
                            },
                        }}
                    />

                    <Button
                        variant="contained"
                        startIcon={<Send />}
                        onClick={sendComment}
                        disabled={loading || !comment.trim()}
                    >
                        Adicionar comentário
                    </Button>
                </Stack>
            </Box>

            <Box
                sx={{
                    p: 2,
                    borderTop: 1,
                    borderColor: "divider",
                    bgcolor: "background.default",
                    color: "text.primary",
                }}
            >
                <Stack direction="row" spacing={1}>
                    <Button
                        fullWidth
                        variant="contained"
                        startIcon={<EditOutlined />}
                        onClick={onEdit}
                    >
                        Editar
                    </Button>

                    <Button
                        color="error"
                        variant="contained"
                        startIcon={<DeleteOutline />}
                        onClick={onDelete}
                        sx={{ px: 3 }}
                    >
                        Excluir
                    </Button>
                </Stack>
            </Box>
        </Drawer>
    );
}

export default function Kanban() {

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));

    const navigate = useNavigate();

    const [userInfo, setUserInfo] = useState(() => {
        try {
            const user = localStorage.getItem(USER_KEY);
            return user ? JSON.parse(user) : null;
        } catch {
            return null;
        }
    });

    const [token, setToken] = useState(
        () => localStorage.getItem(TOKEN_KEY) || ""
    );

    const logout = () => {
        setToken("");
        setUserInfo(null);

        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);

        localStorage.removeItem("nfe_token");
        localStorage.removeItem("user_info");
    };

    const user = useMemo(() => getUser(), []);


    const [activeModule, setActiveModule] = useState("kanban");

    const [abrirAvisoTestes, setAbrirAvisoTestes] = useState(true);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [data, setData] = useState({ quadro: null, colunas: [], tarefas: [] });
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState("");
    const [priorityFilter, setPriorityFilter] = useState("TODAS");
    const [ownerFilter, setOwnerFilter] = useState("TODOS");
    const [onlyOverdue, setOnlyOverdue] = useState(false);
    const [sortMode, setSortMode] = useState("recentes");
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [formOpen, setFormOpen] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [selectedTask, setSelectedTask] = useState(null);
    const [comments, setComments] = useState([]);
    const [draggedTask, setDraggedTask] = useState(null);
    const [toast, setToast] = useState({ open: false, message: "", severity: "success" });

    const notify = useCallback((message, severity = "success") => setToast({ open: true, message, severity }), []);

    const loadBoard = useCallback(async () => {
        setLoading(true);
        try {
            const [board, people] = await Promise.all([apiRequest("/api/kanban"),
            apiRequest("/api/kanban/usuarios")]);

            setData({ quadro: board.quadro, colunas: board.colunas || [], tarefas: board.tarefas || [] });
            setUsers(people.usuarios || []);

        } catch (error) {
            notify(error.message, "error");
        } finally {
            setLoading(false);
        }
    }, [notify]);

    useEffect(() => { loadBoard(); }, [loadBoard]);

    const openTask = async (task) => {

        setSelectedTask(task);

        try {
            const result = await apiRequest(`/api/kanban/tarefas/${task.id}/comentarios`);

            setComments(result.comentarios || []);
        } catch (error) {
            notify(error.message, "error");
        }
    };

    const saveTask = async (form) => {
        setSaving(true);
        try {
            const path = editingTask ? `/api/kanban/tarefas/${editingTask.id}` : "/api/kanban/tarefas";

            await apiRequest(path, {
                method: editingTask ? "PUT" : "POST",
                body: JSON.stringify(form)
            });

            setFormOpen(false);
            setEditingTask(null);
            await loadBoard();

            notify(editingTask ? "Tarefa atualizada." : "Tarefa criada.");

        } catch (error) { notify(error.message, "error"); }
        finally {
            setSaving(false);
        }

    };

    const moveTask = async (task, columnId) => {
        if (!task || Number(task.coluna_id) === Number(columnId)) return;
        try {
            await apiRequest(`/api/kanban/tarefas/${task.id}/mover`,
                {
                    method: "PATCH",
                    body: JSON.stringify({
                        coluna_id: columnId
                    })
                });
            await loadBoard();

            if (selectedTask?.id === task.id)

                setSelectedTask((current) => ({ ...current, coluna_id: columnId, coluna_nome: data.colunas.find((item) => item.id === columnId)?.nome }));

            notify("Tarefa movimentada.");

        } catch (error) {
            notify(error.message, "error");
        }
    };

    const deleteTask = async (task) => {
        if (!window.confirm(`Excluir a tarefa "${task.titulo}"?`))
            return;
        try {
            await apiRequest(`/api/kanban/tarefas/${task.id}`,
                {
                    method: "DELETE"
                });
            setSelectedTask(null);

            await loadBoard();
            notify("Tarefa excluída.");
        } catch (error) {
            notify(error.message, "error");
        }
    };

    const addComment = async (comment) => {
        if (!selectedTask) return;
        setSaving(true);
        try {
            await apiRequest(`/api/kanban/tarefas/${selectedTask.id}/comentarios`,
                {
                    method: "POST",
                    body: JSON.stringify
                        ({ comentario: comment })
                });

            const result = await apiRequest(`/api/kanban/tarefas/${selectedTask.id}/comentarios`);

            setComments(result.comentarios || []);

            notify("Comentário adicionado.");

        } catch (error) {
            notify(error.message, "error");

        } finally {
            setSaving(false);
        }
    };

    const filteredTasks = useMemo(() => {
        let result = [...data.tarefas];
        const normalized = search.trim().toLowerCase();
        if (normalized) result = result.filter((task) => `${task.titulo} ${task.descricao || ""}`.toLowerCase().includes(normalized));
        if (priorityFilter !== "TODAS") result = result.filter((task) => task.prioridade === priorityFilter);
        if (ownerFilter === "MINHAS") result = result.filter((task) => Number(task.criador_id) === Number(user?.id));
        if (ownerFilter === "RESPONSAVEL") result = result.filter((task) => Number(task.responsavel_id) === Number(user?.id));
        if (onlyOverdue) result = result.filter((task) => isOverdue(task.prazo) && task.coluna_nome !== "Concluído");
        result.sort((a, b) => sortMode === "prazo" ? String(a.prazo || "9999").localeCompare(String(b.prazo || "9999")) : Number(b.id) - Number(a.id));
        return result;
    }, [data.tarefas, search, priorityFilter, ownerFilter, onlyOverdue, sortMode, user]);

    const stats = useMemo(() => ({ total: data.tarefas.length, abertas: data.tarefas.filter((task) => task.coluna_nome !== "Concluído").length, urgentes: data.tarefas.filter((task) => task.prioridade === "URGENTE").length, atrasadas: data.tarefas.filter((task) => isOverdue(task.prazo) && task.coluna_nome !== "Concluído").length }), [data.tarefas]);

    const openCreate = () => { setEditingTask(null); setFormOpen(true); };
    const openEdit = () => { setEditingTask(selectedTask); setFormOpen(true); };

    // Busca tarefas compartilhadas
    const obterTarefasDaColuna = (coluna) => {
        return filteredTasks.filter((task) => {
            // Tarefa pertence ao quadro do usuário atual.
            if (Number(task.quadro_id) === Number(data.quadro?.id)) {
                return Number(task.coluna_id) === Number(coluna.id);
            }

            // Tarefa compartilhada de outro quadro.
            // Usa o nome da coluna como referência.
            return (
                String(task.coluna_nome || "").trim().toLowerCase() ===
                String(coluna.nome || "").trim().toLowerCase()
            );
        });
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

    return (
        <Box sx={{ p: { xs: 1.5, md: 3 }, minHeight: "100%" }}>
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
                    bgcolor: "primary.main",
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

                    <Box sx={{ minWidth: 0 }}>

                        <Typography
                            variant="h6"
                            fontWeight={800}
                            sx={{
                                lineHeight: 1.1,
                                whiteSpace: "nowrap",
                            }}
                        >
                            SIGEL Kanban
                        </Typography>

                        <Typography
                            variant="caption"
                            sx={{
                                opacity: 0.75,
                            }}
                        >
                            Gestão de tarefas e controle operacional
                        </Typography>

                    </Box>

                </Box>

                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        zoom: 0.9
                    }}
                >

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
                            <ArrowBack />
                        </IconButton>
                    </Tooltip>

                </Box>
            </Paper>

            {userInfo.pode_acessar_painel_gerencial && (
                <Paper
                    variant="outlined"
                    sx={{
                        mb: 2.5,
                        borderRadius: 2.5,
                        overflow: "hidden",
                        bgcolor: "background.default",
                    }}
                >
                    <Tabs
                        value={activeModule}
                        onChange={(event, newValue) => setActiveModule(newValue)}
                        variant="scrollable"
                        scrollButtons="auto"
                        sx={{
                            minHeight: 48,
                            "& .MuiTab-root": {
                                minHeight: 48,
                                fontWeight: 700,
                            },
                        }}
                    >
                        <Tab
                            value="kanban"
                            label="Kanban"
                            icon={<ViewKanbanOutlined />}
                            iconPosition="start"
                        />

                        <Tab
                            value="wiselog"
                            label="WiseLog"
                            icon={<TwoWheeler />}
                            iconPosition="start"
                        />
                    </Tabs>
                </Paper>
            )}
            {activeModule === "kanban" && (
                <>
                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: {
                                xs: "repeat(2, 1fr)",
                                md: "repeat(4, 1fr)",
                            },
                            gap: 1.5,
                            mb: 2.5,
                        }}
                    >
                        {[
                            {
                                label: "Total",
                                value: stats.total,
                                icon: <AssignmentTurnedInOutlined />,
                                color: "primary.main",
                            },
                            {
                                label: "Em aberto",
                                value: stats.abertas,
                                icon: <TaskAltOutlined />,
                                color: "info.main",
                            },
                            {
                                label: "Urgentes",
                                value: stats.urgentes,
                                icon: <FlagOutlined />,
                                color: "error.main",
                            },
                            {
                                label: "Atrasadas",
                                value: stats.atrasadas,
                                icon: <CalendarMonthOutlined />,
                                color: "warning.main",
                            },
                        ].map((item) => (
                            <Paper
                                key={item.label}
                                variant="outlined"
                                sx={{
                                    p: 1.75,
                                    borderRadius: 2.5,
                                    backgroundColor: "background.default",
                                    color: "text.primary",
                                }}
                            >
                                <Stack
                                    direction="row"
                                    alignItems="center"
                                    justifyContent="space-between"
                                >
                                    <Box>
                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                        >
                                            {item.label}
                                        </Typography>

                                        <Typography
                                            variant="h5"
                                            fontWeight={900}
                                            color="text.primary"
                                        >
                                            {item.value}
                                        </Typography>
                                    </Box>

                                    <Box sx={{ color: item.color }}>
                                        {item.icon}
                                    </Box>
                                </Stack>
                            </Paper>
                        ))}
                    </Box>

                    <Paper variant="outlined" sx={{ bgcolor: 'background.default', p: 1.5, mb: 2.5, borderRadius: 2.5 }}>
                        <Stack direction={{ xs: "column", md: "row" }}
                            spacing={1.25}
                            alignItems={{ xs: "stretch", md: "center" }}>
                            <TextField size="small" fullWidth placeholder="Buscar tarefas..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                InputProps={{
                                    startAdornment:
                                        <InputAdornment position="start">
                                            <Search fontSize="small" />
                                        </InputAdornment>
                                }} />
                            {isMobile &&
                                <Button variant="contained" startIcon={<FilterAltOutlined />}
                                    onClick={() => setFiltersOpen((value) => !value)}>
                                    {isMobile ? "Filtros" : "Filtrar"}
                                </Button>
                            }
                            <FormControl size="small" sx={{ minWidth: 150 }}>
                                <InputLabel>
                                    Ordenar
                                </InputLabel>
                                <Select label="Ordenar" value={sortMode}
                                    MenuProps={{
                                        PaperProps: {
                                            sx: {
                                                bgcolor: "background.default",
                                                color: "text.primary",
                                            },
                                        },
                                    }}
                                    onChange={(e) => setSortMode(e.target.value)}>
                                    <MenuItem value="recentes">
                                        Mais recentes
                                    </MenuItem>
                                    <MenuItem value="prazo">
                                        Por prazo
                                    </MenuItem>
                                </Select>
                            </FormControl>

                            <Tooltip title="Atualizar">
                                <IconButton
                                    onClick={loadBoard}>
                                    <RefreshIcon />
                                </IconButton>
                            </Tooltip>

                        </Stack>
                        <Collapse in={filtersOpen || !isMobile}>
                            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25} sx={{ mt: 1.5 }}>
                                <FormControl size="small" sx={{ minWidth: 150 }}>
                                    <InputLabel>
                                        Prioridade
                                    </InputLabel>
                                    <Select label="Prioridade" value={priorityFilter}
                                        onChange={(e) => setPriorityFilter(e.target.value)}
                                        MenuProps={{
                                            PaperProps: {
                                                sx: {
                                                    bgcolor: "background.default",
                                                    color: "text.primary",
                                                },
                                            },
                                        }}>
                                        <MenuItem value="TODAS">
                                            Todas
                                        </MenuItem>
                                        {PRIORIDADES.map((item) =>
                                            <MenuItem key={item.value}
                                                value={item.value}>
                                                {item.label}
                                            </MenuItem>)}
                                    </Select>
                                </FormControl>
                                <FormControl size="small" sx={{ minWidth: 170 }}>
                                    <InputLabel>
                                        Participação
                                    </InputLabel>
                                    <Select label="Participação" value={ownerFilter}
                                        onChange={(e) => setOwnerFilter(e.target.value)}
                                        MenuProps={{
                                            PaperProps: {
                                                sx: {
                                                    bgcolor: "background.default",
                                                    color: "text.primary",
                                                },
                                            },
                                        }}>
                                        <MenuItem value="TODOS">
                                            Todas
                                        </MenuItem>
                                        <MenuItem value="MINHAS">
                                            Criadas por mim
                                        </MenuItem>
                                        <MenuItem value="RESPONSAVEL">
                                            Sou responsável
                                        </MenuItem>
                                    </Select>
                                </FormControl>
                                <Button variant={onlyOverdue ? "contained" : "outlined"} color={onlyOverdue ? "error" : "inherit"}
                                    onClick={() => setOnlyOverdue((value) => !value)}
                                    startIcon={<CalendarMonthOutlined />}>
                                    Atrasadas
                                </Button>
                                <Button color="inherit"
                                    onClick={() => {
                                        setSearch("");
                                        setPriorityFilter("TODAS");
                                        setOwnerFilter("TODOS");
                                        setOnlyOverdue(false);
                                    }}>
                                    Limpar
                                </Button>
                            </Stack>
                        </Collapse>
                    </Paper>

                    {loading ? (
                        <Stack
                            direction="row"
                            spacing={2}
                            sx={{ overflow: "hidden" }}
                        >
                            {[1, 2, 3].map((item) => (
                                <Skeleton
                                    key={item}
                                    variant="rounded"
                                    width={330}
                                    height={300}
                                />
                            ))}
                        </Stack>
                    ) : (
                        <Box
                            sx={{
                                display: "flex",
                                gap: 2,
                                overflowX: "auto",
                                alignItems: "stretch",
                                pb: 2,
                            }}
                        >
                            {data.colunas.map((column) => (
                                <Column
                                    key={column.id}
                                    column={column}
                                    tasks={filteredTasks.filter((task) => {
                                        const mesmaColuna =
                                            Number(task.coluna_id) === Number(column.id);

                                        const tarefaDeOutroQuadro =
                                            Number(task.quadro_id) !== Number(data.quadro?.id);

                                        const mesmoNomeDeColuna =
                                            String(task.coluna_nome || "")
                                                .trim()
                                                .toLowerCase() ===
                                            String(column.nome || "")
                                                .trim()
                                                .toLowerCase();

                                        return (
                                            mesmaColuna ||
                                            (tarefaDeOutroQuadro && mesmoNomeDeColuna)
                                        );
                                    })}
                                    onOpen={openTask}
                                    onDragStart={(event, task) => {
                                        setDraggedTask(task);
                                        event.dataTransfer.effectAllowed = "move";
                                        event.dataTransfer.setData(
                                            "text/plain",
                                            String(task.id)
                                        );
                                    }}
                                    onDrop={() => {
                                        if (draggedTask) {
                                            moveTask(draggedTask, column.id);
                                        }

                                        setDraggedTask(null);
                                    }}
                                />
                            ))}
                        </Box>
                    )}

                    <Dialog
                        open={abrirAvisoTestes}
                        onClose={() => setAbrirAvisoTestes(false)}
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
                        <DialogTitle
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1.5,
                                fontWeight: 700,
                                pb: 1,
                            }}
                        >
                            <ScienceOutlined
                                sx={{
                                    color: "#F59E0B",
                                    fontSize: 30,
                                }}
                            />

                            <Typography
                                component="span"
                                variant="h6"
                                fontWeight={700}
                            >
                                SIGEL Kanban • Fase de testes
                            </Typography>
                        </DialogTitle>

                        <DialogContent>
                            <Typography
                                variant="body1"
                                fontWeight={600}
                                sx={{ mb: 2 }}
                            >
                                O módulo SIGEL Kanban está em fase de testes e
                                aprimoramento.
                            </Typography>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{
                                    lineHeight: 1.8,
                                    mb: 2,
                                }}
                            >
                                Durante esse período, podem ocorrer ajustes,
                                mudanças e melhorias nas funcionalidades. Sua
                                participação é muito importante para que possamos
                                tornar a ferramenta cada vez mais útil para a equipe.
                            </Typography>

                            <Typography
                                variant="body1"
                                fontWeight={600}
                                sx={{ mb: 1 }}
                            >
                                Encontrou algum problema ou tem uma sugestão de
                                melhoria?
                            </Typography>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{
                                    lineHeight: 1.8,
                                    mb: 2,
                                }}
                            >
                                Envie seu feedback ao Setor de Desenvolvimento pelo
                                WhatsApp
                            </Typography>

                            <Divider sx={{ mb: 2 }} />

                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{
                                    textAlign: "center",
                                    fontStyle: "italic",
                                }}
                            >
                                Agradecemos pela colaboração! 🚀
                            </Typography>
                        </DialogContent>

                        <DialogActions
                            sx={{
                                px: 3,
                                pb: 3,
                                justifyContent: "space-between",
                                gap: 1,
                            }}
                        >
                            <Button
                                variant="contained"
                                color="success"
                                startIcon={<WhatsApp />}
                                onClick={() => {
                                    window.open(
                                        "https://wa.me/554791692664",
                                        "_blank",
                                        "noopener,noreferrer"
                                    );
                                }}
                            >
                                Enviar sugestão
                            </Button>

                            <Button
                                variant="contained"
                                onClick={() => setAbrirAvisoTestes(false)}
                            >
                                Entendi, continuar
                            </Button>
                        </DialogActions>
                    </Dialog>

                    <Tooltip title="Criar tarefa">
                        <Fab
                            color="primary"
                            aria-label="add"
                            onClick={openCreate}
                            sx={{ position: 'fixed', bottom: 16, right: 16 }}
                        >
                            <Add />
                        </Fab>
                    </Tooltip>

                    <TaskFormDialog open={formOpen}
                        onClose={() => { if (!saving) { setFormOpen(false); setEditingTask(null); } }}
                        onSave={saveTask}
                        users={users}
                        initialTask={editingTask}
                        loading={saving} />

                    <DetailsDrawer task={selectedTask} open={Boolean(selectedTask)}
                        onClose={() => setSelectedTask(null)}
                        columns={data.colunas}
                        comments={comments}
                        loading={saving}
                        onMove={(columnId) => moveTask(selectedTask,
                            columnId)} onEdit={openEdit}
                        onDelete={() => deleteTask(selectedTask)}
                        onAddComment={addComment} />

                </>
            )}

            {activeModule === "wiselog" && (
                <WiseLog notify={notify} />
            )}

            <Snackbar open={toast.open} autoHideDuration={4500}
                onClose={() => setToast((current) => ({ ...current, open: false }))}>
                <Alert severity={toast.severity} variant="filled"
                    sx={{
                        color: 'primary.branco',

                        "& .MuiAlert-icon": {
                            color: 'primary.branco'
                        },

                        "& .MuiAlert-action": {
                            color: 'primary.branco'
                        }
                    }}
                    onClose={() => setToast((current) => ({ ...current, open: false }))}>
                    {toast.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}
