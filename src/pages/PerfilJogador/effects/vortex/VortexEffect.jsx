
// src\pages\PerfilJogador\effects\vortex\VortexEffect.jsx

import React from "react";

const estrelas = Array.from({ length: 110 });
const fragmentos = Array.from({ length: 26 });
const particulas = Array.from({ length: 42 });
const rastros = Array.from({ length: 9 });

const VortexEffect = () => {
    return (
        <div className="vortex-cosmos">

            {/* ATMOSFERA CÓSMICA */}

            <div className="vortex-universe">
                <span className="vortex-nebula vortex-nebula-one" />
                <span className="vortex-nebula vortex-nebula-two" />
                <span className="vortex-nebula vortex-nebula-three" />
                <span className="vortex-nebula vortex-nebula-four" />
                <span className="vortex-nebula vortex-nebula-five" />
            </div>

            {/* PROFUNDIDADE ESTELAR */}

            <div className="vortex-starfield">
                {estrelas.map((_, i) => (
                    <span
                        key={`vortex-star-${i}`}
                        className={`vortex-star ${i % 9 === 0 ? "vortex-star-bright" : ""}`}
                        style={{
                            "--x": `${(i * 47 + 13) % 100}%`,
                            "--y": `${(i * 71 + 7) % 100}%`,
                            "--size": `${1 + (i % 3)}px`,
                            "--delay": `${(i * 0.17) % 9}s`,
                            "--duration": `${2.5 + (i % 5)}s`,
                        }}
                    />
                ))}
            </div>

            {/* PORTAL DIMENSIONAL */}

            <div className="vortex-portal">

                <div className="vortex-portal-shadow" />

                <div className="vortex-portal-distortion" />

                <div className="vortex-portal-rim vortex-rim-outer" />
                <div className="vortex-portal-rim vortex-rim-middle" />
                <div className="vortex-portal-rim vortex-rim-inner" />

                <div className="vortex-portal-stream vortex-stream-one" />
                <div className="vortex-portal-stream vortex-stream-two" />
                <div className="vortex-portal-stream vortex-stream-three" />

                <div className="vortex-portal-core">
                    <span />
                    <span />
                    <span />
                </div>

                <div className="vortex-portal-flare vortex-flare-one" />
                <div className="vortex-portal-flare vortex-flare-two" />

            </div>

            {/* NUVENS QUE SE APROXIMAM DO PORTAL */}

            <div className="vortex-gravitational-clouds">
                <span className="vortex-cloud vortex-cloud-one" />
                <span className="vortex-cloud vortex-cloud-two" />
                <span className="vortex-cloud vortex-cloud-three" />
                <span className="vortex-cloud vortex-cloud-four" />
            </div>

            {/* RASTROS DE MATÉRIA */}

            <div className="vortex-streaks">
                {rastros.map((_, i) => (
                    <span
                        key={`vortex-streak-${i}`}
                        className="vortex-streak"
                        style={{
                            "--x": `${(i * 31 + 5) % 100}%`,
                            "--y": `${(i * 43 + 12) % 100}%`,
                            "--angle": `${(i * 53 + 20) % 360}deg`,
                            "--delay": `${(i * 0.8) % 7}s`,
                            "--duration": `${3 + (i % 4)}s`,
                        }}
                    />
                ))}
            </div>

            {/* ROCHAS E FRAGMENTOS ESPACIAIS */}

            <div className="vortex-debris">
                {fragmentos.map((_, i) => (
                    <span
                        key={`vortex-debris-${i}`}
                        className={`vortex-rock vortex-rock-${i % 4}`}
                        style={{
                            "--x": `${(i * 43 + 4) % 100}%`,
                            "--y": `${(i * 67 + 11) % 100}%`,
                            "--size": `${5 + (i % 7) * 2}px`,
                            "--delay": `${(i * 0.41) % 10}s`,
                            "--duration": `${7 + (i % 8)}s`,
                            "--rotation": `${i * 37}deg`,
                        }}
                    />
                ))}
            </div>


            {/* PLANETAS FLUTUANTES */}

            <div className="vortex-planets" aria-hidden="true">

                <span className="vortex-planet planet-one">🪐</span>
                <span className="vortex-planet planet-two">🌑</span>
                <span className="vortex-planet planet-three">🛰️</span>
                <span className="vortex-planet planet-four">🛸</span>
                <span className="vortex-planet planet-five">🌍</span>

            </div>

            {/* METEORO DIMENSIONAL */}

            <div className="vortex-meteor-field" aria-hidden="true">
                <span className="vortex-meteor">
                    <span className="vortex-meteor-head" />
                    <span className="vortex-meteor-tail" />
                </span>
            </div>


            {/* POEIRA CÓSMICA */}

            <div className="vortex-dust">
                {particulas.map((_, i) => (
                    <span
                        key={`vortex-dust-${i}`}
                        className="vortex-dust-particle"
                        style={{
                            "--x": `${(i * 37 + 9) % 100}%`,
                            "--y": `${(i * 61 + 3) % 100}%`,
                            "--size": `${1 + (i % 3)}px`,
                            "--delay": `${(i * 0.29) % 8}s`,
                            "--duration": `${4 + (i % 6)}s`,
                        }}
                    />
                ))}
            </div>

            {/* EXPLOSÕES DE LUZ */}

            <div className="vortex-flashes">
                <span className="vortex-flash vortex-flash-one" />
                <span className="vortex-flash vortex-flash-two" />
                <span className="vortex-flash vortex-flash-three" />
                <span className="vortex-flash vortex-flash-four" />
            </div>

            {/* ONDAS GRAVITACIONAIS */}

            <div className="vortex-gravity-waves">
                <span className="vortex-gravity-wave wave-one" />
                <span className="vortex-gravity-wave wave-two" />
                <span className="vortex-gravity-wave wave-three" />
            </div>

            {/* VINHETA E ILUMINAÇÃO FINAL */}

            <div className="vortex-atmosphere" />
            <div className="vortex-edge-glow" />
            <div className="vortex-lightning-flash" />

        </div>
    );
};

export default VortexEffect;
