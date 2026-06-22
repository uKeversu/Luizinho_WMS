import { useState, useEffect, useRef } from "react";
import {
    Container,
    Typography,
    Card,
    CardContent,
    Grid,
    Button,
    Box,
    CircularProgress,
    Snackbar,
    Alert,
    Backdrop,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from "@mui/material";

import RefreshIcon from "@mui/icons-material/Refresh";
import ClearIcon from "@mui/icons-material/Clear";
import SearchIcon from "@mui/icons-material/Search";

import LoginFuncionario from "../components/LoginFuncionario";

function RetiradaParaVenda() {

    const API = "http://192.168.1.185:8077";

    const [token, setToken] = useState(
        () => localStorage.getItem("nfe_token") || ""
    );

    const [userInfo, setUserInfo] = useState(() => {
        const user = localStorage.getItem("user_info");
        return user ? JSON.parse(user) : null;
    });

    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

    const [chaveAcesso, setChaveAcesso] = useState("");
    const [produto, setProduto] = useState("");
    const [condicional, setCondicional] = useState("");
    const [funcionario, setFuncionario] = useState("");

    const [nota, setNota] = useState(null);
    const [itensNota, setItensNota] = useState([]);
    const [itemSelecionado, setItemSelecionado] = useState(null);

    const chaveRef = useRef(null);
    const produtoRef = useRef(null);
    const condicionalRef = useRef(null);
    const funcionarioRef = useRef(null);

    const condicionalValida = /^C\d{23}$/;

    useEffect(() => {
        chaveRef.current?.focus();
    }, []);

    const buscarNota = async () => {

        const response = await fetch(
            `${API}/api/notas/listar?chave_acesso=${chaveAcesso}`,
            {
                headers: {
                    "X-Auth-Token": token
                }
            }
        );

        const data = await response.json();

        if (!data.data?.length) {

            setSnackbar({
                open: true,
                severity: "error",
                message: "Nota não encontrada"
            });

            setChaveAcesso("");

            setTimeout(() => {
                chaveRef.current?.focus();
            }, 50);

            return;
        }

        const nota = data.data[0];

        setNota(nota);
        await buscarItensNota(nota.id);
        setTimeout(() => {
            produtoRef.current?.focus();
        }, 50);

    };

    const buscarItensNota = async (notaId) => {

        const response = await fetch(
            `${API}/api/itens_nfe/${notaId}`,
            {
                headers: {
                    "X-Auth-Token": token
                }
            }
        );

        const data = await response.json();

        if (!data.items?.length) {
            setSnackbar({
                open: true,
                severity: "error",
                message: "Nenhum item encontrado para esta NF"
            });

            setNota(null);
            return;
        }

        setItensNota(data.items || []);
    };

    const localizarProduto = () => {

        const item = itensNota.find(
            item =>
                String(item.cean).trim() ===
                String(produto).trim()
        );

        if (!item) {

            setSnackbar({
                open: true,
                severity: "error",
                message: "Produto não pertence à NF"
            });

            setProduto("");

            setTimeout(() => {
                produtoRef.current?.focus();
            }, 50);

            return;
        }

        setItemSelecionado(item);

        setTimeout(() => {
            condicionalRef.current?.focus();
        }, 50);
    };

    const registrarLog = async ({
        item = null,
        acao,
        observacao = ""
    }) => {

        try {

            console.log({
                nota: nota,
                nota_id: nota.id,
                usuario: funcionario,
                acao,
                cod_produto: item?.basico ?? null,
                cod_barras: item?.cean ?? null,
                observacoes: observacao
            });

            const response = await fetch(
                `${API}/api/nfe/item/movimentacao/log`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-Auth-Token": token
                    },
                    body: JSON.stringify({
                        nota_id: nota.id,
                        usuario: funcionario,
                        acao,
                        cod_produto: item?.basico ?? null,
                        cod_barras: item?.cean ?? null,
                        observacoes: observacao ?? null,
                        quantidade: 1,
                    })
                }
            );

            console.log("ENVIANDO LOG:", acao)
            if (!response.ok) {
                const text = await response.text();
                throw new Error(text);
            }

        } catch (error) {
            console.error("Erro ao enviar log: ", error);
        }
    };

    const registrarRetirada = async () => {

        try {

            await registrarLog({
                item: itemSelecionado,
                acao: "Retirado para venda",
                observacao:
                    `Condicional ${condicional} | ` +
                    `Item ${itemSelecionado?.basico}`
            });

            setSnackbar({
                open: true,
                severity: "success",
                message: "Retirada registrada com sucesso"
            });

            setChaveAcesso("");
            setProduto("");
            setCondicional("");
            setFuncionario("");

            setNota(null);
            setItensNota([]);
            setItemSelecionado(null);

            chaveRef.current?.focus();

            setTimeout(() => {
                chaveRef.current?.focus();
            }, 100);

        } catch (error) {

            console.error(error);

        }
    };

    return (
        <Container maxWidth="md" sx={{ mt: 10 }}>

            <Card sx={{ bgcolor: 'background.default' }}>
                <CardContent>

                    <Typography
                        variant="h4"
                        fontWeight="bold"
                        mb={3}
                    >
                        RETIRADA PARA VENDA
                    </Typography>

                    <Grid container spacing={2}>

                        <Grid size={12}>
                            <TextField
                                inputRef={chaveRef}
                                onFocus={(e) => e.target.select()}
                                fullWidth
                                label="Chave de Acesso da Nota"
                                value={chaveAcesso}
                                onChange={(e) =>
                                    setChaveAcesso(e.target.value)
                                }
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        buscarNota();
                                    }
                                }}
                            />
                        </Grid>

                        <Grid size={12}>
                            <TextField
                                inputRef={produtoRef}
                                onFocus={(e) => e.target.select()}
                                fullWidth
                                label="Código de Barras do Produto"
                                value={produto}
                                onChange={(e) =>
                                    setProduto(e.target.value)
                                }
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        localizarProduto();
                                    }
                                }}
                                disabled={!nota}
                            />
                        </Grid>

                        <Grid size={12}>
                            <TextField
                                inputRef={condicionalRef}
                                fullWidth
                                label="Código da Condicional"
                                value={condicional}
                                error={
                                    condicional.length > 0 &&
                                    !condicionalValida.test(condicional)
                                }
                                helperText={
                                    condicional.length > 0 &&
                                        !condicionalValida.test(condicional)
                                        ? "Formato esperado: C00010178531640529000002"
                                        : ""
                                }
                                onChange={(e) =>
                                    setCondicional(e.target.value.toUpperCase())
                                }
                                onKeyDown={(e) => {

                                    if (e.key !== "Enter") return;

                                    if (!condicionalValida.test(condicional)) {

                                        setSnackbar({
                                            open: true,
                                            severity: "error",
                                            message: "Código de condicional inválido"
                                        });

                                        return;
                                    }

                                    funcionarioRef.current?.focus();
                                }}
                                disabled={!itemSelecionado}
                            />
                        </Grid>

                        <Grid size={12}>
                            <TextField
                                inputRef={funcionarioRef}
                                onFocus={(e) => e.target.select()}
                                fullWidth
                                label="Código do Funcionário"
                                value={funcionario}
                                onChange={(e) =>
                                    setFuncionario(
                                        e.target.value
                                            .replace(/\D/g, "")
                                            .slice(0, 7)
                                    )
                                }
                                onKeyDown={(e) => {
                                    if (
                                        e.key === "Enter" &&
                                        /^\d{7}$/.test(funcionario)
                                    ) {
                                        registrarRetirada();
                                    }
                                }}
                                disabled={
                                    !itemSelecionado ||
                                    !condicionalValida.test(condicional)
                                }
                            />
                        </Grid>

                    </Grid>

                    {nota && (
                        <Box mt={3}>
                            <Typography variant="h6">
                                NF: {nota.numero}
                            </Typography>

                            <Typography>
                                Fornecedor: {nota.fornecedor}
                            </Typography>
                        </Box>
                    )}

                    {itemSelecionado && (
                        <Card sx={{ mt: 2, bgcolor: 'background.alerta' }}>
                            <CardContent>

                                <Typography variant="h6">
                                    Produto Selecionado
                                </Typography>

                                <Typography>
                                    Código: {itemSelecionado?.basico}
                                </Typography>

                                <Typography>
                                    {itemSelecionado?.descricao}
                                </Typography>

                                <Typography>
                                    Código de barras: {itemSelecionado?.cean}
                                </Typography>

                                <Typography>
                                    Quantidade:
                                    {" "}
                                    {itemSelecionado?.quantidade_comercial}
                                    {" "}
                                    {itemSelecionado?.unidade_comercial}
                                </Typography>

                            </CardContent>
                        </Card>
                    )}

                    <Button
                        fullWidth
                        sx={{ mt: 3, height: 60, color: "primary.branco", bgcolor: 'primary.confirmar', '&:hover': { bgcolor: 'primary.confirmarHover' } }}
                        variant="contained"
                        disabled={
                            !nota ||
                            !itemSelecionado ||
                            !condicionalValida.test(condicional) ||
                            !/^\d{7}$/.test(funcionario)
                        }
                        onClick={registrarRetirada}
                    >
                        CONFIRMAR RETIRADA
                    </Button>

                </CardContent>
            </Card>

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

export default RetiradaParaVenda;