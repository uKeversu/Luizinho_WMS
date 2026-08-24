const SentinelaEffect = () => {
    return (
        <>
            {/* Atmosfera */}
            <span className="sentinela-atmosphere" />

            {/* Camuflagem */}
            <span className="sentinela-camo" />

            {/* Grade tática */}
            <span className="sentinela-grid" />

            {/* Radar */}
            <div className="sentinela-radar">
                <span className="radar-circle radar-1" />
                <span className="radar-circle radar-2" />
                <span className="radar-circle radar-3" />
                <span className="radar-line" />

                <span className="radar-point point-1" />
                <span className="radar-point point-2" />
                <span className="radar-point point-3" />
            </div>

            {/* Centro de energia */}
            <span className="sentinela-core" />

            {/* Anel de comando */}
            <span className="sentinela-command-ring" />

            {/* Varredura */}
            <span className="sentinela-scan" />

            {/* Linhas horizontais */}
            <span className="sentinela-line line-1" />
            <span className="sentinela-line line-2" />
            <span className="sentinela-line line-3" />

            {/* Partículas */}
            <div className="sentinela-particles">
                {Array.from({ length: 45 }).map((_, i) => (
                    <span
                        key={`sentinela-particle-${i}`}
                        className="sentinela-particle"
                        style={{
                            "--i": i,
                            "--x": `${(i * 23) % 100}%`,
                            "--delay": `${(i * 0.17) % 6}s`,
                            "--duration": `${5 + (i % 5)}s`,
                        }}
                    />
                ))}
            </div>

            {/* Poeira */}
            <div className="sentinela-dust">
                {Array.from({ length: 25 }).map((_, i) => (
                    <span
                        key={`sentinela-dust-${i}`}
                        style={{
                            "--x": `${(i * 37) % 100}%`,
                            "--y": `${(i * 19) % 100}%`,
                            "--delay": `${(i * 0.31) % 5}s`,
                        }}
                    />
                ))}
            </div>

            {/* Flash dourado */}
            <span className="sentinela-flash" />

            {/* Moldura energética */}
            <span className="sentinela-border" />
        </>
    );
};

export default SentinelaEffect;