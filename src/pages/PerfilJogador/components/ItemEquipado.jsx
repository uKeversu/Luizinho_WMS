import {

    Card,
    Typography,
    Chip,
    Box

} from "@mui/material";

export default function ItemEquipado({

    item,
    cor

}) {

    if (!item)
        return null;

    return (

        <Card

            sx={{

                bgcolor: "#111826",

                border: `2px solid ${cor}`,

                borderRadius: 3,

                p: 2,

                display: "flex",

                alignItems: "center",

                gap: 2

            }}

        >

            <Typography
                fontSize={3}
            >
                {item.icone}
            </Typography>

            <Box flex={1}>

                <Typography
                    color="white"
                    fontWeight={700}
                >
                    {item.nome}
                </Typography>

                <Typography
                    color="#888"
                    fontSize={13}
                >
                    {item.descricao}
                </Typography>

            </Box>

            <Chip

                label={item.raridade}

                sx={{

                    bgcolor: cor,

                    color: "#fff",

                    fontWeight: 700

                }}

            />

        </Card>

    );

}