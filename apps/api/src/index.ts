import express from "express";
import cors from "cors";

import { auth } from "../lib/auth";
import { logger } from "../lib/logger";
import { toNodeHandler } from "better-auth/node";

// middleware
import { errorHandler } from "./middleware/error-handler";
import { httpLogger } from "./middleware/logger-middleware";

// modules
import { userRoutes } from "./modules/users/user.routes";
import { projectRoutes } from "./modules/projects/project.routes";
import { devNoteRoutes } from "./modules/devnotes/devnote.routes";
import { userkeysRoutes } from "./modules/userkeys/userkeys.routes";
import { settingsRoutes } from "./modules/settings/settings.routes";

const PORT = 3000;

const app = express();

app.use(httpLogger);

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://thedevjournal.onrender.com",
      "https://the-dev-journal-five.vercel.app",
    ],
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

// userkeys routes
app.use("/api/keys", userkeysRoutes);

// user settings routes
app.use("/api/settings", settingsRoutes);

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    status: "healthy",
  });
});

app.head("/health", (_req, res) => {
  res.status(200).send();
});

app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`API running`);
});
