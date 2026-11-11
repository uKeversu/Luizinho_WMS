
import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import {
    Container,
    Typography,
    Card,
    CardContent,
    Chip,
    Divider,
    Box,
    TextField,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Snackbar,
    Alert,
    CircularProgress,
    IconButton,
    Tooltip,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Stack,
    InputAdornment
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import StorefrontIcon from "@mui/icons-material/Storefront";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";

import MenuUsuario from "../../components/MenuUsuario";
import NotificacoesMenu from "../../components/Notificacoes";

import "../../style/App.css";

// Empresas do Ecommerce
const EMPRESAS = {
    "0002": "Nova Geração",
    "0003": "Cani Auto Peças",
    "0005": "Cani Parts"
};

// Retorna o primeiro campo existente entre as opções
function obterCampo(objeto, campos, padrao = "") {
    for (const campo of campos) {
        if (
            objeto &&
            objeto[campo] !== undefined &&
            objeto[campo] !== null &&
            objeto[campo] !== ""
        ) {
            return objeto[campo];
        }
    }

    return padrao;
}

// Converte o saldo para número
function converterNumero(valor) {
    if (typeof valor === "number") {
        return valor;
    }

    if (typeof valor === "string") {
        const normalizado = valor.trim().replace(",", ".");
        const numero = Number(normalizado);

        return Number.isFinite(numero) ? numero : 0;
    }

    return 0;
}

// Localiza os registros dentro de diferentes formatos de resposta da API
function extrairRegistros(data, camposPossiveis = []) {
    if (Array.isArray(data)) {
        return data;
    }

    if (!data || typeof data !== "object") {
        return [];
    }

    for (const campo of camposPossiveis) {
        if (Array.isArray(data[campo])) {
            return data[campo];
        }
    }

    if (Array.isArray(data.data)) {
        return data.data;
    }

    if (Array.isArray(data.resultados)) {
        return data.resultados;
    }

    if (Array.isArray(data.result)) {
        return data.result;
    }

    return [];
}

function formatarMoeda(valor) {
    const numero = Number(valor);

    if (!Number.isFinite(numero)) {
        return "Não informado";
    }

    return numero.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

function formatarData(valor) {
    if (!valor) {
        return "Não informada";
    }

    const data = new Date(valor);

    if (Number.isNaN(data.getTime())) {
        return String(valor);
    }

    return data.toLocaleString("pt-BR");
}

function AlertaEstoque() {

    const navigate = useNavigate();

    const API = "http://192.168.1.185:6062";

    const ROTAS = {
        vendas: "/api/vendas-ml",
        estoque: "/api/estoque-ml"
    };

    // LOGIN E LOGOUT
    const [userInfo, setUserInfo] = useState(() => {
        try {
            const user = localStorage.getItem("user_info");
            return user ? JSON.parse(user) : null;
        } catch {
            return null;
        }
    });

    const [token, setToken] = useState(
        () => localStorage.getItem("nfe_token") || ""
    );

    const logout = () => {
        setToken("");
        setUserInfo(null);

        localStorage.removeItem("nfe_token");
        localStorage.removeItem("user_info");

        Object.keys(localStorage).forEach(key => {
            if (
                key.startsWith("itens_conferencia") ||
                key.startsWith("caixas_conferencia")
            ) {
                localStorage.removeItem(key);
            }
        });
    };

    // ESTADOS
    const [vendas, setVendas] = useState([]);
    const [estoque, setEstoque] = useState([]);

    const [loading, setLoading] = useState(true);
    const [atualizando, setAtualizando] = useState(false);

    const [empresaSelecionada, setEmpresaSelecionada] = useState("TODAS");
    const [buscaEstoque, setBuscaEstoque] = useState("");
    const [buscaVendas, setBuscaVendas] = useState("");

    const [snackbar, setSnackbar] = useState({
        open: false,
        mensagem: "",
        tipo: "info"
    });

    const mostrarMensagem = (mensagem, tipo = "info") => {
        setSnackbar({
            open: true,
            mensagem,
            tipo
        });
    };

    // CONSULTA DAS APIS
    const buscarDados = useCallback(async (silencioso = false) => {
        const tokenAtual = localStorage.getItem("nfe_token");

        if (!tokenAtual) {
            setLoading(false);
            setAtualizando(false);
            return;
        }

        if (silencioso) {
            setAtualizando(true);
        } else {
            setLoading(true);
        }

        const consultar = async (rota) => {
            const response = await fetch(`${API}${rota}`, {
                method: "GET",
                headers: {
                    "X-Auth-Token": tokenAtual
                }
            });

            if (!response.ok) {
                throw new Error(
                    `Erro ${response.status} ao consultar ${rota}`
                );
            }

            return response.json();
        };

        try {
            const [resultadoVendas, resultadoEstoque] =
                await Promise.allSettled([
                    consultar(ROTAS.vendas),
                    consultar(ROTAS.estoque)
                ]);

            let houveErro = false;

            if (resultadoVendas.status === "fulfilled") {
                const registrosVendas = extrairRegistros(
                    resultadoVendas.value,
                    ["vendas", "dados", "notas", "resultados"]
                );

                setVendas(registrosVendas);
            } else {
                houveErro = true;
                console.error(
                    "[Ecommerce] Erro ao consultar vendas:",
                    resultadoVendas.reason
                );
            }

            if (resultadoEstoque.status === "fulfilled") {
                const registrosEstoque = extrairRegistros(
                    resultadoEstoque.value,
                    ["estoque", "produtos", "dados", "itens", "resultados"]
                );

                setEstoque(registrosEstoque);
            } else {
                houveErro = true;
                console.error(
                    "[Ecommerce] Erro ao consultar estoque:",
                    resultadoEstoque.reason
                );
            }

            if (houveErro) {
                mostrarMensagem(
                    "Não foi possível atualizar todos os dados. Verifique as consultas da API.",
                    "warning"
                );
            } else if (silencioso) {
                mostrarMensagem("Dashboard atualizado!", "success");
            }
        } catch (error) {
            console.error("[Ecommerce] Erro geral:", error);

            mostrarMensagem(
                "Não foi possível carregar os dados do Ecommerce.",
                "error"
            );
        } finally {
            setLoading(false);
            setAtualizando(false);
        }
    }, []);

    useEffect(() => {
        buscarDados();
    }, [buscarDados]);

    // NORMALIZAÇÃO DO ESTOQUE
    const estoqueNormalizado = useMemo(() => {
        return estoque.map((item, index) => ({
            ...item,
            _id: `${item.empfill || "empresa"}-${item.codigo || index}-${index}`,
            _saldo: converterNumero(item.estoque),
            _empresa: String(item.empfill || "").padStart(4, "0"),
            _codigo: obterCampo(item, ["codigo", "cod_produto", "produto"]),
            _ean: obterCampo(item, ["cean", "ean", "codigo_barras"])
        }));
    }, [estoque]);

    // NORMALIZAÇÃO DAS VENDAS
    const vendasNormalizadas = useMemo(() => {
        return vendas.map((item, index) => {
            const empresa = obterCampo(
                item,
                ["empfill", "empresa", "codigo_empresa"],
                ""
            );

            const status = String(
                obterCampo(
                    item,
                    ["status", "situacao", "status_venda", "situacao_venda"],
                    ""
                )
            ).toLowerCase();

            return {
                ...item,
                _id: obterCampo(
                    item,
                    ["id", "id_venda", "numero", "pedido", "order_id"],
                    index
                ),
                _empresa: String(empresa).padStart(4, "0"),
                _status: status,
                _data: obterCampo(
                    item,
                    ["data", "data_venda", "created_at", "data_criacao"]
                ),
                _cliente: obterCampo(
                    item,
                    ["cliente", "nome_cliente", "customer_name", "comprador"],
                    "Não informado"
                ),
                _valor: obterCampo(
                    item,
                    ["valor", "valor_total", "total", "total_venda", "amount"],
                    null
                )
            };
        });
    }, [vendas]);

    // FILTRO DE VENDAS CANCELADAS
    const vendasCanceladas = useMemo(() => {
        return vendasNormalizadas.filter(venda => {
            // Se a API informar status, filtra somente canceladas.
            // Se não informar, considera que a rota já retorna
            // exclusivamente as vendas canceladas.
            const cancelada = venda._status
                ? (
                    venda._status.includes("cancel") ||
                    venda._status.includes("estorn")
                )
                : true;

            const empresaCorresponde =
                empresaSelecionada === "TODAS" ||
                venda._empresa === empresaSelecionada;

            return cancelada && empresaCorresponde;
        });
    }, [vendasNormalizadas, empresaSelecionada]);

    // FILTRO DE ESTOQUE
    const estoqueFiltrado = useMemo(() => {
        const termo = buscaEstoque.toLowerCase().trim();

        return estoqueNormalizado.filter(item => {
            const empresaCorresponde =
                empresaSelecionada === "TODAS" ||
                item._empresa === empresaSelecionada;

            const buscaCorresponde =
                !termo ||
                String(item._codigo).toLowerCase().includes(termo) ||
                String(item._ean).toLowerCase().includes(termo);

            return empresaCorresponde && buscaCorresponde;
        });
    }, [estoqueNormalizado, empresaSelecionada, buscaEstoque]);

    // FILTRO DE BUSCA DAS VENDAS
    const vendasFiltradas = useMemo(() => {
        const termo = buscaVendas.toLowerCase().trim();

        return vendasCanceladas.filter(venda => {
            if (!termo) return true;

            const texto = [
                venda._id,
                venda._cliente,
                venda._empresa,
                venda._data
            ].join(" ").toLowerCase();

            return texto.includes(termo);
        });
    }, [vendasCanceladas, buscaVendas]);

    // INDICADORES
    const indicadores = useMemo(() => {
        const produtos = estoqueNormalizado.filter(item => {
            return (
                empresaSelecionada === "TODAS" ||
                item._empresa === empresaSelecionada
            );
        });

        const positivos = produtos.filter(item => item._saldo > 0);
        const negativos = produtos.filter(item => item._saldo < 0);
        const zerados = produtos.filter(item => item._saldo === 0);

        const totalPositivo = positivos.reduce(
            (total, item) => total + item._saldo,
            0
        );

        const totalNegativo = negativos.reduce(
            (total, item) => total + Math.abs(item._saldo),
            0
        );

        return {
            totalProdutos: produtos.length,
            positivos: positivos.length,
            negativos: negativos.length,
            zerados: zerados.length,
            totalPositivo,
            totalNegativo
        };
    }, [estoqueNormalizado, empresaSelecionada]);

    // INDICADORES POR EMPRESA
    const indicadoresEmpresas = useMemo(() => {
        return Object.entries(EMPRESAS).map(([codigo, nome]) => {
            const produtos = estoqueNormalizado.filter(
                item => item._empresa === codigo
            );

            return {
                codigo,
                nome,
                total: produtos.length,
                positivos: produtos.filter(item => item._saldo > 0).length,
                negativos: produtos.filter(item => item._saldo < 0).length,
                zerados: produtos.filter(item => item._saldo === 0).length
            };
        });
    }, [estoqueNormalizado]);

    // COMPONENTE DE CARD
    const CardIndicador = ({
        titulo,
        valor,
        descricao,
        icone,
        cor,
        fundo
    }) => (
        <Card
            variant="outlined"
            sx={{
                height: "100%",
                borderRadius: 2,
                borderColor: "divider",
                transition: "0.2s",
                "&:hover": {
                    boxShadow: 3,
                    transform: "translateY(-2px)"
                },
                bgcolor: 'background.default'
            }}
        >
            <CardContent sx={{ p: 2.2 }}>
                <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    spacing={1}
                >
                    <Box sx={{ minWidth: 0 }}>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            fontWeight={600}
                        >
                            {titulo}
                        </Typography>

                        <Typography
                            variant="h4"
                            fontWeight={800}
                            sx={{ mt: 1, color: cor }}
                        >
                            {valor}
                        </Typography>

                        <Typography
                            variant="caption"
                            color="text.secondary"
                        >
                            {descricao}
                        </Typography>
                    </Box>

                    <Box
                        sx={{
                            width: 48,
                            height: 48,
                            minWidth: 48,
                            borderRadius: 2,
                            bgcolor: fundo,
                            color: cor,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                        }}
                    >
                        {icone}
                    </Box>
                </Stack>
            </CardContent>
        </Card>
    );

    return (
        <Container
            maxWidth={false}
            sx={{
                mt: 3,
                mb: 4,
                bgcolor: "background.default"
            }}
        >
            {/* CABEÇALHO */}

            <Box
                sx={{
                    display: "flex",
                    flexDirection: { xs: "column", md: "row" },
                    justifyContent: "space-between",
                    alignItems: { xs: "flex-start", md: "center" },
                    gap: 2,
                    p: 2,
                    bgcolor: "var(--azul)",
                    color: "white",
                    mb: 3,
                    borderRadius: "2vh",
                    zoom: 0.9
                }}
            >
                <Box sx={{ minWidth: 0 }}>
                    <Typography
                        variant="h6"
                        fontWeight={800}
                        sx={{ lineHeight: 1.1 }}
                    >
                        Dashboard Ecommerce
                    </Typography>

                    <Typography
                        variant="caption"
                        sx={{ opacity: 0.8 }}
                    >
                        Vendas canceladas e estoque das empresas
                    </Typography>
                </Box>

                <Box>
                    <Stack
                        direction="row"
                        justifyContent="flex-end"
                        alignItems="center"
                    >
                        <Tooltip title="Atualizar dados">
                            <span>
                                <IconButton
                                    onClick={() => buscarDados(true)}
                                    disabled={loading || atualizando}
                                    sx={{ color: "white" }}
                                >
                                    {atualizando ? (
                                        <CircularProgress
                                            size={21}
                                            color="inherit"
                                        />
                                    ) : (
                                        <RefreshIcon />
                                    )}
                                </IconButton>
                            </span>
                        </Tooltip>

                        <NotificacoesMenu
                            apiBase={API}
                            token={token}
                            userInfo={userInfo}
                        />

                        <MenuUsuario
                            userInfo={userInfo}
                            onLogout={logout}
                        />
                    </Stack>

                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "flex-end",
                            mr: "2vh"
                        }}
                    >
                        <Tooltip title="Voltar ao Dashboard de notas">
                            <Button
                                onClick={() => navigate("/")}
                                sx={{
                                    color: "white",
                                    display: "flex",
                                    gap: 0.5,
                                    fontSize: "0.75rem",
                                    minWidth: "auto",
                                    padding: "4px 8px",
                                    whiteSpace: "nowrap"
                                }}
                            >
                                Voltar <ArrowBackIcon />
                            </Button>
                        </Tooltip>
                    </Box>
                </Box>
            </Box>

            {/* FILTRO DE EMPRESA */}

            <Paper
                variant="outlined"
                sx={{
                    p: 2,
                    mb: 3,
                    borderRadius: 2,
                    bgcolor: 'background.default'
                }}
            >
                <Stack
                    direction={{ xs: "column", sm: "row" }}
                    alignItems={{ xs: "stretch", sm: "center" }}
                    justifyContent="space-between"
                    spacing={2}
                >
                    <Box>
                        <Typography fontWeight={800}>
                            Visão das empresas
                        </Typography>

                        <Typography
                            variant="caption"
                            color="text.secondary"
                        >
                            Selecione uma empresa para filtrar os indicadores.
                        </Typography>
                    </Box>

                    <FormControl
                        size="small"
                        sx={{ minWidth: { xs: "100%", sm: 260 } }}
                    >
                        <InputLabel>Empresa</InputLabel>

                        <Select
                            value={empresaSelecionada}
                            label="Empresa"
                            onChange={event =>
                                setEmpresaSelecionada(event.target.value)
                            }
                            MenuProps={{
                                PaperProps: {
                                    sx: {
                                        bgcolor: "background.default",
                                        color: "text.primary"
                                    },
                                },
                            }}
                        >
                            <MenuItem value="TODAS">
                                Todas as empresas
                            </MenuItem>

                            {Object.entries(EMPRESAS).map(([codigo, nome]) => (
                                <MenuItem key={codigo} value={codigo}>
                                    {codigo} - {nome}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Stack>
            </Paper>

            {loading ? (
                <Box
                    sx={{
                        minHeight: 300,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 2
                    }}
                >
                    <CircularProgress />
                    <Typography color="text.secondary">
                        Carregando dados do Ecommerce...
                    </Typography>
                </Box>
            ) : (
                <>
                    {/* INDICADORES GERAIS */}

                    <Box sx={{ mb: 3 }}>
                        <Typography
                            variant="subtitle1"
                            fontWeight={800}
                            sx={{ mb: 1.5 }}
                        >
                            Resumo do estoque
                        </Typography>

                        <Box
                            sx={{
                                display: "grid",
                                gridTemplateColumns: {
                                    xs: "1fr",
                                    sm: "repeat(2, 1fr)",
                                    lg: "repeat(4, 1fr)"
                                },
                                gap: 2
                            }}
                        >
                            <CardIndicador
                                titulo="Produtos cadastrados"
                                valor={indicadores.totalProdutos.toLocaleString("pt-BR")}
                                descricao="Produtos retornados pela API"
                                icone={<Inventory2OutlinedIcon fontSize="large" />}
                                cor="#1976d2"
                                fundo="rgba(25, 118, 210, 0.10)"
                            />

                            <CardIndicador
                                titulo="Estoque positivo"
                                valor={indicadores.positivos.toLocaleString("pt-BR")}
                                descricao={`${indicadores.totalPositivo.toLocaleString("pt-BR")} unidades disponíveis`}
                                icone={<TrendingUpIcon fontSize="large" />}
                                cor="#2e7d32"
                                fundo="rgba(46, 125, 50, 0.10)"
                            />

                            <CardIndicador
                                titulo="Estoque negativo"
                                valor={indicadores.negativos.toLocaleString("pt-BR")}
                                descricao={`${indicadores.totalNegativo.toLocaleString("pt-BR")} unidades em déficit`}
                                icone={<TrendingDownIcon fontSize="large" />}
                                cor="#d32f2f"
                                fundo="rgba(211, 47, 47, 0.10)"
                            />

                            <CardIndicador
                                titulo="Estoque zerado"
                                valor={indicadores.zerados.toLocaleString("pt-BR")}
                                descricao="Produtos sem saldo"
                                icone={<RemoveCircleOutlineIcon fontSize="large" />}
                                cor="#ed6c02"
                                fundo="rgba(237, 108, 2, 0.10)"
                            />
                        </Box>
                    </Box>

                    {/* RESUMO POR EMPRESA */}

                    {empresaSelecionada === "TODAS" && (
                        <Box sx={{ mb: 4 }}>
                            <Typography
                                variant="subtitle1"
                                fontWeight={800}
                                sx={{ mb: 1.5 }}
                            >
                                Estoque por empresa
                            </Typography>

                            <Box
                                sx={{
                                    display: "grid",
                                    gridTemplateColumns: {
                                        xs: "1fr",
                                        md: "repeat(3, 1fr)"
                                    },
                                    gap: 2
                                }}
                            >
                                {indicadoresEmpresas.map(empresa => (
                                    <Card
                                        key={empresa.codigo}
                                        variant="outlined"
                                        sx={{ borderRadius: 2, bgcolor: 'background.default' }}
                                    >
                                        <CardContent>
                                            <Stack
                                                direction="row"
                                                alignItems="center"
                                                spacing={1}
                                                sx={{ mb: 1.5 }}
                                            >
                                                <StorefrontIcon color="primary" />

                                                <Box>
                                                    <Typography fontWeight={800}>
                                                        {empresa.nome}
                                                    </Typography>

                                                    <Typography
                                                        variant="caption"
                                                        color="text.secondary"
                                                    >
                                                        Empresa {empresa.codigo}
                                                    </Typography>
                                                </Box>
                                            </Stack>

                                            <Typography
                                                variant="h5"
                                                fontWeight={800}
                                            >
                                                {empresa.total.toLocaleString("pt-BR")}
                                            </Typography>

                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                            >
                                                produtos encontrados
                                            </Typography>

                                            <Divider sx={{ my: 1.5 }} />

                                            <Stack
                                                direction="row"
                                                justifyContent="space-between"
                                                flexWrap="wrap"
                                                gap={1}
                                            >
                                                <Chip
                                                    size="small"
                                                    color="success"
                                                    label={`+ ${empresa.positivos}`}
                                                    sx={{ color: 'text.primary' }}
                                                />

                                                <Chip
                                                    size="small"
                                                    color="error"
                                                    label={`- ${empresa.negativos}`}
                                                    sx={{ color: 'text.primary' }}
                                                />

                                                <Chip
                                                    size="small"
                                                    color="warning"
                                                    label={`0 ${empresa.zerados}`}
                                                    sx={{ color: 'text.primary' }}
                                                />
                                            </Stack>
                                        </CardContent>
                                    </Card>
                                ))}
                            </Box>
                        </Box>
                    )}

                    {/* ESTOQUE NEGATIVO */}

                    <Paper
                        variant="outlined"
                        sx={{
                            mb: 3,
                            borderRadius: 2,
                            overflow: "hidden",
                            bgcolor: 'background.default'
                        }}
                    >
                        <Box
                            sx={{
                                p: 2,
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                gap: 1,
                                flexWrap: "wrap"
                            }}
                        >
                            <Stack direction="row" spacing={1} alignItems="center">
                                <WarningAmberIcon color="error" />

                                <Box>
                                    <Typography fontWeight={800}>
                                        Produtos com estoque negativo
                                    </Typography>

                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                    >
                                        Produtos que apresentam saldo abaixo de zero
                                    </Typography>
                                </Box>
                            </Stack>

                            <Chip
                                color="error"
                                label={`${estoqueFiltrado.filter(item => item._saldo < 0).length} produtos`}
                                sx={{ color: 'text.primary' }}
                            />
                        </Box>

                        <Divider />

                        <Box sx={{ p: 2 }}>
                            <TextField
                                fullWidth
                                size="small"
                                placeholder="Buscar por código ou código de barras..."
                                value={buscaEstoque}
                                onChange={event =>
                                    setBuscaEstoque(event.target.value)
                                }
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon />
                                        </InputAdornment>
                                    )
                                }}
                                autoComplete="off"
                                inputProps={{
                                    spellCheck: false,
                                    autoCorrect: "off",
                                    autoCapitalize: "off",
                                }}
                            />
                        </Box>

                        <TableContainer sx={{ maxHeight: 400 }}>
                            <Table stickyHeader size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Código</TableCell>
                                        <TableCell>EAN</TableCell>
                                        <TableCell>Empresa</TableCell>
                                        <TableCell align="right">
                                            Estoque
                                        </TableCell>
                                    </TableRow>
                                </TableHead>

                                <TableBody>
                                    {estoqueFiltrado
                                        .filter(item => item._saldo < 0)
                                        .map(item => (
                                            <TableRow
                                                key={item._id}
                                                hover
                                            >
                                                <TableCell>
                                                    <Typography fontWeight={700}>
                                                        {item._codigo || "-"}
                                                    </Typography>
                                                </TableCell>

                                                <TableCell>
                                                    {item._ean || "-"}
                                                </TableCell>

                                                <TableCell>
                                                    <Typography variant="body2">
                                                        {EMPRESAS[item._empresa] || item._empresa || "-"}
                                                    </Typography>

                                                    <Typography
                                                        variant="caption"
                                                        color="text.secondary"
                                                    >
                                                        {item._empresa}
                                                    </Typography>
                                                </TableCell>

                                                <TableCell align="right">
                                                    <Chip
                                                        size="small"
                                                        color="error"
                                                        label={item._saldo}
                                                        sx={{ color: 'text.primary' }}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))}

                                    {estoqueFiltrado.filter(
                                        item => item._saldo < 0
                                    ).length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={4}>
                                                    <Typography
                                                        textAlign="center"
                                                        color="text.secondary"
                                                        sx={{ py: 3 }}
                                                    >
                                                        Nenhum produto com estoque negativo encontrado.
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>

                    {/* ESTOQUE POSITIVO */}

                    <Paper
                        variant="outlined"
                        sx={{
                            mb: 3,
                            borderRadius: 2,
                            overflow: "hidden",
                            bgcolor: 'background.default'
                        }}
                    >
                        <Box
                            sx={{
                                p: 2,
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                gap: 1,
                                flexWrap: "wrap"
                            }}
                        >
                            <Stack direction="row" spacing={1} alignItems="center">
                                <TrendingUpIcon color="success" />

                                <Box>
                                    <Typography fontWeight={800}>
                                        Produtos com estoque positivo
                                    </Typography>

                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                    >
                                        Produtos com saldo disponível
                                    </Typography>
                                </Box>
                            </Stack>

                            <Chip
                                color="success"
                                label={`${estoqueFiltrado.filter(item => item._saldo > 0).length} produtos`}
                                sx={{ color: 'text.primary' }}
                            />
                        </Box>

                        <Divider />

                        <Box sx={{ p: 2 }}>
                            <TextField
                                fullWidth
                                size="small"
                                placeholder="Buscar por código ou código de barras..."
                                value={buscaEstoque}
                                onChange={event =>
                                    setBuscaEstoque(event.target.value)
                                }
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon />
                                        </InputAdornment>
                                    )
                                }}
                                autoComplete="off"
                                inputProps={{
                                    spellCheck: false,
                                    autoCorrect: "off",
                                    autoCapitalize: "off",
                                }}
                            />
                        </Box>

                        <TableContainer sx={{ maxHeight: 400 }}>
                            <Table stickyHeader size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Código</TableCell>
                                        <TableCell>EAN</TableCell>
                                        <TableCell>Empresa</TableCell>
                                        <TableCell align="right">
                                            Estoque
                                        </TableCell>
                                    </TableRow>
                                </TableHead>

                                <TableBody>
                                    {estoqueFiltrado
                                        .filter(item => item._saldo > 0)
                                        .map(item => (
                                            <TableRow
                                                key={item._id}
                                                hover
                                            >
                                                <TableCell>
                                                    <Typography fontWeight={700}>
                                                        {item._codigo || "-"}
                                                    </Typography>
                                                </TableCell>

                                                <TableCell>
                                                    {item._ean || "-"}
                                                </TableCell>

                                                <TableCell>
                                                    <Typography variant="body2">
                                                        {EMPRESAS[item._empresa] || item._empresa || "-"}
                                                    </Typography>

                                                    <Typography
                                                        variant="caption"
                                                        color="text.secondary"
                                                    >
                                                        {item._empresa}
                                                    </Typography>
                                                </TableCell>

                                                <TableCell align="right">
                                                    <Chip
                                                        size="small"
                                                        color="success"
                                                        label={item._saldo}
                                                        sx={{ color: 'text.primary' }}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))}

                                    {estoqueFiltrado.filter(
                                        item => item._saldo > 0
                                    ).length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={4}>
                                                    <Typography
                                                        textAlign="center"
                                                        color="text.secondary"
                                                        sx={{ py: 3 }}
                                                    >
                                                        Nenhum produto com estoque positivo encontrado.
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>

                    {/* VENDAS CANCELADAS */}

                    <Paper
                        variant="outlined"
                        sx={{
                            mb: 3,
                            borderRadius: 2,
                            overflow: "hidden",
                            bgcolor: 'background.default'
                        }}
                    >
                        <Box
                            sx={{
                                p: 2,
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                gap: 1,
                                flexWrap: "wrap"
                            }}
                        >
                            <Stack direction="row" spacing={1} alignItems="center">
                                <CancelOutlinedIcon color="error" />

                                <Box>
                                    <Typography fontWeight={800}>
                                        Vendas canceladas
                                    </Typography>

                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                    >
                                        Vendas canceladas nas empresas selecionadas
                                    </Typography>
                                </Box>
                            </Stack>

                            <Chip
                                color="error"
                                label={`${vendasFiltradas.length} vendas`}
                                sx={{ color: 'text.primary' }}
                            />
                        </Box>

                        <Divider />

                        <Box sx={{ p: 2 }}>
                            <TextField
                                fullWidth
                                size="small"
                                placeholder="Buscar venda, pedido ou cliente..."
                                value={buscaVendas}
                                onChange={event =>
                                    setBuscaVendas(event.target.value)
                                }
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon />
                                        </InputAdornment>
                                    )
                                }}
                                autoComplete="off"
                                inputProps={{
                                    spellCheck: false,
                                    autoCorrect: "off",
                                    autoCapitalize: "off",
                                }}
                            />
                        </Box>

                        <TableContainer sx={{ maxHeight: 400 }}>
                            <Table stickyHeader size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Venda / Pedido</TableCell>
                                        <TableCell>Cliente</TableCell>
                                        <TableCell>Data</TableCell>
                                        <TableCell>Empresa</TableCell>
                                        <TableCell align="right">
                                            Valor
                                        </TableCell>
                                    </TableRow>
                                </TableHead>

                                <TableBody>
                                    {vendasFiltradas.map(venda => (
                                        <TableRow
                                            key={venda._id}
                                            hover
                                        >
                                            <TableCell>
                                                <Typography fontWeight={700}>
                                                    {venda._id}
                                                </Typography>
                                            </TableCell>

                                            <TableCell>
                                                {venda._cliente}
                                            </TableCell>

                                            <TableCell>
                                                {formatarData(venda._data)}
                                            </TableCell>

                                            <TableCell>
                                                {EMPRESAS[venda._empresa] || venda._empresa || "-"}
                                            </TableCell>

                                            <TableCell align="right">
                                                {formatarMoeda(venda._valor)}
                                            </TableCell>
                                        </TableRow>
                                    ))}

                                    {vendasFiltradas.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={5}>
                                                <Typography
                                                    textAlign="center"
                                                    color="text.secondary"
                                                    sx={{ py: 3 }}
                                                >
                                                    Nenhuma venda cancelada encontrada.
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>

                    {/* RODAPÉ */}
                    <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: "block", textAlign: "right", mt: 2 }}
                    >
                        Produtos zerados: {indicadores.zerados.toLocaleString("pt-BR")}
                    </Typography>
                </>
            )}

            {/* SNACKBAR */}

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4500}
                onClose={() =>
                    setSnackbar(prev => ({ ...prev, open: false }))
                }
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "left"
                }}
            >
                <Alert
                    onClose={() =>
                        setSnackbar(prev => ({ ...prev, open: false }))
                    }
                    severity={snackbar.tipo}
                    variant="filled"
                    sx={{ width: "100%", color: 'text.primary' }}
                >
                    {snackbar.mensagem}
                </Alert>
            </Snackbar>
        </Container>
    );
}

export default AlertaEstoque;
