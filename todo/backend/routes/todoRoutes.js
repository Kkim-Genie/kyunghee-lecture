// routes/todoRoutes.js
const express = require("express");
const fs = require("fs").promises;
const path = require("path");

const router = express.Router();
const TODOS_FILE = path.join(__dirname, "../todos.json");

// 모든 Todo 가져오기
router.get("/", async (req, res) => {
  try {
    const data = await fs.readFile(TODOS_FILE, "utf8");
    const todos = JSON.parse(data);
    res.json(todos);
  } catch (error) {
    res.status(500).json({ error: "Todo를 불러오는 중 오류가 발생했습니다." });
  }
});

// 특정 날짜의 Todo 가져오기
router.get("/:date", async (req, res) => {
  try {
    const data = await fs.readFile(TODOS_FILE, "utf8");
    const todos = JSON.parse(data);
    const dateTodos = todos.filter((todo) => todo.date === req.params.date);
    res.json(dateTodos);
  } catch (error) {
    res
      .status(500)
      .json({ error: "해당 날짜의 Todo를 불러오는 중 오류가 발생했습니다." });
  }
});

// 새 Todo 생성
router.post("/", async (req, res) => {
  try {
    const data = await fs.readFile(TODOS_FILE, "utf8");
    const todos = JSON.parse(data);

    const newTodo = {
      id: Date.now(),
      ...req.body,
      completed: false,
    };

    todos.push(newTodo);

    await fs.writeFile(TODOS_FILE, JSON.stringify(todos, null, 2));
    res.status(201).json(newTodo);
  } catch (error) {
    res.status(500).json({ error: "Todo 생성 중 오류가 발생했습니다." });
  }
});

// Todo 상태 업데이트
router.put("/:id", async (req, res) => {
  try {
    const data = await fs.readFile(TODOS_FILE, "utf8");
    let todos = JSON.parse(data);

    const todoIndex = todos.findIndex(
      (todo) => todo.id === parseInt(req.params.id)
    );

    if (todoIndex > -1) {
      todos[todoIndex] = { ...todos[todoIndex], ...req.body };
      await fs.writeFile(TODOS_FILE, JSON.stringify(todos, null, 2));
      res.json(todos[todoIndex]);
    } else {
      res.status(404).json({ error: "Todo를 찾을 수 없습니다." });
    }
  } catch (error) {
    res.status(500).json({ error: "Todo 업데이트 중 오류가 발생했습니다." });
  }
});

// Todo 삭제
router.delete("/:id", async (req, res) => {
  try {
    const data = await fs.readFile(TODOS_FILE, "utf8");
    let todos = JSON.parse(data);

    const todoIndex = todos.findIndex(
      (todo) => todo.id === parseInt(req.params.id)
    );

    if (todoIndex === -1) {
      return res.status(404).json({ error: "해당 Todo를 찾을 수 없습니다." });
    }

    todos.splice(todoIndex, 1);
    await fs.writeFile(TODOS_FILE, JSON.stringify(todos, null, 2));

    res.json({ message: "Todo가 성공적으로 삭제되었습니다." });
  } catch (error) {
    res.status(500).json({ error: "Todo 삭제 중 오류가 발생했습니다." });
  }
});

module.exports = router;
