import {
    Card,
    Typography,
    Box,
    Divider,
    Chip,
    Table,
    TableHead,
    TableBody,
    TableCell,
    TableContainer,
    TableRow,
    Paper,
    Avatar
} from "@mui/material";

import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import CollectionsBookmarkIcon from "@mui/icons-material/CollectionsBookmark";

import { estiloCard, tituloCard } from "../styles";

export default function CardHistorico({

    historico = [],
    conquistas = [],
    colecoes = []

}) {

    function corPosicao(posicao){

        if(posicao === 1)
            return "#FFD700";

        if(posicao === 2)
            return "#C0C0C0";

        if(posicao === 3)
            return "#CD7F32";

        return "#90caf9";

    }

    return(

        <Card
            sx={{
                ...estiloCard,
                height:"100%",
                mb: 5
            }}
        >

            <Typography sx={tituloCard}>
                HISTÓRICO
            </Typography>

            {/* ============================ */}
            {/* TEMPORADAS */}
            {/* ============================ */}

            <Box
                display="flex"
                alignItems="center"
                gap={1}
                mb={2}
            >

                <EmojiEventsIcon
                    sx={{color:"#FFD700"}}
                />

                <Typography
                    fontWeight="bold"
                    color="white"
                >
                    Histórico de Temporadas
                </Typography>

            </Box>

            {

                historico.length === 0 ?

                    <Typography color="gray">

                        Nenhuma temporada disputada.

                    </Typography>

                    :

                    <TableContainer
                        component={Paper}
                        sx={{
                            bgcolor:"#101826",
                            mb:3
                        }}
                    >

                        <Table size="small">

                            <TableHead>

                                <TableRow>

                                    <TableCell>Temporada</TableCell>

                                    <TableCell>Posição</TableCell>

                                    <TableCell>XP</TableCell>

                                    <TableCell>Pontos</TableCell>

                                </TableRow>

                            </TableHead>

                            <TableBody>

                                {

                                    historico.map((t)=>(

                                        <TableRow
                                            key={t.temporada_id}
                                        >

                                            <TableCell>

                                                {t.nome}

                                            </TableCell>

                                            <TableCell>

                                                <Chip

                                                    label={`#${t.posicao}`}

                                                    sx={{

                                                        bgcolor:
                                                            corPosicao(t.posicao),

                                                        color:"#000",

                                                        fontWeight:700

                                                    }}

                                                />

                                            </TableCell>

                                            <TableCell>

                                                {t.xp.toLocaleString()}

                                            </TableCell>

                                            <TableCell>

                                                {t.pontos.toLocaleString()}

                                            </TableCell>

                                        </TableRow>

                                    ))

                                }

                            </TableBody>

                        </Table>

                    </TableContainer>

            }

            <Divider sx={{my:2}}/>

            {/* ============================ */}
            {/* CONQUISTAS */}
            {/* ============================ */}

            <Box
                display="flex"
                alignItems="center"
                gap={1}
                mb={2}
            >

                <WorkspacePremiumIcon
                    sx={{color:"#ff9800"}}
                />

                <Typography
                    color="white"
                    fontWeight="bold"
                >

                    Conquistas

                </Typography>

            </Box>

            {

                conquistas.length === 0 ?

                    <Typography
                        color="gray"
                        mb={3}
                    >

                        Nenhuma conquista desbloqueada.

                    </Typography>

                    :

                    <Box

                        display="grid"

                        gridTemplateColumns="repeat(2,1fr)"

                        gap={2}

                        mb={3}

                    >

                        {

                            conquistas.map((c)=>(

                                <Card

                                    key={c.id}

                                    sx={{

                                        bgcolor:"#111827",

                                        p:2

                                    }}

                                >

                                    <Avatar

                                        sx={{

                                            bgcolor:"#1d2638",

                                            mb:1,

                                            width:50,

                                            height:50,

                                            fontSize:30

                                        }}

                                    >

                                        {c.icone}

                                    </Avatar>

                                    <Typography

                                        color="white"

                                        fontWeight="bold"

                                    >

                                        {c.nome}

                                    </Typography>

                                    <Typography

                                        color="gray"

                                        fontSize={12}

                                    >

                                        {c.descricao}

                                    </Typography>

                                    <Chip

                                        label={`+${c.xp_bonus} XP`}

                                        color="warning"

                                        sx={{mt:1}}

                                    />

                                </Card>

                            ))

                        }

                    </Box>

            }

            <Divider sx={{my:2}}/>

            {/* ============================ */}
            {/* COLEÇÕES */}
            {/* ============================ */}

            <Box

                display="flex"

                alignItems="center"

                gap={1}

                mb={2}

            >

                <CollectionsBookmarkIcon
                    sx={{color:"#42a5f5"}}
                />

                <Typography

                    color="white"

                    fontWeight="bold"

                >

                    Coleções

                </Typography>

            </Box>

            {

                colecoes.length===0 ?

                    <Typography color="gray">

                        Nenhuma coleção completa.

                    </Typography>

                    :

                    colecoes.map((c)=>(

                        <Card

                            key={c.id}

                            sx={{

                                bgcolor:"#111827",

                                p:2,

                                mb:2

                            }}

                        >

                            <Typography

                                color="white"

                                fontWeight="bold"

                            >

                                {c.nome}

                            </Typography>

                            <Typography

                                color="gray"

                                fontSize={13}

                            >

                                {c.descricao}

                            </Typography>

                            <Typography

                                color="#FFD54F"

                                mt={1}

                            >

                                ⭐ {c.bonus}

                            </Typography>

                        </Card>

                    ))

            }

        </Card>

    );

}