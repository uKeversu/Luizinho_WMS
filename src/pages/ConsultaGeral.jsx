import { useState, useContext, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import {
    Container,
    Typography,
    Card,
    CardContent,
    TextField,
    Button,
    Box,
    CircularProgress,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Chip,
    Grid,
    Paper
} from "@mui/material";

import Collapse from "@mui/material/Collapse";
import { Fragment } from "react";

import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import RuleIcon from '@mui/icons-material/Rule';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import WarningIcon from '@mui/icons-material/Warning';
import SearchIcon from '@mui/icons-material/Search';

import { ThemeContext } from "../context/ThemeContext";

import '../style/App.css';

function ConsultaGeral() {

    const { dark } = useContext(ThemeContext);

    const navigate = useNavigate();

    const API = "http://192.168.1.185:8077";

    // LOGIN
    const [userInfo, setUserInfo] = useState(() => {
        const user = localStorage.getItem("user_info");
        return user ? JSON.parse(user) : null;
    });

    const [token, setToken] = useState(
        () => localStorage.getItem("nfe_token") || ""
    );

    const logout = () => {

        setToken("");
        setUserInfo(null);

        localStorage.removeItem("nfe_token");
        localStorage.removeItem("user_info");
    };

    // SISTEMA
    const [notas, setNotas] = useState([]);
    const cacheNotas = useRef({});
    const [loading, setLoading] = useState(false);

    const [logsNotas, setLogsNotas] = useState({});
    const [loadingLogs, setLoadingLogs] = useState({});
    const cacheLogs = useRef({});

    const [busca, setBusca] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [numeroNota, setNumeroNota] = useState("");
    const [razaoSocial, setRazaoSocial] = useState("");
    const [cnpjEmitente, setCnpjEmitente] = useState("");
    const [funcionarios, setFuncionarios] = useState({});

    const [expandedNota, setExpandedNota] = useState(null);
    const [expandedItem, setExpandedItem] = useState(null);

    const [unidadesItem, setUnidadesItem] = useState({});
    const [loadingItens, setLoadingItens] = useState({});
    const [loadingUnidades, setLoadingUnidades] = useState({});

    const cacheBasico = useRef({});
    const cacheUnidades = useRef({});

    // Refs de buscas
    const dataInicioRef = useRef(null);

    const dataFimRef = useRef(null);

    const buscaRef = useRef(null);

    // DATAS
    const hoje = new Date();

    const dataFimPadrao =
        hoje.toISOString().split("T")[0];

    const dataInicioObj = new Date();

    dataInicioObj.setDate(
        dataInicioObj.getDate() - 30
    );

    const dataInicioPadrao =
        dataInicioObj.toISOString().split("T")[0];

    const [dataInicio, setDataInicio] =
        useState(dataInicioPadrao);

    const [dataFim, setDataFim] =
        useState(dataFimPadrao);

    // Busca nome dos funcionarios
    useEffect(() => {

        const carregarFuncionarios = async () => {

            const response = await fetch(
                `${API}/api/funcionarios/listar`
            );

            const data = await response.json();

            const mapa = {};

            data.forEach(f => {
                mapa[String(f.codigo)] = f.nome;
            });

            setFuncionarios(mapa);
        };

        carregarFuncionarios();

    }, []);

    // Focus no input de buscar produto
    useEffect(() => {

        buscaRef.current?.focus();

    }, []);

    // HELPERS
    const contains = (valor, termo) => {

        if (!valor) return false;

        return valor
            .toString()
            .toLowerCase()
            .includes(termo);
    };

    const formatarData = (data) => {
        if (!data) return "-";

        return new Date(data).toLocaleString("pt-BR");
    };

    const formatarDataLog = (data) => {
        if (!data) return "";

        const date = new Date(data);
        date.setHours(date.getHours() - 3);

        return date.toLocaleString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        });
    };

    // STATUS
    const getDescricaoStatus = (status) => {

        switch (status) {

            case "PENDENTE":
                return "Pendente";

            case "ITEM_CONFERIDO":
                return "Conferido";

            case "CONFERIDO_PARCIAL":
                return "Parcial";

            case "ITEM_GUARDADO":
                return "Guardado";

            case "ITEM_VENDIDO":
                return "Vendido";

            case "ITEM_DEVOLVIDO":
                return "Devolvido";

            default:
                return "Desconhecido";
        }
    };

    const getIconStatus = (status) => {

        switch (status) {

            case "PENDENTE":
                return (
                    <WarningIcon
                        sx={{
                            color: 'primary.pendentes'
                        }}
                    />
                );

            case "ITEM_CONFERIDO":
                return (
                    <FactCheckIcon color="primary" />
                );

            case "CONFERIDO_PARCIAL":
                return (
                    <RuleIcon
                        sx={{
                            color: 'primary.parcial'
                        }}
                    />
                );

            case "ITEM_GUARDADO":
                return (
                    <WarehouseIcon color="success" />
                );

            case "ITEM_VENDIDO":
                return (
                    <ShoppingCartIcon color="secondary" />
                );

            default:
                return <WarehouseIcon />;
        }
    };

    const getCorStatusNota = (status) => {
        switch (status) {
            case "EM_TRANSITO":
                return "primary.guardado";

            case "PENDENTE":
                return "primary.parcial";

            case "EM_CONFERENCIA":
                return "primary.em_conferencia";

            case "CONFERIDA":
                return "primary.conferidos";

            case "GUARDADA":
                return "primary.guardado";

            default:
                return "#616161";
        }
    };

    // BUSCAR NOTAS
    const buscarNotas = async () => {
        setLoading(true);

        try {
            const params = new URLSearchParams();

            params.append("data_inicio", dataInicio);
            params.append("data_fim", dataFim);
            params.append("page", page);

            if (busca.trim()) {
                params.append("basico", busca.trim());
            }

            const response = await fetch(
                `${API}/api/itens_nfe/consulta?${params}`
            );

            const data = await response.json();
            const itens = data.items || [];

            setTotalPages(data.total_pages || 1);

            if (!itens.length) {
                setNotas([]);
                return;
            }

            const agrupadas = {};

            itens.forEach(item => {
                const notaId = item.nfe_id;

                if (!agrupadas[notaId]) {
                    agrupadas[notaId] = {
                        id: notaId,

                        numero: item.nfe_numero || "-",
                        serie: item.nfe_serie || "-",

                        fornecedor: item.fornecedor || "-",

                        status: item.status,
                        observacao: item.nfe_observacao,

                        data_recebimento:
                            item.nfe_created_at || item.created_at,

                        itens: []
                    };
                }

                agrupadas[notaId].itens.push(item);
            });

            const listaFinal = Object.values(agrupadas).sort(
                (a, b) =>
                    new Date(b.data_recebimento).getTime() -
                    new Date(a.data_recebimento).getTime()
            );

            setNotas(listaFinal);

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const buscarLogsNota = async (notaId) => {

        if (cacheLogs.current[notaId]) {
            setLogsNotas(prev => ({
                ...prev,
                [notaId]: cacheLogs.current[notaId]
            }));
            return;
        }

        setLoadingLogs(prev => ({
            ...prev,
            [notaId]: true
        }));

        try {

            const response = await fetch(
                `${API}/api/nfe/item/movimentacao/log?nota_id=${notaId}`
            );

            const data = await response.json();

            cacheLogs.current[notaId] = data.logs || [];

            setLogsNotas(prev => ({
                ...prev,
                [notaId]: data.logs || []
            }));

        } finally {

            setLoadingLogs(prev => ({
                ...prev,
                [notaId]: false
            }));
        }
    };

    const getLogConferencia = (notaId, item) => {

        const logs = logsNotas[notaId] || [];

        return logs
            .filter(log =>
                log.acao === "Escaneou item" &&
                (
                    log.cod_barras?.trim() === item.cean?.trim() ||
                    log.cod_produto?.trim() === item.cod_produto?.trim()
                )
            )
            .sort((a, b) =>
                new Date(b.data_hora) - new Date(a.data_hora)
            )[0];
    };

    // UNIDADES
    const buscarUnidades = async (itemId) => {

        if (!itemId) return;

        if (cacheUnidades.current[itemId]) {
            setUnidadesItem(prev => ({
                ...prev,
                [itemId]: cacheUnidades.current[itemId]
            }));
            return;
        }

        setLoadingUnidades(prev => ({
            ...prev,
            [itemId]: true
        }));

        try {

            const response = await fetch(
                `${API}/api/reimpressao/unidades/${itemId}`
            );

            const data = await response.json();

            const lista = data.unidades || [];

            cacheUnidades.current[itemId] = lista;

            setUnidadesItem(prev => ({
                ...prev,
                [itemId]: lista
            }));

        } finally {

            setLoadingUnidades(prev => ({
                ...prev,
                [itemId]: false
            }));

        }
    };

    const handleExpandItem = (
        notaId,
        itemId
    ) => {

        const key = itemId;

        const novo =
            expandedItem === key
                ? null
                : key;

        setExpandedItem(novo);

        if (novo) {
            buscarUnidades(itemId)
        }
    };

    const isItemBuscado = (item) => {

        if (!busca) return false;

        const termo =
            busca.toLowerCase();

        return (
            contains(
                item.descricao,
                termo
            )
            ||
            contains(
                item.cean,
                termo
            )
            ||
            contains(
                item.cod_produto,
                termo
            )
            ||
            contains(
                item.basico,
                termo
            )
        );
    };

    const navegarCampos = (e, proximoRef, anteriorRef, acaoEnter) => {

        switch (e.key) {

            case "ArrowRight":
            case "ArrowDown":

                e.preventDefault();

                proximoRef?.current?.focus();

                break;

            case "ArrowLeft":
            case "ArrowUp":

                e.preventDefault();

                anteriorRef?.current?.focus();

                break;

            case "Enter":

                e.preventDefault();

                if (acaoEnter) {

                    acaoEnter();

                } else {

                    proximoRef?.current?.focus();
                }

                break;

            default:
                break;
        }
    };

    return (

        <Container
            maxWidth="100%"
            sx={{
                mt: 4,
                bgcolor: "background.default"
            }}
        >

            {/* HEADER */}
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
                    zoom: 0.9
                }}
            >
                <Typography
                    variant="h4"
                    sx={{
                        fontFamily: 'Consolas',
                        color: "background.paper"
                    }}
                >
                    <strong>
                        Consulta Geral
                    </strong>
                </Typography>

                <Box>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'right'
                        }}
                    >

                        <PersonIcon
                            sx={{
                                color: "background.paper",
                                pr: 1
                            }}
                        />

                        <Typography
                            sx={{
                                color: "background.paper",
                                fontSize: '0.9rem'
                            }}
                        >
                            {userInfo?.nome}
                        </Typography>

                        {token && (

                            <Button
                                size="small"
                                onClick={logout}
                                sx={{
                                    color: "background.paper"
                                }}
                            >
                                <LogoutIcon />
                            </Button>
                        )}
                    </Box>

                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'right'
                        }}
                    >

                        <Button
                            onClick={() =>
                                navigate("/Dashboard")
                            }
                            sx={{
                                color: "background.paper",
                                gap: 1, mr: 2
                            }}
                        >
                            Voltar
                            <ArrowBackIcon />
                        </Button>
                    </Box>
                </Box>
            </Box>

            {/* FILTRO */}
            <Paper
                elevation={0}
                sx={{
                    p: 3,
                    mb: 4,
                    borderRadius: '2vh',
                    bgcolor: 'background.alerta',
                    border: dark
                        ? '1px solid rgba(255,255,255,0.08)'
                        : '1px solid rgba(0,0,0,0.08)',
                    zoom: '0.9'
                }}
            >

                <Grid
                    container
                    spacing={2}
                    alignItems="center"
                >

                    <Grid item xs={12} md={5}>

                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Buscar por produto"

                            inputRef={buscaRef}

                            value={busca}

                            onChange={(e) =>
                                setBusca(e.target.value)
                            }

                            onKeyDown={(e) =>
                                navegarCampos(
                                    e,
                                    dataInicioRef,
                                    null
                                )
                            }
                            autoComplete="off"
                            inputProps={{
                                spellCheck: false,
                                autoCorrect: "off",
                                autoCapitalize: "off",
                            }}
                            InputProps={{
                                startAdornment: (
                                    <SearchIcon
                                        sx={{
                                            mr: 1,
                                            color: 'text.secondary'
                                        }}
                                    />
                                )
                            }}
                            sx={{ minWidth: "80vh" }}
                        />

                    </Grid>

                    <Grid item xs={12} md={2}>

                        <TextField
                            fullWidth
                            type="date"
                            size="small"

                            inputRef={dataInicioRef}

                            value={dataInicio}

                            onChange={(e) =>
                                setDataInicio(
                                    e.target.value
                                )
                            }

                            onKeyDown={(e) =>
                                navegarCampos(
                                    e,
                                    dataFimRef,
                                    buscaRef
                                )
                            }
                        />

                    </Grid>

                    <Grid item xs={12} md={2}>

                        <TextField
                            fullWidth
                            type="date"
                            size="small"

                            inputRef={dataFimRef}

                            value={dataFim}

                            onChange={(e) =>
                                setDataFim(
                                    e.target.value
                                )
                            }

                            onKeyDown={(e) =>
                                navegarCampos(
                                    e,
                                    null,
                                    dataInicioRef,
                                    buscarNotas
                                )
                            }
                        />

                    </Grid>

                    <Grid item xs={12} md={3}>

                        <Button
                            fullWidth
                            variant="contained"
                            size="large"
                            startIcon={<SearchIcon />}
                            onClick={buscarNotas}
                            sx={{
                                height: '40px'
                            }}
                        >
                            Buscar Item
                        </Button>

                    </Grid>

                </Grid>
            </Paper>

            {/* LOADING */}
            {loading ? (

                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        mt: 10
                    }}
                >
                    <CircularProgress />
                </Box>

            ) : (

                notas.map((nota) => (

                    <Card
                        key={nota.id}

                        sx={{
                            mb: 2,
                            borderRadius: '2vh',
                            boxShadow:
                                '0vh 0.1vh 0.5vh var(--sombra)',
                            bgcolor: 'background.alerta'
                        }}
                    >

                        <CardContent>

                            {/* HEADER NOTA */}
                            <Box

                                onClick={async () => {

                                    const expandindo =
                                        expandedNota !== nota.id;

                                    setExpandedNota(
                                        expandindo
                                            ? nota.id
                                            : null
                                    );
                                    if (expandindo) {
                                        buscarLogsNota(nota.id);
                                    }
                                }}

                                sx={{
                                    cursor: "pointer"
                                }}
                            >

                                <Box
                                    sx={{
                                        display: 'flex',
                                        justifyContent:
                                            'space-between',
                                        alignItems: 'center'
                                    }}
                                >

                                    <Box>

                                        <Typography
                                            fontWeight="bold"
                                        >
                                            📄 {nota.numero}/{nota.serie}
                                        </Typography>

                                        <Typography
                                            fontSize={'0.85rem'}
                                        >
                                            {nota.fornecedor}
                                        </Typography>

                                        {nota.observacao &&
                                            nota.observacao !== "null" &&
                                            nota.observacao.trim() !== "" && (
                                                <Typography
                                                    fontSize={'0.85rem'}
                                                    sx={{ color: 'primary.observacao' }}
                                                >
                                                    Obs: {nota.observacao}
                                                </Typography>
                                            )
                                        }
                                    </Box>
                                    <Box>
                                        <Chip
                                            label={nota.status}
                                            size="small"
                                            sx={{
                                                p: 1,
                                                m: 2,
                                                bgcolor: getCorStatusNota(nota.status),
                                                color: "primary.branco",
                                                fontWeight: "bold"
                                            }}
                                        />
                                        <Chip
                                            label={formatarData(nota.data_recebimento)}
                                            size="small"
                                            sx={{ padding: 1, margin: 2 }}
                                        />
                                    </Box>
                                </Box>
                            </Box>

                            {/* ITENS */}
                            <Collapse
                                in={
                                    expandedNota === nota.id
                                }
                            >
                                <Box sx={{ mt: 2 }}>
                                    {loadingItens[nota.id] ? (
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                justifyContent:
                                                    'center',
                                                p: 3
                                            }}
                                        >
                                            <CircularProgress
                                                size={25}
                                            />
                                        </Box>
                                    ) : (
                                        <>
                                            {!nota.itens ||
                                                nota.itens.length === 0 ? (
                                                <Typography>
                                                    Nenhum item encontrado
                                                </Typography>
                                            ) : (
                                                <Table size="small">
                                                    <TableHead>
                                                        <TableRow>
                                                            <TableCell>
                                                                LOC
                                                            </TableCell>

                                                            <TableCell>
                                                                Código
                                                            </TableCell>

                                                            <TableCell>
                                                                Descrição
                                                            </TableCell>

                                                            <TableCell>
                                                                Qtd
                                                            </TableCell>

                                                            <TableCell>
                                                                Status
                                                            </TableCell>

                                                            <TableCell>
                                                                Caixa
                                                            </TableCell>

                                                        </TableRow>

                                                    </TableHead>

                                                    <TableBody>

                                                        {nota.itens.map(
                                                            (
                                                                item,
                                                                idx
                                                            ) => {

                                                                const cod =
                                                                    item.cean
                                                                    ??
                                                                    item.codire
                                                                    ??
                                                                    item.cod_produto
                                                                    ??
                                                                    `idx-${idx}`;

                                                                const key = item.id;

                                                                return (

                                                                    <Fragment
                                                                        key={key}
                                                                    >

                                                                        {/* ITEM */}
                                                                        <TableRow

                                                                            onClick={(e) => {

                                                                                e.stopPropagation();

                                                                                handleExpandItem(
                                                                                    nota.id,
                                                                                    item.id
                                                                                );
                                                                            }}

                                                                            sx={{
                                                                                cursor:
                                                                                    "pointer",

                                                                                backgroundColor:
                                                                                    isItemBuscado(item)
                                                                                        ? 'primary.achouItem'
                                                                                        : 'inherit',

                                                                                transition:
                                                                                    '0.2s'
                                                                            }}
                                                                        >

                                                                            <TableCell>
                                                                                {item.loc_sistema}
                                                                            </TableCell>

                                                                            <TableCell>
                                                                                {item.basico}
                                                                            </TableCell>

                                                                            <TableCell>
                                                                                {item.descricao}
                                                                            </TableCell>

                                                                            <TableCell>
                                                                                {item.qtd_conferida ?? 0}/
                                                                                {Number(item.quantidade_comercial)}
                                                                            </TableCell>

                                                                            <TableCell>

                                                                                <Box
                                                                                    sx={{
                                                                                        display: 'flex',
                                                                                        alignItems: 'center',
                                                                                        gap: 1
                                                                                    }}
                                                                                >

                                                                                    {getIconStatus(
                                                                                        item.status_item
                                                                                    )}

                                                                                    {getDescricaoStatus(
                                                                                        item.status_item
                                                                                    )}

                                                                                </Box>

                                                                            </TableCell>

                                                                            <TableCell>
                                                                                {!item.caixa || item.caixa === "0"
                                                                                    ? "Sem caixa"
                                                                                    : item.caixa}
                                                                            </TableCell>

                                                                        </TableRow>

                                                                        {/* UNIDADES */}
                                                                        <TableRow>

                                                                            <TableCell
                                                                                colSpan={6}
                                                                                sx={{
                                                                                    p: 0,
                                                                                    border: 0
                                                                                }}
                                                                            >

                                                                                <Collapse
                                                                                    in={
                                                                                        expandedItem === key
                                                                                    }
                                                                                >

                                                                                    <Box
                                                                                        sx={{
                                                                                            p: 2,
                                                                                            bgcolor:
                                                                                                'background.tabela'
                                                                                        }}
                                                                                    >

                                                                                        {loadingUnidades[item.id] ? (


                                                                                            <Box
                                                                                                sx={{
                                                                                                    display: 'flex',
                                                                                                    justifyContent:
                                                                                                        'center'
                                                                                                }}
                                                                                            >
                                                                                                <CircularProgress
                                                                                                    size={25}
                                                                                                />
                                                                                            </Box>

                                                                                        ) : (

                                                                                            <Table
                                                                                                size="small"
                                                                                            >

                                                                                                <TableHead>

                                                                                                    <TableRow>

                                                                                                        <TableCell>
                                                                                                            ID ÚNICO
                                                                                                        </TableCell>

                                                                                                        <TableCell>
                                                                                                            ITEM
                                                                                                        </TableCell>

                                                                                                        <TableCell>
                                                                                                            STATUS
                                                                                                        </TableCell>

                                                                                                        <TableCell>
                                                                                                            DATA
                                                                                                        </TableCell>

                                                                                                        <TableCell>
                                                                                                            FUNCIONÁRIO
                                                                                                        </TableCell>

                                                                                                        <TableCell>
                                                                                                            RASTREIO
                                                                                                        </TableCell>

                                                                                                    </TableRow>

                                                                                                </TableHead>

                                                                                                <TableBody>

                                                                                                    {(unidadesItem[item.id] || []).map((un) => {

                                                                                                        const log = getLogConferencia(nota.id, item);

                                                                                                        return (
                                                                                                            <TableRow key={un.id_unico}>

                                                                                                                <TableCell>
                                                                                                                    {un.id_unico}
                                                                                                                </TableCell>

                                                                                                                <TableCell>
                                                                                                                    {un.basico}
                                                                                                                </TableCell>

                                                                                                                <TableCell>
                                                                                                                    {item.status_item}
                                                                                                                </TableCell>

                                                                                                                <TableCell>
                                                                                                                    {log ? formatarDataLog(log.data_hora) : "-"}
                                                                                                                </TableCell>

                                                                                                                <TableCell>
                                                                                                                    {log
                                                                                                                        ? funcionarios[log.usuario] || log.usuario
                                                                                                                        : "Sem conferente"}
                                                                                                                </TableCell>

                                                                                                                <TableCell>
                                                                                                                    <Button
                                                                                                                        disabled
                                                                                                                        onClick={() =>
                                                                                                                            navigate(`/Rastreio/${un.id_unico}`)
                                                                                                                        }
                                                                                                                    >
                                                                                                                        Histórico
                                                                                                                    </Button>
                                                                                                                </TableCell>

                                                                                                            </TableRow>
                                                                                                        );
                                                                                                    })}
                                                                                                </TableBody>

                                                                                            </Table>
                                                                                        )}
                                                                                    </Box>

                                                                                </Collapse>

                                                                            </TableCell>

                                                                        </TableRow>

                                                                    </Fragment>
                                                                );
                                                            }
                                                        )}

                                                    </TableBody>

                                                </Table>
                                            )}
                                        </>
                                    )}
                                </Box>

                            </Collapse>

                        </CardContent>

                    </Card>
                ))
            )}
        </Container>
    );
}

export default ConsultaGeral;