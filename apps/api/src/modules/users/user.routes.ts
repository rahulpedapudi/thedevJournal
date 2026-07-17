import { Router } from "express";
import { getProfile } from "./user.controller";

export const userRoutes = Router();

userRoutes.get("/profile", getProfile);