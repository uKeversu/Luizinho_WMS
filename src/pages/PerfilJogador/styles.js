export const cardStyle = {
    background: "linear-gradient(180deg,#111827,#0b1220)",
    border: "1px solid rgba(255,170,0,.18)",
    borderRadius: "18px",
    color: "#fff",
    boxShadow: "0 0 25px rgba(255,170,0,.08)",
    overflow: "hidden"
};

export const titulo = {
    color: "#ffb300",
    fontWeight: 700,
    letterSpacing: 1,
    fontSize: 18,
    mb: 2
};

export const subtitulo = {
    color: "#94a3b8",
    fontSize: 12
};

export const valor = {
    color: "#fff",
    fontWeight: 700,
    fontSize: 22
};

export const cardInterno = {
    background: "#0f172a",
    border: "1px solid rgba(255,255,255,.08)",
    borderRadius: 2,
    p: 2
};

export const brilhoLaranja = {
    boxShadow: "0 0 20px rgba(255,160,0,.25)"
};

export const barraXP = {
    height: 10,
    borderRadius: 10,
    background: "#1e293b"
};

export const avatarGrande = {
    width: 170,
    height: 170,
    fontSize: 85,
    bgcolor: "#111827",
    border: "3px solid #ff9800",
    boxShadow: "0 0 30px rgba(255,140,0,.45)"
};

export const corRaridade = (raridade) => {

    switch (raridade) {

        case "MITICO":
            return "#00d335";

        case "LENDARIO":
            return "#ff9800";

        case "EPICO":
            return "#9C27B0";

        case "RARO":
            return "#2196F3";

        case "INCOMUM":
            return "#4CAF50";

        default:
            return "#607D8B";

    }

};

export const estiloCard = {

    bgcolor: "#0b111b",

    border: "1px solid #1d2d45",

    borderRadius: 4,

    color: "white",

    boxShadow: "0 0 18px rgba(255,150,0,.08)",

    p: 3

};

export const tituloCard = {

    fontSize: 20,

    fontWeight: 700,

    color: "#FFD54F",

    mb: 2,

    textTransform: "uppercase",

    letterSpacing: 1

};