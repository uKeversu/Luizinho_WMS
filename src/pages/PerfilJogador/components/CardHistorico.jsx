import { useState } from "react";

import {
    Card,
    Typography,
    Box,
    Divider,
    Chip,
    Table,
    TableHead,
    TableBody,
    TableCell,
    TableContainer,
    TableRow,
    Paper,
    Avatar,
    LinearProgress,
    Button,
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
} from "@mui/material";

import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import CollectionsBookmarkIcon from "@mui/icons-material/CollectionsBookmark";
import CloseIcon from "@mui/icons-material/Close";

import { estiloCard, tituloCard } from "../styles";

export default function CardHistorico({

    historico = [],
    conquistas = [],
    colecoes = []

}) {

    const [openConquistas, setOpenConquistas] = useState(false);

    function corPosicao(posicao) {

        if (posicao === 1)
            return "#e7c505";

        if (posicao === 2)
            return "#C0C0C0";

        if (posicao === 3)
            return "#CD7F32";

        return "#90caf9";

    }

    const colecoesIniciadas = colecoes.filter(
        (c) => c.itens_usuario > 0
    );

    const conquistasDesbloqueadas = conquistas.filter(
        (c) => c.desbloqueada
    );

    const coresRaridade = {
        COMUM: "#8d99ae",
        RARO: "#42a5f5",
        EPICO: "#ab47bc",
        LENDARIO: "#FFD700"
    };

    const ordemRaridade = {
        LENDARIO: 4,
        EPICO: 3,
        RARO: 2,
        COMUM: 1
    };

    const ordenarConquistas = (lista) =>
        [...lista].sort((a, b) => {
            const raridade =
                (ordemRaridade[b.raridade] || 0) -
                (ordemRaridade[a.raridade] || 0);

            if (raridade !== 0) return raridade;

            // Desempate pela ordem cadastrada no banco
            return (a.ordem || 9999) - (b.ordem || 9999);
        });

    const conquistasOrdenadas = ordenarConquistas(conquistas);
    const conquistasDesbloqueadasOrdenadas = ordenarConquistas(
        conquistasDesbloqueadas
    );

    const porcentagem = (
        conquistasDesbloqueadas.length /
        conquistas.length
    ) * 100;


    return (

        <Card
            sx={{
                ...estiloCard,
                height: "100%",
                mb: 5
            }}
        >

            <Typography sx={tituloCard}>
                HISTÓRICO
            </Typography>

            {/* ============================ */}
            {/* TEMPORADAS */}
            {/* ============================ */}

            <Box
                display="flex"
                alignItems="center"
                gap={1}
                mb={2}
            >

                <EmojiEventsIcon
                    sx={{ color: "#FFD700" }}
                />

                <Typography
                    fontWeight="bold"
                    color="white"
                >
                    Histórico de Temporadas
                </Typography>

            </Box>

            {

                historico.length === 0 ?

                    <Typography color="gray">

                        Nenhuma temporada disputada.

                    </Typography>

                    :

                    <TableContainer
                        component={Paper}
                        sx={{
                            bgcolor: "#101826",
                            mb: 3
                        }}
                    >

                        <Table size="small">

                            <TableHead>

                                <TableRow>

                                    <TableCell>Temporada</TableCell>

                                    <TableCell>Posição</TableCell>

                                    <TableCell>XP</TableCell>

                                    <TableCell>Pontos</TableCell>

                                </TableRow>

                            </TableHead>

                            <TableBody>

                                {

                                    historico.map((t) => (

                                        <TableRow
                                            key={t.temporada_id}
                                        >

                                            <TableCell>

                                                {t.nome}

                                            </TableCell>

                                            <TableCell>

                                                <Chip

                                                    label={`#${t.posicao}`}

                                                    sx={{

                                                        bgcolor:
                                                            corPosicao(t.posicao),

                                                        color: "#000",

                                                        fontWeight: 700

                                                    }}

                                                />

                                            </TableCell>

                                            <TableCell>

                                                {t.xp.toLocaleString()}

                                            </TableCell>

                                            <TableCell>

                                                {t.pontos.toLocaleString()}

                                            </TableCell>

                                        </TableRow>

                                    ))

                                }

                            </TableBody>

                        </Table>

                    </TableContainer>

            }

            <Divider sx={{ my: 2 }} />

            {/* ============================ */}
            {/* CONQUISTAS */}
            {/* ============================ */}

            <Box mt={2}>

                <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    mb={3}
                >

                    <Box display="flex" alignItems="center" gap={1}>

                        <WorkspacePremiumIcon
                            sx={{
                                color: "#FFD700",
                                fontSize: 28
                            }}
                        />

                        <Box>

                            <Typography
                                color="white"
                                fontWeight={700}
                            >
                                Conquistas
                            </Typography>

                        </Box>

                    </Box>

                    <Chip
                        color="warning"
                        label={`⭐ ${conquistasDesbloqueadas.length} desbloqueada(s)`}
                    />
                    <Button
                        variant="outlined"
                        onClick={() => setOpenConquistas(true)}
                        sx={{
                            borderColor: "#FFD700",
                            color: "#FFD700",
                            "&:hover": {
                                borderColor: "#FFE066",
                                bgcolor: "rgba(255,215,0,.08)"
                            }
                        }}
                    >
                        Ver Todas
                    </Button>
                </Box>

                {
                    conquistasDesbloqueadas.length === 0 ?

                        <Card
                            sx={{
                                bgcolor: "#111827",
                                border: "1px dashed rgba(255,255,255,.2)",
                                py: 6,
                                textAlign: "center"
                            }}
                        >

                            <Typography
                                fontSize={70}
                            >
                                🏆
                            </Typography>

                            <Typography
                                color="white"
                                fontWeight={700}
                            >
                                Nenhuma conquista desbloqueada
                            </Typography>

                            <Typography
                                color="gray"
                                mt={1}
                            >
                                Continue conferindo itens para começar sua coleção.
                            </Typography>

                        </Card>
                        :
                        <Box
                            display="grid"
                            gridTemplateColumns={{
                                xs: "1fr",
                                md: "repeat(2,1fr)",
                                lg: "repeat(3,1fr)"
                            }}
                            gap={2}
                        >
                            {
                                conquistasDesbloqueadasOrdenadas
                                    .slice(0, 6)
                                    .map((c) => (

                                        <Card
                                            key={c.id}
                                            sx={{
                                                bgcolor: "#111827",
                                                border: `2px solid ${coresRaridade[c.raridade] || "#444"}`,
                                                position: "relative",
                                                overflow: "hidden",
                                                transition: ".25s",
                                                display: "flex",
                                                "&:hover": {
                                                    transform: "translateY(-4px)",
                                                    boxShadow: `0 0 18px ${coresRaridade[c.raridade] || "#666"}55`
                                                }
                                            }}
                                        >
                                            <Box
                                                display="flex"
                                                flexDirection="column"
                                                alignItems="center"
                                                p={3}
                                                sx={{
                                                    flex: 1
                                                }}
                                            >
                                                <Avatar
                                                    sx={{
                                                        width: 82,
                                                        height: 82,
                                                        fontSize: 46,
                                                        bgcolor: `${coresRaridade[c.raridade] || "#666"}22`,
                                                        border: `2px solid ${coresRaridade[c.raridade] || "#666"}`,
                                                        mb: 2
                                                    }}
                                                >
                                                    {c.icone}
                                                </Avatar>

                                                <Typography
                                                    color="white"
                                                    fontWeight={700}
                                                    textAlign="center"
                                                >
                                                    {c.nome}
                                                </Typography>

                                                <Typography
                                                    color="gray"
                                                    fontSize={13}
                                                    textAlign="center"
                                                    mt={1}
                                                >
                                                    {c.descricao}
                                                </Typography>

                                                <Box
                                                    mt="auto"
                                                    pt={2}
                                                    width="100%"
                                                    textAlign="center"
                                                >
                                                    <Chip
                                                        sx={{
                                                            bgcolor: `${coresRaridade[c.raridade] || "#666"}22`,
                                                            color: coresRaridade[c.raridade] || "#fff",
                                                            fontWeight: 700
                                                        }}
                                                        label={c.raridade}
                                                    />
                                                    <Divider sx={{ my: 1 }} />

                                                    <Typography
                                                        color="gray"
                                                        fontSize={12}
                                                    >
                                                        Desbloqueada em
                                                    </Typography>

                                                    <Typography
                                                        color="white"
                                                        fontSize={13}
                                                        fontWeight={600}
                                                    >
                                                        {new Date(
                                                            c.data_desbloqueio
                                                        ).toLocaleDateString("pt-BR")}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Card>
                                    ))
                            }
                        </Box>
                }
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* ============================ */}
            {/* COLEÇÕES */}
            {/* ============================ */}

            <Box

                display="flex"

                alignItems="center"

                gap={1}

                mb={2}

            >

                <CollectionsBookmarkIcon
                    sx={{ color: "#42a5f5" }}
                />

                <Typography

                    color="white"

                    fontWeight="bold"

                >

                    Coleções

                </Typography>

            </Box>

            {
                colecoesIniciadas.length === 0 ?
                    <Typography color="gray">
                        Nenhuma coleção encontrada.
                    </Typography>
                    :
                    colecoesIniciadas.map((c) => (
                        <Card
                            key={c.id}
                            sx={{
                                bgcolor: "#111827",
                                p: 2,
                                mb: 2,
                                border: "1px solid rgba(255,255,255,.08)"
                            }}
                        >

                            <Box
                                display="flex"
                                justifyContent="space-between"
                                alignItems="center"
                                mb={1}
                            >

                                <Typography
                                    color="white"
                                    fontWeight="bold"
                                >
                                    {c.nome}
                                </Typography>

                                <Chip
                                    size="small"
                                    color={c.completa ? "success" : "default"}
                                    label={
                                        c.completa
                                            ? "COMPLETA"
                                            : `${c.itens_usuario}/${c.total_itens}`
                                    }
                                />

                            </Box>

                            <LinearProgress
                                variant="determinate"
                                value={c.progresso}
                                sx={{
                                    height: 8,
                                    borderRadius: 4,
                                    mb: 1
                                }}
                            />

                            <Typography
                                color="gray"
                                fontSize={12}
                            >
                                {c.itens_usuario} de {c.total_itens} itens coletados
                            </Typography>

                        </Card>

                    ))
            }

            <Dialog
                open={openConquistas}
                onClose={() => setOpenConquistas(false)}
                fullWidth
                maxWidth="lg"
                PaperProps={{
                    sx: {
                        bgcolor: "black",
                        borderRadius: 4,
                        border: "1px solid rgba(255,255,255,.08)",
                        zoom: '0.9'
                    }
                }}
            >

                <DialogTitle>

                    <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                    >

                        <Box>
                            <Box>
                                <Typography
                                    color="white"
                                    fontSize={26}
                                    fontWeight={700}
                                >
                                    <WorkspacePremiumIcon
                                        sx={{
                                            color: "#FFD700",
                                            fontSize: 28
                                        }}
                                    /> Livro de Conquistas
                                </Typography>
                            </Box>

                            <Typography color="gray">
                                {conquistasDesbloqueadas.length} de {conquistas.length} conquistas desbloqueadas
                            </Typography>

                        </Box>

                        <IconButton
                            onClick={() => setOpenConquistas(false)}
                        >
                            <CloseIcon sx={{ color: "white" }} />
                        </IconButton>

                    </Box>

                </DialogTitle>

                <DialogContent>

                    <Box mb={3}>

                        <LinearProgress
                            variant="determinate"
                            value={porcentagem}
                            sx={{
                                height: 10,
                                borderRadius: 5
                            }}
                        />

                        <Typography
                            mt={1}
                            color="gray"
                            textAlign="right"
                        >
                            {porcentagem.toFixed(0)}% completo
                        </Typography>

                    </Box>

                    <Box

                        display="grid"

                        gridTemplateColumns={{
                            xs: "1fr",
                            sm: "repeat(2,1fr)",
                            md: "repeat(3,1fr)",
                            lg: "repeat(4,1fr)"
                        }}

                        gap={2}

                    >
                        {
                            conquistasOrdenadas.map((c) => {

                                const desbloqueada =
                                    c.desbloqueada;

                                return (

                                    <Box
                                        key={c.id}
                                        sx={{
                                            bgcolor: "#111827",
                                            border: `2px solid ${desbloqueada
                                                ? coresRaridade[c.raridade]
                                                : "#2f3545"
                                                }`,
                                            borderRadius: 3,
                                            overflow: "hidden",
                                            position: "relative",
                                            transition: ".25s",
                                            opacity: desbloqueada ? 1 : .55,
                                            filter: desbloqueada
                                                ? "none"
                                                : "grayscale(.8)",
                                            "&:hover": {
                                                transform: "translateY(-4px)",
                                                boxShadow: desbloqueada
                                                    ? `0 0 18px ${coresRaridade[c.raridade]
                                                    }55`
                                                    : "none"
                                            }
                                        }}
                                    >

                                        <Box

                                            p={3}

                                            display="flex"

                                            flexDirection="column"

                                            alignItems="center"

                                            minHeight={360}

                                        >

                                            <Avatar

                                                sx={{

                                                    width: 78,

                                                    height: 78,

                                                    fontSize: 42,

                                                    mb: 2,

                                                    bgcolor: desbloqueada
                                                        ? `${coresRaridade[c.raridade]}22`
                                                        : "#222",

                                                    border: `2px solid ${desbloqueada
                                                        ? coresRaridade[c.raridade]
                                                        : "#444"
                                                        }`

                                                }}

                                            >

                                                {

                                                    desbloqueada
                                                        ? c.icone
                                                        : "🔒"

                                                }

                                            </Avatar>

                                            <Typography

                                                color="white"

                                                textAlign="center"

                                                fontWeight={700}

                                            >

                                                {

                                                    desbloqueada
                                                        ? c.nome
                                                        : "???????"

                                                }

                                            </Typography>

                                            <Typography

                                                color="gray"

                                                fontSize={13}

                                                mt={1}

                                                textAlign="center"

                                            >

                                                {

                                                    desbloqueada
                                                        ? c.descricao
                                                        : "Continue jogando para descobrir esta conquista."

                                                }

                                            </Typography>

                                            <Chip

                                                sx={{

                                                    mt: 2,

                                                    bgcolor: desbloqueada
                                                        ? `${coresRaridade[c.raridade]}22`
                                                        : "#222",

                                                    color: desbloqueada
                                                        ? coresRaridade[c.raridade]
                                                        : "#999",

                                                    fontWeight: 700

                                                }}

                                                label={

                                                    desbloqueada
                                                        ? c.raridade
                                                        : "???"

                                                }

                                            />

                                            <Box
                                                mt={3}
                                                width="100%"
                                            >

                                                <LinearProgress
                                                    variant="determinate"
                                                    value={
                                                        Math.min(
                                                            (
                                                                c.progresso /
                                                                c.meta
                                                            ) * 100,
                                                            100
                                                        )
                                                    }
                                                    sx={{
                                                        height: 8,
                                                        borderRadius: 4
                                                    }}
                                                />

                                                <Typography
                                                    mt={1}
                                                    color="gray"
                                                    fontSize={12}
                                                    textAlign="center"
                                                >
                                                    {c.progresso.toLocaleString()} / {c.meta.toLocaleString()}
                                                </Typography>

                                            </Box>

                                            <Box
                                                mt="auto"
                                                pt={2}
                                                width="100%"
                                                textAlign="center"
                                            >

                                                <Divider
                                                    sx={{
                                                        mb: 2
                                                    }}
                                                />

                                                {

                                                    desbloqueada && (

                                                        <>

                                                            <Typography
                                                                mt={2}
                                                                color="gray"
                                                                fontSize={12}
                                                            >
                                                                Desbloqueada em
                                                            </Typography>

                                                            <Typography
                                                                color="white"
                                                                fontSize={13}
                                                            >
                                                                {
                                                                    new Date(
                                                                        c.data_desbloqueio
                                                                    ).toLocaleDateString(
                                                                        "pt-BR"
                                                                    )
                                                                }
                                                            </Typography>

                                                        </>

                                                    )

                                                }

                                            </Box>

                                        </Box>

                                    </Box>

                                );

                            })

                        }

                    </Box>

                </DialogContent>

            </Dialog>

        </Card>

    );

}