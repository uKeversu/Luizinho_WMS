import { useState, useEffect } from "react";
import {
    Container,
    Typography,
    Card,
    CardContent,
    Grid,
    TextField,
    Button,
    Box,
    Snackbar,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from "@mui/material";
import LogoutIcon from '@mui/icons-material/Logout';
import SyncIcon from '@mui/icons-material/Sync';
import {
    UploadFile,
    BugReport,
    Logout,
    Description
} from "@mui/icons-material";

import LoginFuncionario from "../components/LoginFuncionario";

import ModalErro from "../components/modalErro";
import ModalRetira from "../components/modalRetira";
import ModalConfirmaRecebimento from "../components/modalConfirmaRecebimento";

function Recebimentos() {

    // Login
    const [userInfo, setUserInfo] = useState(() => {
        const user = localStorage.getItem("user_info");
        return user ? JSON.parse(user) : null;
    });
    const [token, setToken] = useState(() => localStorage.getItem("nfe_token") || "");
    const [codigo, setCodigo] = useState("");

    // Sistema
    const [xmlData, setXmlData] = useState(null);
    const [paletes, setPaletes] = useState([""]);
    const [funcionario, setFuncionario] = useState("");
    const [resultado, setResultado] = useState(null);
    const [file, setFile] = useState(null);
    const [historico, setHistorico] = useState([]);

    // Loading de XML 
    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success"
    });

    // Modal retirar peças
    const [openRetirada, setOpenRetirada] = useState(false);
    const [retirada, setRetirada] = useState({
        quantidade: "",
        nf: "",
        funcionario: ""
    });

    // Modal relatar erro
    const [openErro, setOpenErro] = useState(false);
    const [erro, setErro] = useState({
        codigo: "",
        tipo: "",
        descricao: "",
        funcionario: ""
    });

    // Modal confirmar recebimento
    const [openConfirmar, setOpenConfirmar] = useState(false);

    const [codigoLido, setCodigoLido] = useState("");
    const [snack, setSnack] = useState({ open: false, msg: "", type: "success" });
    const [openDialog, setOpenDialog] = useState(false);

    const API = "http://192.168.1.184:8077";

    const logout = () => {
        setToken("");
        setUserInfo(null);
        localStorage.removeItem("nfe_token");
        localStorage.removeItem("user_info");
    };

    // Upload de XML
    async function handleFileUpload(e) {
        const f = e.target.files[0];
        if (!f) return;

        if (!f.name.endsWith(".xml")) {
            setSnackbar({
                open: true,
                message: "Arquivo deve ser XML",
                severity: "error"
            });
            return;
        }

        // Salva XML
        setFile(f);

        const reader = new FileReader();

        reader.onload = (event) => {
            const xmlString = event.target.result;
            const parser = new DOMParser();
            const xml = parser.parseFromString(xmlString, "text/xml");

            const dets = xml.getElementsByTagName("det");

            let totalPecas = 0;

            for (let i = 0; i < dets.length; i++) {
                const qCom = dets[i].getElementsByTagName("qCom")[0]?.textContent;
                totalPecas += parseFloat(qCom || 0);
            }

            const nota = xml.getElementsByTagName("nNF")[0]?.textContent;
            const serie = xml.getElementsByTagName("serie")[0]?.textContent;
            const fornecedor = xml.getElementsByTagName("xNome")[0]?.textContent;
            const cnpj = xml.getElementsByTagName("CNPJ")[0]?.textContent;
            const volumes = xml.getElementsByTagName("qVol")[0]?.textContent;

            setXmlData({
                nota,
                serie,
                fornecedor,
                cnpj,
                totalPecas,
                volumes
            });
        };

        reader.readAsText(f);
    }

    // Envia XML para API
    async function enviarXML() {
        if (!file) {
            setSnackbar({
                open: true,
                message: "Selecione um XML primeiro",
                severity: "warning"
            });
            return;
        }

        setLoading(true);

        try {
            const formData = new FormData();
            formData.append("file", file);

            const res = await fetch(`${API}/api/nfe/upload`, {
                method: "POST",
                headers: {
                    "X-Auth-Token": token
                },
                body: formData
            })

            const paletesString = paletes
                .filter(p => p.trim() !== "")
                .join("\n");

            const payload = {
                nota: xmlData?.nota,
                serie: xmlData?.serie,
                conferente: funcionario,
                localizacao: paletesString
            };

            const response = await fetch(`${API}/api/nfe/atualizar_por_nfe`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Auth-Token": token
                },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (!res&response.ok) {
                throw new Error(data.erro || "Erro ao enviar XML");
            }

            setSnackbar({
                open: true,
                message: "XML enviado com sucesso!",
                severity: "success"
            });

            setFile(null);

        } catch (err) {
            console.error(err);

            setSnackbar({
                open: true,
                message: err.message || "Erro no envio",
                severity: "error"
            });
        } finally {
            setLoading(false);
        }
    }

    // Paletes
    function handlePaleteChange(index, value) {
        const novos = [...paletes];
        novos[index] = value;
        setPaletes(novos);
    }

    function adicionarPalete() {
        setPaletes([...paletes, ""]);
    }

    function removerPalete(index) {
        if (paletes.length === 1) return;
        const novos = paletes.filter((_, i) => i !== index);
        setPaletes(novos);
    }

    // Retirar peças
    const handleRetiradaChange = (e) => {
        setRetirada({ ...retirada, [e.target.name]: e.target.value });
    };

    const confirmarRetirada = () => {
        console.log("Retirada:", retirada);

        setSnackbar({
            open: true,
            message: "Retirada registrada!",
            severity: "success"
        });

        setOpenRetirada(false);
    };

    // Relatar erro
    const handleErroChange = (e) => {
        setErro({ ...erro, [e.target.name]: e.target.value });
    };

    const confirmarErro = () => {

        if (!erro.tipo) {
            setSnackbar({
                open: true,
                message: "Selecione o tipo de erro",
                severity: "warning"
            });
            return;
        }

        if (!erro.descricao.trim()) {
            setSnackbar({
                open: true,
                message: "Descreva o erro",
                severity: "warning"
            });
            return;
        }

        if (!erro.funcionario.trim()) {
            setSnackbar({
                open: true,
                message: "Informe o código do funcionário",
                severity: "warning"
            });
            return;
        }

        console.log("Erro:", erro);

        setSnackbar({
            open: true,
            message: "Erro registrado!",
            severity: "success"
        });

        setOpenErro(false);
    };

    // Confirma recebimento
    const confirmarRecebimento = async () => {

        if (!xmlData) {
            setSnackbar({
                open: true,
                message: "Nenhuma nota carregada",
                severity: "warning"
            });
            return;
        }

        if (!funcionario.trim()) {
            setSnackbar({
                open: true,
                message: "Informe o funcionário",
                severity: "warning"
            });
            return;
        }

        if (paletes.every(p => !p.trim())) {
            setSnackbar({
                open: true,
                message: "Informe pelo menos um palete",
                severity: "warning"
            });
            return;
        }

        await enviarRecebimento();

        // Limpa todos os campos
        setXmlData(null);
        setPaletes([""]);
        setFuncionario("");
        document.querySelector('input[type="file"]').value = "";

        setOpenConfirmar(false);
    };

    // Envia localização dos paletes
    async function enviarRecebimento() {
        const paletesString = paletes
            .filter(p => p.trim() !== "")
            .join("\n");
        try {
            const payload = {
                nota: xmlData?.nota,
                serie: xmlData?.serie,
                conferente: funcionario,
                localizacao: paletesString
            };

            const response = await fetch(`${API}/api/nfe/atualizar_por_nfe`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Auth-Token": token
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.erro || "Erro ao enviar");
            }

            console.log("Enviado com sucesso:", data);

            setSnackbar({
                open: true,
                message: "Recebimento enviado com sucesso!",
                severity: "success"
            });

        } catch (err) {
            console.error(err);

            setSnackbar({
                open: true,
                message: err.message || "Erro ao enviar recebimento",
                severity: "error"
            });
        }
    }

    // Busca itens para guarda
    const buscarItensNaoGuardados = async () => {
        try {
            const response = await fetch(`${API}/api/dashboard/itens_nao_guardados`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "X-Auth-Token": token
                }
            });

            const data = await response.json();

            if (!response.ok) {
                console.error("Erro:", data);
                return;
            }

            console.log("Itens não guardados:", data);

        } catch (error) {
            console.error("Erro na requisição:", error);
        }
    };

    const pegarLocal = async () => {
        try {
            const response = await fetch('http://192.168.1.184:8077/api/checar_localizacao_lote', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ todos: true })
            });
            const data = await response.json();
            if (response.ok && data.encontrado) {
                console.log(`Localização atualizada: ${data.localiza} (via ${data.metodo})`);
            } else {
                console.error(data.mensagem || 'Produto não encontrado no ERP');
            }
        } catch (err) {
            console.error('Erro na requisição:', err);
        }
    };

    return (
        !token ? (
            <LoginFuncionario
                onLogin={(data) => {
                    localStorage.setItem("nfe_token", data.token);

                    const user = {
                        nome: data.nome,
                        codigo: data.codigo
                    };

                    localStorage.setItem("user_info", JSON.stringify(user));

                    setUserInfo(user);
                    setToken(data.token);
                }}
            />
        ) : (
            <Container maxWidth="100%" sx={{ mt: 4, bgcolor: '#FFFFFF' }}>
                {/* Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2, bgcolor: '#00c3ca', height: '7vh' }}>
                    <Typography variant="h4" sx={{ fontFamily: 'Consolas', color: '#FFFFFF' }}>
                        <strong>Recebimento de mercadorias</strong>
                    </Typography>
                    <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography sx={{ color: '#FFFFFF', fontSize: '0.9rem' }}>
                                Usuário: {userInfo?.nome}
                            </Typography>
                            {token && (
                                <Button
                                    size="small"
                                    onClick={logout}
                                    sx={{ color: '#FFFFFF', display: 'flex', gap: 1 }}
                                >{<LogoutIcon />}
                                </Button>
                            )}
                        </Box>
                        <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                            <Button
                                id="btnAtualizar" onClick={pegarLocal}
                                size="small"
                                sx={{ color: '#ffffff', display: 'flex', gap: 1 }}>
                                SS Plus Sync
                                {<SyncIcon />}
                            </Button>
                            <Button
                                onClick={buscarItensNaoGuardados}
                                sx={{ color: '#ffffff', display: 'flex', gap: 1 }}
                            >
                                Buscar itens não guardados
                            </Button>
                            <pre id="resultado"></pre>
                        </Box>
                    </Box>
                </Box>

                {/* Importar XML */}
                <Card sx={{ mt: 3, mb: 3, borderRadius: '2vh', boxShadow: '0vh 0.1vh 0.5vh #000000', bgcolor: '#f3f3f3' }}>
                    <CardContent>
                        <Typography variant="h6">Importar XML</Typography>

                        <Button
                            variant="contained"
                            component="label"
                            disabled={loading}
                            sx={{ mt: 2, bgcolor: '#00c3ca' }}
                        >
                            Selecionar XML
                            <input hidden type="file" accept=".xml" onChange={handleFileUpload} />
                        </Button>

                        <Button
                            variant="contained"
                            onClick={() => {
                                enviarXML();
                            }}
                            disabled={loading || !file}
                            sx={{ mt: 2, ml: 2, bgcolor: '#00c3ca' }}
                        >
                            Enviar XML
                        </Button>
                    </CardContent>
                </Card>

                <Grid container spacing={3} sx={{ display: 'flex', justifyContent: 'space-between' }}>

                    {/* Dados da nota */}
                    <Grid item xs={12} md={6} sx={{ width: '30%' }}>
                        <Card sx={{ borderRadius: '2vh', boxShadow: '0vh 0.1vh 0.5vh #000000', bgcolor: '#f3f3f3' }}>
                            <CardContent>
                                <Typography variant="h6">Dados da Nota</Typography>

                                {xmlData ? (
                                    <Box mt={2}>
                                        <Typography><strong>Nota:</strong> {xmlData.nota}</Typography>
                                        <Typography><strong>Serie:</strong> {xmlData.serie}</Typography>
                                        <Typography><strong>Fornecedor:</strong> {xmlData.fornecedor}</Typography>
                                        <Typography><strong>CNPJ:</strong> {xmlData.cnpj}</Typography>
                                        <Typography><strong>Total de peças:</strong> {xmlData.totalPecas}</Typography>
                                        <Typography><strong>Volumes:</strong> {xmlData.volumes}</Typography>
                                    </Box>
                                ) : (
                                    <Typography mt={2}>Nenhum XML carregado</Typography>
                                )}

                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Paletes */}
                    <Grid item xs={12} md={6} sx={{ width: '50%' }}>
                        <Card sx={{ borderRadius: '2vh', boxShadow: '0vh 0.1vh 0.5vh #000000', bgcolor: '#f3f3f3' }}>
                            <CardContent>

                                <Typography variant="h6">Organização em Paletes</Typography>

                                {paletes.map((p, index) => (
                                    <Box key={index} sx={{ display: 'flex', gap: 1, mt: 2 }}>
                                        <TextField
                                            fullWidth
                                            placeholder="Ex: Palete 1 -> Volume 1 e 2"
                                            value={p}
                                            onChange={(e) => handlePaleteChange(index, e.target.value)}
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    '&:hover fieldset': {
                                                        borderColor: '#00f7ff',
                                                    },
                                                    '&.Mui-focused fieldset': {
                                                        borderColor: '#00c3ca',
                                                    }
                                                }
                                            }}
                                        />
                                        <Button
                                            variant="contained"
                                            sx={{ bgcolor: 'rgb(255, 53, 53)' }}
                                            onClick={() => removerPalete(index)}
                                        >
                                            X
                                        </Button>
                                    </Box>
                                ))}
                                <Button
                                    variant="contained"
                                    size="large"
                                    sx={{ bgcolor: '#00c3ca', mt: 2, display: 'flex', justifyContent: 'left' }}
                                    onClick={adicionarPalete}
                                >
                                    Adicionar palete
                                </Button>

                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Botões extras */}
                    <Grid item xs={12} md={6} sx={{ width: '30vh' }}>
                        <Card sx={{ borderRadius: '2vh', boxShadow: '0vh 0.1vh 0.5vh #000000', bgcolor: '#f3f3f3' }}>
                            <CardContent>
                                <Button
                                    variant="contained"
                                    size="large"
                                    sx={{ bgcolor: '#00c3ca', mb: 2 }}
                                    onClick={() => setOpenRetirada(true)}
                                >
                                    Retirar peça
                                </Button>
                                <Button
                                    variant="contained"
                                    size="large"
                                    sx={{ bgcolor: 'rgb(255, 53, 53)', mb: 2 }}
                                    onClick={() => {
                                        setErro({
                                            codigo: "",
                                            tipo: "",
                                            descricao: "",
                                            funcionario: userInfo?.codigo || ""
                                        });
                                        setOpenErro(true);
                                    }}
                                >
                                    Relatar erro
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Funcionário */}
                <Card sx={{ mt: 3, borderRadius: '2vh', boxShadow: '0vh 0.1vh 0.5vh #000000', bgcolor: '#f3f3f3' }}>
                    <CardContent>
                        <Typography variant="h6">Identificação de funcionário</Typography>

                        <Box sx={{ display: 'flex' }}>
                            <TextField
                                fullWidth
                                label="Código do Funcionário"
                                name="funcionario"
                                value={funcionario}
                                onChange={(e) => setFuncionario(e.target.value)}
                                sx={{
                                    mt: 1, width: '80%', '& .MuiOutlinedInput-root': {
                                        '&:hover fieldset': {
                                            borderColor: '#00f7ff',
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: '#00c3ca',
                                        }
                                    }
                                }}
                            />
                            <Button
                                variant="contained"
                                sx={{ mt: 1, ml: 1, bgcolor: '#00ca32', height: "7.3vh" }}
                                onClick={() => {
                                    enviarXML();
                                    enviarRecebimento();
                                    if (!funcionario.trim()) {
                                        setSnackbar({
                                            open: true,
                                            message: "Informe o código do funcionário",
                                            severity: "warning"
                                        });
                                        return;
                                    }
                                    setOpenConfirmar(true);
                                }}
                            >Confirmar recebimento
                            </Button>
                        </Box>
                    </CardContent>
                </Card>

                {/* Modal retirada de peças */}
                <ModalRetira
                    open={openRetirada}
                    onClose={() => setOpenRetirada(false)}
                    retirada={retirada}
                    onChange={handleRetiradaChange}
                    onConfirm={confirmarRetirada}
                />

                {/* Modal de relatar erros */}
                <ModalErro
                    open={openErro}
                    onClose={() => setOpenErro(false)}
                    erro={erro}
                    onChange={handleErroChange}
                    onConfirm={confirmarErro}
                />

                {/* Modal confirmar recebimento */}
                <ModalConfirmaRecebimento
                    open={openConfirmar}
                    onClose={() => setOpenConfirmar(false)}
                    onConfirm={confirmarRecebimento}
                />

                {/* Snackbar */}
                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={3000}
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                >
                    <Alert variant="filled" severity={snackbar.severity}>
                        {snackbar.message}
                    </Alert>
                </Snackbar>
            </Container>
        ));
}
export default Recebimentos