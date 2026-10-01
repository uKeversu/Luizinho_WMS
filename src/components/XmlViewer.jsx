import { Fragment, useEffect, useMemo, useState } from "react";

import {
    Dialog,
    DialogContent,
    Box,
    Typography,
    IconButton,
    Button,
    Divider,
    Tabs,
    Tab,
    Chip,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    TableSortLabel,
    Tooltip,
    CircularProgress,
    Snackbar,
    Alert,
    Paper,
    Stack,
    TextField,
    InputAdornment,
    Collapse,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText
} from "@mui/material";

import { useTheme, alpha } from "@mui/material/styles";

import CloseIcon from "@mui/icons-material/Close";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import PrintIcon from "@mui/icons-material/Print";
import CodeIcon from "@mui/icons-material/Code";
import DescriptionIcon from "@mui/icons-material/Description";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import SearchIcon from "@mui/icons-material/Search";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import PercentOutlinedIcon from "@mui/icons-material/PercentOutlined";
import EventNoteOutlinedIcon from "@mui/icons-material/EventNoteOutlined";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import TableChartOutlinedIcon from "@mui/icons-material/TableChartOutlined";
import DataObjectIcon from "@mui/icons-material/DataObject";
import NotesOutlinedIcon from "@mui/icons-material/NotesOutlined";

/* ==================================================================
 * TABELAS DE DOMÍNIO DA NF-e
 * ================================================================== */

const MAPA_PAGAMENTO = {
    "01": "Dinheiro",
    "02": "Cheque",
    "03": "Cartão de crédito",
    "04": "Cartão de débito",
    "05": "Crédito da loja",
    "10": "Vale alimentação",
    "11": "Vale refeição",
    "12": "Vale presente",
    "13": "Vale combustível",
    "14": "Duplicata mercantil",
    "15": "Boleto bancário",
    "16": "Depósito bancário",
    "17": "Pix dinâmico",
    "18": "Transferência bancária / carteira digital",
    "19": "Fidelidade / cashback",
    "20": "Pix estático",
    "21": "Crédito em loja",
    "22": "Pagamento eletrônico não informado",
    "90": "Sem pagamento",
    "99": "Outros"
};

const MAPA_BANDEIRA = {
    "01": "Visa",
    "02": "Mastercard",
    "03": "American Express",
    "04": "Sorocred",
    "05": "Diners Club",
    "06": "Elo",
    "07": "Hipercard",
    "08": "Aura",
    "09": "Cabal",
    "99": "Outros"
};

const MAPA_ORIGEM = {
    "0": "Nacional",
    "1": "Estrangeira - importação direta",
    "2": "Estrangeira - mercado interno",
    "3": "Nacional com mais de 40% de conteúdo importado",
    "4": "Nacional com processos produtivos básicos",
    "5": "Nacional com até 40% de conteúdo importado",
    "6": "Estrangeira - importação direta sem similar",
    "7": "Estrangeira - mercado interno sem similar",
    "8": "Nacional com mais de 70% de conteúdo importado"
};

const MAPA_CST_ICMS = {
    "00": "Tributada integralmente",
    "10": "Tributada com cobrança por ST",
    "20": "Com redução de base de cálculo",
    "30": "Isenta ou não tributada com cobrança por ST",
    "40": "Isenta",
    "41": "Não tributada",
    "50": "Suspensão",
    "51": "Diferimento",
    "60": "ICMS cobrado anteriormente por ST",
    "70": "Com redução de base e cobrança por ST",
    "90": "Outras"
};

const MAPA_CSOSN = {
    "101": "Tributada pelo Simples com permissão de crédito",
    "102": "Tributada pelo Simples sem permissão de crédito",
    "103": "Isenção do ICMS para faixa de receita bruta",
    "201": "Simples com permissão de crédito e cobrança por ST",
    "202": "Simples sem permissão de crédito e cobrança por ST",
    "203": "Isenção do ICMS com cobrança por ST",
    "300": "Imune",
    "400": "Não tributada pelo Simples Nacional",
    "500": "ICMS cobrado anteriormente por ST ou antecipação",
    "900": "Outros"
};

const MAPA_CST_IPI = {
    "00": "Entrada com recuperação de crédito",
    "01": "Entrada tributada com alíquota zero",
    "02": "Entrada isenta",
    "03": "Entrada não tributada",
    "04": "Entrada imune",
    "05": "Entrada com suspensão",
    "49": "Outras entradas",
    "50": "Saída tributada",
    "51": "Saída tributada com alíquota zero",
    "52": "Saída isenta",
    "53": "Saída não tributada",
    "54": "Saída imune",
    "55": "Saída com suspensão",
    "99": "Outras saídas"
};

const MAPA_CST_PISCOFINS = {
    "01": "Operação tributável com alíquota básica",
    "02": "Operação tributável com alíquota diferenciada",
    "03": "Tributável por unidade de medida",
    "04": "Monofásica com alíquota zero",
    "05": "Substituição tributária",
    "06": "Alíquota zero",
    "07": "Isenta da contribuição",
    "08": "Sem incidência da contribuição",
    "09": "Com suspensão da contribuição",
    "49": "Outras operações de saída",
    "99": "Outras operações"
};

const MAPA_MODALIDADE_FRETE = {
    "0": "Por conta do emitente (CIF)",
    "1": "Por conta do destinatário (FOB)",
    "2": "Por conta de terceiros",
    "3": "Transporte próprio por conta do remetente",
    "4": "Transporte próprio por conta do destinatário",
    "9": "Sem transporte"
};

const MAPA_FINALIDADE = {
    "1": "Normal",
    "2": "Complementar",
    "3": "Ajuste",
    "4": "Devolução de mercadoria"
};

const MAPA_PRESENCA = {
    "0": "Não se aplica",
    "1": "Operação presencial",
    "2": "Internet",
    "3": "Teleatendimento",
    "4": "Entrega a domicílio (NFC-e)",
    "5": "Presencial fora do estabelecimento",
    "9": "Outros"
};

const MAPA_EMISSAO = {
    "1": "Normal",
    "2": "Contingência FS-IA",
    "3": "Contingência SCAN",
    "4": "Contingência EPEC",
    "5": "Contingência FS-DA",
    "6": "Contingência SVC-AN",
    "7": "Contingência SVC-RS",
    "9": "Contingência offline (NFC-e)"
};

const MAPA_CRT = {
    "1": "Simples Nacional",
    "2": "Simples Nacional - excesso de sublimite",
    "3": "Regime normal",
    "4": "MEI"
};

const MAPA_DESTINO = {
    "1": "Operação interna",
    "2": "Operação interestadual",
    "3": "Operação com exterior"
};

const MAPA_EVENTO = {
    "110110": "Carta de correção",
    "110111": "Cancelamento",
    "110112": "Cancelamento por substituição",
    "110140": "EPEC",
    "111500": "Pedido de prorrogação",
    "210200": "Confirmação da operação",
    "210210": "Ciência da operação",
    "210220": "Desconhecimento da operação",
    "210240": "Operação não realizada"
};

const MAPA_UF = {
    "11": "RO", "12": "AC", "13": "AM", "14": "RR", "15": "PA", "16": "AP",
    "17": "TO", "21": "MA", "22": "PI", "23": "CE", "24": "RN", "25": "PB",
    "26": "PE", "27": "AL", "28": "SE", "29": "BA", "31": "MG", "32": "ES",
    "33": "RJ", "35": "SP", "41": "PR", "42": "SC", "43": "RS", "50": "MS",
    "51": "MT", "52": "GO", "53": "DF"
};

const MESES = [
    "jan", "fev", "mar", "abr", "mai", "jun",
    "jul", "ago", "set", "out", "nov", "dez"
];

/* ==================================================================
 * HELPERS DE LEITURA DO XML
 * ================================================================== */

const filho = (pai, tag) => pai?.getElementsByTagName(tag)?.[0] || null;

const txt = (pai, tag) =>
    pai?.getElementsByTagName(tag)?.[0]?.textContent?.trim() || "";

const lista = (pai, tag) =>
    pai ? Array.from(pai.getElementsByTagName(tag)) : [];

const num = (valor) => {
    const convertido = Number(String(valor ?? "").replace(",", "."));
    return Number.isNaN(convertido) ? 0 : convertido;
};

const rotulo = (mapa, chave, prefixo = true) => {
    if (!chave) return "";
    const descricao = mapa[chave];
    if (!descricao) return chave;
    return prefixo ? `${chave} - ${descricao}` : descricao;
};

/* Valida o dígito verificador da chave de acesso (módulo 11). */
const chaveValida = (chave) => {
    const digitos = String(chave || "").replace(/\D/g, "");
    if (digitos.length !== 44) return false;

    const pesos = [2, 3, 4, 5, 6, 7, 8, 9];
    let soma = 0;
    let indice = 0;

    for (let posicao = 42; posicao >= 0; posicao--) {
        soma += Number(digitos[posicao]) * pesos[indice % 8];
        indice++;
    }

    const resto = soma % 11;
    const dv = resto === 0 || resto === 1 ? 0 : 11 - resto;

    return dv === Number(digitos[43]);
};

/* Lê os dados da chave: UF, competência, CNPJ, modelo, série, número. */
const lerChave = (chave) => {
    const d = String(chave || "").replace(/\D/g, "");
    if (d.length !== 44) return null;

    const mes = Number(d.substring(4, 6));

    return {
        uf: MAPA_UF[d.substring(0, 2)] || d.substring(0, 2),
        competencia: `${MESES[mes - 1] || "??"}/20${d.substring(2, 4)}`,
        cnpj: d.substring(6, 20),
        modelo: d.substring(20, 22),
        serie: String(Number(d.substring(22, 25))),
        numero: String(Number(d.substring(25, 34))),
        emissao: d.substring(34, 35),
        codigo: d.substring(35, 43),
        dv: d.substring(43)
    };
};

/* ==================================================================
 * PARSER DA NF-e
 * ================================================================== */

const lerEndereco = (no) => ({
    logradouro: txt(no, "xLgr"),
    numero: txt(no, "nro"),
    complemento: txt(no, "xCpl"),
    bairro: txt(no, "xBairro"),
    codigoMunicipio: txt(no, "cMun"),
    cidade: txt(no, "xMun"),
    uf: txt(no, "UF"),
    cep: txt(no, "CEP"),
    pais: txt(no, "xPais"),
    fone: txt(no, "fone")
});

const lerImpostoItem = (imposto) => {
    const raizICMS = filho(imposto, "ICMS");
    const grupoICMS = raizICMS ? raizICMS.children?.[0] : null;

    const raizIPI = filho(imposto, "IPI");
    const grupoIPI =
        filho(raizIPI, "IPITrib") || filho(raizIPI, "IPINT") || raizIPI;

    const raizPIS = filho(imposto, "PIS");
    const grupoPIS = raizPIS ? raizPIS.children?.[0] : null;

    const raizCOFINS = filho(imposto, "COFINS");
    const grupoCOFINS = raizCOFINS ? raizCOFINS.children?.[0] : null;

    const partilha = filho(imposto, "ICMSUFDest");

    return {
        totalTributos: txt(imposto, "vTotTrib"),

        icms: {
            grupo: grupoICMS?.tagName || "",
            origem: txt(grupoICMS, "orig"),
            cst: txt(grupoICMS, "CST"),
            csosn: txt(grupoICMS, "CSOSN"),
            modalidade: txt(grupoICMS, "modBC"),
            reducao: txt(grupoICMS, "pRedBC"),
            base: txt(grupoICMS, "vBC"),
            aliquota: txt(grupoICMS, "pICMS"),
            valor: txt(grupoICMS, "vICMS"),
            baseST: txt(grupoICMS, "vBCST"),
            mva: txt(grupoICMS, "pMVAST"),
            aliquotaST: txt(grupoICMS, "pICMSST"),
            valorST: txt(grupoICMS, "vICMSST"),
            credito: txt(grupoICMS, "pCredSN"),
            valorCredito: txt(grupoICMS, "vCredICMSSN"),
            fcp: txt(grupoICMS, "vFCP"),
            fcpST: txt(grupoICMS, "vFCPST"),
            desonerado: txt(grupoICMS, "vICMSDeson")
        },

        ipi: {
            cst: txt(grupoIPI, "CST"),
            base: txt(grupoIPI, "vBC"),
            aliquota: txt(grupoIPI, "pIPI"),
            valor: txt(grupoIPI, "vIPI"),
            enquadramento: txt(raizIPI, "cEnq")
        },

        pis: {
            cst: txt(grupoPIS, "CST"),
            base: txt(grupoPIS, "vBC"),
            aliquota: txt(grupoPIS, "pPIS"),
            valor: txt(grupoPIS, "vPIS")
        },

        cofins: {
            cst: txt(grupoCOFINS, "CST"),
            base: txt(grupoCOFINS, "vBC"),
            aliquota: txt(grupoCOFINS, "pCOFINS"),
            valor: txt(grupoCOFINS, "vCOFINS")
        },

        partilha: partilha
            ? {
                baseDestino: txt(partilha, "vBCUFDest"),
                fcp: txt(partilha, "vFCPUFDest"),
                icmsDestino: txt(partilha, "vICMSUFDest"),
                icmsRemetente: txt(partilha, "vICMSUFRemet")
            }
            : null
    };
};

const interpretarNFe = (xml, nota) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, "application/xml");

    if (doc.querySelector("parsererror")) {
        throw new Error("XML inválido");
    }

    const infNFe = filho(doc, "infNFe");
    const ide = filho(doc, "ide");
    const emit = filho(doc, "emit");
    const dest = filho(doc, "dest");
    const entrega = filho(doc, "entrega");
    const retirada = filho(doc, "retirada");
    const total = filho(doc, "ICMSTot");
    const issqn = filho(doc, "ISSQNtot");
    const retencoes = filho(doc, "retTrib");
    const transp = filho(doc, "transp");
    const transporta = filho(transp, "transporta");
    const retTransp = filho(transp, "retTransp");
    const veiculo = filho(transp, "veicTransp");
    const cobr = filho(doc, "cobr");
    const fat = filho(cobr, "fat");
    const infAdic = filho(doc, "infAdic");
    const infProt = filho(doc, "infProt");
    const pag = filho(doc, "pag");

    /* ---------------- PRODUTOS ---------------- */

    const produtos = lista(doc, "det").map((det) => {
        const prod = filho(det, "prod");
        const imposto = filho(det, "imposto");
        const di = filho(prod, "DI");
        const rastro = filho(prod, "rastro");
        const medicamento = filho(prod, "med");

        return {
            numero: det.getAttribute("nItem") || "",
            codigo: txt(prod, "cProd"),
            descricao: txt(prod, "xProd"),
            ncm: txt(prod, "NCM"),
            cest: txt(prod, "CEST"),
            cfop: txt(prod, "CFOP"),
            beneficio: txt(prod, "cBenef"),
            unidade: txt(prod, "uCom"),
            quantidade: txt(prod, "qCom"),
            valorUnitario: txt(prod, "vUnCom"),
            valorTotal: txt(prod, "vProd"),
            ean: txt(prod, "cEAN"),
            eanTrib: txt(prod, "cEANTrib"),
            unidadeTrib: txt(prod, "uTrib"),
            quantidadeTrib: txt(prod, "qTrib"),
            valorUnitarioTrib: txt(prod, "vUnTrib"),
            frete: txt(prod, "vFrete"),
            seguro: txt(prod, "vSeg"),
            desconto: txt(prod, "vDesc"),
            outras: txt(prod, "vOutro"),
            compoeTotal: txt(prod, "indTot"),
            pedido: txt(prod, "xPed"),
            itemPedido: txt(prod, "nItemPed"),
            observacao: txt(det, "infAdProd"),

            importacao: di
                ? {
                    numero: txt(di, "nDI"),
                    data: txt(di, "dDI"),
                    desembaraco: txt(di, "xLocDesemb"),
                    uf: txt(di, "UFDesemb"),
                    dataDesembaraco: txt(di, "dDesemb")
                }
                : null,

            rastreio: rastro
                ? {
                    lote: txt(rastro, "nLote"),
                    quantidade: txt(rastro, "qLote"),
                    fabricacao: txt(rastro, "dFab"),
                    validade: txt(rastro, "dVal")
                }
                : null,

            medicamento: medicamento
                ? {
                    anvisa: txt(medicamento, "cProdANVISA"),
                    precoMaximo: txt(medicamento, "vPMC")
                }
                : null,

            tributos: lerImpostoItem(imposto)
        };
    });

    /* ---------------- DUPLICATAS E PAGAMENTOS ---------------- */

    const duplicatas = lista(cobr, "dup").map((dup) => ({
        numero: txt(dup, "nDup"),
        vencimento: txt(dup, "dVenc"),
        valor: txt(dup, "vDup")
    }));

    const pagamentos = lista(pag, "detPag").map((item) => {
        const cartao = filho(item, "card");

        return {
            indicador: txt(item, "indPag"),
            meio: txt(item, "tPag"),
            descricao: txt(item, "xPag"),
            valor: txt(item, "vPag"),
            cartao: cartao
                ? {
                    integracao: txt(cartao, "tpIntegra"),
                    cnpj: txt(cartao, "CNPJ"),
                    bandeira: txt(cartao, "tBand"),
                    autorizacao: txt(cartao, "cAut")
                }
                : null
        };
    });

    /* ---------------- VOLUMES / REBOQUES ---------------- */

    const volumes = lista(transp, "vol").map((vol) => ({
        quantidade: txt(vol, "qVol"),
        especie: txt(vol, "esp"),
        marca: txt(vol, "marca"),
        numeracao: txt(vol, "nVol"),
        pesoBruto: txt(vol, "pesoB"),
        pesoLiquido: txt(vol, "pesoL"),
        lacres: lista(vol, "lacres").map((lacre) => txt(lacre, "nLacre"))
    }));

    const reboques = lista(transp, "reboque").map((reboque) => ({
        placa: txt(reboque, "placa"),
        uf: txt(reboque, "UF"),
        rntc: txt(reboque, "RNTC")
    }));

    /* ---------------- EVENTOS ---------------- */

    const eventos = lista(doc, "infEvento")
        .filter((evento) => txt(evento, "tpEvento"))
        .map((evento) => ({
            tipo: txt(evento, "tpEvento"),
            descricao:
                txt(evento, "xEvento") ||
                MAPA_EVENTO[txt(evento, "tpEvento")] ||
                "",
            sequencia: txt(evento, "nSeqEvento"),
            data: txt(evento, "dhEvento") || txt(evento, "dhRegEvento"),
            protocolo: txt(evento, "nProt"),
            correcao: txt(evento, "xCorrecao"),
            justificativa: txt(evento, "xJust"),
            status: txt(evento, "cStat"),
            motivo: txt(evento, "xMotivo")
        }));

    /* ---------------- NOTAS REFERENCIADAS ---------------- */

    const referenciadas = lista(ide, "NFref").map((ref) => ({
        chave: txt(ref, "refNFe"),
        modelo: txt(ref, "mod"),
        numero: txt(ref, "nNF"),
        serie: txt(ref, "serie"),
        cnpj: txt(ref, "CNPJ")
    }));

    const observacoes = lista(infAdic, "obsCont").map((obs) => ({
        campo: obs.getAttribute("xCampo") || "",
        texto: txt(obs, "xTexto")
    }));

    const chave =
        nota?.chave_acesso ||
        infNFe?.getAttribute("Id")?.replace(/\D/g, "") ||
        txt(doc, "chNFe");

    const statusProtocolo = txt(infProt, "cStat");

    const cancelada =
        ["101", "135", "151", "155"].includes(statusProtocolo) ||
        eventos.some((evento) =>
            ["110111", "110112"].includes(evento.tipo)
        );

    return {
        versao: infNFe?.getAttribute("versao") || "",
        chave,
        chaveValida: chaveValida(chave),
        dadosChave: lerChave(chave),

        numero: txt(ide, "nNF"),
        serie: txt(ide, "serie"),
        modelo: txt(ide, "mod"),
        natureza: txt(ide, "natOp"),
        dataEmissao: txt(ide, "dhEmi") || txt(ide, "dEmi"),
        dataSaida: txt(ide, "dhSaiEnt") || txt(ide, "dSaiEnt"),
        tipo: txt(ide, "tpNF"),
        destinoOperacao: txt(ide, "idDest"),
        municipioFato: txt(ide, "cMunFG"),
        formaEmissao: txt(ide, "tpEmis"),
        ambiente: txt(ide, "tpAmb"),
        finalidade: txt(ide, "finNFe"),
        consumidorFinal: txt(ide, "indFinal"),
        presenca: txt(ide, "indPres"),
        versaoAplicativo: txt(ide, "verProc"),

        protocolo: txt(infProt, "nProt"),
        dataProtocolo: txt(infProt, "dhRecbto"),
        statusProtocolo,
        motivoProtocolo: txt(infProt, "xMotivo"),
        digest: txt(infProt, "digVal"),
        cancelada,

        emitente: {
            razaoSocial: txt(emit, "xNome"),
            fantasia: txt(emit, "xFant"),
            cnpj: txt(emit, "CNPJ"),
            cpf: txt(emit, "CPF"),
            ie: txt(emit, "IE"),
            ieST: txt(emit, "IEST"),
            im: txt(emit, "IM"),
            cnae: txt(emit, "CNAE"),
            crt: txt(emit, "CRT"),
            ...lerEndereco(filho(emit, "enderEmit"))
        },

        destinatario: {
            razaoSocial: txt(dest, "xNome"),
            cnpj: txt(dest, "CNPJ"),
            cpf: txt(dest, "CPF"),
            estrangeiro: txt(dest, "idEstrangeiro"),
            indicadorIE: txt(dest, "indIEDest"),
            ie: txt(dest, "IE"),
            suframa: txt(dest, "ISUF"),
            im: txt(dest, "IM"),
            email: txt(dest, "email"),
            ...lerEndereco(filho(dest, "enderDest"))
        },

        entrega: entrega
            ? {
                cnpj: txt(entrega, "CNPJ"),
                cpf: txt(entrega, "CPF"),
                nome: txt(entrega, "xNome"),
                ...lerEndereco(entrega)
            }
            : null,

        retirada: retirada
            ? {
                cnpj: txt(retirada, "CNPJ"),
                cpf: txt(retirada, "CPF"),
                nome: txt(retirada, "xNome"),
                ...lerEndereco(retirada)
            }
            : null,

        totais: {
            baseICMS: txt(total, "vBC"),
            valorICMS: txt(total, "vICMS"),
            icmsDesonerado: txt(total, "vICMSDeson"),
            baseICMSST: txt(total, "vBCST"),
            valorICMSST: txt(total, "vST"),
            fcp: txt(total, "vFCP"),
            fcpST: txt(total, "vFCPST"),
            valorProdutos: txt(total, "vProd"),
            valorFrete: txt(total, "vFrete"),
            valorSeguro: txt(total, "vSeg"),
            desconto: txt(total, "vDesc"),
            valorII: txt(total, "vII"),
            valorIPI: txt(total, "vIPI"),
            ipiDevolvido: txt(total, "vIPIDevol"),
            valorPIS: txt(total, "vPIS"),
            valorCOFINS: txt(total, "vCOFINS"),
            outrasDespesas: txt(total, "vOutro"),
            valorNota: txt(total, "vNF"),
            totalTributos: txt(total, "vTotTrib")
        },

        issqn: issqn
            ? {
                servicos: txt(issqn, "vServ"),
                base: txt(issqn, "vBC"),
                valor: txt(issqn, "vISS"),
                pis: txt(issqn, "vPIS"),
                cofins: txt(issqn, "vCOFINS")
            }
            : null,

        retencoes: retencoes
            ? {
                pis: txt(retencoes, "vRetPIS"),
                cofins: txt(retencoes, "vRetCOFINS"),
                csll: txt(retencoes, "vRetCSLL"),
                baseIRRF: txt(retencoes, "vBCIRRF"),
                irrf: txt(retencoes, "vIRRF"),
                basePrev: txt(retencoes, "vBCRetPrev"),
                prev: txt(retencoes, "vRetPrev")
            }
            : null,

        transporte: {
            modalidade: txt(transp, "modFrete"),
            nome: txt(transporta, "xNome"),
            cnpj: txt(transporta, "CNPJ"),
            cpf: txt(transporta, "CPF"),
            ie: txt(transporta, "IE"),
            endereco: txt(transporta, "xEnder"),
            cidade: txt(transporta, "xMun"),
            uf: txt(transporta, "UF"),
            veiculo: veiculo
                ? {
                    placa: txt(veiculo, "placa"),
                    uf: txt(veiculo, "UF"),
                    rntc: txt(veiculo, "RNTC")
                }
                : null,
            retencao: retTransp
                ? {
                    servico: txt(retTransp, "vServ"),
                    base: txt(retTransp, "vBCRet"),
                    aliquota: txt(retTransp, "pICMSRet"),
                    valor: txt(retTransp, "vICMSRet"),
                    cfop: txt(retTransp, "CFOP")
                }
                : null,
            volumes,
            reboques
        },

        fatura: fat
            ? {
                numero: txt(fat, "nFat"),
                original: txt(fat, "vOrig"),
                desconto: txt(fat, "vDesc"),
                liquido: txt(fat, "vLiq")
            }
            : null,

        duplicatas,
        pagamentos,
        troco: txt(pag, "vTroco"),

        informacoes: {
            contribuinte: txt(infAdic, "infCpl"),
            fisco: txt(infAdic, "infAdFisco"),
            observacoes
        },

        referenciadas,
        eventos,
        produtos
    };
};

/* ==================================================================
 * FORMATADORES
 * ================================================================== */

const vazio = (valor) =>
    valor === null || valor === undefined || valor === "" || valor === "-";

const dinheiro = (valor) => {
    if (vazio(valor)) return "-";
    const convertido = Number(String(valor).replace(",", "."));
    if (Number.isNaN(convertido)) return valor;
    return convertido.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
};

const decimal = (valor, casas = 4) => {
    if (vazio(valor)) return "-";
    const convertido = Number(String(valor).replace(",", "."));
    if (Number.isNaN(convertido)) return valor;
    return convertido.toLocaleString("pt-BR", {
        maximumFractionDigits: casas
    });
};

const percentual = (valor) => {
    if (vazio(valor)) return "-";
    const convertido = Number(String(valor).replace(",", "."));
    if (Number.isNaN(convertido)) return valor;
    return `${convertido.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 4
    })}%`;
};

const dataBR = (valor) => {
    if (vazio(valor)) return "-";
    const partes = String(valor).substring(0, 10).split("-");
    if (partes.length !== 3) return valor;
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
};

const dataHoraBR = (valor) => {
    if (vazio(valor)) return "-";
    const texto = String(valor);
    const dia = dataBR(texto);
    const hora = texto.substring(11, 16);
    return hora ? `${dia} às ${hora}` : dia;
};

const documento = (valor) => {
    if (vazio(valor)) return "-";
    const digitos = String(valor).replace(/\D/g, "");

    if (digitos.length === 14) {
        return digitos.replace(
            /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
            "$1.$2.$3/$4-$5"
        );
    }

    if (digitos.length === 11) {
        return digitos.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4");
    }

    return valor;
};

const cepBR = (valor) => {
    if (vazio(valor)) return "-";
    const digitos = String(valor).replace(/\D/g, "");
    if (digitos.length !== 8) return valor;
    return digitos.replace(/^(\d{5})(\d{3})$/, "$1-$2");
};

const telefoneBR = (valor) => {
    if (vazio(valor)) return "-";
    const digitos = String(valor).replace(/\D/g, "");
    if (digitos.length === 11) {
        return digitos.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
    }
    if (digitos.length === 10) {
        return digitos.replace(/^(\d{2})(\d{4})(\d{4})$/, "($1) $2-$3");
    }
    return valor;
};

const chaveFormatada = (valor) => {
    if (vazio(valor)) return "-";
    const digitos = String(valor).replace(/\D/g, "");
    if (digitos.length !== 44) return valor;
    return digitos.match(/.{1,4}/g)?.join(" ") || valor;
};

const enderecoCompleto = (origem) => {
    if (!origem) return "-";

    const linha = [
        origem.logradouro,
        origem.numero && `nº ${origem.numero}`,
        origem.complemento,
        origem.bairro
    ]
        .filter(Boolean)
        .join(", ");

    const cidade = [origem.cidade, origem.uf].filter(Boolean).join("/");

    return [linha, cidade].filter(Boolean).join(" - ") || "-";
};

/* Reindenta o XML para leitura. */
const identarXML = (texto) => {
    if (!texto) return "";

    const compacto = texto.replace(/>\s+</g, "><").trim();
    const linhas = compacto.replace(/></g, ">\n<").split("\n");

    let nivel = 0;

    return linhas
        .map((linha) => {
            if (/^<\//.test(linha)) {
                nivel = Math.max(nivel - 1, 0);
            }

            const saida = "  ".repeat(nivel) + linha;

            if (/^<[^/!?][^>]*[^/]>$/.test(linha)) {
                nivel += 1;
            }

            return saida;
        })
        .join("\n");
};

const baixarArquivo = (conteudo, nome, tipo) => {
    const blob = new Blob([conteudo], { type: tipo });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = nome;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    window.URL.revokeObjectURL(url);
};

/* ==================================================================
 * SUBCOMPONENTES
 * ================================================================== */

function Campo({ titulo, valor, xs = 3, destaque = false, cores, isDark }) {
    return (
        <Box
            sx={{
                border: "1px solid",
                borderColor: cores.divider,

                bgcolor: destaque
                    ? alpha(cores.primary, isDark ? 0.12 : 0.05)
                    : cores.card,

                px: 1.1,
                py: 0.85,
                minHeight: 58,

                gridColumn: {
                    xs: "span 12",
                    sm: `span ${xs}`,
                    md: `span ${xs}`
                },

                transition: "background-color 0.2s ease",

                "&:hover": {
                    bgcolor: alpha(cores.primary, isDark ? 0.08 : 0.035)
                }
            }}
        >
            <Typography
                sx={{
                    fontSize: "0.58rem",
                    color: cores.textoSecundario,
                    textTransform: "uppercase",
                    mb: 0.35,
                    letterSpacing: "0.02em"
                }}
            >
                {titulo}
            </Typography>

            <Typography
                sx={{
                    fontSize: "0.78rem",
                    fontWeight: destaque ? 700 : 500,
                    color: destaque ? cores.primary : cores.texto,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap"
                }}
                title={vazio(valor) ? "-" : String(valor)}
            >
                {vazio(valor) ? "-" : valor}
            </Typography>
        </Box>
    );
}

function Secao({ titulo, icon, acao, children, cores }) {
    return (
        <Box sx={{ mb: 3 }}>
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 1,
                    mb: 1
                }}
            >
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                    {icon && (
                        <Box sx={{ display: "flex", color: cores.primary }}>
                            {icon}
                        </Box>
                    )}

                    <Typography
                        sx={{
                            fontSize: "0.82rem",
                            fontWeight: 800,
                            color: cores.primary,
                            textTransform: "uppercase",
                            letterSpacing: "0.02em"
                        }}
                    >
                        {titulo}
                    </Typography>
                </Box>

                {acao}
            </Box>

            {children}
        </Box>
    );
}

function ResumoCard({ titulo, valor, icon, destaque = false, cores, isDark }) {
    return (
        <Paper
            elevation={0}
            sx={{
                p: 1.5,

                bgcolor: destaque
                    ? alpha(cores.primary, isDark ? 0.13 : 0.06)
                    : cores.card,

                border: "1px solid",

                borderColor: destaque
                    ? alpha(cores.primary, 0.35)
                    : cores.divider,

                borderRadius: 2,
                minHeight: 82
            }}
        >
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between"
                }}
            >
                <Typography
                    sx={{
                        fontSize: "0.67rem",
                        color: cores.textoSecundario,
                        textTransform: "uppercase",
                        fontWeight: 700
                    }}
                >
                    {titulo}
                </Typography>

                <Box
                    sx={{
                        color: destaque ? cores.primary : cores.textoSecundario
                    }}
                >
                    {icon}
                </Box>
            </Box>

            <Typography
                sx={{
                    mt: 0.7,
                    fontSize: "1.05rem",
                    fontWeight: 800,
                    color: destaque ? cores.primary : cores.texto,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap"
                }}
                title={String(valor ?? "-")}
            >
                {valor}
            </Typography>
        </Paper>
    );
}

function Aviso({ tipo = "info", texto, cores }) {
    const cor =
        tipo === "erro"
            ? cores.erro
            : tipo === "alerta"
                ? cores.warning
                : cores.primary;

    const Icone =
        tipo === "erro"
            ? ErrorOutlineIcon
            : tipo === "alerta"
                ? WarningAmberOutlinedIcon
                : InfoOutlinedIcon;

    return (
        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                px: 1.5,
                py: 1,
                mb: 2,
                borderRadius: 2,
                border: "1px solid",
                borderColor: alpha(cor, 0.35),
                bgcolor: alpha(cor, 0.08)
            }}
        >
            <Icone sx={{ fontSize: 18, color: cor }} />

            <Typography sx={{ fontSize: "0.78rem", color: cores.texto }}>
                {texto}
            </Typography>
        </Box>
    );
}

function VazioLista({ texto, cores }) {
    return (
        <Paper
            elevation={0}
            sx={{
                p: 2,
                bgcolor: cores.card,
                border: "1px dashed",
                borderColor: cores.divider,
                borderRadius: 2
            }}
        >
            <Typography
                sx={{ color: cores.textoSecundario, fontSize: "0.8rem" }}
            >
                {texto}
            </Typography>
        </Paper>
    );
}

/* ==================================================================
 * COMPONENTE PRINCIPAL
 * ================================================================== */

function XmlViewer({ open, onClose, xml, nota = null }) {
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";

    const [aba, setAba] = useState(0);
    const [dados, setDados] = useState(null);
    const [erroXML, setErroXML] = useState("");
    const [mensagem, setMensagem] = useState(null);
    const [telaCheia, setTelaCheia] = useState(false);
    const [menuExportar, setMenuExportar] = useState(null);

    const [buscaProduto, setBuscaProduto] = useState("");
    const [ordem, setOrdem] = useState({ campo: "numero", direcao: "asc" });
    const [itemAberto, setItemAberto] = useState(null);

    const [buscaXML, setBuscaXML] = useState("");
    const [xmlIdentado, setXmlIdentado] = useState(true);

    /* ---------------- CORES DO TEMA ---------------- */

    const cores = {
        fundo: theme.palette.background.default,
        card:
            theme.palette.background.card || theme.palette.background.default,
        tabela:
            theme.palette.background.tabela || theme.palette.background.default,
        input:
            theme.palette.background.inputBg || theme.palette.background.default,
        texto: theme.palette.text.primary,
        textoSecundario: theme.palette.text.secondary,
        primary: theme.palette.primary.main,
        primaryHover:
            theme.palette.primary.mainHover || theme.palette.primary.main,
        branco: theme.palette.primary.branco || "#FFFFFF",
        divider: theme.palette.divider,
        sucesso: theme.palette.primary.confirmar || "#02bb31",
        erro: theme.palette.primary.cancelar || "#ff3535",
        warning: theme.palette.primary.observacao || "#e79931"
    };

    /* ---------------- PARSER ---------------- */

    useEffect(() => {
        if (!xml) {
            setDados(null);
            setErroXML("");
            return;
        }

        try {
            setErroXML("");
            setDados(interpretarNFe(xml, nota));
        } catch (error) {
            console.error("Erro ao interpretar XML:", error);
            setDados(null);
            setErroXML(
                error?.message === "XML inválido"
                    ? "O arquivo não é um XML válido."
                    : "Não foi possível ler a estrutura da NF-e."
            );
        }
    }, [xml, nota]);

    useEffect(() => {
        if (open) {
            setAba(0);
            setBuscaProduto("");
            setBuscaXML("");
            setItemAberto(null);
            setOrdem({ campo: "numero", direcao: "asc" });
        }
    }, [open]);

    /* ---------------- CONFERÊNCIAS ---------------- */

    const conferencias = useMemo(() => {
        if (!dados) return [];

        const alertas = [];

        const somaItens = dados.produtos.reduce(
            (total, item) => total + num(item.valorTotal),
            0
        );

        if (
            dados.totais.valorProdutos &&
            Math.abs(somaItens - num(dados.totais.valorProdutos)) > 0.02
        ) {
            alertas.push(
                `Soma dos itens (${dinheiro(somaItens)}) diferente do total de produtos declarado (${dinheiro(dados.totais.valorProdutos)}).`
            );
        }

        const somaDuplicatas = dados.duplicatas.reduce(
            (total, dup) => total + num(dup.valor),
            0
        );

        if (
            dados.duplicatas.length > 0 &&
            Math.abs(somaDuplicatas - num(dados.totais.valorNota)) > 0.02
        ) {
            alertas.push(
                `Soma das duplicatas (${dinheiro(somaDuplicatas)}) diferente do total da nota (${dinheiro(dados.totais.valorNota)}).`
            );
        }

        const somaPagamentos = dados.pagamentos.reduce(
            (total, pagamento) => total + num(pagamento.valor),
            0
        );

        if (
            dados.pagamentos.length > 0 &&
            Math.abs(somaPagamentos - num(dados.totais.valorNota)) > 0.02 &&
            !dados.pagamentos.some((pagamento) => pagamento.meio === "90")
        ) {
            alertas.push(
                `Soma dos pagamentos (${dinheiro(somaPagamentos)}) diferente do total da nota (${dinheiro(dados.totais.valorNota)}).`
            );
        }

        if (dados.chave && !dados.chaveValida) {
            alertas.push(
                "O dígito verificador da chave de acesso não confere."
            );
        }

        return alertas;
    }, [dados]);

    /* ---------------- PRODUTOS FILTRADOS ---------------- */

    const produtosVisiveis = useMemo(() => {
        if (!dados) return [];

        const termo = buscaProduto.trim().toLowerCase();

        const filtrados = termo
            ? dados.produtos.filter((produto) =>
                [
                    produto.codigo,
                    produto.descricao,
                    produto.ncm,
                    produto.cfop,
                    produto.ean,
                    produto.cest
                ]
                    .join(" ")
                    .toLowerCase()
                    .includes(termo)
            )
            : [...dados.produtos];

        const numericos = [
            "numero",
            "quantidade",
            "valorUnitario",
            "valorTotal"
        ];

        return filtrados.sort((a, b) => {
            const campo = ordem.campo;
            const sinal = ordem.direcao === "asc" ? 1 : -1;

            if (numericos.includes(campo)) {
                return (num(a[campo]) - num(b[campo])) * sinal;
            }

            return String(a[campo] || "").localeCompare(
                String(b[campo] || ""),
                "pt-BR"
            ) * sinal;
        });
    }, [dados, buscaProduto, ordem]);

    const totaisVisiveis = useMemo(() => {
        return produtosVisiveis.reduce(
            (acumulado, produto) => ({
                quantidade: acumulado.quantidade + num(produto.quantidade),
                valor: acumulado.valor + num(produto.valorTotal),
                desconto: acumulado.desconto + num(produto.desconto),
                icms: acumulado.icms + num(produto.tributos.icms.valor),
                ipi: acumulado.ipi + num(produto.tributos.ipi.valor),
                tributos:
                    acumulado.tributos + num(produto.tributos.totalTributos)
            }),
            {
                quantidade: 0,
                valor: 0,
                desconto: 0,
                icms: 0,
                ipi: 0,
                tributos: 0
            }
        );
    }, [produtosVisiveis]);

    const xmlExibido = useMemo(
        () => (xmlIdentado ? identarXML(xml) : xml || ""),
        [xml, xmlIdentado]
    );

    const ocorrenciasXML = useMemo(() => {
        const termo = buscaXML.trim();
        if (termo.length < 2 || !xmlExibido) return 0;

        const partes = xmlExibido
            .toLowerCase()
            .split(termo.toLowerCase()).length;

        return partes - 1;
    }, [buscaXML, xmlExibido]);

    /* ---------------- AÇÕES ---------------- */

    const avisar = (texto, severidade = "success") =>
        setMensagem({ texto, severidade });

    const nomeBase = `NFe_${dados?.numero || nota?.numero || "documento"}_serie_${dados?.serie || nota?.serie || "1"}`;

    const copiar = async (texto, descricao) => {
        if (!texto) return;

        try {
            // Tenta primeiro a Clipboard API moderna
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(texto);

                avisar(`${descricao} copiado para a área de transferência.`);
                return;
            }

            // Fallback para ambientes HTTP/intranet
            const textarea = document.createElement("textarea");

            textarea.value = texto;
            textarea.style.position = "fixed";
            textarea.style.left = "-9999px";
            textarea.style.top = "0";
            textarea.setAttribute("readonly", "");

            document.body.appendChild(textarea);

            textarea.focus();
            textarea.select();
            textarea.setSelectionRange(0, textarea.value.length);

            const sucesso = document.execCommand("copy");

            document.body.removeChild(textarea);

            if (sucesso) {
                avisar(`${descricao} copiado para a área de transferência.`);
            } else {
                throw new Error("Não foi possível copiar usando o fallback.");
            }
        } catch (error) {
            console.error("Erro ao copiar:", error);
            avisar("Não foi possível copiar. Copie manualmente.", "error");
        }
    };

    const baixarXML = () => {
        if (!xml) return;
        baixarArquivo(
            xml,
            `${nomeBase}.xml`,
            "application/xml;charset=utf-8"
        );
        avisar("Download do XML iniciado.");
    };

    const baixarJSON = () => {
        if (!dados) return;
        baixarArquivo(
            JSON.stringify(dados, null, 2),
            `${nomeBase}.json`,
            "application/json;charset=utf-8"
        );
        avisar("Download do JSON iniciado.");
    };

    const baixarCSV = () => {
        if (!dados) return;

        const cabecalho = [
            "Item",
            "Codigo",
            "Descricao",
            "NCM",
            "CEST",
            "CFOP",
            "Unidade",
            "Quantidade",
            "Valor unitario",
            "Valor total",
            "Desconto",
            "Base ICMS",
            "Aliquota ICMS",
            "Valor ICMS",
            "Valor IPI",
            "Valor PIS",
            "Valor COFINS"
        ];

        const escapar = (valor) =>
            `"${String(valor ?? "").replace(/"/g, '""')}"`;

        const linhas = dados.produtos.map((produto) =>
            [
                produto.numero,
                produto.codigo,
                produto.descricao,
                produto.ncm,
                produto.cest,
                produto.cfop,
                produto.unidade,
                produto.quantidade,
                produto.valorUnitario,
                produto.valorTotal,
                produto.desconto,
                produto.tributos.icms.base,
                produto.tributos.icms.aliquota,
                produto.tributos.icms.valor,
                produto.tributos.ipi.valor,
                produto.tributos.pis.valor,
                produto.tributos.cofins.valor
            ]
                .map(escapar)
                .join(";")
        );

        baixarArquivo(
            `\uFEFF${[cabecalho.join(";"), ...linhas].join("\n")}`,
            `${nomeBase}_itens.csv`,
            "text/csv;charset=utf-8"
        );

        avisar("Download da planilha de itens iniciado.");
    };

    const consultarSefaz = () => {
        window.open(
            "https://www.nfe.fazenda.gov.br/portal/consultaRecaptcha.aspx?tipoConsulta=resumo&tipoConteudo=7PhJ+gAVw2g=",
            "_blank",
            "noopener"
        );
    };

    /* Gera uma janela de impressão apenas com o resumo da NF-e. */
    const imprimir = () => {
        if (!dados) {
            window.print();
            return;
        }

        const janela = window.open("", "_blank", "width=1024,height=768");

        if (!janela) {
            avisar(
                "O navegador bloqueou a janela de impressão. Libere os pop-ups.",
                "warning"
            );
            return;
        }

        const linhasProdutos = dados.produtos
            .map(
                (produto) => `
                    <tr>
                        <td>${produto.numero}</td>
                        <td>${produto.codigo}</td>
                        <td>${produto.descricao}</td>
                        <td>${produto.ncm}</td>
                        <td>${produto.cfop}</td>
                        <td>${produto.unidade}</td>
                        <td class="r">${decimal(produto.quantidade)}</td>
                        <td class="r">${dinheiro(produto.valorUnitario)}</td>
                        <td class="r">${dinheiro(produto.valorTotal)}</td>
                    </tr>`
            )
            .join("");

        const linhasDuplicatas = dados.duplicatas
            .map(
                (dup) => `
                    <tr>
                        <td>${dup.numero}</td>
                        <td>${dataBR(dup.vencimento)}</td>
                        <td class="r">${dinheiro(dup.valor)}</td>
                    </tr>`
            )
            .join("");

        janela.document.write(`
            <html>
                <head>
                    <meta charset="utf-8" />
                    <title>NF-e ${dados.numero} - série ${dados.serie}</title>
                    <style>
                        * { box-sizing: border-box; }
                        body {
                            font-family: Arial, Helvetica, sans-serif;
                            font-size: 11px;
                            color: #111;
                            margin: 18px;
                        }
                        h1 { font-size: 16px; margin: 0 0 2px; }
                        h2 {
                            font-size: 11px;
                            text-transform: uppercase;
                            margin: 16px 0 6px;
                            border-bottom: 1px solid #999;
                            padding-bottom: 3px;
                        }
                        .chave { font-family: monospace; letter-spacing: 1px; }
                        .grid {
                            display: grid;
                            grid-template-columns: repeat(4, 1fr);
                            gap: 6px;
                        }
                        .campo { border: 1px solid #bbb; padding: 4px 6px; }
                        .campo span {
                            display: block;
                            font-size: 8px;
                            text-transform: uppercase;
                            color: #666;
                        }
                        table { width: 100%; border-collapse: collapse; margin-top: 6px; }
                        th, td { border: 1px solid #bbb; padding: 3px 5px; text-align: left; }
                        th { background: #eee; font-size: 9px; text-transform: uppercase; }
                        .r { text-align: right; }
                        .total {
                            margin-top: 12px;
                            text-align: right;
                            font-size: 15px;
                            font-weight: bold;
                        }
                        @media print { body { margin: 8mm; } }
                    </style>
                </head>
                <body>
                    <h1>NF-e nº ${dados.numero} • série ${dados.serie}</h1>
                    <div class="chave">${chaveFormatada(dados.chave)}</div>

                    <h2>Identificação</h2>
                    <div class="grid">
                        <div class="campo"><span>Emissão</span>${dataHoraBR(dados.dataEmissao)}</div>
                        <div class="campo"><span>Natureza da operação</span>${dados.natureza || "-"}</div>
                        <div class="campo"><span>Protocolo</span>${dados.protocolo || "-"}</div>
                        <div class="campo"><span>Situação</span>${dados.cancelada ? "Cancelada" : dados.motivoProtocolo || "-"}</div>
                    </div>

                    <h2>Emitente</h2>
                    <div class="grid">
                        <div class="campo"><span>Razão social</span>${dados.emitente.razaoSocial || "-"}</div>
                        <div class="campo"><span>CNPJ</span>${documento(dados.emitente.cnpj || dados.emitente.cpf)}</div>
                        <div class="campo"><span>Inscrição estadual</span>${dados.emitente.ie || "-"}</div>
                        <div class="campo"><span>Endereço</span>${enderecoCompleto(dados.emitente)}</div>
                    </div>

                    <h2>Destinatário</h2>
                    <div class="grid">
                        <div class="campo"><span>Razão social</span>${dados.destinatario.razaoSocial || "-"}</div>
                        <div class="campo"><span>CNPJ / CPF</span>${documento(dados.destinatario.cnpj || dados.destinatario.cpf)}</div>
                        <div class="campo"><span>Inscrição estadual</span>${dados.destinatario.ie || "-"}</div>
                        <div class="campo"><span>Endereço</span>${enderecoCompleto(dados.destinatario)}</div>
                    </div>

                    <h2>Produtos e serviços</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Item</th><th>Código</th><th>Descrição</th>
                                <th>NCM</th><th>CFOP</th><th>Un.</th>
                                <th class="r">Qtd.</th><th class="r">Vl. unit.</th><th class="r">Vl. total</th>
                            </tr>
                        </thead>
                        <tbody>${linhasProdutos}</tbody>
                    </table>

                    <h2>Impostos</h2>
                    <div class="grid">
                        <div class="campo"><span>Base ICMS</span>${dinheiro(dados.totais.baseICMS)}</div>
                        <div class="campo"><span>Valor ICMS</span>${dinheiro(dados.totais.valorICMS)}</div>
                        <div class="campo"><span>Valor IPI</span>${dinheiro(dados.totais.valorIPI)}</div>
                        <div class="campo"><span>Frete</span>${dinheiro(dados.totais.valorFrete)}</div>
                    </div>

                    ${linhasDuplicatas
                ? `<h2>Duplicatas</h2>
                               <table>
                                   <thead><tr><th>Número</th><th>Vencimento</th><th class="r">Valor</th></tr></thead>
                                   <tbody>${linhasDuplicatas}</tbody>
                               </table>`
                : ""
            }

                    ${dados.informacoes.contribuinte
                ? `<h2>Informações complementares</h2>
                               <div class="campo">${dados.informacoes.contribuinte}</div>`
                : ""
            }

                    <div class="total">Total da NF-e: ${dinheiro(dados.totais.valorNota)}</div>
                </body>
            </html>
        `);

        janela.document.close();
        janela.focus();
        janela.print();
    };

    const ordenarPor = (campo) => {
        setOrdem((atual) => ({
            campo,
            direcao:
                atual.campo === campo && atual.direcao === "asc"
                    ? "desc"
                    : "asc"
        }));
    };

    /* ---------------- ESTILOS DE TABELA ---------------- */

    const tabelaSx = {
        "& .MuiTableCell-root": {
            borderColor: cores.divider,
            color: cores.texto,
            fontSize: "0.75rem"
        },

        "& .MuiTableHead-root .MuiTableCell-root": {
            backgroundColor: isDark
                ? cores.tabela
                : alpha(cores.primary, 0.04),
            color: cores.texto,
            fontWeight: 800,
            textTransform: "uppercase",
            fontSize: "0.65rem"
        },

        "& .MuiTableBody-root .MuiTableRow-root:hover": {
            backgroundColor: alpha(cores.primary, isDark ? 0.07 : 0.035)
        }
    };

    const gradeSx = {
        display: "grid",
        gridTemplateColumns: "repeat(12, 1fr)"
    };

    const campo = (props) => (
        <Campo {...props} cores={cores} isDark={isDark} />
    );

    if (!open) return null;

    const statusTexto = dados?.cancelada
        ? "Cancelada"
        : dados?.statusProtocolo === "100"
            ? "Autorizada"
            : nota?.status || (dados?.protocolo ? "Processada" : "Sem protocolo");

    const statusCor = dados?.cancelada
        ? cores.erro
        : dados?.statusProtocolo === "100"
            ? cores.sucesso
            : cores.primary;

    const abas = [
        { rotulo: "Resumo", icone: <DescriptionIcon fontSize="small" /> },
        {
            rotulo: `Itens (${dados?.produtos?.length || 0})`,
            icone: <Inventory2OutlinedIcon fontSize="small" />
        },
        { rotulo: "Impostos", icone: <PercentOutlinedIcon fontSize="small" /> },
        {
            rotulo: "Transporte",
            icone: <LocalShippingOutlinedIcon fontSize="small" />
        },
        {
            rotulo: "Cobrança",
            icone: <ReceiptLongOutlinedIcon fontSize="small" />
        },
        {
            rotulo: `Complementos${dados?.eventos?.length ? ` (${dados.eventos.length})` : ""}`,
            icone: <NotesOutlinedIcon fontSize="small" />
        },
        { rotulo: "XML", icone: <CodeIcon fontSize="small" /> }
    ];

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="xl"
            fullScreen={telaCheia}
            PaperProps={{
                sx: {
                    width: "100%",
                    height: telaCheia ? "100%" : "92vh",
                    maxHeight: telaCheia ? "100%" : "92vh",
                    borderRadius: telaCheia ? 0 : "14px",
                    overflow: "hidden",
                    bgcolor: cores.card,
                    color: cores.texto,
                    border: "1px solid",
                    borderColor: cores.divider,
                    boxShadow: isDark
                        ? "0 18px 60px rgba(0,0,0,0.65)"
                        : "0 18px 60px rgba(0,0,0,0.20)"
                }
            }}
            slotProps={{
                backdrop: {
                    sx: {
                        backgroundColor: isDark
                            ? "rgba(0,0,0,0.78)"
                            : "rgba(0,0,0,0.45)",
                        backdropFilter: "blur(2px)"
                    }
                }
            }}
        >
            {/* ============================ CABEÇALHO ============================ */}

            <Box
                sx={{
                    px: 2,
                    py: 1.1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 2,
                    bgcolor: cores.card,
                    borderBottom: "1px solid",
                    borderColor: cores.divider
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.2,
                        minWidth: 0
                    }}
                >
                    <Box
                        sx={{
                            width: 36,
                            height: 36,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: 1.5,
                            bgcolor: alpha(
                                statusCor,
                                isDark ? 0.15 : 0.08
                            ),
                            color: statusCor
                        }}
                    >
                        <DescriptionIcon />
                    </Box>

                    <Box sx={{ minWidth: 0 }}>
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                flexWrap: "wrap"
                            }}
                        >
                            <Typography
                                sx={{
                                    fontWeight: 800,
                                    fontSize: "1rem",
                                    color: cores.texto
                                }}
                            >
                                NF-e nº{" "}
                                {dados?.numero || nota?.numero || "-"}
                            </Typography>

                            <Chip
                                label={statusTexto}
                                size="small"
                                icon={
                                    dados?.cancelada ? (
                                        <ErrorOutlineIcon
                                            sx={{
                                                fontSize: "0.85rem !important"
                                            }}
                                        />
                                    ) : (
                                        <CheckCircleOutlineIcon
                                            sx={{
                                                fontSize: "0.85rem !important"
                                            }}
                                        />
                                    )
                                }
                                sx={{
                                    height: 22,
                                    fontSize: "0.62rem",
                                    fontWeight: 800,
                                    bgcolor: alpha(
                                        statusCor,
                                        isDark ? 0.18 : 0.09
                                    ),
                                    color: statusCor,
                                    border: "1px solid",
                                    borderColor: alpha(statusCor, 0.3),
                                    "& .MuiChip-icon": { color: statusCor }
                                }}
                            />

                            {dados?.ambiente === "2" && (
                                <Chip
                                    label="Homologação"
                                    size="small"
                                    sx={{
                                        height: 22,
                                        fontSize: "0.62rem",
                                        fontWeight: 800,
                                        bgcolor: alpha(cores.warning, 0.12),
                                        color: cores.warning,
                                        border: "1px solid",
                                        borderColor: alpha(cores.warning, 0.3)
                                    }}
                                />
                            )}
                        </Box>

                        <Typography
                            sx={{
                                fontSize: "0.68rem",
                                color: cores.textoSecundario,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap"
                            }}
                        >
                            Série {dados?.serie || nota?.serie || "-"} •{" "}
                            {dataHoraBR(dados?.dataEmissao)} •{" "}
                            {dados?.emitente?.razaoSocial ||
                                nota?.fornecedor ||
                                "Emitente não identificado"}
                        </Typography>
                    </Box>
                </Box>

                <Box
                    sx={{ display: "flex", alignItems: "center", gap: 0.4 }}
                >
                    <Tooltip title="Consultar no portal da SEFAZ">
                        <span>
                            <IconButton
                                onClick={consultarSefaz}
                                disabled={!dados?.chave}
                                sx={{
                                    color: cores.textoSecundario,
                                    "&:hover": {
                                        bgcolor: alpha(cores.primary, 0.1),
                                        color: cores.primary
                                    }
                                }}
                            >
                                <OpenInNewIcon fontSize="small" />
                            </IconButton>
                        </span>
                    </Tooltip>

                    <Tooltip title="Imprimir resumo">
                        <IconButton
                            onClick={imprimir}
                            sx={{
                                color: cores.textoSecundario,
                                "&:hover": {
                                    bgcolor: alpha(cores.primary, 0.1),
                                    color: cores.primary
                                }
                            }}
                        >
                            <PrintIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>

                    <Tooltip title="Copiar XML">
                        <IconButton
                            onClick={() => copiar(xml, "XML")}
                            sx={{
                                color: cores.textoSecundario,
                                "&:hover": {
                                    bgcolor: alpha(cores.primary, 0.1),
                                    color: cores.primary
                                }
                            }}
                        >
                            <ContentCopyIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>

                    <Tooltip title="Baixar">
                        <IconButton
                            onClick={(evento) =>
                                setMenuExportar(evento.currentTarget)
                            }
                            sx={{
                                color: cores.textoSecundario,
                                "&:hover": {
                                    bgcolor: alpha(cores.primary, 0.1),
                                    color: cores.primary
                                }
                            }}
                        >
                            <FileDownloadIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>

                    <Tooltip
                        title={telaCheia ? "Restaurar janela" : "Tela cheia"}
                    >
                        <IconButton
                            onClick={() => setTelaCheia((atual) => !atual)}
                            sx={{
                                color: cores.textoSecundario,
                                "&:hover": {
                                    bgcolor: alpha(cores.primary, 0.1),
                                    color: cores.primary
                                }
                            }}
                        >
                            {telaCheia ? (
                                <FullscreenExitIcon fontSize="small" />
                            ) : (
                                <FullscreenIcon fontSize="small" />
                            )}
                        </IconButton>
                    </Tooltip>

                    <Tooltip title="Fechar">
                        <IconButton
                            onClick={onClose}
                            sx={{
                                color: cores.textoSecundario,
                                ml: 0.5,
                                "&:hover": {
                                    bgcolor: alpha(cores.erro, 0.1),
                                    color: cores.erro
                                }
                            }}
                        >
                            <CloseIcon />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>

            <Menu
                anchorEl={menuExportar}
                open={Boolean(menuExportar)}
                onClose={() => setMenuExportar(null)}
            >
                <MenuItem
                    onClick={() => {
                        setMenuExportar(null);
                        baixarXML();
                    }}
                >
                    <ListItemIcon>
                        <CodeIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Baixar XML original</ListItemText>
                </MenuItem>

                <MenuItem
                    onClick={() => {
                        setMenuExportar(null);
                        baixarCSV();
                    }}
                    disabled={!dados?.produtos?.length}
                >
                    <ListItemIcon>
                        <TableChartOutlinedIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Baixar itens em CSV</ListItemText>
                </MenuItem>

                <MenuItem
                    onClick={() => {
                        setMenuExportar(null);
                        baixarJSON();
                    }}
                    disabled={!dados}
                >
                    <ListItemIcon>
                        <DataObjectIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Baixar dados em JSON</ListItemText>
                </MenuItem>
            </Menu>

            {/* ============================ ABAS ============================ */}

            <Tabs
                value={aba}
                onChange={(evento, valor) => setAba(valor)}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                    minHeight: 44,
                    bgcolor: cores.card,
                    borderBottom: "1px solid",
                    borderColor: cores.divider,
                    "& .MuiTab-root": {
                        minHeight: 44,
                        fontSize: "0.72rem",
                        textTransform: "none",
                        color: cores.textoSecundario,
                        fontWeight: 600
                    },
                    "& .Mui-selected": {
                        color: `${cores.primary} !important`,
                        fontWeight: 800
                    },
                    "& .MuiTabs-indicator": {
                        backgroundColor: cores.primary,
                        height: 2
                    }
                }}
            >
                {abas.map((item) => (
                    <Tab
                        key={item.rotulo}
                        icon={item.icone}
                        iconPosition="start"
                        label={item.rotulo}
                    />
                ))}
            </Tabs>

            {/* ============================ CONTEÚDO ============================ */}

            <DialogContent
                sx={{
                    p: { xs: 1.5, md: 2 },
                    bgcolor: cores.fundo,
                    overflowY: "auto",
                    "&::-webkit-scrollbar": { width: "8px" },
                    "&::-webkit-scrollbar-track": {
                        background: isDark ? "#181818" : "#eeeeee"
                    },
                    "&::-webkit-scrollbar-thumb": {
                        background: isDark ? "#444" : "#bdbdbd",
                        borderRadius: "5px"
                    },
                    "&::-webkit-scrollbar-thumb:hover": {
                        background: cores.primary
                    }
                }}
            >
                {erroXML ? (
                    <Box
                        sx={{
                            minHeight: 400,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexDirection: "column",
                            gap: 1.5
                        }}
                    >
                        <ErrorOutlineIcon
                            sx={{ fontSize: 55, color: cores.erro }}
                        />

                        <Typography sx={{ fontWeight: 800 }}>
                            Não foi possível ler esta NF-e
                        </Typography>

                        <Typography
                            sx={{
                                color: cores.textoSecundario,
                                fontSize: "0.85rem"
                            }}
                        >
                            {erroXML} Baixe o arquivo para conferir o conteúdo.
                        </Typography>

                        <Button
                            variant="outlined"
                            size="small"
                            startIcon={<FileDownloadIcon />}
                            onClick={baixarXML}
                            sx={{
                                mt: 1,
                                borderColor: cores.primary,
                                color: cores.primary
                            }}
                        >
                            Baixar XML
                        </Button>
                    </Box>
                ) : !dados ? (
                    <Box
                        sx={{
                            minHeight: 400,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexDirection: "column",
                            gap: 2
                        }}
                    >
                        <CircularProgress />
                        <Typography color="text.secondary">
                            Lendo a NF-e...
                        </Typography>
                    </Box>
                ) : (
                    <>
                        {/* ==================== ABA 0 - RESUMO ==================== */}

                        {aba === 0 && (
                            <>
                                {dados.cancelada && (
                                    <Aviso
                                        tipo="erro"
                                        cores={cores}
                                        texto="Esta nota consta como cancelada. Confira os eventos na aba Complementos."
                                    />
                                )}

                                {conferencias.map((texto) => (
                                    <Aviso
                                        key={texto}
                                        tipo="alerta"
                                        cores={cores}
                                        texto={texto}
                                    />
                                ))}

                                <Box
                                    sx={{
                                        display: "grid",
                                        gridTemplateColumns: {
                                            xs: "1fr 1fr",
                                            sm: "repeat(4, 1fr)"
                                        },
                                        gap: 1.2,
                                        mb: 3
                                    }}
                                >
                                    <ResumoCard
                                        cores={cores}
                                        isDark={isDark}
                                        titulo="Número / série"
                                        valor={`${dados.numero || "-"} / ${dados.serie || "-"}`}
                                        icon={
                                            <ReceiptLongOutlinedIcon fontSize="small" />
                                        }
                                        destaque
                                    />

                                    <ResumoCard
                                        cores={cores}
                                        isDark={isDark}
                                        titulo="Itens"
                                        valor={dados.produtos.length}
                                        icon={
                                            <Inventory2OutlinedIcon fontSize="small" />
                                        }
                                    />

                                    <ResumoCard
                                        cores={cores}
                                        isDark={isDark}
                                        titulo="Tributos aprox."
                                        valor={dinheiro(
                                            dados.totais.totalTributos
                                        )}
                                        icon={
                                            <PercentOutlinedIcon fontSize="small" />
                                        }
                                    />

                                    <ResumoCard
                                        cores={cores}
                                        isDark={isDark}
                                        titulo="Valor total"
                                        valor={dinheiro(
                                            dados.totais.valorNota
                                        )}
                                        icon={
                                            <PaymentsOutlinedIcon fontSize="small" />
                                        }
                                        destaque
                                    />
                                </Box>

                                <Secao
                                    cores={cores}
                                    titulo="Dados da NF-e"
                                    icon={<DescriptionIcon fontSize="small" />}
                                    acao={
                                        <Button
                                            size="small"
                                            startIcon={<ContentCopyIcon />}
                                            onClick={() =>
                                                copiar(
                                                    String(
                                                        dados.chave
                                                    ).replace(/\D/g, ""),
                                                    "Chave de acesso"
                                                )
                                            }
                                            sx={{
                                                fontSize: "0.68rem",
                                                color: cores.primary
                                            }}
                                        >
                                            Copiar chave
                                        </Button>
                                    }
                                >
                                    <Box sx={gradeSx}>
                                        {campo({
                                            titulo: "Número",
                                            valor: dados.numero,
                                            xs: 2,
                                            destaque: true
                                        })}
                                        {campo({
                                            titulo: "Série",
                                            valor: dados.serie,
                                            xs: 2
                                        })}
                                        {campo({
                                            titulo: "Modelo",
                                            valor: dados.modelo,
                                            xs: 2
                                        })}
                                        {campo({
                                            titulo: "Emissão",
                                            valor: dataHoraBR(
                                                dados.dataEmissao
                                            ),
                                            xs: 3
                                        })}
                                        {campo({
                                            titulo: "Saída / entrada",
                                            valor: dataHoraBR(dados.dataSaida),
                                            xs: 3
                                        })}
                                        {campo({
                                            titulo: "Natureza da operação",
                                            valor: dados.natureza,
                                            xs: 6
                                        })}
                                        {campo({
                                            titulo: "Tipo",
                                            valor:
                                                dados.tipo === "0"
                                                    ? "Entrada"
                                                    : dados.tipo === "1"
                                                        ? "Saída"
                                                        : dados.tipo,
                                            xs: 2
                                        })}
                                        {campo({
                                            titulo: "Finalidade",
                                            valor: rotulo(
                                                MAPA_FINALIDADE,
                                                dados.finalidade,
                                                false
                                            ),
                                            xs: 4
                                        })}
                                        {campo({
                                            titulo: "Destino da operação",
                                            valor: rotulo(
                                                MAPA_DESTINO,
                                                dados.destinoOperacao,
                                                false
                                            ),
                                            xs: 3
                                        })}
                                        {campo({
                                            titulo: "Consumidor final",
                                            valor:
                                                dados.consumidorFinal === "1"
                                                    ? "Sim"
                                                    : dados.consumidorFinal ===
                                                        "0"
                                                        ? "Não"
                                                        : dados.consumidorFinal,
                                            xs: 2
                                        })}
                                        {campo({
                                            titulo: "Presença do comprador",
                                            valor: rotulo(
                                                MAPA_PRESENCA,
                                                dados.presenca,
                                                false
                                            ),
                                            xs: 4
                                        })}
                                        {campo({
                                            titulo: "Forma de emissão",
                                            valor: rotulo(
                                                MAPA_EMISSAO,
                                                dados.formaEmissao,
                                                false
                                            ),
                                            xs: 3
                                        })}
                                        {campo({
                                            titulo: "Ambiente",
                                            valor:
                                                dados.ambiente === "1"
                                                    ? "Produção"
                                                    : dados.ambiente === "2"
                                                        ? "Homologação"
                                                        : dados.ambiente,
                                            xs: 2
                                        })}
                                        {campo({
                                            titulo: "Versão do layout",
                                            valor: dados.versao,
                                            xs: 2
                                        })}
                                        {campo({
                                            titulo: "Protocolo de autorização",
                                            valor: dados.protocolo,
                                            xs: 4
                                        })}
                                        {campo({
                                            titulo: "Data do protocolo",
                                            valor: dataHoraBR(
                                                dados.dataProtocolo
                                            ),
                                            xs: 4
                                        })}
                                        {campo({
                                            titulo: "Situação na SEFAZ",
                                            valor: dados.motivoProtocolo
                                                ? `${dados.statusProtocolo} - ${dados.motivoProtocolo}`
                                                : "",
                                            xs: 12
                                        })}
                                        {campo({
                                            titulo: dados.chaveValida
                                                ? "Chave de acesso (dígito conferido)"
                                                : "Chave de acesso (dígito não confere)",
                                            valor: chaveFormatada(dados.chave),
                                            xs: 12,
                                            destaque: true
                                        })}
                                    </Box>

                                    {dados.dadosChave && (
                                        <Typography
                                            sx={{
                                                mt: 0.8,
                                                fontSize: "0.68rem",
                                                color: cores.textoSecundario
                                            }}
                                        >
                                            A chave indica UF{" "}
                                            {dados.dadosChave.uf}, competência{" "}
                                            {dados.dadosChave.competencia},
                                            modelo {dados.dadosChave.modelo},
                                            série {dados.dadosChave.serie} e
                                            nota {dados.dadosChave.numero}.
                                        </Typography>
                                    )}
                                </Secao>

                                <Secao
                                    cores={cores}
                                    titulo="Emitente"
                                    icon={
                                        <BusinessOutlinedIcon fontSize="small" />
                                    }
                                >
                                    <Box sx={gradeSx}>
                                        {campo({
                                            titulo: "Razão social",
                                            valor: dados.emitente.razaoSocial,
                                            xs: 6,
                                            destaque: true
                                        })}
                                        {campo({
                                            titulo: "Nome fantasia",
                                            valor: dados.emitente.fantasia,
                                            xs: 3
                                        })}
                                        {campo({
                                            titulo: "CNPJ / CPF",
                                            valor: documento(
                                                dados.emitente.cnpj ||
                                                dados.emitente.cpf
                                            ),
                                            xs: 3
                                        })}
                                        {campo({
                                            titulo: "Inscrição estadual",
                                            valor: dados.emitente.ie,
                                            xs: 3
                                        })}
                                        {campo({
                                            titulo: "IE substituto tributário",
                                            valor: dados.emitente.ieST,
                                            xs: 3
                                        })}
                                        {campo({
                                            titulo: "Inscrição municipal",
                                            valor: dados.emitente.im,
                                            xs: 3
                                        })}
                                        {campo({
                                            titulo: "Regime tributário",
                                            valor: rotulo(
                                                MAPA_CRT,
                                                dados.emitente.crt,
                                                false
                                            ),
                                            xs: 3
                                        })}
                                        {campo({
                                            titulo: "Endereço",
                                            valor: enderecoCompleto(
                                                dados.emitente
                                            ),
                                            xs: 7
                                        })}
                                        {campo({
                                            titulo: "CEP",
                                            valor: cepBR(dados.emitente.cep),
                                            xs: 2
                                        })}
                                        {campo({
                                            titulo: "Telefone",
                                            valor: telefoneBR(
                                                dados.emitente.fone
                                            ),
                                            xs: 3
                                        })}
                                    </Box>
                                </Secao>

                                <Secao
                                    cores={cores}
                                    titulo="Destinatário"
                                    icon={<PersonOutlineIcon fontSize="small" />}
                                >
                                    <Box sx={gradeSx}>
                                        {campo({
                                            titulo: "Razão social",
                                            valor: dados.destinatario
                                                .razaoSocial,
                                            xs: 6,
                                            destaque: true
                                        })}
                                        {campo({
                                            titulo: "CNPJ / CPF",
                                            valor: documento(
                                                dados.destinatario.cnpj ||
                                                dados.destinatario.cpf ||
                                                dados.destinatario
                                                    .estrangeiro
                                            ),
                                            xs: 3
                                        })}
                                        {campo({
                                            titulo: "Inscrição estadual",
                                            valor: dados.destinatario.ie,
                                            xs: 3
                                        })}
                                        {campo({
                                            titulo: "Endereço",
                                            valor: enderecoCompleto(
                                                dados.destinatario
                                            ),
                                            xs: 7
                                        })}
                                        {campo({
                                            titulo: "CEP",
                                            valor: cepBR(
                                                dados.destinatario.cep
                                            ),
                                            xs: 2
                                        })}
                                        {campo({
                                            titulo: "Telefone",
                                            valor: telefoneBR(
                                                dados.destinatario.fone
                                            ),
                                            xs: 3
                                        })}
                                        {campo({
                                            titulo: "E-mail",
                                            valor: dados.destinatario.email,
                                            xs: 6
                                        })}
                                        {campo({
                                            titulo: "Indicador de IE",
                                            valor:
                                                dados.destinatario
                                                    .indicadorIE === "1"
                                                    ? "Contribuinte de ICMS"
                                                    : dados.destinatario
                                                        .indicadorIE === "2"
                                                        ? "Isento de inscrição"
                                                        : dados.destinatario
                                                            .indicadorIE === "9"
                                                            ? "Não contribuinte"
                                                            : dados.destinatario
                                                                .indicadorIE,
                                            xs: 6
                                        })}
                                    </Box>
                                </Secao>

                                {(dados.entrega || dados.retirada) && (
                                    <Secao
                                        cores={cores}
                                        titulo="Local de entrega e retirada"
                                        icon={
                                            <PlaceOutlinedIcon fontSize="small" />
                                        }
                                    >
                                        <Box sx={gradeSx}>
                                            {dados.entrega && (
                                                <>
                                                    {campo({
                                                        titulo: "Entrega - documento",
                                                        valor: documento(
                                                            dados.entrega
                                                                .cnpj ||
                                                            dados.entrega
                                                                .cpf
                                                        ),
                                                        xs: 3
                                                    })}
                                                    {campo({
                                                        titulo: "Entrega - endereço",
                                                        valor: enderecoCompleto(
                                                            dados.entrega
                                                        ),
                                                        xs: 9
                                                    })}
                                                </>
                                            )}

                                            {dados.retirada && (
                                                <>
                                                    {campo({
                                                        titulo: "Retirada - documento",
                                                        valor: documento(
                                                            dados.retirada
                                                                .cnpj ||
                                                            dados.retirada
                                                                .cpf
                                                        ),
                                                        xs: 3
                                                    })}
                                                    {campo({
                                                        titulo: "Retirada - endereço",
                                                        valor: enderecoCompleto(
                                                            dados.retirada
                                                        ),
                                                        xs: 9
                                                    })}
                                                </>
                                            )}
                                        </Box>
                                    </Secao>
                                )}

                                <Box
                                    sx={{
                                        display: "flex",
                                        justifyContent: "flex-end",
                                        mt: 2,
                                        p: 2,
                                        bgcolor: alpha(
                                            cores.primary,
                                            isDark ? 0.12 : 0.05
                                        ),
                                        border: "1px solid",
                                        borderColor: alpha(cores.primary, 0.25),
                                        borderRadius: 2
                                    }}
                                >
                                    <Box sx={{ textAlign: "right" }}>
                                        <Typography
                                            sx={{
                                                fontSize: "0.65rem",
                                                color: cores.textoSecundario,
                                                fontWeight: 700
                                            }}
                                        >
                                            Valor total da NF-e
                                        </Typography>

                                        <Typography
                                            sx={{
                                                fontSize: "1.65rem",
                                                fontWeight: 900,
                                                color: cores.primary
                                            }}
                                        >
                                            {dinheiro(dados.totais.valorNota)}
                                        </Typography>
                                    </Box>
                                </Box>
                            </>
                        )}

                        {/* ==================== ABA 1 - ITENS ==================== */}

                        {aba === 1 && (
                            <>
                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        gap: 1.5,
                                        mb: 1.5,
                                        flexWrap: "wrap"
                                    }}
                                >
                                    <TextField
                                        size="small"
                                        value={buscaProduto}
                                        onChange={(evento) =>
                                            setBuscaProduto(evento.target.value)
                                        }
                                        placeholder="Buscar por descrição, código, NCM, CFOP ou EAN"
                                        sx={{
                                            minWidth: { xs: "100%", sm: 380 },
                                            "& .MuiOutlinedInput-root": {
                                                bgcolor: cores.input
                                            }
                                        }}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <SearchIcon
                                                        fontSize="small"
                                                        sx={{
                                                            color: cores.textoSecundario
                                                        }}
                                                    />
                                                </InputAdornment>
                                            )
                                        }}
                                    />

                                    <Button
                                        size="small"
                                        variant="outlined"
                                        startIcon={<TableChartOutlinedIcon />}
                                        onClick={baixarCSV}
                                        sx={{
                                            borderColor: cores.primary,
                                            color: cores.primary
                                        }}
                                    >
                                        Exportar itens
                                    </Button>
                                </Box>

                                <Box
                                    sx={{
                                        overflowX: "auto",
                                        border: "1px solid",
                                        borderColor: cores.divider,
                                        borderRadius: 2,
                                        bgcolor: cores.card,
                                        mb: 2
                                    }}
                                >
                                    <Table size="small" sx={tabelaSx}>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell sx={{ width: 40 }} />

                                                {[
                                                    {
                                                        campo: "numero",
                                                        rotulo: "Item"
                                                    },
                                                    {
                                                        campo: "codigo",
                                                        rotulo: "Código"
                                                    },
                                                    {
                                                        campo: "descricao",
                                                        rotulo: "Descrição"
                                                    },
                                                    {
                                                        campo: "ncm",
                                                        rotulo: "NCM"
                                                    },
                                                    {
                                                        campo: "cfop",
                                                        rotulo: "CFOP"
                                                    }
                                                ].map((coluna) => (
                                                    <TableCell
                                                        key={coluna.campo}
                                                    >
                                                        <TableSortLabel
                                                            active={
                                                                ordem.campo ===
                                                                coluna.campo
                                                            }
                                                            direction={
                                                                ordem.direcao
                                                            }
                                                            onClick={() =>
                                                                ordenarPor(
                                                                    coluna.campo
                                                                )
                                                            }
                                                        >
                                                            {coluna.rotulo}
                                                        </TableSortLabel>
                                                    </TableCell>
                                                ))}

                                                <TableCell>Un.</TableCell>

                                                <TableCell align="right">
                                                    <TableSortLabel
                                                        active={
                                                            ordem.campo ===
                                                            "quantidade"
                                                        }
                                                        direction={ordem.direcao}
                                                        onClick={() =>
                                                            ordenarPor(
                                                                "quantidade"
                                                            )
                                                        }
                                                    >
                                                        Qtd.
                                                    </TableSortLabel>
                                                </TableCell>

                                                <TableCell align="right">
                                                    Vl. unitário
                                                </TableCell>

                                                <TableCell align="right">
                                                    <TableSortLabel
                                                        active={
                                                            ordem.campo ===
                                                            "valorTotal"
                                                        }
                                                        direction={ordem.direcao}
                                                        onClick={() =>
                                                            ordenarPor(
                                                                "valorTotal"
                                                            )
                                                        }
                                                    >
                                                        Vl. total
                                                    </TableSortLabel>
                                                </TableCell>
                                            </TableRow>
                                        </TableHead>

                                        <TableBody>
                                            {produtosVisiveis.length === 0 ? (
                                                <TableRow>
                                                    <TableCell
                                                        colSpan={10}
                                                        align="center"
                                                    >
                                                        {buscaProduto
                                                            ? "Nenhum item corresponde à busca."
                                                            : "Esta nota não tem itens."}
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                produtosVisiveis.map(
                                                    (produto, indice) => {
                                                        const aberto =
                                                            itemAberto ===
                                                            `${produto.numero}-${indice}`;

                                                        const tributos =
                                                            produto.tributos;

                                                        return (
                                                            <Fragment key={`item-${produto.numero}-${indice}`}>
                                                                <TableRow
                                                                    key={`linha-${produto.numero}-${indice}`}
                                                                    hover
                                                                    sx={{
                                                                        cursor: "pointer"
                                                                    }}
                                                                    onClick={() =>
                                                                        setItemAberto(
                                                                            aberto
                                                                                ? null
                                                                                : `${produto.numero}-${indice}`
                                                                        )
                                                                    }
                                                                >
                                                                    <TableCell>
                                                                        <IconButton
                                                                            size="small"
                                                                            sx={{
                                                                                color: cores.textoSecundario
                                                                            }}
                                                                        >
                                                                            {aberto ? (
                                                                                <KeyboardArrowUpIcon fontSize="small" />
                                                                            ) : (
                                                                                <KeyboardArrowDownIcon fontSize="small" />
                                                                            )}
                                                                        </IconButton>
                                                                    </TableCell>

                                                                    <TableCell>
                                                                        {
                                                                            produto.numero
                                                                        }
                                                                    </TableCell>

                                                                    <TableCell>
                                                                        {
                                                                            produto.codigo
                                                                        }
                                                                    </TableCell>

                                                                    <TableCell
                                                                        sx={{
                                                                            minWidth: 280,
                                                                            fontWeight: 600
                                                                        }}
                                                                    >
                                                                        {
                                                                            produto.descricao
                                                                        }
                                                                    </TableCell>

                                                                    <TableCell>
                                                                        {produto.ncm ||
                                                                            "-"}
                                                                    </TableCell>

                                                                    <TableCell>
                                                                        {produto.cfop ||
                                                                            "-"}
                                                                    </TableCell>

                                                                    <TableCell>
                                                                        {produto.unidade ||
                                                                            "-"}
                                                                    </TableCell>

                                                                    <TableCell align="right">
                                                                        {decimal(
                                                                            produto.quantidade
                                                                        )}
                                                                    </TableCell>

                                                                    <TableCell align="right">
                                                                        {dinheiro(
                                                                            produto.valorUnitario
                                                                        )}
                                                                    </TableCell>

                                                                    <TableCell
                                                                        align="right"
                                                                        sx={{
                                                                            fontWeight: 800,
                                                                            color: cores.primary
                                                                        }}
                                                                    >
                                                                        {dinheiro(
                                                                            produto.valorTotal
                                                                        )}
                                                                    </TableCell>
                                                                </TableRow>

                                                                <TableRow
                                                                    key={`detalhe-${produto.numero}-${indice}`}
                                                                >
                                                                    <TableCell
                                                                        colSpan={
                                                                            10
                                                                        }
                                                                        sx={{
                                                                            p: 0,
                                                                            borderBottom:
                                                                                aberto
                                                                                    ? undefined
                                                                                    : "none"
                                                                        }}
                                                                    >
                                                                        <Collapse
                                                                            in={
                                                                                aberto
                                                                            }
                                                                            unmountOnExit
                                                                        >
                                                                            <Box
                                                                                sx={{
                                                                                    p: 1.5,
                                                                                    bgcolor:
                                                                                        alpha(
                                                                                            cores.primary,
                                                                                            isDark
                                                                                                ? 0.06
                                                                                                : 0.025
                                                                                        )
                                                                                }}
                                                                            >
                                                                                <Box
                                                                                    sx={
                                                                                        gradeSx
                                                                                    }
                                                                                >
                                                                                    {campo(
                                                                                        {
                                                                                            titulo: "EAN comercial",
                                                                                            valor: produto.ean,
                                                                                            xs: 3
                                                                                        }
                                                                                    )}
                                                                                    {campo(
                                                                                        {
                                                                                            titulo: "CEST",
                                                                                            valor: produto.cest,
                                                                                            xs: 2
                                                                                        }
                                                                                    )}
                                                                                    {campo(
                                                                                        {
                                                                                            titulo: "Unidade tributável",
                                                                                            valor: `${produto.quantidadeTrib ? decimal(produto.quantidadeTrib) : "-"} ${produto.unidadeTrib || ""}`,
                                                                                            xs: 3
                                                                                        }
                                                                                    )}
                                                                                    {campo(
                                                                                        {
                                                                                            titulo: "Valor unit. tributável",
                                                                                            valor: dinheiro(
                                                                                                produto.valorUnitarioTrib
                                                                                            ),
                                                                                            xs: 2
                                                                                        }
                                                                                    )}
                                                                                    {campo(
                                                                                        {
                                                                                            titulo: "Compõe o total",
                                                                                            valor:
                                                                                                produto.compoeTotal ===
                                                                                                    "1"
                                                                                                    ? "Sim"
                                                                                                    : produto.compoeTotal ===
                                                                                                        "0"
                                                                                                        ? "Não"
                                                                                                        : "-",
                                                                                            xs: 2
                                                                                        }
                                                                                    )}

                                                                                    {campo(
                                                                                        {
                                                                                            titulo: "Desconto",
                                                                                            valor: dinheiro(
                                                                                                produto.desconto
                                                                                            ),
                                                                                            xs: 3
                                                                                        }
                                                                                    )}
                                                                                    {campo(
                                                                                        {
                                                                                            titulo: "Frete",
                                                                                            valor: dinheiro(
                                                                                                produto.frete
                                                                                            ),
                                                                                            xs: 3
                                                                                        }
                                                                                    )}
                                                                                    {campo(
                                                                                        {
                                                                                            titulo: "Seguro",
                                                                                            valor: dinheiro(
                                                                                                produto.seguro
                                                                                            ),
                                                                                            xs: 3
                                                                                        }
                                                                                    )}
                                                                                    {campo(
                                                                                        {
                                                                                            titulo: "Outras despesas",
                                                                                            valor: dinheiro(
                                                                                                produto.outras
                                                                                            ),
                                                                                            xs: 3
                                                                                        }
                                                                                    )}

                                                                                    {campo(
                                                                                        {
                                                                                            titulo: "Origem da mercadoria",
                                                                                            valor: rotulo(
                                                                                                MAPA_ORIGEM,
                                                                                                tributos
                                                                                                    .icms
                                                                                                    .origem
                                                                                            ),
                                                                                            xs: 6
                                                                                        }
                                                                                    )}
                                                                                    {campo(
                                                                                        {
                                                                                            titulo: "CST / CSOSN do ICMS",
                                                                                            valor: tributos
                                                                                                .icms
                                                                                                .csosn
                                                                                                ? rotulo(
                                                                                                    MAPA_CSOSN,
                                                                                                    tributos
                                                                                                        .icms
                                                                                                        .csosn
                                                                                                )
                                                                                                : rotulo(
                                                                                                    MAPA_CST_ICMS,
                                                                                                    tributos
                                                                                                        .icms
                                                                                                        .cst
                                                                                                ),
                                                                                            xs: 6
                                                                                        }
                                                                                    )}

                                                                                    {campo(
                                                                                        {
                                                                                            titulo: "Base ICMS",
                                                                                            valor: dinheiro(
                                                                                                tributos
                                                                                                    .icms
                                                                                                    .base
                                                                                            ),
                                                                                            xs: 3
                                                                                        }
                                                                                    )}
                                                                                    {campo(
                                                                                        {
                                                                                            titulo: "Alíquota ICMS",
                                                                                            valor: percentual(
                                                                                                tributos
                                                                                                    .icms
                                                                                                    .aliquota
                                                                                            ),
                                                                                            xs: 3
                                                                                        }
                                                                                    )}
                                                                                    {campo(
                                                                                        {
                                                                                            titulo: "Valor ICMS",
                                                                                            valor: dinheiro(
                                                                                                tributos
                                                                                                    .icms
                                                                                                    .valor
                                                                                            ),
                                                                                            xs: 3,
                                                                                            destaque: true
                                                                                        }
                                                                                    )}
                                                                                    {campo(
                                                                                        {
                                                                                            titulo: "Valor ICMS ST",
                                                                                            valor: dinheiro(
                                                                                                tributos
                                                                                                    .icms
                                                                                                    .valorST
                                                                                            ),
                                                                                            xs: 3
                                                                                        }
                                                                                    )}

                                                                                    {campo(
                                                                                        {
                                                                                            titulo: "IPI",
                                                                                            valor: `${dinheiro(tributos.ipi.valor)} (${percentual(tributos.ipi.aliquota)})`,
                                                                                            xs: 3
                                                                                        }
                                                                                    )}
                                                                                    {campo(
                                                                                        {
                                                                                            titulo: "PIS",
                                                                                            valor: `${dinheiro(tributos.pis.valor)} (${percentual(tributos.pis.aliquota)})`,
                                                                                            xs: 3
                                                                                        }
                                                                                    )}
                                                                                    {campo(
                                                                                        {
                                                                                            titulo: "COFINS",
                                                                                            valor: `${dinheiro(tributos.cofins.valor)} (${percentual(tributos.cofins.aliquota)})`,
                                                                                            xs: 3
                                                                                        }
                                                                                    )}
                                                                                    {campo(
                                                                                        {
                                                                                            titulo: "Tributos aproximados",
                                                                                            valor: dinheiro(
                                                                                                tributos.totalTributos
                                                                                            ),
                                                                                            xs: 3
                                                                                        }
                                                                                    )}

                                                                                    {produto.rastreio &&
                                                                                        campo(
                                                                                            {
                                                                                                titulo: "Lote",
                                                                                                valor: `${produto.rastreio.lote} • validade ${dataBR(produto.rastreio.validade)}`,
                                                                                                xs: 6
                                                                                            }
                                                                                        )}

                                                                                    {produto.pedido &&
                                                                                        campo(
                                                                                            {
                                                                                                titulo: "Pedido de compra",
                                                                                                valor: `${produto.pedido}${produto.itemPedido ? ` / item ${produto.itemPedido}` : ""}`,
                                                                                                xs: 6
                                                                                            }
                                                                                        )}
                                                                                </Box>

                                                                                {produto.observacao && (
                                                                                    <Typography
                                                                                        sx={{
                                                                                            mt: 1,
                                                                                            fontSize:
                                                                                                "0.72rem",
                                                                                            color: cores.textoSecundario,
                                                                                            whiteSpace:
                                                                                                "pre-wrap"
                                                                                        }}
                                                                                    >
                                                                                        {
                                                                                            produto.observacao
                                                                                        }
                                                                                    </Typography>
                                                                                )}
                                                                            </Box>
                                                                        </Collapse>
                                                                    </TableCell>
                                                                </TableRow>
                                                            </Fragment>
                                                        );
                                                    }
                                                )
                                            )}
                                        </TableBody>
                                    </Table>
                                </Box>

                                <Box
                                    sx={{
                                        display: "grid",
                                        gridTemplateColumns: {
                                            xs: "1fr 1fr",
                                            md: "repeat(4, 1fr)"
                                        },
                                        gap: 1
                                    }}
                                >
                                    <ResumoCard
                                        cores={cores}
                                        isDark={isDark}
                                        titulo={
                                            buscaProduto
                                                ? "Itens filtrados"
                                                : "Itens da nota"
                                        }
                                        valor={produtosVisiveis.length}
                                        icon={
                                            <Inventory2OutlinedIcon fontSize="small" />
                                        }
                                    />

                                    <ResumoCard
                                        cores={cores}
                                        isDark={isDark}
                                        titulo="Quantidade somada"
                                        valor={decimal(
                                            totaisVisiveis.quantidade,
                                            3
                                        )}
                                        icon={
                                            <TableChartOutlinedIcon fontSize="small" />
                                        }
                                    />

                                    <ResumoCard
                                        cores={cores}
                                        isDark={isDark}
                                        titulo="Descontos"
                                        valor={dinheiro(
                                            totaisVisiveis.desconto
                                        )}
                                        icon={
                                            <PercentOutlinedIcon fontSize="small" />
                                        }
                                    />

                                    <ResumoCard
                                        cores={cores}
                                        isDark={isDark}
                                        titulo="Valor somado"
                                        valor={dinheiro(totaisVisiveis.valor)}
                                        icon={
                                            <PaymentsOutlinedIcon fontSize="small" />
                                        }
                                        destaque
                                    />
                                </Box>
                            </>
                        )}

                        {/* ==================== ABA 2 - IMPOSTOS ==================== */}

                        {aba === 2 && (
                            <>
                                <Secao
                                    cores={cores}
                                    titulo="Totais da nota"
                                    icon={
                                        <PaymentsOutlinedIcon fontSize="small" />
                                    }
                                >
                                    <Box sx={gradeSx}>
                                        {campo({
                                            titulo: "Base de cálculo do ICMS",
                                            valor: dinheiro(
                                                dados.totais.baseICMS
                                            ),
                                            xs: 3
                                        })}
                                        {campo({
                                            titulo: "Valor do ICMS",
                                            valor: dinheiro(
                                                dados.totais.valorICMS
                                            ),
                                            xs: 3,
                                            destaque: true
                                        })}
                                        {campo({
                                            titulo: "Base do ICMS ST",
                                            valor: dinheiro(
                                                dados.totais.baseICMSST
                                            ),
                                            xs: 3
                                        })}
                                        {campo({
                                            titulo: "Valor do ICMS ST",
                                            valor: dinheiro(
                                                dados.totais.valorICMSST
                                            ),
                                            xs: 3
                                        })}
                                        {campo({
                                            titulo: "FCP",
                                            valor: dinheiro(dados.totais.fcp),
                                            xs: 3
                                        })}
                                        {campo({
                                            titulo: "FCP retido por ST",
                                            valor: dinheiro(dados.totais.fcpST),
                                            xs: 3
                                        })}
                                        {campo({
                                            titulo: "ICMS desonerado",
                                            valor: dinheiro(
                                                dados.totais.icmsDesonerado
                                            ),
                                            xs: 3
                                        })}
                                        {campo({
                                            titulo: "Imposto de importação",
                                            valor: dinheiro(
                                                dados.totais.valorII
                                            ),
                                            xs: 3
                                        })}
                                        {campo({
                                            titulo: "IPI",
                                            valor: dinheiro(
                                                dados.totais.valorIPI
                                            ),
                                            xs: 3
                                        })}
                                        {campo({
                                            titulo: "IPI devolvido",
                                            valor: dinheiro(
                                                dados.totais.ipiDevolvido
                                            ),
                                            xs: 3
                                        })}
                                        {campo({
                                            titulo: "PIS",
                                            valor: dinheiro(
                                                dados.totais.valorPIS
                                            ),
                                            xs: 3
                                        })}
                                        {campo({
                                            titulo: "COFINS",
                                            valor: dinheiro(
                                                dados.totais.valorCOFINS
                                            ),
                                            xs: 3
                                        })}
                                        {campo({
                                            titulo: "Produtos",
                                            valor: dinheiro(
                                                dados.totais.valorProdutos
                                            ),
                                            xs: 3
                                        })}
                                        {campo({
                                            titulo: "Frete",
                                            valor: dinheiro(
                                                dados.totais.valorFrete
                                            ),
                                            xs: 3
                                        })}
                                        {campo({
                                            titulo: "Seguro",
                                            valor: dinheiro(
                                                dados.totais.valorSeguro
                                            ),
                                            xs: 3
                                        })}
                                        {campo({
                                            titulo: "Outras despesas",
                                            valor: dinheiro(
                                                dados.totais.outrasDespesas
                                            ),
                                            xs: 3
                                        })}
                                        {campo({
                                            titulo: "Desconto",
                                            valor: dinheiro(
                                                dados.totais.desconto
                                            ),
                                            xs: 3
                                        })}
                                        {campo({
                                            titulo: "Tributos aproximados",
                                            valor: dinheiro(
                                                dados.totais.totalTributos
                                            ),
                                            xs: 3
                                        })}
                                        {campo({
                                            titulo: "Total da NF-e",
                                            valor: dinheiro(
                                                dados.totais.valorNota
                                            ),
                                            xs: 6,
                                            destaque: true
                                        })}
                                    </Box>
                                </Secao>

                                <Secao
                                    cores={cores}
                                    titulo="Tributos por item"
                                    icon={
                                        <PercentOutlinedIcon fontSize="small" />
                                    }
                                >
                                    <Box
                                        sx={{
                                            overflowX: "auto",
                                            border: "1px solid",
                                            borderColor: cores.divider,
                                            borderRadius: 2,
                                            bgcolor: cores.card
                                        }}
                                    >
                                        <Table size="small" sx={tabelaSx}>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Item</TableCell>
                                                    <TableCell>
                                                        Descrição
                                                    </TableCell>
                                                    <TableCell>
                                                        CST / CSOSN
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        Base ICMS
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        Alíq.
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        ICMS
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        ICMS ST
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        IPI
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        PIS
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        COFINS
                                                    </TableCell>
                                                </TableRow>
                                            </TableHead>

                                            <TableBody>
                                                {dados.produtos.map(
                                                    (produto, indice) => (
                                                        <TableRow
                                                            key={`imposto-${indice}`}
                                                            hover
                                                        >
                                                            <TableCell>
                                                                {produto.numero}
                                                            </TableCell>

                                                            <TableCell
                                                                sx={{
                                                                    maxWidth: 260,
                                                                    overflow:
                                                                        "hidden",
                                                                    textOverflow:
                                                                        "ellipsis",
                                                                    whiteSpace:
                                                                        "nowrap"
                                                                }}
                                                                title={
                                                                    produto.descricao
                                                                }
                                                            >
                                                                {
                                                                    produto.descricao
                                                                }
                                                            </TableCell>

                                                            <TableCell>
                                                                {produto.tributos
                                                                    .icms
                                                                    .csosn ||
                                                                    produto
                                                                        .tributos
                                                                        .icms
                                                                        .cst ||
                                                                    "-"}
                                                            </TableCell>

                                                            <TableCell align="right">
                                                                {dinheiro(
                                                                    produto
                                                                        .tributos
                                                                        .icms
                                                                        .base
                                                                )}
                                                            </TableCell>

                                                            <TableCell align="right">
                                                                {percentual(
                                                                    produto
                                                                        .tributos
                                                                        .icms
                                                                        .aliquota
                                                                )}
                                                            </TableCell>

                                                            <TableCell align="right">
                                                                {dinheiro(
                                                                    produto
                                                                        .tributos
                                                                        .icms
                                                                        .valor
                                                                )}
                                                            </TableCell>

                                                            <TableCell align="right">
                                                                {dinheiro(
                                                                    produto
                                                                        .tributos
                                                                        .icms
                                                                        .valorST
                                                                )}
                                                            </TableCell>

                                                            <TableCell align="right">
                                                                {dinheiro(
                                                                    produto
                                                                        .tributos
                                                                        .ipi
                                                                        .valor
                                                                )}
                                                            </TableCell>

                                                            <TableCell align="right">
                                                                {dinheiro(
                                                                    produto
                                                                        .tributos
                                                                        .pis
                                                                        .valor
                                                                )}
                                                            </TableCell>

                                                            <TableCell align="right">
                                                                {dinheiro(
                                                                    produto
                                                                        .tributos
                                                                        .cofins
                                                                        .valor
                                                                )}
                                                            </TableCell>
                                                        </TableRow>
                                                    )
                                                )}
                                            </TableBody>
                                        </Table>
                                    </Box>
                                </Secao>

                                {dados.issqn && (
                                    <Secao
                                        cores={cores}
                                        titulo="ISSQN"
                                        icon={
                                            <ReceiptLongOutlinedIcon fontSize="small" />
                                        }
                                    >
                                        <Box sx={gradeSx}>
                                            {campo({
                                                titulo: "Serviços",
                                                valor: dinheiro(
                                                    dados.issqn.servicos
                                                ),
                                                xs: 4
                                            })}
                                            {campo({
                                                titulo: "Base de cálculo",
                                                valor: dinheiro(
                                                    dados.issqn.base
                                                ),
                                                xs: 4
                                            })}
                                            {campo({
                                                titulo: "Valor do ISS",
                                                valor: dinheiro(
                                                    dados.issqn.valor
                                                ),
                                                xs: 4
                                            })}
                                        </Box>
                                    </Secao>
                                )}

                                {dados.retencoes && (
                                    <Secao
                                        cores={cores}
                                        titulo="Retenções de tributos"
                                        icon={
                                            <PercentOutlinedIcon fontSize="small" />
                                        }
                                    >
                                        <Box sx={gradeSx}>
                                            {campo({
                                                titulo: "PIS retido",
                                                valor: dinheiro(
                                                    dados.retencoes.pis
                                                ),
                                                xs: 3
                                            })}
                                            {campo({
                                                titulo: "COFINS retido",
                                                valor: dinheiro(
                                                    dados.retencoes.cofins
                                                ),
                                                xs: 3
                                            })}
                                            {campo({
                                                titulo: "CSLL retido",
                                                valor: dinheiro(
                                                    dados.retencoes.csll
                                                ),
                                                xs: 3
                                            })}
                                            {campo({
                                                titulo: "IRRF",
                                                valor: dinheiro(
                                                    dados.retencoes.irrf
                                                ),
                                                xs: 3
                                            })}
                                            {campo({
                                                titulo: "Base da previdência",
                                                valor: dinheiro(
                                                    dados.retencoes.basePrev
                                                ),
                                                xs: 3
                                            })}
                                            {campo({
                                                titulo: "Previdência retida",
                                                valor: dinheiro(
                                                    dados.retencoes.prev
                                                ),
                                                xs: 3
                                            })}
                                        </Box>
                                    </Secao>
                                )}
                            </>
                        )}

                        {/* ==================== ABA 3 - TRANSPORTE ==================== */}

                        {aba === 3 && (
                            <>
                                <Secao
                                    cores={cores}
                                    titulo="Transportadora"
                                    icon={
                                        <LocalShippingOutlinedIcon fontSize="small" />
                                    }
                                >
                                    <Box sx={gradeSx}>
                                        {campo({
                                            titulo: "Modalidade do frete",
                                            valor: rotulo(
                                                MAPA_MODALIDADE_FRETE,
                                                dados.transporte.modalidade,
                                                false
                                            ),
                                            xs: 4,
                                            destaque: true
                                        })}
                                        {campo({
                                            titulo: "Razão social",
                                            valor: dados.transporte.nome,
                                            xs: 5
                                        })}
                                        {campo({
                                            titulo: "CNPJ / CPF",
                                            valor: documento(
                                                dados.transporte.cnpj ||
                                                dados.transporte.cpf
                                            ),
                                            xs: 3
                                        })}
                                        {campo({
                                            titulo: "Inscrição estadual",
                                            valor: dados.transporte.ie,
                                            xs: 3
                                        })}
                                        {campo({
                                            titulo: "Endereço",
                                            valor: dados.transporte.endereco,
                                            xs: 5
                                        })}
                                        {campo({
                                            titulo: "Município",
                                            valor: dados.transporte.cidade,
                                            xs: 3
                                        })}
                                        {campo({
                                            titulo: "UF",
                                            valor: dados.transporte.uf,
                                            xs: 1
                                        })}
                                    </Box>
                                </Secao>

                                {(dados.transporte.veiculo ||
                                    dados.transporte.reboques.length > 0) && (
                                        <Secao
                                            cores={cores}
                                            titulo="Veículo e reboques"
                                            icon={
                                                <LocalShippingOutlinedIcon fontSize="small" />
                                            }
                                        >
                                            <Box sx={gradeSx}>
                                                {dados.transporte.veiculo && (
                                                    <>
                                                        {campo({
                                                            titulo: "Placa",
                                                            valor: dados.transporte
                                                                .veiculo.placa,
                                                            xs: 3,
                                                            destaque: true
                                                        })}
                                                        {campo({
                                                            titulo: "UF do veículo",
                                                            valor: dados.transporte
                                                                .veiculo.uf,
                                                            xs: 2
                                                        })}
                                                        {campo({
                                                            titulo: "RNTC",
                                                            valor: dados.transporte
                                                                .veiculo.rntc,
                                                            xs: 3
                                                        })}
                                                    </>
                                                )}

                                                {dados.transporte.reboques.map(
                                                    (reboque, indice) => (
                                                        <Campo
                                                            key={`reboque-${indice}`}
                                                            cores={cores}
                                                            isDark={isDark}
                                                            titulo={`Reboque ${indice + 1}`}
                                                            valor={`${reboque.placa} - ${reboque.uf}`}
                                                            xs={4}
                                                        />
                                                    )
                                                )}
                                            </Box>
                                        </Secao>
                                    )}

                                <Secao
                                    cores={cores}
                                    titulo="Volumes transportados"
                                    icon={
                                        <Inventory2OutlinedIcon fontSize="small" />
                                    }
                                >
                                    {dados.transporte.volumes.length === 0 ? (
                                        <VazioLista
                                            cores={cores}
                                            texto="A nota não informa volumes."
                                        />
                                    ) : (
                                        <Box
                                            sx={{
                                                overflowX: "auto",
                                                border: "1px solid",
                                                borderColor: cores.divider,
                                                borderRadius: 2
                                            }}
                                        >
                                            <Table size="small" sx={tabelaSx}>
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell>
                                                            Quantidade
                                                        </TableCell>
                                                        <TableCell>
                                                            Espécie
                                                        </TableCell>
                                                        <TableCell>
                                                            Marca
                                                        </TableCell>
                                                        <TableCell>
                                                            Numeração
                                                        </TableCell>
                                                        <TableCell>
                                                            Lacres
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            Peso bruto
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            Peso líquido
                                                        </TableCell>
                                                    </TableRow>
                                                </TableHead>

                                                <TableBody>
                                                    {dados.transporte.volumes.map(
                                                        (volume, indice) => (
                                                            <TableRow
                                                                key={`volume-${indice}`}
                                                                hover
                                                            >
                                                                <TableCell>
                                                                    {decimal(
                                                                        volume.quantidade,
                                                                        0
                                                                    )}
                                                                </TableCell>
                                                                <TableCell>
                                                                    {volume.especie ||
                                                                        "-"}
                                                                </TableCell>
                                                                <TableCell>
                                                                    {volume.marca ||
                                                                        "-"}
                                                                </TableCell>
                                                                <TableCell>
                                                                    {volume.numeracao ||
                                                                        "-"}
                                                                </TableCell>
                                                                <TableCell>
                                                                    {volume
                                                                        .lacres
                                                                        .length
                                                                        ? volume.lacres.join(
                                                                            ", "
                                                                        )
                                                                        : "-"}
                                                                </TableCell>
                                                                <TableCell align="right">
                                                                    {decimal(
                                                                        volume.pesoBruto,
                                                                        3
                                                                    )}
                                                                </TableCell>
                                                                <TableCell align="right">
                                                                    {decimal(
                                                                        volume.pesoLiquido,
                                                                        3
                                                                    )}
                                                                </TableCell>
                                                            </TableRow>
                                                        )
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </Box>
                                    )}
                                </Secao>

                                {dados.transporte.retencao && (
                                    <Secao
                                        cores={cores}
                                        titulo="ICMS retido sobre o frete"
                                        icon={
                                            <PercentOutlinedIcon fontSize="small" />
                                        }
                                    >
                                        <Box sx={gradeSx}>
                                            {campo({
                                                titulo: "Valor do serviço",
                                                valor: dinheiro(
                                                    dados.transporte.retencao
                                                        .servico
                                                ),
                                                xs: 3
                                            })}
                                            {campo({
                                                titulo: "Base de cálculo",
                                                valor: dinheiro(
                                                    dados.transporte.retencao
                                                        .base
                                                ),
                                                xs: 3
                                            })}
                                            {campo({
                                                titulo: "Alíquota",
                                                valor: percentual(
                                                    dados.transporte.retencao
                                                        .aliquota
                                                ),
                                                xs: 3
                                            })}
                                            {campo({
                                                titulo: "ICMS retido",
                                                valor: dinheiro(
                                                    dados.transporte.retencao
                                                        .valor
                                                ),
                                                xs: 3
                                            })}
                                        </Box>
                                    </Secao>
                                )}

                                <Box
                                    sx={{
                                        display: "grid",
                                        gridTemplateColumns: {
                                            xs: "1fr 1fr",
                                            md: "repeat(3, 1fr)"
                                        },
                                        gap: 1
                                    }}
                                >
                                    <ResumoCard
                                        cores={cores}
                                        isDark={isDark}
                                        titulo="Volumes"
                                        valor={decimal(
                                            dados.transporte.volumes.reduce(
                                                (soma, volume) =>
                                                    soma + num(volume.quantidade),
                                                0
                                            ),
                                            0
                                        )}
                                        icon={
                                            <Inventory2OutlinedIcon fontSize="small" />
                                        }
                                    />

                                    <ResumoCard
                                        cores={cores}
                                        isDark={isDark}
                                        titulo="Peso bruto total"
                                        valor={decimal(
                                            dados.transporte.volumes.reduce(
                                                (soma, volume) =>
                                                    soma + num(volume.pesoBruto),
                                                0
                                            ),
                                            3
                                        )}
                                        icon={
                                            <LocalShippingOutlinedIcon fontSize="small" />
                                        }
                                    />

                                    <ResumoCard
                                        cores={cores}
                                        isDark={isDark}
                                        titulo="Valor do frete"
                                        valor={dinheiro(
                                            dados.totais.valorFrete
                                        )}
                                        icon={
                                            <PaymentsOutlinedIcon fontSize="small" />
                                        }
                                        destaque
                                    />
                                </Box>
                            </>
                        )}

                        {/* ==================== ABA 4 - COBRANÇA ==================== */}

                        {aba === 4 && (
                            <>
                                <Secao
                                    cores={cores}
                                    titulo="Fatura"
                                    icon={
                                        <ReceiptLongOutlinedIcon fontSize="small" />
                                    }
                                >
                                    {dados.fatura ? (
                                        <Box sx={gradeSx}>
                                            {campo({
                                                titulo: "Número da fatura",
                                                valor: dados.fatura.numero,
                                                xs: 3,
                                                destaque: true
                                            })}
                                            {campo({
                                                titulo: "Valor original",
                                                valor: dinheiro(
                                                    dados.fatura.original
                                                ),
                                                xs: 3
                                            })}
                                            {campo({
                                                titulo: "Desconto",
                                                valor: dinheiro(
                                                    dados.fatura.desconto
                                                ),
                                                xs: 3
                                            })}
                                            {campo({
                                                titulo: "Valor líquido",
                                                valor: dinheiro(
                                                    dados.fatura.liquido
                                                ),
                                                xs: 3
                                            })}
                                        </Box>
                                    ) : (
                                        <VazioLista
                                            cores={cores}
                                            texto="A nota não tem fatura informada."
                                        />
                                    )}
                                </Secao>

                                <Secao
                                    cores={cores}
                                    titulo={`Duplicatas (${dados.duplicatas.length})`}
                                    icon={
                                        <EventNoteOutlinedIcon fontSize="small" />
                                    }
                                >
                                    {dados.duplicatas.length === 0 ? (
                                        <VazioLista
                                            cores={cores}
                                            texto="Nenhuma duplicata nesta nota."
                                        />
                                    ) : (
                                        <Box
                                            sx={{
                                                overflowX: "auto",
                                                border: "1px solid",
                                                borderColor: cores.divider,
                                                borderRadius: 2
                                            }}
                                        >
                                            <Table size="small" sx={tabelaSx}>
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell>
                                                            Parcela
                                                        </TableCell>
                                                        <TableCell>
                                                            Vencimento
                                                        </TableCell>
                                                        <TableCell>
                                                            Situação
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            Valor
                                                        </TableCell>
                                                    </TableRow>
                                                </TableHead>

                                                <TableBody>
                                                    {dados.duplicatas.map(
                                                        (dup, indice) => {
                                                            const vencida =
                                                                dup.vencimento &&
                                                                new Date(
                                                                    `${dup.vencimento}T23:59:59`
                                                                ) < new Date();

                                                            return (
                                                                <TableRow
                                                                    key={`dup-${indice}`}
                                                                    hover
                                                                >
                                                                    <TableCell>
                                                                        {dup.numero ||
                                                                            indice +
                                                                            1}
                                                                    </TableCell>

                                                                    <TableCell>
                                                                        {dataBR(
                                                                            dup.vencimento
                                                                        )}
                                                                    </TableCell>

                                                                    <TableCell>
                                                                        <Chip
                                                                            size="small"
                                                                            label={
                                                                                vencida
                                                                                    ? "Vencida"
                                                                                    : "A vencer"
                                                                            }
                                                                            sx={{
                                                                                height: 20,
                                                                                fontSize:
                                                                                    "0.6rem",
                                                                                fontWeight: 700,
                                                                                color: vencida
                                                                                    ? cores.warning
                                                                                    : cores.sucesso,
                                                                                bgcolor:
                                                                                    alpha(
                                                                                        vencida
                                                                                            ? cores.warning
                                                                                            : cores.sucesso,
                                                                                        0.12
                                                                                    )
                                                                            }}
                                                                        />
                                                                    </TableCell>

                                                                    <TableCell align="right">
                                                                        {dinheiro(
                                                                            dup.valor
                                                                        )}
                                                                    </TableCell>
                                                                </TableRow>
                                                            );
                                                        }
                                                    )}

                                                    <TableRow>
                                                        <TableCell
                                                            colSpan={3}
                                                            sx={{
                                                                fontWeight: 800
                                                            }}
                                                        >
                                                            Total das duplicatas
                                                        </TableCell>

                                                        <TableCell
                                                            align="right"
                                                            sx={{
                                                                fontWeight: 800,
                                                                color: cores.primary
                                                            }}
                                                        >
                                                            {dinheiro(
                                                                dados.duplicatas.reduce(
                                                                    (
                                                                        soma,
                                                                        dup
                                                                    ) =>
                                                                        soma +
                                                                        num(
                                                                            dup.valor
                                                                        ),
                                                                    0
                                                                )
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                </TableBody>
                                            </Table>
                                        </Box>
                                    )}
                                </Secao>

                                <Secao
                                    cores={cores}
                                    titulo="Formas de pagamento"
                                    icon={
                                        <PaymentsOutlinedIcon fontSize="small" />
                                    }
                                >
                                    {dados.pagamentos.length === 0 ? (
                                        <VazioLista
                                            cores={cores}
                                            texto="Nenhuma forma de pagamento informada."
                                        />
                                    ) : (
                                        <Box
                                            sx={{
                                                overflowX: "auto",
                                                border: "1px solid",
                                                borderColor: cores.divider,
                                                borderRadius: 2
                                            }}
                                        >
                                            <Table size="small" sx={tabelaSx}>
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell>
                                                            Forma
                                                        </TableCell>
                                                        <TableCell>
                                                            Prazo
                                                        </TableCell>
                                                        <TableCell>
                                                            Cartão
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            Valor
                                                        </TableCell>
                                                    </TableRow>
                                                </TableHead>

                                                <TableBody>
                                                    {dados.pagamentos.map(
                                                        (pagamento, indice) => (
                                                            <TableRow
                                                                key={`pag-${indice}`}
                                                                hover
                                                            >
                                                                <TableCell>
                                                                    {rotulo(
                                                                        MAPA_PAGAMENTO,
                                                                        pagamento.meio,
                                                                        false
                                                                    ) ||
                                                                        pagamento.descricao ||
                                                                        "-"}
                                                                </TableCell>

                                                                <TableCell>
                                                                    {pagamento.indicador ===
                                                                        "0"
                                                                        ? "À vista"
                                                                        : pagamento.indicador ===
                                                                            "1"
                                                                            ? "A prazo"
                                                                            : "-"}
                                                                </TableCell>

                                                                <TableCell>
                                                                    {pagamento.cartao
                                                                        ? `${rotulo(MAPA_BANDEIRA, pagamento.cartao.bandeira, false) || "Bandeira não informada"}${pagamento.cartao.autorizacao ? ` • aut. ${pagamento.cartao.autorizacao}` : ""}`
                                                                        : "-"}
                                                                </TableCell>

                                                                <TableCell align="right">
                                                                    {dinheiro(
                                                                        pagamento.valor
                                                                    )}
                                                                </TableCell>
                                                            </TableRow>
                                                        )
                                                    )}

                                                    {num(dados.troco) > 0 && (
                                                        <TableRow>
                                                            <TableCell
                                                                colSpan={3}
                                                            >
                                                                Troco
                                                            </TableCell>
                                                            <TableCell align="right">
                                                                {dinheiro(
                                                                    dados.troco
                                                                )}
                                                            </TableCell>
                                                        </TableRow>
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </Box>
                                    )}
                                </Secao>

                                <Box
                                    sx={{
                                        display: "grid",
                                        gridTemplateColumns: {
                                            xs: "1fr 1fr",
                                            md: "repeat(4, 1fr)"
                                        },
                                        gap: 1
                                    }}
                                >
                                    <ResumoCard
                                        cores={cores}
                                        isDark={isDark}
                                        titulo="Parcelas"
                                        valor={dados.duplicatas.length}
                                        icon={
                                            <EventNoteOutlinedIcon fontSize="small" />
                                        }
                                    />

                                    <ResumoCard
                                        cores={cores}
                                        isDark={isDark}
                                        titulo="Primeiro vencimento"
                                        valor={dataBR(
                                            dados.duplicatas[0]?.vencimento
                                        )}
                                        icon={
                                            <EventNoteOutlinedIcon fontSize="small" />
                                        }
                                    />

                                    <ResumoCard
                                        cores={cores}
                                        isDark={isDark}
                                        titulo="Último vencimento"
                                        valor={dataBR(
                                            dados.duplicatas[
                                                dados.duplicatas.length - 1
                                            ]?.vencimento
                                        )}
                                        icon={
                                            <EventNoteOutlinedIcon fontSize="small" />
                                        }
                                    />

                                    <ResumoCard
                                        cores={cores}
                                        isDark={isDark}
                                        titulo="Total da NF-e"
                                        valor={dinheiro(
                                            dados.totais.valorNota
                                        )}
                                        icon={
                                            <PaymentsOutlinedIcon fontSize="small" />
                                        }
                                        destaque
                                    />
                                </Box>
                            </>
                        )}

                        {/* ==================== ABA 5 - COMPLEMENTOS ==================== */}

                        {aba === 5 && (
                            <>
                                <Secao
                                    cores={cores}
                                    titulo="Informações complementares"
                                    icon={<NotesOutlinedIcon fontSize="small" />}
                                    acao={
                                        dados.informacoes.contribuinte ? (
                                            <Button
                                                size="small"
                                                startIcon={<ContentCopyIcon />}
                                                onClick={() =>
                                                    copiar(
                                                        dados.informacoes
                                                            .contribuinte,
                                                        "Texto complementar"
                                                    )
                                                }
                                                sx={{
                                                    fontSize: "0.68rem",
                                                    color: cores.primary
                                                }}
                                            >
                                                Copiar texto
                                            </Button>
                                        ) : null
                                    }
                                >
                                    {dados.informacoes.contribuinte ? (
                                        <Paper
                                            elevation={0}
                                            sx={{
                                                p: 1.5,
                                                bgcolor: cores.card,
                                                border: "1px solid",
                                                borderColor: cores.divider,
                                                borderRadius: 2
                                            }}
                                        >
                                            <Typography
                                                sx={{
                                                    fontSize: "0.78rem",
                                                    whiteSpace: "pre-wrap",
                                                    lineHeight: 1.6
                                                }}
                                            >
                                                {dados.informacoes.contribuinte}
                                            </Typography>
                                        </Paper>
                                    ) : (
                                        <VazioLista
                                            cores={cores}
                                            texto="A nota não tem informações complementares."
                                        />
                                    )}
                                </Secao>

                                {dados.informacoes.fisco && (
                                    <Secao
                                        cores={cores}
                                        titulo="Informações de interesse do fisco"
                                        icon={
                                            <InfoOutlinedIcon fontSize="small" />
                                        }
                                    >
                                        <Paper
                                            elevation={0}
                                            sx={{
                                                p: 1.5,
                                                bgcolor: cores.card,
                                                border: "1px solid",
                                                borderColor: cores.divider,
                                                borderRadius: 2
                                            }}
                                        >
                                            <Typography
                                                sx={{
                                                    fontSize: "0.78rem",
                                                    whiteSpace: "pre-wrap",
                                                    lineHeight: 1.6
                                                }}
                                            >
                                                {dados.informacoes.fisco}
                                            </Typography>
                                        </Paper>
                                    </Secao>
                                )}

                                {dados.informacoes.observacoes.length > 0 && (
                                    <Secao
                                        cores={cores}
                                        titulo="Observações do contribuinte"
                                        icon={
                                            <NotesOutlinedIcon fontSize="small" />
                                        }
                                    >
                                        <Box sx={gradeSx}>
                                            {dados.informacoes.observacoes.map(
                                                (obs, indice) => (
                                                    <Campo
                                                        key={`obs-${indice}`}
                                                        cores={cores}
                                                        isDark={isDark}
                                                        titulo={
                                                            obs.campo ||
                                                            `Observação ${indice + 1}`
                                                        }
                                                        valor={obs.texto}
                                                        xs={6}
                                                    />
                                                )
                                            )}
                                        </Box>
                                    </Secao>
                                )}

                                <Secao
                                    cores={cores}
                                    titulo={`Eventos (${dados.eventos.length})`}
                                    icon={
                                        <EventNoteOutlinedIcon fontSize="small" />
                                    }
                                >
                                    {dados.eventos.length === 0 ? (
                                        <VazioLista
                                            cores={cores}
                                            texto="Nenhum evento registrado neste XML. Cancelamentos e cartas de correção aparecem aqui quando o arquivo traz o protocolo do evento."
                                        />
                                    ) : (
                                        <Stack spacing={1}>
                                            {dados.eventos.map(
                                                (evento, indice) => (
                                                    <Paper
                                                        key={`evento-${indice}`}
                                                        elevation={0}
                                                        sx={{
                                                            p: 1.5,
                                                            bgcolor: cores.card,
                                                            border: "1px solid",
                                                            borderColor:
                                                                cores.divider,
                                                            borderRadius: 2
                                                        }}
                                                    >
                                                        <Box
                                                            sx={{
                                                                display: "flex",
                                                                justifyContent:
                                                                    "space-between",
                                                                gap: 1,
                                                                flexWrap:
                                                                    "wrap"
                                                            }}
                                                        >
                                                            <Typography
                                                                sx={{
                                                                    fontWeight: 800,
                                                                    fontSize:
                                                                        "0.8rem"
                                                                }}
                                                            >
                                                                {evento.descricao ||
                                                                    MAPA_EVENTO[
                                                                    evento
                                                                        .tipo
                                                                    ] ||
                                                                    evento.tipo}
                                                                {evento.sequencia
                                                                    ? ` • sequência ${evento.sequencia}`
                                                                    : ""}
                                                            </Typography>

                                                            <Typography
                                                                sx={{
                                                                    fontSize:
                                                                        "0.72rem",
                                                                    color: cores.textoSecundario
                                                                }}
                                                            >
                                                                {dataHoraBR(
                                                                    evento.data
                                                                )}
                                                            </Typography>
                                                        </Box>

                                                        {(evento.correcao ||
                                                            evento.justificativa) && (
                                                                <Typography
                                                                    sx={{
                                                                        mt: 0.8,
                                                                        fontSize:
                                                                            "0.76rem",
                                                                        whiteSpace:
                                                                            "pre-wrap"
                                                                    }}
                                                                >
                                                                    {evento.correcao ||
                                                                        evento.justificativa}
                                                                </Typography>
                                                            )}

                                                        <Typography
                                                            sx={{
                                                                mt: 0.6,
                                                                fontSize:
                                                                    "0.68rem",
                                                                color: cores.textoSecundario
                                                            }}
                                                        >
                                                            Protocolo{" "}
                                                            {evento.protocolo ||
                                                                "-"}
                                                            {evento.motivo
                                                                ? ` • ${evento.motivo}`
                                                                : ""}
                                                        </Typography>
                                                    </Paper>
                                                )
                                            )}
                                        </Stack>
                                    )}
                                </Secao>

                                {dados.referenciadas.length > 0 && (
                                    <Secao
                                        cores={cores}
                                        titulo="Notas referenciadas"
                                        icon={
                                            <ReceiptLongOutlinedIcon fontSize="small" />
                                        }
                                    >
                                        <Box sx={gradeSx}>
                                            {dados.referenciadas.map(
                                                (ref, indice) => (
                                                    <Campo
                                                        key={`ref-${indice}`}
                                                        cores={cores}
                                                        isDark={isDark}
                                                        titulo={`Referência ${indice + 1}`}
                                                        valor={
                                                            chaveFormatada(
                                                                ref.chave
                                                            ) ||
                                                            `Nota ${ref.numero} / série ${ref.serie}`
                                                        }
                                                        xs={12}
                                                    />
                                                )
                                            )}
                                        </Box>
                                    </Secao>
                                )}

                                <Secao
                                    cores={cores}
                                    titulo="Assinatura e autorização"
                                    icon={<InfoOutlinedIcon fontSize="small" />}
                                >
                                    <Box sx={gradeSx}>
                                        {campo({
                                            titulo: "Protocolo",
                                            valor: dados.protocolo,
                                            xs: 4
                                        })}
                                        {campo({
                                            titulo: "Recebido em",
                                            valor: dataHoraBR(
                                                dados.dataProtocolo
                                            ),
                                            xs: 4
                                        })}
                                        {campo({
                                            titulo: "Status",
                                            valor: dados.motivoProtocolo
                                                ? `${dados.statusProtocolo} - ${dados.motivoProtocolo}`
                                                : "",
                                            xs: 4
                                        })}
                                        {campo({
                                            titulo: "Digest value",
                                            valor: dados.digest,
                                            xs: 12
                                        })}
                                    </Box>
                                </Secao>
                            </>
                        )}

                        {/* ==================== ABA 6 - XML ==================== */}

                        {aba === 6 && (
                            <Box>
                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        gap: 1.5,
                                        mb: 1.5,
                                        flexWrap: "wrap"
                                    }}
                                >
                                    <TextField
                                        size="small"
                                        value={buscaXML}
                                        onChange={(evento) =>
                                            setBuscaXML(evento.target.value)
                                        }
                                        placeholder="Buscar dentro do XML"
                                        helperText={
                                            buscaXML.trim().length >= 2
                                                ? `${ocorrenciasXML} ocorrência(s)`
                                                : " "
                                        }
                                        sx={{
                                            minWidth: { xs: "100%", sm: 320 },
                                            "& .MuiOutlinedInput-root": {
                                                bgcolor: cores.input
                                            }
                                        }}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <SearchIcon
                                                        fontSize="small"
                                                        sx={{
                                                            color: cores.textoSecundario
                                                        }}
                                                    />
                                                </InputAdornment>
                                            )
                                        }}
                                    />

                                    <Stack direction="row" spacing={1}>
                                        <Button
                                            size="small"
                                            variant="outlined"
                                            onClick={() =>
                                                setXmlIdentado(
                                                    (atual) => !atual
                                                )
                                            }
                                            sx={{
                                                borderColor: cores.divider,
                                                color: cores.texto
                                            }}
                                        >
                                            {xmlIdentado
                                                ? "Ver original"
                                                : "Ver identado"}
                                        </Button>

                                        <Button
                                            size="small"
                                            variant="outlined"
                                            startIcon={<ContentCopyIcon />}
                                            onClick={() =>
                                                copiar(xml, "XML")
                                            }
                                            sx={{
                                                borderColor: cores.primary,
                                                color: cores.primary
                                            }}
                                        >
                                            Copiar XML
                                        </Button>
                                    </Stack>
                                </Box>

                                <Box
                                    component="pre"
                                    sx={{
                                        m: 0,
                                        p: 2,
                                        bgcolor: isDark ? "#0b0b0b" : "#f5f5f5",
                                        color: isDark ? "#e6e6e6" : "#242424",
                                        border: "1px solid",
                                        borderColor: cores.divider,
                                        borderRadius: 2,
                                        overflow: "auto",
                                        maxHeight: "65vh",
                                        fontSize: "0.72rem",
                                        lineHeight: 1.6,
                                        fontFamily:
                                            "Consolas, 'Courier New', monospace",
                                        whiteSpace: "pre-wrap",
                                        wordBreak: "break-word",
                                        "& mark": {
                                            bgcolor: alpha(cores.warning, 0.45),
                                            color: "inherit",
                                            borderRadius: "2px"
                                        },
                                        "&::-webkit-scrollbar": {
                                            width: 8,
                                            height: 8
                                        },
                                        "&::-webkit-scrollbar-track": {
                                            background: isDark
                                                ? "#151515"
                                                : "#eeeeee"
                                        },
                                        "&::-webkit-scrollbar-thumb": {
                                            background: isDark
                                                ? "#444"
                                                : "#bdbdbd",
                                            borderRadius: 5
                                        },
                                        "&::-webkit-scrollbar-thumb:hover": {
                                            background: cores.primary
                                        }
                                    }}
                                >
                                    {buscaXML.trim().length >= 2 &&
                                        ocorrenciasXML > 0 ? (
                                        xmlExibido
                                            .split(
                                                new RegExp(
                                                    `(${buscaXML
                                                        .trim()
                                                        .replace(
                                                            /[.*+?^${}()|[\]\\]/g,
                                                            "\\$&"
                                                        )})`,
                                                    "gi"
                                                )
                                            )
                                            .map((parte, indice) =>
                                                parte.toLowerCase() ===
                                                    buscaXML.trim().toLowerCase() ? (
                                                    <mark
                                                        key={`marca-${indice}`}
                                                    >
                                                        {parte}
                                                    </mark>
                                                ) : (
                                                    parte
                                                )
                                            )
                                    ) : (
                                        xmlExibido || "XML não disponível."
                                    )}
                                </Box>
                            </Box>
                        )}
                    </>
                )}
            </DialogContent>

            {/* ============================ RODAPÉ ============================ */}

            <Divider />

            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 2,
                    px: 2,
                    py: 1,
                    bgcolor: cores.card
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.7,
                        minWidth: 0
                    }}
                >
                    <DescriptionIcon
                        sx={{ fontSize: 15, color: cores.textoSecundario }}
                    />

                    <Typography
                        variant="caption"
                        sx={{
                            color: cores.textoSecundario,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap"
                        }}
                    >
                        SIGEL WMS • NF-e {dados?.numero || "-"} •{" "}
                        {dados?.produtos?.length || 0} item(ns) •{" "}
                        {dinheiro(dados?.totais?.valorNota)}
                    </Typography>
                </Box>

                <Stack direction="row" spacing={1}>
                    <Button
                        variant="outlined"
                        size="small"
                        onClick={onClose}
                        sx={{
                            borderColor: cores.divider,
                            color: cores.texto,
                            "&:hover": {
                                borderColor: cores.primary,
                                color: cores.primary
                            }
                        }}
                    >
                        Fechar
                    </Button>

                    <Button
                        variant="contained"
                        size="small"
                        startIcon={<FileDownloadIcon />}
                        onClick={baixarXML}
                        sx={{
                            bgcolor: cores.primary,
                            color: cores.branco,
                            "&:hover": { bgcolor: cores.primaryHover }
                        }}
                    >
                        Baixar XML
                    </Button>
                </Stack>
            </Box>

            <Snackbar
                open={Boolean(mensagem)}
                autoHideDuration={2500}
                onClose={() => setMensagem(null)}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <Alert
                    severity={mensagem?.severidade || "success"}
                    variant="filled"
                    onClose={() => setMensagem(null)}
                    sx={{
                        color: cores.branco,
                        "& .MuiAlert-icon": { color: cores.branco }
                    }}
                >
                    {mensagem?.texto}
                </Alert>
            </Snackbar>
        </Dialog>
    );
}

export default XmlViewer;