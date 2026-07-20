import express from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { auth } from "../lib/auth";
import { userRoutes } from "./modules/users/user.routes";
import { projectRoutes } from "./modules/projects/project.routes";
import { devNoteRoutes } from "./modules/devnotes/devnote.routes";

const PORT = 3000;

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
  }),
);


// Better Auth route
app.all("/api/auth/*splat", toNodeHandler(auth));

app.use(express.json());

// user routes
app.use("/api/user", userRoutes);

// project routes
app.use("/api/project", projectRoutes);

// devnote routes
app.use("/api/devnote", devNoteRoutes);

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    status: "healthy",
  });
});

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
