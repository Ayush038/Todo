import { PRIORITIES, STATUSES, CATEGORIES } from "../utils/constants";

const TaskFilters = ({ filters, onChange, onMarkAllDone }) => {
  const handleChange = (key, value) => {
    onChange(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="task-filters">
      <div className="task-filters__left">
        <select
          value={filters.status}
          onChange={(e) => handleChange("status", e.target.value)}
        >
          <option value="">All Status</option>
          {STATUSES.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <select
          value={filters.priority}
          onChange={(e) => handleChange("priority", e.target.value)}
        >
          <option value="">All Priority</option>
          {PRIORITIES.map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>

        <select
          value={filters.category}
          onChange={(e) => handleChange("category", e.target.value)}
        >
          <option value="">All Categories</option>
          {CATEGORIES.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default TaskFilters;
