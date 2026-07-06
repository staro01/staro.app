import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@clerk/nextjs/server", () => ({
  currentUser: vi.fn().mockResolvedValue({ id: "user_business_a" }),
}));

const mockFindFirst = vi.fn();
const mockStaffFindFirst = vi.fn();
const mockStaffUpdate = vi.fn();
const mockStaffDelete = vi.fn();

vi.mock("../../lib/prisma", () => ({
  prisma: {
    business: { findFirst: (...args: any[]) => mockFindFirst(...args) },
    staff: {
      findFirst: (...args: any[]) => mockStaffFindFirst(...args),
      update: (...args: any[]) => mockStaffUpdate(...args),
      delete: (...args: any[]) => mockStaffDelete(...args),
    },
  },
}));

import { PATCH, DELETE } from "../../app/api/dashboard/staff/[id]/route";

describe("IDOR protection — /api/dashboard/staff/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFindFirst.mockResolvedValue({ id: "business_a" });
  });

  it("refuse de modifier un membre du personnel appartenant à un autre business", async () => {
    mockStaffFindFirst.mockResolvedValue(null);
    const req = new Request("http://localhost/api/dashboard/staff/x", {
      method: "PATCH",
      body: JSON.stringify({ available: false }),
    });
    const res = await PATCH(req as any, { params: Promise.resolve({ id: "x" }) });
    expect(res.status).toBe(404);
    expect(mockStaffUpdate).not.toHaveBeenCalled();
  });

  it("refuse de supprimer un membre du personnel appartenant à un autre business", async () => {
    mockStaffFindFirst.mockResolvedValue(null);
    const req = new Request("http://localhost/api/dashboard/staff/x", { method: "DELETE" });
    const res = await DELETE(req as any, { params: Promise.resolve({ id: "x" }) });
    expect(res.status).toBe(404);
    expect(mockStaffDelete).not.toHaveBeenCalled();
  });

  it("autorise la modification d'un membre appartenant à son propre business", async () => {
    mockStaffFindFirst.mockResolvedValue({ id: "st1", businessId: "business_a" });
    mockStaffUpdate.mockResolvedValue({ id: "st1", available: false });
    const req = new Request("http://localhost/api/dashboard/staff/st1", {
      method: "PATCH",
      body: JSON.stringify({ available: false }),
    });
    const res = await PATCH(req as any, { params: Promise.resolve({ id: "st1" }) });
    expect(res.status).toBe(200);
    expect(mockStaffUpdate).toHaveBeenCalled();
  });
});
