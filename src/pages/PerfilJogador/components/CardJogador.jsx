import { useEffect, useMemo, useState } from "react";

import {
    Avatar,
    Box,
    Card,
    Chip,
    Divider,
    Grid,
    Typography
} from "@mui/material";

import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import MilitaryTechIcon from "@mui/icons-material/MilitaryTech";
import FaceIcon from "@mui/icons-material/Face";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import FilterFramesIcon from "@mui/icons-material/FilterFrames";
import FlareIcon from "@mui/icons-material/Flare";

import { estiloCard, tituloCard } from "../styles";
import Estatistica from "./Estatistica";
import BarraXP from "./BarraXP";

export default function CardJogador({
    perfil,
    equipados,
    codigo,
    funcionarios = [],
    saldo
}) {

    const funcionariosMap = useMemo(() => {

        return Object.fromEntries(
            funcionarios.map(f => [
                String(f.codigo),
                f.nome
            ])
        );

    }, [funcionarios]);

    const jogador = perfil ?? {};

    function corPatente(patente) {

        switch (patente) {

            case "BRONZE":
                return "#b87333";

            case "PRATA":
                return "#c0c0c0";

            case "OURO":
                return "#FFD700";

            case "DIAMANTE":
                return "#00BCD4";

            case "ESMERALDA":
                return "#39f139";

            case "MESTRE":
                return "#b02727";

            case "LENDARIO":
                return "#9C27B0";

            default:
                return "#666";

        }

    }

    return (

        <Card
            sx={{
                ...estiloCard,
                height: "100%",
                display: "flex",
                flexDirection: "column",
                mb: 5
            }}
        >

            {/* TOPO */}

            <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
            >

                <Typography sx={tituloCard}>
                    {codigo}
                </Typography>

                <Chip
                    icon={<EmojiEventsIcon />}
                    label={`#${jogador.rankGeral ?? "-"}`}
                    color="warning"
                    sx={{ color: 'white' }}
                />

            </Box>

            {/* AVATAR */}

            <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                mt={1}
            >

                <Avatar

                    sx={{

                        width: 130,

                        height: 130,

                        fontSize: 64,

                        bgcolor: "#111827",

                        border: `4px solid ${corPatente(jogador.patenteGeral)}`,

                        boxShadow: `0 0 30px ${corPatente(jogador.patenteGeral)}`

                    }}

                >

                    {equipados.avatar?.icone || ""}

                </Avatar>

                <Typography

                    mt={2}

                    fontSize={24}

                    fontWeight="bold"

                    color="white"

                >

                    {funcionariosMap[String(codigo)] || codigo}

                </Typography>

                <Typography
                    color="#90caf9"
                >

                    {equipados.titulo
                        ? `${equipados.titulo.icone} ${equipados.titulo.nome}`
                        : "Sem título"}

                </Typography>

                <Chip
                    icon={<MilitaryTechIcon />}

                    label={jogador.patenteGeral || "SEM LIGA"}

                    sx={{

                        mt: 2,

                        bgcolor: corPatente(jogador.patenteGeral),

                        color: "#fff",

                        fontWeight: 700

                    }}
                />

            </Box>

            <Divider sx={{ my: 3 }} />

            {/* ESTATÍSTICAS */}

            <Grid container spacing={3}>
                <Grid item xs={6}>
                    <Estatistica
                        titulo="XP TOTAL"
                        valor={jogador.xpTotal?.toLocaleString() || 0}
                        cor="#FFD54F"
                    />
                </Grid>

                <Grid item xs={6}>
                    <Estatistica
                        titulo="RANK"
                        valor={`#${jogador.rankGeral ?? "-"}`}
                        cor="#4FC3F7"
                    />
                </Grid>

                <Grid item xs={6}>
                    <Estatistica
                        titulo="ITENS"
                        valor={jogador.itensConferidos || 0}
                        cor="#81C784"
                    />
                </Grid>

                <Grid item xs={6}>
                    <Estatistica
                        titulo="NOTAS"
                        valor={jogador.notasConferidas || 0}
                        cor="#FFB74D"
                    />
                </Grid>

                <Grid item xs={6}>
                    <Estatistica
                        titulo="EFICIÊNCIA"
                        valor={`${jogador.produtividade || 0}%`}
                        cor="#4DD0E1"
                    />
                </Grid>
            </Grid>

            <BarraXP xp={jogador.xpTotal || 0} />

            <Divider sx={{ my: 3 }} />

            {/* EQUIPAMENTOS */}

            <Typography
                color="#FFD54F"
                fontWeight={700}
                mb={1}
            >

                Itens equipados

            </Typography>

            <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-around', p: 1 }}>
                    <Chip
                        icon={<WorkspacePremiumIcon />}

                        label={
                            equipados.titulo
                                ? equipados.titulo.nome
                                : "Sem título"
                        }
                        sx={{ width: "100vh", mr: 1 }}
                    />
                    <Chip
                        icon={<FaceIcon />}

                        label={
                            equipados.avatar
                                ? equipados.avatar.nome
                                : "Sem avatar"
                        }
                        sx={{ width: "100vh", ml: 1 }}
                    />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-around', p: 1 }}>
                    <Chip
                        icon={<FilterFramesIcon />}
                        label={
                            equipados.moldura
                                ? equipados.moldura.nome
                                : "Sem moldura"
                        }
                        sx={{ width: "100vh", mr: 1 }}
                    />
                    <Chip
                        icon={<FlareIcon />}
                        label={
                            equipados.efeito
                                ? equipados.efeito.nome
                                : "Sem efeito"
                        }
                        sx={{ width: "100vh", ml: 1 }}
                    />
                </Box>
            </Box>

            <Box flexGrow={1} />

            {/* RODAPÉ */}

            <Box
                mt={3}
                p={2}
                borderRadius={2}
                bgcolor="#111827"
            >
                <Typography
                    color="#FFD54F"
                    fontWeight="bold"
                >
                    {`${saldo.toLocaleString() || 0} SigelCoins`}
                </Typography>
            </Box>
        </Card>
    );
}