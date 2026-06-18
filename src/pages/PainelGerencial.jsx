import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import {
    Container,
    Typography,
    Card,
    CardContent,
    Grid,
    Box,
    Button,
    Checkbox,
    FormControlLabel,
    FormGroup,
    Chip,
    MenuItem,
    Select,
    InputLabel,
    FormControl,
    CircularProgress,
    Snackbar,
    Alert,
    Divider,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from "@mui/material";

import Pagination from "@mui/material/Pagination";

import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const API_URL = "http://192.168.1.185:8077";

export default function DistribuicaoConferencia() {

    const navigate = useNavigate();

    const [userInfo, setUserInfo] = useState(() => {
        const user = localStorage.getItem("user_info");
        return user ? JSON.parse(user) : null;
    });

    const [token, setToken] = useState(
        () => localStorage.getItem("nfe_token") || ""
    );

    const [notas, setNotas] = useState([]);
    const [funcionarios, setFuncionarios] = useState([]);
    const [busca, setBusca] = useState("");
    const [loading, setLoading] = useState(false);
    const [notasSelecionadas, setNotasSelecionadas] = useState([]);
    const [usuariosSelecionados, setUsuariosSelecionados] = useState([]);
    const [prioridade, setPrioridade] = useState("MEDIA");
    const [dialogFuncionario, setDialogFuncionario] = useState(false);
    const [funcionarioSelecionado, setFuncionarioSelecionado] = useState(null);
    const [buscaFuncionario, setBuscaFuncionario] = useState("");
    const [pagina, setPagina] = useState(1);
    const [totalPaginas, setTotalPaginas] = useState(1);
    const itensPorPagina = 20;

    const [snackbar, setSnackbar] = useState({
        open: false,
        severity: "success",
        message: ""
    });

    const logout = () => {
        localStorage.removeItem("nfe_token");
        localStorage.removeItem("user_info");

        setToken("");
        setUserInfo(null);

        navigate("/");
    };

    useEffect(() => {
        carregarDados();
    }, [pagina, busca]);

    async function carregarDados() {
        try {

            setLoading(true);

            const params = {
                page: pagina,
                data_inicio: "2025-01-01",
                data_fim: "2030-01-01",
                sort_by: "data_recebimento",
                sort_order: "DESC",
                status: "PENDENTE,EM_CONFERENCIA"
            };

            if (busca.trim()) {
                const valor = busca.trim();

                if (/^\d{44}$/.test(valor)) {
                    params.chave_acesso = valor;

                } else if (/^\d{14}$/.test(valor)) {
                    params.cnpj_emitente = valor;

                } else if (/^\d+$/.test(valor)) {
                    params.numero = valor;

                } else {
                    params.razao_social_emitente = valor;
                }
            }

            const [
                notasResponse,
                funcionariosResponse
            ] = await Promise.all([

                axios.get(
                    `${API_URL}/api/notas/listar`,
                    { params }
                ),

                axios.get(
                    `${API_URL}/api/funcionarios/listar`
                )

            ]);

            const funcionariosAtivos =
                funcionariosResponse.data.filter(
                    funcionario =>
                        funcionario.ativo === 1
                );

            const notasTratadas =
                (notasResponse.data.data || []).map(
                    nota => ({

                        ...nota,

                        usuarios_atribuidos:
                            nota.usuarios_atribuidos
                                ? JSON.parse(
                                    nota.usuarios_atribuidos
                                )
                                : []

                    })
                );

            setNotas(notasTratadas);
            setTotalPaginas(notasResponse.data.total_pages || 1);
            setFuncionarios(funcionariosAtivos);

        } catch (error) {

            console.error(error);

            setSnackbar({
                open: true,
                severity: "error",
                message:
                    "Erro ao carregar informações"
            });

        } finally {

            setLoading(false);

        }
    }

    function prioridadeColor(prioridade) {

        switch (prioridade) {

            case "URGENTE":
                return "error";

            case "ALTA":
                return "warning";

            case "MEDIA":
                return "info";

            case "BAIXA":
                return "success";

            default:
                return "default";
        }
    }

    function selecionarNota(id) {

        setNotasSelecionadas(prev =>
            prev.includes(id)
                ? prev.filter(n => n !== id)
                : [...prev, id]
        );
    }

    function selecionarUsuario(codigo) {

        setUsuariosSelecionados(prev =>
            prev.includes(codigo)
                ? prev.filter(
                    c => c !== codigo
                )
                : [...prev, codigo]
        );
    }

    async function atribuirNotas() {

        if (!notasSelecionadas.length) {

            setSnackbar({
                open: true,
                severity: "warning",
                message:
                    "Selecione ao menos uma nota"
            });

            return;
        }

        if (!usuariosSelecionados.length) {

            setSnackbar({
                open: true,
                severity: "warning",
                message:
                    "Selecione ao menos um conferente"
            });

            return;
        }

        try {

            setLoading(true);

            await Promise.all(

                notasSelecionadas.map(
                    notaId =>

                        axios.post(
                            `${API_URL}/api/notas/atribuir`,
                            {
                                nota_id: notaId,
                                usuarios:
                                    usuariosSelecionados,
                                prioridade,
                                atribuido_por:
                                    userInfo?.codigo
                            }
                        )
                )

            );

            setSnackbar({
                open: true,
                severity: "success",
                message:
                    "Notas atribuídas com sucesso"
            });

            setNotasSelecionadas([]);
            setUsuariosSelecionados([]);
            setPrioridade("MEDIA");

            carregarDados();

        } catch (error) {

            console.error(error);

            setSnackbar({
                open: true,
                severity: "error",
                message:
                    "Erro ao atribuir notas"
            });

        } finally {

            setLoading(false);

        }
    }

    async function removerAtribuicao(
        notaId
    ) {
        try {

            setLoading(true);

            await axios.put(
                `${API_URL}/api/notas/remover_atribuicao/${notaId}`
            );

            setSnackbar({
                open: true,
                severity: "success",
                message:
                    "Atribuição removida com sucesso"
            });

            carregarDados();

        } catch (error) {

            console.error(error);

            setSnackbar({
                open: true,
                severity: "error",
                message:
                    "Erro ao remover atribuição"
            });

        } finally {

            setLoading(false);

        }
    }

    const registrarLog = async ({
        nota,
        acao,
        observacao = null,
    }) => {

        try {

            const payload = {
                nota_id: nota.id ?? null,
                usuario: userInfo?.codigo,
                acao,
                observacoes: observacao
            };

            console.log("LOG ATRIBUICAO:", payload);

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

    const atribuicoesPorFuncionario =
        funcionarios
            .map(funcionario => ({

                ...funcionario,

                notas:
                    notas.filter(
                        nota =>
                            nota.usuarios_atribuidos?.includes(
                                funcionario.codigo
                            )
                    )

            }))
            .filter(
                funcionario =>
                    funcionario.notas.length > 0
            );

    const notasFiltradas =
        notas.filter(nota => {

            const termo =
                busca.toLowerCase();

            return (
                nota.numero
                    ?.toLowerCase()
                    .includes(termo)

                ||

                nota.fornecedor
                    ?.toLowerCase()
                    .includes(termo)

                ||

                nota.cnpj_emitente
                    ?.includes(termo)
            );
        });

    const notasAtribuidas =
        notas.filter(
            nota =>
                nota.usuarios_atribuidos?.length
        ).length;

    const notasSemAtribuicao =
        notas.length - notasAtribuidas;

    const conferentesComNotas =
        funcionarios.filter(funcionario =>

            notas.some(nota =>
                nota.usuarios_atribuidos?.includes(
                    funcionario.codigo
                )
            )

        ).length;

    const funcionariosMap = Object.fromEntries(
        funcionarios.map(f => [
            f.codigo,
            f.nome
        ])
    );

    const funcionariosFiltrados =
        funcionarios.filter(funcionario => {

            const termo =
                buscaFuncionario.toLowerCase();

            return (
                funcionario.nome
                    ?.toLowerCase()
                    .includes(termo)

                ||

                funcionario.codigo
                    ?.includes(termo)
            );
        });

    function calcularDiasPendentes(dataEmissao) {

        if (!dataEmissao) return 0;

        const data = new Date(
            dataEmissao
                .split("-")
                .reverse()
                .join("-")
        );

        return Math.floor(
            (new Date() - data) /
            (1000 * 60 * 60 * 24)
        );
    }

    return (
        <Container
            maxWidth="100%"
            sx={{
                mt: 4,
                bgcolor: "background.default"
            }}
        >
            <Box
                sx={{
                    display: "flex",
                    flexDirection: {
                        xs: "column",
                        md: "row"
                    },
                    justifyContent: "space-between",
                    alignItems: {
                        xs: "flex-start",
                        md: "center"
                    },
                    gap: 2,
                    p: 2,
                    bgcolor: "var(--azul)",
                    mb: 4,
                    borderRadius: "2vh"
                }}
            >
                <Typography
                    variant="h4"
                    sx={{
                        fontFamily: "Consolas",
                        color: "background.paper"
                    }}
                >
                    <strong>
                        Distribuição de Conferências
                    </strong>
                </Typography>

                <Box>
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "right"
                        }}
                    >
                        <PersonIcon
                            sx={{
                                color: "background.paper",
                                mr: 1
                            }}
                        />

                        <Typography
                            sx={{
                                color: "background.paper"
                            }}
                        >
                            {userInfo?.nome}
                        </Typography>

                        <Button
                            size="small"
                            onClick={logout}
                            sx={{
                                color: "background.paper"
                            }}
                        >
                            <LogoutIcon />
                        </Button>
                    </Box>

                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "right"
                        }}
                    >
                        <Button
                            onClick={() =>
                                navigate("/Dashboard")
                            }
                            sx={{
                                color: "background.paper"
                            }}
                        >
                            Voltar
                            <ArrowBackIcon sx={{ ml: 1 }} />
                        </Button>
                    </Box>

                </Box>
            </Box>

            <Grid
                container
                spacing={2}
                mb={3}
            >

                <Grid item xs={12} md={3}>
                    <Card sx={{ bgcolor: 'background.card' }}>
                        <CardContent>
                            <Typography
                                variant="h4"
                                color="primary"
                            >
                                {notas.length}
                            </Typography>

                            <Typography>
                                Notas Pendentes
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={3}>
                    <Card sx={{ bgcolor: 'background.card' }}>
                        <CardContent>
                            <Typography
                                variant="h4"
                                color="success.main"
                            >
                                {notasAtribuidas}
                            </Typography>

                            <Typography>
                                Atribuídas
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={3}>
                    <Card sx={{ bgcolor: 'background.card' }}>
                        <CardContent>
                            <Typography
                                variant="h4"
                                color="warning.main"
                            >
                                {notasSemAtribuicao}
                            </Typography>

                            <Typography>
                                Sem Atribuição
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={3}>
                    <Card sx={{ bgcolor: 'background.card' }}>
                        <CardContent>
                            <Typography
                                variant="h4"
                                color="secondary"
                            >
                                {conferentesComNotas}
                            </Typography>

                            <Typography>
                                Conferentes Ativos
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Card sx={{ mb: 3, bgcolor: 'background.card' }}>
                <CardContent>

                    <TextField
                        fullWidth
                        label="Buscar NF, fornecedor ou CNPJ"
                        value={busca}
                        onChange={(e) => {
                            setBusca(e.target.value);
                            setPagina(1);
                        }}
                    />

                </CardContent>
            </Card>

            <Grid container spacing={3}>

                <Grid size={{ xs: 12, md: 8 }}>
                    <Card
                        sx={{
                            bgcolor: "background.card",
                            mb: 3
                        }}
                    >
                        <CardContent>

                            <Typography
                                variant="h6"
                                gutterBottom
                            >
                                Notas Pendentes
                            </Typography>

                            <Divider sx={{ mb: 2 }} />

                            <Grid container spacing={2}>

                                {notas.map((nota) => {

                                    const diasPendentes =
                                        calcularDiasPendentes(
                                            nota.data_emissao
                                        );

                                    return (

                                        <Grid
                                            key={nota.id}
                                            size={{
                                                xs: 12,
                                                md: 6,
                                                xl: 4
                                            }}
                                        >
                                            <Card
                                                sx={{
                                                    height: "100%",
                                                    borderRadius: 3,
                                                    bgcolor: "background.alerta",
                                                    border: notasSelecionadas.includes(nota.id)
                                                        ? "2px solid"
                                                        : "1px solid",
                                                    borderColor: notasSelecionadas.includes(nota.id)
                                                        ? "primary.main"
                                                        : "divider",
                                                    transition: "all .2s ease",

                                                    "&:hover": {
                                                        transform: "translateY(-2px)",
                                                        boxShadow: 6
                                                    }
                                                }}
                                            >
                                                <CardContent>

                                                    <Box
                                                        display="flex"
                                                        justifyContent="space-between"
                                                        alignItems="flex-start"
                                                        mb={1}
                                                    >

                                                        <Checkbox
                                                            checked={
                                                                notasSelecionadas.includes(
                                                                    nota.id
                                                                )
                                                            }
                                                            onChange={() =>
                                                                selecionarNota(
                                                                    nota.id
                                                                )
                                                            }
                                                        />

                                                        <Chip sx={{
                                                            color: 'primary.branco',
                                                            bgcolor:
                                                                nota.status === "PENDENTE"
                                                                    ? 'primary.parcial'
                                                                    : nota.status === "EM_CONFERENCIA"
                                                                        ? 'primary.em_conferencia'
                                                                        : 'primary.default',
                                                        }}
                                                            size="small"
                                                            label={nota.status}
                                                        />
                                                    </Box>

                                                    <Typography
                                                        variant="h6"
                                                        fontWeight="bold"
                                                    >
                                                        NF {nota.numero}
                                                    </Typography>

                                                    <Typography
                                                        variant="caption"
                                                        color="text.secondary"
                                                    >
                                                        Série {nota.serie}
                                                    </Typography>

                                                    <Typography
                                                        sx={{
                                                            mt: 1,
                                                            minHeight: 48,
                                                            fontWeight: 500
                                                        }}
                                                    >
                                                        {nota.fornecedor}
                                                    </Typography>

                                                    <Divider sx={{ my: 1.5 }} />

                                                    <Box
                                                        display="flex"
                                                        flexDirection="column"
                                                        gap={0.5}
                                                    >
                                                        <Typography
                                                            variant="caption"
                                                            color="text.secondary"
                                                        >
                                                            CNPJ: {nota.cnpj_emitente}
                                                        </Typography>

                                                        <Typography
                                                            variant="caption"
                                                            color="text.secondary"
                                                        >
                                                            Recebimento: {nota.data_recebimento}
                                                        </Typography>
                                                    </Box>

                                                    {nota.observacao && (

                                                        <Typography
                                                            variant="caption"
                                                            display="block"
                                                            color="warning.main"
                                                            sx={{
                                                                mt: 1,
                                                                minHeight: 35
                                                            }}
                                                        >
                                                            {nota.observacao}
                                                        </Typography>

                                                    )}

                                                    <Box
                                                        mt={2}
                                                        display="flex"
                                                        gap={1}
                                                        flexWrap="wrap"
                                                    >
                                                        <Chip sx={{ color: 'primary.branco' }}
                                                            size="small"
                                                            label={(nota.prioridade ||
                                                                "SEM PRIORIDADE").toUpperCase()
                                                            }
                                                            color={prioridadeColor(
                                                                nota.prioridade
                                                            )}
                                                        />
                                                        <Chip sx={{ color: 'primary.branco' }}
                                                            size="small"
                                                            variant="contained"
                                                            label={`${diasPendentes} dia(s)`}
                                                            color={
                                                                diasPendentes > 7
                                                                    ? "error"
                                                                    : diasPendentes > 3
                                                                        ? "warning"
                                                                        : "success"
                                                            }
                                                        />
                                                    </Box>

                                                    {nota.usuarios_atribuidos?.length > 0 && (
                                                        <>
                                                            <Divider sx={{ my: 1.5 }} />

                                                            <Typography
                                                                variant="caption"
                                                                color="text.secondary"
                                                            >
                                                                Conferentes
                                                            </Typography>

                                                            <Box
                                                                mt={1}
                                                                display="flex"
                                                                gap={0.5}
                                                                flexWrap="wrap"
                                                            >
                                                                {nota.usuarios_atribuidos.map(
                                                                    codigo => (
                                                                        <Chip
                                                                            key={codigo}
                                                                            size="small"
                                                                            label={
                                                                                funcionariosMap[codigo] ||
                                                                                codigo
                                                                            }
                                                                        />
                                                                    )
                                                                )}
                                                            </Box>
                                                        </>
                                                    )}

                                                </CardContent>
                                            </Card>
                                        </Grid>

                                    );
                                })}
                            </Grid>
                        </CardContent>
                    </Card>
                    <Box
                        display="flex"
                        justifyContent="center"
                        mt={3} mb={3}
                    >
                        <Pagination
                            page={pagina}
                            count={totalPaginas}
                            color="primary"
                            size="large"
                            onChange={(_, value) =>
                                setPagina(value)
                            }
                            sx={{
                                "& .MuiPaginationItem-root": {
                                    color: "text.primary"
                                }
                            }}
                        />
                    </Box>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                    <Card sx={{ bgcolor: 'background.card' }}>
                        <CardContent>

                            <Typography
                                variant="h6"
                                gutterBottom
                            >
                                Atribuição
                            </Typography>

                            <Divider sx={{ mb: 2 }} />

                            <Typography mb={1}>
                                Conferentes
                            </Typography>

                            <TextField
                                fullWidth
                                size="small"
                                placeholder="Buscar conferente..."
                                value={buscaFuncionario}
                                onChange={(e) =>
                                    setBuscaFuncionario(
                                        e.target.value
                                    )
                                }
                                sx={{ mb: 2 }} />

                            <FormGroup
                                sx={{
                                    maxHeight: 350,
                                    overflow: "auto"
                                }}
                            >

                                {funcionariosFiltrados.map(
                                    funcionario => (
                                        <FormControlLabel
                                            key={
                                                funcionario.codigo
                                            }
                                            control={
                                                <Checkbox
                                                    checked={usuariosSelecionados.includes(
                                                        funcionario.codigo
                                                    )}
                                                    onChange={() =>
                                                        selecionarUsuario(
                                                            funcionario.codigo
                                                        )
                                                    }
                                                />
                                            }
                                            label={`${funcionario.nome} (${funcionario.codigo})`}
                                        />
                                    )
                                )}

                            </FormGroup>

                            <Box mt={3}>

                                <FormControl fullWidth>

                                    <InputLabel>
                                        Prioridade
                                    </InputLabel>

                                    <Select
                                        value={prioridade}
                                        label="Prioridade"
                                        onChange={(e) =>
                                            setPrioridade(
                                                e.target.value
                                            )
                                        }
                                        MenuProps={{
                                            PaperProps: {
                                                sx: {
                                                    bgcolor: "background.alerta",

                                                    "& .MuiMenuItem-root": {
                                                        bgcolor: "background.alerta",
                                                        color: "text.primary"
                                                    },

                                                    "& .MuiMenuItem-root:hover": {
                                                        bgcolor: "primary.card"
                                                    },

                                                    "& .Mui-selected": {
                                                        bgcolor: "primary.main"
                                                    }
                                                }
                                            }
                                        }}
                                    >
                                        <MenuItem value="URGENTE">
                                            URGENTE
                                        </MenuItem>

                                        <MenuItem value="ALTA">
                                            ALTA
                                        </MenuItem>

                                        <MenuItem value="MEDIA">
                                            MÉDIA
                                        </MenuItem>

                                        <MenuItem value="BAIXA">
                                            BAIXA
                                        </MenuItem>
                                    </Select>
                                </FormControl>
                            </Box>

                            <Button
                                fullWidth
                                variant="contained"
                                sx={{ mt: 3 }}
                                onClick={atribuirNotas}
                            >
                                ATRIBUIR NOTAS
                            </Button>

                        </CardContent>
                    </Card>
                    <Card sx={{ mt: 3, bgcolor: 'background.card' }}>
                        <CardContent>

                            <Typography
                                variant="h6"
                                gutterBottom
                            >
                                Gestão de Atribuições
                            </Typography>

                            <Divider sx={{ mb: 2 }} />

                            {atribuicoesPorFuncionario.length === 0 && (

                                <Typography
                                    color="text.secondary"
                                >
                                    Nenhuma atribuição encontrada
                                </Typography>

                            )}

                            {atribuicoesPorFuncionario.map(
                                funcionario => (

                                    <Box
                                        key={funcionario.codigo}
                                        sx={{
                                            border:
                                                "1px solid #ddd",
                                            borderRadius: 2,
                                            p: 2,
                                            mb: 2
                                        }}
                                    >

                                        <Box
                                            display="flex"
                                            justifyContent="space-between"
                                            alignItems="center"
                                        >

                                            <Box>

                                                <Typography
                                                    fontWeight="bold"
                                                >
                                                    {funcionario.nome}
                                                </Typography>

                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                >
                                                    Código:
                                                    {" "}
                                                    {funcionario.codigo}
                                                </Typography>

                                            </Box>

                                            <Box
                                                display="flex"
                                                gap={2}
                                                alignItems="center"
                                            >

                                                <Chip
                                                    color="primary"
                                                    label={`${funcionario.notas.length} notas`}
                                                />

                                                <Button
                                                    variant="outlined"
                                                    onClick={() => {

                                                        setFuncionarioSelecionado(
                                                            funcionario
                                                        );

                                                        setDialogFuncionario(
                                                            true
                                                        );

                                                    }}
                                                >
                                                    Ver Notas
                                                </Button>

                                            </Box>

                                        </Box>

                                    </Box>

                                )
                            )}

                        </CardContent>
                    </Card>
                </Grid>
            </Grid>



            <Dialog
                open={dialogFuncionario}
                onClose={() =>
                    setDialogFuncionario(false)
                }
                maxWidth="md"
                fullWidth
                slotProps={{
                    paper: {
                        sx: {
                            bgcolor: "background.card",
                            color: "text.primary",
                        }
                    }
                }}
            >

                <DialogTitle>

                    Notas atribuídas

                    <Typography
                        variant="body2"
                        color="text.secondary"
                    >
                        {funcionarioSelecionado?.nome}
                    </Typography>

                </DialogTitle>

                <DialogContent>

                    {funcionarioSelecionado?.notas?.map(
                        nota => (

                            <Card
                                key={nota.id}
                                sx={{
                                    mb: 2,
                                    bgcolor: 'background.alerta'
                                }}
                            >

                                <CardContent>

                                    <Box
                                        display="flex"
                                        justifyContent="space-between"
                                        alignItems="center"
                                    >

                                        <Box>

                                            <Typography
                                                fontWeight="bold"
                                            >
                                                NF {nota.numero}
                                            </Typography>

                                            <Typography
                                                variant="body2"
                                            >
                                                {
                                                    nota.fornecedor
                                                }
                                            </Typography>

                                        </Box>

                                        <Box
                                            display="flex"
                                            gap={1}
                                        >

                                            <Chip
                                                label={
                                                    nota.prioridade ||
                                                    "SEM PRIORIDADE"
                                                }
                                                color={prioridadeColor(
                                                    nota.prioridade
                                                )}
                                            />

                                            <Button
                                                color="error"
                                                variant="outlined"
                                                onClick={() => {
                                                    removerAtribuicao(nota.id)
                                                    setDialogFuncionario(false);
                                                }}
                                            >
                                                Remover
                                            </Button>

                                        </Box>

                                    </Box>

                                </CardContent>

                            </Card>

                        )
                    )}

                </DialogContent>

                <DialogActions>

                    <Button
                        onClick={() =>
                            setDialogFuncionario(false)
                        }
                    >
                        Fechar
                    </Button>

                </DialogActions>

            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() =>
                    setSnackbar(prev => ({
                        ...prev,
                        open: false
                    }))
                }
            >
                <Alert
                    severity={snackbar.severity}
                    variant="filled"
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>

            {loading && (

                <Box
                    position="fixed"
                    top={0}
                    left={0}
                    right={0}
                    bottom={0}
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    bgcolor="rgba(0,0,0,0.4)"
                    zIndex={9999}
                >

                    <CircularProgress />

                </Box>

            )}
        </Container>
    );
}