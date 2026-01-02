import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { setTheme as persistTheme, getTheme } from "../utils/themes";
import Swal from "sweetalert2";

const TODOS_PER_PAGE = 5;

const Dashboard = () => {
  const [todos, setTodos] = useState([]);
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState(getTheme());
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    setUser(storedUser);
  }, []);

  useEffect(() => {
    persistTheme(theme);
  }, [theme]);

  const fetchTodos = async () => {
    try {
      const res = await api.get("/api/todos");
      setTodos(res.data);
    } catch {
      Swal.fire("Error", "Failed to fetch todos", "error");
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const filteredTodos = useMemo(() => {
    return todos
      .filter((t) => {
        if (filter === "completed") return t.isCompleted;
        if (filter === "pending") return !t.isCompleted;
        return true;
      })
      .filter((t) =>
        `${t.title} ${t.description || ""}`
          .toLowerCase()
          .includes(search.toLowerCase())
      );
  }, [todos, search, filter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filter]);

  const totalPages = Math.ceil(filteredTodos.length / TODOS_PER_PAGE);

  const paginatedTodos = filteredTodos.slice(
    (currentPage - 1) * TODOS_PER_PAGE,
    currentPage * TODOS_PER_PAGE
  );

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This will delete the todo permanently!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    });

    if (!result.isConfirmed) return;

    try {
      await api.delete(`/api/todos/${id}`);
      setTodos((prev) => prev.filter((t) => t._id !== id));
      Swal.fire("Deleted!", "Todo has been deleted.", "success");
    } catch (err) {
      Swal.fire(
        "Error",
        err.response?.data?.message || "Failed to delete todo",
        "error"
      );
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const markAllCompleted = async () => {
    const result = await Swal.fire({
      title: "Mark all todos completed?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, mark all",
    });

    if (!result.isConfirmed) return;

    try {
      await api.put("/todos/mark-all-completed");
      setTodos((prev) => prev.map((t) => ({ ...t, isCompleted: true })));
      Swal.fire("Success", "All todos marked as completed.", "success");
    } catch {
      Swal.fire("Error", "Failed to mark todos", "error");
    }
  };

  return (
    <div className={`dashboard-page ${theme}-mode`}>
      <header className="dashboard-header">
        {user && (
          <div className="dashboard-left">
            <span>Name: {user.name}</span>
            <span>Role: {user.role}</span>
          </div>
        )}

        <h2>📊 Dashboard 📈</h2>

        <div className="dashboard-right">
          <button onClick={toggleTheme}>
            {theme === "dark" ? "🌞 Light" : "🌙 Dark"}
          </button>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <div className="dashboard-actions">
        <input
          type="text"
          placeholder="Search todos..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
        </select>

        <button onClick={markAllCompleted}>Mark All Completed</button>
      </div>

      <div className="todo-container">
        {paginatedTodos.map((todo) => (
          <div className="todo-card" key={todo._id}>
            <p>Title: {todo.title}</p>
            <p>Description: {todo.description || "—"}</p>
            <p>
              Status: <strong>{todo.isCompleted ? "Done" : "Pending"}</strong>
            </p>

            <div className="todo-actions">
              <button onClick={() => navigate(`/edit/${todo._id}`)}>
                Edit
              </button>
              <button onClick={() => handleDelete(todo._id)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
          >
            Prev
          </button>

          <span>
            Page {currentPage} / {totalPages}
          </span>

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      )}

      <div className="add-todo-wrapper">
        <button onClick={() => navigate("/add")}>Add Todo</button>
      </div>
    </div>
  );
};

export default Dashboard;
