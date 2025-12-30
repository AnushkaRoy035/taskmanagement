import React, { useState, useEffect, useCallback } from 'react';
import './Dashboard.css';
import { useNavigate } from "react-router-dom";

const BASE_URL = "http://localhost:8080/tasks";

/* ================= HELPER ================= */
const getUserEmail = () => {
  const user = localStorage.getItem("user");
  if (!user) return "unknown@example.com";
  try {
    return JSON.parse(user).emailId;
  } catch {
    return "unknown@example.com";
  }
};

const Calendar = () => {
  const navigate = useNavigate();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const [tasks, setTasks] = useState([]);
  const [moods, setMoods] = useState([]);
  const [importantDates, setImportantDates] = useState([]);

  const [selectedDateTasks, setSelectedDateTasks] = useState([]);
  const [selectedDateMood, setSelectedDateMood] = useState(null);
  const [selectedDateImportantDates, setSelectedDateImportantDates] = useState([]);

  const [showImportantDateModal, setShowImportantDateModal] = useState(false);
  const [newImportantDate, setNewImportantDate] = useState({
    title: '',
    date: ''
  });

  /* ================= NATIONAL HOLIDAYS ================= */
  const getNationalHolidays = (year) => [
    { date: `${year}-01-01`, title: "New Year's Day", type: "holiday" },
    { date: `${year}-01-26`, title: 'Republic Day', type: "holiday" },
    { date: `${year}-08-15`, title: 'Independence Day', type: "holiday" },
    { date: `${year}-10-02`, title: 'Gandhi Jayanti', type: "holiday" },
    { date: `${year}-12-25`, title: 'Christmas', type: "holiday" },
  ];

  /* ================= DATE FORMAT ================= */
  const getFormattedDate = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  /* ================= LOAD DATA ================= */
  const loadData = useCallback(async () => {
    try {
      const email = getUserEmail();
      const res = await fetch(`${BASE_URL}?email=${encodeURIComponent(email)}`, {
        credentials: "include"
      });

      if (!res.ok) return;

      const taskData = await res.json();
      const safeTasks = Array.isArray(taskData) ? taskData : [];
      setTasks(safeTasks);

      /* ---- IMPORTANT DATES FROM TASKS TABLE ---- */
      const customImportantDates = safeTasks
        .filter(t => t.description === "important date")
        .map(t => ({
          id: t.id,
          title: t.title,
          date: t.dueDate,
          type: "custom"
        }));

      const holidays = getNationalHolidays(currentDate.getFullYear());

      setImportantDates([...customImportantDates, ...holidays]);

      /* ---- MOODS ---- */
      const savedMoods =
        localStorage.getItem('moodHistory') ||
        localStorage.getItem('moods');

      if (savedMoods) {
        setMoods(JSON.parse(savedMoods));
      }

    } catch (e) {
      console.error("Calendar load error:", e);
    }
  }, [currentDate]);

  /* ================= SAVE IMPORTANT DATE ================= */
  const handleSaveImportantDate = async () => {
    if (!newImportantDate.title || !newImportantDate.date) return;

    const payload = {
      title: newImportantDate.title,
      description: "important date",
      dueDate: newImportantDate.date,
      priority: "low",
      category: "important",
      completed: false,
      userEmail: getUserEmail()
    };

    try {
      await fetch(BASE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      setShowImportantDateModal(false);
      setNewImportantDate({ title: '', date: '' });
      loadData();
    } catch (e) {
      console.error("Failed to save important date", e);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 3000);
    return () => clearInterval(interval);
  }, [loadData]);

   const upcomingTasks = tasks
    .filter(t =>
      !t.completed &&
      t.dueDate &&
      new Date(t.dueDate) >= new Date()
    )
    .sort((a, b) => {
      const priorityOrder = { high: 1, medium: 2, low: 3 };
      const pDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (pDiff !== 0) return pDiff;
      return new Date(a.dueDate) - new Date(b.dueDate);
    })
    .slice(0, 5);

  /* ================= SELECTED DATE DATA ================= */
  useEffect(() => {
    const formatted = getFormattedDate(selectedDate);

    setSelectedDateTasks(
      tasks.filter(t => t?.dueDate === formatted && t.description !== "important date")
    );

    const mood = moods.find(m =>
      m?.date && getFormattedDate(new Date(m.date)) === formatted
    );
    setSelectedDateMood(mood || null);

    setSelectedDateImportantDates(
      importantDates.filter(d => d.date === formatted)
    );
  }, [selectedDate, tasks, moods, importantDates]);

  /* ================= HELPERS ================= */
  const isToday = (date) =>
    getFormattedDate(date) === getFormattedDate(new Date());

  const isHoliday = (date) =>
    getNationalHolidays(date.getFullYear())
      .some(h => h.date === getFormattedDate(date));

  const hasTasks = (date) =>
    tasks.some(t => t.dueDate === getFormattedDate(date) && t.description !== "important date");

  const hasImportantDates = (date) =>
    importantDates.some(d => d.date === getFormattedDate(date));

  /* ================= CALENDAR RENDER ================= */
  const renderCalendar = () => {
    const days = [];
    const daysInMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    ).getDate();

    const firstDay = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    ).getDay();

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`e-${i}`} className="calendar-day empty"></div>);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        d
      );

      const selected =
        getFormattedDate(date) === getFormattedDate(selectedDate);

      days.push(
        <div
          key={d}
          className={`calendar-day ${isToday(date) ? 'today' : ''} ${selected ? 'selected' : ''} ${isHoliday(date) ? 'holiday' : ''}`}
          onClick={() => setSelectedDate(date)}
        >
          <div className="day-number">{d}</div>
          <div className="day-indicators">
            {isHoliday(date) && <span className="holiday-dot">●</span>}
            {hasTasks(date) && <span className="task-dot">●</span>}
            {hasImportantDates(date) && <span className="important-date-dot">●</span>}
          </div>
        </div>
      );
    }

    return (
      <div className="compact-calendar">
        <div className="calendar-header">
          <button className="nav-btn"
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
          >‹</button>

          <h3>
            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h3>

          <button className="nav-btn"
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
          >›</button>
        </div>

        <div className="week-days">
          {['S','M','T','W','T','F','S'].map(d => (
            <div key={d} className="week-day">{d}</div>
          ))}
        </div>

        <div className="calendar-grid">{days}</div>
      </div>
    );
  };

  /* ================= FINAL UI ================= */
  return (
    <div className="calendar-container">
      {renderCalendar()}

      <div className="date-details">
        <div className="details-header">
          <h4>{selectedDate.toDateString()}</h4>

          <button className="add-task-btn" onClick={() => navigate("/tasks")}>
            + Add Task
          </button>

          <br />

          <button
            className="add-task-btn"
            onClick={() => setShowImportantDateModal(true)}
          >
            + Add Important Dates
          </button>
        </div>

        <div className="detail-section">
          <h5>Important Dates</h5>
          {selectedDateImportantDates.length ? (
            selectedDateImportantDates.map((d, i) => (
              <div key={i} className="important-date-item">
                {d.title}
              </div>
            ))
          ) : (
            <div className="no-data">No important dates</div>
          )}
        </div>
        <div className="detail-section">
          <h5>Tasks ({selectedDateTasks.length})</h5>
          {selectedDateTasks.length ? selectedDateTasks.map(t => (
            <div key={t.id} className="task-item">
              <div className={`task-status ${t.completed ? 'completed' : ''}`}>
                {t.completed ? '✓' : '○'}
              </div>
              <div className="task-info">
                <div className="task-title">{t.title}</div>
                <div className="task-meta">
                  <span className={`priority ${t.priority}`}>{t.priority}</span>
                  <span className="category">{t.category}</span>
                </div>
              </div>
            </div>
          )) : <div className="no-data">No tasks</div>}
        </div>

        <div className="detail-section">
          <h5>Upcoming Tasks & Events</h5>
          {upcomingTasks.length ? upcomingTasks.map(t => (
            <div key={t.id} className="task-item">
              <div className="task-title">{t.title}</div>
              <span>{new Date(t.dueDate).toLocaleDateString()}</span>
            </div>
          )) : <div className="no-data">No upcoming tasks</div>}
        </div>
      </div>

      


      {showImportantDateModal && (
        <div
  className="modal-overlay"
  style={{
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000
  }}
>
  <div
    className="modal-content"
    style={{
      background: "#ffffff",
      borderRadius: "12px",
      padding: "24px",
      width: "320px",
      boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
      display: "flex",
      flexDirection: "column",
      gap: "14px",
      animation: "fadeIn 0.2s ease-in-out"
    }}
  >
    <h3
      style={{
        margin: 0,
        marginBottom: "8px",
        textAlign: "center",
        fontWeight: "600",
        color: "#333"
      }}
    >
      Add Important Date
    </h3>

    <input
      placeholder="Event name"
      value={newImportantDate.title}
      onChange={(e) =>
        setNewImportantDate({ ...newImportantDate, title: e.target.value })
      }
      style={{
        padding: "10px 12px",
        borderRadius: "8px",
        border: "1px solid #ddd",
        fontSize: "14px",
        outline: "none"
      }}
    />

    <input
      type="date"
      value={newImportantDate.date}
      onChange={(e) =>
        setNewImportantDate({ ...newImportantDate, date: e.target.value })
      }
      style={{
        padding: "10px 12px",
        borderRadius: "8px",
        border: "1px solid #ddd",
        fontSize: "14px",
        outline: "none"
      }}
    />

    <div
      style={{
        display: "flex",
        gap: "10px",
        marginTop: "8px"
      }}
    >
      <button
        onClick={handleSaveImportantDate}
        style={{
          flex: 1,
          padding: "10px",
          borderRadius: "8px",
          border: "none",
          backgroundColor: "#4f46e5",
          color: "#fff",
          fontWeight: "500",
          cursor: "pointer"
        }}
      >
        Save
      </button>

      <button
        onClick={() => setShowImportantDateModal(false)}
        style={{
          flex: 1,
          padding: "10px",
          borderRadius: "8px",
          border: "1px solid #ddd",
          backgroundColor: "#f9f9f9",
          color: "#333",
          cursor: "pointer"
        }}
      >
        Cancel
      </button>
    </div>
  </div>
</div>
      )}
    </div>
  );
};

export default Calendar;
