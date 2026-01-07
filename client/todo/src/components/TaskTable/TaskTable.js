import Swal from "sweetalert2";

const TaskTable = ({
  todos = [],
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  onAddTask,
  onViewTask,
  onEditTask,
  onDeleteTask,
  onMarkAllDone
}) => {

const handleDeleteClick = (todoId) => {
    Swal.fire({
        title: "Delete this task?",
        text: "This action cannot be undone.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#6b7280",
        confirmButtonText: "Yes, delete it",
        cancelButtonText: "Cancel",
        reverseButtons: true,
        focusCancel: true
    }).then((result) => {
        if (result.isConfirmed) {
        onDeleteTask(todoId);

        Swal.fire({
            title: "Deleted!",
            text: "The task has been removed.",
            icon: "success",
            timer: 1400,
            showConfirmButton: false
        });
        }
    });
    };
    const handleMarkAllDone = () => {
        Swal.fire({
            title: "Mark all tasks as done?",
            text: "This will mark every visible task as completed.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#16a34a",
            cancelButtonColor: "#6b7280",
            confirmButtonText: "Yes, mark all done",
            cancelButtonText: "Cancel",
            reverseButtons: true,
            focusCancel: true
        }).then((result) => {
            if (result.isConfirmed) {
            onMarkAllDone();

            Swal.fire({
                title: "All done 🎉",
                text: "Every task has been marked as completed.",
                icon: "success",
                timer: 1500,
                showConfirmButton: false
            });
            }
        });
    };

    return (
        <div className="task-table-card">
        <div className="task-table-header">
            <div className="task-table-header__center">
            <button
                className="table-btn table-btn--secondary"
                onClick={onAddTask}
            >
                + Add New Task
            </button>
            </div>

            <div className="task-table-header__right">
            <button
                className="table-btn table-btn--secondary"
                onClick={handleMarkAllDone}
                disabled={todos.length === 0}
            >
                Mark all done
            </button>
            </div>
        </div>
        <div className="thinLine">
        </div>
        <div className="task-table">
            <div className="task-table-row task-table-row--head">
            <span>Title🖊️</span>
            <span>Assigned To📝</span>
            <span>Assigned By👤</span>
            <span>Due Date🗓️</span>
            <span>Priority⚠️</span>
            <span>Status📈</span>
            <span>Category🗂️</span>
            <span>Actions👀</span>
            <span>Delete🗑️</span>
            </div>
            <div className="thinLine"></div>

            {todos.length === 0 && (
            <div className="task-table-empty">
                <img
                src="NoTask.png"
                alt="No tasks to display"
                className="task-table-empty__sticker"
                />
            </div>
            )}

            {todos.map(todo => (
            <div className="task-table-row task-table-row--body" key={todo._id}>
                <div className="task-title">{todo.title}</div>
                <div>{todo.assignedTo?.name || "—"}</div>
                <div>{todo.createdBy?.name || "—"}</div>
                <div>
                {todo.dueDate
                    ? new Date(todo.dueDate).toLocaleDateString()
                    : "—"}
                </div>
                <div className={`priority ${todo.priority.toLowerCase()}`}>
                {todo.priority}
                </div>
                <div className={`status ${todo.status.toLowerCase().replace(" ", "-")}`}>
                {todo.status}
                </div>
                <div>{todo.category}</div>

                <div className="task-actions">
                <button
                    className="table-btn table-btn--ghost"
                    onClick={() => onViewTask(todo._id)}
                >
                    View
                </button>
                <button
                    className="table-btn table-btn--ghost"
                    onClick={() => onEditTask(todo._id)}
                >
                    Edit
                </button>
                </div>

                <div className="task-delete">
                <button
                className="table-btn table-btn--danger"
                onClick={() => handleDeleteClick(todo._id)}
                >
                    Delete
                </button>
                </div>
            </div>
            ))}
        </div>

        <div className="task-table-pagination">
            <button
            className="table-btn table-btn--ghost"
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
            >
            Prev
            </button>
            <span>
            Page {currentPage} of {totalPages}
            </span>
            <button
            className="table-btn table-btn--ghost"
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            >
            Next
            </button>
        </div>
        </div>
    );
};

export default TaskTable;
