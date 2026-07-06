import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock Clerk : simule un utilisateur connecté "business A"
vi.mock("@clerk/nextjs/server", () => ({
  currentUser: vi.fn().mockResolvedValue({ id: "user_business_a" }),
}));

// Mock Prisma
const mockFindFirst = vi.fn();
const mockAppointmentFindFirst = vi.fn();
const mockAppointmentUpdate = vi.fn();

vi.mock("../../lib/prisma", () => ({
  prisma: {
    business: { findFirst: (...args: any[]) => mockFindFirst(...args) },
    appointment: {
      findFirst: (...args: any[]) => mockAppointmentFindFirst(...args),
      update: (...args: any[]) => mockAppointmentUpdate(...args),
    },
  },
}));

import { PATCH, DELETE } from "../../app/api/dashboard/appointments/[id]/route";

describe("IDOR protection — /api/dashboard/appointments/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // "business A" est le business de l'utilisateur connecté
    mockFindFirst.mockResolvedValue({ id: "business_a" });
  });

  it("refuse de modifier un rendez-vous appartenant à un autre business (PATCH)", async () => {
    // Le rendez-vous ciblé n'appartient PAS à business_a
    mockAppointmentFindFirst.mockResolvedValue(null);

    const req = new Request("http://localhost/api/dashboard/appointments/rdv_id_dun_autre_business", {
      method: "PATCH",
      body: JSON.stringify({ status: "cancelled" }),
    });

    const res = await PATCH(req as any, { params: Promise.resolve({ id: "rdv_id_dun_autre_business" }) });

    expect(res.status).toBe(404);
    expect(mockAppointmentUpdate).not.toHaveBeenCalled();
  });

  it("refuse de supprimer un rendez-vous appartenant à un autre business (DELETE)", async () => {
    mockAppointmentFindFirst.mockResolvedValue(null);

    const req = new Request("http://localhost/api/dashboard/appointments/rdv_id_dun_autre_business", {
      method: "DELETE",
    });

    const res = await DELETE(req as any, { params: Promise.resolve({ id: "rdv_id_dun_autre_business" }) });

    expect(res.status).toBe(404);
    expect(mockAppointmentUpdate).not.toHaveBeenCalled();
  });

  it("autorise la modification d'un rendez-vous appartenant à son propre business", async () => {
    mockAppointmentFindFirst.mockResolvedValue({ id: "rdv_1", businessId: "business_a" });
    mockAppointmentUpdate.mockResolvedValue({ id: "rdv_1", status: "cancelled" });

    const req = new Request("http://localhost/api/dashboard/appointments/rdv_1", {
      method: "PATCH",
      body: JSON.stringify({ status: "cancelled" }),
    });

    const res = await PATCH(req as any, { params: Promise.resolve({ id: "rdv_1" }) });

    expect(res.status).toBe(200);
    expect(mockAppointmentUpdate).toHaveBeenCalled();
  });

  it("refuse tout accès si l'utilisateur n'a pas de business associé", async () => {
    mockFindFirst.mockResolvedValue(null);

    const req = new Request("http://localhost/api/dashboard/appointments/rdv_1", {
      method: "DELETE",
    });

    const res = await DELETE(req as any, { params: Promise.resolve({ id: "rdv_1" }) });

    expect(res.status).toBe(401);
  });
});
