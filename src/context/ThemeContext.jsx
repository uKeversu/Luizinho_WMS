import { createContext, useState, useEffect } from "react";
import {
    createTheme,
    ThemeProvider as MuiThemeProvider,
} from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

export const ThemeContext = createContext();

export function ThemeProvider({ children }) {
    const [dark, setDark] = useState(false);

    // Carrega preferência
    useEffect(() => {
        const saved = localStorage.getItem("theme");
        if (saved === "dark") setDark(true);
    }, []);

    // Aplica tema
    useEffect(() => {
        document.documentElement.classList.toggle("dark", dark);
        localStorage.setItem("theme", dark ? "dark" : "light");
    }, [dark]);

    const toggleTheme = () => setDark((prev) => !prev);

    const colors = dark
        ? {
            primary: "#007bff",
            primaryHover: "#0056b3",
            background: "#121212",
            paper: "#FFFFFF",
            subPaper: "rgba(255,255,255,0.7)",
            card: "#121212",
            text: "#ffffff",
            forndireto: "#383838",
            inputBg: "#2a2a2a",
            sombra: "#000000",
            branco: "#FFFFFF",
            alerta: "#1d1d1d",
            tabela: "#1d1d1d",

            confirmar: "#02bb31",
            confirmarHover: "#009425",
            cancelar: "rgb(255, 53, 53)",
            cancelarHover: "rgb(202, 40, 40)",
            pendente: "#007bff",
            observacao: "rgb(231, 153, 49)",
            observacaoHover: "rgb(199, 129, 38)",
            conferido: "#2b743d",
            achouItem: "#2b743d93",

            compra: '#44cc61',
            pendentes: '#dfdc20',
            conferidos: '#007bff',
            parcial: '#ff9800',
            guardado: '#28a745',
            vendido: '#ff2e2e',
            devolvido: '#bb6b02',
            garantia: '#6802bb',
            retorno: '#02bb74',
            default: '#7e7e7e',
        }
        : {
            primary: "#007bff",
            primaryHover: "#0056b3",
            background: "#ffffff",
            paper: "#f3f3f3",
            subPaper: "rgba(255,255,255,0.7)",
            card: "#f3f3f3",
            text: "#08060d",
            forndireto: "#f3f3f3",
            inputBg: "#ffffff",
            sombra: "#000000",
            branco: "#FFFFFF",
            alerta: "#f3f3f3",
            tabela: "#e6e6e6",

            confirmar: "#02bb31",
            confirmarHover: "#009425",
            cancelar: "rgb(255, 53, 53)",
            cancelarHover: "rgb(202, 40, 40)",
            pendente: "#007bff",
            observacao: "rgb(231, 153, 49)",
            observacaoHover: "rgb(199, 129, 38)",
            conferido: "#28a745",
            achouItem: "#28a746a9",

            compra: '#44cc61',
            pendentes: '#c9c600',
            conferidos: '#007bff',
            parcial: '#f57c00',
            guardado: '#28a745',
            vendido: '#ff2e2e',
            devolvido: '#bb6b02',
            garantia: '#6802bb',
            retorno: '#02bb74',
            default: '#7e7e7e',
        };

    const theme = createTheme({
        palette: {
            mode: dark ? "dark" : "light",

            primary: {
                main: colors.primary,
                mainHover: colors.primaryHover,
                branco: colors.branco,
                confirmar: colors.confirmar,
                confirmarHover: colors.confirmarHover,
                cancelar: colors.cancelar,
                cancelarHover: colors.cancelarHover,
                pendente: colors.pendente,
                observacao: colors.observacao,
                observacaoHover: colors.observacaoHover,
                conferido: colors.conferido,
                achouItem: colors.achouItem,

                compra: colors.compra,
                pendentes: colors.pendentes,
                conferidos: colors.conferidos,
                parcial: colors.parcial,
                guardado: colors.guardado,
                vendido: colors.vendido,
                devolvido: colors.devolvido,
                garantia: colors.garantia,
                retorno: colors.retorno,
                default: colors.default,
            },

            background: {
                default: colors.background,
                paper: colors.paper,
                subPaper: colors.subPaper,
                card: colors.card,
                forndireto: colors.forndireto,
                inputBg: colors.inputBg,
                dialog: colors.dialog,
                sombra: colors.sombra,
                alerta: colors.alerta,
                tabela: colors.tabela
            },

            text: {
                primary: colors.text,
            },
        },

        components: {
            MuiCssBaseline: {
                styleOverrides: {
                    body: {
                        backgroundColor: colors.background,
                        color: colors.text,
                        transition: "all 0.3s ease",
                    },
                },
            },

            MuiCard: {
                styleOverrides: {
                    root: {
                        backgroundColor: colors.paper,
                        color: colors.text,
                        borderRadius: "12px",
                        boxShadow: dark
                            ? "0px 2px 10px rgba(0,0,0,0.8)"
                            : "0px 2px 10px rgba(0,0,0,0.1)",
                    },
                },
            },

            MuiDialog: {
                styleOverrides: {
                    paper: {
                        backgroundColor: colors.paper,
                        color: colors.text,
                    },
                },
            },

            MuiButton: {
                styleOverrides: {
                    contained: {
                        color: "#fff",
                    },
                },
            },

            MuiTextField: {
                styleOverrides: {
                    root: {
                        "& label": {
                            color: dark ? "#ccc" : "#555",
                        },

                        "& .MuiInputBase-input": {
                            color: colors.text,
                        },

                        "& .MuiOutlinedInput-root": {
                            backgroundColor: colors.inputBg,

                            "& fieldset": {
                                borderColor: colors.border,
                            },

                            "&:hover fieldset": {
                                borderColor: colors.primary,
                            },

                            "&.Mui-focused fieldset": {
                                borderColor: colors.primary,
                            },
                        },
                    },
                },
            },

            MuiOutlinedInput: {
                styleOverrides: {
                    root: {
                        backgroundColor: colors.inputBg,
                    },
                },
            },
        },
    });

    return (
        <ThemeContext.Provider value={{ dark, toggleTheme }}>
            <MuiThemeProvider theme={theme}>
                <CssBaseline />
                {children}
            </MuiThemeProvider>
        </ThemeContext.Provider>
    );
}