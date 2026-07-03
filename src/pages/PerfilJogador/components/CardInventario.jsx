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

            <Grid
                container
                spacing={1}
                sx={{
                    maxHeight: 240,
                    overflowY: "auto"
                }}
            >

                {inventario.length === 0 && (

                    <Grid item xs={12}>

                        <Typography color="gray">

                            Nenhum item desbloqueado.

                        </Typography>

                    </Grid>

                )}

                {inventario.map((item) => (

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

                                    position: "relative",

                                    textAlign: "center",

                                    cursor: "pointer",

                                    transition: ".2s",

                                    "&:hover": {

                                        transform: "scale(1.05)",

                                        boxShadow:
                                            `0 0 20px ${corRaridade(item.raridade)}`

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

                                <Typography fontSize={28}>
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