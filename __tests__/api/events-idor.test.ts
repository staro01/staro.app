import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@clerk/nextjs/server", () => ({
  currentUser: vi.fn().mockResolvedValue({ id: "user_business_a" }),
}));

const mockFindFirst = vi.fn();
const mockEventFindFirst = vi.fn();
const mockEventUpdate = vi.fn();

vi.mock("../../lib/prisma", () => ({
  prisma: {
    business: { findFirst: (...args: any[]) => mockFindFirst(...args) },
    event: {
      findFirst: (...args: any[]) => mockEventFindFirst(...args),
      update: (...args: any[]) => mockEventUpdate(...args),
    },
  },
}));

vi.mock("../../core/twilio/sms", () => ({
  sendSms: vi.fn(),
}));

import { PATCH } from "../../app/api/dashboard/events/[id]/route";

describe("IDOR protection — /api/dashboard/events/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFindFirst.mockResolvedValue({ id: "business_a", twilioNumber: null, vertical: "pizzeria", name: "Test" });
  });

  it("refuse de modifier un event appartenant à un autre business", async () => {
    mockEventFindFirst.mockResolvedValue(null);
    const req = new Request("http://localhost/api/dashboard/events/x", {
      method: "PATCH",
      body: JSON.stringify({ status: "ready" }),
    });
    const res = await PATCH(req as any, { params: Promise.resolve({ id: "x" }) });
    expect(res.status).toBe(404);
    expect(mockEventUpdate).not.toHaveBeenCalled();
  });

  it("autorise la modification d'un event appartenant à son propre business", async () => {
    mockEventFindFirst.mockResolvedValue({ id: "e1", businessId: "business_a", status: "new" });
    mockEventUpdate.mockResolvedValue({ id: "e1", status: "ready", customerPhone: null });
    const req = new Request("http://localhost/api/dashboard/events/e1", {
      method: "PATCH",
      body: JSON.stringify({ status: "ready" }),
    });
    const res = await PATCH(req as any, { params: Promise.resolve({ id: "e1" }) });
    expect(res.status).toBe(200);
    expect(mockEventUpdate).toHaveBeenCalled();
  });
});
