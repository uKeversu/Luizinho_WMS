export const fakeRastreio = async (codigo) => {
    
    // Simula delay de API
    await new Promise(resolve => setTimeout(resolve, 500));

    return {
        codigo,
        id: "1B4T8J9K",
        descricao: "SEMI-EIXO DEVIGILI",
        localizacao: "030B 009",
        atual: "Retorno de fornecedor",
        eventos: [
            {
                tipo: "COMPRA",
                data: "19-03-2026 14:12",
                funcionario: "Kelwin Gameiro",
            },
            {
                tipo: "PENDENTE",
                data: "30-03-2026 10:40",
                funcionario: "Kelwin Gameiro",
            },
            {
                tipo: "CONFERIDO",
                data: "01-04-2026 15:30",
                funcionario: "Kelwin Gameiro",
            },
            {
                tipo: "GUARDADO",
                data: "04-04-2026 08:10",
                funcionario: "Kelwin Gameiro",
            },
            {
                tipo: "VENDIDO",
                data: "06-04-2026 09:26",
                funcionario: "Kelwin Gameiro",
            },
            {
                tipo: "DEVOLVIDO",
                data: "07-04-2026 16:02",
                funcionario: "Kelwin Gameiro",
            },
            {
                tipo: "CONFERIDO",
                data: "07-04-2026 16:05",
                funcionario: "Kelwin Gameiro",
            },
            {
                tipo: "GUARDADO",
                data: "09-04-2026 14:15",
                funcionario: "Kelwin Gameiro",
            },
            {
                tipo: "VENDIDO",
                data: "15-04-2026 14:15",
                funcionario: "Kelwin Gameiro",
            },
            {
                tipo: "GARANTIA",
                data: "20-04-2026 14:15",
                funcionario: "Kelwin Gameiro",
            },
            {
                tipo: "RETORNO",
                data: "4-06-2026 14:15",
                funcionario: "Kelwin Gameiro",
            },

        ]
    };
};