const LeviathanEffect = () => {
    return (
        <>
            {/* Escuridão */}
            <span className="leviathan-dark" />

            {/* Água */}
            <span className="leviathan-water" />
            <span className="leviathan-current" />
            <span className="leviathan-wave" />

            {/* Névoa */}
            <span className="leviathan-fog fog-1" />
            <span className="leviathan-fog fog-2" />

            {/* Raios de luz */}
            <span className="leviathan-light-ray ray-1" />
            <span className="leviathan-light-ray ray-2" />

            {/* Redemoinho */}
            <span className="leviathan-vortex" />

            {/* Sombra */}
            <div className="leviathan-shadow">
                <span className="shadow-fin fin-left" />
                <span className="shadow-fin fin-right" />
            </div>

            {/* Olhos */}
            <div className="leviathan-face">
                <span className="leviathan-eye eye-left">
                    <span className="leviathan-pupil" />
                </span>
                <span className="leviathan-eye eye-right">
                    <span className="leviathan-pupil" />
                </span>
            </div>

            {/* ======================================================
    LEVIATÃ SVG
====================================================== */}

            <svg
                className="leviathan-tentacles"
                viewBox="0 0 1200 900"
                preserveAspectRatio="none"
            >

                <defs>

                    {/* ==========================================================
        PELE DO LEVIATÃ
    ========================================================== */}

                    <linearGradient
                        id="leviathanSkin"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="100%"
                    >

                        <stop offset="0%" stopColor="#010607" />

                        <stop offset="8%" stopColor="#04171b" />

                        <stop offset="18%" stopColor="#06333d" />

                        <stop offset="34%" stopColor="#0b5967" />

                        <stop offset="50%" stopColor="#14879a" />

                        <stop offset="63%" stopColor="#27b2c8" />

                        <stop offset="78%" stopColor="#11798e" />

                        <stop offset="92%" stopColor="#06343d" />

                        <stop offset="100%" stopColor="#010607" />

                    </linearGradient>


                    {/* ==========================================================
        REFLEXO MOLHADO
    ========================================================== */}

                    <linearGradient
                        id="wetReflection"
                        x1="0%"
                        y1="0%"
                        x2="0%"
                        y2="100%"
                    >

                        <stop offset="0%" stopColor="rgba(255,255,255,.95)" />

                        <stop offset="10%" stopColor="rgba(205,250,255,.72)" />

                        <stop offset="24%" stopColor="rgba(135,235,255,.38)" />

                        <stop offset="40%" stopColor="rgba(70,180,255,.18)" />

                        <stop offset="70%" stopColor="transparent" />

                        <stop offset="100%" stopColor="transparent" />

                    </linearGradient>


                    {/* ==========================================================
        SOMBRA INTERNA
    ========================================================== */}

                    <linearGradient
                        id="deepShadow"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="0%"
                    >

                        <stop offset="0%" stopColor="#000000" />

                        <stop offset="22%" stopColor="#021015" />

                        <stop offset="40%" stopColor="#04252d" />

                        <stop offset="65%" stopColor="#01090d" />

                        <stop offset="100%" stopColor="#000000" />

                    </linearGradient>


                    {/* ==========================================================
        VENTOSAS
    ========================================================== */}

                    <radialGradient
                        id="suctionSkin"
                        cx="45%"
                        cy="35%"
                        r="70%"
                    >

                        <stop offset="0%" stopColor="#ffffff" />

                        <stop offset="18%" stopColor="#dbfbff" />

                        <stop offset="36%" stopColor="#9cefff" />

                        <stop offset="60%" stopColor="#43d7ff" />

                        <stop offset="82%" stopColor="#0d6d8b" />

                        <stop offset="100%" stopColor="#04222c" />

                    </radialGradient>


                    {/* ==========================================================
        BRILHO DAS VENTOSAS
    ========================================================== */}

                    <radialGradient
                        id="suctionCenter"
                        cx="50%"
                        cy="45%"
                    >

                        <stop offset="0%" stopColor="#ffffff" />

                        <stop offset="45%" stopColor="#d8ffff" />

                        <stop offset="100%" stopColor="transparent" />

                    </radialGradient>


                    {/* ==========================================================
        GLOW ABISSAL
    ========================================================== */}

                    <filter
                        id="abyssGlow"
                        x="-50%"
                        y="-50%"
                        width="200%"
                        height="200%"
                    >

                        <feGaussianBlur
                            stdDeviation="10"
                            result="blur"
                        />

                        <feColorMatrix
                            in="blur"
                            type="matrix"
                            values="
            0 0 0 0 0
            0 0 0 0 .85
            0 0 0 0 1
            0 0 0 1 0"
                        />

                        <feMerge>

                            <feMergeNode />

                            <feMergeNode in="SourceGraphic" />

                        </feMerge>

                    </filter>


                    {/* ==========================================================
        SOMBRA SUAVE
    ========================================================== */}

                    <filter
                        id="softShadow"
                        x="-50%"
                        y="-50%"
                        width="200%"
                        height="200%"
                    >

                        <feDropShadow
                            dx="0"
                            dy="12"
                            stdDeviation="10"
                            floodColor="#000"
                            floodOpacity=".55"
                        />

                    </filter>


                    {/* ==========================================================
        PELE MOLHADA
    ========================================================== */}

                    <filter
                        id="wetSkin"
                        x="-20%"
                        y="-20%"
                        width="140%"
                        height="140%"
                    >

                        <feTurbulence
                            type="fractalNoise"
                            baseFrequency=".018"
                            numOctaves="2"
                            seed="5"
                            result="noise"
                        />

                        <feDisplacementMap
                            in="SourceGraphic"
                            in2="noise"
                            scale="3"
                        />

                    </filter>


                    {/* ==========================================================
        REFLEXO EM MOVIMENTO
    ========================================================== */}

                    <linearGradient
                        id="movingReflection"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="0%"
                    >

                        <stop offset="0%" stopColor="transparent" />

                        <stop offset="42%" stopColor="transparent" />

                        <stop offset="50%" stopColor="rgba(255,255,255,.85)" />

                        <stop offset="58%" stopColor="transparent" />

                        <stop offset="100%" stopColor="transparent" />

                    </linearGradient>


                    {/* ==========================================================
        MÁSCARA PARA REFLEXOS
    ========================================================== */}

                    <mask id="tentacleMask">

                        <rect
                            width="1200"
                            height="900"
                            fill="black"
                        />

                        <ellipse
                            cx="600"
                            cy="450"
                            rx="520"
                            ry="420"
                            fill="white"
                        />

                    </mask>

                </defs>

                {/* =====================================================
                            TENTÁCULOS DE FUNDO
===================================================== */}

                <g
                    className="background-tentacles"
                >


                    {/* TENTÁCULO FUNDO ESQUERDA */}

                    <g
                        className="deep-tentacle deep-left"
                    >

                        <path
                            d="
            M120 900

            C60 760 80 620 150 520

            C220 420 250 300 210 160

            C190 90 220 40 260 0

            L340 0

            C290 120 320 260 300 390

            C280 520 210 650 260 900

            Z
            "
                        />

                    </g>



                    {/* TENTÁCULO FUNDO DIREITA */}

                    <g
                        className="deep-tentacle deep-right"
                    >

                        <path
                            d="
            M880 900

            C940 760 920 620 850 520

            C780 420 750 300 790 160

            C810 90 780 40 740 0

            L660 0

            C710 120 680 260 700 390

            C720 520 790 650 740 900

            Z
            "
                        />

                    </g>



                    {/* TENTÁCULO CENTRAL DISTANTE */}

                    <g
                        className="deep-tentacle deep-center"
                    >

                        <path
                            d="
            M500 900

            C450 760 470 600 500 470

            C530 340 500 200 520 0

            L650 0

            C620 220 660 360 600 520

            C550 670 590 780 620 900

            Z
            "
                        />

                    </g>


                </g>

                <g
                    className="tentacle leviathan-front front-left"
                    filter="url(#softShadow)"
                >

                    {/* ===========================
            SEGMENTO BASE
    =========================== */}

                    <g className="segment base">

                        <path
                            className="skin"
                            d="
            M265 900

            C220 840 205 760 220 675

            C240 590 280 520 330 455

            C355 425 372 398 382 370

            C398 332 390 300 370 270

            C345 235 330 205 338 170

            C345 132 365 92 392 38

            L445 62

            C415 118 405 158 412 190

            C418 220 438 255 468 290

            C495 322 503 365 482 410

            C455 468 420 520 392 595

            C360 682 352 790 368 900

            Z
            "
                        />

                        <path
                            className="shadow"
                            d="
            M287 900

            C262 800 270 710 295 610

            C320 510 350 430 380 365

            C400 320 398 265 365 205

            C345 170 350 120 382 55
            "
                        />

                        <path
                            className="highlight"
                            d="
            M410 78

            C385 150 375 220 388 295

            C402 365 392 460 360 560

            C332 655 324 765 338 900
            "
                        />

                    </g>


                    {/* ===========================
            SEGMENTO MÉDIO
    =========================== */}

                    <g className="segment mid">

                        <path
                            className="skin"
                            d="
            M352 620

            C335 570 350 515 390 470

            C425 430 455 385 470 330

            C482 285 472 245 448 205

            L486 220

            C512 270 522 315 512 360

            C500 415 470 470 430 520

            C392 566 378 595 392 630

            Z
            "
                        />

                        <path
                            className="highlight"
                            d="
            M454 215

            C468 285 455 360 420 450

            C395 515 390 570 405 620
            "
                        />

                    </g>


                    {/* ===========================
            PONTA
    =========================== */}

                    <g className="segment tip">

                        <path
                            className="skin"
                            d="
            M398 245

            C432 190 460 125 505 38

            L525 48

            C490 132 470 198 440 255

            C425 285 410 288 398 245

            Z
            "
                        />

                        <path
                            className="highlight"
                            d="
            M500 48

            C470 125 452 185 430 235
            "
                        />

                    </g>


                    {/* ===========================
            REFLEXO MOLHADO
    =========================== */}

                    <path
                        className="wet-line"
                        d="
        M420 62

        C400 170 390 280 396 380

        C402 500 382 620 355 900
        "
                    />



                    {/* ===========================
            VENTOSAS
    =========================== */}

                    <g className="suctions">

                        <g transform="translate(342 790)">
                            <circle className="cup" r="8" />
                            <circle className="core" r="3" />
                        </g>

                        <g transform="translate(336 735)">
                            <circle className="cup" r="7" />
                            <circle className="core" r="2.5" />
                        </g>

                        <g transform="translate(334 680)">
                            <circle className="cup" r="6.5" />
                            <circle className="core" r="2.4" />
                        </g>

                        <g transform="translate(338 625)">
                            <circle className="cup" r="6" />
                            <circle className="core" r="2.2" />
                        </g>

                        <g transform="translate(350 565)">
                            <circle className="cup" r="5.5" />
                            <circle className="core" r="2" />
                        </g>

                        <g transform="translate(368 505)">
                            <circle className="cup" r="5" />
                            <circle className="core" r="1.8" />
                        </g>

                        <g transform="translate(388 445)">
                            <circle className="cup" r="4.5" />
                            <circle className="core" r="1.6" />
                        </g>

                        <g transform="translate(408 385)">
                            <circle className="cup" r="4" />
                            <circle className="core" r="1.5" />
                        </g>

                        <g transform="translate(425 325)">
                            <circle className="cup" r="3.5" />
                            <circle className="core" r="1.3" />
                        </g>

                        <g transform="translate(445 265)">
                            <circle className="cup" r="3" />
                            <circle className="core" r="1.1" />
                        </g>

                        <g transform="translate(470 190)">
                            <circle className="cup" r="2.7" />
                            <circle className="core" r="1" />
                        </g>

                        <g transform="translate(498 105)">
                            <circle className="cup" r="2.3" />
                            <circle className="core" r=".8" />
                        </g>

                    </g>

                </g>

            </svg>

            {/* Flash */}
            <span className="leviathan-flash" />

            {/* Bolhas */}
            {Array.from({ length: 35 }).map((_, i) => (
                <span
                    key={`bubble-${i}`}
                    className="leviathan-bubble"
                    style={{
                        "--i": i,
                        "--size": Math.floor(Math.random() * 5),
                    }}
                />
            ))}

            {/* Sedimentos */}
            {Array.from({ length: 45 }).map((_, i) => (
                <span
                    key={`dust-${i}`}
                    className="leviathan-dust"
                    style={{
                        "--i": i,
                        "--size": Math.floor(Math.random() * 3),
                    }}
                />
            ))}
        </>
    );
};

export default LeviathanEffect;