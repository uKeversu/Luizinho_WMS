import { useEffect, useState, useContext } from "react";
import { Box, Typography, Chip, Button } from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import StopIcon from "@mui/icons-material/Stop";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

import { ThemeContext } from "../context/ThemeContext";
import { useTheme } from "@mui/material/styles";
import '../style/App.css';

function formatTime(seconds) {
    const h = String(Math.floor(seconds / 3600)).padStart(2, "0");
    const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${h}:${m}:${s}`;
}

export default function Cronometro({ onFinish }) {

    // Tema noturno
    const { dark, toggleTheme } = useContext(ThemeContext);
    const theme = useTheme();

    const [startTime, setStartTime] = useState(null);
    const [elapsed, setElapsed] = useState(0);
    const [running, setRunning] = useState(false);

    useEffect(() => {
        let interval;

        if (running && startTime) {
            interval = setInterval(() => {
                const diff = Math.floor((new Date() - startTime) / 1000);
                setElapsed(diff);
            }, 1000);
        }

        return () => clearInterval(interval);
    }, [running, startTime]);

    const handleStart = () => {
        setStartTime(new Date());
        setRunning(true);
    };

    const handleStop = () => {
        setRunning(false);

        const endTime = new Date();
        const totalSeconds = Math.floor((endTime - startTime) / 1000);

        setElapsed(totalSeconds);

        if (onFinish) {
            onFinish({
                startTime,
                endTime,
                totalSeconds
            });
        }
    };

    const handleReset = () => {
        setStartTime(null);
        setElapsed(0);
        setRunning(false);
    };

    return (
        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                px: 2,
                py: 1,
                borderRadius: "12px",
                bgcolor: "background.card",
                boxShadow: "0 2px 10px rgba(0,0,0,0.15)",
                border: "1px solid rgba(255,255,255,0.08)",
                mb: 2,
                gap: 2
            }}
        >
            {/* Lado esquerdo */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <AccessTimeIcon sx={{ color: theme.palette.primary.main }} />

                <Typography sx={{ fontWeight: 600 }}>
                    Tempo de Recebimento
                </Typography>

                <Chip
                    size="small"
                    label={running ? "EM ANDAMENTO" : "PARADO"}
                    sx={{
                        fontWeight: 600,
                        color: "primary.branco",
                        bgcolor: running
                            ? theme.palette.primary.main
                            : theme.palette.primary.default
                    }}
                />
            </Box>

            {/* Timer */}
            <Typography
                sx={{
                    fontFamily: "Consolas, monospace",
                    fontSize: "1.2rem",
                    fontWeight: 700,
                    color: "primary.main"
                }}
            >
                {formatTime(elapsed)}
            </Typography>

            {/* Botões */}
            <Box sx={{ display: "flex", gap: 1 }}>
                {!running ? (
                    <Button
                        variant="contained"
                        color="success"
                        startIcon={<PlayArrowIcon />}
                        onClick={handleStart}
                        sx={{ color: "primary.branco", bgcolor: 'primary.confirmar', '&:hover': { bgcolor: 'primary.confirmarHover' } }}
                    >
                        Iniciar
                    </Button>
                ) : (
                    <Button
                        variant="contained"
                        color="error"
                        startIcon={<StopIcon />}
                        onClick={handleStop}
                        sx={{ color: "primary.branco", bgcolor: 'primary.cancelar', '&:hover': { bgcolor: 'primary.cancelarHover' } }}
                    >
                        Finalizar
                    </Button>
                )}

                <Button
                    variant="outlined"
                    onClick={handleReset}
                >
                    Reset
                </Button>
            </Box>
        </Box>
    );
}