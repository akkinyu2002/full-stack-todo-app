import { useEffect, useState } from "react";

const API_URL = "http://localhost:5000/api/todos";

function App() {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState("");

  // Get todos from backend
  useEffect(() => {
    fetch(API_URL)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch todos");
        }

        return response.json();
      })
      .then((data) => {
        setTodos(data);
      })
      .catch((error) => {
        console.error("Failed to fetch todos:", error);
      });
  }, []);

  // Add todo to backend
  async function addTodo(e) {
    e.preventDefault();

    if (!title.trim()) return;

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create todo");
      }

      const newTodo = await response.json();

      setTodos((currentTodos) => [
        newTodo,
        ...currentTodos,
      ]);

      setTitle("");
    } catch (error) {
      console.error("Failed to add todo:", error);
    }
  }

  // Update todo completion in backend
  async function toggleTodo(id, completed) {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          completed: !completed,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update todo");
      }

      const updatedTodo = await response.json();

      setTodos((currentTodos) =>
        currentTodos.map((todo) =>
          todo.id === id ? updatedTodo : todo
        )
      );
    } catch (error) {
      console.error("Failed to update todo:", error);
    }
  }

  // Delete todo permanently from backend
  async function deleteTodo(id) {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete todo");
      }

      setTodos((currentTodos) =>
        currentTodos.filter((todo) => todo.id !== id)
      );
    } catch (error) {
      console.error("Failed to delete todo:", error);
    }
  }

  const completedCount = todos.filter(
    (todo) => todo.completed
  ).length;

  return (
    <main className="app">
      <section className="todo-container">

        <header className="header">
          <p className="eyebrow">PERSONAL</p>

          <h1>Todo</h1>

          <p className="subtitle">
            Keep track of what needs to be done.
          </p>
        </header>

        <form
          className="todo-form"
          onSubmit={addTodo}
        >
          <input
            type="text"
            placeholder="Add a task..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <button type="submit">
            Add
          </button>
        </form>

        <div className="todo-header">
          <span>Tasks</span>

          <span>
            {todos.length} total
          </span>
        </div>

        <div className="todo-list">

          {todos.length === 0 ? (
            <p className="empty">
              No tasks yet.
            </p>
          ) : (
            todos.map((todo) => (
              <div
                className="todo-item"
                key={todo.id}
              >
                <label className="todo-left">

                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() =>
                      toggleTodo(
                        todo.id,
                        todo.completed
                      )
                    }
                  />

                  <span
                    className={
                      todo.completed
                        ? "completed"
                        : ""
                    }
                  >
                    {todo.title}
                  </span>

                </label>

                <button
                  className="delete-button"
                  onClick={() =>
                    deleteTodo(todo.id)
                  }
                >
                  ×
                </button>
              </div>
            ))
          )}

        </div>

        <footer>
          {completedCount} of {todos.length} completed
        </footer>

      </section>
    </main>
  );
}

export default App;