import { useState } from "react";

import {
    Box,
    Card,
    Typography,
    Grid,
    Chip,
    Avatar,
    Divider,
    Tooltip
} from "@mui/material";

import CheckCircleIcon from "@mui/icons-material/CheckCircle";

import { estiloCard, tituloCard, corRaridade } from "../styles";

import { Tabs, Tab } from "@mui/material";

export default function CardInventario({
    inventario = [],
    equipados = {},
    colecoes = []
}) {

    const slots = [
        {
            nome: "Avatar",
            item: equipados?.avatar
        },
        {
            nome: "Título",
            item: equipados?.titulo
        },
        {
            nome: "Moldura",
            item: equipados?.moldura
        },
        {
            nome: "Efeito",
            item: equipados?.efeito
        }
    ];

    const [abaCategoria, setAbaCategoria] = useState("avatar");

    const ordemRaridade = {
        COMUM: 1,
        INCOMUM: 2,
        RARO: 3,
        EPICO: 4,
        LENDARIO: 5,
        MITICO: 6,
        DIVINO: 7
    };

    const categorias = [
        { value: "avatar", label: "Avatar" },
        { value: "moldura", label: "Moldura" },
        { value: "titulo", label: "Título" },
        { value: "efeito", label: "Efeito" }
    ];

    const itensFiltrados = inventario
        .filter(item => item.categoria === abaCategoria)
        .sort((a, b) => {
            return ordemRaridade[b.raridade] - ordemRaridade[a.raridade];
        });

    return (

        <Card
            sx={{
                ...estiloCard,
                height: "100%",
                display: "flex",
                flexDirection: "column",
            }}
        >

            <Typography sx={tituloCard}>
                INVENTÁRIO
            </Typography>

            {/* EQUIPADOS */}

            <Typography
                color="#FFD54F"
                mb={2}
                fontWeight={700}
            >

                Equipamentos Ativos

            </Typography>

            <Grid container spacing={2}>

                {slots.map((slot) => (

                    <Grid
                        item
                        xs={6}
                        key={slot.nome}
                    >

                        <Box

                            sx={{

                                bgcolor: "#101826",

                                border: `2px solid ${slot.item
                                    ? corRaridade(slot.item.raridade)
                                    : "#303030"
                                    }`,

                                borderRadius: 3,

                                textAlign: "center",

                                p: 2

                            }}

                        >

                            <Avatar

                                sx={{

                                    width: 56,

                                    height: 56,

                                    mx: "auto",

                                    bgcolor: "#1d2638",
                                    color: slot.item?.nome === "Cruz de Malta"
                                        ? "primary.cancelar"
                                        : "primary.branco",
                                    fontSize: 28

                                }}

                            >

                                {slot.item?.icone || "❔"}

                            </Avatar>

                            <Typography

                                mt={1}

                                color="white"

                                fontWeight="bold"

                            >

                                {slot.nome}

                            </Typography>

                            <Typography

                                color="#999"

                                fontSize={12}

                            >

                                {slot.item?.nome || "Não equipado"}

                            </Typography>

                            {slot.item && (

                                <Chip

                                    label={slot.item.raridade}

                                    size="small"

                                    sx={{

                                        mt: 1,

                                        bgcolor: corRaridade(slot.item.raridade),

                                        color: "#fff"

                                    }}

                                />

                            )}

                        </Box>

                    </Grid>

                ))}

            </Grid>

            <Divider sx={{ my: 3 }} />

            {/* MOCHILA */}

            <Typography
                color="#FFD54F"
                fontWeight={700}
                mb={2}
            >

                Mochila ({inventario.length})

            </Typography>

            <Tabs
                value={abaCategoria}
                onChange={(e, v) => setAbaCategoria(v)}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                    mb: 2, "& .MuiTabs-indicator": {
                        display: "none",
                    },
                }}
            >
                {categorias.map(cat => (
                    <Tab
                        key={cat.value}
                        value={cat.value}
                        label={`${cat.label} (${inventario.filter(i => i.categoria === cat.value).length
                            })`}
                        sx={{
                            borderRadius: 2,
                            mx: 0.5,
                            transition: ".2s",
                            "&.Mui-selected": {
                                bgcolor: "#111827",
                                color: "#FFD54F",
                                fontWeight: 700,
                            },
                        }}
                    />
                ))}
            </Tabs>

            <Grid
                container
                spacing={1}
                sx={{
                    maxHeight: 240,
                    overflowY: "auto"
                }}
            >

                {itensFiltrados.length === 0 && (
                    <Grid item xs={12}>
                        <Typography color="gray">
                            Nenhum item desbloqueado.
                        </Typography>
                    </Grid>
                )}

                {itensFiltrados.map(item => (

                    <Grid
                        item
                        xs={3}
                        key={item.id}
                    >
                        <Tooltip
                            title={item.descricao}
                        >
                            <Card
                                sx={{
                                    bgcolor: "#111827",
                                    border: `2px solid ${corRaridade(item.raridade)}`,
                                    p: 1,
                                    m: 1,
                                    position: "relative",
                                    textAlign: "center",
                                    cursor: "pointer",
                                    transition: ".2s",
                                    "&:hover": {
                                        transform: "scale(1.05)",
                                        boxShadow:
                                            `0 0 5px ${corRaridade(item.raridade)}`
                                    }
                                }}
                            >

                                {item.equipado && (
                                    <CheckCircleIcon
                                        sx={{
                                            position: "absolute",
                                            right: 4,
                                            top: 4,
                                            color: "#4CAF50",
                                            fontSize: 18
                                        }}
                                    />
                                )}

                                <Typography fontSize={28}
                                    sx={{
                                        color: item?.nome === "Cruz de Malta"
                                            ? "primary.cancelar"
                                            : "primary.branco",
                                    }}>
                                    {item.icone}
                                </Typography>

                                <Typography
                                    color="white"
                                    fontSize={11}
                                    fontWeight={700}
                                >
                                    {item.nome}
                                </Typography>

                            </Card>

                        </Tooltip>

                    </Grid>

                ))}

            </Grid>

        </Card>

    );

}