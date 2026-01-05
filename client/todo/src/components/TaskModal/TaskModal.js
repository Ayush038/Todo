import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { canEditField, isReadOnlyMode } from "../../utils/permission";
import api from "../../api/axios";
import { PRIORITIES, STATUSES, CATEGORIES } from "../../utils/constants";
import { confirmAction } from "../../utils/confirm";

const TaskModal = ({
  isOpen,
  mode = "view",
  source = "task_list",
  todoId = null,
  activityContext = null,
  onClose,
  onSuccess
}) => {
  const { user } = useAuth();

  const [currentMode, setCurrentMode] = useState(mode);
  const [loading, setLoading] = useState(false);
  const [todo, setTodo] = useState(null);
  const [users, setUsers] = useState([]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "Medium",
    status: "Not Started",
    category: "",
    dueDate: "",
    assignedTo: ""
  });

  useEffect(() => {
    if (!isOpen) return;

    setCurrentMode(mode);

    if (user?.role === "admin") {
      fetchUsers();
    }

    if (todoId) {
      fetchTodo(todoId);
    } else {
      resetForm();
    }
  }, [isOpen, todoId, mode]);

  const resetForm = () => {
    setTodo(null);
    setFormData({
      title: "",
      description: "",
      priority: "Medium",
      status: "Not Started",
      category: "",
      dueDate: "",
      assignedTo: ""
    });
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get("/users");
      setUsers(res.data);
    } catch (err) {
      console.error("Failed to fetch users", err);
    }
  };

  const fetchTodo = async (id) => {
    try {
      setLoading(true);
      const res = await api.get(`/todos/${id}`);
      setTodo(res.data);
      hydrateForm(res.data);
    } catch (err) {
      console.error("Failed to fetch todo", err);
    } finally {
      setLoading(false);
    }
  };

  const hydrateForm = (data) => {
    setFormData({
      title: data.title || "",
      description: data.description || "",
      priority: data.priority,
      status: data.status,
      category: data.category,
      dueDate: data.dueDate ? data.dueDate.split("T")[0] : "",
      assignedTo: data.assignedTo?._id || ""
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.category) {
      alert("Title and category are required");
      return;
    }

    try {
      setLoading(true);

      if (currentMode === "create") {
        const payload = {
          title: formData.title.trim(),
          description: formData.description,
          priority: formData.priority,
          status: formData.status,
          category: formData.category,
          dueDate: formData.dueDate || null
        };

        if (user.role === "admin" && formData.assignedTo) {
          payload.assignedTo = formData.assignedTo;
        }

        await api.post("/todos", payload);
        await onSuccess?.();
        onClose();
      }

      if (currentMode === "edit" && todoId) {
        const payload =
          user.role === "admin"
            ? {
                title: formData.title.trim(),
                description: formData.description,
                priority: formData.priority,
                status: formData.status,
                category: formData.category,
                dueDate: formData.dueDate || null,
                assignedTo: formData.assignedTo || null
              }
            : { status: formData.status };

        await api.put(`/todos/${todoId}`, payload);
        await onSuccess?.();
        onClose();
      }
    } catch (err) {
      console.error("Failed to save task", err);
      alert(err.response?.data?.message || "Failed to save task");
    } finally {
      setLoading(false);
    }
  };

    const handleDelete = async () => {
    if (!todoId) return;

    const confirmed = await confirmAction({
        title: "Delete task?",
        text: "This task will be permanently removed.",
        confirmText: "Delete",
        cancelText: "Cancel"
    });

    if (!confirmed) return;

    try {
        setLoading(true);
        await api.delete(`/todos/${todoId}`);
        await onSuccess?.();
        onClose();
    } catch (err) {
        console.error("Failed to delete task", err);
    } finally {
        setLoading(false);
    }
    };

  if (!isOpen) return null;

  const readOnly = isReadOnlyMode({ mode: currentMode, source });
  const isCreateMode = currentMode === "create";

  const canDelete =
    user &&
    todo &&
    source === "task_list" &&
    currentMode !== "create" &&
    (user.role === "admin" || todo.createdBy?._id === user.id);

  return (
    <div className="modal-backdrop">
      <div className="task-modal">
        <header className="task-modal__header">
          <h2 className="task-modal__title">
            {currentMode === "create" && "Create Task"}
            {currentMode === "view" && "Task Details"}
            {currentMode === "edit" && "Edit Task"}
          </h2>
        </header>

        {loading ? (
          <div className="task-modal__loading">Loading...</div>
        ) : (
          <div className="task-modal__body">
            {/* Title */}
            <div className="task-modal__field">
              <label className="task-modal__label">Title</label>
              <input
                className="task-modal__input"
                name="title"
                value={formData.title}
                onChange={handleChange}
                disabled={!isCreateMode && (readOnly || !canEditField(user, "title"))}
              />
            </div>

            {/* Description */}
            <div className="task-modal__field">
              <label className="task-modal__label">Description</label>
              <textarea
                className="task-modal__textarea"
                name="description"
                value={formData.description}
                onChange={handleChange}
                disabled={!isCreateMode && (readOnly || !canEditField(user, "description"))}
              />
            </div>

            {/* Category */}
            <div className="task-modal__field">
              <label className="task-modal__label">Category</label>
              <select
                className="task-modal__select"
                name="category"
                value={formData.category}
                onChange={handleChange}
                disabled={!isCreateMode && (readOnly || !canEditField(user, "category"))}
              >
                <option value="">Select category</option>
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div className="task-modal__field">
              <label className="task-modal__label">Priority</label>
              <select
                className="task-modal__select"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                disabled={!isCreateMode && (readOnly || !canEditField(user, "priority"))}
              >
                {PRIORITIES.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div className="task-modal__field">
              <label className="task-modal__label">Status</label>
              <select
                className="task-modal__select"
                name="status"
                value={formData.status}
                onChange={handleChange}
                disabled={!isCreateMode && (readOnly || !canEditField(user, "status"))}
              >
                {STATUSES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Due Date */}
            <div className="task-modal__field">
              <label className="task-modal__label">Due Date</label>
              <input
                className="task-modal__input"
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                disabled={!isCreateMode && (readOnly || !canEditField(user, "dueDate"))}
              />
            </div>

            {/* Assigned To (Admin only) */}
            {user?.role === "admin" && (
              <div className="task-modal__field">
                <label className="task-modal__label">Assigned To</label>
                <select
                  className="task-modal__select"
                  name="assignedTo"
                  value={formData.assignedTo}
                  onChange={handleChange}
                  disabled={!isCreateMode && readOnly}
                >
                  <option value="">Select user</option>
                  {users.map(u => (
                    <option key={u._id} value={u._id}>{u.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

        <footer className="task-modal__footer">
          {canDelete && (
            <button
              className="task-modal__btn task-modal__btn--danger"
              onClick={handleDelete}
            >
              Delete
            </button>
          )}

          <button
            className="task-modal__btn task-modal__btn--secondary"
            onClick={onClose}
          >
            Close
          </button>

          {currentMode === "view" && source === "task_list" && (
            <button
              className="task-modal__btn task-modal__btn--primary"
              onClick={() => setCurrentMode("edit")}
            >
              Edit
            </button>
          )}

          {(currentMode === "edit" || currentMode === "create") && (
            <button
              className="task-modal__btn task-modal__btn--primary"
              onClick={handleSubmit}
              disabled={loading}
            >
              {currentMode === "create" ? "Create" : "Save"}
            </button>
          )}
        </footer>
      </div>
    </div>
  );
};

export default TaskModal;
