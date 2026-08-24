const CaravelaEffect = () => {
    return (
        <div
            className="caldeirao-overlay"
            aria-hidden="true"
        >

            {/* Faixa diagonal Cruzmaltina */}
            <span className="vasco-faixa" />


            {/* Névoa marítima */}
            <span className="oceano-nevoa" />

            {/* Céu de tempestade */}
            <span className="ceu-tempestade" />


            {/* Relâmpagos */}
            <span className="relampago" />


            {/* Névoa frontal */}
            <span className="nevoa-frontal" />


            {/* Espuma das ondas */}
            <span className="espuma-mar" />



            {/* Chuva pesada */}
            <div className="chuva-frontal">

                {Array.from({ length: 120 }).map((_, i) => (
                    <span
                        key={`chuva-${i}`}
                        className="gota-frontal"
                        style={{
                            "--i": i,
                            "--pos": `${i * 0.85}%`
                        }}
                    />
                ))}

            </div>

            {/* Caravela Portuguesa ao fundo */}
            <div className="caravela">
                <span className="caravela-mastro" />
                <span className="caravela-vela vela1" />
                <span className="caravela-vela vela2" />
                <span className="caravela-casco" />
                <span className="caravela-bandeira" />
            </div>

            {/* Ondas gigantes */}
            <span className="mar-onda" />
            <span className="mar-onda onda2" />


            {/* Chuva intensa */}
            <div className="chuva">
                {Array.from({ length: 80 }).map((_, i) => (
                    <span
                        key={`chuva-${i}`}
                        className="gota"
                        style={{
                            "--i": i
                        }}
                    />
                ))}
            </div>

        </div>
    );
};

export default CaravelaEffect;