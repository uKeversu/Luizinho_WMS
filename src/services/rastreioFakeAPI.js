export const fakeRastreio = async (codigo) => {
    
    // Simula delay de API
    await new Promise(resolve => setTimeout(resolve, 500));

    return {
        codigo,
        descricao: "SEMI-EIXO DEVIGILI",
        localizacao: "030B 009",
        eventos: [
            {
                tipo: "PENDENTE",
                data: "30-03-2026 10:40"
            },
            {
                tipo: "CONFERIDO",
                data: "01-04-2026 15:30"
            },
            {
                tipo: "GUARDADO",
                data: "04-04-2026 08:10"
            },
            {
                tipo: "VENDIDO",
                data: "06-04-2026 09:26"
            },
            {
                tipo: "DEVOLVIDO",
                data: "07-04-2026 16:02"
            },
            {
                tipo: "CONFERIDO",
                data: "07-04-2026 16:05"
            },
            {
                tipo: "GUARDADO",
                data: "09-04-2026 14:15"
            },

        ]
    };
};