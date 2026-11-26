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
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

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
    const API_FULL = "http://192.168.1.185:8077";

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

    // FULL
    const [produtosFull, setProdutosFull] = useState([]);
    const [loadingFull, setLoadingFull] = useState(false);

    const [dialogFull, setDialogFull] = useState(false);
    const [produtoFullSelecionado, setProdutoFullSelecionado] = useState(null);

    const [quantidadeFull, setQuantidadeFull] = useState(1);
    const [salvandoFull, setSalvandoFull] = useState(false);

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

    // ============================================================
    // SIGEL ECOMMERCE FULL
    // ============================================================

    const buscarProdutosFull = useCallback(async () => {
        const tokenAtual = localStorage.getItem("nfe_token");

        if (!tokenAtual) return;

        setLoadingFull(true);

        try {
            const response = await fetch(`${API_FULL}/api/ecommerce/full`, {
                headers: {
                    "X-Auth-Token": tokenAtual
                }
            });

            if (!response.ok) {
                throw new Error(`Erro ${response.status} ao consultar Full`);
            }

            const dados = await response.json();

            setProdutosFull(
                Array.isArray(dados.produtos) ? dados.produtos : []
            );
        } catch (error) {
            console.error("[Ecommerce Full] Erro ao buscar:", error);

            mostrarMensagem(
                "Não foi possível carregar os produtos do Full.",
                "error"
            );
        } finally {
            setLoadingFull(false);
        }
    }, []);

    useEffect(() => {
        buscarProdutosFull();
    }, [buscarProdutosFull]);

    const abrirDialogFull = (produto = null) => {
        setProdutoFullSelecionado(produto);
        setQuantidadeFull(1);
        setDialogFull(true);
    };

    const fecharDialogFull = () => {
        if (salvandoFull) return;

        setDialogFull(false);
        setProdutoFullSelecionado(null);
        setQuantidadeFull(1);
    };

    const adicionarProdutoFull = async () => {
        const tokenAtual = localStorage.getItem("nfe_token");

        if (!produtoFullSelecionado) {
            mostrarMensagem("Selecione um produto.", "warning");
            return;
        }

        const quantidade = Number(quantidadeFull);

        if (!Number.isInteger(quantidade) || quantidade <= 0) {
            mostrarMensagem("Informe uma quantidade válida.", "warning");
            return;
        }

        if (quantidade > produtoFullSelecionado._saldoRestante) {
            mostrarMensagem(
                "A quantidade não pode ser maior que o estoque disponível.",
                "warning"
            );
            return;
        }

        setSalvandoFull(true);

        try {
            const response = await fetch(`${API_FULL}/api/ecommerce/full/produtos`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Auth-Token": tokenAtual
                },
                body: JSON.stringify({
                    empresa: produtoFullSelecionado._empresa,
                    codigo_produto: String(produtoFullSelecionado._codigo),
                    descricao: produtoFullSelecionado._descricao || "",
                    quantidade
                })
            });

            const dados = await response.json();

            if (!response.ok) {
                throw new Error(dados.erro || "Erro ao adicionar produto ao Full.");
            }

            mostrarMensagem(
                `${produtoFullSelecionado._codigo} adicionado ao Full!`,
                "success"
            );

            fecharDialogFull();
            await buscarProdutosFull();
        } catch (error) {
            console.error("[Ecommerce Full] Erro ao adicionar:", error);

            mostrarMensagem(
                error.message || "Não foi possível adicionar ao Full.",
                "error"
            );
        } finally {
            setSalvandoFull(false);
        }
    };

    const removerProdutoFull = async (produto) => {
        const tokenAtual = localStorage.getItem("nfe_token");

        try {
            const response = await fetch(
                `${API_FULL}/api/ecommerce/full/produtos/${encodeURIComponent(produto.codigo_produto)}?empresa=${encodeURIComponent(produto.empresa)}`,
                {
                    method: "DELETE",
                    headers: {
                        "X-Auth-Token": tokenAtual
                    }
                }
            );

            const dados = await response.json();

            if (!response.ok) {
                throw new Error(dados.erro || "Erro ao remover produto.");
            }

            mostrarMensagem(
                `${produto.codigo_produto} removido do Full.`,
                "success"
            );

            await buscarProdutosFull();
        } catch (error) {
            console.error("[Ecommerce Full] Erro ao remover:", error);

            mostrarMensagem(
                error.message || "Não foi possível remover o produto.",
                "error"
            );
        }
    };

    const alternarVendaMercadoLivre = async (produto) => {
        const tokenAtual = localStorage.getItem("nfe_token");
        const novoValor = !Boolean(Number(produto.venda_mercado_livre));

        try {
            const response = await fetch(
                `${API_FULL}/api/ecommerce/full/produtos/${encodeURIComponent(produto.codigo_produto)}/venda-mercado-livre`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        "X-Auth-Token": tokenAtual
                    },
                    body: JSON.stringify({
                        venda_mercado_livre: novoValor
                    })
                }
            );

            const dados = await response.json();

            if (!response.ok) {
                throw new Error(
                    dados.erro || "Não foi possível atualizar a identificação."
                );
            }

            await buscarProdutosFull();

            mostrarMensagem(
                novoValor
                    ? "Produto identificado como venda Mercado Livre."
                    : "Identificação de venda Mercado Livre removida.",
                "success"
            );
        } catch (error) {
            console.error("[Ecommerce Full] Erro ao atualizar venda:", error);

            mostrarMensagem(
                error.message || "Erro ao atualizar identificação.",
                "error"
            );
        }
    };

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

    const chaveFull = (empresa, codigo) =>
        `${String(empresa ?? "").padStart(4, "0")}-${String(codigo ?? "").trim()}`;

    const reservasFullPorEmpresaCodigo = useMemo(() => {
        const mapa = {};

        produtosFull.forEach(produto => {
            const chave = chaveFull(
                produto.empresa,
                produto.codigo_produto
            );

            mapa[chave] = (mapa[chave] || 0) +
                Number(produto.quantidade_full || 0);
        });

        return mapa;
    }, [produtosFull]);

    const estoqueNegativo = useMemo(
        () => estoqueFiltrado.filter(item => item._saldo < 0),
        [estoqueFiltrado]
    );

    const estoquePositivo = useMemo(() => {
        return estoqueFiltrado
            .map(item => {
                const chave = chaveFull(item._empresa, item._codigo);
                const quantidadeFull =
                    reservasFullPorEmpresaCodigo[chave] || 0;

                const saldoRestante = item._saldo - quantidadeFull;

                return {
                    ...item,
                    _saldoFull: quantidadeFull,
                    _saldoRestante: saldoRestante
                };
            })
            .filter(item => item._saldoRestante > 0);
    }, [estoqueFiltrado, reservasFullPorEmpresaCodigo]);

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

    const indicadoresFullEmpresas = useMemo(() => {
        return listaEmpresas.map(codigo => {
            const produtos = produtosFull.filter(
                produto => String(produto.empresa || "").padStart(4, "0") === codigo
            );

            return {
                codigo,
                nome: nomeEmpresa(codigo),
                quantidade: produtos.reduce(
                    (total, produto) =>
                        total + Number(produto.quantidade_full || 0),
                    0
                ),
                produtos: produtos.length
            };
        });
    }, [produtosFull, listaEmpresas]);

    const produtosFullFiltrados = useMemo(() => {
        return produtosFull.filter(produto => {
            if (empresaSelecionada === "TODAS") return true;

            return String(produto.empresa || "").padStart(4, "0") ===
                empresaSelecionada;
        });
    }, [produtosFull, empresaSelecionada]);

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
                            {titulo === "Produtos com estoque positivo" && (
                                <TableCell align="center">Full</TableCell>
                            )}
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
                                        label={
                                            titulo === "Produtos com estoque positivo"
                                                ? item._saldoRestante
                                                : item._saldo
                                        }
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

                                {titulo === "Produtos com estoque positivo" && (
                                    <TableCell align="center">
                                        <Tooltip title="Adicionar produto ao Mercado Livre Full">
                                            <IconButton
                                                size="small"
                                                color="primary"
                                                onClick={() => abrirDialogFull(item)}
                                            >
                                                <AddCircleOutlineIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                )}
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
                                {indicadoresEmpresas.map(empresa => {
                                    const indicadorFull = indicadoresFullEmpresas.find(
                                        full => full.codigo === empresa.codigo
                                    );

                                    return (
                                        <Card
                                            key={empresa.codigo}
                                            variant="outlined"
                                            sx={{ borderRadius: 2, bgcolor: "background.default" }}
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

                                                <Typography variant="h5" fontWeight={800}>
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
                                                    <Tooltip title={`${empresa.somaPositivo.toLocaleString("pt-BR")} unidades positivas`}>
                                                        <Chip
                                                            size="small"
                                                            color="success"
                                                            label={`+ ${empresa.positivos}`}
                                                            sx={{ color: "primary.branco" }}
                                                        />
                                                    </Tooltip>

                                                    <Tooltip title={`${indicadorFull?.produtos} produtos Full`}>
                                                        <Chip
                                                            size="small"
                                                            color="primary"
                                                            label={`${indicadorFull?.produtos || 0}`}
                                                            sx={{ color: "primary.branco" }}
                                                        />
                                                    </Tooltip>

                                                    <Tooltip title={`${empresa.somaNegativo.toLocaleString("pt-BR")} unidades negativas`}>
                                                        <Chip
                                                            size="small"
                                                            color="error"
                                                            label={`- ${empresa.negativos}`}
                                                            sx={{ color: "primary.branco" }}
                                                        />
                                                    </Tooltip>
                                                </Stack>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
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

                    {/* TABELA PRODUTOS FULL */}
                    <Paper
                        variant="outlined"
                        sx={{
                            mb: 3,
                            borderRadius: 2,
                            overflow: "hidden",
                            bgcolor: "background.default"
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
                                <Inventory2OutlinedIcon color="primary" />

                                <Box>
                                    <Typography fontWeight={800}>
                                        Mercado Livre Full
                                    </Typography>

                                    <Typography variant="caption" color="text.secondary">
                                        Produtos reservados para operação Full
                                    </Typography>
                                </Box>
                            </Stack>

                            <Stack direction="row" spacing={1} alignItems="center">
                                <Chip
                                    color="primary"
                                    label={`${produtosFullFiltrados.length} registros`}
                                />

                                <Tooltip title="Atualizar Full">
                                    <span>
                                        <IconButton
                                            color="primary"
                                            onClick={buscarProdutosFull}
                                            disabled={loadingFull}
                                        >
                                            {loadingFull
                                                ? <CircularProgress size={20} />
                                                : <RefreshIcon />
                                            }
                                        </IconButton>
                                    </span>
                                </Tooltip>
                            </Stack>
                        </Box>

                        <Divider />

                        <TableContainer sx={{ maxHeight: 400 }}>
                            <Table stickyHeader size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Empresa</TableCell>
                                        <TableCell>Código</TableCell>
                                        <TableCell>Descrição</TableCell>
                                        <TableCell align="center">Qtd. Full</TableCell>
                                        <TableCell align="center">Ações</TableCell>
                                    </TableRow>
                                </TableHead>

                                <TableBody>
                                    {produtosFullFiltrados.map(produto => (
                                        <TableRow
                                            key={produto.id || `${produto.empresa}-${produto.codigo_produto}`}
                                            hover
                                        >
                                            {/* Empresa */}
                                            <TableCell>
                                                <Typography fontWeight={700}>
                                                    {produto.empresa
                                                        ? nomeEmpresa(String(produto.empresa).padStart(4, "0"))
                                                        : "Legado sem empresa"}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {produto.empresa || "Não identificada"}
                                                </Typography>
                                            </TableCell>

                                            {/* Código */}
                                            <TableCell>
                                                <Typography fontWeight={700}>
                                                    {produto.codigo_produto}
                                                </Typography>
                                            </TableCell>

                                            {/* Descrição */}
                                            <TableCell sx={{ minWidth: 240 }}>
                                                {produto.descricao || "-"}
                                            </TableCell>

                                            {/* Quantidade Full */}
                                            <TableCell align="center">
                                                <Chip
                                                    size="small"
                                                    color="primary"
                                                    label={produto.quantidade_full}
                                                />
                                            </TableCell>

                                            {/* Ações */}
                                            <TableCell align="center">
                                                <Stack
                                                    direction="row"
                                                    justifyContent="center"
                                                    spacing={0.5}
                                                >
                                                    <Tooltip title="Remover do Full">
                                                        <IconButton
                                                            size="small"
                                                            color="error"
                                                            onClick={() => removerProdutoFull(produto)}
                                                        >
                                                            <DeleteOutlineIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Stack>
                                            </TableCell>
                                        </TableRow>
                                    ))}

                                    {produtosFullFiltrados.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={5}>
                                                <Typography
                                                    textAlign="center"
                                                    color="text.secondary"
                                                    sx={{ py: 3 }}
                                                >
                                                    {loadingFull
                                                        ? "Carregando produtos Full..."
                                                        : "Nenhum produto cadastrado no Full."}
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

            {/* DIALOG ADICIONAR AO FULL */}
            <Dialog
                open={dialogFull}
                onClose={fecharDialogFull}
                fullWidth
                maxWidth="sm"
                slotProps={{
                    paper: {
                        sx: {
                            bgcolor: "background.card",
                            color: "text.primary",
                            borderRadius: 3,
                            p: 2
                        }
                    }
                }}
            >
                <DialogTitle fontWeight={800}>
                    Adicionar produto ao Mercado Livre Full
                </DialogTitle>

                <DialogContent>
                    {produtoFullSelecionado && (
                        <Stack spacing={2} sx={{ mt: 1 }}>
                            <TextField
                                fullWidth
                                label="Código do produto"
                                value={produtoFullSelecionado._codigo || ""}
                                disabled
                            />

                            <TextField
                                fullWidth
                                label="Descrição"
                                value={produtoFullSelecionado._descricao || ""}
                                disabled
                            />

                            <TextField
                                fullWidth
                                label="Empresa"
                                value={`${produtoFullSelecionado._empresa} - ${nomeEmpresa(produtoFullSelecionado._empresa)}`}
                                disabled
                            />

                            <Typography variant="body2" color="text.secondary">
                                Estoque disponível: <strong>{produtoFullSelecionado._saldoRestante}</strong>
                            </Typography>

                            <TextField
                                fullWidth
                                type="number"
                                label="Quantidade para o Full"
                                value={quantidadeFull}
                                onChange={event => setQuantidadeFull(event.target.value)}
                                inputProps={{
                                    min: 1,
                                    max: produtoFullSelecionado._saldoRestante
                                }}
                                helperText={`Informe a quantidade que será reservada. Máximo disponível: ${produtoFullSelecionado._saldoRestante}`}
                            />

                        </Stack>
                    )}
                </DialogContent>

                <DialogActions sx={{ p: 2 }}>
                    <Button
                        onClick={fecharDialogFull}
                        disabled={salvandoFull}
                    >
                        Cancelar
                    </Button>

                    <Button
                        variant="contained"
                        onClick={adicionarProdutoFull}
                        disabled={salvandoFull || !produtoFullSelecionado}
                        startIcon={
                            salvandoFull
                                ? <CircularProgress size={18} color="inherit" />
                                : <AddCircleOutlineIcon />
                        }
                    >
                        {salvandoFull ? "Salvando..." : "Adicionar ao Full"}
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