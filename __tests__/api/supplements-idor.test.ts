import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@clerk/nextjs/server", () => ({
  currentUser: vi.fn().mockResolvedValue({ id: "user_business_a" }),
}));

const mockFindFirst = vi.fn();
const mockSupplementFindFirst = vi.fn();
const mockSupplementUpdate = vi.fn();
const mockSupplementDelete = vi.fn();

vi.mock("../../lib/prisma", () => ({
  prisma: {
    business: { findFirst: (...args: any[]) => mockFindFirst(...args) },
    supplement: {
      findFirst: (...args: any[]) => mockSupplementFindFirst(...args),
      update: (...args: any[]) => mockSupplementUpdate(...args),
      delete: (...args: any[]) => mockSupplementDelete(...args),
    },
  },
}));

import { PATCH, DELETE } from "../../app/api/dashboard/supplements/[id]/route";

describe("IDOR protection — /api/dashboard/supplements/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFindFirst.mockResolvedValue({ id: "business_a" });
  });

  it("refuse de modifier un supplément appartenant à un autre business", async () => {
    mockSupplementFindFirst.mockResolvedValue(null);
    const req = new Request("http://localhost/api/dashboard/supplements/x", {
      method: "PATCH",
      body: JSON.stringify({ price: 0 }),
    });
    const res = await PATCH(req as any, { params: Promise.resolve({ id: "x" }) });
    expect(res.status).toBe(404);
    expect(mockSupplementUpdate).not.toHaveBeenCalled();
  });

  it("refuse de supprimer un supplément appartenant à un autre business", async () => {
    mockSupplementFindFirst.mockResolvedValue(null);
    const req = new Request("http://localhost/api/dashboard/supplements/x", { method: "DELETE" });
    const res = await DELETE(req as any, { params: Promise.resolve({ id: "x" }) });
    expect(res.status).toBe(404);
    expect(mockSupplementDelete).not.toHaveBeenCalled();
  });

  it("autorise la modification d'un supplément appartenant à son propre business", async () => {
    mockSupplementFindFirst.mockResolvedValue({ id: "sup1", businessId: "business_a" });
    mockSupplementUpdate.mockResolvedValue({ id: "sup1", price: 2 });
    const req = new Request("http://localhost/api/dashboard/supplements/sup1", {
      method: "PATCH",
      body: JSON.stringify({ price: 2 }),
    });
    const res = await PATCH(req as any, { params: Promise.resolve({ id: "sup1" }) });
    expect(res.status).toBe(200);
    expect(mockSupplementUpdate).toHaveBeenCalled();
  });
});
