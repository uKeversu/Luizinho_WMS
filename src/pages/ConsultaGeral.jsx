import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Container,
    Typography,
    Card,
    CardContent,
    Grid,
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

import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import InventoryIcon from '@mui/icons-material/Inventory';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import WarningIcon from '@mui/icons-material/Warning';

import '../style/App.css';

function ConsultaGeral() {

    // API BASE
    const API = "http://192.168.1.185:8077";

    // Acessar outras pages
    const navigate = useNavigate();

    // Login e Logout
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

    const [notas, setNotas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [busca, setBusca] = useState("");
    const [buscaItemModal, setBuscaItemModal] = useState("");
    const [itensNota, setItensNota] = useState([]);

    const [dataInicio, setDataInicio] = useState("");
    const [dataFim, setDataFim] = useState("");
    const [aplicarFiltro, setAplicarFiltro] = useState(false);
    const [timeline, setTimeline] = useState([]);

    useEffect(() => {
        buscarNotas();
    }, []);

    const buscarNotas = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API}/api/notas/listar`);
            const data = await response.json();

            const notasArray = Array.isArray(data) ? data : [];

            const notasComItens = await Promise.all(
                notasArray.map(async (nota) => {
                    try {
                        const respItens = await fetch(`${API}/api/itens_nfe/${nota.id}`);
                        const dataItens = await respItens.json();

                        return {
                            ...nota,
                            itens: dataItens.items || []
                        };
                    } catch {
                        return { ...nota, itens: [] };
                    }
                })
            );

            setNotas(notasComItens);

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const agruparPorItem = (eventos) => {
        const grupos = {};

        eventos.forEach(evento => {
            const chave =
                evento.item.codigo_barras ||
                evento.item.codigo_produto;

            if (!grupos[chave]) {
                grupos[chave] = {
                    info: evento.item,
                    eventos: []
                };
            }

            grupos[chave].eventos.push(evento);
        });

        Object.values(grupos).forEach(grupo => {
            grupo.eventos.sort((a, b) => new Date(a.data) - new Date(b.data));
        });

        return grupos;
    };

    const gerarTimelineItem = (termo) => {
        const t = termo.toLowerCase().trim();
        if (!t) return [];

        let eventos = [];

        notas.forEach(nota => {
            nota.itens?.forEach(item => {

                const match =
                    item.descricao?.toLowerCase().includes(t) ||
                    item.xProd?.toLowerCase().includes(t) ||
                    item.cean?.toString().includes(t) ||
                    item.codigo_barras?.toString().includes(t);

                if (!match) return;

                const dataEvento = new Date(nota.data_recebimento);

                if (aplicarFiltro) {
                    if (dataInicio && dataEvento < new Date(dataInicio)) return;
                    if (dataFim && dataEvento > new Date(dataFim)) return;
                }

                eventos.push({
                    tipo: item.status_item,
                    data: nota.data_recebimento,
                    nota: nota.numero,
                    fornecedor: nota.fornecedor,
                    descricao: getDescricaoStatus(item.status_item),
                    item: item
                });
            });
        });

        return eventos.sort((a, b) => new Date(b.data) - new Date(a.data));

    };

    const getDescricaoStatus = (status) => {
        switch (status) {
            case "PENDENTE":
                return "Pendente";
            case "ITEM_CONFERIDO":
                return "Conferido";
            case "ITEM_GUARDADO":
                return "Guardado";
            case "ITEM_VENDIDO":
                return "Vendido";
            case "ITEM_DEVOLVIDO":
                return "Devolvido";
            default:
                return "Status desconhecido";
        }
    };

    const getIconStatus = (status) => {
        switch (status) {
            case "PENDENTE":
                return <WarningIcon color="warning" />;
            case "ITEM_CONFERIDO":
                return <FactCheckIcon color="primary" />;
            case "ITEM_GUARDADO":
                return <WarehouseIcon color="success" />;
            case "ITEM_VENDIDO":
                return <ShoppingCartIcon color="secondary" />;
            default:
                return <InventoryIcon />;
        }
    };

    const aplicarBusca = () => {
        setAplicarFiltro(true);
        const resultado = gerarTimelineItem(busca);
        setTimeline(resultado);
    };

    const itensAgrupados = agruparPorItem(timeline);

    const getMarca = (codigo) => {
        if (!codigo) return '-';

        return codigo
            .split(/[\s-_]/)[0]
            .toUpperCase();
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
                    bgcolor: 'primary.main',
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

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>

                <TextField
                    placeholder="Buscar item"
                    size="small"
                    fullWidth
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') aplicarBusca();
                    }}
                    sx={{
                        '& .MuiInputBase-root': {
                            height: 34
                        },
                        '& .MuiInputBase-input': {
                            fontSize: '0.8rem',
                            padding: '6px 8px'
                        }
                    }}
                />

                <TextField
                    label="Data início"
                    type="date"
                    size="small"
                    InputLabelProps={{ shrink: true }}
                    value={dataInicio}
                    onChange={(e) => setDataInicio(e.target.value)}
                    sx={{
                        width: 170,
                        '& .MuiInputBase-root': { height: 34 },
                        '& .MuiInputBase-input': { fontSize: '0.7rem' }
                    }}
                />

                <TextField
                    label="Data fim"
                    type="date"
                    size="small"
                    InputLabelProps={{ shrink: true }}
                    value={dataFim}
                    onChange={(e) => setDataFim(e.target.value)}
                    sx={{
                        width: 170,
                        '& .MuiInputBase-root': { height: 34 },
                        '& .MuiInputBase-input': { fontSize: '0.7rem' }
                    }}
                />

                <Button
                    size="small"
                    variant="contained"
                    onClick={aplicarBusca}
                    sx={{
                        height: 34,
                        fontSize: '0.75rem',
                        px: 2
                    }}
                >
                    Filtrar
                </Button>

                <Button
                    size="small"
                    variant="outlined"
                    onClick={() => {
                        setAplicarFiltro(false);
                        setDataInicio("");
                        setDataFim("");
                        setTimeline([]);
                    }}
                    sx={{
                        height: 34,
                        fontSize: '0.75rem',
                        px: 2
                    }}
                >
                    Limpar
                </Button>

            </Box>
            {loading ? (
                <CircularProgress />
            ) : (
                <Box
                    sx={{
                        mt: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 3
                    }}
                >
                    {timeline.length === 0 && !loading && (
                        <Typography sx={{ margin: 'auto', color: 'text.primary' }}>
                            Nenhum item encontrado para essa busca.
                        </Typography>
                    )}
                    {Object.entries(itensAgrupados).map(([chave, grupo]) => (
                        <Card
                            key={chave}
                            sx={{
                                borderRadius: '1.5vh',
                                boxShadow: '0vh 0.1vh 0.5vh var(--sombra)',
                                bgcolor: 'background.card',
                                transition: '0.2s',
                                '&:hover': {
                                    transform: 'translateY(-2px)',
                                    boxShadow: 3
                                }
                            }}
                        >
                            <CardContent sx={{ p: 1.5 }}>

                                {/* HEADER DO ITEM */}
                                <Box>
                                    <Typography fontWeight="bold" sx={{ fontSize: '0.9rem' }}>
                                        📦 {grupo.info.descricao}
                                    </Typography>

                                    <Typography sx={{ fontSize: '0.75rem', opacity: 0.7 }}>
                                        Cod: {grupo.info.cod_produto}
                                        | CEAN: {grupo.info.codigo_barras || grupo.info.cean}
                                        | Marca: {getMarca(grupo.info.descricao)}
                                    </Typography>

                                    <Typography fontWeight="bold" sx={{ fontSize: '0.9rem' }}>
                                        {grupo.info.loc_sistema}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', gap: 2, fontSize: '0.75rem', mb: 1 }}>
                                    <span>📊 Etapas: {grupo.eventos.length}</span>
                                    <span>🔢 QTD: {Number(grupo.info.quantidade_comercial)}</span>
                                </Box>

                                {/* TIMELINE */}
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    <TableContainer>
                                        <Table size="small">

                                            {/* CABEÇALHO */}
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Status</TableCell>
                                                    <TableCell>Data</TableCell>
                                                    <TableCell>Hora</TableCell>
                                                    <TableCell>Fornecedor/Cliente</TableCell>
                                                    <TableCell>Vendedor</TableCell>
                                                    <TableCell>Funcionário</TableCell>
                                                    <TableCell>NF</TableCell>
                                                    <TableCell>QTD</TableCell>
                                                </TableRow>
                                            </TableHead>

                                            {/* LINHAS */}
                                            <TableBody>
                                                {grupo.eventos.map((evento, idx) => (
                                                    <TableRow key={idx}
                                                        sx={{
                                                            backgroundColor: idx % 2 === 0 ? 'background.default' : 'transparent'
                                                        }} hover>

                                                        <TableCell>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                {getIconStatus(evento.tipo)}
                                                                {getDescricaoStatus(evento.tipo)}
                                                            </Box>
                                                        </TableCell>

                                                        <TableCell>
                                                            {evento.data}
                                                        </TableCell>

                                                        <TableCell>
                                                            {evento.data}
                                                        </TableCell>

                                                        <TableCell>
                                                            {evento.fornecedor}
                                                        </TableCell>

                                                        <TableCell>
                                                            Vendedor
                                                        </TableCell>

                                                        <TableCell>
                                                            Funcionário
                                                        </TableCell>

                                                        <TableCell>
                                                            {evento.nota}
                                                        </TableCell>

                                                        <TableCell>
                                                            {Number(evento.item.quantidade_comercial)}
                                                        </TableCell>

                                                    </TableRow>
                                                ))}
                                            </TableBody>

                                        </Table>
                                    </TableContainer>
                                </Box>

                            </CardContent>
                        </Card>
                    ))}
                </Box>
            )}
        </Container>

    );
}


export default ConsultaGeral;