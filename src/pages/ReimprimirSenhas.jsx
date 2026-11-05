import { useState } from "react";
import {
    Container,
    Typography,
    Grid,
    Card,
    CardContent,
    Button,
    Snackbar,
    Alert,
    Box,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField
} from "@mui/material";

import PrintIcon from "@mui/icons-material/Print";

function ReimpressaoCredenciais() {

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

    const ACESSO = "K9xT4";

    const [autenticado, setAutenticado] = useState(false);
    const [acessoDigitada, setSenhaDigitada] = useState("");

    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success"
    });

    const usuarios = [
        {
            acesso: "4Kq7Zp2M4vN1yX",
            nome: "Kelwin Gameiro"
        },
        {
            acesso: "Y3AhD8mQ1sJ6cV",
            nome: "Fabio da Silva"
        },
        {
            acesso: "F7KkR9uT3wB5yN",
            nome: "Daniel Novais"
        },
        {
            acesso: "M2vH7pK9DdS4jW",
            nome: "Mateus Nascimento"
        },
        {
            acesso: "L5vN1pK7DtS8v3W",
            nome: "Vinicius Pires"
        },
        {
            acesso: "014083112361289231440",
            nome: "Matheus Lessa"
        },
        {
            acesso: "250405",
            nome: "Emanoel Brenneisen"
        },
        {
            acesso: "100378",
            nome: "Guilherme Quintino"
        },
        {
            acesso: "2725",
            nome: "Gabriel Cabral"
        }
    ];

    const validarSenha = () => {

        if (acessoDigitada === ACESSO) {

            setAutenticado(true);

            setSnackbar({
                open: true,
                severity: "success",
                message: "Acesso liberado"
            });

        } else {

            setSnackbar({
                open: true,
                severity: "error",
                message: "Senha inválida"
            });

            setSenhaDigitada("");
        }
    };

    const gerarZPL = (user) => `
^XA
^PW480
^LL220

^FO10,75
^BY1.5,5,35
^BCN,50,N,N,N
^FD${user.nome}^FS

^FO10,150
^BY1.5,5,35
^BCN,50,N,N,N
^FD${user.acesso}^FS

^XZ
`;

    const imprimir = async (user) => {

        try {

            const printer = localStorage.getItem("printer");

            if (!printer) {

                setSnackbar({
                    open: true,
                    severity: "warning",
                    message: "Nenhuma impressora configurada."
                });

                return;
            }

            const zpl = gerarZPL(user);

            const response = await fetch(
                "http://127.0.0.1:5000/print",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        tipo: "windows",
                        conteudo: zpl,
                        printer
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.erro || "Erro ao imprimir");
            }

            setSnackbar({
                open: true,
                severity: "success",
                message: `Etiqueta de ${user.nome} enviada para impressão`
            });

        } catch (error) {

            console.error(error);

            setSnackbar({
                open: true,
                severity: "error",
                message: "Erro ao imprimir"
            });
        }
    };

    const imprimirTodos = async () => {

        for (const usuario of usuarios) {
            await imprimir(usuario);
        }
    };

    if (!autenticado) {

        return (

            <>
                <Dialog
                    open
                    disableEscapeKeyDown
                    maxWidth="xs"
                    fullWidth
                    slotProps={{
                        paper: {
                            sx: {
                                bgcolor: "background.card",
                                color: "text.primary",
                                borderRadius: 3
                            }
                        }
                    }}
                >
                    <DialogTitle>
                        Área Restrita
                    </DialogTitle>

                    <DialogContent>

                        <TextField
                            autoFocus
                            fullWidth
                            margin="normal"
                            label="Senha de acesso"
                            type="password"
                            value={acessoDigitada}
                            onChange={(e) =>
                                setSenhaDigitada(e.target.value)
                            }
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    validarSenha();
                                }
                            }}
                        />

                    </DialogContent>

                    <DialogActions>

                        <Button
                            variant="contained"
                            onClick={validarSenha}
                        >
                            Entrar
                        </Button>

                    </DialogActions>
                </Dialog>

                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={3000}
                    onClose={() =>
                        setSnackbar(prev => ({
                            ...prev,
                            open: false
                        }))
                    }
                >
                    <Alert
                        severity={snackbar.severity}
                        variant="filled"
                    >
                        {snackbar.message}
                    </Alert>
                </Snackbar>
            </>
        );
    }

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
                        pode_acessar_reimprimir_acessos: data.pode_acessar_reimprimir_acessos,
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
            <Container maxWidth="lg" sx={{ mt: 4 }}>

                <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={3}
                >
                    <Typography variant="h4" fontWeight="bold">
                        Reimpressão de Credenciais
                    </Typography>

                    <Button
                        variant="contained"
                        startIcon={<PrintIcon />}
                        onClick={imprimirTodos}
                    >
                        Imprimir Todos
                    </Button>
                </Box>

                <Grid container spacing={3}>

                    {usuarios.map((user) => (

                        <Grid item xs={12} md={6} key={user.acesso}>

                            <Card
                                sx={{
                                    borderRadius: 3,
                                    height: "100%",
                                    bgcolor: 'background.default'
                                }}
                            >
                                <CardContent>

                                    <Typography
                                        variant="h6"
                                        fontWeight="bold"
                                        gutterBottom
                                    >
                                        {user.nome}
                                    </Typography>

                                    <Typography
                                        sx={{
                                            fontFamily: "monospace",
                                            fontSize: "1rem",
                                            mb: 3
                                        }}
                                    >
                                        {user.acesso}
                                    </Typography>

                                    <Button
                                        fullWidth
                                        variant="contained"
                                        startIcon={<PrintIcon />}
                                        onClick={() => imprimir(user)}
                                    >
                                        Imprimir Etiqueta
                                    </Button>

                                </CardContent>
                            </Card>

                        </Grid>

                    ))}

                </Grid>

                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={3000}
                    onClose={() =>
                        setSnackbar(prev => ({
                            ...prev,
                            open: false
                        }))
                    }
                >
                    <Alert
                        severity={snackbar.severity}
                        variant="filled"
                    >
                        {snackbar.message}
                    </Alert>
                </Snackbar>

            </Container>
        )
    );
}

export default ReimpressaoCredenciais;