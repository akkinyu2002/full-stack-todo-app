const express = require("express");
const cors = require("cors");
const Database = require("better-sqlite3");

const app = express();

const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database
const db = new Database("todos.db");

// Create table if it doesn't exist
db.prepare(`
  CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    completed INTEGER DEFAULT 0,
    createdAt TEXT NOT NULL
  )
`).run();


// --------------------
// GET ALL TODOS
// --------------------

app.get("/api/todos", (req, res) => {

  const todos = db.prepare(`
    SELECT *
    FROM todos
    ORDER BY id DESC
  `).all();

  const formattedTodos = todos.map((todo) => ({
    ...todo,
    completed: Boolean(todo.completed)
  }));

  res.json(formattedTodos);
});


// --------------------
// GET ONE TODO
// --------------------

app.get("/api/todos/:id", (req, res) => {

  const todo = db.prepare(`
    SELECT *
    FROM todos
    WHERE id = ?
  `).get(req.params.id);

  if (!todo) {
    return res.status(404).json({
      message: "Todo not found"
    });
  }

  todo.completed = Boolean(todo.completed);

  res.json(todo);
});


// --------------------
// CREATE TODO
// --------------------

app.post("/api/todos", (req, res) => {

  const { title } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({
      message: "Title is required"
    });
  }

  const createdAt = new Date().toISOString();

  const result = db.prepare(`
    INSERT INTO todos
    (title, completed, createdAt)

    VALUES (?, 0, ?)
  `).run(
    title.trim(),
    createdAt
  );

  const todo = db.prepare(`
    SELECT *
    FROM todos
    WHERE id = ?
  `).get(result.lastInsertRowid);

  todo.completed = Boolean(todo.completed);

  res.status(201).json(todo);
});


// --------------------
// UPDATE TODO
// --------------------

app.patch("/api/todos/:id", (req, res) => {

  const { title, completed } = req.body;

  const existing = db.prepare(`
    SELECT *
    FROM todos
    WHERE id = ?
  `).get(req.params.id);

  if (!existing) {
    return res.status(404).json({
      message: "Todo not found"
    });
  }

  const newTitle =
    title !== undefined
      ? title.trim()
      : existing.title;

  const newCompleted =
    completed !== undefined
      ? completed ? 1 : 0
      : existing.completed;

  if (!newTitle) {
    return res.status(400).json({
      message: "Title cannot be empty"
    });
  }

  db.prepare(`
    UPDATE todos
    SET title = ?,
        completed = ?
    WHERE id = ?
  `).run(
    newTitle,
    newCompleted,
    req.params.id
  );

  const todo = db.prepare(`
    SELECT *
    FROM todos
    WHERE id = ?
  `).get(req.params.id);

  todo.completed = Boolean(todo.completed);

  res.json(todo);
});


// --------------------
// DELETE TODO
// --------------------

app.delete("/api/todos/:id", (req, res) => {

  const result = db.prepare(`
    DELETE FROM todos
    WHERE id = ?
  `).run(req.params.id);

  if (result.changes === 0) {
    return res.status(404).json({
      message: "Todo not found"
    });
  }

  res.json({
    message: "Todo deleted"
  });
});


// --------------------
// START SERVER
// --------------------

app.listen(PORT, () => {

  console.log(
    `Todo API running at http://localhost:${PORT}`
  );

});