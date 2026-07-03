import { Box, LinearProgress, Typography } from "@mui/material";

const PATENTES = [
    { nome: "BRONZE", xp: 0 },
    { nome: "PRATA", xp: 30000 },
    { nome: "OURO", xp: 70000 },
    { nome: "DIAMANTE", xp: 100000 },
    { nome: "ESMERALDA", xp: 150000 },
    { nome: "MESTRE", xp: 200000 },
    { nome: "LENDÁRIO", xp: 300000 }
];

function getProgressoXP(xp) {

    let atual = PATENTES[0];
    let proximo = PATENTES[PATENTES.length - 1];

    for (let i = 0; i < PATENTES.length; i++) {
        if (xp >= PATENTES[i].xp) {
            atual = PATENTES[i];
            proximo = PATENTES[i + 1] || PATENTES[i];
        }
    }

    const base = atual.xp;
    const limite = proximo.xp;

    const progresso = limite === base
        ? 100
        : ((xp - base) / (limite - base)) * 100;

    return {
        atual,
        proximo,
        progresso: Math.min(progresso, 100),
        falta: Math.max(limite - xp, 0)
    };
}

export default function BarraXP({ xp = 0 }) {

    const { atual, proximo, progresso, falta } = getProgressoXP(xp);

    return (
        <Box sx={{ mt: 2 }}>

            <LinearProgress
                variant="determinate"
                value={progresso}
                sx={{
                    height: 14,
                    borderRadius: 20,
                    bgcolor: "#1b2435",
                    "& .MuiLinearProgress-bar": {
                        background:
                            "linear-gradient(90deg,#ff9800,#ffc107,#ffe082)"
                    }
                }}
            />

            <Typography mt={1} color="#999" fontSize={12}>
                {proximo.nome === atual.nome
                    ? `Patente máxima atingida (${atual.nome})`
                    : `Faltam ${falta.toLocaleString()} XP para atingir ${proximo.nome}`}
            </Typography>

        </Box>
    );
}