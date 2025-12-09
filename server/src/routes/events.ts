import { Router } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

/*
 * Rota: GET /api/events
 * Descrição: Retorna a lista de todos os eventos.
 * Recebe: Array de objetos de eventos.
 */
router.get("/", async (req, res) => {
  try {
    const { userId, email } = req.query; // Recebemos também o email para buscar convites

    if (!userId) return res.status(400).json({ error: "User ID necessário" });

    const events = await prisma.event.findMany({
      where: {
        OR: [
          { organizerId: String(userId) },
          { guests: { some: { email: String(email) } } },
        ],
      },
      include: {
        guests: true,
        organizer: { select: { name: true } },
      },
      orderBy: { date: "asc" },
    });

    res.json(events);
  } catch (error) {
    res.status(500).json({ error: "Erro ao listar eventos" });
  }
});

/*
 * Rota: POST /api/events
 * Descrição: Cria um novo evento na base de dados.
 * Enviar (Body JSON): {
 * "title": "Nome do Evento",
 * "description": "Descrição do Evento",
 * "bannerBase64": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
 * "location": "Local",
 * "date": "2023-12-25T19:00:00Z",
 * "rsvpDeadline": "2023-12-20T19:00:00Z", (opcional)
 * "maxCapacity": 50,
 * "organizerId": "UUID do organizador"
 * }
 * Recebe: Objeto do evento criado (incluindo ID gerado).
 */
router.post("/", async (req, res) => {
  try {
    const {
      title,
      description,
      bannerBase64,
      location,
      date,
      rsvpDeadline,
      maxCapacity,
      organizerId,
    } = req.body;

    const event = await prisma.event.create({
      data: {
        title,
        description,
        bannerBase64,
        location,
        date: new Date(date),
        rsvpDeadline: rsvpDeadline ? new Date(rsvpDeadline) : null,
        maxCapacity: Number(maxCapacity),
        organizerId,
      },
    });
    res.json(event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao criar evento" });
  }
});

/*
 * Rota: GET /api/events/:id
 * Descrição: Retorna detalhes do evento e estatísticas para o Dashboard.
 * Parâmetros (URL): :id (UUID do evento)
 * Recebe: Objeto do evento + campos extras "totalYes" (int) e "isFull" (boolean).
 */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        guests: {
          orderBy: { createdAt: "desc" },
        },
        organizer: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!event) return res.status(404).json({ error: "Evento não encontrado" });

    const totalYes = event.guests.filter((g: any) => g.status === "YES").length;
    const isFull = totalYes >= event.maxCapacity;

    res.json({ ...event, totalYes, isFull });
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar evento" });
  }
});

export { router as eventRoutes };
