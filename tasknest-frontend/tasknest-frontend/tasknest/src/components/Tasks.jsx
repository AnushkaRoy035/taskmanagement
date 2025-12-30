import React, { useState, useEffect } from 'react';
import './Dashboard.css';

const BASE_URL = "http://localhost:8080/tasks";

/* ================= HELPER ================= */
const getUserEmail = () => {
  const user = localStorage.getItem("user");
  if (!user) return 'unknown@example.com';
  try {
    return JSON.parse(user).emailId || 'unknown@example.com';
  } catch {
    return 'unknown@example.com';
  }
};

/* ================= API ================= */
export const getTasks = async () => {
  const email = getUserEmail();
  const res = await fetch(`${BASE_URL}?email=${encodeURIComponent(email)}`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch tasks");
  return res.json();
};

export const createTask = async (task) => {
  const email = getUserEmail();
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ ...task, userEmail: email }),
  });
  if (!res.ok) throw new Error("Failed to create task");
  return res.json();
};

export const updateTask = async (id, task) => {
  const email = getUserEmail();
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ ...task, userEmail: email }),
  });
  if (!res.ok) throw new Error("Failed to update task");
  return res.json();
};

export const deleteTask = async (id) => {
  await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
};

/* ================= COMPONENT ================= */
const Tasks = ({ addNotification = () => {}, addXP = () => {} }) => {
  const [tasks, setTasks] = useState([]);
  const [editingTask, setEditingTask] = useState(null);

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
    category: 'personal',
    completed: false,
  });

  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const getTodayDate = () => new Date().toISOString().split('T')[0];
  const isPastDate = (date) =>
    new Date(date).setHours(0, 0, 0, 0) <
    new Date().setHours(0, 0, 0, 0);

  const priorityColor = (p) =>
    ({ high: '#e74c3c', medium: '#f39c12', low: '#2ecc71' }[p] || '#2ecc71');

  const categoryColor = (c) =>
    ({
      personal: '#9b59b6',
      work: '#3498db',
      shopping: '#1abc9c',
      health: '#e67e22',
    }[c] || '#7f8c8d');

  /* ================= LOAD ================= */
  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const data = await getTasks();
      Array.isArray(data) && setTasks(data);
    } catch {
      addNotification("Failed to load tasks");
    }
  };

  /* ================= FORM ================= */
  const handleInputChange = (e) =>
    setNewTask((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const resetForm = () => {
    setEditingTask(null);
    setNewTask({
      title: '',
      description: '',
      priority: 'medium',
      dueDate: '',
      category: 'personal',
      completed: false,
    });
  };

  const saveTask = async () => {
    if (!newTask.title.trim()) return;

    try {
      if (editingTask) {
        const updated = await updateTask(editingTask.id, newTask);
        setTasks((prev) =>
          prev.map((t) => (t.id === updated.id ? updated : t))
        );
      } else {
        const saved = await createTask(newTask);
        setTasks((prev) => [...prev, saved]);
        addXP(5);
      }
      resetForm();
    } catch {
      addNotification("Task save failed");
    }
  };

  /* ================= ACTIONS ================= */
  const startEditing = (task) => {
    setEditingTask(task);
    setNewTask({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      category: task.category,
      dueDate: task.dueDate || '',
      completed: task.completed,
    });
  };

  const toggleTaskCompletion = async (task) => {
    try {
      const updated = await updateTask(task.id, {
        ...task,
        completed: !task.completed,
      });
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? updated : t))
      );
    } catch {
      addNotification("Failed to update task");
    }
  };

  const deleteTaskHandler = async (id) => {
    await deleteTask(id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const clearCompleted = async () => {
    const completed = tasks.filter((t) => t.completed);
    for (const t of completed) await deleteTask(t.id);
    setTasks((prev) => prev.filter((t) => !t.completed));
  };

  /* ================= FILTER ================= */
  const filteredTasks = tasks.filter((task) => {
    const filterPass =
      filter === 'all' ||
      (filter === 'completed' && task.completed) ||
      (filter === 'pending' && !task.completed) ||
      (filter === 'priority' && task.priority === 'high');

    const searchPass =
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase());

    return filterPass && searchPass;
  });

  const currentTasks = filteredTasks;

  /* ================= RENDER ================= */
  return (
    <div className="task-manager">
      {/* HEADER */}
     <div className="task-header">
  <h1>Task Manager</h1>

  <div className="task-stats">
    <span className="stat-total">
      Total:{" "}
      {currentTasks.filter(
        (t) => t.description !== "important date"
      ).length}
    </span>

    <span className="stat-completed">
      Completed:{" "}
      {currentTasks.filter(
        (t) => t.completed && t.description !== "important date"
      ).length}
    </span>

    <span className="stat-pending">
      Pending:{" "}
      {currentTasks.filter(
        (t) => !t.completed && t.description !== "important date"
      ).length}
    </span>

    <span className="stat-upcoming">
      Upcoming:{" "}
      {currentTasks.filter(
        (t) => !t.completed && t.description !== "important date"
      ).length}
    </span>
  </div>
</div>

      {/* FORM */}
      <div className="task-form">
        <h2>{editingTask ? "Edit Task" : "Add New Task"}</h2>
        <div className="form-grid">
          <input
            type="text"
            name="title"
            placeholder="Task title *"
            value={newTask.title}
            onChange={handleInputChange}
            className="form-input"
          />
          <input
            type="text"
            name="description"
            placeholder="Task description"
            value={newTask.description}
            onChange={handleInputChange}
            className="form-input"
          />
          <select
            name="priority"
            value={newTask.priority}
            onChange={handleInputChange}
            className="form-select"
          >
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
          </select>
          <select
            name="category"
            value={newTask.category}
            onChange={handleInputChange}
            className="form-select"
          >
            <option value="personal">Personal</option>
            <option value="work">Work</option>
            <option value="shopping">Shopping</option>
            <option value="health">Health</option>
          </select>
          <input
            type="date"
            name="dueDate"
            min={getTodayDate()}
            value={newTask.dueDate}
            onChange={handleInputChange}
            className="form-input"
          />
        </div>

        <div className="form-actions">
          {editingTask ? (
            <>
              <button onClick={saveTask} className="btn btn-primary">
                Update Task
              </button>
              <button onClick={resetForm} className="btn btn-secondary">
                Cancel
              </button>
            </>
          ) : (
            <button onClick={saveTask} className="btn btn-primary">
              Add Task
            </button>
          )}
        </div>
      </div>

      {/* CONTROLS */}
      <div className="task-controls">
        <input
          type="text"
          placeholder="Search tasks..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <div className="filter-buttons">
          <button onClick={() => setFilter('all')} className={`filter-btn ${filter === 'all' ? 'active' : ''}`}>All</button>
          <button onClick={() => setFilter('pending')} className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}>Pending</button>
          <button onClick={() => setFilter('completed')} className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}>Completed</button>
          <button onClick={() => setFilter('priority')} className={`filter-btn ${filter === 'priority' ? 'active' : ''}`}>High Priority</button>
        </div>
        <button onClick={clearCompleted} className="btn btn-clear">
          Clear Completed
        </button>
      </div>

      {/* TASK LIST */}
      <div className="tasks-list">
  {currentTasks.filter(
    (task) => task.description !== "important date"
  ).length === 0 ? (
    <div className="empty-state">
      <p>No tasks found.</p>
    </div>
  ) : (
    currentTasks
      .filter((task) => task.description !== "important date")
      .map((task) => (
        <div
          key={task.id}
          className={`task-item ${task.completed ? 'completed' : ''} ${
            task.dueDate && isPastDate(task.dueDate) && !task.completed ? 'overdue' : ''
          }`}
        >
          <input
            type="checkbox"
            checked={task.completed}
            onChange={() => toggleTaskCompletion(task)}
            className="task-checkbox"
          />

          <div className="task-content">
            <h3 className="task-title">{task.title}</h3>

            <div className="task-meta">
              <span
                className="priority-badge"
                style={{ backgroundColor: priorityColor(task.priority) }}
              >
                {task.priority}
              </span>

              <span
                className="category-badge"
                style={{ backgroundColor: categoryColor(task.category) }}
              >
                {task.category}
              </span>

              {task.dueDate && isPastDate(task.dueDate) && !task.completed && (
                <span className="overdue-badge">Overdue</span>
              )}
            </div>

            {task.description && (
              <p className="task-description">{task.description}</p>
            )}

            {task.dueDate && (
              <div className="task-footer">
                <span className="due-date">
                  Due: {new Date(task.dueDate).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>

          <div className="task-actions">
            <button
              className="btn-action btn-edit"
              onClick={() => startEditing(task)}
            >
              Edit
            </button>

            <button
              className="btn-action btn-delete"
              onClick={() => deleteTaskHandler(task.id)}
            >
              Delete
            </button>
          </div>
        </div>
      ))
  )}
</div>

    </div>
  );
};

export default Tasks;
