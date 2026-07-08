import { useState, useMemo, useContext, useEffect } from "react";
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
    Alert
} from "@mui/material";

import {
    Storefront,
    MonetizationOn,
    ArrowBack
} from "@mui/icons-material";

import PersonIcon from '@mui/icons-material/Person';

import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
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

            const itensFormatados = lojaRes.data.items.map(item => {

                const equipadoAtual = perfil.equipados?.[item.categoria];

                return {
                    ...item,
                    possui: false, // inventário
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

    // 🎮 EQUIPAR
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

                                <Card sx={{ height: "100%", bgcolor: 'background.default', mb: 5 }}>
                                    <CardContent sx={{ textAlign: "center" }}>

                                        <Typography sx={{ fontSize: 70 }}>
                                            {item.icone}
                                        </Typography>

                                        <Typography variant="h6" fontWeight="bold">
                                            {item.nome}
                                        </Typography>

                                        <Typography variant="body2" sx={{ opacity: 0.6 }}>
                                            {item.rarity || item.raridade}
                                        </Typography>

                                        <Chip
                                            sx={{ mt: 2, color: 'white' }}
                                            color="warning"
                                            label={`${item.preco.toLocaleString()} SigelCoins`}
                                        />

                                        <Box mt={3}>

                                            {item.equipado ? (
                                                <Button
                                                    fullWidth
                                                    variant="contained"
                                                    color="success"
                                                >
                                                    Equipado
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

                                            {/* Equipar só se já tiver */}
                                            {!item.equipado && (
                                                <Button
                                                    fullWidth
                                                    sx={{ mt: 1 }}
                                                    variant="outlined"
                                                    onClick={() => equipar(item)}
                                                >
                                                    Equipar
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