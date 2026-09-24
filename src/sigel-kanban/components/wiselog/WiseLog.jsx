
import React, { useState } from "react";

import {
    Box,
    Paper,
    Stack,
    Tab,
    Tabs,
    Typography,
} from "@mui/material";

import {
    CalendarMonthOutlined,
    CardGiftcardOutlined,
    TwoWheelerOutlined,
    SportsMotorsports
} from "@mui/icons-material";

import WiseLogSemana from "./WiseLogSemana";
import WiseLogMotoboys from "./WiseLogMotoboys";
import WiseLogRecompensas from "./WiseLogRecompensas";


/**
 * ============================================================================
 * WISELOG
 * ============================================================================
 *
 * Componente principal do módulo WiseLog.
 *
 * Responsabilidades:
 * - Exibir o cabeçalho do módulo.
 * - Controlar a navegação entre as abas.
 * - Renderizar os componentes internos:
 *      - WiseLogSemana
 *      - WiseLogMotoboys
 *      - WiseLogRecompensas
 *
 * Props:
 * - notify: função de notificação recebida do componente principal do Kanban.
 *
 * Estrutura esperada:
 *
 * src/
 * └── sigel-kanban/
 *     ├── pages/
 *     │   └── Kanban.jsx
 *     │
 *     └── components/
 *         └── wiselog/
 *             ├── WiseLog.jsx
 *             ├── WiseLogSemana.jsx
 *             ├── WiseLogMotoboys.jsx
 *             └── WiseLogRecompensas.jsx
 *
 * ============================================================================
 */


export default function WiseLog({ notify }) {
    /**
     * Aba atualmente selecionada.
     *
     * Valores possíveis:
     * - semana
     * - motoboys
     * - recompensas
     */
    const [activeTab, setActiveTab] = useState("semana");


    /**
     * Altera a aba ativa.
     */
    const handleTabChange = (_event, newValue) => {
        if (!newValue) {
            return;
        }

        setActiveTab(newValue);
    };


    /**
     * Renderiza o conteúdo correspondente à aba ativa.
     */
    const renderActiveTab = () => {
        switch (activeTab) {
            case "semana":
                return (
                    <WiseLogSemana
                        notify={notify}
                    />
                );

            case "motoboys":
                return (
                    <WiseLogMotoboys
                        notify={notify}
                    />
                );

            case "recompensas":
                return (
                    <WiseLogRecompensas
                        notify={notify}
                    />
                );

            default:
                return (
                    <WiseLogSemana
                        notify={notify}
                    />
                );
        }
    };


    return (
        <Box
            sx={{
                width: "100%",
                minWidth: 0,
            }}
        >
            {/* ================================================================== */}
            {/* CABEÇALHO                                                         */}
            {/* ================================================================== */}

            <Paper
                variant="outlined"
                sx={{
                    p: {
                        xs: 1.5,
                        sm: 2,
                        md: 2.5,
                    },
                    mb: 2.5,
                    borderRadius: 3,
                    bgcolor: "background.default",
                }}
            >
                <Stack
                    spacing={0.75}
                >
                    <Typography
                        variant="h5"
                        fontWeight={900}
                        sx={{
                            lineHeight: 1.2,
                        }}
                    >
                        WiseLog
                    </Typography>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                    >
                        Controle de utilização, validações e recompensas
                        dos motoboys terceirizados.
                    </Typography>
                </Stack>
            </Paper>


            {/* ================================================================== */}
            {/* NAVEGAÇÃO ENTRE MÓDULOS                                           */}
            {/* ================================================================== */}

            <Paper
                variant="outlined"
                sx={{
                    mb: 2.5,
                    borderRadius: 2.5,
                    overflow: "hidden",
                    bgcolor: "background.default",
                }}
            >
                <Tabs
                    value={activeTab}
                    onChange={handleTabChange}
                    variant="scrollable"
                    scrollButtons="auto"
                    allowScrollButtonsMobile
                    aria-label="Navegação do WiseLog"
                    sx={{
                        minHeight: 52,

                        "& .MuiTab-root": {
                            minHeight: 52,
                            minWidth: {
                                xs: 130,
                                sm: 150,
                            },
                            px: {
                                xs: 1.5,
                                sm: 2,
                            },
                            fontWeight: 700,
                            textTransform: "none",
                            gap: 0.5,
                        },

                        "& .MuiTabs-indicator": {
                            height: 3,
                            borderRadius: "3px 3px 0 0",
                        },
                    }}
                >
                    <Tab
                        value="semana"
                        label="Semana"
                        icon={
                            <CalendarMonthOutlined
                                fontSize="small"
                            />
                        }
                        iconPosition="start"
                        id="wiselog-tab-semana"
                        aria-controls="wiselog-panel-semana"
                    />

                    <Tab
                        value="motoboys"
                        label="Motoboys"
                        icon={
                            <SportsMotorsports
                                fontSize="small"
                            />
                        }
                        iconPosition="start"
                        id="wiselog-tab-motoboys"
                        aria-controls="wiselog-panel-motoboys"
                    />

                    <Tab
                        value="recompensas"
                        label="Recompensas"
                        icon={
                            <CardGiftcardOutlined
                                fontSize="small"
                            />
                        }
                        iconPosition="start"
                        id="wiselog-tab-recompensas"
                        aria-controls="wiselog-panel-recompensas"
                    />
                </Tabs>
            </Paper>


            {/* ================================================================== */}
            {/* CONTEÚDO DA ABA ATIVA                                             */}
            {/* ================================================================== */}

            <Box
                role="tabpanel"
                id={`wiselog-panel-${activeTab}`}
                aria-labelledby={`wiselog-tab-${activeTab}`}
                sx={{
                    width: "100%",
                    minWidth: 0,
                }}
            >
                {renderActiveTab()}
            </Box>
        </Box>
    );
}