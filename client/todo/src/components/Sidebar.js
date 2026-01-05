const Sidebar = ({ activityLogs, onAddTask, onOpenActivity }) => {
  return (
    <aside className="dashboard__sidebar">

      <button
        className="sidebar__add-task-btn"
        onClick={onAddTask}
      >
        Add Task
      </button>

      <h3 className="sidebar__title">Activity Logs</h3>

      <ul className="sidebar__activity-list">
        {activityLogs.length === 0 && (
          <li className="sidebar__empty">No activity yet</li>
        )}

        {activityLogs.map(log => (
          <li
            key={log._id}
            className="sidebar__activity-item"
            onClick={() => onOpenActivity(log)}
          >
            {log.action}
          </li>
        ))}
      </ul>

    </aside>
  );
};

export default Sidebar;
