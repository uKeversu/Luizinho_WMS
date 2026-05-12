import { useState, useContext, useRef } from "react";
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
    TableContainer,
    TableHead,
    TableRow
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

import { ThemeContext } from "../context/ThemeContext";
import '../style/App.css';

function ConsultaGeral() {

    // Tema noturno
    const { dark, toggleTheme } = useContext(ThemeContext);

    // Acessar outras pages
    const navigate = useNavigate();

    // API BASE
    const API = "http://192.168.1.185:8077";

    // Login
    const [userInfo, setUserInfo] = useState(() => {
        const user = localStorage.getItem("user_info");
        return user ? JSON.parse(user) : null;
    });
    const [token, setToken] = useState(() => localStorage.getItem("nfe_token") || "");

    const logout = () => {
        setToken("");
        setUserInfo(null);
        localStorage.removeItem("nfe_token");
        localStorage.removeItem("user_info");
    };

    // Sistema
    const [notas, setNotas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingItens, setLoadingItens] = useState({});
    const [modoBuscaItem, setModoBuscaItem] = useState(false);
    const [busca, setBusca] = useState("");
    const [dataInicio, setDataInicio] = useState("");
    const [dataFim, setDataFim] = useState("");

    const [expandedNota, setExpandedNota] = useState(null);
    const [expandedItem, setExpandedItem] = useState(null);
    const [unidadesItem, setUnidadesItem] = useState({});
    const [loadingUnidades, setLoadingUnidades] = useState({});
    const cacheBasico = useRef({});

    const buscarNotas = async () => {

        if (!busca && !dataInicio && !dataFim) return;

        setLoading(true);

        try {

            const params = new URLSearchParams();

            if (dataInicio) {
                params.append("data_inicio", dataInicio);
            }

            if (dataFim) {
                params.append("data_fim", dataFim);
            }

            const response = await fetch(
                `${API}/api/notas/listar?${params.toString()}`
            );

            const data = await response.json();

            const notasArray = Array.isArray(data)
                ? data
                : [];

            const termo = busca.trim().toLowerCase();

            // SEM BUSCA
            if (!termo) {

                const notasSemItens = notasArray.map(n => ({
                    ...n,
                    itens: null
                }));

                notasSemItens.sort(
                    (a, b) =>
                        parseDataBR(b.data_recebimento) -
                        parseDataBR(a.data_recebimento)
                );

                setModoBuscaItem(false);
                setNotas(notasSemItens);

                return;
            }

            // COM BUSCA
            setModoBuscaItem(true);

            const notasFiltradas = [];

            for (const nota of notasArray) {

                try {

                    const respItens = await fetch(
                        `${API}/api/itens_nfe/${nota.id}`
                    );

                    const dataItens = await respItens.json();

                    const itensMatch = [];

                    for (const item of (dataItens.items || [])) {

                        const codigo =
                            item.codigo_barras ||
                            item.cean ||
                            item.cod_produto;

                        const basico =
                            await buscarBasico(codigo);

                        const match =
                            contains(item.descricao, termo) ||
                            contains(item.codigo_barras, termo) ||
                            contains(item.cod_produto, termo) ||
                            contains(basico, termo);

                        if (match) {

                            itensMatch.push({
                                ...item,
                                basico
                            });
                        }
                    }

                    // Só adiciona nota com item encontrado
                    if (itensMatch.length > 0) {

                        notasFiltradas.push({

                            ...nota,

                            // Já deixa itens filtrados
                            itens: itensMatch
                        });
                    }

                } catch (err) {

                    console.error(err);
                }
            }

            notasFiltradas.sort(
                (a, b) =>
                    parseDataBR(b.data_recebimento) -
                    parseDataBR(a.data_recebimento)
            );

            setNotas(notasFiltradas);

        } catch (err) {

            console.error(err);

        } finally {

            setLoading(false);
        }
    };

    const buscarItensNota = async (notaId) => {

        try {

            const response = await fetch(
                `${API}/api/itens_nfe/${notaId}`
            );

            const data = await response.json();

            const itens = await Promise.all(
                (data.items || []).map(async (item) => {

                    const codigo =
                        item.codigo_barras ||
                        item.cean ||
                        item.cod_produto;

                    const basico = await buscarBasico(codigo);

                    return {
                        ...item,
                        basico
                    };
                })
            );

            setNotas(prev =>
                prev.map(n =>
                    n.id === notaId
                        ? { ...n, itens }
                        : n
                )
            );

        } catch (err) {

            console.error(err);
        }
    };

    const buscarBasico = async (codigo) => {
        if (!codigo) return "-";

        if (cacheBasico.current[codigo]) {
            return cacheBasico.current[codigo];
        }

        try {
            const res = await fetch(`${API}/api/nfe/unidades/nao_impressas/codire/${codigo}`);
            const data = await res.json();

            const basico = data.unidades?.[0]?.basico || "-";

            cacheBasico.current[codigo] = basico;

            return basico;
        } catch {
            return "-";
        }
    };

    const getDescricaoStatus = (status) => {
        switch (status) {
            case "PENDENTE": return "Pendente";
            case "ITEM_CONFERIDO": return "Conferido";
            case "CONFERIDO_PARCIAL": return "Parcial";
            case "ITEM_GUARDADO": return "Guardado";
            case "ITEM_VENDIDO": return "Vendido";
            case "ITEM_DEVOLVIDO": return "Devolvido";
            default: return "Desconhecido";
        }
    };

    const getIconStatus = (status) => {
        switch (status) {
            case "PENDENTE": return <WarningIcon sx={{ color: 'primary.pendentes' }} />;
            case "ITEM_CONFERIDO": return <FactCheckIcon color="primary" />;
            case "CONFERIDO_PARCIAL": return <RuleIcon sx={{ color: 'primary.parcial' }} />;
            case "ITEM_GUARDADO": return <WarehouseIcon color="success" />;
            case "ITEM_VENDIDO": return <ShoppingCartIcon color="secondary" />;
            default: return <WarehouseIcon />;
        }
    };

    // Busca id único de cada item
    const buscarUnidades = async (codBarras) => {

        if (unidadesItem[codBarras]) return;

        setLoadingUnidades(prev => ({
            ...prev,
            [codBarras]: true
        }));

        try {
            const response = await fetch(
                `${API}/api/nfe/unidades/nao_impressas/codire/${codBarras}`
            );

            const data = await response.json();

            const lista = Array.isArray(data.unidades)
                ? data.unidades
                : [];

            setUnidadesItem(prev => ({
                ...prev,
                [codBarras]: lista
            }));

        } catch (error) {
            console.error(error);

            setUnidadesItem(prev => ({
                ...prev,
                [codBarras]: []
            }));

        } finally {
            setLoadingUnidades(prev => ({
                ...prev,
                [codBarras]: false
            }));
        }
    };

    const handleExpandItem = (notaId, codBarras) => {

        const key = `${notaId}-${codBarras}`;

        const novo = expandedItem === key ? null : key;
        setExpandedItem(novo);

        if (novo) {
            buscarUnidades(codBarras);
        }
    };

    // Destaca item na nota
    const contains = (valor, termo) => {
        if (!valor) return false;
        return valor.toString().toLowerCase().includes(termo);
    };

    const isItemBuscado = (item) => {
        if (!busca) return false;

        const termo = busca.toLowerCase();

        return (
            contains(item.descricao, termo) ||
            contains(item.codigo_barras, termo) ||
            contains(item.cod_produto, termo) ||
            contains(item.basico, termo)
        );
    };

    // Formata tipo da data
    const parseDataBR = (dataStr) => {
        if (!dataStr) return null;

        const [dia, mes, ano] = dataStr.split("-");
        return new Date(`${ano}-${mes}-${dia}`);
    };

    return (
        <Container maxWidth="100%" sx={{ mt: 4, bgcolor: "background.default" }}>
            {/* Header */}
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    justifyContent: 'space-between',
                    alignItems: { xs: 'flex-start', md: 'center' },
                    gap: 2,
                    p: 2,
                    bgcolor: 'var(--azul)',
                    mb: 5
                }}
            >
                <Typography variant="h4" sx={{ fontFamily: 'Consolas', color: "background.paper" }}>
                    <strong>Consulta Geral</strong>
                </Typography>
                <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'right', mr: '0' }}>
                        {<PersonIcon sx={{ color: "background.paper", paddingRight: '1vh' }} />}
                        <Typography sx={{ color: "background.paper", fontSize: '0.9rem', display: 'flex', alignItems: 'center' }}>
                            {userInfo?.nome}
                        </Typography>
                        {token && (
                            <Button
                                size="small"
                                onClick={logout}
                                sx={{ color: "background.paper", display: 'flex', gap: 1 }}
                            >{<LogoutIcon />}
                            </Button>
                        )}
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'right', mr: '2vh' }}>
                        <Button
                            onClick={() => navigate("/Dashboard")}
                            sx={{ color: "background.paper", display: 'flex', gap: 1 }}
                        >
                            Voltar
                            {< ArrowBackIcon />}
                        </Button>
                        <pre id="resultado"></pre>
                    </Box>
                </Box>
            </Box>

            {/* FILTRO */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <TextField fullWidth size="small" placeholder="Buscar item"
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && buscarNotas()}
                />

                <TextField type="date" size="small" sx={{ width: 220 }} value={dataInicio}
                    onChange={(e) => setDataInicio(e.target.value)} />

                <TextField type="date" size="small" sx={{ width: 220 }} value={dataFim}
                    onChange={(e) => setDataFim(e.target.value)} />

                <Button variant="contained" sx={{ minWidth: 140 }} onClick={buscarNotas}>
                    Buscar
                </Button>
            </Box>

            {loading ? (

                <CircularProgress />

            ) : (

                notas.map((nota) => (

                        <Card
                            key={nota.id}
                            sx={{
                                mb: 2,
                                borderRadius: '2vh',
                                boxShadow:
                                    '0vh 0.1vh 0.5vh var(--sombra)',
                                bgcolor: 'background.alerta',
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

                                        // Busca itens apenas 1x
                                        if (
                                            expandindo &&
                                            nota.itens === null &&
                                            !modoBuscaItem
                                        ) {

                                            await buscarItensNota(
                                                nota.id
                                            );
                                        }
                                    }}

                                    sx={{
                                        cursor: "pointer"
                                    }}
                                >

                                    <Typography fontWeight="bold">
                                        📄 {nota.numero} - {nota.fornecedor}
                                    </Typography>

                                    <Typography fontSize={'0.8rem'}>
                                        {nota.data_recebimento}
                                    </Typography>

                                </Box>

                                {/* ITENS */}
                                <Collapse
                                    in={expandedNota === nota.id}
                                >

                                    <Box sx={{ mt: 2 }}>

                                        {/* LOADING ITENS */}
                                        {loadingItens[nota.id] ? (

                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    justifyContent: 'center',
                                                    p: 3
                                                }}
                                            >
                                                <CircularProgress size={25} />
                                            </Box>

                                        ) : (

                                            <>
                                                {/* SEM ITENS */}
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
                                                                (item, idx) => {

                                                                    const cod =
                                                                        item.codigo_barras ??
                                                                        item.cean ??
                                                                        item.cod_produto ??
                                                                        `idx-${idx}`;

                                                                    const key =
                                                                        `${nota.id}-${cod}`;

                                                                    return (

                                                                        <Fragment key={key}>

                                                                            {/* ITEM */}
                                                                            <TableRow

                                                                                onClick={(e) => {

                                                                                    e.stopPropagation();

                                                                                    handleExpandItem(
                                                                                        nota.id,
                                                                                        cod
                                                                                    );
                                                                                }}

                                                                                sx={{
                                                                                    cursor: "pointer",

                                                                                    backgroundColor:
                                                                                        isItemBuscado(item)
                                                                                            ? 'primary.achouItem'
                                                                                            : 'inherit',

                                                                                    transition: '0.2s'
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
                                                                                    {Number(
                                                                                        item.quantidade_comercial
                                                                                    )}
                                                                                </TableCell>

                                                                                <TableCell
                                                                                    sx={{
                                                                                        display: 'flex',
                                                                                        alignItems: 'center'
                                                                                    }}
                                                                                >

                                                                                    {getIconStatus(
                                                                                        item.status_item
                                                                                    )}

                                                                                    <Box sx={{ ml: 2 }}>
                                                                                        {getDescricaoStatus(
                                                                                            item.status_item
                                                                                        )}
                                                                                    </Box>

                                                                                </TableCell>

                                                                                <TableCell>
                                                                                    {item.caixa}
                                                                                </TableCell>

                                                                            </TableRow>

                                                                            {/* UNIDADES */}
                                                                            <TableRow
                                                                                sx={{
                                                                                    bgcolor: 'background.tabela',
                                                                                    boxShadow:
                                                                                        '0vh 0vh 1vh primary.sombra'
                                                                                }}
                                                                            >

                                                                                <TableCell
                                                                                    colSpan={6}
                                                                                    sx={{ p: 0 }}
                                                                                >

                                                                                    <Collapse
                                                                                        in={expandedItem === key}
                                                                                    >

                                                                                        <Table size="small">

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

                                                                                                {(unidadesItem[cod] || [])
                                                                                                    .map((un) => (

                                                                                                        <TableRow
                                                                                                            key={un.id_unico}
                                                                                                        >

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
                                                                                                                {nota.data_recebimento}
                                                                                                            </TableCell>

                                                                                                            <TableCell>
                                                                                                                {nota.conferente}
                                                                                                            </TableCell>

                                                                                                            <TableCell>

                                                                                                                <Button
                                                                                                                    onClick={() =>
                                                                                                                        navigate(
                                                                                                                            `/Rastreio/${un.id_unico}`
                                                                                                                        )
                                                                                                                    }
                                                                                                                >
                                                                                                                    Histórico
                                                                                                                </Button>

                                                                                                            </TableCell>

                                                                                                        </TableRow>
                                                                                                    ))}

                                                                                            </TableBody>

                                                                                        </Table>

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