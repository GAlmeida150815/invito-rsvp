import { Router } from "express";
import { authRoutes } from "./auths";
import { eventRoutes } from "./events";
import { guestRoutes } from "./guests";

const router = Router();

/*
 * Agrupador de Rotas de Eventos
 * Prefixo: /api/events
 * Exemplo: /api/events (POST) ou /api/events/:id (GET)
 */
router.use("/events", eventRoutes);

/*
 * Agrupador de Rotas de Convidados
 * Prefixo: /api/guests
 * Exemplo: /api/guests (POST) ou /api/guests/rsvp (POST)
 */
router.use("/guests", guestRoutes);

/*
 * Agrupador de Rotas de Autenticação
 * Prefixo: /api/auth
 * Exemplo: /api/auth/login (POST) ou /api/auth/register (POST)
 */
router.use("/auth", authRoutes);

export { router };
