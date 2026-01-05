import { useEffect, useState } from "react";
import api from "../api/axios";
import TaskModal from "../components/TaskModal/TaskModal";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";
import TaskItem from "../components/TaskItem";
import Header from "../components/Header";
import TaskSearch from "../components/TaskSearch";
import TaskFilters from "../components/TaskFilter";

const PRIORITY_ORDER = {
  Urgent: 4,
  High: 3,
  Medium: 2,
  Low: 1
};

const STATUS_ORDER = {
  "Not Started": 1,
  "In Progress": 2,
  Done: 3
};

const TASKS_PER_PAGE = 5;

const Dashboard = () => {
  const { user } = useAuth();

  const [todos, setTodos] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);

  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    priority: "",
    category: ""
  });

  // 🔹 ADMIN FILTER
  const [users, setUsers] = useState([]);
  const [assignedUser, setAssignedUser] = useState("");

  const [sortBy, setSortBy] = useState("dueDate");
  const [currentPage, setCurrentPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("view");
  const [modalSource, setModalSource] = useState("task_list");
  const [selectedTodoId, setSelectedTodoId] = useState(null);
  const [activityContext, setActivityContext] = useState(null);

  const [markAllLoading, setMarkAllLoading] = useState(false);

  useEffect(() => {
    fetchTodos();
    fetchActivityLogs();

    // 🔹 ADMIN FILTER: fetch users
    if (user?.role === "admin") {
      api.get("/users").then(res => setUsers(res.data));
    }
  }, [user]);

  // reset pagination when view changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, filters, sortBy, assignedUser]);

  const fetchTodos = async () => {
    const res = await api.get("/todos");
    setTodos(res.data);
  };

  const fetchActivityLogs = async () => {
    const res = await api.get("/activity-logs");
    setActivityLogs(res.data);
  };

  const refreshDashboard = async () => {
    await fetchTodos();
    await fetchActivityLogs();
  };

  const handleMarkAllDone = async () => {
    if (markAllLoading) return;
    try {
      setMarkAllLoading(true);
      await api.put("/todos/mark-all-completed");
      await refreshDashboard();
    } finally {
      setMarkAllLoading(false);
    }
  };

  // FILTER
  const filteredTodos = todos
    .filter(todo =>
      todo.title.toLowerCase().includes(search.toLowerCase())
    )
    .filter(todo =>
      !filters.status || todo.status === filters.status
    )
    .filter(todo =>
      !filters.priority || todo.priority === filters.priority
    )
    .filter(todo =>
      !filters.category || todo.category === filters.category
    )
    // 🔹 ADMIN FILTER
    .filter(todo =>
      user?.role !== "admin" ||
      !assignedUser ||
      todo.assignedTo?._id === assignedUser
    );

  // SORT
  const sortedTodos = [...filteredTodos].sort((a, b) => {
    if (sortBy === "dueDate") {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate) - new Date(b.dueDate);
    }

    if (sortBy === "priority") {
      return (PRIORITY_ORDER[b.priority] || 0) -
             (PRIORITY_ORDER[a.priority] || 0);
    }

    if (sortBy === "status") {
      return (STATUS_ORDER[a.status] || 0) -
             (STATUS_ORDER[b.status] || 0);
    }

    return 0;
  });

  const totalPages = Math.ceil(sortedTodos.length / TASKS_PER_PAGE);

  const paginatedTodos = sortedTodos.slice(
    (currentPage - 1) * TASKS_PER_PAGE,
    currentPage * TASKS_PER_PAGE
  );

  const hasIncompleteTasks = todos.some(todo => todo.status !== "Done");

  return (
    <div className="dashboard">
      <Header />

      <div className="dashboard__content">
        <Sidebar
          activityLogs={activityLogs}
          onAddTask={() => {
            setSelectedTodoId(null);
            setModalMode("create");
            setModalSource("task_list");
            setModalOpen(true);
          }}
          onOpenActivity={(log) => {
            setSelectedTodoId(log.todo);
            setActivityContext(log);
            setModalMode("view");
            setModalSource("activity_log");
            setModalOpen(true);
          }}
        />

        <main className="dashboard__main">
          <h2>Tasks</h2>

          <TaskSearch value={search} onChange={setSearch} />

          <TaskFilters
            filters={filters}
            onChange={setFilters}
            onMarkAllDone={handleMarkAllDone}
            disableMarkAllDone={!hasIncompleteTasks || markAllLoading}
          />

          {/* 🔹 ADMIN FILTER UI */}
          {user?.role === "admin" && (
            <select
              className="assigned-user-select"
              value={assignedUser}
              onChange={e => setAssignedUser(e.target.value)}
            >
              <option value="">All Users</option>
              {users.map(u => (
                <option key={u._id} value={u._id}>
                  {u.name}
                </option>
              ))}
            </select>
          )}

          <select
            className="sort-select"
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
          >
            <option value="dueDate">Due date</option>
            <option value="priority">Priority</option>
            <option value="status">Status</option>
          </select>

          <ul>
            {paginatedTodos.length === 0 ? (
              <li className="empty-state">
                <p className="empty-state__title">
                  {todos.length === 0
                    ? "No tasks yet"
                    : "No tasks match your filters"}
                </p>
                <p className="empty-state__subtitle">
                  {todos.length === 0
                    ? "Create one to get started."
                    : "Try adjusting filters."}
                </p>
              </li>
            ) : (
              paginatedTodos.map(todo => (
                <TaskItem
                  key={todo._id}
                  todo={todo}
                  onClick={() => {
                    setSelectedTodoId(todo._id);
                    setModalMode("view");
                    setModalSource("task_list");
                    setModalOpen(true);
                  }}
                />
              ))
            )}
          </ul>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => setCurrentPage(p => p - 1)}
                disabled={currentPage === 1}
              >
                Prev
              </button>

              <span>
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage(p => p + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </main>
      </div>

      <TaskModal
        isOpen={modalOpen}
        mode={modalMode}
        source={modalSource}
        todoId={selectedTodoId}
        activityContext={activityContext}
        onClose={() => setModalOpen(false)}
        onSuccess={refreshDashboard}
      />
    </div>
  );
};

export default Dashboard;
