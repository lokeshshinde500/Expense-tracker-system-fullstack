import { Router } from "express";
import {
  addExpense,
  addExpenses,
  deleteExpense,
  deleteExpenses,
  getExpense,
  getExpenses,
  updateExpense,
} from "../controllers/expenseController.js";
import { upload } from "../models/expenseModel.js";
const routes = Router();

// expense routes

// add expense
routes.post("/", addExpense);

// get all expenses , filter
routes.get("/", getExpenses);

// get single expense by id
routes.get("/:id", getExpense);
//
// delete expense by id
routes.delete("/:id", deleteExpense);

// update expense by id
routes.patch("/:id", updateExpense);

// bulk opearation

// delete expense in bulk
routes.post("/addBulk", upload, addExpenses);

// add bulk expense using csv file
routes.delete("/deleteBulk/all", deleteExpenses);
export default routes;
