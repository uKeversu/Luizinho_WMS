import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import {
    Container,
    Typography,
    Card,
    CardContent,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
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
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import StorefrontIcon from "@mui/icons-material/Storefront";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import ScienceOutlinedIcon from "@mui/icons-material/ScienceOutlined";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";

import MenuUsuario from "../../components/MenuUsuario";
import LoginFuncionario from "../../components/LoginFuncionario";
import NotificacoesMenu from "../../components/Notificacoes";

import "../../style/App.css";

// Empresas do Ecommerce (nomes de exibição)
// Ajuste o nome da 0004 conforme o cadastro real.
const EMPRESAS = {
    "0003": "Cani Auto Peças",
    "0004": "Empresa 0004",
    "0005": "Cani Parts"
};

const nomeEmpresa = (codigo) => EMPRESAS[codigo] || `Empresa ${codigo}`;

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

    const API = "http://192.168.1.184:7079";

    const ROTAS = {
        estoque: "/api/estoque_empresas"
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
    const [abrirAvisoTestes, setAbrirAvisoTestes] = useState(true);

    const [vendas, setVendas] = useState([]);
    const [estoque, setEstoque] = useState([]);
    const [resumoEmpresas, setResumoEmpresas] = useState([]);
    const [empresasApi, setEmpresasApi] = useState([]);
    const [baseCalculo, setBaseCalculo] = useState("qtatua");

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
            let houveErroNasCanceladas = false;
            let houveErroNoEstoque = false;

            if (resultadoVendas.status === "fulfilled") {
                const registrosVendas = extrairRegistros(
                    resultadoVendas.value,
                    ["vendas", "dados", "notas", "resultados"]
                );

                setVendas(registrosVendas);
            } else {
                houveErro = true;
                houveErroNasCanceladas = true;
                console.error(
                    "[Ecommerce] Erro ao consultar vendas:",
                    resultadoVendas.reason
                );
            }

            if (resultadoEstoque.status === "fulfilled") {
                const dadosEstoque = resultadoEstoque.value;

                // Novo formato: { itens, resumo_por_empresa, empresas, base_calculo }
                setEstoque(
                    extrairRegistros(
                        dadosEstoque,
                        ["itens", "estoque", "produtos", "dados", "resultados"]
                    )
                );

                setResumoEmpresas(
                    Array.isArray(dadosEstoque?.resumo_por_empresa)
                        ? dadosEstoque.resumo_por_empresa
                        : []
                );

                setEmpresasApi(
                    Array.isArray(dadosEstoque?.empresas)
                        ? dadosEstoque.empresas
                        : []
                );

                setBaseCalculo(dadosEstoque?.base_calculo || "qtatua");
            } else {
                houveErro = true;
                houveErroNoEstoque = true;
                console.error(
                    "[Ecommerce] Erro ao consultar estoque:",
                    resultadoEstoque.reason
                );
            }

            if (houveErro && houveErroNasCanceladas && houveErroNoEstoque) {
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

    // LISTA DE EMPRESAS (vem da API; fallback para o mapa local)
    const listaEmpresas = useMemo(() => {
        if (empresasApi.length > 0) {
            return empresasApi.map(codigo => String(codigo).padStart(4, "0"));
        }

        return Object.keys(EMPRESAS);
    }, [empresasApi]);

    // NORMALIZAÇÃO DO ESTOQUE
    const estoqueNormalizado = useMemo(() => {
        return estoque.map((item, index) => {
            const saldo = converterNumero(
                obterCampo(item, [baseCalculo, "qtatua", "estoque"], 0)
            );

            const empresa = String(
                obterCampo(item, ["empfil", "empfill", "empresa"], "")
            ).padStart(4, "0");

            const codigo = obterCampo(item, ["codigo", "cod_produto", "produto"]);

            return {
                ...item,
                _id: `${empresa}-${codigo || "sem-codigo"}-${index}`,
                _saldo: saldo,
                _disponivel: converterNumero(
                    obterCampo(item, ["saldo_disponivel"], saldo)
                ),
                _os: converterNumero(item.osatua),
                _empresa: empresa,
                _codigo: codigo,
                _ean: obterCampo(item, ["codire", "cean", "ean", "codigo_barras"]),
                _referencia: obterCampo(item, ["basico", "referencia"]),
                _descricao: obterCampo(item, ["descricao", "descricao_produto"]),
                _marca: obterCampo(item, ["marca"])
            };
        });
    }, [estoque, baseCalculo]);

    // NORMALIZAÇÃO DAS VENDAS
    const vendasNormalizadas = useMemo(() => {
        return vendas.map((item, index) => {
            const empresa = obterCampo(
                item,
                ["empfill", "empfil", "empresa", "codigo_empresa"],
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

    // FILTRO DE ESTOQUE (empresa + busca)
    const estoqueFiltrado = useMemo(() => {
        const termo = buscaEstoque.toLowerCase().trim();

        return estoqueNormalizado.filter(item => {
            const empresaCorresponde =
                empresaSelecionada === "TODAS" ||
                item._empresa === empresaSelecionada;

            if (!empresaCorresponde) return false;
            if (!termo) return true;

            const texto = [
                item._codigo,
                item._ean,
                item._referencia,
                item._descricao,
                item._marca
            ].join(" ").toLowerCase();

            return texto.includes(termo);
        });
    }, [estoqueNormalizado, empresaSelecionada, buscaEstoque]);

    const estoqueNegativo = useMemo(
        () => estoqueFiltrado.filter(item => item._saldo < 0),
        [estoqueFiltrado]
    );

    const estoquePositivo = useMemo(
        () => estoqueFiltrado.filter(item => item._saldo > 0),
        [estoqueFiltrado]
    );

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

    // INDICADORES POR EMPRESA
    // Usa o resumo_por_empresa da API; se não vier, calcula pelos itens.
    const indicadoresEmpresas = useMemo(() => {
        return listaEmpresas.map(codigo => {
            const produtos = estoqueNormalizado.filter(
                item => item._empresa === codigo
            );

            const zerados = produtos.filter(item => item._saldo === 0).length;

            const resumo = resumoEmpresas.find(
                r => String(r.empfil).padStart(4, "0") === codigo
            );

            if (resumo) {
                const positivos = converterNumero(resumo.qtd_itens_positivos);
                const negativos = converterNumero(resumo.qtd_itens_negativos);

                return {
                    codigo,
                    nome: nomeEmpresa(codigo),
                    total: positivos + negativos + zerados,
                    positivos,
                    negativos,
                    zerados,
                    somaPositivo: converterNumero(resumo.soma_estoque_positivo),
                    somaNegativo: Math.abs(
                        converterNumero(resumo.soma_estoque_negativo)
                    )
                };
            }

            const lista = (fn) => produtos.filter(fn);

            return {
                codigo,
                nome: nomeEmpresa(codigo),
                total: produtos.length,
                positivos: lista(i => i._saldo > 0).length,
                negativos: lista(i => i._saldo < 0).length,
                zerados,
                somaPositivo: lista(i => i._saldo > 0)
                    .reduce((t, i) => t + i._saldo, 0),
                somaNegativo: lista(i => i._saldo < 0)
                    .reduce((t, i) => t + Math.abs(i._saldo), 0)
            };
        });
    }, [estoqueNormalizado, resumoEmpresas, listaEmpresas]);

    // INDICADORES GERAIS (respeitam o filtro de empresa)
    const indicadores = useMemo(() => {
        const empresas = indicadoresEmpresas.filter(
            e => empresaSelecionada === "TODAS" || e.codigo === empresaSelecionada
        );

        return empresas.reduce(
            (acc, e) => ({
                totalProdutos: acc.totalProdutos + e.total,
                positivos: acc.positivos + e.positivos,
                negativos: acc.negativos + e.negativos,
                zerados: acc.zerados + e.zerados,
                totalPositivo: acc.totalPositivo + e.somaPositivo,
                totalNegativo: acc.totalNegativo + e.somaNegativo
            }),
            {
                totalProdutos: 0,
                positivos: 0,
                negativos: 0,
                zerados: 0,
                totalPositivo: 0,
                totalNegativo: 0
            }
        );
    }, [indicadoresEmpresas, empresaSelecionada]);

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

    // Cor do chip de saldo disponível
    const corDisponivel = (valor) => {
        if (valor < 0) return "warning";
        if (valor === 0) return "primary";
        return "success";
    };

    // TABELA DE ESTOQUE (usada para negativo e positivo)
    const renderTabelaEstoque = ({
        titulo,
        subtitulo,
        icone,
        cor,
        lista,
        textoVazio
    }) => (
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
                    {icone}

                    <Box>
                        <Typography fontWeight={800}>
                            {titulo}
                        </Typography>

                        <Typography
                            variant="caption"
                            color="text.secondary"
                        >
                            {subtitulo}
                        </Typography>
                    </Box>
                </Stack>

                <Chip
                    color={cor}
                    label={`${lista.length} produtos`}
                    sx={{ color: 'primary.branco' }}
                />
            </Box>

            <Divider />

            <Box sx={{ p: 2 }}>
                <TextField
                    fullWidth
                    size="small"
                    placeholder="Buscar por código, descrição, marca, referência ou código de barras..."
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
                            <TableCell>Descrição</TableCell>
                            <TableCell>EAN</TableCell>
                            <TableCell>Empresa</TableCell>
                            <TableCell align="right">Estoque</TableCell>
                            <TableCell align="right">Disponível</TableCell>
                            <TableCell align="right">Full</TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {lista.map(item => (
                            <TableRow key={item._id} hover>
                                <TableCell>
                                    <Typography fontWeight={700}>
                                        {item._codigo || "-"}
                                    </Typography>
                                </TableCell>

                                <TableCell sx={{ minWidth: 240, maxWidth: 380 }}>
                                    <Typography variant="body2">
                                        {item._descricao || "-"}
                                    </Typography>

                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                    >
                                        {[item._marca, item._referencia]
                                            .filter(Boolean)
                                            .join(" • ")}
                                    </Typography>
                                </TableCell>

                                <TableCell>
                                    {item._ean || "-"}
                                </TableCell>

                                <TableCell>
                                    <Typography variant="body2">
                                        {nomeEmpresa(item._empresa)}
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
                                        color={cor}
                                        label={item._saldo}
                                        sx={{ color: 'primary.branco' }}
                                    />
                                </TableCell>

                                <TableCell align="right">
                                    <Chip
                                        size="small"
                                        variant="outlined"
                                        color={corDisponivel(item._disponivel)}
                                        label={item._disponivel}
                                    />
                                </TableCell>
                                <TableCell align="right">
                                    <Chip
                                        size="small"
                                        variant="outlined"
                                        color={corDisponivel(item._disponivel)}
                                        label="Adicionar"
                                    />
                                </TableCell>
                            </TableRow>
                        ))}

                        {lista.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={7}>
                                    <Typography
                                        textAlign="center"
                                        color="text.secondary"
                                        sx={{ py: 3 }}
                                    >
                                        {textoVazio}
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    );

    if (!token) {
        return (
            <LoginFuncionario
                onLogin={(data) => {

                    localStorage.setItem(
                        "nfe_token",
                        data.token
                    );

                    const user = {
                        id: data.id,
                        nome: data.nome,
                        codigo: data.codigo,
                        tipo: data.tipo,
                        pode_autorizar_conferencia: data.pode_autorizar_conferencia,
                        pode_corrigir_nfe: data.pode_corrigir_nfe,
                        pode_finalizar_nfe: data.pode_finalizar_nfe,
                        pode_acessar_alertas: data.pode_acessar_alertas,
                        pode_acessar_cadastrar_funcionario: data.pode_acessar_cadastrar_funcionario,
                        pode_acessar_painel_games: data.pode_acessar_painel_games,
                        pode_acessar_painel_gerencial: data.pode_acessar_painel_gerencial,
                        pode_acessar_reimprimir_senhas: data.pode_acessar_reimprimir_senhas,
                        pode_acessar_tarefas: data.pode_acessar_tarefas,
                    };

                    localStorage.setItem(
                        "user_info",
                        JSON.stringify(user)
                    );

                    setUserInfo(user);
                    setToken(data.token);
                }}
            />
        );
    }

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
                        <NotificacoesMenu
                            apiBase={API}
                            token={token}
                            userInfo={userInfo}
                        />

                        <MenuUsuario
                            userInfo={userInfo}
                            onLogout={logout}
                        />
                        <Tooltip title="Voltar ao SIGEL">

                            <IconButton
                                onClick={() => navigate("/")}
                                sx={{
                                    color: "white",
                                    bgcolor:
                                        "rgba(255,255,255,0.08)",
                                    "&:hover": {
                                        bgcolor:
                                            "rgba(255,255,255,0.16)",
                                    },
                                }}
                            >
                                <ArrowBackIcon />
                            </IconButton>
                        </Tooltip>
                    </Stack>
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

                            {listaEmpresas.map(codigo => (
                                <MenuItem key={codigo} value={codigo}>
                                    {codigo} - {nomeEmpresa(codigo)}
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
                                titulo="Produtos com saldo"
                                valor={indicadores.totalProdutos.toLocaleString("pt-BR")}
                                descricao="Diferentes de zero"
                                icone={<Inventory2OutlinedIcon fontSize="large" />}
                                cor="#1976d2"
                                fundo="rgba(25, 118, 210, 0.10)"
                            />

                            <CardIndicador
                                titulo="Estoque positivo"
                                valor={indicadores.positivos.toLocaleString("pt-BR")}
                                descricao={`${indicadores.totalPositivo.toLocaleString("pt-BR")} unidades em estoque`}
                                icone={<TrendingUpIcon fontSize="large" />}
                                cor="#2e7d32"
                                fundo="rgba(46, 125, 50, 0.10)"
                            />

                            <CardIndicador
                                titulo="Estoque negativo"
                                valor={indicadores.negativos.toLocaleString("pt-BR")}
                                descricao={`${indicadores.totalNegativo.toLocaleString("pt-BR")} unidades negativadas`}
                                icone={<TrendingDownIcon fontSize="large" />}
                                cor="#ed6c02"
                                fundo="rgba(237, 108, 2, 0.10)"
                            />

                            <CardIndicador
                                titulo="Vendas canceladas"
                                valor={indicadores.zerados.toLocaleString("pt-BR")}
                                descricao="Produtos com pendência"
                                icone={<CancelOutlinedIcon fontSize="large" />}
                                cor="#d32f2f"
                                fundo="rgba(211, 47, 47, 0.10)"
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
                                        md: "repeat(auto-fit, minmax(260px, 1fr))"
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
                                                <Tooltip title={`${empresa.somaPositivo.toLocaleString("pt-BR")} unidades`}>
                                                    <Chip
                                                        size="small"
                                                        color="success"
                                                        label={`+ ${empresa.positivos}`}
                                                        sx={{ color: 'primary.branco' }}
                                                    />
                                                </Tooltip>

                                                <Tooltip title={`${empresa.somaNegativo.toLocaleString("pt-BR")} unidades`}>
                                                    <Chip
                                                        size="small"
                                                        color="error"
                                                        label={`- ${empresa.negativos}`}
                                                        sx={{ color: 'primary.branco' }}
                                                    />
                                                </Tooltip>
                                            </Stack>
                                        </CardContent>
                                    </Card>
                                ))}
                            </Box>
                        </Box>
                    )}

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
                                        Vendas canceladas nas plataformas de ecommerce
                                    </Typography>
                                </Box>
                            </Stack>

                            <Chip
                                color="error"
                                label={`${vendasFiltradas.length} vendas`}
                                sx={{ color: 'primary.branco' }}
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

                    {/* ESTOQUE NEGATIVO */}
                    {renderTabelaEstoque({
                        titulo: "Produtos com estoque negativo",
                        subtitulo: "Produtos que apresentam saldo abaixo de zero",
                        icone: <WarningAmberIcon color="warning" />,
                        cor: "warning",
                        lista: estoqueNegativo,
                        textoVazio: "Nenhum produto com estoque negativo encontrado."
                    })}

                    {/* ESTOQUE POSITIVO */}
                    {renderTabelaEstoque({
                        titulo: "Produtos com estoque positivo",
                        subtitulo: "Produtos que apresentam saldo acima de zero",
                        icone: <TrendingUpIcon color="success" />,
                        cor: "success",
                        lista: estoquePositivo,
                        textoVazio: "Nenhum produto com estoque positivo encontrado."
                    })}
                </>
            )}

            <Dialog
                open={abrirAvisoTestes}
                onClose={() => setAbrirAvisoTestes(false)}
                fullWidth
                maxWidth="sm"
                slotProps={{
                    paper: {
                        sx: {
                            bgcolor: "background.default",
                            color: "text.primary",
                            borderRadius: 3,
                            border: "1px solid",
                            borderColor: "divider",
                        },
                    },
                }}
            >
                <DialogTitle
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        fontWeight: 700,
                        pb: 1,
                    }}
                >
                    <ScienceOutlinedIcon
                        sx={{
                            color: "#F59E0B",
                            fontSize: 30,
                        }}
                    />

                    <Typography
                        component="span"
                        variant="h6"
                        fontWeight={700}
                    >
                        SIGEL Ecommerce • Em desenvolvimento
                    </Typography>
                </DialogTitle>

                <DialogContent>
                    <Typography
                        variant="body1"
                        fontWeight={600}
                        sx={{ mb: 2 }}
                    >
                        O módulo Ecommerce está em fase de testes e
                        aprimoramento.
                    </Typography>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                            lineHeight: 1.8,
                            mb: 2,
                        }}
                    >
                        Durante esse período, podem ocorrer ajustes,
                        mudanças e melhorias nas funcionalidades. Sua
                        participação é muito importante para que possamos
                        tornar a ferramenta cada vez mais útil para a equipe.
                    </Typography>

                    <Typography
                        variant="body1"
                        fontWeight={600}
                        sx={{ mb: 1 }}
                    >
                        Encontrou algum problema ou tem uma sugestão de
                        melhoria?
                    </Typography>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                            lineHeight: 1.8,
                            mb: 2,
                        }}
                    >
                        Envie seu feedback ao Setor de Desenvolvimento pelo
                        WhatsApp
                    </Typography>

                    <Divider sx={{ mb: 2 }} />

                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                            textAlign: "center",
                            fontStyle: "italic",
                        }}
                    >
                        Agradecemos pela colaboração! 🚀
                    </Typography>
                </DialogContent>

                <DialogActions
                    sx={{
                        px: 3,
                        pb: 3,
                        justifyContent: "space-between",
                        gap: 1,
                    }}
                >
                    <Button
                        variant="contained"
                        color="success"
                        startIcon={<WhatsAppIcon />}
                        onClick={() => {
                            window.open(
                                "https://wa.me/554791692664",
                                "_blank",
                                "noopener,noreferrer"
                            );
                        }}
                    >
                        Enviar sugestão
                    </Button>

                    <Button
                        variant="contained"
                        onClick={() => setAbrirAvisoTestes(false)}
                    >
                        Entendi, continuar
                    </Button>
                </DialogActions>
            </Dialog>

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
                    sx={{ width: "100%", color: 'primary.branco' }}
                >
                    {snackbar.mensagem}
                </Alert>
            </Snackbar>
        </Container>
    );
}

export default AlertaEstoque;