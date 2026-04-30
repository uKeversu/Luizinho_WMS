import { useState, useContext, useRef, Fragment } from "react";
import { useNavigate } from "react-router-dom";
import {
    Container, Typography, Card, CardContent, TextField, Button, Box,
    CircularProgress, Table, TableBody, TableCell, TableHead, TableRow
} from "@mui/material";
import Collapse from "@mui/material/Collapse";

import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import { ThemeContext } from "../context/ThemeContext";

function PainelReimpressao() {

    const { dark } = useContext(ThemeContext);
    const navigate = useNavigate();

    const API = "http://192.168.1.185:8077";

    const [notas, setNotas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [busca, setBusca] = useState("");

    const [expandedNota, setExpandedNota] = useState(null);
    const [expandedItem, setExpandedItem] = useState(null);

    const [unidadesItem, setUnidadesItem] = useState({});
    const [loadingUnidades, setLoadingUnidades] = useState({});

    const cacheBasico = useRef({});

    //  Buscar notas
    const buscarNotas = async () => {
        if (!busca) return;

        setLoading(true);

        try {
            const response = await fetch(`${API}/api/notas/listar?busca=${busca}`);
            const data = await response.json();

            const notasComItens = await Promise.all(
                data.map(async (nota) => {

                    const respItens = await fetch(`${API}/api/itens_nfe/${nota.id}`);
                    const dataItens = await respItens.json();

                    const itens = await Promise.all(
                        (dataItens.items || []).map(async (item) => {

                            const codigo =
                                item.codigo_barras ||
                                item.cean ||
                                item.cod_produto;

                            const basico = await buscarBasico(codigo);

                            return { ...item, basico };
                        })
                    );

                    return { ...nota, itens };
                })
            );

            setNotas(notasComItens);

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
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

    //  Buscar unidades por item
    const buscarUnidades = async (cod) => {

        if (unidadesItem[cod]) return;

        setLoadingUnidades(prev => ({ ...prev, [cod]: true }));

        try {
            const res = await fetch(`${API}/api/nfe/unidades/nao_impressas/codire/${cod}`);
            const data = await res.json();

            setUnidadesItem(prev => ({
                ...prev,
                [cod]: data.unidades || []
            }));

        } catch {
            setUnidadesItem(prev => ({
                ...prev,
                [cod]: []
            }));
        } finally {
            setLoadingUnidades(prev => ({ ...prev, [cod]: false }));
        }
    };

    const handleExpandItem = (notaId, cod) => {
        const key = `${notaId}-${cod}`;
        const novo = expandedItem === key ? null : key;

        setExpandedItem(novo);

        if (novo) {
            buscarUnidades(cod);
        }
    };

    //  ZPL
    const gerarZPL = (unidade) => {
        const url = `http://192.168.1.82:4173/Rastreio/${unidade.id_unico}`;

        return `
^XA
^PW520
^LL192

^FO3,3
^BQN,2,6
^FDLA,${url}^FS

^FO230,10
^A0N,40,45
^FD${unidade.basico}^FS

^FO230,60
^A0N,45,50
^FD${unidade.loc_sistema}^FS

^FO185,30
^A0B,30,40
^FD${unidade.id_unico}^FS

^XZ
`;
    };

    const imprimir = async (zpl) => {
        try {
            await fetch("http://192.168.1.82:5000/print", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    tipo: "windows",
                    conteudo: zpl,
                    printer: "ZDesigner GC420t"
                })
            });
        } catch (err) {
            console.error(err);
        }
    };

    const imprimirItem = async (unidade) => {

        const resQr = await fetch(`${API}/api/nfe/unidade/imprimir/${unidade.id_unico}`);
        const qr = await resQr.json();

        if (!qr.qr_url) return;

        const zpl = gerarZPL(unidade);
        imprimir(zpl);
    };

    return (
        <Container maxWidth="100%" sx={{ mt: 4 }}>

            {/* Header */}
            <Box display="flex" justifyContent="space-between" mb={3}>
                <Typography variant="h4">Painel de Reimpressão</Typography>
                <Button onClick={() => navigate("/Dashboard")}>
                    Voltar <ArrowBackIcon />
                </Button>
            </Box>

            {/* Busca */}
            <Box display="flex" gap={2} mb={3}>
                <TextField
                    fullWidth
                    size="small"
                    placeholder="Buscar nota / item / id"
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

                    <Card key={nota.id} sx={{ mb: 2 }}>
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

                            {/* ITENS */}
                            <Collapse in={expandedNota === nota.id}>

                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>LOC</TableCell>
                                            <TableCell>Código</TableCell>
                                            <TableCell>Descrição</TableCell>
                                            <TableCell>Qtd</TableCell>
                                        </TableRow>
                                    </TableHead>

                                    <TableBody>
                                        {nota.itens.map((item, idx) => {

                                            const cod =
                                                item.codigo_barras ??
                                                item.cean ??
                                                item.cod_produto ??
                                                `idx-${idx}`;

                                            const key = `${nota.id}-${cod}`;

                                            return (
                                                <Fragment key={key}>

                                                    {/* ITEM */}
                                                    <TableRow
                                                        onClick={() => handleExpandItem(nota.id, cod)}
                                                        sx={{ cursor: "pointer" }}
                                                    >
                                                        <TableCell>{item.loc_sistema}</TableCell>
                                                        <TableCell>{item.basico}</TableCell>
                                                        <TableCell>{item.descricao}</TableCell>
                                                        <TableCell>{item.quantidade_comercial}</TableCell>
                                                    </TableRow>

                                                    {/* UNIDADES */}
                                                    <TableRow>
                                                        <TableCell colSpan={4} sx={{ p: 0 }}>
                                                            <Collapse in={expandedItem === key}>

                                                                <Table size="small">
                                                                    <TableHead>
                                                                        <TableRow>
                                                                            <TableCell>ID ÚNICO</TableCell>
                                                                            <TableCell>LOCAL</TableCell>
                                                                            <TableCell>AÇÃO</TableCell>
                                                                        </TableRow>
                                                                    </TableHead>

                                                                    <TableBody>
                                                                        {(unidadesItem[cod] || []).map((un) => (
                                                                            <TableRow key={un.id_unico}>
                                                                                <TableCell>{un.id_unico}</TableCell>
                                                                                <TableCell>{un.loc_sistema}</TableCell>
                                                                                <TableCell>
                                                                                    <Button
                                                                                        variant="contained"
                                                                                        onClick={() => imprimirItem(un)}
                                                                                    >
                                                                                        Imprimir
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