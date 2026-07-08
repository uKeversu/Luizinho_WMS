// ParticleEffect.jsx

import Particles from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import { useEffect, useState } from "react";

export default function ParticleEffect({ options }) {
    const [init, setInit] = useState(false);

    useEffect(() => {
        loadSlim().then(() => setInit(true));
    }, []);

    if (!init) return null;

    return (
        <Particles
            options={options}
            style={{
                position: "absolute",
                inset: 0,
                pointerEvents: "none",
            }}
        />
    );
}