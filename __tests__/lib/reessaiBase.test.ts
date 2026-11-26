import { describe, expect, it } from "vitest";
import { avecReessais, erreurDeConnexion } from "../../lib/reessaiBase";

describe("réessais de connexion à la base", () => {
  it("reconnaît les erreurs de connexion Prisma, pas les autres", () => {
    expect(erreurDeConnexion({ code: "P1001" })).toBe(true);
    expect(erreurDeConnexion({ errorCode: "P1002" })).toBe(true);
    expect(erreurDeConnexion(new Error("Can't reach database server at `ep-x.neon.tech:5432`"))).toBe(true);
    expect(erreurDeConnexion({ code: "P2025" })).toBe(false);
    expect(erreurDeConnexion(new Error("violation de contrainte"))).toBe(false);
  });

  it("réessaie après une base endormie puis réussit", async () => {
    let n = 0;
    const r = await avecReessais(async () => {
      n++;
      if (n < 3) throw Object.assign(new Error("Can't reach database server"), { code: "P1001" });
      return { count: 4 };
    }, [1, 1, 1]);
    expect(r).toEqual({ resultat: { count: 4 }, essais: 3 });
  });

  it("abandonne après le dernier essai, et tout de suite pour une autre erreur", async () => {
    let n = 0;
    await expect(avecReessais(async () => { n++; throw Object.assign(new Error("x"), { code: "P1001" }); }, [1, 1])).rejects.toThrow("x");
    expect(n).toBe(3);
    n = 0;
    await expect(avecReessais(async () => { n++; throw new Error("autre"); }, [1, 1])).rejects.toThrow("autre");
    expect(n).toBe(1);
  });
});
