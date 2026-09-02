import SentinelaEffect from "../sentinela/SentinelaEffect";
import GenesisEffect from "../genesis/GenesisEffect";
import CaravelaEffect from "../caravela/CaravelaEffect";
import LeviathanEffect from "../leviathan/LeviathanEffect";
import ArcaneEffect from "../arcane/ArcaneEffect";
import OptimusEffect from "../optimus/OptimusEffect";
import GauderioEffect from "../gauderio/GauderioEffect"

const EFFECT_COMPONENTS = {
    sentinela: SentinelaEffect,
    "aura-genesis-animation": GenesisEffect,
    "caravela-animation": CaravelaEffect,
    leviathan: LeviathanEffect,
    pulse: ArcaneEffect,
    optimus: OptimusEffect,
    gauderio: GauderioEffect,
};

export default function EffectRenderer({ animation }) {

    const EffectComponent = EFFECT_COMPONENTS[animation];

    if (!EffectComponent) {
        return null;
    }

    return <EffectComponent />;
}