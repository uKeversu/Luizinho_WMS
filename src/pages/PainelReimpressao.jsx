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

            const response = await fetch(
                `${API}/api/reimpressao/buscar?termo=${encodeURIComponent(busca)}`,
                {
                    headers: {
                        "X-Auth-Token": token
                    }
                }
            );

            const data = await response.json();

            setNotas(data);

        } finally {
            setLoading(false);
        }
    };

    // ---------------- UNIDADES ----------------

    const buscarUnidades = async (item) => {

        if (unidadesItem[item.id]) return;

        setLoadingUnidades(prev => ({
            ...prev,
            [item.id]: true
        }));

        try {

            const response = await fetch(
                `${API}/api/reimpressao/unidades/${item.id}`,
                {
                    headers: {
                        "X-Auth-Token": token
                    }
                }
            );

            const data = await response.json();

            setUnidadesItem(prev => ({
                ...prev,
                [item.id]: data.unidades || []
            }));

        } catch (e) {

            console.error(e);

        } finally {

            setLoadingUnidades(prev => ({
                ...prev,
                [item.id]: false
            }));

        }

    };

    const handleExpandItem = (item) => {

        const key = item.id;

        const novo = expandedItem === key ? null : key;

        setExpandedItem(novo);

        if (novo) {
            buscarUnidades(item);
        }

    };

    // ---------------- IMPRESSÃO ----------------

    const gerarZPLCompleta = (unidade) => {
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
        const cean =
            unidade.cean ||
            unidade.cod_produto;
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

    const gerarZPL = (unidade) => {

        if (modoImpressao === "barcode") {
            return gerarZPLBarcode(unidade);
        }

        return gerarZPLCompleta(unidade);

    }

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
            const zpl = gerarZPL(unidade);
            await imprimirViaPython(zpl);
        } catch (error) {
            console.error(error);
        }
    };

    const imprimirLote = async (lista) => {

        const zpl = lista
            .map(gerarZPL)
            .join("\n");

        await imprimirViaPython(zpl);

    };

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
                    borderRadius: '2vh',
                    zoom: '0.9'
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
            <Box sx={{ display: 'flex', gap: 2, mb: 3, zoom: '0.9' }}>
                <TextField
                    fullWidth
                    placeholder="Buscar por código do item"
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && buscarNotas()}
                    autoComplete="off"
                    inputProps={{
                        spellCheck: false,
                        autoCorrect: "off",
                        autoCapitalize: "off",
                    }}
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

                                        {nota.itens.map((item) => {

                                            const key = item.id;

                                            return (
                                                <Fragment key={key}>

                                                    {/* ITEM */}
                                                    <TableRow
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleExpandItem(item)
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

                                                                {loadingUnidades[item.id] ? (
                                                                    <CircularProgress size={20} />
                                                                ) : (

                                                                    <>
                                                                        <Typography fontSize={12}>
                                                                            {item.etiquetas_disponiveis} etiquetas disponíveis
                                                                        </Typography>

                                                                        <Button
                                                                            startIcon={<PrintIcon />}
                                                                            sx={{ mb: 1 }}
                                                                            onClick={() =>
                                                                                imprimirLote(unidadesItem[item.id] || [])
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
                                                                                {(unidadesItem[item.id] || []).map((un) => (
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