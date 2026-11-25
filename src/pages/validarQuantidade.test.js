import { describe, it, expect } from "vitest";
import { quantidadeValida } from "./validarQuantidade";

describe("Validação de quantidade de itens", () => {
    it("deve aceitar quantidades maiores que zero", () => {
        expect(quantidadeValida(1)).toBe(true);
        expect(quantidadeValida(5)).toBe(true);
    });

    it("deve rejeitar quantidade igual a zero", () => {
        expect(quantidadeValida(0)).toBe(false);
    });

    it("deve rejeitar quantidades negativas", () => {
        expect(quantidadeValida(-1)).toBe(false);
        expect(quantidadeValida(-10)).toBe(false);
    });

    it("deve rejeitar valores inválidos", () => {
        expect(quantidadeValida(NaN)).toBe(false);
    });
});