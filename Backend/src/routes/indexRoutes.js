import { Router } from "express";
import authRoutes from "./authRoutes.js";
import expenseRoutes from "./expenseRoutes.js";
import { authenticate, isValidUser } from "../middleware/authenticate.js";
const routes = Router();

// auth routes
routes.use("/auth", authRoutes);

// event routes
routes.use("/expense", authenticate, isValidUser, expenseRoutes);

export default routes;
