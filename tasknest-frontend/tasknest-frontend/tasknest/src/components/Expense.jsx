import React, { useState, useEffect } from 'react';
import { FiTrash2, FiEdit2, FiFilter } from 'react-icons/fi';
import './Dashboard.css';
import axios from 'axios';

const Expense = ({ addNotification }) => {

  const getUserEmail = () => {
    const user = localStorage.getItem("user");
    if (!user) return "unknown@example.com";
    try {
      return JSON.parse(user).emailId || "unknown@example.com";
    } catch {
      return "unknown@example.com";
    }
  };

  const [expenses, setExpenses] = useState([]);

  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: '',
    category: 'food',
    purchaseDate: new Date().toISOString().split('T')[0]
  });

  const [filterCategory, setFilterCategory] = useState('all');
  const [filterDate, setFilterDate] = useState('all');
  const [editingExpense, setEditingExpense] = useState(null);

  const BASE_URL = "/expenses";

  // ====================== FETCH DATA ====================
  const fetchExpenses = async () => {
    try {
      const email = getUserEmail();
      const res = await axios.get(`${BASE_URL}/user/${email}`);
      setExpenses(res.data);
    } catch (error) {
      console.error(error);
      addNotification("Failed to load expenses", "error");
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  // ====================== ADD EXPENSE ===================
  const addExpense = async () => {

    if (!newExpense.amount) {
      addNotification('Amount is required', 'error');
      return;
    }

    try {
      const payload = {
        description: newExpense.description.trim() || "No description",
        purchaseDate: newExpense.purchaseDate,
        amount: parseFloat(newExpense.amount),
        category: newExpense.category,
        userEmail: getUserEmail()
      };

      await axios.post(BASE_URL, payload);
      addNotification("Expense added");
      fetchExpenses();

      setNewExpense({
        description: "",
        amount: "",
        category: "food",
        purchaseDate: new Date().toISOString().split('T')[0]
      });

    } catch (error) {
      console.error(error);
      addNotification("Failed to add expense", "error");
    }
  };

  // =================== UPDATE EXPENSE ===================
  const updateExpense = async () => {

    if (!editingExpense.amount) {
      addNotification('Amount is required', 'error');
      return;
    }

    try {
      const payload = {
        description: editingExpense.description.trim() || "No description",
        purchaseDate: editingExpense.purchaseDate,
        amount: parseFloat(editingExpense.amount),
        category: editingExpense.category,
        userEmail: getUserEmail()
      };

      await axios.put(`${BASE_URL}/${editingExpense.expenseId}`, payload);
      addNotification("Expense updated");
      fetchExpenses();

      setEditingExpense(null);

    } catch (error) {
      console.error(error);
      addNotification("Failed to update expense", "error");
    }
  };

  // =================== DELETE EXPENSE ===================
  const deleteExpense = async (id) => {

    try {
      await axios.delete(`${BASE_URL}/${id}`);
      addNotification("Expense deleted");
      fetchExpenses();
    } catch (error) {
      console.error(error);
      addNotification("Failed to delete expense", "error");
    }
  };

  // =================== FILTER LOGIC FIX ===================
  const filteredExpenses = expenses.filter(expense => {
    const matchesCategory =
      filterCategory === 'all' || expense.category === filterCategory;

    // NORMALIZE DATE FORMAT TO YYYY-MM-DD
    const expenseDate = new Date(expense.purchaseDate).toISOString().split('T')[0];
    const matchesDate =
      filterDate === 'all' || expenseDate === filterDate;

    return matchesCategory && matchesDate;
  });

  const categories = ['all', ...new Set(expenses.map(exp => exp.category))];

  const dates = [
    'all',
    ...new Set(
      expenses.map(exp =>
        new Date(exp.purchaseDate).toISOString().split('T')[0]
      )
    )
  ];

  const formatRupees = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  return (
    <div className="expense-tracker">
      <div className="expense-content">

        {/* FORM */}
        <div className="expense-form-section">
          <h3>{editingExpense ? 'Edit Expense' : 'Add New Expense'}</h3>
          <div className="expense-form">

            <input
              type="text"
              placeholder="Description"
              value={editingExpense ? editingExpense.description : newExpense.description}
              onChange={(e) => editingExpense
                ? setEditingExpense({ ...editingExpense, description: e.target.value })
                : setNewExpense({ ...newExpense, description: e.target.value })
              }
              className="form-input"
            />

            <div className="amount-input-container">
              <input
                type="number"
                placeholder="Amount in ₹ *"
                value={editingExpense ? editingExpense.amount : newExpense.amount}
                onChange={(e) => editingExpense
                  ? setEditingExpense({ ...editingExpense, amount: e.target.value })
                  : setNewExpense({ ...newExpense, amount: e.target.value })
                }
                className="form-input"
                min="0"
                step="0.01"
              />
            </div>

            <select
              value={editingExpense ? editingExpense.category : newExpense.category}
              onChange={(e) => editingExpense
                ? setEditingExpense({ ...editingExpense, category: e.target.value })
                : setNewExpense({ ...newExpense, category: e.target.value })
              }
              className="form-select"
            >
              <option value="food">Food</option>
              <option value="transport">Transport</option>
              <option value="bills">Bills</option>
              <option value="entertainment">Entertainment</option>
              <option value="shopping">Shopping</option>
              <option value="healthcare">Healthcare</option>
              <option value="education">Education</option>
              <option value="other">Other</option>
            </select>

            <input
              type="date"
              value={editingExpense ? editingExpense.purchaseDate : newExpense.purchaseDate}
              onChange={(e) => editingExpense
                ? setEditingExpense({ ...editingExpense, purchaseDate: e.target.value })
                : setNewExpense({ ...newExpense, purchaseDate: e.target.value })
              }
              className="form-input"
            />

            <div className="form-actions">
              {editingExpense ? (
                <>
                  <button onClick={updateExpense} className="save-expense-btn">
                    Update Expense
                  </button>
                  <button onClick={() => setEditingExpense(null)} className="cancel-expense-btn">
                    Cancel
                  </button>
                </>
              ) : (
                <button onClick={addExpense} className="add-expense-btn">
                  Add Expense
                </button>
              )}
            </div>
          </div>
        </div>

        {/* EXPENSE LIST */}
        <div className="expenses-section">
          <h3>All Expenses</h3>

          <div className="expense-filters">
            <div className="filter-group">
              <FiFilter size={16} />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="filter-select"
              >
                {categories.map(c => (
                  <option key={c} value={c}>
                    {c === 'all' ? 'All Categories' : c}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <FiFilter size={16} />
              <select
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="filter-select"
              >
                {dates.map(d => (
                  <option key={d} value={d}>
                    {d === 'all' ? 'All Dates' : d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="expenses-list">
            {filteredExpenses.length === 0 ? (
              <div className="no-items">No expenses</div>
            ) : (
              filteredExpenses
                .sort((a, b) => new Date(b.purchaseDate) - new Date(a.purchaseDate))
                .map(expense => (
                  <div key={expense.expenseId} className="expense-item">

                    <div className="expense-info">
                      <div className="expense-main">
                        <div className="expense-description">{expense.description}</div>
                        <div className="expense-amount">{formatRupees(expense.amount)}</div>
                      </div>

                      <div className="expense-details">
                        <span className="expense-category">{expense.category}</span>
                        <span className="expense-date">
                          {new Date(expense.purchaseDate).toLocaleDateString('en-IN')}
                        </span>
                      </div>
                    </div>

                    <div className="expense-actions">
                      <button onClick={() => setEditingExpense(expense)} className="edit-expense-btn">
                        <FiEdit2 size={14} />
                      </button>
                      <button onClick={() => deleteExpense(expense.expenseId)} className="delete-expense-btn">
                        <FiTrash2 size={14} />
                      </button>
                    </div>

                  </div>
                ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Expense;
