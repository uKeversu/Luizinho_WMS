const OptimusEffect = () => {
    return (
        <div className="optimus-effect">

            {/* NÚCLEO CENTRAL */}
            <div className="optimus-core">

                <span className="optimus-core-outer" />
                <span className="optimus-core-ring ring-1" />
                <span className="optimus-core-ring ring-2" />
                <span className="optimus-core-ring ring-3" />

                <span className="optimus-core-energy" />

                <div className="optimus-core-symbol">
                    ⚙
                </div>

            </div>


            {/* PULSOS DE ENERGIA */}
            <div className="optimus-pulses">

                <span className="optimus-pulse pulse-1" />
                <span className="optimus-pulse pulse-2" />
                <span className="optimus-pulse pulse-3" />
                <span className="optimus-pulse pulse-4" />

            </div>


            {/* ANÉIS TECNOLÓGICOS */}
            <div className="optimus-tech-rings">

                <span className="optimus-ring tech-ring-1" />
                <span className="optimus-ring tech-ring-2" />
                <span className="optimus-ring tech-ring-3" />

            </div>


            {/* ENGRENAGENS */}
            <div className="optimus-gears">

                <span className="optimus-gear gear-1">
                    ⚙
                </span>

                <span className="optimus-gear gear-2">
                    ⚙
                </span>

                <span className="optimus-gear gear-3">
                    ⚙
                </span>

                <span className="optimus-gear gear-4">
                    ⚙
                </span>

            </div>


            {/* CIRCUITOS */}
            <div className="optimus-circuits">

                <span className="optimus-circuit circuit-1">
                    <i />
                    <i />
                    <i />
                </span>

                <span className="optimus-circuit circuit-2">
                    <i />
                    <i />
                    <i />
                </span>

                <span className="optimus-circuit circuit-3">
                    <i />
                    <i />
                    <i />
                </span>

                <span className="optimus-circuit circuit-4">
                    <i />
                    <i />
                    <i />
                </span>

                <span className="optimus-circuit circuit-5">
                    <i />
                    <i />
                    <i />
                </span>

                <span className="optimus-circuit circuit-6">
                    <i />
                    <i />
                    <i />
                </span>

            </div>


            {/* LINHAS DE ENERGIA */}
            <div className="optimus-energy-lines">

                <span className="energy-line line-1" />
                <span className="energy-line line-2" />
                <span className="energy-line line-3" />
                <span className="energy-line line-4" />
                <span className="energy-line line-5" />
                <span className="energy-line line-6" />

            </div>


            {/* SCANNER HORIZONTAL */}
            <span className="optimus-scanner" />


            {/* GRID / HUD */}
            <div className="optimus-hud">

                <span className="hud-corner corner-tl" />
                <span className="hud-corner corner-tr" />
                <span className="hud-corner corner-bl" />
                <span className="hud-corner corner-br" />

                <span className="hud-line hud-line-horizontal-1" />
                <span className="hud-line hud-line-horizontal-2" />

                <span className="hud-line hud-line-vertical-1" />
                <span className="hud-line hud-line-vertical-2" />

            </div>


            {/* PARTÍCULAS DE ENERGIA */}
            <div className="optimus-particles">

                {Array.from({ length: 70 }).map((_, i) => (
                    <span
                        key={`optimus-particle-${i}`}
                        className="optimus-particle"
                        style={{
                            "--i": i,
                            "--x": `${(i * 37) % 100}%`,
                            "--y": `${(i * 61) % 100}%`,
                            "--delay": `${(i * 0.13) % 6}s`,
                            "--duration": `${4 + (i % 5)}s`,
                            "--size": `${1 + (i % 4)}px`,
                        }}
                    />
                ))}

            </div>


            {/* FAÍSCAS */}
            <div className="optimus-sparks">

                {Array.from({ length: 35 }).map((_, i) => (
                    <span
                        key={`optimus-spark-${i}`}
                        className="optimus-spark"
                        style={{
                            "--i": i,
                            "--x": `${(i * 43) % 100}%`,
                            "--y": `${(i * 29) % 100}%`,
                            "--delay": `${(i * 0.21) % 5}s`,
                        }}
                    />
                ))}

            </div>


            {/* NÚCLEOS DE DADOS */}
            <div className="optimus-data">

                {Array.from({ length: 12 }).map((_, i) => (
                    <span
                        key={`optimus-data-${i}`}
                        className="optimus-data-node"
                        style={{
                            "--i": i,
                            "--x": `${(i * 47) % 100}%`,
                            "--y": `${(i * 67) % 100}%`,
                            "--delay": `${(i * 0.35) % 6}s`,
                        }}
                    >
                        <b />
                        <i />
                    </span>
                ))}

            </div>

            {/* ONDA DE SOBRECARGA */}
            <span className="optimus-overload" />
            <span className="optimus-overload optimus-overload-2" />

            {/* FLASH DE ENERGIA */}
            <span className="optimus-energy-flash" />

            {/* REFLEXO TECNOLÓGICO */}
            <span className="optimus-light-sweep" />

            {/* BORDA ENERGÉTICA */}
            <span className="optimus-border" />

        </div>
    );
};

export default OptimusEffect;