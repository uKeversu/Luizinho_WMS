import { useState, useEffect } from "react";
import {
    Container,
    Typography,
    Card,
    CardContent,
    Grid,
    Box,
    Chip
} from "@mui/material";

function Alertas() {

    const API = "http://192.168.1.185:8077";

    const [notas, setNotas] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        buscarNotas();
    }, []);

    const buscarNotas = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API}/api/notas/listar`);
            const data = await response.json();

            if (response.ok) {
                setNotas(Array.isArray(data) ? data : []);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const diasEntre = (data) => {
        if (!data) return 0;
        const hoje = new Date();
        const d = new Date(data);
        const diff = Math.floor((hoje - d) / (1000 * 60 * 60 * 24));
        return diff;
    };

    const gerarAlertas = () => {
        let alertas = [];

        notas.forEach(nota => {

            // 1 - Recebida há mais de 2 dias e não conferida
            if (
                ["RECEBIDA", "FORNECEDOR_DIRETO"].includes(nota.status) &&
                diasEntre(nota.data_recebimento) > 2
            ) {
                alertas.push({
                    tipo: "ATRASO_CONFERENCIA",
                    mensagem: "Nota aguardando conferência há mais de 2 dias",
                    nota
                });
            }

            // 2 - CFOP de garantia
            if (nota.cfop && nota.cfop.toString().startsWith("59")) {
                alertas.push({
                    tipo: "CFOP_GARANTIA",
                    mensagem: "Nota com CFOP de garantia",
                    nota
                });
            }

            // 3 - Conferida há mais de 7 dias e não guardada
            if (
                nota.status === "CONFERIDA" &&
                diasEntre(nota.data_conferencia) > 7
            ) {
                alertas.push({
                    tipo: "GUARDA_PENDENTE",
                    mensagem: "Nota conferida há mais de 7 dias e não guardada",
                    nota
                });
            }

        });

        return alertas;
    };

    const alertas = gerarAlertas();

    const corAlerta = (tipo) => {
        switch (tipo) {
            case "ATRASO_CONFERENCIA": return "#ff9800";
            case "CFOP_GARANTIA": return "#9c27b0";
            case "GUARDA_PENDENTE": return "#f44336";
            default: return "#607d8b";
        }
    };

    return (
        !token ? (
            <LoginFuncionario
                onLogin={(data) => {
                    localStorage.setItem("nfe_token", data.token);

                    const user = {
                        nome: data.nome,
                        codigo: data.codigo
                    };

                    localStorage.setItem("user_info", JSON.stringify(user));

                    setUserInfo(user);
                    setToken(data.token);
                }}
            />
        ) : (
            <Container maxWidth="100%" sx={{ mt: 4, bgcolor: '#FFFFFF' }}>
                {/* Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2, bgcolor: '#007bff', height: '7vh' }}>
                    <Typography variant="h4" sx={{ fontFamily: 'Consolas', color: '#FFFFFF' }}>
                        <strong>Recebimento de mercadorias</strong>
                    </Typography>
                    <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'right', mr: '0' }}>
                            {<PersonIcon sx={{ color: "#FFFFFF", paddingRight: '1vh' }} />}
                            <Typography sx={{ color: '#FFFFFF', fontSize: '0.9rem', display: 'flex', alignItems: 'center' }}>
                                {userInfo?.nome}
                            </Typography>
                            {token && (
                                <Button
                                    size="small"
                                    onClick={logout}
                                    sx={{ color: '#FFFFFF', display: 'flex', gap: 1 }}
                                >{<LogoutIcon />}
                                </Button>
                            )}
                        </Box>
                        <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'right', mr: '2vh' }}>
                            <Button
                                onClick={() => setOpenDialog(true)}
                                sx={{ color: '#ffffff', display: 'flex', gap: 1 }}
                            >
                                CADASTRAR FUNCIONARIO
                                {< PersonAddIcon />}
                            </Button>
                            <Button
                                id="btnAtualizar" onClick={pegarLocal}
                                size="small"
                                sx={{ color: '#ffffff', display: 'flex', gap: 1 }}>
                                SS Plus Sync
                                {<SyncIcon />}
                            </Button>
                            <Button
                                onClick={() => navigate("/Dashboard")}
                                sx={{ color: '#ffffff', display: 'flex', gap: 1 }}
                            >
                                NOTAS RECEBIDAS
                                {< ArticleIcon />}
                            </Button>
                            <pre id="resultado"></pre>
                        </Box>
                    </Box>
                </Box>

                {loading ? (
                    <Typography>Carregando...</Typography>
                ) : alertas.length === 0 ? (
                    <Typography>Nenhum alerta encontrado</Typography>
                ) : (
                    <Grid container spacing={3}>

                        {alertas.map((alerta, idx) => (
                            <Grid item xs={12} md={3} key={idx}>
                                <Card sx={{
                                    borderRadius: "2vh",
                                    boxShadow: "0vh 0.1vh 0.5vh #000000",
                                    borderLeft: `6px solid ${corAlerta(alerta.tipo)}`
                                }}>
                                    <CardContent>

                                        <Typography variant="h6">
                                            NF: {alerta.nota.numero}
                                        </Typography>

                                        <Typography sx={{ fontSize: "0.8rem" }}>
                                            Série: {alerta.nota.serie}
                                        </Typography>

                                        <Typography sx={{
                                            fontSize: "0.8rem",
                                            whiteSpace: "nowrap",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis"
                                        }}>
                                            Fornecedor: {alerta.nota.fornecedor}
                                        </Typography>

                                        <Box sx={{ mt: 2 }}>
                                            <Chip
                                                label={alerta.mensagem}
                                                sx={{
                                                    bgcolor: corAlerta(alerta.tipo),
                                                    color: "#fff",
                                                    fontWeight: "bold"
                                                }}
                                            />
                                        </Box>

                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}

                    </Grid>
                )}
            </Container>
        )
    );
};

export default Alertas;