export function quantidadeValida(quantidade) {
    return Number.isFinite(quantidade) && quantidade > 0;
}