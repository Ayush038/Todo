import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { canEditField, isReadOnlyMode } from "../../utils/permission";
import api from "../../api/axios";
import { PRIORITIES, STATUSES, CATEGORIES } from "../../utils/constants";
import { confirmAction } from "../../utils/confirm";
import Swal from "sweetalert2";

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

    if (user?.role === "admin") fetchUsers();

    if (todoId) fetchTodo(todoId);
    else resetForm();
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
    const res = await api.get("/users");
    setUsers(res.data);
  };

  const fetchTodo = async (id) => {
    try {
      setLoading(true);
      const res = await api.get(`/todos/${id}`);
      setTodo(res.data);
      hydrateForm(res.data);
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
      Swal.fire({
        icon: "warning",
        title: "Missing fields",
        text: "Title and category are required."
      });
      return;
    }

    if (currentMode === "edit") {
      const result = await Swal.fire({
        title: "Save changes?",
        text: "Are you sure you want to save these changes?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Yes, save",
        cancelButtonText: "Cancel",
        reverseButtons: true,
        focusCancel: true
      });

      if (!result.isConfirmed) return;
    }

    setLoading(true);

    try {
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

        Swal.fire({
          icon: "success",
          title: "Task created",
          timer: 1200,
          showConfirmButton: false
        });
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

        Swal.fire({
          icon: "success",
          title: "Saved successfully",
          timer: 1200,
          showConfirmButton: false
        });
      }

      await onSuccess?.();
      onClose();

    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Save failed",
        text: "Something went wrong. Please try again."
      });
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

    setLoading(true);
    try {
      await api.delete(`/todos/${todoId}`);
      await onSuccess?.();
      onClose();
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

        {/* HEADER */}
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

            {/* TITLE */}
            <div className="task-modal__field task-modal__field--title">
              <label>Title</label>
              <input
                name="title"
                value={formData.title}
                onChange={handleChange}
                disabled={!isCreateMode && (readOnly || !canEditField(user, "title"))}
              />
            </div>

            {/* DESCRIPTION */}
            <div className="task-modal__field task-modal__field--description">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                disabled={!isCreateMode && (readOnly || !canEditField(user, "description"))}
              />
            </div>

            {/* ROW: Priority | Status | Category */}
            <div className="task-modal__row">
              <div className="task-modal__field">
                <label>Priority</label>
                <select
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

              <div className="task-modal__field">
                <label>Status</label>
                <select
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

              <div className="task-modal__field">
                <label>Category</label>
                <select
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
            </div>

            {/* ROW: Assigned To | Due Date */}
            <div className="task-modal__row">
              {user?.role === "admin" && (
                <div className="task-modal__field">
                  <label>Assigned To</label>
                  <select
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

              <div className="task-modal__field">
                <label>Due Date</label>
                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleChange}
                  disabled={!isCreateMode && (readOnly || !canEditField(user, "dueDate"))}
                />
              </div>
            </div>

          </div>
        )}

        {/* FOOTER */}
        <footer className="task-modal__footer">
          {canDelete && (
            <button className="task-modal__btn task-modal__btn--danger" onClick={handleDelete}>
              Delete
            </button>
          )}

          <button className="task-modal__btn task-modal__btn--secondary" onClick={onClose}>
            Close
          </button>

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
