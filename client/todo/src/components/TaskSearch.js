const TaskSearch = ({ value, onChange }) => {
  return (
    <div className="task-search">
      <input
        className="task-search__input"
        type="text"
        placeholder="Search tasks..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};

export default TaskSearch;
