export const EFEITOS = {

    "Aura Arcana": {
        background: "linear-gradient(135deg,#221133,#111827)",
        cardGlow: "0 0 30px #8b5cf6",
        nomeGlow: "0 0 12px #b05cff",

        particles: {
            particles: {
                number: {
                    value: 15
                },

                color: {
                    value: "#b05cff"
                },

                move: {
                    speed: 1
                },

                size: {
                    value: 3
                }
            }
        }
    },

    "Maré Divina": {
        background: "linear-gradient(135deg,#00334d,#111827)",
        cardGlow: "0 0 30px #00bfff",
        nomeGlow: "0 0 12px #00d5ff",

        particles: {
            particles: {
                color: {
                    value: "#00d5ff"
                }
            }
        }
    },

    default: {
        background: "#111827",
        cardGlow: "none",
        nomeGlow: "none",
        particles: null,
    }
};