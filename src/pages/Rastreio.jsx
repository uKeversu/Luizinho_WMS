import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useContext } from "react";

import {
    Container,
    Typography,
    Card,
    CardContent,
    Box,
    CircularProgress,
    Button,
    Chip,
    Divider,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Paper
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import QrCode2Icon from "@mui/icons-material/QrCode2";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";

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
import "../style/App.css";


function Rastreio({ tipo = "unidade" }) {

    const { dark } = useContext(ThemeContext);
    const navigate = useNavigate();

    const { codigo } = useParams();

    const [loading, setLoading] = useState(true);
    const [dados, setDados] = useState(null);


    // =====================================================
    // BUSCAR DADOS
    // =====================================================

    useEffect(() => {
        buscarDados();
    }, [codigo, tipo]);


    const buscarDados = async () => {

        try {

            setLoading(true);

            const data = await fakeRastreio(
                codigo,
                tipo
            );

            setDados(data);

        } catch (error) {

            console.error(error);
            setDados(null);

        } finally {

            setLoading(false);

        }
    };


    // =====================================================
    // CORES DOS EVENTOS
    // =====================================================

    const getCor = (tipoEvento) => {

        switch (tipoEvento) {

            case "COMPRA":
                return "primary.compra";

            case "PENDENTE":
                return "primary.pendentes";

            case "CONFERIDO":
                return "primary.conferidos";

            case "GUARDADO":
                return "primary.guardado";

            case "VENDIDO":
                return "primary.vendido";

            case "DEVOLVIDO":
                return "primary.devolvido";

            case "GARANTIA":
                return "primary.garantia";

            case "RETORNO":
                return "primary.retorno";

            default:
                return "primary.default";
        }
    };


    // =====================================================
    // IMAGENS DOS EVENTOS
    // =====================================================

    const etapasImagem = [
        {
            tipo: "COMPRA",
            label: "Compra",
            img: imgCompra
        },
        {
            tipo: "PENDENTE",
            label: "Recebimento",
            img: imgRecebimento
        },
        {
            tipo: "CONFERIDO",
            label: "Conferência",
            img: imgConferencia
        },
        {
            tipo: "GUARDADO",
            label: "Guarda",
            img: imgGuarda
        },
        {
            tipo: "VENDIDO",
            label: "Venda",
            img: imgVenda
        },
        {
            tipo: "DEVOLVIDO",
            label: "Devolução",
            img: imgDevolucao
        },
        {
            tipo: "GARANTIA",
            label: "Garantia",
            img: imgGarantia
        },
        {
            tipo: "RETORNO",
            label: "Retorno",
            img: imgRetorno
        }
    ];


    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {

        return (
            <Box
                sx={{
                    minHeight: "60vh",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center"
                }}
            >
                <CircularProgress />
            </Box>
        );
    }


    // =====================================================
    // NÃO ENCONTRADO
    // =====================================================

    if (!dados) {

        return (
            <Container sx={{ mt: 5 }}>

                <Card
                    sx={{
                        borderRadius: "2vh",
                        bgcolor: "background.card"
                    }}
                >

                    <CardContent>

                        <Typography
                            variant="h5"
                            sx={{ fontWeight: "bold", mb: 1 }}
                        >
                            {tipo === "grupo"
                                ? "Grupo não encontrado"
                                : "Item não encontrado"
                            }
                        </Typography>

                        <Typography color="text.secondary">
                            Não foi possível localizar os dados
                            solicitados.
                        </Typography>

                        <Button
                            startIcon={<ArrowBackIcon />}
                            onClick={() => navigate("/ConsultaGeral")}
                            sx={{ mt: 3 }}
                        >
                            Voltar
                        </Button>

                    </CardContent>

                </Card>

            </Container>
        );
    }


    // =====================================================
    // EVENTOS
    // =====================================================

    const eventosOrdenados = [...dados.eventos].sort(
        (a, b) =>
            new Date(a.data) - new Date(b.data)
    );

    const ultimoEvento =
        eventosOrdenados[eventosOrdenados.length - 1];


    const ehGrupo =
        dados.tipo === "grupo";


    // =====================================================
    // HEADER
    // =====================================================

    return (

        <Container
            maxWidth="lg"
            sx={{
                mt: 3,
                mb: 5
            }}
        >

            {/* =================================================
                CABEÇALHO
            ================================================= */}

            <Box
                sx={{
                    display: "flex",
                    flexDirection: {
                        xs: "column",
                        md: "row"
                    },
                    justifyContent: "space-between",
                    alignItems: {
                        xs: "flex-start",
                        md: "center"
                    },
                    gap: 2,

                    p: {
                        xs: 2,
                        md: 3
                    },

                    bgcolor: "var(--azul)",

                    mb: 3,

                    borderRadius: "2vh"
                }}
            >

                <Box>

                    <Typography
                        variant="h4"
                        sx={{
                            fontFamily: "Consolas",
                            color: "primary.branco",
                            fontWeight: "bold"
                        }}
                    >
                        Rastreio de mercadoria
                    </Typography>

                    <Typography
                        sx={{
                            color: "primary.branco",
                            opacity: 0.8,
                            mt: 0.5
                        }}
                    >
                        {ehGrupo
                            ? "Rastreabilidade do agrupamento"
                            : "Rastreabilidade da unidade"
                        }
                    </Typography>

                </Box>


                <Button
                    onClick={() => navigate("/ConsultaGeral")}
                    sx={{
                        color: "background.paper",
                        display: "flex",
                        gap: 1
                    }}
                    startIcon={<ArrowBackIcon />}
                >
                    Voltar
                </Button>

            </Box>


            {/* =================================================
                IDENTIFICAÇÃO
            ================================================= */}

            <Card
                sx={{
                    mb: 3,
                    borderRadius: "2vh",
                    bgcolor: "background.card",
                    boxShadow:
                        "0vh 0.1vh 0.8vh primary.sombra"
                }}
            >

                <CardContent>

                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: {
                                xs: "column",
                                md: "row"
                            },
                            justifyContent: "space-between",
                            gap: 3
                        }}
                    >

                        {/* LADO ESQUERDO */}

                        <Box
                            sx={{
                                display: "flex",
                                gap: 2,
                                alignItems: "center"
                            }}
                        >

                            <Box
                                sx={{
                                    width: 65,
                                    height: 65,
                                    borderRadius: "1.5vh",
                                    bgcolor: "var(--azul)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexShrink: 0
                                }}
                            >

                                {ehGrupo
                                    ? (
                                        <Inventory2Icon
                                            sx={{
                                                fontSize: 35,
                                                color: "white"
                                            }}
                                        />
                                    )
                                    : (
                                        <QrCode2Icon
                                            sx={{
                                                fontSize: 35,
                                                color: "white"
                                            }}
                                        />
                                    )
                                }

                            </Box>


                            <Box>

                                <Typography
                                    variant="overline"
                                    color="text.secondary"
                                >
                                    {ehGrupo
                                        ? "ID DO GRUPO"
                                        : "ID DA UNIDADE"
                                    }
                                </Typography>

                                <Typography
                                    variant="h5"
                                    sx={{
                                        fontWeight: "bold",
                                        fontFamily: "Consolas"
                                    }}
                                >
                                    {ehGrupo
                                        ? dados.id_grupo
                                        : dados.id_unico
                                    }
                                </Typography>

                            </Box>

                        </Box>


                        {/* STATUS */}

                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center"
                            }}
                        >

                            <Chip
                                icon={<CheckCircleIcon />}
                                label={ultimoEvento?.tipo || "SEM STATUS"}
                                sx={{
                                    fontWeight: "bold",
                                    px: 1
                                }}
                                color="primary"
                            />

                        </Box>

                    </Box>


                    <Divider sx={{ my: 3 }} />


                    {/* INFORMAÇÕES */}

                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: {
                                xs: "1fr",
                                sm: "1fr 1fr",
                                md: "repeat(3, 1fr)"
                            },
                            gap: 2
                        }}
                    >

                        <InfoItem
                            titulo="Código"
                            valor={dados.codigo}
                        />

                        {dados.descricao && (
                            <InfoItem
                                titulo="Descrição"
                                valor={dados.descricao}
                            />
                        )}

                        <InfoItem
                            titulo="Nota Fiscal"
                            valor={`${dados.numero}/${dados.serie}`}
                        />

                        <InfoItem
                            titulo="Localização"
                            valor={dados.localizacao}
                        />

                        {ehGrupo && (
                            <InfoItem
                                titulo="Quantidade"
                                valor={`${dados.quantidade} unidades`}
                            />
                        )}

                        {!ehGrupo && (
                            <InfoItem
                                titulo="Tipo"
                                valor="Unidade individual"
                            />
                        )}

                    </Box>

                </CardContent>

            </Card>


            {/* =================================================
                UNIDADES DO GRUPO
            ================================================= */}

            {ehGrupo && (

                <Card
                    sx={{
                        mb: 3,
                        borderRadius: "2vh",
                        bgcolor: "background.card",
                        boxShadow:
                            "0vh 0.1vh 0.8vh primary.sombra"
                    }}
                >

                    <CardContent>

                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                mb: 2
                            }}
                        >

                            <Box>

                                <Typography
                                    variant="h6"
                                    sx={{
                                        fontWeight: "bold"
                                    }}
                                >
                                    Unidades do grupo
                                </Typography>

                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    Unidades pertencentes a este
                                    agrupamento
                                </Typography>

                            </Box>


                            <Chip
                                icon={<Inventory2Icon />}
                                label={`${dados.unidades?.length || 0} unidades`}
                            />

                        </Box>


                        <Divider />


                        <List
                            disablePadding
                            sx={{ mt: 1 }}
                        >

                            {dados.unidades?.map(
                                (unidade, index) => (

                                    <ListItem
                                        key={unidade.id_unico}
                                        divider={
                                            index !==
                                            dados.unidades.length - 1
                                        }
                                        sx={{
                                            py: 1.5,
                                            px: 1,

                                            "&:hover": {
                                                bgcolor:
                                                    "action.hover"
                                            }
                                        }}
                                    >

                                        <ListItemIcon>

                                            <QrCode2Icon
                                                color="primary"
                                            />

                                        </ListItemIcon>


                                        <ListItemText
                                            primary={
                                                <Typography
                                                    sx={{
                                                        fontFamily:
                                                            "Consolas",
                                                        fontWeight:
                                                            "bold"
                                                    }}
                                                >
                                                    {unidade.id_unico}
                                                </Typography>
                                            }
                                            secondary={
                                                unidade.status ||
                                                "Sem status"
                                            }
                                        />


                                        <Button
                                            variant="outlined"
                                            size="small"
                                            endIcon={
                                                <OpenInNewIcon />
                                            }
                                            onClick={() =>
                                                navigate(
                                                    `/Rastreio/${unidade.id_unico}`
                                                )
                                            }
                                        >
                                            Ver rastreio
                                        </Button>

                                    </ListItem>

                                )
                            )}

                        </List>

                    </CardContent>

                </Card>

            )}


            {/* =================================================
                HISTÓRICO
            ================================================= */}

            <Card
                sx={{
                    borderRadius: "2vh",
                    bgcolor: "background.card",
                    boxShadow:
                        "0vh 0.1vh 0.8vh primary.sombra"
                }}
            >

                <CardContent>

                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            mb: 1
                        }}
                    >

                        <LocalShippingIcon
                            color="primary"
                        />

                        <Typography
                            variant="h6"
                            sx={{
                                fontWeight: "bold"
                            }}
                        >
                            Histórico
                        </Typography>

                    </Box>


                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 3 }}
                    >
                        {ehGrupo
                            ? `Histórico do grupo ${dados.id_grupo}`
                            : `Histórico da unidade ${dados.id_unico}`
                        }
                    </Typography>


                    <Box>

                        {eventosOrdenados.map(
                            (evento, index) => {

                                const etapa =
                                    etapasImagem.find(
                                        e =>
                                            e.tipo ===
                                            evento.tipo
                                    );

                                const ultimo =
                                    index ===
                                    eventosOrdenados.length - 1;

                                return (

                                    <Box
                                        key={index}
                                        sx={{
                                            display: "flex",
                                            alignItems:
                                                "stretch"
                                        }}
                                    >

                                        {/* LINHA */}

                                        <Box
                                            sx={{
                                                display: "flex",
                                                flexDirection:
                                                    "column",
                                                alignItems:
                                                    "center",
                                                mr: 2,
                                                width: 18,
                                                flexShrink: 0
                                            }}
                                        >

                                            <Box
                                                sx={{
                                                    width: 14,
                                                    height: 14,
                                                    borderRadius:
                                                        "50%",
                                                    bgcolor:
                                                        getCor(
                                                            evento.tipo
                                                        ),
                                                    border:
                                                        "3px solid",
                                                    borderColor:
                                                        "background.card",
                                                    boxShadow:
                                                        "0 0 0 2px",
                                                    color:
                                                        getCor(
                                                            evento.tipo
                                                        )
                                                }}
                                            />


                                            {!ultimo && (

                                                <Box
                                                    sx={{
                                                        width: 3,
                                                        flex: 1,
                                                        bgcolor:
                                                            getCor(
                                                                eventosOrdenados[
                                                                    index + 1
                                                                ]?.tipo
                                                            ),
                                                        minHeight: 50,
                                                        opacity: 0.5
                                                    }}
                                                />

                                            )}

                                        </Box>


                                        {/* EVENTO */}

                                        <Paper
                                            elevation={0}
                                            sx={{
                                                flex: 1,
                                                mb: 2,
                                                borderRadius:
                                                    "1.5vh",
                                                bgcolor:
                                                    "background.default",
                                                border:
                                                    "1px solid",
                                                borderColor:
                                                    "divider",
                                                overflow:
                                                    "hidden"
                                            }}
                                        >

                                            <Box
                                                sx={{
                                                    display: "flex",
                                                    flexDirection: {
                                                        xs: "column",
                                                        sm: "row"
                                                    },
                                                    alignItems: {
                                                        xs: "flex-start",
                                                        sm: "center"
                                                    },
                                                    gap: 2,
                                                    p: 2
                                                }}
                                            >

                                                {/* IMAGEM */}

                                                {etapa?.img && (

                                                    <Box
                                                        component="img"
                                                        src={
                                                            etapa.img
                                                        }
                                                        alt={
                                                            evento.tipo
                                                        }
                                                        sx={{
                                                            width: {
                                                                xs: 90,
                                                                sm: 110
                                                            },
                                                            height: {
                                                                xs: 90,
                                                                sm: 110
                                                            },
                                                            objectFit:
                                                                "contain",
                                                            flexShrink: 0
                                                        }}
                                                    />

                                                )}


                                                {/* TEXTO */}

                                                <Box
                                                    sx={{
                                                        flex: 1
                                                    }}
                                                >

                                                    <Typography
                                                        variant="h6"
                                                        sx={{
                                                            fontWeight:
                                                                "bold"
                                                        }}
                                                    >
                                                        {evento.tipo}
                                                    </Typography>

                                                    <Typography
                                                        variant="body2"
                                                        color="text.secondary"
                                                        sx={{
                                                            mt: 0.5
                                                        }}
                                                    >
                                                        {evento.data}
                                                    </Typography>

                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            mt: 1,
                                                            fontWeight:
                                                                500
                                                        }}
                                                    >
                                                        Funcionário:{" "}
                                                        {
                                                            evento.funcionario
                                                        }
                                                    </Typography>

                                                </Box>


                                                {/* INDICADOR */}

                                                <Chip
                                                    label={
                                                        index ===
                                                            eventosOrdenados.length - 1
                                                            ? "Atual"
                                                            : "Concluído"
                                                    }
                                                    size="small"
                                                    color={
                                                        index ===
                                                            eventosOrdenados.length - 1
                                                            ? "primary"
                                                            : "default"
                                                    }
                                                />

                                            </Box>

                                        </Paper>

                                    </Box>

                                );
                            }
                        )}

                    </Box>

                </CardContent>

            </Card>

        </Container>
    );
}


// =========================================================
// COMPONENTE AUXILIAR
// =========================================================

function InfoItem({ titulo, valor }) {

    return (

        <Box
            sx={{
                p: 1.5,
                borderRadius: "1vh",
                bgcolor: "background.default"
            }}
        >

            <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                    display: "block",
                    mb: 0.3
                }}
            >
                {titulo}
            </Typography>

            <Typography
                sx={{
                    fontWeight: "bold",
                    wordBreak: "break-word"
                }}
            >
                {valor || "-"}
            </Typography>

        </Box>
    );
}


export default Rastreio;
