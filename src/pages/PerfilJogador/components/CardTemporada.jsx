import {
    Box,
    Card,
    Chip,
    Divider,
    LinearProgress,
    Stack,
    Typography
} from "@mui/material";

import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import StarsIcon from "@mui/icons-material/Stars";
import MilitaryTechIcon from "@mui/icons-material/MilitaryTech";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import TimerIcon from "@mui/icons-material/Timer";

import { estiloCard, tituloCard } from "../styles";

export default function CardTemporada({
    temporada = {},
    saldo = 0
}) {

    const progressoDias = (() => {

        if (!temporada.data_inicio || !temporada.data_fim) return 0;

        const inicio = new Date(temporada.data_inicio);
        const fim = new Date(temporada.data_fim);
        const hoje = new Date();

        const total = fim - inicio;
        const restante = fim - hoje;

        if (total <= 0) return 100;

        const valor = ((total - restante) / total) * 100;

        return Math.max(0, Math.min(100, valor));

    })();

    return (

        <Card
            sx={{
                ...estiloCard,
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between"
            }}
        >
            <Box>
                <Box
                    component="img"
                    src="/banner_seasons/banner_temporada_optimus.png"
                    alt="banner_season"
                    sx={{
                        width: "100%",
                        height: 350,
                        objectFit: "cover",
                        borderRadius: 2,
                        mt: 2
                    }}
                />
            </Box>

            <Box mt={3}>

                <Stack
                    direction="row"
                    justifyContent="space-between"
                    mb={1}
                >
                    <Box sx={{ display: 'flex' }}>
                        <Typography color="#BDBDBD">
                            Progresso da Temporada
                        </Typography>
                        <Typography color="#90caf9" sx={{ ml: 2 }}>
                            {Math.round(progressoDias)}%
                        </Typography>
                    </Box>

                    <Typography
                        color="#90caf9"
                        mt={0.5}
                    >
                        {new Date(temporada.data_inicio).toLocaleDateString("pt-BR", {
                            timeZone: "UTC",
                        })} • {new Date(temporada.data_fim).toLocaleDateString("pt-BR", {
                            timeZone: "UTC",
                        })}
                    </Typography>

                    <Chip
                        icon={<TimerIcon />}
                        label={
                            Number(temporada.dias_restantes ?? 0) === 0
                                ? "A temporada acaba hoje!"
                                : `${temporada.dias_restantes} dias restantes`
                        }
                        color={(temporada.dias_restantes ?? 0) === 0
                            ? "error"
                            : "warning"}
                        sx={{ color: "white" }}
                    />
                </Stack>

                <LinearProgress
                    variant="determinate"
                    value={progressoDias}
                    sx={{
                        height: 10,
                        borderRadius: 5
                    }}
                />


            </Box>
        </Card>

    );

}