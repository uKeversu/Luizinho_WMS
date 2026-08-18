// src/pages/ConsultaGuardas.jsx

import { useState, useContext, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

import {
    Container,
    Typography,
    Card,
    CardContent,
    TextField,
    Button,
    Box,
    CircularProgress,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Chip,
    Grid,
    Paper,
    Divider
} from "@mui/material";

import SearchIcon from '@mui/icons-material/Search';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import BarcodeReaderIcon from '@mui/icons-material/BarcodeReader';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BadgeIcon from '@mui/icons-material/Badge';

import { ThemeContext } from "../context/ThemeContext";

import "../style/App.css";

function ConsultaGuarda() {

    const { dark } = useContext(ThemeContext);

    const navigate = useNavigate();

    const API = "http://192.168.1.185:8077";

    // Refs de buscas
    const dataInicioRef = useRef(null);

    const dataFimRef = useRef(null);

    const buscaRef = useRef(null);

    // LOGIN
    const [userInfo, setUserInfo] = useState(() => {

        const user =
            localStorage.getItem("user_info");

        return user
            ? JSON.parse(user)
            : null;
    });

    const [token, setToken] = useState(
        () => localStorage.getItem("nfe_token") || ""
    );

    const logout = () => {

        setToken("");
        setUserInfo(null);

        localStorage.removeItem("nfe_token");
        localStorage.removeItem("user_info");
    };

    // DATAS
    const hoje = new Date();

    const dataFimPadrao =
        hoje.toISOString().split("T")[0];

    const dataInicioObj = new Date();

    dataInicioObj.setDate(
        dataInicioObj.getDate() - 30
    );

    const dataInicioPadrao =
        dataInicioObj.toISOString().split("T")[0];

    const [dataInicio, setDataInicio] =
        useState(dataInicioPadrao);

    const [dataFim, setDataFim] =
        useState(dataFimPadrao);

    // SISTEMA
    const [busca, setBusca] = useState("");

    const [loading, setLoading] =
        useState(false);

    const [logs, setLogs] =
        useState([]);

    const [itens, setItens] =
        useState([]);

    const [erros, setErros] = useState([]);

    // HELPERS
    const formatarData = (data) => {

        if (!data) return "-";

        return new Date(data).toLocaleString("pt-BR", {
            timeZone: "UTC",
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        });
    };

    const [funcionarios, setFuncionarios] =
        useState([]);

    const [mapaFuncionarios, setMapaFuncionarios] =
        useState({});

    const carregarFuncionarios = async () => {

        try {

            const response = await fetch(
                `${API}/api/funcionarios/listar`
            );

            const data = await response.json();

            const lista =
                Array.isArray(data)
                    ? data
                    : [];

            setFuncionarios(lista);

            const mapa = {};

            lista.forEach((func) => {

                mapa[func.codigo] =
                    func.nome;
            });

            setMapaFuncionarios(mapa);

        } catch (err) {

            console.error(err);
        }
    };

    useEffect(() => {

        carregarFuncionarios();

    }, []);

    // Focus no input de buscar produto
    useEffect(() => {

        buscaRef.current?.focus();

    }, []);

    const getNomeFuncionario = (codigo) => {

        if (!codigo) return "-";

        return (
            mapaFuncionarios[codigo]
            ||
            codigo
        );
    };

    const getTipoChip = (tipo) => {

        switch (tipo) {

            case "UNIDADE":
                return "primary";

            case "CAIXA":
                return "warning";

            default:
                return "default";
        }
    };

    // Busca de guarda
    const buscarGuardas = async () => {

        if (!busca.trim()) return;

        setLoading(true);

        try {

            const params =
                new URLSearchParams();

            const termo =
                busca.trim();

            if (/^\d+$/.test(termo)) {

                params.append(
                    "codigo_barras",
                    termo
                );

            } else {

                params.append(
                    "basico",
                    termo.toUpperCase()
                );
            }

            if (dataInicio) {

                params.append(
                    "data_inicio",
                    dataInicio
                );
            }

            if (dataFim) {

                params.append(
                    "data_fim",
                    dataFim
                );
            }

            params.append("limit", "10000");

            // Busca de erros
            const responseLogs =
                await fetch(
                    `${API}/api/avulso/logs/por_produto?${params.toString()}`
                );

            const dataLogs =
                await responseLogs.json();

            const logsArray =
                Array.isArray(dataLogs)
                    ? dataLogs
                    : dataLogs.logs || [];

            setLogs(logsArray);

            // PARAMS APENAS PARA ERROS
            const paramsErro = new URLSearchParams();

            if (/^\d+$/.test(termo)) {

                paramsErro.append(
                    "codigo_barras",
                    termo
                );

            } else {

                paramsErro.append(
                    "basico",
                    termo.toUpperCase()
                );
            }

            // BUSCA ERROS
            const responseErros =
                await fetch(
                    `${API}/api/avulso/erros/por_produto?${paramsErro.toString()}`
                );

            const dataErros =
                await responseErros.json();

            console.log("ERROS API:", dataErros);

            const errosArray =
                Array.isArray(dataErros)
                    ? dataErros
                    : dataErros.erros || [];

            setErros(errosArray);

            // Busca de guardas corretas
            const responseItens =
                await fetch(
                    `${API}/api/avulso/logs/por_produto?${params.toString()}`
                );

            const dataItens =
                await responseItens.json();

            const itensArray =
                Array.isArray(dataItens)
                    ? dataItens
                    : dataItens.items || [];

            setItens(itensArray);

        } catch (err) {

            console.error(err);

            setLogs([]);
            setItens([]);
            setErros([]);

        } finally {

            setLoading(false);
        }
    };

    const navegarCampos = (e, proximoRef, anteriorRef, acaoEnter) => {

        switch (e.key) {

            case "ArrowRight":
            case "ArrowDown":

                e.preventDefault();

                proximoRef?.current?.focus();

                break;

            case "ArrowLeft":
            case "ArrowUp":

                e.preventDefault();

                anteriorRef?.current?.focus();

                break;

            case "Enter":

                e.preventDefault();

                if (acaoEnter) {

                    acaoEnter();

                } else {

                    proximoRef?.current?.focus();
                }

                break;

            default:
                break;
        }
    };

    return (

        <Container
            maxWidth="100%"
            sx={{
                mt: 4,
                pb: 4,
                bgcolor: "background.default"
            }}
        >

            {/* HEADER */}
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: {
                        xs: 'column',
                        md: 'row'
                    },
                    justifyContent: 'space-between',
                    alignItems: {
                        xs: 'flex-start',
                        md: 'center'
                    },
                    gap: 2,
                    p: 2,
                    bgcolor: 'var(--azul)',
                    mb: 4,
                    borderRadius: '2vh',
                    zoom: '0.9'
                }}
            >

                <Box>

                    <Typography
                        variant="h4"
                        sx={{
                            fontFamily: 'Consolas',
                            color: "background.paper",
                            fontWeight: "bold"
                        }}
                    >
                        Consulta de Guardas
                    </Typography>

                    <Typography
                        sx={{
                            color: "rgba(255,255,255,0.7)"
                        }}
                    >
                        Histórico completo de armazenagem
                    </Typography>

                </Box>

                <Box>

                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'right'
                        }}
                    >

                        <PersonIcon
                            sx={{
                                color: "background.paper",
                                pr: 1
                            }}
                        />

                        <Typography
                            sx={{
                                color: "background.paper",
                                fontSize: '0.9rem'
                            }}
                        >
                            {userInfo?.nome}
                        </Typography>

                        {token && (

                            <Button
                                size="small"
                                onClick={logout}
                                sx={{
                                    color: "background.paper"
                                }}
                            >
                                <LogoutIcon />
                            </Button>
                        )}
                    </Box>

                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'right'
                        }}
                    >

                        <Button
                            onClick={() =>
                                navigate("/")
                            }
                            sx={{
                                color: "background.paper",
                                gap: 1
                            }}
                        >
                            Voltar
                            <ArrowBackIcon />
                        </Button>

                    </Box>

                </Box>

            </Box>

            {/* FILTROS */}
            <Paper
                elevation={0}
                sx={{
                    p: 3,
                    mb: 4,
                    borderRadius: '2vh',
                    bgcolor: 'background.alerta',
                    border: dark
                        ? '1px solid rgba(255,255,255,0.08)'
                        : '1px solid rgba(0,0,0,0.08)',
                        zoom: '0.9'
                }}
            >

                <Grid
                    container
                    spacing={2}
                    alignItems="center"
                >

                    <Grid item xs={12} md={5}>

                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Buscar por produto"

                            inputRef={buscaRef}

                            value={busca}

                            onChange={(e) =>
                                setBusca(e.target.value)
                            }

                            onKeyDown={(e) =>
                                navegarCampos(
                                    e,
                                    dataInicioRef,
                                    null
                                )
                            }
                            autoComplete="off"
                            inputProps={{
                                spellCheck: false,
                                autoCorrect: "off",
                                autoCapitalize: "off",
                            }}
                            InputProps={{
                                startAdornment: (
                                    <SearchIcon
                                        sx={{
                                            mr: 1,
                                            color: 'text.secondary'
                                        }}
                                    />
                                )
                            }}
                        />

                    </Grid>

                    <Grid item xs={12} md={2}>

                        <TextField
                            fullWidth
                            type="date"
                            size="small"

                            inputRef={dataInicioRef}

                            value={dataInicio}

                            onChange={(e) =>
                                setDataInicio(
                                    e.target.value
                                )
                            }

                            onKeyDown={(e) =>
                                navegarCampos(
                                    e,
                                    dataFimRef,
                                    buscaRef
                                )
                            }
                        />

                    </Grid>

                    <Grid item xs={12} md={2}>

                        <TextField
                            fullWidth
                            type="date"
                            size="small"

                            inputRef={dataFimRef}

                            value={dataFim}

                            onChange={(e) =>
                                setDataFim(
                                    e.target.value
                                )
                            }

                            onKeyDown={(e) =>
                                navegarCampos(
                                    e,
                                    null,
                                    dataInicioRef,
                                    buscarGuardas
                                )
                            }
                        />

                    </Grid>

                    <Grid item xs={12} md={3}>

                        <Button
                            fullWidth
                            variant="contained"
                            size="large"
                            startIcon={<SearchIcon />}
                            onClick={buscarGuardas}
                            sx={{
                                height: '40px'
                            }}
                        >
                            Buscar Guardas
                        </Button>

                    </Grid>

                </Grid>

            </Paper>

            {/* LOADING */}
            {loading && (

                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        mt: 10
                    }}
                >
                    <CircularProgress />
                </Box>
            )}

            {/* RESUMO */}
            {!loading && logs.length > 0 && (

                <Grid
                    container
                    spacing={2}
                    sx={{ mb: 4 }}
                >

                    <Grid item xs={12} md={3}>

                        <Card
                            sx={{
                                borderRadius: '2vh',
                                bgcolor: 'background.alerta',
                                zoom: '0.9'
                            }}
                        >

                            <CardContent>

                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 2
                                    }}
                                >

                                    <Inventory2Icon
                                        color="primary"
                                    />

                                    <Box>

                                        <Typography
                                            variant="h5"
                                            fontWeight="bold"
                                        >
                                            {logs.length}
                                        </Typography>

                                        <Typography
                                            variant="body2"
                                        >
                                            Guardas encontradas
                                        </Typography>

                                    </Box>

                                </Box>

                            </CardContent>

                        </Card>

                    </Grid>

                    <Grid item xs={12} md={3}>

                        <Card
                            sx={{
                                borderRadius: '2vh',
                                bgcolor: 'background.alerta',
                                zoom: '0.9'
                            }}
                        >

                            <CardContent>

                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 2
                                    }}
                                >

                                    <WarehouseIcon
                                        color="success"
                                    />

                                    <Box>

                                        <Typography
                                            variant="h5"
                                            fontWeight="bold"
                                        >
                                            {
                                                logs.filter(
                                                    l =>
                                                        l.tipo_guarda === "UNIDADE"
                                                ).length
                                            }
                                        </Typography>

                                        <Typography
                                            variant="body2"
                                        >
                                            Guardas unidade
                                        </Typography>

                                    </Box>

                                </Box>

                            </CardContent>

                        </Card>

                    </Grid>

                    <Grid item xs={12} md={3}>

                        <Card
                            sx={{
                                borderRadius: '2vh',
                                bgcolor: 'background.alerta',
                                zoom: '0.9'
                            }}
                        >

                            <CardContent>

                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 2
                                    }}
                                >

                                    <LocationOnIcon
                                        color="warning"
                                    />

                                    <Box>

                                        <Typography
                                            variant="h5"
                                            fontWeight="bold"
                                        >
                                            {
                                                [...new Set(
                                                    logs.map(
                                                        l =>
                                                            l.local_informado
                                                    )
                                                )].length
                                            }
                                        </Typography>

                                        <Typography
                                            variant="body2"
                                        >
                                            Locais utilizados
                                        </Typography>

                                    </Box>

                                </Box>

                            </CardContent>

                        </Card>

                    </Grid>

                    <Grid item xs={12} md={3}>

                        <Card
                            sx={{
                                borderRadius: '2vh',
                                bgcolor: 'background.alerta',
                                zoom: '0.9'
                            }}
                        >

                            <CardContent>

                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 2
                                    }}
                                >

                                    <BadgeIcon
                                        color="primary"
                                    />

                                    <Box>

                                        <Typography
                                            variant="h5"
                                            fontWeight="bold"
                                        >
                                            {
                                                [...new Set(
                                                    logs.map(
                                                        l =>
                                                            l.funcionario
                                                    )
                                                )].length
                                            }
                                        </Typography>

                                        <Typography
                                            variant="body2"
                                        >
                                            Funcionários
                                        </Typography>

                                    </Box>

                                </Box>

                            </CardContent>

                        </Card>

                    </Grid>

                    <Grid item xs={12} md={3}>

                        <Card
                            sx={{
                                borderRadius: '2vh',
                                bgcolor: 'background.alerta',
                                zoom: '0.9'
                            }}
                        >

                            <CardContent>

                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 2
                                    }}
                                >
                                    <BadgeIcon
                                        color="error"
                                    />
                                    <Box>
                                        <Typography
                                            variant="h5"
                                            fontWeight="bold"
                                        >
                                            {erros.length}
                                        </Typography>

                                        <Typography
                                            variant="body2"
                                        >
                                            Erros encontrados
                                        </Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            )}

            {/* TABELA */}
            {!loading && (

                <Card
                    sx={{
                        borderRadius: '2vh',
                        overflow: 'hidden',
                        bgcolor: 'background.alerta',
                        zoom: '0.9'
                    }}
                >
                    <CardContent sx={{ p: 0 }}>
                        <Box
                            sx={{
                                p: 2,
                                borderBottom:
                                    dark
                                        ? '1px solid rgba(255,255,255,0.08)'
                                        : '1px solid rgba(0,0,0,0.08)'
                            }}
                        >
                            <Typography
                                variant="h6"
                                fontWeight="bold"
                            >
                                Histórico de Guardas
                            </Typography>
                        </Box>

                        <Table
                            sx={{
                                tableLayout: 'fixed',
                                width: '100%'
                            }}
                        >

                            <TableHead>

                                <TableRow>

                                    <TableCell sx={{ width: '28%' }}>
                                        Produto
                                    </TableCell>

                                    <TableCell sx={{ width: '16%' }}>
                                        Código de barras
                                    </TableCell>

                                    <TableCell sx={{ width: '16%' }}>
                                        Local da guarda
                                    </TableCell>

                                    <TableCell sx={{ width: '8%' }}>
                                        Quantidade
                                    </TableCell>

                                    <TableCell sx={{ width: '10%' }}>
                                        Tipo
                                    </TableCell>

                                    <TableCell sx={{ width: '16%' }}>
                                        Funcionário
                                    </TableCell>

                                    <TableCell sx={{ width: '16%' }}>
                                        Data/Hora
                                    </TableCell>

                                </TableRow>

                            </TableHead>

                            <TableBody>

                                {logs.length === 0 ? (

                                    <TableRow>

                                        <TableCell
                                            colSpan={7}
                                            align="center"
                                        >

                                            <Box
                                                sx={{
                                                    py: 8
                                                }}
                                            >

                                                <WarehouseIcon
                                                    sx={{
                                                        fontSize: 60,
                                                        opacity: 0.3,
                                                        mb: 2
                                                    }}
                                                />

                                                <Typography
                                                    variant="h6"
                                                >
                                                    Nenhum registro encontrado
                                                </Typography>

                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                >
                                                    Faça uma busca para visualizar os históricos
                                                </Typography>

                                            </Box>

                                        </TableCell>

                                    </TableRow>

                                ) : (

                                    logs.map((log) => (

                                        <TableRow
                                            key={log.id}

                                            hover

                                            sx={{
                                                transition: '0.2s'
                                            }}
                                        >

                                            <TableCell>

                                                <Box>

                                                    <Typography
                                                        fontWeight="bold"
                                                    >
                                                        {log.basico}
                                                    </Typography>

                                                    <Typography
                                                        variant="body2"
                                                        color="text.secondary"
                                                    >
                                                        {
                                                            log.descricao_produto
                                                        }
                                                    </Typography>

                                                </Box>

                                            </TableCell>

                                            <TableCell>
                                                <Box
                                                    sx={{
                                                        wordBreak: 'break-word'
                                                    }}
                                                >
                                                    {log.codigo_barras}
                                                </Box>
                                            </TableCell>

                                            <TableCell>

                                                <Box
                                                    sx={{
                                                        wordBreak: 'break-word'
                                                    }}
                                                >

                                                    <Typography
                                                        fontWeight="bold"
                                                    >
                                                        {log.local_informado}
                                                    </Typography>

                                                    <Typography
                                                        variant="body2"
                                                        color="text.secondary"
                                                    >
                                                        LOC SSPlus: {log.local_sistema}
                                                    </Typography>

                                                </Box>

                                            </TableCell>

                                            <TableCell>

                                                <Chip
                                                    label={
                                                        log.quantidade
                                                    }
                                                    color="primary"
                                                    size="small"
                                                />

                                            </TableCell>

                                            <TableCell>

                                                <Chip
                                                    label={
                                                        log.tipo_guarda
                                                    }
                                                    color={
                                                        getTipoChip(
                                                            log.tipo_guarda
                                                        )
                                                    }
                                                    size="small"
                                                />

                                            </TableCell>

                                            <TableCell>

                                                <Box
                                                    sx={{
                                                        wordBreak: 'break-word'
                                                    }}
                                                >

                                                    <Typography
                                                        fontWeight="bold"
                                                    >
                                                        {getNomeFuncionario(log.funcionario)}
                                                    </Typography>

                                                    <Typography
                                                        variant="body2"
                                                        color="text.secondary"
                                                    >
                                                        {log.funcionario}
                                                    </Typography>

                                                </Box>

                                            </TableCell>

                                            <TableCell>

                                                <Box
                                                    sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 1
                                                    }}
                                                >

                                                    <CalendarMonthIcon
                                                        fontSize="small"
                                                        color="action"
                                                    />

                                                    {
                                                        formatarData(
                                                            log.data_guarda
                                                        )
                                                    }

                                                </Box>

                                            </TableCell>

                                        </TableRow>
                                    ))
                                )}

                            </TableBody>

                        </Table>

                    </CardContent>

                </Card>

            )}

            {/* TABELA DE ERROS */}
            {
                !loading
                &&
                erros.length > 0
                &&
                (
                    <Card
                        sx={{
                            mt: 4,
                            borderRadius: '2vh',
                            overflow: 'hidden',
                            bgcolor: 'background.alerta',
                            zoom: '0.9'
                        }}
                    >
                        <CardContent sx={{ p: 0 }}>
                            <Box
                                sx={{
                                    p: 2,
                                    borderBottom:
                                        dark
                                            ? '1px solid rgba(255,255,255,0.08)'
                                            : '1px solid rgba(0,0,0,0.08)'
                                }}
                            >
                                <Typography
                                    variant="h6"
                                    fontWeight="bold"
                                    color="error"
                                >
                                    Logs de Erros
                                </Typography>

                            </Box>

                            <Table
                                sx={{
                                    tableLayout: 'fixed',
                                    width: '100%'
                                }}
                            >
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ width: '18%' }}>
                                            Produto
                                        </TableCell>

                                        <TableCell sx={{ width: '14%' }}>
                                            Código Barras
                                        </TableCell>

                                        <TableCell sx={{ width: '18%' }}>
                                            Funcionário
                                        </TableCell>

                                        <TableCell sx={{ width: '20%' }}>
                                            Tipo
                                        </TableCell>

                                        <TableCell sx={{ width: '30%' }}>
                                            Mensagem
                                        </TableCell>

                                    </TableRow>

                                </TableHead>

                                <TableBody>

                                    {
                                        erros.map((erro) => (

                                            <TableRow
                                                key={erro.id}
                                                hover
                                            >

                                                <TableCell>

                                                    <Box>

                                                        <Typography
                                                            fontWeight="bold"
                                                        >
                                                            {erro.basico}
                                                        </Typography>

                                                    </Box>

                                                </TableCell>

                                                <TableCell>

                                                    <Typography>
                                                        {erro.codigo_barras}
                                                    </Typography>

                                                </TableCell>

                                                <TableCell>

                                                    <Box>

                                                        <Typography
                                                            fontWeight="bold"
                                                        >
                                                            {
                                                                getNomeFuncionario(
                                                                    erro.funcionario
                                                                )
                                                            }
                                                        </Typography>

                                                        <Typography
                                                            variant="body2"
                                                            color="text.secondary"
                                                        >
                                                            {erro.funcionario}
                                                        </Typography>

                                                    </Box>

                                                </TableCell>

                                                <TableCell>

                                                    <Chip
                                                        label={erro.tipo}
                                                        color="error"
                                                        size="small"
                                                    />

                                                </TableCell>

                                                <TableCell>

                                                    <Box>

                                                        <Typography
                                                            variant="body2"
                                                        >
                                                            {erro.mensagem}
                                                        </Typography>

                                                        <Typography
                                                            variant="caption"
                                                            color="text.secondary"
                                                        >
                                                            {
                                                                formatarData(
                                                                    erro.timestamp
                                                                )
                                                            }
                                                        </Typography>
                                                    </Box>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    }
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )
            }
        </Container>
    );
}

export default ConsultaGuarda;