import React, { useEffect, useState } from "react";
import axios from "axios";

const Home = () => {
  const token = localStorage.getItem("token");
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [newExpense, setNewExpense] = useState({
    amount: "",
    description: "",
    date: "",
    category: "",
    paymentMethod: "",
  });
  const [error, setError] = useState("");

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "https://expense-tracker-system-backend-1.onrender.com/api/expense",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setExpenses(response.data.expenses);
    } catch (error) {
      console.error("Error fetching expenses:", error);
      setError("Failed to fetch expenses.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const calculateTotal = () => {
    return expenses
      .reduce((total, expense) => total + expense.amount, 0)
      .toFixed(2);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this expense?")) {
      try {
        await axios.delete(
          `https://expense-tracker-system-backend-1.onrender.com/api/expense/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setExpenses(expenses.filter((expense) => expense._id !== id));
      } catch (error) {
        console.log(error);
      }
    }
  };

  const handleBulkDelete = async () => {
    if (window.confirm("Are you sure you want to delete selected expenses?")) {
      try {
        await Promise.all(
          Array.from(selectedIds).map((id) =>
            axios.delete(
              `https://expense-tracker-system-backend-1.onrender.com/api/expense/${id}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            )
          )
        );
        setExpenses(
          expenses.filter((expense) => !selectedIds.has(expense._id))
        );
        setSelectedIds(new Set());
      } catch (error) {
        console.error("Error deleting expenses:", error);
        setError("Failed to delete selected expenses.");
      }
    }
  };

  const handleUpdate = async (id, newData) => {
    try {
      await axios.patch(
        `https://expense-tracker-system-backend-1.onrender.com/api/expense/${id}`,
        newData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setExpenses(
        expenses.map((expense) =>
          expense._id === id ? { ...expense, ...newData } : expense
        )
      );
    } catch (error) {
      console.error("Error updating expense:", error);
      setError("Failed to update expense.");
    }
  };

  const handleSelect = (id) => {
    const newSelectedIds = new Set(selectedIds);
    if (newSelectedIds.has(id)) {
      newSelectedIds.delete(id);
    } else {
      newSelectedIds.add(id);
    }
    setSelectedIds(newSelectedIds);
  };

  const handleAddExpense = async () => {
    const { amount, description, date, category, paymentMethod } = newExpense;
    if (!amount || !description || !date || !category || !paymentMethod) {
      setError("All fields are required!");
      return;
    }

    try {
      const response = await axios.post(
        "https://expense-tracker-system-backend-1.onrender.com/api/expense",
        newExpense,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setExpenses([...expenses, response.data.expense]);
      setNewExpense({
        amount: "",
        description: "",
        date: "",
        category: "",
        paymentMethod: "",
      });
      setError("");
    } catch (error) {
      console.error("Error adding expense:", error);
      setError("Failed to add expense.");
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <section>
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-semibold mb-4">Expense Tracker</h1>
        {error && <div className="text-red-500">{error}</div>}

        <div className="mb-4">
          <h2 className="text-lg font-semibold">Add New Expense</h2>
          <input
            type="number"
            placeholder="Amount"
            value={newExpense.amount}
            onChange={(e) =>
              setNewExpense({ ...newExpense, amount: e.target.value })
            }
            className="border border-gray-300 rounded px-2 mr-2"
          />
          <input
            type="text"
            placeholder="Description"
            value={newExpense.description}
            onChange={(e) =>
              setNewExpense({ ...newExpense, description: e.target.value })
            }
            className="border border-gray-300 rounded px-2 mr-2"
          />
          <input
            type="date"
            value={newExpense.date}
            onChange={(e) =>
              setNewExpense({ ...newExpense, date: e.target.value })
            }
            className="border border-gray-300 rounded px-2 mr-2"
          />
          <select
            value={newExpense.category}
            onChange={(e) =>
              setNewExpense({ ...newExpense, category: e.target.value })
            }
            className="border border-gray-300 rounded px-2 mr-2"
          >
            <option value="">Select Category</option>
            <option value="groceries">Groceries</option>
            <option value="rent">Rent</option>
            <option value="utilities">Utilities</option>
            <option value="transportation">Transportation</option>
            <option value="entertainment">Entertainment</option>
            <option value="other">Other</option>
          </select>
          <select
            value={newExpense.paymentMethod}
            onChange={(e) =>
              setNewExpense({ ...newExpense, paymentMethod: e.target.value })
            }
            className="border border-gray-300 rounded px-2 mr-2"
          >
            <option value="">Select Payment Method</option>
            <option value="cash">Cash</option>
            <option value="online">Online</option>
          </select>
          <button
            onClick={handleAddExpense}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Add Expense
          </button>
        </div>

        <button
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 mb-4"
          onClick={handleBulkDelete}
          disabled={selectedIds.size === 0}
        >
          Delete Selected
        </button>

        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-200">
              <th className="py-2 px-4 border-b text-center">Select</th>
              <th className="py-2 px-4 border-b text-center">Amount</th>
              <th className="py-2 px-4 border-b text-center">Description</th>
              <th className="py-2 px-4 border-b text-center">Date</th>
              <th className="py-2 px-4 border-b text-center">Category</th>
              <th className="py-2 px-4 border-b text-center">Payment Method</th>
              <th className="py-2 px-4 border-b text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((expense) => (
              <tr key={expense._id} className="hover:bg-gray-100">
                <td className="py-2 px-4 border-b text-center">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(expense._id)}
                    onChange={() => handleSelect(expense._id)}
                  />
                </td>
                <td className="py-2 px-4 border-b text-center">
                  <input
                    type="number"
                    value={expense.amount}
                    onChange={(e) =>
                      handleUpdate(expense._id, {
                        amount: parseFloat(e.target.value),
                      })
                    }
                    className="border border-gray-300 rounded px-2"
                  />
                </td>
                <td className="py-2 px-4 border-b text-center">
                  {expense.description}
                </td>
                <td className="py-2 px-4 border-b text-center">
                  {new Date(expense.date).toLocaleDateString()}
                </td>
                <td className="py-2 px-4 border-b text-center">
                  <select
                    value={expense.category}
                    onChange={(e) =>
                      handleUpdate(expense._id, { category: e.target.value })
                    }
                    className="border border-gray-300 rounded px-2"
                  >
                    <option value="groceries">Groceries</option>
                    <option value="rent">Rent</option>
                    <option value="utilities">Utilities</option>
                    <option value="transportation">Transportation</option>
                    <option value="entertainment">Entertainment</option>
                    <option value="other">Other</option>
                  </select>
                </td>
                <td className="py-2 px-4 border-b text-center">
                  <select
                    value={expense.paymentMethod}
                    onChange={(e) =>
                      handleUpdate(expense._id, {
                        paymentMethod: e.target.value,
                      })
                    }
                    className="border border-gray-300 rounded px-2"
                  >
                    <option value="cash">Cash</option>
                    <option value="online">Online</option>
                  </select>
                </td>
                <td className="py-2 px-4 border-b text-center">
                  <button
                    className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 mr-2"
                    onClick={() =>
                      handleUpdate(expense._id, { amount: expense.amount })
                    }
                  >
                    Update
                  </button>
                  <button
                    className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                    onClick={() => handleDelete(expense._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-4 text-lg font-semibold text-center">
          Total Amount: ${calculateTotal()}
        </div>
      </div>
    </section>
  );
};

export default Home;
