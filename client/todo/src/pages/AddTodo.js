import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { setTheme, getTheme } from "../utils/themes";
import Swal from "sweetalert2";

const AddTodo = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [theme, setThemeState] = useState(getTheme());
  const navigate = useNavigate();

  useEffect(() => {
    setTheme(theme);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/todos", { title, description });
      Swal.fire("Success", "Todo added successfully!", "success");
      navigate("/dashboard");
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Failed to add todo", "error");
    }
  };

  return (
    <div className={`add-todo-page ${theme}-mode`}>
      <div className="add-todo-card">
        <h2>Add Todo</h2>

        <form onSubmit={handleSubmit}>
          <label>Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <label>Description</label>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <button type="submit">Add Todo</button>
        </form>
      </div>
    </div>
  );
};

export default AddTodo;
