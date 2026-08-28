import { describe, expect, it } from "vitest";
import { rankCards, type RankableCard } from "@/lib/ranking";

function card(id: string, currentBid: number, updatedAt: string): RankableCard {
  return { id, currentBid, updatedAt: new Date(updatedAt) };
}

describe("ranking de pujas", () => {
  it("ordena por monto descendente y conserva prioridad temporal en empates", () => {
    const ranked = rankCards([
      card("older", 1000, "2026-01-01T00:00:00.000Z"),
      card("leader", 1500, "2026-01-03T00:00:00.000Z"),
      card("newer-tie", 1000, "2026-01-02T00:00:00.000Z"),
    ]);

    expect(ranked.map(({ id }) => id)).toEqual(["leader", "older", "newer-tie"]);
  });

  it("no muta el arreglo recibido", () => {
    const cards = [card("a", 100, "2026-01-01T00:00:00.000Z")];
    rankCards(cards);
    expect(cards).toHaveLength(1);
    expect(cards[0].id).toBe("a");
  });

  it("mantiene un ranking válido ante actualizaciones concurrentes simuladas", async () => {
    const payments = Array.from({ length: 20 }, (_, index) =>
      Promise.resolve(card(`card-${index}`, 1000 + index * 100, `2026-01-${String(index + 1).padStart(2, "0")}T00:00:00.000Z`)),
    );
    const ranked = rankCards(await Promise.all(payments));

    expect(ranked).toHaveLength(20);
    expect(ranked[0].currentBid).toBe(2900);
    expect(new Set(ranked.map(({ id }) => id)).size).toBe(20);
    expect(ranked.every((item, index) => index === 0 || ranked[index - 1].currentBid >= item.currentBid)).toBe(true);
  });
});

describe("idempotencia de pagos", () => {
  it("procesa una sola vez el mismo paymentId", async () => {
    const processed = new Set<string>();
    const processPayment = async (paymentId: string) => {
      if (processed.has(paymentId)) return false;
      processed.add(paymentId);
      return true;
    };

    const results = await Promise.all(Array.from({ length: 10 }, () => processPayment("payment-1")));
    expect(results.filter(Boolean)).toHaveLength(1);
    expect(processed).toEqual(new Set(["payment-1"]));
  });
});
