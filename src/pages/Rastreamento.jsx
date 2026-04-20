import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
    Container,
    Typography,
    Box,
    Card,
    CardContent,
    Button,
    Modal
} from "@mui/material";

import imgCompra from "../assets/img/icone_compra.gif";
import imgRecebimento from "../assets/img/icone_recebimento.gif";
import imgConferencia from "../assets/img/icone_conferencia.gif";
import imgGuarda from "../assets/img/icone_guarda.gif";
import imgVenda from "../assets/img/icone_venda.gif";
import imgDevolucao from "../assets/img/icone_devolucao.gif";
import imgGarantia from "../assets/img/icone_garantia.gif";
import imgRetorno from "../assets/img/icone_retorno_fornecedor.gif";

import { fakeRastreio } from "../services/rastreioFakeAPI";

function Rastreamento() {

    const { codigo } = useParams();

    const [dados, setDados] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [eventoSelecionado, setEventoSelecionado] = useState(null);

    const [hoverEvento, setHoverEvento] = useState(null);
    const [hoverPos, setHoverPos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        carregar();
    }, [codigo]);

    const carregar = async () => {
        const resp = await fakeRastreio(codigo);
        setDados(resp);
    };

    const abrirModal = (evento) => {
        setEventoSelecionado(evento);
        setModalOpen(true);
    };

    const fecharModal = () => {
        setModalOpen(false);
        setEventoSelecionado(null);
    };

    const etapas = [
        { tipo: "COMPRA", label: "Compra", img: imgCompra },
        { tipo: "RECEBIMENTO", label: "Recebimento", img: imgRecebimento },
        { tipo: "CONFERENCIA", label: "Conferência", img: imgConferencia },
        { tipo: "GUARDA", label: "Guarda", img: imgGuarda },
        { tipo: "VENDA", label: "Venda", img: imgVenda },
        { tipo: "DEVOLUCAO", label: "Devolucao", img: imgDevolucao },
        { tipo: "GARANTIA", label: "Garantia", img: imgGarantia },
        { tipo: "RETORNO", label: "Retorno", img: imgRetorno }
    ];

    const mapaEtapas = {
        COMPRA: "COMPRA",
        PENDENTE: "RECEBIMENTO",
        CONFERIDO: "CONFERENCIA",
        GUARDADO: "GUARDA",
        VENDIDO: "VENDA",
        DEVOLVIDO: "DEVOLUCAO",
        GARANTIA: "GARANTIA",
        RETORNO: "RETORNO"
    };

    const agruparCiclos = (eventos) => {
        const ciclos = [];
        let atual = [];

        const finais = ["VENDIDO", "RETORNO"];

        eventos.forEach((e) => {
            atual.push(e);

            if (finais.includes(e.tipo)) {
                ciclos.push(atual);
                atual = [];
            }
        });

        if (atual.length) ciclos.push(atual);

        return ciclos;
    };

    const ciclos = dados ? agruparCiclos(dados.eventos) : [];

    return (
        <Container maxWidth="lg" sx={{ mt: 4 }}>

            {/* INFO */}
            {dados && (
                <Card sx={{ mb: 4 }}>
                    <CardContent>
                        <Typography variant="h6">{dados.descricao}</Typography>
                        <Typography>Código: {dados.codigo}</Typography>
                        <Typography>ID: {dados.id}</Typography>
                        <Typography>Localização: {dados.localizacao}</Typography>
                        <Typography>Etapa atual: {dados.atual}</Typography>
                    </CardContent>
                </Card>
            )}

            {/* CICLOS */}
            {ciclos.map((ciclo, cicloIndex) => {

                const etapasDoCiclo = etapas.filter(etapa =>
                    ciclo.some(e => mapaEtapas[e.tipo] === etapa.tipo)
                );

                const etapaAtual = etapasDoCiclo.length - 1;

                return (
                    <Box key={cicloIndex} sx={{ mb: 6 }}>

                        {/* FLUXO */}
                        <Box sx={{ position: 'relative', mb: 4 }}>

                            <Box sx={{
                                position: 'absolute',
                                top: '50%',
                                width: '100%',
                                height: 4,
                                bgcolor: '#ccc'
                            }} />

                            <Box sx={{ display: 'flex' }}>
                                {etapasDoCiclo.map((etapa, index) => {

                                    const ativo = index <= etapaAtual;

                                    return (
                                        <Box key={index} sx={{ flex: 1, textAlign: 'center', p: 2 }}>

                                            <Box>
                                                <Button sx={{
                                                    bgcolor: ativo ? 'primary.main' : '#ccc',
                                                    color: 'primary.branco',
                                                    borderRadius: 2,
                                                    py: 1,
                                                    mb: 2,
                                                    minWidth: "15vh",
                                                    cursor: 'pointer',
                                                    '&:hover': {
                                                        bgcolor: 'primary.mainHover',
                                                        color: 'primary.branco'
                                                    }
                                                }}
                                                    onClick={() => abrirModal(ev)}
                                                >
                                                    {etapa.label}
                                                </Button>
                                            </Box>

                                            <Box
                                                component="img"
                                                src={etapa.img}
                                                sx={{
                                                    width: 80,
                                                    height: 80,
                                                    opacity: ativo ? 1 : 0.3
                                                }}
                                            />

                                            <Box sx={{
                                                width: 12,
                                                height: 12,
                                                borderRadius: '50%',
                                                bgcolor: ativo ? 'primary.main' : '#ccc',
                                                margin: '10px auto'
                                            }} />
                                        </Box>
                                    );
                                })}
                            </Box>
                        </Box>

                        {/* EVENTOS */}
                        <Box sx={{ display: 'flex' }}>
                            {etapasDoCiclo.map((etapa, index) => {

                                const eventosDaEtapa = ciclo.filter(e =>
                                    mapaEtapas[e.tipo] === etapa.tipo
                                );

                                return (
                                    <Box key={index} sx={{ flex: 1, textAlign: 'center' }}>

                                        <Box sx={{
                                            width: 2,
                                            height: 30,
                                            bgcolor: '#ccc',
                                            margin: '0 auto'
                                        }} />

                                        <Box sx={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: 1
                                        }}>
                                            {eventosDaEtapa.length > 0 ? (
                                                eventosDaEtapa.map((ev, i) => (
                                                    <Box
                                                        key={i}
                                                        onMouseEnter={(e) => {
                                                            setHoverEvento(ev);
                                                            setHoverPos({
                                                                x: e.clientX,
                                                                y: e.clientY
                                                            });
                                                        }}
                                                        onMouseLeave={() => setHoverEvento(null)}
                                                        sx={{
                                                            bgcolor: '#f5f5f5',
                                                            borderRadius: 2,
                                                            px: 1,
                                                            py: 0.5,
                                                            fontSize: '0.7rem',
                                                            cursor: 'pointer',
                                                            transition: '0.2s',
                                                            '&:hover': {
                                                                bgcolor: 'primary.main',
                                                                color: '#fff',
                                                                transform: 'scale(1.05)'
                                                            }
                                                        }}
                                                    >
                                                        {ev.tipo} <br />
                                                        {ev.data}
                                                    </Box>
                                                ))
                                            ) : (
                                                <Typography sx={{ fontSize: '0.7rem', color: '#999' }}>
                                                    -
                                                </Typography>
                                            )}
                                        </Box>
                                    </Box>
                                );
                            })}
                        </Box>

                    </Box>
                );
            })}

            {/* MODAL */}
            <Modal open={modalOpen} onClose={fecharModal}>
                <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 400,
                    bgcolor: '#fff',
                    p: 3,
                    borderRadius: 2
                }}>
                    {eventoSelecionado && (
                        <>
                            <Typography variant="h6">
                                {eventoSelecionado.tipo}
                            </Typography>

                            <Typography sx={{ mt: 2 }}>
                                Data: {eventoSelecionado.data}
                            </Typography>

                            <Typography>
                                Código: {dados?.codigo}
                            </Typography>

                            <Typography>
                                Funcionário: {eventoSelecionado.funcionario}
                            </Typography>

                            <Button
                                variant="contained"
                                sx={{ mt: 2 }}
                                onClick={fecharModal}
                            >
                                Fechar
                            </Button>
                        </>
                    )}
                </Box>
            </Modal>

        </Container>
    );
}

export default Rastreamento;