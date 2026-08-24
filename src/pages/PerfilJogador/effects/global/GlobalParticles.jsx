const GlobalParticles = () => {
    return (
        <>
            {Array.from({ length: 50 }).map((_, i) => (
                <span
                    key={`global-particle-${i}`}
                    className="particle"
                    style={{
                        "--i": i,
                    }}
                />
            ))}
        </>
    );
};

export default GlobalParticles;