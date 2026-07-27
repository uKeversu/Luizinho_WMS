import { useState, useMemo, useContext, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import {
    Box,
    Container,
    Typography,
    Paper,
    Grid,
    Chip,
    Button,
    Tabs,
    Tab,
    Card,
    CardContent,
    CircularProgress,
    Snackbar,
    Alert,
    Dialog,
    DialogContent,
    IconButton
} from "@mui/material";

import {
    Storefront,
    MonetizationOn,
    ArrowBack
} from "@mui/icons-material";

import VisibilityIcon from "@mui/icons-material/Visibility";
import PersonIcon from '@mui/icons-material/Person';

import CardJogador from "./PerfilJogador/components/CardJogador";

import { ThemeContext } from "../context/ThemeContext";

export default function Loja() {

    const navigate = useNavigate();
    const { dark } = useContext(ThemeContext);

    const [categoria, setCategoria] = useState(0);

    const [saldo, setSaldo] = useState(0);
    const [equipados, setEquipados] = useState({});

    const [itens, setItens] = useState([]);
    const [loading, setLoading] = useState(true);

    const [snack, setSnack] = useState({
        open: false,
        message: "",
        severity: "success"
    });

    const userInfo = JSON.parse(localStorage.getItem("user_info") || "{}");

    const categorias = [
        "avatar",
        "titulo",
        "moldura",
        "efeito"
    ];

    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewEquipados, setPreviewEquipados] = useState({});
    const [perfilPreview, setPerfilPreview] = useState(null);
    const [funcionarios, setFuncionarios] = useState([]);

    // CARREGA FUNCIONÁRIOS PARA USAR NO PREVIEW
    useEffect(() => {
        async function carregarFuncionarios() {
            const { data } = await axios.get(
                "http://192.168.1.185:8077/api/funcionarios/listar"
            );
            setFuncionarios(data);
        }
        carregarFuncionarios();
    }, []);

    // CARREGA DADOS
    const fetchData = async () => {
        try {
            setLoading(true);

            const [lojaRes, perfilRes] = await Promise.all([
                axios.get("http://192.168.1.185:8077/api/loja/catalogo"),
                axios.get(`http://192.168.1.185:8077/api/loja/perfil/${userInfo.codigo}`)
            ]);

            const perfil = perfilRes.data;

            setSaldo(perfil.saldo);
            setEquipados(perfil.equipados || {});
            setPerfilPreview({
                perfil: perfil.perfil,
                codigo: perfil.codigo,
                saldo: perfil.saldo
            });

            const itensFormatados = lojaRes.data.items.map(item => {

                const equipadoAtual = perfil.equipados?.[item.categoria];

                const possui = perfil.inventario?.some(
                    i => i.id === item.id
                );

                return {
                    ...item,
                    possui,
                    equipado: equipadoAtual?.id === item.id
                };
            });

            setItens(itensFormatados);

        } catch (err) {
            console.error(err);
            showSnack("Erro ao carregar loja", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const showSnack = (message, severity = "success") => {
        setSnack({
            open: true,
            message,
            severity
        });
    };

    function visualizar(item) {
        const novoEquipado = {
            ...equipados
        };
        novoEquipado[item.categoria] = item;
        setPreviewEquipados(novoEquipado);
        setPreviewOpen(true);
    }

    // COMPRAR ITEM
    const comprarItem = async (item) => {

        try {

            const res = await axios.post(
                "http://192.168.1.185:8077/api/loja/comprar",
                {
                    codigo: userInfo.codigo,
                    item_id: item.id
                }
            );

            showSnack(`Comprou ${item.nome}!`);

            setSaldo(res.data.saldo_atual);

            fetchData();

        } catch (err) {
            showSnack(
                err.response?.data?.erro || "Erro ao comprar",
                "error"
            );
        }
    };

    // EQUIPAR ITEM
    const equipar = async (item) => {

        try {

            await axios.post(
                "http://192.168.1.185:8077/api/loja/equipar",
                {
                    codigo: userInfo.codigo,
                    item_id: item.id
                }
            );

            showSnack(`${item.nome} equipado!`);

            fetchData();

        } catch (err) {
            showSnack(
                err.response?.data?.erro || "Erro ao equipar",
                "error"
            );
        }
    };

    // DESEQUIPAR ITEM
    const desequipar = async (item) => {

        try {

            await axios.post(
                "http://192.168.1.185:8077/api/loja/desequipar",
                {
                    codigo: userInfo.codigo,
                    categoria: item.categoria
                }
            );

            showSnack(`${item.nome} desequipado!`);

            fetchData();

        } catch (err) {

            showSnack(
                err.response?.data?.erro || "Erro ao desequipar",
                "error"
            );

        }

    };

    function corRaridade(raridade) {
        switch (raridade) {
            case "MITICO":
                return "#00d335";

            case "LENDARIO":
                return "#FF9800";

            case "EPICO":
                return "#9C27B0";

            case "RARO":
                return "#E53935";

            case "INCOMUM":
                return "#2196F3";

            default:
                return "#607D8B";
        }
    }

    function nomeColecao(colecao) {
        if (!colecao) return "-";

        return colecao.replace(/^\S+\s/, "");
    }

    const filtrados = useMemo(() => {
        return itens.filter(
            i => i.categoria === categorias[categoria]
        );
    }, [categoria, itens]);

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 2 }}>

            {/* HEADER */}
            <Paper sx={{
                p: 4,
                borderRadius: 4,
                mb: 2,
                background: dark
                    ? "linear-gradient(135deg,#161616,#0d0d0d)"
                    : "linear-gradient(135deg,#ffffff,#f5f5f5)"
            }}>
                <Box display="flex" justifyContent="space-between" alignItems="center">

                    <Box>
                        <Typography variant="h4" fontWeight="bold">
                            <Storefront sx={{ mr: 1, verticalAlign: "middle" }} />
                            Loja SigelCoins
                        </Typography>
                        <Typography>
                            Personalize seu perfil
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <PersonIcon
                            sx={{
                                color: "background.paper",
                                mr: 1
                            }}
                        />
                        <Typography sx={{ mr: 2 }}>
                            {userInfo?.nome}
                        </Typography>
                        <Button
                            variant="contained"
                            startIcon={<ArrowBack />}
                            onClick={() => navigate("/Produtividade")}
                        >
                            Voltar
                        </Button>
                    </Box>
                </Box>
            </Paper>

            {/* SALDO */}
            <Paper sx={{ p: 3, borderRadius: 4, mb: 2, bgcolor: 'background.default' }}>
                <Box display="flex" alignItems="center" gap={2}>
                    <MonetizationOn color="warning" />
                    <Typography variant="h5" fontWeight="bold">
                        {saldo.toLocaleString()} SigelCoins
                    </Typography>
                </Box>
            </Paper>

            {/* TABS */}
            <Paper sx={{ mb: 2, borderRadius: 4, bgcolor: 'background.default' }}>
                <Tabs
                    value={categoria}
                    onChange={(_, v) => setCategoria(v)}
                    centered
                >
                    <Tab label="🧑 Avatares" />
                    <Tab label="👑 Títulos" />
                    <Tab label="💎 Molduras" />
                    <Tab label="⚡ Efeitos" />
                </Tabs>
            </Paper>
            <Paper
                sx={{
                    p: 2,
                    mb: 2,
                    borderRadius: 3,
                    bgcolor: "background.default"
                }}
            >
                <Typography
                    variant="subtitle2"
                    fontWeight="bold"
                    mb={1}
                >
                    Raridade dos Itens
                </Typography>

                <Box display="flex" gap={2} flexWrap="wrap">

                    <Typography sx={{ color: "#2196F3", fontWeight: 700 }}>Incomum</Typography>
                    <Typography sx={{ color: "#E53935", fontWeight: 700 }}>Raro</Typography>
                    <Typography sx={{ color: "#9C27B0", fontWeight: 700 }}>Épico</Typography>
                    <Typography sx={{ color: "#FF9800", fontWeight: 700 }}>Lendário</Typography>
                    <Typography sx={{ color: "#00d335", fontWeight: 700 }}>Mítico</Typography>

                </Box>
            </Paper>

            {/* LOADING */}
            {loading ? (
                <Box display="flex" justifyContent="center" mt={5}>
                    <CircularProgress />
                </Box>
            ) : (
                <Grid container spacing={3}>

                    {filtrados.map(item => (

                        <Grid item xs={12} sm={6} md={4} lg={3} key={item.id}>
                            <motion.div whileHover={{ y: -5 }}>

                                <Card
                                    sx={{
                                        position: "relative",
                                        height: "100%",
                                        bgcolor: "background.default",
                                        mb: 5,
                                        border: `2px solid ${corRaridade(item.raridade)}`,
                                        transition: "0.25s",
                                        "&:hover": {
                                            boxShadow: `0 0 18px ${corRaridade(item.raridade)}80`,
                                            transform: "translateY(-2px)"
                                        },
                                        zoom: '0.9'
                                    }}
                                >
                                    <Chip
                                        label={nomeColecao(item.colecao)}
                                        size="small"
                                        sx={{
                                            position: "absolute",
                                            top: 12,
                                            right: 12,
                                            bgcolor: "rgba(0,0,0,.45)",
                                            color: "#fff",
                                            backdropFilter: "blur(8px)",
                                            fontSize: "11px"
                                        }}
                                    />

                                    <CardContent sx={{ textAlign: "center" }}>

                                        <Typography sx={{
                                            fontSize: 70, color: item?.nome === "Cruz de Malta"
                                                ? "primary.cancelar"
                                                : "primary.branco",
                                        }}>
                                            {item.icone}
                                        </Typography>

                                        <Typography variant="h6" fontWeight="bold">
                                            {item.nome}
                                        </Typography>

                                        <Chip
                                            sx={{ mt: 2, color: "white" }}
                                            color="warning"
                                            label={`${item.preco.toLocaleString()} SigelCoins`}
                                        />

                                        <Box mt={3}>
                                            <Button
                                                fullWidth
                                                variant="outlined"
                                                startIcon={<VisibilityIcon />}
                                                sx={{ mb: 1 }}
                                                onClick={() => visualizar(item)}
                                            >
                                                Visualizar
                                            </Button>
                                            {item.equipado ? (
                                                <Button
                                                    fullWidth
                                                    color="error"
                                                    variant="outlined"
                                                    onClick={() => desequipar(item)}
                                                >
                                                    Desequipar
                                                </Button>
                                            ) : item.possui ? (
                                                <Button
                                                    fullWidth
                                                    variant="outlined"
                                                    sx={{ mt: 1 }}
                                                    onClick={() => equipar(item)}
                                                >
                                                    Equipar
                                                </Button>
                                            ) : (
                                                <Button
                                                    fullWidth
                                                    variant="contained"
                                                    onClick={() => comprarItem(item)}
                                                >
                                                    Comprar
                                                </Button>
                                            )}

                                        </Box>

                                    </CardContent>
                                </Card>

                            </motion.div>
                        </Grid>

                    ))}

                </Grid>
            )}

            <Dialog
                open={previewOpen}
                onClose={() => setPreviewOpen(false)}
                maxWidth="md"
                fullWidth
                slotProps={{
                    paper: {
                        sx: {
                            width: 430,
                            maxWidth: "95vw",
                            borderRadius: 4,
                            bgcolor: "transparent",
                            boxShadow: "none",
                            overflow: "visible"
                        }
                    }
                }}
            >
                <DialogContent
                    sx={{
                        p: 0,
                        bgcolor: "transparent",
                        display: "flex",
                        justifyContent: "center"
                    }}
                >
                    {perfilPreview && (
                        <CardJogador
                            perfil={perfilPreview.perfil}
                            codigo={perfilPreview.codigo}
                            saldo={perfilPreview.saldo}
                            funcionarios={funcionarios}
                            equipados={previewEquipados}
                            preview
                        />
                    )}
                </DialogContent>
            </Dialog>

            {/* SNACKBAR */}
            <Snackbar
                open={snack.open}
                autoHideDuration={3000}
                onClose={() => setSnack({ ...snack, open: false })}
            >
                <Alert severity={snack.severity}>
                    {snack.message}
                </Alert>
            </Snackbar>

        </Container>
    );
}