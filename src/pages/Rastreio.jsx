import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import {
    Container,
    Typography,
    Card,
    CardContent,
    Box,
    CircularProgress,
    Button
} from "@mui/material";

import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import imgCompra from "../assets/img/compras-icone.png";
import imgRecebimento from "../assets/img/recebimento-icone.png";
import imgConferencia from "../assets/img/conferencia-icone.png";
import imgGuarda from "../assets/img/guarda-icone.png";
import imgVenda from "../assets/img/venda-icone.png";
import imgDevolucao from "../assets/img/devolucao-icone.png";
import imgGarantia from "../assets/img/garantia-icone.png";
import imgRetorno from "../assets/img/retorno-icone.png";

import { fakeRastreio } from "../services/rastreioFakeAPI";

import { ThemeContext } from "../context/ThemeContext";
import '../style/App.css';

function Rastreio() {

    // Tema noturno
    const { dark, toggleTheme } = useContext(ThemeContext);

    // Acessar outras pages
    const navigate = useNavigate();

    // API Base
    const API = "http://192.168.1.185:8077";

    const { codigo } = useParams();

    const [loading, setLoading] = useState(true);
    const [dados, setDados] = useState(null);

    useEffect(() => {
        buscarDados();
    }, [codigo]);

    const buscarDados = async () => {
        try {
            setLoading(true);

            const data = await fakeRastreio(codigo);

            setDados(data);

        } catch (error) {
            console.error(error);
            setDados(null);
        } finally {
            setLoading(false);
        }
    };

    const getCor = (tipo) => {
        switch (tipo) {
            case "COMPRA": return "primary.compra";
            case "PENDENTE": return "primary.pendentes";
            case "CONFERIDO": return "primary.conferidos";
            case "GUARDADO": return "primary.guardado";
            case "VENDIDO": return "primary.vendido";
            case "DEVOLVIDO": return "primary.devolvido";
            case "GARANTIA": return "primary.garantia";
            case "RETORNO": return "primary.retorno";
            default: return "primary.default";
        }
    };

    const etapasImagem = [
        { tipo: "COMPRA", label: "Compra", img: imgCompra },
        { tipo: "PENDENTE", label: "Recebimento", img: imgRecebimento },
        { tipo: "CONFERIDO", label: "Conferência", img: imgConferencia },
        { tipo: "GUARDADO", label: "Guarda", img: imgGuarda },
        { tipo: "VENDIDO", label: "Venda", img: imgVenda },
        { tipo: "DEVOLVIDO", label: "Devolucao", img: imgDevolucao },
        { tipo: "GARANTIA", label: "Garantia", img: imgGarantia },
        { tipo: "RETORNO", label: "Retorno", img: imgRetorno }
    ];

    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!dados) {
        return (
            <Container sx={{ mt: 5, bgcolor: background.alerta }}>
                <Typography variant="h5">Item não encontrado</Typography>
            </Container>
        );
    }

    const eventosOrdenados = [...dados.eventos].sort(
        (a, b) => new Date(a.data) - new Date(b.data)
    );

    const ultimoEvento = eventosOrdenados[eventosOrdenados.length - 1];

    return (
        <Container sx={{ mt: 3 }}>
            <Box sx={{
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
            }}>
                <Typography variant="h4" sx={{ fontFamily: 'Consolas', color: "primary.branco" }}>
                    <strong>Rastreio de mercadoria</strong>
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'right', mr: '2vh' }}>
                    <Button
                        onClick={() => navigate("/ConsultaGeral")}
                        sx={{ color: "background.paper", display: 'flex', gap: 1 }}
                    >
                        Voltar
                        {< ArrowBackIcon />}
                    </Button>
                    <pre id="resultado"></pre>
                </Box>
            </Box>

            <Card sx={{ mb: 2, borderRadius: '1vh', bgcolor: 'background.card', boxShadow: '0vh 0.1vh 0.5vh primary.sombra', }}>
                <CardContent>
                    <Typography><strong>ID:</strong> {dados.id_unico}</Typography>
                    <Typography><strong>Código:</strong> {dados.codigo}</Typography>
                    <Typography><strong>LOC:</strong> {dados.localizacao}</Typography>
                    <Typography><strong>NF:</strong> {dados.numero}/{dados.serie}</Typography>
                    <Typography><strong>Status atual:</strong> {ultimoEvento.tipo}</Typography>
                </CardContent>
            </Card>

            <Typography variant="h6">Histórico do item {dados.codigo} com ID {dados.id_unico}</Typography>

            <Box sx={{ mt: 2 }}>
                {eventosOrdenados.map((evento, index) => {
                    const etapa = etapasImagem.find(e => e.tipo === evento.tipo);

                    return (
                        <Box key={index} sx={{ display: "flex", alignItems: "flex-start" }}>

                            <Box sx={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                mr: 2
                            }}>
                                <Box sx={{
                                    width: 12,
                                    height: 12,
                                    borderRadius: "50%",
                                    bgcolor: 'primary.default'
                                }} />

                                {index !== eventosOrdenados.length - 0 && (
                                    <Box sx={{
                                        width: 2,
                                        flex: 1,
                                        bgcolor: getCor(eventosOrdenados[index + 0]?.tipo),
                                        minHeight: 40
                                    }} />
                                )}
                            </Box>

                            <Card sx={{
                                mb: 2,
                                flex: 1,
                                borderRadius: '1vh',
                                bgcolor: 'background.card',
                                boxShadow: '0vh 0.1vh 0.5vh primary.sombra',
                            }}>

                                <CardContent sx={{ py: 1 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Box
                                            component="img"
                                            src={etapa?.img}
                                            alt={evento.tipo}
                                            sx={{
                                                minWidth: 120,
                                                minHeight: 120,
                                                maxWidth: 200,
                                                maxHeight: 200,
                                            }}
                                        />
                                        <Box sx={{ display: 'flex', margin: 'auto', flexDirection: 'column' }}>
                                            <Typography sx={{ fontWeight: "bold" }}>
                                                {evento.tipo}
                                            </Typography>
                                            <Typography variant="body2">
                                                {evento.data}
                                            </Typography>
                                            <Typography variant="body2">
                                                {evento.funcionario}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>

                        </Box>
                    )
                })}
            </Box>
        </Container>
    );
}

export default Rastreio;