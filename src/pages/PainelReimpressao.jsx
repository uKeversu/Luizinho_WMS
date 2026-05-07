import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
    Container, Typography, Card, CardContent, TextField, Button,
    Box, CircularProgress, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow
} from "@mui/material";
import Collapse from "@mui/material/Collapse";
import { Fragment } from "react";

import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PrintIcon from '@mui/icons-material/Print';

import { ThemeContext } from "../context/ThemeContext";

function PainelReimpressao() {

    const { dark } = useContext(ThemeContext);
    const navigate = useNavigate();

    const API = "http://192.168.1.185:8077";

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

    const [expandedNota, setExpandedNota] = useState(null);
    const [expandedItem, setExpandedItem] = useState(null);

    const [unidadesItem, setUnidadesItem] = useState({});
    const [loadingUnidades, setLoadingUnidades] = useState({});

    // ---------------- BUSCA ----------------

    const buscarNotas = async () => {
        if (!busca) return;

        setLoading(true);

        try {
            const response = await fetch(`${API}/api/notas/listar`);
            const data = await response.json();

            const termo = busca.toLowerCase();

            const notasFiltradas = await Promise.all(
                (data || []).map(async (nota) => {

                    const respItens = await fetch(`${API}/api/itens_nfe/${nota.id}`);
                    const dataItens = await respItens.json();

                    const itensFiltrados = (dataItens.items || []).filter(item => {

                        return (
                            item.descricao?.toLowerCase().includes(termo) ||
                            item.basico?.toLowerCase().includes(termo) ||
                            item.cean?.toLowerCase().includes(termo) ||
                            item.cod_produto?.toLowerCase().includes(termo)
                        );
                    });

                    return {
                        ...nota,
                        itens: itensFiltrados
                    };
                })
            );

            const resultadoFinal = notasFiltradas.filter(n => n.itens.length > 0);

            setNotas(resultadoFinal);

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // ---------------- UNIDADES ----------------

    const buscarUnidades = async (item) => {

        const codigo =
            item.cean ||
            item.codigo_barras ||
            item.cod_produto;

        if (!codigo) return;

        if (unidadesItem[codigo]) return;

        setLoadingUnidades(prev => ({
            ...prev,
            [codigo]: true
        }));

        try {
            const response = await fetch(
                `${API}/api/nfe/unidades/nao_impressas/codire/${codigo}`
            );

            const data = await response.json();

            setUnidadesItem(prev => ({
                ...prev,
                [codigo]: data.unidades || []
            }));

        } catch (error) {
            console.error(error);
        } finally {
            setLoadingUnidades(prev => ({
                ...prev,
                [codigo]: false
            }));
        }
    };

    const handleExpandItem = (notaId, item) => {

        const codigo =
            item.cean ||
            item.cod_produto;

        const key = `${notaId}-${codigo}`;

        const novo = expandedItem === key ? null : key;
        setExpandedItem(novo);

        if (novo) {
            buscarUnidades(item);
        }
    };

    // ---------------- IMPRESSÃO ----------------

    const gerarZPL = (unidade) => {
        const url = `http://192.168.1.82:4173/Rastreio/${unidade.id_unico}`;

        return `
^XA
^PW520
^LL192
^LH0,0

^PR3
^MD15

^FO3,3
^BQN,2,6
^FDLA,${url}^FS

^FO230,10
^A0N,40,45
^FD${unidade.basico}^FS

^FO230,60
^A0N,45,50
^FD${unidade.loc_sistema}^FS

^FO230,115
^A0N,30,30
^FD${unidade.numero}/${unidade.serie}^FS

^FO230,150
^A0N,25,25
^FD${new Date().toLocaleString("pt-BR")}^FS

^FO185,30
^A0B,30,40
^FD${unidade.id_unico}^FS

^FO460,30
^A0B,50,40
^FD${(userInfo?.codigo || "")}^FS

^XZ

`;
    };

    const imprimirViaPython = async (zpl) => {
        try {
            const host = window.location.hostname;

            await fetch(`http://${host}:5000/print`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    tipo: "windows",
                    conteudo: zpl,
                    printer: "ZDesigner GC420t"
                })
            });

        } catch (error) {
            console.error("Erro impressão:", error);
        }
    };

    const imprimirUnidade = async (unidade) => {
        try {
            await fetch(`${API}/api/nfe/unidade/imprimir/${unidade.id_unico}`);

            const zpl = gerarZPL(unidade);

            await imprimirViaPython(zpl);

        } catch (error) {
            console.error(error);
        }
    };

    const imprimirLote = async (lista) => {
        for (const u of lista) {
            await imprimirUnidade(u);
        }
    };

    // ---------------- UI ----------------

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
                    <strong>Painel de reimpressão de etiquetas</strong>
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

            {/* BUSCA */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <TextField
                    fullWidth
                    placeholder="Buscar por código ou descrição do item"
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && buscarNotas()}
                />

                <Button variant="contained" onClick={buscarNotas}>
                    Buscar
                </Button>
            </Box>

            {loading ? <CircularProgress /> : (

                notas.map((nota) => (

                    <Card key={nota.id} sx={{ mb: 2, bgcolor: 'background.default' }}>
                        <CardContent>

                            {/* NOTA */}
                            <Box
                                onClick={() =>
                                    setExpandedNota(expandedNota === nota.id ? null : nota.id)
                                }
                                sx={{ cursor: "pointer" }}
                            >
                                <Typography fontWeight="bold">
                                    📄 {nota.numero} - {nota.fornecedor}
                                </Typography>
                            </Box>

                            <Collapse in={expandedNota === nota.id}>

                                <Table size="small">
                                    <TableBody>

                                        {nota.itens.map((item, idx) => {

                                            const codigo =
                                                item.cean ||
                                                item.cod_produto ||
                                                `idx-${idx}`;

                                            const key = `${nota.id}-${codigo}`;

                                            return (
                                                <Fragment key={key}>

                                                    {/* ITEM */}
                                                    <TableRow
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleExpandItem(nota.id, item);
                                                        }}
                                                        sx={{ cursor: "pointer" }}
                                                    >
                                                        <TableCell>{item.basico}</TableCell>
                                                        <TableCell>{item.descricao}</TableCell>
                                                        <TableCell>{item.loc_sistema}</TableCell>
                                                    </TableRow>

                                                    {/* UNIDADES */}
                                                    <TableRow>
                                                        <TableCell colSpan={5}>

                                                            <Collapse in={expandedItem === key}>

                                                                {loadingUnidades[codigo] ? (
                                                                    <CircularProgress size={20} />
                                                                ) : (

                                                                    <>
                                                                        <Typography fontSize={12}>
                                                                            {unidadesItem[codigo]?.length || 0} etiquetas disponíveis
                                                                        </Typography>

                                                                        <Button
                                                                            startIcon={<PrintIcon />}
                                                                            sx={{ mb: 1 }}
                                                                            onClick={() =>
                                                                                imprimirLote(unidadesItem[codigo] || [])
                                                                            }
                                                                        >
                                                                            Imprimir todos
                                                                        </Button>

                                                                        <Table size="small">
                                                                            <TableHead>
                                                                                <TableRow>
                                                                                    <TableCell>ID ÚNICO</TableCell>
                                                                                    <TableCell>Ação</TableCell>
                                                                                </TableRow>
                                                                            </TableHead>

                                                                            <TableBody>
                                                                                {(unidadesItem[codigo] || []).map((un) => (
                                                                                    <TableRow key={un.id_unico}>
                                                                                        <TableCell>{un.id_unico}</TableCell>

                                                                                        <TableCell>
                                                                                            <Button
                                                                                                size="small"
                                                                                                variant="contained"
                                                                                                onClick={() => imprimirUnidade(un)}
                                                                                            >
                                                                                                Reimprimir
                                                                                            </Button>
                                                                                        </TableCell>
                                                                                    </TableRow>
                                                                                ))}
                                                                            </TableBody>
                                                                        </Table>
                                                                    </>
                                                                )}

                                                            </Collapse>
                                                        </TableCell>
                                                    </TableRow>

                                                </Fragment>
                                            );
                                        })}
                                    </TableBody>
                                </Table>

                            </Collapse>

                        </CardContent>
                    </Card>
                ))
            )}
        </Container>
    );
}

export default PainelReimpressao;