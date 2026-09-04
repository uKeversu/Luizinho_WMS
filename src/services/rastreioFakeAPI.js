export const fakeRastreio = async (codigo, tipo = "unidade") => {

    // Simula delay de API
    await new Promise(resolve => setTimeout(resolve, 500));

    // RASTREIO DE GRUPO
    if (tipo === "grupo") {

        return {
            tipo: "grupo",

            id_grupo: codigo,

            codigo: "2618CPA",
            descricao: "Produto agrupado",
            numero: "973525",
            serie: "1",
            localizacao: "002A 022",

            quantidade: 8,

            unidades: [
                {
                    id_unico: "PL818H",
                    status: "CONFERIDO"
                },
                {
                    id_unico: "7PIKAA",
                    status: "CONFERIDO"
                },
                {
                    id_unico: "UWCZZ4",
                    status: "CONFERIDO"
                },
                {
                    id_unico: "CBPW25",
                    status: "CONFERIDO"
                },
                {
                    id_unico: "LEP97Q",
                    status: "CONFERIDO"
                },
                {
                    id_unico: "NB0MBF",
                    status: "CONFERIDO"
                },
                {
                    id_unico: "EZDBFC",
                    status: "CONFERIDO"
                },
                {
                    id_unico: "J3JKC3",
                    status: "CONFERIDO"
                }
            ],

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
                }
            ]
        };
    }

    // RASTREIO DE UNIDADE
    return {

        tipo: "unidade",

        id_unico: codigo,

        codigo: "2618CPA",
        descricao: "Produto de teste",

        numero: "973525",
        serie: "1",

        localizacao: "002A 022",

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
            }
        ]
    };
};