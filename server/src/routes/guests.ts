import { Router } from "express";
import { prisma } from "../lib/prisma";
import {
  sendInviteEmail,
  sendRSVPConfirmationEmail,
  sendInviteCancelledEmail,
} from "../lib/email";

const router = Router();

/*
 * Rota: POST /api/guests
 * Descrição: Adiciona um convidado à lista e gera o seu código único.
 * Enviar (Body JSON): {
 * "name": "João Silva",
 * "email": "joao@email.com",
 * "title": "Sr.", (opcional)
 * "eventId": "uuid-do-evento"
 * }
 * Recebe: Objeto do convidado criado (incluindo inviteCode).
 */
router.post("/", async (req, res) => {
  try {
    const { name, email, title, eventId } = req.body;
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    const guest = await prisma.guest.create({
      data: { name, email, title, eventId, inviteCode },
      include: { event: true },
    });

    const emailResult = await sendInviteEmail(
      guest.email,
      guest.name,
      guest.event.title,
      guest.inviteCode,
      new Date(guest.event.date).toLocaleDateString("pt-PT", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      guest.event.location
    );

    if (!emailResult.success) {
      console.error("Failed to send invite email:", emailResult.error);
    }

    res.json(guest);
  } catch (error) {
    res.status(500).json({ error: "Erro ao adicionar convidado" });
  }
});

/*
 * Rota: GET /api/guests/rsvp/:code
 * Descrição: Valida se um código existe (usado no Login do convidado).
 * Parâmetros (URL): :code (ex: AB12CD)
 * Recebe: Dados do convidado e do evento associado. Retorna 404 se inválido.
 */
router.get("/rsvp/:code", async (req, res) => {
  try {
    const { code } = req.params;
    const guest = await prisma.guest.findUnique({
      where: { inviteCode: code },
      include: {
        event: {
          include: {
            organizer: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            guests: {
              select: {
                id: true,
                name: true,
                email: true,
                title: true,
                status: true,
                inviteCode: true,
                createdAt: true,
              },
              orderBy: {
                createdAt: "desc",
              },
            },
          },
        },
      },
    });
    if (!guest) return res.status(404).json({ error: "Código inválido" });
    res.json(guest);
  } catch (error) {
    res.status(500).json({ error: "Erro ao validar código" });
  }
});

/*
 * Rota: POST /api/guests/rsvp
 * Descrição: Processa a resposta do convite. Verifica capacidade se for "YES".
 * Enviar (Body JSON): {
 * "inviteCode": "AB12CD",
 * "status": "YES" | "NO" | "MAYBE"
 * }
 * Recebe: Objeto do convidado atualizado ou Erro 400 se capacidade cheia.
 */
router.post("/rsvp", async (req, res) => {
  try {
    const { inviteCode, status } = req.body;

    const guest = await prisma.guest.findUnique({
      where: { inviteCode },
      include: { event: true },
    });

    if (!guest)
      return res.status(404).json({ error: "Convidado não encontrado" });

    if (status === "YES") {
      const countYes = await prisma.guest.count({
        where: {
          eventId: guest.eventId,
          status: "YES",
          id: { not: guest.id },
        },
      });

      if (countYes >= guest.event.maxCapacity) {
        return res.status(400).json({ error: "Capacidade máxima atingida!" });
      }
    }

    const updatedGuest = await prisma.guest.update({
      where: { inviteCode },
      data: { status },
      include: { event: true },
    });

    // Send confirmation email
    const emailResult = await sendRSVPConfirmationEmail(
      updatedGuest.email,
      updatedGuest.name,
      updatedGuest.event.title,
      status,
      new Date(updatedGuest.event.date).toLocaleDateString("pt-PT", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      updatedGuest.event.location
    );

    if (!emailResult.success) {
      console.error("Failed to send confirmation email:", emailResult.error);
    }

    res.json(updatedGuest);
  } catch (error) {
    res.status(500).json({ error: "Erro ao processar RSVP" });
  }
});

/*
 * Rota: DELETE /api/guests/:id
 * Descrição: Remove um convidado do evento
 * Parâmetros (URL): :id (UUID do convidado)
 */
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Get guest data before deleting to send email
    const guest = await prisma.guest.findUnique({
      where: { id },
      include: { event: true },
    });

    if (!guest) {
      return res.status(404).json({ error: "Convidado não encontrado" });
    }

    // Delete the guest
    await prisma.guest.delete({
      where: { id },
    });

    // Send cancellation email
    const emailResult = await sendInviteCancelledEmail(
      guest.email,
      guest.name,
      guest.event.title,
      new Date(guest.event.date).toLocaleDateString("pt-PT", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      guest.event.location
    );

    if (!emailResult.success) {
      console.error("Failed to send cancellation email:", emailResult.error);
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Erro ao remover convidado" });
  }
});

export { router as guestRoutes };
