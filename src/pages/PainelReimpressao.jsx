import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
    Container, Typography, Card, CardContent, TextField, Button,
    Box, CircularProgress, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Snackbar, Alert
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

    const [modoImpressao, setModoImpressao] = useState("completa");

    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "info"
    });

    // ---------------- BUSCA ----------------

    const buscarNotas = async () => {

        if (!busca.trim()) return;

        setLoading(true);

        try {

            const hoje = new Date();

            const inicio = new Date();
            inicio.setMonth(inicio.getMonth() - 1);

            let pagina = 1;
            let totalPaginas = 1;

            const todasNotas = [];

            do {

                const params = new URLSearchParams({
                    page: pagina,
                    data_inicio: inicio.toISOString().split("T")[0],
                    data_fim: hoje.toISOString().split("T")[0],
                    sort_by: "data_emissao",
                    sort_order: "DESC"
                });

                const response = await fetch(
                    `${API}/api/notas/listar?${params}`,
                    {
                        headers: {
                            "X-Auth-Token": token
                        }
                    }
                );

                const data = await response.json();

                todasNotas.push(...(data.data || []));

                totalPaginas = data.total_pages || 1;

                pagina++;

            } while (pagina <= totalPaginas);

            const termo = busca.trim().toLowerCase();

            const notasFiltradas = await Promise.all(

                todasNotas.map(async (nota) => {

                    try {

                        const respItens = await fetch(
                            `${API}/api/itens_nfe/${nota.id}`,
                            {
                                headers: {
                                    "X-Auth-Token": token
                                }
                            }
                        );

                        const dataItens = await respItens.json();

                        const itensFiltrados =
                            (dataItens.items || []).filter(item => {

                                const texto = [
                                    item.descricao,
                                    item.basico,
                                    item.cean,
                                    item.codigo_barras,
                                    item.cod_produto
                                ]
                                    .filter(Boolean)
                                    .join(" ")
                                    .toLowerCase();

                                return texto.includes(termo);
                            });

                        return {
                            ...nota,
                            itens: itensFiltrados
                        };

                    } catch {

                        return {
                            ...nota,
                            itens: []
                        };
                    }
                })
            );

            const resultadoFinal =
                notasFiltradas.filter(
                    nota => nota.itens.length > 0
                );

            setNotas(resultadoFinal);

        } catch (err) {

            console.error(err);

            setSnackbar({
                open: true,
                message: "Erro ao buscar notas",
                severity: "error"
            });

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

    const gerarZPLCompleta = (unidade, qr) => {
        const url = `http://192.168.1.82:4173/Rastreio/${unidade.id_unico}`;

        return `
^XA
^PW480
^LL240
^LH0,0

^PR3
^MD15

^FO10,20
^BQN,2,6
^FDLA,${url}^FS

^FO350,5
^A0N,20,20
^FR
^FDREIMPRESSA^FS

^FO60,210
^A0N,30,30
^FD${unidade.id_unico}^FS

^FO190,30
^A0N,35,35
^FD${unidade.basico}^FS

^FO190,70
^A0N,45,50
^FD${unidade.loc_sistema}^FS

^FO190,140
^A0N,30,30
^FD${unidade.numero}/${unidade.serie}^FS

^FO190,170
^A0N,28,28
^FD${new Date().toLocaleString("pt-BR")}^FS

^FO440,70
^A0B,35,35
^FD${userInfo?.codigo || ""}^FS

^XZ
`;
    };

    const gerarZPLBarcode = (unidade) => {
        const cean = unidade.codire
        console.log(unidade.codire)
        return `
^XA
^PW400
^LL180
^LH0,0

^FO150,30
^A0N,25,25
^FD${unidade.basico}^FS

^FO10,80
^BY3,100
^BCN,100,Y,N,N
^FD${cean}^FS

^FO10,150
^A0N,25,25
^FD${cean}^FS

^XZ
`;
    };

    const gerarZPL = async (unidade) => {

        if (modoImpressao === "barcode") {
            return gerarZPLBarcode(unidade);
        }

        const resQr = await fetch(
            `${API}/api/nfe/unidade/imprimir/${unidade.id_unico}`
        );

        const qr = await resQr.json();

        return gerarZPLCompleta(unidade, qr);
    };

    const imprimirViaPython = async (zpl) => {
        try {

            const printerSalva = localStorage.getItem("printer");

            if (!printerSalva) {
                setSnackbar({
                    open: true,
                    message: "Defina uma impressora antes de imprimir!",
                    severity: "warning"
                });
                return;
            }

            const response = await fetch(`http://127.0.0.1:5000/print`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    tipo: "windows",
                    conteudo: zpl,
                    printer: printerSalva
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.erro || "Erro ao imprimir");
            }

            setSnackbar({
                open: true,
                message: "Etiqueta reimpressa com sucesso!",
                severity: "success"
            });
            return true;

        } catch (error) {

            console.error("Erro impressão Python:", error);
            setSnackbar({
                open: true,
                message: "Falha na impressão, ative o WMS Print!",
                severity: "error"
            });
            return false;
        }
    };

    const imprimirUnidade = async (unidade) => {
        try {
            const zpl = await gerarZPL(unidade);
            await imprimirViaPython(zpl);
        } catch (error) {
            console.error(error);
        }
    };

    const imprimirLote = async (lista) => {

        for (const unidade of lista) {
            await imprimirUnidade(unidade);
        }
    };

    // ---------------- UI ----------------

    return (
        <Container maxWidth="100%" sx={{ mt: 4, bgcolor: "background.default" }}>
            {/* Header */}
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
                    borderRadius: '2vh'
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

            <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                <Button
                    variant={modoImpressao === "completa" ? "contained" : "outlined"}
                    onClick={() => setModoImpressao("completa")}
                >
                    Etiqueta completa
                </Button>

                <Button
                    variant={modoImpressao === "barcode" ? "contained" : "outlined"}
                    onClick={() => setModoImpressao("barcode")}
                >
                    Código de barras
                </Button>
            </Box>

            {/* BUSCA */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <TextField
                    fullWidth
                    placeholder="Buscar por código do item"
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
                                                                                    <TableCell>AÇÃO</TableCell>
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
                                                                                                IMPRIMIR
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

            {/* Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
            >
                <Alert
                    variant="filled"
                    severity={snackbar.severity}
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

        </Container>
    );
}

export default PainelReimpressao;