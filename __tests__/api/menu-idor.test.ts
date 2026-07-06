import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@clerk/nextjs/server", () => ({
  currentUser: vi.fn().mockResolvedValue({ id: "user_business_a" }),
}));

const mockFindFirst = vi.fn();
const mockMenuItemFindFirst = vi.fn();
const mockMenuItemUpdate = vi.fn();
const mockMenuItemDelete = vi.fn();

vi.mock("../../lib/prisma", () => ({
  prisma: {
    business: { findFirst: (...args: any[]) => mockFindFirst(...args) },
    menuItem: {
      findFirst: (...args: any[]) => mockMenuItemFindFirst(...args),
      update: (...args: any[]) => mockMenuItemUpdate(...args),
      delete: (...args: any[]) => mockMenuItemDelete(...args),
    },
  },
}));

import { PATCH, DELETE } from "../../app/api/dashboard/menu/[id]/route";

describe("IDOR protection — /api/dashboard/menu/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFindFirst.mockResolvedValue({ id: "business_a" });
  });

  it("refuse de modifier un item de menu appartenant à un autre business", async () => {
    mockMenuItemFindFirst.mockResolvedValue(null);

    const req = new Request("http://localhost/api/dashboard/menu/item_dun_autre_business", {
      method: "PATCH",
      body: JSON.stringify({ price: 0 }),
    });

    const res = await PATCH(req as any, { params: Promise.resolve({ id: "item_dun_autre_business" }) });

    expect(res.status).toBe(404);
    expect(mockMenuItemUpdate).not.toHaveBeenCalled();
  });

  it("refuse de supprimer un item de menu appartenant à un autre business", async () => {
    mockMenuItemFindFirst.mockResolvedValue(null);

    const req = new Request("http://localhost/api/dashboard/menu/item_dun_autre_business", {
      method: "DELETE",
    });

    const res = await DELETE(req as any, { params: Promise.resolve({ id: "item_dun_autre_business" }) });

    expect(res.status).toBe(404);
    expect(mockMenuItemDelete).not.toHaveBeenCalled();
  });

  it("autorise la modification d'un item appartenant à son propre business", async () => {
    mockMenuItemFindFirst.mockResolvedValue({ id: "item_1", businessId: "business_a" });
    mockMenuItemUpdate.mockResolvedValue({ id: "item_1", price: 12 });

    const req = new Request("http://localhost/api/dashboard/menu/item_1", {
      method: "PATCH",
      body: JSON.stringify({ price: 12 }),
    });

    const res = await PATCH(req as any, { params: Promise.resolve({ id: "item_1" }) });

    expect(res.status).toBe(200);
    expect(mockMenuItemUpdate).toHaveBeenCalled();
  });
});
