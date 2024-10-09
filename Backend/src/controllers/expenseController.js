import expenseModel from "../models/expenseModel.js";
import csv from "csvtojson";

// add expense //
export const addExpense = async (req, res) => {
  try {
    const { amount, description, date, category, paymentMethod } = req.body;
    // all fields are required
    if (!amount || !description || !date || !category || !paymentMethod) {
      return res
        .status(400)
        .json({ message: "All fields are required!", success: false });
    }

    // add expense
    const newExpense = {
      amount,
      description,
      date,
      category,
      paymentMethod,
      created_by: req.user.id,
    };

    const createExpense = await expenseModel.create(newExpense);

    return res.status(201).json({
      message: "Expense added successfully.",
      expense: createExpense,
      success: true,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(400)
      .json({ message: "Internal server error! addExpense", success: false });
  }
};

// get all expenses,filter by date category payment method/sortBy date or amount asc-desc//
export const getExpenses = async (req, res) => {
  try {
    const filter = {};
    const { page = 1, limit = 10, sortBy, sortOrder = "asc" } = req.query;

    // Category filter
    if (req.query.category) {
      filter.category = req.query.category;
    }

    // Date filter
    if (req.query.date) {
      filter.date = req.query.date;
    }

    // Payment method filter
    if (req.query.paymentMethod) {
      filter.paymentMethod = req.query.paymentMethod;
    }

    // Determine sorting
    const sort = {};
    if (sortBy === "date" || sortBy === "amount") {
      sort[sortBy] = sortOrder === "desc" ? -1 : 1;
    }

    // Fetch expenses with pagination and sorting
    const expenses = await expenseModel
      .find({
        created_by: req.user.id,
        ...filter,
      })
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const totalExpenses = await expenseModel.countDocuments({
      created_by: req.user.id,
      ...filter,
    });

    if (!expenses || expenses.length === 0) {
      return res
        .status(404)
        .json({ message: "Expenses not found!", success: false });
    }

    return res.status(200).json({
      expenses,
      success: true,
      pagination: {
        total: totalExpenses,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(totalExpenses / limit),
      },
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Internal server error! getExpenses", success: false });
  }
};

// get single expense by id //
export const getExpense = async (req, res) => {
  try {
    const expense = await expenseModel.findById(req.params.id);

    if (!expense) {
      return res
        .status(400)
        .json({ message: "Expense not founds!", success: false });
    }

    return res.status(200).json({ expense: expense, success: true });
  } catch (error) {
    console.error(error);
    return res
      .status(400)
      .json({ message: "Internal server error! getExpense", success: false });
  }
};

// delete expense by id //
export const deleteExpense = async (req, res) => {
  try {
    const expense = await expenseModel.findByIdAndDelete(req.params.id);

    if (!expense) {
      return res
        .status(400)
        .json({ message: "Expense not found!", success: false });
    }

    return res
      .status(200)
      .json({ message: "expense deleted successfully.", success: true });
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      message: "Internal server error! deleteExpense",
      success: false,
    });
  }
};

// update expense by id //
export const updateExpense = async (req, res) => {
  try {
    const expense = await expenseModel.findById(req.params.id);

    if (!expense) {
      return res
        .status(400)
        .json({ message: "Expense not founds!", success: false });
    }

    const { amount, description, date, category, paymentMethod } = req.body;

    // updating expense
    expense.amount = amount || expense.amount;
    expense.description = description || expense.description;
    expense.date = date || expense.date;
    expense.category = category || expense.category;
    expense.paymentMethod = paymentMethod || expense.paymentMethod;

    const updateExpense = await expense.save({ new: true });

    return res.status(200).json({
      message: "Expense updated successfully.",
      expense: updateExpense,
      success: true,
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      message: "Internal server error! updateExpense",
      success: false,
    });
  }
};

//----------------------> for bulk operations <-----------------------//

// add csv file //
export const addExpenses = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ message: "No CSV file found!", success: false });
    }

    const data = [];
    const response = await csv().fromFile(req.file.path);

    for (const row of response) {
      const amount = parseFloat(row.amount);
      const date = new Date(row.date);

      // Check if the date is valid
      if (isNaN(date.getTime())) {
        return res.status(400).json({
          message: `Invalid date format: ${row.date}`,
          success: false,
        });
      }

      data.push({
        amount,
        description: row.description,
        date,
        category: row.category,
        paymentMethod: row.paymentMethod,
        created_by: req.user.id,
      });
    }

    await expenseModel.insertMany(data);

    return res
      .status(201)
      .json({ message: "CSV file added successfully.", success: true });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Internal server error! addExpenses", success: false });
  }
};

// delete expense in bulk //
export const deleteExpenses = async (req, res) => {
  const { ids } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({
      message: "Invalid request! 'ids' must be a non-empty array.",
      success: false,
    });
  }

  try {
    const result = await expenseModel.deleteMany({ _id: { $in: ids } });

    // Check if any documents were deleted
    if (result.deletedCount === 0) {
      return res.status(404).json({
        message: "No expenses found for the provided IDs.",
        success: false,
      });
    }

    return res.status(200).json({
      message: "Expenses deleted successfully.",
      success: true,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error! deleteExpenses",
      success: false,
    });
  }
};
