// src/components/MenuUsuario.jsx

import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";

import {
    Box,
    Button,
    Typography,
    Tooltip,
    Menu,
    MenuItem
} from "@mui/material";

import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

import PersonAddIcon from "@mui/icons-material/PersonAdd";
import WarningIcon from "@mui/icons-material/Warning";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import AssignmentIcon from "@mui/icons-material/Assignment";
import LeaderboardIcon from "@mui/icons-material/Leaderboard";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import BorderColorIcon from "@mui/icons-material/BorderColor";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";

import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";

import { ThemeContext } from "../context/ThemeContext";

function MenuUsuario({ userInfo, onLogout }) {

    const navigate = useNavigate();

    const { dark, toggleTheme } = useContext(ThemeContext);

    const [anchorPaginas, setAnchorPaginas] = useState(null);

    const paginas = [
        {
            nome: "Alertas",
            rota: "/Alertas",
            permissao: "pode_acessar_alertas",
            icone: <WarningIcon fontSize="small" />
        },
        {
            nome: "Cadastrar Funcionário",
            rota: "/CadastrarFuncionario",
            permissao: "pode_acessar_cadastrar_funcionario",
            icone: <PersonAddIcon fontSize="small" />
        },
        {
            nome: "Correção de Notas",
            rota: "/AtualizarCean",
            permissao: "pode_corrigir_nfe",
            icone: <BorderColorIcon fontSize="small" />
        },
        {
            nome: "Atribuir Notas",
            rota: "/PainelGerencial",
            permissao: "pode_acessar_painel_gerencial",
            icone: <AssignmentTurnedInIcon fontSize="small" />
        },
        {
            nome: "Gamificação",
            rota: "/PainelGames",
            permissao: "pode_acessar_painel_games",
            icone: <SportsEsportsIcon fontSize="small" />
        },
        {
            nome: "Produtividade",
            rota: "/Produtividade",
            permissao: null,
            icone: <LeaderboardIcon fontSize="small" />
        },
        {
            nome: "Recebimento",
            rota: "/Recebimento",
            permissao: "pode_finalizar_nfe",
            icone: <LocalShippingIcon fontSize="small" />
        },
        {
            nome: "Tarefas",
            rota: "/Tarefas",
            permissao: "pode_acessar_tarefas",
            icone: <AssignmentIcon fontSize="small" />
        }
    ];

    const paginasPermitidas = paginas.filter((pagina) => {

        if (!pagina.permissao) {
            return true;
        }

        return userInfo?.[pagina.permissao] === true;
    });

    const abrirMenu = (event) => {
        setAnchorPaginas(event.currentTarget);
    };

    const fecharMenu = () => {
        setAnchorPaginas(null);
    };

    const navegar = (rota) => {
        fecharMenu();
        navigate(rota);
    };

    return (
        <>
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "right"
                }}
            >

                {/* Botão do dropdown */}

                <Button
                    onClick={abrirMenu}
                    sx={{
                        color: "background.paper",
                        display: "flex",
                        gap: 0.5,
                        fontSize: "0.75rem",
                        minWidth: "auto",
                        padding: "4px 8px",
                        whiteSpace: "nowrap"
                    }}
                >
                    <ArrowDropDownIcon fontSize="small" />
                </Button>

                {/* Usuário */}

                <PersonIcon
                    sx={{
                        color: "var(--branco)",
                        paddingRight: "1vh"
                    }}
                />

                <Typography
                    sx={{
                        color: "var(--branco)",
                        fontSize: "0.9rem",
                        display: "flex",
                        alignItems: "center"
                    }}
                >
                    {userInfo?.nome}
                </Typography>

                {/* Logout */}

                <Tooltip title="Logout">

                    <Button
                        size="small"
                        onClick={onLogout}
                        sx={{
                            color: "background.paper",
                            display: "flex",
                            gap: 1
                        }}
                    >
                        <LogoutIcon />
                    </Button>

                </Tooltip>

            </Box>

            {/* Dropdown */}

            <Menu
                anchorEl={anchorPaginas}
                open={Boolean(anchorPaginas)}
                onClose={fecharMenu}
                PaperProps={{
                    sx: {
                        bgcolor: "background.default",
                        color: "text.primary",
                        minWidth: 220
                    }
                }}
            >

                {paginasPermitidas.map((pagina) => (

                    <MenuItem
                        key={pagina.rota}
                        onClick={() => navegar(pagina.rota)}
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1.2,
                            color: "text.primary"
                        }}
                    >

                        {pagina.icone}

                        <Typography
                            sx={{
                                fontSize: "0.85rem"
                            }}
                        >
                            {pagina.nome}
                        </Typography>

                    </MenuItem>

                ))}

                {/* Tema */}

                <MenuItem
                    onClick={toggleTheme}
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.2,
                        color: "text.primary"
                    }}
                >

                    {dark ? (
                        <LightModeIcon fontSize="small" />
                    ) : (
                        <DarkModeIcon fontSize="small" />
                    )}

                    <Typography
                        sx={{
                            fontSize: "0.85rem"
                        }}
                    >
                        {dark ? "Tema claro" : "Tema escuro"}
                    </Typography>

                </MenuItem>

            </Menu>
        </>
    );
}

export default MenuUsuario;