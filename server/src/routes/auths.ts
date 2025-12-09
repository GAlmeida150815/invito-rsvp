// server/src/routes/auth.ts
import { Router } from "express";
import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = Router();
const SECRET = process.env.JWT_SECRET || "mysecretkey";

/*
 * Rota: POST /api/auth/register
 * Descrição: Registra um novo usuário.
 * Recebe: (Body JSON): {
 * "name": "Nome do Usuário",
 * "email": "email@exemplo.com",
 * "password": "senha123"
 * }
 */
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists)
      return res.status(400).json({ error: "Email já registado" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
    });

    const token = jwt.sign({ id: user.id, name: user.name }, SECRET, {
      expiresIn: "7d",
    });

    res.json({ user: { id: user.id, name: user.name, email }, token });
  } catch (error) {
    res.status(500).json({ error: "Erro ao criar conta" });
  }
});

/*
 * Rota: POST /api/auth/login
 * Descrição: Autentica um usuário.
 * Recebe: (Body JSON): {
 * "email": "email@exemplo.com",
 * "password": "senha123"
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ error: "Credenciais inválidas" });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword)
      return res.status(400).json({ error: "Credenciais inválidas" });

    const token = jwt.sign({ id: user.id, name: user.name }, SECRET, {
      expiresIn: "7d",
    });

    res.json({ user: { id: user.id, name: user.name, email }, token });
  } catch (error) {
    res.status(500).json({ error: "Erro no login" });
  }
});

export { router as authRoutes };
