import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Container, Typography, Card, CardContent, TextField, Button, Select, MenuItem,
    Box, CircularProgress, Table, TableBody, TableCell, FormControl,
    TableContainer, TableHead, TableRow, Snackbar, Alert, InputLabel
} from "@mui/material";
import Collapse from "@mui/material/Collapse";
import { Fragment } from "react";

import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PrintIcon from '@mui/icons-material/Print';

// Componente de login
import LoginFuncionario from "../components/LoginFuncionario";

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

    // Impressora
    const [modoImpressao, setModoImpressao] = useState("completa");
    const [printer, setPrinter] = useState("");
    const [printers, setPrinters] = useState([]);

    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "info"
    });

    useEffect(() => {

        const carregarImpressoras = async () => {

            try {

                const response = await fetch("http://127.0.0.1:5000/printers");

                const data = await response.json();

                if (response.ok) {
                    setPrinters(data.printers || []);
                }

            } catch (error) {

                console.error("Erro ao buscar impressoras:", error);

                setSnackbar({
                    open: true,
                    message: "SIGEL Print não encontrado",
                    severity: "error"
                });
            }
        };

        carregarImpressoras();

        const salva = localStorage.getItem("printer");

        if (salva) {
            setPrinter(salva);
        }

    }, []);

    const selecionarImpressora = (novaPrinter) => {

        setPrinter(novaPrinter);

        localStorage.setItem("printer", novaPrinter);

        setSnackbar({
            open: true,
            message: `Impressora alterada para ${novaPrinter}`,
            severity: "success"
        });
    };

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

    // IMPRESSÃO
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

    // Etiqueta apenas código de barras
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

    // Etiqueta Bremsys
    const gerarZPLBremsys = (unidade, qr) => {
        const url = `http://192.168.1.82:4173/Rastreio/${unidade.id_unico}`;

        const dataHora = new Date().toLocaleString("pt-BR");

        // Limpa os campos recebidos da API
        const idUnico = (unidade.id_unico || "").trim();
        const basico = (unidade.basico || "").trim();
        const localizacao = (unidade.loc_sistema || "").trim();
        const numero = (unidade.numero || "").trim();
        const serie = (unidade.serie || "").trim();
        const descricao = (unidade.descricao || "").trim();
        const codigoBarras = (unidade.cean || "").trim();

        return `
^XA
^PW840
^LL480
^LH0,0

^PR3
^MD15

^FO80,120
^BQN,2,6
^FDLA,${url}^FS

^FO140,380
^A0N,25,25
^FD${idUnico}^FS

^FO300,220
^A0N,32,32
^FD${basico}^FS

^FO300,260
^A0N,40,42
^FD${localizacao}^FS

^FO300,315
^A0N,26,26
^FD${numero}/${serie}^FS

^FO300,340
^A0N,23,23
^FD${dataHora}^FS

^FO500,240
^A0B,30,30
^FD${userInfo?.codigo || ""}^FS

^FO250,420
^BY4,3,70
^BEN,70,Y,N
^FD${codigoBarras}^FS

^FO300,540
^A0N,22,22
^FB750,2,0,L,0
^FD${descricao}^FS

^XZ
`;
    };

    const gerarZPL = (unidade) => {

        if (modoImpressao === "barcode") {
            return gerarZPLBarcode(unidade);
        } else if (modoImpressao === "bremsys") {
            return gerarZPLBremsys(unidade);
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
        !token ? (
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
                        pode_autorizar_conferencia: data.pode_autorizar_conferencia,
                        pode_corrigir_nfe: data.pode_corrigir_nfe,
                        pode_finalizar_nfe: data.pode_finalizar_nfe,
                        pode_acessar_alertas: data.pode_acessar_alertas,
                        pode_acessar_cadastrar_funcionario: data.pode_acessar_cadastrar_funcionario,
                        pode_acessar_painel_games: data.pode_acessar_painel_games,
                        pode_acessar_painel_gerencial: data.pode_acessar_painel_gerencial,
                        pode_acessar_reimprimir_senhas: data.pode_acessar_reimprimir_senhas,
                        pode_acessar_tarefas: data.pode_acessar_tarefas,
                    };

                    localStorage.setItem(
                        "user_info",
                        JSON.stringify(user)
                    );

                    setUserInfo(user);
                    setToken(data.token);
                }}
            />
        ) : (
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
                                onClick={() => navigate("/")}
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
                        Etiqueta padrão
                    </Button>

                    <Button
                        variant={modoImpressao === "barcode" ? "contained" : "outlined"}
                        onClick={() => setModoImpressao("barcode")}
                    >
                        Código de barras
                    </Button>
                    <Button
                        variant={modoImpressao === "bremsys" ? "contained" : "outlined"}
                        onClick={() => setModoImpressao("bremsys")}
                    >
                        Etiqueta Bremsys
                    </Button>
                    <FormControl sx={{ width: 200 }} size="small">
                        <InputLabel>Impressora</InputLabel>

                        <Select
                            value={printer}
                            label="Impressora"
                            onChange={(e) => selecionarImpressora(e.target.value)}
                            MenuProps={{
                                PaperProps: {
                                    sx: {
                                        bgcolor: "background.default",
                                        color: "text.primary",
                                    },
                                },
                            }}
                        >
                            {printers.map((p) => (
                                <MenuItem
                                    key={p}
                                    value={p}
                                >
                                    {p}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
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
        )
    );
}

export default PainelReimpressao;