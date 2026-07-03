import {
    Box,
    Card,
    Typography,
    LinearProgress,
    Chip,
    Divider,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Stack
} from "@mui/material";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import BoltIcon from "@mui/icons-material/Bolt";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";

import { estiloCard, tituloCard } from "../styles";

export default function CardMissoes({ missoes }) {

    const categorias = [
        {
            titulo: "🔥 Missões Diárias",
            dados: missoes?.diarias || []
        },
        {
            titulo: "📅 Missões Semanais",
            dados: missoes?.semanais || []
        },
        {
            titulo: "🏆 Missões Mensais",
            dados: missoes?.mensais || []
        }
    ];

    return (

        <Card
            sx={{
                ...estiloCard,
                height: "100%",
                overflow: "auto"
            }}
        >

            <Typography sx={tituloCard}>
                MISSÕES
            </Typography>

            {

                categorias.map((categoria) => (

                    <Accordion

                        key={categoria.titulo}

                        defaultExpanded

                        sx={{

                            bgcolor: "#111827",

                            color: "#fff",

                            mb: 2,

                            "&:before": {
                                display: "none"
                            }

                        }}

                    >

                        <AccordionSummary
                            expandIcon={
                                <ExpandMoreIcon
                                    sx={{ color: "#fff" }}
                                />
                            }
                        >

                            <Typography
                                fontWeight={700}
                            >
                                {categoria.titulo}
                            </Typography>

                        </AccordionSummary>

                        <AccordionDetails>

                            {

                                categoria.dados.length === 0 ?

                                    <Typography color="gray">

                                        Nenhuma missão disponível.

                                    </Typography>

                                    :

                                    categoria.dados.map((missao) => {

                                        const porcentagem =
                                            Math.min(
                                                (missao.progresso / missao.meta) * 100,
                                                100
                                            );

                                        return (

                                            <Card

                                                key={missao.id}

                                                sx={{

                                                    bgcolor: "#0b1220",

                                                    p: 2,

                                                    mb: 2,

                                                    borderRadius: 3,

                                                    border: missao.concluida
                                                        ? "2px solid #4caf50"
                                                        : "1px solid #263238"

                                                }}

                                            >

                                                <Box

                                                    display="flex"

                                                    justifyContent="space-between"

                                                    alignItems="center"

                                                >

                                                    <Typography
                                                        fontWeight="bold"
                                                        color="white"
                                                    >
                                                        {missao.nome}
                                                    </Typography>

                                                    {

                                                        missao.concluida ?

                                                            <CheckCircleIcon
                                                                color="success"
                                                            />

                                                            :

                                                            <RadioButtonUncheckedIcon
                                                                sx={{
                                                                    color: "#888"
                                                                }}
                                                            />

                                                    }

                                                </Box>

                                                <Typography

                                                    color="gray"

                                                    fontSize={13}

                                                    mt={1}

                                                >

                                                    {missao.descricao}

                                                </Typography>

                                                <Box mt={2}>

                                                    <LinearProgress

                                                        variant="determinate"

                                                        value={porcentagem}

                                                        sx={{

                                                            height: 10,

                                                            borderRadius: 20,

                                                            bgcolor: "#1e293b",

                                                            "& .MuiLinearProgress-bar": {

                                                                background:
                                                                    "linear-gradient(90deg,#ff9800,#FFD54F)"

                                                            }

                                                        }}

                                                    />

                                                </Box>

                                                <Typography

                                                    mt={1}

                                                    fontSize={12}

                                                    color="#bbb"

                                                >

                                                    {missao.progresso} / {missao.meta}

                                                    {" "}

                                                    {missao.objetivo}

                                                </Typography>

                                                <Divider sx={{ my: 2 }} />

                                                <Stack
                                                    direction="row"
                                                    spacing={1}
                                                    flexWrap="wrap"
                                                >

                                                    <Chip

                                                        icon={<BoltIcon />}

                                                        label={`${missao.recompensa.xp} XP`}

                                                        color="warning"

                                                    />

                                                    <Chip

                                                        icon={<MonetizationOnIcon />}

                                                        label={`${missao.recompensa.sigelcoins} SigelCoins`}

                                                        color="success"

                                                    />

                                                    {

                                                        missao.recompensa.item &&

                                                        <Chip

                                                            label={
                                                                missao.recompensa.item.nome
                                                            }

                                                            color="secondary"

                                                        />

                                                    }

                                                </Stack>

                                                {

                                                    missao.recompensa_recebida &&

                                                    <Typography

                                                        mt={2}

                                                        color="#4caf50"

                                                        fontWeight="bold"

                                                    >

                                                        ✔ Recompensa já resgatada

                                                    </Typography>

                                                }

                                            </Card>

                                        );

                                    })

                            }

                        </AccordionDetails>

                    </Accordion>

                ))

            }

        </Card>

    );

}