import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";

import {
    Container,
    Typography,
    TextField,
    Paper,
    CircularProgress,
    Box,
    Chip,
    Grid,
    Card,
    CardContent,
    Dialog,
    DialogTitle,
    DialogContent,
    IconButton,
    Divider,
    Button,
    Tabs,
    Tab,
    LinearProgress,
    Avatar,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from "@mui/material";

import {
    Close as CloseIcon,
    EmojiEvents as EmojiEventsIcon,
    Inventory2 as Inventory2Icon,
    WarningAmber as WarningAmberIcon,
    CheckCircle as CheckCircleIcon,
    Bolt as BoltIcon,
    MilitaryTech as MilitaryTechIcon,
    Shield as ShieldIcon,
    TrendingUp as TrendingUpIcon,
    Psychology as PsychologyIcon,
    LocalFireDepartment as LocalFireDepartmentIcon,
    Stars as StarsIcon,
    WorkspacePremium as WorkspacePremiumIcon,
    Storefront as Storefront,
    Warehouse,
} from "@mui/icons-material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import ArticleIcon from '@mui/icons-material/Article';
import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Tooltip,
    CartesianGrid,
    XAxis,
    YAxis,
    AreaChart,
    Area,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
    BarChart,
    Bar,
    LineChart,
    Line,
} from "recharts";

import { motion } from "framer-motion";

import { ThemeContext } from "../context/ThemeContext";

import {
    MOLDURAS,
    EFEITOS,
    AVATARES,
    TITULOS,
} from "../cosmetics";

import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

// API
const API = "http://192.168.1.185:8077/";

export default function Produtividade() {

    const navigate = useNavigate();

    const { dark } = useContext(ThemeContext);

    // STATES
    const [loading, setLoading] = useState(true);
    const [dados, setDados] = useState([]);
    const [error, setError] = useState(null);
    const [tab, setTab] = useState(0);

    const [dataInicio, setDataInicio] = useState("");
    const [dataFim, setDataFim] = useState("");

    const [lastUpdate, setLastUpdate] = useState(null);

    const [openDetalhes, setOpenDetalhes] =
        useState(false);
    const [detalhesSelecionados,
        setDetalhesSelecionados] = useState([]);
    const [nomeSelecionado,
        setNomeSelecionado] = useState("");

    const [openRanks, setOpenRanks] = useState(false);
    const [imagemFullscreen, setImagemFullscreen] =
        useState(false);

    const [cosmeticos, setCosmeticos] = useState({});

    // Cores
    const textColor = dark
        ? "primary.branco"
        : "text.primary";

    const subTextColor = dark
        ? "primary.branco"
        : "text.secondary";

    const paperBg = dark
        ? "linear-gradient(135deg,#141414,#0a0a0a)"
        : "#fff";

    // Cards
    const glassStyle = {
        borderRadius: 5,
        background: paperBg,
        border: dark
            ? "1px solid rgba(255,255,255,0.08)"
            : "1px solid rgba(0,0,0,0.08)",
        boxShadow: dark
            ? "0 0 30px rgba(0,255,120,0.12)"
            : "0 10px 25px rgba(0,0,0,0.08)",
        backdropFilter: "blur(10px)",
        transition: "0.25s",
        "&:hover": {

            transform: "translateY(-4px)",
        },
        zoom: '0.9',
    };

    // Carrega do primeiro dia do mês até o dia atual
    useEffect(() => {
        const hoje = new Date();

        // Primeiro dia do mês
        const primeiroDia = new Date(
            hoje.getFullYear(),
            hoje.getMonth(),
            1
        );

        const fmt = (d) => d.toISOString().split("T")[0];

        const ini = fmt(primeiroDia);
        const fim = fmt(hoje);

        setDataInicio(ini);
        setDataFim(fim);

        carregarDados(ini, fim);
    }, []);

    // Auto refresh a cada 5min
    useEffect(() => {

        if (!dataInicio || !dataFim) return;

        const interval = setInterval(() => {

            carregarDados(
                dataInicio,
                dataFim
            );

        }, 5 * 60 * 1000);

        return () => clearInterval(interval);

    }, [dataInicio, dataFim]);

    // Gera patente do usuário
    const obterNivel = (xp, itens, pontosFinais, produtividade, errosCaixa) => {

        if (xp >= 1000000 && itens >= 25000 && pontosFinais >= 70000 && produtividade >= 100)
            return {
                nome: "TRANSCENDENTAL",
                cor: "#3256f5",
                imagem: "/ranks/icone-transcendental.png",
            };

        else if (xp >= 750000 && itens >= 15000 && pontosFinais >= 50000 && produtividade >= 98)
            return {
                nome: "LENDÁRIO",
                cor: "#a724ff",
                imagem: "/ranks/icone-lendario.png",
            };

        else if (xp >= 500000 && itens >= 10000 && pontosFinais >= 30000 && produtividade >= 95)
            return {
                nome: "MESTRE",
                cor: "#ff2929",
                imagem: "/ranks/icone-mestre.png",
            };

        else if (xp >= 300000 && itens >= 7000 && pontosFinais >= 20000 && produtividade >= 90)
            return {
                nome: "ESMERALDA",
                cor: "#06c730",
                imagem: "/ranks/icone-esmeralda.png",
            };

        else if (xp >= 150000 && itens >= 5000 && pontosFinais >= 10000 && produtividade >= 85)
            return {
                nome: "DIAMANTE",
                cor: "#00d5ff",
                imagem: "/ranks/icone-diamante.png",
            };

        else if (xp >= 100000 && itens >= 3000 && pontosFinais >= 7500 && produtividade >= 80)
            return {
                nome: "PLATINA",
                cor: "#b0e0e6",
                imagem: "/ranks/icone-platina.png",
            };

        else if (xp >= 70000 && itens >= 2000 && pontosFinais >= 5000 && produtividade >= 75)
            return {
                nome: "OURO",
                cor: "#FFD700",
                imagem: "/ranks/icone-ouro.png",
            };

        else if (xp >= 30000 && itens >= 1000 && pontosFinais >= 3000 && produtividade >= 70)
            return {
                nome: "PRATA",
                cor: "#9c9c9c",
                imagem: "/ranks/icone-prata.png",
            };

        return {
            nome: "BRONZE",
            cor: "#d17920",
            imagem: "/ranks/icone-bronze.png",
        };
    };


    // Itens conferidos pelo usuário
    const abrirDetalhes = (row) => {

        setDetalhesSelecionados(
            row.detalhes || []
        );

        setNomeSelecionado(row.nome);

        setOpenDetalhes(true);

    };

    // Carrega página com dados preenchidos
    const carregarDados = async (ini, fim) => {

        try {

            setLoading(true);

            const response = await fetch(
                `${API}/api/produtividade?data_inicio=${ini}&data_fim=${fim}`
            );

            const data = await response.json();

            const items = data.items || [];

            const resultado = items.map(item => ({

                ...item,

                nivel: obterNivel(
                    item.xp,
                    item.itens,
                    item.pontosFinais,
                    item.produtividade,
                    item.errosCaixa
                )

            }));

            setDados(resultado);

            setLastUpdate(
                new Date().toLocaleTimeString()
            );

            const perfis = await Promise.all(
                items.map(async (item) => {
                    try {
                        const res = await fetch(
                            `${API}/api/loja/perfil/${item.conferente}`
                        );

                        const perfil = await res.json();

                        return {
                            codigo: item.conferente,
                            avatar: perfil.equipados?.avatar?.icone || "👤",
                            titulo: perfil.equipados?.titulo?.nome || "Iniciante",
                            moldura: perfil.equipados?.moldura?.nome || "Sem moldura",
                            efeito: perfil.equipados?.efeito?.nome || "Sem efeito",
                        };
                    } catch {
                        return {
                            codigo: item.conferente,
                            avatar: "👤",
                            titulo: "Iniciante",
                            moldura: "Sem moldura",
                            efeito: "Sem efeito",
                        };
                    }
                })
            );

            const mapa = {};

            perfis.forEach((p) => {
                mapa[p.codigo] = {
                    avatar: p.avatar,
                    titulo: p.titulo,
                    moldura: p.moldura,
                    efeito: p.efeito,
                };
            });

            setCosmeticos(mapa);

        } catch (err) {

            console.error(err);

            setError("Erro ao carregar");

        } finally {

            setLoading(false);
        }
    };

    const exportarRelatorio = async () => {

        const response = await fetch(
            `${API}/api/produtividade?data_inicio=${dataInicio}&data_fim=${dataFim}`
        );

        const { items } = await response.json();
        const workbook = new ExcelJS.Workbook();

        workbook.creator = "SIGEL WMS";
        workbook.company = "Luizinho Auto Peças";
        workbook.subject = "Relatório de Produtividade";
        workbook.title = "Relatório de Produtividade";
        workbook.description =
            "Relatório gerado automaticamente pelo SIGEL WMS";
        workbook.created = new Date();
        workbook.modified = new Date();

        const TEMA = {

            primaria: "FF1565C0",
            secundaria: "FF1E88E5",

            sucesso: "FF2E7D32",
            alerta: "FFF9A825",
            erro: "FFC62828",

            fundo: "FFF5F7FA",
            branco: "FFFFFFFF",

            texto: "FF212121",
            textoClaro: "FF666666",

            zebra: "FFF8FAFC",

            borda: "FFD6DCE5",

            ouro: "FFFFD700",
            prata: "FFC0C0C0",
            bronze: "FFCD7F32"
        };

        const aplicarBorda = (cell) => {

            cell.border = {
                top: {
                    style: "thin",
                    color: {
                        argb: TEMA.borda
                    }
                },
                bottom: {
                    style: "thin",
                    color: {
                        argb: TEMA.borda
                    }
                },
                left: {
                    style: "thin",
                    color: {
                        argb: TEMA.borda
                    }
                },
                right: {
                    style: "thin",
                    color: {
                        argb: TEMA.borda
                    }
                }
            };
        };

        const preencherCelula = (
            cell,
            cor
        ) => {
            cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: {
                    argb: cor
                }
            };
        };
        const centralizar = (cell) => {
            cell.alignment = {
                horizontal: "center",
                vertical: "middle"
            };
        };
        const estilizarTitulo = (cell) => {
            cell.font = {
                bold: true,
                size: 22,
                color: {
                    argb: TEMA.branco
                }
            };
            preencherCelula(
                cell,
                TEMA.primaria
            );
            centralizar(cell);
        };
        const estilizarSubtitulo = (cell) => {
            cell.font = {
                italic: true,
                size: 11,
                color: {
                    argb: TEMA.textoClaro
                }
            };
            centralizar(cell);
        };
        const formatarNumero = (cell) => {
            cell.numFmt = "#,##0";
        };
        const formatarPercentual = (cell) => {
            cell.numFmt = "0.00%";
        };

        const configurarSheet = (
            sheet,
            congelarLinha = 1
        ) => {
            sheet.properties.defaultRowHeight = 22;
            sheet.views = [
                {
                    state: "frozen",
                    ySplit: congelarLinha,
                    showGridLines: false,
                    zoomScale: 90
                }
            ];
            sheet.pageSetup = {
                paperSize: 9,
                orientation: "landscape",
                fitToPage: true,
                fitToWidth: 1,
                fitToHeight: 0,
                margins: {
                    left: 0.35,
                    right: 0.35,
                    top: 0.45,
                    bottom: 0.45,
                    header: 0.25,
                    footer: 0.25
                }
            };
            sheet.headerFooter = {
                oddHeader:
                    "&L&BSIGEL WMS&RRelatório de Produtividade",
                oddFooter:
                    `&L${dataInicio} até ${dataFim}&RPágina &P de &N`
            };
        };

        const aplicarStatusProdutividade = (
            cell,
            valor
        ) => {
            if (valor >= 98) {
                preencherCelula(
                    cell,
                    "FFC8E6C9"
                );
                cell.font = {
                    bold: true,
                    color: {
                        argb: "FF1B5E20"
                    }
                };
            }
            else if (valor >= 85) {
                preencherCelula(
                    cell,
                    "FFFFF9C4"
                );
                cell.font = {
                    bold: true,
                    color: {
                        argb: "FFF57F17"
                    }
                };
            }
            else {
                preencherCelula(
                    cell,
                    "FFFFCDD2"
                );
                cell.font = {
                    bold: true,
                    color: {
                        argb: "FFB71C1C"
                    }
                };
            }
        };

        const criarCabecalho = (
            sheet,
            titulo,
            ultimaColuna
        ) => {

            sheet.mergeCells(
                `A1:${ultimaColuna}1`
            );

            const cellTitulo =
                sheet.getCell("A1");

            cellTitulo.value = titulo;

            estilizarTitulo(
                cellTitulo
            );

            sheet.getRow(1).height = 38;

            sheet.mergeCells(
                `A2:${ultimaColuna}2`
            );

            const empresa =
                sheet.getCell("A2");

            empresa.value =
                "SIGEL WMS • Luizinho Auto Peças";

            empresa.font = {
                bold: true,
                size: 12,
                color: {
                    argb: TEMA.texto
                }
            };

            centralizar(
                empresa
            );

            sheet.mergeCells(
                `A3:${ultimaColuna}3`
            );

            const periodo =
                sheet.getCell("A3");

            periodo.value =
                `Período: ${dataInicio} até ${dataFim}`;

            estilizarSubtitulo(
                periodo
            );

            sheet.mergeCells(
                `A4:${ultimaColuna}4`
            );

            const gerado =
                sheet.getCell("A4");

            gerado.value =
                `Gerado em: ${new Date().toLocaleString("pt-BR")}`;

            estilizarSubtitulo(
                gerado
            );
        };

        const criarCard = ({
            sheet,
            coluna,
            linha,
            titulo,
            valor,
            corTitulo,
            corFundo
        }) => {

            sheet.mergeCells(
                linha,
                coluna,
                linha,
                coluna + 1
            );

            sheet.mergeCells(
                linha + 1,
                coluna,
                linha + 1,
                coluna + 1
            );

            const tituloCell =
                sheet.getCell(
                    linha,
                    coluna
                );

            tituloCell.value =
                titulo;

            tituloCell.font = {
                bold: true,
                color: {
                    argb: TEMA.branco
                }
            };

            preencherCelula(
                tituloCell,
                corTitulo
            );

            centralizar(
                tituloCell
            );

            aplicarBorda(
                tituloCell
            );

            const valorCell =
                sheet.getCell(
                    linha + 1,
                    coluna
                );

            valorCell.value =
                valor;

            valorCell.font = {
                bold: true,
                size: 18,
                color: {
                    argb: corTitulo
                }
            };

            preencherCelula(
                valorCell,
                corFundo
            );

            centralizar(
                valorCell
            );

            aplicarBorda(
                valorCell
            );

            sheet.getRow(linha)
                .height = 24;

            sheet.getRow(linha + 1)
                .height = 34;
        };

        const criarTabela = ({
            sheet,
            nome,
            inicio,
            fim
        }) => {
            sheet.addTable({
                name: nome,
                ref: inicio,
                headerRow: true,
                totalsRow: false,
                style: {
                    theme:
                        "TableStyleMedium2",
                    showRowStripes:
                        true
                },
                columns:
                    sheet.columns.map(coluna => ({
                        name:
                            coluna.header,
                        filterButton:
                            true
                    })),
                rows:
                    sheet
                        .getRows(
                            2,
                            sheet.rowCount
                        )
                        .map(row =>
                            row.values.slice(1)
                        )
            });
        };

        const criarLegenda = (
            sheet,
            linha
        ) => {
            sheet.mergeCells(
                `A${linha}:G${linha}`
            );

            const cell =
                sheet.getCell(
                    `A${linha}`
                );

            cell.value =
                "🟢 Excelente ≥95%     🟡 Atenção 85%-94%     🔴 Crítico <85%";

            cell.font = {
                italic: true,
                color: {
                    argb: TEMA.textoClaro
                }
            };

            centralizar(
                cell
            );
        };

        const adicionarLogo = (
            sheet,
            logoId
        ) => {
            if (!logoId)
                return;
            sheet.addImage(

                logoId,
                {
                    tl: {
                        col: 0.2,
                        row: 0.1
                    },
                    ext: {
                        width: 80,
                        height: 80
                    }
                }
            );
        };

        // ABA RESUMO
        const resumo = workbook.addWorksheet(
            "Resumo"
        );


        resumo.columns = [
            {
                header: "Conferente",
                key: "nome",
                width: 30
            },
            {
                header: "Notas",
                key: "notas",
                width: 12
            },
            {
                header: "Itens",
                key: "itens",
                width: 12
            },
            {
                header: "Pontos",
                key: "pontos",
                width: 14
            },
            {
                header: "XP",
                key: "xp",
                width: 14
            },
            {
                header: "Produtividade",
                key: "produtividade",
                width: 18
            },
            {
                header: "Erros",
                key: "errosCaixa",
                width: 12
            }
        ];


        const totalConferentes =
            items.length;


        const totalNotas =
            items.reduce(
                (total, item) =>
                    total + item.notas,
                0
            );


        const totalItens =
            items.reduce(
                (total, item) =>
                    total + item.itens,
                0
            );


        const totalXP =
            items.reduce(
                (total, item) =>
                    total + item.xp,
                0
            );


        const totalPontos =
            items.reduce(
                (total, item) =>
                    total + item.pontosFinais,
                0
            );


        const totalErros =
            items.reduce(
                (total, item) =>
                    total + item.errosCaixa,
                0
            );


        // ======================================================
        // CABEÇALHO
        // ======================================================

        criarCabecalho(
            resumo,
            "RELATÓRIO DE PRODUTIVIDADE",
            "G"
        );


        // ======================================================
        // DASHBOARD
        // ======================================================


        const indicadores = [
            {
                titulo: "📝 Notas",
                valor: totalNotas,
                cor: TEMA.sucesso,
                fundo: "FFE8F5E9"
            },
            {
                titulo: "📦 Itens",
                valor: totalItens,
                cor: TEMA.alerta,
                fundo: "FFFFF8E1"
            },
            {
                titulo: "❌ Erros",
                valor: totalErros,
                cor: TEMA.erro,
                fundo: "FFFFEBEE"
            }
        ];


        const posicoesCards = [
            [1, 7],
            [3, 7],
            [5, 7],
        ];


        indicadores.forEach(
            (item, index) => {

                criarCard({

                    sheet: resumo,

                    coluna:
                        posicoesCards[index][0],

                    linha:
                        posicoesCards[index][1],

                    titulo:
                        item.titulo,

                    valor:
                        item.valor
                            .toLocaleString("pt-BR"),

                    corTitulo:
                        item.cor,

                    corFundo:
                        item.fundo

                });

            }
        );

        // LOGO
        if (typeof logoId !== "undefined") {
            adicionarLogo(
                resumo,
                logoId
            );
        }

        resumo.mergeCells(
            "A9:G9"
        );

        preencherCelula(
            resumo.getCell("A9"),
            TEMA.primaria
        );

        resumo.getRow(9).height = 6;

        const headerRow =
            resumo.getRow(10);

        headerRow.values = [
            "Conferente",
            "Notas",
            "Itens",
            "Pontos",
            "XP",
            "Produtividade",
            "Erros"
        ];


        headerRow.eachCell(
            cell => {

                cell.font = {
                    bold: true,
                    color: {
                        argb: TEMA.branco
                    }
                };


                preencherCelula(
                    cell,
                    TEMA.secundaria
                );


                centralizar(cell);

                aplicarBorda(cell);

            }
        );

        headerRow.height = 24;

        // ======================================================
        // DADOS DA TABELA
        // ======================================================

        items.forEach(item => {

            const row =
                resumo.addRow({

                    nome:
                        item.nome,

                    notas:
                        item.notas,

                    itens:
                        item.itens,

                    pontos:
                        item.pontosFinais,

                    xp:
                        item.xp,

                    produtividade:
                        item.produtividade / 100,

                    errosCaixa:
                        item.errosCaixa

                });


            row.height = 22;


            row.getCell("notas")
                .numFmt = "#,##0";


            row.getCell("itens")
                .numFmt = "#,##0";


            row.getCell("pontos")
                .numFmt = "#,##0";


            row.getCell("xp")
                .numFmt = "#,##0";


            row.getCell("produtividade")
                .numFmt = "0.00%";


            row.getCell("errosCaixa")
                .numFmt = "#,##0";



            row.eachCell(
                cell => {

                    aplicarBorda(cell);

                    cell.alignment = {

                        vertical:
                            "middle",

                        horizontal:
                            typeof cell.value === "number"
                                ? "center"
                                : "left"

                    };

                }
            );



            // Zebra

            if (row.number % 2 === 0) {

                row.eachCell(
                    cell => {

                        preencherCelula(
                            cell,
                            TEMA.zebra
                        );

                    }
                );

            }



            // ==================================================
            // STATUS PRODUTIVIDADE
            // ==================================================

            const produtividade =
                Number(
                    item.produtividade
                );


            aplicarStatusProdutividade(

                row.getCell(
                    "produtividade"
                ),

                produtividade

            );



            // ==================================================
            // STATUS ERROS
            // ==================================================

            const erro =
                row.getCell(
                    "errosCaixa"
                );


            if (item.errosCaixa > 0) {

                preencherCelula(
                    erro,
                    "FFFFEBEE"
                );


                erro.font = {

                    bold: true,

                    color: {
                        argb: TEMA.erro
                    }

                };

            }
            else {

                preencherCelula(
                    erro,
                    "FFE8F5E9"
                );


                erro.font = {

                    bold: true,

                    color: {
                        argb: TEMA.sucesso
                    }

                };

            }


        });



        // ======================================================
        // LEGENDA
        // ======================================================


        criarLegenda(
            resumo,
            resumo.rowCount + 2
        );

        // CONFIGURAÇÕES RESUMO
        resumo.autoFilter = {
            from: {
                row: 10,
                column: 1
            },
            to: {
                row: 10,
                column: 7
            }
        };

        resumo.views = [{
            state: "frozen",
            ySplit: 10,
            showGridLines: false,
            zoomScale: 90
        }];

        resumo.pageSetup = {
            paperSize: 9,
            orientation: "landscape",
            fitToPage: true,
            fitToWidth: 1,
            fitToHeight: 0,
            horizontalCentered: true,
            margins: {
                left: 0.35,
                right: 0.35,
                top: 0.45,
                bottom: 0.45,
                header: 0.25,
                footer: 0.25
            }
        };

        resumo.headerFooter = {
            oddHeader:
                "&L&BSIGEL WMS&RRelatório de Produtividade",
            oddFooter:
                `&L${dataInicio} até ${dataFim}&RPágina &P de &N`
        };

        resumo.pageSetup.printArea =
            `A1:G${resumo.rowCount}`;

        resumo.properties.tabColor = {
            argb:
                TEMA.primaria
        };

        // ABA DETALHES
        const detalhes =
            workbook.addWorksheet(
                "Detalhes"
            );


        detalhes.columns = [

            {
                header: "Conferente",
                key: "conferente",
                width: 28
            },

            {
                header: "Código",
                key: "codigo",
                width: 18
            },

            {
                header: "Produto",
                key: "produto",
                width: 55
            },

            {
                header: "Localização",
                key: "localizacao",
                width: 18
            },

            {
                header: "Quantidade",
                key: "quantidade",
                width: 14
            },

            {
                header: "Pontos",
                key: "pontos",
                width: 14
            },

            {
                header: "Erro",
                key: "erro",
                width: 12
            }

        ];



        criarCabecalho(
            detalhes,
            "DETALHAMENTO DAS CONFERÊNCIAS",
            "G"
        );



        // Cabeçalho da tabela

        const detalhesHeader =
            detalhes.getRow(5);


        detalhesHeader.values = [

            "Conferente",
            "Código",
            "Produto",
            "Localização",
            "Quantidade",
            "Pontos",
            "Erro"

        ];



        detalhesHeader.eachCell(
            cell => {

                cell.font = {

                    bold: true,

                    color: {
                        argb: TEMA.branco
                    }

                };


                preencherCelula(
                    cell,
                    TEMA.secundaria
                );


                centralizar(cell);

                aplicarBorda(cell);

            }
        );



        // ======================================================
        // INSERE DADOS
        // ======================================================


        items.forEach(
            conferente => {


                conferente.detalhes.forEach(
                    item => {


                        const row =
                            detalhes.addRow({

                                conferente:
                                    conferente.nome,

                                codigo:
                                    item.codigo,

                                produto:
                                    item.tipo,

                                localizacao:
                                    item.localizacao,

                                quantidade:
                                    item.quantidade,

                                pontos:
                                    item.pontosTotal,

                                erro:
                                    item.erro
                                        ? "SIM"
                                        : "NÃO"

                            });



                        row.height = 22;



                        row.getCell(
                            "quantidade"
                        )
                            .numFmt = "#,##0";



                        row.getCell(
                            "pontos"
                        )
                            .numFmt = "#,##0";



                        row.eachCell(
                            cell => {

                                aplicarBorda(cell);


                                cell.alignment = {

                                    vertical:
                                        "middle",

                                    horizontal:
                                        typeof cell.value === "number"
                                            ? "center"
                                            : "left"

                                };

                            }
                        );



                        // Zebra

                        if (row.number % 2 === 0) {

                            row.eachCell(
                                cell => {

                                    preencherCelula(
                                        cell,
                                        TEMA.zebra
                                    );

                                }
                            );

                        }



                        // ==================================================
                        // STATUS ERRO
                        // ==================================================


                        const erroCell =
                            row.getCell(
                                "erro"
                            );



                        if (item.erro) {


                            preencherCelula(
                                erroCell,
                                "FFFFCDD2"
                            );


                            erroCell.font = {

                                bold: true,

                                color: {
                                    argb: TEMA.erro
                                }

                            };


                        }
                        else {


                            preencherCelula(
                                erroCell,
                                "FFC8E6C9"
                            );


                            erroCell.font = {

                                bold: true,

                                color: {
                                    argb: TEMA.sucesso
                                }

                            };


                        }


                        centralizar(
                            erroCell
                        );


                    }
                );

            }
        );



        // ======================================================
        // CONFIGURAÇÕES DETALHES
        // ======================================================


        detalhes.autoFilter = {

            from: {
                row: 5,
                column: 1
            },

            to: {
                row: 5,
                column: 7
            }

        };



        detalhes.views = [{

            state: "frozen",

            ySplit: 5,

            showGridLines: false,

            zoomScale: 90

        }];



        detalhes.pageSetup = {

            paperSize: 9,

            orientation: "landscape",

            fitToPage: true,

            fitToWidth: 1,

            fitToHeight: 0,

            margins: {

                left: 0.35,

                right: 0.35,

                top: 0.45,

                bottom: 0.45,

                header: 0.25,

                footer: 0.25

            }

        };

        detalhes.headerFooter = {
            oddHeader:
                "&L&BSIGEL WMS&RDetalhamento das Conferências",
            oddFooter:
                `&L${dataInicio} até ${dataFim}&RPágina &P de &N`
        };

        detalhes.pageSetup.printArea =
            `A1:G${detalhes.rowCount}`;

        detalhes.properties.tabColor = {
            argb:
                TEMA.secundaria
        };

        // CONFIGURAÇÕES GERAIS
        [resumo, detalhes]
            .forEach(sheet => {
                sheet.properties.defaultRowHeight = 22;
                sheet.pageSetup.printArea =
                    `A1:${sheet.lastColumn.letter}${sheet.rowCount}`;
            });
        workbook.views = [
            {
                activeTab: 0
            }
        ];

        // EXPORTAÇÃO
        const buffer =
            await workbook.xlsx.writeBuffer();

        const hoje =
            new Date()
                .toLocaleDateString("pt-BR")
                .replace(/\//g, "-");

        saveAs(
            new Blob(
                [
                    buffer
                ],
                {
                    type:
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                }
            ),
            `Produtividade_${hoje}.xlsx`
        );
    };

    // Icone de carregamento
    if (loading) {

        return (
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "80vh",
                }}
            >
                <CircularProgress size={60} />
            </Box>
        );

    }

    // Dados totais
    const totalItens =
        dados.reduce(
            (a, b) => a + b.itens,
            0
        );

    const totalPontos =
        dados.reduce(
            (a, b) =>
                a + b.pontosFinais,
            0
        );

    const totalErros =
        dados.reduce(
            (a, b) =>
                a + b.errosCaixa,
            0
        );

    const totalRecebimentos =
        dados.reduce(
            (a, b) =>
                a + b.notasRecebidas,
            0
        );

    // MVP - Melhor conferente
    const mvp = dados[0];

    const pior =
        [...dados].sort(
            (a, b) =>
                a.produtividade
                - b.produtividade
        )[0];

    const maisXP =
        [...dados].sort(
            (a, b) =>
                b.xp - a.xp
        )[0];

    const maisPesados =
        [...dados].sort(
            (a, b) =>
                b.pontosPesados
                - a.pontosPesados
        )[0];

    const maisRecebimentos =
        [...dados].sort(
            (a, b) =>
                b.notasRecebidas
                - a.notasRecebidas
        )[0];

    // Tela
    return (
        !token ? (
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
        ) : (

            <Container
                maxWidth="xl"
                sx={{
                    mt: 4,
                    mb: 6,
                    zoom: "90%"
                }}
            >

                {/* HEADER */}
                <Box sx={{ mb: 4 }}>

                    <Typography
                        variant="h4"
                        fontWeight="bold"
                        color={textColor}
                    >
                        SIGEL WMS
                    </Typography>

                    <Typography
                        color={subTextColor}
                    >
                        Sistema avançado de produtividade
                    </Typography>

                </Box>

                {/* CAMPOS DE FILTRO POR DATA */}
                <Box
                    sx={{
                        display: "flex",
                        gap: 2,
                        mb: 3,
                        flexWrap: "wrap",
                    }}
                >

                    <TextField
                        type="date"
                        label="Data início"
                        InputLabelProps={{
                            shrink: true,
                        }}
                        value={dataInicio}
                        onChange={(e) =>
                            setDataInicio(
                                e.target.value
                            )
                        }
                    />

                    <TextField
                        type="date"
                        label="Data fim"
                        InputLabelProps={{
                            shrink: true,
                        }}
                        value={dataFim}
                        onChange={(e) =>
                            setDataFim(
                                e.target.value
                            )
                        }
                    />

                    <Button
                        variant="contained"
                        onClick={() =>
                            carregarDados(
                                dataInicio,
                                dataFim
                            )
                        }
                    >
                        Atualizar
                    </Button>

                    <Button
                        variant="contained"
                        color="success"
                        startIcon={<Storefront />}
                        onClick={() => navigate("/Loja")}
                    >
                        Loja SigelCoins
                    </Button>

                    <Button
                        variant="contained"
                        color="warning"
                        startIcon={<EmojiEventsIcon />}
                        onClick={() => navigate("/Temporadas")}
                    >
                        Temporadas Anteriores
                    </Button>

                    <IconButton
                        onClick={() => setOpenRanks(true)}
                        sx={{
                            bgcolor: "#1a1a1a",
                            color: "#fff",
                            width: "50px",
                            height: "50px",

                            "&:hover": {
                                bgcolor: "#2a2a2a",
                            },
                        }}
                    >
                        ?
                    </IconButton>
                    <IconButton
                        onClick={() =>
                            navigate("/")
                        }
                        sx={{
                            bgcolor: "#1a1a1a",
                            color: "#fff",
                            width: "50px",
                            height: "50px",
                            "&:hover": {
                                bgcolor: "#2a2a2a",
                            },
                        }}
                    >
                        <ArrowBackIcon />
                    </IconButton>
                    <IconButton
                        onClick={() => {
                            window.location.href = "http://192.168.1.185:3001/mevf/rank";
                        }}
                        sx={{
                            bgcolor: "#1a1a1a",
                            color: "#fff",
                            width: "50px",
                            height: "50px",
                            "&:hover": {
                                bgcolor: "#2a2a2a",
                            },
                        }}
                    >
                        <Warehouse />
                    </IconButton>

                </Box>

                {/* TABS */}
                <Paper
                    sx={{
                        ...glassStyle,
                        mb: 10,
                    }}
                >

                    <Tabs
                        value={tab}
                        onChange={(e, v) =>
                            setTab(v)
                        }
                        variant="scrollable"
                        sx={{
                            "& .MuiTabs-indicator": {
                                display: "none",
                            },
                        }}
                    >

                        <Tab
                            label="📊 Operacional"
                            sx={{
                                color: textColor,
                            }}
                        />

                        <Tab
                            label="📈 Gerencial"
                            sx={{
                                color: textColor,
                            }}
                        />

                        <Tab
                            label="🎮 Arena"
                            sx={{
                                color: textColor,
                            }}
                        />

                    </Tabs>

                </Paper>

                {/* ===================================== */}
                {/* OPERACIONAL */}
                {/* ===================================== */}
                {tab === 0 && (

                    <Box
                        sx={{
                            width: "100%",
                            maxWidth: 1700,          // largura máxima da área
                            mx: "auto",              // centraliza
                            px: {
                                xs: 2,
                                sm: 3,
                                md: 4,
                                lg: 5,
                            },
                        }}
                    >
                        <Grid
                            container
                            spacing={6}
                            justifyContent="center"
                            alignItems="stretch"
                        >
                            {dados.map((row) => {

                                const nivel = obterNivel(
                                    Number(row.xp),
                                    row.itens,
                                    row.pontosFinais,
                                    row.produtividade,
                                    row.errosCaixa
                                );

                                const cosmetico = cosmeticos[row.conferente] || {};

                                const moldura =
                                    MOLDURAS[cosmetico.moldura] ||
                                    MOLDURAS.default;

                                const efeito =
                                    EFEITOS[cosmetico.efeito] ||
                                    EFEITOS.default;

                                const titulo =
                                    TITULOS[cosmetico.titulo] ||
                                    TITULOS.default;
                                return (
                                    <Grid
                                        item
                                        key={row.conferente}
                                        xs={12}
                                        sm={6}
                                        lg={4}
                                        xl={3}
                                    >
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                        >
                                            <Paper
                                                sx={{
                                                    ...glassStyle,
                                                    position: "relative",
                                                    overflow: "visible",
                                                    pt: 12,
                                                    pb: 3,
                                                    px: 3,
                                                    background: efeito.background,
                                                    boxShadow: efeito.cardGlow,
                                                    mb: 7,
                                                    height: "100%",
                                                }}
                                            >

                                                {/* GLOW FUNDO */}
                                                <Box
                                                    sx={{
                                                        position: "absolute",
                                                        top: -80,
                                                        left: "50%",
                                                        transform: "translateX(-50%)",
                                                        width: 180,
                                                        height: 180,
                                                        borderRadius: "50%",
                                                        background: `${nivel.cor}55`,
                                                        filter: "blur(70px)",
                                                        zIndex: 1,
                                                    }}
                                                />

                                                {/* RANK */}
                                                <Box
                                                    sx={{
                                                        position: "absolute",
                                                        top: -70,
                                                        left: "50%",
                                                        transform: "translateX(-50%)",
                                                        zIndex: 20,
                                                        display: "flex",
                                                        flexDirection: "column",
                                                        alignItems: "center",
                                                    }}
                                                >
                                                    <motion.img
                                                        src={nivel.imagem}
                                                        alt={nivel.nome}

                                                        animate={{
                                                            y: [0, -6, 0],
                                                        }}

                                                        transition={{
                                                            duration: 3,
                                                            repeat: Infinity,
                                                        }}

                                                        style={{
                                                            width: 140,
                                                            height: 140,
                                                            objectFit: "contain",
                                                            filter: `
                                                    drop-shadow(0 0 12px ${nivel.cor}
                                                    drop-shadow(0 0 30px ${nivel.cor})
                                                `,
                                                        }}
                                                    />

                                                    <Typography
                                                        sx={{
                                                            mt: -1,
                                                            fontWeight: 900,
                                                            letterSpacing: 2,
                                                            fontSize: 18,
                                                            color: nivel.cor,
                                                            textShadow: `
                                                            0 0 10px ${nivel.cor},
                                                            0 0 20px ${nivel.cor}
                                                        `,
                                                        }}
                                                    >
                                                        {nivel.nome}
                                                    </Typography>

                                                </Box>

                                                <Box
                                                    sx={{
                                                        position: "absolute",
                                                        top: -30,
                                                        right: -30,
                                                        width: 120,
                                                        height: 120,
                                                        borderRadius: "50%",
                                                        bgcolor:
                                                            `${nivel.cor}22`,
                                                        filter:
                                                            "blur(40px)",
                                                    }}
                                                />

                                                <Box
                                                    sx={{
                                                        display: "flex",
                                                        justifyContent:
                                                            "space-between",

                                                        alignItems:
                                                            "center",
                                                    }}
                                                >

                                                    <Box
                                                        sx={{
                                                            display: "flex",
                                                            alignItems:
                                                                "center",
                                                            gap: 2,
                                                        }}
                                                    >

                                                        <Avatar
                                                            sx={{
                                                                width: 70,
                                                                height: 70,
                                                                bgcolor: "background.default",
                                                                color: cosmeticos[row.conferente]?.avatar === "✠"
                                                                    ? "primary.cancelar"
                                                                    : "primary.branco",
                                                                fontWeight:
                                                                    "bold",
                                                                fontSize:
                                                                    28,
                                                                border: `3px solid ${moldura.borderColor}`,
                                                                boxShadow: moldura.glow,
                                                                cursor: "pointer",
                                                            }}
                                                            onClick={() =>
                                                                navigate(`/games/perfil/${row.conferente}`)
                                                            }
                                                        >
                                                            {cosmeticos[row.conferente]?.avatar}
                                                        </Avatar>

                                                        <Box>
                                                            <Typography
                                                                variant="h6"
                                                                fontWeight="bold"
                                                                color={textColor}
                                                                sx={{
                                                                    cursor: "pointer",
                                                                }}
                                                                onClick={() => navigate(`/games/perfil/${row.conferente}`)}
                                                            >
                                                                {row.nome}
                                                            </Typography>
                                                            <Typography
                                                                variant="h7"
                                                                color={textColor}
                                                                sx={{
                                                                    color: titulo.color,
                                                                }}
                                                            >
                                                                {cosmeticos[row.conferente]?.titulo === "Sargento"
                                                                    ? `Sargento ${row.nome?.trim().split(" ").pop() || ""}`
                                                                    : cosmeticos[row.conferente]?.titulo
                                                                }
                                                            </Typography>
                                                        </Box>

                                                    </Box>

                                                    <Chip
                                                        icon={
                                                            <BoltIcon />
                                                        }
                                                        label={`${row.xp} XP`}
                                                        color="secondary"
                                                        sx={{ ml: 2 }}
                                                    />

                                                </Box>

                                                <Divider
                                                    sx={{
                                                        my: 2,
                                                    }}
                                                />

                                                <Stack
                                                    spacing={1.5}
                                                >

                                                    <Chip
                                                        icon={
                                                            <EmojiEventsIcon />
                                                        }
                                                        label={`${row.pontosFinais} pts`}
                                                        color="warning"
                                                        sx={{ color: 'primary.branco' }}
                                                    />

                                                    <Chip
                                                        icon={
                                                            <Inventory2Icon />
                                                        }
                                                        label={`${row.itens} itens`}
                                                    />

                                                    <Chip
                                                        icon={
                                                            <ShieldIcon />
                                                        }
                                                        label={`${row.produtividade}% precisão`}
                                                        color="success"
                                                        sx={{ color: 'primary.branco' }}
                                                    />

                                                    <Chip
                                                        icon={
                                                            <WarningAmberIcon />
                                                        }
                                                        label={`${row.errosCaixa} divergências`}
                                                        color="error"
                                                    />

                                                    <Chip
                                                        icon={<ArticleIcon />}
                                                        label={`${row.notasRecebidas} notas recebidas`}
                                                        color="info"
                                                        sx={{ color: 'primary.branco' }}
                                                    />
                                                </Stack>

                                                <Button
                                                    fullWidth
                                                    variant="contained"
                                                    sx={{
                                                        mt: 3,
                                                    }}
                                                    onClick={() =>
                                                        abrirDetalhes(
                                                            row
                                                        )
                                                    }
                                                >
                                                    Ver detalhes
                                                </Button>

                                            </Paper>
                                        </motion.div>
                                    </Grid>
                                );
                            })}
                        </Grid>
                    </Box>
                )}

                {/* GERENCIAL */}
                {tab === 1 && (
                    < Box
                        sx={{
                            width: "100%",
                            maxWidth: 1600,
                            mx: "auto",
                            px: { xs: 2, sm: 3, md: 4 },
                            display: "flex",
                            flexDirection: "column",
                            gap: 4,
                        }}
                    >

                        {/* INDICADORES (cards do topo) */}
                        <Box
                            sx={{
                                display: "grid",
                                gap: 3,
                                gridTemplateColumns: {
                                    xs: "1fr",
                                    sm: "repeat(2, 1fr)",
                                    md: "repeat(3, 1fr)",
                                    lg: "repeat(6, 1fr)",
                                },
                            }}
                        >
                            {/* RECEBIMENTOS */}
                            <Card sx={glassStyle}>
                                <CardContent>
                                    <Typography color={subTextColor}>
                                        Recebimentos
                                    </Typography>
                                    <Typography variant="h4" fontWeight="bold" color="#00bfff">
                                        {totalRecebimentos}
                                    </Typography>
                                    <Typography variant="caption" color={subTextColor}>
                                        notas recebidas
                                    </Typography>
                                </CardContent>
                            </Card>

                            {/* TOTAL ITENS */}
                            <Card sx={glassStyle}>
                                <CardContent>
                                    <Typography color={subTextColor}>
                                        Total de itens
                                    </Typography>
                                    <Typography variant="h4" fontWeight="bold" color="#00ff99">
                                        {totalItens}
                                    </Typography>
                                    <Typography variant="caption" color={subTextColor}>
                                        peças conferidas
                                    </Typography>
                                </CardContent>
                            </Card>

                            {/* ERROS */}
                            <Card sx={glassStyle}>
                                <CardContent>
                                    <Typography color={subTextColor}>
                                        Divergências
                                    </Typography>
                                    <Typography variant="h4" fontWeight="bold" color="#ff5252">
                                        {totalErros}
                                    </Typography>
                                    <Typography variant="caption" color={subTextColor}>
                                        erros operacionais
                                    </Typography>
                                </CardContent>
                            </Card>

                            {/* MEDIA */}
                            <Card sx={glassStyle}>
                                <CardContent>
                                    <Typography color={subTextColor}>
                                        Média equipe
                                    </Typography>
                                    <Typography variant="h4" fontWeight="bold" color="#FFD700">
                                        {(
                                            dados.reduce((a, b) => a + Number(b.produtividade), 0) /
                                            dados.length
                                        ).toFixed(1)}%
                                    </Typography>
                                    <Typography variant="caption" color={subTextColor}>
                                        eficiência média
                                    </Typography>
                                </CardContent>
                            </Card>

                            {/* MVP */}
                            <Card sx={glassStyle}>
                                <CardContent>
                                    <Typography color={subTextColor}>
                                        MVP operacional
                                    </Typography>
                                    <Typography fontWeight="bold" color="#00ff99">
                                        {mvp?.nome}
                                    </Typography>
                                    <Typography variant="caption" color={subTextColor}>
                                        melhor operador
                                    </Typography>
                                </CardContent>
                            </Card>

                            {/* PIOR */}
                            <Card sx={glassStyle}>
                                <CardContent>
                                    <Typography color={subTextColor}>
                                        Atenção
                                    </Typography>
                                    <Typography fontWeight="bold" color="#ff5252">
                                        {pior?.nome}
                                    </Typography>
                                    <Typography variant="caption" color={subTextColor}>
                                        menor eficiência
                                    </Typography>
                                </CardContent>
                            </Card>

                        </Box>

                        {/* RELATÓRIO + SALA DE GUERRA */}
                        <Grid container spacing={3} justifyContent="center">

                            {/* TABELA GERENCIAL */}
                            <Grid item xs={12} lg={8}>

                                <Paper sx={{ ...glassStyle, p: { xs: 2, sm: 3 }, height: "100%" }}>

                                    <Box
                                        sx={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: { xs: "flex-start", sm: "center" },
                                            mb: 3,
                                            flexDirection: { xs: "column", sm: "row" },
                                            flexWrap: "wrap",
                                            gap: 2,
                                        }}
                                    >

                                        <Box>
                                            <Typography variant="h6" fontWeight="bold" color={textColor}>
                                                📋 Relatório gerencial
                                            </Typography>
                                            <Typography variant="body2" color={subTextColor}>
                                                Indicadores completos da equipe operacional
                                            </Typography>
                                        </Box>

                                        <Stack alignItems={{ xs: "stretch", sm: "flex-end" }} sx={{ width: { xs: "100%", sm: "auto" } }}>
                                            <Button
                                                fullWidth
                                                variant="contained"
                                                color="success"
                                                startIcon={<FileDownloadIcon />}
                                                onClick={exportarRelatorio}
                                            >
                                                Exportar Relatório
                                            </Button>

                                            <Chip
                                                label={`Última atualização • ${lastUpdate}`}
                                                color="info"
                                                sx={{ color: "white", mt: 2, alignSelf: { xs: "stretch", sm: "flex-end" }, justifyContent: "center" }}
                                            />
                                        </Stack>

                                    </Box>

                                    <TableContainer sx={{ overflowX: "auto" }}>
                                        <Table sx={{ minWidth: 650 }}>

                                            <TableHead>
                                                <TableRow>
                                                    <TableCell sx={{ color: "#fff" }}>Operador</TableCell>
                                                    <TableCell sx={{ color: "#fff" }}>Itens</TableCell>
                                                    <TableCell sx={{ color: "#fff" }}>Recebimentos</TableCell>
                                                    <TableCell sx={{ color: "#fff" }}>Erros</TableCell>
                                                    <TableCell sx={{ color: "#fff" }}>Eficiência</TableCell>
                                                    <TableCell sx={{ color: "#fff" }}>XP</TableCell>
                                                    <TableCell sx={{ color: "#fff" }}>Pesados</TableCell>
                                                    <TableCell sx={{ color: "#fff" }}>Status</TableCell>
                                                </TableRow>
                                            </TableHead>

                                            <TableBody>
                                                {dados.map((row, index) => {

                                                    const nivel = obterNivel(
                                                        Number(row.xp),
                                                        row.itens,
                                                        row.pontosFinais,
                                                        row.produtividade,
                                                        row.errosCaixa
                                                    );

                                                    return (
                                                        <TableRow
                                                            key={row.conferente}
                                                            hover
                                                            sx={{
                                                                transition: "0.2s",
                                                                "&:hover": {
                                                                    bgcolor: dark
                                                                        ? "rgba(255,255,255,0.03)"
                                                                        : "rgba(0,0,0,0.03)",
                                                                },
                                                            }}
                                                        >

                                                            {/* OPERADOR */}
                                                            <TableCell>
                                                                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                                                    <Avatar
                                                                        sx={{
                                                                            width: { xs: 48, sm: 60, md: 72 },
                                                                            height: { xs: 48, sm: 60, md: 72 },
                                                                            bgcolor: "#111",
                                                                            border: `3px solid ${nivel.cor}`,
                                                                            color: "#fff",
                                                                            fontWeight: "bold",
                                                                            fontSize: { xs: 20, sm: 24, md: 30 },
                                                                            boxShadow: `0 0 15px ${nivel.cor}`,
                                                                        }}
                                                                    >
                                                                        {index + 1}
                                                                    </Avatar>

                                                                    <Box>
                                                                        <Typography color={textColor} fontWeight="bold">
                                                                            {row.nome}
                                                                        </Typography>
                                                                        <Typography variant="caption" fontWeight="bold" color={nivel.cor}>
                                                                            {nivel.emoji} {nivel.nome}
                                                                        </Typography>
                                                                    </Box>
                                                                </Box>
                                                            </TableCell>

                                                            {/* ITENS */}
                                                            <TableCell>
                                                                <Typography color={textColor} fontWeight="bold">
                                                                    {row.itens}
                                                                </Typography>
                                                            </TableCell>

                                                            {/* PONTOS */}
                                                            <TableCell>
                                                                <Typography color="#00ff99" fontWeight="bold" sx={{ display: 'flex', justifyContent: 'center' }}>
                                                                    {row.notasRecebidas}
                                                                </Typography>
                                                            </TableCell>

                                                            {/* ERROS */}
                                                            <TableCell>
                                                                <Typography
                                                                    color={row.errosCaixa > 0 ? "#ff5252" : "#00ff99"}
                                                                    fontWeight="bold"
                                                                >
                                                                    {row.errosCaixa}
                                                                </Typography>
                                                            </TableCell>

                                                            {/* EFICIENCIA */}
                                                            <TableCell>
                                                                <Chip
                                                                    label={`${row.produtividade}%`}
                                                                    color={
                                                                        row.produtividade >= 96
                                                                            ? "success"
                                                                            : row.produtividade >= 90
                                                                                ? "warning"
                                                                                : "error"
                                                                    }
                                                                    sx={{ color: "primary.branco" }}
                                                                />
                                                            </TableCell>

                                                            {/* XP */}
                                                            <TableCell>
                                                                <Typography color="#FFD700" fontWeight="bold">
                                                                    {row.xp}
                                                                </Typography>
                                                            </TableCell>

                                                            {/* PESADOS */}
                                                            <TableCell>
                                                                <Typography color="#00bfff" fontWeight="bold">
                                                                    {row.pontosPesados}
                                                                </Typography>
                                                            </TableCell>

                                                            {/* STATUS */}
                                                            <TableCell>
                                                                <Chip
                                                                    sx={{ color: "#FFFFFF", fontWeight: "bold" }}
                                                                    label={
                                                                        row.produtividade >= 100
                                                                            ? "MASTER"
                                                                            : row.produtividade >= 99
                                                                                ? "ELITE"
                                                                                : row.produtividade >= 98
                                                                                    ? "ÓTIMO"
                                                                                    : row.produtividade >= 95
                                                                                        ? "OK"
                                                                                        : "CRÍTICO"
                                                                    }
                                                                    color={
                                                                        row.produtividade >= 100
                                                                            ? "warning"
                                                                            : row.produtividade >= 99
                                                                                ? "success"
                                                                                : row.produtividade >= 98
                                                                                    ? "info"
                                                                                    : row.produtividade >= 95
                                                                                        ? "secondary"
                                                                                        : "error"
                                                                    }
                                                                />
                                                            </TableCell>

                                                        </TableRow>
                                                    );
                                                })}
                                            </TableBody>

                                        </Table>
                                    </TableContainer>

                                </Paper>

                            </Grid>

                            {/* SALA DE GUERRA */}
                            <Grid item xs={12} lg={4}>

                                <Paper sx={{ ...glassStyle, p: { xs: 2, sm: 3 }, height: "100%" }}>

                                    <Typography variant="h6" fontWeight="bold" color={textColor} sx={{ mb: 3 }}>
                                        🧠 Sala de guerra
                                    </Typography>

                                    <Stack spacing={2}>

                                        {/* MVP */}
                                        <Paper
                                            sx={{
                                                p: 2.5,
                                                borderRadius: 4,
                                                bgcolor: "rgba(0,255,120,0.08)",
                                                border: "1px solid rgba(0,255,120,0.2)",
                                            }}
                                        >
                                            <Typography color="#00ff99" fontWeight="bold">
                                                🏆 MVP DA SEMANA
                                            </Typography>
                                            <Typography variant="h5" fontWeight="bold" color={textColor} sx={{ mt: 1 }}>
                                                {mvp?.nome}
                                            </Typography>
                                            <Typography color={subTextColor}>
                                                {mvp?.pontosFinais} pts
                                            </Typography>
                                        </Paper>

                                        {/* MAIS RECEBIMENTOS */}
                                        <Paper
                                            sx={{
                                                p: 2.5,
                                                borderRadius: 4,
                                                bgcolor: "rgba(82, 85, 255, 0.08)",
                                                border: "1px solid rgba(37, 22, 243, 0.45)",
                                            }}
                                        >
                                            <Typography color="#5d68fd" fontWeight="bold">
                                                🧾 MAIS RECEBIMENTOS
                                            </Typography>
                                            <Typography variant="h5" fontWeight="bold" color={textColor} sx={{ mt: 1 }}>
                                                {maisRecebimentos?.nome}
                                            </Typography>
                                            <Typography color={subTextColor}>
                                                {maisRecebimentos?.notasRecebidas} notas recebidas
                                            </Typography>
                                        </Paper>

                                        {/* MAIS PRECISO */}
                                        <Paper
                                            sx={{
                                                p: 2.5,
                                                borderRadius: 4,
                                                bgcolor: "rgba(0,191,255,0.08)",
                                                border: "1px solid rgba(0,191,255,0.2)",
                                            }}
                                        >
                                            <Typography color="#00bfff" fontWeight="bold">
                                                🎯 MAIS PRECISO
                                            </Typography>
                                            <Typography variant="h5" fontWeight="bold" color={textColor} sx={{ mt: 1 }}>
                                                {[...dados].sort((a, b) => b.produtividade - a.produtividade)[0]?.nome}
                                            </Typography>
                                            <Typography color={subTextColor}>
                                                {[...dados].sort((a, b) => b.produtividade - a.produtividade)[0]?.produtividade}%
                                            </Typography>
                                        </Paper>

                                        {/* MAIOR XP */}
                                        <Paper
                                            sx={{
                                                p: 2.5,
                                                borderRadius: 4,
                                                bgcolor: "rgba(255,215,0,0.08)",
                                                border: "1px solid rgba(255,215,0,0.2)",
                                            }}
                                        >
                                            <Typography color="#FFD700" fontWeight="bold">
                                                ⚡ MAIOR XP
                                            </Typography>
                                            <Typography variant="h5" fontWeight="bold" color={textColor} sx={{ mt: 1 }}>
                                                {maisXP?.nome}
                                            </Typography>
                                            <Typography color={subTextColor}>
                                                {maisXP?.xp} XP
                                            </Typography>
                                        </Paper>

                                        {/* MAIS PESADOS */}
                                        <Paper
                                            sx={{
                                                p: 2.5,
                                                borderRadius: 4,
                                                bgcolor: "rgba(255,82,82,0.08)",
                                                border: "1px solid rgba(255,82,82,0.2)",
                                            }}
                                        >
                                            <Typography color="#ff5252" fontWeight="bold">
                                                🔥 MAIS ITENS PESADOS
                                            </Typography>
                                            <Typography variant="h5" fontWeight="bold" color={textColor} sx={{ mt: 1 }}>
                                                {maisPesados?.nome}
                                            </Typography>
                                            <Typography color={subTextColor}>
                                                {maisPesados?.pontosPesados} itens pesados
                                            </Typography>
                                        </Paper>

                                        {/* ALERTA */}
                                        <Paper
                                            sx={{
                                                p: 2.5,
                                                borderRadius: 4,
                                                bgcolor: totalErros < 10 ? "rgba(76,175,80,0.08)" : "rgba(255,0,0,0.06)",
                                                border: totalErros < 10
                                                    ? "1px solid rgba(76,175,80,0.2)"
                                                    : "1px solid rgba(255,0,0,0.15)",
                                            }}
                                        >
                                            <Typography color={totalErros < 10 ? "#4caf50" : "#ff5252"} fontWeight="bold">
                                                {totalErros < 10 ? "✅ OPERAÇÃO NORMAL" : "⚠️ ALERTA OPERACIONAL"}
                                            </Typography>
                                            <Typography color={textColor} sx={{ mt: 1 }}>
                                                {totalErros < 10
                                                    ? "Operação dentro da normalidade."
                                                    : "Equipe apresentou alto índice de divergências."}
                                            </Typography>
                                        </Paper>

                                    </Stack>

                                </Paper>

                            </Grid>

                        </Grid>

                        {/* PERFORMANCE + QUALIDADE */}
                        <Grid container spacing={3} justifyContent="center">

                            {/* PERFORMANCE OPERACIONAL */}
                            <Grid item xs={12} lg={6}>

                                <Paper
                                    sx={{
                                        ...glassStyle,
                                        p: 3,
                                        height: 600,
                                        display: "flex",
                                        flexDirection: "column",
                                    }}
                                >

                                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                                        <Box>
                                            <Typography variant="h5" fontWeight="bold" color={textColor}>
                                                📈 Performance operacional
                                            </Typography>
                                            <Typography color={subTextColor} variant="body2">
                                                Pontuação líquida da equipe
                                            </Typography>
                                        </Box>
                                        <Chip label="Tempo real" color="success" sx={{ ml: 2 }} />
                                    </Box>

                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart
                                                data={dados}
                                                margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
                                            >
                                                <CartesianGrid
                                                    strokeDasharray="3 3"
                                                    stroke={dark ? "rgba(255,255,255,0.08)" : "#ddd"}
                                                />
                                                <XAxis
                                                    dataKey="nome"
                                                    stroke={dark ? "#fff" : "#555"}
                                                    tick={{ fill: dark ? "#fff" : "#555" }}
                                                />
                                                <YAxis
                                                    stroke={dark ? "#fff" : "#555"}
                                                    tick={{ fill: dark ? "#fff" : "#555" }}
                                                />
                                                <Tooltip
                                                    contentStyle={{
                                                        background: dark ? "#111" : "#fff",
                                                        border: "1px solid rgba(255,255,255,0.1)",
                                                        borderRadius: 12,
                                                    }}
                                                />
                                                <Bar dataKey="pontosFinais" fill="#00ff99" radius={[10, 10, 0, 0]} />
                                                <Bar dataKey="descontos" fill="#ff5252" radius={[10, 10, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </Box>

                                </Paper>

                            </Grid>

                            {/* ===================================== */}
                            {/* QUALIDADE */}
                            {/* ===================================== */}
                            <Grid item xs={12} lg={6}>

                                <Paper
                                    sx={{
                                        ...glassStyle,
                                        p: 3,
                                        height: 600,
                                        display: "flex",
                                        flexDirection: "column",
                                    }}
                                >

                                    <Box
                                        sx={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            mb: 2,
                                            flexWrap: "wrap",
                                            gap: 2,
                                        }}
                                    >
                                        <Box>
                                            <Typography variant="h5" fontWeight="bold" color={textColor}>
                                                🎯 Índice de qualidade operacional
                                            </Typography>
                                            <Typography variant="body2" color={subTextColor}>
                                                Relação entre produtividade e divergências
                                            </Typography>
                                        </Box>

                                        <Chip
                                            label={`${(
                                                (totalPontos / (totalPontos + (totalErros * 15 || 1))) * 100
                                            ).toFixed(1)}% assertividade`}
                                            color="success"
                                            sx={{ fontWeight: "bold", fontSize: 14, height: 36 }}
                                        />
                                    </Box>

                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={[
                                                        { name: "Pontos positivos", value: totalPontos },
                                                        { name: "Pontos negativos", value: totalErros * 15 },
                                                    ]}
                                                    dataKey="value"
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={90}
                                                    outerRadius={170}
                                                    paddingAngle={5}
                                                    labelLine={false}
                                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                                >
                                                    <Cell fill="#00ff99" />
                                                    <Cell fill="#ff5252" />
                                                </Pie>
                                                <Tooltip
                                                    contentStyle={{
                                                        background: dark ? "#111" : "#fff",
                                                        border: "1px solid rgba(255,255,255,0.1)",
                                                        borderRadius: 12,
                                                        color: "#fff",
                                                    }}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </Box>

                                    {/* RESUMO */}
                                    <Box
                                        sx={{
                                            display: "grid",
                                            gridTemplateColumns: "repeat(2, 1fr)",
                                            gap: 2,
                                            mt: 1,
                                        }}
                                    >

                                        <Paper
                                            sx={{
                                                p: 2,
                                                borderRadius: 3,
                                                bgcolor: "rgba(0,255,120,0.08)",
                                                border: "1px solid rgba(0,255,120,0.15)",
                                            }}
                                        >
                                            <Typography color="#00ff99" fontWeight="bold">
                                                ✅ Acertos
                                            </Typography>
                                            <Typography variant="h5" fontWeight="bold" color={textColor}>
                                                {totalPontos}
                                            </Typography>
                                        </Paper>

                                        <Paper
                                            sx={{
                                                p: 2,
                                                borderRadius: 3,
                                                bgcolor: "rgba(255,0,0,0.08)",
                                                border: "1px solid rgba(255,0,0,0.15)",
                                            }}
                                        >
                                            <Typography color="#ff5252" fontWeight="bold">
                                                ❌ Erros
                                            </Typography>
                                            <Typography variant="h5" fontWeight="bold" color={textColor}>
                                                {totalErros * 15}
                                            </Typography>
                                        </Paper>

                                    </Box>

                                </Paper>

                            </Grid>

                        </Grid>

                    </Box>

                )
                }

                {/* ARENA */}
                {
                    tab === 2 && (

                        <Grid
                            container
                            spacing={3}
                        >

                            {dados.map((row, index) => {

                                const nivel =
                                    obterNivel(
                                        Number(
                                            row.xp
                                        ), row.itens,
                                        row.pontosFinais,
                                        row.produtividade,
                                        row.errosCaixa
                                    );

                                return (

                                    <Grid
                                        item
                                        xs={12}
                                        md={6}
                                        lg={4}
                                        key={row.conferente}
                                    >

                                        <motion.div
                                            whileHover={{
                                                scale: 1.03,
                                                y: -5,
                                            }}
                                            transition={{
                                                type: "spring",
                                                stiffness: 300,
                                            }}
                                        >
                                            <Paper
                                                sx={{
                                                    ...glassStyle,

                                                    position: "relative",

                                                    overflow: "visible",

                                                    pt: 10,
                                                    p: 3,

                                                    border: `1px solid ${nivel.cor}55`,

                                                    background: dark
                                                        ? `
                linear-gradient(
                    180deg,
                    ${nivel.cor}18 0%,
                    #111 40%
                )
            `
                                                        : "#fff",

                                                    boxShadow: `
            0 0 20px ${nivel.cor}22,
            0 0 50px ${nivel.cor}11
        `,
                                                }}
                                            >

                                                {/* GLOW TOPO */}
                                                <Box
                                                    sx={{
                                                        position: "absolute",

                                                        top: -70,

                                                        left: "50%",

                                                        transform: "translateX(-50%)",

                                                        width: 170,

                                                        height: 170,

                                                        borderRadius: "50%",

                                                        background: `${nivel.cor}55`,

                                                        filter: "blur(70px)",

                                                        zIndex: 1,
                                                    }}
                                                />

                                                {/* IMAGEM RANK */}
                                                <motion.div
                                                    animate={{
                                                        y: [0, -6, 0],
                                                    }}
                                                    transition={{
                                                        duration: 3,
                                                        repeat: Infinity,
                                                    }}
                                                    style={{
                                                        position: "absolute",
                                                        top: -75,
                                                        transform: "translateX(-50%)",
                                                        zIndex: 20,
                                                    }}
                                                >
                                                    <Box
                                                        component="img"
                                                        src={nivel.imagem}
                                                        alt={nivel.nome}
                                                        sx={{
                                                            width: 100,
                                                            height: 100,
                                                            objectFit: "contain",

                                                            filter: `
                    drop-shadow(0 0 12px ${nivel.cor})
                    drop-shadow(0 0 30px ${nivel.cor})
                `,
                                                        }}
                                                    />

                                                    <Typography
                                                        sx={{
                                                            textAlign: "center",

                                                            mt: -1,

                                                            fontWeight: 900,

                                                            letterSpacing: 2,

                                                            fontSize: 18,

                                                            color: nivel.cor,

                                                            textShadow: `
                    0 0 10px ${nivel.cor},
                    0 0 20px ${nivel.cor}
                `,
                                                        }}
                                                    >
                                                        {nivel.nome}
                                                    </Typography>
                                                </motion.div>

                                                {/* CONTEÚDO */}
                                                <Box
                                                    sx={{
                                                        mt: 5,
                                                    }}
                                                >

                                                    <Box
                                                        sx={{
                                                            display: "flex",
                                                            justifyContent: "space-between",
                                                            alignItems: "center",
                                                        }}
                                                    >

                                                        <Avatar
                                                            sx={{
                                                                width: 80,
                                                                height: 80,

                                                                bgcolor: "#111",

                                                                border: `3px solid ${nivel.cor}`,

                                                                color: "#fff",

                                                                fontWeight: "bold",

                                                                fontSize: 28,

                                                                boxShadow: `
                        0 0 15px ${nivel.cor}
                    `,
                                                            }}
                                                        >
                                                            {index + 1}
                                                        </Avatar>

                                                        <Chip
                                                            icon={<MilitaryTechIcon />}
                                                            label={`${row.xp} XP`}
                                                            sx={{
                                                                ml: 2,
                                                                bgcolor: `${nivel.cor}22`,
                                                                color: nivel.cor,
                                                                border: `1px solid ${nivel.cor}55`,
                                                                fontWeight: "bold",
                                                            }}
                                                        />

                                                    </Box>

                                                    <Typography
                                                        variant="h5"
                                                        fontWeight="bold"
                                                        color={textColor}
                                                        sx={{
                                                            mt: 2,
                                                        }}
                                                    >
                                                        {row.nome}
                                                    </Typography>

                                                    <Divider
                                                        sx={{
                                                            my: 2,
                                                            borderColor: `${nivel.cor}33`,
                                                        }}
                                                    />

                                                    <Stack
                                                        spacing={1}
                                                    >

                                                        <Chip
                                                            label={`🏆 ${row.pontosFinais} pontos`}
                                                            color="warning"
                                                            sx={{ color: 'primary.branco' }}
                                                        />

                                                        <Chip
                                                            label={`📦 ${row.itens} itens`}
                                                            sx={{ color: 'primary.branco' }}
                                                        />

                                                        <Chip
                                                            label={`⚡ ${row.produtividade}% precisão`}
                                                            color="success"
                                                            sx={{ color: 'primary.branco' }}
                                                        />

                                                        <Chip
                                                            label={`🔥 ${row.pontosPesados} itens pesados`}
                                                            color="error"
                                                            sx={{ color: 'primary.branco' }}
                                                        />

                                                    </Stack>

                                                    {/* ACHIEVEMENTS */}
                                                    <Box
                                                        sx={{
                                                            mt: 3,
                                                        }}
                                                    >

                                                        <Typography
                                                            fontWeight="bold"
                                                            color={textColor}
                                                            sx={{
                                                                mb: 1,
                                                            }}
                                                        >
                                                            🎖️ Conquistas
                                                        </Typography>

                                                        <Stack
                                                            spacing={1}
                                                        >

                                                            {row.itens >= 1000 && row.itens <= 2999 && (
                                                                <Chip
                                                                    label="🥉 1000 itens"
                                                                    color="warning"
                                                                    sx={{ color: 'primary.branco' }}
                                                                />
                                                            )}

                                                            {row.itens >= 3000 && row.itens <= 4999 && (
                                                                <Chip
                                                                    label="🥈 3000 itens"
                                                                    color="warning"
                                                                    sx={{ color: 'primary.branco' }}
                                                                />
                                                            )}

                                                            {row.itens >= 5000 && row.itens <= 9999 && (
                                                                <Chip
                                                                    label="🥇 5000 itens"
                                                                    color="warning"
                                                                    sx={{ color: 'primary.branco' }}
                                                                />
                                                            )}

                                                            {row.itens >= 10000 && (
                                                                <Chip
                                                                    label="🏆 10000 itens"
                                                                    color="warning"
                                                                    sx={{ color: 'primary.branco' }}
                                                                />
                                                            )}

                                                            {row.errosCaixa === 0 && (
                                                                <Chip
                                                                    label="🐐 G.O.A.T"
                                                                    color="success"
                                                                    sx={{ color: 'primary.branco' }}
                                                                />
                                                            )}

                                                            {row.pontosFinais >= 1000 && row.pontosFinais <= 3000 && (
                                                                <Chip
                                                                    label="🔥 1000 pontos"
                                                                    color="error"
                                                                    sx={{ color: 'primary.branco' }}
                                                                />
                                                            )}

                                                            {row.pontosFinais >= 5000 && row.pontosFinais <= 9999 && (
                                                                <Chip
                                                                    label="🚀 5000 pontos"
                                                                    color="error"
                                                                    sx={{ color: 'primary.branco' }}
                                                                />
                                                            )}

                                                            {row.pontosFinais >= 10000 && row.pontosFinais <= 14999 && (
                                                                <Chip
                                                                    label="🌟 10000 pontos"
                                                                    color="error"
                                                                    sx={{ color: 'primary.branco' }}
                                                                />
                                                            )}

                                                            {row.pontosFinais >= 15000 && row.pontosFinais <= 29999 && (
                                                                <Chip
                                                                    label="👑 15000 pontos"
                                                                    color="error"
                                                                    sx={{ color: 'primary.branco' }}
                                                                />
                                                            )}

                                                            {row.pontosFinais >= 30000 && (
                                                                <Chip
                                                                    label="🌩️ Zeus"
                                                                    color="info"
                                                                    sx={{ color: 'primary.branco' }}
                                                                />
                                                            )}

                                                            {row.produtividade >= 98 && (
                                                                <Chip
                                                                    label="🎯 Precisão absurda"
                                                                    color="info"
                                                                    sx={{ color: 'primary.branco' }}
                                                                />
                                                            )}

                                                            {row.pontosPesados >= 500 && (
                                                                <Chip
                                                                    label="🚜 Trator humano"
                                                                    sx={{
                                                                        bgcolor: "#1ac723",
                                                                        color: "#fff",
                                                                        fontWeight: "bold",
                                                                    }}
                                                                />
                                                            )}

                                                            {row.errosCaixa <= 5 && row.produtividade > 0 && (
                                                                <Chip
                                                                    label="🏹 Sem vacilo"
                                                                    sx={{
                                                                        bgcolor: "#20c766",
                                                                        color: "#fff",
                                                                        fontWeight: "bold",
                                                                    }}
                                                                />
                                                            )}

                                                            {row.pontosFinais >= 30000 &&
                                                                row.pontosPesados >= 1000 &&
                                                                row.errosCaixa <= 3 &&
                                                                row.produtividade >= 100 && (
                                                                    <Chip
                                                                        label="🔮 MÍSTICO"
                                                                        sx={{
                                                                            background:
                                                                                "linear-gradient(45deg, #4a148c, #7b1fa2, #ba68c8)",
                                                                            color: "#fff",
                                                                            fontWeight: "bold",
                                                                            border: "2px solid #d1a3ff",
                                                                            boxShadow: "0 0 18px rgba(186,104,200,0.9)",
                                                                            animation: "pulse 1.5s infinite",
                                                                            textShadow: "0 0 8px rgba(255,255,255,0.6)",
                                                                        }}
                                                                    />
                                                                )}

                                                        </Stack>

                                                    </Box>
                                                </Box>
                                            </Paper>

                                        </motion.div>

                                    </Grid>

                                );

                            })}

                        </Grid>

                    )
                }

                {/* ===================================== */}
                {/* MODAL */}
                {/* ===================================== */}
                <Dialog
                    open={openDetalhes}
                    onClose={() =>
                        setOpenDetalhes(false)
                    }
                    maxWidth="lg"
                    fullWidth
                    PaperProps={{
                        sx: {
                            bgcolor:
                                dark
                                    ? "#111"
                                    : "#fff",

                            color:
                                dark
                                    ? "#fff"
                                    : "#000",

                            borderRadius: 4,
                        },
                    }}
                    sx={{ zoom: '0.9' }}
                >

                    <DialogTitle>

                        📦 Itens conferidos — {nomeSelecionado}

                        <IconButton
                            onClick={() =>
                                setOpenDetalhes(false)
                            }
                            sx={{
                                position: "absolute",
                                right: 10,
                                top: 10,
                                color: "#fff",
                            }}
                        >
                            <CloseIcon />
                        </IconButton>

                    </DialogTitle>

                    <DialogContent dividers>

                        <Paper
                            sx={{
                                p: 3,
                                borderRadius: 4,
                                mb: 3,
                                bgcolor: dark ? "#1b1b1b" : "#f5f5f5",
                            }}
                        >

                            <Typography
                                variant="h6"
                                fontWeight="bold"
                                color={textColor}
                                sx={{ mb: 3 }}
                            >
                                📊 Explicação da pontuação
                            </Typography>

                            <Grid container spacing={2}>

                                {/* LADO ESQUERDO */}
                                <Grid item xs={12} md={4}>

                                    {/* Divergência de caixas */}
                                    <Typography
                                        color="error.main"
                                        sx={{ fontWeight: "bold" }}
                                    >
                                        Divergência de caixa = -30 pts
                                    </Typography>

                                </Grid>

                                {/* LADO DIREITO */}
                                <Grid item xs={12} md={8}>

                                    <Typography
                                        variant="subtitle1"
                                        fontWeight="bold"
                                        color={textColor}
                                        sx={{ mb: 2 }}
                                    >
                                        Categorias de itens
                                    </Typography>

                                    <Grid container spacing={2}>

                                        {/* PESADOS */}
                                        <Grid item xs={12} md={6}>
                                            <Box
                                                sx={{
                                                    p: 2,
                                                    borderRadius: 3,
                                                    bgcolor: dark ? "#262626" : "#fff",
                                                    border: "1px solid",
                                                    borderColor: dark ? "#333" : "#ddd",
                                                    height: "100%",
                                                }}
                                            >
                                                <Typography
                                                    fontWeight="bold"
                                                    color="#ff9800"
                                                    sx={{ mb: 1 }}
                                                >
                                                    🏋️ Pesados — 10 pts
                                                </Typography>

                                                <Typography variant="body2" color={textColor}>
                                                    Balança, Bandeja, Braço oscilante,
                                                    Semi eixo, Deslizante, Amortecedor,
                                                    Comando de válvula, Caixa de direção,
                                                    Homocinética completa, Kit embreagem,
                                                    Radiador, Disco, Tampa de válvula, Carter
                                                </Typography>
                                            </Box>
                                        </Grid>

                                        {/* MÉDIO/PESADO */}
                                        <Grid item xs={12} md={6}>
                                            <Box
                                                sx={{
                                                    p: 2,
                                                    borderRadius: 3,
                                                    bgcolor: dark ? "#262626" : "#fff",
                                                    border: "1px solid",
                                                    borderColor: dark ? "#333" : "#ddd",
                                                    height: "100%",
                                                }}
                                            >
                                                <Typography
                                                    fontWeight="bold"
                                                    color="#ab47bc"
                                                    sx={{ mb: 1 }}
                                                >
                                                    ⚙️ Médio/Pesado — 7 pts
                                                </Typography>

                                                <Typography variant="body2" color={textColor}>
                                                    Junta homocinética, Tulipa com trizeta,
                                                    Jogo de Pistão, Pastilha de freio,
                                                    Sapata de freio, Lona de freio
                                                </Typography>
                                            </Box>
                                        </Grid>

                                        {/* MÉDIOS */}
                                        <Grid item xs={12}>
                                            <Box
                                                sx={{
                                                    p: 2,
                                                    borderRadius: 3,
                                                    bgcolor: dark ? "#262626" : "#fff",
                                                    border: "1px solid",
                                                    borderColor: dark ? "#333" : "#ddd",
                                                }}
                                            >
                                                <Typography
                                                    fontWeight="bold"
                                                    color="#2196f3"
                                                    sx={{ mb: 1 }}
                                                >
                                                    📦 Médios — 5 pts
                                                </Typography>

                                                <Typography variant="body2" color={textColor}>
                                                    Mangueira, Cilindro, Coxim, Pivô,
                                                    Cabo de vela, Cabo de embreagem, Cabo de freio,
                                                    Junta de cabeçote, Junta de tampa de válvula
                                                    Bomba de óleo, Bomba de água
                                                    Carcaça de válvula termostática, Antichama,
                                                    Tubo, Reservatório, Kit correia,
                                                    Kit parafuso,
                                                    Terminal de direção, Barra axial
                                                </Typography>
                                            </Box>
                                        </Grid>

                                        {/* LEVES */}
                                        <Grid item xs={12}>
                                            <Box
                                                sx={{
                                                    p: 2,
                                                    borderRadius: 3,
                                                    bgcolor: dark ? "#262626" : "#fff",
                                                    border: "1px solid",
                                                    borderColor: dark ? "#333" : "#ddd",
                                                }}
                                            >
                                                <Typography
                                                    fontWeight="bold"
                                                    color="#4caf50"
                                                    sx={{ mb: 1 }}
                                                >
                                                    🍃 Leves — 2 pts
                                                </Typography>

                                                <Typography variant="body2" color={textColor}>
                                                    Todos os itens que não entram
                                                    nas categorias acima.
                                                </Typography>
                                            </Box>

                                        </Grid>
                                    </Grid>

                                </Grid>

                            </Grid>

                        </Paper>

                        <TableContainer
                            component={Paper}
                            sx={{
                                borderRadius: 4,
                                bgcolor:
                                    dark
                                        ? "#1b1b1b"
                                        : "#fff",
                            }}
                        >

                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ color: "#fff" }}>
                                            Item
                                        </TableCell>

                                        <TableCell sx={{ color: "#fff" }}>
                                            Quantidade
                                        </TableCell>

                                        <TableCell sx={{ color: "#fff" }}>
                                            Regra
                                        </TableCell>

                                        <TableCell sx={{ color: "#fff" }}>
                                            Resultado
                                        </TableCell>
                                    </TableRow>
                                </TableHead>

                                <TableBody>

                                    {detalhesSelecionados.map(
                                        (item, index) => (

                                            <TableRow
                                                key={index}
                                            >
                                                <TableCell>
                                                    <Typography
                                                        fontWeight="bold"
                                                        color={textColor}
                                                    >
                                                        {item.codigo}
                                                    </Typography>

                                                    <Typography
                                                        variant="caption"
                                                        color={subTextColor}
                                                    >
                                                        {item.tipo}
                                                    </Typography>

                                                    <Typography
                                                        fontWeight="bold"
                                                        color={textColor}
                                                    >
                                                        {item.localizacao}
                                                    </Typography>

                                                </TableCell>

                                                <TableCell>
                                                    <Typography color={textColor}>
                                                        {item.quantidade}x
                                                    </Typography>
                                                </TableCell>

                                                <TableCell >
                                                    {!item.erro ? (
                                                        <Typography color={textColor}>

                                                            {item.quantidade}
                                                            {" x "}
                                                            {item.pontosUnitario}
                                                            {" pts"}
                                                        </Typography>
                                                    ) : (
                                                        <Typography color="error.main">
                                                            Caixa {item.caixaItem}
                                                        </Typography>
                                                    )}
                                                </TableCell>

                                                <TableCell>
                                                    <Chip
                                                        label={
                                                            item.erro
                                                                ? "-30 pts"
                                                                : `+${item.pontosTotal} pts`
                                                        }
                                                        color={
                                                            item.erro
                                                                ? "error"
                                                                : "success"
                                                        }
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        )
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </DialogContent>
                </Dialog>

                <Dialog
                    open={openRanks}
                    onClose={() => setOpenRanks(false)}
                    maxWidth="lg"
                    fullWidth
                    PaperProps={{
                        sx: {
                            background: "#0a0a0a",
                            border: "1px solid #333",
                            borderRadius: 4,
                            overflow: "hidden",
                        },
                    }}
                    sx={{ zoom: '0.9' }}
                >

                    <DialogTitle
                        sx={{
                            color: "#fff",
                            fontWeight: "bold",
                            fontSize: 32,
                            textAlign: "center",
                            background:
                                "linear-gradient(90deg,#111,#1a1a1a,#111)",
                        }}
                    >
                        🏆 SISTEMA DE RANKS
                    </DialogTitle>

                    <DialogContent
                        sx={{
                            p: 0,
                            bgcolor: "#0a0a0a",
                        }}
                    >

                        {/* BANNER */}
                        <Box
                            component="img"
                            src="/ranks/banner.png"
                            onClick={() =>
                                setImagemFullscreen(true)
                            }
                            sx={{
                                width: "100%",
                                borderRadius: 3,
                                cursor: "zoom-in",

                                transition: "0.25s",

                                "&:hover": {
                                    transform: "scale(1.02)",
                                },
                            }}
                        />

                        {/* EXPLICAÇÃO */}
                        <Box sx={{ p: 4 }}>

                            <Typography
                                variant="h4"
                                fontWeight="bold"
                                color="#fff"
                                mb={2}
                            >
                                COMO SUBIR DE RANK
                            </Typography>

                            <Typography
                                sx={{
                                    color: "#ccc",
                                    fontSize: 18,
                                    lineHeight: 1.8,
                                }}
                            >
                                Você ganha XP conferindo itens,
                                mantendo alta precisão e evitando
                                erros de caixa.
                            </Typography>

                            <Typography
                                sx={{
                                    color: "#ccc",
                                    fontSize: 18,
                                    lineHeight: 1.8,
                                    mt: 2,
                                }}
                            >
                                Quanto maior a dificuldade do item,
                                mais XP você recebe.
                            </Typography>

                        </Box>

                        {/* FORMAS DE GANHAR XP */}
                        <Box sx={{ px: 4, pb: 4 }}>

                            <Typography
                                variant="h5"
                                fontWeight="bold"
                                color="#fff"
                                mb={3}
                            >
                                ⚡ COMO GANHAR XP
                            </Typography>

                            <Grid container spacing={2}>

                                <Grid item xs={12} md={6}>
                                    <Paper
                                        sx={{
                                            p: 3,
                                            bgcolor: "#111",
                                            border:
                                                "1px solid #00ff88",
                                        }}
                                    >
                                        <Typography
                                            color="#00ff88"
                                            fontWeight="bold"
                                            mb={1}
                                        >
                                            📦 Conferir itens
                                        </Typography>

                                        <Typography color="#ccc">
                                            Cada item conferido gera XP.
                                        </Typography>
                                    </Paper>
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <Paper
                                        sx={{
                                            p: 3,
                                            bgcolor: "#111",
                                            border:
                                                "1px solid #ffcc00",
                                        }}
                                    >
                                        <Typography
                                            color="#ffcc00"
                                            fontWeight="bold"
                                            mb={1}
                                        >
                                            🔥 Itens pesados
                                        </Typography>

                                        <Typography color="#ccc">
                                            Itens complexos dão muito mais XP.
                                        </Typography>
                                    </Paper>
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <Paper
                                        sx={{
                                            p: 3,
                                            bgcolor: "#111",
                                            border:
                                                "1px solid #00d5ff",
                                        }}
                                    >
                                        <Typography
                                            color="#00d5ff"
                                            fontWeight="bold"
                                            mb={1}
                                        >
                                            🎯 Precisão
                                        </Typography>

                                        <Typography color="#ccc">
                                            Alta produtividade aumenta sua evolução.
                                        </Typography>
                                    </Paper>
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <Paper
                                        sx={{
                                            p: 3,
                                            bgcolor: "#111",
                                            border:
                                                "1px solid #ff4444",
                                        }}
                                    >
                                        <Typography
                                            color="#ff4444"
                                            fontWeight="bold"
                                            mb={1}
                                        >
                                            ❌ Erros reduzem XP
                                        </Typography>

                                        <Typography color="#ccc">
                                            Divergências diminuem pontuação final.
                                        </Typography>
                                    </Paper>
                                </Grid>
                            </Grid>
                        </Box>

                        {/* RANKS */}
                        <Box sx={{ px: 4, pb: 5 }}>
                            <Typography
                                variant="h5"
                                fontWeight="bold"
                                color="#fff"
                                mb={3}
                            >
                                🏅 PROGRESSÃO DE RANKS
                            </Typography>

                            <Stack spacing={2}>
                                <Chip
                                    label="🥉 BRONZE — 0 XP"
                                    sx={{
                                        bgcolor: "#d37625",
                                        color: "#fff",
                                        fontWeight: "bold",
                                    }}
                                />
                                <Chip
                                    label="🥈 PRATA — 30.000 XP"
                                    sx={{
                                        bgcolor: "#9c9c9c",
                                        color: "#fff",
                                        fontWeight: "bold",
                                    }}
                                />
                                <Chip
                                    label="🥇 OURO — 70.000 XP"
                                    sx={{
                                        bgcolor: "#dfac06",
                                        color: "#fff",
                                        fontWeight: "bold",
                                    }}
                                />
                                <Chip
                                    label="✦ PLATINA — 100.000 XP"
                                    sx={{
                                        bgcolor: "#73d7e4",
                                        color: "#fff",
                                        fontWeight: "bold",
                                    }}
                                />
                                <Chip
                                    label="💎 DIAMANTE — 150.000 XP"
                                    sx={{
                                        bgcolor: "#00bfff",
                                        color: "#fff",
                                        fontWeight: "bold",
                                    }}
                                />
                                <Chip
                                    label="❇️ ESMERALDA — 300.000 XP"
                                    sx={{
                                        bgcolor: "#00b140",
                                        color: "#fff",
                                        fontWeight: "bold",
                                    }}
                                />
                                <Chip
                                    label="👑 MESTRE — 500.000 XP"
                                    sx={{
                                        bgcolor: "#fa1c1c",
                                        color: "#fff",
                                        fontWeight: "bold",
                                    }}
                                />
                                <Chip
                                    label="🦅 LENDÁRIO — 750.000 XP"
                                    sx={{
                                        bgcolor: "#9129ff",
                                        color: "#fff",
                                        fontWeight: "bold",
                                    }}
                                />
                                <Chip
                                    label="🌌 TRANSCENDENTAL — 1.000.000 XP"
                                    sx={{
                                        background:
                                            "linear-gradient(135deg, #ffd900 0%, #00b8ff 40%, #7740f7 70%, #002a94 100%)",
                                        color: "#fff",
                                        fontWeight: 700,
                                        textShadow: "0 0 4px rgba(0,0,0,.4)",
                                    }}
                                />
                            </Stack>
                        </Box>
                    </DialogContent>
                </Dialog>

                <Dialog
                    open={imagemFullscreen}
                    onClose={() =>
                        setImagemFullscreen(false)
                    }
                    fullScreen
                    PaperProps={{
                        sx: {
                            bgcolor: "#000",
                        },
                    }}
                >

                    {/* BOTÃO FECHAR */}
                    <IconButton
                        onClick={() =>
                            setImagemFullscreen(false)
                        }
                        sx={{
                            position: "absolute",
                            top: 20,
                            right: 20,
                            zIndex: 10,

                            bgcolor: "#00000099",
                            color: "#fff",

                            "&:hover": {
                                bgcolor: "#222",
                            },
                        }}
                    >
                        <CloseIcon />
                    </IconButton>

                    {/* IMAGEM */}
                    <Box
                        sx={{
                            width: "100%",
                            height: "100vh",

                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",

                            p: 4,
                        }}
                    >
                        <Box
                            component="img"
                            src="/ranks/banner.png"
                            sx={{
                                maxWidth: "100%",
                                maxHeight: "100%",
                                objectFit: "contain",
                            }}
                        />
                    </Box>
                </Dialog>
            </Container >
        )
    );
}