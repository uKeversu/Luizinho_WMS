import { useState, useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
    Container,
    Typography,
    Box,
    Button,
    TextField,
    CircularProgress,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Chip,
    MenuItem
} from "@mui/material";

import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';

import { ThemeContext } from "../context/ThemeContext";

import LoginFuncionario from "../components/LoginFuncionario";

import "../style/App.css";

function HistoricoLogs() {

    const { dark } = useContext(ThemeContext);

    const { notaId } = useParams();

    // API BASE
    const API = "http://192.168.1.185:8077";

    // Acessar outras pages
    const navigate = useNavigate();

    // Login e Logout
    const [userInfo, setUserInfo] = useState(() => {
        const user = localStorage.getItem("user_info");
        return user ? JSON.parse(user) : null;
    });
    const [token, setToken] = useState(() => localStorage.getItem("nfe_token") || "");

    const logout = () => {
        setToken("");
        setUserInfo(null);
        localStorage.removeItem("nfe_token");
        localStorage.removeItem("user_info");
    };

    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);

    const [notaInfo, setNotaInfo] = useState(null);
    const [funcionarios, setFuncionarios] = useState([]);

    const [busca, setBusca] = useState("");
    const [usuarioFiltro, setUsuarioFiltro] = useState("");
    const [acaoFiltro, setAcaoFiltro] = useState("");

    const carregarLogs = async () => {

        try {

            setLoading(true);

            const response = await fetch(
                `${API}/api/nfe/item/movimentacao/log?nota_id=${notaId}`,
                {
                    headers: {
                        "Content-Type": "application/json",
                        "X-Auth-Token": token
                    }
                }
            );

            const data = await response.json();

            setLogs(data.logs || []);

        } catch (error) {

            console.error(error);

        } finally {

            setLoading(false);
        }
    };

    useEffect(() => {
        carregarLogs();
        carregarFuncionarios();
        carregarNota();
    }, []);

    const formatarData = (data) => {
        if (!data) return "-";

        return new Date(data + "Z").toLocaleString("pt-BR", {
            timeZone: "America/Sao_Paulo"
        });
    };

    const carregarFuncionarios = async () => {
        try {

            const response = await fetch(
                `${API}/api/funcionarios/listar`,
                {
                    headers: {
                        "X-Auth-Token": token
                    }
                }
            );

            const data = await response.json();

            setFuncionarios(data || []);

        } catch (error) {
            console.error(error);
        }
    };

    const carregarNota = async () => {
        try {

            const response = await fetch(
                `${API}/api/notas/listar?page=1&data_inicio=2026-01-01&data_fim=2026-12-31&id=${notaId}&sort_by=data_emissao&sort_order=DESC`,
                {
                    headers: {
                        "Content-Type": "application/json",
                        "X-Auth-Token": token
                    }
                }
            );

            const data = await response.json();
            console.log(data)
            console.log(data.data[0])

            if (data.data?.length > 0) {
                setNotaInfo(data.data[0]);
            }

        } catch (error) {
            console.error(error);
        }
    };

    const obterNomeUsuario = (codigo) => {

        const funcionario = funcionarios.find(
            f => String(f.codigo) === String(codigo)
        );

        return funcionario?.nome || codigo;
    };

    const funcionariosMap = Object.fromEntries(
        funcionarios.map(f => [
            String(f.codigo),
            f.nome
        ])
    );

    const logsFiltrados = logs.filter(log => {

        const termo = busca.toLowerCase();

        const passouBusca =
            !busca ||
            log.acao?.toLowerCase().includes(termo) ||
            log.cod_produto?.toLowerCase().includes(termo) ||
            log.cod_barras?.toLowerCase().includes(termo) ||
            log.caixa?.toLowerCase().includes(termo) ||
            log.observacoes?.toLowerCase().includes(termo);

        const passouAcao =
            !acaoFiltro ||
            log.acao === acaoFiltro;

        const passouUsuario =
            !usuarioFiltro ||
            (funcionariosMap[String(log.usuario)] || "")
                .toLowerCase()
                .includes(usuarioFiltro.toLowerCase());

        return (
            passouBusca &&
            passouAcao &&
            passouUsuario
        );
    });

    const acoes = [
        ...new Set(
            logs
                .map(log => log.acao)
                .filter(Boolean)
        )
    ].sort();

    return (
        <Container
            maxWidth="100%"
            sx={{
                mt: 4,
                bgcolor: "background.default"
            }}
        >

            {/* HEADER */}

            <Box
                sx={{
                    display: "flex",
                    flexDirection: {
                        xs: "column",
                        md: "row"
                    },
                    justifyContent: "space-between",
                    alignItems: {
                        xs: "flex-start",
                        md: "center"
                    },
                    gap: 2,
                    p: 2,
                    bgcolor: "var(--azul)",
                    mb: 4,
                    borderRadius: "2vh",
                    zoom: '0.9'
                }}
            >

                <Typography
                    variant="h4"
                    sx={{
                        fontFamily: "Consolas",
                        color: "background.paper"
                    }}
                >
                    <strong>
                        Histórico de Logs
                    </strong>
                </Typography>

                <Box>

                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "right"
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
                                fontSize: "0.9rem"
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
                            display: "flex",
                            justifyContent: "right"
                        }}
                    >

                        <Button
                            onClick={() => navigate("/")}
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

            <Paper sx={{ p: 2, mb: 3, bgcolor: 'background.alerta', zoom: '0.9' }}>

                <Box
                    display="flex"
                    gap={2}
                    flexWrap="wrap"
                >

                    <TextField
                        label="Buscar"
                        value={busca}
                        onChange={(e) =>
                            setBusca(e.target.value)
                        }
                        sx={{ minWidth: 300 }}
                        InputProps={{
                            startAdornment:
                                <SearchIcon />
                        }}
                    />

                    <TextField
                        label="Usuário"
                        value={usuarioFiltro}
                        onChange={(e) =>
                            setUsuarioFiltro(
                                e.target.value
                            )
                        }
                    />

                    <TextField
                        select
                        label="Filtrar ação"
                        size="small"
                        value={acaoFiltro}
                        onChange={(e) => {
                            setAcaoFiltro(e.target.value);
                        }}
                        sx={{
                            minWidth: 250,
                        }}
                        SelectProps={{
                            MenuProps: {
                                PaperProps: {
                                    sx: {
                                        bgcolor: "background.default",
                                        color: "text.primary"
                                    }
                                }
                            }
                        }}
                    >
                        <MenuItem value="">
                            Todas as ações
                        </MenuItem>

                        {acoes.map((acao) => (
                            <MenuItem
                                key={acao}
                                value={acao}
                            >
                                {acao} (
                                {
                                    logs.filter(
                                        l => l.acao === acao
                                    ).length
                                }
                                )
                            </MenuItem>
                        ))}
                    </TextField>
                </Box>
            </Paper>

            {/* NOTA */}
            <Paper
                sx={{
                    p: 2,
                    mb: 3,
                    bgcolor: "background.alerta"
                }}
            >
                <Box
                    display="flex"
                    gap={4}
                    flexWrap="wrap"
                    sx={{ justifyContent: 'space-around', zoom: '0.9' }}
                >
                    <Box>
                        <Typography variant="caption">
                            Nota Fiscal
                        </Typography>
                        <Typography variant="h6">
                            {notaInfo?.numero}
                        </Typography>
                    </Box>
                    <Box>
                        <Typography variant="caption">
                            Série
                        </Typography>
                        <Typography variant="h6">
                            {notaInfo?.serie}
                        </Typography>
                    </Box>
                    <Box>
                        <Typography variant="caption">
                            Fornecedor
                        </Typography>
                        <Typography variant="h6">
                            {notaInfo?.fornecedor}
                        </Typography>
                    </Box>
                    <Box>
                        <Typography variant="caption">
                            Status
                        </Typography>
                        <Typography variant="h6">
                            {notaInfo?.status}
                        </Typography>
                    </Box>
                    <Box>
                        <Typography variant="caption">
                            Emissão
                        </Typography>
                        <Typography variant="h6">
                            {notaInfo?.data_emissao}
                        </Typography>
                    </Box>
                    <Box>
                        <Typography variant="caption">
                            Importação/Recebimento
                        </Typography>
                        <Typography variant="h6">
                            {notaInfo?.data_recebimento}
                        </Typography>
                    </Box>

                </Box>
            </Paper>

            {/* RESUMO */}

            <Box
                display="flex"
                gap={2}
                mb={3}
                flexWrap="wrap"
                sx={{ zoom: '0.9' }}
            >
                <Chip
                    color="primary"
                    label={`Total Logs: ${logsFiltrados.length}`}
                />
                <Chip
                    color="success"
                    label={`Produtos movimentados: ${new Set(
                        logsFiltrados
                            .map(l => l.cod_produto)
                            .filter(Boolean)
                    ).size
                        }`}
                />
                <Chip
                    color="warning"
                    label={`Usuários: ${new Set(
                        logsFiltrados
                            .map(l => l.usuario)
                            .filter(Boolean)
                    ).size
                        }`}
                />
            </Box>

            {/* TABELA */}

            <Paper sx={{ bgcolor: 'background.alerta', zoom: '0.9' }}>

                {loading ? (

                    <Box
                        display="flex"
                        justifyContent="center"
                        p={5}
                    >
                        <CircularProgress />
                    </Box>

                ) : (

                    <Table>

                        <TableHead>

                            <TableRow>

                                <TableCell>Data/Hora</TableCell>
                                <TableCell>Ação</TableCell>
                                <TableCell>Observação</TableCell>
                                <TableCell>Produto</TableCell>
                                <TableCell>Código Barras</TableCell>
                                <TableCell>Qtd</TableCell>
                                <TableCell>Caixa</TableCell>
                                <TableCell>LOC</TableCell>
                                <TableCell>Usuário</TableCell>

                            </TableRow>

                        </TableHead>

                        <TableBody>

                            {logsFiltrados.map(log => (

                                <TableRow key={log.id}>

                                    <TableCell>
                                        {formatarData(
                                            log.data_hora
                                        )}
                                    </TableCell>

                                    <TableCell>
                                        {log.acao}
                                    </TableCell>

                                    <TableCell>
                                        {log.observacoes}
                                    </TableCell>

                                    <TableCell>
                                        {log.cod_produto || "-"}
                                    </TableCell>

                                    <TableCell>
                                        {log.cod_barras || "-"}
                                    </TableCell>

                                    <TableCell>
                                        {log.quantidade || "-"}
                                    </TableCell>

                                    <TableCell>
                                        {log.caixa || "-"}
                                    </TableCell>

                                    <TableCell>
                                        {log.local_novo || "-"}
                                    </TableCell>

                                    <TableCell>
                                        {funcionariosMap[String(log.usuario)] || log.usuario}
                                    </TableCell>

                                </TableRow>

                            ))}

                        </TableBody>

                    </Table>

                )}

            </Paper>

        </Container>
    );
}

export default HistoricoLogs;