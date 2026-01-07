import { useEffect, useState } from "react";
import api from "../api/axios";
import TaskModal from "../components/TaskModal/TaskModal";
import { useAuth } from "../context/AuthContext";
import Header from "../components/Header";
import TaskSearch from "../components/TaskSearch";
import TaskFilters from "../components/TaskFilter";
import TaskTable from "../components/TaskTable/TaskTable";
import Swal from "sweetalert2";

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
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    priority: "",
    category: ""
  });

  const [users, setUsers] = useState([]);
  const [assignedUser, setAssignedUser] = useState("");

  const [sortBy, setSortBy] = useState("dueDate");
  const [currentPage, setCurrentPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("view");
  const [modalSource, setModalSource] = useState("task_list");
  const [selectedTodoId, setSelectedTodoId] = useState(null);


  useEffect(() => {
    fetchTodos();

    if (user?.role === "admin") {
      api.get("/users").then(res => setUsers(res.data));
    }
  }, [user]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filters, sortBy, assignedUser]);

  const fetchTodos = async () => {
    const res = await api.get("/todos");
    setTodos(res.data);
  };

  const openCreateTaskModal = () => {
    setSelectedTodoId(null);
    setModalMode("create");
    setModalSource("task_list");
    setModalOpen(true);
  };

  const openViewTaskModal = (id) => {
    setSelectedTodoId(id);
    setModalMode("view");
    setModalSource("task_list");
    setModalOpen(true);
  };

  const openEditTaskModal = (id) => {
    setSelectedTodoId(id);
    setModalMode("edit");
    setModalSource("task_list");
    setModalOpen(true);
  };

  const deleteTask = async (id) => {
    try {
      await api.delete(`/todos/${id}`);
      fetchTodos();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Delete failed",
        text: "Something went wrong. Try again."
      });
    }
  };

  const markAllDone = async () => {
    await api.put("/todos/mark-all-completed");
    fetchTodos();
  };

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
    .filter(todo =>
      user?.role !== "admin" ||
      !assignedUser ||
      todo.assignedTo?._id === assignedUser
    );

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

  return (
    <div className="dashboard">
      <Header />

      <main className="dashboard__main">
        <h2>Tasks</h2>

        <div className="task-controls-row">
          <TaskSearch value={search} onChange={setSearch} />

          <TaskFilters
            filters={filters}
            onChange={setFilters}
          />

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
        </div>

        <TaskTable
          todos={paginatedTodos}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          onAddTask={openCreateTaskModal}
          onViewTask={openViewTaskModal}
          onEditTask={openEditTaskModal}
          onDeleteTask={deleteTask}
          onMarkAllDone={markAllDone}
        />
      </main>

      <TaskModal
        isOpen={modalOpen}
        mode={modalMode}
        source={modalSource}
        todoId={selectedTodoId}
        onClose={() => setModalOpen(false)}
        onSuccess={fetchTodos}
      />
    </div>
  );
};

export default Dashboard;
