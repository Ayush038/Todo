import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../utils/api";
import { setTheme, getTheme } from "../utils/themes";
import Swal from "sweetalert2";

const EditTodo = () => {
  const { id } = useParams();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);
  const [theme, setThemeState] = useState(getTheme());
  const navigate = useNavigate();

  useEffect(() => {
    setTheme(theme);

    const fetchTodo = async () => {
      try {
        const res = await api.get("/api/todos");
        const todo = res.data.find((t) => t._id === id);
        if (!todo) {
          Swal.fire("Error", "Todo not found", "error");
          navigate("/dashboard");
        } else {
          setTitle(todo.title);
          setDescription(todo.description);
          setIsCompleted(todo.isCompleted);
        }
      } catch (err) {
        Swal.fire("Error", "Failed to fetch todo", "error");
        navigate("/dashboard");
      }
    };
    fetchTodo();
  }, [id, navigate, theme]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/api/todos/${id}`, { title, description, isCompleted });
      Swal.fire("Success", "Todo updated successfully!", "success");
      navigate("/dashboard");
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Failed to update todo", "error");
    }
  };

  return (
    <div className={`edit-todo-page ${theme}-mode`}>
      <div className="edit-todo-card">
        <h2>Edit Todo</h2>

        <form onSubmit={handleSubmit}>
          <label>Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            type="text"
            required
          />

          <label>Description</label>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            type="text"
          />

          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={isCompleted}
              onChange={(e) => setIsCompleted(e.target.checked)}
            />
            Completed
          </label>

          <button type="submit">Update Todo</button>
        </form>
      </div>
    </div>
  );
};

export default EditTodo;