import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

import {
    Avatar,
    Box,
    Card,
    Chip,
    Divider,
    Typography,
    Button,
} from "@mui/material";

import MilitaryTechIcon from "@mui/icons-material/MilitaryTech";
import FaceIcon from "@mui/icons-material/Face";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import FilterFramesIcon from "@mui/icons-material/FilterFrames";
import FlareIcon from "@mui/icons-material/Flare";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import { estiloCard, tituloCard } from "../styles";
import Estatistica from "./Estatistica";
import BarraXP from "./BarraXP";

import {
    MOLDURAS,
    EFEITOS,
    AVATARES,
    TITULOS,
} from "../../../cosmetics";

import "../../../cosmetics/efeitos.css";

import GlobalParticles from "../effects/global/GlobalParticles";
import EffectRenderer from "../effects/renderer/EffectRenderer";

export default function CardJogador({
    perfil,
    equipados,
    codigo,
    funcionarios = [],
    saldo,
    preview = false
}) {

    const navigate = useNavigate();

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
                return "#929292";

            case "OURO":
                return "#e4c518";

            case "PLATINA":
                return "#73d7e4";

            case "DIAMANTE":
                return "#00bfff";

            case "ESMERALDA":
                return "#2ed12e";

            case "MESTRE":
                return "#b02727";

            case "LENDÁRIO":
                return "#a724ff";

            case "TRANSCENDENTAL":
                return "#3256f5";

            default:
                return "#666";
        }
    }

    console.log(equipados)

    const moldura =
        MOLDURAS[equipados?.moldura?.nome] ||
        MOLDURAS.default;

    const efeito =
        EFEITOS[equipados?.efeito?.nome] ||
        EFEITOS.default;

    const titulo =
        TITULOS[equipados?.titulo?.nome] ||
        TITULOS.default;

    return (

        <Card
            className={efeito.animation}
            sx={{
                ...estiloCard,
                position: "relative",
                overflow: "hidden",
                background: efeito.background,
                boxShadow: efeito.cardGlow,
            }}
        >
            {/* Overlay do efeito */}
            <Box
                className={`${efeito.animation}-overlay efeito-overlay`}
                sx={{
                    position: "absolute",
                    inset: 0,
                    pointerEvents: "none",
                    zIndex: 1,
                }}
            >
                <EffectRenderer animation={efeito.animation} />

                <GlobalParticles />
            </Box>

            {/* TOPO */}
            <Box
                sx={{
                    position: "relative",
                    zIndex: 2,
                }}
            >
                <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                >

                    <Typography sx={tituloCard}>
                        {codigo}
                    </Typography>

                    {!preview && (
                        <Button
                            onClick={() =>
                                navigate("/Produtividade")
                            }
                            sx={{
                                color: "background.paper",
                                gap: 1,
                                borderRadius: "20%"
                            }}
                        >
                            <ArrowBackIcon />
                        </Button>
                    )}
                </Box>

                {/* AVATAR */}

                <Box
                    sx={{
                        position: "absolute",
                        top: 70,
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: 180,
                        height: 180,
                        borderRadius: "50%",
                        background: `${moldura.borderColor}55`,
                        filter: "blur(60px)",
                        zIndex: 0,
                    }}
                />
                <Box
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    mt={1}
                    sx={{
                        position: "relative",
                        zIndex: 2,
                    }}
                >
                    <Avatar
                        sx={{
                            position: "relative",
                            zIndex: 2,

                            width: 130,
                            height: 130,
                            fontSize: 64,

                            bgcolor: "#111827",
                            color: equipados.avatar?.nome === "Cruz de Malta"
                                ? "primary.cancelar"
                                : "primary.branco",
                            border: `3px solid ${moldura.borderColor}`,

                            boxShadow: moldura.glow,
                        }}
                    >

                        {equipados.avatar?.icone || "👤"}

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
                        sx={{
                            color: titulo.color,
                            fontWeight: 700,
                        }}
                    >
                        {equipados.titulo
                            ? `${equipados.titulo.icone} ${equipados.titulo.nome === "Sargento"
                                ? `Sargento ${funcionariosMap[String(codigo)]?.trim().split(" ").pop() || codigo.trim().split(" ").pop()}`
                                : equipados.titulo.nome
                            }`
                            : "Iniciante"}
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

                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: "repeat(3, 1fr)",
                        gap: 2,
                        mt: 2,
                    }}
                >
                    <Estatistica
                        titulo="XP TOTAL"
                        valor={jogador.xpTotal?.toLocaleString() || 0}
                        cor="#FFD54F"
                    />

                    <Estatistica
                        titulo="RANK"
                        valor={`#${jogador.rankGeral ?? "-"}`}
                        cor="#42A5F5"
                    />

                    <Estatistica
                        titulo="RECEBIMENTOS"
                        valor={jogador.recebimentos || 0}
                        cor="#BA68C8"
                    />

                    <Estatistica
                        titulo="PRECISÃO"
                        valor={`${jogador.produtividade || 0}%`}
                        cor="#66BB6A"
                    />

                    <Estatistica
                        titulo="ITENS"
                        valor={jogador.itensConferidos || 0}
                        cor="#FFA726"
                    />

                    <Estatistica
                        titulo="NOTAS"
                        valor={jogador.notasConferidas || 0}
                        cor="#EF5350"
                    />
                </Box>

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
            </Box>
        </Card >
    );
}