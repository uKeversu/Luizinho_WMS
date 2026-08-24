const GenesisEffect = () => {
    return (
        <div className="genesis-aura">

            {/* Halo */}
            <div className="genesis-halo" />

            {/* Nebulosa */}
            <div className="genesis-nebula" />

            {/* Raios */}
            <div className="genesis-rays">
                {[...Array(10)].map((_, i) => (
                    <span
                        key={i}
                        className="genesis-ray"
                        style={{
                            "--i": i
                        }}
                    />
                ))}
            </div>

            {/* Brilho Central */}
            <div className="genesis-flare" />

            {/* Reflexo */}
            <div className="genesis-light-sweep" />

            {/* Órbitas */}
            <div className="genesis-orbit">
                {[...Array(8)].map((_, i) => (
                    <div
                        key={i}
                        className="genesis-orb"
                        style={{
                            "--i": i
                        }}
                    />
                ))}
            </div>

            {/* Cristais */}
            <div className="genesis-crystals">
                {[...Array(12)].map((_, i) => (
                    <span
                        key={i}
                        className="genesis-crystal"
                        style={{
                            "--i": i
                        }}
                    />
                ))}
            </div>

            {/* Fragmentos */}
            <div className="genesis-fragments">
                {[...Array(18)].map((_, i) => (
                    <span
                        key={i}
                        className="genesis-fragment"
                        style={{
                            "--i": i
                        }}
                    />
                ))}
            </div>

            {/* Partículas */}
            <div className="genesis-particles">
                {[...Array(70)].map((_, i) => (
                    <div
                        className="genesis-particle"
                        style={{
                            "--i": i,
                            "--x": `${Math.random() * 100}%`,
                            "--delay": `${Math.random() * 6}s`,
                            "--size": `${2 + (i % 4)}px`
                        }}
                    />
                ))}
            </div>

            {/* Estrelas */}
            <div className="genesis-stars">
                {[...Array(35)].map((_, i) => (
                    <span
                        key={i}
                        className="genesis-star"
                        style={{
                            "--x": `${(i * 19) % 100}%`,
                            "--y": `${(i * 31) % 100}%`,
                            "--delay": `${(i * 0.11).toFixed(2)}s`
                        }}
                    />
                ))}
            </div>
            <div className="genesis-dust">
                {[...Array(50)].map((_, i) => (
                    <span
                        key={i}
                        style={{
                            "--x": `${Math.random() * 100}%`,
                            "--y": `${Math.random() * 100}%`,
                            "--delay": `${Math.random() * 8}s`,
                            "--duration": `${6 + Math.random() * 6}s`
                        }}
                    />
                ))}
            </div>

            <div className="genesis-wave" />
            <div className="genesis-border" />
            <div className="genesis-divine-flash" />

            <div className="genesis-aurora" />

            <div className="genesis-rain">
                {[...Array(45)].map((_, i) => (
                    <span
                        key={i}
                        className="genesis-drop"
                        style={{
                            "--x": `${Math.random() * 100}%`,
                            "--size": `${40 + Math.random() * 60}px`,
                            "--delay": `${Math.random() * 6}s`,
                            "--duration": `${1.5 + Math.random() * 2}s`
                        }}
                    />
                ))}
            </div>

            <div className="genesis-sparks">
                {[...Array(35)].map((_, i) => (
                    <span
                        key={i}
                        className="genesis-spark"
                        style={{
                            "--x": `${Math.random() * 100}%`,
                            "--y": `${Math.random() * 100}%`,
                            "--delay": `${Math.random() * 6}s`,
                            "--duration": `${1 + Math.random() * 2}s`
                        }}
                    />
                ))}
            </div>
        </div>
    );
};

export default GenesisEffect;