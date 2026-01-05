import { useAuth } from "../context/AuthContext";

const priorityColors = {
  Low: "#22c55e",
  Medium: "#3b82f6",
  High: "#f59e0b",
  Urgent: "#ef4444"
};

const formatDate = (date) => {
  if (!date) return "No due date";
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
};

const TaskItem = ({ todo, onClick }) => {
  const { user } = useAuth();

  return (
    <li className="task-item" onClick={onClick}>
      {/* LEFT SIDE */}
      <div className="task-item__left">
        <div className="task-item__title">{todo.title}</div>

        <div className="task-item__meta">
          {/* Category */}
          {todo.category && (
            <span className="task-item__category">
              {todo.category}
            </span>
          )}

          {/* Due Date */}
          <span className="task-item__due">
            📅 {formatDate(todo.dueDate)}
          </span>

          {/* Assigned To (admin only) */}
          {user?.role === "admin" && todo.assignedTo && (
            <span className="task-item__assigned">
              👤 {todo.assignedTo.name}
            </span>
          )}
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="task-item__right">
        {/* Priority */}
        {todo.priority && (
          <span
            className="task-item__priority"
            style={{ backgroundColor: priorityColors[todo.priority] }}
          >
            {todo.priority}
          </span>
        )}

        {/* Status */}
        <span className="task-item__status">
          {todo.status}
        </span>
      </div>
    </li>
  );
};

export default TaskItem;
