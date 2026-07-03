import { useEffect, useState, useMemo } from "react";
import axios from "axios";

import {
    Box,
    CircularProgress
} from "@mui/material";

import { useParams } from "react-router-dom";

import CardTemporada from "./components/CardTemporada";
import CardJogador from "./components/CardJogador";
import CardInventario from "./components/CardInventario";
import CardMissoes from "./components/CardMissoes";
import CardHistorico from "./components/CardHistorico";

export default function PerfilJogador() {

    const { codigo } = useParams();

    const [perfil, setPerfil] = useState(null);

    const [funcionarios, setFuncionarios] = useState([]);

    useEffect(() => {
        carregar();
        carregarFuncionarios();
    }, []);

    async function carregar() {

        const { data } = await axios.get(
            `http://192.168.1.185:8077/api/loja/perfil/${codigo}`
        );

        setPerfil(data);

    }

    async function carregarFuncionarios() {
        try {

            const response = await fetch(
                "http://192.168.1.185:8077/api/funcionarios/listar"
            );

            const data = await response.json();

            setFuncionarios(data);

        } catch (err) {
            console.error(err);
        }
    }

    if (!perfil) {

        return (
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                height="100vh"
            >
                <CircularProgress size={70} />
            </Box>
        )

    }

    return (

        <Box
            sx={{
                minHeight: "100vh",
                p: 2,
                background: "background.default",
            }}
        >

            <Box
                sx={{
                    display: "grid",

                    gridTemplateColumns: "380px 1fr",

                    gridTemplateRows: "240px 1fr 260px",

                    gap: 2,

                    width: "100%",

                    alignItems: "start",

                    gridTemplateAreas: `
                    "jogador temporada"
                    "jogador inventario"
                    "inferior inferior"
                    `,
                }}
            >
                <Box sx={{ gridArea: "jogador" }}>
                    <CardJogador
                        perfil={perfil.perfil}
                        equipados={perfil.equipados}
                        codigo={perfil.codigo}
                        funcionarios={funcionarios}
                        saldo={perfil.saldo}
                    />
                </Box>

                <Box sx={{ gridArea: "temporada" }}>
                    <CardTemporada
                        temporada={perfil.temporada}
                        saldo={perfil.saldo}
                    />
                </Box>

                <Box sx={{ gridArea: "inventario", mt: 2 }}>
                    <CardInventario
                        inventario={perfil.inventario}
                        equipados={perfil.equipados}
                        colecoes={perfil.colecoes}
                    />
                </Box>

                <Box
                    sx={{
                        gridArea: "inferior",

                        display: "grid",
                        gridTemplateColumns: "2fr 1fr",
                        gap: 2
                    }}
                >

                    <CardMissoes
                        missoes={perfil.missoes}
                        conquistas={perfil.conquistas}
                    />

                    <CardHistorico
                        historico={perfil.historico}
                    />

                </Box>

            </Box>

        </Box>

    );

}