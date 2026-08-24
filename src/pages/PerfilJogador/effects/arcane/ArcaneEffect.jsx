const ArcaneEffect = () => {
    return (
        <>
            <span className="pulse-fog" />
            <span className="arcane-light" />
            <span className="pulse-core" />
            <span className="arcane-circle" />
            <span className="arcane-circle-small" />
            <span className="arcane-orbit" />
            <span className="arcane-wave" />

            <span
                className="arcane-star"
                style={{ left: "18%", top: "25%" }}
            />

            <span
                className="arcane-star"
                style={{ left: "78%", top: "35%" }}
            />

            <span
                className="arcane-star"
                style={{ left: "30%", top: "70%" }}
            />

            <span
                className="arcane-star"
                style={{ left: "65%", top: "82%" }}
            />

            <span
                className="arcane-rune"
                style={{ left: "22%", top: "55%" }}
            >
                ✦
            </span>

            <span
                className="arcane-rune"
                style={{ left: "76%", top: "60%" }}
            >
                ✧
            </span>

            <span
                className="arcane-rune"
                style={{ left: "42%", top: "18%" }}
            >
                ✶
            </span>

            <span className="arcane-burst" />
            <span className="arcane-shine" />

            {/* Partículas da Aura Arcana */}
            {Array.from({ length: 50 }).map((_, i) => (
                <span
                    key={`arcane-${i}`}
                    className="particle"
                    style={{
                        "--i": i,
                        "--size": Math.floor(Math.random() * 4),
                    }}
                />
            ))}

        </>
    );
};

export default ArcaneEffect;