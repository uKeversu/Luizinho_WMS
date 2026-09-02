import { useMemo } from "react";

const GauderioEffect = () => {

    const meats = useMemo(
        () =>
            ["🥩", "🍖", "🔥", "🍖", "🥩"].map((emoji, i) => ({
                id: i,
                emoji,
                y: 8 + i * 16 + Math.random() * 10,
                delay: i * 3.4 + Math.random() * 1.5,
                duration: 10 + Math.random() * 4,
                size: 20 + Math.random() * 10,
                rot: i % 2 === 0 ? 1 : -1
            })),
        []
    );

    const steam = useMemo(
        () =>
            [...Array(14)].map((_, i) => ({
                id: i,
                delay: Math.random() * 3,
                duration: 2.2 + Math.random() * 2,
                drift: -20 + Math.random() * 40,
                size: 9 + Math.random() * 15
            })),
        []
    );

    const fireflies = useMemo(
        () =>
            [...Array(13)].map((_, i) => ({
                id: i,
                x: 6 + Math.random() * 88,
                y: 14 + Math.random() * 68,
                delay: Math.random() * 6,
                duration: 3.5 + Math.random() * 4
            })),
        []
    );

    const stars = useMemo(
        () =>
            [...Array(26)].map((_, i) => ({
                id: i,
                x: Math.random() * 100,
                y: Math.random() * 48,
                delay: Math.random() * 5,
                size: 1 + Math.random() * 1.6
            })),
        []
    );

    const dust = useMemo(
        () =>
            [...Array(18)].map((_, i) => ({
                id: i,
                x: Math.random() * 100,
                y: 42 + Math.random() * 52,
                delay: Math.random() * 6,
                duration: 5 + Math.random() * 5,
                size: 1 + Math.random() * 2
            })),
        []
    );

    return (
        <div className="pampero-scene">

            {/* ================================================= */}
            {/* CÉU */}
            {/* ================================================= */}

            <div className="pampero-sky" />

            <div className="pampero-stars">
                {stars.map((s) => (
                    <span
                        key={s.id}
                        className="pampero-star"
                        style={{
                            "--x": `${s.x}%`,
                            "--y": `${s.y}%`,
                            "--delay": `${s.delay}s`,
                            "--size": `${s.size}px`
                        }}
                    />
                ))}
            </div>

            <div className="pampero-moon">
                <div className="pampero-moon-glow" />
                <div className="pampero-moon-craters">
                    <span />
                    <span />
                    <span />
                </div>
            </div>

            {/* ================================================= */}
            {/* COXILHAS DA PAMPA */}
            {/* ================================================= */}

            <div className="pampero-hills">
                <div className="pampero-hill pampero-hill-back" />
                <div className="pampero-hill pampero-hill-mid" />
                <div className="pampero-hill pampero-hill-front" />
            </div>

            <div className="pampero-birds">
                {[...Array(3)].map((_, i) => (
                    <span
                        key={i}
                        className="pampero-bird"
                        style={{ "--i": i }}
                    />
                ))}
            </div>

            {/* ================================================= */}
            {/* CAPIM DA PAMPA */}
            {/* ================================================= */}

            <div className="pampero-grass">
                {[...Array(20)].map((_, i) => (
                    <span
                        key={i}
                        className="pampero-blade"
                        style={{
                            "--i": i,
                            "--h": `${22 + (i * 7) % 24}px`
                        }}
                    />
                ))}
            </div>

            {/* ================================================= */}
            {/* CARNES FLUTUANDO NO VENTO */}
            {/* ================================================= */}

            <div className="pampero-meats">
                {meats.map((m) => (
                    <span
                        key={m.id}
                        className="pampero-meat"
                        style={{
                            "--y": `${m.y}%`,
                            "--delay": `${m.delay}s`,
                            "--duration": `${m.duration}s`,
                            "--size": `${m.size}px`,
                            "--rot": m.rot
                        }}
                    >
                        {m.emoji}
                    </span>
                ))}
            </div>

            {/* ================================================= */}
            {/* VAGALUMES */}
            {/* ================================================= */}

            <div className="pampero-fireflies">
                {fireflies.map((f) => (
                    <span
                        key={f.id}
                        className="pampero-firefly"
                        style={{
                            "--x": `${f.x}%`,
                            "--y": `${f.y}%`,
                            "--delay": `${f.delay}s`,
                            "--duration": `${f.duration}s`
                        }}
                    />
                ))}
            </div>

            {/* ================================================= */}
            {/* POEIRA DO CAMPO */}
            {/* ================================================= */}

            <div className="pampero-dust">
                {dust.map((p) => (
                    <span
                        key={p.id}
                        className="pampero-dust-mote"
                        style={{
                            "--x": `${p.x}%`,
                            "--y": `${p.y}%`,
                            "--delay": `${p.delay}s`,
                            "--duration": `${p.duration}s`,
                            "--size": `${p.size}px`
                        }}
                    />
                ))}
            </div>

            {/* ================================================= */}
            {/* CUIA DE ERVA-MATE — peça central */}
            {/* ================================================= */}

            <div className="pampero-mate">

                <div className="pampero-mate-aura" />
                <div className="pampero-mate-shadow" />

                <div className="pampero-steam">
                    {steam.map((p) => (
                        <span
                            key={p.id}
                            className="pampero-steam-puff"
                            style={{
                                "--delay": `${p.delay}s`,
                                "--duration": `${p.duration}s`,
                                "--drift": `${p.drift}px`,
                                "--size": `${p.size}px`
                            }}
                        />
                    ))}
                </div>

                <div className="pampero-cuia">

                    <div className="pampero-cuia-body">
                        <div className="pampero-cuia-shade" />
                        <div className="pampero-cuia-shine" />
                    </div>

                    <div className="pampero-cuia-rim">
                        <div className="pampero-mate-surface">
                            {[...Array(6)].map((_, i) => (
                                <span
                                    key={i}
                                    className="pampero-mate-fleck"
                                    style={{
                                        "--i": i,
                                        "--fx": `${6 + (i * 8) % 40}px`,
                                        "--fy": `${2 + (i * 5) % 9}px`
                                    }}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="pampero-bomba">
                        <span className="pampero-bomba-tube" />
                        <span className="pampero-bomba-grip" />
                        <span className="pampero-bomba-mouth" />
                    </div>

                </div>

            </div>

            {/* ================================================= */}
            {/* VENTO */}
            {/* ================================================= */}

            <div className="pampero-wind">
                {[...Array(6)].map((_, i) => (
                    <span key={i} style={{ "--i": i }} />
                ))}
            </div>

            {/* ================================================= */}
            {/* BORDA */}
            {/* ================================================= */}

            <div className="pampero-vignette" />
            <div className="pampero-border" />

        </div>
    );
};

export default GauderioEffect;
