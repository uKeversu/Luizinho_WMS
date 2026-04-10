import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import {
    Container,
    Typography,
    Card,
    CardContent,
    Box,
    CircularProgress
} from "@mui/material";

import { fakeRastreio } from "../services/rastreioFakeAPI";

function Rastreio() {
    const { codigo } = useParams();

    const [loading, setLoading] = useState(true);
    const [dados, setDados] = useState(null);

    const API = "http://192.168.1.184:8077";

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

    {/*const buscarDados = async () => {
        try {
            setLoading(true);

            const response = await fetch(`${API}/api/rastreio/${codigo}`);
            const data = await response.json();

            if (response.ok) {
                setDados(data);
            } else {
                setDados(null);
            }

        } catch (error) {
            console.error(error);
            setDados(null);
        } finally {
            setLoading(false);
        }
    };*/}

    const getCor = (tipo) => {
        switch (tipo) {
            case "PENDENTE": return "#6c757d";
            case "CONFERIDO": return "#007bff";
            case "GUARDADO": return "#28a745";
            case "VENDIDO": return "#a72828";
            case "DEVOLVIDO": return "#b8dc35";
            default: return "#007bff";
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!dados) {
        return (
            <Container sx={{ mt: 5 }}>
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
            <Box sx={{ gap: 2, p: 2, bgcolor: '#007bff', mb: 5 }}>
                <Typography variant="h4" sx={{ fontFamily: 'Consolas', color: '#FFFFFF' }}>
                    <strong>Rastreio de mercadoria</strong>
                </Typography>
            </Box>

            <Card sx={{ mb: 2, borderRadius: '1vh', boxShadow: '0vh 0.1vh 0.5vh #7e7e7e', }}>
                <CardContent>
                    <Typography><strong>Código:</strong> {dados.codigo}</Typography>
                    <Typography><strong>Descrição:</strong> {dados.descricao}</Typography>
                    <Typography><strong>Localização:</strong> {dados.localizacao}</Typography>
                    <Typography><strong>Status atual:</strong> {ultimoEvento.tipo}</Typography>
                </CardContent>
            </Card>

            <Typography variant="h6">Histórico</Typography>

            <Box sx={{ mt: 2 }}>
                {eventosOrdenados.map((evento, index) => (
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
                                bgcolor: '#007bff'
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
                            boxShadow: '0vh 0.1vh 0.5vh #7e7e7e',
                        }}>
                            <CardContent sx={{ py: 1 }}>
                                <Typography sx={{ fontWeight: "bold" }}>
                                    {evento.tipo}
                                </Typography>
                                <Typography variant="body2">
                                    {evento.data}
                                </Typography>
                            </CardContent>
                        </Card>

                    </Box>
                ))}
            </Box>
        </Container>
    );
}

export default Rastreio;