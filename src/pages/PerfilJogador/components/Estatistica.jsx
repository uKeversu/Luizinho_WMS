import { Box, Typography } from "@mui/material";

export default function Estatistica({

    titulo,
    valor,
    cor = "#fff"

}) {

    return (

        <Box
            sx={{
                textAlign: "center",
                flex: 1
            }}
        >

            <Typography

                sx={{
                    color: "#777",
                    fontSize: 10
                }}

            >
                {titulo}
            </Typography>

            <Typography

                sx={{
                    color: cor,
                    fontWeight: 700,
                    fontSize: 20
                }}

            >
                {valor}
            </Typography>

        </Box>

    );

}