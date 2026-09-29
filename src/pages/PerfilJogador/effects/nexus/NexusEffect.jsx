// src\pages\PerfilJogador\effects\nexus\NexusEffect.jsx

import React from "react";

const NexusEffect = () => {
    return (
        <div className="nexus-effect">

            <div className="nexus-core">

                <span className="nexus-core-outer" />
                <span className="nexus-core-ring ring-1" />
                <span className="nexus-core-ring ring-2" />
                <span className="nexus-core-ring ring-3" />

                <span className="nexus-core-energy" />

                <div className="nexus-core-symbol">
                    <span className="nexus-symbol-node" />
                    <span className="nexus-symbol-node node-2" />
                    <span className="nexus-symbol-node node-3" />
                    <span className="nexus-symbol-node node-4" />

                    <span className="nexus-symbol-line line-1" />
                    <span className="nexus-symbol-line line-2" />
                    <span className="nexus-symbol-line line-3" />

                    <b>NX</b>
                </div>

            </div>

            <div className="nexus-network">

                <span className="nexus-network-line network-line-1" />
                <span className="nexus-network-line network-line-2" />
                <span className="nexus-network-line network-line-3" />
                <span className="nexus-network-line network-line-4" />
                <span className="nexus-network-line network-line-5" />
                <span className="nexus-network-line network-line-6" />
                <span className="nexus-network-line network-line-7" />
                <span className="nexus-network-line network-line-8" />

                <span className="nexus-network-node network-node-1" />
                <span className="nexus-network-node network-node-2" />
                <span className="nexus-network-node network-node-3" />
                <span className="nexus-network-node network-node-4" />
                <span className="nexus-network-node network-node-5" />
                <span className="nexus-network-node network-node-6" />
                <span className="nexus-network-node network-node-7" />
                <span className="nexus-network-node network-node-8" />

            </div>

            <div className="nexus-connection-rings">

                <span className="nexus-ring connection-ring-1" />
                <span className="nexus-ring connection-ring-2" />
                <span className="nexus-ring connection-ring-3" />
                <span className="nexus-ring connection-ring-4" />

            </div>

            <div className="nexus-orbits">

                <span className="nexus-orbit orbit-1">
                    <i />
                </span>

                <span className="nexus-orbit orbit-2">
                    <i />
                </span>

                <span className="nexus-orbit orbit-3">
                    <i />
                </span>

            </div>

            <div className="nexus-data-flow">

                <span className="nexus-data-line data-line-1">
                    <i />
                </span>

                <span className="nexus-data-line data-line-2">
                    <i />
                </span>

                <span className="nexus-data-line data-line-3">
                    <i />
                </span>

                <span className="nexus-data-line data-line-4">
                    <i />
                </span>

                <span className="nexus-data-line data-line-5">
                    <i />
                </span>

                <span className="nexus-data-line data-line-6">
                    <i />
                </span>

            </div>

            <div className="nexus-radial-connections">

                <span className="radial radial-1" />
                <span className="radial radial-2" />
                <span className="radial radial-3" />
                <span className="radial radial-4" />
                <span className="radial radial-5" />
                <span className="radial radial-6" />
                <span className="radial radial-7" />
                <span className="radial radial-8" />
                <span className="radial radial-9" />
                <span className="radial radial-10" />

            </div>

            {/* CIRCUITOS */}

            <div className="nexus-circuits">

                <span className="nexus-circuit circuit-1">
                    <i />
                    <i />
                    <i />
                </span>

                <span className="nexus-circuit circuit-2">
                    <i />
                    <i />
                    <i />
                </span>

                <span className="nexus-circuit circuit-3">
                    <i />
                    <i />
                    <i />
                </span>

                <span className="nexus-circuit circuit-4">
                    <i />
                    <i />
                    <i />
                </span>

                <span className="nexus-circuit circuit-5">
                    <i />
                    <i />
                    <i />
                </span>

                <span className="nexus-circuit circuit-6">
                    <i />
                    <i />
                    <i />
                </span>

            </div>

            <div className="nexus-hud">

                <span className="nexus-hud-corner corner-tl" />
                <span className="nexus-hud-corner corner-tr" />
                <span className="nexus-hud-corner corner-bl" />
                <span className="nexus-hud-corner corner-br" />

                <span className="nexus-hud-line horizontal-1" />
                <span className="nexus-hud-line horizontal-2" />

                <span className="nexus-hud-line vertical-1" />
                <span className="nexus-hud-line vertical-2" />

            </div>

            <div className="nexus-data-nodes">

                {Array.from({ length: 18 }).map((_, i) => (
                    <span
                        key={`nexus-node-${i}`}
                        className="nexus-data-node"
                        style={{
                            "--i": i,
                            "--x": `${(i * 53) % 100}%`,
                            "--y": `${(i * 37) % 100}%`,
                            "--delay": `${(i * 0.27) % 6}s`,
                            "--duration": `${3 + (i % 4)}s`,
                        }}
                    >
                        <b />
                        <i />
                    </span>
                ))}

            </div>


            {/* PARTÍCULAS */}

            <div className="nexus-particles">

                {Array.from({ length: 90 }).map((_, i) => (
                    <span
                        key={`nexus-particle-${i}`}
                        className="nexus-particle"
                        style={{
                            "--i": i,
                            "--x": `${(i * 47) % 100}%`,
                            "--y": `${(i * 71) % 100}%`,
                            "--delay": `${(i * 0.11) % 7}s`,
                            "--duration": `${3 + (i % 6)}s`,
                            "--size": `${1 + (i % 4)}px`,
                        }}
                    />
                ))}

            </div>

            <div className="nexus-pulses">

                <span className="nexus-pulse pulse-1" />
                <span className="nexus-pulse pulse-2" />
                <span className="nexus-pulse pulse-3" />
                <span className="nexus-pulse pulse-4" />
                <span className="nexus-pulse pulse-5" />

            </div>

            <span className="nexus-wave wave-1" />
            <span className="nexus-wave wave-2" />
            <span className="nexus-wave wave-3" />

            <span className="nexus-scanner" />

            <span className="nexus-sync-flash" />

            <span className="nexus-light-sweep" />

            <span className="nexus-border" />

        </div>
    );
};

export default NexusEffect;