// server/src/index.ts
import "dotenv/config";
import express from "express";
import cors from "cors";
import { router } from "./routes";

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Rotas
app.use("/api", router);

// Iniciar Servidor
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Servidor a correr em http://localhost:${PORT}`);
});
