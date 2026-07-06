import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@clerk/nextjs/server", () => ({
  currentUser: vi.fn().mockResolvedValue({ id: "user_business_a" }),
}));

const mockFindFirst = vi.fn();
const mockServiceFindFirst = vi.fn();
const mockServiceUpdate = vi.fn();
const mockServiceDelete = vi.fn();

vi.mock("../../lib/prisma", () => ({
  prisma: {
    business: { findFirst: (...args: any[]) => mockFindFirst(...args) },
    service: {
      findFirst: (...args: any[]) => mockServiceFindFirst(...args),
      update: (...args: any[]) => mockServiceUpdate(...args),
      delete: (...args: any[]) => mockServiceDelete(...args),
    },
  },
}));

import { PATCH, DELETE } from "../../app/api/dashboard/services/[id]/route";

describe("IDOR protection — /api/dashboard/services/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFindFirst.mockResolvedValue({ id: "business_a" });
  });

  it("refuse de modifier un service appartenant à un autre business", async () => {
    mockServiceFindFirst.mockResolvedValue(null);
    const req = new Request("http://localhost/api/dashboard/services/x", {
      method: "PATCH",
      body: JSON.stringify({ price: 0 }),
    });
    const res = await PATCH(req as any, { params: Promise.resolve({ id: "x" }) });
    expect(res.status).toBe(404);
    expect(mockServiceUpdate).not.toHaveBeenCalled();
  });

  it("refuse de supprimer un service appartenant à un autre business", async () => {
    mockServiceFindFirst.mockResolvedValue(null);
    const req = new Request("http://localhost/api/dashboard/services/x", { method: "DELETE" });
    const res = await DELETE(req as any, { params: Promise.resolve({ id: "x" }) });
    expect(res.status).toBe(404);
    expect(mockServiceDelete).not.toHaveBeenCalled();
  });

  it("autorise la modification d'un service appartenant à son propre business", async () => {
    mockServiceFindFirst.mockResolvedValue({ id: "s1", businessId: "business_a" });
    mockServiceUpdate.mockResolvedValue({ id: "s1", price: 20 });
    const req = new Request("http://localhost/api/dashboard/services/s1", {
      method: "PATCH",
      body: JSON.stringify({ price: 20 }),
    });
    const res = await PATCH(req as any, { params: Promise.resolve({ id: "s1" }) });
    expect(res.status).toBe(200);
    expect(mockServiceUpdate).toHaveBeenCalled();
  });
});
