import { useEffect, useState } from "react";
import {
    Container,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    CircularProgress,
    Box,
    Chip,
} from "@mui/material";

const API_NOTAS = "http://192.168.1.185:8077/api/notas/listar";
const API_ITENS = "http://192.168.1.185:8077/api/itens_nfe";

export default function Produtividade() {
    const [loading, setLoading] = useState(true);
    const [dados, setDados] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        carregarDados();
    }, []);

    const carregarDados = async () => {
        try {
            setLoading(true);

            const resNotas = await fetch(API_NOTAS);
            const notas = await resNotas.json();

            // Agrupar por conferente
            const mapa = {};

            for (const nota of notas) {
                const conf = nota.conferente || "SEM_CONFERENTE";

                if (!mapa[conf]) {
                    mapa[conf] = {
                        conferente: conf,
                        notas: 0,
                        itensPrevistos: 0,
                        itensConferidos: 0,
                    };
                }

                mapa[conf].notas += 1;
                mapa[conf].itensPrevistos += Number(nota.total_itens || 0);

                // busca itens reais da nota
                try {
                    const resItens = await fetch(`${API_ITENS}/${nota.id}`);
                    const data = await resItens.json();

                    const itens = data.items || [];

                    const conferidos = itens.filter(
                        (i) => i.status_item === "ITEM_CONFERIDO"
                    ).length;

                    const qtdConferida = itens.reduce(
                        (acc, i) => acc + Number(i.qtd_conferida || 0),
                        0
                    );

                    mapa[conf].itensConferidos += qtdConferida || conferidos;
                } catch (err) {
                    console.log("Erro itens nota:", nota.id);
                }
            }

            const resultado = Object.values(mapa).map((item) => {
                const produtividade =
                    item.itensPrevistos > 0
                        ? ((item.itensConferidos / item.itensPrevistos) * 100).toFixed(1)
                        : 0;

                return {
                    ...item,
                    produtividade,
                };
            });

            // ranking
            resultado.sort((a, b) => b.produtividade - a.produtividade);

            setDados(resultado);
        } catch (err) {
            console.error(err);
            setError("Erro ao carregar produtividade");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    mt: 10,
                }}
            >
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Container>
                <Typography color="error">{error}</Typography>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4 }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
                📊 Produtividade dos Conferentes
            </Typography>

            <Paper sx={{ borderRadius: 3, overflow: "hidden" }}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: "#111" }}>
                                <TableCell sx={{ color: "#fff" }}>Ranking</TableCell>
                                <TableCell sx={{ color: "#fff" }}>Conferente</TableCell>
                                <TableCell sx={{ color: "#fff" }}>Notas</TableCell>
                                <TableCell sx={{ color: "#fff" }}>Itens Prev.</TableCell>
                                <TableCell sx={{ color: "#fff" }}>Itens Conf.</TableCell>
                                <TableCell sx={{ color: "#fff" }}>Produtividade</TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {dados.map((row, index) => (
                                <TableRow key={row.conferente}>
                                    <TableCell>
                                        <Chip
                                            label={`#${index + 1}`}
                                            color={
                                                index === 0
                                                    ? "success"
                                                    : index === 1
                                                    ? "primary"
                                                    : "default"
                                            }
                                        />
                                    </TableCell>

                                    <TableCell fontWeight="bold">
                                        {row.conferente}
                                    </TableCell>

                                    <TableCell>{row.notas}</TableCell>

                                    <TableCell>{row.itensPrevistos}</TableCell>

                                    <TableCell>{row.itensConferidos}</TableCell>

                                    <TableCell>
                                        <Chip
                                            label={`${row.produtividade}%`}
                                            color={
                                                row.produtividade >= 90
                                                    ? "success"
                                                    : row.produtividade >= 60
                                                    ? "warning"
                                                    : "error"
                                            }
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </Container>
    );
}